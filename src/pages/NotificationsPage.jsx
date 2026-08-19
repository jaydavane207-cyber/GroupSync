import React, { useState } from 'react';
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
  Trash2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';

export default function NotificationsPage() {
  const { showToast } = useAppContext();
  const navigate = useNavigate();
  const [filter, setFilter] = useState('all'); // all, teams, friends, messages, quizzes

  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: 'teams',
      title: 'Team Invitation',
      message: 'Alice Johnson invited you to join "AI Innovators" for Tech Fest 2026.',
      icon: '👥',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      read: false,
      action: { label: 'View Team', path: '/browse' },
    },
    {
      id: 2,
      type: 'friends',
      title: 'New Connection Request',
      message: 'Emma Watson from Harvard sent you a connection request with a note.',
      icon: '👫',
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
      read: false,
      action: { label: 'View Requests', path: '/friends' },
    },
    {
      id: 3,
      type: 'messages',
      title: 'Campus Chat Mention',
      message: 'Bob Smith mentioned you in #ai-ml channel: "Can someone check this model latency?"',
      icon: '💬',
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
      read: true,
      action: { label: 'Open Chat', path: '/chat' },
    },
    {
      id: 4,
      type: 'teams',
      title: 'Hackathon Deadline Alert',
      message: 'Registration for "Spring Hackathon 2026" closes in 48 hours. Form your team now!',
      icon: '⏰',
      timestamp: new Date(Date.now() - 14 * 60 * 60 * 1000),
      read: true,
      action: { label: 'Explore Projects', path: '/projects' },
    },
    {
      id: 5,
      type: 'quizzes',
      title: 'Skill Verified & Badge Earned! 🏆',
      message: 'Congratulations! You passed the Python Skill Assessment with a 94% score. Platinum Badge unlocked.',
      icon: '✅',
      timestamp: new Date(Date.now() - 26 * 60 * 60 * 1000),
      read: true,
      action: { label: 'View Badges', path: '/profile' },
    },
    {
      id: 6,
      type: 'teams',
      title: 'Team Member Joined',
      message: 'David Chen joined your squad "Quantum Hackers" as a Backend Developer.',
      icon: '🚀',
      timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000),
      read: true,
      action: { label: 'Team Dashboard', path: '/browse' },
    }
  ]);

  const filtered = notifications.filter(n => {
    if (filter === 'all') return true;
    return n.type === filter;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleMarkAsRead = (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const handleMarkAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    showToast('All notifications marked as read', 'success');
  };

  const handleDeleteNotification = (id, e) => {
    e.stopPropagation();
    setNotifications(prev => prev.filter(n => n.id !== id));
    showToast('Notification removed', 'info');
  };

  const getTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - date) / 1000);
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="space-y-8 animate-[slideIn_0.3s_ease-out]">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative z-10">
        <div>
          <h1 className="text-4xl lg:text-5xl font-black font-heading text-gs-text-main tracking-tight drop-shadow-sm flex items-center gap-3">
            <Bell className="text-gs-cyan w-10 h-10" /> Notifications
          </h1>
          <p className="text-gs-text-muted mt-2 text-lg font-medium">
            Stay updated on team invitations, application status, chat mentions, and skill verifications.
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllAsRead}
            className="px-5 py-2.5 bg-gs-card border border-gs-border hover:border-gs-primary/50 text-gs-primary font-bold rounded-2xl transition-all flex items-center gap-2 text-sm shadow-sm"
          >
            <CheckCheck size={18} /> Mark All as Read ({unreadCount})
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 relative z-10">
        {[
          { id: 'all', label: 'All Notifications' },
          { id: 'teams', label: 'Teams & Invites' },
          { id: 'friends', label: 'Friends' },
          { id: 'messages', label: 'Messages' },
          { id: 'quizzes', label: 'Skill Badges' },
        ].map(item => (
          <button
            key={item.id}
            onClick={() => setFilter(item.id)}
            className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all whitespace-nowrap ${
              filter === item.id
                ? 'bg-gs-primary text-[#050810] shadow-[0_0_15px_rgba(0,240,255,0.4)]'
                : 'bg-gs-card text-gs-text-muted hover:text-gs-text-main border border-gs-border'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      <div className="space-y-4 relative z-10">
        {filtered.map(item => {
          const timeAgo = getTimeAgo(item.timestamp);

          return (
            <div
              key={item.id}
              onClick={() => handleMarkAsRead(item.id)}
              className={`p-5 md:p-6 rounded-3xl border transition-all duration-300 cursor-pointer flex items-start gap-4 shadow-lg group hover:-translate-y-0.5 ${
                item.read
                  ? 'bg-gs-card/60 border-gs-border hover:border-white/20'
                  : 'bg-gs-card border-gs-primary/40 shadow-[0_0_20px_rgba(0,240,255,0.08)]'
              }`}
            >
              {/* Icon */}
              <div className="text-3xl p-3 bg-gs-bg border border-gs-border rounded-2xl shrink-0 shadow-inner group-hover:scale-105 transition-transform">
                {item.icon}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-bold text-base text-gs-text-main">{item.title}</h3>
                  {!item.read && (
                    <span className="w-2.5 h-2.5 rounded-full bg-gs-primary shadow-[0_0_8px_rgba(0,240,255,0.8)]" />
                  )}
                  <span className="text-xs text-gs-text-muted ml-auto shrink-0">{timeAgo}</span>
                </div>
                <p className="text-sm text-gs-text-muted leading-relaxed mb-3">
                  {item.message}
                </p>

                <div className="flex items-center justify-between">
                  {item.action ? (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMarkAsRead(item.id);
                        navigate(item.action.path);
                      }}
                      className="text-xs font-bold text-gs-cyan hover:text-cyan-300 flex items-center gap-1 transition-colors"
                    >
                      {item.action.label} <ExternalLink size={12} />
                    </button>
                  ) : <div />}

                  <button
                    onClick={(e) => handleDeleteNotification(item.id, e)}
                    className="opacity-0 group-hover:opacity-100 p-1 text-gs-text-muted hover:text-rose-400 transition-opacity"
                    title="Delete notification"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="text-center py-16 bg-gs-card border border-gs-border rounded-3xl p-8">
            <Bell size={48} className="mx-auto text-gs-text-muted opacity-40 mb-3" />
            <p className="text-lg font-bold text-gs-text-main">No notifications to display</p>
            <p className="text-sm text-gs-text-muted mt-1">You're completely up to date!</p>
          </div>
        )}
      </div>
    </div>
  );
}
