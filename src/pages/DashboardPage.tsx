import React, { useState } from 'react';
import { 
  Users, 
  Target, 
  Zap, 
  Bot, 
  Sparkles, 
  LucideIcon,
  FolderKanban,
  UserPlus,
  Award,
  ArrowRight,
  Clock,
  Calendar,
  CheckCircle2,
  TrendingUp,
  BarChart3
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { seedDatabase } from '../lib/seeddata';
import { SkillBadge } from '../components/SkillBadge';

interface Faction {
  id: string;
  name: string;
  color: string;
  bg: string;
  border: string;
  icon: LucideIcon;
  description: string;
}

interface Stat {
  label: string;
  value: string;
  icon: LucideIcon;
  color: string;
  trend: string;
}

export default function DashboardPage() {
  const { user, factions, stats: liveStats, refreshGroups, refreshStats, showToast } = useAppContext();
  const navigate = useNavigate();
  const [isSeeding, setIsSeeding] = useState(false);
  
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
  
  const faction: Faction = factions[user.faction as keyof typeof factions] || factions.innovators;

  const stats: Stat[] = [
    { 
      label: 'Active Teams', 
      value: (liveStats.activeGroups || 12).toString(), 
      icon: Users, 
      color: 'text-gs-cyan',
      trend: '+3 formed this week'
    },
    { 
      label: 'Open Projects', 
      value: (liveStats.openHackathons || 6).toString(), 
      icon: FolderKanban, 
      color: 'text-gs-amber',
      trend: '2 closing soon'
    },
    { 
      label: 'Members Online', 
      value: Math.max(liveStats.onlineMembers, 18).toString(), 
      icon: Zap, 
      color: 'text-gs-green',
      trend: 'Active now on campus'
    },
    { 
      label: 'AI Matches', 
      value: (liveStats.aiMatches || 4).toString(), 
      icon: Bot, 
      color: 'text-gs-violet',
      trend: 'High compatibility'
    },
  ];

  const upcomingDeadlines = [
    {
      title: 'AI Chat Bot Challenge',
      date: 'Sep 15, 2026',
      daysLeft: 3,
      domain: 'AI/ML Hackathon',
      prize: '$5,000'
    },
    {
      title: 'Real-time Climate Tracker',
      date: 'Sep 20, 2026',
      daysLeft: 8,
      domain: 'Mobile Dev Society',
      prize: '$2,000'
    },
    {
      title: 'Campus Analytics Dashboard',
      date: 'Sep 28, 2026',
      daysLeft: 16,
      domain: 'Data Science Club',
      prize: '$3,500'
    }
  ];

  // User skills for badges
  const userSkills = user.skills && user.skills.length > 0 
    ? user.skills 
    : ['React', 'Python', 'Node.js', 'UI/UX Design'];

  return (
    <div className="space-y-10 animate-[slideIn_0.3s_ease-out]">
      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-gs-primary/30 bg-gs-primary/10 text-gs-primary text-xs font-semibold mb-2">
            <Zap size={14} /> GroupSync Campus Hub
          </div>
          <h1 className="text-3xl md:text-5xl font-black font-heading text-gs-text-main">
            Welcome back, {user.name}
          </h1>
          <p className="text-gs-text-muted mt-1 text-base">
            Here is what's happening across university squads and hackathons today.
          </p>
        </div>

        {import.meta.env.DEV && liveStats.activeGroups === 0 && (
          <button 
            onClick={handleSeed}
            disabled={isSeeding}
            className="px-5 py-2.5 bg-gs-card border border-gs-cyan/50 text-gs-cyan font-bold rounded-2xl hover:bg-gs-cyan/10 transition-all flex items-center gap-2 text-sm shadow-sm"
          >
            {isSeeding ? 'Seeding...' : 'Seed Mock Data'} <Sparkles size={16} />
          </button>
        )}
      </header>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
        {stats.map((s, i) => {
          const Icon = s.icon;
          return (
             <div key={i} className="group relative rounded-[2rem] p-px overflow-hidden cursor-default transition-all duration-300 shadow-xl hover:-translate-y-1">
                <div className="absolute inset-0 bg-gradient-to-br from-gs-border via-transparent to-gs-border opacity-60 group-hover:opacity-100 group-hover:from-gs-primary group-hover:via-gs-secondary group-hover:to-gs-primary transition-all duration-500" />
                
                <div className="relative h-full bg-gs-card rounded-[calc(2rem-1px)] border border-white/5 p-6 backdrop-blur-xl flex flex-col justify-between">
                  <div className="flex justify-between items-start mb-6 relative z-10">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border border-gs-border bg-gs-bg shadow-inner ${s.color}`}>
                      <Icon size={22} />
                    </div>
                    <span className="text-4xl font-black font-heading text-gs-text-main tracking-tight">{s.value}</span>
                  </div>
                  <div>
                    <p className="text-gs-text-main font-bold text-sm tracking-wide">
                      {s.label}
                    </p>
                    <p className="text-xs text-gs-text-muted mt-1 font-medium flex items-center gap-1">
                      <TrendingUp size={12} className={s.color} /> {s.trend}
                    </p>
                  </div>
                </div>
             </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="bg-gs-card border border-gs-border rounded-3xl p-6 md:p-8 shadow-xl relative z-10">
        <h2 className="text-xl font-bold font-heading text-gs-text-main mb-4 flex items-center gap-2">
          <Sparkles className="text-gs-cyan" size={20} /> Quick Actions
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button
            onClick={() => navigate('/browse')}
            className="p-4 rounded-2xl bg-gs-bg/70 border border-gs-border hover:border-gs-primary hover:bg-gs-primary/5 transition-all text-left group"
          >
            <div className="w-10 h-10 rounded-xl bg-gs-primary/10 border border-gs-primary/30 flex items-center justify-center text-gs-primary mb-3 group-hover:scale-110 transition-transform">
              <Users size={20} />
            </div>
            <p className="font-bold text-sm text-gs-text-main group-hover:text-gs-primary transition-colors">Browse Teams</p>
            <p className="text-xs text-gs-text-muted mt-0.5">Join open campus squads</p>
          </button>

          <button
            onClick={() => navigate('/projects')}
            className="p-4 rounded-2xl bg-gs-bg/70 border border-gs-border hover:border-amber-400 hover:bg-amber-500/5 transition-all text-left group"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-3 group-hover:scale-110 transition-transform">
              <FolderKanban size={20} />
            </div>
            <p className="font-bold text-sm text-gs-text-main group-hover:text-amber-400 transition-colors">Find Projects</p>
            <p className="text-xs text-gs-text-muted mt-0.5">Explore live hackathons</p>
          </button>

          <button
            onClick={() => navigate('/ai')}
            className="p-4 rounded-2xl bg-gs-bg/70 border border-gs-border hover:border-gs-violet hover:bg-gs-violet/5 transition-all text-left group"
          >
            <div className="w-10 h-10 rounded-xl bg-gs-violet/10 border border-gs-violet/30 flex items-center justify-center text-gs-violet mb-3 group-hover:scale-110 transition-transform">
              <Bot size={20} />
            </div>
            <p className="font-bold text-sm text-gs-text-main group-hover:text-gs-violet transition-colors">AI Match</p>
            <p className="text-xs text-gs-text-muted mt-0.5">Neural synergy pairing</p>
          </button>

          <button
            onClick={() => navigate('/friends')}
            className="p-4 rounded-2xl bg-gs-bg/70 border border-gs-border hover:border-emerald-400 hover:bg-emerald-500/5 transition-all text-left group"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-3 group-hover:scale-110 transition-transform">
              <UserPlus size={20} />
            </div>
            <p className="font-bold text-sm text-gs-text-main group-hover:text-emerald-400 transition-colors">Friends Hub</p>
            <p className="text-xs text-gs-text-muted mt-0.5">Grow your peer network</p>
          </button>
        </div>
      </div>

      {/* Two Column Section: Upcoming Deadlines & Verified Badges */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 relative z-10">
        
        {/* Upcoming Deadlines Widget */}
        <div className="bg-gs-card border border-gs-border rounded-3xl p-6 md:p-8 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold font-heading text-gs-text-main flex items-center gap-2">
                <Calendar className="text-gs-amber" size={20} /> Upcoming Deadlines
              </h2>
              <button 
                onClick={() => navigate('/projects')}
                className="text-xs font-bold text-gs-cyan hover:text-cyan-300 flex items-center gap-1"
              >
                View All <ArrowRight size={12} />
              </button>
            </div>

            <div className="space-y-3">
              {upcomingDeadlines.map((item, idx) => {
                const urgency = item.daysLeft <= 3 ? 'border-rose-500/40 bg-rose-500/5' : 'border-gs-border bg-gs-bg/50';
                return (
                  <div key={idx} className={`p-4 rounded-2xl border ${urgency} flex items-center justify-between gap-4 transition-all hover:border-gs-primary/40`}>
                    <div>
                      <h4 className="font-bold text-sm text-gs-text-main">{item.title}</h4>
                      <p className="text-xs text-gs-text-muted mt-0.5">{item.domain} · Bounty: <span className="text-amber-300 font-semibold">{item.prize}</span></p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${item.daysLeft <= 3 ? 'bg-rose-500/20 text-rose-300 border-rose-500/30 animate-pulse' : 'bg-gs-bg text-gs-text-muted border-gs-border'}`}>
                        {item.daysLeft} days left
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-gs-border flex items-center justify-between text-xs text-gs-text-muted">
            <span>Synchronized with Campus Hackathon Calendar</span>
            <span className="text-gs-green flex items-center gap-1 font-semibold"><CheckCircle2 size={13} /> Real-time alerts on</span>
          </div>
        </div>

        {/* Skill Credibility & Badges Showcase */}
        <div className="bg-gs-card border border-gs-border rounded-3xl p-6 md:p-8 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold font-heading text-gs-text-main flex items-center gap-2">
                <Award className="text-gs-primary" size={20} /> Verified Skill Badges
              </h2>
              <button 
                onClick={() => navigate('/profile')}
                className="text-xs font-bold text-gs-cyan hover:text-cyan-300 flex items-center gap-1"
              >
                Assess Skills <ArrowRight size={12} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-6">
              <SkillBadge level="platinum" skill={userSkills[0] || 'React'} score={96} />
              <SkillBadge level="gold" skill={userSkills[1] || 'Python'} score={89} />
            </div>

            {/* Credibility Score Summary */}
            <div className="bg-gs-bg/70 border border-gs-border rounded-2xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-gs-text-main uppercase tracking-wider flex items-center gap-1.5">
                  <BarChart3 size={14} className="text-gs-primary" /> Overall Credibility Index
                </span>
                <span className="text-sm font-black text-gs-green">91 / 100</span>
              </div>
              <div className="w-full bg-gs-card rounded-full h-2 overflow-hidden border border-gs-border mb-2">
                <div className="h-full bg-gradient-to-r from-gs-primary via-emerald-400 to-gs-secondary rounded-full" style={{ width: '91%' }} />
              </div>
              <div className="flex justify-between text-[10px] text-gs-text-muted">
                <span>Quiz Score (40%)</span>
                <span>Certificates (35%)</span>
                <span>Endorsements (20%)</span>
                <span>Projects (5%)</span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Skill Tree Synergy */}
      <div className="bg-gs-card border border-gs-border rounded-[2.5rem] p-8 md:p-12 relative overflow-hidden group/tree shadow-2xl">
        <div className={`absolute inset-0 opacity-[0.02] group-hover/tree:opacity-[0.06] pointer-events-none transition-opacity duration-1000 bg-gradient-to-tr from-${faction.color.split('-')[2] || 'cyan-500'} to-transparent`} />
        
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
           <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[var(--color-gs-primary)]/15 blur-[120px] rounded-full opacity-0 group-hover/tree:opacity-100 transition-opacity duration-1000`} />
        </div>

        <h2 className="text-3xl font-black mb-8 flex items-center gap-3 relative z-10 tracking-tight text-gs-text-main drop-shadow-sm">
          <Sparkles className={`w-8 h-8 ${faction.color}`} /> 
          Skill Tree Synergy
        </h2>
        
        <div className="relative h-80 flex items-center justify-center rounded-3xl border border-gs-border/40 bg-gs-bg/40 backdrop-blur-md mt-6 p-4 shadow-[inset_0_2px_15px_rgba(0,0,0,0.2)] overflow-hidden">
          <div className="absolute inset-0 opacity-[0.05] bg-[linear-gradient(rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:40px_40px]" />

          <svg className="absolute inset-0 w-full h-full pointer-events-none drop-shadow-[0_0_8px_currentColor]" style={{ zIndex: 0 }}>
            <defs>
               <linearGradient id="laserGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="var(--color-gs-primary)" stopOpacity="0" />
                  <stop offset="50%" stopColor="var(--color-gs-primary)" stopOpacity="1" />
                  <stop offset="100%" stopColor="#a855f7" stopOpacity="0" />
               </linearGradient>
            </defs>

            <line x1="50%" y1="28%" x2="32%" y2="72%" stroke="currentColor" className="text-gs-border group-hover/tree:text-[var(--color-gs-primary)]/50 transition-colors duration-1000" strokeWidth="2.5" strokeDasharray="6 6" strokeLinecap="round" />
            <line x1="50%" y1="28%" x2="50%" y2="72%" stroke="currentColor" className="text-gs-border group-hover/tree:text-[var(--color-gs-primary)]/50 transition-colors duration-1000" strokeWidth="2.5" strokeDasharray="6 6" strokeLinecap="round" />
            <line x1="50%" y1="28%" x2="68%" y2="72%" stroke="currentColor" className="text-gs-border group-hover/tree:text-[var(--color-gs-primary)]/50 transition-colors duration-1000" strokeWidth="2.5" strokeDasharray="6 6" strokeLinecap="round" />
            
            <line x1="50%" y1="28%" x2="32%" y2="72%" stroke="url(#laserGradient)" strokeWidth="3" className="opacity-0 group-hover/tree:opacity-100 transition-opacity duration-700 animate-pulse" strokeLinecap="round" />
            <line x1="50%" y1="28%" x2="50%" y2="72%" stroke="url(#laserGradient)" strokeWidth="3" className="opacity-0 group-hover/tree:opacity-100 transition-opacity duration-[1500ms] animate-pulse" strokeLinecap="round" />
            <line x1="50%" y1="28%" x2="68%" y2="72%" stroke="url(#laserGradient)" strokeWidth="3" className="opacity-0 group-hover/tree:opacity-100 transition-opacity duration-[2000ms] animate-pulse" strokeLinecap="round" />
          </svg>
          
          <div className={`absolute top-[16%] left-1/2 -translate-x-1/2 z-10 w-24 h-24 sm:w-28 sm:h-28 rounded-[2rem] rotate-45 flex flex-col items-center justify-center border-2 border-gs-border bg-gs-card shadow-[0_10px_30px_rgba(0,0,0,0.08)] group-hover/tree:border-[var(--color-gs-primary)] group-hover/tree:shadow-[0_0_35px_rgba(0,212,255,0.35)] ${faction.color} transition-all duration-700 backdrop-blur-xl`}>
            <div className="-rotate-45 flex flex-col items-center">
               <span className="text-4xl mb-1.5 drop-shadow-lg scale-110">{user.avatar}</span>
               <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-gs-text-main px-2.5 py-1 rounded-full bg-gs-bg border border-gs-border shadow-inner">Lvl 3</span>
            </div>
          </div>
          
          {userSkills.slice(0, 3).map((skill: string, i: number) => {
            const positions = ['left-[32%]', 'left-[50%]', 'left-[68%]'];
            return (
              <div key={skill} className={`absolute bottom-[16%] -translate-x-1/2 z-10 w-[72px] h-[72px] sm:w-[84px] sm:h-[84px] rounded-[1.5rem] flex items-center justify-center border border-gs-border bg-gs-card hover:border-[var(--color-gs-primary)] hover:shadow-[0_0_25px_rgba(0,212,255,0.4)] shadow-lg transition-all duration-300 transform hover:-translate-y-2 cursor-pointer group/node ${positions[i % 3]}`}>
                <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-gs-primary)]/10 to-transparent opacity-0 group-hover/node:opacity-100 rounded-[calc(1.5rem-2px)] transition-opacity duration-300 pointer-events-none" />
                <span className="text-xs sm:text-sm font-black text-center px-2 text-gs-text-main group-hover/node:text-[var(--color-gs-primary)] transition-colors relative z-10 drop-shadow-sm line-clamp-2">{skill}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
