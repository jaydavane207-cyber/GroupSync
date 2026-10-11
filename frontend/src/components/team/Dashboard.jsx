import React from 'react';
import { Users, Target, Zap, Sparkles } from 'lucide-react';
import { useAppContext } from '@/context/AppContext';

export default function Dashboard() {
  const { user, stats: liveStats } = useAppContext();
  if (!user) return null;

  const stats = [
    { label: 'Active teams', value: (liveStats?.activeGroups ?? 0).toString(), icon: Users, color: 'from-violet-500/20 to-purple-500/10', border: 'border-violet-500/20', iconColor: 'text-violet-400' },
    { label: 'Open projects', value: (liveStats?.openHackathons ?? 0).toString(), icon: Target, color: 'from-sky-500/20 to-cyan-500/10', border: 'border-sky-500/20', iconColor: 'text-sky-400' },
    { label: 'Online peers', value: (liveStats?.onlineMembers ?? 0).toString(), icon: Zap, color: 'from-emerald-500/20 to-green-500/10', border: 'border-emerald-500/20', iconColor: 'text-emerald-400' },
    { label: 'Skill matches', value: (liveStats?.aiMatches ?? 0).toString(), icon: Sparkles, color: 'from-pink-500/20 to-fuchsia-500/10', border: 'border-pink-500/20', iconColor: 'text-pink-400' },
  ];

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold text-gs-text-main">
          Welcome back, <span className="text-glow-cyan bg-gradient-to-r from-[#9182f8] to-[#a78bfa] bg-clip-text text-transparent">{user.name}</span>
        </h1>
        <p className="text-sm text-gs-text-muted mt-1">Here is what's happening across campus today.</p>
      </header>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => {
          const Icon = s.icon;
          return (
            <div
              key={i}
              className={`glass-card glass-card-hover rounded-xl p-4 flex flex-col justify-between bg-gradient-to-br ${s.color} border ${s.border}`}
            >
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-medium text-gs-text-muted">{s.label}</span>
                <Icon size={16} className={s.iconColor} />
              </div>
              <div className="text-2xl font-semibold text-gs-text-main tabular-nums">
                {s.value}
              </div>
            </div>
          );
        })}
      </div>

      {/* Skills */}
      <div className="glass-card rounded-xl p-5">
        <h2 className="text-base font-semibold text-gs-text-main mb-3">
          Verified skills
        </h2>
        <div className="flex flex-wrap gap-2">
          {(user.skills || ['React', 'Python', 'Node.js']).map((skill) => (
            <span key={skill} className="tag-skill font-mono">
              {skill}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
