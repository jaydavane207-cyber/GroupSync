import React, { useRef } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import {
  Award, CheckCircle2, XCircle, RotateCcw, ArrowRight, Share2,
  Download, Sparkles, Check, X, BookOpen, Clock, Shield
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { getBadgeTier } from '../lib/quizService';

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
        <BookOpen size={48} className="mx-auto text-[var(--color-gs-text-muted)] opacity-40 mb-4" />
        <h2 className="text-xl font-bold font-heading text-[var(--color-gs-text-main)] mb-2">No Quiz Results Found</h2>
        <p className="text-sm text-[var(--color-gs-text-muted)] mb-6">Take a quiz to see your score and verified badges here.</p>
        <button
          onClick={() => navigate('/quiz')}
          className="px-6 py-3 bg-[var(--color-gs-cyan)] text-[#0f172a] font-bold rounded-xl hover:bg-cyan-400 transition-colors"
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
    <div className="max-w-4xl mx-auto space-y-8 animate-[load-fade-up_0.4s_ease-out]">
      {/* ── Score & Celebration Hero ─────────────────────────────── */}
      <div className={`relative overflow-hidden rounded-3xl p-8 md:p-12 text-center border backdrop-blur-xl ${
        passed
          ? 'bg-gradient-to-b from-emerald-500/10 via-[var(--color-gs-card)] to-[var(--color-gs-card)] border-emerald-500/30'
          : 'bg-gradient-to-b from-rose-500/10 via-[var(--color-gs-card)] to-[var(--color-gs-card)] border-rose-500/30'
      }`}>
        {passed && (
          <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-40 h-40 bg-emerald-400/20 rounded-full blur-3xl pointer-events-none" />
        )}

        <div className="inline-flex items-center justify-center p-4 rounded-3xl mb-6 shadow-xl border border-white/10 bg-white/5">
          {passed ? (
            <span className="text-6xl animate-bounce">{tierInfo?.emoji || '🏆'}</span>
          ) : (
            <XCircle size={64} className="text-rose-400" />
          )}
        </div>

        <h1 className="text-3xl md:text-5xl font-black font-heading tracking-tight text-[var(--color-gs-text-main)] mb-3">
          {passed ? 'Skill Verified!' : 'Quiz Not Passed'}
        </h1>
        <p className="text-[var(--color-gs-text-muted)] max-w-md mx-auto text-sm md:text-base mb-8">
          {passed
            ? `Congratulations! You scored ${percentage}% on ${quiz.title} and earned the verified badge.`
            : `You scored ${percentage}%. You need ${quiz.passing_score}% to pass and earn the verified badge.`}
        </p>

        {/* Big Percentage Meter */}
        <div className="flex justify-center items-center gap-8 mb-8 flex-wrap">
          <div className="bg-[var(--color-gs-bg)]/60 border border-[var(--color-gs-border)] rounded-2xl px-6 py-4">
            <div className="text-4xl font-black font-heading text-[var(--color-gs-cyan)]">
              {Math.round(percentage)}%
            </div>
            <div className="text-xs text-[var(--color-gs-text-muted)] font-bold uppercase tracking-wider mt-1">Final Score</div>
          </div>
          <div className="bg-[var(--color-gs-bg)]/60 border border-[var(--color-gs-border)] rounded-2xl px-6 py-4">
            <div className="text-4xl font-black font-heading text-[var(--color-gs-text-main)]">
              {score} / {total}
            </div>
            <div className="text-xs text-[var(--color-gs-text-muted)] font-bold uppercase tracking-wider mt-1">Correct Answers</div>
          </div>
          {passed && tierInfo && (
            <div className="bg-[var(--color-gs-bg)]/60 border border-[var(--color-gs-border)] rounded-2xl px-6 py-4">
              <div className="text-4xl font-black font-heading text-amber-400 flex items-center justify-center gap-1">
                <span>{tierInfo.emoji}</span> {tierInfo.label}
              </div>
              <div className="text-xs text-[var(--color-gs-text-muted)] font-bold uppercase tracking-wider mt-1">Badge Tier</div>
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4">
          <button
            onClick={() => navigate('/quiz')}
            className="flex items-center gap-2 px-6 py-3 rounded-2xl border border-[var(--color-gs-border)] text-sm font-bold text-[var(--color-gs-text-main)] hover:bg-white/5 transition-colors"
          >
            <BookOpen size={16} /> Browse More Quizzes
          </button>
          {passed ? (
            <button
              onClick={() => navigate('/badges')}
              className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-[var(--color-gs-cyan)] to-[var(--color-gs-secondary)] text-white text-sm font-bold hover:opacity-90 transition-opacity shadow-[0_4px_15px_rgba(0,240,255,0.25)]"
            >
              <Award size={16} /> View My Badges
            </button>
          ) : (
            <button
              onClick={() => navigate(`/quiz/${quizId}/take`)}
              className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-[var(--color-gs-cyan)] text-[#0f172a] text-sm font-bold hover:bg-cyan-400 transition-colors shadow-[0_4px_15px_rgba(0,240,255,0.25)]"
            >
              <RotateCcw size={16} /> Retake Quiz
            </button>
          )}
        </div>
      </div>

      {/* ── Verified Certificate Card (if passed) ─────────────────── */}
      {passed && (
        <div className="bg-[var(--color-gs-card)] border border-[var(--color-gs-border)] rounded-3xl p-6 md:p-8 space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h2 className="text-xl font-black font-heading text-[var(--color-gs-text-main)]">Verified Skill Certificate</h2>
              <p className="text-xs text-[var(--color-gs-text-muted)]">Official proof of verification on GroupSync Campus Platform</p>
            </div>
            <button
              onClick={handlePrintCertificate}
              className="flex items-center gap-2 px-4 py-2 bg-[var(--color-gs-bg)] border border-[var(--color-gs-border)] rounded-xl text-xs font-bold text-[var(--color-gs-text-main)] hover:border-[var(--color-gs-cyan)]/50 transition-colors"
            >
              <Download size={14} /> Download / Print PDF
            </button>
          </div>

          {/* Certificate Printable Canvas */}
          <div
            ref={certRef}
            className="p-8 rounded-3xl border-2 border-[var(--color-gs-cyan)]/30 bg-gradient-to-br from-[#050810] via-[var(--color-gs-card)] to-[#08101e] shadow-2xl relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
              <Shield size={180} />
            </div>

            <div className="text-center space-y-4 relative z-10 py-6">
              <div className="text-xs font-black tracking-widest text-[var(--color-gs-cyan)] uppercase">
                GroupSync Skill Certification
              </div>
              <h3 className="text-2xl md:text-3xl font-black font-heading text-white">
                Certificate of Skill Competency
              </h3>
              <p className="text-sm text-[var(--color-gs-text-muted)]">This officially certifies that</p>
              <div className="text-2xl font-black text-[var(--color-gs-primary)] tracking-wide border-b border-white/10 pb-2 max-w-sm mx-auto">
                {user?.name || 'GroupSync Scholar'}
              </div>
              <p className="text-sm text-[var(--color-gs-text-muted)] max-w-md mx-auto">
                has successfully demonstrated proficiency in <span className="text-white font-bold">{quiz.skill_name}</span> by achieving a passing score of <span className="text-white font-bold">{Math.round(percentage)}%</span> on the standard comprehensive assessment.
              </p>

              <div className="pt-6 flex justify-around items-center border-t border-white/10 text-xs text-[var(--color-gs-text-muted)]">
                <div>
                  <div className="font-bold text-white">{tierInfo?.label} Tier</div>
                  <div>Badge Level</div>
                </div>
                <div>
                  <div className="font-bold text-white">{new Date().toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                  <div>Issued Date</div>
                </div>
                <div>
                  <div className="font-bold text-[var(--color-gs-cyan)]">VERIFIED</div>
                  <div>Status</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Question Review ──────────────────────────────────────── */}
      <div className="bg-[var(--color-gs-card)] border border-[var(--color-gs-border)] rounded-3xl p-6 md:p-8 space-y-6">
        <h2 className="text-xl font-black font-heading text-[var(--color-gs-text-main)]">
          Question Review
        </h2>
        <div className="space-y-4">
          {questions.map((q, idx) => {
            const userAns = answers[q.id];
            const isCorrect = userAns && String(userAns).trim().toLowerCase() === String(q.correct_answer).trim().toLowerCase();

            return (
              <div
                key={q.id}
                className={`p-5 rounded-2xl border transition-all ${
                  isCorrect
                    ? 'border-emerald-500/20 bg-emerald-500/5'
                    : 'border-rose-500/20 bg-rose-500/5'
                }`}
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <span className="font-bold text-sm text-[var(--color-gs-text-main)]">
                    <span className="text-[var(--color-gs-cyan)] mr-2">Q{idx + 1}.</span>
                    {q.question_text}
                  </span>
                  {isCorrect ? (
                    <span className="flex items-center gap-1 text-xs font-bold text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full shrink-0">
                      <Check size={12} /> Correct
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-xs font-bold text-rose-400 bg-rose-400/10 px-2 py-0.5 rounded-full shrink-0">
                      <X size={12} /> Incorrect
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs mt-3">
                  <div className="p-3 bg-[var(--color-gs-bg)] rounded-xl border border-[var(--color-gs-border)]">
                    <span className="text-[var(--color-gs-text-muted)] block mb-1">Your Answer:</span>
                    <span className={isCorrect ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                      {userAns || 'No answer provided'}
                    </span>
                  </div>
                  <div className="p-3 bg-[var(--color-gs-bg)] rounded-xl border border-[var(--color-gs-border)]">
                    <span className="text-[var(--color-gs-text-muted)] block mb-1">Correct Answer:</span>
                    <span className="text-emerald-400 font-bold">{q.correct_answer}</span>
                  </div>
                </div>

                {q.explanation && (
                  <div className="mt-3 text-xs text-[var(--color-gs-text-muted)] bg-[var(--color-gs-bg)]/40 p-3 rounded-xl border border-white/5">
                    <span className="font-bold text-[var(--color-gs-cyan)] mr-1">Explanation:</span>
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
