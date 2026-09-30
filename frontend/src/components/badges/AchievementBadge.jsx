import React from 'react';
import { Award, Zap } from 'lucide-react';

export const AchievementBadge = ({ title, xp, icon: Icon = Award }) => {
  return (
    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10">
      <div className="p-1 rounded-lg bg-amber-400/10 text-amber-400">
        <Icon className="w-3.5 h-3.5" />
      </div>
      <div>
        <span className="text-xs font-medium text-gs-text-main block">{title}</span>
        {xp && (
          <span className="text-[10px] text-amber-400 flex items-center gap-0.5">
            <Zap className="w-2.5 h-2.5" /> +{xp} XP
          </span>
        )}
      </div>
    </div>
  );
};

export default AchievementBadge;
