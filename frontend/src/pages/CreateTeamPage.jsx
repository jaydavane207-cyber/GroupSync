import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Globe, Lock, Loader2, X
} from 'lucide-react';
import { useAppContext } from '@/context/AppContext';
import { createTeam } from '@/lib/services/teamService';

const SUGGESTED_SKILLS = [
  'React', 'Node.js', 'Python', 'Machine Learning', 'Figma',
  'UI/UX', 'Solidity', 'FastAPI', 'PyTorch', 'AWS', 'Flutter', 'TypeScript'
];

const EMOJI_OPTIONS = ['🚀', '🤖', '⚡', '💡', '🧠', '🛡️', '🌐', '🌱', '🎨', '🧪', '💻', '🎯'];

export default function CreateTeamPage() {
  const navigate = useNavigate();
  const { user, showToast } = useAppContext();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('hackathon');
  const [maxMembers, setMaxMembers] = useState(4);
  const [privacy, setPrivacy] = useState('public');
  const [bannerEmoji, setBannerEmoji] = useState('🚀');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const emojiPickerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target)) {
        setShowEmojiPicker(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const [skills, setSkills] = useState(['React', 'Node.js']);
  const [skillInput, setSkillInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddSkill = (skillToAdd) => {
    const trimmed = (skillToAdd || skillInput).trim();
    if (!trimmed) return;
    if (skills.includes(trimmed)) {
      setSkillInput('');
      return;
    }
    if (skills.length >= 8) {
      showToast('Maximum 8 skills per team', 'error');
      return;
    }
    setSkills([...skills, trimmed]);
    setSkillInput('');
  };

  const handleRemoveSkill = (skillToRemove) => {
    setSkills(skills.filter(s => s !== skillToRemove));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user?.id) {
      showToast('Please log in to create a team', 'error');
      return;
    }
    if (name.trim().length < 3) {
      showToast('Team name must be at least 3 characters', 'error');
      return;
    }
    if (description.trim().length < 10) {
      showToast('Please provide a brief description (min 10 chars)', 'error');
      return;
    }
    if (skills.length === 0) {
      showToast('Please add at least one required skill', 'error');
      return;
    }

    setIsSubmitting(true);
    const { data: newTeam, error } = await createTeam({
      name,
      description,
      category,
      skills,
      maxMembers,
      privacy,
      bannerEmoji,
      leaderId: user.id
    });

    setIsSubmitting(false);

    if (error) {
      showToast(error.userMessage || 'Failed to create team', 'error');
    } else if (newTeam) {
      showToast('Team created successfully', 'success');
      navigate(`/teams/${newTeam.id}`);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-5 pb-12">
      {/* Back button */}
      <button
        onClick={() => navigate('/teams')}
        className="inline-flex items-center gap-1.5 text-xs font-medium text-gs-text-muted hover:text-gs-text-main transition-colors"
      >
        <ArrowLeft size={14} /> Back to teams
      </button>

      {/* Main Card */}
      <div className="glass-card rounded-xl p-6 sm:p-8 space-y-6 shadow-sm">
        <div className="border-b border-gs-border pb-4">
          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-gs-text-main">
            Create a team
          </h1>
          <p className="text-xs text-gs-text-muted mt-1">
            Specify team objectives, target events, and required technical roles.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Squad Identity */}
          <div>
            <label className="block text-xs font-medium text-gs-text-main mb-1.5">
              Team name *
            </label>
            <div className="flex gap-2.5">
              {/* Emoji Selector */}
              <div className="relative group" ref={emojiPickerRef}>
                <button
                  type="button"
                  title="Choose team icon"
                  onClick={() => setShowEmojiPicker(prev => !prev)}
                  className="w-10 h-10 rounded-lg bg-black/5 dark:bg-white/[0.04] border border-gs-border flex items-center justify-center text-xl cursor-pointer hover:border-blue-500/40 transition-colors select-none"
                >
                  {bannerEmoji}
                </button>
                {/* Quick Emoji Dropdown */}
                <div className={`absolute left-0 top-full mt-1.5 bg-gs-card border border-gs-border p-2 rounded-lg shadow-xl grid grid-cols-4 gap-1 z-30 ${showEmojiPicker ? 'grid' : 'hidden group-hover:grid'}`}>
                  {EMOJI_OPTIONS.map(em => (
                    <button
                      key={em}
                      type="button"
                      onClick={() => {
                        setBannerEmoji(em);
                        setShowEmojiPicker(false);
                      }}
                      className={`p-1.5 hover:bg-black/5 dark:hover:bg-white/[0.06] rounded text-lg transition-colors ${
                        bannerEmoji === em ? 'bg-blue-500/15 border border-blue-500/30' : ''
                      }`}
                    >
                      {em}
                    </button>
                  ))}
                </div>
              </div>

              {/* Name Input */}
              <div className="flex-1">
                <input
                  type="text"
                  required
                  maxLength={50}
                  placeholder="e.g. Distributed Consensus Labs"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full h-10 glass-elevated rounded-lg px-3 text-xs text-gs-text-main placeholder-gs-text-muted outline-none focus:border-[#7c6af6] transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Category Selection */}
          <div>
            <label className="block text-xs font-medium text-gs-text-main mb-1.5">
              Category
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'hackathon', label: 'Hackathon' },
                { id: 'project', label: 'Capstone / Project' },
                { id: 'research', label: 'Lab & Research' },
                { id: 'competition', label: 'Competition' },
              ].map(cat => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategory(cat.id)}
                  className={`py-2 px-2.5 rounded-lg text-xs font-medium transition-colors border text-center ${
                    category === cat.id
                      ? 'bg-[#6D6AF6]/10 text-[#9182f8] border-[#7c6af6]/30'
                      : 'bg-white/[0.02] border-gs-border text-gs-text-muted hover:text-gs-text-main'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-medium text-gs-text-main">
                Project description *
              </label>
              <span className="text-[11px] text-gs-text-muted">{description.length}/500</span>
            </div>
            <textarea
              required
              rows={3}
              maxLength={500}
              placeholder="Outline what your squad intends to build, key event dates or deadlines, and what responsibilities each member will own..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full glass-elevated rounded-lg p-2.5 text-xs text-gs-text-main placeholder-gs-text-muted outline-none focus:border-[#7c6af6] transition-colors resize-none leading-relaxed"
            />
          </div>

          {/* Required Skills */}
          <div>
            <label className="block text-xs font-medium text-gs-text-main mb-1.5">
              Required skills ({skills.length}/8) *
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                placeholder="Type skill & press Enter..."
                value={skillInput}
                onChange={e => setSkillInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSkill();
                  }
                }}
                className="flex-1 glass-elevated rounded-lg px-3 py-1.5 text-xs text-gs-text-main outline-none focus:border-[#7c6af6]"
              />
              <button
                type="button"
                onClick={() => handleAddSkill()}
                className="px-3 py-1.5 bg-gs-elevated hover:bg-white/[0.04] text-gs-text-main rounded-lg text-xs font-medium transition-colors border border-gs-border btn-tactile"
              >
                Add skill
              </button>
            </div>

            {/* Selected Skills */}
            <div className="flex flex-wrap gap-1.5 mb-2">
              {skills.map(s => (
                <span
                  key={s}
                  className="flex items-center gap-1.5 px-2.5 py-0.5 bg-[#7c6af6]/15 border border-[#7c6af6]/30 text-[#9182f8] rounded text-xs"
                >
                  {s}
                  <button type="button" onClick={() => handleRemoveSkill(s)} className="hover:text-rose-400">
                    <X size={12} />
                  </button>
                </span>
              ))}
            </div>

            {/* Suggested Skills */}
            <div className="flex flex-wrap gap-1 items-center">
              <span className="text-[11px] text-gs-text-muted mr-1">Suggested:</span>
              {SUGGESTED_SKILLS.filter(s => !skills.includes(s)).slice(0, 6).map(s => (
                <button
                  key={s}
                  type="button"
                  onClick={() => handleAddSkill(s)}
                  className="px-2 py-0.5 rounded bg-white/[0.03] border border-gs-border text-[11px] text-gs-text-muted hover:text-gs-text-main transition-colors"
                >
                  + {s}
                </button>
              ))}
            </div>
          </div>

          {/* Team Size & Privacy */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            <div>
              <label className="block text-xs font-medium text-gs-text-main mb-1.5">
                Total capacity: <span className="font-semibold text-gs-text-main">{maxMembers} members</span>
              </label>
              <input
                type="range"
                min={2}
                max={10}
                value={maxMembers}
                onChange={e => setMaxMembers(Number(e.target.value))}
                className="w-full accent-[#6D6AF6] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-gs-text-muted mt-1">
                <span>2 (Pair)</span>
                <span>4 (Standard)</span>
                <span>10 (Cohort)</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gs-text-main mb-1.5">
                Visibility mode
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setPrivacy('public')}
                  className={`flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium border transition-colors ${
                    privacy === 'public'
                      ? 'bg-[#6D6AF6]/10 text-[#9182f8] border-[#7c6af6]/30'
                      : 'bg-white/[0.02] text-gs-text-muted border-gs-border'
                  }`}
                >
                  <Globe size={13} /> Public
                </button>
                <button
                  type="button"
                  onClick={() => setPrivacy('private')}
                  className={`flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium border transition-colors ${
                    privacy === 'private'
                      ? 'bg-[#6D6AF6]/10 text-[#9182f8] border-[#7c6af6]/30'
                      : 'bg-white/[0.02] text-gs-text-muted border-gs-border'
                  }`}
                >
                  <Lock size={13} /> Private (Invite)
                </button>
              </div>
            </div>
          </div>

          {/* Submit CTA */}
          <div className="pt-3 border-t border-gs-border flex gap-2.5">
            <button
              type="button"
              onClick={() => navigate('/teams')}
              className="px-4 py-2 rounded-lg border border-gs-border text-xs font-medium text-gs-text-muted hover:bg-white/[0.04] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-2 rounded-lg bg-gradient-to-r from-[#7c6af6] to-[#a78bfa] hover:from-[#6155e0] hover:to-[#9178f4] text-white text-xs font-medium transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50 shadow-xs btn-tactile"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={14} className="animate-spin" /> Creating team...
                </>
              ) : (
                'Create team'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


