import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users, ArrowLeft, Sparkles, Plus, X, Shield, Globe, Lock,
  Loader2, Check, Trophy, Rocket, GraduationCap, Cpu
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { createTeam } from '../lib/teamService';

const SUGGESTED_SKILLS = [
  'React', 'Node.js', 'Python', 'Machine Learning', 'Figma',
  'UI/UX', 'Solidity', 'FastAPI', 'PyTorch', 'AWS', 'Flutter', 'TypeScript'
];

const EMOJI_OPTIONS = ['🚀', '🤖', '⚡', '💡', '🧠', '🛡️', '🌐', '🌱', '🎨', '🧬', '💻', '🎯'];

export default function CreateTeamPage() {
  const navigate = useNavigate();
  const { user, showToast } = useAppContext();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('hackathon');
  const [maxMembers, setMaxMembers] = useState(4);
  const [privacy, setPrivacy] = useState('public');
  const [bannerEmoji, setBannerEmoji] = useState('🚀');

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
      showToast('Team created successfully! 🚀', 'success');
      navigate(`/teams/${newTeam.id}`);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-[load-fade-up_0.3s_ease-out]">
      {/* Back button */}
      <button
        onClick={() => navigate('/teams')}
        className="flex items-center gap-2 text-xs font-bold text-[var(--color-gs-text-muted)] hover:text-white transition-colors"
      >
        <ArrowLeft size={16} /> Back to Teams
      </button>

      {/* Main Card */}
      <div className="bg-[var(--color-gs-card)] border border-[var(--color-gs-border)] rounded-3xl p-6 md:p-10 space-y-8 backdrop-blur-xl shadow-2xl">
        <div>
          <h1 className="text-3xl font-black font-heading text-white tracking-tight">
            Assemble a <span className="text-[var(--color-gs-cyan)]">New Team</span>
          </h1>
          <p className="text-xs md:text-sm text-[var(--color-gs-text-muted)] mt-1">
            Specify your project goals and required skillsets to recruit ideal campus teammates.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Emoji & Name row */}
          <div>
            <label className="block text-xs font-bold text-[var(--color-gs-text-muted)] uppercase tracking-wider mb-2">
              Team Identity *
            </label>
            <div className="flex gap-3">
              {/* Emoji Selector */}
              <div className="relative group">
                <div className="w-14 h-14 rounded-2xl bg-[var(--color-gs-bg)] border border-[var(--color-gs-border)] flex items-center justify-center text-3xl cursor-pointer hover:border-[var(--color-gs-cyan)] transition-colors">
                  {bannerEmoji}
                </div>
                {/* Quick Emoji Dropdown */}
                <div className="absolute left-0 top-full mt-2 bg-[var(--color-gs-card)] border border-[var(--color-gs-border)] p-2 rounded-2xl shadow-2xl grid grid-cols-4 gap-1 z-30 hidden group-hover:grid">
                  {EMOJI_OPTIONS.map(em => (
                    <button
                      key={em}
                      type="button"
                      onClick={() => setBannerEmoji(em)}
                      className="p-2 hover:bg-white/10 rounded-xl text-xl"
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
                  placeholder="e.g. Quantum Hackers, Autonomous Rover..."
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full h-14 bg-[var(--color-gs-bg)] border border-[var(--color-gs-border)] rounded-2xl px-4 text-base font-bold text-white placeholder-[var(--color-gs-text-muted)] outline-none focus:border-[var(--color-gs-cyan)] transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-bold text-[var(--color-gs-text-muted)] uppercase tracking-wider mb-2">
              Category
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'hackathon', label: 'Hackathon' },
                { id: 'project', label: 'Project' },
                { id: 'research', label: 'Research' },
                { id: 'competition', label: 'Competition' },
              ].map(cat => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategory(cat.id)}
                  className={`py-3 rounded-2xl text-xs font-bold transition-all border ${
                    category === cat.id
                      ? 'bg-[var(--color-gs-cyan)]/15 border-[var(--color-gs-cyan)] text-[var(--color-gs-cyan)] shadow-[0_0_12px_rgba(0,240,255,0.15)]'
                      : 'bg-[var(--color-gs-bg)] border-[var(--color-gs-border)] text-[var(--color-gs-text-muted)] hover:border-[var(--color-gs-cyan)]/40'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-bold text-[var(--color-gs-text-muted)] uppercase tracking-wider">
                Objective & Scope *
              </label>
              <span className="text-[10px] text-[var(--color-gs-text-muted)]">{description.length}/500</span>
            </div>
            <textarea
              required
              rows={4}
              maxLength={500}
              placeholder="Describe what your team is aiming to build, the upcoming deadline or event, and who you are looking to collaborate with..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full bg-[var(--color-gs-bg)] border border-[var(--color-gs-border)] rounded-2xl p-4 text-sm text-white placeholder-[var(--color-gs-text-muted)] outline-none focus:border-[var(--color-gs-cyan)] transition-colors resize-none leading-relaxed"
            />
          </div>

          {/* Required Skills */}
          <div>
            <label className="block text-xs font-bold text-[var(--color-gs-text-muted)] uppercase tracking-wider mb-2">
              Skills Needed ({skills.length}/8) *
            </label>
            <div className="flex gap-2 mb-3">
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
                className="flex-1 bg-[var(--color-gs-bg)] border border-[var(--color-gs-border)] rounded-2xl px-4 py-2.5 text-sm text-white outline-none focus:border-[var(--color-gs-cyan)]"
              />
              <button
                type="button"
                onClick={() => handleAddSkill()}
                className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-2xl text-xs font-bold transition-colors"
              >
                Add
              </button>
            </div>

            {/* Selected Skills */}
            <div className="flex flex-wrap gap-2 mb-3">
              {skills.map(s => (
                <span
                  key={s}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-[var(--color-gs-cyan)]/15 border border-[var(--color-gs-cyan)]/30 text-[var(--color-gs-cyan)] rounded-xl text-xs font-bold"
                >
                  {s}
                  <button type="button" onClick={() => handleRemoveSkill(s)} className="hover:text-red-400">
                    <X size={12} />
                  </button>
                </span>
              ))}
            </div>

            {/* Suggested Skills */}
            <div className="flex flex-wrap gap-1.5 items-center">
              <span className="text-[10px] text-[var(--color-gs-text-muted)] mr-1">Suggestions:</span>
              {SUGGESTED_SKILLS.filter(s => !skills.includes(s)).slice(0, 6).map(s => (
                <button
                  key={s}
                  type="button"
                  onClick={() => handleAddSkill(s)}
                  className="px-2.5 py-1 rounded-lg bg-[var(--color-gs-bg)] border border-[var(--color-gs-border)] text-[10px] text-[var(--color-gs-text-muted)] hover:border-[var(--color-gs-cyan)]/40 hover:text-white transition-colors"
                >
                  + {s}
                </button>
              ))}
            </div>
          </div>

          {/* Team Size & Privacy */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[var(--color-gs-text-muted)] uppercase tracking-wider mb-2">
                Max Members ({maxMembers})
              </label>
              <input
                type="range"
                min={2}
                max={10}
                value={maxMembers}
                onChange={e => setMaxMembers(Number(e.target.value))}
                className="w-full accent-[var(--color-gs-cyan)] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-[var(--color-gs-text-muted)] mt-1 font-bold">
                <span>2 (Duo)</span>
                <span>4 (Standard)</span>
                <span>10 (Large)</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[var(--color-gs-text-muted)] uppercase tracking-wider mb-2">
                Recruitment Privacy
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setPrivacy('public')}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-2xl text-xs font-bold border transition-all ${
                    privacy === 'public'
                      ? 'bg-[var(--color-gs-cyan)] text-[#0f172a] border-transparent font-black'
                      : 'bg-[var(--color-gs-bg)] text-[var(--color-gs-text-muted)] border-[var(--color-gs-border)]'
                  }`}
                >
                  <Globe size={13} /> Public
                </button>
                <button
                  type="button"
                  onClick={() => setPrivacy('private')}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-2xl text-xs font-bold border transition-all ${
                    privacy === 'private'
                      ? 'bg-[var(--color-gs-cyan)] text-[#0f172a] border-transparent font-black'
                      : 'bg-[var(--color-gs-bg)] text-[var(--color-gs-text-muted)] border-[var(--color-gs-border)]'
                  }`}
                >
                  <Lock size={13} /> Private (Invite Only)
                </button>
              </div>
            </div>
          </div>

          {/* Submit CTA */}
          <div className="pt-4 border-t border-white/5 flex gap-3">
            <button
              type="button"
              onClick={() => navigate('/teams')}
              className="px-6 py-3.5 rounded-2xl border border-[var(--color-gs-border)] text-sm font-bold text-[var(--color-gs-text-muted)] hover:bg-white/5 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-[var(--color-gs-cyan)] to-[var(--color-gs-secondary)] text-white text-sm font-bold hover:opacity-95 transition-opacity shadow-[0_4px_20px_rgba(0,240,255,0.25)] flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" /> Launching Team...
                </>
              ) : (
                <>Launch Team 🚀</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
