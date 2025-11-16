# Haven Institute Backend Architecture

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Client Layer                            │
│   (React Frontend, Mobile Apps, Third-party Integrations)      │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             │ HTTPS
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                      API Gateway Layer                          │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Express.js + TypeScript                                  │  │
│  │  • CORS  • Helmet  • Rate Limiting  • Request Logging    │  │
│  └──────────────────────────────────────────────────────────┘  │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Authentication Layer                         │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  JWT Middleware                                           │  │
│  │  • Token Verification  • Role Checking  • Permissions    │  │
│  └──────────────────────────────────────────────────────────┘  │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                       Routes Layer                              │
│  ┌─────────┬─────────┬──────────┬─────────┬──────────────┐    │
│  │  Auth   │  Quiz   │ Payment  │  Books  │  Analytics   │    │
│  │ Routes  │ Routes  │  Routes  │ Routes  │   Routes     │    │
│  └─────────┴─────────┴──────────┴─────────┴──────────────┘    │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Controllers Layer                            │
│  ┌─────────┬─────────┬──────────┬─────────┬──────────────┐    │
│  │  Auth   │  Quiz   │ Payment  │  Books  │  Analytics   │    │
│  │  Ctrl   │  Ctrl   │   Ctrl   │  Ctrl   │     Ctrl     │    │
│  └─────────┴─────────┴──────────┴─────────┴──────────────┘    │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                   Business Logic Layer                          │
│  ┌─────────┬─────────┬──────────┬─────────┬──────────────┐    │
│  │  Auth   │  CAT    │ Payment  │  Books  │  Flashcard   │    │
│  │ Service │ Service │ Service  │ Service │   Service    │    │
│  └─────────┴─────────┴──────────┴─────────┴──────────────┘    │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Data Access Layer                            │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Sequelize ORM + Models                                   │  │
│  │  • User  • Question  • Quiz  • Subscription  • Book      │  │
│  └──────────────────────────────────────────────────────────┘  │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Database Layer                             │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  MariaDB 10.11+                                           │  │
│  │  • 24 Tables  • Indexes  • Foreign Keys  • Constraints   │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                   External Services Layer                       │
│  ┌──────────┬─────────┬──────────┬──────────┬───────────┐     │
│  │  Stripe  │ OpenAI  │  Email   │  Redis   │  Storage  │     │
│  │   API    │   API   │   SMTP   │  Cache   │    S3     │     │
│  └──────────┴─────────┴──────────┴──────────┴───────────┘     │
└─────────────────────────────────────────────────────────────────┘
```

## 📊 Database Schema Overview

### Core Tables (24 Total)

#### 1. User Management (4 tables)
- `users` - User accounts and profiles
- `sessions` - Active user sessions
- `password_resets` - Password reset tokens
- `audit_logs` - User activity tracking

#### 2. Subscriptions & Payments (3 tables)
- `subscriptions` - Subscription records
- `payment_transactions` - Payment history
- `payment_methods` - Saved payment methods

#### 3. Quiz & Testing (6 tables)
- `nclex_categories` - NCLEX categories
- `questions` - Question bank
- `quiz_sessions` - Active quiz sessions
- `quiz_answers` - User responses
- `quiz_results` - Completed quiz results
- `user_performance` - Performance analytics

#### 4. Flashcards (3 tables)
- `flashcards` - Flashcard content
- `flashcard_sets` - Flashcard collections
- `user_flashcard_progress` - Spaced repetition tracking

#### 5. Books & Reading (4 tables)
- `books` - Book metadata
- `book_chapters` - Chapter content
- `user_book_progress` - Reading progress
- `highlights_bookmarks` - User annotations

#### 6. Community (3 tables)
- `forum_categories` - Forum categories
- `forum_posts` - Forum threads
- `forum_replies` - Thread responses

#### 7. AI & Analytics (1 table)
- `ai_chat_sessions` - AI chat history
- `analytics_events` - Usage analytics

## 🔐 Security Architecture

### Authentication Flow

```
1. User Login
   ↓
2. Verify Credentials (bcrypt)
   ↓
3. Generate JWT (access + refresh)
   ↓
4. Store Session in DB
   ↓
5. Return Tokens to Client

Subsequent Requests:
1. Extract JWT from Authorization header
   ↓
2. Verify JWT signature
   ↓
3. Check expiration
   ↓
4. Load user from DB
   ↓
5. Attach user to request
   ↓
6. Proceed to route handler
```

### Authorization Levels

1. **Public** - No authentication required
2. **Authenticated** - Valid JWT required
3. **Role-Based** - Specific role required (student, instructor, admin)
4. **Subscription-Based** - Specific tier required (Pro, Premium)

## 🎯 CAT Algorithm Architecture

### Components

1. **Question Bank** - IRT-calibrated questions
2. **Ability Estimator** - Maximum Likelihood Estimation
3. **Question Selector** - Maximum Information Criterion
4. **Stopping Rule** - Confidence interval threshold

### Flow

```
1. Start Test (θ = 0)
   ↓
2. Select Question (max info for current θ)
   ↓
3. Present Question to User
   ↓
4. User Responds
   ↓
5. Update θ (MLE)
   ↓
6. Calculate SE(θ)
   ↓
7. Check Stopping Rule
   ├─ Continue → Go to step 2
   └─ Stop → Calculate Pass/Fail
```

### IRT Model (3PL)

```
P(θ) = c + (1 - c) / (1 + e^(-a(θ - b)))

Where:
- P(θ) = Probability of correct response
- θ = Examinee ability
- a = Discrimination (0.5 - 2.5)
- b = Difficulty (-3 to +3)
- c = Guessing (0 - 0.35)
```

## 📡 API Design Principles

### RESTful Conventions

- **GET** - Retrieve resources
- **POST** - Create resources
- **PUT** - Replace resources
- **PATCH** - Update resources
- **DELETE** - Remove resources

### Response Format

```json
{
  "success": true|false,
  "data": { ... } | [ ... ],
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable message",
    "details": { ... }
  },
  "pagination": {
    "total": 100,
    "limit": 20,
    "offset": 0,
    "hasMore": true
  }
}
```

### Error Codes

- `AUTH_xxx` - Authentication errors
- `VAL_xxx` - Validation errors
- `DB_xxx` - Database errors
- `PAY_xxx` - Payment errors
- `SYS_xxx` - System errors

## 🚀 Performance Considerations

### Database Optimization

1. **Indexes** - On foreign keys, frequently queried columns
2. **Connection Pooling** - Min 2, Max 10 connections
3. **Query Optimization** - Use Sequelize efficiently
4. **Caching** - Redis for frequently accessed data

### API Optimization

1. **Rate Limiting** - Prevent abuse
2. **Compression** - gzip responses
3. **Pagination** - Limit result sets
4. **Lazy Loading** - Load related data on demand

## 🔄 Data Flow Example: Taking a Quiz

```
1. Frontend: POST /quiz/sessions
   ↓
2. QuizController.createSession()
   ↓
3. QuizService.createSession(userId, config)
   ↓
4. CAT Service.initializeAbility()
   ↓
5. QuizSession created in DB
   ↓
6. CAT Service.selectFirstQuestion()
   ↓
7. Return session + first question
   ↓
8. Frontend displays question
   ↓
9. User answers
   ↓
10. Frontend: POST /quiz/sessions/:id/answers
    ↓
11. QuizService.submitAnswer()
    ↓
12. CAT Service.updateAbility()
    ↓
13. CAT Service.checkStoppingRule()
    ├─ Continue → Select next question
    └─ Stop → Calculate final result
    ↓
14. Return result to frontend
```

## 🛡️ Error Handling Strategy

### Levels

1. **Route Level** - Input validation
2. **Controller Level** - Request/response handling
3. **Service Level** - Business logic errors
4. **Database Level** - Query errors
5. **Global Level** - Uncaught exceptions

### Error Propagation

```
Service throws error
   ↓
Controller catches (try/catch)
   ↓
Passes to next(error)
   ↓
Error middleware handles
   ↓
Formats response
   ↓
Logs error
   ↓
Returns to client
```

## 📈 Scalability Considerations

### Horizontal Scaling

- Stateless API design
- Session data in database/Redis
- Load balancer ready

### Vertical Scaling

- Efficient queries
- Connection pooling
- Caching strategy

### Future Enhancements

1. **Microservices** - Split into focused services
2. **Message Queue** - Async task processing
3. **CDN** - Static asset delivery
4. **Read Replicas** - Scale database reads
5. **Caching Layer** - Redis for hot data

---

**This architecture is designed for production scale while remaining maintainable and extensible.**
