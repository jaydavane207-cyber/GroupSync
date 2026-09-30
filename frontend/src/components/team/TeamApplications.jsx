import React from 'react';
import Button from '@/components/buttons/Button';
import { Check, X } from 'lucide-react';

export const TeamApplications = ({ applications = [], onAccept, onReject }) => {
  return (
    <div className="glass-card p-5">
      <h4 className="text-xs font-semibold text-gs-text-main mb-4">Pending Applications ({applications.length})</h4>
      {applications.length === 0 ? (
        <p className="text-xs text-gs-text-muted">No pending member requests.</p>
      ) : (
        <div className="space-y-3">
          {applications.map((app) => (
            <div key={app.id} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
              <div>
                <h5 className="text-xs font-semibold text-gs-text-main">{app.user?.full_name}</h5>
                <p className="text-[10px] text-gs-text-muted mt-0.5">{app.message || 'Wants to join the team.'}</p>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => onAccept?.(app.id)}
                  className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 transition-colors"
                >
                  <Check className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => onReject?.(app.id)}
                  className="p-1.5 rounded-lg bg-rose-500/20 text-rose-400 hover:bg-rose-500/30 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TeamApplications;

