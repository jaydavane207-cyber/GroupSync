import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User, ArrowLeft, Camera, Upload, Check, X, Plus, Sparkles,
  Github, Linkedin, Twitter, Globe, MapPin, Clock, Brain, Loader2
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { updateProfile, uploadAvatar } from '../lib/profileService';

const AVAILABILITY_OPTIONS = [
  'Available for Hackathons',
  'Seeking Project Collaborators',
  'Open to Mentorship',
  'Busy with Exams / Low Availability',
  'Exploring Campus Clubs'
];

const PERSONALITY_OPTIONS = [
  'Architect (INTJ)',
  'Innovator (ENTP)',
  'Commander (ENTJ)',
  'Protagonist (ENFJ)',
  'Logician (INTP)',
  'Campaigner (ENFP)',
  'Strategist (ISTJ)',
  'Builder (ESTP)'
];

export default function EditProfilePage() {
  const navigate = useNavigate();
  const { user, updateLocalUser, showToast } = useAppContext();

  const [formData, setFormData] = useState({
    name: user?.name || '',
    bio: user?.bio || '',
    location: user?.location || 'Main Campus',
    availability: user?.availability || 'Available for Hackathons',
    personality_type: user?.personality_type || 'Innovator (ENTP)',
    college: user?.college || '',
    course: user?.course || '',
    branch: user?.branch || '',
    year: user?.year || '',
    cgpa: user?.cgpa || '',
    skills: user?.skills || [],
    interests: user?.interests || [],
    social_links: user?.social_links || {}
  });

  const [avatarPreview, setAvatarPreview] = useState(user?.avatar_url || null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const [newSkillInput, setNewSkillInput] = useState('');
  const fileInputRef = useRef(null);

  const handleAvatarSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      showToast('Avatar image must be under 2MB', 'error');
      return;
    }
    setAvatarFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setAvatarPreview(ev.target.result);
    reader.readAsDataURL(file);
  };

  const handleAddSkill = () => {
    const trimmed = newSkillInput.trim();
    if (!trimmed) return;
    if (formData.skills.includes(trimmed)) {
      setNewSkillInput('');
      return;
    }
    setFormData({ ...formData, skills: [...formData.skills, trimmed] });
    setNewSkillInput('');
  };

  const handleRemoveSkill = (skill) => {
    setFormData({ ...formData, skills: formData.skills.filter(s => s !== skill) });
  };

  const handleSocialChange = (platform, value) => {
    setFormData({
      ...formData,
      social_links: {
        ...formData.social_links,
        [platform]: value
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user?.id) return;

    setIsSaving(true);
    try {
      let finalAvatarUrl = user.avatar_url;

      // 1. Upload avatar if new file chosen
      if (avatarFile) {
        setUploadProgress(10);
        const { data: uploadData, error: uploadErr } = await uploadAvatar(
          user.id,
          avatarFile,
          (pct) => setUploadProgress(pct)
        );
        if (uploadErr) throw new Error(uploadErr.userMessage || 'Avatar upload failed');
        if (uploadData?.publicUrl) finalAvatarUrl = uploadData.publicUrl;
      }

      // 2. Update profile table
      const updates = {
        name: formData.name.trim(),
        bio: formData.bio.trim(),
        location: formData.location.trim(),
        availability: formData.availability,
        personality_type: formData.personality_type,
        college: formData.college,
        course: formData.course,
        branch: formData.branch,
        year: formData.year,
        cgpa: formData.cgpa,
        skills: formData.skills,
        interests: formData.interests,
        social_links: formData.social_links,
        avatar_url: finalAvatarUrl
      };

      const { data: updatedProfile, error: updateErr } = await updateProfile(user.id, updates);
      if (updateErr) throw new Error(updateErr.userMessage || 'Could not update profile');

      // 3. Update local state
      updateLocalUser({ ...user, ...updates });
      showToast('Profile updated successfully! ✨', 'success');
      navigate('/profile');
    } catch (err) {
      showToast(err.message || 'Error updating profile', 'error');
    } finally {
      setIsSaving(false);
      setUploadProgress(null);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-[load-fade-up_0.3s_ease-out]">
      {/* Back button */}
      <button
        onClick={() => navigate('/profile')}
        className="flex items-center gap-2 text-xs font-bold text-[var(--color-gs-text-muted)] hover:text-white transition-colors"
      >
        <ArrowLeft size={16} /> Back to Profile
      </button>

      <div className="bg-[var(--color-gs-card)] border border-[var(--color-gs-border)] rounded-3xl p-6 md:p-10 space-y-8 backdrop-blur-xl shadow-2xl">
        <div>
          <h1 className="text-3xl font-black font-heading text-white tracking-tight">
            Edit <span className="text-[var(--color-gs-cyan)]">Profile</span>
          </h1>
          <p className="text-xs text-[var(--color-gs-text-muted)] mt-1">
            Update your public profile, availability status, and verified skillsets.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* ── Avatar Upload Section ───────────────────────────── */}
          <div className="flex flex-col sm:flex-row items-center gap-6 p-6 rounded-2xl bg-[var(--color-gs-bg)] border border-[var(--color-gs-border)]">
            <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
              <div className="w-24 h-24 rounded-3xl overflow-hidden border-2 border-[var(--color-gs-cyan)]/40 flex items-center justify-center bg-[var(--color-gs-card)] text-4xl shadow-lg">
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  user?.avatar || '🎓'
                )}
              </div>
              <div className="absolute inset-0 bg-black/60 rounded-3xl opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                <Camera size={24} className="text-white" />
              </div>
            </div>

            <div className="space-y-2 text-center sm:text-left flex-1">
              <h3 className="font-bold text-sm text-white">Profile Photo</h3>
              <p className="text-xs text-[var(--color-gs-text-muted)]">
                Upload a JPG, PNG, or WebP image under 2MB. Square dimensions recommended.
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handleAvatarSelect}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition-colors inline-flex items-center gap-1.5"
              >
                <Upload size={14} /> Choose Image
              </button>
            </div>

            {uploadProgress !== null && (
              <div className="w-full sm:w-36 space-y-1">
                <div className="text-[10px] text-right text-[var(--color-gs-cyan)] font-bold">{uploadProgress}%</div>
                <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-[var(--color-gs-cyan)] rounded-full transition-all" style={{ width: `${uploadProgress}%` }} />
                </div>
              </div>
            )}
          </div>

          {/* ── Basic Info ──────────────────────────────────────── */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-[var(--color-gs-text-muted)] uppercase tracking-wider">
              Basic Details
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[var(--color-gs-text-muted)] mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-[var(--color-gs-bg)] border border-[var(--color-gs-border)] rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-[var(--color-gs-cyan)]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[var(--color-gs-text-muted)] mb-1">Location / Campus Building</label>
                <input
                  type="text"
                  placeholder="e.g. Science Block, Dormitory East..."
                  value={formData.location}
                  onChange={e => setFormData({ ...formData, location: e.target.value })}
                  className="w-full bg-[var(--color-gs-bg)] border border-[var(--color-gs-border)] rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-[var(--color-gs-cyan)]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[var(--color-gs-text-muted)] mb-1">Bio / Headline</label>
              <textarea
                rows={3}
                maxLength={250}
                placeholder="Share your technical interests, project aspirations, or what drives you..."
                value={formData.bio}
                onChange={e => setFormData({ ...formData, bio: e.target.value })}
                className="w-full bg-[var(--color-gs-bg)] border border-[var(--color-gs-border)] rounded-xl p-3 text-sm text-white placeholder-[var(--color-gs-text-muted)] outline-none focus:border-[var(--color-gs-cyan)] resize-none"
              />
            </div>
          </div>

          {/* ── Status & Personality ────────────────────────────── */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-[var(--color-gs-text-muted)] uppercase tracking-wider">
              Collaboration Preferences
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[var(--color-gs-text-muted)] mb-1">Availability Status</label>
                <select
                  value={formData.availability}
                  onChange={e => setFormData({ ...formData, availability: e.target.value })}
                  className="w-full bg-[var(--color-gs-bg)] border border-[var(--color-gs-border)] rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-[var(--color-gs-cyan)]"
                >
                  {AVAILABILITY_OPTIONS.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[var(--color-gs-text-muted)] mb-1">Personality / Role Style</label>
                <select
                  value={formData.personality_type}
                  onChange={e => setFormData({ ...formData, personality_type: e.target.value })}
                  className="w-full bg-[var(--color-gs-bg)] border border-[var(--color-gs-border)] rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-[var(--color-gs-cyan)]"
                >
                  {PERSONALITY_OPTIONS.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* ── Skills Manager ──────────────────────────────────── */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-[var(--color-gs-text-muted)] uppercase tracking-wider">
              Technical Skillsets ({formData.skills.length})
            </h3>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Add skill (e.g. Next.js, PyTorch)..."
                value={newSkillInput}
                onChange={e => setNewSkillInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSkill();
                  }
                }}
                className="flex-1 bg-[var(--color-gs-bg)] border border-[var(--color-gs-border)] rounded-xl px-4 py-2 text-sm text-white outline-none focus:border-[var(--color-gs-cyan)]"
              />
              <button
                type="button"
                onClick={handleAddSkill}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition-colors"
              >
                Add Skill
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              {formData.skills.map(s => (
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
          </div>

          {/* ── Social Profiles ─────────────────────────────────── */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-[var(--color-gs-text-muted)] uppercase tracking-wider">
              Social Links & Portfolio
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="relative">
                <Github size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-gs-text-muted)]" />
                <input
                  type="url"
                  placeholder="https://github.com/..."
                  value={formData.social_links?.github || ''}
                  onChange={e => handleSocialChange('github', e.target.value)}
                  className="w-full bg-[var(--color-gs-bg)] border border-[var(--color-gs-border)] rounded-xl pl-10 pr-3 py-2 text-sm text-white outline-none focus:border-[var(--color-gs-cyan)]"
                />
              </div>

              <div className="relative">
                <Linkedin size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-gs-text-muted)]" />
                <input
                  type="url"
                  placeholder="https://linkedin.com/in/..."
                  value={formData.social_links?.linkedin || ''}
                  onChange={e => handleSocialChange('linkedin', e.target.value)}
                  className="w-full bg-[var(--color-gs-bg)] border border-[var(--color-gs-border)] rounded-xl pl-10 pr-3 py-2 text-sm text-white outline-none focus:border-[var(--color-gs-cyan)]"
                />
              </div>

              <div className="relative">
                <Twitter size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-gs-text-muted)]" />
                <input
                  type="url"
                  placeholder="https://x.com/..."
                  value={formData.social_links?.twitter || ''}
                  onChange={e => handleSocialChange('twitter', e.target.value)}
                  className="w-full bg-[var(--color-gs-bg)] border border-[var(--color-gs-border)] rounded-xl pl-10 pr-3 py-2 text-sm text-white outline-none focus:border-[var(--color-gs-cyan)]"
                />
              </div>

              <div className="relative">
                <Globe size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-gs-text-muted)]" />
                <input
                  type="url"
                  placeholder="https://portfolio.me"
                  value={formData.social_links?.portfolio || ''}
                  onChange={e => handleSocialChange('portfolio', e.target.value)}
                  className="w-full bg-[var(--color-gs-bg)] border border-[var(--color-gs-border)] rounded-xl pl-10 pr-3 py-2 text-sm text-white outline-none focus:border-[var(--color-gs-cyan)]"
                />
              </div>
            </div>
          </div>

          {/* ── Submit Buttons ──────────────────────────────────── */}
          <div className="pt-4 border-t border-white/5 flex gap-3">
            <button
              type="button"
              onClick={() => navigate('/profile')}
              className="px-6 py-3 rounded-xl border border-[var(--color-gs-border)] text-sm font-bold text-[var(--color-gs-text-muted)] hover:bg-white/5 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex-1 py-3 bg-[var(--color-gs-cyan)] hover:bg-cyan-400 text-[#0f172a] text-sm font-bold rounded-xl transition-colors shadow-[0_4px_15px_rgba(0,240,255,0.25)] flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <Loader2 size={16} className="animate-spin" /> Saving Changes...
                </>
              ) : (
                <>Save Profile Changes</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
