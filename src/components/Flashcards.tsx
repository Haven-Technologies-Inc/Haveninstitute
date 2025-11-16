import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { ArrowLeft, RotateCcw, ChevronLeft, ChevronRight, Check, X } from 'lucide-react';
import { flashcardData } from '../data/flashcardData';

interface FlashcardsProps {
  topic: string;
  onBack: () => void;
}

export function Flashcards({ topic, onBack }: FlashcardsProps) {
  const [currentCard, setCurrentCard] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [masteredCards, setMasteredCards] = useState<number[]>([]);
  const [needsReviewCards, setNeedsReviewCards] = useState<number[]>([]);

  const cards = flashcardData[topic] || flashcardData['fundamentals'];
  const card = cards[currentCard];

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleNext = () => {
    if (currentCard < cards.length - 1) {
      setCurrentCard(currentCard + 1);
      setIsFlipped(false);
    }
  };

  const handlePrevious = () => {
    if (currentCard > 0) {
      setCurrentCard(currentCard - 1);
      setIsFlipped(false);
    }
  };

  const handleMastered = () => {
    if (!masteredCards.includes(currentCard)) {
      setMasteredCards([...masteredCards, currentCard]);
    }
    handleNext();
  };

  const handleNeedsReview = () => {
    if (!needsReviewCards.includes(currentCard)) {
      setNeedsReviewCards([...needsReviewCards, currentCard]);
    }
    handleNext();
  };

  const handleReset = () => {
    setCurrentCard(0);
    setIsFlipped(false);
    setMasteredCards([]);
    setNeedsReviewCards([]);
  };

  const masteredCount = masteredCards.length;
  const reviewCount = needsReviewCards.length;
  const progress = Math.round(((masteredCount + reviewCount) / cards.length) * 100);

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Button variant="ghost" onClick={onBack} className="mb-4">
            <ArrowLeft className="size-4 mr-2" />
            Back to Dashboard
          </Button>

          <div className="flex items-center justify-between">
            <div>
              <h2>Flashcards</h2>
              <p className="text-gray-600">
                Card {currentCard + 1} of {cards.length}
              </p>
            </div>
            <Button variant="outline" onClick={handleReset}>
              <RotateCcw className="size-4 mr-2" />
              Reset Progress
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-gray-600 mb-1">Progress</p>
              <p>{progress}%</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-gray-600 mb-1">Mastered</p>
              <p className="text-green-600">{masteredCount}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-gray-600 mb-1">Needs Review</p>
              <p className="text-orange-600">{reviewCount}</p>
            </CardContent>
          </Card>
        </div>

        {/* Flashcard */}
        <div className="relative" style={{ perspective: '1000px' }}>
          <div
            className={`relative w-full transition-transform duration-500 cursor-pointer`}
            style={{
              transformStyle: 'preserve-3d',
              transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
              minHeight: '400px'
            }}
            onClick={handleFlip}
          >
            {/* Front of card */}
            <Card
              className="absolute inset-0 flex items-center justify-center p-8"
              style={{
                backfaceVisibility: 'hidden',
                minHeight: '400px'
              }}
            >
              <div className="w-full">
                <div className="flex justify-between items-start mb-6">
                  <Badge>{card.category}</Badge>
                  <Badge variant="outline">Front</Badge>
                </div>
                <CardContent className="text-center">
                  <h3 className="mb-4">{card.term}</h3>
                  <p className="text-gray-500">Click to reveal answer</p>
                </CardContent>
              </div>
            </Card>

            {/* Back of card */}
            <Card
              className="absolute inset-0 flex items-center justify-center p-8 bg-gradient-to-br from-blue-50 to-purple-50"
              style={{
                backfaceVisibility: 'hidden',
                transform: 'rotateY(180deg)',
                minHeight: '400px'
              }}
            >
              <div className="w-full">
                <div className="flex justify-between items-start mb-6">
                  <Badge>{card.category}</Badge>
                  <Badge variant="outline">Back</Badge>
                </div>
                <CardContent>
                  <p className="text-gray-800 mb-4">{card.definition}</p>
                  {card.example && (
                    <div className="bg-white rounded-lg p-4 mt-4">
                      <p className="text-gray-600 mb-1">Example:</p>
                      <p className="text-gray-800">{card.example}</p>
                    </div>
                  )}
                </CardContent>
              </div>
            </Card>
          </div>
        </div>

        {/* Controls */}
        <div className="mt-6 space-y-4">
          {/* Knowledge Rating (only show when flipped) */}
          {isFlipped && (
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1 border-orange-200 hover:bg-orange-50"
                onClick={handleNeedsReview}
              >
                <X className="size-4 mr-2" />
                Needs Review
              </Button>
              <Button
                variant="outline"
                className="flex-1 border-green-200 hover:bg-green-50"
                onClick={handleMastered}
              >
                <Check className="size-4 mr-2" />
                Mastered
              </Button>
            </div>
          )}

          {/* Navigation */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentCard === 0}
              className="flex-1"
            >
              <ChevronLeft className="size-4 mr-2" />
              Previous
            </Button>
            <Button
              variant="outline"
              onClick={handleNext}
              disabled={currentCard === cards.length - 1}
              className="flex-1"
            >
              Next
              <ChevronRight className="size-4 ml-2" />
            </Button>
          </div>
        </div>

        {/* Progress Indicator */}
        <div className="mt-6 flex gap-1 flex-wrap">
          {cards.map((_, index) => (
            <div
              key={index}
              className={`h-2 flex-1 min-w-[20px] rounded ${
                masteredCards.includes(index)
                  ? 'bg-green-500'
                  : needsReviewCards.includes(index)
                  ? 'bg-orange-500'
                  : index === currentCard
                  ? 'bg-blue-500'
                  : 'bg-gray-200'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
