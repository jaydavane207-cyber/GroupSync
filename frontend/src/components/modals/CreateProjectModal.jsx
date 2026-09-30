import React, { useState } from 'react';
import Modal from './Modal';
import FormGroup from '@/components/forms/FormGroup';
import TextInput from '@/components/forms/TextInput';
import TextArea from '@/components/forms/TextArea';
import Button from '@/components/buttons/Button';

export const CreateProjectModal = ({ isOpen, onClose, onCreate }) => {
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
      await onCreate?.({
        title,
        description,
        tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
        github_url: githubUrl,
      });
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Project">
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormGroup label="Project Title" required>
          <TextInput
            placeholder="e.g. AI Career Navigator"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </FormGroup>

        <FormGroup label="Description">
          <TextArea
            placeholder="What are you building and who are you looking to collaborate with?"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
          />
        </FormGroup>

        <FormGroup label="Tech Stack (comma separated)">
          <TextInput
            placeholder="React, TypeScript, Supabase"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
          />
        </FormGroup>

        <FormGroup label="GitHub Repository URL">
          <TextInput
            placeholder="https://github.com/..."
            value={githubUrl}
            onChange={(e) => setGithubUrl(e.target.value)}
          />
        </FormGroup>

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" size="sm" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" type="submit" isLoading={loading}>
            Create Project
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default CreateProjectModal;

