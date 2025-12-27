import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Alert, AlertDescription } from '../ui/alert';
import { 
  Mail, 
  Lock, 
  AlertCircle, 
  ArrowLeft, 
  CheckCircle, 
  X, 
  Eye, 
  EyeOff, 
  GraduationCap,
  BookOpen,
  Brain,
  Trophy,
  Users,
  Sparkles,
  Target,
  Shield
} from 'lucide-react';
import { useAuth } from './AuthContext';
import { authApi } from '../../services/authApi';
import { Logo } from '../ui/Logo';

interface LoginProps {
  onSwitchToSignup: () => void;
  onBackToHome: () => void;
}

export function Login({ onSwitchToSignup, onBackToHome }: LoginProps) {
  const { login, user, setUserFromLogin } = useAuth();
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate(user.role === 'admin' ? '/admin' : '/app/dashboard', { replace: true });
    }
  }, [user, navigate]);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Forgot password state
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotSuccess, setForgotSuccess] = useState(false);
  const [forgotError, setForgotError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    // Basic validation
    if (!email.trim()) {
      setError('Please enter your email address.');
      setIsLoading(false);
      return;
    }
    if (!password) {
      setError('Please enter your password.');
      setIsLoading(false);
      return;
    }

    try {
      const result = await login(email, password);
      
      // Use intelligent redirect path from backend if available
      const redirectPath = result?.redirectPath?.path || '/app/dashboard';
      const redirectReason = result?.redirectPath?.reason;
      
      // Show context-specific message based on redirect reason
      let successMessage = 'Login successful! Redirecting...';
      if (redirectReason === 'onboarding_incomplete') {
        successMessage = 'Welcome! Let\'s complete your profile setup...';
      } else if (redirectReason === 'email_unverified') {
        successMessage = 'Please verify your email for full access.';
      } else if (redirectReason === 'low_performance') {
        successMessage = 'We\'ve prepared a personalized study plan for you!';
      } else if (redirectReason === 'admin_role') {
        successMessage = 'Welcome back, Admin!';
      }
      
      setSuccess(successMessage);
      
      // Navigate FIRST, then set user state to avoid PublicRoute race condition
      navigate(redirectPath, { replace: true });
      
      // Set user state after navigation is initiated
      // This allows ProtectedRoute to read from localStorage while state catches up
      setTimeout(() => {
        setUserFromLogin(result.user);
      }, 0);
    } catch (err: any) {
      // Parse error message for user-friendly display
      let errorMessage = 'Login failed. Please try again.';
      
      if (err instanceof Error) {
        errorMessage = err.message;
      } else if (err?.message) {
        errorMessage = err.message;
      }
      
      // Make error messages more user-friendly
      if (errorMessage.toLowerCase().includes('invalid') || 
          errorMessage.toLowerCase().includes('credentials') ||
          errorMessage.toLowerCase().includes('password')) {
        errorMessage = 'Invalid email or password. Please check your credentials and try again.';
      } else if (errorMessage.toLowerCase().includes('network') || 
                 errorMessage.toLowerCase().includes('fetch')) {
        errorMessage = 'Unable to connect to server. Please check your internet connection.';
      } else if (errorMessage.toLowerCase().includes('not found')) {
        errorMessage = 'No account found with this email. Please sign up first.';
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError('');
    setForgotLoading(true);

    try {
      await authApi.forgotPassword(forgotEmail);
      setForgotSuccess(true);
    } catch (err) {
      setForgotError(err instanceof Error ? err.message : 'Failed to send reset email. Please try again.');
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <Logo size="2xl" showText={false} />
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm px-4 py-3 rounded-lg">
              {error}
            </div>
          )}
          
          {success && (
            <div className="bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 text-sm px-4 py-3 rounded-lg">
              {success}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Email
            </label>
            <Input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-12 px-4 bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-800 rounded-lg"
              required
            />
          </div>

          <div>
            <div className="flex justify-between mb-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Password
              </label>
              <button
                type="button"
                className="text-sm text-blue-600 hover:text-blue-700"
                onClick={() => setShowForgotPassword(true)}
              >
                Forgot?
              </button>
            </div>
            <div className="relative">
              <Input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-12 px-4 pr-12 bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-800 rounded-lg"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 z-10"
                title={showPassword ? 'Hide password' : 'Show password'}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg" 
            disabled={isLoading}
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>

        {/* Sign up link */}
        <p className="text-center text-sm text-gray-500 mt-8">
          Don't have an account?{' '}
          <button
            type="button"
            onClick={onSwitchToSignup}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Sign up
          </button>
        </p>

        {/* Back link */}
        <button 
          onClick={onBackToHome}
          className="flex items-center justify-center gap-2 w-full text-gray-400 hover:text-gray-600 mt-6 text-sm"
          title="Back to Home"
        >
          <ArrowLeft className="size-4" />
          Back to Home
        </button>
      </div>

      {/* Forgot Password Modal */}
      {showForgotPassword && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md shadow-2xl">
            <CardHeader className="relative">
              <button
                onClick={() => {
                  setShowForgotPassword(false);
                  setForgotSuccess(false);
                  setForgotError('');
                  setForgotEmail('');
                }}
                className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
              >
                <X className="size-5" />
              </button>
              <CardTitle>Reset Password</CardTitle>
              <CardDescription>
                Enter your email address and we'll send you a link to reset your password.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {forgotSuccess ? (
                <div className="text-center py-4">
                  <CheckCircle className="size-12 text-green-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Check your email</h3>
                  <p className="text-gray-600 mb-4">
                    If an account exists with <strong>{forgotEmail}</strong>, you'll receive a password reset link shortly.
                  </p>
                  <Button
                    onClick={() => {
                      setShowForgotPassword(false);
                      setForgotSuccess(false);
                      setForgotEmail('');
                    }}
                    className="w-full"
                  >
                    Back to Login
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleForgotPassword} className="space-y-4">
                  {forgotError && (
                    <Alert className="bg-red-50 border-red-200">
                      <AlertCircle className="size-4 text-red-600" />
                      <AlertDescription className="text-red-800">{forgotError}</AlertDescription>
                    </Alert>
                  )}

                  <div>
                    <label className="text-gray-700 mb-2 block">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 size-4 text-gray-400" />
                      <Input
                        type="email"
                        placeholder="you@example.com"
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <Button type="submit" className="w-full" disabled={forgotLoading}>
                    {forgotLoading ? 'Sending...' : 'Send Reset Link'}
                  </Button>

                  <button
                    type="button"
                    onClick={() => setShowForgotPassword(false)}
                    className="w-full text-center text-gray-600 hover:text-gray-900"
                  >
                    Back to Login
                  </button>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}