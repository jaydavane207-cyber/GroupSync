import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Users2,
  UserPlus,
  Search,
  MessageSquare,
  Check,
  X,
  Compass,
  UserCheck,
  RefreshCw,
  Clock,
  UserMinus,
  AlertCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '@/context/AppContext';
import supabase from '@/lib/supabase';
import { withRetry, ErrorCard } from '@/lib/withRetry';
import storage from '@/lib/utils/localStorage';

function FriendSkeleton({ count = 4 }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="glass-card rounded-xl p-4 animate-pulse">
          <div className="flex items-start gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-black/10 dark:bg-white/10 shrink-0" />
            <div className="flex-1">
              <div className="h-3.5 bg-black/10 dark:bg-white/10 rounded w-1/2 mb-1.5" />
              <div className="h-3 bg-black/10 dark:bg-white/10 rounded w-1/3" />
            </div>
          </div>
          <div className="h-7 bg-black/10 dark:bg-white/10 rounded-lg mt-3" />
        </div>
      ))}
    </div>
  );
}

async function createNotification(payload) {
  try {
    await withRetry(() => supabase.from('notifications').insert([payload]));
  } catch (e) {
    // Non-blocking notification failure
  }
}

const isTableMissingError = (err) => {
  if (!err) return false;
  const msg = String(err.message || err.userMessage || '').toLowerCase();
  const code = String(err.code || '');
  return code === 'PGRST205' || msg.includes('schema cache') || (msg.includes('table') && msg.includes('friendships'));
};

const getLocalFriendships = (userId) => {
  return storage.get(`groupsync_friendships_${userId}`, []);
};

const saveLocalFriendships = (userId, list) => {
  storage.set(`groupsync_friendships_${userId}`, list);
};

export default function FriendsPage() {
  const { user, showToast } = useAppContext();
  const navigate = useNavigate();
  const [tab, setTab] = useState('friends');
  const [searchTerm, setSearchTerm] = useState('');
  const [retry, setRetry] = useState(0);

  const [friends, setFriends] = useState([]);
  const [requests, setRequests] = useState([]);
  const [suggestions, setSuggestions] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isOfflineMode, setIsOfflineMode] = useState(false);

  const [actionStates, setActionStates] = useState({});
  const setActionState = (id, state) =>
    setActionStates(prev => ({ ...prev, [id]: state }));

  const channelRef = useRef(null);

  const fetchFriendsData = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    setError(null);

    let rows = [];
    let usingLocal = false;

    try {
      const { data, error: err } = await withRetry(() =>
        supabase
          .from('friendships')
          .select('*')
          .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`)
          .order('created_at', { ascending: false })
      );

      if (err) {
        if (isTableMissingError(err)) {
          usingLocal = true;
          rows = getLocalFriendships(user.id);
        } else {
          setError(err.userMessage || 'Failed to load connections.');
          setLoading(false);
          return;
        }
      } else {
        rows = data || [];
      }
    } catch (catchedErr) {
      if (isTableMissingError(catchedErr)) {
        usingLocal = true;
        rows = getLocalFriendships(user.id);
      } else {
        setError(catchedErr.message || 'Failed to load connections.');
        setLoading(false);
        return;
      }
    }

    setIsOfflineMode(usingLocal);

    const acceptedRows = (rows || []).filter(r => r.status === 'accepted');
    const pendingIncoming = (rows || []).filter(
      r => r.status === 'pending' && r.addressee_id === user.id
    );

    const friendIds = acceptedRows.map(r =>
      r.requester_id === user.id ? r.addressee_id : r.requester_id
    );
    const requesterIds = pendingIncoming.map(r => r.requester_id);

    const allProfileIds = [...new Set([...friendIds, ...requesterIds])];

    let profileMap = {};
    if (allProfileIds.length > 0) {
      try {
        const { data: profiles } = await withRetry(() =>
          supabase.from('profiles').select('*').in('id', allProfileIds)
        );
        (profiles || []).forEach(p => { profileMap[p.id] = p; });
      } catch (e) {
        // Fallback to empty map
      }
    }

    const friendsList = acceptedRows.map(row => {
      const otherId = row.requester_id === user.id ? row.addressee_id : row.requester_id;
      const prof = profileMap[otherId] || {};
      return {
        id: otherId,
        friendshipId: row.id,
        name: prof.name || 'Campus Student',
        avatar: prof.avatar || '🎓',
        college: prof.college || 'Engineering',
        course: prof.branch || prof.course || 'Computer Science',
        skills: prof.skills || [],
        status: prof.online ? 'online' : 'offline',
        faction: prof.faction || 'innovators',
        since: row.created_at,
      };
    });

    const requestsList = pendingIncoming.map(row => {
      const prof = profileMap[row.requester_id] || {};
      return {
        id: prof.id || row.requester_id,
        requesterId: row.requester_id,
        friendshipId: row.id,
        name: prof.name || 'Campus Student',
        avatar: prof.avatar || '🎓',
        college: prof.college || 'Engineering',
        course: prof.branch || prof.course || 'Computer Science',
        skills: prof.skills || [],
        message: row.message || '',
        createdAt: row.created_at,
      };
    });

    setFriends(friendsList);
    setRequests(requestsList);

    // Suggestions: students not already friends
    const excludedIds = new Set([user.id, ...friendIds, ...requesterIds]);
    try {
      const { data: allProfiles } = await withRetry(() =>
        supabase.from('profiles').select('*').limit(20)
      );
      if (allProfiles) {
        const suggested = allProfiles
          .filter(p => !excludedIds.has(p.id))
          .map(p => ({
            id: p.id,
            name: p.name || 'Student',
            avatar: p.avatar || '🎓',
            college: p.college || 'Engineering',
            course: p.branch || p.course || 'Computer Science',
            skills: p.skills || [],
            skillOverlap: (p.skills || []).filter(s => (user?.skills || []).includes(s)),
          }));
        setSuggestions(suggested);
      }
    } catch (e) {
      setSuggestions([]);
    }

    setLoading(false);
  }, [user?.id, user?.skills, retry]);

  useEffect(() => {
    fetchFriendsData();
  }, [fetchFriendsData]);

  // Real-time subscription
  useEffect(() => {
    if (!user?.id || isOfflineMode) return;
    try {
      const channel = supabase
        .channel('friendships-realtime')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'friendships' }, () => {
          fetchFriendsData();
        })
        .subscribe();

      channelRef.current = channel;
      return () => {
        if (channel) supabase.removeChannel(channel);
      };
    } catch (e) {
      // Ignored if table not in publication
    }
  }, [user?.id, isOfflineMode, fetchFriendsData]);

  const handleAcceptRequest = async (req) => {
    setActionState(req.friendshipId, 'accepting');

    if (isOfflineMode || String(req.friendshipId).startsWith('local_')) {
      const localList = getLocalFriendships(user.id);
      const updated = localList.map(r =>
        r.id === req.friendshipId ? { ...r, status: 'accepted' } : r
      );
      saveLocalFriendships(user.id, updated);
      showToast(`Connected with ${req.name}`, 'success');
      fetchFriendsData();
      setActionState(req.friendshipId, null);
      return;
    }

    const { error: updateErr } = await withRetry(() =>
      supabase.from('friendships').update({ status: 'accepted' }).eq('id', req.friendshipId)
    );

    if (updateErr) {
      if (isTableMissingError(updateErr)) {
        setIsOfflineMode(true);
        const localList = getLocalFriendships(user.id);
        const updated = localList.map(r =>
          r.id === req.friendshipId ? { ...r, status: 'accepted' } : r
        );
        saveLocalFriendships(user.id, updated);
        showToast(`Connected with ${req.name}`, 'success');
        fetchFriendsData();
        setActionState(req.friendshipId, null);
        return;
      }
      showToast('Failed to accept request.', 'error');
      setActionState(req.friendshipId, null);
      return;
    }

    createNotification({
      user_id: req.requesterId,
      type: 'friends',
      title: 'Connection accepted',
      message: `${user.name || 'A student'} accepted your connection request!`,
      icon: '🤝',
      action_label: 'View friends',
      action_path: '/friends',
      reference_id: String(user.id),
    });

    showToast(`Connected with ${req.name}`, 'success');
    fetchFriendsData();
  };

  const handleDeclineRequest = async (req) => {
    setActionState(req.friendshipId, 'declining');

    if (isOfflineMode || String(req.friendshipId).startsWith('local_')) {
      const localList = getLocalFriendships(user.id);
      const updated = localList.filter(r => r.id !== req.friendshipId);
      saveLocalFriendships(user.id, updated);
      showToast('Connection request declined.', 'info');
      setRequests(prev => prev.filter(r => r.friendshipId !== req.friendshipId));
      setActionState(req.friendshipId, null);
      return;
    }

    const { error: delErr } = await withRetry(() =>
      supabase.from('friendships').delete().eq('id', req.friendshipId)
    );

    if (delErr) {
      if (isTableMissingError(delErr)) {
        setIsOfflineMode(true);
        const localList = getLocalFriendships(user.id);
        const updated = localList.filter(r => r.id !== req.friendshipId);
        saveLocalFriendships(user.id, updated);
        showToast('Connection request declined.', 'info');
        setRequests(prev => prev.filter(r => r.friendshipId !== req.friendshipId));
        setActionState(req.friendshipId, null);
        return;
      }
      showToast('Failed to decline request.', 'error');
      setActionState(req.friendshipId, null);
      return;
    }

    showToast('Connection request declined.', 'info');
    setRequests(prev => prev.filter(r => r.friendshipId !== req.friendshipId));
    setActionState(req.friendshipId, null);
  };

  const handleRemoveFriend = async (friend) => {
    setActionState(friend.friendshipId, 'removing');

    if (isOfflineMode || String(friend.friendshipId).startsWith('local_')) {
      const localList = getLocalFriendships(user.id);
      const updated = localList.filter(r => r.id !== friend.friendshipId);
      saveLocalFriendships(user.id, updated);
      showToast(`Removed ${friend.name}`, 'info');
      setFriends(prev => prev.filter(f => f.friendshipId !== friend.friendshipId));
      setActionState(friend.friendshipId, null);
      return;
    }

    const { error: delErr } = await withRetry(() =>
      supabase.from('friendships').delete().eq('id', friend.friendshipId)
    );

    if (delErr) {
      if (isTableMissingError(delErr)) {
        setIsOfflineMode(true);
        const localList = getLocalFriendships(user.id);
        const updated = localList.filter(r => r.id !== friend.friendshipId);
        saveLocalFriendships(user.id, updated);
        showToast(`Removed ${friend.name}`, 'info');
        setFriends(prev => prev.filter(f => f.friendshipId !== friend.friendshipId));
        setActionState(friend.friendshipId, null);
        return;
      }
      showToast('Failed to remove connection.', 'error');
      setActionState(friend.friendshipId, null);
      return;
    }

    showToast(`Removed ${friend.name}`, 'info');
    setFriends(prev => prev.filter(f => f.friendshipId !== friend.friendshipId));
    setActionState(friend.friendshipId, null);
  };

  const handleAddFriend = async (sugg) => {
    setActionState(sugg.id, 'sending');

    if (isOfflineMode) {
      const localList = getLocalFriendships(user.id);
      const newEntry = {
        id: `local_${Date.now()}`,
        requester_id: user.id,
        addressee_id: sugg.id,
        status: 'pending',
        created_at: new Date().toISOString(),
      };
      saveLocalFriendships(user.id, [...localList, newEntry]);
      showToast(`Connection request sent to ${sugg.name}`, 'success');
      setSuggestions(prev => prev.filter(s => s.id !== sugg.id));
      setActionState(sugg.id, null);
      return;
    }

    const { error: insertErr } = await withRetry(() =>
      supabase.from('friendships').insert([{
        requester_id: user.id,
        addressee_id: sugg.id,
        status: 'pending',
      }])
    );

    if (insertErr) {
      if (isTableMissingError(insertErr)) {
        setIsOfflineMode(true);
        const localList = getLocalFriendships(user.id);
        const newEntry = {
          id: `local_${Date.now()}`,
          requester_id: user.id,
          addressee_id: sugg.id,
          status: 'pending',
          created_at: new Date().toISOString(),
        };
        saveLocalFriendships(user.id, [...localList, newEntry]);
        showToast(`Connection request sent to ${sugg.name}`, 'success');
        setSuggestions(prev => prev.filter(s => s.id !== sugg.id));
        setActionState(sugg.id, null);
        return;
      }
      showToast(insertErr.userMessage || 'Failed to send invite.', 'error');
      setActionState(sugg.id, null);
      return;
    }

    createNotification({
      user_id: sugg.id,
      type: 'friends',
      title: 'New connection request',
      message: `${user?.name || 'A student'} wants to connect on GroupSync!`,
      icon: '👋',
      action_label: 'View request',
      action_path: '/friends',
      reference_id: String(user.id),
    });

    showToast(`Connection request sent to ${sugg.name}`, 'success');
    setSuggestions(prev => prev.filter(s => s.id !== sugg.id));
    setActionState(sugg.id, null);
  };

  const filteredFriends = friends.filter(f =>
    !searchTerm ||
    f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.course.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.skills.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const timeAgo = (dateStr) => {
    const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-gs-border">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-gs-text-main">
            Friends & peers
          </h1>
          <p className="text-sm text-gs-text-muted mt-1 max-w-2xl">
            Manage your peer directory, invitations, and collaborate with verified classmates.
          </p>
        </div>
        <button
          onClick={() => setRetry(r => r + 1)}
          title="Refresh"
          className="p-2 glass-card rounded-lg text-gs-text-muted hover:text-gs-text-main hover:bg-black/5 dark:hover:bg-white/[0.04] transition-colors"
        >
          <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Offline / Table Notice */}
      {isOfflineMode && (
        <div className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-300 text-xs">
          <div className="flex items-center gap-2.5">
            <AlertCircle size={16} className="shrink-0 text-amber-400" />
            <div>
              <p className="font-semibold text-amber-200">Supabase Table Pending</p>
              <p className="text-amber-300/80 mt-0.5">
                The <code className="px-1 py-0.5 rounded bg-black/30 font-mono text-amber-200">public.friendships</code> table has not been created in Supabase yet.
                Running in local peer cache mode — connections will persist locally. Run migration 007 in your Supabase SQL editor to enable multi-device sync.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Segmented Control Tabs */}
      <div className="segmented-control p-1 glass-elevated rounded-lg inline-flex gap-1">
        {[
          { id: 'friends', label: 'My friends', count: friends.length, icon: Users2 },
          { id: 'requests', label: 'Incoming requests', count: requests.length, icon: UserPlus, badge: requests.length },
          { id: 'suggestions', label: 'Recommended peers', count: suggestions.length, icon: Compass },
        ].map(t => (
          <button 
            key={t.id} 
            onClick={() => setTab(t.id)}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center gap-1.5 ${
              tab === t.id
                ? 'bg-gs-card text-gs-text-main shadow-xs border border-gs-border'
                : 'text-gs-text-muted hover:text-gs-text-main'
            }`}
          >
            <t.icon size={13} className={tab === t.id ? 'text-[#9182f8]' : 'text-gs-text-muted'} />
            <span>{t.label}</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-semibold ${
              t.badge && t.badge > 0
                ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                : 'bg-white/[0.04] text-gs-text-muted border border-gs-border'
            }`}>
              {t.count}
            </span>
          </button>
        ))}
      </div>

      {/* Error State */}
      {!loading && error && (
        <ErrorCard message={error} onRetry={() => setRetry(r => r + 1)} />
      )}

      {/* Tab: Friends */}
      {tab === 'friends' && !error && (
        <div className="space-y-4">
          <div className="flex items-center gap-2.5 glass-card rounded-lg px-3 py-1.5 focus-within:border-[#7c6af6] focus-within:ring-1 focus-within:ring-[#6D6AF6] transition-colors">
            <Search className="text-gs-text-muted shrink-0" size={14} />
            <input 
              type="text" 
              placeholder="Search friends by name, major, or skill..."
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-transparent border-none outline-none text-gs-text-main placeholder-gs-text-muted text-xs" 
            />
            {searchTerm && (
              <button onClick={() => setSearchTerm('')} className="text-gs-text-muted hover:text-gs-text-main">
                <X size={12} />
              </button>
            )}
          </div>

          {loading ? (
            <FriendSkeleton count={6} />
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredFriends.map(friend => (
                  <div 
                    key={friend.id}
                    className="glass-card rounded-xl p-4 shadow-xs flex flex-col justify-between hover:border-gs-border-hover transition-colors machined-edge"
                  >
                    <div>
                      <div className="flex items-start gap-3 mb-2.5">
                        <div className="relative">
                          <div className="w-10 h-10 rounded-full bg-white/[0.04] border border-gs-border flex items-center justify-center text-sm font-medium text-gs-text-main">
                            {friend.avatar || '👤'}
                          </div>
                          <div className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-gs-card ${
                            friend.status === 'online' ? 'bg-emerald-400' : 'bg-zinc-500'
                          }`} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="font-semibold text-xs text-gs-text-main truncate">
                            {friend.name}
                          </h3>
                          <p className="text-[11px] text-gs-text-muted truncate mt-0.5">{friend.course} · {friend.college}</p>
                          <p className="text-[10px] text-gs-text-muted mt-0.5">
                            Connected {timeAgo(friend.since)}
                          </p>
                        </div>
                      </div>

                      {/* Skills */}
                      <div className="space-y-1 mb-3">
                        <span className="text-[10px] text-gs-text-muted font-medium uppercase tracking-wider block">Tech Stack</span>
                        <div className="flex flex-wrap gap-1">
                          {(friend.skills || []).slice(0, 3).map((skill) => (
                            <span key={skill} className="tag-skill">
                              {skill}
                            </span>
                          ))}
                          {(friend.skills || []).length > 3 && (
                            <span className="px-1.5 py-0.2 bg-white/[0.04] border border-gs-border text-gs-text-muted text-[10px] rounded">
                              +{friend.skills.length - 3}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Footer with ghost Message and Profile buttons */}
                    <div className="flex items-center gap-2 pt-2.5 border-t border-gs-border">
                      <button 
                        onClick={() => navigate(`/messages/${friend.id}`)}
                        className="flex-1 py-1.5 border border-gs-border hover:border-gs-border-hover rounded-lg font-medium text-xs text-gs-text-main hover:bg-white/[0.04] transition-colors flex items-center justify-center gap-1.5 btn-tactile"
                      >
                        <MessageSquare size={13} className="text-[#9182f8]" /> Message
                      </button>
                      <button 
                        onClick={() => navigate(`/public-profile`, { state: { profileId: friend.id } })}
                        className="flex-1 py-1.5 border border-gs-border hover:border-gs-border-hover rounded-lg font-medium text-xs text-gs-text-muted hover:text-gs-text-main hover:bg-white/[0.04] transition-colors flex items-center justify-center gap-1.5 btn-tactile"
                      >
                        Profile
                      </button>
                      <button
                        onClick={() => handleRemoveFriend(friend)}
                        disabled={actionStates[friend.friendshipId] === 'removing'}
                        title="Remove friend"
                        className="p-1.5 border border-gs-border rounded-lg text-gs-text-muted hover:text-rose-400 hover:border-rose-500/30 hover:bg-rose-500/10 transition-colors text-xs"
                      >
                        <UserMinus size={13} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {filteredFriends.length === 0 && (
                <div className="text-center py-12 glass-card rounded-xl p-6">
                  <Users2 size={32} className="mx-auto text-gs-text-muted opacity-40 mb-2" />
                  <p className="text-sm font-semibold text-gs-text-main">
                    {friends.length === 0 ? 'No connections yet' : 'No friends match your search'}
                  </p>
                  <p className="text-xs text-gs-text-muted mt-1 max-w-sm mx-auto">
                    {friends.length === 0
                      ? 'Switch to the Recommended peers tab to connect with peers and hackathon teammates!'
                      : 'Try searching by a different name or technology.'}
                  </p>
                  {friends.length === 0 && (
                    <button 
                      onClick={() => setTab('suggestions')}
                      className="mt-3 px-3.5 py-1.5 bg-blue-600 text-white font-medium rounded-lg text-xs hover:bg-blue-700 transition-colors shadow-sm"
                    >
                      Discover peers
                    </button>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Tab: Requests */}
      {tab === 'requests' && !error && (
        <div className="space-y-3">
          {loading ? (
            <FriendSkeleton count={2} />
          ) : requests.length === 0 ? (
            <div className="text-center py-12 glass-card rounded-xl p-6">
              <UserCheck size={32} className="mx-auto text-gs-text-muted opacity-40 mb-2" />
              <p className="text-sm font-semibold text-gs-text-main">No pending requests</p>
              <p className="text-xs text-gs-text-muted mt-0.5">You are all caught up on invitations.</p>
            </div>
          ) : (
            requests.map(req => (
              <div 
                key={req.friendshipId}
                className="glass-card rounded-xl p-4 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
              >
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-black/5 dark:bg-white/[0.04] border border-gs-border flex items-center justify-center text-lg shrink-0">
                    {req.avatar}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-xs text-gs-text-main">{req.name}</h3>
                      <span className="text-[10px] text-gs-text-muted flex items-center gap-1">
                        <Clock size={10} /> {timeAgo(req.createdAt)}
                      </span>
                    </div>
                    <p className="text-[11px] text-gs-text-muted">{req.course} · {req.college}</p>
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {(req.skills || []).slice(0, 3).map(s => (
                        <span key={s} className="px-1.5 py-0.2 bg-black/5 dark:bg-white/[0.04] border border-gs-border text-gs-text-muted text-[10px] rounded">
                          {s}
                        </span>
                      ))}
                    </div>
                    {req.message && (
                      <p className="text-xs text-gs-text-muted italic bg-black/5 dark:bg-white/[0.02] border border-gs-border rounded p-2 mt-2">
                        "{req.message}"
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    onClick={() => handleAcceptRequest(req)}
                    disabled={!!actionStates[req.friendshipId]}
                    className="flex-1 sm:flex-none px-3 py-1.5 bg-gradient-to-r from-[#7c6af6] to-[#a78bfa] hover:from-[#6155e0] hover:to-[#9178f4] text-white font-medium rounded-lg text-xs transition-colors flex items-center justify-center gap-1 shadow-xs disabled:opacity-60 btn-tactile"
                  >
                    {actionStates[req.friendshipId] === 'accepting'
                      ? <RefreshCw size={12} className="animate-spin" />
                      : <Check size={12} />}
                    Accept
                  </button>
                  <button
                    onClick={() => handleDeclineRequest(req)}
                    disabled={!!actionStates[req.friendshipId]}
                    className="flex-1 sm:flex-none px-3 py-1.5 border border-gs-border text-gs-text-muted hover:text-rose-400 hover:bg-white/[0.04] font-medium rounded-lg text-xs transition-colors flex items-center justify-center gap-1 disabled:opacity-60"
                  >
                    {actionStates[req.friendshipId] === 'declining'
                      ? <RefreshCw size={12} className="animate-spin" />
                      : <X size={12} />}
                    Decline
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab: Suggestions */}
      {tab === 'suggestions' && !error && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="glass-card rounded-xl p-4 animate-pulse text-center">
                <div className="w-12 h-12 rounded-full bg-black/10 dark:bg-white/10 mx-auto mb-2" />
                <div className="h-3.5 bg-black/10 dark:bg-white/10 rounded w-1/2 mx-auto mb-1.5" />
                <div className="h-3 bg-black/10 dark:bg-white/10 rounded w-1/3 mx-auto mb-3" />
                <div className="h-7 bg-black/10 dark:bg-white/10 rounded-lg" />
              </div>
            ))
          ) : suggestions.length === 0 ? (
            <div className="col-span-3 text-center py-12 glass-card rounded-xl p-6">
              <Compass size={32} className="mx-auto text-gs-text-muted opacity-40 mb-2" />
              <p className="text-sm font-semibold text-gs-text-main">No suggestions right now</p>
              <p className="text-xs text-gs-text-muted mt-0.5">
                As more peers register, recommendations will appear here.
              </p>
            </div>
          ) : (
            suggestions.map(sugg => (
              <div 
                key={sugg.id}
                className="glass-card rounded-xl p-4 shadow-sm flex flex-col justify-between text-center hover:border-blue-500/40 transition-colors"
              >
                <div>
                  <div className="w-12 h-12 rounded-full bg-black/5 dark:bg-white/[0.04] border border-gs-border flex items-center justify-center text-xl mx-auto mb-2">
                    {sugg.avatar || '🎓'}
                  </div>
                  <h3 className="font-medium text-xs text-gs-text-main">{sugg.name}</h3>
                  <p className="text-[11px] text-gs-text-muted">{sugg.course}</p>
                  <p className="text-[10px] text-gs-text-muted mt-0.5">{sugg.college}</p>

                  {sugg.skillOverlap?.length > 0 && (
                    <p className="text-[10px] text-[#7E7BF8] bg-[#7c6af6]/15 border border-[#7c6af6]/30 rounded-full py-0.5 px-2 mt-2 font-medium inline-block">
                      {sugg.skillOverlap.length} shared skill{sugg.skillOverlap.length > 1 ? 's' : ''}
                    </p>
                  )}

                  <div className="flex flex-wrap gap-1 justify-center mt-2.5">
                    {(sugg.skills || []).slice(0, 3).map((s) => (
                      <span key={s} className="tag-skill">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => handleAddFriend(sugg)}
                  disabled={!!actionStates[sugg.id]}
                  className="mt-4 w-full py-2 bg-gradient-to-r from-[#7c6af6] to-[#a78bfa] hover:from-[#6155e0] hover:to-[#9178f4] text-white font-medium rounded-lg text-xs transition-colors flex items-center justify-center gap-1 shadow-xs disabled:opacity-60 btn-tactile"
                >
                  {actionStates[sugg.id] === 'sending'
                    ? <><RefreshCw size={12} className="animate-spin" /> Sending...</>
                    : <><UserPlus size={12} /> Connect</>}
                </button>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
