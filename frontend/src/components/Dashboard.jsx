import React from 'react';
import { Users, Target, Zap, Bot } from 'lucide-react';
import { useAppContext } from '@/context/AppContext';

export default function Dashboard() {
  const { user, stats: liveStats } = useAppContext();
  if (!user) return null;

  const stats = [
    { label: 'Active teams', value: (liveStats?.activeGroups ?? 0).toString(), icon: Users },
    { label: 'Open projects', value: (liveStats?.openHackathons ?? 0).toString(), icon: Target },
    { label: 'Online peers', value: (liveStats?.onlineMembers ?? 0).toString(), icon: Zap },
    { label: 'Skill matches', value: (liveStats?.aiMatches ?? 0).toString(), icon: Bot },
  ];

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold text-gs-text-main">Welcome back, {user.name}</h1>
        <p className="text-sm text-gs-text-muted mt-1">Here is what's happening across campus today.</p>
      </header>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => {
          const Icon = s.icon;
          return (
            <div key={i} className="bg-gs-card border border-gs-border rounded-xl p-4 shadow-sm flex flex-col justify-between">
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-medium text-gs-text-muted">{s.label}</span>
                <Icon size={16} className="text-gs-text-muted" />
              </div>
              <div className="text-2xl font-semibold text-gs-text-main">
                {s.value}
              </div>
            </div>
          );
        })}
      </div>

      {/* Skills */}
      <div className="bg-gs-card border border-gs-border rounded-xl p-5 shadow-sm">
        <h2 className="text-base font-semibold text-gs-text-main mb-3">
          Verified skills
        </h2>
        <div className="flex flex-wrap gap-2">
          {(user.skills || ['React', 'Python', 'Node.js']).map((skill) => (
            <span key={skill} className="px-2.5 py-1 rounded-md bg-black/5 dark:bg-white/[0.04] border border-gs-border text-xs font-medium text-gs-text-main">
              {skill}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

