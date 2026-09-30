import React from 'react';

export const TypingIndicator = ({ username = 'Someone' }) => {
  return (
    <div className="flex items-center gap-2 py-2 px-3 text-[11px] text-gs-text-muted">
      <span>{username} is typing</span>
      <span className="flex gap-1 items-center">
        <span className="w-1 h-1 rounded-full bg-gs-text-muted animate-bounce" style={{ animationDelay: '0ms' }} />
        <span className="w-1 h-1 rounded-full bg-gs-text-muted animate-bounce" style={{ animationDelay: '150ms' }} />
        <span className="w-1 h-1 rounded-full bg-gs-text-muted animate-bounce" style={{ animationDelay: '300ms' }} />
      </span>
    </div>
  );
};

export default TypingIndicator;
