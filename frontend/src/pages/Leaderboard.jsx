'use client'
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Trophy, Users, Search } from 'lucide-react';
import { useAppContext } from '@/context/AppContext';
import supabase from '@/lib/supabase';

export const XP_VALUES = {
  '1st': 500,
  '2nd': 300,
  '3rd': 150,
  'participant': 50,
};

function useCountUp(target, duration = 600) {
  const [value, setValue] = useState(target);
  const animRef = useRef(null);
  const prevRef = useRef(target);

  useEffect(() => {
    if (prevRef.current === target) return;
    const start = prevRef.current;
    const startTime = performance.now();
    prevRef.current = target;
    const ease = (t) => 1 - Math.pow(1 - t, 3);
    const tick = (now) => {
      const p = Math.min((now - startTime) / duration, 1);
      setValue(Math.round(start + (target - start) * ease(p)));
      if (p < 1) animRef.current = requestAnimationFrame(tick);
    };
    if (animRef.current) cancelAnimationFrame(animRef.current);
    animRef.current = requestAnimationFrame(tick);
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, [target, duration]);

  return value;
}

function FactionCard({ faction, idx, maxXP }) {
  const { name, icon: FactionIcon, totalXP, topUsers } = faction;
  const animatedXP = useCountUp(totalXP, 600);
  const progressPct = maxXP > 0 ? (animatedXP / maxXP) * 100 : 0;

  return (
    <div className="bg-gs-card border border-gs-border rounded-xl p-5 shadow-sm hover:border-[#6D6AF6]/30 transition-colors flex flex-col justify-between">
      <div>
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#6D6AF6]/10 border border-[#6D6AF6]/20 flex items-center justify-center text-[#6D6AF6] shrink-0">
              <FactionIcon size={18} />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gs-text-main leading-tight">{name}</h3>
              <span className="text-[11px] text-gs-text-muted">Rank #{idx + 1}</span>
            </div>
          </div>

          <div className="text-right shrink-0">
            <div className="text-lg font-semibold tabular-nums text-gs-text-main">
              {animatedXP.toLocaleString()}
            </div>
            <div className="text-[10px] text-gs-text-muted">Total XP</div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-white/[0.04] h-1.5 rounded-full mb-4 overflow-hidden border border-gs-border/40">
          <div
            className="h-full rounded-full bg-[#6D6AF6] transition-all duration-500"
            style={{ width: `${progressPct}%` }}
          />
        </div>

        {/* Top contributors */}
        <div>
          <h4 className="text-[11px] font-medium text-gs-text-muted mb-2">Top contributors</h4>
          <div className="space-y-1.5">
            {topUsers.length === 0 ? (
              <p className="text-xs text-gs-text-muted py-2 text-center">No XP recorded yet this season.</p>
            ) : topUsers.map((u, i) => {
              const rankColor = i === 0 ? 'text-amber-400' : i === 1 ? 'text-zinc-400' : 'text-amber-600';
              return (
                <div key={u.id || i} className="flex items-center gap-2.5 p-2 rounded-lg bg-white/[0.02] border border-gs-border/60">
                  <span className={`text-xs font-semibold w-5 text-center ${rankColor}`}>#{i + 1}</span>
                  <div className="w-6 h-6 rounded-md bg-white/[0.04] border border-gs-border flex items-center justify-center text-xs shrink-0">
                    {u.avatar || 'ðŸ‘¤'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-xs text-gs-text-main truncate">{u.name || 'Anonymous Student'}</p>
                    <p className="text-[10px] text-gs-text-muted truncate">
                      {u.college || 'Department'}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="font-semibold text-xs tabular-nums text-gs-text-main">{(u.xp || 0).toLocaleString()}</span>
                    <span className="text-[10px] text-gs-text-muted ml-1">XP</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function LiveTicker({ events }) {
  const [activeIdx, setActiveIdx] = useState(0);

  useEffect(() => {
    if (events.length <= 1) return;
    const interval = setInterval(() => {
      setActiveIdx(prev => (prev + 1) % events.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [events.length]);

  const current = events[activeIdx] ?? events[0];
  if (!current) return null;

  return (
    <div className="flex items-center gap-3 rounded-lg border border-gs-border bg-gs-card px-3 py-2 text-xs">
      <div className="flex items-center gap-1.5 text-[#6D6AF6] font-medium shrink-0 pr-3 border-r border-gs-border">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
        <span className="text-[11px]">Activity</span>
      </div>
      <div className="flex-1 text-gs-text-main truncate">
        {current.message}
      </div>
      <span className="text-[10px] text-gs-text-muted shrink-0">
        {current.created_at ? new Date(current.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}
      </span>
    </div>
  );
}

function ConnectionBadge({ status }) {
  const isLive = status === 'SUBSCRIBED';
  return (
    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-gs-border bg-white/[0.02] text-xs text-gs-text-muted">
      <span className={`w-1.5 h-1.5 rounded-full ${isLive ? 'bg-emerald-400' : 'bg-amber-400'}`} />
      <span>{isLive ? 'Live' : 'Connecting'}</span>
    </div>
  );
}

export default function Leaderboard() {
  const { user, factions } = useAppContext();

  const [viewMode, setViewMode] = useState('factions'); // 'factions' | 'individual'
  const [individualProfiles, setIndividualProfiles] = useState([]);
  const [searchStudent, setSearchStudent] = useState('');
  const [factionFilter, setFactionFilter] = useState('all');
  const [timeframe, setTimeframe] = useState('all_time');

  const [factionScores, setFactionScores] = useState([]);
  const [realtimeStatus, setRealtimeStatus] = useState('CONNECTING');
  const [tickerEvents, setTickerEvents] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);

  const fetchLeaderboard = useCallback(async () => {
    setDataLoading(true);
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select(`
        id, name, avatar, avatar_url, faction, xp, credibility_score, college, branch,
        badges:skill_badges(id, badge_name, badge_tier)
      `)
      .order('xp', { ascending: false });

    if (error) { console.error('Leaderboard fetch error:', error); setDataLoading(false); return; }

    setIndividualProfiles(profiles || []);

    const grouped = {};
    Object.keys(factions).forEach(fKey => { grouped[fKey] = []; });

    (profiles || []).forEach(p => {
      if (p.faction && grouped[p.faction]) {
        grouped[p.faction].push(p);
      }
    });

    const scores = Object.keys(factions).map(fKey => {
      const members = grouped[fKey];
      const totalXP = members.reduce((sum, m) => sum + (m.xp || 0), 0);
      const topUsers = members.slice(0, 3);
      return { key: fKey, ...factions[fKey], totalXP, topUsers };
    }).sort((a, b) => b.totalXP - a.totalXP);

    setFactionScores(scores);
    setDataLoading(false);
  }, [factions]);

  const fetchActivity = useCallback(async () => {
    const { data, error } = await supabase
      .from('activity_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);
    if (!error && data) setTickerEvents(data);
  }, []);

  useEffect(() => {
    fetchLeaderboard();
    fetchActivity();
  }, [fetchLeaderboard, fetchActivity]);

  const maxXP = Math.max(...factionScores.map(f => f.totalXP), 1);

  useEffect(() => {
    setRealtimeStatus('CONNECTING');

    const channel = supabase
      .channel('leaderboard-xp-realtime')
      .on('postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'profiles' },
        (payload) => {
          const updated = payload.new;
          setFactionScores(prev =>
            prev.map(faction => {
              if (faction.key !== updated.faction) return faction;
              const newTopUsers = faction.topUsers.map(u =>
                u.id === updated.id ? { ...u, xp: updated.xp } : u
              );
              const isTracked = newTopUsers.some(u => u.id === updated.id);
              const allMembers = isTracked ? newTopUsers : [...newTopUsers, updated];
              const sorted = allMembers.sort((a, b) => (b.xp || 0) - (a.xp || 0));
              const top3 = sorted.slice(0, 3);
              const newTotalXP = faction.totalXP + ((updated.xp || 0) - (payload.old?.xp || 0));
              return { ...faction, topUsers: top3, totalXP: Math.max(newTotalXP, 0) };
            }).sort((a, b) => b.totalXP - a.totalXP)
          );
        }
      )
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'activity_logs' },
        (payload) => {
          setTickerEvents(prev => [payload.new, ...prev.slice(0, 9)]);
        }
      )
      .subscribe((status) => {
        setRealtimeStatus(status);
      });

    return () => { supabase.removeChannel(channel); };
  }, []);

  const filteredIndividuals = individualProfiles.filter(p => {
    const matchesSearch = !searchStudent || p.name?.toLowerCase().includes(searchStudent.toLowerCase());
    const matchesFaction = factionFilter === 'all' || p.faction === factionFilter;
    return matchesSearch && matchesFaction;
  });

  const myRank = user?.id ? (individualProfiles.findIndex(p => p.id === user.id) + 1) : null;
  const myProfileData = user?.id ? individualProfiles.find(p => p.id === user.id) : null;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-gs-border">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-gs-text-main flex items-center gap-3">
            Campus leaderboard
          </h1>
          <p className="text-sm text-gs-text-muted mt-0.5">
            Top contributors and project collaborators this semester.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <ConnectionBadge status={realtimeStatus} />
          <div className="px-2.5 py-1 rounded-lg border border-gs-border bg-black/5 dark:bg-white/[0.02] text-xs text-gs-text-muted">
            Season ends in 14 days
          </div>
        </div>
      </div>

      {/* Live Activity Wire */}
      {tickerEvents.length > 0 && <LiveTicker events={tickerEvents} />}

      {/* View Mode Switcher */}
      <div className="flex items-center justify-between flex-wrap gap-3 border-b border-gs-border pb-2.5">
        <div className="flex gap-1.5">
          <button
            onClick={() => setViewMode('factions')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 border ${
              viewMode === 'factions'
                ? 'bg-[#6D6AF6]/10 text-[#6D6AF6] border-[#6D6AF6]/30'
                : 'bg-white/[0.02] border-gs-border text-gs-text-muted hover:text-gs-text-main'
            }`}
          >
            <Trophy size={13} /> House standings
          </button>
          <button
            onClick={() => setViewMode('individual')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 border ${
              viewMode === 'individual'
                ? 'bg-[#6D6AF6]/10 text-[#6D6AF6] border-[#6D6AF6]/30'
                : 'bg-white/[0.02] border-gs-border text-gs-text-muted hover:text-gs-text-main'
            }`}
          >
            <Users size={13} /> Individual rankings
          </button>
        </div>

        {viewMode === 'individual' && (
          <div className="flex gap-1 p-0.5 rounded-lg border border-gs-border bg-white/[0.02] text-xs">
            {[
              { id: 'all_time', label: 'All time' },
              { id: 'month', label: 'This month' },
              { id: 'week', label: 'This week' }
            ].map(t => (
              <button
                key={t.id}
                onClick={() => setTimeframe(t.id)}
                className={`px-2 py-0.5 rounded text-xs transition-colors ${
                  timeframe === t.id ? 'bg-gs-elevated text-gs-text-main font-medium border border-gs-border' : 'text-gs-text-muted hover:text-gs-text-main'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* View 1: FACTION / HOUSE CARDS */}
      {viewMode === 'factions' && (
        dataLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-56 rounded-xl bg-gs-card border border-gs-border animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {factionScores.map((f, idx) => (
              <FactionCard key={f.key} faction={f} idx={idx} maxXP={maxXP} />
            ))}
          </div>
        )
      )}

      {/* View 2: INDIVIDUAL RANKINGS */}
      {viewMode === 'individual' && (
        <div className="space-y-4">
          {/* My Standing Banner */}
          {user && (
            <div className="p-4 rounded-xl bg-gs-card border border-gs-border shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-[#6D6AF6]/10 border border-[#6D6AF6]/20 flex items-center justify-center text-xs font-semibold text-[#6D6AF6] shrink-0">
                  {myRank ? `#${myRank}` : 'â€”'}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-xs text-gs-text-main">{user.name}</h3>
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-[#6D6AF6]/10 text-[#6D6AF6] border border-[#6D6AF6]/20">
                      Your rank
                    </span>
                  </div>
                  <p className="text-[11px] text-gs-text-muted mt-0.5">
                    {factions[user.faction]?.name || 'Scholar'} Â· {myProfileData?.badges?.length || 0} badges
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-5">
                <div className="text-right">
                  <div className="text-sm font-semibold tabular-nums text-gs-text-main">{myProfileData?.xp || user.xp || 0} XP</div>
                  <div className="text-[10px] text-gs-text-muted">Total score</div>
                </div>
                <div className="text-right border-l border-gs-border pl-5">
                  <div className="text-sm font-semibold tabular-nums text-emerald-400">{myProfileData?.credibility_score || 75}%</div>
                  <div className="text-[10px] text-gs-text-muted">Credibility</div>
                </div>
              </div>
            </div>
          )}

          {/* Top 3 Podium Cards */}
          {!searchStudent && factionFilter === 'all' && filteredIndividuals.length >= 3 && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {filteredIndividuals.slice(0, 3).map((topUser, i) => {
                const borderColors = [
                  'border-amber-500/30 hover:border-amber-500/50',
                  'border-zinc-400/30 hover:border-zinc-400/50',
                  'border-amber-700/30 hover:border-amber-700/50',
                ];
                const badgeTints = [
                  'bg-amber-400/10 text-amber-400 border-amber-400/20',
                  'bg-zinc-400/10 text-zinc-300 border-zinc-400/20',
                  'bg-amber-600/10 text-amber-500 border-amber-600/20',
                ];
                const f = factions[topUser.faction] || {};

                return (
                  <div
                    key={topUser.id}
                    className={`bg-gs-card border ${borderColors[i]} rounded-xl p-4 transition-colors relative flex flex-col justify-between`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <span className={`px-2 py-0.5 rounded-md text-[11px] font-semibold border ${badgeTints[i]}`}>
                        #{i + 1}
                      </span>
                      <span className="text-[10px] text-gs-text-muted border border-gs-border/60 bg-white/[0.02] px-2 py-0.5 rounded">
                        {f.name || 'Scholar'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2.5 mb-3">
                      <div className="w-8 h-8 rounded-lg bg-white/[0.04] border border-gs-border flex items-center justify-center text-xs shrink-0">
                        {topUser.avatar || 'ðŸŽ“'}
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-xs font-semibold text-gs-text-main truncate">{topUser.name}</h4>
                        <p className="text-[10px] text-gs-text-muted truncate">{topUser.college || 'Student'}</p>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-gs-border/60 flex items-center justify-between text-xs">
                      <div>
                        <span className="text-xs font-semibold tabular-nums text-gs-text-main">{(topUser.xp || 0).toLocaleString()}</span>
                        <span className="text-[10px] text-gs-text-muted ml-1">XP</span>
                      </div>
                      <div className="text-[11px] font-medium text-emerald-400">
                        {topUser.credibility_score || 75}% cred
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Search & Filter */}
          <div className="flex flex-col sm:flex-row gap-2.5">
            <div className="relative flex-1">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gs-text-muted" />
              <input
                type="text"
                placeholder="Search scholars by name..."
                value={searchStudent}
                onChange={e => setSearchStudent(e.target.value)}
                className="w-full bg-gs-card border border-gs-border rounded-lg pl-8 pr-3 py-1.5 text-xs text-gs-text-main placeholder-gs-text-muted outline-none focus:border-[#6D6AF6] transition-colors"
              />
            </div>

            <div className="w-full sm:w-48">
              <select
                value={factionFilter}
                onChange={e => setFactionFilter(e.target.value)}
                className="w-full bg-gs-card border border-gs-border rounded-lg px-2.5 py-1.5 text-xs text-gs-text-main outline-none focus:border-[#6D6AF6] transition-colors"
              >
                <option value="all">All houses</option>
                {Object.entries(factions).map(([k, f]) => (
                  <option key={k} value={k}>{f.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="bg-gs-card border border-gs-border rounded-xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-gs-border text-[11px] font-medium text-gs-text-muted bg-white/[0.02]">
                    <th className="p-3 px-4">Rank</th>
                    <th className="p-3 px-4">Student</th>
                    <th className="p-3 px-4">House</th>
                    <th className="p-3 px-4">Badges</th>
                    <th className="p-3 px-4">Credibility</th>
                    <th className="p-3 px-4 text-right">Total XP</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gs-border/60">
                  {filteredIndividuals.map((student, idx) => {
                    const rankNum = idx + 1;
                    const isTop1 = rankNum === 1;
                    const isTop2 = rankNum === 2;
                    const isTop3 = rankNum === 3;
                    const isMe = user?.id === student.id;
                    const f = factions[student.faction] || {};
                    const badges = student.badges || [];

                    return (
                      <tr
                        key={student.id}
                        className={`transition-colors ${isMe ? 'bg-[#6D6AF6]/5 font-medium' : 'hover:bg-white/[0.02]'}`}
                      >
                        {/* Rank */}
                        <td className="p-3 px-4 whitespace-nowrap">
                          <span className={`font-semibold tabular-nums ${isTop1 ? 'text-amber-400' : isTop2 ? 'text-zinc-300' : isTop3 ? 'text-amber-600' : 'text-gs-text-muted'}`}>
                            #{rankNum}
                          </span>
                        </td>

                        {/* Student */}
                        <td className="p-3 px-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-md bg-white/[0.04] border border-gs-border flex items-center justify-center text-xs shrink-0">
                              {student.avatar || 'ðŸŽ“'}
                            </div>
                            <div className="min-w-0">
                              <div className="font-medium text-gs-text-main flex items-center gap-1.5 truncate">
                                <span>{student.name}</span>
                                {isMe && (
                                  <span className="text-[9px] px-1 rounded bg-[#6D6AF6] text-white font-medium">
                                    You
                                  </span>
                                )}
                              </div>
                              <div className="text-[10px] text-gs-text-muted truncate">
                                {student.college || 'Student'}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Faction */}
                        <td className="p-3 px-4 whitespace-nowrap">
                          <span className="px-2 py-0.5 rounded text-[10px] font-medium border border-gs-border text-gs-text-muted bg-white/[0.02]">
                            {f.name || 'Scholar'}
                          </span>
                        </td>

                        {/* Badges */}
                        <td className="p-3 px-4">
                          <div className="flex items-center gap-1 flex-wrap">
                            {badges.length > 0 ? (
                              badges.slice(0, 3).map(b => (
                                <span
                                  key={b.id}
                                  className="px-1.5 py-0.5 rounded text-[10px] bg-white/[0.03] border border-gs-border/60 text-gs-text-muted"
                                >
                                  {b.badge_name}
                                </span>
                              ))
                            ) : (
                              <span className="text-gs-text-muted text-[11px]">â€”</span>
                            )}
                            {badges.length > 3 && (
                              <span className="text-[10px] text-gs-text-muted">+{badges.length - 3}</span>
                            )}
                          </div>
                        </td>

                        {/* Credibility */}
                        <td className="p-3 px-4 whitespace-nowrap">
                          <span className="font-medium tabular-nums text-emerald-400">
                            {student.credibility_score || 70}%
                          </span>
                        </td>

                        {/* Total XP */}
                        <td className="p-3 px-4 text-right whitespace-nowrap font-semibold tabular-nums text-gs-text-main">
                          {(student.xp || 0).toLocaleString()} <span className="text-[10px] text-gs-text-muted font-normal">XP</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

