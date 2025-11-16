# Haven Institute Backend API

Production-ready REST API for the Haven Institute nursing education platform. Built with Express, TypeScript, Prisma ORM, and MariaDB.

## Features

- 🔐 **JWT Authentication** - Secure user authentication and authorization
- 📚 **Question Bank** - CRUD operations for NCLEX-style questions
- 📝 **Quiz Sessions** - Track quiz attempts with CAT (Computer Adaptive Testing)
- 🎴 **Flashcards** - Spaced repetition system using SM2 algorithm
- 📖 **Book Reader** - Reading progress, highlights, and bookmarks
- 🤖 **AI Chat** - OpenAI/Anthropic integration for study assistance
- 📊 **Analytics** - Comprehensive performance tracking and insights
- 💳 **Stripe Integration** - Subscription and payment webhooks
- 🐳 **Docker Support** - Containerized deployment ready

## Tech Stack

- **Runtime**: Node.js 20+
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: MariaDB 11.x (MySQL compatible)
- **ORM**: Prisma
- **Authentication**: JWT (jsonwebtoken)
- **Payments**: Stripe
- **Security**: Helmet.js, bcrypt, CORS

## Quick Start

### Prerequisites

- Node.js 20+ and npm
- MariaDB 11+ or MySQL 8+
- Docker (optional)

### Installation

```bash
# Install dependencies
npm install

# Generate Prisma client
npm run prisma:generate

# Set up environment
cp .env.example .env
# Edit .env with your configuration

# Run migrations
npx prisma migrate deploy

# Start development server
npm run dev
```

Server runs at `http://localhost:3001`

## Project Structure

```
backend/
├── src/
│   ├── server.ts                 # Main application entry
│   ├── middleware/
│   │   ├── auth.ts              # JWT authentication
│   │   ├── errorHandler.ts     # Global error handling
│   │   └── requestLogger.ts    # Request logging
│   ├── routes/
│   │   ├── auth.ts              # Authentication endpoints
│   │   ├── questions.ts         # Question bank CRUD
│   │   ├── quizzes.ts           # Quiz session management
│   │   ├── flashcards.ts        # Spaced repetition
│   │   ├── books.ts             # Reading progress
│   │   ├── analytics.ts         # Performance analytics
│   │   ├── aiChat.ts            # AI chat integration
│   │   └── stripe.ts            # Payment webhooks
│   └── scripts/
│       └── seed.ts              # Database seeding
├── prisma/
│   └── schema.prisma            # Database schema
├── Dockerfile                    # Production Docker image
├── docker-compose.yml           # Development environment
├── DEPLOYMENT_GUIDE.md          # Deployment instructions
└── package.json

Total: ~3,500 lines of production code
```

## API Documentation

### Base URL

```
http://localhost:3001/api/v1
```

### Authentication

All endpoints (except `/auth/register` and `/auth/login`) require JWT token:

```bash
Authorization: Bearer <your-jwt-token>
```

### Main Endpoints

#### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login
- `GET /api/v1/auth/me` - Get current user
- `PATCH /api/v1/auth/profile` - Update profile
- `POST /api/v1/auth/change-password` - Change password

#### Questions
- `POST /api/v1/questions` - Create question (admin)
- `POST /api/v1/questions/bulk` - Bulk create questions (admin)
- `GET /api/v1/questions` - Get questions with filters
- `GET /api/v1/questions/random` - Get random questions
- `GET /api/v1/questions/cat` - Get CAT questions
- `GET /api/v1/questions/:id` - Get question by ID
- `PATCH /api/v1/questions/:id` - Update question (admin)
- `DELETE /api/v1/questions/:id` - Delete question (admin)

#### Quiz Sessions
- `POST /api/v1/quizzes/sessions` - Create quiz session
- `POST /api/v1/quizzes/sessions/cat` - Create CAT session
- `GET /api/v1/quizzes/sessions` - Get user sessions
- `GET /api/v1/quizzes/sessions/:id` - Get session
- `POST /api/v1/quizzes/sessions/:id/answer` - Submit answer
- `POST /api/v1/quizzes/sessions/:id/complete` - Complete session
- `POST /api/v1/quizzes/sessions/:id/pause` - Pause session
- `POST /api/v1/quizzes/sessions/:id/resume` - Resume session
- `GET /api/v1/quizzes/sessions/stats/user` - Get user stats

#### Flashcards
- `POST /api/v1/flashcards/progress` - Record review (SM2)
- `GET /api/v1/flashcards/due` - Get due flashcards
- `GET /api/v1/flashcards/new` - Get new flashcards
- `GET /api/v1/flashcards/stats` - Get study statistics
- `GET /api/v1/flashcards/forecast` - Get review forecast
- `POST /api/v1/flashcards/progress/bulk` - Initialize flashcards

#### Books
- `GET /api/v1/books` - Get all books
- `GET /api/v1/books/:id` - Get book by ID
- `POST /api/v1/books/:id/progress` - Update reading progress
- `POST /api/v1/books/:id/complete` - Mark as completed
- `POST /api/v1/books/:id/highlights` - Create highlight
- `GET /api/v1/books/:id/highlights` - Get highlights
- `POST /api/v1/books/:id/bookmarks` - Create bookmark
- `GET /api/v1/books/:id/bookmarks` - Get bookmarks
- `GET /api/v1/books/stats/reading` - Get reading stats

#### Analytics
- `GET /api/v1/analytics/dashboard` - Get dashboard stats
- `GET /api/v1/analytics/categories/:category` - Category analytics
- `GET /api/v1/analytics/categories` - All category performance
- `GET /api/v1/analytics/trends` - Performance trends
- `GET /api/v1/analytics/activity` - Recent activity

#### AI Chat
- `POST /api/v1/ai-chat/sessions` - Create chat session
- `GET /api/v1/ai-chat/sessions` - Get all sessions
- `GET /api/v1/ai-chat/sessions/:id` - Get session with messages
- `POST /api/v1/ai-chat/sessions/:id/messages` - Send message
- `DELETE /api/v1/ai-chat/sessions/:id` - Delete session
- `POST /api/v1/ai-chat/explain-question` - Explain quiz question
- `GET /api/v1/ai-chat/study-tips/:category` - Get study tips

#### Stripe
- `POST /api/v1/stripe/webhook` - Stripe webhook handler
- `POST /api/v1/stripe/create-checkout-session` - Create checkout
- `POST /api/v1/stripe/create-portal-session` - Customer portal

### Example Requests

**Register User**
```bash
curl -X POST http://localhost:3001/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "student@example.com",
    "password": "securepass123",
    "fullName": "Jane Doe"
  }'
```

**Get Random Questions**
```bash
curl http://localhost:3001/api/v1/questions/random?count=10&category=Pharmacology \
  -H "Authorization: Bearer <token>"
```

**Record Flashcard Review**
```bash
curl -X POST http://localhost:3001/api/v1/flashcards/progress \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "flashcardId": "abc123",
    "quality": 4,
    "timeSpent": 30
  }'
```

## Environment Variables

See `.env.example` for all configuration options.

Required variables:
- `DATABASE_URL` - MariaDB connection string
- `JWT_SECRET` - Secret for JWT signing
- `STRIPE_SECRET_KEY` - Stripe API key
- `STRIPE_WEBHOOK_SECRET` - Stripe webhook secret

Optional variables:
- `OPENAI_API_KEY` - For AI chat
- `ANTHROPIC_API_KEY` - For AI chat
- `CORS_ORIGIN` - Allowed origins

## Database

### Schema Management

```bash
# Generate Prisma client after schema changes
npm run prisma:generate

# Create and apply new migration
npx prisma migrate dev --name migration_name

# Apply migrations in production
npx prisma migrate deploy

# View database in GUI
npm run prisma:studio
```

### Database Models

- `User` - User accounts
- `Subscription` - Stripe subscriptions
- `Question` - Question bank
- `QuizSession` - Quiz attempts
- `QuestionUsage` - Answer tracking
- `Flashcard` - Flashcard content
- `FlashcardProgress` - SM2 progress
- `Book` - Study books
- `BookProgress` - Reading progress
- `Highlight` - Book highlights
- `Bookmark` - Book bookmarks
- `AIChatSession` - Chat sessions
- `AIChatMessage` - Chat messages

## Development

### Run in Development Mode

```bash
npm run dev
```

Uses `tsx` for hot reload on file changes.

### Build for Production

```bash
npm run build
npm start
```

### Testing

```bash
npm test
```

### Linting

```bash
npm run lint
```

## Docker Deployment

### Using Docker Compose

```bash
# Start all services (API + MariaDB)
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Build Docker Image

```bash
docker build -t haven-api .
```

See `DEPLOYMENT_GUIDE.md` for complete deployment instructions.

## Production Deployment

Comprehensive deployment guides for:
- AWS EC2 + RDS
- AWS ECS + Fargate
- Hetzner Cloud
- Docker on any VPS

See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)

## Security

- JWT authentication with bcrypt password hashing
- Helmet.js security headers
- CORS protection
- SQL injection prevention via Prisma
- Rate limiting recommended for production
- Environment-based secrets
- Stripe webhook signature verification

## Performance

- Prisma query optimization
- Database indexing on frequently queried fields
- Efficient SM2 algorithm for flashcard scheduling
- Parallel data fetching where applicable
- Connection pooling via Prisma

## Monitoring

- Health check endpoint: `/health`
- Request logging via Morgan
- Error logging and handling
- PM2 process management recommended
- CloudWatch/custom logging integration ready

## Contributing

1. Create feature branch
2. Make changes
3. Run tests and linting
4. Submit pull request

## License

MIT

## Support

For issues or questions, contact the development team.

---

Built with ❤️ for nursing students preparing for the NCLEX
