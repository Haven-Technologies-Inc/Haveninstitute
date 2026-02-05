/**
 * NCLEX Exam Break Screen
 * Displays during scheduled breaks in NCLEX simulation mode
 */

import { useState, useEffect, useCallback } from 'react';
import { Coffee, Clock, Play, Pause, RefreshCw, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';

interface ExamBreakScreenProps {
  breakNumber: number;
  totalBreaks: number;
  breakDurationMinutes: number;
  questionsCompleted: number;
  totalQuestions: number;
  elapsedTimeMinutes: number;
  onResumeExam: () => void;
  onExtendBreak?: (minutes: number) => void;
  isPaused?: boolean;
}

export function ExamBreakScreen({
  breakNumber,
  totalBreaks,
  breakDurationMinutes,
  questionsCompleted,
  totalQuestions,
  elapsedTimeMinutes,
  onResumeExam,
  onExtendBreak,
  isPaused = false
}: ExamBreakScreenProps) {
  const [remainingSeconds, setRemainingSeconds] = useState(breakDurationMinutes * 60);
  const [isBreakPaused, setIsBreakPaused] = useState(isPaused);
  const [showWarning, setShowWarning] = useState(false);

  // Countdown timer
  useEffect(() => {
    if (isBreakPaused || remainingSeconds <= 0) return;

    const timer = setInterval(() => {
      setRemainingSeconds(prev => {
        if (prev <= 1) {
          // Auto-resume when break ends
          onResumeExam();
          return 0;
        }
        // Show warning in last 30 seconds
        if (prev <= 30) {
          setShowWarning(true);
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isBreakPaused, remainingSeconds, onResumeExam]);

  // Format time as MM:SS
  const formatTime = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);

  // Format elapsed time
  const formatElapsedTime = useCallback((minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  }, []);

  // Progress percentage
  const progressPercent = ((breakDurationMinutes * 60 - remainingSeconds) / (breakDurationMinutes * 60)) * 100;

  // Toggle break pause
  const togglePause = () => {
    setIsBreakPaused(!isBreakPaused);
  };

  // Extend break
  const handleExtendBreak = (minutes: number) => {
    setRemainingSeconds(prev => prev + minutes * 60);
    setShowWarning(false);
    if (onExtendBreak) {
      onExtendBreak(minutes);
    }
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center p-4 z-50">
      <Card className="max-w-lg w-full bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm shadow-2xl">
        <CardHeader className="text-center border-b dark:border-gray-700 pb-4">
          <div className="flex justify-center mb-4">
            <div className="w-20 h-20 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center">
              <Coffee className="w-10 h-10 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
            Scheduled Break
          </CardTitle>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Break {breakNumber} of {totalBreaks}
          </p>
        </CardHeader>

        <CardContent className="space-y-6 pt-6">
          {/* Warning Banner */}
          {showWarning && (
            <div className="flex items-center gap-3 p-3 bg-amber-100 dark:bg-amber-900/30 border border-amber-300 dark:border-amber-700 rounded-lg animate-pulse">
              <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
              <p className="text-sm text-amber-800 dark:text-amber-200">
                Your break is ending soon. Prepare to resume the exam.
              </p>
            </div>
          )}

          {/* Timer Display */}
          <div className="text-center">
            <div className={`text-6xl font-mono font-bold tracking-wider ${
              remainingSeconds <= 30
                ? 'text-red-600 dark:text-red-400 animate-pulse'
                : 'text-gray-900 dark:text-white'
            }`}>
              {formatTime(remainingSeconds)}
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              {isBreakPaused ? 'Break Paused' : 'Time Remaining'}
            </p>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <Progress value={progressPercent} className="h-2" />
            <div className="flex justify-between text-xs text-gray-500">
              <span>Break Started</span>
              <span>Break Ends</span>
            </div>
          </div>

          {/* Exam Progress Summary */}
          <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {questionsCompleted}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Questions Answered
              </p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {formatElapsedTime(elapsedTimeMinutes)}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Time Elapsed
              </p>
            </div>
          </div>

          {/* Tips During Break */}
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
            <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2 flex items-center gap-2">
              <span>💡</span> Break Tips
            </h4>
            <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
              <li>• Stand up and stretch your legs</li>
              <li>• Take deep breaths to relax</li>
              <li>• Stay hydrated - drink some water</li>
              <li>• Avoid looking at study materials</li>
              <li>• Use the restroom if needed</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={onResumeExam}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white py-6 text-lg"
            >
              <Play className="w-5 h-5 mr-2" />
              Resume Exam
            </Button>
            <Button
              onClick={togglePause}
              variant="outline"
              className="flex-1 py-6"
            >
              {isBreakPaused ? (
                <>
                  <Play className="w-5 h-5 mr-2" />
                  Resume Timer
                </>
              ) : (
                <>
                  <Pause className="w-5 h-5 mr-2" />
                  Pause Timer
                </>
              )}
            </Button>
          </div>

          {/* Extend Break Option */}
          {remainingSeconds < 60 && (
            <div className="flex justify-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleExtendBreak(1)}
                className="text-xs"
              >
                <RefreshCw className="w-3 h-3 mr-1" />
                +1 min
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleExtendBreak(2)}
                className="text-xs"
              >
                <RefreshCw className="w-3 h-3 mr-1" />
                +2 min
              </Button>
            </div>
          )}

          {/* NCLEX Break Rules Note */}
          <p className="text-xs text-center text-gray-400 dark:text-gray-500">
            Note: On the actual NCLEX exam, you receive one scheduled break after 2 hours.
            Additional unscheduled breaks are available but count against your total exam time.
          </p>
        </CardContent>
      </Card>

      {/* Background Animation */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>
    </div>
  );
}

export default ExamBreakScreen;
