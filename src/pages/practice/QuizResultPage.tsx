/**
 * Quiz Result Page - Detailed results and analytics after quiz completion
 */

import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Progress } from '../../components/ui/progress';
import { Badge } from '../../components/ui/badge';
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Clock,
  Target,
  Award,
  BarChart3,
  TrendingUp,
  RotateCcw,
  Eye,
  BookOpen,
  Brain
} from 'lucide-react';
import { useQuizResult } from '../../services/hooks/useQuiz';

export default function QuizResultPage() {
  const navigate = useNavigate();
  const { sessionId } = useParams<{ sessionId: string }>();
  
  const { data: result, isLoading, error } = useQuizResult(sessionId || '');

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading results...</p>
        </div>
      </div>
    );
  }

  if (error || !result) {
    return (
      <div className="max-w-2xl mx-auto p-4 text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Results Not Found</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Could not load quiz results.
        </p>
        <Button onClick={() => navigate('/app/quiz')}>Start New Quiz</Button>
      </div>
    );
  }

  const score = result.questionsCorrect || 0;
  const total = result.questionsAnswered || 0;
  const percentage = total > 0 ? Math.round((score / total) * 100) : 0;
  const timeSpent = result.timeSpent || 0;
  const avgTimePerQuestion = total > 0 ? Math.round(timeSpent / total) : 0;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getScoreColor = (pct: number) => {
    if (pct >= 80) return 'text-green-600';
    if (pct >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBg = (pct: number) => {
    if (pct >= 80) return 'bg-green-600';
    if (pct >= 60) return 'bg-yellow-600';
    return 'bg-red-600';
  };

  return (
    <div className="max-w-5xl mx-auto p-4">
      <Button variant="ghost" onClick={() => navigate('/app/dashboard')} className="mb-6">
        <ArrowLeft className="mr-2 size-4" />
        Back to Dashboard
      </Button>

      {/* Results Header */}
      <Card className="border-2 border-blue-300 mb-6">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className={`p-4 rounded-2xl ${getScoreBg(percentage)}`}>
              <Award className="size-12 text-white" />
            </div>
          </div>
          <CardTitle className="text-3xl">Quiz Complete!</CardTitle>
          <CardDescription className="text-lg">
            Great job completing the practice quiz
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Score Display */}
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 border-2 border-blue-300 dark:border-blue-700 rounded-xl p-6">
            <div className="text-center">
              <div className={`text-7xl font-bold mb-4 ${getScoreColor(percentage)}`}>
                {percentage}%
              </div>
              <p className="text-xl text-gray-700 dark:text-gray-300 mb-4">
                {score} out of {total} correct
              </p>
              <Progress value={percentage} className="h-4" />
            </div>
          </div>

          {/* Performance Stats */}
          <div className="grid grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-6 text-center">
                <Clock className="size-8 text-blue-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatTime(timeSpent)}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Time</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <Target className="size-8 text-green-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{avgTimePerQuestion}s</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Avg per Question</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <CheckCircle2 className="size-8 text-purple-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{score}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Correct Answers</p>
              </CardContent>
            </Card>
          </div>

          {/* Category Breakdown */}
          {result.categoryPerformance && Object.keys(result.categoryPerformance).length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="size-5 text-blue-600" />
                  Performance by Category
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(result.categoryPerformance).map(([category, stats]: [string, any]) => {
                  const catPercentage = stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0;
                  return (
                    <div key={category} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-900 dark:text-white font-medium">{category}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {stats.correct}/{stats.total}
                          </span>
                          <Badge variant={catPercentage >= 80 ? 'default' : catPercentage >= 60 ? 'secondary' : 'destructive'}>
                            {catPercentage}%
                          </Badge>
                        </div>
                      </div>
                      <Progress value={catPercentage} />
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          )}

          {/* Personalized Feedback */}
          <Card className="border-2 border-purple-300 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950 dark:to-blue-950">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="size-5 text-purple-600" />
                Performance Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              {percentage >= 80 ? (
                <div className="flex gap-3 p-4 bg-green-50 dark:bg-green-950 border-2 border-green-200 dark:border-green-800 rounded-lg">
                  <CheckCircle2 className="size-6 text-green-600 shrink-0" />
                  <div>
                    <p className="font-semibold text-green-900 dark:text-green-100 mb-2">Excellent Performance!</p>
                    <p className="text-sm text-green-800 dark:text-green-200">
                      You demonstrate strong understanding of this material. Keep up the great work and continue practicing to maintain mastery. Consider moving to more challenging topics or the CAT test.
                    </p>
                  </div>
                </div>
              ) : percentage >= 60 ? (
                <div className="flex gap-3 p-4 bg-yellow-50 dark:bg-yellow-950 border-2 border-yellow-200 dark:border-yellow-800 rounded-lg">
                  <TrendingUp className="size-6 text-yellow-600 shrink-0" />
                  <div>
                    <p className="font-semibold text-yellow-900 dark:text-yellow-100 mb-2">Good Progress!</p>
                    <p className="text-sm text-yellow-800 dark:text-yellow-200">
                      You're on the right track. Review the explanations for missed questions and focus on weaker categories. Consider using the AI Tutor for personalized help on challenging topics.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex gap-3 p-4 bg-red-50 dark:bg-red-950 border-2 border-red-200 dark:border-red-800 rounded-lg">
                  <XCircle className="size-6 text-red-600 shrink-0" />
                  <div>
                    <p className="font-semibold text-red-900 dark:text-red-100 mb-2">Keep Studying!</p>
                    <p className="text-sm text-red-800 dark:text-red-200">
                      This topic needs more attention. Review your study materials and use the AI Tutor for help understanding key concepts. Focus on the rationales behind each answer.
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button 
              onClick={() => navigate(`/app/quiz/review/${sessionId}`)} 
              variant="outline" 
              className="flex-1"
            >
              <Eye className="mr-2 size-4" />
              Review Questions
            </Button>
            <Button 
              onClick={() => navigate('/app/quiz')} 
              variant="outline" 
              className="flex-1"
            >
              <RotateCcw className="mr-2 size-4" />
              New Quiz
            </Button>
            <Button 
              onClick={() => navigate('/app/dashboard')} 
              className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600"
            >
              Back to Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
