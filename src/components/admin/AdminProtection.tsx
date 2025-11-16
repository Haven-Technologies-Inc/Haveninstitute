import { ReactNode } from 'react';
import { useAuth } from '../auth/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Shield, Lock, ArrowLeft } from 'lucide-react';

interface AdminProtectionProps {
  children: ReactNode;
  onAccessDenied: () => void;
}

export function AdminProtection({ children, onAccessDenied }: AdminProtectionProps) {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md border-2 border-red-200">
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-red-100 p-2 rounded-lg">
                <Lock className="size-6 text-red-600" />
              </div>
              <CardTitle>Authentication Required</CardTitle>
            </div>
            <CardDescription>You must be logged in to access the admin panel</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={onAccessDenied} className="w-full">
              <ArrowLeft className="size-4 mr-2" />
              Return to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md border-2 border-red-200">
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-red-100 p-2 rounded-lg">
                <Shield className="size-6 text-red-600" />
              </div>
              <CardTitle>Access Denied</CardTitle>
            </div>
            <CardDescription>
              Administrator privileges are required to access this area
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-yellow-900 mb-2">Current Role: <strong>{user.role}</strong></p>
              <p className="text-yellow-800">Required Role: <strong>admin</strong></p>
            </div>
            <p className="text-gray-600">
              If you believe you should have admin access, please contact your system administrator.
            </p>
            <Button onClick={onAccessDenied} variant="outline" className="w-full">
              <ArrowLeft className="size-4 mr-2" />
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}
