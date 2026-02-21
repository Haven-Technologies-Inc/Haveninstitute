'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { PageHeader, StatCard, EmptyState, CardSkeleton } from '@/components/shared';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Layers,
  Plus,
  Search,
  Play,
  Pencil,
  CheckCircle2,
  Clock,
  Flame,
  CalendarDays,
  Users,
  Download,
  BookOpen,
  Brain,
  ArrowRight,
} from 'lucide-react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface FlashcardDeck {
  id: string;
  name: string;
  description?: string;
  category: string;
  totalCards: number;
  masteredCards: number;
  lastStudied: string | null;
  isPublic: boolean;
  gradient: string;
}

interface BrowseDeck {
  id: string;
  name: string;
  description?: string;
  category: string;
  totalCards: number;
  author: string;
  subscribers: number;
  isPublic: boolean;
  gradient: string;
}

// ---------------------------------------------------------------------------
// Gradient helper
// ---------------------------------------------------------------------------

const GRADIENTS = [
  'from-pink-500 to-rose-600',
  'from-blue-500 to-indigo-600',
  'from-purple-500 to-violet-600',
  'from-emerald-500 to-teal-600',
  'from-red-500 to-orange-600',
  'from-amber-500 to-yellow-600',
  'from-indigo-500 to-blue-600',
  'from-orange-500 to-amber-600',
  'from-cyan-500 to-blue-600',
  'from-lime-500 to-emerald-600',
  'from-rose-500 to-pink-600',
  'from-violet-500 to-purple-600',
  'from-slate-500 to-zinc-600',
  'from-fuchsia-500 to-pink-600',
];

function getGradient(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  return GRADIENTS[Math.abs(hash) % GRADIENTS.length];
}

function formatLastStudied(dateStr: string | null): string {
  if (!dateStr) return 'Never';
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);

  if (diffMin < 1) return 'Just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  if (diffDay === 1) return 'Yesterday';
  if (diffDay < 7) return `${diffDay} days ago`;
  return `${Math.floor(diffDay / 7)} week${Math.floor(diffDay / 7) > 1 ? 's' : ''} ago`;
}

const NCLEX_CATEGORIES = [
  'Pharmacological Therapies',
  'Reduction of Risk Potential',
  'Health Promotion',
  'Psychosocial Integrity',
  'Physiological Adaptation',
  'Safety & Infection Control',
  'Management of Care',
  'Basic Care & Comfort',
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function FlashcardsPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newDeckName, setNewDeckName] = useState('');
  const [newDeckDescription, setNewDeckDescription] = useState('');
  const [newDeckCategory, setNewDeckCategory] = useState('');
  const [newDeckIsPublic, setNewDeckIsPublic] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  // Data state
  const [myDecks, setMyDecks] = useState<FlashcardDeck[]>([]);
  const [browseDecks, setBrowseDecks] = useState<BrowseDeck[]>([]);
  const [loadingMyDecks, setLoadingMyDecks] = useState(true);
  const [loadingBrowse, setLoadingBrowse] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch my decks
  const fetchMyDecks = useCallback(async () => {
    try {
      setLoadingMyDecks(true);
      const res = await fetch('/api/flashcards');
      const json = await res.json();
      if (json.success && json.data) {
        const decks = (Array.isArray(json.data) ? json.data : json.data.decks ?? json.data.items ?? []).map(
          (d: any) => ({
            ...d,
            gradient: d.gradient || getGradient(d.id),
          })
        );
        setMyDecks(decks);
      }
    } catch (err) {
      console.error('Failed to fetch my decks:', err);
      setError('Failed to load your decks.');
    } finally {
      setLoadingMyDecks(false);
    }
  }, []);

  // Fetch browse decks
  const fetchBrowseDecks = useCallback(async () => {
    try {
      setLoadingBrowse(true);
      const res = await fetch('/api/flashcards?browse=true');
      const json = await res.json();
      if (json.success && json.data) {
        const decks = (Array.isArray(json.data) ? json.data : json.data.decks ?? json.data.items ?? []).map(
          (d: any) => ({
            ...d,
            gradient: d.gradient || getGradient(d.id),
          })
        );
        setBrowseDecks(decks);
      }
    } catch (err) {
      console.error('Failed to fetch browse decks:', err);
    } finally {
      setLoadingBrowse(false);
    }
  }, []);

  useEffect(() => {
    fetchMyDecks();
    fetchBrowseDecks();
  }, [fetchMyDecks, fetchBrowseDecks]);

  // Derived stats
  const totalCards = myDecks.reduce((sum, d) => sum + (d.totalCards || 0), 0);
  const totalMastered = myDecks.reduce((sum, d) => sum + (d.masteredCards || 0), 0);
  const masteredPercent = totalCards > 0 ? Math.round((totalMastered / totalCards) * 100) : 0;

  // Filtered decks
  const categories = useMemo(
    () => [...new Set(myDecks.map((d) => d.category).filter(Boolean))],
    [myDecks],
  );

  const filteredDecks = useMemo(
    () =>
      myDecks.filter((deck) => {
        const matchesSearch = deck.name
          .toLowerCase()
          .includes(searchQuery.toLowerCase());
        const matchesCategory =
          categoryFilter === 'all' || deck.category === categoryFilter;
        return matchesSearch && matchesCategory;
      }),
    [myDecks, searchQuery, categoryFilter],
  );

  const filteredBrowse = useMemo(
    () =>
      browseDecks.filter((deck) =>
        deck.name.toLowerCase().includes(searchQuery.toLowerCase()),
      ),
    [browseDecks, searchQuery],
  );

  async function handleCreateDeck() {
    if (!newDeckName.trim() || !newDeckCategory) return;
    setIsCreating(true);
    try {
      const res = await fetch('/api/flashcards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newDeckName.trim(),
          description: newDeckDescription.trim(),
          category: newDeckCategory,
          isPublic: newDeckIsPublic,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setCreateDialogOpen(false);
        setNewDeckName('');
        setNewDeckDescription('');
        setNewDeckCategory('');
        setNewDeckIsPublic(false);
        // Refresh decks
        fetchMyDecks();
      } else {
        console.error('Create deck failed:', json);
      }
    } catch (err) {
      console.error('Failed to create deck:', err);
    } finally {
      setIsCreating(false);
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <PageHeader
        title="Flashcards"
        description="Review and master key nursing concepts with spaced repetition"
      >
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Deck
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Deck</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label htmlFor="deck-name">Deck Name</Label>
                <Input
                  id="deck-name"
                  placeholder="e.g. Respiratory Disorders"
                  value={newDeckName}
                  onChange={(e) => setNewDeckName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="deck-description">Description</Label>
                <Input
                  id="deck-description"
                  placeholder="Brief description of this deck"
                  value={newDeckDescription}
                  onChange={(e) => setNewDeckDescription(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="deck-category">Category</Label>
                <Select value={newDeckCategory} onValueChange={setNewDeckCategory}>
                  <SelectTrigger id="deck-category">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {NCLEX_CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="deck-public"
                  checked={newDeckIsPublic}
                  onChange={(e) => setNewDeckIsPublic(e.target.checked)}
                  className="rounded border-gray-300"
                />
                <Label htmlFor="deck-public" className="text-sm font-normal">
                  Make this deck public
                </Label>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button
                  variant="outline"
                  onClick={() => setCreateDialogOpen(false)}
                  disabled={isCreating}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateDeck}
                  disabled={!newDeckName.trim() || !newDeckCategory || isCreating}
                >
                  {isCreating ? (
                    <>
                      <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      Creating...
                    </>
                  ) : (
                    'Create Deck'
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </PageHeader>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Cards"
          value={totalCards}
          icon={Layers}
          iconColor="text-indigo-500"
          change={`${myDecks.length} decks`}
        />
        <StatCard
          label="Due Today"
          value="-"
          icon={CalendarDays}
          iconColor="text-amber-500"
          change="Spaced repetition"
        />
        <StatCard
          label="Mastered"
          value={totalMastered}
          icon={CheckCircle2}
          iconColor="text-emerald-500"
          change={`${masteredPercent}% of total`}
        />
        <StatCard
          label="Decks"
          value={myDecks.length}
          icon={Flame}
          iconColor="text-orange-500"
          change="Keep studying!"
        />
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search flashcard decks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full sm:w-[240px]">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Tabs: My Decks / Browse */}
      <Tabs defaultValue="my-decks" className="space-y-6">
        <TabsList>
          <TabsTrigger value="my-decks">
            <Layers className="h-4 w-4 mr-2" />
            My Decks
          </TabsTrigger>
          <TabsTrigger value="browse">
            <BookOpen className="h-4 w-4 mr-2" />
            Browse
          </TabsTrigger>
        </TabsList>

        {/* ---- My Decks Tab ---- */}
        <TabsContent value="my-decks">
          {loadingMyDecks ? (
            <CardSkeleton count={6} />
          ) : error ? (
            <EmptyState
              icon={Layers}
              title="Error loading decks"
              description={error}
            >
              <Button onClick={fetchMyDecks}>Try Again</Button>
            </EmptyState>
          ) : filteredDecks.length === 0 ? (
            <EmptyState
              icon={Layers}
              title="No decks found"
              description={
                searchQuery || categoryFilter !== 'all'
                  ? 'Try adjusting your search or filter to find your decks.'
                  : 'Create your first flashcard deck to start studying.'
              }
            >
              {!searchQuery && categoryFilter === 'all' && (
                <Button onClick={() => setCreateDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Deck
                </Button>
              )}
            </EmptyState>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredDecks.map((deck) => {
                const progress =
                  deck.totalCards > 0
                    ? Math.round((deck.masteredCards / deck.totalCards) * 100)
                    : 0;
                return (
                  <Card
                    key={deck.id}
                    className="group relative overflow-hidden border-0 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5"
                  >
                    {/* Top gradient strip */}
                    <div
                      className={cn(
                        'h-1.5 bg-gradient-to-r',
                        deck.gradient,
                      )}
                    />
                    <CardContent className="p-5 space-y-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-base truncate">
                            {deck.name}
                          </h3>
                          <Badge
                            variant="secondary"
                            className="text-[10px] mt-1"
                          >
                            {deck.category}
                          </Badge>
                        </div>
                        <div
                          className={cn(
                            'h-10 w-10 rounded-xl bg-gradient-to-br flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-110',
                            deck.gradient,
                          )}
                        >
                          <Layers className="h-5 w-5 text-white" />
                        </div>
                      </div>

                      {/* Progress */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">
                            Mastered
                          </span>
                          <span className="font-medium">
                            {deck.masteredCards}/{deck.totalCards}
                          </span>
                        </div>
                        <Progress value={progress} className="h-2" />
                      </div>

                      {/* Footer */}
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatLastStudied(deck.lastStudied)}
                        </span>
                        <div className="flex items-center gap-1">
                          <Button size="sm" variant="ghost" className="text-xs h-8 px-2">
                            <Pencil className="h-3 w-3 mr-1" />
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            className="text-xs h-8"
                            onClick={() => router.push(`/study/flashcards/${deck.id}`)}
                          >
                            <Play className="h-3 w-3 mr-1" />
                            Study
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}

              {/* Create New Deck Card */}
              <Card
                className="border-2 border-dashed border-muted-foreground/20 hover:border-primary/40 transition-colors cursor-pointer h-full min-h-[200px] flex items-center justify-center bg-transparent"
                onClick={() => setCreateDialogOpen(true)}
              >
                <CardContent className="p-5 text-center">
                  <div className="h-12 w-12 rounded-xl bg-muted flex items-center justify-center mx-auto mb-3">
                    <Plus className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <p className="font-medium text-sm">Create New Deck</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Build custom flashcard decks
                  </p>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        {/* ---- Browse Tab ---- */}
        <TabsContent value="browse">
          {loadingBrowse ? (
            <CardSkeleton count={6} />
          ) : filteredBrowse.length === 0 ? (
            <EmptyState
              icon={BookOpen}
              title="No community decks found"
              description="Try adjusting your search query to discover more decks."
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredBrowse.map((deck) => (
                <Card
                  key={deck.id}
                  className="group overflow-hidden border-0 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5"
                >
                  <div
                    className={cn(
                      'h-1.5 bg-gradient-to-r',
                      deck.gradient,
                    )}
                  />
                  <CardContent className="p-5 space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-base truncate">
                          {deck.name}
                        </h3>
                        <p className="text-xs text-muted-foreground mt-1">
                          by {deck.author || 'Community'}
                        </p>
                      </div>
                      <div
                        className={cn(
                          'h-10 w-10 rounded-xl bg-gradient-to-br flex items-center justify-center shrink-0',
                          deck.gradient,
                        )}
                      >
                        <Brain className="h-5 w-5 text-white" />
                      </div>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Layers className="h-3 w-3" />
                        {deck.totalCards} cards
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {(deck.subscribers || 0).toLocaleString()} users
                      </span>
                    </div>

                    <Badge variant="secondary" className="text-[10px]">
                      {deck.category}
                    </Badge>

                    <Button variant="outline" size="sm" className="w-full text-xs">
                      <Download className="h-3 w-3 mr-1.5" />
                      Subscribe
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
