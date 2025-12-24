import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { CheckCircle, XCircle, Loader2, Mail } from 'lucide-react';
import { authApi } from '../../services/authApi';
import { Logo } from '../../components/ui/Logo';

export default function VerifyEmailPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Invalid verification link. Please check your email for the correct link.');
      return;
    }

    const verifyEmail = async () => {
      try {
        const response = await authApi.verifyEmail(token);
        if (response.success) {
          setStatus('success');
          setMessage(response.data?.message || 'Your email has been verified successfully!');
        } else {
          setStatus('error');
          setMessage('Email verification failed. The link may have expired.');
        }
      } catch (err: any) {
        setStatus('error');
        setMessage(err.message || 'Email verification failed. Please try again or request a new verification email.');
      }
    };

    verifyEmail();
  }, [token]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo & Header */}
        <div className="text-center mb-8">
          <div className="flex flex-col items-center gap-2">
            <Logo size="xl" showText={false} />
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Haven Institute</h1>
              <p className="text-gray-600 dark:text-gray-400">Email Verification</p>
            </div>
          </div>
        </div>

        <Card className="shadow-xl border-2 dark:bg-gray-800 dark:border-gray-700">
          <CardHeader className="text-center">
            <CardTitle>
              {status === 'loading' && 'Verifying your email...'}
              {status === 'success' && 'Email Verified!'}
              {status === 'error' && 'Verification Failed'}
            </CardTitle>
            <CardDescription>
              {status === 'loading' && 'Please wait while we verify your email address.'}
              {status === 'success' && 'Your account is now fully activated.'}
              {status === 'error' && 'There was a problem verifying your email.'}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            {status === 'loading' && (
              <div className="py-8">
                <Loader2 className="size-16 text-blue-500 animate-spin mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400">Verifying...</p>
              </div>
            )}

            {status === 'success' && (
              <div className="py-8">
                <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="size-12 text-green-500" />
                </div>
                <Alert className="bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800 mb-6">
                  <CheckCircle className="size-4 text-green-600" />
                  <AlertDescription className="text-green-800 dark:text-green-300">{message}</AlertDescription>
                </Alert>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  You can now access all features of Haven Institute. Start your NCLEX preparation journey!
                </p>
                <Button onClick={() => navigate('/login')} className="w-full">
                  Continue to Login
                </Button>
              </div>
            )}

            {status === 'error' && (
              <div className="py-8">
                <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <XCircle className="size-12 text-red-500" />
                </div>
                <Alert className="bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800 mb-6">
                  <XCircle className="size-4 text-red-600" />
                  <AlertDescription className="text-red-800 dark:text-red-300">{message}</AlertDescription>
                </Alert>
                <div className="space-y-3">
                  <Button onClick={() => navigate('/login')} variant="outline" className="w-full">
                    <Mail className="size-4 mr-2" />
                    Back to Login
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
