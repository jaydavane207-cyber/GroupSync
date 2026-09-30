import { Compass, Sparkles, AlertCircle, Zap } from 'lucide-react';

export const MOCK_FACTIONS = {
  innovators: { id: 'innovators', name: 'The Innovators', color: 'text-gs-cyan', bg: 'bg-gs-cyan', border: 'border-gs-cyan', icon: Zap, description: 'Creative thinkers who envision the future.' },
  architects: { id: 'architects', name: 'The Architects', color: 'text-gs-violet', bg: 'bg-gs-violet', border: 'border-gs-violet', icon: Compass, description: 'Structured builders who scale systems.' },
  creators: { id: 'creators', name: 'The Creators', color: 'text-gs-green', bg: 'bg-gs-green', border: 'border-gs-green', icon: Sparkles, description: 'Design-focused makers who polish experiences.' },
  debuggers: { id: 'debuggers', name: 'The Debuggers', color: 'text-gs-amber', bg: 'bg-gs-amber', border: 'border-gs-amber', icon: AlertCircle, description: 'Problem solvers who fix what is broken.' },
};

export const MOCK_STUDENTS = [
  { id: 1, name: 'Alice', year: '3rd Year', faction: 'innovators', avatar: '🦊', skills: ['React', 'Figma'], interests: ['Hackathons'], online: true },
  { id: 2, name: 'Bob', year: '2nd Year', faction: 'debuggers', avatar: '🤖', skills: ['Python', 'ML'], interests: ['AI'], online: true },
  { id: 3, name: 'Charlie', year: '4th Year', faction: 'architects', avatar: '🐺', skills: ['Node.js'], interests: ['Open Source'], online: false },
  { id: 4, name: 'Diana', year: '1st Year', faction: 'creators', avatar: '🦋', skills: ['UI/UX'], interests: ['Web3'], online: true },
  { id: 5, name: 'Ethan', year: '3rd Year', faction: 'innovators', avatar: '🦅', skills: ['Vue', 'React'], interests: ['Gaming'], online: false },
  { id: 6, name: 'Fiona', year: '2nd Year', faction: 'debuggers', avatar: '🐉', skills: ['Rust', 'C++'], interests: ['Hackathons'], online: true },
];

export const MOCK_GROUPS = [
  { id: 1, name: 'Quantum Hackers', event: 'Spring Hackathon', type: 'Hackathon', description: 'Building a quantum-resistant chat app using post-quantum cryptography.', skills: ['React', 'Python', 'Cryptography'], members: 3, maxMembers: 4, privacy: 'public' },
  { id: 2, name: 'Design Wizards', event: 'UI/UX Challenge', type: 'Cultural', description: 'Redesigning the campus portal for better accessibility and modern aesthetics.', skills: ['Figma', 'UI/UX', 'Accessibility'], members: 2, maxMembers: 3, privacy: 'public' },
  { id: 3, name: 'AI Models R Us', event: 'AI Summit', type: 'Technical', description: 'Training local LLMs on student-specific data for personalized study assistants.', skills: ['ML', 'Python', 'PyTorch'], members: 4, maxMembers: 4, privacy: 'private' },
  { id: 4, name: 'Chain Breakers', event: 'Web3 Weekend', type: 'Hackathon', description: 'Decentralized voting app for campus elections using Ethereum smart contracts.', skills: ['Solidity', 'Node.js', 'React'], members: 1, maxMembers: 4, privacy: 'public' },
  { id: 5, name: 'Game Jam Team', event: '48h Game Jam', type: 'Technical', description: 'Making a 2D platformer with procedurally generated levels and unique mechanics.', skills: ['C++', 'Unity', 'UI/UX'], members: 2, maxMembers: 5, privacy: 'public' },
  { id: 6, name: 'Cloud Pioneers', event: 'AWS Innovate', type: 'Technical', description: 'Deploying serverless architectures for scalable student management systems.', skills: ['AWS', 'Terraform', 'Node.js'], members: 1, maxMembers: 4, privacy: 'public' },
  { id: 7, name: 'Eco Warriors', event: 'Green Campus', type: 'Cultural', description: 'Organizing campus-wide environmental awareness and cleanup strategy.', skills: ['Leadership', 'Event Management'], members: 4, maxMembers: 10, privacy: 'public' },
  { id: 10, name: 'Secure Bytes', event: 'CyberSec Meetup', type: 'Technical', description: 'Penetration testing and security auditing of internal college network portals.', skills: ['Cybersecurity', 'Linux', 'Networking'], members: 2, maxMembers: 3, privacy: 'public' },
];

export const ONBOARDING_SKILLS = ['React', 'Python', 'UI/UX', 'ML', 'Figma', 'Node.js', 'C++', 'Java', 'Rust', 'Go', 'AWS', 'Docker', 'GraphQL', 'Next.js', 'Tailwind', 'SQL', 'MongoDB', 'CyberSecurity', 'Game Dev', 'Data Sci'];
export const ONBOARDING_INTERESTS = ['Hackathons', 'Open Source', 'Gaming', 'AI', 'Web3', 'Startups', 'Design', 'Comp. Programming', 'Robotics', 'Cloud', 'Mobile', 'FinTech', 'EdTech', 'AR/VR', 'Hardware'];
export const ONBOARDING_AVATARS = ['🦊', '🐉', '🤖', '🦋', '🐺', '🦅', '🐬', '🦁', '🐸', '🦄', '🐻', '🦖'];
export const ONBOARDING_QUIZ = [
  { q: "When a bug appears, you...", opts: [{t: "Try fresh approaches", f:"innovators"}, {t: "Trace it logically", f:"architects"}, {t: "Redesign the feature", f:"creators"}, {t: "Dive into logs to squash it", f:"debuggers"}] },
  { q: "In a team, you are the...", opts: [{t: "Idea Generator", f:"innovators"}, {t: "System Planner", f:"architects"}, {t: "Polisher", f:"creators"}, {t: "Problem Solver", f:"debuggers"}] },
  { q: "Preferred working hours?", opts: [{t: "Random bursts", f:"innovators"}, {t: "9 to 5 steady", f:"architects"}, {t: "Late night flow", f:"creators"}, {t: "Whenever things break", f:"debuggers"}] },
  { q: "Your workspace is...", opts: [{t: "Organized chaos", f:"innovators"}, {t: "Perfectly structured", f:"architects"}, {t: "Aesthetically pleasing", f:"creators"}, {t: "Multiple monitors", f:"debuggers"}] },
  { q: "First step in a project?", opts: [{t: "Brainstorming", f:"innovators"}, {t: "Architecture Doc", f:"architects"}, {t: "Moodboard", f:"creators"}, {t: "Setup tooling", f:"debuggers"}] },
  { q: "Favorite tech event?", opts: [{t: "Pitch competition", f:"innovators"}, {t: "Tech conference", f:"architects"}, {t: "Design sprint", f:"creators"}, {t: "24h Hackathon", f:"debuggers"}] },
];
