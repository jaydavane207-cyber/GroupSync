import React, { useRef } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import {
  Award, CheckCircle2, XCircle, RotateCcw, ArrowRight, Share2,
  Download, Check, X, BookOpen, Clock, Shield
} from 'lucide-react';
import { useAppContext } from '@/context/AppContext';
import { getBadgeTier } from '@/lib/services/quizService';

export default function QuizResultsPage() {
  const { quizId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAppContext();
  const certRef = useRef(null);

  const state = location.state || {};
  const result = state.result;
  const quiz = state.quiz;
  const questions = state.questions || [];
  const answers = state.answers || {};

  // Fallback if accessed directly without state
  if (!result || !quiz) {
    return (
      <div className="text-center py-20">
        <BookOpen size={40} className="mx-auto text-[var(--color-gs-text-muted)] opacity-40 mb-3" />
        <h2 className="text-lg font-semibold text-[var(--color-gs-text-main)] mb-1">No Quiz Results Found</h2>
        <p className="text-xs text-[var(--color-gs-text-muted)] mb-5">Take a quiz to see your score and verified badges here.</p>
        <button
          onClick={() => navigate('/quiz')}
          className="px-5 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors text-sm shadow-sm"
        >
          Browse Quizzes
        </button>
      </div>
    );
  }

  const { percentage = 0, passed = false, score = 0, total = questions.length, badge } = result;
  const tierInfo = getBadgeTier(percentage);

  const handlePrintCertificate = () => {
    window.print();
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* â”€â”€ Score & Celebration Hero â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <div className="rounded-xl p-8 md:p-10 text-center border bg-[var(--color-gs-card)] border-[var(--color-gs-border)] shadow-sm">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full mb-4 bg-black/5 dark:bg-white/5 border border-gs-border mx-auto">
          {passed ? (
            <Award size={28} className="text-amber-500" />
          ) : (
            <XCircle size={28} className="text-rose-500" />
          )}
        </div>

        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-gs-text-main mb-2 font-heading">
          {passed ? 'Skill Verified' : 'Assessment Not Passed'}
        </h1>
        <p className="text-gs-text-muted max-w-md mx-auto text-xs mb-6 leading-relaxed">
          {passed
            ? `Congratulations! You scored ${percentage}% on ${quiz.title} and earned the verified badge.`
            : `You scored ${percentage}%. You need ${quiz.passing_score}% to pass and earn the verified badge.`}
        </p>

        {/* Percentage & Stats */}
        <div className="flex justify-center items-center gap-4 mb-8 flex-wrap">
          <div className="bg-black/5 dark:bg-white/5 border border-gs-border rounded-xl px-5 py-3 text-center min-w-[110px]">
            <div className="text-2xl font-semibold text-[#6D6AF6] font-heading tabular-nums">
              {Math.round(percentage)}%
            </div>
            <div className="text-[11px] text-gs-text-muted font-medium mt-0.5">Final Score</div>
          </div>
          <div className="bg-black/5 dark:bg-white/5 border border-gs-border rounded-xl px-5 py-3 text-center min-w-[110px]">
            <div className="text-2xl font-semibold text-gs-text-main font-heading tabular-nums">
              {score} / {total}
            </div>
            <div className="text-[11px] text-gs-text-muted font-medium mt-0.5">Correct Answers</div>
          </div>
          {passed && tierInfo && (
            <div className="bg-black/5 dark:bg-white/5 border border-gs-border rounded-xl px-5 py-3 text-center min-w-[110px]">
              <div className="text-2xl font-semibold text-amber-500 flex items-center justify-center gap-1.5 font-heading">
                <Award size={18} /> {tierInfo.label}
              </div>
              <div className="text-[11px] text-gs-text-muted font-medium mt-0.5">Badge Tier</div>
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={() => navigate('/quiz')}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-gs-border text-xs font-medium text-gs-text-muted hover:text-gs-text-main hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
          >
            <BookOpen size={14} /> Browse Quizzes
          </button>
          {passed ? (
            <button
              onClick={() => navigate('/badges')}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#6D6AF6] hover:bg-[#5C59EC] text-white text-xs font-medium transition-colors shadow-xs cursor-pointer btn-tactile"
            >
              <Award size={14} /> View Badges
            </button>
          ) : (
            <button
              onClick={() => navigate(`/quiz/${quizId}/take`)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#6D6AF6] hover:bg-[#5C59EC] text-white text-xs font-medium transition-colors shadow-xs cursor-pointer btn-tactile"
            >
              <RotateCcw size={14} /> Retake Quiz
            </button>
          )}
        </div>
      </div>

      {/* â”€â”€ Verified Certificate Card (if passed) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      {passed && (
        <div className="bg-gs-card border border-gs-border rounded-xl p-6 md:p-8 space-y-5 shadow-xs">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h2 className="text-base font-semibold text-gs-text-main font-heading">Verified Skill Certificate</h2>
              <p className="text-xs text-gs-text-muted">Official proof of verification on GroupSync Campus Platform</p>
            </div>
            <button
              onClick={handlePrintCertificate}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-black/5 dark:bg-white/5 border border-gs-border rounded-lg text-xs font-medium text-gs-text-main hover:border-gs-border/80 transition-colors cursor-pointer"
            >
              <Download size={13} /> Print / Save PDF
            </button>
          </div>

          {/* Certificate Printable Canvas */}
          <div
            ref={certRef}
            className="p-8 rounded-xl border border-gs-border bg-black/5 dark:bg-white/5 shadow-xs relative overflow-hidden"
          >
            <div className="text-center space-y-4 relative z-10 py-4">
              <div className="text-xs font-semibold tracking-wider text-[#6D6AF6] uppercase">
                GroupSync Skill Certification
              </div>
              <h3 className="text-xl md:text-2xl font-semibold text-gs-text-main font-heading">
                Certificate of Skill Competency
              </h3>
              <p className="text-xs text-gs-text-muted">This officially certifies that</p>
              <div className="text-lg font-bold text-gs-text-main tracking-wide border-b border-gs-border pb-2 max-w-sm mx-auto font-heading">
                {user?.name || 'GroupSync Scholar'}
              </div>
              <p className="text-xs text-gs-text-muted max-w-md mx-auto leading-relaxed">
                has successfully demonstrated proficiency in <span className="font-semibold text-gs-text-main">{quiz.skill_name}</span> by achieving a passing score of <span className="font-semibold text-gs-text-main tabular-nums">{Math.round(percentage)}%</span> on the standard comprehensive assessment.
              </p>

              <div className="pt-5 flex justify-around items-center border-t border-gs-border text-xs text-gs-text-muted">
                <div>
                  <div className="font-semibold text-gs-text-main">{tierInfo?.label} Tier</div>
                  <div className="text-[11px]">Badge Level</div>
                </div>
                <div>
                  <div className="font-semibold text-gs-text-main">{new Date().toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                  <div className="text-[11px]">Issued Date</div>
                </div>
                <div>
                  <div className="font-semibold text-emerald-500">Verified</div>
                  <div className="text-[11px]">Status</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* â”€â”€ Question Review â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <div className="bg-gs-card border border-gs-border rounded-xl p-6 md:p-8 space-y-5 shadow-xs">
        <h2 className="text-base font-semibold text-gs-text-main font-heading">
          Question Review
        </h2>
        <div className="space-y-3">
          {questions.map((q, idx) => {
            const userAns = answers[q.id];
            const isCorrect = userAns && String(userAns).trim().toLowerCase() === String(q.correct_answer).trim().toLowerCase();

            return (
              <div
                key={q.id}
                className={`p-4 rounded-xl border text-xs transition-colors ${
                  isCorrect
                    ? 'border-emerald-500/20 bg-emerald-500/5'
                    : 'border-rose-500/20 bg-rose-500/5'
                }`}
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <span className="font-medium text-xs text-gs-text-main">
                    <span className="text-[#6D6AF6] mr-2 font-semibold">Q{idx + 1}.</span>
                    {q.question_text}
                  </span>
                  {isCorrect ? (
                    <span className="flex items-center gap-1 text-[10px] font-medium text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full shrink-0">
                      <Check size={11} /> Correct
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-[10px] font-medium text-rose-500 bg-rose-500/10 px-2 py-0.5 rounded-full shrink-0">
                      <X size={11} /> Incorrect
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs mt-3">
                  <div className="p-2.5 bg-black/5 dark:bg-white/5 rounded-lg border border-gs-border">
                    <span className="text-gs-text-muted block mb-0.5">Your Answer:</span>
                    <span className={isCorrect ? 'text-emerald-500 font-medium' : 'text-rose-500 font-medium'}>
                      {userAns || 'No answer provided'}
                    </span>
                  </div>
                  <div className="p-2.5 bg-black/5 dark:bg-white/5 rounded-lg border border-gs-border">
                    <span className="text-gs-text-muted block mb-0.5">Correct Answer:</span>
                    <span className="text-emerald-500 font-medium">{q.correct_answer}</span>
                  </div>
                </div>

                {q.explanation && (
                  <div className="mt-2.5 text-xs text-gs-text-muted bg-black/5 dark:bg-white/5 p-2.5 rounded-lg border border-gs-border">
                    <span className="font-semibold text-[#6D6AF6] mr-1">Explanation:</span>
                    {q.explanation}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

