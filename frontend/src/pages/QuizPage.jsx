import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Filter, Search, Clock, Award, ChevronRight, Loader2, AlertCircle, RefreshCw, Star, Zap, Shield, CheckCircle2 } from 'lucide-react';
import { useAppContext } from '@/context/AppContext';
import { browseQuizzes, getQuizHistory, getUserBadges, getBadgeTier } from '@/lib/services/quizService';
import { withRetry } from '@/lib/withRetry';

// ─── Difficulty badge ──────────────────────────────────────────────────────────
const DIFF_CONFIG = {
  beginner:     { color: 'text-emerald-500', bg: 'bg-emerald-500/10 border-emerald-500/20', label: 'Beginner' },
  intermediate: { color: 'text-amber-500',   bg: 'bg-amber-500/10 border-amber-500/20',   label: 'Intermediate' },
  advanced:     { color: 'text-rose-500',    bg: 'bg-rose-500/10 border-rose-500/20',     label: 'Advanced' },
};

function DiffBadge({ difficulty }) {
  const cfg = DIFF_CONFIG[difficulty] || DIFF_CONFIG.beginner;
  return (
    <span className={`px-2 py-0.5 text-[11px] font-medium rounded-md border ${cfg.bg} ${cfg.color}`}>
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
    <div className="glass-card rounded-xl p-5 flex flex-col justify-between hover:border-gs-border/80 transition-colors shadow-xs">
      <div>
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3.5">
          <div className="w-9 h-9 rounded-lg bg-black/5 dark:bg-white/5 border border-gs-border flex items-center justify-center text-xs font-semibold text-gs-text-muted shrink-0">
            {quiz.skill_name === 'JavaScript' ? 'JS' :
             quiz.skill_name === 'React' ? 'React' :
             quiz.skill_name === 'Python' ? 'Py' :
             quiz.skill_name === 'SQL' ? 'SQL' : 'Code'}
          </div>
          <div className="flex flex-col items-end gap-1">
            <DiffBadge difficulty={quiz.difficulty} />
            {tierInfo && (
              <span className="flex items-center gap-1 text-[11px] font-medium text-amber-500">
                <Award size={12} />
                {tierInfo.tier}
              </span>
            )}
          </div>
        </div>

        {/* Title & description */}
        <div className="mb-3">
          <h3 className="font-semibold text-sm text-gs-text-main font-heading">{quiz.title}</h3>
          <p className="text-xs text-gs-text-muted mt-1 line-clamp-2 leading-relaxed">{quiz.description}</p>
        </div>

        {/* Meta */}
        <div className="flex items-center gap-3 text-xs text-gs-text-muted mb-3.5">
          <span className="flex items-center gap-1"><Clock size={12} />{quiz.duration_minutes} min</span>
          <span className="flex items-center gap-1"><BookOpen size={12} />{quiz.total_questions} questions</span>
          <span className="flex items-center gap-1"><Star size={12} />Pass: {quiz.passing_score}%</span>
        </div>

        {/* Tags */}
        {quiz.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3.5">
            {quiz.tags.slice(0, 3).map(tag => (
              <span key={tag} className="px-2 py-0.5 text-[10px] bg-black/5 dark:bg-white/5 border border-gs-border rounded-md text-gs-text-muted font-medium">
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Previous result */}
        {hasAttempt && isPassed && (
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-xs text-emerald-500 mb-3.5">
            <Award size={13} />
            <span>Passed: {Math.round(attempt.percentage)}% score</span>
          </div>
        )}
        {hasAttempt && !isPassed && attempt.status === 'completed' && (
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-rose-500/10 border border-rose-500/20 rounded-lg text-xs text-rose-400 mb-3.5">
            <AlertCircle size={13} />
            <span>Last score: {Math.round(attempt.percentage)}% — Retake available</span>
          </div>
        )}
        {attempt?.status === 'in_progress' && (
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-amber-500/10 border border-amber-500/20 rounded-lg text-xs text-amber-500 mb-3.5">
            <Clock size={13} />
            <span>In progress — Resume anytime</span>
          </div>
        )}
      </div>

      {/* CTA */}
      <button
        onClick={handleClick}
        className="w-full py-2 bg-gradient-to-r from-[#7c6af6] to-[#a78bfa] hover:from-[#6155e0] hover:to-[#9178f4] text-white font-medium rounded-lg transition-colors text-xs shadow-xs flex items-center justify-center gap-1 cursor-pointer btn-tactile"
      >
        {attempt?.status === 'in_progress' ? 'Resume Quiz' :
         attempt?.status === 'paused' ? 'Resume Quiz' :
         isPassed ? 'Retake Quiz' : 'Start Assessment'}
        <ChevronRight size={14} />
      </button>
    </div>
  );
}

// ─── QuizPage ──────────────────────────────────────────────────────────────────
export default function QuizPage() {
  const { user } = useAppContext();
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState([]);
  const [attempts, setAttempts] = useState({});
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [filterDiff, setFilterDiff] = useState('all');

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
    <div className="space-y-8 animate-[load-fade-up_0.3s_ease-out]">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-2 border-b border-gs-border/60">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#7c6af6]/15 border border-[#7c6af6]/30 text-[#9182f8] text-xs font-medium mb-2">
            <BookOpen size={12} />
            Academic Skill Assessments
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gs-text-main font-heading tracking-tight">
            Skill Quizzes & Verification
          </h1>
          <p className="text-gs-text-muted mt-1 text-sm leading-relaxed">
            Prove your proficiencies through timed technical quizzes and earn verified campus badges.
          </p>
        </div>
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => navigate('/badges')}
            className="flex items-center gap-2 px-3 py-1.5 glass-card rounded-lg text-xs font-medium text-gs-text-main hover:bg-black/5 dark:hover:bg-white/5 transition-colors shadow-xs cursor-pointer"
          >
            <Award size={14} className="text-[#9182f8]" />
            My Badges
            {totalBadges > 0 && <span className="px-1.5 py-0.2 text-[10px] bg-[#6D6AF6] text-white rounded-full font-semibold">{totalBadges}</span>}
          </button>
          <button
            onClick={() => navigate('/profile')}
            className="flex items-center gap-2 px-3 py-1.5 glass-card rounded-lg text-xs font-medium text-gs-text-main hover:bg-black/5 dark:hover:bg-white/5 transition-colors shadow-xs cursor-pointer"
          >
            <Shield size={14} className="text-[#9182f8]" />
            Certificates
          </button>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Quizzes Available', value: quizzes.length, icon: BookOpen, tint: 'bg-[#6D6AF6]/10 text-[#9182f8]' },
          { label: 'Quizzes Passed', value: passedQuizzes, icon: CheckCircle2, tint: 'bg-emerald-500/10 text-emerald-500' },
          { label: 'Badges Earned', value: totalBadges, icon: Award, tint: 'bg-amber-500/10 text-amber-500' },
          { label: 'Best Quiz Score', value: Object.values(attempts).length > 0 ? `${Math.round(Math.max(...Object.values(attempts).map(a => a.percentage || 0)))}%` : '—', icon: Star, tint: 'bg-[#6D6AF6]/10 text-[#9182f8]' },
        ].map(stat => (
          <div key={stat.label} className="glass-card rounded-xl p-4 shadow-xs">
            <div className={`w-7 h-7 rounded-md ${stat.tint} flex items-center justify-center mb-3`}>
              <stat.icon size={15} />
            </div>
            <div className="text-2xl font-semibold tracking-tight text-gs-text-main font-heading tabular-nums">{stat.value}</div>
            <div className="text-xs text-gs-text-muted mt-0.5">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-48">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gs-text-muted" />
          <input
            type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search quizzes by language or stack (Python, React, SQL)..."
            className="w-full glass-card rounded-lg pl-9 pr-4 py-2 text-xs outline-none focus:border-[#7c6af6] text-gs-text-main placeholder-gs-text-muted"
          />
        </div>
        <div className="flex gap-1.5">
          {['all', 'beginner', 'intermediate', 'advanced'].map(d => (
            <button key={d} onClick={() => setFilterDiff(d)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${filterDiff === d ? 'bg-[#6D6AF6] text-white shadow-xs' : 'border border-gs-border text-gs-text-muted hover:text-gs-text-main hover:bg-black/5 dark:hover:bg-white/5'}`}>
              {d.charAt(0).toUpperCase() + d.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="flex items-center justify-between p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-xs">
          <div className="flex items-center gap-2 font-medium"><AlertCircle size={15} />{error}</div>
          <button onClick={fetchData} className="flex items-center gap-1 hover:underline"><RefreshCw size={12} />Retry</button>
        </div>
      )}

      {/* Loading skeleton */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="h-64 glass-card rounded-xl animate-pulse" />
          ))}
        </div>
      )}

      {/* Quiz grid */}
      {!loading && !error && (
        <>
          {filtered.length === 0 ? (
            <div className="text-center py-16 glass-card rounded-xl p-8">
              <BookOpen size={32} className="mx-auto mb-3 text-gs-text-muted opacity-40" />
              <p className="text-base font-semibold text-gs-text-main mb-1">No quizzes found</p>
              <p className="text-xs text-gs-text-muted">{search || filterDiff !== 'all' ? 'Try adjusting your filters.' : 'Quizzes will appear here once added.'}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
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


