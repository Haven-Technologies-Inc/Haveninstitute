import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  RotateCcw, 
  ChevronLeft, 
  ChevronRight, 
  ThumbsUp, 
  ThumbsDown,
  Brain,
  Zap,
  CheckCircle2,
  XCircle,
  Clock,
  Target
} from 'lucide-react';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { useSubmitReview } from '../../services/hooks/useFlashcards';
import type { Flashcard, ReviewResult } from '../../services/api/flashcardApi';

interface FlashcardStudyProps {
  cards: Flashcard[];
  deckTitle: string;
  onComplete: () => void;
  onBack: () => void;
}

type Quality = 0 | 1 | 2 | 3 | 4 | 5;

export function FlashcardStudy({ cards, deckTitle, onComplete, onBack }: FlashcardStudyProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [results, setResults] = useState<ReviewResult[]>([]);
  const [sessionComplete, setSessionComplete] = useState(false);
  
  const submitReview = useSubmitReview();
  
  const currentCard = cards[currentIndex];
  const progress = ((currentIndex + 1) / cards.length) * 100;

  const handleFlip = useCallback(() => {
    setIsFlipped(prev => !prev);
  }, []);

  const handleResponse = useCallback((quality: Quality) => {
    const result: ReviewResult = {
      flashcardId: currentCard.id,
      quality,
    };
    
    setResults(prev => [...prev, result]);
    
    if (currentIndex < cards.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setIsFlipped(false);
    } else {
      // Session complete - submit all results
      submitReview.mutate([...results, result], {
        onSuccess: () => {
          setSessionComplete(true);
        },
      });
    }
  }, [currentCard, currentIndex, cards.length, results, submitReview]);

  const handlePrevious = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      setIsFlipped(false);
    }
  }, [currentIndex]);

  const getQualityStats = () => {
    const correct = results.filter(r => r.quality >= 3).length;
    const incorrect = results.filter(r => r.quality < 3).length;
    return { correct, incorrect, total: results.length };
  };

  if (sessionComplete) {
    const stats = getQualityStats();
    const accuracy = stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0;
    
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] p-8">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="w-24 h-24 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mb-6"
        >
          <CheckCircle2 className="w-12 h-12 text-white" />
        </motion.div>
        
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Session Complete!
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Great job reviewing {cards.length} cards
        </p>

        <div className="grid grid-cols-3 gap-6 mb-8">
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600">{stats.correct}</div>
            <div className="text-sm text-gray-500">Correct</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-red-500">{stats.incorrect}</div>
            <div className="text-sm text-gray-500">Need Review</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">{accuracy}%</div>
            <div className="text-sm text-gray-500">Accuracy</div>
          </div>
        </div>

        <div className="flex gap-4">
          <Button variant="outline" onClick={onBack}>
            Back to Decks
          </Button>
          <Button onClick={onComplete} className="bg-gradient-to-r from-indigo-600 to-purple-600">
            Continue Studying
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">{deckTitle}</h2>
          <p className="text-sm text-gray-500">
            Card {currentIndex + 1} of {cards.length}
          </p>
        </div>
        <Button variant="ghost" size="sm" onClick={onBack}>
          Exit
        </Button>
      </div>

      {/* Progress */}
      <div className="mb-6">
        <Progress value={progress} className="h-2" />
      </div>

      {/* Flashcard */}
      <div className="flex-1 flex items-center justify-center perspective-1000">
        <motion.div
          className="w-full max-w-2xl aspect-[3/2] cursor-pointer"
          onClick={handleFlip}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={isFlipped ? 'back' : 'front'}
              initial={{ rotateY: isFlipped ? -90 : 90, opacity: 0 }}
              animate={{ rotateY: 0, opacity: 1 }}
              exit={{ rotateY: isFlipped ? 90 : -90, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className={`w-full h-full rounded-2xl shadow-xl p-8 flex flex-col items-center justify-center text-center ${
                isFlipped
                  ? 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white'
                  : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700'
              }`}
            >
              <div className="absolute top-4 right-4">
                <span className={`text-xs px-2 py-1 rounded-full ${
                  isFlipped ? 'bg-white/20 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                }`}>
                  {isFlipped ? 'Answer' : 'Question'}
                </span>
              </div>

              <div className="text-xl md:text-2xl font-medium leading-relaxed">
                {isFlipped ? currentCard.back : currentCard.front}
              </div>

              {!isFlipped && currentCard.notes && (
                <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                  Hint: {currentCard.notes}
                </p>
              )}

              <p className="absolute bottom-4 text-sm opacity-60">
                {isFlipped ? 'Click to see question' : 'Click to reveal answer'}
              </p>
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Controls */}
      <div className="mt-6 space-y-4">
        {isFlipped ? (
          <>
            <p className="text-center text-sm text-gray-600 dark:text-gray-400 mb-2">
              How well did you know this?
            </p>
            <div className="flex justify-center gap-3">
              <Button
                variant="outline"
                className="flex-1 max-w-[140px] border-red-300 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                onClick={() => handleResponse(1)}
              >
                <XCircle className="w-4 h-4 mr-2" />
                Again
              </Button>
              <Button
                variant="outline"
                className="flex-1 max-w-[140px] border-orange-300 text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20"
                onClick={() => handleResponse(2)}
              >
                <Clock className="w-4 h-4 mr-2" />
                Hard
              </Button>
              <Button
                variant="outline"
                className="flex-1 max-w-[140px] border-blue-300 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                onClick={() => handleResponse(3)}
              >
                <Target className="w-4 h-4 mr-2" />
                Good
              </Button>
              <Button
                variant="outline"
                className="flex-1 max-w-[140px] border-green-300 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20"
                onClick={() => handleResponse(5)}
              >
                <Zap className="w-4 h-4 mr-2" />
                Easy
              </Button>
            </div>
          </>
        ) : (
          <div className="flex justify-center gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={handlePrevious}
              disabled={currentIndex === 0}
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <Button
              onClick={handleFlip}
              className="px-8 bg-gradient-to-r from-indigo-600 to-purple-600"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Show Answer
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => {
                if (currentIndex < cards.length - 1) {
                  setCurrentIndex(prev => prev + 1);
                  setIsFlipped(false);
                }
              }}
              disabled={currentIndex === cards.length - 1}
            >
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

export default FlashcardStudy;
