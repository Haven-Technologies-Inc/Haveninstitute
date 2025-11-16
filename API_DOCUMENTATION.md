# Haven Institute API Documentation

## Overview

This document provides comprehensive documentation for the Haven Institute nursing education platform APIs. The platform is built with React/TypeScript frontend and Supabase backend, providing a complete learning management system for NCLEX preparation.

## Table of Contents

- [Architecture](#architecture)
- [Authentication](#authentication)
- [Question Bank API](#question-bank-api)
- [Quiz Session API](#quiz-session-api)
- [Flashcard API](#flashcard-api)
- [Book Progress API](#book-progress-api)
- [AI Chat API](#ai-chat-api)
- [Analytics API](#analytics-api)
- [Stripe Webhooks](#stripe-webhooks)

---

## Architecture

### Tech Stack
- **Frontend**: React 18.3.1, TypeScript, Vite
- **Backend**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Payments**: Stripe
- **Storage**: Supabase Storage
- **UI**: Radix UI, TailwindCSS

### Database Schema
See `src/lib/database-schema.sql` and `src/lib/database-schema-questions.sql` for complete schema definitions.

---

## Authentication

All API calls require authentication via Supabase Auth. The user's authentication token is automatically included in requests.

```typescript
import { supabase } from './lib/supabase';

// Get current user
const { data: { user } } = await supabase.auth.getUser();

// Sign in
await supabase.auth.signInWithPassword({ email, password });

// Sign out
await supabase.auth.signOut();
```

---

## Question Bank API

Located in: `src/services/questionApi.ts`

### Create Question

```typescript
import { questionApi } from './services/questionApi';

const question = await questionApi.createQuestion({
  question: "What is the normal adult blood pressure?",
  options: ["<140/90", "<130/85", "<120/80", "<110/70"],
  correctAnswer: 2,
  explanation: "Normal BP is <120/80 mmHg",
  rationales: ["Incorrect...", "Incorrect...", "Correct!", "Incorrect..."],
  category: "Vital Signs",
  difficulty: "easy",
  discrimination: 0.6,
  tags: ["NCLEX", "Fundamentals"]
}, userId);
```

### Get Questions

```typescript
// Get all questions with filters
const { questions, total } = await questionApi.getQuestions({
  category: "Pharmacology",
  difficulty: "medium",
  tags: ["NCLEX"],
  isActive: true
}, limit, offset);

// Get random questions
const randomQuestions = await questionApi.getRandomQuestions(
  10, // count
  "Pharmacology", // category
  "medium" // difficulty
);

// Get CAT questions (adaptive)
const catQuestions = await questionApi.getCATQuestions(
  0.5, // ability estimate
  10, // count
  "Pharmacology"
);
```

### Update & Delete

```typescript
// Update question
await questionApi.updateQuestion(questionId, {
  difficulty: "hard",
  isActive: true
});

// Soft delete (deactivate)
await questionApi.deactivateQuestion(questionId);

// Hard delete
await questionApi.deleteQuestion(questionId);
```

### Analytics

```typescript
// Get question statistics
const stats = await questionApi.getQuestionStats(questionId);

// Get difficult questions (low success rate)
const difficultQuestions = await questionApi.getDifficultQuestions("Pharmacology", 20);
```

---

## Quiz Session API

Located in: `src/services/quizSessionApi.ts`

### Create Session

```typescript
import { quizSessionApi } from './services/quizSessionApi';

// Create regular quiz session
const session = await quizSessionApi.createQuizSession({
  userId,
  quizId: "quiz-123",
  sessionType: "quiz",
  questionIds: ["q1", "q2", "q3"],
  totalQuestions: 3,
  timeLimit: 3600, // seconds
  passingScore: 70
});

// Create CAT session
const catSession = await quizSessionApi.createCATSession(
  userId,
  ["q1", "q2", "q3"],
  { adaptiveDifficulty: true }
);
```

### Manage Session

```typescript
// Submit an answer
await quizSessionApi.submitAnswer(
  sessionId,
  questionId,
  selectedAnswer,
  timeSpent
);

// Complete session
await quizSessionApi.completeSession(sessionId);

// Pause/Resume
await quizSessionApi.pauseSession(sessionId);
await quizSessionApi.resumeSession(sessionId);

// Update CAT ability estimate
await quizSessionApi.updateCATAbility(
  sessionId,
  abilityEstimate,
  confidenceLevel
);
```

### Get Sessions

```typescript
// Get active session
const activeSession = await quizSessionApi.getActiveSession(userId);

// Get user's sessions
const sessions = await quizSessionApi.getUserSessions(
  userId,
  "completed", // status filter
  "quiz", // type filter
  10 // limit
);

// Get statistics
const stats = await quizSessionApi.getUserSessionStats(userId);
// Returns: { totalSessions, averageScore, passRate, totalTimeSpent, sessionsByType }
```

---

## Flashcard API

Located in: `src/services/flashcardProgressApi.ts`

### Spaced Repetition

```typescript
import { flashcardProgressApi } from './services/flashcardProgressApi';
import type { RecallQuality } from './services/spacedRepetition';

// Record a review (uses SM2 algorithm)
const updatedProgress = await flashcardProgressApi.recordReview(
  userId,
  flashcardId,
  4 as RecallQuality, // 0-5 scale
  30 // time spent in seconds
);
```

### Get Due Cards

```typescript
// Get cards due for review
const dueCards = await flashcardProgressApi.getDueFlashcards(userId, 20);

// Get new cards (not yet studied)
const newCards = await flashcardProgressApi.getNewFlashcards(userId, 20);

// Get cards by category
const categoryCards = await flashcardProgressApi.getFlashcardsByCategory(
  userId,
  "Pharmacology"
);
```

### Study Statistics

```typescript
// Get comprehensive study stats
const stats = await flashcardProgressApi.getStudyStats(userId);
// Returns: {
//   totalCards, newCards, learningCards, masteredCards,
//   dueCards, averageConfidence, totalAttempts, accuracy, masteryRate
// }

// Get review forecast
const forecast = await flashcardProgressApi.getReviewForecast(userId, 7);
// Returns array of { date, count } for next 7 days
```

### Progress Management

```typescript
// Initialize progress for flashcards
await flashcardProgressApi.initializeMultipleFlashcards(
  userId,
  ["fc1", "fc2", "fc3"]
);

// Reset progress
await flashcardProgressApi.resetFlashcardProgress(userId, flashcardId);

// Mark as mastered
await flashcardProgressApi.markAsMastered(userId, flashcardId);
```

---

## Book Progress API

Located in: `src/services/bookProgressApi.ts`

### Reading Progress

```typescript
import { bookProgressApi } from './services/bookProgressApi';

// Update reading progress
await bookProgressApi.updateReadingProgress(
  userId,
  bookId,
  5, // current chapter
  120, // current page
  45.5, // progress percentage
  30 // time spent (minutes)
);

// Mark book as completed
await bookProgressApi.markBookCompleted(userId, bookId);

// Get progress
const progress = await bookProgressApi.getReadingProgress(userId, bookId);
```

### Highlights

```typescript
// Create highlight
const highlight = await bookProgressApi.createHighlight(
  userId,
  bookId,
  5, // chapter
  "Important nursing concept...",
  "yellow", // color
  "Remember this for exam" // note (optional)
);

// Get highlights
const highlights = await bookProgressApi.getBookHighlights(
  userId,
  bookId,
  5 // chapter (optional)
);

// Update highlight
await bookProgressApi.updateHighlight(highlightId, userId, {
  color: "red",
  note: "Very important!"
});

// Delete highlight
await bookProgressApi.deleteHighlight(highlightId, userId);
```

### Bookmarks

```typescript
// Create bookmark
const bookmark = await bookProgressApi.createBookmark(
  userId,
  bookId,
  5, // chapter
  120, // page
  "Key concept on page 120"
);

// Get bookmarks
const bookmarks = await bookProgressApi.getBookBookmarks(userId, bookId);

// Delete bookmark
await bookProgressApi.deleteBookmark(bookmarkId, userId);
```

### Reading Statistics

```typescript
// Get reading stats
const stats = await bookProgressApi.getReadingStats(userId);
// Returns: {
//   totalBooks, completedBooks, inProgressBooks,
//   totalTimeSpent, averageProgress, completionRate,
//   recentReads, averageTimePerBook
// }

// Get reading streak
const streak = await bookProgressApi.getReadingStreak(userId);
```

---

## AI Chat API

Located in: `src/services/aiChatApi.ts`

### Chat Sessions

```typescript
import { aiChatApi } from './services/aiChatApi';

// Create chat session
const session = await aiChatApi.createChatSession(
  userId,
  "NCLEX Pharmacology Help",
  "Studying cardiovascular medications"
);

// Get all sessions
const sessions = aiChatApi.getChatSessions(userId);

// Get specific session
const session = aiChatApi.getChatSession(userId, sessionId);

// Delete session
aiChatApi.deleteChatSession(userId, sessionId);
```

### Messaging

```typescript
// Send message and get AI response
const response = await aiChatApi.sendMessage(
  userId,
  sessionId,
  "What are the key side effects of beta blockers?",
  {
    name: 'openai', // or 'anthropic', 'local'
    model: 'gpt-4',
    apiKey: 'your-api-key'
  }
);

// Add manual message
aiChatApi.addMessage(
  userId,
  sessionId,
  'assistant',
  "Beta blockers commonly cause..."
);
```

### Specialized Features

```typescript
// Get question explanation
const explanation = await aiChatApi.explainQuestion(
  userId,
  "What is the priority nursing intervention?",
  ["Option A", "Option B", "Option C", "Option D"],
  2, // correct answer index
  1 // user's answer index
);

// Get study tips
const tips = aiChatApi.getStudyTips("Pharmacology");
```

---

## Analytics API

Located in: `src/services/analyticsApi.ts`

### Dashboard Statistics

```typescript
import { analyticsApi } from './services/analyticsApi';

// Get comprehensive dashboard stats
const dashboardStats = await analyticsApi.getDashboardStats(userId);
// Returns: {
//   overview: { totalStudyTime, studyStreak, questionsAnswered, accuracy, rank },
//   quizzes: { totalAttempts, averageScore, passRate, recentScores },
//   flashcards: { totalCards, masteredCards, dueCards, accuracy },
//   reading: { booksStarted, booksCompleted, totalTimeSpent, currentStreak },
//   categoryPerformance: [...],
//   recentActivity: [...],
//   goals: { targetExamDate, dailyGoal, progress }
// }
```

### Category Analytics

```typescript
// Get detailed category analytics
const categoryStats = await analyticsApi.getCategoryAnalytics(
  userId,
  "Pharmacology"
);
// Returns: {
//   category, totalQuestions, correctAnswers, accuracy,
//   averageTimePerQuestion, difficultyBreakdown,
//   trend, weakTopics, strongTopics
// }

// Get performance by category
const performance = await analyticsApi.getCategoryPerformance(userId);
// Returns array of { category, questionsAnswered, accuracy, timeSpent }
```

### Performance Trends

```typescript
// Get performance trend over time
const trend = await analyticsApi.getPerformanceTrend(userId, 30);
// Returns array of { date, questionsAnswered, accuracy, averageScore, studyTime }

// Get recent activity
const activity = await analyticsApi.getRecentActivity(userId, 20);
// Returns array of { date, type, description, score }
```

---

## Stripe Webhooks

Located in: `src/services/stripeWebhook.ts`

### Webhook Handler

```typescript
import { handleStripeWebhook, verifyStripeSignature } from './services/stripeWebhook';

// In your webhook endpoint (Supabase Edge Function or Express route)
const signature = request.headers.get('stripe-signature');
const payload = await request.text();

// Verify signature
if (!verifyStripeSignature(payload, signature, webhookSecret)) {
  return new Response('Invalid signature', { status: 400 });
}

// Handle event
const event = JSON.parse(payload);
await handleStripeWebhook(event);
```

### Supported Events

The webhook handler automatically processes:

**Subscription Events:**
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`

**Payment Events:**
- `invoice.payment_succeeded`
- `invoice.payment_failed`
- `invoice.finalized`

**Checkout Events:**
- `checkout.session.completed`
- `checkout.session.expired`

**Payment Intent Events:**
- `payment_intent.succeeded`
- `payment_intent.payment_failed`

---

## Seeding Data

Located in: `src/scripts/seedQuestions.ts`

### Seed CAT Questions

```typescript
import { seedCATQuestions, printSeedingStats } from './scripts/seedQuestions';

// Print statistics about CAT questions
printSeedingStats();

// Seed all CAT questions
await seedCATQuestions(userId);

// Seed specific category
await seedQuestionsByCategory("Pharmacology", userId);
```

### CLI Usage

```bash
# Seed all questions
ts-node src/scripts/seedQuestions.ts seed <userId>

# Seed specific category
ts-node src/scripts/seedQuestions.ts seed-category <userId> "Pharmacology"

# Show statistics
ts-node src/scripts/seedQuestions.ts stats

# Clear all CAT questions (WARNING: destructive)
ts-node src/scripts/seedQuestions.ts clear
```

---

## Error Handling

All API functions follow this error handling pattern:

```typescript
try {
  const { data, error } = await supabase
    .from('table')
    .select('*');

  if (error) throw error;

  return data;
} catch (error) {
  console.error('Error description:', error);
  // Return fallback value or throw
  return null; // or throw new Error('Failed to...')
}
```

---

## Row-Level Security (RLS)

All tables have RLS policies enabled. Examples:

```sql
-- Users can only view their own data
CREATE POLICY "Users can view their own data"
ON public.users FOR SELECT
USING (auth.uid() = id);

-- Users can manage their own flashcard progress
CREATE POLICY "Users can manage their own flashcard progress"
ON public.flashcard_progress FOR ALL
USING (auth.uid() = user_id);
```

---

## Best Practices

### 1. Type Safety
Always use TypeScript interfaces from `src/lib/types.ts`:

```typescript
import type { Question, QuizSession, FlashcardProgress } from './lib/types';
```

### 2. Error Handling
Always handle errors gracefully:

```typescript
const result = await questionApi.getQuestionById(id);
if (!result) {
  // Handle error case
  console.error('Question not found');
  return;
}
```

### 3. Authentication
Always pass userId from authenticated session:

```typescript
const { data: { user } } = await supabase.auth.getUser();
if (!user) {
  throw new Error('User not authenticated');
}

// Use user.id for all API calls
await questionApi.createQuestion(input, user.id);
```

### 4. Pagination
Use pagination for large datasets:

```typescript
const { questions, total } = await questionApi.getQuestions(
  filters,
  50, // limit
  0   // offset
);
```

---

## Environment Variables

Required environment variables (`.env`):

```bash
# Supabase
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Stripe (for webhooks)
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_webhook_secret

# AI Providers (optional)
OPENAI_API_KEY=your_openai_key
ANTHROPIC_API_KEY=your_anthropic_key
```

---

## Testing

```typescript
// Example test for questionApi
describe('Question API', () => {
  it('should create a question', async () => {
    const question = await questionApi.createQuestion(testInput, testUserId);
    expect(question).toBeDefined();
    expect(question.category).toBe(testInput.category);
  });
});
```

---

## Support & Contributing

For issues or questions:
1. Check existing documentation
2. Review database schema
3. Check RLS policies
4. Review error logs in Supabase dashboard
5. Contact development team

---

## License

Copyright © 2024 Haven Institute. All rights reserved.
