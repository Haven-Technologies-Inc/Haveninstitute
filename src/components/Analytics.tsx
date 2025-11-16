import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Badge } from './ui/badge';
import { ArrowLeft, TrendingUp, Target, Award, Brain, AlertCircle, CheckCircle2, BarChart3 } from 'lucide-react';
import { QuizResult, CATResult } from '../App';

interface AnalyticsProps {
  quizResults: QuizResult[];
  catResults: CATResult[];
  onBack: () => void;
}

export function Analytics({ quizResults, catResults, onBack }: AnalyticsProps) {
  const latestCAT = catResults[catResults.length - 1];
  
  // Calculate comprehensive analytics
  const totalQuestions = quizResults.reduce((acc, result) => acc + result.total, 0);
  const totalCorrect = quizResults.reduce((acc, result) => acc + result.score, 0);
  const averageScore = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;
  
  // Category performance from CAT
  const categoryPerformance = latestCAT?.categoryPerformance || {};
  const categoryScores = Object.entries(categoryPerformance).map(([category, data]) => ({
    category,
    percentage: Math.round((data.correct / data.total) * 100),
    correct: data.correct,
    total: data.total
  })).sort((a, b) => a.percentage - b.percentage);
  
  const weakestCategories = categoryScores.slice(0, 3);
  const strongestCategories = categoryScores.slice(-3).reverse();
  
  // Passing probability
  const passingProbability = latestCAT ? Math.round(latestCAT.passingProbability * 100) : null;
  const abilityEstimate = latestCAT?.abilityEstimate || 0;
  
  // AI Recommendations
  const getRecommendations = () => {
    const recommendations = [];
    
    if (passingProbability !== null) {
      if (passingProbability >= 85) {
        recommendations.push({
          type: 'success',
          title: 'Excellent Progress!',
          message: `Your passing probability is ${passingProbability}%. You're well-prepared for NCLEX. Focus on maintaining your knowledge and taking practice tests regularly.`,
          icon: CheckCircle2
        });
      } else if (passingProbability >= 70) {
        recommendations.push({
          type: 'warning',
          title: 'Good Progress, Keep Studying',
          message: `Your passing probability is ${passingProbability}%. You're on the right track. Focus on your weak areas to increase your confidence.`,
          icon: Target
        });
      } else {
        recommendations.push({
          type: 'alert',
          title: 'More Study Needed',
          message: `Your passing probability is ${passingProbability}%. Dedicate more time to studying, especially in your weakest categories. Consider using flashcards and joining group study sessions.`,
          icon: AlertCircle
        });
      }
    }
    
    // Category-specific recommendations
    if (weakestCategories.length > 0) {
      weakestCategories.forEach(cat => {
        if (cat.percentage < 60) {
          recommendations.push({
            type: 'alert',
            title: `Focus on ${cat.category}`,
            message: `Your performance in ${cat.category} is ${cat.percentage}%. This is a critical area. Review flashcards, take focused quizzes, and discuss challenging concepts in the forum.`,
            icon: Brain
          });
        }
      });
    }
    
    // Study pattern recommendations
    if (quizResults.length < 5) {
      recommendations.push({
        type: 'info',
        title: 'Take More Practice Tests',
        message: 'Consistent practice is key. Aim to complete at least one quiz per day to build and maintain your knowledge.',
        icon: TrendingUp
      });
    }
    
    return recommendations;
  };
  
  const recommendations = getRecommendations();
  
  // Readiness assessment
  const getReadinessLevel = (): { level: string; color: string; message: string } => {
    if (passingProbability === null) {
      return {
        level: 'No Data',
        color: 'bg-gray-100 text-gray-800',
        message: 'Complete a CAT test to see your readiness'
      };
    }
    
    if (passingProbability >= 85) {
      return {
        level: 'Exam Ready',
        color: 'bg-green-100 text-green-800',
        message: 'You are ready to take the NCLEX exam'
      };
    } else if (passingProbability >= 70) {
      return {
        level: 'Near Ready',
        color: 'bg-yellow-100 text-yellow-800',
        message: '2-3 more weeks of focused study recommended'
      };
    } else if (passingProbability >= 50) {
      return {
        level: 'Building Foundation',
        color: 'bg-orange-100 text-orange-800',
        message: '4-6 weeks of intensive study recommended'
      };
    } else {
      return {
        level: 'Early Preparation',
        color: 'bg-red-100 text-red-800',
        message: '2-3 months of comprehensive study recommended'
      };
    }
  };
  
  const readiness = getReadinessLevel();

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Button variant="ghost" onClick={onBack} className="mb-4">
            <ArrowLeft className="size-4 mr-2" />
            Back to Dashboard
          </Button>
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 className="size-6" />
            <h2>AI-Powered Analytics & Insights</h2>
          </div>
          <p className="text-gray-600">Comprehensive analysis of your performance and personalized recommendations</p>
        </div>

        {/* Readiness Card */}
        <Card className="mb-8 border-2 border-purple-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="size-6 text-purple-600" />
              NCLEX Readiness Assessment
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p className="text-gray-600 mb-2">Readiness Level</p>
                <Badge className={`${readiness.color} text-lg px-4 py-2`}>
                  {readiness.level}
                </Badge>
                <p className="text-gray-600 mt-2">{readiness.message}</p>
              </div>
              <div>
                <p className="text-gray-600 mb-2">Passing Probability</p>
                <div className="text-3xl mb-2">
                  {passingProbability !== null ? `${passingProbability}%` : 'N/A'}
                </div>
                {latestCAT && (
                  <p className="text-gray-600">
                    95% Confidence: {latestCAT.confidenceInterval[0].toFixed(2)} to {latestCAT.confidenceInterval[1].toFixed(2)}
                  </p>
                )}
              </div>
              <div>
                <p className="text-gray-600 mb-2">Ability Estimate</p>
                <div className="text-3xl mb-2">
                  {abilityEstimate > 0 ? '+' : ''}{abilityEstimate.toFixed(2)}
                </div>
                <p className="text-gray-600">
                  {abilityEstimate > 0.5 ? 'Above NCLEX standard' : abilityEstimate > -0.5 ? 'Near NCLEX standard' : 'Below NCLEX standard'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Performance Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader>
              <CardDescription>Total Questions</CardDescription>
              <CardTitle>{totalQuestions + (latestCAT?.total || 0)}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardDescription>Average Score</CardDescription>
              <CardTitle>{averageScore}%</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardDescription>CAT Tests</CardDescription>
              <CardTitle>{catResults.length}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardDescription>Practice Quizzes</CardDescription>
              <CardTitle>{quizResults.length}</CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* AI Recommendations */}
        <div className="mb-8">
          <h3 className="mb-4">AI Recommendations</h3>
          <div className="space-y-4">
            {recommendations.map((rec, index) => {
              const Icon = rec.icon;
              const bgColor = rec.type === 'success' ? 'bg-green-50 border-green-200' :
                             rec.type === 'warning' ? 'bg-yellow-50 border-yellow-200' :
                             rec.type === 'alert' ? 'bg-red-50 border-red-200' :
                             'bg-blue-50 border-blue-200';
              const iconColor = rec.type === 'success' ? 'text-green-600' :
                               rec.type === 'warning' ? 'text-yellow-600' :
                               rec.type === 'alert' ? 'text-red-600' :
                               'text-blue-600';
              
              return (
                <Card key={index} className={`${bgColor} border`}>
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-3">
                      <Icon className={`size-6 ${iconColor} flex-shrink-0 mt-0.5`} />
                      <div>
                        <p className="mb-1">{rec.title}</p>
                        <p className="text-gray-700">{rec.message}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Category Performance */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Strongest Areas */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Award className="size-5 text-green-600" />
                <CardTitle>Strongest Areas</CardTitle>
              </div>
              <CardDescription>Categories where you excel</CardDescription>
            </CardHeader>
            <CardContent>
              {strongestCategories.length > 0 ? (
                <div className="space-y-4">
                  {strongestCategories.map((cat) => (
                    <div key={cat.category}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-gray-700">{cat.category}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-gray-600">{cat.correct}/{cat.total}</span>
                          <Badge className="bg-green-100 text-green-800">
                            {cat.percentage}%
                          </Badge>
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-500 h-2 rounded-full"
                          style={{ width: `${cat.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">Complete a CAT test to see your strongest areas</p>
              )}
            </CardContent>
          </Card>

          {/* Weakest Areas */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Target className="size-5 text-orange-600" />
                <CardTitle>Focus Areas</CardTitle>
              </div>
              <CardDescription>Categories that need more attention</CardDescription>
            </CardHeader>
            <CardContent>
              {weakestCategories.length > 0 ? (
                <div className="space-y-4">
                  {weakestCategories.map((cat) => (
                    <div key={cat.category}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-gray-700">{cat.category}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-gray-600">{cat.correct}/{cat.total}</span>
                          <Badge className={`${
                            cat.percentage >= 60 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {cat.percentage}%
                          </Badge>
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            cat.percentage >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${cat.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">Complete a CAT test to identify focus areas</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Study Plan */}
        <Card>
          <CardHeader>
            <CardTitle>Personalized Study Plan</CardTitle>
            <CardDescription>AI-generated recommendations based on your performance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="border-l-4 border-purple-500 pl-4 py-2">
                <p className="mb-1">Week 1-2: Foundation Building</p>
                <ul className="list-disc list-inside text-gray-700 space-y-1">
                  <li>Focus on weakest categories identified above</li>
                  <li>Complete 30-50 practice questions daily</li>
                  <li>Review flashcards for 30 minutes each day</li>
                </ul>
              </div>
              
              <div className="border-l-4 border-blue-500 pl-4 py-2">
                <p className="mb-1">Week 3-4: Skill Enhancement</p>
                <ul className="list-disc list-inside text-gray-700 space-y-1">
                  <li>Take full-length CAT tests twice per week</li>
                  <li>Join group study sessions to discuss difficult concepts</li>
                  <li>Review all incorrect answers thoroughly</li>
                </ul>
              </div>
              
              <div className="border-l-4 border-green-500 pl-4 py-2">
                <p className="mb-1">Week 5+: Exam Preparation</p>
                <ul className="list-disc list-inside text-gray-700 space-y-1">
                  <li>Focus on timed practice tests</li>
                  <li>Aim for passing probability above 85%</li>
                  <li>Review NCLEX test-taking strategies</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Progress Chart Placeholder */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Performance Trends</CardTitle>
            <CardDescription>Your progress over time</CardDescription>
          </CardHeader>
          <CardContent>
            {catResults.length > 0 ? (
              <div className="space-y-3">
                {catResults.map((result, index) => {
                  const prob = Math.round(result.passingProbability * 100);
                  return (
                    <div key={index} className="flex items-center gap-4">
                      <span className="text-gray-600 w-24">
                        Test {index + 1}
                      </span>
                      <div className="flex-1">
                        <div className="w-full bg-gray-200 rounded-full h-4">
                          <div
                            className={`h-4 rounded-full ${
                              prob >= 85 ? 'bg-green-500' :
                              prob >= 70 ? 'bg-yellow-500' :
                              'bg-red-500'
                            }`}
                            style={{ width: `${prob}%` }}
                          />
                        </div>
                      </div>
                      <span className="text-gray-700 w-16">{prob}%</span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">Take CAT tests to see your progress trends</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}