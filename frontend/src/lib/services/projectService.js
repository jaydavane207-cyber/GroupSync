/**
 * projectService.js — GroupSync Project & Hackathon Management Operations
 * Handles project fetching, creation, detail retrieval, and applications with
 * offline / resilient fallback when Supabase tables are not yet migrated.
 */
import { supabase } from '../supabase/client';
import { withRetry } from '../withRetry';
import storage from '@/lib/utils/localStorage';

export const isTableMissingError = (err) => {
  if (!err) return false;
  const msg = String(err.message || err.userMessage || '').toLowerCase();
  const code = String(err.code || '');
  return (
    code === 'PGRST205' ||
    msg.includes('schema cache') ||
    (msg.includes('table') && msg.includes('project'))
  );
};

export const SAMPLE_PROJECTS = [
  {
    id: 'proj-ai-agent',
    title: 'AI Chat Bot Challenge',
    description: 'Build an intelligent contextual assistant using state-of-the-art LLMs, RAG architecture, and agentic workflows.',
    domain: 'ai-ml',
    difficulty: 'intermediate',
    timeline: 'hackathon',
    deadline: new Date(Date.now() + 12 * 86400000).toISOString().split('T')[0],
    prize_pool: '$5,000',
    team_size: '2-4',
    skills: ['Python', 'NLP', 'Machine Learning', 'FastAPI'],
    image: '🤖',
    organizer_id: null,
    organizer_name: 'AI Innovation Club',
    spots_left: 3,
    status: 'active',
    tags: ['Python', 'NLP', 'Machine Learning', 'FastAPI'],
    github_url: 'https://github.com/example/ai-chatbot',
    created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    id: 'proj-web3-social',
    title: 'Web3 Decentralized Social Network',
    description: 'Create a censorship-resistant decentralized social network with verifiable on-chain reputation and ZK identity.',
    domain: 'web',
    difficulty: 'advanced',
    timeline: 'project',
    deadline: new Date(Date.now() + 28 * 86400000).toISOString().split('T')[0],
    prize_pool: '$10,000',
    team_size: '4-6',
    skills: ['React', 'Node.js', 'Solidity', 'Smart Contracts', 'IPFS'],
    image: '🌐',
    organizer_id: null,
    organizer_name: 'Blockchain Vanguard',
    spots_left: 2,
    status: 'active',
    tags: ['React', 'Node.js', 'Solidity', 'Smart Contracts', 'IPFS'],
    github_url: 'https://github.com/example/web3-social',
    created_at: new Date(Date.now() - 4 * 86400000).toISOString(),
  },
  {
    id: 'proj-climate-tracker',
    title: 'Real-time Climate & Weather Tracker',
    description: 'Build an intuitive mobile application for localized real-time hyper-accurate weather warnings and air quality maps.',
    domain: 'mobile',
    difficulty: 'beginner',
    timeline: 'hackathon',
    deadline: new Date(Date.now() + 17 * 86400000).toISOString().split('T')[0],
    prize_pool: '$2,000',
    team_size: '2-3',
    skills: ['React Native', 'Tailwind CSS', 'REST APIs', 'UI/UX'],
    image: '📱',
    organizer_id: null,
    organizer_name: 'Mobile Dev Society',
    spots_left: 1,
    status: 'active',
    tags: ['React Native', 'Tailwind CSS', 'REST APIs', 'UI/UX'],
    github_url: 'https://github.com/example/climate-tracker',
    created_at: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
  {
    id: 'proj-campus-analytics',
    title: 'Campus Analytics & Predictive Dashboard',
    description: 'Analyze campus data patterns, study group utilization, and event metrics with interactive visualization and ML forecasting.',
    domain: 'data',
    difficulty: 'intermediate',
    timeline: 'competition',
    deadline: new Date(Date.now() + 25 * 86400000).toISOString().split('T')[0],
    prize_pool: '$3,500',
    team_size: '3-5',
    skills: ['Python', 'SQL', 'Data Visualization', 'Pandas', 'Streamlit'],
    image: '📊',
    organizer_id: null,
    organizer_name: 'Data Science Club',
    spots_left: 4,
    status: 'active',
    tags: ['Python', 'SQL', 'Data Visualization', 'Pandas', 'Streamlit'],
    github_url: 'https://github.com/example/campus-analytics',
    created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
  },
  {
    id: 'proj-vr-campus',
    title: 'Immersive VR Campus Tour Experience',
    description: 'Design and prototype a 3D interactive virtual campus experience for prospective students and international visitors.',
    domain: 'design',
    difficulty: 'intermediate',
    timeline: 'project',
    deadline: new Date(Date.now() + 42 * 86400000).toISOString().split('T')[0],
    prize_pool: '$4,000',
    team_size: '3-4',
    skills: ['Three.js', 'Figma', 'UI/UX Design', 'WebGL'],
    image: '🎨',
    organizer_id: null,
    organizer_name: 'Creative Media Lab',
    spots_left: 2,
    status: 'active',
    tags: ['Three.js', 'Figma', 'UI/UX Design', 'WebGL'],
    github_url: 'https://github.com/example/vr-tour',
    created_at: new Date(Date.now() - 6 * 86400000).toISOString(),
  },
  {
    id: 'proj-cyber-engine',
    title: 'Cybersecurity Threat Detection Engine',
    description: 'Develop an automated packet inspection and anomaly detection system for spotting zero-day threats in real time.',
    domain: 'ai-ml',
    difficulty: 'advanced',
    timeline: 'competition',
    deadline: new Date(Date.now() + 27 * 86400000).toISOString().split('T')[0],
    prize_pool: '$7,500',
    team_size: '2-4',
    skills: ['Python', 'Network Security', 'Wireshark', 'Anomaly Detection'],
    image: '🛡️',
    organizer_id: null,
    organizer_name: 'Cyber Security Guild',
    spots_left: 3,
    status: 'active',
    tags: ['Python', 'Network Security', 'Wireshark', 'Anomaly Detection'],
    github_url: 'https://github.com/example/threat-engine',
    created_at: new Date(Date.now() - 3 * 86400000).toISOString(),
  }
];

export const getLocalProjects = () => storage.get('groupsync_local_projects', []);
export const saveLocalProjects = (projects) => storage.set('groupsync_local_projects', projects);

export const getLocalApplications = (userId) =>
  storage.get(`groupsync_project_applications_${userId}`, []);
export const saveLocalApplications = (userId, apps) =>
  storage.set(`groupsync_project_applications_${userId}`, apps);

export const projectService = {
  async getAllProjects() {
    try {
      const { data, error } = await withRetry(() =>
        supabase
          .from('projects')
          .select('*')
          .order('created_at', { ascending: false })
      );

      if (error) {
        if (isTableMissingError(error)) {
          const local = getLocalProjects();
          return { data: [...local, ...SAMPLE_PROJECTS], error: null, isOffline: true };
        }
        return { data: null, error, isOffline: false };
      }

      return { data: data || [], error: null, isOffline: false };
    } catch (catchedErr) {
      if (isTableMissingError(catchedErr)) {
        const local = getLocalProjects();
        return { data: [...local, ...SAMPLE_PROJECTS], error: null, isOffline: true };
      }
      return { data: null, error: catchedErr, isOffline: false };
    }
  },

  async getProjectById(id) {
    try {
      const { data, error } = await withRetry(() =>
        supabase
          .from('projects')
          .select('*')
          .eq('id', id)
          .single()
      );

      if (error) {
        if (isTableMissingError(error)) {
          const allLocal = [...getLocalProjects(), ...SAMPLE_PROJECTS];
          const found = allLocal.find((p) => String(p.id) === String(id));
          return found || null;
        }
        throw error;
      }

      return data;
    } catch (catchedErr) {
      if (isTableMissingError(catchedErr)) {
        const allLocal = [...getLocalProjects(), ...SAMPLE_PROJECTS];
        const found = allLocal.find((p) => String(p.id) === String(id));
        return found || null;
      }
      throw catchedErr;
    }
  },

  async createProject(projectData) {
    try {
      const { data, error } = await withRetry(() =>
        supabase
          .from('projects')
          .insert([projectData])
          .select()
          .single()
      );

      if (error) {
        if (isTableMissingError(error)) {
          const newProj = {
            id: 'local-proj-' + Date.now(),
            ...projectData,
            created_at: new Date().toISOString(),
          };
          const existing = getLocalProjects();
          saveLocalProjects([newProj, ...existing]);
          return newProj;
        }
        throw error;
      }

      return data;
    } catch (catchedErr) {
      if (isTableMissingError(catchedErr)) {
        const newProj = {
          id: 'local-proj-' + Date.now(),
          ...projectData,
          created_at: new Date().toISOString(),
        };
        const existing = getLocalProjects();
        saveLocalProjects([newProj, ...existing]);
        return newProj;
      }
      throw catchedErr;
    }
  },

  async updateProject(id, updates) {
    try {
      const { data, error } = await withRetry(() =>
        supabase
          .from('projects')
          .update(updates)
          .eq('id', id)
          .select()
          .single()
      );

      if (error) {
        if (isTableMissingError(error)) {
          const existing = getLocalProjects();
          const updated = existing.map((p) =>
            String(p.id) === String(id) ? { ...p, ...updates } : p
          );
          saveLocalProjects(updated);
          return { id, ...updates };
        }
        throw error;
      }

      return data;
    } catch (catchedErr) {
      if (isTableMissingError(catchedErr)) {
        const existing = getLocalProjects();
        const updated = existing.map((p) =>
          String(p.id) === String(id) ? { ...p, ...updates } : p
        );
        saveLocalProjects(updated);
        return { id, ...updates };
      }
      throw catchedErr;
    }
  },

  async deleteProject(id) {
    try {
      const { error } = await withRetry(() =>
        supabase.from('projects').delete().eq('id', id)
      );

      if (error) {
        if (isTableMissingError(error)) {
          const existing = getLocalProjects();
          saveLocalProjects(existing.filter((p) => String(p.id) !== String(id)));
          return true;
        }
        throw error;
      }

      return true;
    } catch (catchedErr) {
      if (isTableMissingError(catchedErr)) {
        const existing = getLocalProjects();
        saveLocalProjects(existing.filter((p) => String(p.id) !== String(id)));
        return true;
      }
      throw catchedErr;
    }
  },
};

export default projectService;
