'use client'
import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { Compass, Sparkles, X, ImagePlus, Trash2, Users, Target, ArrowRight } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { ONBOARDING_SKILLS, ONBOARDING_AVATARS } from '../data/mockData';
import { useNavigate } from 'react-router-dom';
import supabase from '../lib/supabase';

export default function BrowseGroups() {
  const navigate = useNavigate();
  const { user, groups, setGroups, showToast, setSelectedGroupId, refreshGroups } = useAppContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newGroup, setNewGroup] = useState({ name: '', event: '', type: 'Hackathon', description: '', maxMembers: 4, skills: [], privacy: 'public' });
  const [posterFile, setPosterFile] = useState(null);
  const [posterPreview, setPosterPreview] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const handlePosterSelect = (file) => {
    if (!file || !file.type.startsWith('image/')) return;
    setPosterFile(file);
    const reader = new FileReader();
    reader.onload = (e) => setPosterPreview(e.target.result);
    reader.readAsDataURL(file);
  };

  const handlePosterDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    handlePosterSelect(file);
  };

  const removePoster = () => {
    setPosterFile(null);
    setPosterPreview(null);
  };

  const FALLBACK_GROUPS = groups.length === 0 ? [
    {
       id: '__fallback-1',
       name: 'AI Innovators',
       event: 'Tech Fest 2026',
       type: 'Technical',
       description: 'A squad for AI enthusiasts to collaborate on cutting-edge LLMs and computer vision products.',
       skills: ['Python', 'Machine Learning', 'FastAPI'],
       members: 2,
       maxMembers: 5,
       privacy: 'public',
       isFallback: true
    },
    {
       id: '__fallback-2',
       name: 'Design Mavericks',
       event: 'UI/UX Hackathon',
       type: 'Cultural',
       description: 'Looking for creative minds to design the next transformative product in campus EdTech.',
       skills: ['Figma', 'UI/UX Design', 'Tailwind CSS'],
       members: 1,
       maxMembers: 4,
       privacy: 'public',
       isFallback: true
    },
    {
       id: '__fallback-3',
       name: 'Web3 Builders',
       event: 'Web3 Summit',
       type: 'Hackathon',
       description: 'Building decentralized tracking and identity applications for campus governance.',
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
    const base = (overlap / Math.max(1, grpSkills.length)) * 50 + 40;
    return Math.min(98, Math.max(65, Math.round(base)));
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
        } else {
          console.warn('Poster upload failed:', uploadError.message);
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

      if (groupError) {
        throw groupError;
      }

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
      showToast('Team created successfully!');
      setNewGroup({ name: '', event: '', type: 'Hackathon', description: '', maxMembers: 4, skills: [], privacy: 'public' });
      setPosterFile(null);
      setPosterPreview(null);
    } catch (err) {
      console.error('Error creating group:', err);
      showToast(`Team Creation Failed: ${err.message || 'Check connection'}`, 'error');
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
      <div className="space-y-8 animate-page-load">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative z-10">
          <div>
            <h1 className="text-4xl lg:text-5xl font-black font-heading text-gs-text-main tracking-tight drop-shadow-sm flex items-center gap-3">
              Browse Teams
            </h1>
            <p className="text-gs-text-muted mt-2 text-lg font-medium">Find your next squad or recruit complementary talent for competitions.</p>
          </div>
          <button onClick={() => setIsModalOpen(true)} className="px-6 py-3 bg-gradient-to-r from-gs-primary to-gs-secondary text-white font-bold rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_rgba(0,240,255,0.3)] flex items-center gap-2">
            <Sparkles size={20} className="drop-shadow-[0_0_8px_currentColor]" /> Create Team
          </button>
        </div>

        {/* Filters & Search */}
        <div className="flex flex-col md:flex-row gap-4 items-center bg-gs-card border border-gs-border p-3 rounded-[2rem] shadow-[0_8px_30px_rgba(0,0,0,0.04)] relative z-10">
          <div className="flex-1 w-full pl-5 pr-3 py-2 flex items-center gap-3">
            <Compass className="text-gs-text-muted" size={24} />
            <input 
              type="text" 
              placeholder="Search teams by project name, stack, or event..." 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
              className="w-full bg-transparent border-none outline-none text-gs-text-main placeholder-opacity-50 placeholder-gs-text-muted font-medium text-lg"
            />
          </div>
          <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 px-2">
            {['All', 'Hackathon', 'Technical', 'Cultural'].map(type => (
              <button 
                key={type} 
                onClick={() => setFilterType(type)}
                className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] ${filterType === type ? 'bg-gs-primary/20 text-gs-primary border border-gs-primary/50 shadow-[0_0_20px_rgba(0,240,255,0.2)]' : 'bg-gs-bg text-gs-text-muted hover:text-gs-text-main border border-gs-border hover:border-white/20'}`}
              >
                {type === 'All' ? 'All Teams' : type}
              </button>
            ))}
          </div>
        </div>

        {/* Group Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 relative z-10">
          {filteredGroups.map(group => {
            const isFull = (group.members || 1) >= (group.maxMembers || 4);
            const statusLabel = isFull ? 'Active' : 'Forming';
            const statusColor = isFull 
              ? 'bg-amber-500/10 text-amber-300 border-amber-500/30' 
              : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30';
            
            const matchScore = calculateMatchScore(group);

            return (
              <div key={group.id} className="group relative rounded-[2.5rem] p-[1.5px] overflow-hidden cursor-pointer transition-all duration-500 shadow-xl hover:-translate-y-2 flex flex-col h-full bg-gs-card">
                <div className="absolute inset-0 bg-gradient-to-br from-gs-border via-transparent to-gs-border opacity-50 group-hover:opacity-100 group-hover:from-gs-primary group-hover:via-gs-secondary group-hover:to-gs-primary transition-all duration-700" />
                
                <div className="relative h-full bg-gs-bg backdrop-blur-xl rounded-[calc(2.5rem-1px)] border border-gs-border p-6 md:p-8 flex flex-col shadow-inner overflow-hidden">
                   <div className="relative z-10 flex-1 flex flex-col h-full">
                     <div className="flex justify-between items-start mb-4">
                       <div>
                         <h3 className="text-2xl font-black font-heading text-gs-text-main mb-1 line-clamp-1 group-hover:text-gs-primary transition-colors">{group.name}</h3>
                         <p className="text-sm font-bold text-gs-cyan tracking-wide uppercase">{group.event}</p>
                       </div>
                       <div className="flex flex-col items-end gap-1.5 shrink-0 ml-4">
                         <span className={`px-3 py-0.5 rounded-full text-[10px] font-black border uppercase tracking-wider ${statusColor}`}>
                           {statusLabel}
                         </span>
                         <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold text-gs-text-muted bg-gs-card border border-gs-border">
                           {group.type}
                         </span>
                       </div>
                     </div>

                     {group.poster_url && (
                       <div className="w-full h-48 shrink-0 mb-5 rounded-2xl overflow-hidden border border-gs-border/50 bg-black/40 relative group-hover:shadow-[0_0_20px_rgba(0,240,255,0.15)] transition-all">
                         <img 
                           src={group.poster_url} 
                           alt={`${group.name} poster`} 
                           className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                         />
                       </div>
                     )}

                     <p className="text-gs-text-muted text-sm leading-relaxed mb-4 flex-1 line-clamp-3 font-medium">
                       {group.description}
                     </p>

                     {/* Match Score Indicator */}
                     <div className="mb-5 p-3 rounded-2xl bg-gs-card border border-gs-border/80 flex items-center justify-between">
                       <div className="flex items-center gap-2">
                         <span className="text-base">🎯</span>
                         <div>
                           <p className="text-xs font-bold text-gs-text-main">
                             AI Match Compatibility: <span className="text-gs-cyan font-black">{matchScore}%</span>
                           </p>
                           <p className="text-[10px] text-gs-text-muted">Skills · Mindset · Timezone alignment</p>
                         </div>
                       </div>
                       <div className="w-10 h-10 rounded-xl bg-gs-bg border border-gs-primary/30 flex items-center justify-center font-black text-xs text-gs-primary shadow-inner">
                         {matchScore}%
                       </div>
                     </div>
                     
                     <div className="mb-6">
                       <p className="text-[10px] text-gs-text-muted uppercase font-black mb-2 tracking-widest">Required Skills</p>
                       <div className="flex flex-wrap gap-1.5">
                         {(group.skills || []).map(skill => (
                           <span key={skill} className="px-2.5 py-1 bg-gs-card border border-gs-border rounded-lg text-xs font-medium text-gs-text-main">
                             {skill}
                           </span>
                         ))}
                       </div>
                     </div>

                     <div className="mt-auto pt-4 border-t border-gs-border">
                       <div className="flex justify-between items-center mb-3">
                         <span className="text-xs font-bold text-gs-text-muted uppercase tracking-wider">
                           Squad Capacity ({group.members || 1}/{group.maxMembers || 4})
                         </span>
                         <div className="flex -space-x-2">
                           {Array.from({length: Math.min(group.members || 1, 4)}).map((_, i) => (
                             <div key={i} className="w-8 h-8 rounded-full bg-gs-bg border border-white/20 flex items-center justify-center text-xs shadow-md">
                               {ONBOARDING_AVATARS[i % ONBOARDING_AVATARS.length]}
                             </div>
                           ))}
                         </div>
                       </div>
                       
                       <div className="w-full h-2 bg-gs-card rounded-full overflow-hidden mb-5 border border-white/5">
                         <div className="h-full bg-gradient-to-r from-gs-primary to-gs-secondary transition-all" style={{ width: (((group.members || 1) / (group.maxMembers || 4)) * 100) + '%' }} />
                       </div>
                       
                       <button 
                         onClick={(e) => {
                           e.stopPropagation();
                           if (group.isFallback) {
                             showToast('This is a preview template. You can create your own team!', 'info');
                             return;
                           }
                           setSelectedGroupId(group.id);
                           navigate(`/group/${group.id}`);
                         }}
                         className="w-full py-3 rounded-xl font-bold uppercase tracking-wider text-xs transition-all bg-gs-card border border-gs-border text-gs-text-main group-hover:border-gs-primary group-hover:text-gs-primary group-hover:bg-gs-primary/5 hover:scale-[1.01] active:scale-98 flex items-center justify-center gap-2"
                       >
                         {group.isFallback ? 'Preview Details' : 'View & Apply'} <ArrowRight size={14} />
                       </button>
                     </div>
                   </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Create Team Modal */}
      {isModalOpen && ReactDOM.createPortal(
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-xl z-[9999] flex items-center justify-center p-4 sm:p-6 animate-[slideInUp_0.2s_ease-out]"
          onClick={(e) => { if (e.target === e.currentTarget) setIsModalOpen(false); }}
        >
          <div className="bg-gs-card border border-gs-border rounded-3xl p-6 sm:p-8 max-w-xl w-full max-h-[90vh] overflow-y-auto relative shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-black font-heading text-gs-text-main flex items-center gap-2">
                 <Sparkles className="text-gs-primary" /> Create Campus Team
              </h2>
              <button 
                onClick={() => setIsModalOpen(false)} 
                className="w-9 h-9 rounded-xl bg-gs-bg border border-gs-border flex items-center justify-center text-gs-text-muted hover:text-gs-primary"
              >
                <X size={18} />
              </button>
            </div>
            
            <form onSubmit={handleCreateGroup} className="space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-wider text-gs-text-muted mb-1 font-bold">Team Name *</label>
                <input required type="text" value={newGroup.name} onChange={e => setNewGroup({...newGroup, name: e.target.value})} className="w-full bg-gs-bg border border-gs-border rounded-xl px-4 py-2.5 outline-none focus:border-gs-primary text-gs-text-main font-medium text-sm" placeholder="e.g. Neural Pioneers" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-gs-text-muted mb-1 font-bold">Event / Goal *</label>
                  <input required type="text" value={newGroup.event} onChange={e => setNewGroup({...newGroup, event: e.target.value})} className="w-full bg-gs-bg border border-gs-border rounded-xl px-4 py-2.5 outline-none focus:border-gs-primary text-gs-text-main font-medium text-sm" placeholder="e.g. Stanford Hack 2026" />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider text-gs-text-muted mb-1 font-bold">Category</label>
                  <select value={newGroup.type} onChange={e => setNewGroup({...newGroup, type: e.target.value})} className="w-full bg-gs-bg border border-gs-border rounded-xl px-4 py-2.5 outline-none focus:border-gs-primary text-gs-text-main font-medium text-sm">
                    <option value="Hackathon">Hackathon</option>
                    <option value="Technical">Technical</option>
                    <option value="Cultural">Cultural</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs uppercase tracking-wider text-gs-text-muted mb-1 font-bold">Project Vision & Description *</label>
                <textarea required rows="3" value={newGroup.description} onChange={e => setNewGroup({...newGroup, description: e.target.value})} className="w-full bg-gs-bg border border-gs-border rounded-xl px-4 py-2.5 outline-none focus:border-gs-primary text-gs-text-main font-medium text-sm resize-none" placeholder="Describe the problem you are solving and teammate expectations..." />
              </div>
              <div className="bg-gs-bg p-4 rounded-xl border border-gs-border">
                <div className="flex justify-between items-center mb-2">
                   <label className="text-xs uppercase tracking-wider text-gs-text-muted font-bold">Target Team Size</label>
                   <span className="px-2.5 py-0.5 bg-gs-primary/20 text-gs-primary rounded-lg font-bold text-xs">{newGroup.maxMembers} Members</span>
                </div>
                <input type="range" min="2" max="10" value={newGroup.maxMembers} onChange={e => setNewGroup({...newGroup, maxMembers: parseInt(e.target.value)})} className="w-full accent-gs-primary" />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-wider text-gs-text-muted mb-2 font-bold">Desired Skills</label>
                <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto p-1 bg-gs-bg rounded-xl border border-gs-border">
                  {ONBOARDING_SKILLS.map(s => (
                    <button type="button" key={s} onClick={() => toggleModalSkill(s)} className={`px-3 py-1 rounded-lg text-xs font-semibold border transition-all ${newGroup.skills.includes(s) ? "bg-gs-primary/20 border-gs-primary text-gs-primary" : "bg-gs-card border-gs-border text-gs-text-muted hover:text-gs-text-main"}`}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="pt-4">
                <button type="submit" className="w-full py-3.5 bg-gradient-to-r from-gs-primary to-gs-secondary text-white font-bold rounded-xl shadow-[0_0_20px_rgba(0,240,255,0.4)] hover:scale-[1.01] active:scale-98 transition-all flex justify-center items-center gap-2">
                  <Sparkles size={18} /> Launch Team
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
