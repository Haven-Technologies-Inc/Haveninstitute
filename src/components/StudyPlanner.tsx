import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { ArrowLeft, Calendar as CalendarIcon, Target, CheckCircle2, Plus, Trash2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';

interface StudyPlannerProps {
  onBack: () => void;
}

interface StudyGoal {
  id: number;
  title: string;
  category: string;
  targetDate: string;
  completed: boolean;
  progress: number;
}

interface ScheduledTask {
  id: number;
  title: string;
  date: string;
  time: string;
  duration: number;
  type: 'quiz' | 'flashcards' | 'cat-test' | 'study-session' | 'review';
  completed: boolean;
}

const mockGoals: StudyGoal[] = [
  {
    id: 1,
    title: "Master Pharmacology (score 85%+)",
    category: "Pharmacology",
    targetDate: "Nov 30, 2025",
    completed: false,
    progress: 65
  },
  {
    id: 2,
    title: "Complete 500 practice questions",
    category: "Overall",
    targetDate: "Nov 25, 2025",
    completed: false,
    progress: 42
  },
  {
    id: 3,
    title: "Take 3 full CAT tests",
    category: "Assessment",
    targetDate: "Nov 28, 2025",
    completed: false,
    progress: 33
  },
  {
    id: 4,
    title: "Review all Med-Surg flashcards",
    category: "Medical-Surgical",
    targetDate: "Nov 22, 2025",
    completed: true,
    progress: 100
  }
];

const mockSchedule: ScheduledTask[] = [
  {
    id: 1,
    title: "Pharmacology Quiz - Cardiovascular",
    date: "2025-11-18",
    time: "09:00",
    duration: 45,
    type: "quiz",
    completed: false
  },
  {
    id: 2,
    title: "Review Fundamentals Flashcards",
    date: "2025-11-18",
    time: "14:00",
    duration: 30,
    type: "flashcards",
    completed: false
  },
  {
    id: 3,
    title: "Group Study Session",
    date: "2025-11-18",
    time: "18:00",
    duration: 90,
    type: "study-session",
    completed: false
  },
  {
    id: 4,
    title: "Full CAT Test",
    date: "2025-11-19",
    time: "10:00",
    duration: 120,
    type: "cat-test",
    completed: false
  },
  {
    id: 5,
    title: "Pediatrics Practice Questions",
    date: "2025-11-19",
    time: "15:00",
    duration: 60,
    type: "quiz",
    completed: false
  },
  {
    id: 6,
    title: "Review Incorrect Answers",
    date: "2025-11-20",
    time: "09:00",
    duration: 45,
    type: "review",
    completed: false
  }
];

const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export function StudyPlanner({ onBack }: StudyPlannerProps) {
  const [showNewGoal, setShowNewGoal] = useState(false);
  const [showNewTask, setShowNewTask] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());

  const today = new Date();
  const currentMonth = selectedDate.getMonth();
  const currentYear = selectedDate.getFullYear();

  // Generate calendar days
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const calendarDays = [];
  
  // Add empty cells for days before month starts
  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarDays.push(null);
  }
  
  // Add days of month
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day);
  }

  const getTasksForDate = (day: number | null) => {
    if (!day) return [];
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return mockSchedule.filter(task => task.date === dateStr);
  };

  const isToday = (day: number | null) => {
    if (!day) return false;
    return day === today.getDate() && 
           currentMonth === today.getMonth() && 
           currentYear === today.getFullYear();
  };

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Button variant="ghost" onClick={onBack} className="mb-4">
            <ArrowLeft className="size-4 mr-2" />
            Back to Dashboard
          </Button>
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <CalendarIcon className="size-6" />
                <h2>Study Planner</h2>
              </div>
              <p className="text-gray-600">Organize your study schedule and achieve your goals with NurseHaven</p>
            </div>
          </div>
        </div>

        {/* Study Streak */}
        <Card className="mb-6 border-orange-200 bg-gradient-to-r from-orange-50 to-yellow-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="mb-1">3 Day Study Streak! 🔥</h3>
                <p className="text-gray-600">Keep it up! Consistent daily study is key to success</p>
              </div>
              <div className="text-center">
                <div className="text-4xl mb-1">🔥</div>
                <Badge className="bg-orange-100 text-orange-800">3 Days</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="calendar" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="calendar">Calendar</TabsTrigger>
            <TabsTrigger value="goals">Goals</TabsTrigger>
            <TabsTrigger value="schedule">Schedule</TabsTrigger>
          </TabsList>

          {/* Calendar Tab */}
          <TabsContent value="calendar" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>
                    {months[currentMonth]} {currentYear}
                  </CardTitle>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      onClick={() => setSelectedDate(new Date(currentYear, currentMonth - 1, 1))}
                    >
                      Previous
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => setSelectedDate(new Date())}
                    >
                      Today
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => setSelectedDate(new Date(currentYear, currentMonth + 1, 1))}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-2">
                  {/* Day headers */}
                  {daysOfWeek.map(day => (
                    <div key={day} className="text-center text-gray-600 py-2">
                      {day}
                    </div>
                  ))}
                  
                  {/* Calendar days */}
                  {calendarDays.map((day, index) => {
                    const tasks = getTasksForDate(day);
                    const isTodayDate = isToday(day);
                    
                    return (
                      <div
                        key={index}
                        className={`min-h-24 p-2 border rounded-lg ${
                          day === null ? 'bg-gray-50' : 
                          isTodayDate ? 'border-blue-500 bg-blue-50' : 
                          'hover:bg-gray-50 cursor-pointer'
                        }`}
                      >
                        {day !== null && (
                          <>
                            <div className={`text-right mb-1 ${isTodayDate ? 'font-bold text-blue-600' : ''}`}>
                              {day}
                            </div>
                            <div className="space-y-1">
                              {tasks.slice(0, 2).map(task => (
                                <div
                                  key={task.id}
                                  className={`text-xs p-1 rounded truncate ${
                                    task.type === 'cat-test' ? 'bg-purple-100 text-purple-800' :
                                    task.type === 'quiz' ? 'bg-blue-100 text-blue-800' :
                                    task.type === 'study-session' ? 'bg-green-100 text-green-800' :
                                    task.type === 'flashcards' ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-gray-100 text-gray-800'
                                  }`}
                                >
                                  {task.title}
                                </div>
                              ))}
                              {tasks.length > 2 && (
                                <div className="text-xs text-gray-500">
                                  +{tasks.length - 2} more
                                </div>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="mt-6 pt-6 border-t">
                  <Button onClick={() => setShowNewTask(!showNewTask)}>
                    <Plus className="size-4 mr-2" />
                    Add Study Task
                  </Button>
                </div>

                {showNewTask && (
                  <div className="mt-6 p-4 border rounded-lg bg-gray-50">
                    <h4 className="mb-4">Schedule Study Task</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-gray-700 mb-2 block">Task Title</label>
                        <Input placeholder="e.g., Pharmacology Quiz" />
                      </div>
                      <div>
                        <label className="text-gray-700 mb-2 block">Type</label>
                        <select className="w-full p-2 border border-gray-300 rounded-md">
                          <option>Quiz</option>
                          <option>Flashcards</option>
                          <option>CAT Test</option>
                          <option>Study Session</option>
                          <option>Review</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-gray-700 mb-2 block">Date</label>
                        <Input type="date" />
                      </div>
                      <div>
                        <label className="text-gray-700 mb-2 block">Time</label>
                        <Input type="time" />
                      </div>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Button>Add Task</Button>
                      <Button variant="outline" onClick={() => setShowNewTask(false)}>Cancel</Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Goals Tab */}
          <TabsContent value="goals" className="space-y-6">
            <div className="flex justify-between items-center mb-4">
              <h3>Study Goals</h3>
              <Button onClick={() => setShowNewGoal(!showNewGoal)}>
                <Plus className="size-4 mr-2" />
                New Goal
              </Button>
            </div>

            {showNewGoal && (
              <Card>
                <CardHeader>
                  <CardTitle>Create Study Goal</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <label className="text-gray-700 mb-2 block">Goal Title</label>
                      <Input placeholder="e.g., Master Pharmacology" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-gray-700 mb-2 block">Category</label>
                        <select className="w-full p-2 border border-gray-300 rounded-md">
                          <option>Overall</option>
                          <option>Fundamentals</option>
                          <option>Pharmacology</option>
                          <option>Medical-Surgical</option>
                          <option>Pediatrics</option>
                          <option>Mental Health</option>
                          <option>Maternal-Newborn</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-gray-700 mb-2 block">Target Date</label>
                        <Input type="date" />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button>Create Goal</Button>
                      <Button variant="outline" onClick={() => setShowNewGoal(false)}>Cancel</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="space-y-4">
              {mockGoals.map(goal => (
                <Card key={goal.id} className={goal.completed ? 'border-green-200 bg-green-50' : ''}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4>{goal.title}</h4>
                          {goal.completed && <CheckCircle2 className="size-5 text-green-600" />}
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">{goal.category}</Badge>
                          <span className="text-gray-600">Due: {goal.targetDate}</span>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        <Trash2 className="size-4 text-red-500" />
                      </Button>
                    </div>
                    
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-gray-600">Progress</span>
                        <span className={goal.progress === 100 ? 'text-green-600' : ''}>{goal.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className={`h-3 rounded-full ${goal.progress === 100 ? 'bg-green-500' : 'bg-blue-500'}`}
                          style={{ width: `${goal.progress}%` }}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Schedule Tab */}
          <TabsContent value="schedule" className="space-y-6">
            <h3>Upcoming Study Tasks</h3>
            
            <div className="space-y-4">
              {mockSchedule.map(task => (
                <Card key={task.id} className={task.completed ? 'opacity-60' : ''}>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-4">
                      <input
                        type="checkbox"
                        checked={task.completed}
                        className="size-5 rounded"
                        readOnly
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className={task.completed ? 'line-through' : ''}>{task.title}</h4>
                          <Badge
                            variant={
                              task.type === 'cat-test' ? 'default' :
                              task.type === 'quiz' ? 'secondary' :
                              'outline'
                            }
                          >
                            {task.type.replace('-', ' ')}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-gray-600">
                          <span>{task.date}</span>
                          <span>{task.time}</span>
                          <span>{task.duration} min</span>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        <Trash2 className="size-4 text-red-500" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}