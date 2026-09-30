import React from 'react';
import { CheckCircle2, AlertCircle } from 'lucide-react';

export const VerificationBadge = ({ verified = true, label = 'Verified' }) => {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border ${
        verified
          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
          : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
      }`}
    >
      {verified ? <CheckCircle2 className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
      {verified ? label : 'Unverified'}
    </span>
  );
};

export default VerificationBadge;
