/**
 * CAT Result Page - Detailed results with IRT analysis after CAT completion
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
  TrendingDown,
  RotateCcw,
  Brain,
  Gauge,
  AlertTriangle
} from 'lucide-react';
import { useCATResult } from '../../services/hooks/useCAT';

export default function CATResultPage() {
  const navigate = useNavigate();
  const { sessionId } = useParams<{ sessionId: string }>();
  
  const { data: result, isLoading, error } = useCATResult(sessionId || '');

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
        <AlertTriangle className="size-16 text-red-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Results Not Found</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Could not load CAT test results.
        </p>
        <Button onClick={() => navigate('/app/cat-test')}>Start New Test</Button>
      </div>
    );
  }

  const score = result.questionsCorrect || 0;
  const total = result.questionsAnswered || 0;
  const percentage = total > 0 ? Math.round((score / total) * 100) : 0;
  const timeSpent = result.timeSpent || 0;
  const passingProbability = (result.passingProbability || 0.5) * 100;
  const abilityEstimate = result.abilityEstimate || 0;
  const confidenceInterval = result.confidenceInterval || [-1, 1];
  const testResult = result.result || 'undetermined';

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m ${secs}s`;
  };

  const getResultDisplay = () => {
    if (testResult === 'pass' || passingProbability >= 60) {
      return {
        label: 'LIKELY PASS',
        color: 'text-green-600',
        bgColor: 'bg-green-600',
        borderColor: 'border-green-500',
        icon: CheckCircle2,
        message: 'Your performance indicates you are likely to pass the NCLEX-RN!'
      };
    } else if (testResult === 'fail' || passingProbability < 40) {
      return {
        label: 'NEEDS IMPROVEMENT',
        color: 'text-red-600',
        bgColor: 'bg-red-600',
        borderColor: 'border-red-500',
        icon: XCircle,
        message: 'More preparation is recommended before taking the actual NCLEX-RN.'
      };
    }
    return {
      label: 'BORDERLINE',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-600',
      borderColor: 'border-yellow-500',
      icon: AlertTriangle,
      message: 'Your performance is near the passing threshold. Continue practicing to build confidence.'
    };
  };

  const resultDisplay = getResultDisplay();
  const ResultIcon = resultDisplay.icon;

  return (
    <div className="max-w-5xl mx-auto p-4">
      <Button variant="ghost" onClick={() => navigate('/app/dashboard')} className="mb-6">
        <ArrowLeft className="mr-2 size-4" />
        Back to Dashboard
      </Button>

      {/* Results Header */}
      <Card className={`border-2 ${resultDisplay.borderColor} mb-6`}>
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className={`p-4 rounded-2xl ${resultDisplay.bgColor}`}>
              <ResultIcon className="size-12 text-white" />
            </div>
          </div>
          <CardTitle className="text-3xl">CAT Test Complete!</CardTitle>
          <CardDescription className="text-lg">
            Computer Adaptive Test Results
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Result Banner */}
          <div className={`text-center p-6 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 border-2 ${resultDisplay.borderColor}`}>
            <p className={`text-4xl font-bold mb-2 ${resultDisplay.color}`}>
              {resultDisplay.label}
            </p>
            <p className="text-gray-600 dark:text-gray-400">
              {resultDisplay.message}
            </p>
          </div>

          {/* Passing Probability Gauge */}
          <Card className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950 dark:to-blue-950 border-2 border-purple-300 dark:border-purple-700">
            <CardContent className="pt-6">
              <div className="text-center mb-4">
                <Gauge className="size-10 text-purple-600 mx-auto mb-2" />
                <p className="text-sm text-gray-600 dark:text-gray-400">Estimated Passing Probability</p>
                <p className={`text-6xl font-bold ${
                  passingProbability >= 60 ? 'text-green-600' : 
                  passingProbability >= 40 ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {Math.round(passingProbability)}%
                </p>
              </div>
              <Progress 
                value={passingProbability} 
                className="h-4"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-2">
                <span>0%</span>
                <span className="text-yellow-600 font-medium">Passing Threshold</span>
                <span>100%</span>
              </div>
            </CardContent>
          </Card>

          {/* IRT Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6 text-center">
                <Brain className="size-8 text-purple-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {abilityEstimate > 0 ? '+' : ''}{abilityEstimate.toFixed(2)}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Ability (θ)</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <Target className="size-8 text-blue-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  [{confidenceInterval[0].toFixed(2)}, {confidenceInterval[1].toFixed(2)}]
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">95% CI</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <CheckCircle2 className="size-8 text-green-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {score}/{total}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Correct ({percentage}%)</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <Clock className="size-8 text-orange-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatTime(timeSpent)}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Time</p>
              </CardContent>
            </Card>
          </div>

          {/* Category Performance */}
          {result.categoryPerformance && Object.keys(result.categoryPerformance).length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="size-5 text-blue-600" />
                  Performance by NCLEX Category
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(result.categoryPerformance).map(([category, stats]: [string, any]) => {
                  const catPercentage = stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0;
                  return (
                    <div key={category} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-900 dark:text-white font-medium text-sm">{category}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {stats.correct}/{stats.total}
                          </span>
                          <Badge variant={catPercentage >= 70 ? 'default' : catPercentage >= 50 ? 'secondary' : 'destructive'}>
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

          {/* Interpretation Guide */}
          <Card className="border-2 border-blue-300 bg-blue-50 dark:bg-blue-950">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="size-5 text-blue-600" />
                Understanding Your Results
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div>
                <p className="font-semibold text-blue-900 dark:text-blue-100 mb-1">Ability Estimate (θ)</p>
                <p className="text-blue-800 dark:text-blue-200">
                  Your estimated ability on the IRT logit scale. 0 represents the passing threshold. 
                  Positive values indicate above-passing ability, negative values indicate below-passing.
                </p>
              </div>
              <div>
                <p className="font-semibold text-blue-900 dark:text-blue-100 mb-1">95% Confidence Interval</p>
                <p className="text-blue-800 dark:text-blue-200">
                  The range where your true ability likely falls. A narrower interval indicates more certainty 
                  in the estimate. The test continues until this interval is entirely above or below passing.
                </p>
              </div>
              <div>
                <p className="font-semibold text-blue-900 dark:text-blue-100 mb-1">Passing Probability</p>
                <p className="text-blue-800 dark:text-blue-200">
                  The estimated likelihood of passing the actual NCLEX-RN based on your performance. 
                  This uses the same CAT methodology as the real exam.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Recommendations */}
          <Card className="border-2 border-purple-300 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950 dark:to-blue-950">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {passingProbability >= 60 ? (
                  <TrendingUp className="size-5 text-green-600" />
                ) : (
                  <TrendingDown className="size-5 text-red-600" />
                )}
                Next Steps
              </CardTitle>
            </CardHeader>
            <CardContent>
              {passingProbability >= 70 ? (
                <div className="space-y-3">
                  <p className="text-green-800 dark:text-green-200">
                    <strong>Excellent performance!</strong> You're demonstrating NCLEX-ready knowledge.
                  </p>
                  <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-1">
                    <li>Continue practice to maintain your skills</li>
                    <li>Focus on any weak categories identified above</li>
                    <li>Consider scheduling your NCLEX-RN exam</li>
                    <li>Review test-taking strategies for exam day</li>
                  </ul>
                </div>
              ) : passingProbability >= 50 ? (
                <div className="space-y-3">
                  <p className="text-yellow-800 dark:text-yellow-200">
                    <strong>You're close!</strong> A bit more focused study will help you reach your goal.
                  </p>
                  <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-1">
                    <li>Focus intensively on weak categories</li>
                    <li>Use the AI Tutor for concept clarification</li>
                    <li>Take more practice quizzes in problem areas</li>
                    <li>Review rationales for incorrect answers</li>
                  </ul>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-red-800 dark:text-red-200">
                    <strong>More preparation needed.</strong> Build your foundation before attempting the real exam.
                  </p>
                  <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-1">
                    <li>Review core nursing content in weak areas</li>
                    <li>Use flashcards for key concepts and medications</li>
                    <li>Schedule regular practice sessions</li>
                    <li>Work with the AI Tutor on difficult topics</li>
                    <li>Consider a structured study plan</li>
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button 
              onClick={() => navigate('/app/cat-test')} 
              variant="outline" 
              className="flex-1"
            >
              <RotateCcw className="mr-2 size-4" />
              New CAT Test
            </Button>
            <Button 
              onClick={() => navigate('/app/analytics')} 
              variant="outline" 
              className="flex-1"
            >
              <BarChart3 className="mr-2 size-4" />
              View Analytics
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
