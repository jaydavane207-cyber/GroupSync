import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users, Plus, Search, Filter, Globe, Trophy, Rocket,
  GraduationCap, Cpu, ArrowRight, AlertCircle, RefreshCw, CheckCircle2
} from 'lucide-react';
import { useAppContext } from '@/context/AppContext';
import { getTeams } from '@/lib/services/teamService';
import supabase from '@/lib/supabase';

const CATEGORIES = [
  { id: 'all', label: 'All squads' },
  { id: 'hackathon', label: 'Hackathons' },
  { id: 'project', label: 'Projects' },
  { id: 'research', label: 'Research' },
  { id: 'competition', label: 'Competitions' },
];

export default function TeamBrowsePage() {
  const navigate = useNavigate();
  const { user } = useAppContext();

  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [category, setCategory] = useState('all');
  const [onlyRecruiting, setOnlyRecruiting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [skillFilter, _setSkillFilter] = useState('');

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

  // Realtime Subscriptions
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

  const spotlightTeam = teams.find(t => (t.max_members || 4) > (t.current_members || 1)) || teams[0];
  const regularTeams = teams.filter(t => t.id !== spotlightTeam?.id);

  // Calculate dynamic skill match with current user
  const getMatchPercentage = (team) => {
    const userSkills = user?.skills || ['React', 'Python'];
    const teamSkills = team.skills || [];
    if (teamSkills.length === 0) return 70;
    const common = teamSkills.filter((s) => userSkills.includes(s));
    const pct = Math.round(55 + (common.length / teamSkills.length) * 40);
    return Math.min(96, Math.max(62, pct));
  };

  return (
    <div className="space-y-6 pb-12 max-w-7xl mx-auto">
      {/* â”€â”€ Page Header â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gs-border pb-4">
        <div>
          <h1 className="text-2xl sm:text-[28px] font-semibold tracking-tight text-gs-text-main">
            Teams & squads
          </h1>
          <p className="text-sm text-gs-text-muted mt-1 max-w-2xl">
            Discover student squads for hackathons, engineering capstones, research cohorts, and competitions.
          </p>
        </div>

        <button
          onClick={() => navigate('/teams/create')}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#6D6AF6] hover:bg-[#5C59EC] text-white font-medium text-xs transition-colors shrink-0 shadow-xs btn-tactile"
        >
          <Plus size={15} />
          Create team
        </button>
      </div>

      {/* â”€â”€ Search Bar + Segmented Filter Tabs in ONE Clean Row â”€â”€â”€â”€â”€â”€â”€ */}
      <div className="bg-gs-card border border-gs-border rounded-xl p-3 shadow-xs space-y-3">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gs-text-muted" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search by team name, event, or description..."
              className="w-full bg-gs-elevated border border-gs-border rounded-lg pl-9 pr-3.5 py-2 text-xs text-gs-text-main placeholder-gs-text-muted outline-none focus:border-[#6D6AF6] focus:ring-1 focus:ring-[#6D6AF6] transition-colors"
            />
          </div>

          {/* Segmented Category Tabs */}
          <div className="inline-flex p-1 bg-gs-elevated border border-gs-border rounded-lg overflow-x-auto shrink-0">
            {CATEGORIES.map(cat => {
              const isSelected = category === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-md text-xs transition-colors whitespace-nowrap ${
                    isSelected
                      ? 'bg-gs-card text-gs-text-main font-medium shadow-xs border border-gs-border'
                      : 'text-gs-text-muted hover:text-gs-text-main'
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>

          {/* Open spots only toggle */}
          <label className="flex items-center gap-2 text-xs text-gs-text-muted cursor-pointer select-none px-1 shrink-0">
            <input
              type="checkbox"
              checked={onlyRecruiting}
              onChange={e => setOnlyRecruiting(e.target.checked)}
              className="accent-[#6D6AF6] w-3.5 h-3.5 rounded cursor-pointer"
            />
            <span>Open spots only</span>
          </label>
        </div>
      </div>

      {/* â”€â”€ Error Banner â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      {error && (
        <div className="p-3.5 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-center justify-between text-rose-400 text-xs">
          <div className="flex items-center gap-2">
            <AlertCircle size={15} />
            <span>{error}</span>
          </div>
          <button onClick={fetchTeamList} className="flex items-center gap-1 hover:underline text-xs font-medium">
            <RefreshCw size={12} /> Retry
          </button>
        </div>
      )}

      {/* â”€â”€ Loading Skeleton â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="bg-gs-card border border-gs-border rounded-xl p-5 h-56 animate-pulse" />
          ))}
        </div>
      )}

      {/* â”€â”€ Empty State â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      {!loading && !error && teams.length === 0 && (
        <div className="p-12 text-center bg-gs-card border border-gs-border rounded-xl space-y-3">
          <div className="w-10 h-10 rounded-lg bg-[#6D6AF6]/10 flex items-center justify-center mx-auto text-[#6D6AF6]">
            <Users size={20} />
          </div>
          <h3 className="text-base font-semibold text-gs-text-main">No teams found</h3>
          <p className="text-xs text-gs-text-muted max-w-sm mx-auto">
            No active campus teams matched your criteria. Adjust your search filters or start recruiting your own team.
          </p>
          <button
            onClick={() => navigate('/teams/create')}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#6D6AF6] hover:bg-[#5C59EC] text-white rounded-lg text-xs font-medium transition-colors btn-tactile"
          >
            <Plus size={14} /> Create team
          </button>
        </div>
      )}

      {/* â”€â”€ Spotlight / Featured Squad â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      {!loading && !error && spotlightTeam && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gs-text-muted">
              Featured squad
            </span>
            <span className="text-[11px] font-medium text-[#7E7BF8] bg-[#6D6AF6]/10 border border-[#6D6AF6]/20 px-2 py-0.5 rounded-full">
              {getMatchPercentage(spotlightTeam)}% match
            </span>
          </div>

          <div
            onClick={() => navigate(`/teams/${spotlightTeam.id}`)}
            className="bg-gs-card border border-gs-border rounded-xl p-5 hover:border-gs-border-hover transition-colors cursor-pointer group machined-edge flex flex-col lg:flex-row lg:items-center justify-between gap-5"
          >
            <div className="flex items-start gap-4 flex-1 min-w-0">
              <div className="w-10 h-10 rounded-lg bg-[#6D6AF6]/10 border border-[#6D6AF6]/20 flex items-center justify-center text-[#6D6AF6] shrink-0">
                <Users size={18} />
              </div>
              <div className="space-y-1.5 max-w-2xl min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-white/[0.04] text-gs-text-muted border border-gs-border">
                    {spotlightTeam.category || 'Hackathon'}
                  </span>
                  <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    Recruiting: {Math.max(0, (spotlightTeam.max_members || 4) - (spotlightTeam.current_members || 1))} spots open
                  </span>
                </div>
                <h3 className="text-base font-semibold text-gs-text-main group-hover:text-[#6D6AF6] transition-colors truncate">
                  {spotlightTeam.name}
                </h3>
                <p className="text-xs text-gs-text-muted line-clamp-2 leading-relaxed">
                  {spotlightTeam.description || 'Active campus squad looking for verified collaborators.'}
                </p>

                {/* Neutral Skills Tags */}
                {spotlightTeam.skills?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {spotlightTeam.skills.map((s) => (
                      <span key={s} className="tag-skill">
                        {s}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex lg:flex-col items-center lg:items-end justify-between lg:justify-center gap-3 pt-3 lg:pt-0 border-t lg:border-t-0 border-gs-border shrink-0">
              {/* Capacity Progress Bar */}
              <div className="w-36 space-y-1 text-right">
                <div className="flex justify-between text-[11px] text-gs-text-muted">
                  <span>Capacity</span>
                  <span className="font-medium text-gs-text-main">
                    {spotlightTeam.current_members || 1}/{spotlightTeam.max_members || 4} members
                  </span>
                </div>
                <div className="w-full bg-white/[0.06] rounded-full h-1 overflow-hidden">
                  <div 
                    className="h-full bg-[#6D6AF6] rounded-full"
                    style={{ width: `${Math.min(100, ((spotlightTeam.current_members || 1) / (spotlightTeam.max_members || 4)) * 100)}%` }}
                  />
                </div>
              </div>

              <span className="text-xs font-medium text-[#6D6AF6] group-hover:underline flex items-center gap-1">
                View & Apply <ArrowRight size={13} />
              </span>
            </div>
          </div>
        </div>
      )}

      {/* â”€â”€ All Active Squads Grid â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      {!loading && !error && regularTeams.length > 0 && (
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gs-text-main">
              All active squads ({regularTeams.length})
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {regularTeams.map(team => {
              const currentMembers = team.current_members || 1;
              const maxMembers = team.max_members || 4;
              const spotsLeft = Math.max(0, maxMembers - currentMembers);
              const isFull = spotsLeft === 0;
              const capacityPct = Math.min(100, Math.round((currentMembers / maxMembers) * 100));
              const matchPct = getMatchPercentage(team);

              return (
                <div
                  key={team.id}
                  onClick={() => navigate(`/teams/${team.id}`)}
                  className="bg-gs-card border border-gs-border rounded-xl p-5 flex flex-col justify-between gap-4 hover:border-gs-border-hover transition-colors cursor-pointer group machined-edge"
                >
                  {/* Header info */}
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2.5">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-white/[0.04] border border-gs-border text-gs-text-muted">
                        {team.category || 'Squad'}
                      </span>
                      {/* Compatibility: small tinted pill */}
                      <span className="text-[10px] font-medium text-[#7E7BF8] bg-[#6D6AF6]/10 border border-[#6D6AF6]/20 px-2 py-0.5 rounded-full">
                        {matchPct}% match
                      </span>
                    </div>

                    <h3 className="font-semibold text-base text-gs-text-main group-hover:text-[#6D6AF6] transition-colors line-clamp-1">
                      {team.name}
                    </h3>
                    <p className="text-xs text-gs-text-muted mt-1 line-clamp-2 leading-relaxed">
                      {team.description || 'No description provided.'}
                    </p>
                  </div>

                  {/* Skills tags (neutral gray metadata) */}
                  {team.skills?.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {team.skills.slice(0, 3).map((skill) => (
                        <span key={skill} className="tag-skill">
                          {skill}
                        </span>
                      ))}
                      {team.skills.length > 3 && (
                        <span className="px-1.5 py-0.5 text-[10px] text-gs-text-muted bg-white/[0.02] border border-gs-border rounded-md">
                          +{team.skills.length - 3}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Capacity Progress Bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-[11px]">
                      <span className="text-gs-text-muted">
                        {currentMembers}/{maxMembers} members
                      </span>
                      {isFull ? (
                        <span className="text-amber-400 font-medium">Roster full</span>
                      ) : (
                        <span className="text-emerald-400 font-medium">
                          {spotsLeft} spot{spotsLeft > 1 ? 's' : ''} left
                        </span>
                      )}
                    </div>
                    <div className="w-full bg-white/[0.06] rounded-full h-1 overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-300 ${isFull ? 'bg-amber-400' : 'bg-[#6D6AF6]'}`}
                        style={{ width: `${capacityPct}%` }}
                      />
                    </div>
                  </div>

                  {/* Footer: ghost View & Apply button */}
                  <div className="pt-3 border-t border-gs-border flex items-center justify-between text-xs">
                    <span className="text-[11px] text-gs-text-muted">
                      {team.event || 'Campus Event'}
                    </span>
                    <span className="font-medium text-[#6D6AF6] group-hover:underline flex items-center gap-1">
                      View & Apply <ArrowRight size={12} />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

