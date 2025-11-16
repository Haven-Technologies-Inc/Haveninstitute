# 🚀 NurseHaven API - Quick Reference Card

Copy-paste ready code snippets for all endpoints.

---

## 📦 Import

```typescript
import api from './lib/api-endpoints';
import { useAuth } from './components/auth/AuthContext';
```

---

## 💳 SUBSCRIPTION

```typescript
// Get current subscription
const sub = await api.subscription.getCurrentSubscription(userId);

// Create subscription
const sub = await api.subscription.createSubscription(userId, 'pro', 'monthly');

// Cancel subscription
await api.subscription.cancelSubscription(subId);

// Get payments
const payments = await api.subscription.getPaymentHistory(userId);

// Change plan
await api.subscription.changeSubscriptionPlan(subId, 'premium');
```

---

## 👥 STUDY GROUPS

```typescript
// Browse groups
const allGroups = await api.groups.getAllGroups();

// My groups
const myGroups = await api.groups.getUserGroups(userId);

// Create group
const group = await api.groups.createGroup(userId, {
  name: 'NCLEX Warriors',
  description: 'Daily study',
  category: 'General Study',
  tags: ['NCLEX-RN']
});

// Join/Leave
await api.groups.joinGroup(userId, groupId);
await api.groups.leaveGroup(userId, groupId);

// Chat
await api.groups.sendMessage(groupId, userId, userName, 'Hello!');
const messages = await api.groups.getGroupMessages(groupId);

// Sessions
const session = await api.groups.scheduleSession({
  groupId,
  title: 'Pharm Review',
  scheduledAt: new Date('2024-03-20T14:00'),
  duration: 90,
  hostId: userId,
  hostName: userName
});
const sessions = await api.groups.getGroupSessions(groupId);

// Members
const members = await api.groups.getGroupMembers(groupId);
```

---

## 📚 BOOKS

```typescript
// Get books
const books = await api.books.getAllBooks();
const book = await api.books.getBookById(bookId);

// Reading progress
const progress = await api.books.getReadingProgress(userId, bookId);
await api.books.updateReadingProgress(userId, bookId, {
  currentChapter: 5,
  currentPage: 120,
  progress: 45
});

// Reading list
const list = await api.books.getUserReadingList(userId);

// Highlights
const highlight = await api.books.addHighlight({
  userId,
  bookId,
  chapter: 3,
  text: 'Important text',
  color: 'yellow',
  note: 'Review this'
});
const highlights = await api.books.getHighlights(userId, bookId);
await api.books.deleteHighlight(highlightId);

// Bookmarks
const bookmark = await api.books.addBookmark({
  userId,
  bookId,
  chapter: 5,
  page: 142,
  title: 'Med calculations'
});
const bookmarks = await api.books.getBookmarks(userId, bookId);
await api.books.deleteBookmark(bookmarkId);
```

---

## 🎴 FLASHCARDS

```typescript
// Get cards
const cards = await api.flashcards.getAllFlashcards();
const pharmCards = await api.flashcards.getAllFlashcards('Pharmacological Therapies');
const card = await api.flashcards.getFlashcardById(cardId);

// Create/Edit/Delete
const card = await api.flashcards.createFlashcard(userId, {
  question: 'What is digoxin range?',
  answer: '0.5 to 2.0 ng/mL',
  category: 'Pharmacological Therapies',
  difficulty: 'medium'
});
await api.flashcards.updateFlashcard(cardId, { answer: 'Updated' });
await api.flashcards.deleteFlashcard(cardId);

// Sets
const sets = await api.flashcards.getFlashcardSets(userId);
const set = await api.flashcards.createFlashcardSet(userId, {
  name: 'Cardiac Meds',
  category: 'Pharmacological Therapies'
});

// Progress (Spaced Repetition)
await api.flashcards.updateFlashcardProgress(userId, cardId, true);
const dueCards = await api.flashcards.getDueFlashcards(userId);
```

---

## 📝 QUIZZES

```typescript
// Get quizzes
const quizzes = await api.quizzes.getAllQuizzes();
const pharmQuizzes = await api.quizzes.getAllQuizzes('Pharmacological Therapies');
const quiz = await api.quizzes.getQuizById(quizId);

// Questions
const questions = await api.quizzes.getQuizQuestions(quizId);

// Submit attempt
const attempt = await api.quizzes.submitQuizAttempt({
  userId,
  quizId,
  score: 18,
  totalQuestions: 20,
  percentage: 90,
  timeSpent: 1200,
  answers: [
    { questionId: 'q1', selectedAnswer: 2, correct: true },
    { questionId: 'q2', selectedAnswer: 1, correct: false }
  ]
});

// History & Stats
const attempts = await api.quizzes.getUserQuizAttempts(userId);
const results = await api.quizzes.getQuizResults(userId);
const stats = await api.quizzes.getQuizStatistics(userId);

// Create quiz
const quiz = await api.quizzes.createQuiz(userId, {
  title: 'Cardiac Meds Review',
  category: 'Pharmacological Therapies',
  difficulty: 'medium',
  timeLimit: 30,
  passingScore: 75
});

// Add question
await api.quizzes.addQuestionToQuiz(quizId, {
  question: 'What is warfarin antidote?',
  options: ['Protamine', 'Vitamin K', 'Charcoal', 'NAC'],
  correctAnswer: 1,
  explanation: 'Vitamin K reverses warfarin',
  category: 'Pharmacological Therapies',
  difficulty: 'medium'
});
```

---

## 📅 STUDY PLANNER (with Goals)

```typescript
// Sessions
const sessions = await api.planner.getUserSessions(userId);
const session = await api.planner.createSession(userId, {
  title: 'Pharm Study',
  category: 'Pharmacological Therapies',
  date: new Date('2024-03-20'),
  startTime: '14:00',
  endTime: '16:00',
  duration: 120,
  topics: ['Beta blockers'],
  priority: 'high'
});
await api.planner.updateSession(sessionId, { completed: true });
await api.planner.deleteSession(sessionId);

// Tasks
const tasks = await api.planner.getUserTasks(userId);
const task = await api.planner.createTask(userId, {
  title: 'Review cardiac meds',
  category: 'Pharmacological Therapies',
  dueDate: new Date('2024-03-25'),
  priority: 'high',
  estimatedTime: 60
});
await api.planner.updateTask(taskId, { completed: true });
await api.planner.deleteTask(taskId);

// Goals
const goals = await api.planner.getUserGoals(userId);
const goal = await api.planner.createGoal(userId, {
  title: 'Master Pharmacology',
  targetDate: new Date('2024-06-01'),
  targetProgress: 100,
  category: 'Pharmacological Therapies',
  milestones: [
    {
      id: 'ms1',
      title: 'Complete cardiovascular',
      completed: false,
      dueDate: new Date('2024-04-01')
    }
  ]
});
await api.planner.updateGoal(goalId, { currentProgress: 50 });
await api.planner.deleteGoal(goalId);

// Statistics & Streaks
const stats = await api.planner.getStudyStatistics(userId);
console.log(`Streak: ${stats.currentStreak} days 🔥`);
```

---

## 🎯 REACT COMPONENT EXAMPLE

```typescript
import { useEffect, useState } from 'react';
import api from './lib/api-endpoints';
import { useAuth } from './components/auth/AuthContext';

function MyComponent() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load multiple things at once
      const [subscription, groups, books, cards, quizzes] = await Promise.all([
        api.subscription.getCurrentSubscription(user.id),
        api.groups.getUserGroups(user.id),
        api.books.getUserReadingList(user.id),
        api.flashcards.getDueFlashcards(user.id),
        api.quizzes.getUserQuizAttempts(user.id)
      ]);

      setData({ subscription, groups, books, cards, quizzes });
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!data) return <div>No data</div>;

  return (
    <div>
      <h1>Dashboard</h1>
      <p>Plan: {data.subscription?.plan}</p>
      <p>Groups: {data.groups.length}</p>
      <p>Books: {data.books.length}</p>
      <p>Due Cards: {data.cards.length}</p>
      <p>Quiz Attempts: {data.quizzes.length}</p>
    </div>
  );
}
```

---

## 🔐 ERROR HANDLING

```typescript
try {
  const result = await api.subscription.getCurrentSubscription(userId);
  if (result) {
    console.log('Success:', result);
  } else {
    console.log('No subscription found');
  }
} catch (error) {
  console.error('API Error:', error);
  // Show user-friendly error message
  alert('Failed to load subscription. Please try again.');
}
```

---

## 🎨 NCLEX CATEGORIES

```typescript
const NCLEX_CATEGORIES = [
  'Management of Care',
  'Safety and Infection Control',
  'Health Promotion and Maintenance',
  'Psychosocial Integrity',
  'Basic Care and Comfort',
  'Pharmacological Therapies',
  'Reduction of Risk Potential',
  'Physiological Adaptation'
];

// Use in dropdowns, filters, etc.
```

---

## 💾 LOCAL STORAGE CACHING

```typescript
// Cache frequently accessed data
const getCachedBooks = async () => {
  const cached = localStorage.getItem('books');
  if (cached) {
    return JSON.parse(cached);
  }
  
  const books = await api.books.getAllBooks();
  localStorage.setItem('books', JSON.stringify(books));
  return books;
};
```

---

## 🔄 LOADING STATES

```typescript
function MyComponent() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await api.books.getAllBooks();
      setData(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {loading && <p>Loading...</p>}
      {error && <p className="text-red-600">{error}</p>}
      {data && <BookList books={data} />}
    </>
  );
}
```

---

## 📊 BATCH OPERATIONS

```typescript
// Create multiple flashcards at once
const cards = [
  { question: 'Q1', answer: 'A1', category: 'Pharm' },
  { question: 'Q2', answer: 'A2', category: 'Pharm' },
  { question: 'Q3', answer: 'A3', category: 'Pharm' }
];

const results = await Promise.all(
  cards.map(card => api.flashcards.createFlashcard(userId, card))
);

console.log(`Created ${results.length} flashcards`);
```

---

## 🎯 COMMON PATTERNS

### Load data on mount
```typescript
useEffect(() => {
  if (user) loadData();
}, [user]);
```

### Refresh data after action
```typescript
const handleJoinGroup = async (groupId) => {
  await api.groups.joinGroup(user.id, groupId);
  loadGroups(); // Refresh list
};
```

### Optimistic updates
```typescript
const handleComplete = async (taskId) => {
  // Update UI immediately
  setTasks(tasks.map(t => 
    t.id === taskId ? { ...t, completed: true } : t
  ));
  
  // Then update server
  try {
    await api.tasks.updateTask(taskId, { completed: true });
  } catch (error) {
    // Revert on error
    loadTasks();
  }
};
```

---

## 📱 PAGINATION

```typescript
const [page, setPage] = useState(0);
const pageSize = 20;

const loadPage = async () => {
  const { data } = await supabase
    .from('flashcards')
    .select('*')
    .range(page * pageSize, (page + 1) * pageSize - 1);
  
  setCards(data);
};
```

---

## 🔍 SEARCH & FILTER

```typescript
// Client-side filtering
const filtered = books.filter(book =>
  book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
  book.category === selectedCategory
);

// Server-side filtering
const { data } = await supabase
  .from('books')
  .select('*')
  .ilike('title', `%${searchTerm}%`)
  .eq('category', selectedCategory);
```

---

## ⚡ QUICK TIPS

1. **Always check user is authenticated**
   ```typescript
   if (!user) return null;
   ```

2. **Handle loading states**
   ```typescript
   if (loading) return <Spinner />;
   ```

3. **Show friendly errors**
   ```typescript
   catch (error) {
     toast.error('Something went wrong');
   }
   ```

4. **Use TypeScript types**
   ```typescript
   import { Book, Flashcard } from './lib/api-endpoints';
   ```

5. **Cache when possible**
   ```typescript
   const [books, setBooks] = useState<Book[]>([]);
   if (books.length === 0) loadBooks();
   ```

---

## 📚 FILE LOCATIONS

- **API Code:** `/lib/api-endpoints.ts`
- **Database Schema:** `/lib/database-schema.sql`
- **Supabase Config:** `/lib/supabase.ts`
- **Full Docs:** `/API-DOCUMENTATION.md`
- **Setup Guide:** `/ENDPOINTS-SETUP-GUIDE.md`
- **Summary:** `/IMPLEMENTATION-SUMMARY.md`

---

## 🚀 SETUP IN 3 STEPS

1. **Install:** `npm install @supabase/supabase-js`
2. **Configure:** Add `.env` with Supabase credentials
3. **Use:** `import api from './lib/api-endpoints'`

---

**That's it! Copy any snippet and start using the API immediately! 🎉**
