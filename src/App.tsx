import { useState } from 'react';
import { AuthProvider, useAuth } from './components/auth/AuthContext';
import { DarkModeProvider } from './components/DarkModeContext';
import { Login } from './components/auth/Login';
import { Signup } from './components/auth/Signup';
import { Onboarding } from './components/auth/Onboarding';
import { HeroEnhanced } from './components/HeroEnhanced';
import { Dashboard } from './components/Dashboard';
import { Quiz } from './components/QuizEnhanced';
import { FlashcardsEnhanced } from './components/FlashcardsEnhanced';
import { PracticeQuizEnhanced } from './components/PracticeQuizEnhanced';
import { Progress } from './components/ProgressEnhanced';
import { CATTestEnhanced } from './components/CATTestEnhanced';
import { Analytics } from './components/Analytics';
import { Forum } from './components/ForumEnhanced';
import { GroupStudy } from './components/GroupStudy';
import { GroupStudyComplete } from './components/GroupStudyComplete';
import { StudyPlanner } from './components/StudyPlanner';
import { StudyPlannerComplete } from './components/StudyPlannerComplete';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { SubscriptionManager } from './components/payments/SubscriptionManager';
import { BookReader } from './components/BookReaderEnhanced';
import { BookReaderComplete } from './components/BookReaderComplete';
import { UserLayout } from './components/UserLayout';
import { AIChat } from './components/AIChat';
import { NCLEXSimulator } from './components/NCLEXSimulator';
import { Settings } from './components/Settings';
import { UserProfile } from './components/UserProfile';

type View = 'hero' | 'dashboard' | 'quiz' | 'flashcards' | 'progress' | 'cat-test' | 'analytics' | 'forum' | 'group-study' | 'planner' | 'admin' | 'subscription' | 'books' | 'ai-chat' | 'nclex-simulator' | 'settings' | 'profile';

export interface QuizResult {
  topic: string;
  score: number;
  total: number;
  date: Date;
  timeSpent?: number;
  difficulty?: 'easy' | 'medium' | 'hard';
  questionDetails?: Array<{
    question: string;
    correct: boolean;
    category: string;
    difficulty: string;
  }>;
}

export interface CATResult extends QuizResult {
  passingProbability: number;
  abilityEstimate: number;
  confidenceInterval: [number, number];
  categoryPerformance: Record<string, { correct: number; total: number }>;
}

export default function App() {
  return (
    <AuthProvider>
      <DarkModeProvider>
        <AppContent />
      </DarkModeProvider>
    </AuthProvider>
  );
}

function AppContent() {
  const { user, isLoading, logout } = useAuth();
  const [authView, setAuthView] = useState<'login' | 'signup' | 'hero'>('hero');
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [selectedTopic, setSelectedTopic] = useState('');
  const [quizResults, setQuizResults] = useState<QuizResult[]>([]);
  const [catResults, setCatResults] = useState<CATResult[]>([]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 flex items-center justify-center transition-colors">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 dark:border-blue-400 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading Haven Institute...</p>
        </div>
      </div>
    );
  }

  // Show auth screens if not logged in
  if (!user) {
    if (authView === 'hero') {
      return <HeroEnhanced onGetStarted={() => setAuthView('login')} />;
    }
    if (authView === 'login') {
      return (
        <Login 
          onSwitchToSignup={() => setAuthView('signup')} 
          onBackToHome={() => setAuthView('hero')}
        />
      );
    } else {
      return (
        <Signup 
          onSwitchToLogin={() => setAuthView('login')} 
          onBackToHome={() => setAuthView('hero')}
        />
      );
    }
  }

  // Show onboarding if not completed
  if (!user.hasCompletedOnboarding) {
    return <Onboarding />;
  }

  const handleStartQuiz = (topic: string) => {
    setSelectedTopic(topic);
    setCurrentView('quiz');
  };

  const handleStartFlashcards = (topic: string) => {
    setSelectedTopic(topic);
    setCurrentView('flashcards');
  };

  const handleStartCATTest = () => {
    setCurrentView('cat-test');
  };

  const handleQuizComplete = (result: QuizResult) => {
    setQuizResults([...quizResults, result]);
    setCurrentView('progress');
  };

  const handleCATComplete = (result: CATResult) => {
    setCatResults([...catResults, result]);
    setCurrentView('analytics');
  };

  const handleNCLEXSimulatorComplete = (result: any) => {
    // Store NCLEX Simulator result as a CAT result for consistency
    const simulatorResult: CATResult = {
      date: new Date().toISOString(),
      score: result.score,
      total: result.total,
      passingProbability: result.passingProbability / 100, // Convert from percentage
      abilityEstimate: result.catState.abilityLevel,
      questionsByDifficulty: {
        easy: result.report.difficultyStats.easy.total,
        medium: result.report.difficultyStats.medium.total,
        hard: result.report.difficultyStats.hard.total
      },
      categoryScores: result.report.subcategoryStats
    };
    setCatResults([...catResults, simulatorResult]);
    // Stay on simulator results page
  };

  const handleNavigate = (view: 'progress' | 'analytics' | 'forum' | 'group-study' | 'planner' | 'subscription' | 'books' | 'ai-chat' | 'nclex-simulator' | 'settings' | 'profile') => {
    setCurrentView(view);
  };

  const handleGetStarted = () => {
    setCurrentView('dashboard');
  };

  // Role-based routing - Admins should see admin dashboard
  if (user.role === 'admin') {
    return <AdminDashboard onBack={() => logout()} />;
  }

  // Regular users see the user portal
  // Wrap user views with UserLayout
  const shouldUseLayout = currentView !== 'hero';

  const renderContent = () => {
    if (currentView === 'hero') {
      return <HeroEnhanced onGetStarted={handleGetStarted} />;
    }
    if (currentView === 'dashboard') {
      return (
        <Dashboard
          onStartQuiz={handleStartQuiz}
          onStartFlashcards={handleStartFlashcards}
          onStartCATTest={handleStartCATTest}
          onNavigate={handleNavigate}
          recentResults={quizResults.slice(-3)}
          catResults={catResults}
        />
      );
    }
    if (currentView === 'quiz') {
      return (
        <PracticeQuizEnhanced
          onBack={() => setCurrentView('dashboard')}
          onComplete={handleQuizComplete}
        />
      );
    }
    if (currentView === 'flashcards') {
      return (
        <FlashcardsEnhanced
          onBack={() => setCurrentView('dashboard')}
        />
      );
    }
    if (currentView === 'progress') {
      return (
        <Progress
          results={quizResults}
          onBack={() => setCurrentView('dashboard')}
        />
      );
    }
    if (currentView === 'cat-test') {
      return (
        <CATTestEnhanced
          onComplete={handleCATComplete}
          onBack={() => setCurrentView('dashboard')}
        />
      );
    }
    if (currentView === 'analytics') {
      return (
        <Analytics
          quizResults={quizResults}
          catResults={catResults}
          onBack={() => setCurrentView('dashboard')}
        />
      );
    }
    if (currentView === 'forum') {
      return <Forum onBack={() => setCurrentView('dashboard')} />;
    }
    if (currentView === 'group-study') {
      return <GroupStudyComplete onBack={() => setCurrentView('dashboard')} />;
    }
    if (currentView === 'planner') {
      return <StudyPlannerComplete onBack={() => setCurrentView('dashboard')} />;
    }
    if (currentView === 'subscription') {
      return <SubscriptionManager onBack={() => setCurrentView('dashboard')} />;
    }
    if (currentView === 'books') {
      return <BookReaderComplete onBack={() => setCurrentView('dashboard')} />;
    }
    if (currentView === 'ai-chat') {
      return <AIChat />;
    }
    if (currentView === 'nclex-simulator') {
      return <NCLEXSimulator onBack={() => setCurrentView('dashboard')} onComplete={handleNCLEXSimulatorComplete} />;
    }
    if (currentView === 'settings') {
      return <Settings />;
    }
    if (currentView === 'profile') {
      return <UserProfile />;
    }
    return null;
  };

  return (
    <>
      {currentView === 'hero' && <HeroEnhanced onGetStarted={handleGetStarted} />}
      {currentView !== 'hero' && shouldUseLayout && (
        <UserLayout 
          currentView={currentView} 
          onNavigate={(view) => setCurrentView(view as View)}
        >
          {renderContent()}
        </UserLayout>
      )}
      {currentView !== 'hero' && !shouldUseLayout && (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
          {renderContent()}
        </div>
      )}
    </>
  );
}