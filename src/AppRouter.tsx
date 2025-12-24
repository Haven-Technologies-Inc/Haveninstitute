import { RouterProvider } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { router } from './router';
import { AuthProvider } from './components/auth/AuthContext';
import { DarkModeProvider } from './components/DarkModeContext';

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

// Result types exported for components that need them
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

/**
 * Main App component using React Router DOM
 * 
 * This replaces the previous state-based navigation with proper URL routing.
 * All routes are defined in src/router/index.tsx
 */
export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <DarkModeProvider>
          <RouterProvider router={router} />
        </DarkModeProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
