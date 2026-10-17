import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Sparkles, 
  MessageSquare, 
  Trophy, 
  Sun, 
  Moon, 
  UserCircle, 
  LogOut, 
  ChevronDown,
  FolderKanban,
  Users2,
  Bell,
  BookOpenCheck,
  Award,
  MessageCircle,
  Layers
} from 'lucide-react';
import { useAppContext } from '@/context/AppContext';

export default function Sidebar() {
  const { user, theme, setTheme, factions, logout, unreadNotificationCount } = useAppContext();
  const navigate = useNavigate();
  const location = useLocation();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/teams', label: 'Teams', icon: Users },
    { path: '/ai', label: 'Smart Match', icon: Sparkles },
    { path: '/projects', label: 'Projects', icon: FolderKanban },
    { path: '/quiz', label: 'Skill Quizzes', icon: BookOpenCheck },
    { path: '/badges', label: 'Badges & Certs', icon: Award },
    { path: '/friends', label: 'Friends', icon: Users2 },
    { path: '/notifications', label: 'Notifications', icon: Bell },
    { path: '/messages', label: 'Messages', icon: MessageCircle },
    { path: '/chat', label: 'Campus Chat', icon: MessageSquare },
    { path: '/leaderboard', label: 'Leaderboard', icon: Trophy },
    { path: '/profile', label: 'Profile', icon: UserCircle },
  ];

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const handleLogout = () => {
    setShowLogoutModal(false);
    setShowUserMenu(false);
    logout();
    navigate('/login');
  };

  return (
    <>
      {/* ── Desktop Sidebar ────────────────────────────────────── */}
      <aside className="w-60 fixed left-0 top-0 h-screen glass-sidebar flex flex-col justify-between hidden md:flex transition-colors duration-150 z-40">
        <div className="flex flex-col flex-1 overflow-y-auto">
          {/* Logo */}
          <div 
            className="h-14 px-5 flex items-center gap-2.5 cursor-pointer border-b border-gs-border shrink-0" 
            onClick={() => navigate('/dashboard')}
          >
            <div className="w-7 h-7 rounded-lg bg-[#7c6af6]/15 border border-[#7c6af6]/30 flex items-center justify-center text-[#9182f8] shrink-0 shadow-[0_0_10px_rgba(124,106,246,0.20)]">
              <Layers size={16} />
            </div>
            <span className="text-sm font-semibold tracking-tight text-gs-text-main">
              GroupSync
            </span>
          </div>

          {/* Nav Links */}
          <nav className="p-2.5 flex flex-col gap-0.5 flex-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              const Icon = item.icon;
              const isNotifications = item.path === '/notifications';
              const badge = isNotifications && unreadNotificationCount > 0 ? unreadNotificationCount : 0;
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs transition-all duration-150 relative group w-full text-left font-normal ${
                    isActive
                      ? 'bg-[#7c6af6]/15 text-[#9182f8] font-medium border border-[#7c6af6]/20 shadow-[0_0_12px_rgba(124,106,246,0.12)]'
                      : 'text-gs-text-muted hover:bg-slate-100/80 dark:hover:bg-white/[0.05] hover:text-gs-text-main'
                  }`}
                >
                  <Icon 
                    size={17} 
                    className={`shrink-0 transition-colors ${isActive ? 'text-[#9182f8]' : 'text-gs-text-muted group-hover:text-gs-text-main'}`} 
                  />
                  <span className="truncate flex-1">
                    {item.label}
                  </span>
                  {badge > 0 && (
                    <span className="px-1.5 py-0.2 rounded-full bg-[#f472b6]/20 text-[#f472b6] border border-[#f472b6]/30 text-[10px] font-semibold shrink-0 shadow-[0_0_8px_rgba(244,114,182,0.20)]">
                      {badge > 9 ? '9+' : badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom controls */}
        <div className="flex flex-col gap-2 p-2.5 border-t border-gs-border shrink-0">
          {/* Theme Toggle */}
          <div className="flex items-center justify-between px-2 py-1 text-xs text-gs-text-muted">
            <span className="text-[11px] font-medium">Theme</span>
            <button
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-white/[0.06] text-gs-text-muted hover:text-gs-text-main transition-colors flex items-center gap-1.5 text-xs cursor-pointer"
            >
              {theme === 'dark' ? (
                <>
                  <Moon size={13} className="text-[#7c6af6]" />
                  <span className="text-[11px]">Dark</span>
                </>
              ) : (
                <>
                  <Sun size={13} className="text-amber-500" />
                  <span className="text-[11px]">Light</span>
                </>
              )}
            </button>
          </div>

          {/* User Info Bottom */}
          {user && (
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="w-full flex items-center gap-2.5 p-1.5 rounded-lg border border-gs-border hover:bg-slate-100/80 dark:hover:bg-white/[0.05] hover:border-[#7c6af6]/25 transition-all cursor-pointer text-left backdrop-blur-sm"
              >
                <div className="w-6 h-6 rounded-md bg-[#7c6af6]/15 border border-[#7c6af6]/25 flex items-center justify-center text-xs shrink-0 text-gs-text-main font-medium">
                  {user.avatar ? (
                    typeof user.avatar === 'string' && user.avatar.length <= 2 ? user.avatar : <UserCircle size={15} />
                  ) : (
                    <UserCircle size={15} />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gs-text-main truncate">{user.name}</p>
                  <p className="text-[10px] text-gs-text-muted truncate">
                    {factions?.[user.faction]?.name || 'Student'}
                  </p>
                </div>
                <ChevronDown size={12} className={`text-gs-text-muted transition-transform duration-150 ${showUserMenu ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown */}
              {showUserMenu && (
                <div className="absolute bottom-full left-0 right-0 mb-1.5 glass-elevated rounded-lg overflow-hidden shadow-xl z-50 p-1">
                  <button
                    onClick={() => { navigate('/profile'); setShowUserMenu(false); }}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs font-medium text-gs-text-main hover:bg-slate-100 dark:hover:bg-white/[0.07] transition-colors"
                  >
                    <UserCircle size={14} className="text-[#7c6af6]" />
                    My profile
                  </button>
                  <button
                    onClick={() => { setShowLogoutModal(true); setShowUserMenu(false); }}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs font-medium text-rose-500 hover:bg-rose-500/10 transition-colors"
                  >
                    <LogOut size={14} />
                    Sign out
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </aside>

      {/* ── Mobile Bottom Tab Bar ─────────────────────────────── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 glass-navbar overflow-x-auto">
        <div className="flex items-center justify-around px-1 py-1 min-w-fit">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            const isNotifications = item.path === '/notifications';
            const badge = isNotifications && unreadNotificationCount > 0 ? unreadNotificationCount : 0;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className="flex flex-col items-center gap-0.5 px-2 py-1 rounded-md transition-colors min-w-[56px] relative"
              >
                {badge > 0 && (
                  <span className="absolute top-0.5 right-1.5 w-3.5 h-3.5 rounded-full bg-rose-500 text-white text-[9px] font-semibold flex items-center justify-center">
                    {badge > 9 ? '9+' : badge}
                  </span>
                )}
                <div className={`p-1 rounded-md transition-all duration-150 ${isActive ? 'bg-[#7c6af6]/15 text-[#9182f8] shadow-[0_0_10px_rgba(124,106,246,0.18)]' : 'text-gs-text-muted'}`}>
                  <Icon size={16} />
                </div>
                <span className={`text-[10px] truncate max-w-[50px] ${isActive ? 'text-[#9182f8] font-medium' : 'text-gs-text-muted'}`}>
                  {item.label.split(' ')[0]}
                </span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="p-5 max-w-sm w-full glass-card shadow-2xl">
            <div className="text-center">
              <div className="w-10 h-10 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mx-auto mb-3 text-rose-400">
                <LogOut size={18} />
              </div>
              <h3 className="text-base font-semibold text-gs-text-main mb-1">Sign out</h3>
              <p className="text-gs-text-muted text-xs mb-5">Are you sure you want to sign out of GroupSync?</p>
              <div className="flex gap-2.5">
                <button
                  onClick={() => setShowLogoutModal(false)}
                  className="flex-1 py-2 rounded-lg border border-white/10 text-gs-text-muted hover:text-gs-text-main hover:bg-white/[0.05] transition-colors text-xs font-medium backdrop-blur-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleLogout}
                  className="flex-1 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-medium transition-colors btn-tactile shadow-[0_0_16px_rgba(239,68,68,0.25)]"
                >
                  Sign out
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
