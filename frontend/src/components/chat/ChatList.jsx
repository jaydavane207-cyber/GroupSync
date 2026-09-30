import React from 'react';
import { formatRelativeTime } from '@/lib/utils/dateUtils';

export const ChatList = ({ chats = [], activeChatId, onSelectChat }) => {
  return (
    <div className="flex flex-col divide-y divide-gs-border">
      {chats.map((chat) => (
        <button
          key={chat.id}
          onClick={() => onSelectChat(chat.id)}
          className={`flex items-center gap-3 p-3 text-left transition-colors hover:bg-white/5 ${
            activeChatId === chat.id ? 'bg-white/5' : ''
          }`}
        >
          <img
            src={chat.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
            alt={chat.name}
            className="w-9 h-9 rounded-full object-cover shrink-0"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h5 className="text-xs font-semibold text-gs-text-main truncate">{chat.name}</h5>
              <span className="text-[10px] text-gs-text-muted">{formatRelativeTime(chat.lastMessageTime)}</span>
            </div>
            <p className="text-[11px] text-gs-text-muted truncate mt-0.5">{chat.lastMessage}</p>
          </div>
        </button>
      ))}
    </div>
  );
};

export default ChatList;

