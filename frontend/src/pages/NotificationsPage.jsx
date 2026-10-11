import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Bell,
  Clock,
  ExternalLink,
  Trash2,
  RefreshCw
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '@/context/AppContext';
import supabase from '@/lib/supabase';
import { withRetry, ErrorCard } from '@/lib/withRetry';

function NotificationSkeleton({ count = 4 }) {
  return (
    <div className="divide-y divide-gs-border glass-card rounded-xl">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="p-4 animate-pulse flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-black/10 dark:bg-white/10 shrink-0" />
          <div className="flex-1">
            <div className="h-3.5 bg-black/10 dark:bg-white/10 rounded w-1/3 mb-1.5" />
            <div className="h-3 bg-black/10 dark:bg-white/10 rounded w-2/3" />
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
    const unread = (data || []).filter(n => !n.read).length;
    setUnreadCount?.(unread);
    setLoading(false);
  }, [user?.id, retry, setUnreadCount]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Real-time subscription
  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel(`notifications-${user.id}`)
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'notifications', filter: `user_id=eq.${user.id}` },
        () => {
          fetchNotifications();
        }
      )
      .subscribe();

    channelRef.current = channel;
    return () => { supabase.removeChannel(channel); };
  }, [user?.id, fetchNotifications]);

  const handleMarkAsRead = async (id) => {
    const target = notifications.find(n => n.id === id);
    if (!target || target.read) return;

    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
    setUnreadCount?.(prev => Math.max(0, (typeof prev === 'number' ? prev : 1) - 1));

    await withRetry(() =>
      supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', id)
        .eq('user_id', user.id)
    );
  };

  const handleMarkAllAsRead = async () => {
    const unreadIds = notifications.filter(n => !n.read).map(n => n.id);
    if (unreadIds.length === 0) return;

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
      showToast('Failed to mark all as read.', 'error');
      fetchNotifications();
    } else {
      showToast('All notifications marked as read.', 'success');
    }
  };

  const handleDeleteNotification = async (id, e) => {
    e.stopPropagation();
    setActionState(id, 'deleting');

    const target = notifications.find(n => n.id === id);
    if (!target?.read) {
      setUnreadCount?.(prev => Math.max(0, (typeof prev === 'number' ? prev : 1) - 1));
    }
    setNotifications(prev => prev.filter(n => n.id !== id));

    const { error: delErr } = await withRetry(() =>
      supabase
        .from('notifications')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)
    );

    if (delErr) {
      showToast('Failed to delete notification.', 'error');
      fetchNotifications();
    }
  };

  const handleClearRead = async () => {
    const readIds = notifications.filter(n => n.read).map(n => n.id);
    if (readIds.length === 0) return;

    setNotifications(prev => prev.filter(n => !n.read));

    const { error: delErr } = await withRetry(() =>
      supabase
        .from('notifications')
        .delete()
        .in('id', readIds)
        .eq('user_id', user.id)
    );

    if (delErr) {
      showToast('Failed to clear read notifications.', 'error');
      fetchNotifications();
    } else {
      showToast('Read notifications cleared.', 'success');
    }
  };

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
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-gs-border">
        <div>
          <h1 className="text-2xl sm:text-[28px] font-semibold tracking-tight text-gs-text-main flex items-center gap-2.5">
            Notifications
            {unreadCount > 0 && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-[#6D6AF6]/10 text-[#7E7BF8] font-medium border border-[#7c6af6]/20">
                {unreadCount} unread
              </span>
            )}
          </h1>
          <p className="text-sm text-gs-text-muted mt-0.5">
            Stay updated on team invitations, application status, and campus alerts.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={() => setRetry(r => r + 1)} 
            title="Refresh"
            className="p-1.5 glass-elevated rounded-lg text-gs-text-muted hover:text-gs-text-main hover:bg-white/[0.04] transition-colors btn-tactile"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          </button>
          {readCount > 0 && (
            <button 
              onClick={handleClearRead}
              className="px-2.5 py-1.5 border border-gs-border text-gs-text-muted hover:text-rose-400 hover:border-rose-500/30 rounded-lg transition-colors text-xs font-medium btn-tactile"
            >
              Clear read
            </button>
          )}
          {unreadCount > 0 && (
            <button 
              onClick={handleMarkAllAsRead}
              className="px-2.5 py-1.5 border border-gs-border text-xs text-gs-text-muted hover:text-gs-text-main hover:bg-white/[0.04] rounded-lg transition-colors font-medium btn-tactile"
            >
              Mark all as read
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs as Segmented Control */}
      <div className="segmented-control p-1 glass-elevated rounded-lg inline-flex gap-1 overflow-x-auto">
        {[
          { id: 'all', label: 'All' },
          { id: 'teams', label: 'Teams' },
          { id: 'friends', label: 'Friends' },
          { id: 'messages', label: 'Messages' },
          { id: 'projects', label: 'Projects' },
          { id: 'quizzes', label: 'Badges' },
        ].map(item => {
          const count = item.id === 'all'
            ? unreadCount
            : notifications.filter(n => n.type === item.id && !n.read).length;
          const isSelected = filter === item.id;
          return (
            <button 
              key={item.id} 
              onClick={() => setFilter(item.id)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                isSelected
                  ? 'bg-gs-card text-gs-text-main shadow-xs border border-gs-border'
                  : 'text-gs-text-muted hover:text-gs-text-main'
              }`}
            >
              <span>{item.label}</span>
              {count > 0 && (
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-semibold ${
                  isSelected 
                    ? 'bg-[#6D6AF6]/20 text-[#7E7BF8]' 
                    : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
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

      {/* Loading Skeleton */}
      {loading && <NotificationSkeleton count={4} />}

      {/* Clean List Rows (not big bordered cards) */}
      {!loading && !error && (
        <div className="glass-card rounded-xl divide-y divide-gs-border overflow-hidden shadow-xs machined-edge">
          {filtered.map(item => {
            return (
              <div 
                key={item.id}
                onClick={() => handleMarkAsRead(item.id)}
                className={`p-3.5 px-4 transition-colors cursor-pointer flex items-center gap-3.5 group ${
                  item.read
                    ? 'hover:bg-white/[0.02]'
                    : 'bg-white/[0.025] hover:bg-white/[0.04]'
                }`}
              >
                {/* Small unread accent dot */}
                <div className="shrink-0 w-2 flex items-center justify-center">
                  {!item.read && (
                    <span className="w-1.5 h-1.5 rounded-full bg-[#6D6AF6]" />
                  )}
                </div>

                {/* Small tinted icon container */}
                <div className="w-8 h-8 rounded-lg bg-[#6D6AF6]/10 text-[#9182f8] flex items-center justify-center shrink-0">
                  <Bell size={14} />
                </div>

                {/* Title + description */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline justify-between gap-3">
                    <h3 className={`text-xs truncate ${item.read ? 'font-medium text-gs-text-main' : 'font-semibold text-gs-text-main'}`}>
                      {item.title}
                    </h3>
                    {/* Timestamp right-aligned muted */}
                    <span className="text-[11px] text-gs-text-muted shrink-0 tabular-nums">
                      {getTimeAgo(item.created_at)}
                    </span>
                  </div>
                  <p className="text-xs text-gs-text-muted mt-0.5 line-clamp-1">
                    {item.message}
                  </p>
                </div>

                {/* Action Link & Delete */}
                <div className="flex items-center gap-2 shrink-0">
                  {item.action_path && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMarkAsRead(item.id);
                        navigate(item.action_path);
                      }}
                      className="text-xs font-medium text-[#9182f8] hover:underline flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      {item.action_label || 'View'} <ExternalLink size={11} />
                    </button>
                  )}
                  <button
                    onClick={(e) => handleDeleteNotification(item.id, e)}
                    disabled={actionStates[item.id] === 'deleting'}
                    className="opacity-0 group-hover:opacity-100 p-1 text-gs-text-muted hover:text-rose-400 transition-opacity"
                    title="Delete notification"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            );
          })}

          {filtered.length === 0 && !loading && (
            <div className="text-center py-12 p-6">
              <div className="w-10 h-10 rounded-lg bg-[#6D6AF6]/10 text-[#9182f8] flex items-center justify-center mx-auto mb-2">
                <Bell size={18} />
              </div>
              <p className="text-sm font-semibold text-gs-text-main">
                {filter === 'all' ? 'No notifications right now' : `No ${filter} notifications`}
              </p>
              <p className="text-xs text-gs-text-muted mt-0.5">
                {filter === 'all'
                  ? 'Updates from teammates, friends, and campus alerts will appear here.'
                  : 'Nothing in this category right now.'}
              </p>
              {filter !== 'all' && (
                <button 
                  onClick={() => setFilter('all')}
                  className="mt-3 px-3 py-1.5 border border-gs-border rounded-lg text-xs font-medium text-gs-text-main hover:bg-white/[0.04] btn-tactile"
                >
                  View all updates
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}


