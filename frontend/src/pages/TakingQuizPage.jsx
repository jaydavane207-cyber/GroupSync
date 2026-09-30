import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import {
  Clock, ChevronLeft, ChevronRight, Check, Pause, Play, AlertTriangle,
  Loader2, BookOpen, X, Save, AlertCircle
} from 'lucide-react';
import { useAppContext } from '@/context/AppContext';
import {
  getQuizWithQuestions, getExistingAttempt, startAttempt,
  updateAttemptState, saveAnswer, loadSavedAnswers, submitQuiz
} from '@/lib/services/quizService';

// â”€â”€â”€ Timer display â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function TimerDisplay({ seconds, totalSeconds, isPaused }) {
  const pct = totalSeconds > 0 ? (seconds / totalSeconds) * 100 : 100;
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  const isWarning = seconds < 120; // < 2 min
  const isDanger  = seconds < 60;  // < 1 min

  return (
    <div className={`flex items-center gap-2 px-4 py-2 rounded-lg border font-mono text-sm font-bold transition-colors
      ${isDanger ? 'border-red-500/40 bg-red-500/10 text-red-400 animate-pulse' :
        isWarning ? 'border-amber-500/40 bg-amber-500/10 text-amber-400' :
        isPaused ? 'border-[var(--color-gs-border)] text-[var(--color-gs-text-muted)]' :
        'border-[var(--color-gs-border)] text-[var(--color-gs-text-main)]'}`}>
      <Clock size={14} />
      {isPaused && <Pause size={12} />}
      {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
    </div>
  );
}

// â”€â”€â”€ Question Navigator dots â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function QuestionNav({ total, current, answers, onJump }) {
  return (
    <div className="flex flex-wrap gap-1.5 justify-center">
      {Array.from({ length: total }).map((_, i) => {
        const hasAnswer = answers[i] !== undefined && answers[i] !== '';
        const isCurrent = i === current;
        return (
          <button key={i} onClick={() => onJump(i)}
            className={`w-7 h-7 rounded-lg text-[11px] font-medium transition-colors cursor-pointer ${
              isCurrent ? 'bg-[#6D6AF6] text-white font-semibold shadow-xs' :
              hasAnswer ? 'bg-[#6D6AF6]/10 text-[#6D6AF6] border border-[#6D6AF6]/30' :
              'bg-gs-card border border-gs-border text-gs-text-muted hover:border-gs-border/80'
            }`}>
            {i + 1}
          </button>
        );
      })}
    </div>
  );
}

// â”€â”€â”€ Confirm Submit Modal â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function SubmitModal({ total, answered, onConfirm, onCancel, isSubmitting }) {
  const unanswered = total - answered;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="bg-gs-card border border-gs-border rounded-xl p-6 max-w-sm w-full shadow-xl">
        <div className="text-center">
          <div className="w-11 h-11 rounded-full bg-[#6D6AF6]/10 border border-[#6D6AF6]/20 text-[#6D6AF6] flex items-center justify-center mx-auto mb-3">
            <Check size={20} />
          </div>
          <h2 className="text-base font-semibold text-gs-text-main mb-1">Submit Assessment?</h2>
          <p className="text-xs text-gs-text-muted mb-2">
            You've answered <span className="font-semibold text-gs-text-main tabular-nums">{answered} of {total}</span> questions.
          </p>
          {unanswered > 0 && (
            <p className="text-xs text-amber-500 flex items-center justify-center gap-1 mb-4">
              <AlertTriangle size={13} /> {unanswered} question{unanswered > 1 ? 's' : ''} unanswered
            </p>
          )}
          <p className="text-xs text-gs-text-muted mb-5">This action cannot be undone.</p>
          <div className="flex gap-2.5">
            <button onClick={onCancel} disabled={isSubmitting}
              className="flex-1 py-2 rounded-lg border border-gs-border text-gs-text-muted hover:bg-black/5 dark:hover:bg-white/5 hover:text-gs-text-main transition-colors font-medium text-xs cursor-pointer">
              Cancel
            </button>
            <button onClick={onConfirm} disabled={isSubmitting}
              className="flex-1 py-2 rounded-lg bg-[#6D6AF6] hover:bg-[#5C59EC] text-white font-medium transition-colors text-xs flex items-center justify-center gap-1.5 disabled:opacity-50 shadow-xs cursor-pointer btn-tactile">
              {isSubmitting ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
              {isSubmitting ? 'Submitting...' : 'Submit'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// â”€â”€â”€ TakingQuizPage â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export default function TakingQuizPage() {
  const { quizId } = useParams();
  const navigate   = useNavigate();
  const location   = useLocation();
  const { user, showToast } = useAppContext();

  const [quiz, setQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [attempt, setAttempt] = useState(null);
  const [answers, setAnswers] = useState({}); // { questionId: answerText }
  const [currentIdx, setCurrentIdx] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [error, setError] = useState(null);
  const [startedAtMs, setStartedAtMs] = useState(null);

  const timerRef     = useRef(null);
  const autoSaveRef  = useRef(null);
  const isPausedRef  = useRef(false);

  // Keep ref in sync for timer closure
  useEffect(() => { isPausedRef.current = isPaused; }, [isPaused]);

  // â”€â”€â”€ Initialize quiz â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  useEffect(() => {
    if (!user?.id || !quizId) return;
    let cancelled = false;

    const init = async () => {
      setIsLoading(true);
      setError(null);

      // Load quiz + questions
      const { data: quizData, error: quizErr } = await getQuizWithQuestions(quizId);
      if (quizErr || !quizData) {
        setError('Could not load quiz. Please try again.');
        setIsLoading(false);
        return;
      }
      if (cancelled) return;

      setQuiz(quizData.quiz);
      setQuestions(quizData.questions);

      const totalSecs = (quizData.quiz.duration_minutes || 30) * 60;
      const resumeId = location.state?.resumeAttemptId;

      // Check for in-progress/paused attempt
      let activeAttempt = null;
      if (resumeId) {
        const { data: existing } = await getExistingAttempt(user.id, quizId);
        activeAttempt = existing;
      }

      if (activeAttempt) {
        // Resume: load saved answers and remaining time
        setAttempt(activeAttempt);
        setTimeRemaining(activeAttempt.time_remaining_secs ?? totalSecs);
        setCurrentIdx(activeAttempt.current_question ?? 0);

        const { data: savedAnswers } = await loadSavedAnswers(activeAttempt.id);
        if (savedAnswers && !cancelled) setAnswers(savedAnswers);
      } else {
        // Start fresh attempt
        const { data: newAttempt, error: attemptErr } = await startAttempt(user.id, quizId);
        if (attemptErr || !newAttempt) {
          setError('Could not start quiz attempt. Please try again.');
          setIsLoading(false);
          return;
        }
        if (cancelled) return;
        setAttempt(newAttempt);
        setTimeRemaining(totalSecs);
      }

      setStartedAtMs(Date.now());
      setIsLoading(false);
    };

    init();
    return () => { cancelled = true; };
  }, [user?.id, quizId, location.state]);

  // â”€â”€â”€ Timer â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  useEffect(() => {
    if (!attempt || isLoading) return;

    timerRef.current = setInterval(() => {
      if (isPausedRef.current) return;
      setTimeRemaining(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [attempt, isLoading]);

  // â”€â”€â”€ Auto-save every 10 seconds â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  useEffect(() => {
    if (!attempt || isLoading) return;
    autoSaveRef.current = setInterval(() => {
      if (attempt?.id) {
        updateAttemptState(attempt.id, {
          current_question: currentIdx,
          time_remaining_secs: timeRemaining,
        }).catch(() => {});
      }
    }, 10000);
    return () => clearInterval(autoSaveRef.current);
  }, [attempt, currentIdx, timeRemaining, isLoading]);

  // â”€â”€â”€ Pause / Resume â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const togglePause = useCallback(async () => {
    const nowPaused = !isPaused;
    setIsPaused(nowPaused);

    if (attempt?.id) {
      await updateAttemptState(attempt.id, {
        status: nowPaused ? 'paused' : 'in_progress',
        paused_at: nowPaused ? new Date().toISOString() : null,
        time_remaining_secs: timeRemaining,
        current_question: currentIdx,
      });
    }
  }, [isPaused, attempt, timeRemaining, currentIdx]);

  // â”€â”€â”€ Answer selection â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const handleAnswer = useCallback(async (questionId, value) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
    if (attempt?.id) {
      await saveAnswer(attempt.id, questionId, value).catch(() => {});
    }
  }, [attempt]);

  // â”€â”€â”€ Submit â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const doSubmit = useCallback(async () => {
    if (!attempt || !quiz || isSubmitting) return;
    setIsSubmitting(true);
    setShowSubmitModal(false);
    clearInterval(timerRef.current);
    clearInterval(autoSaveRef.current);

    const { data, error: submitError } = await submitQuiz(
      attempt.id, user.id, quiz, questions, answers, startedAtMs
    );

    setIsSubmitting(false);

    if (submitError) {
      showToast('Failed to submit quiz. Please try again.', 'error');
      return;
    }

    navigate(`/quiz/${quizId}/results`, {
      state: { result: data, quiz, questions, answers },
      replace: true
    });
  }, [attempt, quiz, questions, answers, startedAtMs, user?.id, navigate, quizId, isSubmitting, showToast]);

  // â”€â”€â”€ Auto-submit when timer hits 0 â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const handleAutoSubmit = useCallback(() => {
    setShowSubmitModal(false);
    doSubmit();
  }, [doSubmit]);

  // â”€â”€â”€ Current question â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const currentQuestion = questions[currentIdx];
  const currentAnswer = currentQuestion ? (answers[currentQuestion.id] || '') : '';
  const answeredCount = Object.values(answers).filter(a => a !== '').length;
  const totalSecs = (quiz?.duration_minutes || 30) * 60;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-3">
          <Loader2 size={30} className="animate-spin text-[#6D6AF6] mx-auto" />
          <p className="text-xs text-gs-text-muted">Loading assessment...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <AlertCircle size={36} className="text-rose-400 mx-auto" />
          <p className="text-rose-400 font-medium text-xs">{error}</p>
          <button onClick={() => navigate('/quiz')} className="px-4 py-2 bg-[#6D6AF6] hover:bg-[#5C59EC] text-white font-medium rounded-lg transition-colors text-xs shadow-xs cursor-pointer btn-tactile">
            Back to Quizzes
          </button>
        </div>
      </div>
    );
  }

  if (!currentQuestion) return null;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Submit modal */}
      {showSubmitModal && (
        <SubmitModal
          total={questions.length}
          answered={answeredCount}
          onConfirm={doSubmit}
          onCancel={() => setShowSubmitModal(false)}
          isSubmitting={isSubmitting}
        />
      )}

      {/* Quiz header */}
      <div className="bg-gs-card border border-gs-border rounded-xl p-5 shadow-xs">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <button onClick={() => { togglePause(); navigate('/quiz'); }}
              className="p-2 rounded-lg text-gs-text-muted hover:bg-black/5 dark:hover:bg-white/5 hover:text-gs-text-main transition-colors cursor-pointer">
              <ChevronLeft size={18} />
            </button>
            <div>
              <h1 className="font-semibold text-base md:text-lg text-gs-text-main leading-tight font-heading">{quiz?.title}</h1>
              <p className="text-xs text-gs-text-muted">{quiz?.skill_name} Â· {questions.length} questions</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <TimerDisplay seconds={timeRemaining} totalSeconds={totalSecs} isPaused={isPaused} />
            <button onClick={togglePause}
              className={`p-2 rounded-lg border transition-colors cursor-pointer ${isPaused ? 'bg-[#6D6AF6] text-white border-[#6D6AF6]' : 'border-gs-border text-gs-text-muted hover:text-gs-text-main'}`}
              title={isPaused ? 'Resume' : 'Pause'}>
              {isPaused ? <Play size={15} /> : <Pause size={15} />}
            </button>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-4">
          <div className="flex justify-between text-xs text-gs-text-muted mb-1.5 tabular-nums">
            <span>Question {currentIdx + 1} of {questions.length}</span>
            <span>{answeredCount}/{questions.length} answered</span>
          </div>
          <div className="h-1 bg-black/5 dark:bg-white/5 rounded-full overflow-hidden">
            <div className="h-full bg-[#6D6AF6] rounded-full transition-all duration-300"
              style={{ width: `${((currentIdx + 1) / questions.length) * 100}%` }} />
          </div>
        </div>
      </div>

      {/* Paused overlay */}
      {isPaused && (
        <div className="bg-gs-card border border-amber-500/20 rounded-xl p-8 text-center shadow-xs">
          <Pause size={28} className="text-amber-500 mx-auto mb-3" />
          <h2 className="text-base font-semibold text-gs-text-main mb-1 font-heading">Assessment Paused</h2>
          <p className="text-xs text-gs-text-muted mb-5">Your progress is saved. Resume when you're ready.</p>
          <button onClick={togglePause}
            className="flex items-center gap-2 mx-auto px-4 py-2 bg-[#6D6AF6] hover:bg-[#5C59EC] text-white font-medium rounded-lg transition-colors text-xs shadow-xs cursor-pointer btn-tactile">
            <Play size={14} /> Resume Assessment
          </button>
        </div>
      )}

      {/* Question card */}
      {!isPaused && (
        <div className="bg-gs-card border border-gs-border rounded-xl p-6 md:p-8 space-y-6 shadow-xs">
          {/* Question type badge */}
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wider bg-black/5 dark:bg-white/5 border border-gs-border rounded-md text-gs-text-muted">
              {currentQuestion.question_type === 'mcq' ? 'Multiple Choice' :
               currentQuestion.question_type === 'true_false' ? 'True / False' :
               currentQuestion.question_type === 'code' ? 'Code' : 'Short Answer'}
            </span>
          </div>

          {/* Question text */}
          <div>
            <h2 className="text-base md:text-lg font-medium text-gs-text-main leading-relaxed font-heading">
              <span className="text-[#6D6AF6] font-semibold mr-2">Q{currentIdx + 1}.</span>
              {currentQuestion.question_text}
            </h2>
          </div>

          {/* Answer area */}
          <div className="space-y-3">
            {/* MCQ */}
            {currentQuestion.question_type === 'mcq' && currentQuestion.options && (
              <div className="space-y-2.5">
                {(typeof currentQuestion.options === 'string' ? JSON.parse(currentQuestion.options) : currentQuestion.options).map(opt => {
                  const isSelected = currentAnswer === opt.label;
                  return (
                    <button key={opt.label} onClick={() => handleAnswer(currentQuestion.id, opt.label)}
                      className={`w-full flex items-center gap-3.5 p-3.5 rounded-lg border text-left transition-colors duration-150 cursor-pointer
                        ${isSelected
                          ? 'border-[#6D6AF6] bg-[#6D6AF6]/5 text-gs-text-main'
                          : 'border-gs-border bg-black/5 dark:bg-white/5 hover:border-gs-border/80 text-gs-text-muted hover:text-gs-text-main'}`}>
                      <div className={`w-7 h-7 rounded-lg border flex items-center justify-center text-xs font-semibold shrink-0 transition-colors
                        ${isSelected ? 'border-[#6D6AF6] bg-[#6D6AF6] text-white' : 'border-gs-border text-gs-text-muted'}`}>
                        {isSelected ? <Check size={13} /> : opt.label}
                      </div>
                      <span className="text-xs leading-relaxed">{opt.text}</span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* True / False */}
            {currentQuestion.question_type === 'true_false' && (
              <div className="grid grid-cols-2 gap-3">
                {['true', 'false'].map(val => {
                  const isSelected = currentAnswer === val;
                  return (
                    <button key={val} onClick={() => handleAnswer(currentQuestion.id, val)}
                      className={`p-3.5 rounded-lg border font-medium text-xs transition-colors duration-150 cursor-pointer
                        ${isSelected
                          ? 'border-[#6D6AF6] bg-[#6D6AF6]/10 text-[#6D6AF6]'
                          : 'border-gs-border bg-black/5 dark:bg-white/5 text-gs-text-muted hover:border-gs-border/80 hover:text-gs-text-main'}`}>
                      {val === 'true' ? 'True' : 'False'}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Short Answer */}
            {currentQuestion.question_type === 'short_answer' && (
              <textarea
                value={currentAnswer}
                onChange={e => handleAnswer(currentQuestion.id, e.target.value)}
                placeholder="Type your answer here..."
                rows={4}
                className="w-full bg-black/5 dark:bg-white/5 border border-gs-border rounded-lg px-3.5 py-2.5 text-xs text-gs-text-main placeholder-gs-text-muted outline-none focus:border-[#6D6AF6] resize-none transition-colors"
              />
            )}

            {/* Code */}
            {currentQuestion.question_type === 'code' && (
              <textarea
                value={currentAnswer}
                onChange={e => handleAnswer(currentQuestion.id, e.target.value)}
                placeholder="Write your code here..."
                rows={10}
                className="w-full bg-black/5 dark:bg-white/5 border border-gs-border rounded-lg px-3.5 py-2.5 font-mono text-xs text-gs-text-main placeholder-gs-text-muted outline-none focus:border-[#6D6AF6] resize-y transition-colors"
                spellCheck={false}
              />
            )}
          </div>
        </div>
      )}

      {/* Navigation & Question dots */}
      {!isPaused && (
        <>
          <div className="flex items-center justify-between gap-3">
            <button onClick={() => setCurrentIdx(prev => Math.max(0, prev - 1))} disabled={currentIdx === 0}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-gs-card border border-gs-border rounded-lg text-xs font-medium text-gs-text-muted hover:text-gs-text-main disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer">
              <ChevronLeft size={14} /> Prev
            </button>

            {isSubmitting ? (
              <div className="flex items-center gap-2 text-gs-text-muted text-xs">
                <Loader2 size={14} className="animate-spin text-[#6D6AF6]" /> Submitting...
              </div>
            ) : (
              <button onClick={() => setShowSubmitModal(true)}
                className="flex items-center gap-1.5 px-4 py-2 bg-[#6D6AF6] hover:bg-[#5C59EC] text-white rounded-lg text-xs font-medium transition-colors shadow-xs cursor-pointer btn-tactile">
                <Save size={14} /> Submit Assessment
              </button>
            )}

            {currentIdx < questions.length - 1 ? (
              <button onClick={() => setCurrentIdx(prev => Math.min(questions.length - 1, prev + 1))}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-gs-card border border-gs-border rounded-lg text-xs font-medium text-gs-text-muted hover:text-gs-text-main transition-colors cursor-pointer">
                Next <ChevronRight size={14} />
              </button>
            ) : (
              <div className="px-3.5 py-2 text-xs text-gs-text-muted">Last question</div>
            )}
          </div>

          <QuestionNav
            total={questions.length}
            current={currentIdx}
            answers={Object.fromEntries(questions.map((q, i) => [i, answers[q.id] || '']))}
            onJump={setCurrentIdx}
          />
        </>
      )}
    </div>
  );
}

