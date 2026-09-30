import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheck, ExternalLink, X, GraduationCap,
  Award, Clock, FileText, Eye, Trophy, Medal
} from 'lucide-react';
import supabase from '@/lib/supabase';

// â”€â”€â”€ Mock Data â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const MOCK_USER_PROFILE = {
  name: 'Aarav Sharma',
  avatarUrl: 'https://api.dicebear.com/9.x/notionists/svg?seed=Aarav&backgroundColor=0a0e1a',
  department: 'Computer Science & Engineering',
  year: '3rd Year',
  bio: 'Full-stack developer passionate about building performant web apps and exploring the boundaries of machine learning. Open-source contributor & hackathon enthusiast. Currently exploring distributed systems and edge computing.',
  skills: [
    {
      name: 'React',
      is_verified: true,
      certificate_url: 'https://images.unsplash.com/photo-1633356122102-3fe601e05bd2?w=800',
      is_certificate_public: true,
    },
    {
      name: 'Python',
      is_verified: true,
      certificate_url: 'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=800',
      is_certificate_public: true,
    },
    {
      name: 'UI/UX',
      is_verified: true,
      certificate_url: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800',
      is_certificate_public: false, // Private â€” button must NOT render
    },
    {
      name: 'Node.js',
      is_verified: true,
      certificate_url: null, // No certificate at all
      is_certificate_public: false,
    },
    {
      name: 'AWS',
      is_verified: true,
      certificate_url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800',
      is_certificate_public: true,
    },
    {
      name: 'Machine Learning',
      is_verified: false, // Not verified â€” must be completely hidden
      certificate_url: null,
      is_certificate_public: false,
    },
    {
      name: 'C++',
      is_verified: true,
      certificate_url: null,
      is_certificate_public: false,
    },
  ],
};

// â”€â”€â”€ Skill color palette â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const SKILL_COLORS = {
  'React':            { bg: 'rgba(59, 130, 246, 0.08)',  border: 'rgba(59, 130, 246, 0.25)',  text: '#3b82f6' },
  'Python':           { bg: 'rgba(59, 130, 246, 0.08)',  border: 'rgba(59, 130, 246, 0.25)',  text: '#3b82f6' },
  'UI/UX':            { bg: 'rgba(168, 85, 247, 0.08)',  border: 'rgba(168, 85, 247, 0.25)',  text: '#a855f7' },
  'Node.js':          { bg: 'rgba(16, 185, 129, 0.08)',  border: 'rgba(16, 185, 129, 0.25)',  text: '#10b981' },
  'AWS':              { bg: 'rgba(245, 158, 11, 0.08)',  border: 'rgba(245, 158, 11, 0.25)',  text: '#f59e0b' },
  'Machine Learning': { bg: 'rgba(59, 130, 246, 0.08)',  border: 'rgba(59, 130, 246, 0.25)',  text: '#3b82f6' },
  'C++':              { bg: 'rgba(99, 102, 241, 0.08)',  border: 'rgba(99, 102, 241, 0.25)',  text: '#6366f1' },
  'Java':             { bg: 'rgba(239, 68, 68, 0.08)',   border: 'rgba(239, 68, 68, 0.25)',   text: '#ef4444' },
  'SQL':              { bg: 'rgba(16, 185, 129, 0.08)',  border: 'rgba(16, 185, 129, 0.25)',  text: '#10b981' },
};

const getSkillColor = (name) =>
  SKILL_COLORS[name] || {
    bg: 'rgba(124, 58, 237, 0.08)',
    border: 'rgba(124, 58, 237, 0.25)',
    text: '#7c3aed',
  };

// â”€â”€â”€ Helper: normalise a Supabase skill row â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Supabase relational queries (select with joins) can return nested objects.
// e.g.  { skills: { name, is_verified, ... } }  or flat  { name, is_verified, ... }
// This function always returns a flat, reliable skill object.
function normaliseSkill(raw) {
  if (!raw) return null;

  // Case 1: nested under a "skills" key (join result)
  const inner = raw.skills ?? raw;

  return {
    name:                 inner.skill_name  ?? inner.name                ?? '',
    is_verified:          inner.is_verified ?? false,
    certificate_url:      inner.certificate_url                          ?? null,
    is_certificate_public: inner.is_certificate_public                  ?? false,
  };
}

// â”€â”€â”€ Certificate Lightbox (nested modal) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Receives a raw URL string and renders image or PDF iframe accordingly.
function CertificateLightbox({ url, skillName, onClose }) {
  // Close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const isPdf = typeof url === 'string' && url.toLowerCase().endsWith('.pdf');

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
      onClick={onClose}           // clicking backdrop closes
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.15, ease: 'easeOut' }}
        className="relative max-w-3xl w-full max-h-[85vh] bg-[var(--color-gs-card)] border border-[var(--color-gs-border)] rounded-xl overflow-hidden shadow-xl"
        onClick={(e) => e.stopPropagation()}   // prevent backdrop close
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[var(--color-gs-border)]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <Award size={16} className="text-emerald-500" />
            </div>
            <div>
              <p className="font-semibold text-[var(--color-gs-text-main)] text-sm">{skillName} Certificate</p>
              <p className="text-xs text-[var(--color-gs-text-muted)]">Verified credential</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-lg bg-[var(--color-gs-bg)] border border-[var(--color-gs-border)] text-[var(--color-gs-text-muted)] hover:text-blue-500 hover:border-blue-500/30 transition-colors"
              title="Open in new tab"
            >
              <ExternalLink size={16} />
            </a>
            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-[var(--color-gs-bg)] border border-[var(--color-gs-border)] text-[var(--color-gs-text-muted)] hover:text-red-400 hover:border-red-500/30 transition-colors"
              title="Close"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Document content */}
        <div className="p-4 flex items-center justify-center bg-[var(--color-gs-bg)] overflow-auto max-h-[calc(85vh-64px)]" onContextMenu={(e) => e.preventDefault()}>
          <div className="relative inline-block max-w-full max-h-full flex items-center justify-center">
            {isPdf ? (
              <iframe
                src={`${url}#toolbar=0`}
                title={`${skillName} certificate`}
                className="w-full rounded-lg"
                style={{ minHeight: '60vh', width: '100%', border: 'none' }}
              />
            ) : (
              <img
                src={url}
                alt={`${skillName} certificate`}
                className="max-w-full max-h-full rounded-lg object-contain"
                loading="lazy"
                draggable="false"
                style={{ pointerEvents: 'none' }}
                onContextMenu={(e) => e.preventDefault()}
              />
            )}
            
            {/* Anti-Theft Watermark Overlay */}
            <div className="absolute inset-0 z-20 pointer-events-none opacity-30 flex flex-col items-center justify-center overflow-hidden">
              <div className="flex flex-col gap-10 rotate-[-25deg] scale-150">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="flex gap-10 whitespace-nowrap">
                    {[...Array(4)].map((_, j) => (
                      <span key={j} className="text-2xl font-black text-gray-500 uppercase tracking-widest select-none drop-shadow-md">
                        GroupSync Protected View
                      </span>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// â”€â”€â”€ Verified Skill Badge â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function SkillBadge({ skill, onViewCert, index }) {
  const canViewCert = skill.certificate_url && skill.is_certificate_public;

  return (
    <div
      onClick={canViewCert ? () => onViewCert(skill) : undefined}
      role={canViewCert ? 'button' : undefined}
      tabIndex={canViewCert ? 0 : undefined}
      onKeyDown={canViewCert ? (e) => { if (e.key === 'Enter' || e.key === ' ') onViewCert(skill); } : undefined}
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gs-border bg-gs-bg text-gs-text-main text-xs font-medium transition-colors ${
        canViewCert ? 'cursor-pointer hover:border-blue-500 hover:bg-blue-500/5' : 'cursor-default'
      }`}
    >
      <ShieldCheck size={14} className="text-blue-500 shrink-0" />
      <span>{skill.name}</span>
      <span className="text-[10px] font-medium text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded">
        Verified
      </span>
      {canViewCert && (
        <FileText size={12} className="text-gs-text-muted shrink-0 ml-0.5" title={`View ${skill.name} certificate`} />
      )}
    </div>
  );
}

// â”€â”€â”€ Main Component â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export default function PublicProfileView({ userProfile = MOCK_USER_PROFILE }) {
  const [viewingCertificate, setViewingCertificate] = useState(null);
  const [viewingSkillName, setViewingSkillName]     = useState('');
  const [eventHistory, setEventHistory]             = useState([]);
  const [xpRank, setXpRank]                         = useState(null); // rank among all users

  // â”€â”€ Fetch real event results for this user â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  useEffect(() => {
    if (!userProfile?.id) return;

    const fetchEventHistory = async () => {
      const { data, error } = await supabase
        .from('event_results')
        .select('placement, xp_awarded, awarded_at, groups(name, type)')
        .eq('user_id', userProfile.id)
        .order('awarded_at', { ascending: false })
        .limit(5);
      if (!error && data) setEventHistory(data);
    };

    const fetchRank = async () => {
      // Count how many users have more XP â†’ rank = count + 1
      if (!userProfile.xp && userProfile.xp !== 0) return;
      const { count } = await supabase
        .from('profiles')
        .select('id', { count: 'exact', head: true })
        .gt('xp', userProfile.xp);
      if (count !== null) setXpRank(count + 1);
    };

    fetchEventHistory();
    fetchRank();
  }, [userProfile?.id, userProfile?.xp]);

  const safeSkills = Array.isArray(userProfile?.skills)
    ? userProfile.skills.map(normaliseSkill).filter(Boolean)
    : [];

  const verifiedSkills = safeSkills.filter((s) => s.is_verified === true);

  const handleViewCert = (url, skillName) => {
    setViewingCertificate(url);
    setViewingSkillName(skillName);
  };

  const handleBadgeClick = (skill) => {
    handleViewCert(skill.certificate_url, skill.name);
  };

  const placementEmoji = (p) => p === '1st' ? 'ðŸ¥‡' : p === '2nd' ? 'ðŸ¥ˆ' : p === '3rd' ? 'ðŸ¥‰' : 'âš¡';

  return (
    <div className="relative w-full text-gs-text-main py-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-gs-card border border-gs-border rounded-xl overflow-hidden shadow-xs">

          {/* â”€â”€ Header Banner â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
          <div className="h-24 bg-black/[0.02] dark:bg-white/[0.02] border-b border-gs-border relative">
            <div className="absolute top-4 right-4 flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-gs-card border border-gs-border text-xs font-medium text-gs-text-muted">
              <Eye size={13} className="text-blue-500" />
              Public View
            </div>
          </div>

          {/* â”€â”€ Avatar (overlapping header) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
          <div className="px-6 -mt-10 pb-0 flex items-end justify-between">
            <div className="relative">
              <div className="w-20 h-20 rounded-xl bg-gs-bg border-2 border-gs-card overflow-hidden shadow-xs">
                <img
                  src={userProfile.avatarUrl}
                  alt={`${userProfile.name}'s avatar`}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 border-2 border-gs-card flex items-center justify-center text-white" title="Verified Profile">
                <ShieldCheck size={12} />
              </div>
            </div>
          </div>

          {/* â”€â”€ Identity Block â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
          <div className="px-6 pt-4 pb-6">
            <h1 className="text-2xl font-bold tracking-tight text-gs-text-main mb-1.5">
              {userProfile.name}
            </h1>

            <div className="flex flex-wrap items-center gap-3 text-xs text-gs-text-muted">
              <span className="inline-flex items-center gap-1.5 font-medium">
                <GraduationCap size={14} className="text-blue-500" />
                {userProfile.department}
              </span>
              <span className="text-gs-border">â€¢</span>
              <span className="inline-flex items-center gap-1.5 font-medium">
                <Clock size={14} className="text-indigo-500" />
                {userProfile.year}
              </span>
            </div>
          </div>

          {/* â”€â”€ About Me â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
          <div className="px-6 py-5 border-t border-gs-border">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-gs-text-muted mb-2">
              About
            </h2>
            <p className="text-gs-text-muted text-sm leading-relaxed">
              {userProfile.bio}
            </p>
          </div>

          {/* â”€â”€ Skills Showcase â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
          <div className="px-6 py-5 border-t border-gs-border">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-gs-text-muted flex items-center gap-1.5">
                <ShieldCheck size={14} className="text-blue-500" />
                Verified Skills
              </h2>
              <span className="text-xs font-medium text-gs-text-muted">
                {verifiedSkills.length} Verified
              </span>
            </div>

            {verifiedSkills.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {verifiedSkills.map((skill, idx) => (
                  <SkillBadge
                    key={skill.name || idx}
                    skill={skill}
                    index={idx}
                    onViewCert={handleBadgeClick}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-gs-text-muted text-xs">
                No verified skills to showcase yet.
              </div>
            )}

            {/* Hint */}
            {verifiedSkills.some((s) => s.certificate_url && s.is_certificate_public) && (
              <p className="text-xs text-gs-text-muted mt-3 flex items-center gap-1.5">
                <FileText size={12} />
                Click on a verified skill to inspect its authenticated credential.
              </p>
            )}
          </div>

          {/* â”€â”€ XP Rank + Event History â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
          {(userProfile?.xp > 0 || eventHistory.length > 0) && (
            <div className="px-6 py-5 border-t border-gs-border">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xs font-semibold uppercase tracking-wider text-gs-text-muted flex items-center gap-1.5">
                  <Trophy size={14} className="text-amber-500" />
                  Event History & Rank
                </h2>
                <div className="flex items-center gap-2">
                  {xpRank && (
                    <span className="text-xs font-medium px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-500 border border-amber-500/20">
                      Campus Rank #{xpRank}
                    </span>
                  )}
                  <span className="flex items-center gap-1 text-xs font-semibold text-blue-500">
                    <Award size={13} />
                    {(userProfile?.xp || 0).toLocaleString()} XP
                  </span>
                </div>
              </div>

              {eventHistory.length === 0 ? (
                <p className="text-center py-4 text-gs-text-muted text-xs">No event results recorded yet.</p>
              ) : (
                <div className="space-y-2">
                  {eventHistory.map((result, i) => {
                    const medalColor = result.placement === '1st' ? 'text-amber-400' : result.placement === '2nd' ? 'text-zinc-300' : result.placement === '3rd' ? 'text-amber-600' : 'text-[#6D6AF6]';
                    return (
                      <div
                        key={i}
                        className="flex items-center gap-3 p-3 rounded-lg border border-gs-border bg-gs-bg"
                      >
                        <div className={`w-7 h-7 rounded-md bg-white/[0.03] border border-gs-border flex items-center justify-center ${medalColor} shrink-0`}>
                          <Medal size={15} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gs-text-main text-xs truncate">{result.groups?.name || 'Event'}</p>
                          <p className="text-[11px] text-gs-text-muted">
                            {result.groups?.type} Â· {new Date(result.awarded_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="font-semibold text-[#6D6AF6] tabular-nums text-xs">+{result.xp_awarded} XP</span>
                        </div>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded border border-gs-border text-gs-text-muted bg-gs-card">
                          {result.placement}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* â”€â”€ Certificate Lightbox (nested modal, z-[100]) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <AnimatePresence>
        {viewingCertificate && (
          <CertificateLightbox
            url={viewingCertificate}
            skillName={viewingSkillName}
            onClose={() => setViewingCertificate(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

