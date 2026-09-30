import { useState, useEffect, useCallback } from 'react';
import { projectService } from '../lib/services/projectService';
import { useAppContext } from '@/context/AppContext';

export const useProjects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { showToast } = useAppContext();

  const loadProjects = useCallback(async () => {
    try {
      setLoading(true);
      const data = await projectService.getAllProjects();
      setProjects(data);
      setError(null);
    } catch (err) {
      setError(err.message);
      showToast?.(err.message, 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  const createProject = async (projectData) => {
    try {
      const created = await projectService.createProject(projectData);
      setProjects((prev) => [created, ...prev]);
      showToast?.('Project created successfully!', 'success');
      return created;
    } catch (err) {
      showToast?.(err.message, 'error');
      throw err;
    }
  };

  return {
    projects,
    loading,
    error,
    refreshProjects: loadProjects,
    createProject,
  };
};

export default useProjects;

