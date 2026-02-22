'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowLeft,
  RotateCcw,
  Check,
  X,
  Brain,
  Zap,
  ThumbsUp,
  ThumbsDown,
  Eye,
  Loader2,
  Sparkles,
  Trophy,
} from 'lucide-react';

interface FlashcardData {
  id: string;
  front: string;
  back: string;
  hint?: string;
  difficulty: string;
  progress: { masteryLevel: string; repetitions: number }[];
}

export default function FlashcardStudyPage() {
  const params = useParams();
  const router = useRouter();
  const deckId = params.deckId as string;

  const [cards, setCards] = useState<FlashcardData[]>([]);
  const [totalCards, setTotalCards] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [sessionStats, setSessionStats] = useState({ reviewed: 0, correct: 0, incorrect: 0 });
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    loadCards();
  }, [deckId]);

  const loadCards = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/flashcards/${deckId}/review`);
      const json = await res.json();
      if (json.success) {
        setCards(json.data.cards || []);
        setTotalCards(json.data.totalCards || 0);
      }
    } catch {
      // handle error
    } finally {
      setLoading(false);
    }
  };

  const currentCard = cards[currentIndex];
  const progress = cards.length > 0 ? (currentIndex / cards.length) * 100 : 0;

  const handleRate = useCallback(async (quality: number) => {
    if (!currentCard || submitting) return;
    setSubmitting(true);

    try {
      await fetch(`/api/flashcards/${deckId}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          flashcardId: currentCard.id,
          quality,
        }),
      });

      setSessionStats(prev => ({
        reviewed: prev.reviewed + 1,
        correct: prev.correct + (quality >= 3 ? 1 : 0),
        incorrect: prev.incorrect + (quality < 3 ? 1 : 0),
      }));

      // Move to next card
      if (currentIndex < cards.length - 1) {
        setCurrentIndex(prev => prev + 1);
        setIsFlipped(false);
        setShowHint(false);
      } else {
        setCompleted(true);
      }
    } catch {
      // handle error
    } finally {
      setSubmitting(false);
    }
  }, [currentCard, currentIndex, cards.length, deckId, submitting]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (cards.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/study/flashcards"><ArrowLeft className="h-5 w-5" /></Link>
          </Button>
          <h1 className="text-2xl font-bold">Flashcard Review</h1>
        </div>
        <Card className="border-0 shadow-sm">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Trophy className="h-16 w-16 text-emerald-500 mb-4" />
            <h2 className="text-xl font-bold mb-2">All caught up!</h2>
            <p className="text-muted-foreground text-sm text-center max-w-md">
              No cards are due for review right now. Great job keeping up with your studies!
              {totalCards > 0 && ` You have ${totalCards} cards in this deck.`}
            </p>
            <Button className="mt-6" asChild>
              <Link href="/study/flashcards">Back to Decks</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (completed) {
    const accuracy = sessionStats.reviewed > 0
      ? Math.round((sessionStats.correct / sessionStats.reviewed) * 100)
      : 0;

    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/study/flashcards"><ArrowLeft className="h-5 w-5" /></Link>
          </Button>
          <h1 className="text-2xl font-bold">Session Complete</h1>
        </div>
        <Card className="border-0 shadow-sm">
          <CardContent className="flex flex-col items-center py-16">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', bounce: 0.5 }}
            >
              <Sparkles className="h-16 w-16 text-primary mb-4" />
            </motion.div>
            <h2 className="text-2xl font-bold mb-2">Great Session!</h2>
            <p className="text-muted-foreground mb-6">
              You reviewed {sessionStats.reviewed} cards
            </p>
            <div className="grid grid-cols-3 gap-6 mb-8">
              <div className="text-center">
                <p className="text-3xl font-bold text-emerald-500">{sessionStats.correct}</p>
                <p className="text-xs text-muted-foreground">Correct</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-red-500">{sessionStats.incorrect}</p>
                <p className="text-xs text-muted-foreground">Needs Review</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-primary">{accuracy}%</p>
                <p className="text-xs text-muted-foreground">Accuracy</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" asChild>
                <Link href="/study/flashcards">Back to Decks</Link>
              </Button>
              <Button onClick={() => { setCompleted(false); setCurrentIndex(0); setSessionStats({ reviewed: 0, correct: 0, incorrect: 0 }); loadCards(); }}>
                <RotateCcw className="h-4 w-4 mr-2" /> Study Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/study/flashcards"><ArrowLeft className="h-5 w-5" /></Link>
          </Button>
          <div>
            <h1 className="text-xl font-bold">Flashcard Review</h1>
            <p className="text-sm text-muted-foreground">
              Card {currentIndex + 1} of {cards.length}
            </p>
          </div>
        </div>
        <Badge variant="secondary">{sessionStats.reviewed} reviewed</Badge>
      </div>

      {/* Progress */}
      <Progress value={progress} className="h-1.5" />

      {/* Flashcard */}
      <div className="flex justify-center">
        <motion.div
          className="w-full max-w-xl cursor-pointer perspective-1000"
          onClick={() => !isFlipped && setIsFlipped(true)}
        >
          <Card className="border-0 shadow-lg min-h-[300px]">
            <CardContent className="flex flex-col items-center justify-center p-8 min-h-[300px]">
              <AnimatePresence mode="wait">
                {!isFlipped ? (
                  <motion.div
                    key="front"
                    initial={{ opacity: 0, rotateY: -90 }}
                    animate={{ opacity: 1, rotateY: 0 }}
                    exit={{ opacity: 0, rotateY: 90 }}
                    className="text-center w-full"
                  >
                    <Badge variant="outline" className="mb-4">
                      <Brain className="h-3 w-3 mr-1" />
                      {currentCard?.difficulty}
                    </Badge>
                    <p className="text-lg font-medium leading-relaxed">
                      {currentCard?.front}
                    </p>
                    {currentCard?.hint && !showHint && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="mt-4"
                        onClick={(e) => { e.stopPropagation(); setShowHint(true); }}
                      >
                        <Eye className="h-4 w-4 mr-1" /> Show Hint
                      </Button>
                    )}
                    {showHint && (
                      <p className="mt-4 text-sm text-amber-600 dark:text-amber-400 italic">
                        Hint: {currentCard?.hint}
                      </p>
                    )}
                    <p className="mt-6 text-xs text-muted-foreground">
                      Tap to reveal answer
                    </p>
                  </motion.div>
                ) : (
                  <motion.div
                    key="back"
                    initial={{ opacity: 0, rotateY: -90 }}
                    animate={{ opacity: 1, rotateY: 0 }}
                    exit={{ opacity: 0, rotateY: 90 }}
                    className="text-center w-full"
                  >
                    <Badge className="mb-4 bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
                      Answer
                    </Badge>
                    <p className="text-lg font-medium leading-relaxed whitespace-pre-wrap">
                      {currentCard?.back}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Rating Buttons (only when flipped) */}
      {isFlipped && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-center"
        >
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="lg"
              disabled={submitting}
              onClick={() => handleRate(1)}
              className="border-red-200 text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
            >
              <ThumbsDown className="h-4 w-4 mr-2" /> Again
            </Button>
            <Button
              variant="outline"
              size="lg"
              disabled={submitting}
              onClick={() => handleRate(3)}
              className="border-amber-200 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950"
            >
              <Zap className="h-4 w-4 mr-2" /> Hard
            </Button>
            <Button
              variant="outline"
              size="lg"
              disabled={submitting}
              onClick={() => handleRate(4)}
              className="border-blue-200 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950"
            >
              <Check className="h-4 w-4 mr-2" /> Good
            </Button>
            <Button
              variant="outline"
              size="lg"
              disabled={submitting}
              onClick={() => handleRate(5)}
              className="border-emerald-200 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950"
            >
              <ThumbsUp className="h-4 w-4 mr-2" /> Easy
            </Button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
