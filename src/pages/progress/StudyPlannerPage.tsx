/**
 * Study Planner Page - Create and manage personalized study plans
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Progress } from '../../components/ui/progress';
import { Input } from '../../components/ui/input';
import {
  Calendar,
  Plus,
  Target,
  Clock,
  CheckCircle2,
  Circle,
  Brain,
  Sparkles,
  TrendingUp,
  Flame,
  AlertCircle,
  ChevronRight,
  Play,
  BookOpen,
  FileQuestion,
  Layers,
  Video,
  RotateCcw
} from 'lucide-react';
import {
  useStudyPlans,
  useStudyStats,
  useTodaysTasks,
  useUpcomingTasks,
  useOverdueTasks,
  useCreatePlan,
  useCompleteTask,
  useGenerateAIPlan
} from '../../services/hooks/useStudyPlanner';
import { StudyPlanTask } from '../../services/api/studyPlanner.api';

const TASK_TYPE_ICONS: Record<string, any> = {
  quiz: FileQuestion,
  cat: Brain,
  flashcard: Layers,
  reading: BookOpen,
  video: Video,
  review: RotateCcw,
  practice: Target,
  custom: Circle
};

const NCLEX_CATEGORIES = [
  'Management of Care',
  'Safety and Infection Control',
  'Health Promotion',
  'Psychosocial Integrity',
  'Basic Care and Comfort',
  'Pharmacological Therapies',
  'Reduction of Risk',
  'Physiological Adaptation'
];

export default function StudyPlannerPage() {
  const navigate = useNavigate();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPlanName, setNewPlanName] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [dailyHours, setDailyHours] = useState(2);
  const [selectedWeakAreas, setSelectedWeakAreas] = useState<string[]>([]);
  const [useAI, setUseAI] = useState(true);

  const { data: plans, isLoading: loadingPlans } = useStudyPlans('active');
  const { data: stats } = useStudyStats();
  const { data: todaysTasks, isLoading: loadingToday } = useTodaysTasks();
  const { data: upcomingTasks } = useUpcomingTasks(7);
  const { data: overdueTasks } = useOverdueTasks();

  const createPlanMutation = useCreatePlan();
  const completeTaskMutation = useCompleteTask();
  const generateAIPlanMutation = useGenerateAIPlan();

  const handleCreatePlan = async () => {
    if (!newPlanName.trim() || !targetDate) return;

    try {
      const plan = await createPlanMutation.mutateAsync({
        name: newPlanName,
        targetDate,
        dailyStudyHours: dailyHours,
        weakAreas: selectedWeakAreas,
        useAI
      });

      if (useAI) {
        await generateAIPlanMutation.mutateAsync(plan.id);
      }

      setShowCreateModal(false);
      setNewPlanName('');
      setTargetDate('');
      setSelectedWeakAreas([]);
    } catch (error) {
      console.error('Failed to create plan:', error);
    }
  };

  const handleCompleteTask = async (task: StudyPlanTask) => {
    try {
      await completeTaskMutation.mutateAsync({
        taskId: task.id,
        results: {
          actualMinutes: task.estimatedMinutes
        }
      });
    } catch (error) {
      console.error('Failed to complete task:', error);
    }
  };

  const getTaskIcon = (type: string) => {
    const Icon = TASK_TYPE_ICONS[type] || Circle;
    return <Icon className="size-4" />;
  };

  const TaskCard = ({ task, showDate = false }: { task: StudyPlanTask; showDate?: boolean }) => (
    <div className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${
      task.status === 'completed' 
        ? 'bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800'
        : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-blue-300'
    }`}>
      <button
        onClick={() => task.status !== 'completed' && handleCompleteTask(task)}
        disabled={task.status === 'completed' || completeTaskMutation.isPending}
        className={`size-8 rounded-full border-2 flex items-center justify-center transition-colors ${
          task.status === 'completed'
            ? 'bg-green-500 border-green-500 text-white'
            : 'border-gray-300 dark:border-gray-600 hover:border-green-500 hover:bg-green-50'
        }`}
      >
        {task.status === 'completed' ? (
          <CheckCircle2 className="size-5" />
        ) : (
          <Circle className="size-5" />
        )}
      </button>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className={`p-1 rounded ${
            task.status === 'completed' ? 'bg-green-100 dark:bg-green-900' : 'bg-blue-100 dark:bg-blue-900'
          }`}>
            {getTaskIcon(task.type)}
          </span>
          <span className={`font-medium ${
            task.status === 'completed' ? 'text-green-700 dark:text-green-300 line-through' : 'text-gray-900 dark:text-white'
          }`}>
            {task.title}
          </span>
        </div>
        <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
          {task.category && <Badge variant="outline" className="text-xs">{task.category}</Badge>}
          <span className="flex items-center gap-1">
            <Clock className="size-3" />
            {task.estimatedMinutes}m
          </span>
          {showDate && (
            <span>{new Date(task.scheduledDate).toLocaleDateString()}</span>
          )}
        </div>
      </div>
      
      {task.status !== 'completed' && (
        <Button size="sm" variant="ghost" onClick={() => handleCompleteTask(task)}>
          <Play className="size-4" />
        </Button>
      )}
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Study Planner</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Plan your NCLEX preparation journey
          </p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="size-4 mr-2" />
          New Plan
        </Button>
      </div>

      {/* Stats Overview */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <Target className="size-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stats.totalTasksCompleted}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Tasks Done</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                  <Clock className="size-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {Math.round(stats.totalMinutesStudied / 60)}h
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Study Time</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
                  <Flame className="size-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stats.currentStreak}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Day Streak</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                  <TrendingUp className="size-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stats.longestStreak}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Best Streak</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Tasks */}
        <div className="lg:col-span-2 space-y-6">
          {/* Overdue Tasks */}
          {overdueTasks && overdueTasks.length > 0 && (
            <Card className="border-2 border-red-300 bg-red-50 dark:bg-red-950">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-700 dark:text-red-300">
                  <AlertCircle className="size-5" />
                  Overdue Tasks ({overdueTasks.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {overdueTasks.slice(0, 3).map(task => (
                  <TaskCard key={task.id} task={task} showDate />
                ))}
                {overdueTasks.length > 3 && (
                  <Button variant="ghost" className="w-full text-red-600">
                    View all {overdueTasks.length} overdue tasks
                  </Button>
                )}
              </CardContent>
            </Card>
          )}

          {/* Today's Tasks */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="size-5 text-blue-600" />
                  Today's Tasks
                </CardTitle>
                <Badge variant="outline">
                  {todaysTasks?.filter(t => t.status === 'completed').length || 0}/{todaysTasks?.length || 0}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              {loadingToday ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                </div>
              ) : todaysTasks?.length ? (
                <div className="space-y-3">
                  {todaysTasks.map(task => (
                    <TaskCard key={task.id} task={task} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <CheckCircle2 className="size-12 mx-auto mb-3 text-green-500" />
                  <p>No tasks for today!</p>
                  <p className="text-sm">Create a study plan to get started</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Upcoming Tasks */}
          {upcomingTasks && upcomingTasks.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="size-5 text-purple-600" />
                  Upcoming This Week
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {upcomingTasks.slice(0, 5).map(task => (
                  <TaskCard key={task.id} task={task} showDate />
                ))}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Active Plans Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="size-5 text-green-600" />
                Active Plans
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loadingPlans ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                </div>
              ) : plans?.length ? (
                <div className="space-y-4">
                  {plans.map(plan => {
                    const progressPct = plan.progress?.totalTasks 
                      ? Math.round((plan.progress.completedTasks / plan.progress.totalTasks) * 100)
                      : 0;
                    const daysUntilTarget = Math.ceil(
                      (new Date(plan.targetDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
                    );

                    return (
                      <div 
                        key={plan.id}
                        className="p-4 rounded-xl border-2 border-gray-200 dark:border-gray-700 hover:border-blue-300 cursor-pointer transition-all"
                        onClick={() => navigate(`/app/planner/${plan.id}`)}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h4 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                              {plan.name}
                              {plan.isAIGenerated && (
                                <Sparkles className="size-4 text-purple-500" />
                              )}
                            </h4>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {daysUntilTarget > 0 ? `${daysUntilTarget} days left` : 'Target date passed'}
                            </p>
                          </div>
                          <ChevronRight className="size-5 text-gray-400" />
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600 dark:text-gray-400">Progress</span>
                            <span className="font-medium text-gray-900 dark:text-white">{progressPct}%</span>
                          </div>
                          <Progress value={progressPct} className="h-2" />
                        </div>

                        {plan.progress?.currentStreak > 0 && (
                          <div className="flex items-center gap-1 mt-3 text-sm text-orange-600">
                            <Flame className="size-4" />
                            {plan.progress.currentStreak} day streak!
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-6 text-gray-500">
                  <Calendar className="size-10 mx-auto mb-2 text-gray-400" />
                  <p>No active plans</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-3"
                    onClick={() => setShowCreateModal(true)}
                  >
                    Create Plan
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* AI Insights */}
          {plans?.[0]?.aiInsights && (
            <Card className="border-2 border-purple-300 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950 dark:to-blue-950">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-purple-700 dark:text-purple-300">
                  <Sparkles className="size-5" />
                  AI Insights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {plans[0].aiInsights.recommendations?.slice(0, 3).map((rec, i) => (
                    <p key={i} className="text-sm text-purple-800 dark:text-purple-200">
                      • {rec}
                    </p>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Create Plan Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>Create Study Plan</CardTitle>
              <CardDescription>
                Set up your personalized NCLEX preparation plan
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                  Plan Name *
                </label>
                <Input
                  value={newPlanName}
                  onChange={(e) => setNewPlanName(e.target.value)}
                  placeholder="e.g., NCLEX Prep - Spring 2025"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                  Target Exam Date *
                </label>
                <Input
                  type="date"
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                  Daily Study Hours: {dailyHours}h
                </label>
                <input
                  type="range"
                  min="1"
                  max="6"
                  step="0.5"
                  value={dailyHours}
                  onChange={(e) => setDailyHours(parseFloat(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>1h</span>
                  <span>6h</span>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                  Areas Needing Focus (Optional)
                </label>
                <div className="flex flex-wrap gap-2">
                  {NCLEX_CATEGORIES.map(category => (
                    <Badge
                      key={category}
                      variant={selectedWeakAreas.includes(category) ? 'default' : 'outline'}
                      className="cursor-pointer"
                      onClick={() => setSelectedWeakAreas(prev =>
                        prev.includes(category)
                          ? prev.filter(c => c !== category)
                          : [...prev, category]
                      )}
                    >
                      {category}
                    </Badge>
                  ))}
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-4 bg-purple-50 dark:bg-purple-950 rounded-xl border-2 border-purple-200 dark:border-purple-800">
                <input
                  type="checkbox"
                  id="useAI"
                  checked={useAI}
                  onChange={(e) => setUseAI(e.target.checked)}
                  className="size-5"
                />
                <label htmlFor="useAI" className="flex-1 cursor-pointer">
                  <div className="flex items-center gap-2 font-medium text-purple-900 dark:text-purple-100">
                    <Sparkles className="size-4" />
                    Generate AI Study Plan
                  </div>
                  <p className="text-sm text-purple-700 dark:text-purple-300">
                    Let AI create an optimized schedule based on your goals
                  </p>
                </label>
              </div>
              
              <div className="flex gap-3 pt-4">
                <Button variant="outline" onClick={() => setShowCreateModal(false)} className="flex-1">
                  Cancel
                </Button>
                <Button 
                  onClick={handleCreatePlan}
                  disabled={!newPlanName.trim() || !targetDate || createPlanMutation.isPending}
                  className="flex-1"
                >
                  {createPlanMutation.isPending || generateAIPlanMutation.isPending 
                    ? 'Creating...' 
                    : 'Create Plan'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
