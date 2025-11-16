import { ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { Alert, AlertDescription } from '../ui/alert';
import { Button } from '../ui/button';
import { Shield, ArrowLeft } from 'lucide-react';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: 'admin' | 'student';
  onAccessDenied?: () => void;
}

export function ProtectedRoute({ children, requiredRole, onAccessDenied }: ProtectedRouteProps) {
  const { user } = useAuth();

  // Check if user has required role
  if (requiredRole && user?.role !== requiredRole) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <Alert className="bg-red-50 border-red-200 border-2">
            <Shield className="size-5 text-red-600" />
            <AlertDescription className="text-red-800">
              <h3 className="mb-2">Access Denied</h3>
              <p className="mb-4">
                You don't have permission to access this area. 
                {requiredRole === 'admin' && ' Administrator privileges are required.'}
              </p>
              {onAccessDenied && (
                <Button onClick={onAccessDenied} variant="outline" size="sm">
                  <ArrowLeft className="size-4 mr-2" />
                  Go Back
                </Button>
              )}
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
