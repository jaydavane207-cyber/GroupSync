import { create } from 'zustand';

export const useUserStore = create((set) => ({
  profile: null,
  skills: [],
  certificates: [],
  setProfile: (profile) => set({ profile }),
  setSkills: (skills) => set({ skills }),
  setCertificates: (certificates) => set({ certificates }),
  updateProfile: (updates) => set((state) => ({ profile: { ...state.profile, ...updates } })),
}));

export default useUserStore;
