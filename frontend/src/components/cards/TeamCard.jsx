import React from 'react';
import Card from './Card';
import { Users, Shield, ArrowRight } from 'lucide-react';

export const TeamCard = ({ team, onJoin, onView }) => {
  if (!team) return null;

  return (
    <Card hover onClick={() => onView?.(team)} className="flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#6D6AF6]/15 flex items-center justify-center text-[#9182f8]">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-semibold text-xs text-gs-text-main line-clamp-1">{team.name}</h4>
              <p className="text-[10px] text-gs-text-muted">{team.category || 'General'}</p>
            </div>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            {team.status || 'Recruiting'}
          </span>
        </div>

        <p className="text-xs text-gs-text-secondary line-clamp-2 mb-4 leading-relaxed">
          {team.description || 'Looking for passionate teammates to collaborate with.'}
        </p>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-gs-border text-xs">
        <span className="text-[11px] text-gs-text-muted flex items-center gap-1">
          <Users className="w-3 h-3" />
          {team.memberIds?.length || 1}/{team.maxMembers || 6} Members
        </span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onJoin?.(team);
          }}
          className="text-xs text-[#9182f8] hover:text-[#5C59EC] font-medium flex items-center gap-1"
        >
          Join <ArrowRight className="w-3 h-3" />
        </button>
      </div>
    </Card>
  );
};

export default TeamCard;

