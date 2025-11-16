import { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Alert, AlertDescription } from '../ui/alert';
import { GraduationCap, Mail, Lock, AlertCircle, Heart, ArrowLeft } from 'lucide-react';
import { useAuth } from './AuthContext';

interface LoginProps {
  onSwitchToSignup: () => void;
  onBackToHome: () => void;
}

export function Login({ onSwitchToSignup, onBackToHome }: LoginProps) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(email, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Back to Home Button */}
        <div className="mb-4">
          <Button
            variant="ghost"
            onClick={onBackToHome}
            className="gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="size-4" />
            Back to Home
          </Button>
        </div>

        {/* Logo & Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="bg-gradient-to-br from-blue-600 to-purple-600 p-3 rounded-xl shadow-lg">
              <GraduationCap className="size-8 text-white" />
            </div>
            <div className="text-left">
              <h1 className="text-3xl">Haven Institute</h1>
              <p className="text-gray-600">Excellence in NCLEX Preparation</p>
            </div>
          </div>
        </div>

        {/* Login Card */}
        <Card className="shadow-xl border-2">
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
                <label className="text-gray-700 mb-2 block">Email Address</label>
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
                <label className="text-gray-700 mb-2 block">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 size-4 text-gray-400" />
                  <Input
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="rounded" />
                  <span className="text-gray-600">Remember me</span>
                </label>
                <button type="button" className="text-blue-600 hover:underline">
                  Forgot password?
                </button>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>

            {/* Demo Credentials */}
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-blue-900 mb-2">🔐 Demo Credentials:</p>
              <div className="text-blue-800 space-y-2 text-sm">
                <div>
                  <p className="font-semibold">👨‍💼 Admin Access:</p>
                  <p className="ml-4">Email: <code className="bg-white px-2 py-0.5 rounded">admin@nursehaven.com</code></p>
                  <p className="ml-4">Password: <code className="bg-white px-2 py-0.5 rounded">admin123</code></p>
                </div>
                <div className="border-t border-blue-300 pt-2">
                  <p className="font-semibold">👩‍⚕️ Student Access:</p>
                  <p className="ml-4">Email: <code className="bg-white px-2 py-0.5 rounded">student@demo.com</code></p>
                  <p className="ml-4">Password: <code className="bg-white px-2 py-0.5 rounded">student123</code></p>
                </div>
                <div className="border-t border-blue-300 pt-2">
                  <p className="ml-4 text-xs">Or create your own account below!</p>
                </div>
              </div>
            </div>

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
    </div>
  );
}