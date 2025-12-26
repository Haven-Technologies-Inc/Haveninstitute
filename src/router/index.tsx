import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '../components/auth/AuthContext';
import { DarkModeProvider } from '../components/DarkModeContext';
import { ProtectedRoute } from './ProtectedRoute';

// Lazy load pages for better performance
import { lazy, Suspense } from 'react';

// Create a React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Auth pages
const Login = lazy(() => import('../pages/auth/LoginPage').then(m => ({ default: m.LoginPage })));
const Signup = lazy(() => import('../pages/auth/SignupPage').then(m => ({ default: m.SignupPage })));

// Landing
const LandingPage = lazy(() => import('../pages/LandingPage').then(m => ({ default: m.LandingPage })));

// User Dashboard pages
const DashboardPage = lazy(() => import('../pages/dashboard/DashboardPage').then(m => ({ default: m.DashboardPage })));
const NCLEXSimulatorPage = lazy(() => import('../pages/practice/NCLEXSimulatorPage').then(m => ({ default: m.NCLEXSimulatorPage })));

// Quiz pages
const QuizStartPage = lazy(() => import('../pages/practice/QuizStartPage').then(m => ({ default: m.QuizStartPage })));
const QuizSessionPage = lazy(() => import('../pages/practice/QuizSessionPage').then(m => ({ default: m.QuizSessionPage })));
const QuizResultPage = lazy(() => import('../pages/practice/QuizResultPage').then(m => ({ default: m.QuizResultPage })));
const QuizPage = lazy(() => import('../pages/practice/QuizPage').then(m => ({ default: m.QuizPage })));

// CAT Test pages
const CATStartPage = lazy(() => import('../pages/practice/CATStartPage').then(m => ({ default: m.CATStartPage })));
const CATSessionPage = lazy(() => import('../pages/practice/CATSessionPage').then(m => ({ default: m.CATSessionPage })));
const CATResultPage = lazy(() => import('../pages/practice/CATResultPage').then(m => ({ default: m.CATResultPage })));
const CATTestPage = lazy(() => import('../pages/practice/CATTestPage').then(m => ({ default: m.CATTestPage })));
const FlashcardsPage = lazy(() => import('../pages/study/FlashcardsPage').then(m => ({ default: m.FlashcardsPage })));
const BooksPage = lazy(() => import('../pages/study/BooksPage').then(m => ({ default: m.BooksPage })));
const AIChatPage = lazy(() => import('../pages/study/AIChatPage').then(m => ({ default: m.AIChatPage })));
const ProgressPage = lazy(() => import('../pages/progress/ProgressPage').then(m => ({ default: m.ProgressPage })));
const AnalyticsPage = lazy(() => import('../pages/progress/AnalyticsPage').then(m => ({ default: m.AnalyticsPage })));
const PlannerPage = lazy(() => import('../pages/progress/PlannerPage').then(m => ({ default: m.PlannerPage })));
const StudyPlannerPage = lazy(() => import('../pages/progress/StudyPlannerPage').then(m => ({ default: m.StudyPlannerPage })));
// GroupStudyPage removed - using new StudyGroupsPage
const StudyGroupsPage = lazy(() => import('../pages/community/StudyGroupsPage').then(m => ({ default: m.StudyGroupsPage })));
// GroupChatPage removed - using new GroupDetailPage
const GroupDetailPage = lazy(() => import('../pages/community/GroupDetailPage'));
const DiscussionForumPage = lazy(() => import('../pages/community/DiscussionForumPage').then(m => ({ default: m.DiscussionForumPage })));
const ForumPage = lazy(() => import('../pages/community/ForumPage').then(m => ({ default: m.ForumPage })));
const SubscriptionPage = lazy(() => import('../pages/account/SubscriptionPage').then(m => ({ default: m.SubscriptionPage })));
const ProfilePage = lazy(() => import('../pages/account/ProfilePage').then(m => ({ default: m.ProfilePage })));
const SettingsPage = lazy(() => import('../pages/account/SettingsPage').then(m => ({ default: m.SettingsPage })));

// Admin pages
const AdminDashboardPage = lazy(() => import('../pages/admin/AdminDashboardPage').then(m => ({ default: m.AdminDashboardPage })));

// Loading fallback component
function PageLoader() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600 dark:text-gray-400">Loading...</p>
      </div>
    </div>
  );
}

// Root layout with providers
function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <DarkModeProvider>
          <Suspense fallback={<PageLoader />}>
            <Outlet />
          </Suspense>
        </DarkModeProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

// Create and export router
export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      // Public routes
      {
        path: '/',
        element: <LandingPage />,
      },
      {
        path: '/login',
        element: <Login />,
      },
      {
        path: '/signup',
        element: <Signup />,
      },

      // Protected user routes
      {
        path: '/app',
        element: <ProtectedRoute />,
        children: [
          { index: true, element: <Navigate to="dashboard" replace /> },
          { path: 'dashboard', element: <DashboardPage /> },
          { path: 'nclex-simulator', element: <NCLEXSimulatorPage /> },
          
          // Quiz routes
          { path: 'quiz', element: <QuizStartPage /> },
          { path: 'quiz/session/:sessionId', element: <QuizSessionPage /> },
          { path: 'quiz/result/:sessionId', element: <QuizResultPage /> },
          { path: 'quiz/review/:sessionId', element: <QuizResultPage /> },
          { path: 'quiz/legacy', element: <QuizPage /> },
          { path: 'quiz/legacy/:category', element: <QuizPage /> },
          
          // CAT Test routes
          { path: 'cat-test', element: <CATStartPage /> },
          { path: 'cat-test/session/:sessionId', element: <CATSessionPage /> },
          { path: 'cat-test/result/:sessionId', element: <CATResultPage /> },
          { path: 'cat-test/legacy', element: <CATTestPage /> },
          { path: 'flashcards', element: <FlashcardsPage /> },
          { path: 'flashcards/:setId', element: <FlashcardsPage /> },
          { path: 'books', element: <BooksPage /> },
          { path: 'books/:bookId', element: <BooksPage /> },
          { path: 'ai-chat', element: <AIChatPage /> },
          { path: 'progress', element: <ProgressPage /> },
          { path: 'analytics', element: <AnalyticsPage /> },
          { path: 'planner', element: <StudyPlannerPage /> },
          { path: 'planner/:planId', element: <StudyPlannerPage /> },
          { path: 'planner-legacy', element: <PlannerPage /> },
          { path: 'study-groups', element: <StudyGroupsPage /> },
          { path: 'study-groups/:groupId', element: <GroupDetailPage /> },
          { path: 'forum', element: <DiscussionForumPage /> },
          { path: 'forum/:slug', element: <DiscussionForumPage /> },
          { path: 'forum-legacy', element: <ForumPage /> },
          { path: 'subscription', element: <SubscriptionPage /> },
          { path: 'profile', element: <ProfilePage /> },
          { path: 'settings', element: <SettingsPage /> },
        ],
      },

      // Protected admin routes
      {
        path: '/admin',
        element: <ProtectedRoute requiredRole="admin" />,
        children: [
          { index: true, element: <AdminDashboardPage /> },
        ],
      },

      // Catch-all redirect
      {
        path: '*',
        element: <Navigate to="/" replace />,
      },
    ],
  },
]);
