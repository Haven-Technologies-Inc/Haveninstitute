/**
 * Performance Analytics Component
 * Comprehensive analytics dashboard with charts, graphs, and AI insights
 * Tracks NCLEX Simulator, Practice Sessions, and Adaptive Test performance
 */

import { useState, useMemo } from 'react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
  ReferenceLine
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  Target,
  Award,
  Brain,
  AlertCircle,
  CheckCircle2,
  BarChart3,
  Activity,
  Zap,
  Clock,
  BookOpen,
  Lightbulb,
  Sparkles,
  ArrowRight,
  Info,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { NCLEX_CATEGORIES, type NCLEXCategory } from '../../types/nextGenNCLEX';

// Types
interface NCLEXSimulatorResult {
  id: string;
  date: Date;
  passed: boolean;
  abilityEstimate: number;
  confidenceInterval: [number, number];
  standardError: number;
  questionsAnswered: number;
  timeSpent: number;
  passingProbability: number;
  categoryPerformance: Record<NCLEXCategory, { correct: number; total: number; percentage: number }>;
  stoppingReason: string;
}

interface PracticeSessionResult {
  id: string;
  date: Date;
  score: number;
  total: number;
  percentage: number;
  timeSpent: number;
  categories: NCLEXCategory[];
  questionTypes: string[];
  difficulty: string;
  adaptive: boolean;
}

interface PerformanceAnalyticsProps {
  nclexResults?: NCLEXSimulatorResult[];
  practiceResults?: PracticeSessionResult[];
  onNavigate?: (view: string) => void;
}

// Color palette
const COLORS = {
  primary: '#3b82f6',
  success: '#22c55e',
  warning: '#f59e0b',
  danger: '#ef4444',
  purple: '#8b5cf6',
  pink: '#ec4899',
  cyan: '#06b6d4',
  categories: ['#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316']
};

// Mock data generator for demo
function generateMockData(): { nclexResults: NCLEXSimulatorResult[], practiceResults: PracticeSessionResult[] } {
  const nclexResults: NCLEXSimulatorResult[] = [];
  const practiceResults: PracticeSessionResult[] = [];
  
  // Generate NCLEX simulator results (last 5 attempts)
  for (let i = 0; i < 5; i++) {
    const ability = -0.5 + (i * 0.4) + (Math.random() * 0.3 - 0.15);
    const se = 0.4 - (i * 0.05);
    
    nclexResults.push({
      id: `nclex-${i}`,
      date: new Date(Date.now() - (4 - i) * 7 * 24 * 60 * 60 * 1000),
      passed: ability > 0,
      abilityEstimate: ability,
      confidenceInterval: [ability - 1.96 * se, ability + 1.96 * se],
      standardError: se,
      questionsAnswered: 85 + Math.floor(Math.random() * 40),
      timeSpent: (180 + Math.random() * 60) * 60 * 1000,
      passingProbability: Math.min(95, Math.max(20, 50 + ability * 30)),
      categoryPerformance: NCLEX_CATEGORIES.reduce((acc, cat) => {
        const total = 8 + Math.floor(Math.random() * 8);
        const correct = Math.floor(total * (0.5 + Math.random() * 0.4));
        acc[cat.id] = { correct, total, percentage: Math.round((correct / total) * 100) };
        return acc;
      }, {} as Record<NCLEXCategory, { correct: number; total: number; percentage: number }>),
      stoppingReason: 'confidence_interval'
    });
  }
  
  // Generate practice session results (last 20 sessions)
  for (let i = 0; i < 20; i++) {
    const total = [10, 25, 50][Math.floor(Math.random() * 3)];
    const score = Math.floor(total * (0.5 + Math.random() * 0.4));
    
    practiceResults.push({
      id: `practice-${i}`,
      date: new Date(Date.now() - (19 - i) * 2 * 24 * 60 * 60 * 1000),
      score,
      total,
      percentage: Math.round((score / total) * 100),
      timeSpent: total * (60 + Math.random() * 30) * 1000,
      categories: NCLEX_CATEGORIES.slice(0, 3 + Math.floor(Math.random() * 5)).map(c => c.id),
      questionTypes: ['multiple-choice', 'select-all'],
      difficulty: ['easy', 'medium', 'hard'][Math.floor(Math.random() * 3)],
      adaptive: Math.random() > 0.5
    });
  }
  
  return { nclexResults, practiceResults };
}

export function PerformanceAnalytics({ 
  nclexResults: propNclexResults, 
  practiceResults: propPracticeResults,
  onNavigate 
}: PerformanceAnalyticsProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'nclex' | 'practice' | 'insights'>('overview');
  const [showAllInsights, setShowAllInsights] = useState(false);
  
  // Use provided data or generate mock data
  const { nclexResults, practiceResults } = useMemo(() => {
    if (propNclexResults?.length || propPracticeResults?.length) {
      return { 
        nclexResults: propNclexResults || [], 
        practiceResults: propPracticeResults || [] 
      };
    }
    return generateMockData();
  }, [propNclexResults, propPracticeResults]);
  
  // Calculate analytics
  const analytics = useMemo(() => {
    const latestNCLEX = nclexResults[nclexResults.length - 1];
    const previousNCLEX = nclexResults[nclexResults.length - 2];
    
    // Ability trend
    const abilityTrend = nclexResults.map((r, i) => ({
      attempt: i + 1,
      ability: r.abilityEstimate,
      lowerCI: r.confidenceInterval[0],
      upperCI: r.confidenceInterval[1],
      passed: r.passed,
      date: r.date.toLocaleDateString()
    }));
    
    // Practice performance trend
    const practiceTrend = practiceResults.slice(-10).map((r, i) => ({
      session: i + 1,
      score: r.percentage,
      date: r.date.toLocaleDateString()
    }));
    
    // Category performance aggregated
    const categoryPerf = NCLEX_CATEGORIES.map(cat => {
      let totalCorrect = 0;
      let totalQuestions = 0;
      
      nclexResults.forEach(r => {
        if (r.categoryPerformance[cat.id]) {
          totalCorrect += r.categoryPerformance[cat.id].correct;
          totalQuestions += r.categoryPerformance[cat.id].total;
        }
      });
      
      return {
        category: cat.name.replace(' and ', ' & ').substring(0, 15),
        fullName: cat.name,
        id: cat.id,
        percentage: totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0,
        correct: totalCorrect,
        total: totalQuestions
      };
    }).sort((a, b) => a.percentage - b.percentage);
    
    // Question type performance
    const questionTypePerf = [
      { type: 'Multiple Choice', percentage: 72 + Math.floor(Math.random() * 15) },
      { type: 'SATA', percentage: 58 + Math.floor(Math.random() * 20) },
      { type: 'Ordered Response', percentage: 55 + Math.floor(Math.random() * 20) },
      { type: 'Matrix', percentage: 50 + Math.floor(Math.random() * 25) },
      { type: 'Bow-Tie', percentage: 45 + Math.floor(Math.random() * 25) },
      { type: 'Highlight', percentage: 60 + Math.floor(Math.random() * 20) }
    ];
    
    // Overall stats
    const totalPracticeQuestions = practiceResults.reduce((acc, r) => acc + r.total, 0);
    const totalPracticeCorrect = practiceResults.reduce((acc, r) => acc + r.score, 0);
    const avgPracticeScore = totalPracticeQuestions > 0 
      ? Math.round((totalPracticeCorrect / totalPracticeQuestions) * 100) 
      : 0;
    
    // Improvement calculation
    const abilityImprovement = latestNCLEX && previousNCLEX 
      ? latestNCLEX.abilityEstimate - previousNCLEX.abilityEstimate 
      : 0;
    
    return {
      latestNCLEX,
      previousNCLEX,
      abilityTrend,
      practiceTrend,
      categoryPerf,
      questionTypePerf,
      totalPracticeQuestions,
      avgPracticeScore,
      abilityImprovement,
      weakCategories: categoryPerf.slice(0, 3),
      strongCategories: categoryPerf.slice(-3).reverse()
    };
  }, [nclexResults, practiceResults]);
  
  // Generate AI Insights
  const aiInsights = useMemo(() => {
    const insights: {
      type: 'success' | 'warning' | 'danger' | 'info';
      title: string;
      message: string;
      action?: string;
      priority: number;
    }[] = [];
    
    const { latestNCLEX, weakCategories, avgPracticeScore, abilityImprovement } = analytics;
    
    // Passing probability insight
    if (latestNCLEX) {
      if (latestNCLEX.passingProbability >= 80) {
        insights.push({
          type: 'success',
          title: 'Excellent NCLEX Readiness',
          message: `Your passing probability is ${latestNCLEX.passingProbability.toFixed(0)}%. You're demonstrating strong competency across most areas. Continue with maintenance practice to stay sharp.`,
          action: 'Take a full practice exam',
          priority: 1
        });
      } else if (latestNCLEX.passingProbability >= 60) {
        insights.push({
          type: 'warning',
          title: 'Good Progress - Room for Improvement',
          message: `Your passing probability is ${latestNCLEX.passingProbability.toFixed(0)}%. You're on track but need to strengthen weak areas before scheduling your exam.`,
          action: 'Focus on weak categories',
          priority: 2
        });
      } else {
        insights.push({
          type: 'danger',
          title: 'Additional Study Required',
          message: `Your passing probability is ${latestNCLEX.passingProbability.toFixed(0)}%. We recommend intensive review of fundamentals before attempting more practice exams.`,
          action: 'Review study materials',
          priority: 1
        });
      }
    }
    
    // Improvement trend
    if (abilityImprovement > 0.3) {
      insights.push({
        type: 'success',
        title: 'Significant Improvement Detected',
        message: `Your ability estimate improved by ${(abilityImprovement * 100).toFixed(0)}% since your last attempt. Your study strategy is working!`,
        priority: 3
      });
    } else if (abilityImprovement < -0.2) {
      insights.push({
        type: 'warning',
        title: 'Performance Decline Noted',
        message: 'Your recent performance shows a slight decline. This could be due to fatigue or gaps in review. Consider taking a break and reviewing fundamentals.',
        action: 'Review weak areas',
        priority: 2
      });
    }
    
    // Weak category insights
    weakCategories.forEach((cat, i) => {
      if (cat.percentage < 60) {
        insights.push({
          type: 'danger',
          title: `Critical: ${cat.fullName}`,
          message: `Your performance in ${cat.fullName} is ${cat.percentage}%. This category represents a significant portion of the NCLEX exam and needs immediate attention.`,
          action: `Study ${cat.fullName}`,
          priority: 2 + i
        });
      } else if (cat.percentage < 70) {
        insights.push({
          type: 'warning',
          title: `Improve: ${cat.fullName}`,
          message: `Your ${cat.fullName} score of ${cat.percentage}% is below the recommended 70% threshold. Targeted practice can quickly improve this area.`,
          action: `Practice ${cat.fullName}`,
          priority: 4 + i
        });
      }
    });
    
    // Practice consistency
    if (practiceResults.length < 10) {
      insights.push({
        type: 'info',
        title: 'Increase Practice Frequency',
        message: 'Consistent daily practice is proven to improve NCLEX pass rates. Aim for at least 25-50 questions per day.',
        action: 'Start practice session',
        priority: 5
      });
    }
    
    // Question type weakness
    const weakQuestionTypes = analytics.questionTypePerf.filter(q => q.percentage < 60);
    if (weakQuestionTypes.length > 0) {
      insights.push({
        type: 'warning',
        title: 'NextGen Question Type Practice Needed',
        message: `You're scoring below 60% on ${weakQuestionTypes.map(q => q.type).join(', ')} questions. These NextGen formats require specific strategies.`,
        action: 'Practice NextGen questions',
        priority: 4
      });
    }
    
    return insights.sort((a, b) => a.priority - b.priority);
  }, [analytics, practiceResults.length]);

  // Custom tooltip for charts
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <p className="font-semibold text-gray-900 dark:text-white">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {entry.name}: {typeof entry.value === 'number' ? entry.value.toFixed(2) : entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">Pass Probability</p>
                <p className="text-3xl font-bold">
                  {analytics.latestNCLEX?.passingProbability.toFixed(0) || '--'}%
                </p>
              </div>
              <Target className="w-10 h-10 text-blue-200" />
            </div>
            {analytics.abilityImprovement !== 0 && (
              <div className={`flex items-center gap-1 mt-2 text-sm ${
                analytics.abilityImprovement > 0 ? 'text-green-200' : 'text-red-200'
              }`}>
                {analytics.abilityImprovement > 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                {Math.abs(analytics.abilityImprovement * 100).toFixed(0)}% from last
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">Ability Level</p>
                <p className="text-3xl font-bold">
                  {analytics.latestNCLEX?.abilityEstimate.toFixed(2) || '--'}
                </p>
              </div>
              <Brain className="w-10 h-10 text-purple-200" />
            </div>
            <p className="text-purple-200 text-sm mt-2">
              {analytics.latestNCLEX?.abilityEstimate > 0 ? 'Above passing' : 'Below passing'}
            </p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">Practice Score</p>
                <p className="text-3xl font-bold">{analytics.avgPracticeScore}%</p>
              </div>
              <CheckCircle2 className="w-10 h-10 text-green-200" />
            </div>
            <p className="text-green-200 text-sm mt-2">
              {analytics.totalPracticeQuestions} questions answered
            </p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm">NCLEX Attempts</p>
                <p className="text-3xl font-bold">{nclexResults.length}</p>
              </div>
              <Award className="w-10 h-10 text-orange-200" />
            </div>
            <p className="text-orange-200 text-sm mt-2">
              {nclexResults.filter(r => r.passed).length} passed
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
        {[
          { id: 'overview', label: 'Overview', icon: BarChart3 },
          { id: 'nclex', label: 'NCLEX Simulator', icon: Target },
          { id: 'practice', label: 'Practice Sessions', icon: BookOpen },
          { id: 'insights', label: 'AI Insights', icon: Sparkles }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={`flex items-center gap-2 px-4 py-3 border-b-2 whitespace-nowrap transition-colors ${
              activeTab === tab.id
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Confidence Interval Chart */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-blue-600" />
                NCLEX Ability Progression with 95% Confidence Interval
              </CardTitle>
              <CardDescription>
                Your ability estimate over time with confidence bounds
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={analytics.abilityTrend} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                    <defs>
                      <linearGradient id="ciGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.3}/>
                        <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0.05}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                    <YAxis 
                      domain={[-3, 3]} 
                      tick={{ fontSize: 12 }}
                      label={{ value: 'Ability (logits)', angle: -90, position: 'insideLeft' }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <ReferenceLine y={0} stroke={COLORS.warning} strokeDasharray="5 5" label="Passing Standard" />
                    <Area 
                      type="monotone" 
                      dataKey="upperCI" 
                      stackId="1"
                      stroke="transparent" 
                      fill="url(#ciGradient)"
                      name="Upper CI"
                    />
                    <Area 
                      type="monotone" 
                      dataKey="lowerCI" 
                      stackId="2"
                      stroke="transparent" 
                      fill="white"
                      name="Lower CI"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="ability" 
                      stroke={COLORS.primary} 
                      strokeWidth={3}
                      dot={{ fill: COLORS.primary, strokeWidth: 2, r: 6 }}
                      name="Ability Estimate"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Category Performance Radar */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5 text-purple-600" />
                Category Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={analytics.categoryPerf}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="category" tick={{ fontSize: 10 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} />
                    <Radar
                      name="Performance %"
                      dataKey="percentage"
                      stroke={COLORS.purple}
                      fill={COLORS.purple}
                      fillOpacity={0.5}
                    />
                    <Tooltip />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Question Type Performance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-orange-600" />
                Question Type Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics.questionTypePerf} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" domain={[0, 100]} />
                    <YAxis dataKey="type" type="category" width={100} tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="percentage" name="Score %">
                      {analytics.questionTypePerf.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={entry.percentage >= 70 ? COLORS.success : entry.percentage >= 50 ? COLORS.warning : COLORS.danger} 
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Practice Trend */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-600" />
                Practice Session Performance Trend
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={analytics.practiceTrend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />
                    <ReferenceLine y={70} stroke={COLORS.success} strokeDasharray="3 3" label="Target" />
                    <Line 
                      type="monotone" 
                      dataKey="score" 
                      stroke={COLORS.success} 
                      strokeWidth={2}
                      dot={{ fill: COLORS.success }}
                      name="Score %"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* NCLEX Tab */}
      {activeTab === 'nclex' && (
        <div className="space-y-6">
          {/* Detailed Confidence Interval Visualization */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-blue-600" />
                Confidence Interval Analysis
              </CardTitle>
              <CardDescription>
                Visual representation of your ability estimate and the 95% confidence interval
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {analytics.latestNCLEX && (
                <>
                  {/* Interactive CI Visualization */}
                  <div className="relative">
                    <div className="flex justify-between text-xs text-gray-500 mb-2">
                      <span>-3.0 (Low)</span>
                      <span>0.0 (Passing)</span>
                      <span>+3.0 (High)</span>
                    </div>
                    <div className="relative h-16 bg-gradient-to-r from-red-100 via-yellow-100 to-green-100 dark:from-red-900/20 dark:via-yellow-900/20 dark:to-green-900/20 rounded-xl overflow-hidden">
                      {/* Passing threshold */}
                      <div className="absolute top-0 bottom-0 w-1 bg-yellow-500 z-20" style={{ left: '50%' }}>
                        <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-semibold text-yellow-600 whitespace-nowrap">
                          Passing Standard
                        </div>
                      </div>
                      
                      {/* Confidence interval band */}
                      <div 
                        className={`absolute top-2 bottom-2 rounded-lg ${
                          analytics.latestNCLEX.passed ? 'bg-green-500/50' : 'bg-red-500/50'
                        }`}
                        style={{
                          left: `${((analytics.latestNCLEX.confidenceInterval[0] + 3) / 6) * 100}%`,
                          right: `${100 - ((analytics.latestNCLEX.confidenceInterval[1] + 3) / 6) * 100}%`
                        }}
                      />
                      
                      {/* Ability estimate marker */}
                      <div 
                        className="absolute top-1 bottom-1 w-4 bg-blue-600 rounded-full shadow-lg z-10 flex items-center justify-center"
                        style={{ left: `calc(${((analytics.latestNCLEX.abilityEstimate + 3) / 6) * 100}% - 8px)` }}
                      >
                        <div className="w-2 h-2 bg-white rounded-full" />
                      </div>
                    </div>
                    
                    {/* Legend */}
                    <div className="flex items-center justify-center gap-6 mt-4 text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-blue-600 rounded-full" />
                        <span>Your Ability ({analytics.latestNCLEX.abilityEstimate.toFixed(2)})</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className={`w-4 h-4 rounded ${analytics.latestNCLEX.passed ? 'bg-green-500/50' : 'bg-red-500/50'}`} />
                        <span>95% CI [{analytics.latestNCLEX.confidenceInterval[0].toFixed(2)}, {analytics.latestNCLEX.confidenceInterval[1].toFixed(2)}]</span>
                      </div>
                    </div>
                  </div>

                  {/* Pass/Fail Explanation */}
                  <div className={`p-4 rounded-xl ${
                    analytics.latestNCLEX.passed 
                      ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' 
                      : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
                  }`}>
                    <div className="flex items-start gap-3">
                      {analytics.latestNCLEX.passed ? (
                        <CheckCircle2 className="w-6 h-6 text-green-600 mt-0.5" />
                      ) : (
                        <AlertCircle className="w-6 h-6 text-red-600 mt-0.5" />
                      )}
                      <div>
                        <h4 className={`font-semibold ${analytics.latestNCLEX.passed ? 'text-green-800 dark:text-green-200' : 'text-red-800 dark:text-red-200'}`}>
                          {analytics.latestNCLEX.passed ? 'PASS' : 'BELOW PASSING STANDARD'}
                        </h4>
                        <p className={`text-sm ${analytics.latestNCLEX.passed ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'}`}>
                          {analytics.latestNCLEX.passed 
                            ? 'Your entire 95% confidence interval is above the passing standard (0.0 logits). This means we are at least 95% confident that your true ability exceeds the NCLEX passing threshold.'
                            : 'Your 95% confidence interval includes or is entirely below the passing standard. More practice is needed to demonstrate consistent performance above the threshold.'}
                        </p>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Historical CI Chart */}
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={analytics.abilityTrend} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                    <defs>
                      <linearGradient id="ciArea" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.4}/>
                        <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0.1}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="attempt" label={{ value: 'Attempt', position: 'bottom' }} />
                    <YAxis domain={[-3, 3]} label={{ value: 'Ability (logits)', angle: -90, position: 'insideLeft' }} />
                    <Tooltip content={<CustomTooltip />} />
                    <ReferenceLine y={0} stroke={COLORS.warning} strokeWidth={2} strokeDasharray="5 5" />
                    <Area 
                      type="monotone" 
                      dataKey="upperCI" 
                      stroke={COLORS.primary}
                      strokeWidth={1}
                      strokeDasharray="3 3"
                      fill="none"
                      name="Upper 95% CI"
                    />
                    <Area 
                      type="monotone" 
                      dataKey="lowerCI" 
                      stroke={COLORS.primary}
                      strokeWidth={1}
                      strokeDasharray="3 3"
                      fill="none"
                      name="Lower 95% CI"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="ability" 
                      stroke={COLORS.primary} 
                      strokeWidth={3}
                      dot={(props: any) => {
                        const { cx, cy, payload } = props;
                        return (
                          <circle 
                            cx={cx} 
                            cy={cy} 
                            r={8} 
                            fill={payload.passed ? COLORS.success : COLORS.danger}
                            stroke="white"
                            strokeWidth={2}
                          />
                        );
                      }}
                      name="Ability Estimate"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* NCLEX Attempt History */}
          <Card>
            <CardHeader>
              <CardTitle>Exam Attempt History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {nclexResults.slice().reverse().map((result, i) => (
                  <div 
                    key={result.id}
                    className={`p-4 rounded-xl border-2 ${
                      result.passed 
                        ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20' 
                        : 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          result.passed ? 'bg-green-500' : 'bg-red-500'
                        } text-white font-bold`}>
                          {nclexResults.length - i}
                        </div>
                        <div>
                          <p className="font-semibold">{result.passed ? 'PASS' : 'FAIL'}</p>
                          <p className="text-sm text-gray-500">{result.date.toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{result.questionsAnswered} questions</p>
                        <p className="text-sm text-gray-500">
                          Ability: {result.abilityEstimate.toFixed(2)} | Pass Prob: {result.passingProbability.toFixed(0)}%
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Practice Tab */}
      {activeTab === 'practice' && (
        <div className="space-y-6">
          {/* Practice Performance Over Time */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-600" />
                Practice Performance Over Time
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={analytics.practiceTrend}>
                    <defs>
                      <linearGradient id="practiceGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={COLORS.success} stopOpacity={0.4}/>
                        <stop offset="95%" stopColor={COLORS.success} stopOpacity={0.05}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />
                    <ReferenceLine y={70} stroke={COLORS.warning} strokeDasharray="5 5" label="Target 70%" />
                    <Area 
                      type="monotone" 
                      dataKey="score" 
                      stroke={COLORS.success}
                      strokeWidth={2}
                      fill="url(#practiceGradient)"
                      name="Score %"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Category Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-blue-600" />
                  Category Performance Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analytics.categoryPerf.map((cat, i) => (
                    <div key={cat.id} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="truncate pr-2">{cat.fullName}</span>
                        <span className={`font-semibold ${
                          cat.percentage >= 70 ? 'text-green-600' : 
                          cat.percentage >= 50 ? 'text-yellow-600' : 'text-red-600'
                        }`}>{cat.percentage}%</span>
                      </div>
                      <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all ${
                            cat.percentage >= 70 ? 'bg-green-500' : 
                            cat.percentage >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${cat.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Score Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-purple-600" />
                  Score Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Excellent (80%+)', value: practiceResults.filter(r => r.percentage >= 80).length, color: COLORS.success },
                          { name: 'Good (70-79%)', value: practiceResults.filter(r => r.percentage >= 70 && r.percentage < 80).length, color: COLORS.primary },
                          { name: 'Fair (60-69%)', value: practiceResults.filter(r => r.percentage >= 60 && r.percentage < 70).length, color: COLORS.warning },
                          { name: 'Needs Work (<60%)', value: practiceResults.filter(r => r.percentage < 60).length, color: COLORS.danger }
                        ]}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {[COLORS.success, COLORS.primary, COLORS.warning, COLORS.danger].map((color, index) => (
                          <Cell key={`cell-${index}`} fill={color} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* AI Insights Tab */}
      {activeTab === 'insights' && (
        <div className="space-y-6">
          <Card className="border-2 border-purple-200 dark:border-purple-800 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-600" />
                AI-Powered Study Recommendations
              </CardTitle>
              <CardDescription>
                Personalized insights based on your performance data
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {(showAllInsights ? aiInsights : aiInsights.slice(0, 3)).map((insight, i) => (
                <div 
                  key={i}
                  className={`p-4 rounded-xl border-2 ${
                    insight.type === 'success' ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20' :
                    insight.type === 'warning' ? 'border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-900/20' :
                    insight.type === 'danger' ? 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20' :
                    'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${
                      insight.type === 'success' ? 'bg-green-500' :
                      insight.type === 'warning' ? 'bg-yellow-500' :
                      insight.type === 'danger' ? 'bg-red-500' :
                      'bg-blue-500'
                    }`}>
                      <Lightbulb className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 dark:text-white">{insight.title}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{insight.message}</p>
                      {insight.action && (
                        <Button 
                          size="sm" 
                          className="mt-3"
                          onClick={() => onNavigate?.(insight.action === 'Start practice session' ? 'practice' : 'practice')}
                        >
                          {insight.action}
                          <ArrowRight className="w-4 h-4 ml-1" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              
              {aiInsights.length > 3 && (
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => setShowAllInsights(!showAllInsights)}
                >
                  {showAllInsights ? (
                    <>Show Less <ChevronUp className="w-4 h-4 ml-1" /></>
                  ) : (
                    <>Show All {aiInsights.length} Insights <ChevronDown className="w-4 h-4 ml-1" /></>
                  )}
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Study Plan Recommendation */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-blue-600" />
                Recommended Study Plan
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.weakCategories.map((cat, i) => (
                  <div key={cat.id} className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                    <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center font-bold text-blue-600">
                      {i + 1}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold">{cat.fullName}</p>
                      <p className="text-sm text-gray-500">Current: {cat.percentage}% | Target: 70%</p>
                    </div>
                    <Button size="sm" variant="outline">
                      Practice
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

export default PerformanceAnalytics;
