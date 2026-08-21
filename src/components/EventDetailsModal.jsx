import React, { useState, useEffect } from 'react';
import {
  X, Calendar, Clock, MapPin, Users, Sparkles, Tag,
  FileText, ShieldCheck, Share2, MessageSquare, Check,
  Edit3, Save, Loader2, Globe, Lock, Unlock, ExternalLink,
  Zap, Award, AlertCircle, Eye
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { ONBOARDING_SKILLS } from '../data/mockData';
import supabase from '../lib/supabase';

const EVENT_TYPE_STYLES = {
  Hackathon: {
    badge: 'bg-[var(--color-gs-cyan)]/15 text-[var(--color-gs-cyan)] border-[var(--color-gs-cyan)]/30',
    icon: '⚡',
    gradient: 'from-[#00f0ff]/20 to-[#a855f7]/20',
  },
  Technical: {
    badge: 'bg-[var(--color-gs-violet)]/15 text-[var(--color-gs-violet)] border-[var(--color-gs-violet)]/30',
    icon: '🛠️',
    gradient: 'from-[#a855f7]/20 to-[#ec4899]/20',
  },
  Cultural: {
    badge: 'bg-[var(--color-gs-green)]/15 text-[var(--color-gs-green)] border-[var(--color-gs-green)]/30',
    icon: '🎭',
    gradient: 'from-[#10b981]/20 to-[#00f0ff]/20',
  },
  'Mini-Project': {
    badge: 'bg-[var(--color-gs-amber)]/15 text-[var(--color-gs-amber)] border-[var(--color-gs-amber)]/30',
    icon: '🚀',
    gradient: 'from-[#f59e0b]/20 to-[#ec4899]/20',
  },
  'Study Group': {
    badge: 'bg-[var(--color-gs-amber)]/15 text-[var(--color-gs-amber)] border-[var(--color-gs-amber)]/30',
    icon: '📚',
    gradient: 'from-[#f59e0b]/20 to-[#10b981]/20',
  },
  Competition: {
    badge: 'bg-red-500/15 text-red-400 border-red-500/30',
    icon: '🏆',
    gradient: 'from-red-500/20 to-[#f59e0b]/20',
  },
};

export default function EventDetailsModal({
  isOpen,
  onClose,
  group,
  creatorProfile,
  isMember,
  isAdmin,
  onJoinGroup,
  onGroupUpdated
}) {
  const navigate = useNavigate();
  const { user, showToast, factions, refreshGroups } = useAppContext();

  // Edit Mode state (Admin / Creator only)
  const [isEditing, setIsEditing] = useState(false);
  const [editEventName, setEditEventName] = useState(group?.event || '');
  const [editGroupName, setEditGroupName] = useState(group?.name || '');
  const [editType, setEditType] = useState(group?.type || 'Hackathon');
  const [editDescription, setEditDescription] = useState(group?.description || '');
  const [editSkills, setEditSkills] = useState(Array.isArray(group?.skills) ? group.skills : []);
  const [editMaxMembers, setEditMaxMembers] = useState(group?.maxMembers || group?.max_members || 4);
  const [isSaving, setIsSaving] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Sync edit form when group changes
  useEffect(() => {
    if (group) {
      setEditEventName(group.event || '');
      setEditGroupName(group.name || '');
      setEditType(group.type || 'Hackathon');
      setEditDescription(group.description || '');
      setEditSkills(Array.isArray(group.skills) ? group.skills : []);
      setEditMaxMembers(group.maxMembers || group.max_members || 4);
    }
  }, [group]);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !group) return null;

  const eventStyle = EVENT_TYPE_STYLES[group.type] || EVENT_TYPE_STYLES.Hackathon;
  const creatorFaction = creatorProfile?.faction && factions ? factions[creatorProfile.faction] : null;

  const handleCopyLink = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    if (showToast) showToast('Event link copied to clipboard!', 'success');
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleMessageCreator = () => {
    if (!creatorProfile?.id) return;
    onClose();
    navigate('/chat');
    if (showToast) showToast(`Opening chat with organizer ${creatorProfile.name || 'Creator'}`);
  };

  const toggleSkill = (skill) => {
    if (editSkills.includes(skill)) {
      setEditSkills(editSkills.filter(s => s !== skill));
    } else {
      if (editSkills.length >= 8) {
        if (showToast) showToast('Maximum 8 skills allowed', 'info');
        return;
      }
      setEditSkills([...editSkills, skill]);
    }
  };

  const handleSaveChanges = async (e) => {
    e.preventDefault();
    if (!editEventName.trim() || !editGroupName.trim()) {
      if (showToast) showToast('Event name and Team name cannot be empty', 'error');
      return;
    }

    setIsSaving(true);
    try {
      const updates = {
        name: editGroupName.trim(),
        event: editEventName.trim(),
        type: editType,
        description: editDescription.trim(),
        skills: editSkills,
        max_members: editMaxMembers,
      };

      const { error } = await supabase
        .from('groups')
        .update(updates)
        .eq('id', group.id);

      if (error) throw error;

      if (refreshGroups) await refreshGroups();
      if (onGroupUpdated) {
        onGroupUpdated({
          ...group,
          name: updates.name,
          event: updates.event,
          type: updates.type,
          description: updates.description,
          skills: updates.skills,
          maxMembers: updates.max_members,
        });
      }

      if (showToast) showToast('Event details updated successfully!', 'success');
      setIsEditing(false);
    } catch (err) {
      console.error('Failed to update event details:', err);
      if (showToast) showToast(`Update failed: ${err.message}`, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const currentMembersCount = group.members || 1;
  const maxCapacity = group.maxMembers || group.max_members || 4;
  const capacityPercent = Math.min(100, Math.round((currentMembersCount / maxCapacity) * 100));
  const safeSkills = Array.isArray(group.skills) ? group.skills : [];

  return (
    <div
      className="fixed inset-0 z-[9999] bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-[fadeIn_0.2s_ease-out]"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="relative w-full max-w-2xl bg-[var(--color-gs-card)] border border-[var(--color-gs-border)] rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col animate-[slideInUp_0.2s_ease-out]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top accent bar */}
        <div className="h-1.5 bg-gradient-to-r from-[var(--color-gs-cyan)] via-[var(--color-gs-violet)] to-[var(--color-gs-green)] shrink-0" />

        {/* Header Banner / Poster */}
        <div className="relative shrink-0 overflow-hidden bg-gradient-to-br from-black/60 to-black/90">
          {group.poster_url ? (
            <div className="relative h-44 w-full overflow-hidden">
              <img
                src={group.poster_url}
                alt={`${group.event} Banner`}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-gs-card)] via-black/40 to-transparent" />
            </div>
          ) : (
            <div className={`h-36 w-full bg-gradient-to-r ${eventStyle.gradient} relative flex items-center px-8 border-b border-[var(--color-gs-border)]`}>
              <div className="absolute right-6 top-1/2 -translate-y-1/2 text-8xl opacity-15 select-none pointer-events-none">
                {eventStyle.icon}
              </div>
            </div>
          )}

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-20 p-2.5 rounded-full bg-black/60 hover:bg-black/80 text-white/80 hover:text-white border border-white/10 transition-all hover:scale-105"
            aria-label="Close"
          >
            <X size={18} />
          </button>

          {/* Event badges and title over banner */}
          <div className="px-7 pt-4 pb-2 relative z-10">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className={`px-3 py-1 rounded-full text-xs font-bold border uppercase tracking-wider flex items-center gap-1.5 ${eventStyle.badge}`}>
                <span>{eventStyle.icon}</span> {group.type}
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/5 border border-white/10 text-[var(--color-gs-text-muted)] flex items-center gap-1.5">
                {group.privacy === 'private' ? <Lock size={12} className="text-red-400" /> : <Globe size={12} className="text-[var(--color-gs-cyan)]" />}
                {group.privacy === 'private' ? 'Private Group' : group.privacy === 'password' ? 'Password Protected' : 'Public Event'}
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                {currentMembersCount >= maxCapacity ? 'Team Full' : 'Actively Recruiting'}
              </span>
            </div>

            <h2 className="text-3xl font-extrabold font-heading text-white tracking-tight flex items-baseline gap-3">
              {group.event}
            </h2>
            <p className="text-sm text-[var(--color-gs-cyan)] font-semibold mt-0.5 flex items-center gap-1.5">
              <Sparkles size={14} /> Team: {group.name}
            </p>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto px-7 py-6 space-y-6 custom-scrollbar">
          {/* Admin / Creator Edit Mode Toggle */}
          {isAdmin && (
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[var(--color-gs-cyan)]/5 border border-[var(--color-gs-cyan)]/20">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-[var(--color-gs-cyan)]/10 text-[var(--color-gs-cyan)]">
                  <Edit3 size={16} />
                </div>
                <div>
                  <p className="text-xs font-bold text-white">Event Creator Controls</p>
                  <p className="text-[11px] text-[var(--color-gs-text-muted)]">You created this event. You can edit the details anytime.</p>
                </div>
              </div>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  isEditing
                    ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                    : 'bg-[var(--color-gs-cyan)]/20 text-[var(--color-gs-cyan)] border border-[var(--color-gs-cyan)]/40 hover:bg-[var(--color-gs-cyan)]/30'
                }`}
              >
                {isEditing ? 'Cancel Edit' : 'Edit Event Info'}
              </button>
            </div>
          )}

          {/* ─── EDIT FORM (If Creator is Editing) ─── */}
          {isEditing ? (
            <form onSubmit={handleSaveChanges} className="space-y-4 animate-[slideInUp_0.15s_ease-out]">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[var(--color-gs-text-muted)] mb-1">
                  Event Title *
                </label>
                <input
                  type="text"
                  value={editEventName}
                  onChange={(e) => setEditEventName(e.target.value)}
                  required
                  className="w-full bg-[var(--color-gs-bg)] border border-[var(--color-gs-border)] rounded-xl px-4 py-2.5 text-sm text-[var(--color-gs-text-main)] outline-none focus:border-[var(--color-gs-cyan)]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[var(--color-gs-text-muted)] mb-1">
                    Team Name *
                  </label>
                  <input
                    type="text"
                    value={editGroupName}
                    onChange={(e) => setEditGroupName(e.target.value)}
                    required
                    className="w-full bg-[var(--color-gs-bg)] border border-[var(--color-gs-border)] rounded-xl px-4 py-2.5 text-sm text-[var(--color-gs-text-main)] outline-none focus:border-[var(--color-gs-cyan)]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[var(--color-gs-text-muted)] mb-1">
                    Category
                  </label>
                  <select
                    value={editType}
                    onChange={(e) => setEditType(e.target.value)}
                    className="w-full bg-[var(--color-gs-bg)] border border-[var(--color-gs-border)] rounded-xl px-4 py-2.5 text-sm text-[var(--color-gs-text-main)] outline-none focus:border-[var(--color-gs-cyan)]"
                  >
                    <option value="Hackathon">⚡ Hackathon</option>
                    <option value="Technical">🛠️ Technical</option>
                    <option value="Cultural">🎭 Cultural</option>
                    <option value="Mini-Project">🚀 Mini-Project</option>
                    <option value="Study Group">📚 Study Group</option>
                    <option value="Competition">🏆 Competition</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[var(--color-gs-text-muted)] mb-1">
                  Event Vision & Project Description *
                </label>
                <textarea
                  rows={4}
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  required
                  placeholder="Describe the problem, goals, and expectations for participants..."
                  className="w-full bg-[var(--color-gs-bg)] border border-[var(--color-gs-border)] rounded-xl p-3 text-sm text-[var(--color-gs-text-main)] outline-none focus:border-[var(--color-gs-cyan)] resize-none"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-[var(--color-gs-text-muted)]">
                    Desired / Required Skills
                  </label>
                  <span className="text-[11px] text-[var(--color-gs-text-muted)]">{editSkills.length}/8 selected</span>
                </div>
                <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto p-2 bg-[var(--color-gs-bg)] rounded-xl border border-[var(--color-gs-border)]">
                  {ONBOARDING_SKILLS.map(s => {
                    const isSelected = editSkills.includes(s);
                    return (
                      <button
                        type="button"
                        key={s}
                        onClick={() => toggleSkill(s)}
                        className={`px-3 py-1 rounded-lg text-xs font-semibold border transition-all ${
                          isSelected
                            ? 'bg-[var(--color-gs-cyan)]/20 border-[var(--color-gs-cyan)] text-[var(--color-gs-cyan)]'
                            : 'bg-[var(--color-gs-card)] border-[var(--color-gs-border)] text-[var(--color-gs-text-muted)] hover:text-white'
                        }`}
                      >
                        {isSelected && '✓ '} {s}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-[var(--color-gs-text-muted)]">
                    Max Team Capacity
                  </label>
                  <span className="text-xs font-bold text-[var(--color-gs-cyan)]">{editMaxMembers} Members</span>
                </div>
                <input
                  type="range"
                  min={2}
                  max={10}
                  value={editMaxMembers}
                  onChange={(e) => setEditMaxMembers(parseInt(e.target.value))}
                  className="w-full accent-[var(--color-gs-cyan)]"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="flex-1 py-3 rounded-xl border border-[var(--color-gs-border)] text-sm font-semibold text-[var(--color-gs-text-muted)] hover:bg-[var(--color-gs-bg)]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-[2] py-3 rounded-xl bg-gradient-to-r from-[var(--color-gs-cyan)] to-[var(--color-gs-violet)] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(0,240,255,0.3)] hover:opacity-90 disabled:opacity-50"
                >
                  {isSaving ? <><Loader2 size={16} className="animate-spin" /> Saving...</> : <><Save size={16} /> Save Changes</>}
                </button>
              </div>
            </form>
          ) : (
            /* ─── NORMAL EVENT DETAILS VIEW ─── */
            <div className="space-y-6">
              {/* 1. Creator / Organizer Card */}
              <div className="p-4 rounded-2xl bg-[var(--color-gs-bg)] border border-[var(--color-gs-border)] relative overflow-hidden">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3.5">
                    <div className="relative shrink-0">
                      <div className="w-12 h-12 rounded-2xl bg-black/40 border border-white/15 flex items-center justify-center text-2xl shadow-inner">
                        {creatorProfile?.avatar || '🎓'}
                      </div>
                      {creatorProfile?.online && (
                        <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-400 rounded-full border-2 border-[var(--color-gs-card)] shadow-sm" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-extrabold text-white text-base">
                          {creatorProfile?.name || (isAdmin ? `${user?.name || 'You'} (Creator)` : 'Event Organizer')}
                        </h4>
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-[var(--color-gs-cyan)]/15 text-[var(--color-gs-cyan)] border border-[var(--color-gs-cyan)]/30">
                          Creator & Lead
                        </span>
                      </div>
                      <p className={`text-xs font-semibold ${creatorFaction?.color || 'text-[var(--color-gs-text-muted)]'}`}>
                        {creatorFaction?.name || creatorProfile?.department || creatorProfile?.college || 'Campus Innovator'}
                      </p>
                    </div>
                  </div>

                  {/* Quick DM button (if not currentUser) */}
                  {creatorProfile?.id && creatorProfile.id !== user?.id && (
                    <button
                      onClick={handleMessageCreator}
                      className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-[var(--color-gs-cyan)]/15 border border-white/10 hover:border-[var(--color-gs-cyan)]/40 text-xs font-bold text-white hover:text-[var(--color-gs-cyan)] transition-all flex items-center gap-1.5"
                    >
                      <MessageSquare size={14} /> Message Creator
                    </button>
                  )}
                </div>
              </div>

              {/* 2. Creator's Vision & Event Description */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-widest text-[var(--color-gs-text-muted)] mb-2.5 flex items-center gap-2">
                  <FileText size={14} className="text-[var(--color-gs-cyan)]" />
                  Event Overview & Creator's Vision
                </h3>
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-sm text-[var(--color-gs-text-main)] leading-relaxed font-medium">
                  {group.description || 'No detailed description provided by the creator yet.'}
                </div>
              </div>

              {/* 3. Desired & Required Skills */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-widest text-[var(--color-gs-text-muted)] mb-2.5 flex items-center gap-2">
                  <Tag size={14} className="text-[var(--color-gs-violet)]" />
                  Desired Skills & Technologies
                </h3>
                <div className="flex flex-wrap gap-2">
                  {safeSkills.length > 0 ? (
                    safeSkills.map((skill) => (
                      <span
                        key={skill}
                        className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs font-semibold text-white flex items-center gap-1.5 hover:border-[var(--color-gs-cyan)]/40 transition-colors"
                      >
                        <ShieldCheck size={12} className="text-[var(--color-gs-cyan)]" />
                        {skill}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-[var(--color-gs-text-muted)] italic">
                      Open to all skills and enthusiastic learners
                    </span>
                  )}
                </div>
              </div>

              {/* 4. Event Logistics & Timeline Grid */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-widest text-[var(--color-gs-text-muted)] mb-2.5 flex items-center gap-2">
                  <Calendar size={14} className="text-[var(--color-gs-amber)]" />
                  Schedule & Logistics
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex items-center gap-3 p-3.5 bg-white/5 rounded-xl border border-white/10">
                    <div className="p-2 rounded-lg bg-[var(--color-gs-amber)]/10 text-[var(--color-gs-amber)]">
                      <Calendar size={16} />
                    </div>
                    <div>
                      <p className="text-[11px] text-[var(--color-gs-text-muted)]">Event Date</p>
                      <p className="text-xs font-bold text-white">
                        {new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3.5 bg-white/5 rounded-xl border border-white/10">
                    <div className="p-2 rounded-lg bg-[var(--color-gs-violet)]/10 text-[var(--color-gs-violet)]">
                      <Clock size={16} />
                    </div>
                    <div>
                      <p className="text-[11px] text-[var(--color-gs-text-muted)]">Time & Duration</p>
                      <p className="text-xs font-bold text-white">10:00 AM — 6:00 PM</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3.5 bg-white/5 rounded-xl border border-white/10">
                    <div className="p-2 rounded-lg bg-[var(--color-gs-green)]/10 text-[var(--color-gs-green)]">
                      <MapPin size={16} />
                    </div>
                    <div>
                      <p className="text-[11px] text-[var(--color-gs-text-muted)]">Format / Venue</p>
                      <p className="text-xs font-bold text-white">Campus Tech Hub & Discord</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3.5 bg-white/5 rounded-xl border border-white/10">
                    <div className="p-2 rounded-lg bg-[var(--color-gs-cyan)]/10 text-[var(--color-gs-cyan)]">
                      <Users size={16} />
                    </div>
                    <div>
                      <p className="text-[11px] text-[var(--color-gs-text-muted)]">Squad Capacity</p>
                      <p className="text-xs font-bold text-white">
                        {currentMembersCount} of {maxCapacity} Spots Filled
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* 5. Squad Capacity Meter */}
              <div className="p-4 rounded-2xl bg-[var(--color-gs-bg)] border border-[var(--color-gs-border)] space-y-2">
                <div className="flex justify-between items-center text-xs font-bold">
                  <span className="text-[var(--color-gs-text-muted)] uppercase tracking-wider">Team Fill Progress</span>
                  <span className="text-[var(--color-gs-cyan)]">{currentMembersCount} / {maxCapacity} Members ({capacityPercent}%)</span>
                </div>
                <div className="w-full h-2.5 bg-white/5 rounded-full overflow-hidden border border-white/10">
                  <div
                    className="h-full bg-gradient-to-r from-[var(--color-gs-cyan)] to-[var(--color-gs-violet)] transition-all duration-500"
                    style={{ width: `${capacityPercent}%` }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Sticky Footer */}
        <div className="shrink-0 px-7 py-4 border-t border-[var(--color-gs-border)] bg-[var(--color-gs-card)] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyLink}
              className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-[var(--color-gs-text-muted)] hover:text-white transition-all flex items-center gap-1.5"
              title="Share Event Link"
            >
              {copiedLink ? <Check size={14} className="text-emerald-400" /> : <Share2 size={14} />}
              {copiedLink ? 'Copied!' : 'Share Event'}
            </button>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-[var(--color-gs-border)] text-xs font-bold text-[var(--color-gs-text-muted)] hover:text-white hover:bg-white/5 transition-all"
            >
              Close
            </button>

            {!isMember && (
              <button
                onClick={() => {
                  onClose();
                  onJoinGroup?.();
                }}
                disabled={currentMembersCount >= maxCapacity}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[var(--color-gs-cyan)] to-[var(--color-gs-violet)] text-white font-bold text-xs shadow-[0_0_15px_rgba(0,240,255,0.3)] hover:opacity-90 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {currentMembersCount >= maxCapacity ? 'Group Full' : 'Apply / Join Team'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
