import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom';
import { useAuth, AuthProvider } from './components/auth/AuthContext';
import { DarkModeProvider } from './components/DarkModeContext';

// Lazy load pages for better performance
import { lazy, Suspense } from 'react';

// Auth Pages
const LandingPage = lazy(() => import('./pages/LandingPage'));
const LoginPage = lazy(() => import('./pages/auth/LoginPage'));
const SignupPage = lazy(() => import('./pages/auth/SignupPage'));
const VerifyEmailPage = lazy(() => import('./pages/auth/VerifyEmailPage'));
const ResetPasswordPage = lazy(() => import('./pages/auth/ResetPasswordPage'));

// Dashboard
const DashboardPage = lazy(() => import('./pages/dashboard/DashboardPage'));

// Practice Pages
const PracticePage = lazy(() => import('./pages/practice/PracticePage'));
const QuickPracticePage = lazy(() => import('./pages/practice/QuickPracticePage'));
const QuizStartPage = lazy(() => import('./pages/practice/QuizStartPage'));
const QuizSessionPage = lazy(() => import('./pages/practice/QuizSessionPage'));
const QuizResultPage = lazy(() => import('./pages/practice/QuizResultPage'));
const CATStartPage = lazy(() => import('./pages/practice/CATStartPage'));
const CATSessionPage = lazy(() => import('./pages/practice/CATSessionPage'));
const CATResultPage = lazy(() => import('./pages/practice/CATResultPage'));
const NCLEXSimulatorPage = lazy(() => import('./pages/practice/NCLEXSimulatorPage'));
const NCLEXExamSimulator = lazy(() => import('./pages/practice/NCLEXExamSimulator'));
const UnifiedPracticePage = lazy(() => import('./pages/practice/UnifiedPracticePage'));
const PracticeSessionPage = lazy(() => import('./pages/practice/PracticeSessionPage'));

// Study Pages
const FlashcardsPage = lazy(() => import('./pages/study/FlashcardsPage'));
const BooksPage = lazy(() => import('./pages/study/BooksPage'));
const AIChatPage = lazy(() => import('./pages/study/AIChatPage'));

// Progress Pages
const ProgressPage = lazy(() => import('./pages/progress/ProgressPage'));
const AnalyticsPage = lazy(() => import('./pages/progress/AnalyticsPage'));
const StudyPlannerPage = lazy(() => import('./pages/progress/StudyPlannerPage'));

// Community Pages
const ForumPage = lazy(() => import('./pages/community/ForumPage'));
const StudyGroupsPage = lazy(() => import('./pages/community/StudyGroupsPage'));

// Account Pages
const ProfilePage = lazy(() => import('./pages/account/ProfilePage'));
const SettingsPage = lazy(() => import('./pages/account/SettingsPage'));
const SubscriptionPage = lazy(() => import('./pages/account/SubscriptionPage'));

// Admin Pages
const AdminDashboardPage = lazy(() => import('./pages/admin/AdminDashboardPage'));
const QuestionManagementPage = lazy(() => import('./pages/admin/QuestionManagementPage'));

// Layouts
import { UserLayout } from './components/UserLayout';
import { AdminLayout } from './components/admin/AdminLayout';

// Loading component
function PageLoader() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600 dark:text-gray-400">Loading...</p>
      </div>
    </div>
  );
}

// Protected Route wrapper
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <PageLoader />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

// Admin Route wrapper
function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <PageLoader />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== 'admin') {
    return <Navigate to="/app/dashboard" replace />;
  }

  return <>{children}</>;
}

// Public Route wrapper (redirect if already logged in)
function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <PageLoader />;
  }

  if (user) {
    if (user.role === 'admin') {
      return <Navigate to="/admin" replace />;
    }
    return <Navigate to="/app/dashboard" replace />;
  }

  return <>{children}</>;
}

// User Layout wrapper
function UserLayoutWrapper() {
  return (
    <ProtectedRoute>
      <UserLayout>
        <Suspense fallback={<PageLoader />}>
          <Outlet />
        </Suspense>
      </UserLayout>
    </ProtectedRoute>
  );
}

export const router = createBrowserRouter([
  // Public routes
  {
    path: '/',
    element: (
      <PublicRoute>
        <Suspense fallback={<PageLoader />}>
          <LandingPage />
        </Suspense>
      </PublicRoute>
    ),
  },
  {
    path: '/login',
    element: (
      <PublicRoute>
        <Suspense fallback={<PageLoader />}>
          <LoginPage />
        </Suspense>
      </PublicRoute>
    ),
  },
  {
    path: '/signup',
    element: (
      <PublicRoute>
        <Suspense fallback={<PageLoader />}>
          <SignupPage />
        </Suspense>
      </PublicRoute>
    ),
  },
  {
    path: '/verify-email',
    element: (
      <Suspense fallback={<PageLoader />}>
        <VerifyEmailPage />
      </Suspense>
    ),
  },
  {
    path: '/reset-password',
    element: (
      <Suspense fallback={<PageLoader />}>
        <ResetPasswordPage />
      </Suspense>
    ),
  },

  // Protected user routes
  {
    path: '/app',
    element: <UserLayoutWrapper />,
    children: [
      {
        index: true,
        element: <Navigate to="/app/dashboard" replace />,
      },
      {
        path: 'dashboard',
        element: <DashboardPage />,
      },
      // Practice routes
      {
        path: 'practice',
        element: <PracticePage />,
      },
      {
        path: 'practice/quick',
        element: <QuickPracticePage />,
      },
      {
        path: 'practice/quiz',
        element: <QuizStartPage />,
      },
      {
        path: 'practice/quiz/:sessionId',
        element: <QuizSessionPage />,
      },
      {
        path: 'practice/quiz/:sessionId/results',
        element: <QuizResultPage />,
      },
      {
        path: 'practice/cat',
        element: <CATStartPage />,
      },
      {
        path: 'practice/cat/:sessionId',
        element: <CATSessionPage />,
      },
      {
        path: 'practice/cat/:sessionId/results',
        element: <CATResultPage />,
      },
      {
        path: 'practice/nclex',
        element: <NCLEXSimulatorPage />,
      },
      {
        path: 'practice/nclex-exam',
        element: <NCLEXExamSimulator />,
      },
      {
        path: 'practice/unified',
        element: <UnifiedPracticePage />,
      },
      {
        path: 'practice/session',
        element: <PracticeSessionPage />,
      },
      // Study routes
      {
        path: 'study/flashcards',
        element: <FlashcardsPage />,
      },
      {
        path: 'study/books',
        element: <BooksPage />,
      },
      {
        path: 'study/ai',
        element: <AIChatPage />,
      },
      // Progress routes
      {
        path: 'progress',
        element: <ProgressPage />,
      },
      {
        path: 'progress/analytics',
        element: <AnalyticsPage />,
      },
      {
        path: 'progress/planner',
        element: <StudyPlannerPage />,
      },
      // Community routes
      {
        path: 'community/forum',
        element: <ForumPage />,
      },
      {
        path: 'community/groups',
        element: <StudyGroupsPage />,
      },
      // Account routes
      {
        path: 'account/profile',
        element: <ProfilePage />,
      },
      {
        path: 'account/settings',
        element: <SettingsPage />,
      },
      {
        path: 'account/subscription',
        element: <SubscriptionPage />,
      },
    ],
  },

  // Admin routes
  {
    path: '/admin',
    element: (
      <AdminRoute>
        <Suspense fallback={<PageLoader />}>
          <AdminDashboardPage />
        </Suspense>
      </AdminRoute>
    ),
  },
  {
    path: '/admin/questions',
    element: (
      <AdminRoute>
        <Suspense fallback={<PageLoader />}>
          <QuestionManagementPage />
        </Suspense>
      </AdminRoute>
    ),
  },

  // Catch all - redirect to landing
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);

export default router;
