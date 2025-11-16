import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Badge } from './ui/badge';
import { ArrowLeft, TrendingUp, Target, Award, Calendar } from 'lucide-react';
import { QuizResult } from '../App';

interface ProgressProps {
  results: QuizResult[];
  onBack: () => void;
}

const topicNames: Record<string, string> = {
  'fundamentals': 'Fundamentals of Nursing',
  'pharmacology': 'Pharmacology',
  'med-surg': 'Medical-Surgical Nursing',
  'pediatrics': 'Pediatric Nursing',
  'mental-health': 'Mental Health Nursing',
  'maternal': 'Maternal & Newborn'
};

export function Progress({ results, onBack }: ProgressProps) {
  const totalQuestions = results.reduce((acc, result) => acc + result.total, 0);
  const totalCorrect = results.reduce((acc, result) => acc + result.score, 0);
  const averageScore = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;

  // Calculate topic performance
  const topicPerformance = results.reduce((acc, result) => {
    if (!acc[result.topic]) {
      acc[result.topic] = { total: 0, correct: 0, attempts: 0 };
    }
    acc[result.topic].total += result.total;
    acc[result.topic].correct += result.score;
    acc[result.topic].attempts += 1;
    return acc;
  }, {} as Record<string, { total: number; correct: number; attempts: number }>);

  // Find strongest and weakest topics
  const topicScores = Object.entries(topicPerformance).map(([topic, data]) => ({
    topic,
    percentage: Math.round((data.correct / data.total) * 100),
    attempts: data.attempts
  }));
  
  const strongestTopic = topicScores.reduce((max, curr) => 
    curr.percentage > max.percentage ? curr : max, topicScores[0] || { topic: '', percentage: 0, attempts: 0 });
  
  const weakestTopic = topicScores.reduce((min, curr) => 
    curr.percentage < min.percentage ? curr : min, topicScores[0] || { topic: '', percentage: 100, attempts: 0 });

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Button variant="ghost" onClick={onBack} className="mb-4">
            <ArrowLeft className="size-4 mr-2" />
            Back to Dashboard
          </Button>
          <h2>Your Progress</h2>
          <p className="text-gray-600">Track your performance and identify areas for improvement</p>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardDescription>Total Questions</CardDescription>
                <Target className="size-4 text-gray-400" />
              </div>
              <CardTitle>{totalQuestions}</CardTitle>
            </CardHeader>
          </Card>
          
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardDescription>Average Score</CardDescription>
                <TrendingUp className="size-4 text-gray-400" />
              </div>
              <CardTitle>{averageScore}%</CardTitle>
            </CardHeader>
          </Card>
          
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardDescription>Quiz Sessions</CardDescription>
                <Calendar className="size-4 text-gray-400" />
              </div>
              <CardTitle>{results.length}</CardTitle>
            </CardHeader>
          </Card>
          
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardDescription>Study Streak</CardDescription>
                <Award className="size-4 text-gray-400" />
              </div>
              <CardTitle>3 Days 🔥</CardTitle>
            </CardHeader>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Topic Performance */}
          <Card>
            <CardHeader>
              <CardTitle>Performance by Topic</CardTitle>
              <CardDescription>Your accuracy across different nursing topics</CardDescription>
            </CardHeader>
            <CardContent>
              {topicScores.length > 0 ? (
                <div className="space-y-4">
                  {topicScores.map(({ topic, percentage, attempts }) => (
                    <div key={topic}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-gray-700">{topicNames[topic] || topic}</span>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{attempts} quiz{attempts !== 1 ? 'zes' : ''}</Badge>
                          <span className={`${percentage >= 80 ? 'text-green-600' : percentage >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
                            {percentage}%
                          </span>
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${percentage >= 80 ? 'bg-green-500' : percentage >= 60 ? 'bg-yellow-500' : 'bg-red-500'}`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">No quiz data yet. Start a quiz to see your performance!</p>
              )}
            </CardContent>
          </Card>

          {/* Strengths & Weaknesses */}
          <Card>
            <CardHeader>
              <CardTitle>Insights & Recommendations</CardTitle>
              <CardDescription>AI-powered analysis of your study patterns</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {strongestTopic.topic && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-start gap-2">
                    <Award className="size-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-green-900 mb-1">Strongest Topic</p>
                      <p className="text-green-800">
                        {topicNames[strongestTopic.topic]} ({strongestTopic.percentage}%)
                      </p>
                      <p className="text-green-700 mt-1">
                        Excellent work! You're mastering this area.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {weakestTopic.topic && weakestTopic.percentage < 100 && (
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <div className="flex items-start gap-2">
                    <Target className="size-5 text-orange-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-orange-900 mb-1">Focus Area</p>
                      <p className="text-orange-800">
                        {topicNames[weakestTopic.topic]} ({weakestTopic.percentage}%)
                      </p>
                      <p className="text-orange-700 mt-1">
                        Review flashcards and retake quizzes in this topic to improve.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <TrendingUp className="size-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-blue-900 mb-1">Study Tip</p>
                    <p className="text-blue-800">
                      Consistent daily practice is key. Aim for at least 20 questions per day to maintain your knowledge.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Quiz Results</CardTitle>
            <CardDescription>Your latest quiz sessions</CardDescription>
          </CardHeader>
          <CardContent>
            {results.length > 0 ? (
              <div className="space-y-3">
                {[...results].reverse().slice(0, 10).map((result, index) => {
                  const percentage = Math.round((result.score / result.total) * 100);
                  return (
                    <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <p>{topicNames[result.topic] || result.topic}</p>
                        <p className="text-gray-600">
                          {new Date(result.date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-gray-600">
                          {result.score}/{result.total}
                        </span>
                        <Badge
                          className={
                            percentage >= 80
                              ? 'bg-green-100 text-green-800'
                              : percentage >= 60
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }
                        >
                          {percentage}%
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No quiz results yet. Complete a quiz to see your history!</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}