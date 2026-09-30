export interface Project {
  id: string;
  title: string;
  description: string;
  owner_id: string;
  tags?: string[];
  status: 'idea' | 'in_progress' | 'completed' | 'archived';
  github_url?: string;
  demo_url?: string;
  created_at: string;
  updated_at?: string;
}
