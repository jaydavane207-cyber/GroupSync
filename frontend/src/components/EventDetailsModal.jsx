import React, { useState, useEffect } from 'react';
import {
  X, Calendar, Clock, MapPin, Users, Tag,
  FileText, ShieldCheck, Share2, MessageSquare, Check,
  Edit3, Save, Loader2, Globe, Lock, Unlock, ExternalLink,
  Award, AlertCircle, Eye
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '@/context/AppContext';
import { ONBOARDING_SKILLS } from '@/data/mockData';
import supabase from '@/lib/supabase';

const EVENT_TYPE_STYLES = {
  Hackathon: {
    badge: 'bg-[#6D6AF6]/10 text-[#6D6AF6] border-[#6D6AF6]/30',
  },
  Technical: {
    badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  },
  Cultural: {
    badge: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  },
  'Mini-Project': {
    badge: 'bg-sky-500/10 text-sky-400 border-sky-500/30',
  },
  'Study Group': {
    badge: 'bg-violet-500/10 text-violet-400 border-violet-500/30',
  },
  Competition: {
    badge: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
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
      className="fixed inset-0 z-[9999] bg-black/60 flex items-center justify-center p-4 animate-[fadeIn_0.15s_ease-out]"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="relative w-full max-w-2xl bg-gs-card border border-gs-border rounded-xl shadow-xl overflow-hidden max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Banner / Poster */}
        <div className="relative shrink-0 overflow-hidden bg-gs-card border-b border-gs-border">
          {group.poster_url ? (
            <div className="relative h-44 w-full overflow-hidden">
              <img
                src={group.poster_url}
                alt={`${group.event} Banner`}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-gs-card via-black/30 to-transparent" />
            </div>
          ) : (
            <div className="h-20 w-full bg-black/5 dark:bg-white/[0.02] border-b border-gs-border" />
          )}

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-20 p-1.5 rounded-lg bg-black/40 hover:bg-black/60 text-white/80 hover:text-white border border-white/10 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X size={16} />
          </button>

          {/* Event badges and title over banner */}
          <div className="px-6 pt-4 pb-3 relative z-10">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border flex items-center gap-1.5 ${eventStyle.badge}`}>
                {group.type}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-black/5 dark:bg-white/[0.04] border border-gs-border text-gs-text-muted flex items-center gap-1.5">
                {group.privacy === 'private' ? <Lock size={12} className="text-rose-400" /> : <Globe size={12} className="text-[#6D6AF6]" />}
                {group.privacy === 'private' ? 'Private Group' : group.privacy === 'password' ? 'Password Protected' : 'Public Event'}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                {currentMembersCount >= maxCapacity ? 'Team Full' : 'Actively Recruiting'}
              </span>
            </div>

            <h2 className="text-2xl font-semibold text-gs-text-main tracking-tight">
              {group.event}
            </h2>
            <p className="text-xs text-[#6D6AF6] font-medium mt-0.5">
              Team: {group.name}
            </p>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto px-7 py-6 space-y-6 custom-scrollbar">
          {/* Admin / Creator Edit Mode Toggle */}
          {isAdmin && (
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#6D6AF6]/10 border border-[#6D6AF6]/20">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-[#6D6AF6]/10 text-[#6D6AF6]">
                  <Edit3 size={16} />
                </div>
                <div>
                  <p className="text-xs font-semibold text-gs-text-main">Event Creator Controls</p>
                  <p className="text-xs text-gs-text-muted">You created this event. You can edit the details anytime.</p>
                </div>
              </div>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                  isEditing
                    ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                    : 'bg-[#6D6AF6] hover:bg-[#5C59EC] text-white shadow-xs btn-tactile'
                }`}
              >
                {isEditing ? 'Cancel Edit' : 'Edit Event Info'}
              </button>
            </div>
          )}

          {/* â”€â”€â”€ EDIT FORM (If Creator is Editing) â”€â”€â”€ */}
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
                  className="w-full bg-[var(--color-gs-bg)] border border-[var(--color-gs-border)] rounded-lg px-4 py-2.5 text-sm text-[var(--color-gs-text-main)] outline-none focus:border-blue-500"
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
                    className="w-full bg-[var(--color-gs-bg)] border border-[var(--color-gs-border)] rounded-lg px-4 py-2.5 text-sm text-[var(--color-gs-text-main)] outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[var(--color-gs-text-muted)] mb-1">
                    Category
                  </label>
                  <select
                    value={editType}
                    onChange={(e) => setEditType(e.target.value)}
                    className="w-full bg-[var(--color-gs-bg)] border border-[var(--color-gs-border)] rounded-lg px-4 py-2.5 text-sm text-[var(--color-gs-text-main)] outline-none focus:border-blue-500"
                  >
                    <option value="Hackathon">Hackathon</option>
                    <option value="Technical">Technical</option>
                    <option value="Cultural">Cultural</option>
                    <option value="Mini-Project">Mini-Project</option>
                    <option value="Study Group">Study Group</option>
                    <option value="Competition">Competition</option>
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
                  className="w-full bg-[var(--color-gs-bg)] border border-[var(--color-gs-border)] rounded-lg p-3 text-sm text-[var(--color-gs-text-main)] outline-none focus:border-blue-500 resize-none"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-[var(--color-gs-text-muted)]">
                    Desired / Required Skills
                  </label>
                  <span className="text-[11px] text-[var(--color-gs-text-muted)]">{editSkills.length}/8 selected</span>
                </div>
                <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto p-2 bg-[var(--color-gs-bg)] rounded-lg border border-[var(--color-gs-border)]">
                  {ONBOARDING_SKILLS.map(s => {
                    const isSelected = editSkills.includes(s);
                    return (
                      <button
                        type="button"
                        key={s}
                        onClick={() => toggleSkill(s)}
                        className={`px-3 py-1 rounded-md text-xs font-medium border transition-all ${
                          isSelected
                            ? 'bg-[#6D6AF6] border-[#6D6AF6] text-white'
                            : 'bg-gs-card border-gs-border text-gs-text-muted hover:text-gs-text-main'
                        }`}
                      >
                        {isSelected && 'âœ“ '} {s}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-semibold uppercase tracking-wider text-gs-text-muted">
                    Max Team Capacity
                  </label>
                  <span className="text-xs font-semibold text-[#6D6AF6] tabular-nums">{editMaxMembers} Members</span>
                </div>
                <input
                  type="range"
                  min={2}
                  max={10}
                  value={editMaxMembers}
                  onChange={(e) => setEditMaxMembers(parseInt(e.target.value))}
                  className="w-full accent-[#6D6AF6]"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="flex-1 py-2 rounded-lg border border-gs-border text-xs font-medium text-gs-text-muted hover:text-gs-text-main hover:bg-white/5 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-[2] py-2 rounded-lg bg-[#6D6AF6] hover:bg-[#5C59EC] text-white font-medium text-xs flex items-center justify-center gap-2 shadow-xs transition-colors disabled:opacity-50 btn-tactile cursor-pointer"
                >
                  {isSaving ? <><Loader2 size={15} className="animate-spin" /> Saving...</> : <><Save size={15} /> Save Changes</>}
                </button>
              </div>
            </form>
          ) : (
            /* â”€â”€â”€ NORMAL EVENT DETAILS VIEW â”€â”€â”€ */
            <div className="space-y-6">
              {/* 1. Creator / Organizer Card */}
              <div className="p-4 rounded-xl bg-gs-card border border-gs-border relative overflow-hidden">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3.5">
                    <div className="relative shrink-0">
                      <div className="w-10 h-10 rounded-xl bg-black/5 dark:bg-white/[0.04] border border-gs-border flex items-center justify-center text-sm font-semibold text-gs-text-muted">
                        {creatorProfile?.avatar || (creatorProfile?.name ? creatorProfile.name.charAt(0).toUpperCase() : 'GS')}
                      </div>
                      {creatorProfile?.online && (
                        <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-gs-card" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-gs-text-main text-sm">
                          {creatorProfile?.name || (isAdmin ? `${user?.name || 'You'} (Creator)` : 'Event Organizer')}
                        </h4>
                        <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-[#6D6AF6]/10 text-[#6D6AF6] border border-[#6D6AF6]/20">
                          Creator
                        </span>
                      </div>
                      <p className={`text-xs ${creatorFaction?.color || 'text-gs-text-muted'}`}>
                        {creatorFaction?.name || creatorProfile?.department || creatorProfile?.college || 'Campus Student'}
                      </p>
                    </div>
                  </div>

                  {/* Quick DM button (if not currentUser) */}
                  {creatorProfile?.id && creatorProfile.id !== user?.id && (
                    <button
                      onClick={handleMessageCreator}
                      className="px-3 py-1.5 rounded-lg border border-gs-border text-xs font-medium text-[#6D6AF6] hover:bg-[#6D6AF6]/10 transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <MessageSquare size={13} /> Message
                    </button>
                  )}
                </div>
              </div>

              {/* 2. Creator's Vision & Event Description */}
              <div>
                <h3 className="text-xs font-semibold text-gs-text-muted mb-2 flex items-center gap-2">
                  <FileText size={14} className="text-gs-text-muted" />
                  Overview & project vision
                </h3>
                <div className="p-3.5 rounded-xl bg-black/5 dark:bg-white/[0.02] border border-gs-border text-xs text-gs-text-main leading-relaxed">
                  {group.description || 'No detailed description provided by the creator yet.'}
                </div>
              </div>

              {/* 3. Desired & Required Skills */}
              <div>
                <h3 className="text-xs font-semibold text-gs-text-muted mb-2 flex items-center gap-2">
                  <Tag size={14} className="text-gs-text-muted" />
                  Desired skills & technologies
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {safeSkills.length > 0 ? (
                    safeSkills.map((skill) => (
                      <span
                        key={skill}
                        className="px-2.5 py-1 rounded-lg bg-black/5 dark:bg-white/[0.04] border border-gs-border text-xs font-medium text-gs-text-muted flex items-center gap-1.5"
                      >
                        <ShieldCheck size={12} className="text-[#6D6AF6]" />
                        {skill}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-gs-text-muted italic">
                      Open to all skills and enthusiastic learners
                    </span>
                  )}
                </div>
              </div>

              {/* 4. Event Logistics & Timeline Grid */}
              <div>
                <h3 className="text-xs font-semibold text-gs-text-muted mb-2 flex items-center gap-2">
                  <Calendar size={14} className="text-gs-text-muted" />
                  Schedule & logistics
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div className="flex items-center gap-2.5 p-3 bg-black/5 dark:bg-white/[0.02] rounded-lg border border-gs-border">
                    <Calendar size={15} className="text-gs-text-muted shrink-0" />
                    <div>
                      <p className="text-[11px] text-gs-text-muted">Event date</p>
                      <p className="text-xs font-medium text-gs-text-main">
                        {new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 p-3 bg-black/5 dark:bg-white/[0.02] rounded-lg border border-gs-border">
                    <Clock size={15} className="text-gs-text-muted shrink-0" />
                    <div>
                      <p className="text-[11px] text-gs-text-muted">Time & duration</p>
                      <p className="text-xs font-medium text-gs-text-main">10:00 AM â€” 6:00 PM</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 p-3 bg-black/5 dark:bg-white/[0.02] rounded-lg border border-gs-border">
                    <MapPin size={15} className="text-gs-text-muted shrink-0" />
                    <div>
                      <p className="text-[11px] text-gs-text-muted">Format / venue</p>
                      <p className="text-xs font-medium text-gs-text-main">Campus Tech Hub & Discord</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 p-3 bg-black/5 dark:bg-white/[0.02] rounded-lg border border-gs-border">
                    <Users size={15} className="text-gs-text-muted shrink-0" />
                    <div>
                      <p className="text-[11px] text-gs-text-muted">Squad capacity</p>
                      <p className="text-xs font-medium text-gs-text-main tabular-nums">
                        {currentMembersCount} of {maxCapacity} spots filled
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* 5. Squad Capacity Meter */}
              <div className="p-3.5 rounded-xl bg-gs-card border border-gs-border space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gs-text-muted">Team fill progress</span>
                  <span className="font-semibold text-[#6D6AF6] tabular-nums">{currentMembersCount} / {maxCapacity} members ({capacityPercent}%)</span>
                </div>
                <div className="w-full h-1.5 bg-black/10 dark:bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#6D6AF6] rounded-full transition-all duration-300"
                    style={{ width: `${capacityPercent}%` }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Sticky Footer */}
        <div className="shrink-0 px-7 py-4 border-t border-gs-border bg-gs-card flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyLink}
              className="px-3 py-1.5 rounded-lg border border-gs-border text-xs font-medium text-gs-text-muted hover:text-gs-text-main hover:bg-white/5 transition-colors flex items-center gap-1.5 cursor-pointer"
              title="Share Event Link"
            >
              {copiedLink ? <Check size={13} className="text-emerald-400" /> : <Share2 size={13} />}
              {copiedLink ? 'Copied!' : 'Share Event'}
            </button>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-gs-border text-xs font-medium text-gs-text-muted hover:text-gs-text-main hover:bg-white/5 transition-colors cursor-pointer"
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
                className="px-4 py-2 rounded-lg bg-[#6D6AF6] hover:bg-[#5C59EC] text-white font-medium text-xs shadow-xs transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer btn-tactile"
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

