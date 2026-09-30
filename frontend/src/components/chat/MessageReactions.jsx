import React from 'react';

export const MessageReactions = ({ reactions = [], onReact }) => {
  const commonEmojis = ['👍', '❤️', '🚀', '🔥', '🎉'];

  return (
    <div className="flex items-center gap-1 mt-1">
      {reactions.map((r, i) => (
        <span
          key={i}
          className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full bg-white/5 border border-white/5 text-gs-text-secondary"
        >
          {r.emoji} {r.count}
        </span>
      ))}
      {onReact && (
        <div className="flex items-center gap-1 ml-1 opacity-0 hover:opacity-100 transition-opacity">
          {commonEmojis.map((emoji) => (
            <button
              key={emoji}
              onClick={() => onReact(emoji)}
              className="text-xs hover:scale-125 transition-transform"
            >
              {emoji}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default MessageReactions;
