export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  college?: string;
  branch?: string;
  year?: string;
  bio?: string;
  cgpa?: number;
  xp?: number;
  credibility_score?: number;
  skills?: string[];
  social_links?: Record<string, string>;
  onboardingComplete?: boolean;
  created_at?: string;
}

export interface Skill {
  id: string;
  name: string;
  category?: string;
  verified?: boolean;
}
