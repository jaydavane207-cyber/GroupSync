import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
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
  Tag,
  RefreshCw,
  AlertTriangle
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import supabase from '../lib/supabase';
import { withRetry, ErrorCard, SkeletonCard } from '../lib/withRetry';

// ─── Helper: create a notification for the project organizer ──────────────────
async function notifyOrganizer(project, applicant) {
  if (!project.organizer_id || project.organizer_id === applicant.id) return;
  await withRetry(() =>
    supabase.from('notifications').insert([{
      user_id: project.organizer_id,
      type: 'projects',
      title: 'New Project Application',
      message: `${applicant.name || 'A student'} applied to join "${project.title}".`,
      icon: '📋',
      action_label: 'View Project',
      action_path: '/projects',
      reference_id: String(project.id),
    }])
  );
}

export default function ProjectsPage() {
  const { user, showToast } = useAppContext();
  const [projects, setProjects] = useState([]);
  const [appliedIds, setAppliedIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retry, setRetry] = useState(0);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDomain, setSelectedDomain] = useState('all');
  const [selectedTimeline, setSelectedTimeline] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [applyingId, setApplyingId] = useState(null);

  // Real-time subscription ref
  const channelRef = useRef(null);

  // ── Fetch projects + my applications ──────────────────────────────────────
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    // Fetch projects
    const { data: projectsData, error: projectsErr } = await withRetry(() =>
      supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false })
    );

    if (projectsErr) {
      setError(projectsErr.userMessage || 'Failed to load projects.');
      setLoading(false);
      return;
    }

    setProjects(projectsData || []);

    // Fetch my applications (if logged in)
    if (user?.id) {
      const { data: appsData } = await withRetry(() =>
        supabase
          .from('project_applications')
          .select('project_id')
          .eq('applicant_id', user.id)
      );
      if (appsData) {
        setAppliedIds(new Set(appsData.map(a => a.project_id)));
      }
    }

    setLoading(false);
  }, [user?.id, retry]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ── Real-time subscription for new/updated projects ────────────────────────
  useEffect(() => {
    const channel = supabase
      .channel('projects-realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'projects' },
        (payload) => {
          setProjects(prev => [payload.new, ...prev]);
        }
      )
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'projects' },
        (payload) => {
          setProjects(prev => prev.map(p => p.id === payload.new.id ? payload.new : p));
        }
      )
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'projects' },
        (payload) => {
          setProjects(prev => prev.filter(p => p.id !== payload.old.id));
        }
      )
      .subscribe();

    channelRef.current = channel;
    return () => { supabase.removeChannel(channel); };
  }, []);

  // ── Apply to a project ────────────────────────────────────────────────────
  const handleApply = async (project) => {
    if (!user?.id) { showToast('Please log in to apply.', 'error'); return; }
    if (appliedIds.has(project.id)) return;

    setApplyingId(project.id);

    const { error: insertErr } = await withRetry(() =>
      supabase.from('project_applications').insert([{
        project_id: project.id,
        applicant_id: user.id,
        status: 'pending',
      }])
    );

    if (insertErr) {
      // 23505 = already applied
      if (insertErr.code === '23505') {
        setAppliedIds(prev => new Set([...prev, project.id]));
        showToast('You have already applied to this project.', 'info');
      } else {
        showToast(insertErr.userMessage || 'Application failed. Please try again.', 'error');
      }
      setApplyingId(null);
      return;
    }

    // Optimistic update
    setAppliedIds(prev => new Set([...prev, project.id]));
    showToast('Application sent successfully! The organizer will be in touch.', 'success');

    // Notify organizer (fire-and-forget)
    notifyOrganizer(project, user);

    setApplyingId(null);
  };

  // ── Create a new project ──────────────────────────────────────────────────
  const handleCreateProject = async (formData) => {
    if (!user?.id) { showToast('Please log in first.', 'error'); return false; }

    const projectPayload = {
      ...formData,
      organizer_id: user.id,
      organizer_name: user.name || 'Student Lead',
    };

    const { data, error: insertErr } = await withRetry(() =>
      supabase.from('projects').insert([projectPayload]).select().single()
    );

    if (insertErr) {
      showToast(insertErr.userMessage || 'Failed to create project. Please try again.', 'error');
      return false;
    }

    // Real-time will add it, but add immediately for instant feedback
    setProjects(prev => [data, ...prev]);
    setShowCreateModal(false);
    showToast('Project published to the campus board!', 'success');
    return true;
  };

  // ── Filter ────────────────────────────────────────────────────────────────
  const filteredProjects = useMemo(() => {
    return projects.filter(project => {
      const term = searchTerm.toLowerCase();
      const matchesSearch =
        !term ||
        project.title?.toLowerCase().includes(term) ||
        project.description?.toLowerCase().includes(term) ||
        project.skills?.some(s => s.toLowerCase().includes(term));

      const matchesDomain = selectedDomain === 'all' || project.domain === selectedDomain;
      const matchesTimeline = selectedTimeline === 'all' || project.timeline === selectedTimeline;
      const matchesDifficulty = selectedDifficulty === 'all' || project.difficulty === selectedDifficulty;

      return matchesSearch && matchesDomain && matchesTimeline && matchesDifficulty;
    });
  }, [projects, searchTerm, selectedDomain, selectedTimeline, selectedDifficulty]);

  const difficultyColors = {
    beginner: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    intermediate: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    advanced: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
  };

  const typeLabels = {
    hackathon: '⚡ Hackathon',
    project: '📋 Project',
    competition: '🏆 Competition',
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
        <div className="flex items-center gap-3">
          {!loading && (
            <button
              onClick={() => setRetry(r => r + 1)}
              title="Refresh"
              className="p-2.5 bg-gs-card border border-gs-border rounded-xl text-gs-text-muted hover:text-gs-cyan hover:border-gs-primary transition-all"
            >
              <RefreshCw size={18} />
            </button>
          )}
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-6 py-3 bg-gradient-to-r from-gs-primary to-gs-secondary text-white font-bold rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_rgba(0,240,255,0.3)] flex items-center gap-2"
          >
            <Plus size={20} /> Create Project
          </button>
        </div>
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
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gs-text-muted mb-2">Domain</label>
            <select value={selectedDomain} onChange={(e) => setSelectedDomain(e.target.value)}
              className="w-full px-4 py-2.5 bg-gs-bg border border-gs-border rounded-xl text-gs-text-main focus:border-gs-primary outline-none transition-colors text-sm font-medium">
              <option value="all">All Domains</option>
              <option value="ai-ml">AI & Machine Learning</option>
              <option value="web">Web & Blockchain</option>
              <option value="mobile">Mobile Applications</option>
              <option value="data">Data Science & Analytics</option>
              <option value="design">UI/UX & 3D Design</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gs-text-muted mb-2">Event Type</label>
            <select value={selectedTimeline} onChange={(e) => setSelectedTimeline(e.target.value)}
              className="w-full px-4 py-2.5 bg-gs-bg border border-gs-border rounded-xl text-gs-text-main focus:border-gs-primary outline-none transition-colors text-sm font-medium">
              <option value="all">All Event Types</option>
              <option value="hackathon">⚡ Hackathon</option>
              <option value="project">📋 Semester Project</option>
              <option value="competition">🏆 Competition & Bounty</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gs-text-muted mb-2">Skill Level</label>
            <select value={selectedDifficulty} onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="w-full px-4 py-2.5 bg-gs-bg border border-gs-border rounded-xl text-gs-text-main focus:border-gs-primary outline-none transition-colors text-sm font-medium">
              <option value="all">All Skill Levels</option>
              <option value="beginner">🟢 Beginner Friendly</option>
              <option value="intermediate">🟡 Intermediate</option>
              <option value="advanced">🔴 Advanced / Expert</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results count */}
      {!loading && !error && (
        <p className="text-xs text-gs-text-muted font-semibold px-1">
          Showing {filteredProjects.length} of {projects.length} projects
        </p>
      )}

      {/* Loading */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <SkeletonCard count={6} />
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <ErrorCard
          message={error}
          onRetry={() => setRetry(r => r + 1)}
        />
      )}

      {/* Projects Grid */}
      {!loading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
          {filteredProjects.map(project => {
            const isApplied = appliedIds.has(project.id);
            const isApplying = applyingId === project.id;
            const daysLeft = project.deadline
              ? Math.max(0, Math.ceil((new Date(project.deadline) - new Date()) / 86400000))
              : null;

            return (
              <div
                key={project.id}
                className="group bg-gs-card border border-gs-border rounded-3xl p-6 shadow-lg hover:border-gs-primary/50 hover:shadow-[0_10px_30px_rgba(0,240,255,0.15)] transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between mb-4">
                    <div className="text-4xl p-3 bg-gs-bg border border-gs-border rounded-2xl shadow-inner group-hover:scale-110 transition-transform">
                      {project.image || '🚀'}
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${difficultyColors[project.difficulty] || difficultyColors.intermediate}`}>
                      {project.difficulty}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-gs-text-main group-hover:text-gs-primary transition-colors line-clamp-1 mb-1">
                    {project.title}
                  </h3>
                  <p className="text-xs text-gs-cyan font-semibold mb-3">
                    Organized by {project.organizer_name || 'Campus Lead'}
                  </p>
                  <p className="text-sm text-gs-text-muted line-clamp-3 mb-5 leading-relaxed">
                    {project.description}
                  </p>

                  {/* Detail Pills */}
                  <div className="grid grid-cols-2 gap-2 mb-5 text-xs text-gs-text-muted">
                    <div className="flex items-center gap-1.5 bg-gs-bg/60 p-2 rounded-xl border border-gs-border">
                      <Calendar size={14} className={daysLeft !== null && daysLeft <= 3 ? 'text-rose-400' : 'text-gs-primary'} />
                      <span className={daysLeft !== null && daysLeft <= 3 ? 'text-rose-400 font-bold' : ''}>
                        {daysLeft !== null ? (daysLeft === 0 ? 'Due today' : `${daysLeft}d left`) : 'Ongoing'}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-gs-bg/60 p-2 rounded-xl border border-gs-border">
                      <Users size={14} className="text-gs-secondary" />
                      <span>Team: {project.team_size || 'Any'}</span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-gs-bg/60 p-2 rounded-xl border border-gs-border">
                      <Trophy size={14} className="text-amber-400" />
                      <span className="font-bold text-amber-300">{project.prize_pool || 'Certificate'}</span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-gs-bg/60 p-2 rounded-xl border border-gs-border">
                      <Zap size={14} className="text-emerald-400" />
                      <span>{typeLabels[project.timeline] || 'Project'}</span>
                    </div>
                  </div>

                  {/* Required Skills */}
                  <div className="mb-6">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-gs-text-muted mb-2 flex items-center gap-1">
                      <Tag size={12} /> Required Stack
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {(project.skills || []).map(skill => (
                        <span key={skill} className="px-2.5 py-0.5 bg-gs-bg border border-gs-border text-gs-text-main text-[11px] rounded-lg font-medium">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* CTA */}
                <button
                  onClick={() => handleApply(project)}
                  disabled={isApplied || isApplying}
                  className={`w-full py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
                    isApplied
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 cursor-default'
                      : isApplying
                        ? 'bg-gs-primary/50 text-[#050810] cursor-wait'
                        : 'bg-gs-primary text-[#050810] hover:bg-cyan-400 hover:shadow-[0_0_15px_rgba(0,240,255,0.4)] active:scale-98'
                  }`}
                >
                  {isApplied ? (
                    <><CheckCircle2 size={16} /> Application Sent</>
                  ) : isApplying ? (
                    <><RefreshCw size={16} className="animate-spin" /> Applying...</>
                  ) : (
                    <>Apply to Join <ExternalLink size={14} /></>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && filteredProjects.length === 0 && (
        <div className="text-center py-16 bg-gs-card border border-gs-border rounded-3xl p-8">
          <FolderKanban size={48} className="mx-auto text-gs-text-muted opacity-40 mb-3" />
          <p className="text-lg font-bold text-gs-text-main">
            {projects.length === 0 ? 'No projects yet' : 'No projects match the selected filters'}
          </p>
          <p className="text-sm text-gs-text-muted mt-1">
            {projects.length === 0
              ? 'Be the first to post a project or hackathon!'
              : 'Try clearing search keywords or switching filters'}
          </p>
          {projects.length === 0 && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="mt-4 px-5 py-2.5 bg-gs-primary text-[#050810] font-bold rounded-xl text-sm hover:bg-cyan-400 transition-all"
            >
              Post First Project
            </button>
          )}
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <CreateProjectModal
          onClose={() => setShowCreateModal(false)}
          onCreate={handleCreateProject}
        />
      )}
    </div>
  );
}

// ─── Create Project Modal ──────────────────────────────────────────────────────
function CreateProjectModal({ onClose, onCreate }) {
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
  const [submitting, setSubmitting] = useState(false);
  const [validationError, setValidationError] = useState('');

  const emojiOptions = ['🚀', '🤖', '🌐', '📱', '📊', '🎨', '🛡️', '⚡', '🔬', '🎮'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationError('');

    if (!title.trim()) { setValidationError('Project title is required.'); return; }
    if (!description.trim()) { setValidationError('Description is required.'); return; }
    if (description.trim().length < 20) { setValidationError('Description must be at least 20 characters.'); return; }

    const skills = skillsInput.split(',').map(s => s.trim()).filter(Boolean);

    setSubmitting(true);
    await onCreate({
      title: title.trim(),
      description: description.trim(),
      domain,
      difficulty,
      timeline,
      deadline: deadline || null,
      prize_pool: prizePool.trim() || 'Certificate & Swag',
      team_size: teamSize,
      skills: skills.length > 0 ? skills : ['General Development'],
      image: image || '🎯',
      spots_left: 3,
    });
    setSubmitting(false);
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

        {validationError && (
          <div className="mb-4 px-4 py-3 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-center gap-2 text-rose-400 text-sm font-medium">
            <AlertTriangle size={16} /> {validationError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Project Icon */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gs-text-muted mb-2">Project Icon</label>
            <div className="flex flex-wrap gap-2">
              {emojiOptions.map(e => (
                <button key={e} type="button" onClick={() => setImage(e)}
                  className={`text-2xl p-2 rounded-xl border transition-all ${image === e ? 'border-gs-primary bg-gs-primary/10 scale-110' : 'border-gs-border bg-gs-bg hover:border-gs-primary/50'}`}>
                  {e}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gs-text-muted mb-1">Project Title *</label>
            <input type="text" required placeholder="e.g. AI-Powered Medical Diagnosis Hub"
              value={title} onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2.5 bg-gs-bg border border-gs-border rounded-xl text-gs-text-main focus:border-gs-primary outline-none text-sm" />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gs-text-muted mb-1">Description *</label>
            <textarea required rows={3} placeholder="Explain the project goals, target milestones, and key requirements..."
              value={description} onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2.5 bg-gs-bg border border-gs-border rounded-xl text-gs-text-main focus:border-gs-primary outline-none text-sm resize-none" />
            <p className="text-[10px] text-gs-text-muted mt-1">{description.length} chars (min 20)</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gs-text-muted mb-1">Domain</label>
              <select value={domain} onChange={(e) => setDomain(e.target.value)}
                className="w-full px-4 py-2.5 bg-gs-bg border border-gs-border rounded-xl text-gs-text-main focus:border-gs-primary outline-none text-sm">
                <option value="ai-ml">AI & ML</option>
                <option value="web">Web & Blockchain</option>
                <option value="mobile">Mobile Development</option>
                <option value="data">Data Science</option>
                <option value="design">Design & 3D</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gs-text-muted mb-1">Type</label>
              <select value={timeline} onChange={(e) => setTimeline(e.target.value)}
                className="w-full px-4 py-2.5 bg-gs-bg border border-gs-border rounded-xl text-gs-text-main focus:border-gs-primary outline-none text-sm">
                <option value="hackathon">Hackathon</option>
                <option value="project">Project</option>
                <option value="competition">Competition</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gs-text-muted mb-1">Difficulty</label>
              <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)}
                className="w-full px-4 py-2.5 bg-gs-bg border border-gs-border rounded-xl text-gs-text-main focus:border-gs-primary outline-none text-sm">
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gs-text-muted mb-1">Deadline</label>
              <input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-2 bg-gs-bg border border-gs-border rounded-xl text-gs-text-main focus:border-gs-primary outline-none text-sm" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gs-text-muted mb-1">Prize / Incentive</label>
              <input type="text" placeholder="e.g. $3,000 / Certificates"
                value={prizePool} onChange={(e) => setPrizePool(e.target.value)}
                className="w-full px-4 py-2.5 bg-gs-bg border border-gs-border rounded-xl text-gs-text-main focus:border-gs-primary outline-none text-sm" />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gs-text-muted mb-1">Team Size</label>
              <input type="text" placeholder="e.g. 2-4"
                value={teamSize} onChange={(e) => setTeamSize(e.target.value)}
                className="w-full px-4 py-2.5 bg-gs-bg border border-gs-border rounded-xl text-gs-text-main focus:border-gs-primary outline-none text-sm" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gs-text-muted mb-1">Required Skills (comma separated)</label>
            <input type="text" placeholder="React, Python, Figma, PostgreSQL"
              value={skillsInput} onChange={(e) => setSkillsInput(e.target.value)}
              className="w-full px-4 py-2.5 bg-gs-bg border border-gs-border rounded-xl text-gs-text-main focus:border-gs-primary outline-none text-sm" />
          </div>

          <div className="flex gap-3 pt-4">
            <button type="button" onClick={onClose}
              className="flex-1 py-3 border border-gs-border rounded-xl text-gs-text-muted font-bold hover:bg-gs-bg transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={submitting}
              className="flex-1 py-3 bg-gradient-to-r from-gs-primary to-gs-secondary text-white font-bold rounded-xl hover:opacity-90 transition-opacity shadow-[0_0_15px_rgba(0,240,255,0.3)] disabled:opacity-60 flex items-center justify-center gap-2">
              {submitting ? <><RefreshCw size={16} className="animate-spin" /> Publishing...</> : 'Publish Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
