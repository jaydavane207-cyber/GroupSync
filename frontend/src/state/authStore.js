import { create } from 'zustand';

export const useAuthStore = create((set) => ({
  user: null,
  session: null,
  isAuthenticated: false,
  isLoading: true,
  setUser: (user) => set({ user, isAuthenticated: !!user, isLoading: false }),
  setSession: (session) => set({ session }),
  setLoading: (isLoading) => set({ isLoading }),
  logout: () => set({ user: null, session: null, isAuthenticated: false, isLoading: false }),
}));

export default useAuthStore;
