import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, FolderGit2 } from 'lucide-react';
import FormGroup from '../components/forms/FormGroup';
import TextInput from '../components/forms/TextInput';
import TextArea from '../components/forms/TextArea';
import Button from '../components/buttons/Button';
import { projectService } from '../lib/services/projectService';
import { useAppContext } from '@/context/AppContext';

export const CreateProjectPage = () => {
  const navigate = useNavigate();
  const { user, showToast } = useAppContext();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      setLoading(true);
      await projectService.createProject({
        title,
        description,
        tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
        github_url: githubUrl,
        owner_id: user?.id,
      });
      showToast?.('Project created successfully!', 'success');
      navigate('/projects');
    } catch (err) {
      showToast?.(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-page-load">
      <Link to="/projects" className="inline-flex items-center text-xs text-gs-text-muted hover:text-gs-text-main gap-1">
        <ArrowLeft className="w-3.5 h-3.5" /> Back to Projects
      </Link>

      <div className="glass-card p-6">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gs-border">
          <div className="p-2.5 rounded-xl bg-[#6D6AF6]/15 text-[#6D6AF6]">
            <FolderGit2 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-gs-text-main">Create New Project</h2>
            <p className="text-xs text-gs-text-muted">Showcase your project or find teammates to collaborate with.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <FormGroup label="Project Title" required>
            <TextInput
              placeholder="e.g. Realtime Code Collaboration Suite"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </FormGroup>

          <FormGroup label="Description" required>
            <TextArea
              placeholder="Describe the goals, features, and target audience for this project..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              required
            />
          </FormGroup>

          <FormGroup label="Technologies Used (comma separated)">
            <TextInput
              placeholder="React, Node.js, PostgreSQL, Tailwind"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
            />
          </FormGroup>

          <FormGroup label="Repository Link">
            <TextInput
              placeholder="https://github.com/..."
              value={githubUrl}
              onChange={(e) => setGithubUrl(e.target.value)}
            />
          </FormGroup>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" size="sm" type="button" onClick={() => navigate('/projects')}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" isLoading={loading}>
              Publish Project
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateProjectPage;

