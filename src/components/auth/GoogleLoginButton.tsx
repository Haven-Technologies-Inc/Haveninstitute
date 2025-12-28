/**
 * Google Login Button Component
 * 
 * Handles Google OAuth sign-in flow
 */

import { useState, useEffect, useCallback } from 'react';
import { Button } from '../ui/button';
import { Loader2 } from 'lucide-react';
import { useAuth } from './AuthContext';
import oauthApi from '../../services/api/oauthApi';

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: GoogleIdConfiguration) => void;
          prompt: (callback?: (notification: PromptMomentNotification) => void) => void;
          renderButton: (element: HTMLElement, config: GsiButtonConfiguration) => void;
          disableAutoSelect: () => void;
        };
      };
    };
  }
}

interface GoogleIdConfiguration {
  client_id: string;
  callback: (response: GoogleCredentialResponse) => void;
  auto_select?: boolean;
  cancel_on_tap_outside?: boolean;
}

interface GoogleCredentialResponse {
  credential: string;
  select_by: string;
}

interface PromptMomentNotification {
  isDisplayed: () => boolean;
  isNotDisplayed: () => boolean;
  getNotDisplayedReason: () => string;
  isSkippedMoment: () => boolean;
  getSkippedReason: () => string;
  isDismissedMoment: () => boolean;
  getDismissedReason: () => string;
}

interface GsiButtonConfiguration {
  type?: 'standard' | 'icon';
  theme?: 'outline' | 'filled_blue' | 'filled_black';
  size?: 'large' | 'medium' | 'small';
  text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin';
  shape?: 'rectangular' | 'pill' | 'circle' | 'square';
  logo_alignment?: 'left' | 'center';
  width?: string | number;
  locale?: string;
}

interface GoogleLoginButtonProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
  mode?: 'signin' | 'signup' | 'link';
  className?: string;
}

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

export function GoogleLoginButton({ 
  onSuccess, 
  onError, 
  mode = 'signin',
  className = '' 
}: GoogleLoginButtonProps) {
  const [loading, setLoading] = useState(false);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const { login } = useAuth();

  const handleCredentialResponse = useCallback(async (response: GoogleCredentialResponse) => {
    try {
      setLoading(true);
      
      if (mode === 'link') {
        await oauthApi.linkGoogleAccount(response.credential);
        onSuccess?.();
      } else {
        const result = await oauthApi.googleLogin(response.credential);
        
        // Store tokens
        localStorage.setItem('token', result.token);
        localStorage.setItem('refreshToken', result.refreshToken);
        
        // Update auth context
        login(result.token, result.user);
        
        onSuccess?.();
        
        // Redirect based on user state
        if (result.redirectPath) {
          window.location.href = result.redirectPath;
        }
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Google sign-in failed';
      onError?.(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [mode, login, onSuccess, onError]);

  useEffect(() => {
    // Load Google Identity Services script
    if (!document.getElementById('google-gsi-script')) {
      const script = document.createElement('script');
      script.id = 'google-gsi-script';
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => setScriptLoaded(true);
      document.body.appendChild(script);
    } else if (window.google) {
      setScriptLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (scriptLoaded && window.google && GOOGLE_CLIENT_ID) {
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleCredentialResponse,
        auto_select: false,
        cancel_on_tap_outside: true,
      });
    }
  }, [scriptLoaded, handleCredentialResponse]);

  const handleClick = () => {
    if (window.google && GOOGLE_CLIENT_ID) {
      window.google.accounts.id.prompt();
    } else if (!GOOGLE_CLIENT_ID) {
      onError?.('Google Sign-In is not configured');
    }
  };

  const buttonText = {
    signin: 'Sign in with Google',
    signup: 'Sign up with Google',
    link: 'Link Google Account',
  }[mode];

  if (!GOOGLE_CLIENT_ID) {
    return null;
  }

  return (
    <Button
      type="button"
      onClick={handleClick}
      disabled={loading || !scriptLoaded}
      className={`w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 ${className}`}
    >
      {loading ? (
        <Loader2 className="h-5 w-5 animate-spin" />
      ) : (
        <svg className="h-5 w-5" viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          />
        </svg>
      )}
      {buttonText}
    </Button>
  );
}

export default GoogleLoginButton;
