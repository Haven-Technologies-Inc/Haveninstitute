# NurseHaven API Documentation

Complete API endpoint documentation for all features.

---

## Table of Contents

1. [Subscription Endpoints](#subscription-endpoints)
2. [Study Group Endpoints](#study-group-endpoints)
3. [Books Endpoints](#books-endpoints)
4. [Flashcard Endpoints](#flashcard-endpoints)
5. [Quiz Endpoints](#quiz-endpoints)
6. [Study Planner Endpoints](#study-planner-endpoints)

---

## Subscription Endpoints

### Get Current Subscription
```typescript
subscriptionEndpoints.getCurrentSubscription(userId: string): Promise<Subscription | null>
```
**Description:** Retrieves the active subscription for a user.

**Parameters:**
- `userId` (string): The user's unique identifier

**Returns:** `Subscription` object or `null`

**Example:**
```typescript
const subscription = await api.subscription.getCurrentSubscription(user.id);
console.log(subscription.plan); // 'pro'
```

---

### Create Subscription
```typescript
subscriptionEndpoints.createSubscription(
  userId: string, 
  plan: 'pro' | 'premium', 
  interval: 'monthly' | 'yearly'
): Promise<Subscription>
```
**Description:** Creates a new subscription for a user.

**Parameters:**
- `userId` (string): User ID
- `plan` (string): Subscription plan ('pro' or 'premium')
- `interval` (string): Billing interval ('monthly' or 'yearly')

**Returns:** `Subscription` object

**Pricing:**
- Pro Monthly: $29.99
- Pro Yearly: $299.99
- Premium Monthly: $49.99
- Premium Yearly: $499.99

**Example:**
```typescript
const subscription = await api.subscription.createSubscription(
  user.id, 
  'pro', 
  'monthly'
);
```

---

### Update Subscription
```typescript
subscriptionEndpoints.updateSubscription(
  subscriptionId: string, 
  updates: Partial<Subscription>
): Promise<Subscription>
```
**Description:** Updates an existing subscription.

**Parameters:**
- `subscriptionId` (string): Subscription ID
- `updates` (object): Fields to update

**Example:**
```typescript
await api.subscription.updateSubscription(subscriptionId, {
  autoRenew: false
});
```

---

### Cancel Subscription
```typescript
subscriptionEndpoints.cancelSubscription(subscriptionId: string): Promise<void>
```
**Description:** Cancels a subscription (disables auto-renewal).

**Parameters:**
- `subscriptionId` (string): Subscription ID

**Example:**
```typescript
await api.subscription.cancelSubscription(subscriptionId);
```

---

### Get Payment History
```typescript
subscriptionEndpoints.getPaymentHistory(userId: string): Promise<PaymentHistory[]>
```
**Description:** Retrieves all payment transactions for a user.

**Parameters:**
- `userId` (string): User ID

**Returns:** Array of `PaymentHistory` objects

**Example:**
```typescript
const payments = await api.subscription.getPaymentHistory(user.id);
```

---

### Change Subscription Plan
```typescript
subscriptionEndpoints.changeSubscriptionPlan(
  subscriptionId: string, 
  newPlan: 'pro' | 'premium'
): Promise<Subscription>
```
**Description:** Upgrades or downgrades a subscription plan.

**Example:**
```typescript
await api.subscription.changeSubscriptionPlan(subscriptionId, 'premium');
```

---

## Study Group Endpoints

### Get All Groups
```typescript
groupEndpoints.getAllGroups(): Promise<StudyGroup[]>
```
**Description:** Retrieves all public study groups.

**Returns:** Array of `StudyGroup` objects

**Example:**
```typescript
const groups = await api.groups.getAllGroups();
```

---

### Get User's Groups
```typescript
groupEndpoints.getUserGroups(userId: string): Promise<StudyGroup[]>
```
**Description:** Retrieves all groups a user has joined.

**Parameters:**
- `userId` (string): User ID

**Returns:** Array of `StudyGroup` objects

**Example:**
```typescript
const myGroups = await api.groups.getUserGroups(user.id);
```

---

### Create Group
```typescript
groupEndpoints.createGroup(
  userId: string, 
  groupData: Partial<StudyGroup>
): Promise<StudyGroup>
```
**Description:** Creates a new study group.

**Parameters:**
- `userId` (string): Creator's user ID
- `groupData` (object): Group details

**Required Fields:**
- `name` (string)
- `description` (string)
- `category` (string)

**Optional Fields:**
- `avatar` (string)
- `isPrivate` (boolean)
- `tags` (string[])
- `maxMembers` (number)

**Example:**
```typescript
const group = await api.groups.createGroup(user.id, {
  name: 'NCLEX Warriors',
  description: 'Daily study group for NCLEX prep',
  category: 'General Study',
  tags: ['NCLEX-RN', 'Daily']
});
```

---

### Join Group
```typescript
groupEndpoints.joinGroup(userId: string, groupId: string): Promise<void>
```
**Description:** Adds a user to a study group.

**Parameters:**
- `userId` (string): User ID
- `groupId` (string): Group ID

**Example:**
```typescript
await api.groups.joinGroup(user.id, groupId);
```

---

### Leave Group
```typescript
groupEndpoints.leaveGroup(userId: string, groupId: string): Promise<void>
```
**Description:** Removes a user from a study group.

**Example:**
```typescript
await api.groups.leaveGroup(user.id, groupId);
```

---

### Get Group Members
```typescript
groupEndpoints.getGroupMembers(groupId: string): Promise<GroupMember[]>
```
**Description:** Retrieves all members of a study group.

**Returns:** Array of `GroupMember` objects with roles

**Example:**
```typescript
const members = await api.groups.getGroupMembers(groupId);
```

---

### Send Message
```typescript
groupEndpoints.sendMessage(
  groupId: string,
  userId: string,
  userName: string,
  content: string
): Promise<GroupMessage>
```
**Description:** Sends a message to a study group chat.

**Parameters:**
- `groupId` (string): Group ID
- `userId` (string): Sender's user ID
- `userName` (string): Sender's name
- `content` (string): Message text

**Example:**
```typescript
await api.groups.sendMessage(
  groupId,
  user.id,
  user.name,
  'Has anyone studied pharmacology today?'
);
```

---

### Get Group Messages
```typescript
groupEndpoints.getGroupMessages(
  groupId: string, 
  limit?: number
): Promise<GroupMessage[]>
```
**Description:** Retrieves messages from a group chat.

**Parameters:**
- `groupId` (string): Group ID
- `limit` (number, optional): Max messages to retrieve (default: 50)

**Returns:** Array of `GroupMessage` objects

**Example:**
```typescript
const messages = await api.groups.getGroupMessages(groupId, 100);
```

---

### Schedule Study Session
```typescript
groupEndpoints.scheduleSession(
  sessionData: Partial<StudySession>
): Promise<StudySession>
```
**Description:** Schedules a study session for a group.

**Required Fields:**
- `groupId` (string)
- `title` (string)
- `scheduledAt` (Date)
- `duration` (number - minutes)
- `hostId` (string)
- `hostName` (string)

**Example:**
```typescript
const session = await api.groups.scheduleSession({
  groupId: group.id,
  title: 'Pharmacology Review',
  description: 'Cardiovascular medications',
  scheduledAt: new Date('2024-03-20T14:00:00'),
  duration: 90,
  hostId: user.id,
  hostName: user.name
});
```

---

### Get Group Sessions
```typescript
groupEndpoints.getGroupSessions(groupId: string): Promise<StudySession[]>
```
**Description:** Retrieves all scheduled sessions for a group.

**Returns:** Array of `StudySession` objects

**Example:**
```typescript
const sessions = await api.groups.getGroupSessions(groupId);
```

---

## Books Endpoints

### Get All Books
```typescript
bookEndpoints.getAllBooks(): Promise<Book[]>
```
**Description:** Retrieves all available books.

**Returns:** Array of `Book` objects

**Example:**
```typescript
const books = await api.books.getAllBooks();
```

---

### Get Book by ID
```typescript
bookEndpoints.getBookById(bookId: string): Promise<Book | null>
```
**Description:** Retrieves a specific book's details.

**Parameters:**
- `bookId` (string): Book ID

**Example:**
```typescript
const book = await api.books.getBookById(bookId);
```

---

### Get Reading Progress
```typescript
bookEndpoints.getReadingProgress(
  userId: string, 
  bookId: string
): Promise<ReadingProgress | null>
```
**Description:** Retrieves user's reading progress for a book.

**Parameters:**
- `userId` (string): User ID
- `bookId` (string): Book ID

**Returns:** `ReadingProgress` object or `null`

**Example:**
```typescript
const progress = await api.books.getReadingProgress(user.id, bookId);
console.log(`You're ${progress.progress}% through the book`);
```

---

### Update Reading Progress
```typescript
bookEndpoints.updateReadingProgress(
  userId: string,
  bookId: string,
  progress: Partial<ReadingProgress>
): Promise<void>
```
**Description:** Updates user's reading progress.

**Fields:**
- `currentChapter` (number)
- `currentPage` (number)
- `progress` (number - percentage)
- `timeSpent` (number - minutes)

**Example:**
```typescript
await api.books.updateReadingProgress(user.id, bookId, {
  currentChapter: 5,
  currentPage: 120,
  progress: 45.5,
  timeSpent: 180
});
```

---

### Get User's Reading List
```typescript
bookEndpoints.getUserReadingList(userId: string): Promise<(Book & { progress: ReadingProgress })[]>
```
**Description:** Retrieves all books user is currently reading.

**Returns:** Array of books with embedded progress data

**Example:**
```typescript
const readingList = await api.books.getUserReadingList(user.id);
```

---

### Add Highlight
```typescript
bookEndpoints.addHighlight(
  highlightData: Partial<Highlight>
): Promise<Highlight>
```
**Description:** Adds a highlight to a book.

**Required Fields:**
- `userId` (string)
- `bookId` (string)
- `chapter` (number)
- `text` (string)

**Optional Fields:**
- `color` (string): Default 'yellow'
- `note` (string)

**Example:**
```typescript
const highlight = await api.books.addHighlight({
  userId: user.id,
  bookId: bookId,
  chapter: 3,
  text: 'Acute coronary syndrome requires immediate intervention',
  color: 'yellow',
  note: 'Important for exam!'
});
```

---

### Get Highlights
```typescript
bookEndpoints.getHighlights(
  userId: string, 
  bookId: string
): Promise<Highlight[]>
```
**Description:** Retrieves all highlights for a book.

**Example:**
```typescript
const highlights = await api.books.getHighlights(user.id, bookId);
```

---

### Delete Highlight
```typescript
bookEndpoints.deleteHighlight(highlightId: string): Promise<void>
```
**Description:** Removes a highlight.

**Example:**
```typescript
await api.books.deleteHighlight(highlightId);
```

---

### Add Bookmark
```typescript
bookEndpoints.addBookmark(
  bookmarkData: Partial<Bookmark>
): Promise<Bookmark>
```
**Description:** Adds a bookmark to a book.

**Required Fields:**
- `userId` (string)
- `bookId` (string)
- `chapter` (number)
- `page` (number)
- `title` (string)

**Example:**
```typescript
const bookmark = await api.books.addBookmark({
  userId: user.id,
  bookId: bookId,
  chapter: 5,
  page: 142,
  title: 'Medication calculations section'
});
```

---

### Get Bookmarks
```typescript
bookEndpoints.getBookmarks(
  userId: string, 
  bookId: string
): Promise<Bookmark[]>
```
**Description:** Retrieves all bookmarks for a book.

**Example:**
```typescript
const bookmarks = await api.books.getBookmarks(user.id, bookId);
```

---

### Delete Bookmark
```typescript
bookEndpoints.deleteBookmark(bookmarkId: string): Promise<void>
```
**Description:** Removes a bookmark.

**Example:**
```typescript
await api.books.deleteBookmark(bookmarkId);
```

---

## Flashcard Endpoints

### Get All Flashcards
```typescript
flashcardEndpoints.getAllFlashcards(category?: string): Promise<Flashcard[]>
```
**Description:** Retrieves flashcards, optionally filtered by category.

**Parameters:**
- `category` (string, optional): Filter by category

**Example:**
```typescript
const cards = await api.flashcards.getAllFlashcards('Pharmacological Therapies');
```

---

### Get Flashcard by ID
```typescript
flashcardEndpoints.getFlashcardById(flashcardId: string): Promise<Flashcard | null>
```
**Description:** Retrieves a specific flashcard.

**Example:**
```typescript
const card = await api.flashcards.getFlashcardById(cardId);
```

---

### Create Flashcard
```typescript
flashcardEndpoints.createFlashcard(
  userId: string,
  flashcardData: Partial<Flashcard>
): Promise<Flashcard>
```
**Description:** Creates a custom flashcard.

**Required Fields:**
- `question` (string)
- `answer` (string)
- `category` (string)

**Optional Fields:**
- `subcategory` (string)
- `difficulty` ('easy' | 'medium' | 'hard')
- `tags` (string[])

**Example:**
```typescript
const card = await api.flashcards.createFlashcard(user.id, {
  question: 'What is the therapeutic range for digoxin?',
  answer: '0.5 to 2.0 ng/mL',
  category: 'Pharmacological Therapies',
  subcategory: 'Cardiovascular Medications',
  difficulty: 'medium',
  tags: ['pharmacology', 'digoxin']
});
```

---

### Update Flashcard
```typescript
flashcardEndpoints.updateFlashcard(
  flashcardId: string,
  updates: Partial<Flashcard>
): Promise<void>
```
**Description:** Updates an existing flashcard.

**Example:**
```typescript
await api.flashcards.updateFlashcard(cardId, {
  answer: '0.5 to 2.0 ng/mL (updated range)'
});
```

---

### Delete Flashcard
```typescript
flashcardEndpoints.deleteFlashcard(flashcardId: string): Promise<void>
```
**Description:** Deletes a flashcard.

**Example:**
```typescript
await api.flashcards.deleteFlashcard(cardId);
```

---

### Get Flashcard Sets
```typescript
flashcardEndpoints.getFlashcardSets(userId?: string): Promise<FlashcardSet[]>
```
**Description:** Retrieves flashcard sets (public or user's own).

**Parameters:**
- `userId` (string, optional): Filter to user's sets + public sets

**Example:**
```typescript
const sets = await api.flashcards.getFlashcardSets(user.id);
```

---

### Create Flashcard Set
```typescript
flashcardEndpoints.createFlashcardSet(
  userId: string,
  setData: Partial<FlashcardSet>
): Promise<FlashcardSet>
```
**Description:** Creates a new flashcard set.

**Required Fields:**
- `name` (string)
- `category` (string)

**Example:**
```typescript
const set = await api.flashcards.createFlashcardSet(user.id, {
  name: 'Cardiac Medications',
  description: 'All cardiovascular drugs',
  category: 'Pharmacological Therapies',
  isPublic: false
});
```

---

### Update Flashcard Progress
```typescript
flashcardEndpoints.updateFlashcardProgress(
  userId: string,
  flashcardId: string,
  correct: boolean
): Promise<void>
```
**Description:** Records a flashcard practice attempt.

**Parameters:**
- `userId` (string): User ID
- `flashcardId` (string): Flashcard ID
- `correct` (boolean): Whether answer was correct

**Algorithm:**
- Tracks attempts and correct count
- Calculates confidence level (0-100%)
- Updates status: 'new' → 'learning' → 'mastered'
- Schedules next review (spaced repetition)

**Example:**
```typescript
await api.flashcards.updateFlashcardProgress(user.id, cardId, true);
```

---

### Get Due Flashcards
```typescript
flashcardEndpoints.getDueFlashcards(userId: string): Promise<Flashcard[]>
```
**Description:** Retrieves flashcards due for review (spaced repetition).

**Returns:** Array of flashcards ready to review

**Example:**
```typescript
const dueCards = await api.flashcards.getDueFlashcards(user.id);
console.log(`${dueCards.length} cards to review today`);
```

---

## Quiz Endpoints

### Get All Quizzes
```typescript
quizEndpoints.getAllQuizzes(category?: string): Promise<Quiz[]>
```
**Description:** Retrieves all quizzes, optionally filtered by category.

**Parameters:**
- `category` (string, optional): Filter by category

**Example:**
```typescript
const quizzes = await api.quizzes.getAllQuizzes('Pharmacological Therapies');
```

---

### Get Quiz by ID
```typescript
quizEndpoints.getQuizById(quizId: string): Promise<Quiz | null>
```
**Description:** Retrieves a specific quiz's metadata.

**Example:**
```typescript
const quiz = await api.quizzes.getQuizById(quizId);
console.log(`${quiz.title}: ${quiz.questionCount} questions`);
```

---

### Get Quiz Questions
```typescript
quizEndpoints.getQuizQuestions(quizId: string): Promise<QuizQuestion[]>
```
**Description:** Retrieves all questions for a quiz.

**Returns:** Array of `QuizQuestion` objects

**Example:**
```typescript
const questions = await api.quizzes.getQuizQuestions(quizId);
```

---

### Submit Quiz Attempt
```typescript
quizEndpoints.submitQuizAttempt(
  attemptData: Partial<QuizAttempt>
): Promise<QuizAttempt>
```
**Description:** Submits a completed quiz attempt.

**Required Fields:**
- `userId` (string)
- `quizId` (string)
- `score` (number)
- `totalQuestions` (number)
- `percentage` (number)
- `answers` (array): Answer details for each question

**Optional Fields:**
- `timeSpent` (number): Time in seconds

**Example:**
```typescript
const attempt = await api.quizzes.submitQuizAttempt({
  userId: user.id,
  quizId: quizId,
  score: 18,
  totalQuestions: 20,
  percentage: 90,
  timeSpent: 1200,
  answers: [
    { questionId: 'q1', selectedAnswer: 2, correct: true },
    { questionId: 'q2', selectedAnswer: 1, correct: false },
    // ...
  ]
});
```

---

### Get User's Quiz Attempts
```typescript
quizEndpoints.getUserQuizAttempts(userId: string): Promise<QuizAttempt[]>
```
**Description:** Retrieves all quiz attempts by a user.

**Returns:** Array of `QuizAttempt` objects

**Example:**
```typescript
const attempts = await api.quizzes.getUserQuizAttempts(user.id);
```

---

### Get Quiz Results
```typescript
quizEndpoints.getQuizResults(userId: string): Promise<QuizResult[]>
```
**Description:** Retrieves quiz results formatted for progress tracking.

**Returns:** Array of `QuizResult` objects

**Example:**
```typescript
const results = await api.quizzes.getQuizResults(user.id);
```

---

### Get Quiz Statistics
```typescript
quizEndpoints.getQuizStatistics(userId: string): Promise<{
  totalAttempts: number;
  averageScore: number;
  totalTimeSpent: number;
  categoryBreakdown: Record<string, { attempts: number; avgScore: number }>;
}>
```
**Description:** Retrieves aggregated quiz statistics for a user.

**Returns:** Statistics object with overall metrics

**Example:**
```typescript
const stats = await api.quizzes.getQuizStatistics(user.id);
console.log(`Average score: ${stats.averageScore}%`);
```

---

### Create Quiz
```typescript
quizEndpoints.createQuiz(
  userId: string,
  quizData: Partial<Quiz>
): Promise<Quiz>
```
**Description:** Creates a custom quiz.

**Required Fields:**
- `title` (string)
- `category` (string)

**Optional Fields:**
- `description` (string)
- `subcategory` (string)
- `difficulty` ('easy' | 'medium' | 'hard')
- `timeLimit` (number - minutes)
- `passingScore` (number - percentage)
- `tags` (string[])

**Example:**
```typescript
const quiz = await api.quizzes.createQuiz(user.id, {
  title: 'Cardiac Medications Review',
  description: 'Test your knowledge of cardiovascular drugs',
  category: 'Pharmacological Therapies',
  difficulty: 'medium',
  timeLimit: 30,
  passingScore: 75
});
```

---

### Add Question to Quiz
```typescript
quizEndpoints.addQuestionToQuiz(
  quizId: string,
  questionData: Partial<QuizQuestion>
): Promise<QuizQuestion>
```
**Description:** Adds a question to a quiz.

**Required Fields:**
- `question` (string)
- `options` (string[]): Array of answer options
- `correctAnswer` (number): Index of correct option
- `category` (string)

**Optional Fields:**
- `explanation` (string)
- `difficulty` ('easy' | 'medium' | 'hard')

**Example:**
```typescript
const question = await api.quizzes.addQuestionToQuiz(quizId, {
  question: 'What is the antidote for warfarin overdose?',
  options: [
    'Protamine sulfate',
    'Vitamin K',
    'Activated charcoal',
    'N-acetylcysteine'
  ],
  correctAnswer: 1,
  explanation: 'Vitamin K reverses warfarin anticoagulation',
  category: 'Pharmacological Therapies',
  difficulty: 'medium'
});
```

---

## Study Planner Endpoints

The Study Planner includes **Sessions**, **Tasks**, and **Goals** - all integrated in one unified interface.

### Get User's Sessions
```typescript
plannerEndpoints.getUserSessions(userId: string): Promise<PlannerSession[]>
```
**Description:** Retrieves all study sessions for a user.

**Example:**
```typescript
const sessions = await api.planner.getUserSessions(user.id);
```

---

### Create Session
```typescript
plannerEndpoints.createSession(
  userId: string,
  sessionData: Partial<PlannerSession>
): Promise<PlannerSession>
```
**Description:** Creates a new study session.

**Required Fields:**
- `title` (string)
- `category` (string)
- `date` (Date)
- `startTime` (string) - Format: "HH:MM"
- `endTime` (string) - Format: "HH:MM"
- `duration` (number) - Minutes

**Optional Fields:**
- `notes` (string)
- `topics` (string[])
- `priority` ('low' | 'medium' | 'high')

**Example:**
```typescript
const session = await api.planner.createSession(user.id, {
  title: 'Pharmacology Study',
  category: 'Pharmacological Therapies',
  date: new Date('2024-03-20'),
  startTime: '14:00',
  endTime: '16:00',
  duration: 120,
  topics: ['Beta blockers', 'ACE inhibitors'],
  priority: 'high'
});
```

---

### Update Session
```typescript
plannerEndpoints.updateSession(
  sessionId: string,
  updates: Partial<PlannerSession>
): Promise<void>
```
**Description:** Updates an existing study session.

**Example:**
```typescript
await api.planner.updateSession(sessionId, {
  completed: true,
  notes: 'Completed all topics'
});
```

---

### Delete Session
```typescript
plannerEndpoints.deleteSession(sessionId: string): Promise<void>
```
**Description:** Deletes a study session.

**Example:**
```typescript
await api.planner.deleteSession(sessionId);
```

---

### Get User's Tasks
```typescript
plannerEndpoints.getUserTasks(userId: string): Promise<Task[]>
```
**Description:** Retrieves all tasks for a user.

**Example:**
```typescript
const tasks = await api.planner.getUserTasks(user.id);
```

---

### Create Task
```typescript
plannerEndpoints.createTask(
  userId: string,
  taskData: Partial<Task>
): Promise<Task>
```
**Description:** Creates a new task.

**Required Fields:**
- `title` (string)
- `category` (string)
- `dueDate` (Date)

**Optional Fields:**
- `description` (string)
- `priority` ('low' | 'medium' | 'high')
- `estimatedTime` (number) - Minutes

**Example:**
```typescript
const task = await api.planner.createTask(user.id, {
  title: 'Review cardiac medications',
  description: 'Study beta blockers and ACE inhibitors',
  category: 'Pharmacological Therapies',
  dueDate: new Date('2024-03-25'),
  priority: 'high',
  estimatedTime: 60
});
```

---

### Update Task
```typescript
plannerEndpoints.updateTask(
  taskId: string,
  updates: Partial<Task>
): Promise<void>
```
**Description:** Updates an existing task.

**Example:**
```typescript
await api.planner.updateTask(taskId, {
  completed: true
});
```

---

### Delete Task
```typescript
plannerEndpoints.deleteTask(taskId: string): Promise<void>
```
**Description:** Deletes a task.

**Example:**
```typescript
await api.planner.deleteTask(taskId);
```

---

### Get User's Goals
```typescript
plannerEndpoints.getUserGoals(userId: string): Promise<Goal[]>
```
**Description:** Retrieves all goals for a user.

**Example:**
```typescript
const goals = await api.planner.getUserGoals(user.id);
```

---

### Create Goal
```typescript
plannerEndpoints.createGoal(
  userId: string,
  goalData: Partial<Goal>
): Promise<Goal>
```
**Description:** Creates a new goal.

**Required Fields:**
- `title` (string)
- `targetDate` (Date)
- `targetProgress` (number)
- `category` (string)

**Optional Fields:**
- `description` (string)
- `currentProgress` (number) - Default: 0
- `milestones` (array) - Array of milestone objects

**Example:**
```typescript
const goal = await api.planner.createGoal(user.id, {
  title: 'Master Pharmacology',
  description: 'Complete all pharmacology topics before exam',
  targetDate: new Date('2024-06-01'),
  targetProgress: 100,
  currentProgress: 0,
  category: 'Pharmacological Therapies',
  milestones: [
    {
      id: 'milestone1',
      title: 'Complete cardiovascular meds',
      completed: false,
      dueDate: new Date('2024-04-01')
    },
    {
      id: 'milestone2',
      title: 'Complete respiratory meds',
      completed: false,
      dueDate: new Date('2024-04-15')
    }
  ]
});
```

---

### Update Goal
```typescript
plannerEndpoints.updateGoal(
  goalId: string,
  updates: Partial<Goal>
): Promise<void>
```
**Description:** Updates an existing goal.

**Example:**
```typescript
await api.planner.updateGoal(goalId, {
  currentProgress: 50,
  milestones: [
    {
      id: 'milestone1',
      title: 'Complete cardiovascular meds',
      completed: true,
      dueDate: new Date('2024-04-01')
    }
  ]
});
```

---

### Delete Goal
```typescript
plannerEndpoints.deleteGoal(goalId: string): Promise<void>
```
**Description:** Deletes a goal.

**Example:**
```typescript
await api.planner.deleteGoal(goalId);
```

---

### Get Study Statistics
```typescript
plannerEndpoints.getStudyStatistics(userId: string): Promise<{
  totalMinutes: number;
  sessionsCompleted: number;
  currentStreak: number;
  longestStreak: number;
  averageSessionLength: number;
  categoryBreakdown: Record<string, number>;
}>
```
**Description:** Retrieves comprehensive study statistics including streaks.

**Returns:**
- `totalMinutes` - Total study time
- `sessionsCompleted` - Number of completed sessions
- `currentStreak` - Current consecutive study days
- `longestStreak` - Longest streak ever achieved
- `averageSessionLength` - Average session duration in minutes
- `categoryBreakdown` - Study time per category

**Example:**
```typescript
const stats = await api.planner.getStudyStatistics(user.id);
console.log(`Current streak: ${stats.currentStreak} days 🔥`);
console.log(`Total study time: ${Math.round(stats.totalMinutes / 60)} hours`);
```

---

## Error Handling

All endpoints use try-catch blocks and return mock data if Supabase is not configured or if errors occur.

**Example error handling:**
```typescript
try {
  const subscription = await api.subscription.getCurrentSubscription(user.id);
  if (subscription) {
    console.log('Active subscription:', subscription.plan);
  }
} catch (error) {
  console.error('Failed to fetch subscription:', error);
}
```

---

## Data Types

### Subscription
```typescript
interface Subscription {
  id: string;
  userId: string;
  plan: 'free' | 'pro' | 'premium';
  status: 'active' | 'cancelled' | 'expired' | 'past_due';
  startDate: Date;
  endDate: Date;
  autoRenew: boolean;
  amount: number;
  interval: 'monthly' | 'yearly';
  paymentMethod?: {
    type: 'card' | 'paypal';
    last4?: string;
    brand?: string;
  };
}
```

### StudyGroup
```typescript
interface StudyGroup {
  id: string;
  name: string;
  description: string;
  category: string;
  memberCount: number;
  maxMembers: number;
  createdBy: string;
  createdAt: Date;
  avatar: string;
  isPrivate: boolean;
  tags: string[];
}
```

### Book
```typescript
interface Book {
  id: string;
  title: string;
  author: string;
  description: string;
  coverImage: string;
  category: string;
  totalChapters: number;
  totalPages: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  tags: string[];
}
```

### Flashcard
```typescript
interface Flashcard {
  id: string;
  question: string;
  answer: string;
  category: string;
  subcategory: string;
  difficulty: 'easy' | 'medium' | 'hard';
  tags: string[];
}
```

### Quiz
```typescript
interface Quiz {
  id: string;
  title: string;
  description: string;
  category: string;
  subcategory: string;
  difficulty: 'easy' | 'medium' | 'hard';
  questionCount: number;
  timeLimit?: number;
  passingScore: number;
  tags: string[];
}
```

---

## NCLEX Categories

All features use the official 8 NCLEX-RN categories:

1. **Management of Care**
2. **Safety and Infection Control**
3. **Health Promotion and Maintenance**
4. **Psychosocial Integrity**
5. **Basic Care and Comfort**
6. **Pharmacological Therapies**
7. **Reduction of Risk Potential**
8. **Physiological Adaptation**

---

## Setup Instructions

### 1. Install Supabase Client
```bash
npm install @supabase/supabase-js
```

### 2. Set Environment Variables
Create a `.env` file:
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 3. Run Database Schema
Execute the SQL in `/lib/database-schema.sql` in your Supabase SQL editor.

### 4. Import API
```typescript
import api from './lib/api-endpoints';

// Use endpoints
const books = await api.books.getAllBooks();
const quizzes = await api.quizzes.getAllQuizzes();
```

---

## Best Practices

1. **Always handle errors**: Wrap API calls in try-catch blocks
2. **Check authentication**: Verify user is logged in before API calls
3. **Use TypeScript**: Import types for better IDE support
4. **Optimize queries**: Use pagination for large datasets
5. **Cache when possible**: Store frequently accessed data
6. **Validate input**: Check data before sending to API
7. **Show loading states**: Display spinners during API calls

---

**Last Updated:** 2024
**Version:** 1.0.0
**Support:** support@nursehaven.com
