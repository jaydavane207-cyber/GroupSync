import React from 'react';
import OnboardingFlow from '@/components/profile/OnboardingFlow';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAppContext } from '@/context/AppContext';

export default function OnboardingPage() {
  const navigate = useNavigate();
  const { user, isInitializingAuth, setUser } = useAppContext();

  if (isInitializingAuth) return null;

  // If user already completed onboarding, skip to dashboard
  if (user?.onboardingComplete) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleComplete = async (onboardingData) => {
    // BUG-8 FIX: Only navigate if setUser succeeds
    const success = await setUser({
      ...user, // preserve id
      ...onboardingData
    });
    if (success) {
      navigate('/dashboard', { replace: true });
    }
    // If failed, setUser already shows an error toast â€” stay on page
  };

  return (
    <OnboardingFlow onComplete={handleComplete} />
  );
}

