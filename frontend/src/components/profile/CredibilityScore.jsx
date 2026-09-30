import React from 'react';
import { Award, ShieldCheck } from 'lucide-react';

export const CredibilityScore = ({ score = 85, level = 'Verified Builder' }) => {
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5">
      <div className="w-10 h-10 rounded-lg bg-[#6D6AF6]/15 flex items-center justify-center text-[#6D6AF6]">
        <ShieldCheck className="w-5 h-5" />
      </div>
      <div>
        <div className="flex items-center gap-1.5">
          <span className="text-sm font-bold text-gs-text-main">{score}/100</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#6D6AF6]/20 text-[#6D6AF6] font-medium">
            Score
          </span>
        </div>
        <p className="text-[11px] text-gs-text-muted">{level}</p>
      </div>
    </div>
  );
};

export default CredibilityScore;
