/**
 * Study Plan Detail Page - View and manage a specific study plan
 */

import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Progress } from '../../components/ui/progress';
import { Input } from '../../components/ui/input';
import {
  ArrowLeft,
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
  Trash2,
  Edit,
  Play,
  BookOpen,
  FileQuestion,
  Layers,
  Video,
  RotateCcw,
  Loader2,
  CalendarDays,
  Flag
} from 'lucide-react';
import {
  useStudyPlan,
  useUpdatePlan,
  useDeletePlan,
  useAddTask,
  useUpdateTask,
  useDeleteTask,
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

const TASK_TYPES = [
  { value: 'quiz', label: 'Quiz', icon: FileQuestion },
  { value: 'cat', label: 'CAT Test', icon: Brain },
  { value: 'flashcard', label: 'Flashcards', icon: Layers },
  { value: 'reading', label: 'Reading', icon: BookOpen },
  { value: 'video', label: 'Video', icon: Video },
  { value: 'review', label: 'Review', icon: RotateCcw },
  { value: 'practice', label: 'Practice', icon: Target },
  { value: 'custom', label: 'Custom', icon: Circle }
];

export default function StudyPlanDetailPage() {
  const { planId } = useParams<{ planId: string }>();
  const navigate = useNavigate();
  
  const [showAddTask, setShowAddTask] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskType, setNewTaskType] = useState<string>('custom');
  const [newTaskDate, setNewTaskDate] = useState('');
  const [newTaskMinutes, setNewTaskMinutes] = useState(30);
  const [isAddingTask, setIsAddingTask] = useState(false);

  const { data: plan, isLoading, error } = useStudyPlan(planId || '');
  const updatePlanMutation = useUpdatePlan();
  const deletePlanMutation = useDeletePlan();
  const addTaskMutation = useAddTask();
  const completeTaskMutation = useCompleteTask();
  const generateAIPlanMutation = useGenerateAIPlan();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="size-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error || !plan) {
    return (
      <div className="max-w-2xl mx-auto p-4 text-center">
        <AlertCircle className="size-16 text-red-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Plan Not Found</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          This study plan could not be found.
        </p>
        <Button onClick={() => navigate('/app/progress/planner')}>
          <ArrowLeft className="size-4 mr-2" />
          Back to Planner
        </Button>
      </div>
    );
  }

  const progressPct = plan.progress?.totalTasks 
    ? Math.round((plan.progress.completedTasks / plan.progress.totalTasks) * 100)
    : 0;
  
  const daysUntilTarget = Math.ceil(
    (new Date(plan.targetDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );

  const handleAddTask = async () => {
    if (!planId || !newTaskTitle.trim() || !newTaskDate) return;
    
    setIsAddingTask(true);
    try {
      await addTaskMutation.mutateAsync({
        planId,
        input: {
          title: newTaskTitle,
          type: newTaskType as any,
          scheduledDate: newTaskDate,
          estimatedMinutes: newTaskMinutes
        }
      });
      setShowAddTask(false);
      setNewTaskTitle('');
      setNewTaskType('custom');
      setNewTaskDate('');
      setNewTaskMinutes(30);
    } catch (error) {
      console.error('Failed to add task:', error);
    } finally {
      setIsAddingTask(false);
    }
  };

  const handleCompleteTask = async (task: StudyPlanTask) => {
    try {
      await completeTaskMutation.mutateAsync({
        taskId: task.id,
        results: { actualMinutes: task.estimatedMinutes }
      });
    } catch (error) {
      console.error('Failed to complete task:', error);
    }
  };

  const handleDeletePlan = async () => {
    if (!planId) return;
    if (!confirm('Are you sure you want to delete this plan? This action cannot be undone.')) return;
    
    try {
      await deletePlanMutation.mutateAsync(planId);
      navigate('/app/progress/planner');
    } catch (error) {
      console.error('Failed to delete plan:', error);
    }
  };

  const handleGenerateAI = async () => {
    if (!planId) return;
    try {
      await generateAIPlanMutation.mutateAsync(planId);
    } catch (error) {
      console.error('Failed to generate AI plan:', error);
    }
  };

  const getTaskIcon = (type: string) => {
    const Icon = TASK_TYPE_ICONS[type] || Circle;
    return <Icon className="size-4" />;
  };

  // Group tasks by date
  const tasksByDate = (plan.tasks || []).reduce((acc, task) => {
    const date = new Date(task.scheduledDate).toLocaleDateString();
    if (!acc[date]) acc[date] = [];
    acc[date].push(task);
    return acc;
  }, {} as Record<string, StudyPlanTask[]>);

  const sortedDates = Object.keys(tasksByDate).sort(
    (a, b) => new Date(a).getTime() - new Date(b).getTime()
  );

  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-4 py-4 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/app/progress/planner')}>
            <ArrowLeft className="size-5" />
          </Button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              {plan.name}
              {plan.isAIGenerated && <Sparkles className="size-5 text-purple-500" />}
            </h1>
            <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400 mt-1">
              <span className="flex items-center gap-1">
                <CalendarDays className="size-4" />
                {daysUntilTarget > 0 ? `${daysUntilTarget} days left` : 'Target passed'}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="size-4" />
                {plan.dailyStudyHours}h/day
              </span>
              <Badge variant={plan.status === 'active' ? 'default' : 'secondary'}>
                {plan.status}
              </Badge>
            </div>
          </div>
        </div>
        
        <div className="flex gap-2">
          {!plan.isAIGenerated && (
            <Button 
              variant="outline" 
              onClick={handleGenerateAI}
              disabled={generateAIPlanMutation.isPending}
            >
              {generateAIPlanMutation.isPending ? (
                <Loader2 className="size-4 mr-2 animate-spin" />
              ) : (
                <Sparkles className="size-4 mr-2" />
              )}
              Generate AI Tasks
            </Button>
          )}
          <Button variant="destructive" size="icon" onClick={handleDeletePlan}>
            <Trash2 className="size-4" />
          </Button>
        </div>
      </div>

      {/* Progress Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Overall Progress</p>
              <div className="flex items-center gap-3">
                <Progress value={progressPct} className="h-3 flex-1" />
                <span className="text-lg font-bold text-gray-900 dark:text-white">{progressPct}%</span>
              </div>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {plan.progress?.completedTasks || 0}/{plan.progress?.totalTasks || 0}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Tasks Completed</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {Math.round((plan.progress?.totalMinutesStudied || 0) / 60)}h
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Study Time</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-500 flex items-center justify-center gap-1">
                <Flame className="size-5" />
                {plan.progress?.currentStreak || 0}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Day Streak</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AI Insights */}
      {plan.aiInsights && plan.aiInsights.recommendations?.length > 0 && (
        <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950 dark:to-blue-950">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-purple-700 dark:text-purple-300">
              <Sparkles className="size-5" />
              AI Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {plan.aiInsights.recommendations.map((rec, i) => (
                <li key={i} className="text-sm text-purple-800 dark:text-purple-200 flex items-start gap-2">
                  <TrendingUp className="size-4 mt-0.5 flex-shrink-0" />
                  {rec}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Tasks Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Tasks</h2>
          <Button onClick={() => setShowAddTask(true)}>
            <Plus className="size-4 mr-2" />
            Add Task
          </Button>
        </div>

        {/* Add Task Form */}
        {showAddTask && (
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                    Task Title
                  </label>
                  <Input
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    placeholder="e.g., Review Pharmacology"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                    Task Type
                  </label>
                  <select
                    value={newTaskType}
                    onChange={(e) => setNewTaskType(e.target.value)}
                    className="w-full h-10 px-3 rounded-md border border-input bg-background"
                  >
                    {TASK_TYPES.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                    Scheduled Date
                  </label>
                  <Input
                    type="date"
                    value={newTaskDate}
                    onChange={(e) => setNewTaskDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                    Duration (minutes)
                  </label>
                  <Input
                    type="number"
                    value={newTaskMinutes}
                    onChange={(e) => setNewTaskMinutes(parseInt(e.target.value))}
                    min={5}
                    max={240}
                  />
                </div>
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setShowAddTask(false)}>Cancel</Button>
                <Button 
                  onClick={handleAddTask}
                  disabled={isAddingTask || !newTaskTitle.trim() || !newTaskDate}
                >
                  {isAddingTask ? <Loader2 className="size-4 mr-2 animate-spin" /> : <Plus className="size-4 mr-2" />}
                  Add Task
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tasks by Date */}
        {sortedDates.length > 0 ? (
          <div className="space-y-6">
            {sortedDates.map(date => (
              <div key={date}>
                <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-3 flex items-center gap-2">
                  <Calendar className="size-4" />
                  {date}
                </h3>
                <div className="space-y-2">
                  {tasksByDate[date].map(task => (
                    <div
                      key={task.id}
                      className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${
                        task.status === 'completed'
                          ? 'bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800'
                          : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-blue-300'
                      }`}
                    >
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
                          <Badge variant="outline" className="text-xs capitalize">{task.type}</Badge>
                        </div>
                      </div>

                      {task.status !== 'completed' && (
                        <Button size="sm" variant="ghost" onClick={() => handleCompleteTask(task)}>
                          <Play className="size-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <Calendar className="size-12 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-600 dark:text-gray-400 mb-4">No tasks yet</p>
              <div className="flex gap-2 justify-center">
                <Button variant="outline" onClick={() => setShowAddTask(true)}>
                  <Plus className="size-4 mr-2" />
                  Add Manual Task
                </Button>
                {!plan.isAIGenerated && (
                  <Button onClick={handleGenerateAI} disabled={generateAIPlanMutation.isPending}>
                    <Sparkles className="size-4 mr-2" />
                    Generate AI Tasks
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Milestones */}
      {plan.milestones && plan.milestones.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Flag className="size-5 text-orange-500" />
              Milestones
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {plan.milestones.map(milestone => (
                <div
                  key={milestone.id}
                  className={`flex items-center gap-4 p-4 rounded-lg border ${
                    milestone.status === 'achieved'
                      ? 'bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800'
                      : 'bg-white border-gray-200 dark:bg-gray-800 dark:border-gray-700'
                  }`}
                >
                  <div className={`size-10 rounded-full flex items-center justify-center ${
                    milestone.status === 'achieved' ? 'bg-green-500 text-white' : 'bg-gray-200 dark:bg-gray-700'
                  }`}>
                    {milestone.status === 'achieved' ? (
                      <CheckCircle2 className="size-5" />
                    ) : (
                      <Flag className="size-5 text-gray-500" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 dark:text-white">{milestone.title}</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Target: {new Date(milestone.targetDate).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge variant={milestone.status === 'achieved' ? 'default' : 'outline'}>
                    {milestone.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
