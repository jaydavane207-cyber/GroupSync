import React from 'react';
import { Zap, Users, FolderGit2, CheckCircle2 } from 'lucide-react';
import { formatXP } from '@/lib/utils/formatting';

export const ProfileStats = ({ stats = {} }) => {
  const statItems = [
    { label: 'Total XP', value: formatXP(stats.xp || 0), icon: Zap, color: 'text-amber-400' },
    { label: 'Teams Joined', value: stats.teamsCount || 0, icon: Users, color: 'text-[#6D6AF6]' },
    { label: 'Projects Built', value: stats.projectsCount || 0, icon: FolderGit2, color: 'text-emerald-400' },
    { label: 'Badges Earned', value: stats.badgesCount || 0, icon: CheckCircle2, color: 'text-rose-400' },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {statItems.map((item, idx) => {
        const Icon = item.icon;
        return (
          <div key={idx} className="glass-card p-4 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] text-gs-text-muted">{item.label}</span>
              <Icon className={`w-4 h-4 ${item.color}`} />
            </div>
            <span className="text-base font-bold text-gs-text-main">{item.value}</span>
          </div>
        );
      })}
    </div>
  );
};

export default ProfileStats;

