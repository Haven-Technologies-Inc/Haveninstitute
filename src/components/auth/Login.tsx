import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Alert, AlertDescription } from '../ui/alert';
import { Mail, Lock, AlertCircle, Heart, ArrowLeft, CheckCircle, X, Eye, EyeOff, GraduationCap } from 'lucide-react';
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
    setIsLoading(true);

    try {
      await login(email, password);

      // Get user from localStorage after login
      const storedUser = localStorage.getItem('nursehaven_user');
      if (storedUser) {
        const loggedInUser = JSON.parse(storedUser);

        // Intelligent redirect based on user role and state
        if (loggedInUser.role === 'admin' || loggedInUser.role === 'moderator' || loggedInUser.role === 'instructor') {
          navigate('/admin');
        } else if (!loggedInUser.hasCompletedOnboarding) {
          navigate('/onboarding');
        } else {
          navigate('/app/dashboard');
        }
      } else {
        navigate('/app/dashboard');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed. Please try again.');
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
    <div className={`min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 flex items-center justify-center p-4 transition-colors`}>
      <div className="w-full max-w-md">
        {/* Back to Home Button */}
        <div className="mb-4">
          <Button
            variant="ghost"
            onClick={onBackToHome}
            className="gap-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
          >
            <ArrowLeft className="size-4" />
            Back to Home
          </Button>
        </div>

        {/* Logo & Header */}
        <div className="text-center mb-8">
          <div className="flex flex-col items-center gap-2">
            <Logo size="xl" showText={false} />
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Haven Institute</h1>
              <p className="text-gray-600 dark:text-gray-400">Excellence in NCLEX Preparation</p>
            </div>
          </div>
        </div>

        {/* Login Card */}
        <Card className="shadow-xl border-2 dark:bg-gray-800 dark:border-gray-700">
          <CardHeader>
            <CardTitle>Welcome Back</CardTitle>
            <CardDescription>Sign in to continue your NCLEX preparation journey</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert className="bg-red-50 border-red-200">
                  <AlertCircle className="size-4 text-red-600" />
                  <AlertDescription className="text-red-800">{error}</AlertDescription>
                </Alert>
              )}

              <div>
                <label className="text-gray-700 dark:text-gray-300 mb-2 block">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 size-4 text-gray-400" />
                  <Input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-gray-700 dark:text-gray-300 mb-2 block">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 size-4 text-gray-400" />
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="rounded" />
                  <span className="text-gray-600">Remember me</span>
                </label>
                <button
                  type="button"
                  className="text-blue-600 hover:underline"
                  onClick={() => setShowForgotPassword(true)}
                >
                  Forgot password?
                </button>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>

            {/* Signup Link */}
            <div className="mt-6 text-center">
              <p className="text-gray-600">
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={onSwitchToSignup}
                  className="text-blue-600 hover:underline"
                >
                  Sign up for free
                </button>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Features Preview */}
        <div className="mt-6 text-center text-gray-600">
          <div className="flex items-center justify-center gap-6">
            <div className="flex items-center gap-2">
              <Heart className="size-4 text-red-500" />
              <span>AI-Powered</span>
            </div>
            <span>•</span>
            <div className="flex items-center gap-2">
              <GraduationCap className="size-4 text-blue-500" />
              <span>CAT Testing</span>
            </div>
            <span>•</span>
            <span>1000+ Questions</span>
          </div>
        </div>
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