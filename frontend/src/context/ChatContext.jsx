import React, { createContext, useContext, useState } from 'react';

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const [activeChannel, setActiveChannel] = useState('general');

  return (
    <ChatContext.Provider value={{ activeChannel, setActiveChannel }}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChatContext = () => useContext(ChatContext);

export default ChatContext;
