# Haven Institute - User Dashboard Implementation Plan

## Overview

This document outlines the comprehensive implementation plan for the user dashboard features, including backend architecture, API endpoints, frontend components, and routing using react-router-dom.

---

## 1. Dashboard Features Analysis

### Current Features (from Dashboard.tsx)

| Feature | Current State | Backend Required |
|---------|---------------|------------------|
| NCLEX Confidence Score | Mock data | ✅ CAT results API |
| Study Streak | Mock (7 days) | ✅ User activity tracking |
| Average Score | Calculated from results | ✅ Quiz/CAT results API |
| Time Invested | Mock (24h) | ✅ Session tracking |
| Confidence Trend Chart | Mock CAT data | ✅ CAT history API |
| Category Performance Radar | Mock category scores | ✅ Category analytics |
| Weekly Activity Chart | Mock activity | ✅ Activity tracking |
| Quick Actions | UI only | ✅ Navigation handlers |
| Recent Activity | Mock activity list | ✅ Activity log API |
| Study Goals | Mock progress | ✅ Goals CRUD API |
| Community Stats | Mock numbers | ✅ Forum/Group APIs |

### Navigation Menu Items (from UserLayout.tsx)

| Route | Component | Backend Module |
|-------|-----------|----------------|
| `/dashboard` | Dashboard | Analytics, Activity |
| `/nclex-simulator` | NCLEXSimulator | CAT Engine |
| `/cat-test` | CATTestEnhanced | CAT Engine |
| `/quiz` | PracticeQuizEnhanced | Questions |
| `/flashcards` | FlashcardsEnhanced | Flashcards |
| `/books` | BookReaderComplete | Content |
| `/ai-chat` | AIChat | AI Service |
| `/progress` | Progress | Analytics |
| `/analytics` | Analytics | Analytics |
| `/planner` | StudyPlannerComplete | Planner |
| `/group-study` | GroupStudyComplete | Social |
| `/forum` | Forum | Forum |
| `/subscription` | SubscriptionManager | Payments |
| `/profile` | UserProfile | Users |

---

## 2. Backend Architecture

### 2.1 Database Entities (Models)

```
backend/src/models/
├── User.ts                 # ✅ EXISTS
├── Session.ts              # ✅ EXISTS
├── Question.ts             # NEW - NCLEX questions
├── QuizSession.ts          # NEW - Quiz attempts
├── CATSession.ts           # NEW - CAT test results
├── Flashcard.ts            # NEW - Flashcard content
├── FlashcardProgress.ts    # NEW - User flashcard progress
├── Book.ts                 # NEW - E-book content
├── ReadingProgress.ts      # NEW - User reading progress
├── StudyActivity.ts        # NEW - Activity tracking
├── StudyGoal.ts            # NEW - User goals
├── StudyStreak.ts          # NEW - Streak tracking
├── CategoryScore.ts        # NEW - Category performance
├── StudyGroup.ts           # NEW - Group study
├── ForumPost.ts            # NEW - Forum posts
├── ForumComment.ts         # NEW - Forum comments
├── Subscription.ts         # NEW - User subscriptions
└── Payment.ts              # NEW - Payment history
```

### 2.2 Services

```
backend/src/services/
├── auth.service.ts         # ✅ EXISTS
├── cat.service.ts          # ✅ EXISTS
├── email.service.ts        # ✅ EXISTS
├── quiz.service.ts         # NEW - Quiz logic
├── flashcard.service.ts    # NEW - Flashcard SRS
├── analytics.service.ts    # NEW - Dashboard analytics
├── activity.service.ts     # NEW - Activity tracking
├── goals.service.ts        # NEW - Study goals
├── content.service.ts      # NEW - Books/content
├── forum.service.ts        # NEW - Forum operations
├── group.service.ts        # NEW - Study groups
├── subscription.service.ts # NEW - Subscription management
└── ai.service.ts           # NEW - AI tutor integration
```

### 2.3 Controllers

```
backend/src/controllers/
├── auth.controller.ts      # ✅ EXISTS
├── user.controller.ts      # NEW - User profile CRUD
├── quiz.controller.ts      # NEW - Quiz endpoints
├── cat.controller.ts       # NEW - CAT test endpoints
├── flashcard.controller.ts # NEW - Flashcard endpoints
├── analytics.controller.ts # NEW - Dashboard data
├── activity.controller.ts  # NEW - Activity tracking
├── goals.controller.ts     # NEW - Study goals CRUD
├── content.controller.ts   # NEW - Books/questions
├── forum.controller.ts     # NEW - Forum CRUD
├── group.controller.ts     # NEW - Study groups
├── subscription.controller.ts # NEW - Subscriptions
└── ai.controller.ts        # NEW - AI chat endpoints
```

### 2.4 Routes

```
backend/src/routes/
├── index.ts                # ✅ EXISTS - Main router
├── auth.routes.ts          # ✅ EXISTS
├── user.routes.ts          # NEW
├── quiz.routes.ts          # NEW
├── cat.routes.ts           # NEW
├── flashcard.routes.ts     # NEW
├── analytics.routes.ts     # NEW
├── activity.routes.ts      # NEW
├── goals.routes.ts         # NEW
├── content.routes.ts       # NEW
├── forum.routes.ts         # NEW
├── group.routes.ts         # NEW
├── subscription.routes.ts  # NEW
└── ai.routes.ts            # NEW
```

---

## 3. API Endpoints Specification

### 3.1 Dashboard Analytics API

```
GET    /api/v1/analytics/dashboard
       → Returns: { confidence, streak, avgScore, hoursStudied, recentActivity }

GET    /api/v1/analytics/confidence-trend
       → Returns: [{ date, confidence, ability }]

GET    /api/v1/analytics/category-performance
       → Returns: [{ category, score, questionsAnswered }]

GET    /api/v1/analytics/weekly-activity
       → Returns: [{ day, questions, timeMinutes }]
```

### 3.2 Quiz & CAT API

```
POST   /api/v1/quiz/start
       → Body: { category, difficulty, questionCount }
       → Returns: { sessionId, questions[] }

POST   /api/v1/quiz/:sessionId/answer
       → Body: { questionId, answer, timeSpent }
       → Returns: { correct, explanation, nextQuestion }

POST   /api/v1/quiz/:sessionId/complete
       → Returns: { score, total, categoryBreakdown }

GET    /api/v1/quiz/history
       → Returns: [{ sessionId, score, date, category }]

POST   /api/v1/cat/start
       → Returns: { sessionId, firstQuestion, estimatedDuration }

POST   /api/v1/cat/:sessionId/answer
       → Body: { questionId, answer, timeSpent }
       → Returns: { nextQuestion, currentAbility, confidence, questionsRemaining }

POST   /api/v1/cat/:sessionId/complete
       → Returns: { passed, score, abilityEstimate, confidenceInterval, report }

GET    /api/v1/cat/history
       → Returns: [{ sessionId, score, passingProbability, date }]
```

### 3.3 Flashcards API

```
GET    /api/v1/flashcards/sets
       → Returns: [{ setId, name, cardCount, progress }]

GET    /api/v1/flashcards/sets/:setId/cards
       → Returns: [{ cardId, front, back, difficulty, dueDate }]

POST   /api/v1/flashcards/sets/:setId/study
       → Returns: { cards[], sessionId }

POST   /api/v1/flashcards/:cardId/review
       → Body: { quality: 0-5 }  # SRS quality rating
       → Returns: { nextReviewDate, interval }

GET    /api/v1/flashcards/due-today
       → Returns: { count, cards[] }
```

### 3.4 Activity & Goals API

```
GET    /api/v1/activity/recent
       → Query: { limit: 10 }
       → Returns: [{ type, action, score, timestamp }]

POST   /api/v1/activity/log
       → Body: { type, action, metadata }

GET    /api/v1/goals
       → Returns: [{ goalId, type, target, current, deadline }]

POST   /api/v1/goals
       → Body: { type, target, deadline }

PUT    /api/v1/goals/:goalId
       → Body: { target, deadline }

DELETE /api/v1/goals/:goalId

GET    /api/v1/streak
       → Returns: { currentStreak, longestStreak, lastActivityDate }
```

### 3.5 Content API (Books & Questions)

```
GET    /api/v1/books
       → Returns: [{ bookId, title, author, chapters, progress }]

GET    /api/v1/books/:bookId
       → Returns: { bookId, title, chapters[], userProgress }

POST   /api/v1/books/:bookId/progress
       → Body: { chapterId, position, percentage }

GET    /api/v1/questions/categories
       → Returns: [{ categoryId, name, questionCount }]

GET    /api/v1/questions/random
       → Query: { category, difficulty, count }
       → Returns: [{ questionId, text, options, category }]
```

### 3.6 Social API (Forum & Groups)

```
GET    /api/v1/forum/posts
       → Query: { page, limit, category }
       → Returns: { posts[], total, pages }

GET    /api/v1/forum/posts/:postId
       → Returns: { post, comments[] }

POST   /api/v1/forum/posts
       → Body: { title, content, category }

POST   /api/v1/forum/posts/:postId/comments
       → Body: { content }

GET    /api/v1/groups
       → Returns: [{ groupId, name, members, nextSession }]

POST   /api/v1/groups/:groupId/join
POST   /api/v1/groups/:groupId/leave
```

### 3.7 Subscription API

```
GET    /api/v1/subscription/plans
       → Returns: [{ planId, name, price, features }]

GET    /api/v1/subscription/current
       → Returns: { plan, status, expiresAt, features }

POST   /api/v1/subscription/checkout
       → Body: { planId }
       → Returns: { checkoutUrl, sessionId }

POST   /api/v1/subscription/cancel
```

### 3.8 AI Chat API

```
POST   /api/v1/ai/chat
       → Body: { message, context? }
       → Returns: { response, suggestions[] }

GET    /api/v1/ai/history
       → Returns: [{ role, content, timestamp }]

POST   /api/v1/ai/explain
       → Body: { questionId }
       → Returns: { explanation, relatedTopics[] }
```

---

## 4. Frontend Architecture

### 4.1 React Router DOM Setup

```tsx
// src/router/index.tsx
import { createBrowserRouter } from 'react-router-dom';

const router = createBrowserRouter([
  // Public routes
  { path: '/', element: <LandingPage /> },
  { path: '/login', element: <Login /> },
  { path: '/signup', element: <Signup /> },
  
  // Protected routes (wrapped with AuthLayout)
  {
    path: '/app',
    element: <ProtectedRoute><UserLayout /></ProtectedRoute>,
    children: [
      { index: true, element: <Navigate to="dashboard" /> },
      { path: 'dashboard', element: <Dashboard /> },
      { path: 'nclex-simulator', element: <NCLEXSimulator /> },
      { path: 'cat-test', element: <CATTest /> },
      { path: 'quiz', element: <Quiz /> },
      { path: 'quiz/:category', element: <Quiz /> },
      { path: 'flashcards', element: <Flashcards /> },
      { path: 'flashcards/:setId', element: <FlashcardStudy /> },
      { path: 'books', element: <BookLibrary /> },
      { path: 'books/:bookId', element: <BookReader /> },
      { path: 'ai-chat', element: <AIChat /> },
      { path: 'progress', element: <Progress /> },
      { path: 'analytics', element: <Analytics /> },
      { path: 'planner', element: <StudyPlanner /> },
      { path: 'group-study', element: <GroupStudy /> },
      { path: 'forum', element: <Forum /> },
      { path: 'forum/:postId', element: <ForumPost /> },
      { path: 'subscription', element: <Subscription /> },
      { path: 'profile', element: <Profile /> },
      { path: 'settings', element: <Settings /> },
    ]
  },
  
  // Admin routes
  {
    path: '/admin',
    element: <ProtectedRoute role="admin"><AdminLayout /></ProtectedRoute>,
    children: [
      { index: true, element: <AdminDashboard /> },
      // ... admin routes
    ]
  }
]);
```

### 4.2 API Service Layer (DRY Pattern)

```
src/services/
├── api/
│   ├── client.ts           # Axios instance with interceptors
│   ├── auth.api.ts         # Auth endpoints
│   ├── analytics.api.ts    # Dashboard analytics
│   ├── quiz.api.ts         # Quiz endpoints
│   ├── cat.api.ts          # CAT endpoints
│   ├── flashcard.api.ts    # Flashcard endpoints
│   ├── activity.api.ts     # Activity tracking
│   ├── goals.api.ts        # Study goals
│   ├── content.api.ts      # Books/questions
│   ├── forum.api.ts        # Forum endpoints
│   ├── group.api.ts        # Study groups
│   ├── subscription.api.ts # Subscriptions
│   ├── ai.api.ts           # AI chat
│   └── index.ts            # Barrel export
├── hooks/
│   ├── useAuth.ts          # Auth state hook
│   ├── useDashboard.ts     # Dashboard data hook
│   ├── useQuiz.ts          # Quiz session hook
│   ├── useFlashcards.ts    # Flashcard study hook
│   └── useApi.ts           # Generic API hook with caching
└── store/
    ├── authStore.ts        # Zustand auth store
    ├── dashboardStore.ts   # Dashboard state
    └── quizStore.ts        # Quiz session state
```

### 4.3 Reusable API Client

```typescript
// src/services/api/client.ts
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api/v1';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor - add auth token
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor - handle errors, refresh token
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Handle token refresh or logout
    }
    return Promise.reject(error);
  }
);
```

---

## 5. Implementation Priority

### Phase 1: Core Infrastructure (Week 1-2)
1. ✅ Set up react-router-dom with protected routes
2. ✅ Create API client with interceptors
3. ✅ Implement auth flow with real backend
4. ✅ Create base service layer pattern

### Phase 2: Dashboard & Analytics (Week 3-4)
1. Analytics API endpoints (backend)
2. Dashboard data hooks (frontend)
3. Activity tracking system
4. Study streak calculation

### Phase 3: Practice Features (Week 5-6)
1. Quiz system (questions, sessions, scoring)
2. CAT engine integration
3. Flashcard SRS system
4. Progress tracking

### Phase 4: Content & Social (Week 7-8)
1. Books/content management
2. Forum system
3. Study groups
4. AI chat integration

### Phase 5: Monetization (Week 9-10)
1. Subscription management
2. Payment integration (Stripe)
3. Feature gating by plan

---

## 6. File Structure Summary

```
Haveninstitute/
├── backend/src/
│   ├── models/          # 15+ new entities
│   ├── services/        # 10+ new services
│   ├── controllers/     # 12+ new controllers
│   ├── routes/          # 12+ new route files
│   └── middleware/      # Auth, rate limiting, validation
│
├── src/
│   ├── router/          # NEW - React Router setup
│   │   ├── index.tsx
│   │   ├── routes.tsx
│   │   └── ProtectedRoute.tsx
│   ├── services/
│   │   ├── api/         # NEW - API service layer
│   │   ├── hooks/       # NEW - React Query hooks
│   │   └── store/       # NEW - Zustand stores
│   ├── components/
│   │   ├── shared/      # ✅ EXISTS - Reusable UI
│   │   ├── dashboard/   # NEW - Dashboard widgets
│   │   ├── quiz/        # NEW - Quiz components
│   │   ├── flashcard/   # NEW - Flashcard components
│   │   └── ...
│   └── pages/           # NEW - Route page components
│       ├── Dashboard.tsx
│       ├── Quiz.tsx
│       └── ...
```

---

## 7. Next Steps

1. **Start with routing**: Install react-router-dom, set up router
2. **Create API client**: Axios instance with interceptors
3. **Build first API service**: Analytics API for dashboard
4. **Connect Dashboard**: Replace mock data with real API calls
5. **Iterate on each feature module**

Would you like me to start implementing any specific phase?
