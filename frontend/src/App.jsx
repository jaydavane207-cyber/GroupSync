import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet, useNavigate, useOutletContext } from 'react-router-dom';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import Sidebar from './components/layout/Sidebar';
import BrowseGroups from './components/team/BrowseGroups';
import AISuggestions from './components/common/AISuggestions';
import CampusChat from './pages/CampusChat';
import Leaderboard from './pages/Leaderboard';
import GroupDetails from './components/team/GroupDetails';
import UserProfile from './pages/UserProfilePage';
import PublicProfileView from './pages/PublicProfilePage';
import Home from './pages/Home';
import About from './pages/About';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import BackgroundVideo from './components/background/BackgroundVideo';
import { useAppContext } from './context/AppContext';

// Pages
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import DashboardPage from './pages/DashboardPage';
import OnboardingPage from './pages/OnboardingPage';
import ProjectsPage from './pages/ProjectsPage';
import ProjectDetailPage from './pages/ProjectDetailPage';
import CreateProjectPage from './pages/CreateProjectPage';
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
import SkillVerificationPage from './pages/SkillVerificationPage';
import NotFoundPage from './pages/NotFoundPage';
import UnauthorizedPage from './pages/UnauthorizedPage';

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
  const { user, isInitializingAuth } = useAppContext();

  if (isInitializingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center text-blue-500">
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
      <main className="flex-1 min-h-screen p-4 sm:p-6 lg:p-8 ml-0 md:ml-60 relative z-10">
        <div className="max-w-7xl mx-auto w-full">
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
    return <Navigate to={user.onboardingComplete ? '/dashboard' : '/onboarding'} replace />;
  }
  
  return <Outlet />;
};

export default function GroupSyncApp() {
  const { toast, theme } = useAppContext();

  return (
    <BrowserRouter>
      <div className={`relative min-h-screen text-gs-text-main font-sans selection:bg-gs-primary/20 selection:text-gs-text-main theme-${theme}`}>
        { /* Glassmorphism ambient orbs */ }
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
          <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-[radial-gradient(circle,rgba(124,106,246,0.18)_0%,transparent_70%)] blur-[80px] animate-[orbFloat1_18s_ease-in-out_infinite]" />
          <div className="absolute -bottom-32 -right-32 w-[500px] h-[500px] rounded-full bg-[radial-gradient(circle,rgba(167,139,250,0.14)_0%,transparent_70%)] blur-[80px] animate-[orbFloat2_22s_ease-in-out_infinite]" />
          <div className="absolute top-1/2 left-1/2 w-[350px] h-[350px] rounded-full bg-[radial-gradient(circle,rgba(56,189,248,0.07)_0%,transparent_70%)] blur-[80px] animate-[orbFloat3_28s_ease-in-out_infinite]" />
        </div>
        <div className="relative z-10">
          <div className="absolute top-0 left-0 right-0 h-96 pointer-events-none page-header-glow z-0" />


          {toast && (
            <div className={`fixed bottom-5 right-5 z-50 animate-[slideIn_0.15s_ease-out] glass-elevated p-3.5 rounded-xl shadow-lg flex items-center gap-3 border ${
              toast.type === 'error' ? 'border-rose-500/30 text-rose-300' : 'border-gs-border text-gs-text-main'
            }`}>
              {toast.type === 'error'
                ? <XCircle className="text-rose-400 w-4 h-4 shrink-0" />
                : <CheckCircle className="text-emerald-400 w-4 h-4 shrink-0" />
              }
              <p className="text-xs font-medium">{toast.message}</p>
            </div>
          )}

          <Routes>
            {/* Public Routes */}
            <Route element={<PublicLayout />}>
              <Route path="/" element={<HomeWrapper />} />
              <Route path="/home" element={<Navigate to="/" replace />} />
              <Route path="/about" element={<About />} />
            </Route>

            {/* Auth Routes */}
            <Route element={<AuthLayout />}>
              <Route path="/login" element={<LoginPage />} />
            </Route>

            {/* Signup */}
            <Route path="/signup" element={<SignupPage />} />

            {/* Onboarding */}
            <Route path="/onboarding" element={
              <ProtectedRoute>
                <OnboardingPage />
              </ProtectedRoute>
            } />

            {/* App Protected Routes */}
            <Route element={<ProtectedLayout />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/teams" element={<TeamBrowsePage />} />
              <Route path="/teams/create" element={<CreateTeamPage />} />
              <Route path="/teams/:id" element={<TeamDetailPage />} />
              <Route path="/browse" element={<Navigate to="/teams" replace />} />
              <Route path="/ai" element={<AISuggestions />} />
              <Route path="/ai-suggestions" element={<Navigate to="/ai" replace />} />
              <Route path="/projects" element={<ProjectsPage />} />
              <Route path="/projects/create" element={<CreateProjectPage />} />
              <Route path="/projects/:id" element={<ProjectDetailPage />} />
              <Route path="/friends" element={<FriendsPage />} />
              <Route path="/notifications" element={<NotificationsPage />} />
              <Route path="/quiz" element={<QuizPage />} />
              <Route path="/quiz/:quizId/take" element={<TakingQuizPage />} />
              <Route path="/quiz/:quizId/results" element={<QuizResultsPage />} />
              <Route path="/badges" element={<SkillBadgesPage />} />
              <Route path="/verify-skill" element={<SkillVerificationPage />} />
              <Route path="/messages" element={<DirectMessagesPage />} />
              <Route path="/messages/:targetUserId" element={<DMConversationPage />} />
              <Route path="/chat" element={<CampusChat />} />
              <Route path="/campus-chat" element={<Navigate to="/chat" replace />} />
              <Route path="/leaderboard" element={<Leaderboard />} />
              <Route path="/group/:id" element={<GroupDetails />} />
              <Route path="/profile" element={<UserProfile />} />
              <Route path="/profile/edit" element={<EditProfilePage />} />
              <Route path="/public-profile" element={<PublicProfileView />} />
              <Route path="/unauthorized" element={<UnauthorizedPage />} />
            </Route>

            {/* 404 Route */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}

const HomeWrapper = () => {
  const { onNavigate } = useOutletContext();
  const { user, isInitializingAuth } = useAppContext();

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

