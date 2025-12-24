import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { CheckCircle, XCircle, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { authApi } from '../../services/authApi';
import { Logo } from '../../components/ui/Logo';

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<'form' | 'success' | 'error'>('form');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!token) {
      setError('Invalid reset link. Please request a new password reset.');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    // Check for password strength
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    
    if (!hasUpperCase || !hasLowerCase || !hasNumber) {
      setError('Password must contain at least one uppercase letter, one lowercase letter, and one number.');
      return;
    }

    setIsLoading(true);

    try {
      const response = await authApi.resetPassword(token, password, confirmPassword);
      if (response.success) {
        setStatus('success');
      } else {
        setError('Failed to reset password. Please try again.');
      }
    } catch (err: any) {
      if (err.message?.toLowerCase().includes('expired')) {
        setError('This reset link has expired. Please request a new password reset.');
      } else if (err.message?.toLowerCase().includes('invalid')) {
        setError('Invalid reset link. Please request a new password reset.');
      } else {
        setError(err.message || 'Failed to reset password. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <Logo size="xl" showText={false} />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mt-4">Haven Institute</h1>
          </div>
          <Card className="shadow-xl border-2 dark:bg-gray-800 dark:border-gray-700">
            <CardContent className="text-center py-8">
              <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <XCircle className="size-12 text-red-500" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Invalid Reset Link</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                This password reset link is invalid or has expired.
              </p>
              <Button onClick={() => navigate('/login')} className="w-full">
                Back to Login
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo & Header */}
        <div className="text-center mb-8">
          <div className="flex flex-col items-center gap-2">
            <Logo size="xl" showText={false} />
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Haven Institute</h1>
              <p className="text-gray-600 dark:text-gray-400">Reset Your Password</p>
            </div>
          </div>
        </div>

        <Card className="shadow-xl border-2 dark:bg-gray-800 dark:border-gray-700">
          <CardHeader>
            <CardTitle>
              {status === 'form' && 'Create New Password'}
              {status === 'success' && 'Password Reset Successful!'}
            </CardTitle>
            <CardDescription>
              {status === 'form' && 'Enter a new password for your account.'}
              {status === 'success' && 'Your password has been updated.'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {status === 'success' ? (
              <div className="text-center py-4">
                <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="size-12 text-green-500" />
                </div>
                <Alert className="bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800 mb-6">
                  <CheckCircle className="size-4 text-green-600" />
                  <AlertDescription className="text-green-800 dark:text-green-300">
                    Your password has been reset successfully!
                  </AlertDescription>
                </Alert>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  You can now log in with your new password.
                </p>
                <Button onClick={() => navigate('/login')} className="w-full">
                  Continue to Login
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <Alert className="bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800">
                    <AlertCircle className="size-4 text-red-600 dark:text-red-400" />
                    <AlertDescription className="text-red-800 dark:text-red-300">{error}</AlertDescription>
                  </Alert>
                )}

                <div>
                  <label className="text-gray-700 dark:text-gray-300 mb-2 block">New Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 size-4 text-gray-400" />
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter new password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 pr-10"
                      required
                      minLength={8}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      title={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Must be at least 8 characters with uppercase, lowercase, and number
                  </p>
                </div>

                <div>
                  <label className="text-gray-700 dark:text-gray-300 mb-2 block">Confirm Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 size-4 text-gray-400" />
                    <Input
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="Confirm new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="pl-10 pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      title={showConfirmPassword ? 'Hide password' : 'Show password'}
                    >
                      {showConfirmPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                  </div>
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Resetting Password...' : 'Reset Password'}
                </Button>

                <button
                  type="button"
                  onClick={() => navigate('/login')}
                  className="w-full text-center text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                >
                  Back to Login
                </button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
