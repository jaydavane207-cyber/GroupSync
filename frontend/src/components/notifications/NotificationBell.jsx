import React from 'react';
import { Bell } from 'lucide-react';

export const NotificationBell = ({ count = 0, onClick }) => {
  return (
    <button
      onClick={onClick}
      className="relative p-2 rounded-lg hover:bg-white/5 text-gs-text-secondary hover:text-gs-text-main transition-colors"
      aria-label="Notifications"
    >
      <Bell className="w-4 h-4" />
      {count > 0 && (
        <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#6D6AF6] ring-2 ring-[#14141a]" />
      )}
    </button>
  );
};

export default NotificationBell;
