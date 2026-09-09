import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet, useNavigate, useOutletContext } from 'react-router-dom';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import Sidebar from './components/Sidebar';
import BrowseGroups from './components/BrowseGroups';
import AISuggestions from './components/AISuggestions';
import CampusChat from './components/CampusChat';
import Leaderboard from './components/Leaderboard';
import GroupDetails from './components/GroupDetails';
import UserProfile from './components/UserProfile';
import PublicProfileView from './components/PublicProfileView';
import Home from './components/Home';
import About from './components/About';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import BackgroundVideo from './components/BackgroundVideo';
import { useAppContext } from './context/AppContext';

// Pages
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import DashboardPage from './pages/DashboardPage';
import OnboardingPage from './pages/OnboardingPage';
import ProjectsPage from './pages/ProjectsPage';
import FriendsPage from './pages/FriendsPage';
import NotificationsPage from './pages/NotificationsPage';
import QuizPage from './pages/QuizPage';
import TakingQuizPage from './pages/TakingQuizPage';
import QuizResultsPage from './pages/QuizResultsPage';
import SkillBadgesPage from './pages/SkillBadgesPage';
import TeamBrowsePage from './pages/TeamBrowsePage';
import CreateTeamPage from './pages/CreateTeamPage';
import TeamDetailPage from './pages/TeamDetailPage';
import EditProfilePage from './pages/EditProfilePage';
import DirectMessagesPage from './pages/DirectMessagesPage';
import DMConversationPage from './pages/DMConversationPage';

const PublicLayout = () => {
  const navigate = useNavigate();
  const handleNav = (page) => {
    if (page === 'home' || page === 'how-it-works') navigate('/');
    else if (page === 'login') navigate('/login');
    else if (page === 'signup') navigate('/signup');
    else navigate(`/${page}`);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar onNavigate={handleNav} />
      <main className="flex-1">
        <Outlet context={{ onNavigate: handleNav }} />
      </main>
      <Footer onNavigate={handleNav} />
    </div>
  );
};

const ProtectedLayout = () => {
  const { user, isInitializingAuth, theme } = useAppContext();

  if (isInitializingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gs-cyan">
        <Loader2 className="w-12 h-12 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Ensure users with incomplete profiles are redirected to onboarding
  if (!user.onboardingComplete) {
    return <Navigate to="/onboarding" replace />;
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 overflow-y-auto min-h-screen p-4 md:p-8 ml-0 md:ml-56 relative z-10">
        <div className={`w-full backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.08)] rounded-3xl p-6 md:p-10 min-h-[85vh] text-gs-text-main ${theme === 'light' ? 'bg-white/40 border border-white/60' : 'bg-[#050810]/60 border border-white/5 shadow-[0_0_40px_rgba(0,0,0,0.3)]'}`}>
          <Outlet />
        </div>
      </main>
    </div>
  );
};

const AuthLayout = () => {
  const { user, isInitializingAuth } = useAppContext();

  if (isInitializingAuth) return null;
  if (user) {
    // New users who haven't filled in their profile yet → send to onboarding
    // Returning users with a complete profile → send to dashboard
    return <Navigate to={user.onboardingComplete ? '/dashboard' : '/onboarding'} replace />;
  }
  
  return <Outlet />;
};

export default function GroupSyncApp() {
  const { toast, theme } = useAppContext();

  return (
    <BrowserRouter>
      <div className={`relative min-h-screen text-gs-text-main font-sans selection:bg-gs-cyan selection:text-gs-text-main theme-${theme}`}>
        <BackgroundVideo />
        <div className="relative z-10">
        {toast && (
          <div className={`fixed bottom-4 right-4 z-50 animate-[slideIn_0.3s_ease-out] bg-gs-card p-4 rounded-xl shadow-[0_0_15px_rgba(0,0,0,0.5)] flex items-center gap-3 border ${
            toast.type === 'error' ? 'border-red-500/50' : 'border-gs-border'
          }`}>
            {toast.type === 'error'
              ? <XCircle className="text-red-400 w-5 h-5 shrink-0" />
              : <CheckCircle className="text-gs-green w-5 h-5 shrink-0" />
            }
            <p className={toast.type === 'error' ? 'text-red-300' : ''}>{toast.message}</p>
          </div>
        )}

        <style dangerouslySetInnerHTML={{__html: `
          @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
          }
          @keyframes pulse-glow {
            0%, 100% { box-shadow: 0 0 10px currentColor; }
            50% { box-shadow: 0 0 25px currentColor; }
          }
          @keyframes fill-bar {
            from { width: 0; }
          }
          @keyframes float {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-5px); }
          }
        `}} />

        <Routes>
          {/* Public Routes */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<HomeWrapper />} />
            <Route path="/home" element={<Navigate to="/" replace />} />
            <Route path="/about" element={<About />} />
          </Route>

          {/* Auth Routes - Login only (signup manages its own redirects) */}
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<LoginPage />} />
          </Route>

          {/* Signup - standalone, manages its own session/redirect logic */}
          <Route path="/signup" element={<SignupPage />} />

          {/* Onboarding */}
          <Route path="/onboarding" element={
            <ProtectedRoute>
              <OnboardingPage />
            </ProtectedRoute>
          } />

          {/* App Routes */}
          <Route element={<ProtectedLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/teams" element={<TeamBrowsePage />} />
            <Route path="/teams/create" element={<CreateTeamPage />} />
            <Route path="/teams/:id" element={<TeamDetailPage />} />
            <Route path="/browse" element={<Navigate to="/teams" replace />} />
            <Route path="/ai" element={<AISuggestions />} />
            <Route path="/ai-suggestions" element={<Navigate to="/ai" replace />} />
            <Route path="/projects" element={<ProjectsPage />} />
            <Route path="/friends" element={<FriendsPage />} />
            <Route path="/notifications" element={<NotificationsPage />} />
            <Route path="/quiz" element={<QuizPage />} />
            <Route path="/quiz/:quizId/take" element={<TakingQuizPage />} />
            <Route path="/quiz/:quizId/results" element={<QuizResultsPage />} />
            <Route path="/badges" element={<SkillBadgesPage />} />
            <Route path="/messages" element={<DirectMessagesPage />} />
            <Route path="/messages/:targetUserId" element={<DMConversationPage />} />
            <Route path="/chat" element={<CampusChat />} />
            <Route path="/campus-chat" element={<Navigate to="/chat" replace />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/group/:id" element={<GroupDetails />} />
            <Route path="/profile" element={<UserProfile />} />
            <Route path="/profile/edit" element={<EditProfilePage />} />
            <Route path="/public-profile" element={<PublicProfileView />} />
          </Route>

          {/* 404 Page */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}

const NotFoundPage = () => (
  <div className="min-h-screen flex flex-col items-center justify-center text-center p-8">
    <div className="relative mb-8">
      <span className="text-[120px] font-black text-gs-border select-none">404</span>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-5xl">🔭</span>
      </div>
    </div>
    <h1 className="text-3xl font-bold text-gs-text-main mb-3">Page Not Found</h1>
    <p className="text-gs-text-muted max-w-sm mb-8">This page doesn't exist or has been moved. Let's get you back on track.</p>
    <a href="/" className="px-6 py-3 bg-gs-cyan text-[#0f172a] font-bold rounded-xl hover:bg-cyan-400 transition-all shadow-[0_0_15px_rgba(0,212,255,0.3)]">
      Go Home
    </a>
  </div>
);

const HomeWrapper = () => {
  const { onNavigate } = useOutletContext();
  const { user, isInitializingAuth } = useAppContext();

  // Handle Google OAuth redirect landing on homepage
  // After OAuth, Supabase returns to '/', so we need to forward them appropriately
  if (!isInitializingAuth && user) {
    return <Navigate to={user.onboardingComplete ? '/dashboard' : '/onboarding'} replace />;
  }

  return <Home onNavigate={onNavigate} />;
};

const ProtectedRoute = ({ children }) => {
  const { user, isInitializingAuth } = useAppContext();
  
  if (isInitializingAuth) return null;
  if (!user) return <Navigate to="/login" replace />;
  
  return children;
};
