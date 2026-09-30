import React from 'react';
import { Crown, MoreVertical } from 'lucide-react';

export const TeamMembers = ({ members = [], adminId, onRemoveMember }) => {
  return (
    <div className="glass-card p-5">
      <h4 className="text-xs font-semibold text-gs-text-main mb-4">Team Roster ({members.length})</h4>
      <div className="space-y-3">
        {members.map((member) => {
          const isLeader = member.id === adminId;
          return (
            <div key={member.id} className="flex items-center justify-between p-2 rounded-xl hover:bg-white/5 transition-colors">
              <div className="flex items-center gap-3">
                <img
                  src={member.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
                  alt={member.full_name}
                  className="w-8 h-8 rounded-full object-cover"
                />
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-medium text-gs-text-main">{member.full_name}</span>
                    {isLeader && <Crown className="w-3 h-3 text-amber-400" />}
                  </div>
                  <span className="text-[10px] text-gs-text-muted">{isLeader ? 'Team Leader' : 'Contributor'}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TeamMembers;
