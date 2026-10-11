/**
 * quizService.js — GroupSync Quiz & Skill Verification Operations
 * Handles quiz loading, attempt management, answer saving, scoring, badge awarding.
 */
import supabase from '@/lib/supabase';
import { withRetry } from '@/lib/withRetry';

// ─── BADGE TIER CALCULATION ───────────────────────────────────────────────────

/**
 * Determine badge tier from quiz percentage score.
 * 60-74%: Bronze, 75-84%: Silver, 85-94%: Gold, 95-100%: Platinum
 */
export function getBadgeTier(percentage) {
  if (percentage >= 95) return { tier: 'platinum', emoji: 'ðŸ’Ž', label: 'Platinum' };
  if (percentage >= 85) return { tier: 'gold',     emoji: 'ðŸ¥‡', label: 'Gold' };
  if (percentage >= 75) return { tier: 'silver',   emoji: 'ðŸ¥ˆ', label: 'Silver' };
  if (percentage >= 60) return { tier: 'bronze',   emoji: 'ðŸ¥‰', label: 'Bronze' };
  return null; // didn't pass
}

// ─── CREDIBILITY SCORE ────────────────────────────────────────────────────────

/**
 * Calculate credibility score for a skill.
 * Formula: (quiz * 0.40) + (certificate * 0.35) + (endorsements * 0.20) + (projects * 0.05)
 *
 * @param {object} params
 * @param {number} params.quizScore       - quiz percentage (0-100)
 * @param {boolean} params.hasCertificate - verified certificate exists?
 * @param {number} params.endorsementCount
 * @param {number} params.projectCount
 */
export function calculateCredibilityScore({ quizScore = 0, hasCertificate = false, endorsementCount = 0, projectCount = 0 }) {
  const quizComponent  = (quizScore / 100) * 40;
  const certComponent  = hasCertificate ? 35 : 0;
  const endorseComponent = Math.min(endorsementCount * 10, 20);
  const projectComponent = Math.min(projectCount * 5, 5);
  return Math.min(Math.round(quizComponent + certComponent + endorseComponent + projectComponent), 100);
}

// ─── BROWSE QUIZZES ───────────────────────────────────────────────────────────

/**
 * Fetch all published quizzes with optional filters.
 * @param {object} [filters]
 * @param {string} [filters.difficulty] - beginner/intermediate/advanced
 * @param {string} [filters.skill]      - skill_name filter
 */
export async function browseQuizzes(filters = {}) {
  return withRetry(async () => {
    let query = supabase
      .from('quizzes')
      .select('*')
      .eq('is_published', true)
      .order('created_at', { ascending: false });

    if (filters.difficulty) query = query.eq('difficulty', filters.difficulty);
    if (filters.skill) query = query.ilike('skill_name', `%${filters.skill}%`);

    return query;
  });
}

// ─── GET SINGLE QUIZ ─────────────────────────────────────────────────────────

/** Fetch quiz metadata only (no questions — for browse card) */
export async function getQuiz(quizId) {
  return withRetry(() =>
    supabase.from('quizzes').select('*').eq('id', quizId).single()
  );
}

/** Fetch quiz with all questions */
export async function getQuizWithQuestions(quizId) {
  return withRetry(async () => {
    const quizResult = await supabase
      .from('quizzes').select('*').eq('id', quizId).single();
    if (quizResult.error) return quizResult;

    const questionsResult = await supabase
      .from('quiz_questions')
      .select('*')
      .eq('quiz_id', quizId)
      .order('question_order', { ascending: true });

    if (questionsResult.error) return questionsResult;

    return { data: { quiz: quizResult.data, questions: questionsResult.data }, error: null };
  });
}

// ─── ATTEMPT MANAGEMENT ──────────────────────────────────────────────────────

/** Check for an in-progress or paused attempt for this user+quiz */
export async function getExistingAttempt(userId, quizId) {
  const { data, error } = await supabase
    .from('quiz_attempts')
    .select('*')
    .eq('user_id', userId)
    .eq('quiz_id', quizId)
    .in('status', ['in_progress', 'paused'])
    .order('started_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  return { data, error };
}

/** Start a new quiz attempt */
export async function startAttempt(userId, quizId) {
  return withRetry(() =>
    supabase.from('quiz_attempts')
      .insert([{ user_id: userId, quiz_id: quizId, status: 'in_progress' }])
      .select().single()
  );
}

/** Update attempt state (for pause/resume/current question tracking) */
export async function updateAttemptState(attemptId, updates) {
  return supabase.from('quiz_attempts').update(updates).eq('id', attemptId);
}

// ─── ANSWER MANAGEMENT ───────────────────────────────────────────────────────

/** Save/update an answer for a question (upsert) */
export async function saveAnswer(attemptId, questionId, userAnswer) {
  return supabase.from('quiz_answers').upsert({
    attempt_id: attemptId,
    question_id: questionId,
    user_answer: userAnswer,
    answered_at: new Date().toISOString(),
  }, { onConflict: 'attempt_id,question_id' });
}

/** Load all saved answers for an attempt (for resume) */
export async function loadSavedAnswers(attemptId) {
  const { data, error } = await supabase
    .from('quiz_answers')
    .select('question_id, user_answer')
    .eq('attempt_id', attemptId);

  if (error) return { data: {}, error };

  // Convert to { questionId: answer } map
  const answerMap = {};
  for (const a of (data || [])) {
    answerMap[a.question_id] = a.user_answer;
  }
  return { data: answerMap, error: null };
}

// ─── SUBMIT QUIZ ─────────────────────────────────────────────────────────────

/**
 * Score and finalize a quiz attempt.
 * Calculates score, determines pass/fail, awards badge if passed.
 *
 * @param {string} attemptId
 * @param {string} userId
 * @param {object} quiz - quiz metadata
 * @param {Array}  questions - quiz questions with correct_answer
 * @param {object} answers - { questionId: userAnswer }
 * @param {number} startedAtMs - Date.now() when started
 * @returns {{ data: { percentage, passed, badge, score }, error }}
 */
export async function submitQuiz(attemptId, userId, quiz, questions, answers, startedAtMs) {
  const completedAt = new Date();
  const timeTakenMinutes = (completedAt.getTime() - startedAtMs) / 60000;

  // ── Grade each question ─────────────────────────────────────────────────
  let correctCount = 0;
  const gradedAnswers = questions.map(q => {
    const userAnswer = (answers[q.id] || '').trim().toLowerCase();
    const correct = q.correct_answer.trim().toLowerCase();
    let isCorrect = false;

    if (q.question_type === 'mcq' || q.question_type === 'true_false') {
      isCorrect = userAnswer === correct;
    } else {
      // Short answer / code: check if correct_answer keyword appears in user answer
      isCorrect = userAnswer.includes(correct) || correct.includes(userAnswer);
    }
    if (isCorrect) correctCount++;
    return { question_id: q.id, user_answer: answers[q.id] || '', is_correct: isCorrect };
  });

  const percentage = questions.length > 0 ? (correctCount / questions.length) * 100 : 0;
  const passed = percentage >= quiz.passing_score;

  // ── Save answers ─────────────────────────────────────────────────────────
  if (gradedAnswers.length > 0) {
    await supabase.from('quiz_answers').upsert(
      gradedAnswers.map(a => ({
        attempt_id: attemptId,
        question_id: a.question_id,
        user_answer: a.user_answer,
        is_correct: a.is_correct,
        answered_at: new Date().toISOString(),
      })),
      { onConflict: 'attempt_id,question_id' }
    );
  }

  // ── Update attempt ────────────────────────────────────────────────────────
  const { error: attemptError } = await supabase.from('quiz_attempts').update({
    score: correctCount,
    percentage: Math.round(percentage * 100) / 100,
    passed,
    status: 'completed',
    completed_at: completedAt.toISOString(),
    time_taken_minutes: Math.round(timeTakenMinutes * 100) / 100,
  }).eq('id', attemptId);

  if (attemptError) return { data: null, error: attemptError };

  // ── Award badge if passed ─────────────────────────────────────────────────
  let badge = null;
  if (passed) {
    const tierInfo = getBadgeTier(percentage);
    if (tierInfo) {
      const badgePayload = {
        user_id: userId,
        badge_type: 'quiz',
        badge_name: `${quiz.skill_name} ${tierInfo.label}`,
        skill_name: quiz.skill_name,
        badge_tier: tierInfo.tier,
        quiz_score: Math.round(percentage * 100) / 100,
        quiz_id: quiz.id,
        attempt_id: attemptId,
        metadata: { quiz_title: quiz.title, correct: correctCount, total: questions.length },
      };
      const { data: badgeData } = await supabase.from('skill_badges').insert([badgePayload]).select().single();
      badge = badgeData ? { ...badgeData, ...tierInfo } : null;
    }

    // ── Update/create user_skills entry ──────────────────────────────────
    await supabase.from('user_skills').upsert({
      user_id: userId,
      skill_name: quiz.skill_name,
      is_verified: true,
      verified_via: 'quiz',
      credibility_score: Math.round(percentage * 0.40),
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id,skill_name' });

    // ── Award XP ──────────────────────────────────────────────────────────
    const xpGain = passed ? Math.round(percentage / 10) * 5 : 0; // 30-50 XP for passing
    if (xpGain > 0) {
      await supabase.rpc('increment_xp', { user_id_input: userId, xp_delta: xpGain }).catch(() => {});
    }
  }

  return {
    data: {
      score: correctCount,
      total: questions.length,
      percentage: Math.round(percentage * 100) / 100,
      passed,
      badge,
      gradedAnswers,
    },
    error: null,
  };
}

// ─── QUIZ HISTORY ────────────────────────────────────────────────────────────

/** Get all completed quiz attempts for a user */
export async function getQuizHistory(userId) {
  return withRetry(() =>
    supabase
      .from('quiz_attempts')
      .select('*, quiz:quizzes(title, skill_name, difficulty, passing_score)')
      .eq('user_id', userId)
      .eq('status', 'completed')
      .order('completed_at', { ascending: false })
  );
}

// ─── BADGES ──────────────────────────────────────────────────────────────────

/** Get all badges for a user */
export async function getUserBadges(userId) {
  return withRetry(() =>
    supabase
      .from('skill_badges')
      .select('*')
      .eq('user_id', userId)
      .order('earned_date', { ascending: false })
  );
}

