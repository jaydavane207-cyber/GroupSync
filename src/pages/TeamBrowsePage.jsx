import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users, Plus, Search, Filter, Sparkles, Trophy, Rocket,
  GraduationCap, Cpu, Globe, ArrowRight, Check, AlertCircle, RefreshCw
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { getTeams } from '../lib/teamService';
import supabase from '../lib/supabase';

const CATEGORIES = [
  { id: 'all', label: 'All Teams', icon: Globe },
  { id: 'hackathon', label: 'Hackathon', icon: Trophy },
  { id: 'project', label: 'Projects', icon: Rocket },
  { id: 'research', label: 'Research', icon: GraduationCap },
  { id: 'competition', label: 'Competition', icon: Cpu },
];

export default function TeamBrowsePage() {
  const navigate = useNavigate();
  const { user, factions } = useAppContext();

  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [category, setCategory] = useState('all');
  const [onlyRecruiting, setOnlyRecruiting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [skillFilter, setSkillFilter] = useState('');

  const channelRef = useRef(null);

  const fetchTeamList = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error: err } = await getTeams({
      category: category === 'all' ? undefined : category,
      status: onlyRecruiting ? 'recruiting' : undefined,
      search: searchTerm,
      skill: skillFilter
    });

    if (err) {
      setError(err.userMessage || 'Unable to load teams. Please retry.');
    } else {
      setTeams(data || []);
    }
    setLoading(false);
  }, [category, onlyRecruiting, searchTerm, skillFilter]);

  useEffect(() => {
    fetchTeamList();
  }, [fetchTeamList]);

  // ─── Realtime Subscriptions ────────────────────────────────────────────────
  useEffect(() => {
    const channel = supabase
      .channel('teams-realtime-feed')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'teams' }, () => {
        fetchTeamList();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'team_members' }, () => {
        fetchTeamList();
      })
      .subscribe();

    channelRef.current = channel;
    return () => {
      if (channelRef.current) supabase.removeChannel(channelRef.current);
    };
  }, [fetchTeamList]);

  return (
    <div className="space-y-8 animate-[load-fade-up_0.4s_ease-out]">
      {/* ── Header ────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-black font-heading text-[var(--color-gs-text-main)] tracking-tight">
            Team <span className="text-[var(--color-gs-cyan)]">Finder</span>
          </h1>
          <p className="text-[var(--color-gs-text-muted)] mt-1">
            Discover active campus teams, join hackathon squads, or recruit verified teammates.
          </p>
        </div>

        <button
          onClick={() => navigate('/teams/create')}
          className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-[var(--color-gs-cyan)] to-[var(--color-gs-secondary)] text-white font-bold text-sm hover:opacity-95 transition-opacity shadow-[0_4px_20px_rgba(0,240,255,0.25)] shrink-0"
        >
          <Plus size={18} />
          Create Team
        </button>
      </div>

      {/* ── Search & Filter Controls ──────────────────────────────── */}
      <div className="bg-[var(--color-gs-card)] border border-[var(--color-gs-border)] rounded-3xl p-5 space-y-4 backdrop-blur-xl">
        {/* Search row */}
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-gs-text-muted)]" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search by team name or project description..."
              className="w-full bg-[var(--color-gs-bg)] border border-[var(--color-gs-border)] rounded-2xl pl-11 pr-4 py-3 text-sm text-[var(--color-gs-text-main)] placeholder-[var(--color-gs-text-muted)] outline-none focus:border-[var(--color-gs-cyan)]"
            />
          </div>

          <div className="relative w-full md:w-64">
            <Filter size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-gs-text-muted)]" />
            <input
              type="text"
              value={skillFilter}
              onChange={e => setSkillFilter(e.target.value)}
              placeholder="Filter by required skill..."
              className="w-full bg-[var(--color-gs-bg)] border border-[var(--color-gs-border)] rounded-2xl pl-11 pr-4 py-3 text-sm text-[var(--color-gs-text-main)] placeholder-[var(--color-gs-text-muted)] outline-none focus:border-[var(--color-gs-cyan)]"
            />
          </div>
        </div>

        {/* Category Pills & Recruiting Toggle */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-white/5">
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map(cat => {
              const Icon = cat.icon;
              const isSelected = category === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setCategory(cat.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                    isSelected
                      ? 'bg-[var(--color-gs-cyan)] text-[#0f172a] shadow-[0_0_12px_rgba(0,240,255,0.25)]'
                      : 'bg-[var(--color-gs-bg)] text-[var(--color-gs-text-muted)] border border-[var(--color-gs-border)] hover:border-[var(--color-gs-cyan)]/40 hover:text-white'
                  }`}
                >
                  <Icon size={14} />
                  {cat.label}
                </button>
              );
            })}
          </div>

          <label className="flex items-center gap-2 text-xs font-bold text-[var(--color-gs-text-muted)] cursor-pointer select-none">
            <input
              type="checkbox"
              checked={onlyRecruiting}
              onChange={e => setOnlyRecruiting(e.target.checked)}
              className="accent-[var(--color-gs-cyan)] w-4 h-4 rounded cursor-pointer"
            />
            Recruiting Only (Open Spots)
          </label>
        </div>
      </div>

      {/* ── Error Banner ──────────────────────────────────────────── */}
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-2xl flex items-center justify-between text-red-400 text-sm">
          <div className="flex items-center gap-2">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
          <button onClick={fetchTeamList} className="flex items-center gap-1 hover:underline text-xs font-bold">
            <RefreshCw size={12} /> Retry
          </button>
        </div>
      )}

      {/* ── Loading Skeleton ──────────────────────────────────────── */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="bg-[var(--color-gs-card)] border border-[var(--color-gs-border)] rounded-3xl p-6 h-64 animate-pulse" />
          ))}
        </div>
      )}

      {/* ── Empty State ───────────────────────────────────────────── */}
      {!loading && !error && teams.length === 0 && (
        <div className="p-16 text-center bg-[var(--color-gs-card)] border border-[var(--color-gs-border)] rounded-3xl space-y-4">
          <Users size={48} className="mx-auto text-[var(--color-gs-text-muted)] opacity-40" />
          <h3 className="text-xl font-bold text-white font-heading">No Teams Found</h3>
          <p className="text-sm text-[var(--color-gs-text-muted)] max-w-sm mx-auto">
            We couldn't find any teams matching your search criteria. Try modifying your filters or create your own squad!
          </p>
          <button
            onClick={() => navigate('/teams/create')}
            className="px-6 py-2.5 bg-[var(--color-gs-cyan)] text-[#0f172a] rounded-xl text-xs font-bold hover:bg-cyan-400 transition-colors"
          >
            Create a New Team
          </button>
        </div>
      )}

      {/* ── Team Cards Grid ───────────────────────────────────────── */}
      {!loading && !error && teams.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teams.map(team => {
            const spotsLeft = Math.max(0, (team.max_members || 4) - (team.current_members || 1));
            const isFull = spotsLeft === 0;
            const isLeader = user?.id === team.leader_id;
            const isMember = (team.members || []).some(m => m.user_id === user?.id);

            return (
              <div
                key={team.id}
                onClick={() => navigate(`/teams/${team.id}`)}
                className="bg-[var(--color-gs-card)] border border-[var(--color-gs-border)] rounded-3xl p-6 flex flex-col justify-between gap-5 hover:border-[var(--color-gs-cyan)]/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(0,240,255,0.08)] cursor-pointer group backdrop-blur-xl"
              >
                {/* Header info */}
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[var(--color-gs-cyan)]/20 to-[var(--color-gs-secondary)]/20 border border-white/10 flex items-center justify-center text-2xl shadow-inner">
                      {team.banner_emoji || '🚀'}
                    </div>

                    <div className="flex flex-col items-end gap-1">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-white/5 border border-white/10 text-[var(--color-gs-cyan)]">
                        {team.category}
                      </span>
                      {isFull ? (
                        <span className="text-[10px] font-bold text-amber-400">Team Full</span>
                      ) : (
                        <span className="text-[10px] font-bold text-emerald-400">
                          {spotsLeft} spot{spotsLeft > 1 ? 's' : ''} left
                        </span>
                      )}
                    </div>
                  </div>

                  <h3 className="font-bold text-lg text-white font-heading group-hover:text-[var(--color-gs-cyan)] transition-colors line-clamp-1">
                    {team.name}
                  </h3>
                  <p className="text-xs text-[var(--color-gs-text-muted)] mt-1 line-clamp-2 leading-relaxed">
                    {team.description || 'No description provided.'}
                  </p>
                </div>

                {/* Skills tags */}
                {team.skills?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {team.skills.slice(0, 3).map(skill => (
                      <span
                        key={skill}
                        className="px-2.5 py-1 text-[10px] bg-[var(--color-gs-bg)] border border-[var(--color-gs-border)] rounded-lg text-[var(--color-gs-text-muted)] font-medium"
                      >
                        {skill}
                      </span>
                    ))}
                    {team.skills.length > 3 && (
                      <span className="px-2 py-1 text-[10px] text-[var(--color-gs-text-muted)]">
                        +{team.skills.length - 3}
                      </span>
                    )}
                  </div>
                )}

                {/* Footer: Roster avatars + CTA */}
                <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {/* Avatar stack */}
                    <div className="flex -space-x-2 overflow-hidden">
                      {(team.members || []).slice(0, 4).map((m, idx) => (
                        <div
                          key={m.id || idx}
                          className="inline-block h-7 w-7 rounded-full ring-2 ring-[var(--color-gs-bg)] bg-[var(--color-gs-card)] border border-white/10 text-xs flex items-center justify-center"
                          title={m.profile?.name || 'Member'}
                        >
                          {m.profile?.avatar || '🎓'}
                        </div>
                      ))}
                    </div>
                    <span className="text-[11px] text-[var(--color-gs-text-muted)] font-bold">
                      {team.current_members || 1}/{team.max_members || 4}
                    </span>
                  </div>

                  <span className="text-xs font-bold text-[var(--color-gs-cyan)] flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    {isLeader ? 'Manage' : isMember ? 'View Team' : 'Details'}
                    <ArrowRight size={13} />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
