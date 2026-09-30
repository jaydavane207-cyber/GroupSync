import supabase from './supabase';
// NOTE: This script is intended to be run in a Node.js environment or directly within the app during dev.
// For this task, I'll provide the logic. The user can trigger this from a dev console or I can try to run it if I have node access.

const MOCK_STUDENTS = [
  { id: 1, name: 'Alice', year: '3rd Year', faction: 'innovators', avatar: '🦊', skills: ['React', 'Figma'], interests: ['Hackathons'], online: true, email: 'alice@example.edu' },
  { id: 2, name: 'Bob', year: '2nd Year', faction: 'debuggers', avatar: '🤖', skills: ['Python', 'ML'], interests: ['AI'], online: true, email: 'bob@example.edu' },
  { id: 3, name: 'Charlie', year: '4th Year', faction: 'architects', avatar: '🐺', skills: ['Node.js'], interests: ['Open Source'], online: false, email: 'charlie@example.edu' },
  { id: 4, name: 'Diana', year: '1st Year', faction: 'creators', avatar: '🦋', skills: ['UI/UX'], interests: ['Web3'], online: true, email: 'diana@example.edu' },
  { id: 5, name: 'Ethan', year: '3rd Year', faction: 'innovators', avatar: '🦅', skills: ['Vue', 'React'], interests: ['Gaming'], online: false, email: 'ethan@example.edu' },
  { id: 6, name: 'Fiona', year: '2nd Year', faction: 'debuggers', avatar: '🐉', skills: ['Rust', 'C++'], interests: ['Hackathons'], online: true, email: 'fiona@example.edu' },
];

const MOCK_GROUPS = [
  { id: 1, name: 'Quantum Hackers', event: 'Spring Hackathon', type: 'Hackathon', description: 'Building a quantum-resistant chat app using post-quantum cryptography.', skills: ['React', 'Python', 'Cryptography'], members: 3, maxMembers: 4, privacy: 'public' },
  { id: 2, name: 'Design Wizards', event: 'UI/UX Challenge', type: 'Cultural', description: 'Redesigning the campus portal for better accessibility and modern aesthetics.', skills: ['Figma', 'UI/UX', 'Accessibility'], members: 2, maxMembers: 3, privacy: 'public' },
  { id: 3, name: 'AI Models R Us', event: 'AI Summit', type: 'Technical', description: 'Training local LLMs on student-specific data for personalized study assistants.', skills: ['ML', 'Python', 'PyTorch'], members: 4, maxMembers: 4, privacy: 'private' },
  { id: 4, name: 'Chain Breakers', event: 'Web3 Weekend', type: 'Hackathon', description: 'Decentralized voting app for campus elections using Ethereum smart contracts.', skills: ['Solidity', 'Node.js', 'React'], members: 1, maxMembers: 4, privacy: 'public' },
  { id: 5, name: 'Game Jam Team', event: '48h Game Jam', type: 'Technical', description: 'Making a 2D platformer with procedurally generated levels and unique mechanics.', skills: ['C++', 'Unity', 'UI/UX'], members: 2, maxMembers: 5, privacy: 'public' },
  { id: 6, name: 'Cloud Pioneers', event: 'AWS Innovate', type: 'Technical', description: 'Deploying serverless architectures for scalable student management systems.', skills: ['AWS', 'Terraform', 'Node.js'], members: 1, maxMembers: 4, privacy: 'public' },
  { id: 7, name: 'Eco Warriors', event: 'Green Campus', type: 'Cultural', description: 'Organizing campus-wide environmental awareness and cleanup strategy.', skills: ['Leadership', 'Event Management'], members: 4, maxMembers: 10, privacy: 'public' },
  { id: 8, name: 'Data Ninjas', event: 'Data Science Fest', type: 'Technical', description: 'Real-time traffic analysis using Scikit-learn and streaming data pipelines.', skills: ['Python', 'Pandas', 'Spark'], members: 2, maxMembers: 4, privacy: 'public' },
  { id: 9, name: 'Mobile Mavericks', event: 'App-a-thon', type: 'Hackathon', description: 'Building a cross-platform food delivery app tailored for late-night study sessions.', skills: ['Flutter', 'Firebase', 'Dart'], members: 3, maxMembers: 4, privacy: 'public' },
  { id: 10, name: 'Secure Bytes', event: 'CyberSec Meetup', type: 'Technical', description: 'Penetration testing and security auditing of internal college network portals.', skills: ['Cybersecurity', 'Linux', 'Networking'], members: 2, maxMembers: 3, privacy: 'public' },
];

export async function seedDatabase(currentUser) {
  if (!currentUser) return { error: 'No user logged in to seed database.' };

  console.log('Seeding groups...');
  const groupsToInsert = MOCK_GROUPS.map((g) => ({
    name: g.name,
    event: g.event,
    type: g.type,
    description: g.description,
    skills: g.skills, // Supabase SDK handles arrays/objects for JSONB automatically
    members: g.members,
    max_members: g.maxMembers,
    privacy: g.privacy,
    admin_id: currentUser.id
  }));

  const { data: insertedGroups, error: groupError } = await supabase
    .from('groups')
    .insert(groupsToInsert)
    .select();

  if (groupError) {
    console.error('Error seeding groups:', groupError);
    return { error: groupError.message };
  }

  console.log('Seeding group members...');
  const memberships = insertedGroups.map((g) => ({
    group_id: g.id,
    profile_id: currentUser.id
  }));

  const { error: memberError } = await supabase
    .from('group_members')
    .insert(memberships);

  if (memberError) {
    console.error('Error seeding memberships:', memberError);
    return { error: memberError.message };
  }

  console.log('Seeding complete!');
  return { success: true };
}
