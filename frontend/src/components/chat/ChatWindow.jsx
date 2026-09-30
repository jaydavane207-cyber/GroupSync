import React, { useRef, useEffect } from 'react';
import MessageBubble from './MessageBubble';
import ChatInput from './ChatInput';

export const ChatWindow = ({
  title = 'Chat',
  subtitle,
  messages = [],
  currentUserId,
  onSendMessage,
}) => {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex flex-col h-full bg-gs-card rounded-2xl border border-gs-border overflow-hidden">
      <div className="p-4 border-b border-gs-border flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-xs text-gs-text-main">{title}</h3>
          {subtitle && <p className="text-[10px] text-gs-text-muted">{subtitle}</p>}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center text-xs text-gs-text-muted">
            No messages yet. Say hello!
          </div>
        ) : (
          messages.map((msg) => (
            <MessageBubble
              key={msg.id}
              message={msg}
              isCurrentUser={msg.sender_id === currentUserId || msg.user_id === currentUserId}
            />
          ))
        )}
        <div ref={bottomRef} />
      </div>

      <ChatInput onSend={onSendMessage} />
    </div>
  );
};

export default ChatWindow;
