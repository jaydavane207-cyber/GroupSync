import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Filter, Search, Clock, Award, ChevronRight, Loader2, AlertCircle, RefreshCw, Star, Zap, Shield } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { browseQuizzes, getQuizHistory, getUserBadges, getBadgeTier } from '../lib/quizService';
import { withRetry } from '../lib/withRetry';

// ─── Difficulty badge ──────────────────────────────────────────────────────────
const DIFF_CONFIG = {
  beginner:     { color: 'text-emerald-400', bg: 'bg-emerald-400/10 border-emerald-400/30', label: 'Beginner' },
  intermediate: { color: 'text-amber-400',   bg: 'bg-amber-400/10 border-amber-400/30',   label: 'Intermediate' },
  advanced:     { color: 'text-red-400',      bg: 'bg-red-400/10 border-red-400/30',       label: 'Advanced' },
};

function DiffBadge({ difficulty }) {
  const cfg = DIFF_CONFIG[difficulty] || DIFF_CONFIG.beginner;
  return (
    <span className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full border ${cfg.bg} ${cfg.color}`}>
      {cfg.label}
    </span>
  );
}

// ─── Quiz Card ─────────────────────────────────────────────────────────────────
function QuizCard({ quiz, attempt, onStart }) {
  const navigate = useNavigate();
  const isPassed = attempt?.passed;
  const hasAttempt = !!attempt;
  const tierInfo = attempt?.percentage != null ? getBadgeTier(attempt.percentage) : null;

  const handleClick = () => {
    if (attempt?.status === 'in_progress' || attempt?.status === 'paused') {
      navigate(`/quiz/${quiz.id}/take`, { state: { resumeAttemptId: attempt.id } });
    } else {
      navigate(`/quiz/${quiz.id}/take`);
    }
  };

  return (
    <div className="bg-[var(--color-gs-card)] border border-[var(--color-gs-border)] rounded-3xl p-6 flex flex-col gap-4 hover:border-[var(--color-gs-cyan)]/40 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(0,240,255,0.08)]">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[var(--color-gs-cyan)]/20 to-[var(--color-gs-secondary)]/20 border border-[var(--color-gs-border)] flex items-center justify-center text-2xl shrink-0">
          {quiz.skill_name === 'JavaScript' ? '⚡' :
           quiz.skill_name === 'React' ? '⚛️' :
           quiz.skill_name === 'Python' ? '🐍' :
           quiz.skill_name === 'SQL' ? '🗄️' : '🧠'}
        </div>
        <div className="flex flex-col items-end gap-1.5">
          <DiffBadge difficulty={quiz.difficulty} />
          {tierInfo && (
            <span className="text-sm">{tierInfo.emoji}</span>
          )}
        </div>
      </div>

      {/* Title & description */}
      <div>
        <h3 className="font-bold text-[var(--color-gs-text-main)] font-heading">{quiz.title}</h3>
        <p className="text-xs text-[var(--color-gs-text-muted)] mt-1 line-clamp-2">{quiz.description}</p>
      </div>

      {/* Meta */}
      <div className="flex items-center gap-3 text-xs text-[var(--color-gs-text-muted)]">
        <span className="flex items-center gap-1"><Clock size={11} />{quiz.duration_minutes} min</span>
        <span className="flex items-center gap-1"><BookOpen size={11} />{quiz.total_questions} questions</span>
        <span className="flex items-center gap-1"><Star size={11} />Pass: {quiz.passing_score}%</span>
      </div>

      {/* Tags */}
      {quiz.tags?.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {quiz.tags.slice(0, 3).map(tag => (
            <span key={tag} className="px-2 py-0.5 text-[10px] bg-[var(--color-gs-bg)] border border-[var(--color-gs-border)] rounded-full text-[var(--color-gs-text-muted)]">
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Previous result */}
      {hasAttempt && isPassed && (
        <div className="flex items-center gap-2 px-3 py-2 bg-emerald-400/10 border border-emerald-400/20 rounded-xl text-xs text-emerald-400">
          <Award size={12} />
          Best score: {Math.round(attempt.percentage)}% {tierInfo?.emoji}
        </div>
      )}
      {hasAttempt && !isPassed && attempt.status === 'completed' && (
        <div className="flex items-center gap-2 px-3 py-2 bg-red-400/10 border border-red-400/20 rounded-xl text-xs text-red-400">
          <AlertCircle size={12} />
          Last score: {Math.round(attempt.percentage)}% — Try again!
        </div>
      )}
      {attempt?.status === 'in_progress' && (
        <div className="flex items-center gap-2 px-3 py-2 bg-amber-400/10 border border-amber-400/20 rounded-xl text-xs text-amber-400">
          <Clock size={12} />
          In progress — Resume where you left off
        </div>
      )}

      {/* CTA */}
      <button
        onClick={handleClick}
        className="mt-auto flex items-center justify-center gap-2 w-full py-3 bg-gradient-to-r from-[var(--color-gs-cyan)] to-[var(--color-gs-secondary)] text-white font-bold rounded-2xl hover:opacity-90 transition-opacity text-sm shadow-[0_4px_15px_rgba(0,240,255,0.2)]"
      >
        {attempt?.status === 'in_progress' ? 'Resume Quiz' :
         attempt?.status === 'paused' ? 'Resume Quiz' :
         isPassed ? 'Retake Quiz' : 'Start Quiz'}
        <ChevronRight size={16} />
      </button>
    </div>
  );
}

// ─── QuizPage ──────────────────────────────────────────────────────────────────
export default function QuizPage() {
  const { user } = useAppContext();
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState([]);
  const [attempts, setAttempts] = useState({}); // { quizId: bestAttempt }
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [filterDiff, setFilterDiff] = useState('all');
  const [filterSkill, setFilterSkill] = useState('');

  const fetchData = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    setError(null);

    const [quizResult, historyResult, badgeResult] = await Promise.all([
      browseQuizzes(),
      getQuizHistory(user.id),
      getUserBadges(user.id),
    ]);

    if (quizResult.error) {
      setError(quizResult.error.userMessage || 'Could not load quizzes.');
      setLoading(false);
      return;
    }

    setQuizzes(quizResult.data || []);
    setBadges(badgeResult.data || []);

    // Build attempts map: { quizId: best completed attempt or active attempt }
    if (historyResult.data) {
      const map = {};
      for (const a of historyResult.data) {
        const existing = map[a.quiz_id];
        if (!existing || (a.percentage || 0) > (existing.percentage || 0)) {
          map[a.quiz_id] = a;
        }
      }
      setAttempts(map);
    }
    setLoading(false);
  }, [user?.id]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const filtered = quizzes.filter(q => {
    const matchSearch = !search || q.title.toLowerCase().includes(search.toLowerCase()) || q.skill_name.toLowerCase().includes(search.toLowerCase());
    const matchDiff = filterDiff === 'all' || q.difficulty === filterDiff;
    return matchSearch && matchDiff;
  });

  const totalBadges = badges.length;
  const passedQuizzes = Object.values(attempts).filter(a => a.passed).length;

  return (
    <div className="space-y-8 animate-[load-fade-up_0.4s_ease-out]">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black font-heading text-[var(--color-gs-text-main)] tracking-tight">
            Skill <span className="text-[var(--color-gs-cyan)]">Verification</span>
          </h1>
          <p className="text-[var(--color-gs-text-muted)] mt-1">Prove your skills with timed quizzes and earn verified badges.</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={() => navigate('/badges')}
            className="flex items-center gap-2 px-4 py-2.5 bg-[var(--color-gs-card)] border border-[var(--color-gs-border)] rounded-2xl text-sm font-bold text-[var(--color-gs-text-main)] hover:border-[var(--color-gs-cyan)]/40 transition-colors"
          >
            <Award size={16} className="text-[var(--color-gs-cyan)]" />
            My Badges
            {totalBadges > 0 && <span className="px-1.5 py-0.5 text-[10px] bg-[var(--color-gs-cyan)] text-[#0f172a] rounded-full font-black">{totalBadges}</span>}
          </button>
          <button
            onClick={() => navigate('/profile')}
            className="flex items-center gap-2 px-4 py-2.5 bg-[var(--color-gs-card)] border border-[var(--color-gs-border)] rounded-2xl text-sm font-bold text-[var(--color-gs-text-main)] hover:border-[var(--color-gs-cyan)]/40 transition-colors"
          >
            <Shield size={16} className="text-[var(--color-gs-secondary)]" />
            Certificates
          </button>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Quizzes Available', value: quizzes.length, icon: BookOpen, color: 'text-[var(--color-gs-cyan)]' },
          { label: 'Quizzes Passed', value: passedQuizzes, icon: Zap, color: 'text-emerald-400' },
          { label: 'Badges Earned', value: totalBadges, icon: Award, color: 'text-amber-400' },
          { label: 'Best Score', value: Object.values(attempts).length > 0 ? `${Math.round(Math.max(...Object.values(attempts).map(a => a.percentage || 0)))}%` : '—', icon: Star, color: 'text-[var(--color-gs-secondary)]' },
        ].map(stat => (
          <div key={stat.label} className="bg-[var(--color-gs-card)] border border-[var(--color-gs-border)] rounded-2xl p-4">
            <stat.icon size={20} className={`${stat.color} mb-2`} />
            <div className={`text-2xl font-black font-heading ${stat.color}`}>{stat.value}</div>
            <div className="text-xs text-[var(--color-gs-text-muted)] mt-0.5">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-48">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-gs-text-muted)]" />
          <input
            type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search quizzes..."
            className="w-full bg-[var(--color-gs-card)] border border-[var(--color-gs-border)] rounded-xl pl-9 pr-4 py-2.5 text-sm outline-none focus:border-[var(--color-gs-cyan)] text-[var(--color-gs-text-main)] placeholder-[var(--color-gs-text-muted)]"
          />
        </div>
        <div className="flex gap-2">
          {['all', 'beginner', 'intermediate', 'advanced'].map(d => (
            <button key={d} onClick={() => setFilterDiff(d)}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-colors ${filterDiff === d ? 'bg-[var(--color-gs-cyan)] text-[#0f172a]' : 'bg-[var(--color-gs-card)] border border-[var(--color-gs-border)] text-[var(--color-gs-text-muted)] hover:border-[var(--color-gs-cyan)]/40'}`}>
              {d.charAt(0).toUpperCase() + d.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="flex items-center justify-between p-4 bg-red-500/10 border border-red-500/30 rounded-2xl text-red-400">
          <div className="flex items-center gap-2 text-sm"><AlertCircle size={16} />{error}</div>
          <button onClick={fetchData} className="flex items-center gap-1 text-xs hover:text-red-300"><RefreshCw size={12} />Retry</button>
        </div>
      )}

      {/* Loading skeleton */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="h-72 bg-[var(--color-gs-card)] border border-[var(--color-gs-border)] rounded-3xl animate-pulse" />
          ))}
        </div>
      )}

      {/* Quiz grid */}
      {!loading && !error && (
        <>
          {filtered.length === 0 ? (
            <div className="text-center py-20 text-[var(--color-gs-text-muted)]">
              <BookOpen size={48} className="mx-auto mb-4 opacity-30" />
              <p className="text-lg font-bold mb-1">No quizzes found</p>
              <p className="text-sm">{search || filterDiff !== 'all' ? 'Try adjusting your filters.' : 'Quizzes will appear here once added.'}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filtered.map(q => (
                <QuizCard key={q.id} quiz={q} attempt={attempts[q.id] || null} onStart={() => navigate(`/quiz/${q.id}/take`)} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
