import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Bell,
  CheckCheck,
  MessageSquare,
  Users,
  UserPlus,
  Award,
  Clock,
  X,
  ExternalLink,
  CheckCircle2,
  Trash2,
  RefreshCw,
  FolderKanban
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import supabase from '../lib/supabase';
import { withRetry, ErrorCard } from '../lib/withRetry';

// ─── Notification icon map ─────────────────────────────────────────────────────
const TYPE_ICONS = {
  teams: Users,
  friends: UserPlus,
  messages: MessageSquare,
  quizzes: Award,
  projects: FolderKanban,
};

// ─── Loading skeleton ──────────────────────────────────────────────────────────
function NotificationSkeleton({ count = 5 }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="p-5 bg-gs-card border border-gs-border rounded-3xl animate-pulse flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gs-bg shrink-0" />
          <div className="flex-1">
            <div className="h-4 bg-gs-bg rounded w-1/3 mb-2" />
            <div className="h-3 bg-gs-bg rounded w-3/4 mb-1" />
            <div className="h-3 bg-gs-bg rounded w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function NotificationsPage() {
  const { user, showToast, setUnreadCount } = useAppContext();
  const navigate = useNavigate();
  const [filter, setFilter] = useState('all');
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retry, setRetry] = useState(0);
  const [actionStates, setActionStates] = useState({});
  const channelRef = useRef(null);

  const setActionState = (id, state) =>
    setActionStates(prev => ({ ...prev, [id]: state }));

  // ── Fetch notifications ────────────────────────────────────────────────────
  const fetchNotifications = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    setError(null);

    const { data, error: fetchErr } = await withRetry(() =>
      supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(100)
    );

    if (fetchErr) {
      setError(fetchErr.userMessage || 'Failed to load notifications.');
      setLoading(false);
      return;
    }

    setNotifications(data || []);
    // Update global unread count
    const unread = (data || []).filter(n => !n.read).length;
    setUnreadCount?.(unread);
    setLoading(false);
  }, [user?.id, retry, setUnreadCount]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // ── Real-time subscription ─────────────────────────────────────────────────
  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel(`notifications-${user.id}`)
      .on('postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          setNotifications(prev => {
            const updated = [payload.new, ...prev];
            const unread = updated.filter(n => !n.read).length;
            setUnreadCount?.(unread);
            return updated;
          });
          // Mini toast for new notifications
          showToast(`🔔 ${payload.new.title}`, 'info');
        }
      )
      .on('postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          setNotifications(prev => {
            const updated = prev.map(n => n.id === payload.new.id ? payload.new : n);
            const unread = updated.filter(n => !n.read).length;
            setUnreadCount?.(unread);
            return updated;
          });
        }
      )
      .on('postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          setNotifications(prev => {
            const updated = prev.filter(n => n.id !== payload.old.id);
            const unread = updated.filter(n => !n.read).length;
            setUnreadCount?.(unread);
            return updated;
          });
        }
      )
      .subscribe();

    channelRef.current = channel;
    return () => { supabase.removeChannel(channel); };
  }, [user?.id, showToast, setUnreadCount]);

  // ── Mark one as read ───────────────────────────────────────────────────────
  const handleMarkAsRead = useCallback(async (id) => {
    const notif = notifications.find(n => n.id === id);
    if (!notif || notif.read) return;

    // Optimistic update
    setNotifications(prev => {
      const updated = prev.map(n => n.id === id ? { ...n, read: true } : n);
      const unread = updated.filter(n => !n.read).length;
      setUnreadCount?.(unread);
      return updated;
    });

    await withRetry(() =>
      supabase.from('notifications').update({ read: true }).eq('id', id).eq('user_id', user.id)
    );
  }, [notifications, user?.id, setUnreadCount]);

  // ── Mark all as read ───────────────────────────────────────────────────────
  const handleMarkAllAsRead = async () => {
    const unreadIds = notifications.filter(n => !n.read).map(n => n.id);
    if (unreadIds.length === 0) return;

    // Optimistic
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount?.(0);

    const { error: updateErr } = await withRetry(() =>
      supabase
        .from('notifications')
        .update({ read: true })
        .in('id', unreadIds)
        .eq('user_id', user.id)
    );

    if (updateErr) {
      showToast('Failed to mark all as read. Refreshing...', 'error');
      setRetry(r => r + 1);
      return;
    }

    showToast('All notifications marked as read', 'success');
  };

  // ── Delete one notification ────────────────────────────────────────────────
  const handleDeleteNotification = async (id, e) => {
    e.stopPropagation();
    setActionState(id, 'deleting');

    // Optimistic
    setNotifications(prev => {
      const updated = prev.filter(n => n.id !== id);
      const unread = updated.filter(n => !n.read).length;
      setUnreadCount?.(unread);
      return updated;
    });

    const { error: deleteErr } = await withRetry(() =>
      supabase.from('notifications').delete().eq('id', id).eq('user_id', user.id)
    );

    if (deleteErr) {
      showToast('Failed to delete notification.', 'error');
      setRetry(r => r + 1);
    } else {
      showToast('Notification removed', 'info');
    }
    setActionState(id, null);
  };

  // ── Delete all read notifications ──────────────────────────────────────────
  const handleClearRead = async () => {
    const readIds = notifications.filter(n => n.read).map(n => n.id);
    if (readIds.length === 0) return;

    setNotifications(prev => prev.filter(n => !n.read));

    const { error: deleteErr } = await withRetry(() =>
      supabase
        .from('notifications')
        .delete()
        .in('id', readIds)
        .eq('user_id', user.id)
    );

    if (deleteErr) {
      showToast('Failed to clear notifications.', 'error');
      setRetry(r => r + 1);
    } else {
      showToast('Read notifications cleared.', 'success');
    }
  };

  // ── Computed ───────────────────────────────────────────────────────────────
  const filtered = notifications.filter(n => filter === 'all' || n.type === filter);
  const unreadCount = notifications.filter(n => !n.read).length;
  const readCount = notifications.filter(n => n.read).length;

  const getTimeAgo = (dateStr) => {
    const seconds = Math.floor((Date.now() - new Date(dateStr)) / 1000);
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return new Date(dateStr).toLocaleDateString();
  };

  return (
    <div className="space-y-8 animate-[slideIn_0.3s_ease-out]">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative z-10">
        <div>
          <h1 className="text-4xl lg:text-5xl font-black font-heading text-gs-text-main tracking-tight drop-shadow-sm flex items-center gap-3">
            <Bell className="text-gs-cyan w-10 h-10" /> Notifications
            {unreadCount > 0 && (
              <span className="text-base px-3 py-1 rounded-full bg-rose-500 text-white font-black shadow-[0_0_12px_rgba(239,68,68,0.5)]">
                {unreadCount}
              </span>
            )}
          </h1>
          <p className="text-gs-text-muted mt-2 text-lg font-medium">
            Stay updated on team invitations, application status, chat mentions, and skill verifications.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={() => setRetry(r => r + 1)} title="Refresh"
            className="p-2.5 bg-gs-card border border-gs-border rounded-xl text-gs-text-muted hover:text-gs-cyan hover:border-gs-primary transition-all">
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          </button>
          {readCount > 0 && (
            <button onClick={handleClearRead}
              className="px-4 py-2.5 bg-gs-card border border-gs-border hover:border-rose-500/30 text-rose-400 font-bold rounded-2xl transition-all flex items-center gap-2 text-sm">
              <Trash2 size={16} /> Clear Read ({readCount})
            </button>
          )}
          {unreadCount > 0 && (
            <button onClick={handleMarkAllAsRead}
              className="px-5 py-2.5 bg-gs-card border border-gs-border hover:border-gs-primary/50 text-gs-primary font-bold rounded-2xl transition-all flex items-center gap-2 text-sm shadow-sm">
              <CheckCheck size={18} /> Mark All Read
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 relative z-10">
        {[
          { id: 'all', label: 'All Notifications' },
          { id: 'teams', label: '👥 Teams & Invites' },
          { id: 'friends', label: '🤝 Friends' },
          { id: 'messages', label: '💬 Messages' },
          { id: 'projects', label: '📋 Projects' },
          { id: 'quizzes', label: '🏆 Skill Badges' },
        ].map(item => {
          const count = item.id === 'all'
            ? unreadCount
            : notifications.filter(n => n.type === item.id && !n.read).length;
          return (
            <button key={item.id} onClick={() => setFilter(item.id)}
              className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all whitespace-nowrap flex items-center gap-2 ${
                filter === item.id
                  ? 'bg-gs-primary text-[#050810] shadow-[0_0_15px_rgba(0,240,255,0.4)]'
                  : 'bg-gs-card text-gs-text-muted hover:text-gs-text-main border border-gs-border'
              }`}>
              {item.label}
              {count > 0 && (
                <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-full ${
                  filter === item.id ? 'bg-[#050810]/30 text-[#050810]' : 'bg-rose-500 text-white'
                }`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Error */}
      {!loading && error && (
        <ErrorCard message={error} onRetry={() => setRetry(r => r + 1)} />
      )}

      {/* Loading */}
      {loading && <NotificationSkeleton count={5} />}

      {/* Notifications List */}
      {!loading && !error && (
        <div className="space-y-4 relative z-10">
          {filtered.map(item => {
            const TypeIcon = TYPE_ICONS[item.type] || Bell;
            return (
              <div key={item.id}
                onClick={() => handleMarkAsRead(item.id)}
                className={`p-5 md:p-6 rounded-3xl border transition-all duration-300 cursor-pointer flex items-start gap-4 shadow-lg group hover:-translate-y-0.5 ${
                  item.read
                    ? 'bg-gs-card/60 border-gs-border hover:border-white/20'
                    : 'bg-gs-card border-gs-primary/40 shadow-[0_0_20px_rgba(0,240,255,0.08)]'
                }`}>
                {/* Icon */}
                <div className="relative shrink-0">
                  <div className="text-3xl p-3 bg-gs-bg border border-gs-border rounded-2xl shadow-inner group-hover:scale-105 transition-transform">
                    {item.icon || '🔔'}
                  </div>
                  {!item.read && (
                    <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-gs-primary shadow-[0_0_8px_rgba(0,240,255,0.8)]" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className={`font-bold text-base ${item.read ? 'text-gs-text-main' : 'text-gs-text-main'}`}>
                      {item.title}
                    </h3>
                    {!item.read && (
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-gs-primary/20 text-gs-primary border border-gs-primary/30">
                        NEW
                      </span>
                    )}
                    <span className="text-xs text-gs-text-muted ml-auto shrink-0 flex items-center gap-1">
                      <Clock size={11} /> {getTimeAgo(item.created_at)}
                    </span>
                  </div>
                  <p className="text-sm text-gs-text-muted leading-relaxed mb-3">
                    {item.message}
                  </p>

                  <div className="flex items-center justify-between">
                    {item.action_path ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMarkAsRead(item.id);
                          navigate(item.action_path);
                        }}
                        className="text-xs font-bold text-gs-cyan hover:text-cyan-300 flex items-center gap-1 transition-colors">
                        {item.action_label || 'View'} <ExternalLink size={12} />
                      </button>
                    ) : <div />}

                    <button
                      onClick={(e) => handleDeleteNotification(item.id, e)}
                      disabled={actionStates[item.id] === 'deleting'}
                      className="opacity-0 group-hover:opacity-100 p-1 text-gs-text-muted hover:text-rose-400 transition-all"
                      title="Delete notification">
                      {actionStates[item.id] === 'deleting'
                        ? <RefreshCw size={14} className="animate-spin" />
                        : <Trash2 size={14} />}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          {filtered.length === 0 && !loading && (
            <div className="text-center py-16 bg-gs-card border border-gs-border rounded-3xl p-8">
              <Bell size={48} className="mx-auto text-gs-text-muted opacity-40 mb-3" />
              <p className="text-lg font-bold text-gs-text-main">
                {filter === 'all' ? 'No notifications yet' : `No ${filter} notifications`}
              </p>
              <p className="text-sm text-gs-text-muted mt-1">
                {filter === 'all'
                  ? 'Notifications from teammates, friends, and system alerts will appear here.'
                  : 'Nothing in this category right now.'}
              </p>
              {filter !== 'all' && (
                <button onClick={() => setFilter('all')}
                  className="mt-4 px-5 py-2.5 bg-gs-card border border-gs-border text-gs-primary font-bold rounded-xl text-sm hover:border-gs-primary transition-all">
                  View All Notifications
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
