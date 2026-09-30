import React, { useState, useEffect, useCallback } from 'react';
import ReactDOM from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Sparkles, Users, Tag, FileText, Layers,
  ChevronDown, Check, Loader2, AlertCircle, Lock,
  Globe, ShieldCheck, Hash, Plus
} from 'lucide-react';
import { useAppContext } from '@/context/AppContext';
import supabase from '@/lib/supabase';

// â”€â”€â”€ Skill Catalogue â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Grouped by category for a richer UI. Each entry: { label, color, bg, border }
const SKILL_GROUPS = [
  {
    category: 'Frontend',
    skills: [
      { label: 'React',    color: '#3b82f6', bg: 'rgba(59,130,246,0.08)',   border: 'rgba(59,130,246,0.35)'   },
      { label: 'Next.js',  color: '#94a3b8', bg: 'rgba(148,163,184,0.08)', border: 'rgba(148,163,184,0.35)' },
      { label: 'Tailwind', color: '#38bdf8', bg: 'rgba(56,189,248,0.08)',  border: 'rgba(56,189,248,0.35)'  },
      { label: 'Figma',    color: '#f97316', bg: 'rgba(249,115,22,0.08)',  border: 'rgba(249,115,22,0.35)'  },
      { label: 'UI/UX',   color: '#ec4899', bg: 'rgba(236,72,153,0.08)',  border: 'rgba(236,72,153,0.35)'  },
    ],
  },
  {
    category: 'Backend',
    skills: [
      { label: 'Node.js',  color: '#10b981', bg: 'rgba(16,185,129,0.08)',  border: 'rgba(16,185,129,0.35)'  },
      { label: 'Python',   color: '#3b82f6', bg: 'rgba(59,130,246,0.08)',  border: 'rgba(59,130,246,0.35)'  },
      { label: 'Go',       color: '#06b6d4', bg: 'rgba(6,182,212,0.08)',   border: 'rgba(6,182,212,0.35)'   },
      { label: 'Rust',     color: '#f59e0b', bg: 'rgba(245,158,11,0.08)',  border: 'rgba(245,158,11,0.35)'  },
      { label: 'Java',     color: '#ef4444', bg: 'rgba(239,68,68,0.08)',   border: 'rgba(239,68,68,0.35)'   },
      { label: 'C++',      color: '#6366f1', bg: 'rgba(99,102,241,0.08)',  border: 'rgba(99,102,241,0.35)'  },
      { label: 'GraphQL',  color: '#e879f9', bg: 'rgba(232,121,249,0.08)', border: 'rgba(232,121,249,0.35)' },
    ],
  },
  {
    category: 'Data & Cloud',
    skills: [
      { label: 'SQL',          color: '#14b8a6', bg: 'rgba(20,184,166,0.08)',  border: 'rgba(20,184,166,0.35)'  },
      { label: 'MongoDB',      color: '#4ade80', bg: 'rgba(74,222,128,0.08)',  border: 'rgba(74,222,128,0.35)'  },
      { label: 'AWS',          color: '#fb923c', bg: 'rgba(251,146,60,0.08)',  border: 'rgba(251,146,60,0.35)'  },
      { label: 'Docker',       color: '#60a5fa', bg: 'rgba(96,165,250,0.08)',  border: 'rgba(96,165,250,0.35)'  },
      { label: 'ML',           color: '#a78bfa', bg: 'rgba(167,139,250,0.08)', border: 'rgba(167,139,250,0.35)' },
      { label: 'Data Sci',     color: '#34d399', bg: 'rgba(52,211,153,0.08)',  border: 'rgba(52,211,153,0.35)'  },
    ],
  },
  {
    category: 'Specialised',
    skills: [
      { label: 'CyberSecurity', color: '#f43f5e', bg: 'rgba(244,63,94,0.08)', border: 'rgba(244,63,94,0.35)' },
      { label: 'Game Dev',      color: '#8b5cf6', bg: 'rgba(139,92,246,0.08)',border: 'rgba(139,92,246,0.35)' },
    ],
  },
];

const ALL_SKILLS = SKILL_GROUPS.flatMap(g => g.skills);
const getSkillMeta = (label) => ALL_SKILLS.find(s => s.label === label) || { label, color: '#6D6AF6', bg: 'rgba(109,106,246,0.08)', border: 'rgba(109,106,246,0.35)' };

// â”€â”€â”€ Event types â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const EVENT_TYPES = [
  { value: 'Hackathon',    label: 'Hackathon' },
  { value: 'Mini-Project', label: 'Mini-Project' },
  { value: 'Study Group',  label: 'Study Group' },
  { value: 'Competition',  label: 'Competition' },
];

// â”€â”€â”€ Privacy options â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const PRIVACY_OPTIONS = [
  { value: 'public',   label: 'Public',   icon: Globe,       desc: 'Anyone can request to join'  },
  { value: 'private',  label: 'Private',  icon: Lock,        desc: 'Invite-only, hidden from browse' },
];

// â”€â”€â”€ Input field wrapper â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function Field({ label, required, hint, children }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold uppercase tracking-widest text-[var(--color-gs-text-muted)]">
          {label}
          {required && <span className="ml-1 text-blue-500">*</span>}
        </label>
        {hint && <span className="text-[10px] text-[var(--color-gs-text-muted)]/60">{hint}</span>}
      </div>
      {children}
    </div>
  );
}

// â”€â”€â”€ Section divider â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function SectionDivider({ icon: Icon, label }) {
  return (
    <div className="flex items-center gap-3 py-1">
      <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[var(--color-gs-border)] to-transparent" />
      <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-[var(--color-gs-text-muted)]/70">
        <Icon size={11} />
        {label}
      </div>
      <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[var(--color-gs-border)] to-transparent" />
    </div>
  );
}

// â”€â”€â”€ Main Component â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
/**
 * CreateGroupModal
 *
 * Props:
 *   isOpen    (boolean)  â€” controls visibility
 *   onClose   (fn)       â€” called when the modal should close
 *   onSuccess (fn?)      â€” optional callback after successful creation
 */
export default function CreateGroupModal({ isOpen, onClose, onSuccess }) {
  const { user, showToast, refreshGroups } = useAppContext();

  // â”€â”€ Form state â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const [groupName,           setGroupName]           = useState('');
  const [projectDescription,  setProjectDescription]  = useState('');
  const [eventType,           setEventType]           = useState('Hackathon');
  const [requiredSkills,      setRequiredSkills]      = useState([]);
  const [privacy,             setPrivacy]             = useState('public');
  const [maxMembers,          setMaxMembers]          = useState(4);
  const [isSubmitting,        setIsSubmitting]        = useState(false);
  const [skillSearch,         setSkillSearch]         = useState('');
  const [error,               setError]               = useState('');

  // â”€â”€ Close on Escape â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  // â”€â”€ Reset form when modal opens â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  useEffect(() => {
    if (isOpen) {
      setGroupName('');
      setProjectDescription('');
      setEventType('Hackathon');
      setRequiredSkills([]);
      setPrivacy('public');
      setMaxMembers(4);
      setIsSubmitting(false);
      setSkillSearch('');
      setError('');
    }
  }, [isOpen]);

  // â”€â”€ Skill toggle â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const MAX_SKILLS = 8;
  const toggleSkill = useCallback((label) => {
    setRequiredSkills(prev => {
      if (prev.includes(label)) return prev.filter(s => s !== label);
      if (prev.length >= MAX_SKILLS) return prev; // cap at 8
      return [...prev, label];
    });
  }, []);

  // â”€â”€ Filtered skill list for search â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const filteredGroups = skillSearch.trim()
    ? [{ category: 'Search results', skills: ALL_SKILLS.filter(s => s.label.toLowerCase().includes(skillSearch.toLowerCase())) }]
    : SKILL_GROUPS;

  // â”€â”€ Can submit? â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const canSubmit = groupName.trim().length > 0 && requiredSkills.length > 0 && !isSubmitting;

  // â”€â”€ Submit handler â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    setError('');
    setIsSubmitting(true);

    try {
      // â”€â”€ Build the group record matching the real `groups` table schema â”€â”€â”€â”€â”€â”€â”€
      const dbGroup = {
        name:        groupName.trim(),
        // `event` column stores the event name; we use eventType as the event label
        event:       eventType,
        // `type` column is used for filtering in BrowseGroups (Hackathon / Technical / Cultural)
        type:        eventType === 'Study Group' ? 'Technical' : eventType === 'Mini-Project' ? 'Technical' : eventType,
        description: projectDescription.trim() || `A ${eventType} group looking for talented collaborators.`,
        skills:      requiredSkills,  // TEXT[] column
        members:     1,              // creator counts as first member
        max_members: maxMembers,
        privacy:     privacy,
        admin_id:    user?.id || null,
      };

      // â”€â”€ TODO: Uncomment and wire up the Supabase insert â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
      // const { data: insertedGroup, error: groupError } = await supabase
      //   .from('groups')
      //   .insert([dbGroup])
      //   .select()
      //   .single();
      //
      // if (groupError) throw groupError;
      //
      // // Add the creator as the first member (critical to satisfy RLS policies)
      // if (user?.id && insertedGroup) {
      //   await supabase
      //     .from('group_members')
      //     .insert({ group_id: insertedGroup.id, profile_id: user.id });
      // }
      // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

      // â”€â”€ Live Supabase insert (mirrors BrowseGroups.handleCreateGroup) â”€â”€â”€â”€â”€â”€â”€â”€
      const { data: insertedGroup, error: groupError } = await supabase
        .from('groups')
        .insert([dbGroup])
        .select()
        .single();

      if (groupError) throw groupError;

      // Add creator as first member so they can access the group
      if (user?.id && insertedGroup) {
        const { error: memberError } = await supabase
          .from('group_members')
          .insert({ group_id: insertedGroup.id, profile_id: user.id });

        if (memberError) {
          // Non-fatal â€” group was created, but log it
          console.warn('[CreateGroupModal] Could not add creator to group_members:', memberError.message);
        }
      }

      // Refresh the group list in AppContext so BrowseGroups shows the new entry immediately
      if (refreshGroups) await refreshGroups();

      showToast(`ðŸŽ‰ "${groupName.trim()}" is live! Start recruiting.`, 'success');
      onSuccess?.(insertedGroup);
      onClose();
    } catch (err) {
      console.error('[CreateGroupModal] Error creating group:', err);
      const message = err?.message || 'Something went wrong. Please try again.';
      setError(message);
      showToast(`Failed: ${message}`, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // â”€â”€ Portal target â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  if (typeof document === 'undefined') return null;

  return ReactDOM.createPortal(
    <AnimatePresence>
      {isOpen && (
        /* â”€â”€ Backdrop â”€â”€ */
        <motion.div
          key="cgm-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
          onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
          {/* â”€â”€ Modal panel â”€â”€ */}
          <motion.div
            key="cgm-panel"
            initial={{ opacity: 0, scale: 0.98, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: 10 }}
            transition={{ duration: 0.15 }}
            className="relative w-full max-w-xl bg-gs-card border border-gs-border rounded-xl shadow-xl overflow-hidden max-h-[92vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* â”€â”€ Header â”€â”€ */}
            <div className="flex items-center justify-between px-6 py-4 shrink-0 border-b border-gs-border">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#6D6AF6]/10 border border-[#6D6AF6]/20 flex items-center justify-center">
                  <Users size={16} className="text-[#6D6AF6]" />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-gs-text-main leading-none">
                    Create a Team
                  </h2>
                  <p className="text-xs text-gs-text-muted mt-1">
                    Define your project and recruit the right people
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-gs-text-muted hover:text-gs-text-main hover:bg-white/5 border border-transparent hover:border-gs-border transition-colors cursor-pointer"
                aria-label="Close modal"
              >
                <X size={16} />
              </button>
            </div>

            {/* â”€â”€ Scrollable form body â”€â”€ */}
            <form
              id="create-group-form"
              onSubmit={handleSubmit}
              className="flex-1 overflow-y-auto px-7 py-6 space-y-6"
              style={{ scrollbarWidth: 'thin' }}
            >
              {/* â”€â”€ Error banner â”€â”€ */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex items-start gap-2.5 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs leading-relaxed"
                  >
                    <AlertCircle size={14} className="shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* â”€â”€ SECTION 1: Basic Info â”€â”€ */}
              <SectionDivider icon={FileText} label="Basic Info" />

              {/* Group Name */}
              <Field label="Team / Group Name" required hint={`${groupName.length}/60`}>
                <input
                  id="cgm-group-name"
                  type="text"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value.slice(0, 60))}
                  placeholder="e.g. Neural Ninjas, Code Crusadersâ€¦"
                  className="w-full bg-[var(--color-gs-bg)] border border-[var(--color-gs-border)] rounded-xl px-4 py-2.5 text-xs
                    text-[var(--color-gs-text-main)] placeholder-[var(--color-gs-text-muted)]/60
                    outline-none focus:border-[#6D6AF6] focus:ring-1 focus:ring-[#6D6AF6]
                    transition-colors duration-150"
                  autoFocus
                />
              </Field>

              {/* Project Description */}
              <Field label="Project Description" hint={`${projectDescription.length}/300`}>
                <textarea
                  id="cgm-description"
                  value={projectDescription}
                  onChange={(e) => setProjectDescription(e.target.value.slice(0, 300))}
                  placeholder="Describe what you're building, the problem you're solving, and what makes it excitingâ€¦"
                  rows={3}
                  className="w-full bg-[var(--color-gs-bg)] border border-[var(--color-gs-border)] rounded-xl px-4 py-2.5 text-xs
                    text-[var(--color-gs-text-main)] placeholder-[var(--color-gs-text-muted)]/60
                    outline-none focus:border-[#6D6AF6] focus:ring-1 focus:ring-[#6D6AF6]
                    transition-colors duration-150 resize-none"
                />
              </Field>

              {/* â”€â”€ SECTION 2: Event & Team Settings â”€â”€ */}
              <SectionDivider icon={Layers} label="Team Settings" />

              <div className="grid grid-cols-2 gap-4">
                {/* Event Type */}
                <Field label="Event Type" required>
                  <div className="relative">
                    <select
                      id="cgm-event-type"
                      value={eventType}
                      onChange={(e) => setEventType(e.target.value)}
                      className="w-full appearance-none bg-[var(--color-gs-bg)] border border-[var(--color-gs-border)] rounded-xl
                        px-4 py-2.5 text-xs text-[var(--color-gs-text-main)]
                        outline-none focus:border-[#6D6AF6] focus:ring-1 focus:ring-[#6D6AF6]
                        transition-colors cursor-pointer pr-10"
                    >
                      {EVENT_TYPES.map(et => (
                        <option key={et.value} value={et.value}>{et.label}</option>
                      ))}
                    </select>
                    <ChevronDown size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-gs-text-muted)] pointer-events-none" />
                  </div>
                </Field>

                {/* Privacy */}
                <Field label="Privacy">
                  <div className="relative">
                    <select
                      id="cgm-privacy"
                      value={privacy}
                      onChange={(e) => setPrivacy(e.target.value)}
                      className="w-full appearance-none bg-[var(--color-gs-bg)] border border-[var(--color-gs-border)] rounded-xl
                        px-4 py-2.5 text-xs text-[var(--color-gs-text-main)]
                        outline-none focus:border-[#6D6AF6] focus:ring-1 focus:ring-[#6D6AF6]
                        transition-colors cursor-pointer pr-10"
                    >
                      {PRIVACY_OPTIONS.map(p => (
                        <option key={p.value} value={p.value}>{p.label}</option>
                      ))}
                    </select>
                    <ChevronDown size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-gs-text-muted)] pointer-events-none" />
                  </div>
                </Field>
              </div>

              {/* Max Members slider */}
              <Field label="Max Team Size" hint={`${maxMembers} members`}>
                <div className="space-y-2">
                  <input
                    id="cgm-max-members"
                    type="range"
                    min={2}
                    max={10}
                    value={maxMembers}
                    onChange={(e) => setMaxMembers(parseInt(e.target.value))}
                    className="w-full h-1.5 rounded-full appearance-none accent-[#6D6AF6] cursor-pointer"
                  />
                  {/* Tick marks */}
                  <div className="flex justify-between text-[10px] text-gs-text-muted/60 px-0.5">
                    {[2,3,4,5,6,7,8,9,10].map(n => (
                      <span key={n} className={n === maxMembers ? 'text-[#6D6AF6] font-semibold' : ''}>{n}</span>
                    ))}
                  </div>
                </div>
              </Field>

              {/* â”€â”€ SECTION 3: Required Skills â”€â”€ */}
              <SectionDivider icon={Tag} label="Required Skills" />

              <div className="space-y-3">
                {/* Header + counter */}
                <div className="flex items-center justify-between">
                  <p className="text-xs text-gs-text-muted leading-relaxed">
                    Click skills your team needs. Selected skills appear on your group card.
                  </p>
                  <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full border transition-colors ${
                    requiredSkills.length === 0
                      ? 'bg-red-500/10 border-red-500/20 text-red-500'
                      : requiredSkills.length >= MAX_SKILLS
                      ? 'bg-amber-500/10 border-amber-500/20 text-amber-500'
                      : 'bg-green-500/10 border-green-500/20 text-green-500'
                  }`}>
                    {requiredSkills.length} / {MAX_SKILLS}
                  </span>
                </div>

                {/* Skill search */}
                <div className="relative">
                  <Hash size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gs-text-muted" />
                  <input
                    id="cgm-skill-search"
                    type="text"
                    value={skillSearch}
                    onChange={(e) => setSkillSearch(e.target.value)}
                    placeholder="Search skillsâ€¦"
                    className="w-full bg-black/5 dark:bg-white/[0.03] border border-gs-border rounded-lg
                      pl-8 pr-4 py-1.5 text-xs text-gs-text-main placeholder-gs-text-muted
                      outline-none focus:border-blue-500 transition-colors"
                  />
                </div>

                {/* Selected chips (floating above the grid) */}
                <AnimatePresence>
                  {requiredSkills.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="flex flex-wrap gap-1.5 pb-1"
                    >
                      {requiredSkills.map(label => {
                        const meta = getSkillMeta(label);
                        return (
                          <motion.button
                            key={label}
                            type="button"
                            initial={{ scale: 0.7, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.7, opacity: 0 }}
                            onClick={() => toggleSkill(label)}
                            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all hover:opacity-80"
                            style={{ backgroundColor: meta.bg, borderColor: meta.border, color: meta.color }}
                          >
                            <Check size={10} />
                            {label}
                            <X size={9} className="opacity-60" />
                          </motion.button>
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Skill badge grid â€” grouped by category */}
                <div className="space-y-4 max-h-52 overflow-y-auto pr-1" style={{ scrollbarWidth: 'thin' }}>
                  {filteredGroups.map(group => (
                    <div key={group.category}>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-gs-text-muted)]/60 mb-2">
                        {group.category}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {group.skills.map(skill => {
                          const isSelected = requiredSkills.includes(skill.label);
                          const isDisabled = !isSelected && requiredSkills.length >= MAX_SKILLS;
                          return (
                            <button
                              type="button"
                              key={skill.label}
                              id={`cgm-skill-${skill.label.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
                              onClick={() => !isDisabled && toggleSkill(skill.label)}
                              disabled={isDisabled}
                              className={`
                                relative px-3 py-1.5 rounded-lg text-xs font-semibold border
                                transition-all duration-200
                                ${isSelected ? 'scale-[1.04]' : 'hover:scale-[1.03]'}
                                ${isDisabled ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'}
                              `}
                              style={{
                                backgroundColor: isSelected ? skill.bg : 'transparent',
                                borderColor: isSelected ? skill.border : 'var(--color-gs-border)',
                                color: isSelected ? skill.color : 'var(--color-gs-text-muted)',
                              }}
                              onMouseEnter={(e) => {
                                if (!isDisabled && !isSelected)
                                  e.currentTarget.style.borderColor = skill.border;
                              }}
                              onMouseLeave={(e) => {
                                if (!isSelected)
                                  e.currentTarget.style.borderColor = 'var(--color-gs-border)';
                              }}
                            >
                              {isSelected && (
                                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center"
                                  style={{ backgroundColor: skill.color }}>
                                  <Check size={9} className="text-[#0a0e1a]" />
                                </span>
                              )}
                              {skill.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                  {filteredGroups[0]?.skills.length === 0 && (
                    <p className="text-sm text-center py-4 text-[var(--color-gs-text-muted)]">
                      No skills matching "{skillSearch}"
                    </p>
                  )}
                </div>

                {/* Validation hint */}
                {requiredSkills.length === 0 && (
                  <p className="text-[11px] text-red-400/80 flex items-center gap-1.5">
                    <AlertCircle size={11} /> At least one skill is required to create the team.
                  </p>
                )}
              </div>
            </form>

            {/* â”€â”€ Sticky footer â”€â”€ */}
            <div className="shrink-0 px-7 py-4 border-t border-gs-border bg-gs-card/80 backdrop-blur-xs">
              <div className="flex items-center gap-3">
                {/* Cancel */}
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isSubmitting}
                  className="flex-1 py-2.5 rounded-lg border border-gs-border text-xs font-medium
                    text-gs-text-muted hover:text-gs-text-main
                    hover:border-white/20 hover:bg-white/5
                    transition-colors disabled:opacity-40 cursor-pointer"
                >
                  Cancel
                </button>

                {/* Submit */}
                <button
                  id="cgm-submit-btn"
                  type="submit"
                  form="create-group-form"
                  disabled={!canSubmit}
                  className={`
                    flex-[2] py-2.5 rounded-lg text-xs font-medium flex items-center justify-center gap-2
                    transition-colors duration-150 cursor-pointer
                    ${canSubmit
                      ? 'bg-[#6D6AF6] hover:bg-[#5C59EC] text-white shadow-xs btn-tactile'
                      : 'bg-gs-border text-gs-text-muted cursor-not-allowed opacity-50'
                    }
                  `}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      Creating Teamâ€¦
                    </>
                  ) : (
                    <>
                      <Plus size={14} />
                      Create Team
                    </>
                  )}
                </button>
              </div>

              {/* Requirement hints */}
              <div className="flex gap-4 mt-3 justify-center">
                <span className={`text-[10px] flex items-center gap-1 ${groupName.trim() ? 'text-[var(--color-gs-green)]' : 'text-[var(--color-gs-text-muted)]/50'}`}>
                  <Check size={9} /> Group name
                </span>
                <span className={`text-[10px] flex items-center gap-1 ${requiredSkills.length > 0 ? 'text-[var(--color-gs-green)]' : 'text-[var(--color-gs-text-muted)]/50'}`}>
                  <Check size={9} /> At least 1 skill
                </span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}

