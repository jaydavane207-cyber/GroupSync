import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Bot, 
  FolderKanban, 
  UserPlus, 
  Award, 
  ArrowRight, 
  Clock, 
  Calendar, 
  CheckCircle2, 
  BarChart3, 
  ChevronRight, 
  ShieldCheck,
  TrendingUp,
  Target
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '@/context/AppContext';
import { seedDatabase } from '@/lib/seeddata';
import { SkillBadge } from '@/components/badges/SkillBadge';
import supabase from '@/lib/supabase';
import { withRetry } from '@/lib/withRetry';

export default function DashboardPage() {
  const { user, factions, stats: liveStats, refreshGroups, refreshStats, showToast } = useAppContext();
  const navigate = useNavigate();
  const [isSeeding, setIsSeeding] = useState(false);
  const [upcomingDeadlines, setUpcomingDeadlines] = useState<any[]>([]);
  const [deadlinesLoading, setDeadlinesLoading] = useState(true);

  // â”€â”€ Fetch upcoming project deadlines â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  useEffect(() => {
    const fetchDeadlines = async () => {
      setDeadlinesLoading(true);
      const today = new Date().toISOString().split('T')[0];
      const { data, error } = await withRetry(() =>
        supabase
          .from('projects')
          .select('id, title, deadline, timeline, prize_pool, organizer_name')
          .gte('deadline', today)
          .order('deadline', { ascending: true })
          .limit(4)
      );
      if (!error && data) {
        setUpcomingDeadlines(data.map((p: any) => {
          const daysLeft = Math.max(0, Math.ceil(
            (new Date(p.deadline).getTime() - Date.now()) / 86400000
          ));
          return {
            id: p.id,
            title: p.title,
            date: new Date(p.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            daysLeft,
            domain: p.organizer_name || 'Campus Hackathon',
            prize: p.prize_pool || 'Certificate',
          };
        }));
      }
      setDeadlinesLoading(false);
    };
    fetchDeadlines();
  }, []);

  // â”€â”€ XP-based credibility score â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const xp = user?.xp || 0;
  const credibilityScore = Math.min(100, Math.round((xp / 2000) * 100));
  const credibilityLabel = credibilityScore >= 80 ? 'Elite' : credibilityScore >= 50 ? 'Advanced' : credibilityScore >= 25 ? 'Contributor' : 'Apprentice';

  if (!user) return null;

  const handleSeed = async () => {
    setIsSeeding(true);
    const result = await seedDatabase(user);
    if (result.success) {
      showToast('Database seeded with campus data!', 'success');
      if (refreshGroups) await refreshGroups();
      if (refreshStats) await refreshStats();
    } else {
      showToast(result.error || 'Seeding failed. Ensure SQL tables are created.', 'error');
    }
    setIsSeeding(false);
  };

  const userSkills = user.skills && user.skills.length > 0 
    ? user.skills 
    : ['React', 'Python', 'Node.js', 'UI/UX Design'];

  return (
    <div className="space-y-6 pb-12">
      {/* â”€â”€ Headline â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-1">
        <div>
          <h1 className="text-2xl sm:text-[28px] font-semibold text-gs-text-main tracking-tight leading-tight">
            Welcome back, {user.name}
          </h1>
          <p className="text-gs-text-muted mt-1 text-sm">
            Here is what's happening across your teams, projects, and credentials today.
          </p>
        </div>

        {import.meta.env.DEV && (liveStats?.activeGroups === 0) && (
          <button 
            onClick={handleSeed}
            disabled={isSeeding}
            className="px-3.5 py-1.5 bg-gs-card border border-gs-border text-gs-text-muted hover:text-gs-text-main font-medium rounded-lg hover:border-gs-border-hover transition-colors flex items-center gap-1.5 text-xs shadow-xs btn-tactile"
          >
            {isSeeding ? 'Seeding...' : 'Seed mock data'}
          </button>
        )}
      </header>

      {/* â”€â”€ 4 Premium Stat Cards â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Stat 1: Active Teams */}
        <div className="bg-gs-card border border-gs-border rounded-xl p-5 hover:border-gs-border-hover transition-colors machined-edge flex flex-col justify-between">
          <div className="flex justify-between items-start mb-3">
            <div className="w-8 h-8 rounded-lg bg-[#6D6AF6]/10 flex items-center justify-center text-[#6D6AF6]">
              <Users size={16} />
            </div>
            <span className="text-xs font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
              +3 this week
            </span>
          </div>
          <div>
            <div className="text-3xl font-semibold tabular-nums text-gs-text-main tracking-tight">
              {liveStats?.activeGroups || 12}
            </div>
            <div className="mt-1 text-xs text-gs-text-muted font-medium">
              Active teams & squads
            </div>
          </div>
        </div>

        {/* Stat 2: Open Projects */}
        <div className="bg-gs-card border border-gs-border rounded-xl p-5 hover:border-gs-border-hover transition-colors machined-edge flex flex-col justify-between">
          <div className="flex justify-between items-start mb-3">
            <div className="w-8 h-8 rounded-lg bg-[#6D6AF6]/10 flex items-center justify-center text-[#6D6AF6]">
              <FolderKanban size={16} />
            </div>
            <span className="text-xs font-medium text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full">
              2 closing soon
            </span>
          </div>
          <div>
            <div className="text-3xl font-semibold tabular-nums text-gs-text-main tracking-tight">
              {liveStats?.openHackathons || 6}
            </div>
            <div className="mt-1 text-xs text-gs-text-muted font-medium">
              Open campus projects
            </div>
          </div>
        </div>

        {/* Stat 3: Online Peers */}
        <div className="bg-gs-card border border-gs-border rounded-xl p-5 hover:border-gs-border-hover transition-colors machined-edge flex flex-col justify-between">
          <div className="flex justify-between items-start mb-3">
            <div className="w-8 h-8 rounded-lg bg-[#6D6AF6]/10 flex items-center justify-center text-[#6D6AF6]">
              <UserPlus size={16} />
            </div>
            <span className="text-xs font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
              Live campus
            </span>
          </div>
          <div>
            <div className="text-3xl font-semibold tabular-nums text-gs-text-main tracking-tight">
              {liveStats?.onlineMembers || 24}
            </div>
            <div className="mt-1 text-xs text-gs-text-muted font-medium">
              Online collaborators
            </div>
          </div>
        </div>

        {/* Stat 4: AI Matches */}
        <div className="bg-gs-card border border-gs-border rounded-xl p-5 hover:border-gs-border-hover transition-colors machined-edge flex flex-col justify-between">
          <div className="flex justify-between items-start mb-3">
            <div className="w-8 h-8 rounded-lg bg-[#6D6AF6]/10 flex items-center justify-center text-[#6D6AF6]">
              <Bot size={16} />
            </div>
            <span className="text-xs font-medium text-[#7E7BF8] bg-[#6D6AF6]/10 border border-[#6D6AF6]/20 px-2 py-0.5 rounded-full">
              Ready to review
            </span>
          </div>
          <div>
            <div className="text-3xl font-semibold tabular-nums text-gs-text-main tracking-tight">
              {liveStats?.aiMatches || 8}
            </div>
            <div className="mt-1 text-xs text-gs-text-muted font-medium">
              Synergy matches
            </div>
          </div>
        </div>
      </div>

      {/* â”€â”€ Quick Actions â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <button
          onClick={() => navigate('/teams')}
          className="p-4 rounded-xl border border-gs-border bg-gs-card hover:border-gs-border-hover transition-colors text-left group btn-tactile"
        >
          <div className="w-8 h-8 rounded-lg bg-[#6D6AF6]/10 flex items-center justify-center text-[#6D6AF6] mb-3">
            <Users size={16} />
          </div>
          <p className="font-semibold text-xs text-gs-text-main group-hover:text-[#6D6AF6] transition-colors">
            Browse teams
          </p>
          <p className="text-[11px] text-gs-text-muted mt-0.5">Explore open campus squads</p>
        </button>

        <button
          onClick={() => navigate('/projects')}
          className="p-4 rounded-xl border border-gs-border bg-gs-card hover:border-gs-border-hover transition-colors text-left group btn-tactile"
        >
          <div className="w-8 h-8 rounded-lg bg-[#6D6AF6]/10 flex items-center justify-center text-[#6D6AF6] mb-3">
            <FolderKanban size={16} />
          </div>
          <p className="font-semibold text-xs text-gs-text-main group-hover:text-[#6D6AF6] transition-colors">
            Find projects
          </p>
          <p className="text-[11px] text-gs-text-muted mt-0.5">Hackathons & capstone bounties</p>
        </button>

        <button
          onClick={() => navigate('/ai')}
          className="p-4 rounded-xl border border-gs-border bg-gs-card hover:border-gs-border-hover transition-colors text-left group btn-tactile"
        >
          <div className="w-8 h-8 rounded-lg bg-[#6D6AF6]/10 flex items-center justify-center text-[#6D6AF6] mb-3">
            <Bot size={16} />
          </div>
          <p className="font-semibold text-xs text-gs-text-main group-hover:text-[#6D6AF6] transition-colors">
            Team matching
          </p>
          <p className="text-[11px] text-gs-text-muted mt-0.5">Skill-gap recommendations</p>
        </button>

        <button
          onClick={() => navigate('/friends')}
          className="p-4 rounded-xl border border-gs-border bg-gs-card hover:border-gs-border-hover transition-colors text-left group btn-tactile"
        >
          <div className="w-8 h-8 rounded-lg bg-[#6D6AF6]/10 flex items-center justify-center text-[#6D6AF6] mb-3">
            <UserPlus size={16} />
          </div>
          <p className="font-semibold text-xs text-gs-text-main group-hover:text-[#6D6AF6] transition-colors">
            Peer directory
          </p>
          <p className="text-[11px] text-gs-text-muted mt-0.5">Connect with verified peers</p>
        </button>
      </div>

      {/* â”€â”€ Two Column: Deadlines & Verified Credentials â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        
        {/* Upcoming Deadlines Widget */}
        <div className="bg-gs-card border border-gs-border rounded-xl p-5 hover:border-gs-border-hover transition-colors machined-edge flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-gs-text-main flex items-center gap-2">
                <Calendar className="text-[#6D6AF6]" size={16} /> Upcoming deadlines
              </h2>
              <button 
                onClick={() => navigate('/projects')}
                className="text-xs font-medium text-[#6D6AF6] hover:underline flex items-center gap-1"
              >
                View all <ArrowRight size={12} />
              </button>
            </div>

            <div className="divide-y divide-gs-border">
              {deadlinesLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="py-3 animate-pulse">
                    <div className="h-4 bg-white/5 rounded w-3/4 mb-1.5" />
                    <div className="h-3 bg-white/5 rounded w-1/3" />
                  </div>
                ))
              ) : upcomingDeadlines.length === 0 ? (
                <div className="text-center py-8 text-gs-text-muted text-xs">
                  <p>No active project deadlines.</p>
                  <button onClick={() => navigate('/projects')}
                    className="text-[#6D6AF6] font-medium text-xs mt-1.5 hover:underline">
                    Browse projects â†’
                  </button>
                </div>
              ) : (
                upcomingDeadlines.map((item: any, idx: number) => {
                  const isUrgent = item.daysLeft <= 3;
                  return (
                    <div 
                      key={item.id || idx} 
                      className="py-3 flex items-center justify-between gap-4 cursor-pointer hover:bg-white/[0.02] -mx-2 px-2 rounded-lg transition-colors"
                      onClick={() => navigate('/projects')}
                    >
                      <div className="min-w-0">
                        <h4 className="font-semibold text-xs text-gs-text-main truncate">{item.title}</h4>
                        <p className="text-[11px] text-gs-text-muted mt-0.5 truncate">
                          {item.domain} Â· Due {item.date}
                        </p>
                      </div>
                      <div className="shrink-0 text-right">
                        <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full border ${
                          isUrgent 
                            ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' 
                            : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                        }`}>
                          {item.daysLeft === 0 ? 'Today' : `${item.daysLeft}d left`}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="mt-4 pt-3.5 border-t border-gs-border flex items-center justify-between text-[11px] text-gs-text-muted">
            <span>Synchronized with campus hackathons</span>
            <span className="text-emerald-400 flex items-center gap-1 font-medium">
              <CheckCircle2 size={12} /> Active
            </span>
          </div>
        </div>

        {/* Skill Credentials & Credibility Showcase */}
        <div className="bg-gs-card border border-gs-border rounded-xl p-5 hover:border-gs-border-hover transition-colors machined-edge flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-gs-text-main flex items-center gap-2">
                <Award className="text-[#6D6AF6]" size={16} /> Verified credentials
              </h2>
              <button 
                onClick={() => navigate('/badges')}
                className="text-xs font-medium text-[#6D6AF6] hover:underline flex items-center gap-1"
              >
                All badges <ArrowRight size={12} />
              </button>
            </div>

            {/* Clean Skill Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-4">
              <SkillBadge level="platinum" skill={userSkills[0] || 'React'} score={96} />
              <SkillBadge level="gold" skill={userSkills[1] || 'Python'} score={89} />
            </div>

            {/* Credibility Score Summary (Single Slim Accent Progress Bar) */}
            <div className="p-4 rounded-xl border border-gs-border bg-gs-elevated">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-gs-text-muted flex items-center gap-1.5">
                  <BarChart3 size={13} className="text-[#6D6AF6]" /> Credibility index
                </span>
                <span className="text-xs font-semibold text-gs-text-main">
                  {credibilityScore} / 100
                  <span className="ml-1.5 text-[11px] font-medium text-[#6D6AF6]">({credibilityLabel})</span>
                </span>
              </div>
              
              {/* Single slim progress bar in accent color */}
              <div className="w-full bg-white/[0.06] rounded-full h-1.5 overflow-hidden mb-3">
                <div
                  className="h-full bg-[#6D6AF6] rounded-full transition-all duration-300"
                  style={{ width: `${credibilityScore}%` }}
                />
              </div>

              {/* Labeled segments below */}
              <div className="grid grid-cols-4 gap-2 pt-2 border-t border-gs-border/60 text-center">
                <div>
                  <p className="text-[10px] text-gs-text-muted">Quizzes</p>
                  <p className="text-xs font-semibold text-gs-text-main mt-0.5">38/40</p>
                </div>
                <div>
                  <p className="text-[10px] text-gs-text-muted">Certs</p>
                  <p className="text-xs font-semibold text-gs-text-main mt-0.5">28/35</p>
                </div>
                <div>
                  <p className="text-[10px] text-gs-text-muted">Endorsements</p>
                  <p className="text-xs font-semibold text-gs-text-main mt-0.5">18/20</p>
                </div>
                <div>
                  <p className="text-[10px] text-gs-text-muted">Projects</p>
                  <p className="text-xs font-semibold text-gs-text-main mt-0.5">5/5</p>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* â”€â”€ Team Synergy & Proficiencies â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <div className="bg-gs-card border border-gs-border rounded-xl p-5 hover:border-gs-border-hover transition-colors machined-edge">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <ShieldCheck className="text-[#6D6AF6]" size={16} />
              <h2 className="text-sm font-semibold text-gs-text-main">
                Team synergy & proficiencies
              </h2>
            </div>
            <p className="text-xs text-gs-text-muted">
              Summary of your verified skill stack, role recommendations, and milestones.
            </p>
          </div>
          <button
            onClick={() => navigate('/quiz')}
            className="px-3 py-1.5 border border-gs-border rounded-lg text-xs font-medium text-gs-text-main hover:bg-white/[0.04] hover:border-gs-border-hover transition-colors shrink-0 btn-tactile"
          >
            Take skill quiz
          </button>
        </div>

        {/* 3 Clean Columns */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* Your Verified Proficiencies */}
          <div className="p-4 rounded-xl border border-gs-border bg-gs-elevated flex flex-col justify-between">
            <div>
              <span className="text-xs font-medium text-gs-text-muted mb-2.5 block">
                Your verified skills
              </span>
              <div className="space-y-2">
                {userSkills.slice(0, 4).map((skill: string) => (
                  <div key={skill} className="flex items-center justify-between p-2 rounded-lg bg-gs-card border border-gs-border text-xs">
                    <span className="font-medium text-gs-text-main">{skill}</span>
                    <span className="text-[10px] font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded-full">
                      Verified
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <p className="text-[11px] text-gs-text-muted mt-3 pt-2.5 border-t border-gs-border">
              Backed by standardized quiz scores.
            </p>
          </div>

          {/* Recommended Squad Roles */}
          <div className="p-4 rounded-xl border border-gs-border bg-gs-elevated flex flex-col justify-between">
            <div>
              <span className="text-xs font-medium text-gs-text-muted mb-2.5 block">
                Recommended roles
              </span>
              <div className="space-y-2">
                <div className="p-2 rounded-lg bg-gs-card border border-gs-border">
                  <div className="flex items-center justify-between text-xs font-semibold text-gs-text-main mb-0.5">
                    <span>Full-stack engineer</span>
                    <span className="text-emerald-400 font-semibold text-[11px]">94% fit</span>
                  </div>
                  <p className="text-[11px] text-gs-text-muted">High synergy for product teams</p>
                </div>
                <div className="p-2 rounded-lg bg-gs-card border border-gs-border">
                  <div className="flex items-center justify-between text-xs font-semibold text-gs-text-main mb-0.5">
                    <span>Machine learning specialist</span>
                    <span className="text-[#6D6AF6] font-semibold text-[11px]">88% fit</span>
                  </div>
                  <p className="text-[11px] text-gs-text-muted">Matches data & AI projects</p>
                </div>
              </div>
            </div>
            <button
              onClick={() => navigate('/ai')}
              className="mt-3 pt-2.5 border-t border-gs-border text-xs text-[#6D6AF6] font-medium hover:underline text-left flex items-center justify-between"
            >
              <span>Explore AI matches</span>
              <ChevronRight size={13} />
            </button>
          </div>

          {/* Recent Milestones */}
          <div className="p-4 rounded-xl border border-gs-border bg-gs-elevated flex flex-col justify-between">
            <div>
              <span className="text-xs font-medium text-gs-text-muted mb-2.5 block">
                Recent milestones
              </span>
              <div className="space-y-2.5">
                <div className="flex items-start gap-2.5 text-xs">
                  <CheckCircle2 size={14} className="text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-gs-text-main">Architecture RFC</span>
                    <p className="text-[11px] text-gs-text-muted">Completed & reviewed</p>
                  </div>
                </div>
                <div className="flex items-start gap-2.5 text-xs">
                  <Clock size={14} className="text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-gs-text-main">Alpha prototype</span>
                    <p className="text-[11px] text-gs-text-muted">In progress Â· Due Friday</p>
                  </div>
                </div>
                <div className="flex items-start gap-2.5 text-xs opacity-60">
                  <Target size={14} className="text-gs-text-muted shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-gs-text-main">Campus demo day</span>
                    <p className="text-[11px] text-gs-text-muted">Final showcase</p>
                  </div>
                </div>
              </div>
            </div>
            <p className="text-[11px] text-gs-text-muted mt-3 pt-2.5 border-t border-gs-border">
              Syncs with active project roadmap.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}

