import { useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { 
  GraduationCap, 
  Target, 
  BookOpen, 
  Brain, 
  Calendar,
  TrendingUp,
  Users,
  Award,
  CheckCircle2,
  ArrowRight,
  ArrowLeft
} from 'lucide-react';
import { useAuth } from './AuthContext';

export function Onboarding() {
  const { user, updateUser } = useAuth();
  const [step, setStep] = useState(1);
  const [userType, setUserType] = useState<'nursing-student' | 'nclex-prep' | 'both' | null>(null);
  const [goals, setGoals] = useState<string[]>([]);
  const [studyLevel, setStudyLevel] = useState<'beginner' | 'intermediate' | 'advanced' | null>(null);
  const [targetDate, setTargetDate] = useState('');
  const [weeklyHours, setWeeklyHours] = useState<number | null>(null);

  const totalSteps = 4;

  const goalOptions = [
    { id: 'pass-nclex', label: 'Pass NCLEX on first attempt', icon: Award },
    { id: 'improve-scores', label: 'Improve practice test scores', icon: TrendingUp },
    { id: 'learn-fundamentals', label: 'Master nursing fundamentals', icon: BookOpen },
    { id: 'weak-areas', label: 'Strengthen weak areas', icon: Brain },
    { id: 'build-confidence', label: 'Build test-taking confidence', icon: Target },
    { id: 'group-study', label: 'Join study groups', icon: Users }
  ];

  const toggleGoal = (goalId: string) => {
    if (goals.includes(goalId)) {
      setGoals(goals.filter(g => g !== goalId));
    } else {
      setGoals([...goals, goalId]);
    }
  };

  const handleComplete = () => {
    updateUser({
      userType: userType!,
      goals,
      studyLevel: studyLevel!,
      targetExamDate: targetDate,
      hasCompletedOnboarding: true
    });
  };

  const canProceed = () => {
    switch (step) {
      case 1: return userType !== null;
      case 2: return goals.length > 0;
      case 3: return studyLevel !== null;
      case 4: return true;
      default: return false;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-3xl">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-gray-900">Welcome, {user?.fullName}! 👋</h2>
            <span className="text-gray-600">Step {step} of {totalSteps}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(step / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        {/* Step 1: User Type */}
        {step === 1 && (
          <Card className="shadow-xl border-2">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <GraduationCap className="size-6 text-blue-600" />
                </div>
                <CardTitle>Tell us about yourself</CardTitle>
              </div>
              <CardDescription>
                This helps us personalize your learning experience with AI-tailored content
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div 
                className={`p-6 border-2 rounded-lg cursor-pointer transition-all ${
                  userType === 'nursing-student' ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setUserType('nursing-student')}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="mb-2 flex items-center gap-2">
                      <BookOpen className="size-5 text-blue-600" />
                      Nursing Student
                    </h3>
                    <p className="text-gray-600">
                      I'm currently in nursing school and want to reinforce my learning with practice questions aligned to my courses
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Badge variant="secondary">Course Support</Badge>
                      <Badge variant="secondary">Fundamentals</Badge>
                      <Badge variant="secondary">Med-Surg Practice</Badge>
                    </div>
                  </div>
                  {userType === 'nursing-student' && (
                    <CheckCircle2 className="size-6 text-blue-600 flex-shrink-0" />
                  )}
                </div>
              </div>

              <div 
                className={`p-6 border-2 rounded-lg cursor-pointer transition-all ${
                  userType === 'nclex-prep' ? 'border-purple-600 bg-purple-50' : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setUserType('nclex-prep')}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="mb-2 flex items-center gap-2">
                      <Award className="size-5 text-purple-600" />
                      NCLEX Preparation
                    </h3>
                    <p className="text-gray-600">
                      I'm preparing to take the NCLEX exam and need focused study materials and CAT testing practice
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Badge variant="secondary">CAT Testing</Badge>
                      <Badge variant="secondary">Test Strategies</Badge>
                      <Badge variant="secondary">Passing Prediction</Badge>
                    </div>
                  </div>
                  {userType === 'nclex-prep' && (
                    <CheckCircle2 className="size-6 text-purple-600 flex-shrink-0" />
                  )}
                </div>
              </div>

              <div 
                className={`p-6 border-2 rounded-lg cursor-pointer transition-all ${
                  userType === 'both' ? 'border-green-600 bg-green-50' : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setUserType('both')}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="mb-2 flex items-center gap-2">
                      <TrendingUp className="size-5 text-green-600" />
                      Both
                    </h3>
                    <p className="text-gray-600">
                      I want to reinforce my nursing school learning while also preparing for the NCLEX exam
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Badge variant="secondary">Complete Package</Badge>
                      <Badge variant="secondary">Comprehensive</Badge>
                      <Badge variant="secondary">Best Value</Badge>
                    </div>
                  </div>
                  {userType === 'both' && (
                    <CheckCircle2 className="size-6 text-green-600 flex-shrink-0" />
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Goals */}
        {step === 2 && (
          <Card className="shadow-xl border-2">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-purple-100 p-2 rounded-lg">
                  <Target className="size-6 text-purple-600" />
                </div>
                <CardTitle>What are your main goals?</CardTitle>
              </div>
              <CardDescription>
                Select all that apply - we'll customize your experience accordingly
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {goalOptions.map((goal) => {
                  const Icon = goal.icon;
                  const isSelected = goals.includes(goal.id);
                  return (
                    <div
                      key={goal.id}
                      className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        isSelected ? 'border-purple-600 bg-purple-50' : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => toggleGoal(goal.id)}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className={`size-5 ${isSelected ? 'text-purple-600' : 'text-gray-600'}`} />
                        <span className={isSelected ? 'text-purple-900' : 'text-gray-900'}>
                          {goal.label}
                        </span>
                        {isSelected && (
                          <CheckCircle2 className="size-5 text-purple-600 ml-auto" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
              {goals.length > 0 && (
                <p className="text-gray-600 mt-4">
                  Great! You've selected {goals.length} goal{goals.length > 1 ? 's' : ''}.
                </p>
              )}
            </CardContent>
          </Card>
        )}

        {/* Step 3: Study Level & Schedule */}
        {step === 3 && (
          <Card className="shadow-xl border-2">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-green-100 p-2 rounded-lg">
                  <Brain className="size-6 text-green-600" />
                </div>
                <CardTitle>Your study preferences</CardTitle>
              </div>
              <CardDescription>
                Help us create your personalized study plan
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Study Level */}
              <div>
                <label className="text-gray-900 mb-3 block">How would you rate your current knowledge?</label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { value: 'beginner', label: 'Beginner', desc: 'Just starting out', color: 'blue' },
                    { value: 'intermediate', label: 'Intermediate', desc: 'Comfortable with basics', color: 'purple' },
                    { value: 'advanced', label: 'Advanced', desc: 'Ready for exam', color: 'green' }
                  ].map((level) => (
                    <div
                      key={level.value}
                      className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        studyLevel === level.value ? `border-${level.color}-600 bg-${level.color}-50` : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setStudyLevel(level.value as any)}
                    >
                      <div className="text-center">
                        <h4 className="mb-1">{level.label}</h4>
                        <p className="text-gray-600">{level.desc}</p>
                        {studyLevel === level.value && (
                          <CheckCircle2 className={`size-5 text-${level.color}-600 mx-auto mt-2`} />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Weekly Study Hours */}
              <div>
                <label className="text-gray-900 mb-3 block">How many hours per week can you study?</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[5, 10, 15, 20].map((hours) => (
                    <button
                      key={hours}
                      className={`p-3 border-2 rounded-lg transition-all ${
                        weeklyHours === hours ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setWeeklyHours(hours)}
                    >
                      <p className="text-2xl mb-1">{hours}</p>
                      <p className="text-gray-600">hours/week</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Target Exam Date (for NCLEX prep) */}
              {(userType === 'nclex-prep' || userType === 'both') && (
                <div>
                  <label className="text-gray-900 mb-3 block flex items-center gap-2">
                    <Calendar className="size-4" />
                    Target NCLEX Exam Date (Optional)
                  </label>
                  <Input
                    type="date"
                    value={targetDate}
                    onChange={(e) => setTargetDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                  />
                  <p className="text-gray-600 mt-2">We'll help you create a study timeline</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Step 4: AI Recommendations */}
        {step === 4 && (
          <Card className="shadow-xl border-2">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-gradient-to-br from-blue-600 to-purple-600 p-2 rounded-lg">
                  <Brain className="size-6 text-white" />
                </div>
                <CardTitle>Your AI-Tailored Study Plan</CardTitle>
              </div>
              <CardDescription>
                Based on your profile, here's what we recommend
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Personalized Recommendations */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 rounded-lg p-6">
                <h3 className="mb-4 flex items-center gap-2">
                  <Target className="size-5 text-purple-600" />
                  Your Personalized Path
                </h3>
                <div className="space-y-3">
                  {userType === 'nursing-student' && (
                    <>
                      <div className="flex items-start gap-3">
                        <CheckCircle2 className="size-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <p className="text-gray-700">Start with <strong>Fundamentals</strong> and <strong>Basic Care & Comfort</strong> to build your foundation</p>
                      </div>
                      <div className="flex items-start gap-3">
                        <CheckCircle2 className="size-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <p className="text-gray-700">Practice <strong>20-30 questions daily</strong> aligned with your coursework</p>
                      </div>
                      <div className="flex items-start gap-3">
                        <CheckCircle2 className="size-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <p className="text-gray-700">Use flashcards for <strong>Pharmacology</strong> and <strong>Lab Values</strong> memorization</p>
                      </div>
                    </>
                  )}
                  
                  {userType === 'nclex-prep' && (
                    <>
                      <div className="flex items-start gap-3">
                        <CheckCircle2 className="size-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <p className="text-gray-700">Take a <strong>baseline CAT test</strong> to assess your current level</p>
                      </div>
                      <div className="flex items-start gap-3">
                        <CheckCircle2 className="size-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <p className="text-gray-700">Focus on <strong>high-yield categories</strong>: Pharmacology (12-18%) and Management of Care (17-23%)</p>
                      </div>
                      <div className="flex items-start gap-3">
                        <CheckCircle2 className="size-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <p className="text-gray-700">Take weekly CAT tests to track your <strong>passing probability</strong></p>
                      </div>
                      {targetDate && (
                        <div className="flex items-start gap-3">
                          <CheckCircle2 className="size-5 text-green-600 flex-shrink-0 mt-0.5" />
                          <p className="text-gray-700">
                            Study timeline: <strong>{Math.ceil((new Date(targetDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24 * 7))} weeks</strong> until exam
                          </p>
                        </div>
                      )}
                    </>
                  )}

                  {userType === 'both' && (
                    <>
                      <div className="flex items-start gap-3">
                        <CheckCircle2 className="size-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <p className="text-gray-700">Balance <strong>coursework reinforcement</strong> with <strong>NCLEX-style questions</strong></p>
                      </div>
                      <div className="flex items-start gap-3">
                        <CheckCircle2 className="size-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <p className="text-gray-700">Take monthly CAT tests to <strong>track readiness</strong> while in school</p>
                      </div>
                      <div className="flex items-start gap-3">
                        <CheckCircle2 className="size-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <p className="text-gray-700">Use <strong>spaced repetition</strong> with flashcards for long-term retention</p>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Recommended Weekly Schedule */}
              <div className="border-2 border-gray-200 rounded-lg p-6">
                <h3 className="mb-4 flex items-center gap-2">
                  <Calendar className="size-5 text-blue-600" />
                  Suggested Weekly Schedule
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between p-3 bg-gray-50 rounded">
                    <span>📚 Practice Questions</span>
                    <span className="text-gray-600">{weeklyHours ? Math.round(weeklyHours * 0.5) : 5} hours</span>
                  </div>
                  <div className="flex justify-between p-3 bg-gray-50 rounded">
                    <span>🎯 Flashcard Review</span>
                    <span className="text-gray-600">{weeklyHours ? Math.round(weeklyHours * 0.2) : 2} hours</span>
                  </div>
                  <div className="flex justify-between p-3 bg-gray-50 rounded">
                    <span>🧠 CAT Testing</span>
                    <span className="text-gray-600">{weeklyHours ? Math.round(weeklyHours * 0.2) : 2} hours</span>
                  </div>
                  <div className="flex justify-between p-3 bg-gray-50 rounded">
                    <span>📊 Review Analytics</span>
                    <span className="text-gray-600">{weeklyHours ? Math.round(weeklyHours * 0.1) : 1} hour</span>
                  </div>
                </div>
              </div>

              {/* Next Steps */}
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <p className="text-purple-900">
                  🎉 You're all set! Click below to start your NurseHaven journey with content tailored specifically for you.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between mt-6">
          <Button
            variant="outline"
            onClick={() => setStep(step - 1)}
            disabled={step === 1}
          >
            <ArrowLeft className="size-4 mr-2" />
            Back
          </Button>
          
          {step < totalSteps ? (
            <Button
              onClick={() => setStep(step + 1)}
              disabled={!canProceed()}
            >
              Continue
              <ArrowRight className="size-4 ml-2" />
            </Button>
          ) : (
            <Button onClick={handleComplete}>
              Start Learning
              <GraduationCap className="size-4 ml-2" />
            </Button>
          )}
        </div>

        {/* Skip Option */}
        {step < totalSteps && (
          <div className="text-center mt-4">
            <button
              className="text-gray-600 hover:text-gray-900 underline"
              onClick={() => {
                updateUser({ hasCompletedOnboarding: true });
              }}
            >
              Skip setup (not recommended)
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
