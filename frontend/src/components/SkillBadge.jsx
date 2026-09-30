import React from 'react';
import { Award, Code, Cpu, ShieldCheck } from 'lucide-react';

const TIER_CONFIG = {
  platinum: {
    pill: 'bg-[#6D6AF6]/10 text-[#7E7BF8] border-[#6D6AF6]/20',
    iconColor: 'text-[#6D6AF6]',
    label: 'Platinum',
  },
  gold: {
    pill: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    iconColor: 'text-amber-400',
    label: 'Gold',
  },
  silver: {
    pill: 'bg-zinc-500/10 text-zinc-300 border-zinc-500/20',
    iconColor: 'text-zinc-400',
    label: 'Silver',
  },
  bronze: {
    pill: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
    iconColor: 'text-orange-400',
    label: 'Bronze',
  },
};

export const SkillBadge = ({ level = 'gold', skill = 'React', score = 92 }) => {
  const safeLevel = level?.toLowerCase() || 'gold';
  const config = TIER_CONFIG[safeLevel] || TIER_CONFIG.gold;

  return (
    <div className="w-full rounded-xl border border-gs-border bg-gs-card p-3.5 flex items-center justify-between gap-3 hover:border-gs-border-hover transition-colors machined-edge">
      <div className="flex items-center gap-2.5 min-w-0">
        <div className={`w-8 h-8 rounded-lg bg-white/[0.04] border border-gs-border flex items-center justify-center shrink-0 ${config.iconColor}`}>
          <ShieldCheck size={16} />
        </div>
        <div className="min-w-0">
          <div className="text-xs font-semibold text-gs-text-main truncate">{skill}</div>
          {score !== undefined && score !== null && (
            <div className="text-[11px] text-gs-text-muted">{score}% verified</div>
          )}
        </div>
      </div>
      <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border shrink-0 ${config.pill}`}>
        {config.label}
      </span>
    </div>
  );
};

export const SkillBadgeInline = ({ level = 'gold', skill = 'React' }) => {
  const safeLevel = level?.toLowerCase() || 'gold';
  const config = TIER_CONFIG[safeLevel] || TIER_CONFIG.gold;

  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-medium border ${config.pill}`}>
      <span>{skill}</span>
      <span className="opacity-70 text-[10px]">({config.label})</span>
    </span>
  );
};

export default SkillBadge;
