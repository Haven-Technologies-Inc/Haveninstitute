import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import {
  ArrowLeft,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Check,
  X,
  Brain,
  Shuffle,
  Star,
  BarChart3,
  Target,
  Eye,
  EyeOff,
  Lightbulb,
  BookOpen,
  Filter,
  Play
} from 'lucide-react';
import { flashcardTopics, enhancedFlashcardBank, getFlashcardsByTopic, getRandomFlashcards, type Flashcard } from '../data/enhancedFlashcardBank';

interface FlashcardsEnhancedProps {
  onBack: () => void;
}

export function FlashcardsEnhanced({ onBack }: FlashcardsEnhancedProps) {
  // Selection state
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [sessionStarted, setSessionStarted] = useState(false);
  const [shuffleMode, setShuffleMode] = useState(true);
  const [studyMode, setStudyMode] = useState<'all' | 'mastered' | 'review'>('all');

  // Flashcard state
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [currentCard, setCurrentCard] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [masteredCards, setMasteredCards] = useState<Set<number>>(new Set());
  const [reviewCards, setReviewCards] = useState<Set<number>>(new Set());
  const [showStats, setShowStats] = useState(false);

  const handleStartSession = (topicId: string) => {
    let sessionCards: Flashcard[] = [];
    
    if (shuffleMode) {
      sessionCards = getRandomFlashcards(topicId, 30);
    } else {
      sessionCards = getFlashcardsByTopic(topicId);
    }

    setCards(sessionCards);
    setSelectedTopic(topicId);
    setSessionStarted(true);
    setCurrentCard(0);
    setIsFlipped(false);
  };

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
    const newMastered = new Set(masteredCards);
    newMastered.add(currentCard);
    const newReview = new Set(reviewCards);
    newReview.delete(currentCard);
    setMasteredCards(newMastered);
    setReviewCards(newReview);
    handleNext();
  };

  const handleNeedsReview = () => {
    const newReview = new Set(reviewCards);
    newReview.add(currentCard);
    const newMastered = new Set(masteredCards);
    newMastered.delete(currentCard);
    setReviewCards(newReview);
    setMasteredCards(newMastered);
    handleNext();
  };

  const handleReset = () => {
    setSessionStarted(false);
    setCards([]);
    setCurrentCard(0);
    setIsFlipped(false);
    setMasteredCards(new Set());
    setReviewCards(new Set());
    setShowStats(false);
  };

  const masteredCount = masteredCards.size;
  const reviewCount = reviewCards.size;
  const unmarkedCount = cards.length - masteredCount - reviewCount;
  const progress = Math.round(((masteredCount + reviewCount) / cards.length) * 100);

  // Topic Selection Screen
  if (!sessionStarted) {
    return (
      <div className="max-w-6xl mx-auto p-4">
        <Button variant="ghost" onClick={onBack} className="mb-6">
          <ArrowLeft className="mr-2 size-4" />
          Back to Dashboard
        </Button>

        <Card className="border-2 border-purple-300 bg-gradient-to-br from-purple-50 to-pink-50 mb-6">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="p-4 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl">
                <Brain className="size-12 text-white" />
              </div>
            </div>
            <CardTitle className="text-3xl">Flashcards</CardTitle>
            <CardDescription className="text-lg">
              Master key nursing concepts through active recall
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Study Settings */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="size-5 text-purple-600" />
              Study Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Shuffle Mode */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Shuffle className="size-5 text-purple-600" />
                <div>
                  <p className="text-gray-900">Shuffle Cards</p>
                  <p className="text-xs text-gray-600">Randomize card order</p>
                </div>
              </div>
              <Button
                variant={shuffleMode ? 'default' : 'outline'}
                size="sm"
                onClick={() => setShuffleMode(!shuffleMode)}
              >
                {shuffleMode ? 'On' : 'Off'}
              </Button>
            </div>

            {/* Study Tips */}
            <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
              <div className="flex gap-3">
                <Lightbulb className="size-5 text-blue-600 shrink-0" />
                <div>
                  <p className="text-blue-900 mb-2"><strong>Study Tips:</strong></p>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Read the front and try to recall the answer before flipping</li>
                    <li>• Mark cards as "Mastered" only if you knew it confidently</li>
                    <li>• Review "Needs Review" cards multiple times until mastered</li>
                    <li>• Focus on understanding, not just memorization</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Topic Selection */}
        <div>
          <h3 className="text-xl text-gray-900 mb-4">Select a Topic</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {flashcardTopics.map(topic => (
              <Card
                key={topic.id}
                className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-purple-400"
                onClick={() => handleStartSession(topic.id)}
              >
                <CardContent className="pt-6">
                  <div className="text-center space-y-3">
                    <div className="text-5xl">{topic.icon}</div>
                    <div>
                      <h4 className="text-gray-900 mb-1">{topic.name}</h4>
                    </div>
                    <div className="flex items-center justify-center gap-2">
                      <Badge variant="outline">{topic.count} cards</Badge>
                    </div>
                    <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600">
                      <Play className="mr-2 size-4" />
                      Start Studying
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Stats View
  if (showStats) {
    const masteredPercentage = Math.round((masteredCount / cards.length) * 100);
    const reviewPercentage = Math.round((reviewCount / cards.length) * 100);
    const unmarkedPercentage = Math.round((unmarkedCount / cards.length) * 100);

    return (
      <div className="max-w-4xl mx-auto p-4">
        <Button variant="ghost" onClick={() => setShowStats(false)} className="mb-6">
          <ArrowLeft className="mr-2 size-4" />
          Back to Cards
        </Button>

        <Card className="border-2 border-purple-300">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="p-4 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl">
                <BarChart3 className="size-12 text-white" />
              </div>
            </div>
            <CardTitle className="text-3xl">Study Session Stats</CardTitle>
            <CardDescription className="text-lg">Your progress for this session</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Overall Progress */}
            <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border-2 border-purple-200">
              <p className="text-gray-600 mb-3">Overall Progress</p>
              <div className="text-6xl text-purple-600 mb-4">{progress}%</div>
              <p className="text-lg text-gray-700 mb-4">
                {masteredCount + reviewCount} of {cards.length} cards reviewed
              </p>
              <Progress value={progress} className="h-4" />
            </div>

            {/* Detailed Breakdown */}
            <div className="grid grid-cols-3 gap-4">
              <Card className="border-2 border-green-200 bg-green-50">
                <CardContent className="pt-6 text-center">
                  <Check className="size-10 text-green-600 mx-auto mb-3" />
                  <p className="text-3xl text-green-700 mb-2">{masteredCount}</p>
                  <p className="text-sm text-green-800 mb-2">Mastered</p>
                  <Badge className="bg-green-600">{masteredPercentage}%</Badge>
                </CardContent>
              </Card>

              <Card className="border-2 border-yellow-200 bg-yellow-50">
                <CardContent className="pt-6 text-center">
                  <Star className="size-10 text-yellow-600 mx-auto mb-3" />
                  <p className="text-3xl text-yellow-700 mb-2">{reviewCount}</p>
                  <p className="text-sm text-yellow-800 mb-2">Needs Review</p>
                  <Badge className="bg-yellow-600">{reviewPercentage}%</Badge>
                </CardContent>
              </Card>

              <Card className="border-2 border-gray-200 bg-gray-50">
                <CardContent className="pt-6 text-center">
                  <Target className="size-10 text-gray-600 mx-auto mb-3" />
                  <p className="text-3xl text-gray-700 mb-2">{unmarkedCount}</p>
                  <p className="text-sm text-gray-800 mb-2">Not Reviewed</p>
                  <Badge className="bg-gray-600">{unmarkedPercentage}%</Badge>
                </CardContent>
              </Card>
            </div>

            {/* Study Recommendations */}
            <Card className="border-2 border-blue-300 bg-gradient-to-br from-blue-50 to-purple-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="size-5 text-blue-600" />
                  Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent>
                {masteredPercentage >= 80 ? (
                  <div className="flex gap-3 p-4 bg-green-50 border-2 border-green-200 rounded-lg">
                    <Check className="size-6 text-green-600 shrink-0" />
                    <div>
                      <p className="text-green-900 mb-2"><strong>Excellent Mastery!</strong></p>
                      <p className="text-sm text-green-800">
                        You've mastered most cards! Review the "Needs Review" cards to achieve 100% mastery.
                      </p>
                    </div>
                  </div>
                ) : reviewCount > masteredCount ? (
                  <div className="flex gap-3 p-4 bg-yellow-50 border-2 border-yellow-200 rounded-lg">
                    <Star className="size-6 text-yellow-600 shrink-0" />
                    <div>
                      <p className="text-yellow-900 mb-2"><strong>Keep Practicing!</strong></p>
                      <p className="text-sm text-yellow-800">
                        Focus on cards marked "Needs Review". Repeat this session until more cards are mastered.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-3 p-4 bg-blue-50 border-2 border-blue-200 rounded-lg">
                    <Target className="size-6 text-blue-600 shrink-0" />
                    <div>
                      <p className="text-blue-900 mb-2"><strong>Great Progress!</strong></p>
                      <p className="text-sm text-blue-800">
                        Continue reviewing all cards. Mark cards honestly to track your true progress.
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button onClick={() => setShowStats(false)} variant="outline" className="flex-1">
                <Eye className="mr-2 size-4" />
                Continue Studying
              </Button>
              <Button onClick={handleReset} variant="outline" className="flex-1">
                <RotateCcw className="mr-2 size-4" />
                New Session
              </Button>
              <Button onClick={onBack} className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600">
                Back to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Flashcard Study Screen
  const card = cards[currentCard];
  const cardStatus = masteredCards.has(currentCard) ? 'mastered' : reviewCards.has(currentCard) ? 'review' : 'unmarked';

  return (
    <div className="max-w-5xl mx-auto p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Badge variant="outline" className="text-lg px-4 py-2">
            Card {currentCard + 1} of {cards.length}
          </Badge>
          {cardStatus === 'mastered' && (
            <Badge className="bg-green-600">
              <Check className="mr-1 size-3" />
              Mastered
            </Badge>
          )}
          {cardStatus === 'review' && (
            <Badge className="bg-yellow-600">
              <Star className="mr-1 size-3" />
              Needs Review
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => setShowStats(true)}>
            <BarChart3 className="mr-2 size-4" />
            View Stats
          </Button>
          <Button variant="outline" onClick={onBack}>
            Exit
          </Button>
        </div>
      </div>

      {/* Progress */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-600">Session Progress</span>
          <span className="text-sm text-gray-900">{progress}% Complete</span>
        </div>
        <Progress value={progress} className="h-3" />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <Card className="border-2 border-green-200 bg-green-50">
          <CardContent className="pt-4 text-center">
            <Check className="size-6 text-green-600 mx-auto mb-1" />
            <p className="text-2xl text-green-700">{masteredCount}</p>
            <p className="text-xs text-green-800">Mastered</p>
          </CardContent>
        </Card>
        <Card className="border-2 border-yellow-200 bg-yellow-50">
          <CardContent className="pt-4 text-center">
            <Star className="size-6 text-yellow-600 mx-auto mb-1" />
            <p className="text-2xl text-yellow-700">{reviewCount}</p>
            <p className="text-xs text-yellow-800">Needs Review</p>
          </CardContent>
        </Card>
        <Card className="border-2 border-gray-200 bg-gray-50">
          <CardContent className="pt-4 text-center">
            <Target className="size-6 text-gray-600 mx-auto mb-1" />
            <p className="text-2xl text-gray-700">{unmarkedCount}</p>
            <p className="text-xs text-gray-800">Not Reviewed</p>
          </CardContent>
        </Card>
      </div>

      {/* Flashcard */}
      <div className="mb-6 perspective-1000">
        <Card
          className={`border-2 border-purple-300 min-h-[400px] cursor-pointer transition-all duration-500 transform ${
            isFlipped ? 'rotate-y-180' : ''
          }`}
          onClick={handleFlip}
          style={{ transformStyle: 'preserve-3d' }}
        >
          <CardContent className="p-8 flex flex-col items-center justify-center min-h-[400px]">
            {!isFlipped ? (
              // Front of card
              <div className="text-center space-y-6 w-full">
                <div className="flex items-center justify-center gap-2 mb-6">
                  <Badge variant="outline">{card.subcategory}</Badge>
                  <Badge variant="outline" className="capitalize">{card.difficulty}</Badge>
                  <Badge variant="secondary">
                    <Eye className="mr-1 size-3" />
                    Front
                  </Badge>
                </div>
                <div>
                  <h3 className="text-2xl text-gray-900 mb-4">Question:</h3>
                  <p className="text-xl text-gray-700 leading-relaxed">{card.front}</p>
                </div>
                <div className="pt-8">
                  <p className="text-sm text-gray-500 animate-pulse">Click to flip</p>
                </div>
              </div>
            ) : (
              // Back of card
              <div className="text-center space-y-6 w-full" style={{ transform: 'rotateY(180deg)' }}>
                <div className="flex items-center justify-center gap-2 mb-6">
                  <Badge variant="outline">{card.subcategory}</Badge>
                  <Badge variant="outline" className="capitalize">{card.difficulty}</Badge>
                  <Badge variant="secondary">
                    <EyeOff className="mr-1 size-3" />
                    Back
                  </Badge>
                </div>
                <div>
                  <h3 className="text-2xl text-gray-900 mb-4">Answer:</h3>
                  <p className="text-lg text-gray-700 leading-relaxed whitespace-pre-line">{card.back}</p>
                </div>
                {card.mnemonicTip && (
                  <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-4 text-left">
                    <div className="flex gap-2">
                      <Lightbulb className="size-5 text-purple-600 shrink-0" />
                      <div>
                        <p className="text-purple-900 mb-1"><strong>Memory Tip:</strong></p>
                        <p className="text-sm text-purple-800">{card.mnemonicTip}</p>
                      </div>
                    </div>
                  </div>
                )}
                {card.relatedConcepts && card.relatedConcepts.length > 0 && (
                  <div className="flex flex-wrap gap-2 justify-center">
                    <span className="text-xs text-gray-600">Related:</span>
                    {card.relatedConcepts.map(concept => (
                      <Badge key={concept} variant="outline" className="text-xs">
                        {concept}
                      </Badge>
                    ))}
                  </div>
                )}
                <div className="pt-4">
                  <p className="text-sm text-gray-500 animate-pulse">Click to flip back</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Navigation and Actions */}
      <div className="space-y-4">
        {/* Self-Assessment (shown when flipped) */}
        {isFlipped && (
          <div className="flex gap-3">
            <Button
              onClick={handleNeedsReview}
              variant="outline"
              className="flex-1 border-2 border-yellow-400 hover:bg-yellow-50"
              size="lg"
            >
              <X className="mr-2 size-5 text-yellow-600" />
              <div className="text-left">
                <div className="text-yellow-900">Needs Review</div>
                <div className="text-xs text-yellow-700">I need more practice</div>
              </div>
            </Button>
            <Button
              onClick={handleMastered}
              variant="outline"
              className="flex-1 border-2 border-green-400 hover:bg-green-50"
              size="lg"
            >
              <Check className="mr-2 size-5 text-green-600" />
              <div className="text-left">
                <div className="text-green-900">Mastered</div>
                <div className="text-xs text-green-700">I know this well</div>
              </div>
            </Button>
          </div>
        )}

        {/* Navigation */}
        <div className="flex gap-3">
          <Button
            onClick={handlePrevious}
            disabled={currentCard === 0}
            variant="outline"
            className="flex-1"
            size="lg"
          >
            <ChevronLeft className="mr-2 size-5" />
            Previous
          </Button>
          <Button
            onClick={handleFlip}
            variant="default"
            className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600"
            size="lg"
          >
            {isFlipped ? (
              <>
                <EyeOff className="mr-2 size-5" />
                Show Question
              </>
            ) : (
              <>
                <Eye className="mr-2 size-5" />
                Show Answer
              </>
            )}
          </Button>
          <Button
            onClick={handleNext}
            disabled={currentCard === cards.length - 1}
            variant="outline"
            className="flex-1"
            size="lg"
          >
            Next
            <ChevronRight className="ml-2 size-5" />
          </Button>
        </div>

        {/* Reset Button */}
        <Button
          onClick={handleReset}
          variant="ghost"
          className="w-full"
        >
          <RotateCcw className="mr-2 size-4" />
          Reset Session
        </Button>
      </div>
    </div>
  );
}
