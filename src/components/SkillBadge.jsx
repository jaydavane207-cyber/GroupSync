import React from 'react';

export const SkillBadge = ({ level = 'gold', skill = 'React', score = 92 }) => {
  const badgeConfig = {
    bronze: {
      icon: '🥉',
      color: 'text-amber-300',
      borderColor: 'border-amber-500/50',
      bgGlow: 'from-amber-600/20 to-amber-900/40',
      tagBg: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    },
    silver: {
      icon: '🥈',
      color: 'text-slate-200',
      borderColor: 'border-slate-400/50',
      bgGlow: 'from-slate-400/20 to-slate-700/40',
      tagBg: 'bg-slate-500/20 text-slate-200 border-slate-400/40',
    },
    gold: {
      icon: '🥇',
      color: 'text-yellow-400',
      borderColor: 'border-yellow-400/50',
      bgGlow: 'from-yellow-500/20 to-amber-600/30',
      tagBg: 'bg-yellow-500/20 text-yellow-300 border-yellow-400/40',
    },
    platinum: {
      icon: '💎',
      color: 'text-cyan-300',
      borderColor: 'border-cyan-400/50',
      bgGlow: 'from-cyan-500/20 to-purple-600/30',
      tagBg: 'bg-cyan-500/20 text-cyan-200 border-cyan-400/40',
    },
  };

  const config = badgeConfig[level?.toLowerCase()] || badgeConfig.gold;

  return (
    <div className={`relative group w-full rounded-2xl border ${config.borderColor} bg-gradient-to-br ${config.bgGlow} p-4 backdrop-blur-xl flex flex-col items-center justify-center text-center shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-[0_0_20px_rgba(0,240,255,0.2)]`}>
      <div className="text-3xl mb-1 filter drop-shadow">{config.icon}</div>
      <div className="text-sm font-bold text-gs-text-main tracking-tight line-clamp-1">{skill}</div>
      {score !== undefined && score !== null && (
        <div className="text-xs font-black text-gs-primary mt-0.5">{score}% Score</div>
      )}
      <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full border mt-2 ${config.tagBg}`}>
        {level}
      </span>
    </div>
  );
};

export const SkillBadgeInline = ({ level = 'gold', skill = 'React' }) => {
  const badgeConfig = {
    bronze: 'bg-amber-500/15 text-amber-300 border-amber-500/40',
    silver: 'bg-slate-400/15 text-slate-200 border-slate-400/40',
    gold: 'bg-yellow-400/15 text-yellow-300 border-yellow-400/40',
    platinum: 'bg-cyan-400/15 text-cyan-200 border-cyan-400/40',
  };

  const icons = {
    bronze: '🥉',
    silver: '🥈',
    gold: '🥇',
    platinum: '💎',
  };

  const safeLevel = level?.toLowerCase() || 'gold';

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${badgeConfig[safeLevel] || badgeConfig.gold} transition-transform hover:scale-105`}>
      <span>{icons[safeLevel] || '🥇'}</span>
      <span>{skill}</span>
      <span className="opacity-70 text-[10px] uppercase font-bold">({level})</span>
    </span>
  );
};

export default SkillBadge;
