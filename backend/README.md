# Haven Institute Backend API

Production-ready NCLEX CAT (Computerized Adaptive Testing) backend built with Node.js, Express, TypeScript, and MariaDB.

## 🎯 Features

- ✅ **Complete Authentication System** with JWT and role-based access control
- ✅ **NCLEX CAT Algorithm** using Item Response Theory (IRT)
- ✅ **Subscription Management** with Stripe integration
- ✅ **AI-Powered Study Assistant** using OpenAI/DeepSeek
- ✅ **Comprehensive Security** with helmet, CORS, rate limiting
- ✅ **Advanced Error Handling** with detailed error codes
- ✅ **Request Logging** with Winston
- ✅ **Docker Support** for easy deployment
- ✅ **Database Migrations** for schema management
- ✅ **TypeScript** for type safety

## 📋 Prerequisites

- **Node.js** 18+ LTS
- **MariaDB** 10.11+
- **npm** or **yarn**
- **Docker** & **Docker Compose** (optional, for containerized deployment)

## 🚀 Quick Start

### 1. Clone and Install

```bash
cd backend
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
# Database
DB_HOST=localhost
DB_PORT=3306
DB_NAME=haven_institute
DB_USER=haven_user
DB_PASSWORD=your_secure_password

# JWT Secrets (generate strong secrets!)
JWT_SECRET=your_jwt_secret_min_32_chars
JWT_REFRESH_SECRET=your_refresh_secret_min_32_chars

# Stripe (get from https://dashboard.stripe.com)
STRIPE_SECRET_KEY=sk_test_xxxxx
STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx

# OpenAI (get from https://platform.openai.com)
OPENAI_API_KEY=sk-xxxxx
```

### 3. Setup Database

Create the database:

```sql
CREATE DATABASE haven_institute CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'haven_user'@'localhost' IDENTIFIED BY 'your_secure_password';
GRANT ALL PRIVILEGES ON haven_institute.* TO 'haven_user'@'localhost';
FLUSH PRIVILEGES;
```

Run migrations:

```bash
npm run migrate
npm run seed
```

### 4. Start Development Server

```bash
npm run dev
```

The API will be available at `http://localhost:3001`

## 🐳 Docker Deployment

### Using Docker Compose (Recommended)

```bash
# Start all services (database, redis, api)
docker-compose up -d

# View logs
docker-compose logs -f api

# Stop services
docker-compose down
```

### Manual Docker Build

```bash
# Build image
docker build -t haven-api .

# Run container
docker run -p 3001:3001 --env-file .env haven-api
```

## 📚 Project Structure

```
backend/
├── src/
│   ├── config/          # Configuration files
│   │   ├── database.ts
│   │   ├── jwt.ts
│   │   ├── stripe.ts
│   │   └── openai.ts
│   ├── models/          # Database models (Sequelize)
│   │   └── User.ts
│   ├── controllers/     # Route controllers
│   │   └── auth.controller.ts
│   ├── services/        # Business logic
│   │   ├── auth.service.ts
│   │   └── cat.service.ts
│   ├── middleware/      # Express middleware
│   │   ├── authenticate.ts
│   │   ├── errorHandler.ts
│   │   └── rateLimiter.ts
│   ├── routes/          # API routes
│   │   ├── auth.routes.ts
│   │   └── index.ts
│   ├── utils/           # Utility functions
│   │   ├── logger.ts
│   │   └── response.ts
│   ├── database/        # Database scripts
│   │   ├── schema.sql
│   │   ├── migrations/
│   │   └── seeds/
│   ├── app.ts           # Express app setup
│   └── server.ts        # Server entry point
├── tests/               # Test files
├── uploads/             # File uploads
├── logs/                # Application logs
├── .env.example         # Environment template
├── package.json
├── tsconfig.json
├── Dockerfile
└── docker-compose.yml
```

## 🔌 API Endpoints

### Authentication

```
POST   /api/v1/auth/register      Register new user
POST   /api/v1/auth/login          Login
POST   /api/v1/auth/refresh        Refresh access token
POST   /api/v1/auth/logout         Logout
GET    /api/v1/auth/me             Get current user
```

### Health Check

```
GET    /api/v1/health              API health status
```

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

## 📖 API Documentation

Full API documentation is available at `/api/v1/docs` when the server is running.

## 🔒 Security Features

- **Helmet.js** - Secure HTTP headers
- **CORS** - Cross-origin resource sharing
- **Rate Limiting** - Prevents abuse
- **JWT Authentication** - Secure token-based auth
- **bcrypt** - Password hashing (12 rounds)
- **Input Validation** - Prevents injection attacks
- **SQL Injection Protection** - Sequelize ORM
- **XSS Protection** - Content security policy

## 🎓 CAT Algorithm

The backend implements a full NCLEX CAT algorithm using:

- **3-Parameter Logistic (3PL) IRT Model**
- **Maximum Likelihood Estimation (MLE)** for ability estimation
- **Maximum Information Criterion** for question selection
- **95% Confidence Interval** stopping rule
- **Standard Error** calculation
- **Passing Probability** determination

## 🔧 Environment Variables

See `.env.example` for all available configuration options.

## 📝 Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm start            # Start production server
npm test             # Run tests
npm run lint         # Lint code
npm run migrate      # Run database migrations
npm run seed         # Seed database
```

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Write tests
4. Submit a pull request

## 📄 License

MIT License - See LICENSE file for details

## 🆘 Support

For issues or questions:
- Email: support@haveninstitute.com
- Documentation: https://docs.haveninstitute.com

## 🚀 Deployment

### Production Checklist

- [ ] Set strong JWT secrets
- [ ] Configure production database
- [ ] Set up Stripe webhooks
- [ ] Configure CORS for your domain
- [ ] Set up SSL/TLS certificates
- [ ] Configure logging
- [ ] Set up monitoring (e.g., Sentry)
- [ ] Enable database backups
- [ ] Configure rate limiting
- [ ] Review security headers

### Recommended Hosting

- **API**: AWS EC2, DigitalOcean, Heroku
- **Database**: AWS RDS, DigitalOcean Managed Database
- **Redis**: AWS ElastiCache, Redis Cloud
- **File Storage**: AWS S3, DigitalOcean Spaces

---

**Built with ❤️ by Haven Institute**
