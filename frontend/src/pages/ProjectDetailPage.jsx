import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, ExternalLink, FolderGit2, Star } from 'lucide-react';
import Button from '../components/buttons/Button';
import { projectService } from '../lib/services/projectService';
import Spinner from '../components/loaders/Spinner';

export const ProjectDetailPage = () => {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProject = async () => {
      try {
        setLoading(true);
        const data = await projectService.getProjectById(id);
        setProject(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (id) loadProject();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="p-8 text-center glass-card max-w-md mx-auto">
        <p className="text-xs text-gs-text-muted mb-4">Project not found or was removed.</p>
        <Link to="/projects">
          <Button variant="outline" size="sm">
            <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Back to Projects
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-page-load">
      <Link to="/projects" className="inline-flex items-center text-xs text-gs-text-muted hover:text-gs-text-main gap-1">
        <ArrowLeft className="w-3.5 h-3.5" /> Back to Projects
      </Link>

      <div className="glass-card p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#6D6AF6]/15 flex items-center justify-center text-[#6D6AF6]">
              <FolderGit2 className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gs-text-main">{project.title}</h1>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-gs-text-muted border border-white/5 uppercase">
                {project.status || 'Active'}
              </span>
            </div>
          </div>
          {project.github_url && (
            <a
              href={project.github_url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gs-text-main transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          )}
        </div>

        <p className="text-xs text-gs-text-secondary leading-relaxed mt-4 max-w-2xl">
          {project.description}
        </p>

        <div className="flex flex-wrap gap-2 mt-6 pt-6 border-t border-gs-border">
          {(project.tags || []).map((tag, idx) => (
            <span key={idx} className="tag-skill">
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProjectDetailPage;
