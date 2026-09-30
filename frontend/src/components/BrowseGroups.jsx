'use client';
import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { Search, Plus, X, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useAppContext } from '@/context/AppContext';
import { ONBOARDING_SKILLS, ONBOARDING_AVATARS } from '@/data/mockData';
import { useNavigate } from 'react-router-dom';
import supabase from '@/lib/supabase';

export default function BrowseGroups() {
  const navigate = useNavigate();
  const { user, groups, setGroups, showToast, setSelectedGroupId, refreshGroups } = useAppContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newGroup, setNewGroup] = useState({ name: '', event: '', type: 'Hackathon', description: '', maxMembers: 4, skills: [], privacy: 'public' });
  const [posterFile, setPosterFile] = useState(null);
  const [posterPreview, setPosterPreview] = useState(null);

  const FALLBACK_GROUPS = groups.length === 0 ? [
    {
       id: '__fallback-1',
       name: 'Distributed Systems & AI',
       event: 'Campus Hackathon 2026',
       type: 'Technical',
       description: 'Collaborative cohort building fault-tolerant backend services and edge AI model deployment for student research.',
       skills: ['Python', 'Machine Learning', 'FastAPI'],
       members: 2,
       maxMembers: 5,
       privacy: 'public',
       isFallback: true
    },
    {
       id: '__fallback-2',
       name: 'Human-Centered Design Lab',
       event: 'DesignSprint Showcase',
       type: 'Cultural',
       description: 'Multidisciplinary team designing accessibility-first campus tools and intuitive student dashboard systems.',
       skills: ['Figma', 'UI/UX Design', 'Tailwind CSS'],
       members: 1,
       maxMembers: 4,
       privacy: 'public',
       isFallback: true
    },
    {
       id: '__fallback-3',
       name: 'Decentralized Identity Protocol',
       event: 'Web3 Collegiate Summit',
       type: 'Hackathon',
       description: 'Engineering verifiable student credential proofs and privacy-preserving vote protocols for university clubs.',
       skills: ['React', 'Node.js', 'Solidity'],
       members: 3,
       maxMembers: 6,
       privacy: 'public',
       isFallback: true
    }
  ] : [];

  const allGroups = [...FALLBACK_GROUPS, ...groups];

  const filteredGroups = allGroups.filter(g => 
    g.privacy !== 'private' &&
    (filterType === 'All' || g.type?.toLowerCase() === filterType.toLowerCase()) &&
    (g.name.toLowerCase().includes(searchTerm.toLowerCase()) || g.description?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const calculateMatchScore = (group) => {
    const userSkills = user?.skills || ['React', 'Python'];
    const grpSkills = group.skills || [];
    if (grpSkills.length === 0) return 75;
    const overlap = grpSkills.filter(s => userSkills.includes(s)).length;
    const base = (overlap / Math.max(1, grpSkills.length)) * 50 + 45;
    return Math.min(96, Math.max(68, Math.round(base)));
  };

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    if (!newGroup.name || !newGroup.description) return;

    try {
      let posterUrl = null;
      if (posterFile) {
        const fileExt = posterFile.name.split('.').pop();
        const fileName = `group-posters/${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from('group-assets')
          .upload(fileName, posterFile, { upsert: true });
        if (!uploadError) {
          const { data: urlData } = supabase.storage.from('group-assets').getPublicUrl(fileName);
          posterUrl = urlData?.publicUrl || null;
        }
      }

      const dbGroup = {
        name: newGroup.name,
        event: newGroup.event || 'Hackathon',
        type: newGroup.type,
        description: newGroup.description,
        skills: newGroup.skills,
        members: 1, 
        max_members: newGroup.maxMembers,
        privacy: newGroup.privacy,
        admin_id: user?.id || null,
        ...(posterUrl && { poster_url: posterUrl })
      };

      const { data: insertedGroup, error: groupError } = await supabase
        .from('groups')
        .insert([dbGroup])
        .select()
        .single();

      if (groupError) throw groupError;

      if (user?.id && insertedGroup) {
        await supabase
          .from('group_members')
          .insert({
            group_id: insertedGroup.id,
            profile_id: user.id
          });
      }

      if (refreshGroups) {
        await refreshGroups();
      } else {
        const finalGroup = {
          ...insertedGroup,
          adminId: insertedGroup.admin_id,
          maxMembers: insertedGroup.max_members,
          memberIds: [user.id]
        };
        setGroups([finalGroup, ...groups]);
      }

      setIsModalOpen(false);
      showToast('Group created successfully');
      setNewGroup({ name: '', event: '', type: 'Hackathon', description: '', maxMembers: 4, skills: [], privacy: 'public' });
      setPosterFile(null);
      setPosterPreview(null);
    } catch (err) {
      console.error('Error creating group:', err);
      showToast(`Creation failed: ${err.message || 'Check connection'}`, 'error');
    }
  };

  const toggleModalSkill = (skill) => {
    if (newGroup.skills.includes(skill)) {
      setNewGroup({ ...newGroup, skills: newGroup.skills.filter(s => s !== skill) });
    } else {
      setNewGroup({ ...newGroup, skills: [...newGroup.skills, skill] });
    }
  };

  return (
    <>
      <div className="space-y-6 pb-12 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gs-border pb-5">
          <div>
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-gs-text-main">
              Student groups
            </h1>
            <p className="text-sm text-gs-text-muted mt-1 max-w-2xl">
              Connect with ongoing student teams, semester capstone cohorts, and campus hackathon circles.
            </p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs rounded-lg transition-colors shrink-0 shadow-sm"
          >
            <Plus size={15} /> Create group
          </button>
        </div>

        {/* Filters & Search */}
        <div className="flex flex-col sm:flex-row gap-3 items-center bg-gs-card border border-gs-border p-3 rounded-xl shadow-sm">
          <div className="flex-1 w-full flex items-center gap-2 pl-2">
            <Search className="text-gs-text-muted" size={15} />
            <input 
              type="text" 
              placeholder="Search by project name, tech stack, or campus event..." 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
              className="w-full bg-transparent border-none outline-none text-gs-text-main placeholder-gs-text-muted text-xs"
            />
          </div>
          <div className="flex gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
            {['All', 'Hackathon', 'Technical', 'Cultural'].map(type => (
              <button 
                key={type} 
                onClick={() => setFilterType(type)}
                className={`px-3 py-1.5 rounded-md text-xs transition-colors whitespace-nowrap border ${
                  filterType === type 
                    ? 'bg-[#6D6AF6]/10 text-[#6D6AF6] border-[#6D6AF6]/30 font-medium' 
                    : 'bg-white/[0.02] border-gs-border text-gs-text-muted hover:text-gs-text-main'
                }`}
              >
                {type === 'All' ? 'All groups' : type}
              </button>
            ))}
          </div>
        </div>

        {/* Group Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredGroups.map(group => {
            const isFull = (group.members || 1) >= (group.maxMembers || 4);
            const statusLabel = isFull ? 'Roster full' : 'Open for applicants';
            const statusColor = isFull 
              ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' 
              : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
            
            const matchScore = calculateMatchScore(group);

            return (
              <div
                key={group.id}
                onClick={() => {
                  if (group.isFallback) {
                    showToast('Sample squad template. Create your own group to recruit teammates!', 'info');
                    return;
                  }
                  setSelectedGroupId(group.id);
                  navigate(`/group/${group.id}`);
                }}
                className="bg-gs-card border border-gs-border rounded-xl p-5 flex flex-col justify-between gap-4 hover:border-gs-border-hover transition-colors shadow-xs cursor-pointer group machined-edge"
              >
                <div>
                  <div className="flex justify-between items-start gap-4 mb-2.5">
                    <div>
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="text-[10px] font-medium text-gs-text-muted">
                          {group.event || 'Campus Initiative'}
                        </span>
                        <span className="text-gs-border">Â·</span>
                        <span className="text-[10px] font-medium text-gs-text-muted bg-white/[0.04] px-1.5 py-0.5 rounded border border-gs-border">
                          {group.type}
                        </span>
                      </div>
                      <h3 className="text-base font-semibold text-gs-text-main group-hover:text-[#6D6AF6] transition-colors line-clamp-1">
                        {group.name}
                      </h3>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="text-[10px] font-medium text-[#7E7BF8] bg-[#6D6AF6]/10 border border-[#6D6AF6]/20 px-2 py-0.5 rounded-full">
                        {matchScore}% match
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${statusColor}`}>
                        {statusLabel}
                      </span>
                    </div>
                  </div>

                  <p className="text-gs-text-muted text-xs leading-relaxed mb-3 line-clamp-2">
                    {group.description}
                  </p>

                  {/* Skills tags (neutral metadata) */}
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {(group.skills || []).map((skill) => (
                      <span key={skill} className="tag-skill">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Footer: Capacity + Action */}
                <div className="pt-3 border-t border-gs-border">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs text-gs-text-muted">
                      {group.members || 1} of {group.maxMembers || 4} members
                    </span>
                    <span className="font-medium text-[#6D6AF6] group-hover:underline flex items-center gap-1 text-xs">
                      View & Apply <ArrowRight size={12} />
                    </span>
                  </div>
                  
                  <div className="w-full h-1 bg-white/[0.06] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#6D6AF6] transition-all rounded-full"
                      style={{ width: `${Math.min(100, (((group.members || 1) / (group.maxMembers || 4)) * 100))}%` }}
                    />
                  </div>
                  
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      if (group.isFallback) {
                        showToast('Sample squad template. Create your own group to recruit teammates!', 'info');
                        return;
                      }
                      setSelectedGroupId(group.id);
                      navigate(`/group/${group.id}`);
                    }}
                    className="w-full py-1.5 rounded-lg font-medium text-xs transition-colors bg-black/5 dark:bg-white/[0.04] hover:bg-black/10 dark:hover:bg-white/[0.08] text-gs-text-main border border-gs-border flex items-center justify-center gap-1.5"
                  >
                    {group.isFallback ? 'Preview template' : 'View group'} <ArrowRight size={12} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Create Team Modal */}
      {isModalOpen && ReactDOM.createPortal(
        <div
          className="fixed inset-0 bg-black/60 z-[9999] flex items-center justify-center p-4"
          onClick={(e) => { if (e.target === e.currentTarget) setIsModalOpen(false); }}
        >
          <div className="bg-gs-card border border-gs-border rounded-xl p-5 max-w-lg w-full max-h-[90vh] overflow-y-auto relative shadow-xl space-y-3.5">
            <div className="flex justify-between items-center border-b border-gs-border pb-3">
              <div>
                <h2 className="text-base font-semibold text-gs-text-main">Create group</h2>
                <p className="text-xs text-gs-text-muted mt-0.5">Form a squad for hackathons, study cohorts, or class projects.</p>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)} 
                className="w-7 h-7 rounded-lg flex items-center justify-center text-gs-text-muted hover:text-gs-text-main hover:bg-black/5 dark:hover:bg-white/[0.04] transition-colors"
              >
                <X size={15} />
              </button>
            </div>
            
            <form onSubmit={handleCreateGroup} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gs-text-main mb-1">Group name *</label>
                <input
                  required
                  type="text"
                  value={newGroup.name}
                  onChange={e => setNewGroup({...newGroup, name: e.target.value})}
                  className="w-full bg-black/5 dark:bg-white/[0.03] border border-gs-border rounded-lg px-3 py-1.5 text-xs text-gs-text-main outline-none focus:border-blue-500"
                  placeholder="e.g. Distributed Consensus Labs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gs-text-main mb-1">Target event / goal</label>
                  <input
                    required
                    type="text"
                    value={newGroup.event}
                    onChange={e => setNewGroup({...newGroup, event: e.target.value})}
                    className="w-full bg-black/5 dark:bg-white/[0.03] border border-gs-border rounded-lg px-3 py-1.5 text-xs text-gs-text-main outline-none focus:border-blue-500"
                    placeholder="e.g. Hackathon 2026"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gs-text-main mb-1">Category</label>
                  <select
                    value={newGroup.type}
                    onChange={e => setNewGroup({...newGroup, type: e.target.value})}
                    className="w-full bg-black/5 dark:bg-white/[0.03] border border-gs-border rounded-lg px-3 py-1.5 text-xs text-gs-text-main outline-none focus:border-blue-500"
                  >
                    <option value="Hackathon">Hackathon</option>
                    <option value="Technical">Technical</option>
                    <option value="Cultural">Cultural</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gs-text-main mb-1">Project description *</label>
                <textarea
                  required
                  rows="3"
                  value={newGroup.description}
                  onChange={e => setNewGroup({...newGroup, description: e.target.value})}
                  className="w-full bg-black/5 dark:bg-white/[0.03] border border-gs-border rounded-lg p-2.5 text-xs text-gs-text-main outline-none focus:border-blue-500 resize-none"
                  placeholder="Outline what you are building and what each collaborator will own..."
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-medium text-gs-text-main">Target team size</label>
                  <span className="text-xs font-medium text-gs-text-muted">{newGroup.maxMembers} members</span>
                </div>
                <input
                  type="range"
                  min="2"
                  max="10"
                  value={newGroup.maxMembers}
                  onChange={e => setNewGroup({...newGroup, maxMembers: parseInt(e.target.value)})}
                  className="w-full accent-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gs-text-main mb-1">Desired skills</label>
                <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto p-2 bg-black/5 dark:bg-white/[0.02] rounded-lg border border-gs-border">
                  {ONBOARDING_SKILLS.map(s => (
                    <button
                      type="button"
                      key={s}
                      onClick={() => toggleModalSkill(s)}
                      className={`px-2 py-0.5 rounded text-[11px] font-medium border transition-colors ${
                        newGroup.skills.includes(s)
                          ? "bg-blue-600 border-blue-600 text-white"
                          : "bg-gs-card border-gs-border text-gs-text-muted hover:text-gs-text-main"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="flex gap-2.5 pt-3 border-t border-gs-border">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-1.5 rounded-lg border border-gs-border text-xs font-medium text-gs-text-muted hover:bg-black/5 dark:hover:bg-white/[0.04] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs rounded-lg transition-colors shadow-sm"
                >
                  Create group
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}

