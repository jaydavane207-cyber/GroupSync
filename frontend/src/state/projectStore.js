import { create } from 'zustand';

export const useProjectStore = create((set) => ({
  projects: [],
  selectedProject: null,
  loading: false,
  error: null,
  setProjects: (projects) => set({ projects, loading: false }),
  setSelectedProject: (project) => set({ selectedProject: project }),
  addProject: (project) => set((state) => ({ projects: [project, ...state.projects] })),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
}));

export default useProjectStore;
