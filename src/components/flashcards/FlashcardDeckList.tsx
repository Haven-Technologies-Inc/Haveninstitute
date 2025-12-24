import { useState } from 'react';
import { 
  Plus, 
  Play, 
  MoreVertical, 
  Edit2, 
  Trash2, 
  BookOpen,
  Brain,
  Target,
  Clock,
  Layers
} from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Progress } from '../ui/progress';
import { useDecks, useDeleteDeck, useFlashcardStats } from '../../services/hooks/useFlashcards';
import type { FlashcardDeck } from '../../services/api/flashcardApi';

interface FlashcardDeckListProps {
  onSelectDeck: (deckId: string) => void;
  onCreateDeck: () => void;
  onEditDeck: (deck: FlashcardDeck) => void;
}

export function FlashcardDeckList({ onSelectDeck, onCreateDeck, onEditDeck }: FlashcardDeckListProps) {
  const { data: decks, isLoading } = useDecks();
  const { data: stats } = useFlashcardStats();
  const deleteDeck = useDeleteDeck();
  const [menuOpen, setMenuOpen] = useState<string | null>(null);

  const getMasteryColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-600 bg-green-100';
    if (percentage >= 50) return 'text-yellow-600 bg-yellow-100';
    return 'text-gray-600 bg-gray-100';
  };

  const handleDelete = async (deckId: string) => {
    if (confirm('Are you sure you want to delete this deck?')) {
      deleteDeck.mutate(deckId);
    }
    setMenuOpen(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Layers className="w-8 h-8 opacity-80" />
                <div>
                  <p className="text-2xl font-bold">{stats.totalDecks}</p>
                  <p className="text-sm opacity-80">Total Decks</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Brain className="w-8 h-8 opacity-80" />
                <div>
                  <p className="text-2xl font-bold">{stats.cardsMastered}</p>
                  <p className="text-sm opacity-80">Mastered</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-orange-500 to-red-500 text-white">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Clock className="w-8 h-8 opacity-80" />
                <div>
                  <p className="text-2xl font-bold">{stats.cardsDue}</p>
                  <p className="text-sm opacity-80">Due Today</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-blue-500 to-cyan-500 text-white">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Target className="w-8 h-8 opacity-80" />
                <div>
                  <p className="text-2xl font-bold">{stats.overallAccuracy}%</p>
                  <p className="text-sm opacity-80">Accuracy</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">My Flashcard Decks</h2>
          <p className="text-gray-600 dark:text-gray-400">
            {decks?.length || 0} decks • {stats?.totalCards || 0} total cards
          </p>
        </div>
        <Button onClick={onCreateDeck} className="bg-gradient-to-r from-indigo-600 to-purple-600">
          <Plus className="w-4 h-4 mr-2" />
          Create Deck
        </Button>
      </div>

      {/* Deck Grid */}
      {decks && decks.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {decks.map((deck) => {
            const masteryPercentage = deck.progress 
              ? Math.round((deck.progress.mastered / Math.max(1, deck.progress.total)) * 100)
              : 0;
            
            return (
              <Card 
                key={deck.id} 
                className="group hover:shadow-lg transition-all cursor-pointer border-2 hover:border-indigo-300 dark:hover:border-indigo-600"
              >
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div 
                      className="w-12 h-12 rounded-xl flex items-center justify-center text-white text-xl"
                      style={{ backgroundColor: deck.color || '#6366f1' }}
                    >
                      <BookOpen className="w-6 h-6" />
                    </div>
                    
                    <div className="relative">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => {
                          e.stopPropagation();
                          setMenuOpen(menuOpen === deck.id ? null : deck.id);
                        }}
                      >
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                      
                      {menuOpen === deck.id && (
                        <div className="absolute right-0 top-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-10 min-w-[120px]">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onEditDeck(deck);
                              setMenuOpen(null);
                            }}
                            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                          >
                            <Edit2 className="w-4 h-4" />
                            Edit
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(deck.id);
                            }}
                            className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
                          >
                            <Trash2 className="w-4 h-4" />
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                    {deck.title}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-3 line-clamp-2">
                    {deck.description || 'No description'}
                  </p>

                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                      {deck.cardCount} cards
                    </span>
                    {deck.progress?.due && deck.progress.due > 0 && (
                      <span className="text-xs px-2 py-1 rounded-full bg-orange-100 text-orange-600">
                        {deck.progress.due} due
                      </span>
                    )}
                    <span className={`text-xs px-2 py-1 rounded-full ${getMasteryColor(masteryPercentage)}`}>
                      {masteryPercentage}% mastered
                    </span>
                  </div>

                  <Progress value={masteryPercentage} className="h-1.5 mb-4" />

                  <Button 
                    onClick={() => onSelectDeck(deck.id)}
                    className="w-full bg-gradient-to-r from-indigo-600 to-purple-600"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Study Now
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="border-2 border-dashed">
          <CardContent className="p-12 text-center">
            <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              No flashcard decks yet
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              Create your first deck to start studying with spaced repetition
            </p>
            <Button onClick={onCreateDeck}>
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Deck
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default FlashcardDeckList;
