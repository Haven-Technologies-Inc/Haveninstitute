import { useState } from 'react';
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
  const { login } = useAuth();
  const navigate = useNavigate();
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
      
      // Show success message briefly before redirect
      setSuccess('Login successful! Redirecting...');

      // Use intelligent redirect path from backend if available
      const redirectPath = result?.redirectPath?.path || '/app/dashboard';
      const redirectReason = result?.redirectPath?.reason;
      
      // Small delay to show success message
      setTimeout(() => {
        // Show context-specific message based on redirect reason
        if (redirectReason === 'onboarding_incomplete') {
          setSuccess('Welcome! Let\'s complete your profile setup...');
        } else if (redirectReason === 'email_unverified') {
          setSuccess('Please verify your email for full access.');
        } else if (redirectReason === 'low_performance') {
          setSuccess('We\'ve prepared a personalized study plan for you!');
        }
        
        navigate(redirectPath);
      }, 500);
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-950 dark:to-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Back Button */}
        <button 
          onClick={onBackToHome}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 mb-6 transition-colors"
          title="Back to Home"
        >
          <ArrowLeft className="size-4" />
          <span className="text-sm">Back to Home</span>
        </button>

        {/* Login Card */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl shadow-gray-200/50 dark:shadow-none border border-gray-100 dark:border-gray-800 p-8">
          {/* Logo & Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <Logo size="lg" showText={false} />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Welcome back</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Sign in to your Haven Institute account</p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <Alert className="bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800">
                <AlertCircle className="size-4 text-red-600 dark:text-red-400" />
                <AlertDescription className="text-red-800 dark:text-red-300">{error}</AlertDescription>
              </Alert>
            )}
            
            {success && (
              <Alert className="bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800">
                <CheckCircle className="size-4 text-green-600 dark:text-green-400" />
                <AlertDescription className="text-green-800 dark:text-green-300">{success}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                <Input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 h-11 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
                <button
                  type="button"
                  className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400"
                  onClick={() => setShowForgotPassword(true)}
                >
                  Forgot?
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10 h-11 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input 
                type="checkbox" 
                id="remember"
                className="size-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" 
              />
              <label htmlFor="remember" className="text-sm text-gray-600 dark:text-gray-400 cursor-pointer">
                Keep me signed in
              </label>
            </div>

            <Button 
              type="submit" 
              className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors" 
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin size-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Signing in...
                </span>
              ) : (
                'Sign In'
              )}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200 dark:border-gray-700" />
            </div>
            <div className="relative flex justify-center">
              <span className="px-3 bg-white dark:bg-gray-900 text-sm text-gray-500">or</span>
            </div>
          </div>

          {/* Sign Up Link */}
          <button
            type="button"
            onClick={onSwitchToSignup}
            className="w-full h-11 border border-gray-200 dark:border-gray-700 rounded-lg font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            title="Create a new account"
          >
            Create an account
          </button>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-gray-400 dark:text-gray-500 mt-6">
          By signing in, you agree to our Terms of Service and Privacy Policy
        </p>
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