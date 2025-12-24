import { useNavigate } from 'react-router-dom';
import { Onboarding } from '../../components/auth/Onboarding';
import { useAuth } from '../../components/auth/AuthContext';
import { useEffect, useRef } from 'react';

export default function OnboardingPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const hasRedirected = useRef(false);

  useEffect(() => {
    // If no user, redirect to login
    if (!user) {
      navigate('/login', { replace: true });
      return;
    }
    
    // If user has completed onboarding, redirect to dashboard
    // Use ref to prevent redirect loop during the same render cycle
    if (user.hasCompletedOnboarding && !hasRedirected.current) {
      hasRedirected.current = true;
      navigate('/app/dashboard', { replace: true });
    }
  }, [user, navigate]);

  if (!user) {
    return null;
  }

  return <Onboarding />;
}
