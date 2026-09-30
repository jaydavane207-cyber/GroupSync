export interface Team {
  id: string;
  name: string;
  description?: string;
  admin_id: string;
  max_members: number;
  tags?: string[];
  status?: string;
  created_at: string;
}

export interface TeamMember {
  id: string;
  team_id: string;
  user_id: string;
  role: 'leader' | 'member';
  joined_at: string;
}
