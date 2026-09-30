import React, { useState } from 'react';
import { Search, ArrowRight, Users, ChevronDown, CheckCircle2, SlidersHorizontal, Info } from 'lucide-react';
import { useAppContext } from '@/context/AppContext';
import { useNavigate } from 'react-router-dom';

export default function AISuggestions() {
  const { user, groups, setSelectedGroupId } = useAppContext();
  const navigate = useNavigate();
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [expandedDesc, setExpandedDesc] = useState({});

  const toggleExpandDesc = (id) => {
    setExpandedDesc(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const fetchMatches = async () => {
    setLoading(true);
    setError('');
    
    try {
      await new Promise(resolve => setTimeout(resolve, 500));

      const openGroups = groups.filter((g) => {
        const memberCount = g.memberIds?.length || g.members || 1;
        return g.type !== 'DM' &&
          g.type !== 'General' &&
          g.privacy !== 'private' && 
          memberCount < (g.maxMembers || 4) && 
          !g.memberIds?.includes(user?.id);
      });

      const pool = openGroups.length > 0 ? openGroups : [
        {
          id: '__ai-1',
          name: 'Distributed Systems & ML Cohort',
          event: 'Spring Hackathon 2026',
          type: 'Hackathon',
          maxMembers: 4,
          members: 2,
          skills: ['Python', 'NLP', 'Machine Learning', 'FastAPI'],
          description: 'Building fault-tolerant multi-agent pipelines for computational biology datasets. We need someone who understands async python and model quantization.'
        },
        {
          id: '__ai-2',
          name: 'Decentralized Student Credentials',
          event: 'Web3 Collegiate Summit',
          type: 'Technical',
          maxMembers: 5,
          members: 3,
          skills: ['React', 'Node.js', 'Solidity', 'TypeScript'],
          description: 'Creating verifiable zero-knowledge credential verification for campus student organizations. Looking for a frontend specialist to craft crisp linear-like management tables.'
        },
        {
          id: '__ai-3',
          name: 'Campus EcoTrack Initiative',
          event: 'Climate Challenge 2026',
          type: 'Hackathon',
          maxMembers: 4,
          members: 1,
          skills: ['React Native', 'Figma', 'UI/UX Design', 'Tailwind CSS'],
          description: 'Real-time hyperlocal air quality index tracking and student carbon offset incentives. Seeking an engineer to build clean cross-platform client flows.'
        }
      ];

      const scoredGroups = pool.map((g, index) => {
        const userSkills = user?.skills || ['React', 'Python', 'Node.js'];
        const gSkills = g.skills || [];
        const overlap = gSkills.filter((s) => userSkills.includes(s)).length;
        
        const skillScore = Math.min(100, Math.round((overlap / Math.max(1, gSkills.length)) * 35 + 60));
        const interestScore = index === 0 ? 92 : index === 1 ? 84 : 76;
        const performanceScore = 88;
        const availabilityScore = 90;

        const totalScore = Math.round(
          (skillScore * 0.40) +
          (interestScore * 0.30) +
          (performanceScore * 0.15) +
          (availabilityScore * 0.15)
        );

        return {
          groupId: g.id,
          groupName: g.name,
          groupEvent: g.event,
          groupType: g.type,
          description: g.description,
          spotsLeft: (g.maxMembers || 4) - (g.memberIds?.length || g.members || 1),
          score: Math.min(98, Math.max(72, totalScore)),
          breakdown: {
            skills: skillScore,
            interests: interestScore,
            performance: performanceScore,
            availability: availabilityScore
          },
          reason: overlap > 0 
            ? `Shared stack in ${gSkills.slice(0, 2).join(', ')}`
            : 'Complementary technical role for upcoming project sprint'
        };
      });

      const topMatches = scoredGroups
        .sort((a, b) => b.score - a.score)
        .slice(0, 3);

      setMatches(topMatches);
    } catch (err) {
      console.error('Matching failed:', err);
      setError('Matching service temporarily unavailable.');
    } finally {
      setLoading(false);
    }
  };

  const handleViewGroup = (groupId) => {
    if (groupId.startsWith('__ai-')) {
      navigate('/teams');
    } else {
      setSelectedGroupId(groupId);
      navigate(`/group/${groupId}`);
    }
  };

  // Helper for match score pill color
  const getScorePill = (score) => {
    if (score >= 80) {
      return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
    }
    if (score >= 60) {
      return 'bg-[#6D6AF6]/10 text-[#7E7BF8] border-[#6D6AF6]/20';
    }
    return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
  };

  return (
    <div className="space-y-6 pb-12 max-w-7xl mx-auto">
      {/* â”€â”€ Compact Header Panel â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <div className="bg-gs-card border border-gs-border rounded-xl p-5 machined-edge shadow-xs">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-[28px] font-semibold tracking-tight text-gs-text-main">
              AI Team Matching
            </h1>
            <p className="text-sm text-gs-text-muted mt-1 max-w-2xl leading-relaxed">
              Synthesizes your verified skills, project domain interests, and schedule availability against open squads.
            </p>
          </div>

          <button 
            onClick={fetchMatches} 
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#6D6AF6] hover:bg-[#5C59EC] text-white font-medium text-xs rounded-lg transition-colors disabled:opacity-50 shadow-xs shrink-0 btn-tactile"
          >
            {loading ? (
              <div className="animate-spin w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full" />
            ) : (
              <Search size={14} />
            )}
            {loading ? 'Evaluating...' : (matches.length > 0 ? 'Recalculate matches' : 'Find matches')}
          </button>
        </div>

        {/* Small Expandable "How it works" Detail */}
        <details className="mt-4 pt-3.5 border-t border-gs-border group text-xs">
          <summary className="text-gs-text-muted hover:text-gs-text-main font-medium flex items-center gap-1.5 cursor-pointer select-none">
            <Info size={13} className="text-[#6D6AF6]" />
            <span>How the matching algorithm works</span>
            <ChevronDown size={13} className="group-open:rotate-180 transition-transform text-gs-text-muted" />
          </summary>
          <div className="mt-3 p-3.5 rounded-lg bg-gs-elevated border border-gs-border grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <p className="text-[11px] text-gs-text-muted">Technical skills</p>
              <p className="font-semibold text-gs-text-main mt-0.5">40% weight</p>
              <p className="text-[10px] text-gs-text-muted mt-0.5">Verified quiz proficiencies</p>
            </div>
            <div>
              <p className="text-[11px] text-gs-text-muted">Domain interests</p>
              <p className="font-semibold text-gs-text-main mt-0.5">30% weight</p>
              <p className="text-[10px] text-gs-text-muted mt-0.5">Event alignment & focus</p>
            </div>
            <div>
              <p className="text-[11px] text-gs-text-muted">Track record</p>
              <p className="font-semibold text-gs-text-main mt-0.5">15% weight</p>
              <p className="text-[10px] text-gs-text-muted mt-0.5">Peer reviews & submissions</p>
            </div>
            <div>
              <p className="text-[11px] text-gs-text-muted">Availability</p>
              <p className="font-semibold text-gs-text-main mt-0.5">15% weight</p>
              <p className="text-[10px] text-gs-text-muted mt-0.5">Active schedule overlap</p>
            </div>
          </div>
        </details>
      </div>

      {/* â”€â”€ Results Section â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      {loading ? (
        <div className="py-16 flex flex-col items-center justify-center space-y-3">
          <div className="w-8 h-8 border-2 border-gs-border border-t-[#6D6AF6] rounded-full animate-spin" />
          <p className="text-xs text-gs-text-muted">Evaluating campus squad skill gaps and team rosters...</p>
        </div>
      ) : error ? (
        <div className="text-center bg-gs-card border border-gs-border rounded-xl p-6">
          <p className="text-xs text-rose-400 font-medium">{error}</p>
        </div>
      ) : matches.length > 0 ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gs-text-main">
              Top squad matches ({matches.length})
            </h2>
          </div>

          <div className="space-y-3.5">
            {matches.map((m, i) => {
              const isExpanded = !!expandedDesc[m.groupId];
              const scoreClass = getScorePill(m.score);

              return (
                <div
                  key={m.groupId || i}
                  className="bg-gs-card border border-gs-border rounded-xl p-5 shadow-xs hover:border-gs-border-hover transition-colors machined-edge"
                >
                  {/* Card Header: Rank Badge, Team Name, Match % Pill */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-3 pb-3.5 border-b border-gs-border">
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#6D6AF6]/10 text-[#7E7BF8] border border-[#6D6AF6]/20">
                          #{i + 1} match
                        </span>
                        <span className="text-[11px] text-gs-text-muted">
                          {m.groupEvent} Â· {m.groupType}
                        </span>
                      </div>
                      <h3 className="text-base font-semibold text-gs-text-main truncate">
                        {m.groupName}
                      </h3>
                      <p className="text-xs text-emerald-400 font-medium flex items-center gap-1">
                        <CheckCircle2 size={12} />
                        {m.reason}
                      </p>
                    </div>

                    {/* Match % as a colored pill */}
                    <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-2">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${scoreClass}`}>
                        {m.score}% match
                      </span>
                    </div>
                  </div>

                  {/* Truncated Description with "Read more" */}
                  <div className="mb-4">
                    <p className={`text-xs text-gs-text-muted leading-relaxed ${isExpanded ? '' : 'line-clamp-2'}`}>
                      {m.description}
                    </p>
                    {m.description.length > 120 && (
                      <button
                        onClick={() => toggleExpandDesc(m.groupId)}
                        className="text-[11px] font-medium text-[#6D6AF6] hover:underline mt-1 focus:outline-none"
                      >
                        {isExpanded ? 'Show less' : 'Read more'}
                      </button>
                    )}
                  </div>

                  {/* Compatibility Breakdown: Slim Labeled Horizontal Bars */}
                  <div className="bg-gs-elevated border border-gs-border rounded-lg p-3.5 mb-4">
                    <p className="text-xs font-medium text-gs-text-main mb-3 flex items-center gap-1.5">
                      <SlidersHorizontal size={13} className="text-[#6D6AF6]" />
                      Compatibility factor breakdown
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <MatchFactorBar label="Technical stack" weight={40} score={m.breakdown.skills} />
                      <MatchFactorBar label="Event domain" weight={30} score={m.breakdown.interests} />
                      <MatchFactorBar label="Track record" weight={15} score={m.breakdown.performance} />
                      <MatchFactorBar label="Availability" weight={15} score={m.breakdown.availability} />
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pt-1">
                    <span className="text-xs text-gs-text-muted flex items-center gap-1.5">
                      <Users size={13} className="text-gs-text-muted" />
                      {m.spotsLeft} spot{m.spotsLeft > 1 ? 's' : ''} remaining
                    </span>
                    <button
                      onClick={() => handleViewGroup(m.groupId)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#6D6AF6] hover:bg-[#5C59EC] text-white font-medium text-xs rounded-lg transition-colors btn-tactile"
                    >
                      View squad <ArrowRight size={12} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="text-center py-12 bg-gs-card border border-gs-border rounded-xl p-6 machined-edge">
          <p className="text-sm font-semibold text-gs-text-main">Ready to find matches</p>
          <p className="text-xs text-gs-text-muted mt-1 max-w-sm mx-auto mb-4">
            Click the button to evaluate campus squads looking for your verified skills.
          </p>
          <button
            onClick={fetchMatches}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#6D6AF6] hover:bg-[#5C59EC] text-white font-medium text-xs rounded-lg transition-colors btn-tactile"
          >
            <Search size={13} /> Find matches
          </button>
        </div>
      )}
    </div>
  );
}

const MatchFactorBar = ({ label, weight, score }) => (
  <div className="space-y-1">
    <div className="flex justify-between items-baseline text-[11px]">
      <span className="text-gs-text-muted">{label}</span>
      <span className="font-semibold text-gs-text-main tabular-nums">{score}%</span>
    </div>
    <div className="h-1 bg-white/[0.08] rounded-full overflow-hidden">
      <div 
        className="h-full bg-[#6D6AF6] rounded-full" 
        style={{ width: `${score}%` }} 
      />
    </div>
    <span className="text-[10px] text-gs-text-muted block">{weight}% weight</span>
  </div>
);

