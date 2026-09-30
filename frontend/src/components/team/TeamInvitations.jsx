import React from 'react';
import { Mail, Clock } from 'lucide-react';

export const TeamInvitations = ({ invitations = [] }) => {
  return (
    <div className="glass-card p-5">
      <h4 className="text-xs font-semibold text-gs-text-main mb-4">Pending Outgoing Invites</h4>
      {invitations.length === 0 ? (
        <p className="text-xs text-gs-text-muted">No pending outgoing invites.</p>
      ) : (
        <div className="space-y-2">
          {invitations.map((inv) => (
            <div key={inv.id} className="flex items-center justify-between p-2.5 rounded-lg bg-white/5 text-xs">
              <span className="text-gs-text-secondary flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-gs-text-muted" /> {inv.email}
              </span>
              <span className="text-[10px] text-amber-400 flex items-center gap-1">
                <Clock className="w-3 h-3" /> Awaiting response
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TeamInvitations;
