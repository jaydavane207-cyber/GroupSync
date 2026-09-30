import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import Sidebar from './Sidebar';
import { useAppContext } from '@/context/AppContext';

export const ProtectedLayout = () => {
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

export default ProtectedLayout;

