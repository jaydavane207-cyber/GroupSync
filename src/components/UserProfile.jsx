import React, { useState } from 'react';
import {
  User, Award, Shield, Users, Edit3, LogOut,
  Calendar, BookOpen, GraduationCap, Star, Globe,
  Linkedin, Github, Instagram, Twitter, Bell, Lock,
  Trophy, Zap, Check, Settings,
  ChevronRight, MapPin, Phone, Mail, Eye, EyeOff,
  BarChart2, Clock, CheckCircle, XCircle, Save, X, Plus
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import supabase from '../lib/supabase';
import StrictSkillVerificationModal from './StrictSkillVerificationModal';
import { motion, AnimatePresence } from 'framer-motion';
import { SkillBadge, SkillBadgeInline } from './SkillBadge';
import { getCredibilityBreakdown, getEndorsements } from '../lib/profileService';
import { getUserBadges } from '../lib/quizService';

// ─── Background Decorations ───────────────────────────────────────────────────

const FloatingParticles = () => {
  const [particles, setParticles] = React.useState([]);
  React.useEffect(() => {
    setParticles(
      Array.from({ length: 20 }).map((_, i) => ({
        id: i,
        size: Math.random() * 2 + 2,
        top: Math.random() * 100,
        left: Math.random() * 100,
        color: Math.random() > 0.5 ? 'var(--color-gs-primary)' : 'var(--color-gs-secondary)',
        opacity: Math.random() * 0.2 + 0.2,
        duration: Math.random() * 5 + 5,
        delay: Math.random() * -10,
        ty: Math.random() * 30 + 30,
      }))
    );
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          animate={{ y: [0, -p.ty, 0], opacity: [p.opacity, p.opacity * 1.5, p.opacity] }}
          transition={{ duration: p.duration, repeat: Infinity, delay: p.delay, ease: 'easeInOut' }}
          style={{
            width: p.size, height: p.size,
            top: `${p.top}%`, left: `${p.left}%`,
            backgroundColor: p.color,
            boxShadow: `0 0 10px ${p.color}`,
          }}
        />
      ))}
    </div>
  );
};

const ScanningGrid = () => (
  <div className="absolute inset-0 pointer-events-none opacity-[0.03] overflow-hidden" aria-hidden="true">
    <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px]" />
    <motion.div
      className="absolute left-0 right-0 bg-gradient-to-b from-transparent via-gs-primary/20 to-transparent"
      style={{ height: '100px' }}
      animate={{ top: ['-10%', '110%'] }}
      transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
    />
  </div>
);

// ─── Sub-components ─────────────────────────────────────────────────────────

const StatCard = ({ value, label, color = 'text-gs-primary' }) => (
  <motion.div
    whileHover={{ y: -5, scale: 1.02 }}
    className="bg-gs-card backdrop-blur-md border border-gs-border rounded-[1.5rem] p-5 text-center shadow-lg relative overflow-hidden group cursor-default"
  >
    <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-br from-gs-primary/5 to-transparent`} />
    <div className={`text-3xl font-black font-heading ${color}`}>{value}</div>
    <div className="text-[10px] font-black uppercase tracking-widest text-gs-text-muted mt-2 opacity-70 group-hover:opacity-100 transition-opacity">{label}</div>
  </motion.div>
);

const HoloPanel = ({ children, glow = 'bg-gs-primary/5', className = '' }) => (
  <motion.div
    whileHover={{ y: -4 }}
    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    className={`bg-gs-card backdrop-blur-xl border border-gs-border rounded-[2rem] p-8 shadow-xl relative overflow-hidden ${className}`}
  >
    <div className={`absolute top-0 right-0 w-36 h-36 ${glow} rounded-full blur-3xl pointer-events-none`} />
    {children}
  </motion.div>
);

const Toggle = ({ checked, onChange }) => (
  <button type="button" onClick={onChange}
    className={'relative flex items-center w-11 h-6 rounded-full transition-colors duration-300 border border-gs-border ' + (checked ? 'bg-gs-primary' : 'bg-gs-bg')}>
    <div className={'w-5 h-5 rounded-full transition-all duration-300 ' + (checked ? 'translate-x-[21px] bg-white' : 'translate-x-[1px] bg-white/90')} />
  </button>
);

// ─── Overview Tab ──────────────────────────────────────────────────────────

function OverviewTab({ user, factions, isEditing, formData, setFormData, onAddSkill }) {
  const { groups } = useAppContext();
  const f = factions[user.faction];
  const groupsJoined = groups.filter(g => g.memberIds?.includes(user.id)).length;

  const [credibility, setCredibility] = useState(null);
  const [badges, setBadges] = useState([]);
  const [endorsements, setEndorsements] = useState({});

  React.useEffect(() => {
    if (!user?.id) return;
    getCredibilityBreakdown(user.id).then(res => setCredibility(res));
    getUserBadges(user.id).then(res => { if (res.data) setBadges(res.data); });
    getEndorsements(user.id).then(res => { if (res.data) setEndorsements(res.data.grouped || {}); });
  }, [user?.id]);

  return (
    <div className="space-y-8">
      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard value={groupsJoined} label="Groups Joined" color="text-gs-primary" />
        <StatCard value={credibility ? `${credibility.total}%` : '—'} label="Credibility Score" color="text-gs-cyan" />
        <StatCard value={badges.length} label="Badges Earned" color="text-gs-amber" />
        <StatCard value="—" label="Leaderboard" color="text-gs-green" />
      </div>

      {/* Info Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Personal Info */}
        <HoloPanel glow="bg-gs-primary/5">
          <h3 className="text-lg font-black font-heading flex items-center gap-3 text-gs-text-main mb-5">
            <User size={20} className="text-gs-primary" /> Personal Info
          </h3>
          <div className="space-y-4">
            {isEditing ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <Mail size={16} className="text-gs-text-muted shrink-0" />
                  <input type="email" value={formData.email || ''} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full bg-gs-bg border border-gs-border rounded px-2 py-1 text-gs-text-main" placeholder="Email" />
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Calendar size={16} className="text-gs-text-muted shrink-0" />
                  <input type="text" value={formData.dob || ''} onChange={(e) => setFormData({ ...formData, dob: e.target.value })} className="w-full bg-gs-bg border border-gs-border rounded px-2 py-1 text-gs-text-main" placeholder="Date of Birth" />
                </div>
              </div>
            ) : (
              [
                { icon: Mail, label: user.email || 'student@college.edu' },
                { icon: MapPin, label: user.location || 'Main Campus' },
                { icon: Clock, label: user.availability || 'Available for Hackathons' },
                { icon: User, label: user.personality_type || 'Innovator (ENTP)' },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-3 text-sm">
                  <Icon size={16} className="text-gs-text-muted shrink-0" />
                  <span className="text-gs-text-muted truncate">{label}</span>
                </div>
              ))
            )}
          </div>
        </HoloPanel>

        {/* Academic Info */}
        <HoloPanel glow="bg-gs-secondary/5">
          <h3 className="text-lg font-black font-heading flex items-center gap-3 text-gs-text-main mb-5">
            <GraduationCap size={20} className="text-gs-secondary" /> Academic Info
          </h3>
          {isEditing ? (
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <BookOpen size={16} className="text-gs-text-muted shrink-0" />
                <input type="text" value={formData.college || ''} onChange={(e) => setFormData({ ...formData, college: e.target.value })} className="w-full bg-gs-bg border border-gs-border rounded px-2 py-1 text-gs-text-main" placeholder="College Name" />
              </div>
              <div className="flex items-center gap-3 text-sm">
                <GraduationCap size={16} className="text-gs-text-muted shrink-0" />
                <div className="flex gap-2 w-full">
                  <input type="text" value={formData.course || ''} onChange={(e) => setFormData({ ...formData, course: e.target.value })} className="w-1/2 bg-gs-bg border border-gs-border rounded px-2 py-1 text-gs-text-main" placeholder="Course" />
                  <input type="text" value={formData.branch || ''} onChange={(e) => setFormData({ ...formData, branch: e.target.value })} className="w-1/2 bg-gs-bg border border-gs-border rounded px-2 py-1 text-gs-text-main" placeholder="Branch" />
                </div>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Star size={16} className="text-gs-text-muted shrink-0" />
                <input type="text" value={formData.year || ''} onChange={(e) => setFormData({ ...formData, year: e.target.value })} className="w-full bg-gs-bg border border-gs-border rounded px-2 py-1 text-gs-text-main" placeholder="Year (e.g. 3rd)" />
              </div>
              <div className="flex items-center gap-3 text-sm">
                <BarChart2 size={16} className="text-gs-text-muted shrink-0" />
                <input type="text" value={formData.cgpa || ''} onChange={(e) => setFormData({ ...formData, cgpa: e.target.value })} className="w-full bg-gs-bg border border-gs-border rounded px-2 py-1 text-gs-text-main" placeholder="CGPA" />
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {[
                { icon: BookOpen, label: user.college || 'IIT Bombay' },
                { icon: GraduationCap, label: user.course ? `${user.course} - ${user.branch || 'CS'}` : 'B.Tech - Computer Science' },
                { icon: Star, label: user.year ? `${user.year} Year` : '3rd Year' },
                { icon: BarChart2, label: user.cgpa ? `CGPA: ${user.cgpa}` : 'CGPA: Private' },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-3 text-sm">
                  <Icon size={16} className="text-gs-text-muted shrink-0" />
                  <span className="text-gs-text-muted">{label}</span>
                </div>
              ))}
            </div>
          )}
        </HoloPanel>

        {/* Social Links */}
        <HoloPanel glow="bg-gs-green/5">
          <h3 className="text-lg font-black font-heading flex items-center gap-3 text-gs-text-main mb-5">
            <Globe size={20} className="text-gs-green" /> Social Links
          </h3>
          {isEditing ? (
            <div className="space-y-3">
              {[
                { icon: Linkedin, key: 'linkedin', color: 'text-blue-400', placeholder: 'LinkedIn URL' },
                { icon: Github, key: 'github', color: 'text-gs-text-muted', placeholder: 'GitHub URL' },
                { icon: Globe, key: 'portfolio', color: 'text-emerald-400', placeholder: 'Portfolio URL' },
                { icon: Instagram, key: 'instagram', color: 'text-pink-400', placeholder: 'Instagram URL' },
                { icon: Twitter, key: 'twitter', color: 'text-sky-400', placeholder: 'Twitter URL' },
              ].map(({ icon: Icon, key, color, placeholder }) => (
                <div key={key} className="flex items-center gap-3 text-sm">
                  <Icon size={16} className={`${color} shrink-0`} />
                  <input type="text" value={formData.social_links?.[key] || formData.socialLinks?.[key] || ''}
                    onChange={(e) => setFormData({ ...formData, social_links: { ...(formData.social_links || formData.socialLinks || {}), [key]: e.target.value } })}
                    className="w-full bg-gs-bg border border-gs-border rounded px-2 py-1 text-gs-text-main"
                    placeholder={placeholder} />
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {[
                { icon: Linkedin, label: 'LinkedIn', color: 'text-blue-400', url: user.social_links?.linkedin || user.socialLinks?.linkedin || 'Not linked' },
                { icon: Github, label: 'GitHub', color: 'text-gs-text-muted', url: user.social_links?.github || user.socialLinks?.github || 'Not linked' },
                { icon: Globe, label: 'Portfolio', color: 'text-emerald-400', url: user.social_links?.portfolio || user.socialLinks?.portfolio || 'Not linked' },
                { icon: Instagram, label: 'Instagram', color: 'text-pink-400', url: user.social_links?.instagram || user.socialLinks?.instagram || 'Not linked' },
                { icon: Twitter, label: 'Twitter', color: 'text-sky-400', url: user.social_links?.twitter || user.socialLinks?.twitter || 'Not linked' },
              ].map(({ icon: Icon, label, color, url }) => (
                <div key={label} className="flex items-center gap-3 text-sm">
                  <Icon size={16} className={`${color} shrink-0`} />
                  <span className="text-gs-text-muted truncate">{url}</span>
                </div>
              ))}
            </div>
          )}
        </HoloPanel>
      </div>

      {/* Skills & Interests */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <HoloPanel glow="bg-gs-primary/10">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-black font-heading text-gs-text-main flex items-center gap-2">
              <Zap size={20} className="text-gs-primary" /> Skills
            </h3>
            {!isEditing && (
              <button
                id="open-skill-verification-btn"
                onClick={() => onAddSkill?.()}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-gs-primary/10 border border-gs-primary/30 text-gs-primary rounded-xl text-xs font-semibold hover:bg-gs-primary/20 hover:scale-105 active:scale-95 transition-all"
              >
                <Plus size={13} /> Add Skill
              </button>
            )}
          </div>
          {isEditing ? (
            <input type="text" value={(formData.skills || []).join(', ')} onChange={(e) => setFormData({ ...formData, skills: e.target.value.split(',').map(s => s.trim()) })} className="w-full bg-gs-bg border border-gs-border rounded px-3 py-2 text-gs-text-main" placeholder="React, Python, UI/UX (Comma separated)" />
          ) : (
            <div className="flex flex-wrap gap-2">
              {(user.skills && user.skills.length > 0 ? user.skills : ['React', 'Node.js']).map(s => {
                const endorseCount = (endorsements[s] || []).length;
                return (
                  <span key={s} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gs-secondary/10 border border-gs-secondary/30 text-gs-secondary rounded-full text-sm font-medium">
                    <Shield size={11} className="opacity-60" />
                    <span>{s}</span>
                    {endorseCount > 0 && (
                      <span className="text-[11px] font-bold text-amber-400 bg-amber-400/10 px-1.5 py-0.5 rounded-full" title={`${endorseCount} peer endorsement${endorseCount > 1 ? 's' : ''}`}>
                        ⭐ {endorseCount}
                      </span>
                    )}
                  </span>
                );
              })}
            </div>
          )}
        </HoloPanel>

        <HoloPanel glow="bg-gs-secondary/10">
          <h3 className="text-lg font-black font-heading text-gs-text-main mb-6 flex items-center gap-2">
            <Trophy size={20} className="text-gs-secondary" /> Interests
          </h3>
          {isEditing ? (
            <input type="text" value={(formData.interests || []).join(', ')} onChange={(e) => setFormData({ ...formData, interests: e.target.value.split(',').map(i => i.trim()) })} className="w-full bg-gs-bg border border-gs-border rounded px-3 py-2 text-gs-text-main" placeholder="Hackathons, AI, Open Source (Comma separated)" />
          ) : (
            <div className="flex flex-wrap gap-2">
              {(user.interests && user.interests.length > 0 ? user.interests : ['Hackathons', 'Web3']).map(i => (
                <span key={i} className="px-3 py-1.5 bg-gs-amber/10 border border-gs-amber/30 text-gs-amber rounded-full text-sm font-medium">{i}</span>
              ))}
            </div>
          )}
        </HoloPanel>
      </div>

      {/* Skill Credibility Score & Badges */}
      <HoloPanel glow="bg-gs-primary/10">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-black font-heading text-gs-text-main flex items-center gap-2">
            <Award size={20} className="text-gs-primary" /> Skill Credibility Score & Badges
          </h3>
          <span className="text-xs text-gs-cyan font-bold uppercase tracking-wider">
            Verified Index: {credibility?.total || 75}%
          </span>
        </div>

        {/* 4 Weights Breakdown */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <div className="p-3.5 rounded-2xl bg-gs-bg/60 border border-gs-border">
            <div className="flex justify-between items-center text-xs mb-1">
              <span className="text-gs-text-muted">Quizzes</span>
              <span className="font-bold text-gs-cyan">{credibility?.breakdown?.quiz?.score || 0}/40</span>
            </div>
            <div className="w-full bg-gs-card rounded-full h-1.5 overflow-hidden">
              <div className="bg-gs-cyan h-full rounded-full" style={{ width: `${((credibility?.breakdown?.quiz?.score || 0)/40)*100}%` }} />
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-gs-bg/60 border border-gs-border">
            <div className="flex justify-between items-center text-xs mb-1">
              <span className="text-gs-text-muted">Certificates</span>
              <span className="font-bold text-emerald-400">{credibility?.breakdown?.certificate?.score || 0}/35</span>
            </div>
            <div className="w-full bg-gs-card rounded-full h-1.5 overflow-hidden">
              <div className="bg-emerald-400 h-full rounded-full" style={{ width: `${((credibility?.breakdown?.certificate?.score || 0)/35)*100}%` }} />
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-gs-bg/60 border border-gs-border">
            <div className="flex justify-between items-center text-xs mb-1">
              <span className="text-gs-text-muted">Endorsements</span>
              <span className="font-bold text-amber-400">{credibility?.breakdown?.endorsement?.score || 0}/20</span>
            </div>
            <div className="w-full bg-gs-card rounded-full h-1.5 overflow-hidden">
              <div className="bg-amber-400 h-full rounded-full" style={{ width: `${((credibility?.breakdown?.endorsement?.score || 0)/20)*100}%` }} />
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-gs-bg/60 border border-gs-border">
            <div className="flex justify-between items-center text-xs mb-1">
              <span className="text-gs-text-muted">Projects</span>
              <span className="font-bold text-gs-secondary">{credibility?.breakdown?.project?.score || 0}/5</span>
            </div>
            <div className="w-full bg-gs-card rounded-full h-1.5 overflow-hidden">
              <div className="bg-gs-secondary h-full rounded-full" style={{ width: `${((credibility?.breakdown?.project?.score || 0)/5)*100}%` }} />
            </div>
          </div>
        </div>

        {/* Real Badges */}
        <div className="flex flex-wrap gap-2">
          {badges.length > 0 ? (
            badges.map(b => (
              <span key={b.id} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gs-bg border border-gs-border text-xs font-bold text-gs-text-main shadow-sm">
                <span>{b.badge_tier === 'platinum' ? '💎' : b.badge_tier === 'gold' ? '🥇' : b.badge_tier === 'silver' ? '🥈' : '🥉'}</span>
                <span>{b.badge_name}</span>
                <span className="text-[10px] text-gs-text-muted">({Math.round(b.quiz_score || 0)}%)</span>
              </span>
            ))
          ) : (
            <>
              <SkillBadgeInline level="platinum" skill={user.skills?.[0] || 'React'} />
              <SkillBadgeInline level="gold" skill={user.skills?.[1] || 'Python'} />
              <SkillBadgeInline level="silver" skill="Team Collaboration" />
            </>
          )}
        </div>
      </HoloPanel>

      {/* Status & Work Preferences */}
      <HoloPanel glow="bg-gs-secondary/5">
        <h3 className="text-lg font-black font-heading text-gs-text-main mb-5 flex items-center gap-2">
          <Users size={20} className="text-gs-secondary" /> Status & Collaboration Preferences
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-gs-bg/60 border border-gs-border">
            <p className="text-[10px] uppercase font-bold text-gs-text-muted mb-1">Team Status</p>
            <p className="font-bold text-emerald-400 text-sm flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> Looking for Team
            </p>
          </div>
          <div className="p-4 rounded-2xl bg-gs-bg/60 border border-gs-border">
            <p className="text-[10px] uppercase font-bold text-gs-text-muted mb-1">Mentorship</p>
            <p className="font-bold text-gs-primary text-sm">Open to Mentoring</p>
          </div>
          <div className="p-4 rounded-2xl bg-gs-bg/60 border border-gs-border">
            <p className="text-[10px] uppercase font-bold text-gs-text-muted mb-1">Personality Fit</p>
            <p className="font-bold text-gs-violet text-sm">Introvert / Analytical</p>
          </div>
          <div className="p-4 rounded-2xl bg-gs-bg/60 border border-gs-border">
            <p className="text-[10px] uppercase font-bold text-gs-text-muted mb-1">Commitment</p>
            <p className="font-bold text-amber-300 text-sm">Full-time / Hackathons</p>
          </div>
        </div>
      </HoloPanel>

      {/* Bio */}
      <HoloPanel glow="bg-gs-primary/5">
        <div className="absolute inset-0 bg-gradient-to-br from-gs-primary/5 via-transparent to-gs-secondary/5 opacity-30 pointer-events-none rounded-[2rem]" />
        <h3 className="text-lg font-black font-heading text-gs-text-main mb-4 flex items-center gap-2 relative z-10">
          <Eye size={20} className="text-gs-primary" /> About Me
        </h3>
        {isEditing ? (
          <textarea value={formData.bio || ''} onChange={(e) => setFormData({ ...formData, bio: e.target.value })} rows={4} className="w-full bg-gs-bg border border-gs-border rounded-xl px-4 py-3 text-gs-text-main resize-none relative z-10" placeholder="Tell us about yourself..." />
        ) : (
          <p className="text-gs-text-muted leading-relaxed relative z-10">{user.bio || 'Building the future, one commit at a time. 🚀'}</p>
        )}
      </HoloPanel>
    </div>
  );
}

// ─── Events Tab ───────────────────────────────────────────────────────────────
const MOCK_EVENTS = [
  { id: 1, name: 'Spring Hackathon 2025', date: 'Mar 15, 2025', type: 'Hackathon', status: 'attended', result: '2nd Place 🥈' },
  { id: 2, name: 'AI Summit', date: 'Feb 10, 2025', type: 'Conference', status: 'attended', result: 'Participant' },
  { id: 3, name: '48h Game Jam', date: 'Jan 20, 2025', type: 'Game Jam', status: 'rsvpd', result: "RSVP'd" },
  { id: 4, name: 'UI/UX Workshop', date: 'Dec 5, 2024', type: 'Workshop', status: 'attended', result: 'Completed ✓' },
  { id: 5, name: 'Web3 Weekend', date: 'Nov 12, 2024', type: 'Hackathon', status: 'past', result: 'Did not attend' },
];

function EventsTab() {
  const statusColors = { attended: 'text-emerald-400', rsvpd: 'text-gs-primary', past: 'text-gs-text-muted' };
  const statusLabels = { attended: 'Attended', rsvpd: "RSVP'd", past: 'Past' };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        <StatCard value={MOCK_EVENTS.filter(e => e.status === 'rsvpd').length} label="RSVP'd" color="text-gs-primary" />
        <StatCard value={MOCK_EVENTS.filter(e => e.status === 'attended').length} label="Attended" color="text-emerald-400" />
        <StatCard value="1" label="Awards Won" color="text-gs-amber" />
      </div>
      <HoloPanel glow="bg-gs-primary/5" className="!p-0 overflow-hidden">
        <div className="p-5 border-b border-gs-border">
          <h3 className="text-lg font-black font-heading text-gs-text-main">Event History</h3>
        </div>
        <div className="divide-y divide-gs-border">
          {MOCK_EVENTS.map(event => (
            <div key={event.id} className="p-5 flex items-center gap-4 hover:bg-gs-bg/50 transition-colors">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${event.status === 'attended' ? 'bg-emerald-500/10' : event.status === 'rsvpd' ? 'bg-gs-primary/10' : 'bg-gs-border'}`}>
                {event.status === 'attended' ? <CheckCircle size={20} className="text-emerald-400" /> : event.status === 'rsvpd' ? <Clock size={20} className="text-gs-primary" /> : <XCircle size={20} className="text-gs-text-muted" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gs-text-main truncate">{event.name}</p>
                <p className="text-xs text-gs-text-muted">{event.date} · {event.type}</p>
              </div>
              <div className="text-right shrink-0">
                <span className={`text-sm font-medium ${statusColors[event.status]}`}>{event.result}</span>
                <p className={`text-xs mt-0.5 ${statusColors[event.status]}`}>{statusLabels[event.status]}</p>
              </div>
            </div>
          ))}
        </div>
      </HoloPanel>
    </div>
  );
}

// ─── Teams Tab ────────────────────────────────────────────────────────────────
const MOCK_TEAMS = [
  { id: 1, name: 'Quantum Hackers', event: 'Spring Hackathon', members: 4, role: 'Frontend Lead', status: 'current', emoji: '⚡' },
  { id: 2, name: 'Design Wizards', event: 'UI/UX Challenge', members: 3, role: 'Member', status: 'past', emoji: '🎨' },
];
const MOCK_INVITES = [
  { id: 1, team: 'Chain Breakers', event: 'Web3 Weekend', from: 'Bob', emoji: '🔗' },
];

function TeamsTab({ showToast }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        <StatCard value={MOCK_TEAMS.filter(t => t.status === 'current').length} label="Current Teams" color="text-gs-primary" />
        <StatCard value={MOCK_TEAMS.filter(t => t.status === 'past').length} label="Past Teams" color="text-gs-text-muted" />
        <StatCard value={MOCK_INVITES.length} label="Pending Invites" color="text-gs-amber" />
      </div>

      <div>
        <h3 className="text-lg font-black font-heading text-gs-text-main mb-3">Current Teams</h3>
        <div className="space-y-3">
          {MOCK_TEAMS.filter(t => t.status === 'current').map(team => (
            <HoloPanel key={team.id} glow="bg-gs-primary/5" className="!p-5 flex items-center gap-4 hover:border-gs-primary transition-colors">
              <div className="w-12 h-12 rounded-2xl bg-gs-bg border border-gs-border flex items-center justify-center text-2xl">{team.emoji}</div>
              <div className="flex-1">
                <p className="font-bold text-gs-text-main">{team.name}</p>
                <p className="text-sm text-gs-text-muted">{team.event} · {team.members} members</p>
              </div>
              <span className="px-3 py-1 bg-gs-primary/10 text-gs-primary border border-gs-primary/30 rounded-full text-xs font-medium">{team.role}</span>
            </HoloPanel>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-black font-heading text-gs-text-main mb-3">Past Teams</h3>
        <div className="space-y-3">
          {MOCK_TEAMS.filter(t => t.status === 'past').map(team => (
            <HoloPanel key={team.id} glow="bg-gs-text-muted/5" className="!p-5 flex items-center gap-4 opacity-70">
              <div className="w-12 h-12 rounded-2xl bg-gs-bg border border-gs-border flex items-center justify-center text-2xl">{team.emoji}</div>
              <div className="flex-1">
                <p className="font-bold text-gs-text-main">{team.name}</p>
                <p className="text-sm text-gs-text-muted">{team.event} · {team.members} members</p>
              </div>
            </HoloPanel>
          ))}
        </div>
      </div>

      {MOCK_INVITES.length > 0 && (
        <div>
          <h3 className="text-lg font-black font-heading text-gs-text-main mb-3">Pending Invitations</h3>
          <div className="space-y-3">
            {MOCK_INVITES.map(invite => (
              <HoloPanel key={invite.id} glow="bg-gs-amber/5" className="!p-5 flex items-center gap-4 border-gs-amber/30">
                <div className="w-12 h-12 rounded-2xl bg-gs-bg border border-gs-border flex items-center justify-center text-2xl">{invite.emoji}</div>
                <div className="flex-1">
                  <p className="font-bold text-gs-text-main">{invite.team}</p>
                  <p className="text-sm text-gs-text-muted">{invite.event} · Invited by {invite.from}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => showToast('Invitation accepted!')} className="px-4 py-2 bg-gs-green text-white rounded-xl text-sm font-bold hover:brightness-110 transition-all">Accept</button>
                  <button onClick={() => showToast('Invitation declined.')} className="px-4 py-2 bg-red-500/10 text-red-400 border border-red-500/30 rounded-xl text-sm font-medium hover:bg-red-500/20 transition-colors">Decline</button>
                </div>
              </HoloPanel>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Achievements Tab ─────────────────────────────────────────────────────────
const BADGES = [
  { emoji: '🏆', label: 'Hack Winner', desc: 'Won Spring Hackathon 2025', unlocked: true, color: 'from-yellow-400/20 to-orange-500/20', border: 'border-yellow-500/50' },
  { emoji: '🤝', label: 'Team Player', desc: 'Joined 3 groups', unlocked: true, color: 'from-blue-400/20 to-cyan-500/20', border: 'border-cyan-500/50' },
  { emoji: '🔥', label: 'On Fire', desc: 'Active 7 days straight', unlocked: false, color: 'from-gray-400/5 to-gray-500/5', border: 'border-gray-600/30' },
  { emoji: '🚀', label: 'Launcher', desc: 'Submit first project', unlocked: false, color: 'from-gray-400/5 to-gray-500/5', border: 'border-gray-600/30' },
  { emoji: '⭐', label: 'Star Contributor', desc: 'Top 10 leaderboard', unlocked: false, color: 'from-gray-400/5 to-gray-500/5', border: 'border-gray-600/30' },
  { emoji: '🎯', label: 'Sharp Focus', desc: 'Complete 5 events', unlocked: false, color: 'from-gray-400/5 to-gray-500/5', border: 'border-gray-600/30' },
];

function AchievementsTab() {
  return (
    <div className="space-y-6">
      <HoloPanel glow="bg-gs-primary/10" className="flex items-center gap-6">
        <div className="w-16 h-16 rounded-2xl bg-gs-bg border border-gs-primary/40 flex items-center justify-center">
          <Trophy size={32} className="text-gs-primary" />
        </div>
        <div>
          <p className="text-gs-text-muted text-sm">Leaderboard Rank</p>
          <p className="text-4xl font-black font-heading text-gs-primary">#12</p>
          <p className="text-xs text-gs-text-muted mt-1">Top 15% of all students</p>
        </div>
        <div className="ml-auto text-right">
          <div className="text-2xl font-black font-heading text-gs-text-main">480 XP</div>
          <div className="text-xs text-gs-text-muted">Total experience</div>
        </div>
      </HoloPanel>

      <div>
        <h3 className="text-lg font-black font-heading text-gs-text-main mb-4 flex items-center gap-2">
          <Award size={18} className="text-gs-amber" /> Badges
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {BADGES.map(badge => (
            <div key={badge.label} className={`rounded-2xl p-5 bg-gradient-to-br ${badge.color} border ${badge.border} flex flex-col items-center gap-2 text-center transition-all ${badge.unlocked ? 'hover:scale-105 cursor-pointer' : 'opacity-60'}`}>
              <span className={`text-4xl ${!badge.unlocked ? 'grayscale' : ''}`}>{badge.emoji}</span>
              <span className="font-bold text-sm text-gs-text-main">{badge.label}</span>
              <span className="text-xs text-gs-text-muted">{badge.unlocked ? badge.desc : '🔒 Locked'}</span>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-black font-heading text-gs-text-main mb-4">Certificates</h3>
        <div className="space-y-3">
          {[
            { name: 'React Fundamentals', issuer: 'freeCodeCamp', date: 'Jan 2025' },
            { name: 'UI/UX Design Certification', issuer: 'Coursera', date: 'Dec 2024' },
          ].map(cert => (
            <HoloPanel key={cert.name} glow="bg-gs-amber/5" className="!p-4 flex items-center gap-4 hover:border-gs-primary transition-colors cursor-pointer">
              <div className="w-10 h-10 rounded-lg bg-gs-amber/10 border border-gs-amber/30 flex items-center justify-center">
                <Award size={20} className="text-gs-amber" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gs-text-main">{cert.name}</p>
                <p className="text-xs text-gs-text-muted">{cert.issuer} · {cert.date}</p>
              </div>
              <ChevronRight size={16} className="text-gs-text-muted" />
            </HoloPanel>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Settings Tab ─────────────────────────────────────────────────────────────
function SettingsTab({ logout: handleLogout, showToast }) {
  const [notifs, setNotifs] = useState({ events: true, teams: true, messages: true, leaderboard: false });
  const [privacy, setPrivacy] = useState({ publicProfile: true, showSkills: true, showEmail: false });
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const toggleNotif = k => setNotifs(p => ({ ...p, [k]: !p[k] }));
  const togglePrivacy = k => setPrivacy(p => ({ ...p, [k]: !p[k] }));

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <HoloPanel glow="bg-gs-primary/5" className="!p-0 overflow-hidden">
        <div className="p-5 border-b border-gs-border flex items-center gap-2">
          <Bell size={18} className="text-gs-primary" />
          <h3 className="font-black font-heading text-gs-text-main">Notification Preferences</h3>
        </div>
        <div className="divide-y divide-gs-border">
          {[
            { key: 'events', label: 'Event Announcements', desc: 'New hackathons, workshops, and more' },
            { key: 'teams', label: 'Team Invitations', desc: 'When someone invites you to a group' },
            { key: 'messages', label: 'Direct Messages', desc: 'New DMs from other students' },
            { key: 'leaderboard', label: 'Leaderboard Updates', desc: 'Your rank changes' },
          ].map(({ key, label, desc }) => (
            <div key={key} className="flex items-center justify-between p-5">
              <div>
                <p className="font-medium text-gs-text-main">{label}</p>
                <p className="text-xs text-gs-text-muted mt-0.5">{desc}</p>
              </div>
              <Toggle checked={notifs[key]} onChange={() => toggleNotif(key)} />
            </div>
          ))}
        </div>
      </HoloPanel>

      <HoloPanel glow="bg-gs-green/5" className="!p-0 overflow-hidden">
        <div className="p-5 border-b border-gs-border flex items-center gap-2">
          <Shield size={18} className="text-gs-green" />
          <h3 className="font-black font-heading text-gs-text-main">Privacy Settings</h3>
        </div>
        <div className="divide-y divide-gs-border">
          {[
            { key: 'publicProfile', label: 'Public Profile', desc: 'Anyone can view your profile' },
            { key: 'showSkills', label: 'Show Skills', desc: 'Display your skills to other students' },
            { key: 'showEmail', label: 'Show Email', desc: 'Share email address on your profile' },
          ].map(({ key, label, desc }) => (
            <div key={key} className="flex items-center justify-between p-5">
              <div>
                <p className="font-medium text-gs-text-main">{label}</p>
                <p className="text-xs text-gs-text-muted mt-0.5">{desc}</p>
              </div>
              <Toggle checked={privacy[key]} onChange={() => togglePrivacy(key)} />
            </div>
          ))}
        </div>
      </HoloPanel>

      <HoloPanel glow="bg-gs-text-muted/5" className="!p-0 overflow-hidden">
        <div className="p-5 border-b border-gs-border flex items-center gap-2">
          <Settings size={18} className="text-gs-text-muted" />
          <h3 className="font-black font-heading text-gs-text-main">Account</h3>
        </div>
        <div className="divide-y divide-gs-border">
          {[
            { label: 'Change Password', icon: Lock, action: () => showToast('Password change email sent!') },
            { label: 'Export My Data', icon: Eye, action: () => showToast('Data export started.') },
          ].map(({ label, icon: Icon, action }) => (
            <button key={label} onClick={action} className="w-full flex items-center justify-between p-5 hover:bg-gs-bg/50 transition-colors">
              <div className="flex items-center gap-3">
                <Icon size={18} className="text-gs-text-muted" />
                <span className="font-medium text-gs-text-main">{label}</span>
              </div>
              <ChevronRight size={16} className="text-gs-text-muted" />
            </button>
          ))}
        </div>
      </HoloPanel>

      <div className="bg-red-500/5 border border-red-500/20 rounded-2xl overflow-hidden">
        <div className="p-5 border-b border-red-500/20">
          <h3 className="font-bold text-red-400">Danger Zone</h3>
        </div>
        <div className="p-5 space-y-4">
          <button onClick={() => setShowLogoutModal(true)} className="w-full flex items-center justify-center gap-3 py-4 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl transition-colors shadow-[0_0_20px_rgba(239,68,68,0.25)]">
            <LogOut size={20} /> Logout of GroupSync
          </button>
          <button onClick={() => showToast('Account deletion request submitted.')} className="w-full flex items-center justify-center gap-2 py-3 border border-red-500/30 text-red-400 rounded-xl hover:bg-red-500/10 transition-colors text-sm font-medium">
            Delete Account
          </button>
        </div>
      </div>

      {showLogoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-gs-card border border-gs-border rounded-2xl p-8 max-w-sm w-full shadow-2xl">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center mx-auto mb-4">
                <LogOut size={28} className="text-red-400" />
              </div>
              <h2 className="text-xl font-black font-heading text-gs-text-main mb-2">Logout?</h2>
              <p className="text-gs-text-muted text-sm mb-6">Are you sure you want to log out of GroupSync?</p>
              <div className="flex gap-3">
                <button onClick={() => setShowLogoutModal(false)} className="flex-1 py-3 rounded-xl border border-gs-border text-gs-text-main hover:bg-gs-bg transition-colors font-medium">Cancel</button>
                <button onClick={() => { setShowLogoutModal(false); handleLogout(); }} className="flex-1 py-3 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold transition-colors">Logout</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Tabs Config ──────────────────────────────────────────────────────────────
const TABS = [
  { id: 'overview', label: 'Overview', icon: User },
  { id: 'events', label: 'Events', icon: Calendar },
  { id: 'teams', label: 'Teams', icon: Users },
  { id: 'achievements', label: 'Achievements', icon: Trophy },
  { id: 'settings', label: 'Settings', icon: Settings },
];

// ─── Main UserProfile Component ───────────────────────────────────────────────
export default function UserProfile() {
  const navigate = useNavigate();
  const { user, setUser, updateLocalUser, factions, showToast, logout } = useAppContext();
  const [activeTab, setActiveTab] = useState('overview');
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(user || {});
  const [isSaving, setIsSaving] = useState(false);
  const [showSkillModal, setShowSkillModal] = useState(false);

  React.useEffect(() => {
    if (user) setFormData(user);
  }, [user]);

  const handleSkillAdded = (skillLabel) => {
    setFormData(prev => ({
      ...prev,
      skills: [...new Set([...(prev.skills || []), skillLabel])]
    }));
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    const previousUser = { ...user };
    updateLocalUser({ ...user, ...formData });
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          email: formData.email,
          dob: formData.dob,
          college: formData.college,
          course: formData.course,
          branch: formData.branch,
          cgpa: formData.cgpa,
          bio: formData.bio,
          social_links: formData.social_links || formData.socialLinks,
          skills: formData.skills,
          interests: formData.interests,
          name: formData.name
        })
        .eq('id', user.id);
      if (error) throw error;
      showToast('Profile updated successfully!', 'success');
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      updateLocalUser(previousUser);
      setFormData(previousUser);
      showToast('Failed to update profile.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  if (!user) return (
    <div className="flex items-center justify-center h-64 text-gs-text-muted">
      <p>Please log in to view your profile.</p>
    </div>
  );

  const f = factions[user.faction];
  const FactionIcon = f?.icon || User;

  return (
    <div className="relative space-y-8 w-full pb-20">
      {/* Immersive Background */}
      <div className="fixed inset-0 pointer-events-none -z-10">
        <div className="absolute top-0 right-0 w-[700px] h-[700px] bg-gs-secondary/5 rounded-full blur-[140px]" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gs-primary/5 rounded-full blur-[120px]" />
        <ScanningGrid />
        <FloatingParticles />
      </div>

      {/* ── Profile Hero ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative group rounded-[2.5rem] p-px overflow-hidden shadow-2xl"
      >
        {/* Gradient border */}
        <div className="absolute inset-0 bg-gradient-to-br from-gs-primary/30 via-transparent to-gs-secondary/30 opacity-60 group-hover:opacity-100 transition-opacity duration-700" />

        {/* Card body */}
        <div className="relative bg-gs-card backdrop-blur-3xl rounded-[calc(2.5rem-1px)] border border-gs-border p-8 md:p-10 overflow-hidden">
          {/* Mesh overlay */}
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            <div className="absolute inset-0 bg-gradient-to-br from-gs-primary/20 via-transparent to-gs-secondary/20" />
          </div>
          {/* Faction watermark */}
          <div className={`absolute right-0 top-0 opacity-[0.06] pointer-events-none scale-150 -translate-y-1/4 translate-x-1/4 ${f?.color}`}>
            <FactionIcon size={280} />
          </div>

          <div className="relative z-10 flex flex-col md:flex-row gap-8 items-center md:items-start">
            {/* Avatar */}
            <div className="relative shrink-0">
              <div className="absolute -inset-4 bg-gs-primary/20 rounded-full blur-2xl animate-pulse" />
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
                className="absolute -inset-2 rounded-full border-2 border-dashed border-gs-primary/30"
              />
              <div className="w-32 h-32 md:w-36 md:h-36 rounded-3xl flex items-center justify-center text-6xl bg-gs-bg border-2 border-gs-border shadow-[0_0_40px_rgba(0,240,255,0.15)] relative z-10 overflow-hidden">
                {user.avatar_url ? (
                  <img src={user.avatar_url} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  user.avatar || '🎓'
                )}
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 space-y-4">
              <div className="flex flex-col md:flex-row md:items-center gap-4">
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.name || formData.fullName || ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="text-4xl font-black font-heading bg-gs-bg/50 border border-gs-border rounded-2xl px-5 py-2 text-gs-text-main w-full md:max-w-md outline-none focus:border-gs-primary transition-all"
                    placeholder="Your Name"
                  />
                ) : (
                  <h1 className="text-4xl md:text-5xl font-black font-heading text-gs-text-main tracking-tight">
                    {user.name || user.fullName}
                  </h1>
                )}
                <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${f?.border} ${f?.color} whitespace-nowrap`} style={{ backgroundColor: 'transparent' }}>
                  {f?.name}
                </span>
              </div>

              {!isEditing && (
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-3 text-sm font-bold text-gs-text-muted">
                    <span className="flex items-center gap-2 bg-gs-primary/5 px-3 py-1.5 rounded-xl border border-gs-primary/10">
                      <GraduationCap size={15} /> {user.college || 'College'}
                    </span>
                    <span className="flex items-center gap-2 bg-gs-secondary/5 px-3 py-1.5 rounded-xl border border-gs-secondary/10">
                      <Shield size={15} /> {user.year || '3rd Year'}
                    </span>
                    {user.availability && (
                      <span className="flex items-center gap-1.5 bg-emerald-500/10 text-emerald-400 px-3 py-1.5 rounded-xl border border-emerald-500/20 text-xs">
                        <Clock size={13} /> {user.availability}
                      </span>
                    )}
                    {user.location && (
                      <span className="flex items-center gap-1.5 bg-white/5 text-[var(--color-gs-text-muted)] px-3 py-1.5 rounded-xl border border-white/10 text-xs">
                        <MapPin size={13} /> {user.location}
                      </span>
                    )}
                  </div>
                  <p className="text-base text-gs-text-muted max-w-2xl font-medium leading-relaxed italic opacity-80">
                    "{user.bio || 'Building the future, one commit at a time. 🚀'}"
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3 pt-2">
                {isEditing ? (
                  <>
                    <button onClick={handleSaveProfile} disabled={isSaving}
                      className="px-5 py-2.5 bg-gs-green text-white font-bold rounded-xl hover:brightness-110 transition-all flex items-center gap-2 text-sm shadow-[0_0_15px_rgba(16,185,129,0.3)] disabled:opacity-50">
                      {isSaving ? <Zap className="animate-pulse" size={15} /> : <Save size={15} />}
                      {isSaving ? 'Saving...' : 'Save Changes'}
                    </button>
                    <button onClick={() => { setIsEditing(false); setFormData(user); }} disabled={isSaving}
                      className="px-5 py-2.5 bg-red-500/10 text-red-400 border border-red-500/30 rounded-xl hover:bg-red-500/20 transition-colors flex items-center gap-2 text-sm">
                      <X size={15} /> Cancel
                    </button>
                  </>
                ) : (
                  <div className="flex gap-2">
                    <button onClick={() => navigate('/profile/edit')}
                      className="px-5 py-2.5 bg-gradient-to-r from-[var(--color-gs-cyan)] to-[var(--color-gs-secondary)] text-white font-bold rounded-xl hover:opacity-90 transition-all flex items-center gap-2 text-sm shadow-[0_0_15px_rgba(0,240,255,0.3)]">
                      <Edit3 size={15} /> Edit Profile
                    </button>
                    <button onClick={() => setIsEditing(true)}
                      className="px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl text-xs font-bold transition-colors">
                      Quick Edit
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── Tab Navigation ── */}
      <div className="flex gap-1 border-b border-gs-border overflow-x-auto pb-px">
        {TABS.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-4 font-black font-heading text-xs uppercase tracking-widest transition-all relative whitespace-nowrap group ${isActive ? 'text-gs-primary' : 'text-gs-text-muted hover:text-gs-text-main'}`}
            >
              {isActive && (
                <motion.div
                  layoutId="activeTabBar"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-gs-primary to-gs-secondary shadow-[0_0_10px_rgba(0,240,255,0.4)]"
                />
              )}
              <Icon size={16} className={`relative z-10 ${isActive ? 'scale-110' : 'group-hover:scale-105'} transition-transform`} />
              <span className="relative z-10">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ── Tab Content ── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -12 }}
          transition={{ duration: 0.18, ease: 'easeOut' }}
        >
          {activeTab === 'overview' && <OverviewTab user={user} factions={factions} isEditing={isEditing} formData={formData} setFormData={setFormData} onAddSkill={() => setShowSkillModal(true)} />}
          {activeTab === 'events' && <EventsTab />}
          {activeTab === 'teams' && <TeamsTab showToast={showToast} />}
          {activeTab === 'achievements' && <AchievementsTab />}
          {activeTab === 'settings' && <SettingsTab logout={logout} showToast={showToast} />}
        </motion.div>
      </AnimatePresence>

      {/* Skill Verification Modal */}
      <StrictSkillVerificationModal
        isOpen={showSkillModal}
        onClose={() => setShowSkillModal(false)}
        onSkillAdded={handleSkillAdded}
      />
    </div>
  );
}
