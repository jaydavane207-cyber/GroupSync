import React from 'react';
import { formatRelativeTime } from '@/lib/utils/dateUtils';

export const MessageBubble = ({ message, isCurrentUser }) => {
  if (!message) return null;

  return (
    <div className={`flex flex-col ${isCurrentUser ? 'items-end' : 'items-start'} mb-3`}>
      <div className="flex items-center gap-2 mb-1">
        {!isCurrentUser && message.user?.full_name && (
          <span className="text-[11px] font-medium text-gs-text-main">
            {message.user.full_name}
          </span>
        )}
        <span className="text-[10px] text-gs-text-muted">
          {formatRelativeTime(message.created_at)}
        </span>
      </div>
      <div
        className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-xs leading-relaxed ${
          isCurrentUser
            ? 'bg-[#6D6AF6] text-white rounded-tr-xs'
            : 'bg-white/5 border border-gs-border text-gs-text-main rounded-tl-xs'
        }`}
      >
        {message.content}
      </div>
    </div>
  );
};

export default MessageBubble;

