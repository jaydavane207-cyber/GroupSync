import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User, ArrowLeft, Camera, Upload, Check, X, Plus,
  Github, Linkedin, Twitter, Globe, MapPin, Clock, Brain, Loader2
} from 'lucide-react';
import { useAppContext } from '@/context/AppContext';
import { updateProfile, uploadAvatar } from '@/lib/services/profileService';

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
      showToast('Profile updated successfully!', 'success');
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
        className="flex items-center gap-2 text-xs font-medium text-gs-text-muted hover:text-gs-text-main transition-colors"
      >
        <ArrowLeft size={16} /> Back to Profile
      </button>

      <div className="glass-card rounded-xl p-6 md:p-8 space-y-6 shadow-xs">
        <div>
          <h1 className="text-2xl font-bold font-heading text-gs-text-main tracking-tight">
            Edit Profile
          </h1>
          <p className="text-xs text-gs-text-muted mt-1">
            Update your public profile, availability status, and verified skillsets.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* ── Avatar Upload Section ───────────────────────────── */}
          <div className="flex flex-col sm:flex-row items-center gap-5 p-5 rounded-xl bg-gs-bg border border-gs-border">
            <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
              <div className="w-20 h-20 rounded-xl overflow-hidden border border-gs-border flex items-center justify-center bg-gs-card text-3xl shadow-xs">
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  user?.avatar || 'ðŸŽ“'
                )}
              </div>
              <div className="absolute inset-0 bg-black/50 rounded-xl opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                <Camera size={20} className="text-white" />
              </div>
            </div>

            <div className="space-y-1.5 text-center sm:text-left flex-1">
              <h3 className="font-semibold text-sm text-gs-text-main">Profile Photo</h3>
              <p className="text-xs text-gs-text-muted">
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
                className="mt-1 px-3 py-1.5 bg-gs-card hover:bg-gs-border/40 border border-gs-border text-gs-text-main rounded-lg text-xs font-medium transition-colors inline-flex items-center gap-1.5"
              >
                <Upload size={13} /> Choose Image
              </button>
            </div>

            {uploadProgress !== null && (
              <div className="w-full sm:w-32 space-y-1">
                <div className="text-[11px] text-right text-blue-500 font-medium">{uploadProgress}%</div>
                <div className="h-1.5 bg-gs-border rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${uploadProgress}%` }} />
                </div>
              </div>
            )}
          </div>

          {/* ── Basic Info ──────────────────────────────────────── */}
          <div className="space-y-4">
            <h3 className="text-xs font-semibold text-gs-text-muted uppercase tracking-wider">
              Basic Details
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gs-text-muted mb-1.5">Full Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-gs-bg border border-gs-border rounded-lg px-3 py-2 text-sm text-gs-text-main outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gs-text-muted mb-1.5">Location / Campus Building</label>
                <input
                  type="text"
                  placeholder="e.g. Science Block, Hostels..."
                  value={formData.location}
                  onChange={e => setFormData({ ...formData, location: e.target.value })}
                  className="w-full bg-gs-bg border border-gs-border rounded-lg px-3 py-2 text-sm text-gs-text-main outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gs-text-muted mb-1.5">Bio / Headline</label>
              <textarea
                rows={3}
                maxLength={250}
                placeholder="Share your technical interests, project aspirations, or what drives you..."
                value={formData.bio}
                onChange={e => setFormData({ ...formData, bio: e.target.value })}
                className="w-full bg-gs-bg border border-gs-border rounded-lg p-3 text-sm text-gs-text-main placeholder-gs-text-muted outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none"
              />
            </div>
          </div>

          {/* ── Status & Personality ────────────────────────────── */}
          <div className="space-y-4">
            <h3 className="text-xs font-semibold text-gs-text-muted uppercase tracking-wider">
              Collaboration Preferences
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gs-text-muted mb-1.5">Availability Status</label>
                <select
                  value={formData.availability}
                  onChange={e => setFormData({ ...formData, availability: e.target.value })}
                  className="w-full bg-gs-bg border border-gs-border rounded-lg px-3 py-2 text-sm text-gs-text-main outline-none focus:border-blue-500"
                >
                  {AVAILABILITY_OPTIONS.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gs-text-muted mb-1.5">Role Style</label>
                <select
                  value={formData.personality_type}
                  onChange={e => setFormData({ ...formData, personality_type: e.target.value })}
                  className="w-full bg-gs-bg border border-gs-border rounded-lg px-3 py-2 text-sm text-gs-text-main outline-none focus:border-blue-500"
                >
                  {PERSONALITY_OPTIONS.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* ── Skills Manager ──────────────────────────────────── */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-gs-text-muted uppercase tracking-wider">
              Technical Skills ({formData.skills.length})
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
                className="flex-1 bg-gs-bg border border-gs-border rounded-lg px-3 py-2 text-sm text-gs-text-main outline-none focus:border-blue-500"
              />
              <button
                type="button"
                onClick={handleAddSkill}
                className="px-3.5 py-2 bg-gs-card hover:bg-gs-border/40 border border-gs-border text-gs-text-main rounded-lg text-xs font-medium transition-colors"
              >
                Add Skill
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              {formData.skills.map(s => (
                <span
                  key={s}
                  className="flex items-center gap-1.5 px-2.5 py-1 bg-gs-bg border border-gs-border text-gs-text-main rounded-md text-xs font-medium"
                >
                  {s}
                  <button type="button" onClick={() => handleRemoveSkill(s)} className="text-gs-text-muted hover:text-red-500">
                    <X size={12} />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* ── Social Profiles ─────────────────────────────────── */}
          <div className="space-y-4">
            <h3 className="text-xs font-semibold text-gs-text-muted uppercase tracking-wider">
              Social Links & Portfolio
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="relative">
                <Github size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gs-text-muted" />
                <input
                  type="url"
                  placeholder="https://github.com/..."
                  value={formData.social_links?.github || ''}
                  onChange={e => handleSocialChange('github', e.target.value)}
                  className="w-full bg-gs-bg border border-gs-border rounded-lg pl-9 pr-3 py-2 text-sm text-gs-text-main outline-none focus:border-[#7c6af6]"
                />
              </div>

              <div className="relative">
                <Linkedin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gs-text-muted" />
                <input
                  type="url"
                  placeholder="https://linkedin.com/in/..."
                  value={formData.social_links?.linkedin || ''}
                  onChange={e => handleSocialChange('linkedin', e.target.value)}
                  className="w-full bg-gs-bg border border-gs-border rounded-lg pl-9 pr-3 py-2 text-sm text-gs-text-main outline-none focus:border-[#7c6af6]"
                />
              </div>

              <div className="relative">
                <Twitter size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gs-text-muted" />
                <input
                  type="url"
                  placeholder="https://x.com/..."
                  value={formData.social_links?.twitter || ''}
                  onChange={e => handleSocialChange('twitter', e.target.value)}
                  className="w-full bg-gs-bg border border-gs-border rounded-lg pl-9 pr-3 py-2 text-sm text-gs-text-main outline-none focus:border-[#7c6af6]"
                />
              </div>

              <div className="relative">
                <Globe size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gs-text-muted" />
                <input
                  type="url"
                  placeholder="https://portfolio.me"
                  value={formData.social_links?.portfolio || ''}
                  onChange={e => handleSocialChange('portfolio', e.target.value)}
                  className="w-full bg-gs-bg border border-gs-border rounded-lg pl-9 pr-3 py-2 text-sm text-gs-text-main outline-none focus:border-[#7c6af6]"
                />
              </div>
            </div>
          </div>

          {/* ── Submit Buttons ──────────────────────────────────── */}
          <div className="pt-4 border-t border-gs-border flex gap-3">
            <button
              type="button"
              onClick={() => navigate('/profile')}
              className="px-5 py-2.5 rounded-lg border border-gs-border text-xs font-medium text-gs-text-muted hover:text-gs-text-main hover:bg-gs-bg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex-1 py-2.5 bg-gradient-to-r from-[#7c6af6] to-[#a78bfa] hover:from-[#6155e0] hover:to-[#9178f4] text-white text-xs font-medium rounded-lg transition-colors shadow-xs flex items-center justify-center gap-2 disabled:opacity-50 btn-tactile"
            >
              {isSaving ? (
                <>
                  <Loader2 size={14} className="animate-spin" /> Saving Changes...
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


