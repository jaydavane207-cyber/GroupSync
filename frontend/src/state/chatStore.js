import { create } from 'zustand';

export const useChatStore = create((set) => ({
  activeChannel: 'general',
  messages: [],
  directMessages: {},
  unreadCount: 0,
  setActiveChannel: (channel) => set({ activeChannel: channel }),
  setMessages: (messages) => set({ messages }),
  addMessage: (message) => set((state) => ({ messages: [...state.messages, message] })),
  setDirectMessages: (userId, messages) =>
    set((state) => ({
      directMessages: { ...state.directMessages, [userId]: messages },
    })),
  addDirectMessage: (userId, message) =>
    set((state) => ({
      directMessages: {
        ...state.directMessages,
        [userId]: [...(state.directMessages[userId] || []), message],
      },
    })),
}));

export default useChatStore;
