import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Brain, 
  Zap, 
  Target, 
  Clock, 
  BookOpen, 
  TrendingUp,
  ChevronRight,
  Settings,
  Play,
  Award,
  BarChart3
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { useNCLEXHistory, usePracticeHistory } from '../../services/hooks/usePractice';
import { catApi } from '../../services/api/cat.api';

interface PracticeMode {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  color: string;
  features: string[];
  duration: string;
  difficulty: string;
  path: string;
}

const practiceModes: PracticeMode[] = [
  {
    id: 'nclex',
    title: 'NCLEX Simulator',
    description: 'Full exam simulation with realistic timing, breaks, and authentic CAT algorithm',
    icon: Award,
    color: 'from-purple-600 to-indigo-600',
    features: ['75-145 questions', '5-hour time limit', 'NCLEX-RN format', 'Pass/Fail prediction'],
    duration: '2-5 hours',
    difficulty: 'Adaptive',
    path: '/app/practice/nclex'
  },
  {
    id: 'adaptive',
    title: 'Adaptive Test (CAT)',
    description: 'Computerized Adaptive Testing with IRT algorithm to assess your ability level',
    icon: Brain,
    color: 'from-blue-600 to-cyan-600',
    features: ['60-145 questions', 'IRT-based', 'Ability estimation', 'Confidence intervals'],
    duration: '1-3 hours',
    difficulty: 'Adaptive',
    path: '/app/practice/cat'
  },
  {
    id: 'quick',
    title: 'Quick Practice',
    description: 'Customizable practice sessions with instant feedback and category selection',
    icon: Zap,
    color: 'from-emerald-600 to-teal-600',
    features: ['5-100 questions', 'Choose categories', 'Timed/untimed', 'Instant feedback'],
    duration: '5-60 min',
    difficulty: 'Configurable',
    path: '/app/practice/quick'
  }
];

export function PracticeModeSelector() {
  const navigate = useNavigate();
  const { data: nclexHistory } = useNCLEXHistory(5);
  const { data: practiceHistory } = usePracticeHistory(5);
  const [selectedMode, setSelectedMode] = useState<string | null>(null);

  const getLastAttempt = (modeId: string) => {
    if (modeId === 'nclex' || modeId === 'adaptive') {
      return nclexHistory?.[0];
    }
    return practiceHistory?.[0];
  };

  const handleStartPractice = (mode: PracticeMode) => {
    navigate(mode.path);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Practice & Assessment
        </h1>
        <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Choose your practice mode to prepare for the NCLEX-RN exam. Each mode offers different 
          features to help you assess and improve your nursing knowledge.
        </p>
      </div>

      {/* Practice Mode Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {practiceModes.map((mode) => {
          const Icon = mode.icon;
          const lastAttempt = getLastAttempt(mode.id);
          
          return (
            <Card 
              key={mode.id}
              className={`relative overflow-hidden cursor-pointer transition-all hover:shadow-xl border-2 ${
                selectedMode === mode.id 
                  ? 'border-indigo-500 ring-2 ring-indigo-200' 
                  : 'border-transparent hover:border-gray-200'
              }`}
              onClick={() => setSelectedMode(mode.id)}
            >
              {/* Gradient Header */}
              <div className={`h-32 bg-gradient-to-br ${mode.color} p-6 flex items-center justify-between`}>
                <div>
                  <Icon className="w-12 h-12 text-white/90" />
                </div>
                <Badge className="bg-white/20 text-white border-0">
                  {mode.difficulty}
                </Badge>
              </div>

              <CardHeader className="pb-2">
                <CardTitle className="text-xl">{mode.title}</CardTitle>
                <CardDescription className="line-clamp-2">
                  {mode.description}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Features */}
                <div className="flex flex-wrap gap-2">
                  {mode.features.map((feature, i) => (
                    <span 
                      key={i}
                      className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded-full text-gray-600 dark:text-gray-400"
                    >
                      {feature}
                    </span>
                  ))}
                </div>

                {/* Duration */}
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Clock className="w-4 h-4" />
                  <span>Duration: {mode.duration}</span>
                </div>

                {/* Last Attempt (if exists) */}
                {lastAttempt && (
                  <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">Last attempt</p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">
                        {('passed' in lastAttempt) 
                          ? (lastAttempt.passed ? '✓ Passed' : '✗ Failed')
                          : `${lastAttempt.percentage}%`
                        }
                      </span>
                      <span className="text-xs text-gray-400">
                        {new Date(lastAttempt.date).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                )}

                {/* Action Button */}
                <Button 
                  className={`w-full bg-gradient-to-r ${mode.color}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleStartPractice(mode);
                  }}
                >
                  <Play className="w-4 h-4 mr-2" />
                  Start {mode.title.split(' ')[0]}
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Stats Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-indigo-600" />
            Your Practice Stats
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
              <p className="text-2xl font-bold text-indigo-600">
                {(nclexHistory?.length || 0) + (practiceHistory?.length || 0)}
              </p>
              <p className="text-sm text-gray-500">Total Sessions</p>
            </div>
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
              <p className="text-2xl font-bold text-green-600">
                {nclexHistory?.filter(h => h.passed).length || 0}
              </p>
              <p className="text-sm text-gray-500">NCLEX Passed</p>
            </div>
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
              <p className="text-2xl font-bold text-blue-600">
                {practiceHistory?.length 
                  ? Math.round(practiceHistory.reduce((sum, h) => sum + h.percentage, 0) / practiceHistory.length)
                  : 0}%
              </p>
              <p className="text-sm text-gray-500">Avg Practice Score</p>
            </div>
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
              <p className="text-2xl font-bold text-purple-600">
                {nclexHistory?.[0]?.passingProbability || 0}%
              </p>
              <p className="text-sm text-gray-500">Pass Probability</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Tips */}
      <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 border-indigo-200 dark:border-indigo-800">
        <CardContent className="p-6">
          <h3 className="font-semibold text-indigo-900 dark:text-indigo-300 mb-3">
            📚 Practice Tips
          </h3>
          <ul className="space-y-2 text-sm text-indigo-800 dark:text-indigo-300">
            <li className="flex items-start gap-2">
              <span className="text-indigo-600">•</span>
              Start with Quick Practice to identify your weak areas
            </li>
            <li className="flex items-start gap-2">
              <span className="text-indigo-600">•</span>
              Use Adaptive Test to get an accurate ability estimate
            </li>
            <li className="flex items-start gap-2">
              <span className="text-indigo-600">•</span>
              Take the NCLEX Simulator when you're ready to test exam readiness
            </li>
            <li className="flex items-start gap-2">
              <span className="text-indigo-600">•</span>
              Review explanations for all questions, especially incorrect ones
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

export default PracticeModeSelector;
