import React, { useState, useMemo } from 'react';
import { 
  FolderKanban, 
  Search, 
  Filter, 
  Plus, 
  Sparkles, 
  Calendar, 
  Users, 
  Trophy, 
  Clock, 
  Zap, 
  X, 
  CheckCircle2, 
  ExternalLink,
  Tag
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';

export default function ProjectsPage() {
  const { showToast } = useAppContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDomain, setSelectedDomain] = useState('all');
  const [selectedTimeline, setSelectedTimeline] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [appliedProjects, setAppliedProjects] = useState({});

  // Mock project & hackathon listings
  const [projects, setProjects] = useState([
    {
      id: 1,
      title: 'AI Chat Bot Challenge',
      domain: 'ai-ml',
      difficulty: 'intermediate',
      deadline: '2026-09-15',
      timeline: 'hackathon',
      teamSize: '2-4',
      skills: ['Python', 'NLP', 'Machine Learning', 'FastAPI'],
      prizePool: '$5,000',
      image: '🤖',
      description: 'Build an intelligent contextual assistant using state-of-the-art LLMs, RAG architecture, and agentic workflows.',
      organizer: 'AI Innovation Club',
      spotsLeft: 3
    },
    {
      id: 2,
      title: 'Web3 Decentralized Social Network',
      domain: 'web',
      difficulty: 'advanced',
      deadline: '2026-10-01',
      timeline: 'project',
      teamSize: '4-6',
      skills: ['React', 'Node.js', 'Solidity', 'Smart Contracts', 'IPFS'],
      prizePool: '$10,000',
      image: '🌐',
      description: 'Create a censorship-resistant decentralized social network with verifiable on-chain reputation and zero-knowledge identity.',
      organizer: 'Blockchain Vanguard',
      spotsLeft: 2
    },
    {
      id: 3,
      title: 'Real-time Climate & Weather Tracker',
      domain: 'mobile',
      difficulty: 'beginner',
      deadline: '2026-09-20',
      timeline: 'hackathon',
      teamSize: '2-3',
      skills: ['React Native', 'Tailwind CSS', 'REST APIs', 'UI/UX'],
      prizePool: '$2,000',
      image: '📱',
      description: 'Build an intuitive mobile application for localized real-time hyper-accurate weather warnings and air quality maps.',
      organizer: 'Mobile Dev Society',
      spotsLeft: 1
    },
    {
      id: 4,
      title: 'Campus Analytics & Predictive Dashboard',
      domain: 'data',
      difficulty: 'intermediate',
      deadline: '2026-09-28',
      timeline: 'competition',
      teamSize: '3-5',
      skills: ['Python', 'SQL', 'Data Visualization', 'Pandas', 'Streamlit'],
      prizePool: '$3,500',
      image: '📊',
      description: 'Analyze campus data patterns, study group utilization, and event metrics with interactive visualization and ML forecasting.',
      organizer: 'Data Science Club',
      spotsLeft: 4
    },
    {
      id: 5,
      title: 'Immersive VR Campus Tour Experience',
      domain: 'design',
      difficulty: 'intermediate',
      deadline: '2026-10-15',
      timeline: 'project',
      teamSize: '3-4',
      skills: ['Three.js', 'Figma', 'UI/UX Design', 'WebGL'],
      prizePool: '$4,000',
      image: '🎨',
      description: 'Design and prototype a 3D interactive virtual campus experience for prospective students and international visitors.',
      organizer: 'Creative Media Lab',
      spotsLeft: 2
    },
    {
      id: 6,
      title: 'Cybersecurity Threat Detection Engine',
      domain: 'ai-ml',
      difficulty: 'advanced',
      deadline: '2026-09-30',
      timeline: 'competition',
      teamSize: '2-4',
      skills: ['Python', 'Network Security', 'Wireshark', 'Anomaly Detection'],
      prizePool: '$7,500',
      image: '🛡️',
      description: 'Develop an automated packet inspection and anomaly detection system for spotting zero-day threats in real time.',
      organizer: 'Cyber Security Guild',
      spotsLeft: 3
    }
  ]);

  const filteredProjects = useMemo(() => {
    return projects.filter(project => {
      const matchesSearch = 
        project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.skills.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesDomain = selectedDomain === 'all' || project.domain === selectedDomain;
      const matchesTimeline = selectedTimeline === 'all' || project.timeline === selectedTimeline;
      const matchesDifficulty = selectedDifficulty === 'all' || project.difficulty === selectedDifficulty;

      return matchesSearch && matchesDomain && matchesTimeline && matchesDifficulty;
    });
  }, [projects, searchTerm, selectedDomain, selectedTimeline, selectedDifficulty]);

  const handleApply = (projectId) => {
    setAppliedProjects(prev => ({ ...prev, [projectId]: true }));
    showToast('Application sent successfully to project organizer!', 'success');
  };

  const handleCreateProject = (newProj) => {
    setProjects(prev => [newProj, ...prev]);
    setShowCreateModal(false);
    showToast('Project created & published to campus board!', 'success');
  };

  return (
    <div className="space-y-8 animate-[slideIn_0.3s_ease-out]">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative z-10">
        <div>
          <h1 className="text-4xl lg:text-5xl font-black font-heading text-gs-text-main tracking-tight drop-shadow-sm flex items-center gap-3">
            <FolderKanban className="text-gs-cyan w-10 h-10" /> Projects & Hackathons
          </h1>
          <p className="text-gs-text-muted mt-2 text-lg font-medium">
            Explore live hackathons, ongoing capstone projects, and campus bounty challenges.
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-6 py-3 bg-gradient-to-r from-gs-primary to-gs-secondary text-white font-bold rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_rgba(0,240,255,0.3)] flex items-center gap-2"
        >
          <Plus size={20} /> Create Project
        </button>
      </div>

      {/* Search & Filters */}
      <div className="bg-gs-card border border-gs-border rounded-3xl p-6 shadow-xl relative z-10 backdrop-blur-xl">
        <div className="flex items-center gap-3 bg-gs-bg/60 border border-gs-border rounded-2xl px-4 py-3 mb-6 focus-within:border-gs-primary transition-colors">
          <Search className="text-gs-text-muted shrink-0" size={20} />
          <input
            type="text"
            placeholder="Search by title, description, or skill (e.g. React, Python, NLP)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-transparent border-none outline-none text-gs-text-main placeholder-gs-text-muted text-base"
          />
          {searchTerm && (
            <button onClick={() => setSearchTerm('')} className="text-gs-text-muted hover:text-gs-text-main">
              <X size={18} />
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Domain Filter */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gs-text-muted mb-2">Domain</label>
            <select
              value={selectedDomain}
              onChange={(e) => setSelectedDomain(e.target.value)}
              className="w-full px-4 py-2.5 bg-gs-bg border border-gs-border rounded-xl text-gs-text-main focus:border-gs-primary outline-none transition-colors text-sm font-medium"
            >
              <option value="all">All Domains</option>
              <option value="ai-ml">AI & Machine Learning</option>
              <option value="web">Web & Blockchain</option>
              <option value="mobile">Mobile Applications</option>
              <option value="data">Data Science & Analytics</option>
              <option value="design">UI/UX & 3D Design</option>
            </select>
          </div>

          {/* Type Filter */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gs-text-muted mb-2">Event Type</label>
            <select
              value={selectedTimeline}
              onChange={(e) => setSelectedTimeline(e.target.value)}
              className="w-full px-4 py-2.5 bg-gs-bg border border-gs-border rounded-xl text-gs-text-main focus:border-gs-primary outline-none transition-colors text-sm font-medium"
            >
              <option value="all">All Event Types</option>
              <option value="hackathon">⚡ Hackathon</option>
              <option value="project">📋 Semester Project</option>
              <option value="competition">🏆 Competition & Bounty</option>
            </select>
          </div>

          {/* Difficulty Filter */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gs-text-muted mb-2">Skill Level</label>
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="w-full px-4 py-2.5 bg-gs-bg border border-gs-border rounded-xl text-gs-text-main focus:border-gs-primary outline-none transition-colors text-sm font-medium"
            >
              <option value="all">All Skill Levels</option>
              <option value="beginner">🟢 Beginner Friendly</option>
              <option value="intermediate">🟡 Intermediate</option>
              <option value="advanced">🔴 Advanced / Expert</option>
            </select>
          </div>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
        {filteredProjects.map(project => {
          const difficultyColors = {
            beginner: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
            intermediate: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
            advanced: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
          };

          const typeEmojis = {
            hackathon: '⚡ Hackathon',
            project: '📋 Project',
            competition: '🏆 Competition',
          };

          const isApplied = appliedProjects[project.id];

          return (
            <div
              key={project.id}
              className="group bg-gs-card border border-gs-border rounded-3xl p-6 shadow-lg hover:border-gs-primary/50 hover:shadow-[0_10px_30px_rgba(0,240,255,0.15)] transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between mb-4">
                  <div className="text-4xl p-3 bg-gs-bg border border-gs-border rounded-2xl shadow-inner group-hover:scale-110 transition-transform">
                    {project.image}
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${difficultyColors[project.difficulty]}`}>
                    {project.difficulty}
                  </span>
                </div>

                <h3 className="text-xl font-bold text-gs-text-main group-hover:text-gs-primary transition-colors line-clamp-1 mb-1">
                  {project.title}
                </h3>
                <p className="text-xs text-gs-cyan font-semibold mb-3">Organized by {project.organizer}</p>
                <p className="text-sm text-gs-text-muted line-clamp-3 mb-5 leading-relaxed">
                  {project.description}
                </p>

                {/* Details Pills */}
                <div className="grid grid-cols-2 gap-2 mb-5 text-xs text-gs-text-muted">
                  <div className="flex items-center gap-1.5 bg-gs-bg/60 p-2 rounded-xl border border-gs-border">
                    <Calendar size={14} className="text-gs-primary" />
                    <span>Due: {new Date(project.deadline).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-gs-bg/60 p-2 rounded-xl border border-gs-border">
                    <Users size={14} className="text-gs-secondary" />
                    <span>Team: {project.teamSize}</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-gs-bg/60 p-2 rounded-xl border border-gs-border">
                    <Trophy size={14} className="text-amber-400" />
                    <span className="font-bold text-amber-300">{project.prizePool}</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-gs-bg/60 p-2 rounded-xl border border-gs-border">
                    <Zap size={14} className="text-emerald-400" />
                    <span>{typeEmojis[project.timeline] || 'Project'}</span>
                  </div>
                </div>

                {/* Required Skills */}
                <div className="mb-6">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-gs-text-muted mb-2 flex items-center gap-1">
                    <Tag size={12} /> Required Stack
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {project.skills.map(skill => (
                      <span
                        key={skill}
                        className="px-2.5 py-0.5 bg-gs-bg border border-gs-border text-gs-text-main text-[11px] rounded-lg font-medium"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={() => handleApply(project.id)}
                disabled={isApplied}
                className={`w-full py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
                  isApplied
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 cursor-default'
                    : 'bg-gs-primary text-[#050810] hover:bg-cyan-400 hover:shadow-[0_0_15px_rgba(0,240,255,0.4)] active:scale-98'
                }`}
              >
                {isApplied ? (
                  <>
                    <CheckCircle2 size={16} /> Application Sent
                  </>
                ) : (
                  <>
                    Apply to Join <ExternalLink size={14} />
                  </>
                )}
              </button>
            </div>
          );
        })}
      </div>

      {filteredProjects.length === 0 && (
        <div className="text-center py-16 bg-gs-card border border-gs-border rounded-3xl p-8">
          <FolderKanban size={48} className="mx-auto text-gs-text-muted opacity-40 mb-3" />
          <p className="text-lg font-bold text-gs-text-main">No projects match the selected filters</p>
          <p className="text-sm text-gs-text-muted mt-1">Try clearing search keywords or switching filters</p>
        </div>
      )}

      {/* Create Project Modal */}
      {showCreateModal && (
        <CreateProjectModal 
          onClose={() => setShowCreateModal(false)}
          onCreate={handleCreateProject}
        />
      )}
    </div>
  );
}

const CreateProjectModal = ({ onClose, onCreate }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [domain, setDomain] = useState('ai-ml');
  const [difficulty, setDifficulty] = useState('intermediate');
  const [timeline, setTimeline] = useState('hackathon');
  const [deadline, setDeadline] = useState('');
  const [prizePool, setPrizePool] = useState('');
  const [teamSize, setTeamSize] = useState('2-4');
  const [skillsInput, setSkillsInput] = useState('');
  const [image, setImage] = useState('🚀');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    const skills = skillsInput
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);

    onCreate({
      id: Date.now(),
      title: title.trim(),
      description: description.trim(),
      domain,
      difficulty,
      timeline,
      deadline: deadline || '2026-10-30',
      prizePool: prizePool.trim() || 'Certificate & Swag',
      teamSize,
      skills: skills.length > 0 ? skills : ['General Development'],
      organizer: 'Student Lead',
      image: image || '🎯',
      spotsLeft: 3
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-[slideIn_0.2s_ease-out]">
      <div className="bg-gs-card border border-gs-border rounded-3xl p-8 max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-black font-heading text-gs-text-main flex items-center gap-2">
            <Sparkles className="text-gs-cyan" /> Post New Project / Event
          </h2>
          <button onClick={onClose} className="p-2 text-gs-text-muted hover:text-gs-text-main rounded-xl hover:bg-gs-bg">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gs-text-muted mb-1">Project Title *</label>
            <input
              type="text"
              required
              placeholder="e.g. AI-Powered Medical Diagnosis Hub"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2.5 bg-gs-bg border border-gs-border rounded-xl text-gs-text-main focus:border-gs-primary outline-none text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gs-text-muted mb-1">Description *</label>
            <textarea
              required
              rows={3}
              placeholder="Explain the project goals, target milestones, and key requirements..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2.5 bg-gs-bg border border-gs-border rounded-xl text-gs-text-main focus:border-gs-primary outline-none text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gs-text-muted mb-1">Domain</label>
              <select
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                className="w-full px-4 py-2.5 bg-gs-bg border border-gs-border rounded-xl text-gs-text-main focus:border-gs-primary outline-none text-sm"
              >
                <option value="ai-ml">AI & ML</option>
                <option value="web">Web & Blockchain</option>
                <option value="mobile">Mobile Development</option>
                <option value="data">Data Science</option>
                <option value="design">Design & 3D</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gs-text-muted mb-1">Type</label>
              <select
                value={timeline}
                onChange={(e) => setTimeline(e.target.value)}
                className="w-full px-4 py-2.5 bg-gs-bg border border-gs-border rounded-xl text-gs-text-main focus:border-gs-primary outline-none text-sm"
              >
                <option value="hackathon">Hackathon</option>
                <option value="project">Project</option>
                <option value="competition">Competition</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gs-text-muted mb-1">Difficulty</label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="w-full px-4 py-2.5 bg-gs-bg border border-gs-border rounded-xl text-gs-text-main focus:border-gs-primary outline-none text-sm"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gs-text-muted mb-1">Deadline</label>
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full px-4 py-2 bg-gs-bg border border-gs-border rounded-xl text-gs-text-main focus:border-gs-primary outline-none text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gs-text-muted mb-1">Prize / Incentive</label>
              <input
                type="text"
                placeholder="e.g. $3,000 / Certificates"
                value={prizePool}
                onChange={(e) => setPrizePool(e.target.value)}
                className="w-full px-4 py-2.5 bg-gs-bg border border-gs-border rounded-xl text-gs-text-main focus:border-gs-primary outline-none text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gs-text-muted mb-1">Team Size</label>
              <input
                type="text"
                placeholder="e.g. 2-4"
                value={teamSize}
                onChange={(e) => setTeamSize(e.target.value)}
                className="w-full px-4 py-2.5 bg-gs-bg border border-gs-border rounded-xl text-gs-text-main focus:border-gs-primary outline-none text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gs-text-muted mb-1">Required Skills (comma separated)</label>
            <input
              type="text"
              placeholder="React, Python, Figma, PostgreSQL"
              value={skillsInput}
              onChange={(e) => setSkillsInput(e.target.value)}
              className="w-full px-4 py-2.5 bg-gs-bg border border-gs-border rounded-xl text-gs-text-main focus:border-gs-primary outline-none text-sm"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 border border-gs-border rounded-xl text-gs-text-muted font-bold hover:bg-gs-bg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-3 bg-gradient-to-r from-gs-primary to-gs-secondary text-white font-bold rounded-xl hover:opacity-90 transition-opacity shadow-[0_0_15px_rgba(0,240,255,0.3)]"
            >
              Publish Project
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
