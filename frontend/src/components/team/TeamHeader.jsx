import React from 'react';
import { Users, UserPlus, Settings } from 'lucide-react';
import Button from '@/components/buttons/Button';

export const TeamHeader = ({ team, isLeader = false, onInvite, onSettings }) => {
  if (!team) return null;

  return (
    <div className="glass-card p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-[#6D6AF6]/15 flex items-center justify-center text-[#9182f8]">
          <Users className="w-7 h-7" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-gs-text-main">{team.name}</h2>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              {team.status || 'Active'}
            </span>
          </div>
          <p className="text-xs text-gs-text-muted mt-1">{team.description}</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {onInvite && (
          <Button variant="outline" size="sm" onClick={onInvite}>
            <UserPlus className="w-3.5 h-3.5 mr-1.5" /> Invite
          </Button>
        )}
        {isLeader && onSettings && (
          <Button variant="secondary" size="sm" onClick={onSettings}>
            <Settings className="w-3.5 h-3.5" />
          </Button>
        )}
      </div>
    </div>
  );
};

export default TeamHeader;


