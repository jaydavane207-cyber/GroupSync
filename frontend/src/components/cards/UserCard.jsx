import React from 'react';
import Card from './Card';
import { Award, Zap } from 'lucide-react';

export const UserCard = ({ user, onAction, actionLabel = 'Connect' }) => {
  if (!user) return null;

  return (
    <Card hover className="flex items-center justify-between gap-4">
      <div className="flex items-center gap-3 min-w-0">
        <img
          src={user.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
          alt={user.full_name}
          className="w-10 h-10 rounded-full object-cover border border-white/10 shrink-0"
        />
        <div className="min-w-0">
          <h4 className="font-medium text-xs text-gs-text-main truncate">{user.full_name}</h4>
          <p className="text-[11px] text-gs-text-muted truncate">{user.college || user.branch || 'Student'}</p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-[10px] text-amber-400 flex items-center gap-0.5">
              <Zap className="w-2.5 h-2.5" /> {user.xp || 0} XP
            </span>
            {user.credibility_score && (
              <span className="text-[10px] text-[#6D6AF6] flex items-center gap-0.5">
                <Award className="w-2.5 h-2.5" /> {user.credibility_score} CS
              </span>
            )}
          </div>
        </div>
      </div>

      {onAction && (
        <button
          onClick={() => onAction(user)}
          className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-medium text-gs-text-main border border-white/10 shrink-0 transition-colors"
        >
          {actionLabel}
        </button>
      )}
    </Card>
  );
};

export default UserCard;
