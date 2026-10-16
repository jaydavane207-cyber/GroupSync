import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
  FolderKanban,
  Search,
  Plus,
  Calendar,
  Trophy,
  X,
  RefreshCw,
  AlertTriangle,
  ArrowRight,
  Check
} from 'lucide-react';
import { useAppContext } from '@/context/AppContext';
import supabase from '@/lib/supabase';
import { withRetry, ErrorCard, SkeletonCard } from '@/lib/withRetry';
import storage from '@/lib/utils/localStorage';
import {
  SAMPLE_PROJECTS,
  isTableMissingError,
  getLocalProjects,
  saveLocalProjects
} from '@/lib/services/projectService';

const getLocalAppliedIds = (userId) =>
  storage.get(`groupsync_applied_project_ids_${userId}`, []);
const saveLocalAppliedIds = (userId, ids) =>
  storage.set(`groupsync_applied_project_ids_${userId}`, ids);

// Helper: notify organizer
async function notifyOrganizer(project, applicant) {
  if (!project.organizer_id || project.organizer_id === applicant.id) return;
  try {
    await withRetry(() =>
      supabase.from('notifications').insert([{
        user_id: project.organizer_id,
        type: 'projects',
        title: 'New project application',
        message: `${applicant.name || 'A student'} applied to join "${project.title}".`,
        icon: '📋',
        action_label: 'View project',
        action_path: '/projects',
        reference_id: String(project.id),
      }])
    );
  } catch {
    // Non-blocking notification failure
  }
}

export default function ProjectsPage() {
  const { user, showToast } = useAppContext();
  const [projects, setProjects] = useState([]);
  const [appliedIds, setAppliedIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retry, setRetry] = useState(0);
  const [isOfflineMode, setIsOfflineMode] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDomain, setSelectedDomain] = useState('all');
  const [selectedTimeline, setSelectedTimeline] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [applyingId, setApplyingId] = useState(null);

  const channelRef = useRef(null);

  // Fetch projects + my applications
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    let projs = [];
    let isOffline = false;

    try {
      const { data: projectsData, error: projectsErr } = await withRetry(() =>
        supabase
          .from('projects')
          .select('*')
          .order('created_at', { ascending: false })
      );

      if (projectsErr) {
        if (isTableMissingError(projectsErr)) {
          isOffline = true;
          const localList = getLocalProjects();
          projs = [...localList, ...SAMPLE_PROJECTS];
        } else {
          setError(projectsErr.userMessage || 'Failed to load projects.');
          setLoading(false);
          return;
        }
      } else {
        projs = projectsData || [];
      }
    } catch (catchedErr) {
      if (isTableMissingError(catchedErr)) {
        isOffline = true;
        const localList = getLocalProjects();
        projs = [...localList, ...SAMPLE_PROJECTS];
      } else {
        setError(catchedErr.message || 'Failed to load projects.');
        setLoading(false);
        return;
      }
    }

    setIsOfflineMode(isOffline);
    setProjects(projs);

    if (user?.id) {
      if (isOffline) {
        const localApps = getLocalAppliedIds(user.id);
        setAppliedIds(new Set(localApps));
      } else {
        try {
          const { data: appsData, error: appsErr } = await withRetry(() =>
            supabase
              .from('project_applications')
              .select('project_id')
              .eq('applicant_id', user.id)
          );
          if (appsErr && isTableMissingError(appsErr)) {
            const localApps = getLocalAppliedIds(user.id);
            setAppliedIds(new Set(localApps));
          } else if (appsData) {
            setAppliedIds(new Set(appsData.map(a => a.project_id)));
          }
        } catch {
          const localApps = getLocalAppliedIds(user.id);
          setAppliedIds(new Set(localApps));
        }
      }
    }

    setLoading(false);
  }, [user?.id, retry]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Real-time subscription
  useEffect(() => {
    let channel;
    try {
      channel = supabase
        .channel('projects-realtime')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'projects' },
          (payload) => {
            if (payload?.new) {
              setProjects(prev => [payload.new, ...prev.filter(p => p.id !== payload.new.id)]);
            }
          }
        )
        .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'projects' },
          (payload) => {
            if (payload?.new) {
              setProjects(prev => prev.map(p => p.id === payload.new.id ? payload.new : p));
            }
          }
        )
        .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'projects' },
          (payload) => {
            if (payload?.old?.id) {
              setProjects(prev => prev.filter(p => p.id !== payload.old.id));
            }
          }
        )
        .subscribe();

      channelRef.current = channel;
    } catch {
      // Non-blocking realtime subscription
    }
    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, []);

  const handleApply = async (project) => {
    if (!user?.id) { showToast('Please log in to apply.', 'error'); return; }
    if (appliedIds.has(project.id)) return;

    setApplyingId(project.id);

    let succeeded = false;
    if (!isOfflineMode) {
      try {
        const { error: insertErr } = await withRetry(() =>
          supabase.from('project_applications').insert([{
            project_id: project.id,
            applicant_id: user.id,
            status: 'pending',
          }])
        );

        if (!insertErr) {
          succeeded = true;
        } else if (isTableMissingError(insertErr)) {
          succeeded = true;
        } else {
          showToast('Could not submit application: ' + (insertErr.userMessage || insertErr.message), 'error');
        }
      } catch (err) {
        if (isTableMissingError(err)) {
          succeeded = true;
        } else {
          showToast('Could not submit application.', 'error');
        }
      }
    } else {
      succeeded = true;
    }

    setApplyingId(null);

    if (succeeded) {
      const nextSet = new Set([...appliedIds, project.id]);
      setAppliedIds(nextSet);
      saveLocalAppliedIds(user.id, Array.from(nextSet));
      showToast('Application sent to organizer.', 'success');
      try {
        await notifyOrganizer(project, user);
      } catch {
        // Non-blocking notification
      }
    }
  };

  const handleCreateProject = async (newProj) => {
    if (!user?.id) { showToast('Please log in to post a project.', 'error'); return; }

    const projectPayload = {
      ...newProj,
      organizer_id: user.id,
      organizer_name: user.name || user.email?.split('@')[0] || 'Campus Student',
    };

    let createdItem = null;

    if (!isOfflineMode) {
      try {
        const { data, error: insertErr } = await withRetry(() =>
          supabase.from('projects').insert([projectPayload]).select().single()
        );

        if (insertErr) {
          if (isTableMissingError(insertErr)) {
            // fallback to local creation
          } else {
            showToast('Failed to post project: ' + (insertErr.userMessage || insertErr.message), 'error');
            return;
          }
        } else {
          createdItem = data;
        }
      } catch (e) {
        if (!isTableMissingError(e)) {
          showToast('Failed to post project.', 'error');
          return;
        }
      }
    }

    if (!createdItem) {
      createdItem = {
        ...projectPayload,
        id: 'local-proj-' + Date.now(),
        created_at: new Date().toISOString(),
      };
      const existing = getLocalProjects();
      saveLocalProjects([createdItem, ...existing]);
    }

    setProjects(prev => [createdItem, ...prev]);
    setShowCreateModal(false);
    showToast('Project published successfully.', 'success');
  };

  const filteredProjects = useMemo(() => {
    return projects.filter(project => {
      const term = searchTerm.toLowerCase();
      const matchesSearch = !term ||
        project.title?.toLowerCase().includes(term) ||
        project.description?.toLowerCase().includes(term) ||
        project.skills?.some(s => s.toLowerCase().includes(term));

      const matchesDomain = selectedDomain === 'all' || project.domain === selectedDomain;
      const matchesTimeline = selectedTimeline === 'all' || project.timeline === selectedTimeline;
      const matchesDifficulty = selectedDifficulty === 'all' || project.difficulty === selectedDifficulty;

      return matchesSearch && matchesDomain && matchesTimeline && matchesDifficulty;
    });
  }, [projects, searchTerm, selectedDomain, selectedTimeline, selectedDifficulty]);

  const difficultyLabels = {
    beginner: 'Beginner',
    intermediate: 'Intermediate',
    advanced: 'Advanced',
  };

  const difficultyColors = {
    beginner: 'bg-green-500/10 text-green-500 border-green-500/20',
    intermediate: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    advanced: 'bg-red-500/10 text-red-500 border-red-500/20',
  };

  const typeLabels = {
    hackathon: 'Hackathon',
    project: 'Capstone',
    competition: 'Competition',
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Offline / Table missing fallback indicator */}
      {isOfflineMode && (
        <div className="flex items-center justify-between gap-3 px-4 py-2.5 rounded-xl border border-amber-500/20 bg-amber-500/10 text-amber-300 text-xs machined-edge animate-fadeIn">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse shrink-0" />
            <span>
              <strong>Preview Mode:</strong> Projects database table is initializing. Displaying campus hackathons & projects.
            </span>
          </div>
          <span className="text-[11px] text-amber-200/70 hidden sm:inline">Local applications & posting active</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-gs-border">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-gs-text-main">
            Projects & hackathons
          </h1>
          <p className="text-sm text-gs-text-muted mt-1 max-w-2xl">
            Explore live hackathons, capstones recruiting specialists, and campus bounty challenges.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          {!loading && (
            <button
              onClick={() => setRetry(r => r + 1)}
              title="Refresh"
              className="p-2 glass-card rounded-lg text-gs-text-muted hover:text-gs-text-main hover:bg-black/5 dark:hover:bg-white/[0.04] transition-colors"
            >
              <RefreshCw size={15} />
            </button>
          )}
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-3.5 py-2 bg-gradient-to-r from-[#7c6af6] to-[#a78bfa] hover:from-[#6155e0] hover:to-[#9178f4] text-white font-medium rounded-lg transition-colors shadow-xs flex items-center gap-1.5 text-xs btn-tactile"
          >
            <Plus size={15} /> Post project
          </button>
        </div>
      </div>

      {/* Search & Filters in clean aligned row */}
      <div className="glass-card rounded-xl p-3 shadow-xs space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2.5">
          <div className="relative flex items-center glass-elevated rounded-lg px-3 py-1.5 focus-within:border-[#7c6af6] focus-within:ring-1 focus-within:ring-[#6D6AF6] transition-colors md:col-span-1">
            <Search className="text-gs-text-muted shrink-0 mr-2" size={14} />
            <input
              type="text"
              placeholder="Search projects or skills..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-transparent border-none outline-none text-gs-text-main placeholder-gs-text-muted text-xs"
            />
            {searchTerm && (
              <button onClick={() => setSearchTerm('')} className="text-gs-text-muted hover:text-gs-text-main">
                <X size={13} />
              </button>
            )}
          </div>

          <div>
            <select 
              value={selectedDomain} 
              onChange={(e) => setSelectedDomain(e.target.value)}
              className="w-full px-2.5 py-1.5 glass-elevated rounded-lg text-gs-text-main focus:border-[#7c6af6] outline-none text-xs"
            >
              <option value="all">All domains</option>
              <option value="ai-ml">AI & machine learning</option>
              <option value="web">Web & blockchain</option>
              <option value="mobile">Mobile applications</option>
              <option value="data">Data science</option>
              <option value="design">UI/UX & design</option>
            </select>
          </div>
          <div>
            <select 
              value={selectedTimeline} 
              onChange={(e) => setSelectedTimeline(e.target.value)}
              className="w-full px-2.5 py-1.5 glass-elevated rounded-lg text-gs-text-main focus:border-[#7c6af6] outline-none text-xs"
            >
              <option value="all">All formats</option>
              <option value="hackathon">Hackathons</option>
              <option value="project">Capstone projects</option>
              <option value="competition">Competitions</option>
            </select>
          </div>
          <div>
            <select 
              value={selectedDifficulty} 
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="w-full px-2.5 py-1.5 glass-elevated rounded-lg text-gs-text-main focus:border-[#7c6af6] outline-none text-xs"
            >
              <option value="all">All skill levels</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results count */}
      {!loading && !error && (
        <div className="flex items-center justify-between text-xs text-gs-text-muted px-1">
          <span>{filteredProjects.length} campus project{filteredProjects.length === 1 ? '' : 's'} available</span>
          {appliedIds.size > 0 && (
            <span className="text-[#9182f8] font-medium">Applied to {appliedIds.size}</span>
          )}
        </div>
      )}

      {/* Loading Skeleton */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProjects.map(project => {
            const isApplied = appliedIds.has(project.id);
            const isApplying = applyingId === project.id;
            const daysLeft = project.deadline
              ? Math.max(0, Math.ceil((new Date(project.deadline).getTime() - Date.now()) / 86400000))
              : null;

            const diffColor = project.difficulty === 'beginner' 
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
              : project.difficulty === 'advanced'
              ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
              : 'bg-[#6D6AF6]/10 text-[#7E7BF8] border-[#7c6af6]/20';

            return (
              <div
                key={project.id}
                className="glass-card rounded-xl p-5 shadow-xs hover:border-gs-border-hover transition-colors flex flex-col justify-between machined-edge"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="w-8 h-8 rounded-lg bg-[#6D6AF6]/10 flex items-center justify-center text-[#9182f8] shrink-0">
                      <FolderKanban size={16} />
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-medium border border-gs-border bg-white/[0.04] text-gs-text-muted">
                        {typeLabels[project.timeline] || 'Project'}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${diffColor}`}>
                        {difficultyLabels[project.difficulty] || project.difficulty}
                      </span>
                    </div>
                  </div>

                  <h3 className="text-sm font-semibold text-gs-text-main line-clamp-1 mb-0.5">
                    {project.title}
                  </h3>
                  <p className="text-xs text-gs-text-muted mb-2">
                    Led by {project.organizer_name || 'Campus Student'}
                  </p>
                  <p className="text-xs text-gs-text-muted line-clamp-2 mb-3 leading-relaxed">
                    {project.description}
                  </p>

                  {/* Plain text metadata row with small icons */}
                  <div className="grid grid-cols-2 gap-2 mb-3 text-[11px] text-gs-text-muted">
                    <div className="flex items-center gap-1.5">
                      <Calendar size={13} className={daysLeft !== null && daysLeft <= 3 ? 'text-amber-400' : 'text-gs-text-muted'} />
                      <span className={daysLeft !== null && daysLeft <= 3 ? 'text-amber-400 font-medium' : ''}>
                        {daysLeft !== null ? (daysLeft === 0 ? 'Due today' : `${daysLeft}d left`) : 'Ongoing'}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Trophy size={13} className="text-gs-text-muted" />
                      <span className="truncate">{project.prize_pool || 'Certificate'}</span>
                    </div>
                  </div>

                  {/* Neutral Stack Tags */}
                  <div className="mb-4">
                    <div className="flex flex-wrap gap-1.5">
                      {(project.skills || []).slice(0, 3).map((skill) => (
                        <span key={skill} className="tag-skill">
                          {skill}
                        </span>
                      ))}
                      {(project.skills || []).length > 3 && (
                        <span className="px-1.5 py-0.5 text-[10px] text-gs-text-muted bg-white/[0.02] border border-gs-border rounded-md">
                          +{(project.skills.length - 3)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Apply Button */}
                <button
                  onClick={() => handleApply(project)}
                  disabled={isApplied || isApplying}
                  className={`w-full py-2 rounded-lg text-xs font-medium transition-colors flex items-center justify-center gap-1.5 btn-tactile ${
                    isApplied
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 cursor-default'
                      : 'bg-gs-elevated border border-gs-border text-gs-text-main hover:bg-[#6D6AF6] hover:text-white hover:border-[#7c6af6]'
                  }`}
                >
                  {isApplying ? (
                    <><RefreshCw size={12} className="animate-spin" /> Applying...</>
                  ) : isApplied ? (
                    <><Check size={12} /> Applied to project</>
                  ) : (
                    <>Apply to join squad</>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && filteredProjects.length === 0 && (
        <div className="text-center py-12 glass-card rounded-xl p-6">
          <FolderKanban size={32} className="mx-auto text-gs-text-muted mb-2 opacity-50" />
          <h3 className="text-base font-semibold text-gs-text-main mb-1">No matching projects</h3>
          <p className="text-xs text-gs-text-muted max-w-sm mx-auto mb-4">
            Try adjusting your search filters or be the first to post a project in this category.
          </p>
          <button
            onClick={() => { setSearchTerm(''); setSelectedDomain('all'); setSelectedTimeline('all'); setSelectedDifficulty('all'); }}
            className="px-3.5 py-1.5 bg-black/5 dark:bg-white/[0.04] border border-gs-border rounded-lg text-xs font-medium text-gs-text-main hover:bg-black/10 transition-colors"
          >
            Reset filters
          </button>
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

// Create Project Modal
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
  const [submitting, setSubmitting] = useState(false);
  const [validationError, setValidationError] = useState('');

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
      image: '📁',
      spots_left: 3,
    });
    setSubmitting(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
      <div className="glass-card rounded-xl p-5 sm:p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-xl relative">
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-gs-border">
          <div>
            <h2 className="text-base font-semibold text-gs-text-main">
              Post campus project
            </h2>
            <p className="text-xs text-gs-text-muted mt-0.5">Recruit verified teammates from your university</p>
          </div>
          <button onClick={onClose} className="p-1 text-gs-text-muted hover:text-gs-text-main rounded-md hover:bg-black/5 dark:hover:bg-white/[0.04]">
            <X size={16} />
          </button>
        </div>

        {validationError && (
          <div className="mb-3 px-3 py-2 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2 text-red-500 text-xs">
            <AlertTriangle size={14} /> {validationError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gs-text-main mb-1">Project title *</label>
            <input 
              type="text" 
              required 
              placeholder="e.g. Autonomous Campus Delivery Rover"
              value={title} 
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-1.5 bg-black/5 dark:bg-white/[0.03] border border-gs-border rounded-lg text-gs-text-main focus:border-blue-500 outline-none text-xs" 
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gs-text-main mb-1">Description *</label>
            <textarea 
              required 
              rows={3} 
              placeholder="Explain project goals, deliverables, and open teammate roles..."
              value={description} 
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-1.5 bg-black/5 dark:bg-white/[0.03] border border-gs-border rounded-lg text-gs-text-main focus:border-blue-500 outline-none text-xs resize-none" 
            />
            <p className="text-[10px] text-gs-text-muted mt-0.5">{description.length} chars (min 20)</p>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block text-xs font-medium text-gs-text-main mb-1">Domain</label>
              <select 
                value={domain} 
                onChange={(e) => setDomain(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-black/5 dark:bg-white/[0.03] border border-gs-border rounded-lg text-gs-text-main focus:border-blue-500 outline-none text-xs"
              >
                <option value="ai-ml">AI & ML</option>
                <option value="web">Web & Blockchain</option>
                <option value="mobile">Mobile Development</option>
                <option value="data">Data Science</option>
                <option value="design">Design & 3D</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gs-text-main mb-1">Format</label>
              <select 
                value={timeline} 
                onChange={(e) => setTimeline(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-black/5 dark:bg-white/[0.03] border border-gs-border rounded-lg text-gs-text-main focus:border-blue-500 outline-none text-xs"
              >
                <option value="hackathon">Hackathon</option>
                <option value="project">Capstone Project</option>
                <option value="competition">Competition</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block text-xs font-medium text-gs-text-main mb-1">Difficulty</label>
              <select 
                value={difficulty} 
                onChange={(e) => setDifficulty(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-black/5 dark:bg-white/[0.03] border border-gs-border rounded-lg text-gs-text-main focus:border-blue-500 outline-none text-xs"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gs-text-main mb-1">Target deadline</label>
              <input 
                type="date" 
                value={deadline} 
                onChange={(e) => setDeadline(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-2.5 py-1.5 bg-black/5 dark:bg-white/[0.03] border border-gs-border rounded-lg text-gs-text-main focus:border-blue-500 outline-none text-xs" 
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block text-xs font-medium text-gs-text-main mb-1">Prize / Grant</label>
              <input 
                type="text" 
                placeholder="e.g. $1,500 / Certificate"
                value={prizePool} 
                onChange={(e) => setPrizePool(e.target.value)}
                className="w-full px-3 py-1.5 bg-black/5 dark:bg-white/[0.03] border border-gs-border rounded-lg text-gs-text-main focus:border-blue-500 outline-none text-xs" 
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gs-text-main mb-1">Squad size</label>
              <input 
                type="text" 
                placeholder="e.g. 2-4"
                value={teamSize} 
                onChange={(e) => setTeamSize(e.target.value)}
                className="w-full px-3 py-1.5 bg-black/5 dark:bg-white/[0.03] border border-gs-border rounded-lg text-gs-text-main focus:border-blue-500 outline-none text-xs" 
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gs-text-main mb-1">Required skills (comma separated)</label>
            <input 
              type="text" 
              placeholder="React, Python, FastAPI, UI/UX"
              value={skillsInput} 
              onChange={(e) => setSkillsInput(e.target.value)}
              className="w-full px-3 py-1.5 bg-black/5 dark:bg-white/[0.03] border border-gs-border rounded-lg text-gs-text-main focus:border-blue-500 outline-none text-xs" 
            />
          </div>

          <div className="flex gap-2 pt-2">
            <button 
              type="button" 
              onClick={onClose}
              className="flex-1 py-1.5 border border-gs-border rounded-lg text-gs-text-muted font-medium hover:bg-black/5 dark:hover:bg-white/[0.04] transition-colors text-xs"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={submitting}
              className="flex-1 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors shadow-sm disabled:opacity-60 flex items-center justify-center gap-1.5 text-xs"
            >
              {submitting ? <><RefreshCw size={13} className="animate-spin" /> Publishing...</> : 'Publish project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


