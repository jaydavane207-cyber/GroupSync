import React, { useState } from 'react';
import {
  User, Award, Shield, Users, Edit3, LogOut,
  Calendar, BookOpen, GraduationCap, Star, Globe,
  Linkedin, Github, Instagram, Twitter, Bell, Lock,
  Trophy, Loader2, Check, Settings,
  ChevronRight, MapPin, Phone, Mail, Eye, EyeOff,
  BarChart2, Clock, CheckCircle, XCircle, Save, X, Plus
} from 'lucide-react';
import { useAppContext } from '@/context/AppContext';
import { useNavigate } from 'react-router-dom';
import supabase from '@/lib/supabase';
import StrictSkillVerificationModal from '@/components/modals/StrictSkillVerificationModal';
import { motion, AnimatePresence } from 'framer-motion';
import { SkillBadge, SkillBadgeInline } from '@/components/badges/SkillBadge';
import { getCredibilityBreakdown, getEndorsements } from '@/lib/services/profileService';
import { getUserBadges } from '@/lib/services/quizService';


// â”€â”€â”€ Sub-components â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const StatCard = ({ value, label, color = 'text-gs-text-main' }) => (
  <div className="bg-gs-card border border-gs-border rounded-xl p-4 text-left shadow-xs">
    <div className="text-xs font-medium text-gs-text-muted">{label}</div>
    <div className={`text-2xl font-bold font-heading mt-1 ${color}`}>{value}</div>
  </div>
);

const HoloPanel = ({ children, className = '' }) => (
  <div className={`bg-gs-card border border-gs-border rounded-xl p-5 shadow-xs ${className}`}>
    {children}
  </div>
);

const Toggle = ({ checked, onChange }) => (
  <button type="button" onClick={onChange}
    className={'relative flex items-center w-11 h-6 rounded-full transition-colors duration-200 border border-gs-border ' + (checked ? 'bg-blue-600' : 'bg-gs-bg')}>
    <div className={'w-5 h-5 rounded-full transition-transform duration-200 ' + (checked ? 'translate-x-[21px] bg-white' : 'translate-x-[1px] bg-gs-text-muted')} />
  </button>
);

// â”€â”€â”€ Overview Tab â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

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
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard value={groupsJoined} label="Groups Joined" color="text-blue-500" />
        <StatCard value={credibility ? `${credibility.total}%` : 'â€”'} label="Credibility Score" color="text-emerald-500" />
        <StatCard value={badges.length} label="Badges Earned" color="text-amber-500" />
        <StatCard value="#12" label="Campus Rank" color="text-gs-text-main" />
      </div>

      {/* Info Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Personal Info */}
        <HoloPanel>
          <h3 className="text-base font-semibold text-gs-text-main mb-4 flex items-center gap-2">
            <User size={18} className="text-blue-500" /> Personal Details
          </h3>
          <div className="space-y-3">
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
        <HoloPanel>
          <h3 className="text-base font-semibold text-gs-text-main mb-4 flex items-center gap-2">
            <GraduationCap size={18} className="text-indigo-500" /> Academic Information
          </h3>
          {isEditing ? (
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <BookOpen size={16} className="text-gs-text-muted shrink-0" />
                <input type="text" value={formData.college || ''} onChange={(e) => setFormData({ ...formData, college: e.target.value })} className="w-full bg-gs-bg border border-gs-border rounded-lg px-2.5 py-1.5 text-sm text-gs-text-main outline-none focus:border-blue-500" placeholder="College Name" />
              </div>
              <div className="flex items-center gap-3 text-sm">
                <GraduationCap size={16} className="text-gs-text-muted shrink-0" />
                <div className="flex gap-2 w-full">
                  <input type="text" value={formData.course || ''} onChange={(e) => setFormData({ ...formData, course: e.target.value })} className="w-1/2 bg-gs-bg border border-gs-border rounded-lg px-2.5 py-1.5 text-sm text-gs-text-main outline-none focus:border-blue-500" placeholder="Course" />
                  <input type="text" value={formData.branch || ''} onChange={(e) => setFormData({ ...formData, branch: e.target.value })} className="w-1/2 bg-gs-bg border border-gs-border rounded-lg px-2.5 py-1.5 text-sm text-gs-text-main outline-none focus:border-blue-500" placeholder="Branch" />
                </div>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Star size={16} className="text-gs-text-muted shrink-0" />
                <input type="text" value={formData.year || ''} onChange={(e) => setFormData({ ...formData, year: e.target.value })} className="w-full bg-gs-bg border border-gs-border rounded-lg px-2.5 py-1.5 text-sm text-gs-text-main outline-none focus:border-blue-500" placeholder="Year (e.g. 3rd)" />
              </div>
              <div className="flex items-center gap-3 text-sm">
                <BarChart2 size={16} className="text-gs-text-muted shrink-0" />
                <input type="text" value={formData.cgpa || ''} onChange={(e) => setFormData({ ...formData, cgpa: e.target.value })} className="w-full bg-gs-bg border border-gs-border rounded-lg px-2.5 py-1.5 text-sm text-gs-text-main outline-none focus:border-blue-500" placeholder="CGPA" />
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {[
                { icon: BookOpen, label: user.college || 'IIT Bombay' },
                { icon: GraduationCap, label: user.course ? `${user.course} - ${user.branch || 'CS'}` : 'B.Tech - Computer Science' },
                { icon: Star, label: user.year ? `${user.year} Year` : '3rd Year' },
                { icon: BarChart2, label: user.cgpa ? `CGPA: ${user.cgpa}` : 'CGPA: Private' },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-2.5 text-sm">
                  <Icon size={16} className="text-gs-text-muted shrink-0" />
                  <span className="text-gs-text-main">{label}</span>
                </div>
              ))}
            </div>
          )}
        </HoloPanel>

        {/* Social Links */}
        <HoloPanel>
          <h3 className="text-base font-semibold text-gs-text-main mb-4 flex items-center gap-2">
            <Globe size={18} className="text-emerald-500" /> Links & Profiles
          </h3>
          {isEditing ? (
            <div className="space-y-3">
              {[
                { icon: Linkedin, key: 'linkedin', color: 'text-blue-500', placeholder: 'LinkedIn URL' },
                { icon: Github, key: 'github', color: 'text-gs-text-muted', placeholder: 'GitHub URL' },
                { icon: Globe, key: 'portfolio', color: 'text-emerald-500', placeholder: 'Portfolio URL' },
                { icon: Instagram, key: 'instagram', color: 'text-pink-500', placeholder: 'Instagram URL' },
                { icon: Twitter, key: 'twitter', color: 'text-sky-500', placeholder: 'Twitter URL' },
              ].map(({ icon: Icon, key, color, placeholder }) => (
                <div key={key} className="flex items-center gap-2.5 text-sm">
                  <Icon size={16} className={`${color} shrink-0`} />
                  <input type="text" value={formData.social_links?.[key] || formData.socialLinks?.[key] || ''}
                    onChange={(e) => setFormData({ ...formData, social_links: { ...(formData.social_links || formData.socialLinks || {}), [key]: e.target.value } })}
                    className="w-full bg-gs-bg border border-gs-border rounded-lg px-2.5 py-1.5 text-sm text-gs-text-main outline-none focus:border-blue-500"
                    placeholder={placeholder} />
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {[
                { icon: Linkedin, label: 'LinkedIn', color: 'text-blue-500', url: user.social_links?.linkedin || user.socialLinks?.linkedin || 'Not linked' },
                { icon: Github, label: 'GitHub', color: 'text-gs-text-muted', url: user.social_links?.github || user.socialLinks?.github || 'Not linked' },
                { icon: Globe, label: 'Portfolio', color: 'text-emerald-500', url: user.social_links?.portfolio || user.socialLinks?.portfolio || 'Not linked' },
                { icon: Instagram, label: 'Instagram', color: 'text-pink-500', url: user.social_links?.instagram || user.socialLinks?.instagram || 'Not linked' },
                { icon: Twitter, label: 'Twitter', color: 'text-sky-500', url: user.social_links?.twitter || user.socialLinks?.twitter || 'Not linked' },
              ].map(({ icon: Icon, label, color, url }) => (
                <div key={label} className="flex items-center gap-2.5 text-sm">
                  <Icon size={16} className={`${color} shrink-0`} />
                  <span className="text-gs-text-muted truncate">{url}</span>
                </div>
              ))}
            </div>
          )}
        </HoloPanel>
      </div>

      {/* Skills & Interests */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <HoloPanel>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-gs-text-main flex items-center gap-2">
              <Shield size={18} className="text-blue-500" /> Skills
            </h3>
            {!isEditing && (
              <button
                id="open-skill-verification-btn"
                onClick={() => onAddSkill?.()}
                className="flex items-center gap-1 px-2.5 py-1 bg-blue-600/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 rounded-lg text-xs font-medium hover:bg-blue-600/15 transition-colors"
              >
                <Plus size={13} /> Add Skill
              </button>
            )}
          </div>
          {isEditing ? (
            <input type="text" value={(formData.skills || []).join(', ')} onChange={(e) => setFormData({ ...formData, skills: e.target.value.split(',').map(s => s.trim()) })} className="w-full bg-gs-bg border border-gs-border rounded-lg px-3 py-2 text-sm text-gs-text-main outline-none focus:border-blue-500" placeholder="React, Python, UI/UX (Comma separated)" />
          ) : (
            <div className="flex flex-wrap gap-2">
              {(user.skills && user.skills.length > 0 ? user.skills : ['React', 'Node.js']).map(s => {
                const endorseCount = (endorsements[s] || []).length;
                return (
                  <span key={s} className="inline-flex items-center gap-1.5 px-3 py-1 bg-gs-bg border border-gs-border text-gs-text-main rounded-md text-xs font-medium">
                    <Shield size={11} className="text-blue-500 opacity-80" />
                    <span>{s}</span>
                    {endorseCount > 0 && (
                      <span className="text-[10px] font-semibold text-amber-500 bg-amber-500/10 px-1 rounded-sm" title={`${endorseCount} peer endorsement${endorseCount > 1 ? 's' : ''}`}>
                        â˜… {endorseCount}
                      </span>
                    )}
                  </span>
                );
              })}
            </div>
          )}
        </HoloPanel>

        <HoloPanel>
          <h3 className="text-base font-semibold text-gs-text-main mb-4 flex items-center gap-2">
            <Trophy size={18} className="text-amber-500" /> Interests & Focus Areas
          </h3>
          {isEditing ? (
            <input type="text" value={(formData.interests || []).join(', ')} onChange={(e) => setFormData({ ...formData, interests: e.target.value.split(',').map(i => i.trim()) })} className="w-full bg-gs-bg border border-gs-border rounded-lg px-3 py-2 text-sm text-gs-text-main outline-none focus:border-blue-500" placeholder="Hackathons, AI, Open Source (Comma separated)" />
          ) : (
            <div className="flex flex-wrap gap-2">
              {(user.interests && user.interests.length > 0 ? user.interests : ['Hackathons', 'Web3']).map(i => (
                <span key={i} className="px-3 py-1 bg-gs-bg border border-gs-border text-gs-text-muted rounded-md text-xs font-medium">{i}</span>
              ))}
            </div>
          )}
        </HoloPanel>
      </div>

      {/* Skill Credibility Score & Badges */}
      <HoloPanel>
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-base font-semibold text-gs-text-main flex items-center gap-2">
            <Award size={18} className="text-blue-500" /> Credibility Score & Badges
          </h3>
          <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-500 border border-blue-500/20">
            Verified Index: {credibility?.total || 75}%
          </span>
        </div>

        {/* 4 Weights Breakdown */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
          <div className="p-3 rounded-xl bg-gs-bg border border-gs-border">
            <div className="flex justify-between items-center text-xs mb-1.5">
              <span className="text-gs-text-muted">Quizzes</span>
              <span className="font-semibold text-gs-text-main">{credibility?.breakdown?.quiz?.score || 0}/40</span>
            </div>
            <div className="w-full bg-gs-border/60 rounded-full h-1.5 overflow-hidden">
              <div className="bg-blue-500 h-full rounded-full" style={{ width: `${((credibility?.breakdown?.quiz?.score || 0)/40)*100}%` }} />
            </div>
          </div>

          <div className="p-3 rounded-xl bg-gs-bg border border-gs-border">
            <div className="flex justify-between items-center text-xs mb-1.5">
              <span className="text-gs-text-muted">Certificates</span>
              <span className="font-semibold text-emerald-500">{credibility?.breakdown?.certificate?.score || 0}/35</span>
            </div>
            <div className="w-full bg-gs-border/60 rounded-full h-1.5 overflow-hidden">
              <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${((credibility?.breakdown?.certificate?.score || 0)/35)*100}%` }} />
            </div>
          </div>

          <div className="p-3 rounded-xl bg-gs-bg border border-gs-border">
            <div className="flex justify-between items-center text-xs mb-1.5">
              <span className="text-gs-text-muted">Endorsements</span>
              <span className="font-semibold text-amber-500">{credibility?.breakdown?.endorsement?.score || 0}/20</span>
            </div>
            <div className="w-full bg-gs-border/60 rounded-full h-1.5 overflow-hidden">
              <div className="bg-amber-500 h-full rounded-full" style={{ width: `${((credibility?.breakdown?.endorsement?.score || 0)/20)*100}%` }} />
            </div>
          </div>

          <div className="p-3 rounded-xl bg-gs-bg border border-gs-border">
            <div className="flex justify-between items-center text-xs mb-1.5">
              <span className="text-gs-text-muted">Projects</span>
              <span className="font-semibold text-indigo-500">{credibility?.breakdown?.project?.score || 0}/5</span>
            </div>
            <div className="w-full bg-gs-border/60 rounded-full h-1.5 overflow-hidden">
              <div className="bg-indigo-500 h-full rounded-full" style={{ width: `${((credibility?.breakdown?.project?.score || 0)/5)*100}%` }} />
            </div>
          </div>
        </div>

        {/* Real Badges */}
        <div className="flex flex-wrap gap-2">
          {badges.length > 0 ? (
            badges.map(b => {
              const tierColor = b.badge_tier === 'platinum' ? 'text-indigo-400' : b.badge_tier === 'gold' ? 'text-amber-400' : b.badge_tier === 'silver' ? 'text-zinc-300' : 'text-amber-600';
              return (
                <span key={b.id} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-gs-bg border border-gs-border text-xs font-medium text-gs-text-main">
                  <Award size={13} className={tierColor} />
                  <span>{b.badge_name}</span>
                  <span className="text-[10px] text-gs-text-muted">({Math.round(b.quiz_score || 0)}%)</span>
                </span>
              );
            })
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
      <HoloPanel>
        <h3 className="text-base font-semibold text-gs-text-main mb-4 flex items-center gap-2">
          <Users size={18} className="text-blue-500" /> Collaboration Preferences
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-xl bg-gs-bg border border-gs-border">
            <p className="text-xs text-gs-text-muted mb-1 font-medium">Team Status</p>
            <p className="font-semibold text-emerald-500 text-sm flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500" /> Looking for Team
            </p>
          </div>
          <div className="p-3.5 rounded-xl bg-gs-bg border border-gs-border">
            <p className="text-xs text-gs-text-muted mb-1 font-medium">Mentorship</p>
            <p className="font-semibold text-gs-text-main text-sm">Open to Mentoring</p>
          </div>
          <div className="p-3.5 rounded-xl bg-gs-bg border border-gs-border">
            <p className="text-xs text-gs-text-muted mb-1 font-medium">Work Style</p>
            <p className="font-semibold text-gs-text-main text-sm">Analytical & Structured</p>
          </div>
          <div className="p-3.5 rounded-xl bg-gs-bg border border-gs-border">
            <p className="text-xs text-gs-text-muted mb-1 font-medium">Commitment</p>
            <p className="font-semibold text-gs-text-main text-sm">Hackathons & Projects</p>
          </div>
        </div>
      </HoloPanel>

      {/* Bio */}
      <HoloPanel>
        <h3 className="text-base font-semibold text-gs-text-main mb-3 flex items-center gap-2">
          <Eye size={18} className="text-blue-500" /> About
        </h3>
        {isEditing ? (
          <textarea value={formData.bio || ''} onChange={(e) => setFormData({ ...formData, bio: e.target.value })} rows={3} className="w-full bg-gs-bg border border-gs-border rounded-lg px-3 py-2 text-sm text-gs-text-main outline-none focus:border-blue-500 resize-none" placeholder="Tell us about yourself..." />
        ) : (
          <p className="text-gs-text-muted text-sm leading-relaxed">{user.bio || 'Building the future, one commit at a time.'}</p>
        )}
      </HoloPanel>
    </div>
  );
}

// â”€â”€â”€ Events Tab â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const MOCK_EVENTS = [
  { id: 1, name: 'Spring Hackathon 2025', date: 'Mar 15, 2025', type: 'Hackathon', status: 'attended', result: '2nd Place ðŸ¥ˆ' },
  { id: 2, name: 'AI Summit', date: 'Feb 10, 2025', type: 'Conference', status: 'attended', result: 'Participant' },
  { id: 3, name: '48h Game Jam', date: 'Jan 20, 2025', type: 'Game Jam', status: 'rsvpd', result: "RSVP'd" },
  { id: 4, name: 'UI/UX Workshop', date: 'Dec 5, 2024', type: 'Workshop', status: 'attended', result: 'Completed âœ“' },
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
                <p className="text-xs text-gs-text-muted">{event.date} Â· {event.type}</p>
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

// â”€â”€â”€ Teams Tab â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const MOCK_TEAMS = [
  { id: 1, name: 'Quantum Hackers', event: 'Spring Hackathon', members: 4, role: 'Frontend Lead', status: 'current', emoji: 'âš¡' },
  { id: 2, name: 'Design Wizards', event: 'UI/UX Challenge', members: 3, role: 'Member', status: 'past', emoji: 'ðŸŽ¨' },
];
const MOCK_INVITES = [
  { id: 1, team: 'Chain Breakers', event: 'Web3 Weekend', from: 'Bob', emoji: 'ðŸ”—' },
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
                <p className="text-sm text-gs-text-muted">{team.event} Â· {team.members} members</p>
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
                <p className="text-sm text-gs-text-muted">{team.event} Â· {team.members} members</p>
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
                  <p className="text-sm text-gs-text-muted">{invite.event} Â· Invited by {invite.from}</p>
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

// â”€â”€â”€ Achievements Tab â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const BADGES = [
  { emoji: 'ðŸ†', label: 'Hack Winner', desc: 'Won Spring Hackathon 2025', unlocked: true },
  { emoji: 'ðŸ¤', label: 'Team Player', desc: 'Joined 3 groups', unlocked: true },
  { emoji: 'ðŸ”¥', label: 'On Fire', desc: 'Active 7 days straight', unlocked: false },
  { emoji: 'ðŸš€', label: 'Launcher', desc: 'Submit first project', unlocked: false },
  { emoji: 'â­', label: 'Star Contributor', desc: 'Top 10 leaderboard', unlocked: false },
  { emoji: 'ðŸŽ¯', label: 'Sharp Focus', desc: 'Complete 5 events', unlocked: false },
];

function AchievementsTab() {
  return (
    <div className="space-y-6">
      <HoloPanel className="flex items-center gap-5">
        <div className="w-14 h-14 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
          <Trophy size={26} className="text-blue-500" />
        </div>
        <div>
          <p className="text-gs-text-muted text-xs font-medium">Leaderboard Rank</p>
          <p className="text-3xl font-bold font-heading text-gs-text-main mt-0.5">#12</p>
          <p className="text-xs text-gs-text-muted mt-0.5">Top 15% across university</p>
        </div>
        <div className="ml-auto text-right">
          <div className="text-xl font-bold text-gs-text-main">480 XP</div>
          <div className="text-xs text-gs-text-muted">Total earned</div>
        </div>
      </HoloPanel>

      <div>
        <h3 className="text-base font-semibold text-gs-text-main mb-3 flex items-center gap-2">
          <Award size={18} className="text-amber-500" /> Achievement Badges
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {BADGES.map(badge => (
            <div key={badge.label} className={`rounded-xl p-4 bg-gs-card border border-gs-border flex flex-col items-center gap-1.5 text-center transition-colors ${badge.unlocked ? 'border-gs-border hover:border-blue-500/50' : 'opacity-50'}`}>
              <span className={`text-3xl ${!badge.unlocked ? 'grayscale' : ''}`}>{badge.emoji}</span>
              <span className="font-semibold text-sm text-gs-text-main mt-1">{badge.label}</span>
              <span className="text-xs text-gs-text-muted">{badge.unlocked ? badge.desc : 'Locked'}</span>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-base font-semibold text-gs-text-main mb-3">Verified Certificates</h3>
        <div className="space-y-2.5">
          {[
            { name: 'React Fundamentals', issuer: 'freeCodeCamp', date: 'Jan 2025' },
            { name: 'UI/UX Design Certification', issuer: 'Coursera', date: 'Dec 2024' },
          ].map(cert => (
            <HoloPanel key={cert.name} className="!p-4 flex items-center gap-4 hover:border-blue-500/50 transition-colors cursor-pointer">
              <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
                <Award size={18} className="text-amber-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-gs-text-main truncate">{cert.name}</p>
                <p className="text-xs text-gs-text-muted">{cert.issuer} Â· {cert.date}</p>
              </div>
              <ChevronRight size={16} className="text-gs-text-muted shrink-0" />
            </HoloPanel>
          ))}
        </div>
      </div>
    </div>
  );
}

// â”€â”€â”€ Settings Tab â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function SettingsTab({ logout: handleLogout, showToast }) {
  const [notifs, setNotifs] = useState({ events: true, teams: true, messages: true, leaderboard: false });
  const [privacy, setPrivacy] = useState({ publicProfile: true, showSkills: true, showEmail: false });
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const toggleNotif = k => setNotifs(p => ({ ...p, [k]: !p[k] }));
  const togglePrivacy = k => setPrivacy(p => ({ ...p, [k]: !p[k] }));

  return (
    <div className="space-y-5 max-w-3xl mx-auto">
      <HoloPanel className="!p-0 overflow-hidden">
        <div className="p-4 border-b border-gs-border flex items-center gap-2">
          <Bell size={18} className="text-blue-500" />
          <h3 className="font-semibold text-sm text-gs-text-main">Notification Preferences</h3>
        </div>
        <div className="divide-y divide-gs-border">
          {[
            { key: 'events', label: 'Event Announcements', desc: 'New hackathons, workshops, and campus meetups' },
            { key: 'teams', label: 'Team Invitations', desc: 'When another student invites you to a group' },
            { key: 'messages', label: 'Direct Messages', desc: 'Direct chat messages from other students' },
            { key: 'leaderboard', label: 'Leaderboard Updates', desc: 'Rank and reputation notifications' },
          ].map(({ key, label, desc }) => (
            <div key={key} className="flex items-center justify-between p-4">
              <div>
                <p className="font-medium text-sm text-gs-text-main">{label}</p>
                <p className="text-xs text-gs-text-muted mt-0.5">{desc}</p>
              </div>
              <Toggle checked={notifs[key]} onChange={() => toggleNotif(key)} />
            </div>
          ))}
        </div>
      </HoloPanel>

      <HoloPanel className="!p-0 overflow-hidden">
        <div className="p-4 border-b border-gs-border flex items-center gap-2">
          <Shield size={18} className="text-emerald-500" />
          <h3 className="font-semibold text-sm text-gs-text-main">Privacy Settings</h3>
        </div>
        <div className="divide-y divide-gs-border">
          {[
            { key: 'publicProfile', label: 'Public Profile', desc: 'Allow other students to view your profile' },
            { key: 'showSkills', label: 'Show Verified Skills', desc: 'Display skill credentials on team applications' },
            { key: 'showEmail', label: 'Display Email', desc: 'Show your college email address publicly' },
          ].map(({ key, label, desc }) => (
            <div key={key} className="flex items-center justify-between p-4">
              <div>
                <p className="font-medium text-sm text-gs-text-main">{label}</p>
                <p className="text-xs text-gs-text-muted mt-0.5">{desc}</p>
              </div>
              <Toggle checked={privacy[key]} onChange={() => togglePrivacy(key)} />
            </div>
          ))}
        </div>
      </HoloPanel>

      <HoloPanel className="!p-0 overflow-hidden">
        <div className="p-4 border-b border-gs-border flex items-center gap-2">
          <Settings size={18} className="text-gs-text-muted" />
          <h3 className="font-semibold text-sm text-gs-text-main">Account Actions</h3>
        </div>
        <div className="divide-y divide-gs-border">
          {[
            { label: 'Change Password', icon: Lock, action: () => showToast('Password reset link sent to your email.') },
            { label: 'Export Data', icon: Eye, action: () => showToast('Data export initiated.') },
          ].map(({ label, icon: Icon, action }) => (
            <button key={label} onClick={action} className="w-full flex items-center justify-between p-4 hover:bg-gs-bg/50 transition-colors text-left">
              <div className="flex items-center gap-3">
                <Icon size={16} className="text-gs-text-muted" />
                <span className="font-medium text-sm text-gs-text-main">{label}</span>
              </div>
              <ChevronRight size={16} className="text-gs-text-muted" />
            </button>
          ))}
        </div>
      </HoloPanel>

      <div className="bg-gs-card border border-red-500/20 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-red-500/20">
          <h3 className="font-semibold text-sm text-red-500">Danger Zone</h3>
        </div>
        <div className="p-4 space-y-3">
          <button onClick={() => setShowLogoutModal(true)} className="w-full flex items-center justify-center gap-2 py-2.5 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors text-sm shadow-xs">
            <LogOut size={16} /> Sign Out of GroupSync
          </button>
          <button onClick={() => showToast('Account deletion request registered.')} className="w-full flex items-center justify-center gap-2 py-2 border border-gs-border text-gs-text-muted hover:text-red-400 hover:border-red-500/30 rounded-lg transition-colors text-xs font-medium">
            Delete Account
          </button>
        </div>
      </div>

      {showLogoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-gs-card border border-gs-border rounded-xl p-6 max-w-sm w-full shadow-xl">
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-3">
                <LogOut size={22} className="text-red-500" />
              </div>
              <h2 className="text-lg font-bold text-gs-text-main mb-1">Confirm Sign Out</h2>
              <p className="text-gs-text-muted text-xs mb-5">Are you sure you want to log out of your session?</p>
              <div className="flex gap-2">
                <button onClick={() => setShowLogoutModal(false)} className="flex-1 py-2 rounded-lg border border-gs-border text-gs-text-main hover:bg-gs-bg transition-colors font-medium text-xs">Cancel</button>
                <button onClick={() => { setShowLogoutModal(false); handleLogout(); }} className="flex-1 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium transition-colors text-xs">Sign Out</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// â”€â”€â”€ Tabs Config â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const TABS = [
  { id: 'overview', label: 'Overview', icon: User },
  { id: 'events', label: 'Events', icon: Calendar },
  { id: 'teams', label: 'Teams', icon: Users },
  { id: 'achievements', label: 'Achievements', icon: Trophy },
  { id: 'settings', label: 'Settings', icon: Settings },
];

// â”€â”€â”€ Main UserProfile Component â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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
    <div className="relative space-y-6 w-full pb-20">
      {/* â”€â”€ Profile Hero â”€â”€ */}
      <div className="bg-gs-card border border-gs-border rounded-xl p-6 md:p-8">
        <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
          {/* Avatar */}
          <div className="shrink-0">
            <div className="w-24 h-24 md:w-28 md:h-28 rounded-xl bg-gs-bg border border-gs-border flex items-center justify-center text-4xl overflow-hidden shadow-xs">
              {user.avatar_url ? (
                <img src={user.avatar_url} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                user.avatar || 'ðŸŽ“'
              )}
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 space-y-3 text-center md:text-left">
            <div className="flex flex-col md:flex-row md:items-center gap-3 justify-center md:justify-start">
              {isEditing ? (
                <input
                  type="text"
                  value={formData.name || formData.fullName || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="text-2xl font-bold font-heading bg-gs-bg border border-gs-border rounded-xl px-3 py-1.5 text-gs-text-main w-full md:max-w-md outline-none focus:border-blue-500"
                  placeholder="Your Name"
                />
              ) : (
                <h1 className="text-2xl md:text-3xl font-bold font-heading text-gs-text-main tracking-tight">
                  {user.name || user.fullName}
                </h1>
              )}
              {f?.name && (
                <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-medium border border-gs-border text-gs-text-muted bg-gs-bg">
                  {f.name}
                </span>
              )}
            </div>

            {!isEditing && (
              <div className="space-y-2">
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5 text-xs text-gs-text-muted">
                  <span className="flex items-center gap-1.5 bg-gs-bg px-2.5 py-1 rounded-md border border-gs-border">
                    <GraduationCap size={14} className="text-blue-500" /> {user.college || 'College'}
                  </span>
                  <span className="flex items-center gap-1.5 bg-gs-bg px-2.5 py-1 rounded-md border border-gs-border">
                    <Shield size={14} className="text-indigo-500" /> {user.year || '3rd Year'}
                  </span>
                  {user.availability && (
                    <span className="flex items-center gap-1.5 bg-emerald-500/10 text-emerald-500 px-2.5 py-1 rounded-md border border-emerald-500/20">
                      <Clock size={13} /> {user.availability}
                    </span>
                  )}
                  {user.location && (
                    <span className="flex items-center gap-1.5 bg-gs-bg px-2.5 py-1 rounded-md border border-gs-border">
                      <MapPin size={13} /> {user.location}
                    </span>
                  )}
                </div>
                <p className="text-sm text-gs-text-muted max-w-2xl leading-relaxed">
                  {user.bio || 'Building the future, one commit at a time.'}
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2.5 pt-1 justify-center md:justify-start">
              {isEditing ? (
                <>
                  <button onClick={handleSaveProfile} disabled={isSaving}
                    className="px-4 py-2 bg-[#6D6AF6] hover:bg-[#5C59EC] text-white font-medium rounded-lg transition-colors flex items-center gap-1.5 text-xs shadow-xs disabled:opacity-50 btn-tactile">
                    {isSaving ? <Loader2 className="animate-spin" size={14} /> : <Save size={14} />}
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button onClick={() => { setIsEditing(false); setFormData(user); }} disabled={isSaving}
                    className="px-4 py-2 bg-gs-card hover:bg-gs-bg border border-gs-border text-gs-text-muted hover:text-gs-text-main rounded-lg transition-colors flex items-center gap-1.5 text-xs">
                    <X size={14} /> Cancel
                  </button>
                </>
              ) : (
                <div className="flex gap-2">
                  <button onClick={() => navigate('/profile/edit')}
                    className="px-4 py-2 bg-[#6D6AF6] hover:bg-[#5C59EC] text-white font-medium rounded-lg transition-colors flex items-center gap-1.5 text-xs shadow-xs btn-tactile">
                    <Edit3 size={14} /> Edit Profile
                  </button>
                  <button onClick={() => setIsEditing(true)}
                    className="px-3.5 py-2 bg-gs-bg hover:bg-white/[0.04] border border-gs-border text-gs-text-main rounded-lg text-xs font-medium transition-colors">
                    Quick Edit
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* â”€â”€ Tab Navigation â”€â”€ */}
      <div className="flex gap-6 border-b border-gs-border overflow-x-auto pb-px">
        {TABS.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 py-3 text-xs font-medium transition-colors relative whitespace-nowrap ${isActive ? 'text-[#6D6AF6]' : 'text-gs-text-muted hover:text-gs-text-main'}`}
            >
              <Icon size={15} />
              <span>{tab.label}</span>
              {isActive && (
                <motion.div
                  layoutId="activeTabBar"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#6D6AF6]"
                />
              )}
            </button>
          );
        })}
      </div>

      {/* â”€â”€ Tab Content â”€â”€ */}
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

