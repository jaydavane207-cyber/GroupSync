import React from 'react';
import Card from './Card';
import { Bell, CheckCircle, AlertTriangle, MessageSquare } from 'lucide-react';
import { formatRelativeTime } from '@/lib/utils/dateUtils';

export const NotificationCard = ({ notification, onMarkRead }) => {
  if (!notification) return null;

  const getIcon = () => {
    switch (notification.type) {
      case 'team_invite':
        return <MessageSquare className="w-4 h-4 text-[#9182f8]" />;
      case 'badge_earned':
        return <CheckCircle className="w-4 h-4 text-emerald-400" />;
      case 'alert':
        return <AlertTriangle className="w-4 h-4 text-amber-400" />;
      default:
        return <Bell className="w-4 h-4 text-gs-text-muted" />;
    }
  };

  return (
    <Card
      className={`flex items-start gap-3 transition-opacity ${
        notification.read ? 'opacity-60' : 'border-l-4 border-l-[#6D6AF6]'
      }`}
    >
      <div className="p-2 rounded-lg bg-white/5 shrink-0 mt-0.5">{getIcon()}</div>
      <div className="flex-1 min-w-0">
        <h4 className="text-xs font-semibold text-gs-text-main">{notification.title}</h4>
        <p className="text-xs text-gs-text-secondary leading-relaxed mt-0.5">
          {notification.message}
        </p>
        <span className="text-[10px] text-gs-text-muted mt-2 block">
          {formatRelativeTime(notification.created_at)}
        </span>
      </div>
      {!notification.read && onMarkRead && (
        <button
          onClick={() => onMarkRead(notification.id)}
          className="text-[11px] text-[#9182f8] hover:underline shrink-0"
        >
          Mark read
        </button>
      )}
    </Card>
  );
};

export default NotificationCard;


