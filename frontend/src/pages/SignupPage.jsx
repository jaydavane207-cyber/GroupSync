import React from 'react';
import Signup from '@/components/forms/Signup';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAppContext } from '@/context/AppContext';

export default function SignupPage() {
  const navigate = useNavigate();
  const { user, isInitializingAuth } = useAppContext();

  // Still loading auth state â€” show nothing briefly
  if (isInitializingAuth) return null;

  // Already fully signed up? Go to dashboard
  if (user && user.onboardingComplete) {
    return <Navigate to="/dashboard" replace />;
  }

  // user exists but onboardingComplete is false = they just verified email,
  // /onboarding will handle the rest â€” redirect there
  if (user && !user.onboardingComplete) {
    return <Navigate to="/onboarding" replace />;
  }

  return <Signup onNavigate={(page) => navigate(`/${page}`)} />;
}

