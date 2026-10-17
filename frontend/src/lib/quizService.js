/**
 * quizService.js — GroupSync Quiz & Skill Verification Operations
 * Handles quiz loading, randomized question generation, attempt management,
 * answer saving, scoring, badge awarding.
 */
import supabase from './supabase';
import { withRetry } from './withRetry';
import { getRandomQuestionsForSkill, shuffleArray } from './data/quizQuestionsData';

// ─── BADGE TIER CALCULATION ───────────────────────────────────────────────────

/**
 * Determine badge tier from quiz percentage score.
 * 60-74%: Bronze, 75-84%: Silver, 85-94%: Gold, 95-100%: Platinum
 */
export function getBadgeTier(percentage) {
  if (percentage >= 95) return { tier: 'platinum', emoji: '💎', label: 'Platinum' };
  if (percentage >= 85) return { tier: 'gold',     emoji: '🥇', label: 'Gold' };
  if (percentage >= 75) return { tier: 'silver',   emoji: '🥈', label: 'Silver' };
  if (percentage >= 60) return { tier: 'bronze',   emoji: '🥉', label: 'Bronze' };
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

/**
 * Fetch quiz with randomized questions.
 * Combines any DB questions with our 30-question bank and randomizes them.
 * If resuming an existing attempt, returns the preserved questions for that attempt.
 *
 * @param {string} quizId
 * @param {object} [options]
 * @param {string} [options.resumeAttemptId]
 * @param {boolean} [options.forceNew]
 */
export async function getQuizWithQuestions(quizId, { resumeAttemptId = null, forceNew = false } = {}) {
  return withRetry(async () => {
    const quizResult = await supabase
      .from('quizzes').select('*').eq('id', quizId).single();
    if (quizResult.error) return quizResult;

    const quiz = quizResult.data;

    // 1. If resuming, check if questions were saved for this specific attempt
    if (resumeAttemptId && !forceNew) {
      try {
        const attemptSaved = localStorage.getItem(`group_sync_quiz_questions_${resumeAttemptId}`);
        if (attemptSaved) {
          const parsed = JSON.parse(attemptSaved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return { data: { quiz, questions: parsed }, error: null };
          }
        }
      } catch (_) {}
    }

    // 2. Fetch any questions that exist in the database for this quiz
    let dbQuestions = [];
    try {
      const questionsResult = await supabase
        .from('quiz_questions')
        .select('*')
        .eq('quiz_id', quizId)
        .order('question_order', { ascending: true });

      if (!questionsResult.error && questionsResult.data) {
        dbQuestions = questionsResult.data;
      }
    } catch (_) {}

    // 3. Generate questions from our extensive 30-question bank
    const totalCount = quiz.total_questions || 10;
    const clientPool = getRandomQuestionsForSkill(
      quiz.skill_name || quiz.title,
      30,
      'db',
      { quizId }
    );

    // 4. Merge DB questions and client question bank without duplicates
    const combinedMap = new Map();
    // Add DB questions
    for (const q of dbQuestions) {
      if (q && q.question_text) {
        combinedMap.set(q.question_text.trim().toLowerCase(), q);
      }
    }
    // Add client questions
    for (const q of clientPool) {
      if (q && q.question_text) {
        const key = q.question_text.trim().toLowerCase();
        if (!combinedMap.has(key)) {
          combinedMap.set(key, q);
        }
      }
    }

    // 5. Randomize with Fisher-Yates and pick required count
    const combinedList = Array.from(combinedMap.values());
    const randomizedQuestions = shuffleArray(combinedList)
      .slice(0, Math.min(totalCount, combinedList.length))
      .map((q, idx) => ({
        ...q,
        quiz_id: quizId,
        question_order: idx + 1
      }));

    // 6. Cache for the active session / attempt
    try {
      if (resumeAttemptId) {
        localStorage.setItem(`group_sync_quiz_questions_${resumeAttemptId}`, JSON.stringify(randomizedQuestions));
      }
      localStorage.setItem(`group_sync_quiz_questions_${quizId}_active`, JSON.stringify(randomizedQuestions));
    } catch (_) {}

    return { data: { quiz, questions: randomizedQuestions }, error: null };
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
  return withRetry(async () => {
    const res = await supabase.from('quiz_attempts')
      .insert([{ user_id: userId, quiz_id: quizId, status: 'in_progress' }])
      .select().single();

    if (res.data?.id) {
      // Associate active randomized questions with this new attemptId
      try {
        const activeQuestions = localStorage.getItem(`group_sync_quiz_questions_${quizId}_active`);
        if (activeQuestions) {
          localStorage.setItem(`group_sync_quiz_questions_${res.data.id}`, activeQuestions);
        }
      } catch (_) {}
    }
    return res;
  });
}

/** Update attempt state (for pause/resume/current question tracking) */
export async function updateAttemptState(attemptId, updates) {
  return supabase.from('quiz_attempts').update(updates).eq('id', attemptId);
}

// ─── ANSWER MANAGEMENT ───────────────────────────────────────────────────────

/** Save/update an answer for a question (upsert) */
export async function saveAnswer(attemptId, questionId, userAnswer) {
  // Always cache locally in case questionId is from client randomized bank
  try {
    const key = `group_sync_quiz_answers_${attemptId}`;
    const local = JSON.parse(localStorage.getItem(key) || '{}');
    local[questionId] = userAnswer;
    localStorage.setItem(key, JSON.stringify(local));
  } catch (_) {}

  // Attempt database upsert if questionId is a UUID
  try {
    const isUuid = typeof questionId === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(questionId);
    if (isUuid) {
      return await supabase.from('quiz_answers').upsert({
        attempt_id: attemptId,
        question_id: questionId,
        user_answer: userAnswer,
        answered_at: new Date().toISOString(),
      }, { onConflict: 'attempt_id,question_id' });
    }
  } catch (_) {}

  return { data: null, error: null };
}

/** Load all saved answers for an attempt (for resume) */
export async function loadSavedAnswers(attemptId) {
  const answerMap = {};

  // First load from localStorage cache
  try {
    const key = `group_sync_quiz_answers_${attemptId}`;
    const local = JSON.parse(localStorage.getItem(key) || '{}');
    Object.assign(answerMap, local);
  } catch (_) {}

  // Then merge with DB answers
  try {
    const { data } = await supabase
      .from('quiz_answers')
      .select('question_id, user_answer')
      .eq('attempt_id', attemptId);

    if (data && Array.isArray(data)) {
      for (const a of data) {
        answerMap[a.question_id] = a.user_answer;
      }
    }
  } catch (_) {}

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
  const timeTakenMinutes = (completedAt.getTime() - (startedAtMs || completedAt.getTime())) / 60000;

  // ── Grade each question ─────────────────────────────────────────────────
  let correctCount = 0;
  const gradedAnswers = questions.map(q => {
    const userAnswer = String(answers[q.id] || '').trim().toLowerCase();
    const correct = String(q.correct_answer || '').trim().toLowerCase();
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

  const totalQuestions = questions.length > 0 ? questions.length : 10;
  const percentage = (correctCount / totalQuestions) * 100;
  const passed = percentage >= (quiz.passing_score || 70);

  // ── Save answers safely to DB (filter valid UUIDs to avoid constraint errors) ─
  try {
    const isUuid = (id) => typeof id === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
    const dbAnswers = gradedAnswers.filter(a => isUuid(a.question_id));
    if (dbAnswers.length > 0) {
      await supabase.from('quiz_answers').upsert(
        dbAnswers.map(a => ({
          attempt_id: attemptId,
          question_id: a.question_id,
          user_answer: a.user_answer,
          is_correct: a.is_correct,
          answered_at: new Date().toISOString(),
        })),
        { onConflict: 'attempt_id,question_id' }
      );
    }
  } catch (_) {}

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
        metadata: { quiz_title: quiz.title, correct: correctCount, total: totalQuestions },
      };
      const { data: badgeData } = await supabase.from('skill_badges').insert([badgePayload]).select().single();
      badge = badgeData ? { ...badgeData, ...tierInfo } : null;
    }

    // ── Update/create user_skills entry ──────────────────────────────────
    try {
      await supabase.from('user_skills').upsert({
        user_id: userId,
        skill_name: quiz.skill_name,
        is_verified: true,
        verified_via: 'quiz',
        credibility_score: Math.round(percentage * 0.40),
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id,skill_name' });
    } catch (_) {}

    // ── Award XP ──────────────────────────────────────────────────────────
    const xpGain = passed ? Math.round(percentage / 10) * 5 : 0;
    if (xpGain > 0) {
      try {
        await supabase.rpc('increment_xp', { user_id_input: userId, xp_delta: xpGain });
      } catch (_) {}
    }
  }

  // Clean up localStorage for this attempt so next attempt generates fresh random questions
  try {
    localStorage.removeItem(`group_sync_quiz_questions_${attemptId}`);
    localStorage.removeItem(`group_sync_quiz_questions_${quiz.id}_active`);
    localStorage.removeItem(`group_sync_quiz_answers_${attemptId}`);
  } catch (_) {}

  return {
    data: {
      score: correctCount,
      total: totalQuestions,
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

// Default export object for hooks and backward compatibility
export const quizService = {
  getQuiz,
  getQuizById: getQuizWithQuestions,
  getQuizWithQuestions,
  browseQuizzes,
  getExistingAttempt,
  startAttempt,
  updateAttemptState,
  saveAnswer,
  loadSavedAnswers,
  submitQuiz,
  getQuizHistory,
  getUserBadges,
  getBadgeTier,
  calculateCredibilityScore,
};

export default quizService;
