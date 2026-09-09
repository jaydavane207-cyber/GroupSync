import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Bot, 
  MessageSquare, 
  Trophy, 
  Zap, 
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
  MessageCircle
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';

export default function Sidebar() {
  const { user, theme, setTheme, factions, logout, unreadNotificationCount } = useAppContext();
  const navigate = useNavigate();
  const location = useLocation();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/teams', label: 'Teams', icon: Users },
    { path: '/ai', label: 'AI Match', icon: Bot },
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
      {/* ── Desktop Sidebar ─────────────────────────────────────────────── */}
      <aside className="w-60 fixed left-0 top-0 h-screen border-r border-gs-border bg-gs-card flex-col justify-between hidden md:flex transition-all duration-300 z-40 backdrop-blur-[20px]">
        <div className="overflow-y-auto">
          {/* Logo */}
          <div className="p-6 flex items-center gap-3 cursor-pointer" onClick={() => navigate('/dashboard')}>
            <div className="w-9 h-9 rounded-xl bg-transparent border border-[var(--color-gs-primary)] shadow-[0_0_12px_rgba(0,240,255,0.4)] flex items-center justify-center text-[var(--color-gs-primary)]">
              <Zap size={20} />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight text-gs-text-main font-heading leading-tight">
                Group<span className="text-[var(--color-gs-primary)] text-glow-cyan">Sync</span>
              </h1>
              <p className="text-[9px] text-gs-cyan font-bold uppercase tracking-wider">
                Connect Talent
              </p>
            </div>
          </div>

          {/* Nav Links */}
          <nav className="px-3 flex flex-col gap-1.5 relative pb-4">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              const Icon = item.icon;
              const isNotifications = item.path === '/notifications';
              const badge = isNotifications && unreadNotificationCount > 0 ? unreadNotificationCount : 0;
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 relative group w-full text-left overflow-hidden ${
                    isActive
                      ? 'bg-[var(--color-gs-primary)]/15 text-[var(--color-gs-primary)] font-bold shadow-[0_0_15px_rgba(0,240,255,0.15)] border border-[var(--color-gs-primary)]/30'
                      : 'text-[var(--color-gs-text-muted)] hover:bg-white/5 hover:text-white font-medium'
                  }`}
                >
                  {isActive && (
                    <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-[var(--color-gs-primary)] shadow-[0_0_8px_rgba(0,240,255,0.6)]" />
                  )}
                  <Icon size={18} className="relative z-10 shrink-0" />
                  <span className="text-sm relative z-10 flex-1 truncate">
                    {item.label}
                  </span>
                  {badge > 0 && (
                    <span className="w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] font-black flex items-center justify-center shadow-[0_0_8px_rgba(239,68,68,0.5)] shrink-0">
                      {badge > 9 ? '9+' : badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="flex flex-col gap-2 pb-4 pt-2 border-t border-gs-border/60 bg-gs-card/80">
          {/* Theme Toggle */}
          <div className="px-4 mb-2">
            <div className="relative flex p-1 rounded-xl bg-white/5 border border-[var(--color-gs-card-border)] cursor-pointer overflow-hidden shadow-inner" onClick={toggleTheme}>
               <div
                  className={`absolute top-1 bottom-1 w-[calc(50%-0.25rem)] bg-gradient-to-r from-[#00f0ff] to-[#a855f7] rounded-lg transition-all duration-300 shadow-[0_0_15px_rgba(0,240,255,0.3)] ${
                    theme === 'light' ? 'translate-x-full' : 'translate-x-0'
                  }`}
               />
               <div className={`relative z-10 flex items-center justify-center gap-2 w-1/2 py-2 transition-colors duration-300 ${theme === 'dark' ? 'text-white font-bold' : 'text-[var(--color-gs-text-muted)]'}`}>
                  <Moon size={14} />
                  <span className="text-xs">Dark</span>
               </div>
               <div className={`relative z-10 flex items-center justify-center gap-2 w-1/2 py-2 transition-colors duration-300 ${theme === 'light' ? 'text-white font-bold' : 'text-[var(--color-gs-text-muted)]'}`}>
                  <Sun size={14} />
                  <span className="text-xs">Light</span>
               </div>
            </div>
          </div>

          {/* User Info Bottom */}
          {user && (
            <div className="px-4 relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="w-full flex items-center gap-3 p-2.5 bg-white/5 border border-white/10 rounded-2xl hover:border-[#00f0ff] transition-colors cursor-pointer group text-left"
              >
                <div className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center text-xl border border-white/10 group-hover:border-[#00f0ff] transition-colors shrink-0">
                  {user.avatar || '🎓'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-white truncate group-hover:text-[#00f0ff] transition-colors">{user.name}</p>
                  <p className="text-[10px] font-bold text-[#00f0ff] uppercase tracking-wider truncate">
                    {factions[user.faction]?.name || 'Student'}
                  </p>
                </div>
                <ChevronDown size={14} className={`text-gray-400 transition-transform duration-200 ${showUserMenu ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown */}
              {showUserMenu && (
                <div className="absolute bottom-full left-4 right-4 mb-2 bg-gs-card backdrop-blur-md border border-gs-border rounded-xl overflow-hidden shadow-2xl z-50">
                  <button
                    onClick={() => { navigate('/profile'); setShowUserMenu(false); }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-white hover:bg-white/5 transition-colors"
                  >
                    <UserCircle size={16} className="text-[var(--color-gs-primary)]" />
                    View Profile
                  </button>
                  <button
                    onClick={() => { setShowLogoutModal(true); setShowUserMenu(false); }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 transition-colors border-t border-white/10"
                  >
                    <LogOut size={16} />
                    Logout
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </aside>

      {/* ── Mobile Bottom Tab Bar ─────────────────────────────── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#050810]/95 backdrop-blur-[20px] border-t border-white/10 overflow-x-auto">
        <div className="flex items-center justify-around px-1 py-1.5 min-w-fit">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            const isNotifications = item.path === '/notifications';
            const badge = isNotifications && unreadNotificationCount > 0 ? unreadNotificationCount : 0;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className="flex flex-col items-center gap-0.5 px-2.5 py-1.5 rounded-xl transition-all duration-200 min-w-[58px] relative"
              >
                {badge > 0 && (
                  <span className="absolute top-0 right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-black flex items-center justify-center">
                    {badge > 9 ? '9+' : badge}
                  </span>
                )}
                <div className={`p-1.5 rounded-lg transition-all duration-200 ${isActive ? 'bg-[var(--color-gs-primary)]/20 shadow-[0_0_8px_rgba(0,240,255,0.4)]' : ''}`}>
                  <Icon
                    size={18}
                    className={`transition-colors ${isActive ? 'text-[var(--color-gs-primary)]' : 'text-gray-400'}`}
                  />
                </div>
                <span className={`text-[9px] font-semibold truncate w-full text-center transition-colors ${isActive ? 'text-[var(--color-gs-primary)] font-bold' : 'text-gray-400'}`}>
                  {item.label.split(' ')[0]}
                </span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="glass-card p-8 max-w-sm w-full shadow-2xl animate-[slideInUp_0.2s_ease-out] bg-gs-card border border-gs-border rounded-3xl">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center mx-auto mb-4">
                <LogOut size={28} className="text-red-400" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2 font-heading">Logout?</h2>
              <p className="text-gray-400 text-sm mb-6">Are you sure you want to log out of GroupSync?</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowLogoutModal(false)}
                  className="flex-1 py-3 rounded-xl border border-white/20 text-white hover:bg-white/5 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleLogout}
                  className="flex-1 py-3 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold transition-colors shadow-[0_0_15px_rgba(239,68,68,0.3)]"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
