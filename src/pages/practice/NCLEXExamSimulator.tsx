/**
 * NCLEX Exam Simulator
 * 
 * Authentic NCLEX-RN exam experience with:
 * - Clean, distraction-free testing interface
 * - No rationale shown during exam (exam mode)
 * - 85-150 questions with 5-hour time limit
 * - Real CAT algorithm with IRT-based question selection
 * - Confidence interval stopping rules
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Clock,
  Flag,
  ChevronRight,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Pause,
  Play,
  Calculator,
  FileText,
  HelpCircle,
  LogOut
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../../components/ui/dialog';
import { Progress } from '../../components/ui/progress';
import { QuestionRenderer } from '../../components/practice/QuestionRenderer';
import { HavenCATEngine, type CATSessionState, type CATQuestion, type CATResult } from '../../services/catEngine';
import { nextGenQuestionBank } from '../../data/nextGenQuestionBank';
import { calculateScore, type QuestionAnswer, NCLEX_CATEGORIES } from '../../types/nextGenNCLEX';

// Exam configuration
const EXAM_CONFIG = {
  minQuestions: 85,
  maxQuestions: 150,
  timeLimit: 300, // 5 hours in minutes
  passingStandard: 0.0 // logits
};

export default function NCLEXExamSimulator() {
  const navigate = useNavigate();
  const catEngineRef = useRef<HavenCATEngine | null>(null);
  
  // Exam state
  const [examStarted, setExamStarted] = useState(false);
  const [examComplete, setExamComplete] = useState(false);
  const [session, setSession] = useState<CATSessionState | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<CATQuestion | null>(null);
  const [currentAnswer, setCurrentAnswer] = useState<QuestionAnswer | null>(null);
  const [questionStartTime, setQuestionStartTime] = useState<number>(Date.now());
  const [results, setResults] = useState<CATResult | null>(null);
  
  // Timer state
  const [timeRemaining, setTimeRemaining] = useState(EXAM_CONFIG.timeLimit * 60 * 1000);
  const [isPaused, setIsPaused] = useState(false);
  
  // UI state
  const [showExitDialog, setShowExitDialog] = useState(false);
  const [showBreakDialog, setShowBreakDialog] = useState(false);
  const [flaggedQuestions, setFlaggedQuestions] = useState<Set<number>>(new Set());
  const [showCalculator, setShowCalculator] = useState(false);
  
  // Initialize CAT engine
  useEffect(() => {
    catEngineRef.current = new HavenCATEngine(nextGenQuestionBank);
  }, []);
  
  // Timer effect
  useEffect(() => {
    if (!examStarted || examComplete || isPaused) return;
    
    const timer = setInterval(() => {
      if (catEngineRef.current) {
        const remaining = catEngineRef.current.getRemainingTime();
        setTimeRemaining(remaining);
        
        if (remaining <= 0) {
          handleTimeUp();
        }
      }
    }, 1000);
    
    return () => clearInterval(timer);
  }, [examStarted, examComplete, isPaused]);
  
  // Format time as HH:MM:SS
  const formatTime = (ms: number): string => {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };
  
  // Start exam
  const startExam = () => {
    if (!catEngineRef.current) return;
    
    const newSession = catEngineRef.current.startSession(EXAM_CONFIG);
    setSession(newSession);
    setExamStarted(true);
    
    // Get first question
    const firstQuestion = catEngineRef.current.getNextQuestion();
    if (firstQuestion) {
      setCurrentQuestion(firstQuestion);
      setQuestionStartTime(Date.now());
    }
  };
  
  // Handle answer submission
  const handleSubmitAnswer = useCallback(() => {
    if (!catEngineRef.current || !currentQuestion || !session) return;
    
    const timeSpent = Date.now() - questionStartTime;
    
    // Calculate score (0 or 1 for most questions)
    const score = currentAnswer ? calculateScore(currentQuestion, currentAnswer) : 0;
    
    // Process response in CAT engine
    const updatedSession = catEngineRef.current.processResponse(
      currentQuestion.id,
      score,
      timeSpent
    );
    
    if (updatedSession) {
      setSession(updatedSession);
    }
    
    // Get next question
    const nextQ = catEngineRef.current.getNextQuestion();
    
    if (nextQ) {
      setCurrentQuestion(nextQ);
      setCurrentAnswer(null);
      setQuestionStartTime(Date.now());
    } else {
      // Exam complete
      handleExamComplete();
    }
  }, [currentQuestion, currentAnswer, session, questionStartTime]);
  
  // Handle exam completion
  const handleExamComplete = () => {
    if (!catEngineRef.current) return;
    
    const examResults = catEngineRef.current.getResults();
    setResults(examResults);
    setExamComplete(true);
  };
  
  // Handle time up
  const handleTimeUp = () => {
    handleExamComplete();
  };
  
  // Handle exit exam
  const handleExitExam = () => {
    navigate('/app/practice/unified');
  };
  
  // Toggle flag for current question
  const toggleFlag = () => {
    if (!session) return;
    
    const newFlagged = new Set(flaggedQuestions);
    if (newFlagged.has(session.totalQuestions)) {
      newFlagged.delete(session.totalQuestions);
    } else {
      newFlagged.add(session.totalQuestions);
    }
    setFlaggedQuestions(newFlagged);
  };
  
  // Pre-exam instructions screen
  if (!examStarted) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center p-4">
        <Card className="max-w-2xl w-full">
          <CardContent className="pt-8 pb-8">
            <div className="text-center mb-8">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
                <FileText className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Haven NCLEX-RN Simulator
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Computer Adaptive Test (CAT) Examination
              </p>
            </div>
            
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 mb-6">
              <h2 className="font-semibold text-blue-900 dark:text-blue-100 mb-4">
                Examination Information
              </h2>
              <ul className="space-y-3 text-sm text-blue-800 dark:text-blue-200">
                <li className="flex items-start gap-2">
                  <Clock className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span><strong>Time Limit:</strong> 5 hours (300 minutes)</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span><strong>Questions:</strong> 85-150 (varies based on performance)</span>
                </li>
                <li className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span><strong>Format:</strong> NextGen NCLEX question types including Multiple Choice, SATA, Ordered Response, Matrix, Highlight, Bow-Tie, and more</span>
                </li>
              </ul>
            </div>
            
            <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-xl p-6 mb-6">
              <h2 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-4 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Important Instructions
              </h2>
              <ul className="space-y-2 text-sm text-yellow-800 dark:text-yellow-200">
                <li>• This is a simulated NCLEX-RN examination</li>
                <li>• You cannot go back to previous questions</li>
                <li>• No explanations will be shown during the exam</li>
                <li>• The exam uses Computer Adaptive Testing (CAT)</li>
                <li>• Your ability level is continuously estimated</li>
                <li>• The exam stops when a pass/fail decision can be made with 95% confidence</li>
              </ul>
            </div>
            
            <div className="flex gap-4">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => navigate('/app/practice/unified')}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600"
                onClick={startExam}
              >
                Begin Examination
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  // Results screen
  if (examComplete && results) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center p-4">
        <Card className="max-w-3xl w-full">
          <CardContent className="pt-8 pb-8">
            {/* Result Header */}
            <div className="text-center mb-8">
              <div className={`w-24 h-24 mx-auto mb-4 rounded-full flex items-center justify-center ${
                results.passed 
                  ? 'bg-gradient-to-br from-green-500 to-emerald-600' 
                  : 'bg-gradient-to-br from-red-500 to-rose-600'
              }`}>
                {results.passed ? (
                  <CheckCircle className="w-12 h-12 text-white" />
                ) : (
                  <XCircle className="w-12 h-12 text-white" />
                )}
              </div>
              <h1 className={`text-4xl font-bold mb-2 ${
                results.passed ? 'text-green-600' : 'text-red-600'
              }`}>
                {results.passed ? 'PASS' : 'BELOW PASSING STANDARD'}
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Examination Complete
              </p>
            </div>
            
            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                <p className="text-3xl font-bold text-blue-600">{results.questionsAnswered}</p>
                <p className="text-sm text-gray-500">Questions</p>
              </div>
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                <p className="text-3xl font-bold text-purple-600">
                  {formatTime(results.timeSpent)}
                </p>
                <p className="text-sm text-gray-500">Time Used</p>
              </div>
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                <p className="text-3xl font-bold text-green-600">{results.passingProbability}%</p>
                <p className="text-sm text-gray-500">Pass Probability</p>
              </div>
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                <p className="text-3xl font-bold text-orange-600">
                  {results.abilityEstimate.toFixed(2)}
                </p>
                <p className="text-sm text-gray-500">Ability (logits)</p>
              </div>
            </div>
            
            {/* Stopping Reason */}
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 mb-6">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                <strong>Test Stopped:</strong>{' '}
                {results.stoppingReason === 'confidence_interval' && 
                  'The 95% confidence interval was entirely above or below the passing standard.'}
                {results.stoppingReason === 'max_questions' && 
                  'Maximum number of questions (150) reached.'}
                {results.stoppingReason === 'time_limit' && 
                  'Time limit (5 hours) reached.'}
              </p>
            </div>
            
            {/* Confidence Interval */}
            <div className="mb-6">
              <h3 className="font-semibold mb-3">Ability Estimate with 95% Confidence Interval</h3>
              <div className="relative h-8 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                {/* Passing threshold line */}
                <div 
                  className="absolute top-0 bottom-0 w-0.5 bg-yellow-500 z-10"
                  style={{ left: '50%' }}
                />
                {/* Confidence interval */}
                <div 
                  className={`absolute top-1 bottom-1 rounded-full ${
                    results.passed ? 'bg-green-500' : 'bg-red-500'
                  }`}
                  style={{
                    left: `${Math.max(0, ((results.confidenceInterval[0] + 3) / 6) * 100)}%`,
                    right: `${Math.max(0, 100 - ((results.confidenceInterval[1] + 3) / 6) * 100)}%`
                  }}
                />
                {/* Ability estimate point */}
                <div 
                  className="absolute top-0 bottom-0 w-2 bg-blue-600 rounded-full"
                  style={{ left: `calc(${((results.abilityEstimate + 3) / 6) * 100}% - 4px)` }}
                />
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>-3.0</span>
                <span>Passing (0.0)</span>
                <span>+3.0</span>
              </div>
            </div>
            
            {/* Category Performance */}
            <div className="mb-8">
              <h3 className="font-semibold mb-3">Performance by Category</h3>
              <div className="space-y-2">
                {NCLEX_CATEGORIES.map(cat => {
                  const perf = results.categoryPerformance[cat.id];
                  if (!perf || perf.total === 0) return null;
                  
                  return (
                    <div key={cat.id} className="flex items-center gap-3">
                      <div className="w-40 text-sm truncate">{cat.name}</div>
                      <div className="flex-1 h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${
                            perf.percentage >= 70 ? 'bg-green-500' :
                            perf.percentage >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${perf.percentage}%` }}
                        />
                      </div>
                      <div className="w-16 text-sm text-right">
                        {perf.correct}/{perf.total}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            
            {/* Actions */}
            <div className="flex gap-4">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => navigate('/app/practice/unified')}
              >
                Back to Practice
              </Button>
              <Button
                className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600"
                onClick={() => window.location.reload()}
              >
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  // Main exam interface
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 flex flex-col">
      {/* NCLEX-style Header */}
      <header className="bg-gradient-to-r from-blue-900 to-blue-800 text-white px-4 py-3 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <span className="font-bold text-lg">Haven NCLEX-RN</span>
          <span className="text-blue-200 text-sm">
            Question {session?.totalQuestions || 0 + 1} of {EXAM_CONFIG.minQuestions}-{EXAM_CONFIG.maxQuestions}
          </span>
        </div>
        
        {/* Timer */}
        <div className={`flex items-center gap-2 px-4 py-1.5 rounded-lg ${
          timeRemaining < 30 * 60 * 1000 
            ? 'bg-red-600 animate-pulse' 
            : 'bg-blue-700'
        }`}>
          <Clock className="w-4 h-4" />
          <span className="font-mono font-bold text-lg">{formatTime(timeRemaining)}</span>
        </div>
        
        {/* Actions */}
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="ghost"
            className="text-white hover:bg-blue-700"
            onClick={() => setShowCalculator(true)}
          >
            <Calculator className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="text-white hover:bg-blue-700"
            onClick={() => setShowBreakDialog(true)}
          >
            <Pause className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="text-white hover:bg-blue-700"
            onClick={() => setShowExitDialog(true)}
          >
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </header>
      
      {/* Progress Bar */}
      <div className="h-1 bg-gray-200 dark:bg-gray-800">
        <div 
          className="h-full bg-gradient-to-r from-blue-600 to-purple-600 transition-all duration-500"
          style={{ 
            width: `${Math.min(100, ((session?.totalQuestions || 0) / EXAM_CONFIG.minQuestions) * 100)}%` 
          }}
        />
      </div>
      
      {/* Main Content */}
      <main className="flex-1 max-w-4xl mx-auto w-full p-6">
        {currentQuestion && (
          <div className="space-y-6">
            {/* Question */}
            <Card className="border-0 shadow-lg">
              <CardContent className="pt-6">
                <QuestionRenderer
                  question={currentQuestion}
                  answer={currentAnswer}
                  onAnswerChange={setCurrentAnswer}
                  showFeedback={false}
                  disabled={false}
                  questionNumber={session?.totalQuestions ? session.totalQuestions + 1 : 1}
                />
              </CardContent>
            </Card>
            
            {/* Navigation */}
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                onClick={toggleFlag}
                className={flaggedQuestions.has(session?.totalQuestions || 0) ? 'text-yellow-600 border-yellow-600' : ''}
              >
                <Flag className={`w-4 h-4 mr-2 ${
                  flaggedQuestions.has(session?.totalQuestions || 0) ? 'fill-yellow-600' : ''
                }`} />
                {flaggedQuestions.has(session?.totalQuestions || 0) ? 'Flagged' : 'Flag for Review'}
              </Button>
              
              <Button
                onClick={handleSubmitAnswer}
                disabled={currentAnswer === null}
                className="px-8 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
              >
                Next
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        )}
      </main>
      
      {/* Footer */}
      <footer className="bg-gray-100 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 px-4 py-2 text-center text-sm text-gray-500">
        Haven Institute NCLEX Simulator - Computer Adaptive Test
      </footer>
      
      {/* Exit Dialog */}
      <Dialog open={showExitDialog} onOpenChange={setShowExitDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-600" />
              End Examination?
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to end this examination? Your progress will be lost and you will need to start over.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-3 mt-4">
            <Button variant="outline" onClick={() => setShowExitDialog(false)} className="flex-1">
              Continue Exam
            </Button>
            <Button variant="destructive" onClick={handleExitExam} className="flex-1">
              End Exam
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Break Dialog */}
      <Dialog open={showBreakDialog} onOpenChange={setShowBreakDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Optional Break</DialogTitle>
            <DialogDescription>
              You may take an optional break. Note: The timer will continue during your break, just like the real NCLEX exam.
            </DialogDescription>
          </DialogHeader>
          <div className="text-center py-4">
            <p className="text-2xl font-mono font-bold text-blue-600">
              {formatTime(timeRemaining)}
            </p>
            <p className="text-sm text-gray-500 mt-1">Time Remaining</p>
          </div>
          <Button onClick={() => setShowBreakDialog(false)} className="w-full">
            Resume Examination
          </Button>
        </DialogContent>
      </Dialog>
      
      {/* Calculator Dialog */}
      <Dialog open={showCalculator} onOpenChange={setShowCalculator}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Calculator</DialogTitle>
          </DialogHeader>
          <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
            <input
              type="text"
              className="w-full p-3 text-right text-2xl font-mono bg-white dark:bg-gray-900 rounded border mb-2"
              readOnly
              placeholder="0"
            />
            <div className="grid grid-cols-4 gap-2">
              {['7', '8', '9', '/', '4', '5', '6', '*', '1', '2', '3', '-', '0', '.', '=', '+'].map(btn => (
                <button
                  key={btn}
                  className="p-3 bg-white dark:bg-gray-700 rounded hover:bg-gray-200 dark:hover:bg-gray-600 font-mono text-lg"
                >
                  {btn}
                </button>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
