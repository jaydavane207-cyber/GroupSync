import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Users2,
  UserPlus,
  Search,
  MessageSquare,
  Check,
  X,
  Sparkles,
  UserCheck,
  Shield,
  RefreshCw,
  Clock,
  AlertTriangle,
  UserMinus,
  ExternalLink
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import supabase from '../lib/supabase';
import { withRetry, ErrorCard } from '../lib/withRetry';

// ─── Skeleton for friend cards ─────────────────────────────────────────────────
function FriendSkeleton({ count = 4 }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-gs-card border border-gs-border rounded-3xl p-6 animate-pulse">
          <div className="flex items-start gap-4 mb-4">
            <div className="w-16 h-16 rounded-2xl bg-gs-bg shrink-0" />
            <div className="flex-1">
              <div className="h-5 bg-gs-bg rounded-lg mb-2 w-3/4" />
              <div className="h-3 bg-gs-bg rounded mb-1 w-1/2" />
              <div className="h-3 bg-gs-bg rounded w-1/3" />
            </div>
          </div>
          <div className="flex gap-2 mb-3">
            {[1, 2, 3].map(j => <div key={j} className="h-6 w-16 bg-gs-bg rounded-lg" />)}
          </div>
          <div className="h-10 bg-gs-bg rounded-xl mt-4" />
        </div>
      ))}
    </div>
  );
}

// ─── Helper: create a notification ────────────────────────────────────────────
async function createNotification(payload) {
  await withRetry(() => supabase.from('notifications').insert([payload]));
}

export default function FriendsPage() {
  const { user, students, showToast } = useAppContext();
  const navigate = useNavigate();
  const [tab, setTab] = useState('friends');
  const [searchTerm, setSearchTerm] = useState('');
  const [retry, setRetry] = useState(0);

  // Data
  const [friends, setFriends] = useState([]);
  const [requests, setRequests] = useState([]);
  const [suggestions, setSuggestions] = useState([]);

  // Loading / error per tab
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Per-card action states (key = friendship/profile id)
  const [actionStates, setActionStates] = useState({});
  const setActionState = (id, state) =>
    setActionStates(prev => ({ ...prev, [id]: state }));

  const channelRef = useRef(null);

  // ── Build friends + requests from friendships table ────────────────────────
  const fetchFriendsData = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    setError(null);

    // Fetch all my friendships
    const { data: rows, error: err } = await withRetry(() =>
      supabase
        .from('friendships')
        .select('*')
        .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`)
        .order('created_at', { ascending: false })
    );

    if (err) {
      setError(err.userMessage || 'Failed to load connections.');
      setLoading(false);
      return;
    }

    // IDs of accepted friends
    const acceptedRows = (rows || []).filter(r => r.status === 'accepted');
    const pendingIncoming = (rows || []).filter(
      r => r.status === 'pending' && r.addressee_id === user.id
    );

    // Get profile IDs for accepted friends
    const friendProfileIds = acceptedRows.map(r =>
      r.requester_id === user.id ? r.addressee_id : r.requester_id
    );

    // Fetch their profiles
    let friendProfiles = [];
    if (friendProfileIds.length > 0) {
      const { data: profiles } = await withRetry(() =>
        supabase
          .from('profiles')
          .select('id, name, avatar, college, course, skills, faction, online')
          .in('id', friendProfileIds)
      );
      friendProfiles = profiles || [];
    }

    // Merge friendship row with profile data
    const enrichedFriends = acceptedRows.map(row => {
      const friendId = row.requester_id === user.id ? row.addressee_id : row.requester_id;
      const profile = friendProfiles.find(p => p.id === friendId) || {};
      return {
        friendshipId: row.id,
        id: friendId,
        name: profile.name || 'Unknown Student',
        avatar: profile.avatar || '🎓',
        college: profile.college || 'Campus University',
        course: profile.course || 'Student',
        skills: profile.skills || [],
        faction: profile.faction,
        status: profile.online ? 'online' : 'offline',
      };
    });

    // Build pending incoming requests
    const requesterIds = pendingIncoming.map(r => r.requester_id);
    let requesterProfiles = [];
    if (requesterIds.length > 0) {
      const { data: rp } = await withRetry(() =>
        supabase.from('profiles')
          .select('id, name, avatar, college, course, skills')
          .in('id', requesterIds)
      );
      requesterProfiles = rp || [];
    }

    const enrichedRequests = pendingIncoming.map(row => {
      const profile = requesterProfiles.find(p => p.id === row.requester_id) || {};
      return {
        friendshipId: row.id,
        id: row.requester_id,
        name: profile.name || 'Unknown Student',
        avatar: profile.avatar || '🎓',
        college: profile.college || 'Campus University',
        course: profile.course || 'Student',
        skills: profile.skills || [],
        message: row.message || '',
        createdAt: row.created_at,
      };
    });

    setFriends(enrichedFriends);
    setRequests(enrichedRequests);

    // ── Build suggestions ──────────────────────────────────────────────────
    // All profiles excluding self and existing friends/pending
    const existingIds = new Set([
      user.id,
      ...enrichedFriends.map(f => f.id),
      ...enrichedRequests.map(r => r.id),
      // also exclude people I've sent requests to
      ...(rows || [])
        .filter(r => r.requester_id === user.id && r.status === 'pending')
        .map(r => r.addressee_id),
    ]);

    const userSkills = new Set(user.skills || []);

    // Use students from context (already fetched), or fetch fresh
    let allProfiles = students?.length > 0 ? students : [];
    if (allProfiles.length === 0) {
      const { data: all } = await withRetry(() =>
        supabase.from('profiles').select('id, name, avatar, college, course, skills, faction, online').limit(50)
      );
      allProfiles = all || [];
    }

    const suggestionList = allProfiles
      .filter(p => !existingIds.has(p.id))
      .map(p => {
        const pSkills = new Set(p.skills || []);
        const overlap = [...userSkills].filter(s => pSkills.has(s));
        const score = overlap.length + (p.faction === user.faction ? 2 : 0);
        return { ...p, skillOverlap: overlap, score };
      })
      .filter(p => p.score > 0)          // only show people with something in common
      .sort((a, b) => b.score - a.score)
      .slice(0, 9);

    setSuggestions(suggestionList);
    setLoading(false);
  }, [user?.id, students, retry]);

  useEffect(() => {
    fetchFriendsData();
  }, [fetchFriendsData]);

  // ── Real-time friendship subscription ────────────────────────────────────
  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel(`friendships-${user.id}`)
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'friendships',
          filter: `addressee_id=eq.${user.id}` },
        () => { fetchFriendsData(); }
      )
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'friendships',
          filter: `requester_id=eq.${user.id}` },
        () => { fetchFriendsData(); }
      )
      .subscribe();

    channelRef.current = channel;
    return () => { supabase.removeChannel(channel); };
  }, [user?.id, fetchFriendsData]);

  // ── Accept a friend request ───────────────────────────────────────────────
  const handleAcceptRequest = async (req) => {
    setActionState(req.friendshipId, 'accepting');

    const { error: updateErr } = await withRetry(() =>
      supabase
        .from('friendships')
        .update({ status: 'accepted' })
        .eq('id', req.friendshipId)
    );

    if (updateErr) {
      showToast(updateErr.userMessage || 'Failed to accept request.', 'error');
      setActionState(req.friendshipId, null);
      return;
    }

    // Optimistic update
    setRequests(prev => prev.filter(r => r.friendshipId !== req.friendshipId));
    setFriends(prev => [{
      friendshipId: req.friendshipId,
      id: req.id,
      name: req.name,
      avatar: req.avatar,
      college: req.college,
      course: req.course,
      skills: req.skills,
      status: 'online',
    }, ...prev]);

    showToast(`You're now connected with ${req.name}! 🎉`, 'success');
    setActionState(req.friendshipId, null);

    // Notify the requester
    createNotification({
      user_id: req.id,
      type: 'friends',
      title: 'Connection Accepted!',
      message: `${user.name || 'A student'} accepted your connection request. Start collaborating!`,
      icon: '🤝',
      action_label: 'View Friends',
      action_path: '/friends',
    });
  };

  // ── Decline a friend request ──────────────────────────────────────────────
  const handleDeclineRequest = async (req) => {
    setActionState(req.friendshipId, 'declining');

    const { error: updateErr } = await withRetry(() =>
      supabase
        .from('friendships')
        .update({ status: 'declined' })
        .eq('id', req.friendshipId)
    );

    if (updateErr) {
      showToast(updateErr.userMessage || 'Failed to decline request.', 'error');
      setActionState(req.friendshipId, null);
      return;
    }

    setRequests(prev => prev.filter(r => r.friendshipId !== req.friendshipId));
    showToast('Connection request declined.', 'info');
    setActionState(req.friendshipId, null);
  };

  // ── Send a friend request ──────────────────────────────────────────────────
  const handleAddFriend = async (sugg) => {
    if (!user?.id) { showToast('Please log in first.', 'error'); return; }
    setActionState(sugg.id, 'sending');

    const { error: insertErr } = await withRetry(() =>
      supabase.from('friendships').insert([{
        requester_id: user.id,
        addressee_id: sugg.id,
        status: 'pending',
      }])
    );

    if (insertErr) {
      if (insertErr.code === '23505') {
        showToast('You already sent this person a request.', 'info');
      } else {
        showToast(insertErr.userMessage || 'Failed to send request.', 'error');
      }
      setActionState(sugg.id, null);
      return;
    }

    // Remove from suggestions immediately
    setSuggestions(prev => prev.filter(s => s.id !== sugg.id));
    showToast(`Connection request sent to ${sugg.name}!`, 'success');
    setActionState(sugg.id, null);

    // Notify the addressee
    createNotification({
      user_id: sugg.id,
      type: 'friends',
      title: 'New Connection Request',
      message: `${user.name || 'A student'} sent you a connection request. Check them out!`,
      icon: '👋',
      action_label: 'View Requests',
      action_path: '/friends',
    });
  };

  // ── Remove a friend ───────────────────────────────────────────────────────
  const handleRemoveFriend = async (friend) => {
    setActionState(friend.friendshipId, 'removing');

    const { error: deleteErr } = await withRetry(() =>
      supabase.from('friendships').delete().eq('id', friend.friendshipId)
    );

    if (deleteErr) {
      showToast(deleteErr.userMessage || 'Failed to remove connection.', 'error');
      setActionState(friend.friendshipId, null);
      return;
    }

    setFriends(prev => prev.filter(f => f.friendshipId !== friend.friendshipId));
    showToast(`Removed ${friend.name} from connections.`, 'info');
    setActionState(friend.friendshipId, null);
  };

  // ── Filter friends by search ──────────────────────────────────────────────
  const filteredFriends = friends.filter(f => {
    const term = searchTerm.toLowerCase();
    return (
      !term ||
      f.name.toLowerCase().includes(term) ||
      f.skills?.some(s => s.toLowerCase().includes(term)) ||
      f.college?.toLowerCase().includes(term)
    );
  });

  // ── Time formatter ────────────────────────────────────────────────────────
  const timeAgo = (dateStr) => {
    if (!dateStr) return '';
    const seconds = Math.floor((Date.now() - new Date(dateStr)) / 1000);
    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  return (
    <div className="space-y-8 animate-[slideIn_0.3s_ease-out]">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative z-10">
        <div>
          <h1 className="text-4xl lg:text-5xl font-black font-heading text-gs-text-main tracking-tight drop-shadow-sm flex items-center gap-3">
            <Users2 className="text-gs-cyan w-10 h-10" /> Friends & Connections
          </h1>
          <p className="text-gs-text-muted mt-2 text-lg font-medium">
            Build your high-trust peer network, accept team invites, and discover skilled collaborators.
          </p>
        </div>
        <button
          onClick={() => setRetry(r => r + 1)}
          title="Refresh"
          className="p-2.5 bg-gs-card border border-gs-border rounded-xl text-gs-text-muted hover:text-gs-cyan hover:border-gs-primary transition-all"
        >
          <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-3 bg-gs-card border border-gs-border p-2 rounded-2xl relative z-10 w-fit backdrop-blur-xl shadow-lg">
        {[
          { id: 'friends', label: `My Friends (${friends.length})`, icon: Users2 },
          { id: 'requests', label: 'Requests', icon: UserPlus, badge: requests.length },
          { id: 'suggestions', label: `Recommended (${suggestions.length})`, icon: Sparkles },
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${
              tab === t.id
                ? 'bg-gs-primary text-[#050810] shadow-[0_0_15px_rgba(0,240,255,0.4)]'
                : 'text-gs-text-muted hover:text-gs-text-main hover:bg-gs-bg'
            }`}>
            <t.icon size={16} /> {t.label}
            {t.badge > 0 && (
              <span className="w-5 h-5 rounded-full bg-rose-500 text-white text-[11px] font-black flex items-center justify-center">
                {t.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Error State */}
      {!loading && error && (
        <ErrorCard message={error} onRetry={() => setRetry(r => r + 1)} />
      )}

      {/* ── Tab: Friends ─────────────────────────────────────────────────── */}
      {tab === 'friends' && !error && (
        <div className="space-y-6 relative z-10">
          <div className="flex items-center gap-3 bg-gs-card border border-gs-border rounded-2xl px-4 py-3 focus-within:border-gs-primary transition-colors">
            <Search className="text-gs-text-muted shrink-0" size={20} />
            <input type="text" placeholder="Search friends by name, skill, or university..."
              value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-transparent border-none outline-none text-gs-text-main placeholder-gs-text-muted text-base" />
            {searchTerm && (
              <button onClick={() => setSearchTerm('')} className="text-gs-text-muted hover:text-gs-text-main">
                <X size={18} />
              </button>
            )}
          </div>

          {loading ? <FriendSkeleton count={4} /> : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredFriends.map(friend => (
                  <div key={friend.id}
                    className="bg-gs-card border border-gs-border rounded-3xl p-6 shadow-xl hover:border-gs-primary/50 transition-all duration-300 flex flex-col justify-between group">
                    <div>
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-4">
                          <div className="relative">
                            <div className="w-16 h-16 rounded-2xl bg-gs-bg border border-gs-border flex items-center justify-center text-3xl shadow-inner">
                              {friend.avatar}
                            </div>
                            <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-gs-card ${
                              friend.status === 'online'
                                ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]'
                                : 'bg-slate-500'
                            }`} />
                          </div>
                          <div>
                            <h3 className="font-bold text-lg text-gs-text-main hover:text-gs-primary transition-colors">
                              {friend.name}
                            </h3>
                            <p className="text-xs text-gs-text-muted">{friend.course} · {friend.college}</p>
                            <p className="text-[11px] font-semibold text-gs-cyan mt-0.5">
                              {friend.status === 'online' ? '🟢 Active now' : '⚪ Last seen recently'}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="mb-4">
                        <p className="text-[11px] font-bold uppercase tracking-wider text-gs-text-muted mb-2">Verified Skills</p>
                        <div className="flex flex-wrap gap-1.5">
                          {(friend.skills || []).slice(0, 5).map(s => (
                            <span key={s} className="px-2.5 py-1 bg-gs-bg border border-gs-border text-gs-text-main text-xs rounded-lg font-medium">
                              {s}
                            </span>
                          ))}
                          {(friend.skills || []).length > 5 && (
                            <span className="px-2.5 py-1 bg-gs-bg border border-gs-border text-gs-text-muted text-xs rounded-lg">
                              +{friend.skills.length - 5} more
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <button onClick={() => navigate('/chat')}
                        className="flex-1 py-2.5 bg-gs-primary text-[#050810] rounded-xl font-bold text-sm hover:bg-cyan-400 transition-all flex items-center justify-center gap-2 shadow-[0_0_10px_rgba(0,240,255,0.3)]">
                        <MessageSquare size={16} /> Message
                      </button>
                      <button
                        onClick={() => handleRemoveFriend(friend)}
                        disabled={actionStates[friend.friendshipId] === 'removing'}
                        title="Remove connection"
                        className="px-3 py-2.5 border border-gs-border rounded-xl text-gs-text-muted hover:text-rose-400 hover:border-rose-500/30 transition-colors text-sm opacity-0 group-hover:opacity-100">
                        <UserMinus size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {filteredFriends.length === 0 && (
                <div className="text-center py-16 bg-gs-card border border-gs-border rounded-3xl p-8">
                  <Users2 size={48} className="mx-auto text-gs-text-muted opacity-40 mb-3" />
                  <p className="text-lg font-bold text-gs-text-main">
                    {friends.length === 0 ? 'No connections yet' : 'No friends match your search'}
                  </p>
                  <p className="text-sm text-gs-text-muted mt-1">
                    {friends.length === 0
                      ? 'Switch to the Recommended tab to discover skilled peers!'
                      : 'Try a different search term'}
                  </p>
                  {friends.length === 0 && (
                    <button onClick={() => setTab('suggestions')}
                      className="mt-4 px-5 py-2.5 bg-gs-primary text-[#050810] font-bold rounded-xl text-sm hover:bg-cyan-400 transition-all">
                      Discover People
                    </button>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* ── Tab: Requests ───────────────────────────────────────────────── */}
      {tab === 'requests' && !error && (
        <div className="space-y-4 relative z-10">
          {loading ? (
            <div className="space-y-4">
              {[1, 2].map(i => (
                <div key={i} className="bg-gs-card border border-gs-border rounded-3xl p-6 animate-pulse flex gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-gs-bg shrink-0" />
                  <div className="flex-1">
                    <div className="h-5 bg-gs-bg rounded w-1/3 mb-2" />
                    <div className="h-3 bg-gs-bg rounded w-1/2 mb-2" />
                    <div className="h-3 bg-gs-bg rounded w-3/4" />
                  </div>
                </div>
              ))}
            </div>
          ) : requests.length === 0 ? (
            <div className="text-center py-16 bg-gs-card border border-gs-border rounded-3xl p-8">
              <UserCheck size={48} className="mx-auto text-gs-text-muted opacity-40 mb-3" />
              <p className="text-lg font-bold text-gs-text-main">No pending connection requests</p>
              <p className="text-sm text-gs-text-muted mt-1">You're all caught up on new connection invites!</p>
            </div>
          ) : (
            requests.map(req => (
              <div key={req.friendshipId}
                className="bg-gs-card border border-gs-border rounded-3xl p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-start gap-4 flex-1">
                  <div className="w-16 h-16 rounded-2xl bg-gs-bg border border-gs-border flex items-center justify-center text-3xl shrink-0 shadow-inner">
                    {req.avatar}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-lg text-gs-text-main">{req.name}</h3>
                      <span className="text-xs text-gs-text-muted flex items-center gap-1">
                        <Clock size={11} /> {timeAgo(req.createdAt)}
                      </span>
                    </div>
                    <p className="text-xs text-gs-text-muted">{req.course} · {req.college}</p>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {(req.skills || []).slice(0, 4).map(s => (
                        <span key={s} className="px-2 py-0.5 bg-gs-bg border border-gs-border text-gs-text-main text-[11px] rounded font-medium">
                          {s}
                        </span>
                      ))}
                    </div>
                    {req.message && (
                      <p className="text-sm text-gs-text-muted italic bg-gs-bg/60 border border-gs-border/50 rounded-xl p-3 mt-3">
                        "{req.message}"
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                  <button
                    onClick={() => handleAcceptRequest(req)}
                    disabled={!!actionStates[req.friendshipId]}
                    className="flex-1 md:flex-none px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-[#050810] font-bold rounded-xl text-sm transition-all flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(52,211,153,0.3)] disabled:opacity-60">
                    {actionStates[req.friendshipId] === 'accepting'
                      ? <RefreshCw size={16} className="animate-spin" />
                      : <Check size={16} />}
                    Accept
                  </button>
                  <button
                    onClick={() => handleDeclineRequest(req)}
                    disabled={!!actionStates[req.friendshipId]}
                    className="flex-1 md:flex-none px-4 py-2.5 border border-rose-500/30 text-rose-400 hover:bg-rose-500/10 font-semibold rounded-xl text-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-60">
                    {actionStates[req.friendshipId] === 'declining'
                      ? <RefreshCw size={16} className="animate-spin" />
                      : <X size={16} />}
                    Decline
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* ── Tab: Suggestions ────────────────────────────────────────────── */}
      {tab === 'suggestions' && !error && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-gs-card border border-gs-border rounded-3xl p-6 animate-pulse text-center">
                <div className="w-20 h-20 rounded-3xl bg-gs-bg mx-auto mb-4" />
                <div className="h-5 bg-gs-bg rounded w-3/4 mx-auto mb-2" />
                <div className="h-3 bg-gs-bg rounded w-1/2 mx-auto mb-4" />
                <div className="h-10 bg-gs-bg rounded-xl" />
              </div>
            ))
          ) : suggestions.length === 0 ? (
            <div className="col-span-3 text-center py-16 bg-gs-card border border-gs-border rounded-3xl p-8">
              <Sparkles size={48} className="mx-auto text-gs-text-muted opacity-40 mb-3" />
              <p className="text-lg font-bold text-gs-text-main">No more suggestions right now</p>
              <p className="text-sm text-gs-text-muted mt-1">
                As you add skills and more students join, new suggestions will appear here.
              </p>
            </div>
          ) : (
            suggestions.map(sugg => (
              <div key={sugg.id}
                className="bg-gs-card border border-gs-border rounded-3xl p-6 shadow-xl flex flex-col justify-between text-center group hover:border-gs-primary/50 transition-all duration-300">
                <div>
                  <div className="w-20 h-20 rounded-3xl bg-gs-bg border border-gs-border flex items-center justify-center text-4xl mx-auto mb-4 shadow-inner group-hover:scale-105 transition-transform">
                    {sugg.avatar || '🎓'}
                  </div>
                  <h3 className="font-bold text-lg text-gs-text-main">{sugg.name}</h3>
                  <p className="text-xs text-gs-text-muted">{sugg.course}</p>
                  <p className="text-xs text-gs-cyan font-medium mt-1">{sugg.college}</p>

                  {sugg.skillOverlap?.length > 0 && (
                    <p className="text-[11px] text-amber-300 bg-amber-500/10 border border-amber-500/20 rounded-lg py-1 px-2 mt-3 font-semibold">
                      💡 {sugg.skillOverlap.length} shared skill{sugg.skillOverlap.length > 1 ? 's' : ''}
                      {sugg.faction === user?.faction ? ' · Same faction' : ''}
                    </p>
                  )}

                  <div className="flex flex-wrap gap-1.5 justify-center mt-4">
                    {(sugg.skills || []).slice(0, 4).map(s => (
                      <span key={s}
                        className={`px-2.5 py-0.5 text-[11px] rounded-lg font-medium border ${
                          sugg.skillOverlap?.includes(s)
                            ? 'bg-gs-primary/10 border-gs-primary/30 text-gs-primary'
                            : 'bg-gs-bg border-gs-border text-gs-text-main'
                        }`}>
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => handleAddFriend(sugg)}
                  disabled={!!actionStates[sugg.id]}
                  className="mt-6 w-full py-2.5 bg-gs-primary text-[#050810] font-bold rounded-xl text-sm hover:bg-cyan-400 transition-all flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(0,240,255,0.3)] disabled:opacity-60">
                  {actionStates[sugg.id] === 'sending'
                    ? <><RefreshCw size={16} className="animate-spin" /> Sending...</>
                    : <><UserPlus size={16} /> Connect & Invite</>}
                </button>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
