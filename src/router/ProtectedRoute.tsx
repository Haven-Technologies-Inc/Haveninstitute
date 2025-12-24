import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../components/auth/AuthContext';
import { UserLayout } from '../components/UserLayout';

interface ProtectedRouteProps {
  requiredRole?: 'admin' | 'user';
}

export function ProtectedRoute({ requiredRole }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  // Show loading while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Authenticating...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check role requirement
  if (requiredRole === 'admin' && user.role !== 'admin') {
    return <Navigate to="/app/dashboard" replace />;
  }

  // Check onboarding
  if (!user.hasCompletedOnboarding && location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" replace />;
  }

  // Extract current view from pathname for UserLayout
  const currentView = location.pathname.split('/').pop() || 'dashboard';

  // Wrap with appropriate layout
  if (requiredRole === 'admin') {
    // Admin layout is handled by the admin page itself
    return <Outlet />;
  }

  // User routes get UserLayout wrapper
  return (
    <UserLayout currentView={currentView}>
      <Outlet />
    </UserLayout>
  );
}
