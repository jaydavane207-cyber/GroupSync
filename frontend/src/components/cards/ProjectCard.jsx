import React from 'react';
import Card from './Card';
import { FolderGit2, Star, ExternalLink } from 'lucide-react';

export const ProjectCard = ({ project, onSelect }) => {
  if (!project) return null;

  return (
    <Card hover onClick={() => onSelect?.(project)} className="flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="p-2 rounded-lg bg-[#6D6AF6]/10 text-[#9182f8]">
            <FolderGit2 className="w-4 h-4" />
          </div>
          <span className="text-[10px] font-medium uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/5 text-gs-text-muted border border-white/5">
            {project.status || 'Active'}
          </span>
        </div>
        <h3 className="font-semibold text-sm text-gs-text-main mb-1 line-clamp-1">
          {project.title || project.name}
        </h3>
        <p className="text-xs text-gs-text-muted line-clamp-2 leading-relaxed mb-4">
          {project.description || 'No description provided.'}
        </p>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-gs-border text-[11px] text-gs-text-muted">
        <div className="flex flex-wrap gap-1">
          {(project.tags || []).slice(0, 3).map((tag, idx) => (
            <span key={idx} className="tag-skill text-[10px]">
              {tag}
            </span>
          ))}
        </div>
        {project.github_url && (
          <a
            href={project.github_url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="hover:text-gs-text-main"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        )}
      </div>
    </Card>
  );
};

export default ProjectCard;

