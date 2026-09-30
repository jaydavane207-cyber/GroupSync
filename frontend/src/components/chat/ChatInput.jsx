import React, { useState } from 'react';
import { Send } from 'lucide-react';

export const ChatInput = ({ onSend, placeholder = 'Type a message...' }) => {
  const [content, setContent] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!content.trim()) return;
    onSend(content.trim());
    setContent('');
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2 p-3 border-t border-gs-border bg-gs-card">
      <input
        type="text"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={placeholder}
        className="flex-1 bg-white/5 border border-gs-border focus:border-[#6D6AF6] rounded-xl px-4 py-2 text-xs text-gs-text-main placeholder-gs-text-muted outline-hidden transition-colors"
      />
      <button
        type="submit"
        disabled={!content.trim()}
        className="p-2 rounded-xl bg-[#6D6AF6] hover:bg-[#5C59EC] text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        <Send className="w-4 h-4" />
      </button>
    </form>
  );
};

export default ChatInput;
