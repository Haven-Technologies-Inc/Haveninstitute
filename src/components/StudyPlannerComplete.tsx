import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Calendar } from './ui/calendar';
import { Progress } from './ui/progress';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Checkbox } from './ui/checkbox';
import { ScrollArea } from './ui/scroll-area';
import { 
  Calendar as CalendarIcon,
  Clock,
  Target,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Plus,
  Edit,
  Trash2,
  Bell,
  Flame,
  Award,
  BookOpen,
  Brain,
  ArrowLeft,
  BarChart3,
  ListTodo,
  PlayCircle,
  PauseCircle,
  StopCircle,
  Timer,
  Zap,
  Trophy,
  Star,
  ChevronRight,
  Filter,
  Download,
  Settings
} from 'lucide-react';
import { useAuth } from './auth/AuthContext';

interface StudyPlannerProps {
  onBack: () => void;
}

interface StudySession {
  id: string;
  title: string;
  category: string;
  date: Date;
  startTime: string;
  endTime: string;
  duration: number; // minutes
  completed: boolean;
  notes?: string;
  topics: string[];
  priority: 'low' | 'medium' | 'high';
}

interface Task {
  id: string;
  title: string;
  description: string;
  category: string;
  dueDate: Date;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  estimatedTime: number; // minutes
}

interface Goal {
  id: string;
  title: string;
  description: string;
  targetDate: Date;
  currentProgress: number;
  targetProgress: number;
  category: string;
  milestones: Milestone[];
}

interface Milestone {
  id: string;
  title: string;
  completed: boolean;
  dueDate: Date;
}

interface StudyStats {
  totalMinutes: number;
  sessionsCompleted: number;
  currentStreak: number;
  longestStreak: number;
  averageSessionLength: number;
  categoryBreakdown: Record<string, number>;
}

const NCLEX_CATEGORIES = [
  'Management of Care',
  'Safety and Infection Control',
  'Health Promotion and Maintenance',
  'Psychosocial Integrity',
  'Basic Care and Comfort',
  'Pharmacological Therapies',
  'Reduction of Risk Potential',
  'Physiological Adaptation'
];

const PRIORITIES = [
  { value: 'low', label: 'Low', color: 'bg-blue-500' },
  { value: 'medium', label: 'Medium', color: 'bg-yellow-500' },
  { value: 'high', label: 'High', color: 'bg-red-500' }
];

export function StudyPlannerComplete({ onBack }: StudyPlannerProps) {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [activeTab, setActiveTab] = useState('calendar');
  const [showSessionDialog, setShowSessionDialog] = useState(false);
  const [showTaskDialog, setShowTaskDialog] = useState(false);
  const [showGoalDialog, setShowGoalDialog] = useState(false);
  const [editingSession, setEditingSession] = useState<StudySession | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);

  // Timer state
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [currentSessionTitle, setCurrentSessionTitle] = useState('');

  // Data
  const [sessions, setSessions] = useState<StudySession[]>([
    {
      id: '1',
      title: 'Pharmacology Review',
      category: 'Pharmacological Therapies',
      date: new Date(),
      startTime: '09:00',
      endTime: '11:00',
      duration: 120,
      completed: true,
      topics: ['Cardiovascular drugs', 'Antibiotics'],
      priority: 'high',
      notes: 'Covered major drug classes and interactions'
    },
    {
      id: '2',
      title: 'Practice Questions - Safety',
      category: 'Safety and Infection Control',
      date: new Date(),
      startTime: '14:00',
      endTime: '15:30',
      duration: 90,
      completed: true,
      topics: ['Standard precautions', 'Fall prevention'],
      priority: 'medium'
    },
    {
      id: '3',
      title: 'Maternal-Newborn Nursing',
      category: 'Health Promotion and Maintenance',
      date: new Date(Date.now() + 86400000), // Tomorrow
      startTime: '10:00',
      endTime: '12:00',
      duration: 120,
      completed: false,
      topics: ['Labor stages', 'Postpartum care'],
      priority: 'high'
    }
  ]);

  const [tasks, setTasks] = useState<Task[]>([
    {
      id: '1',
      title: 'Complete 50 practice questions',
      description: 'Focus on pharmacology and medication calculations',
      category: 'Pharmacological Therapies',
      dueDate: new Date(),
      completed: false,
      priority: 'high',
      estimatedTime: 60
    },
    {
      id: '2',
      title: 'Review lab values',
      description: 'Memorize normal ranges for common lab tests',
      category: 'Reduction of Risk Potential',
      dueDate: new Date(Date.now() + 86400000),
      completed: false,
      priority: 'medium',
      estimatedTime: 45
    },
    {
      id: '3',
      title: 'Read chapter on fluid/electrolytes',
      description: 'Book chapter 5, pages 120-145',
      category: 'Physiological Adaptation',
      dueDate: new Date(Date.now() + 172800000),
      completed: false,
      priority: 'medium',
      estimatedTime: 90
    }
  ]);

  const [goals, setGoals] = useState<Goal[]>([
    {
      id: '1',
      title: 'Complete NCLEX Review Course',
      description: 'Finish all 8 NCLEX categories with 80%+ scores',
      targetDate: new Date(Date.now() + 30 * 86400000),
      currentProgress: 5,
      targetProgress: 8,
      category: 'Overall',
      milestones: [
        { id: 'm1', title: 'Complete Management of Care', completed: true, dueDate: new Date() },
        { id: 'm2', title: 'Complete Safety and Infection Control', completed: true, dueDate: new Date() },
        { id: 'm3', title: 'Complete Health Promotion', completed: false, dueDate: new Date(Date.now() + 7 * 86400000) },
        { id: 'm4', title: 'Complete Psychosocial Integrity', completed: false, dueDate: new Date(Date.now() + 14 * 86400000) }
      ]
    },
    {
      id: '2',
      title: 'Master Pharmacology',
      description: 'Achieve 90%+ on all pharmacology practice tests',
      targetDate: new Date(Date.now() + 21 * 86400000),
      currentProgress: 65,
      targetProgress: 100,
      category: 'Pharmacological Therapies',
      milestones: [
        { id: 'm5', title: 'Cardiovascular drugs', completed: true, dueDate: new Date() },
        { id: 'm6', title: 'Antibiotics and antivirals', completed: true, dueDate: new Date() },
        { id: 'm7', title: 'Endocrine medications', completed: false, dueDate: new Date(Date.now() + 7 * 86400000) }
      ]
    }
  ]);

  // Study stats calculation
  const calculateStats = (): StudyStats => {
    const completedSessions = sessions.filter(s => s.completed);
    const totalMinutes = completedSessions.reduce((acc, s) => acc + s.duration, 0);
    
    const categoryBreakdown: Record<string, number> = {};
    completedSessions.forEach(session => {
      categoryBreakdown[session.category] = (categoryBreakdown[session.category] || 0) + session.duration;
    });

    return {
      totalMinutes,
      sessionsCompleted: completedSessions.length,
      currentStreak: 7, // Mock data
      longestStreak: 12, // Mock data
      averageSessionLength: completedSessions.length > 0 ? Math.round(totalMinutes / completedSessions.length) : 0,
      categoryBreakdown
    };
  };

  const stats = calculateStats();

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setTimerSeconds(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const startTimer = (title: string) => {
    setCurrentSessionTitle(title);
    setIsTimerRunning(true);
    setTimerSeconds(0);
  };

  const pauseTimer = () => {
    setIsTimerRunning(false);
  };

  const stopTimer = () => {
    if (timerSeconds > 0) {
      const newSession: StudySession = {
        id: Date.now().toString(),
        title: currentSessionTitle || 'Study Session',
        category: 'General',
        date: new Date(),
        startTime: new Date(Date.now() - timerSeconds * 1000).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        endTime: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        duration: Math.round(timerSeconds / 60),
        completed: true,
        topics: [],
        priority: 'medium'
      };
      setSessions([...sessions, newSession]);
    }
    setIsTimerRunning(false);
    setTimerSeconds(0);
    setCurrentSessionTitle('');
  };

  const handleAddSession = (sessionData: Partial<StudySession>) => {
    if (editingSession) {
      setSessions(sessions.map(s => s.id === editingSession.id ? { ...s, ...sessionData } : s));
      setEditingSession(null);
    } else {
      const newSession: StudySession = {
        id: Date.now().toString(),
        completed: false,
        topics: [],
        ...sessionData
      } as StudySession;
      setSessions([...sessions, newSession]);
    }
    setShowSessionDialog(false);
  };

  const handleAddTask = (taskData: Partial<Task>) => {
    if (editingTask) {
      setTasks(tasks.map(t => t.id === editingTask.id ? { ...t, ...taskData } : t));
      setEditingTask(null);
    } else {
      const newTask: Task = {
        id: Date.now().toString(),
        completed: false,
        ...taskData
      } as Task;
      setTasks([...tasks, newTask]);
    }
    setShowTaskDialog(false);
  };

  const handleAddGoal = (goalData: Partial<Goal>) => {
    if (editingGoal) {
      setGoals(goals.map(g => g.id === editingGoal.id ? { ...g, ...goalData } : g));
      setEditingGoal(null);
    } else {
      const newGoal: Goal = {
        id: Date.now().toString(),
        currentProgress: 0,
        milestones: [],
        ...goalData
      } as Goal;
      setGoals([...goals, newGoal]);
    }
    setShowGoalDialog(false);
  };

  const toggleTaskCompletion = (taskId: string) => {
    setTasks(tasks.map(t => t.id === taskId ? { ...t, completed: !t.completed } : t));
  };

  const toggleSessionCompletion = (sessionId: string) => {
    setSessions(sessions.map(s => s.id === sessionId ? { ...s, completed: !s.completed } : s));
  };

  const deleteTask = (taskId: string) => {
    setTasks(tasks.filter(t => t.id !== taskId));
  };

  const deleteSession = (sessionId: string) => {
    setSessions(sessions.filter(s => s.id !== sessionId));
  };

  const deleteGoal = (goalId: string) => {
    setGoals(goals.filter(g => g.id !== goalId));
  };

  const getSessionsForDate = (date: Date) => {
    return sessions.filter(s => 
      s.date.toDateString() === date.toDateString()
    );
  };

  const getTasksForDate = (date: Date) => {
    return tasks.filter(t => 
      t.dueDate.toDateString() === date.toDateString()
    );
  };

  const todaySessions = getSessionsForDate(new Date());
  const todayTasks = getTasksForDate(new Date());
  const upcomingTasks = tasks.filter(t => !t.completed && t.dueDate >= new Date()).slice(0, 5);
  const overdueTasks = tasks.filter(t => !t.completed && t.dueDate < new Date());

  return (
    <div className="max-w-7xl mx-auto p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Button variant="ghost" onClick={onBack}>
              <ArrowLeft className="size-4 mr-2" />
              Back
            </Button>
          </div>
          <h1 className="text-3xl mb-2">📅 Study Planner</h1>
          <p className="text-gray-600">Organize your NCLEX preparation with smart scheduling</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="size-4 mr-2" />
            Export
          </Button>
          <Button variant="outline">
            <Settings className="size-4" />
          </Button>
        </div>
      </div>

      {/* Study Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <Clock className="size-8 text-blue-600" />
              <TrendingUp className="size-4 text-green-600" />
            </div>
            <p className="text-2xl mb-1">{Math.round(stats.totalMinutes / 60)}h</p>
            <p className="text-sm text-gray-600">Total Study Time</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <CheckCircle2 className="size-8 text-green-600" />
            </div>
            <p className="text-2xl mb-1">{stats.sessionsCompleted}</p>
            <p className="text-sm text-gray-600">Sessions Complete</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <Flame className="size-8 text-orange-600" />
            </div>
            <p className="text-2xl mb-1">{stats.currentStreak}</p>
            <p className="text-sm text-gray-600">Day Streak 🔥</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <Trophy className="size-8 text-yellow-600" />
            </div>
            <p className="text-2xl mb-1">{stats.longestStreak}</p>
            <p className="text-sm text-gray-600">Longest Streak</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <Timer className="size-8 text-purple-600" />
            </div>
            <p className="text-2xl mb-1">{stats.averageSessionLength}m</p>
            <p className="text-sm text-gray-600">Avg Session</p>
          </CardContent>
        </Card>
      </div>

      {/* Study Timer Card */}
      <Card className="mb-6 border-2 border-purple-300 bg-gradient-to-br from-purple-50 to-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Timer className="size-5 text-purple-600" />
            Study Timer
          </CardTitle>
          <CardDescription>Track your study sessions in real-time</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-5xl mb-2 font-mono text-purple-900">{formatTime(timerSeconds)}</div>
              {currentSessionTitle && (
                <p className="text-gray-600">Studying: {currentSessionTitle}</p>
              )}
            </div>
            <div className="flex gap-2">
              {!isTimerRunning && timerSeconds === 0 && (
                <Button 
                  onClick={() => {
                    const title = prompt('What are you studying?');
                    if (title) startTimer(title);
                  }}
                  size="lg"
                  className="bg-green-600 hover:bg-green-700"
                >
                  <PlayCircle className="size-5 mr-2" />
                  Start
                </Button>
              )}
              {isTimerRunning && (
                <Button onClick={pauseTimer} size="lg" variant="outline">
                  <PauseCircle className="size-5 mr-2" />
                  Pause
                </Button>
              )}
              {!isTimerRunning && timerSeconds > 0 && (
                <Button 
                  onClick={() => setIsTimerRunning(true)} 
                  size="lg"
                  className="bg-green-600"
                >
                  <PlayCircle className="size-5 mr-2" />
                  Resume
                </Button>
              )}
              {timerSeconds > 0 && (
                <Button onClick={stopTimer} size="lg" variant="destructive">
                  <StopCircle className="size-5 mr-2" />
                  Stop & Save
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4 mb-6">
          <TabsTrigger value="calendar">
            <CalendarIcon className="size-4 mr-2" />
            Calendar
          </TabsTrigger>
          <TabsTrigger value="tasks">
            <ListTodo className="size-4 mr-2" />
            Tasks
          </TabsTrigger>
          <TabsTrigger value="goals">
            <Target className="size-4 mr-2" />
            Goals
          </TabsTrigger>
          <TabsTrigger value="analytics">
            <BarChart3 className="size-4 mr-2" />
            Analytics
          </TabsTrigger>
        </TabsList>

        {/* Calendar Tab */}
        <TabsContent value="calendar" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Calendar */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle>Study Calendar</CardTitle>
                <CardDescription>Click a date to view sessions</CardDescription>
              </CardHeader>
              <CardContent>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => date && setSelectedDate(date)}
                  className="rounded-md border"
                />
                <Button 
                  onClick={() => {
                    setEditingSession(null);
                    setShowSessionDialog(true);
                  }}
                  className="w-full mt-4 bg-gradient-to-r from-blue-600 to-purple-600"
                >
                  <Plus className="size-4 mr-2" />
                  Schedule Session
                </Button>
              </CardContent>
            </Card>

            {/* Sessions for Selected Date */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>
                  Sessions for {selectedDate.toLocaleDateString('en-US', { 
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </CardTitle>
                <CardDescription>
                  {getSessionsForDate(selectedDate).length} session(s) scheduled
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[500px]">
                  <div className="space-y-4">
                    {getSessionsForDate(selectedDate).map(session => (
                      <Card key={session.id} className={session.completed ? 'bg-green-50 border-green-200' : ''}>
                        <CardContent className="pt-6">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h3 className="text-lg">{session.title}</h3>
                                {session.completed && (
                                  <Badge className="bg-green-600">
                                    <CheckCircle2 className="size-3 mr-1" />
                                    Completed
                                  </Badge>
                                )}
                                <Badge 
                                  variant="outline"
                                  className={PRIORITIES.find(p => p.value === session.priority)?.color + ' text-white'}
                                >
                                  {session.priority}
                                </Badge>
                              </div>
                              <p className="text-sm text-gray-600 mb-2">{session.category}</p>
                              <div className="flex items-center gap-4 text-sm text-gray-600">
                                <span className="flex items-center gap-1">
                                  <Clock className="size-4" />
                                  {session.startTime} - {session.endTime}
                                </span>
                                <span>{session.duration} minutes</span>
                              </div>
                              {session.topics.length > 0 && (
                                <div className="flex flex-wrap gap-2 mt-2">
                                  {session.topics.map((topic, idx) => (
                                    <Badge key={idx} variant="secondary">{topic}</Badge>
                                  ))}
                                </div>
                              )}
                              {session.notes && (
                                <p className="text-sm text-gray-700 mt-2 italic">"{session.notes}"</p>
                              )}
                            </div>
                            <div className="flex gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => toggleSessionCompletion(session.id)}
                              >
                                {session.completed ? <CheckCircle2 className="size-4 text-green-600" /> : <CheckCircle2 className="size-4" />}
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setEditingSession(session);
                                  setShowSessionDialog(true);
                                }}
                              >
                                <Edit className="size-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => deleteSession(session.id)}
                              >
                                <Trash2 className="size-4 text-red-600" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                    
                    {getSessionsForDate(selectedDate).length === 0 && (
                      <div className="text-center py-12">
                        <CalendarIcon className="size-12 text-gray-400 mx-auto mb-3" />
                        <p className="text-gray-600 mb-4">No sessions scheduled for this date</p>
                        <Button onClick={() => setShowSessionDialog(true)}>
                          <Plus className="size-4 mr-2" />
                          Schedule Session
                        </Button>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tasks Tab */}
        <TabsContent value="tasks" className="space-y-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl">My Tasks</h2>
              <p className="text-gray-600">{tasks.filter(t => !t.completed).length} tasks remaining</p>
            </div>
            <Button 
              onClick={() => {
                setEditingTask(null);
                setShowTaskDialog(true);
              }}
              className="bg-gradient-to-r from-blue-600 to-purple-600"
            >
              <Plus className="size-4 mr-2" />
              Add Task
            </Button>
          </div>

          {/* Overdue Tasks Alert */}
          {overdueTasks.length > 0 && (
            <Card className="border-2 border-red-300 bg-red-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-900">
                  <AlertCircle className="size-5" />
                  Overdue Tasks ({overdueTasks.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {overdueTasks.map(task => (
                    <div key={task.id} className="flex items-center justify-between p-3 bg-white rounded-lg">
                      <div className="flex items-center gap-3">
                        <Checkbox
                          checked={task.completed}
                          onCheckedChange={() => toggleTaskCompletion(task.id)}
                        />
                        <div>
                          <p className="text-red-900">{task.title}</p>
                          <p className="text-sm text-red-700">Due: {task.dueDate.toLocaleDateString()}</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => deleteTask(task.id)}>
                        <Trash2 className="size-4 text-red-600" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Task List */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Today's Tasks */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="size-5 text-yellow-600" />
                  Today
                </CardTitle>
                <CardDescription>{todayTasks.length} tasks</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  <div className="space-y-3">
                    {todayTasks.map(task => (
                      <Card key={task.id} className={task.completed ? 'bg-green-50' : 'bg-yellow-50'}>
                        <CardContent className="pt-4">
                          <div className="flex items-start gap-3">
                            <Checkbox
                              checked={task.completed}
                              onCheckedChange={() => toggleTaskCompletion(task.id)}
                              className="mt-1"
                            />
                            <div className="flex-1">
                              <p className={`mb-1 ${task.completed ? 'line-through text-gray-600' : ''}`}>
                                {task.title}
                              </p>
                              <p className="text-xs text-gray-600 mb-2">{task.category}</p>
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="text-xs">
                                  {task.estimatedTime}m
                                </Badge>
                                <Badge 
                                  variant="outline"
                                  className={PRIORITIES.find(p => p.value === task.priority)?.color + ' text-white text-xs'}
                                >
                                  {task.priority}
                                </Badge>
                              </div>
                            </div>
                            <div className="flex gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setEditingTask(task);
                                  setShowTaskDialog(true);
                                }}
                              >
                                <Edit className="size-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => deleteTask(task.id)}
                              >
                                <Trash2 className="size-3 text-red-600" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                    {todayTasks.length === 0 && (
                      <p className="text-sm text-gray-500 text-center py-8">No tasks for today</p>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Upcoming Tasks */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="size-5 text-blue-600" />
                  Upcoming
                </CardTitle>
                <CardDescription>{upcomingTasks.length} tasks</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  <div className="space-y-3">
                    {upcomingTasks.map(task => (
                      <Card key={task.id}>
                        <CardContent className="pt-4">
                          <div className="flex items-start gap-3">
                            <Checkbox
                              checked={task.completed}
                              onCheckedChange={() => toggleTaskCompletion(task.id)}
                              className="mt-1"
                            />
                            <div className="flex-1">
                              <p className="mb-1">{task.title}</p>
                              <p className="text-xs text-gray-600 mb-2">{task.category}</p>
                              <p className="text-xs text-gray-600 mb-2">
                                Due: {task.dueDate.toLocaleDateString()}
                              </p>
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="text-xs">
                                  {task.estimatedTime}m
                                </Badge>
                                <Badge 
                                  variant="outline"
                                  className={PRIORITIES.find(p => p.value === task.priority)?.color + ' text-white text-xs'}
                                >
                                  {task.priority}
                                </Badge>
                              </div>
                            </div>
                            <div className="flex gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setEditingTask(task);
                                  setShowTaskDialog(true);
                                }}
                              >
                                <Edit className="size-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => deleteTask(task.id)}
                              >
                                <Trash2 className="size-3 text-red-600" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Completed Tasks */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle2 className="size-5 text-green-600" />
                  Completed
                </CardTitle>
                <CardDescription>{tasks.filter(t => t.completed).length} tasks</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  <div className="space-y-3">
                    {tasks.filter(t => t.completed).map(task => (
                      <Card key={task.id} className="bg-green-50">
                        <CardContent className="pt-4">
                          <div className="flex items-start gap-3">
                            <CheckCircle2 className="size-5 text-green-600 mt-1" />
                            <div className="flex-1">
                              <p className="line-through text-gray-600 mb-1">{task.title}</p>
                              <p className="text-xs text-gray-600">{task.category}</p>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteTask(task.id)}
                            >
                              <Trash2 className="size-3 text-red-600" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Goals Tab */}
        <TabsContent value="goals" className="space-y-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl">Study Goals</h2>
              <p className="text-gray-600">{goals.length} active goals</p>
            </div>
            <Button 
              onClick={() => {
                setEditingGoal(null);
                setShowGoalDialog(true);
              }}
              className="bg-gradient-to-r from-blue-600 to-purple-600"
            >
              <Plus className="size-4 mr-2" />
              Add Goal
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {goals.map(goal => {
              const progress = (goal.currentProgress / goal.targetProgress) * 100;
              const completedMilestones = goal.milestones.filter(m => m.completed).length;
              const daysUntilTarget = Math.ceil((goal.targetDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));

              return (
                <Card key={goal.id} className="border-2 border-purple-200">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="flex items-center gap-2 mb-2">
                          <Target className="size-5 text-purple-600" />
                          {goal.title}
                        </CardTitle>
                        <CardDescription>{goal.description}</CardDescription>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setEditingGoal(goal);
                            setShowGoalDialog(true);
                          }}
                        >
                          <Edit className="size-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteGoal(goal.id)}
                        >
                          <Trash2 className="size-4 text-red-600" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Progress */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600">Overall Progress</span>
                        <span className="text-lg text-purple-900">{Math.round(progress)}%</span>
                      </div>
                      <Progress value={progress} className="h-3" />
                      <p className="text-sm text-gray-600 mt-1">
                        {goal.currentProgress} / {goal.targetProgress} {goal.category === 'Overall' ? 'categories' : 'units'} complete
                      </p>
                    </div>

                    {/* Target Date */}
                    <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <CalendarIcon className="size-4 text-purple-600" />
                        <span className="text-sm">Target Date</span>
                      </div>
                      <div className="text-right">
                        <p className="text-sm">{goal.targetDate.toLocaleDateString()}</p>
                        <p className="text-xs text-gray-600">
                          {daysUntilTarget > 0 ? `${daysUntilTarget} days left` : 'Overdue'}
                        </p>
                      </div>
                    </div>

                    {/* Milestones */}
                    {goal.milestones.length > 0 && (
                      <div>
                        <p className="text-sm mb-2 flex items-center gap-2">
                          <Star className="size-4 text-yellow-600" />
                          Milestones ({completedMilestones}/{goal.milestones.length})
                        </p>
                        <div className="space-y-2">
                          {goal.milestones.map(milestone => (
                            <div 
                              key={milestone.id}
                              className={`flex items-center gap-3 p-2 rounded ${
                                milestone.completed ? 'bg-green-50' : 'bg-gray-50'
                              }`}
                            >
                              {milestone.completed ? (
                                <CheckCircle2 className="size-4 text-green-600" />
                              ) : (
                                <div className="size-4 rounded-full border-2 border-gray-300" />
                              )}
                              <span className={`text-sm flex-1 ${milestone.completed ? 'line-through text-gray-600' : ''}`}>
                                {milestone.title}
                              </span>
                              <span className="text-xs text-gray-600">
                                {milestone.dueDate.toLocaleDateString()}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <Badge className="w-full justify-center" variant="outline">
                      {goal.category}
                    </Badge>
                  </CardContent>
                </Card>
              );
            })}

            {goals.length === 0 && (
              <Card className="lg:col-span-2">
                <CardContent className="pt-12 pb-12 text-center">
                  <Target className="size-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">No goals set yet</p>
                  <Button onClick={() => setShowGoalDialog(true)}>
                    <Plus className="size-4 mr-2" />
                    Create Your First Goal
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Study Analytics</CardTitle>
              <CardDescription>Insights into your study patterns and progress</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Category Breakdown */}
              <div>
                <h3 className="text-lg mb-4">Study Time by Category</h3>
                <div className="space-y-3">
                  {Object.entries(stats.categoryBreakdown).map(([category, minutes]) => {
                    const percentage = (minutes / stats.totalMinutes) * 100;
                    return (
                      <div key={category}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm">{category}</span>
                          <span className="text-sm text-gray-600">{Math.round(minutes / 60)}h {minutes % 60}m</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Progress value={percentage} className="flex-1" />
                          <span className="text-sm text-gray-600 w-12 text-right">{Math.round(percentage)}%</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Weekly Overview */}
              <div>
                <h3 className="text-lg mb-4">This Week's Overview</h3>
                <div className="grid grid-cols-7 gap-2">
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, idx) => {
                    const studyMinutes = idx < 5 ? Math.floor(Math.random() * 120) + 30 : 0;
                    const height = (studyMinutes / 150) * 100;
                    return (
                      <div key={day} className="text-center">
                        <div className="h-32 flex items-end justify-center mb-2">
                          <div 
                            className="w-full bg-blue-600 rounded-t"
                            style={{ height: `${height}%` }}
                          />
                        </div>
                        <p className="text-xs text-gray-600">{day}</p>
                        <p className="text-xs">{studyMinutes}m</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Achievements */}
              <div>
                <h3 className="text-lg mb-4">Recent Achievements</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200">
                    <CardContent className="pt-6 text-center">
                      <Award className="size-12 text-yellow-600 mx-auto mb-3" />
                      <p className="text-sm mb-1">7-Day Streak</p>
                      <p className="text-xs text-gray-600">Studied every day this week!</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-gradient-to-br from-green-50 to-blue-50 border-green-200">
                    <CardContent className="pt-6 text-center">
                      <Trophy className="size-12 text-green-600 mx-auto mb-3" />
                      <p className="text-sm mb-1">10 Hours Milestone</p>
                      <p className="text-xs text-gray-600">Total study time reached!</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
                    <CardContent className="pt-6 text-center">
                      <Star className="size-12 text-purple-600 mx-auto mb-3" />
                      <p className="text-sm mb-1">Goal Achiever</p>
                      <p className="text-xs text-gray-600">Completed first major goal!</p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Session Dialog */}
      <SessionDialog
        open={showSessionDialog}
        onClose={() => {
          setShowSessionDialog(false);
          setEditingSession(null);
        }}
        onSave={handleAddSession}
        session={editingSession}
        selectedDate={selectedDate}
      />

      {/* Task Dialog */}
      <TaskDialog
        open={showTaskDialog}
        onClose={() => {
          setShowTaskDialog(false);
          setEditingTask(null);
        }}
        onSave={handleAddTask}
        task={editingTask}
      />

      {/* Goal Dialog */}
      <GoalDialog
        open={showGoalDialog}
        onClose={() => {
          setShowGoalDialog(false);
          setEditingGoal(null);
        }}
        onSave={handleAddGoal}
        goal={editingGoal}
      />
    </div>
  );
}

// Session Dialog Component
function SessionDialog({ 
  open, 
  onClose, 
  onSave, 
  session,
  selectedDate 
}: { 
  open: boolean; 
  onClose: () => void; 
  onSave: (data: Partial<StudySession>) => void;
  session: StudySession | null;
  selectedDate: Date;
}) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [date, setDate] = useState<Date>(selectedDate);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('11:00');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [notes, setNotes] = useState('');
  const [topics, setTopics] = useState('');

  useEffect(() => {
    if (session) {
      setTitle(session.title);
      setCategory(session.category);
      setDate(session.date);
      setStartTime(session.startTime);
      setEndTime(session.endTime);
      setPriority(session.priority);
      setNotes(session.notes || '');
      setTopics(session.topics.join(', '));
    } else {
      setTitle('');
      setCategory('');
      setDate(selectedDate);
      setStartTime('09:00');
      setEndTime('11:00');
      setPriority('medium');
      setNotes('');
      setTopics('');
    }
  }, [session, selectedDate, open]);

  const handleSubmit = () => {
    const start = new Date(`2000-01-01 ${startTime}`);
    const end = new Date(`2000-01-01 ${endTime}`);
    const duration = Math.round((end.getTime() - start.getTime()) / 60000);

    onSave({
      title,
      category,
      date,
      startTime,
      endTime,
      duration,
      priority,
      notes,
      topics: topics.split(',').map(t => t.trim()).filter(t => t)
    });

    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{session ? 'Edit Study Session' : 'Schedule Study Session'}</DialogTitle>
          <DialogDescription>Plan your study time effectively</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label>Session Title *</Label>
            <Input 
              placeholder="e.g., Pharmacology Review"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div>
            <Label>Category *</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {NCLEX_CATEGORIES.map(cat => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Start Time *</Label>
              <Input 
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />
            </div>
            <div>
              <Label>End Time *</Label>
              <Input 
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
              />
            </div>
          </div>

          <div>
            <Label>Priority</Label>
            <Select value={priority} onValueChange={(v) => setPriority(v as 'low' | 'medium' | 'high')}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PRIORITIES.map(p => (
                  <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Topics (comma-separated)</Label>
            <Input 
              placeholder="e.g., Cardiovascular drugs, Antibiotics"
              value={topics}
              onChange={(e) => setTopics(e.target.value)}
            />
          </div>

          <div>
            <Label>Notes</Label>
            <Textarea 
              placeholder="Any additional notes..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={!title || !category}>
            {session ? 'Update' : 'Schedule'} Session
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Task Dialog Component
function TaskDialog({ 
  open, 
  onClose, 
  onSave, 
  task 
}: { 
  open: boolean; 
  onClose: () => void; 
  onSave: (data: Partial<Task>) => void;
  task: Task | null;
}) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [dueDate, setDueDate] = useState<Date>(new Date());
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [estimatedTime, setEstimatedTime] = useState('60');

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description);
      setCategory(task.category);
      setDueDate(task.dueDate);
      setPriority(task.priority);
      setEstimatedTime(task.estimatedTime.toString());
    } else {
      setTitle('');
      setDescription('');
      setCategory('');
      setDueDate(new Date());
      setPriority('medium');
      setEstimatedTime('60');
    }
  }, [task, open]);

  const handleSubmit = () => {
    onSave({
      title,
      description,
      category,
      dueDate,
      priority,
      estimatedTime: parseInt(estimatedTime)
    });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{task ? 'Edit Task' : 'Add New Task'}</DialogTitle>
          <DialogDescription>Create a task to track your study activities</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label>Task Title *</Label>
            <Input 
              placeholder="e.g., Complete 50 practice questions"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div>
            <Label>Description</Label>
            <Textarea 
              placeholder="Additional details..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          <div>
            <Label>Category *</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {NCLEX_CATEGORIES.map(cat => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Due Date *</Label>
              <Input 
                type="date"
                value={dueDate.toISOString().split('T')[0]}
                onChange={(e) => setDueDate(new Date(e.target.value))}
              />
            </div>
            <div>
              <Label>Estimated Time (minutes)</Label>
              <Input 
                type="number"
                value={estimatedTime}
                onChange={(e) => setEstimatedTime(e.target.value)}
                min="15"
                step="15"
              />
            </div>
          </div>

          <div>
            <Label>Priority</Label>
            <Select value={priority} onValueChange={(v) => setPriority(v as 'low' | 'medium' | 'high')}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PRIORITIES.map(p => (
                  <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={!title || !category}>
            {task ? 'Update' : 'Create'} Task
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Goal Dialog Component
function GoalDialog({ 
  open, 
  onClose, 
  onSave, 
  goal 
}: { 
  open: boolean; 
  onClose: () => void; 
  onSave: (data: Partial<Goal>) => void;
  goal: Goal | null;
}) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [targetDate, setTargetDate] = useState<Date>(new Date(Date.now() + 30 * 86400000));
  const [targetProgress, setTargetProgress] = useState('100');

  useEffect(() => {
    if (goal) {
      setTitle(goal.title);
      setDescription(goal.description);
      setCategory(goal.category);
      setTargetDate(goal.targetDate);
      setTargetProgress(goal.targetProgress.toString());
    } else {
      setTitle('');
      setDescription('');
      setCategory('');
      setTargetDate(new Date(Date.now() + 30 * 86400000));
      setTargetProgress('100');
    }
  }, [goal, open]);

  const handleSubmit = () => {
    onSave({
      title,
      description,
      category,
      targetDate,
      targetProgress: parseInt(targetProgress)
    });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{goal ? 'Edit Goal' : 'Create New Goal'}</DialogTitle>
          <DialogDescription>Set a goal to track your NCLEX preparation progress</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label>Goal Title *</Label>
            <Input 
              placeholder="e.g., Master Pharmacology"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div>
            <Label>Description</Label>
            <Textarea 
              placeholder="What do you want to achieve?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          <div>
            <Label>Category *</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Overall">Overall</SelectItem>
                {NCLEX_CATEGORIES.map(cat => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Target Date *</Label>
              <Input 
                type="date"
                value={targetDate.toISOString().split('T')[0]}
                onChange={(e) => setTargetDate(new Date(e.target.value))}
              />
            </div>
            <div>
              <Label>Target (units/percentage)</Label>
              <Input 
                type="number"
                value={targetProgress}
                onChange={(e) => setTargetProgress(e.target.value)}
                min="1"
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={!title || !category}>
            {goal ? 'Update' : 'Create'} Goal
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
