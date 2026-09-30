import { create } from 'zustand';

export const useTeamStore = create((set) => ({
  teams: [],
  currentTeam: null,
  loading: false,
  error: null,
  setTeams: (teams) => set({ teams, loading: false }),
  setCurrentTeam: (team) => set({ currentTeam: team }),
  addTeam: (team) => set((state) => ({ teams: [team, ...state.teams] })),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
}));

export default useTeamStore;
