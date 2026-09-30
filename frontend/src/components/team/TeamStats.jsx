import React from 'react';
import { Users, CheckCircle, Clock } from 'lucide-react';

export const TeamStats = ({ totalMembers = 1, maxMembers = 6, tasksCompleted = 0 }) => {
  return (
    <div className="grid grid-cols-3 gap-3">
      <div className="glass-card p-4 text-center">
        <span className="text-[10px] text-gs-text-muted uppercase tracking-wider block mb-1">Roster</span>
        <span className="text-base font-bold text-gs-text-main">{totalMembers}/{maxMembers}</span>
      </div>
      <div className="glass-card p-4 text-center">
        <span className="text-[10px] text-gs-text-muted uppercase tracking-wider block mb-1">Tasks Done</span>
        <span className="text-base font-bold text-emerald-400">{tasksCompleted}</span>
      </div>
      <div className="glass-card p-4 text-center">
        <span className="text-[10px] text-gs-text-muted uppercase tracking-wider block mb-1">Open Slots</span>
        <span className="text-base font-bold text-[#6D6AF6]">{Math.max(0, maxMembers - totalMembers)}</span>
      </div>
    </div>
  );
};

export default TeamStats;
