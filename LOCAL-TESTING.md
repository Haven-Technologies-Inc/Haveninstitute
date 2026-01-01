# 🚀 Haven Institute Local Testing Guide

## 📋 Prerequisites

1. **Node.js 18+** - [Download here](https://nodejs.org/)
2. **MySQL Server** - [Download here](https://dev.mysql.com/downloads/mysql/) or use XAMPP/MAMP
3. **Redis (Optional)** - [Download here](https://redis.io/download) for caching/sessions

## 🛠️ Setup Steps

### 1. Database Setup

```bash
# Start MySQL server
# Run the database setup script
mysql -u root -p < database-setup.sql
```

### 2. Environment Configuration

```bash
# Copy the local environment file
cp .env.local .env

# Edit .env with your local settings
# - Database credentials
# - Google OAuth (if needed)
# - Stripe test keys (if needed)
```

### 3. Install Dependencies & Build

```bash
# Run the setup script
chmod +x scripts/test-local.sh
./scripts/test-local.sh
```

## 🚀 Start Development Servers

### Terminal 1 - Backend API

```bash
cd backend
npm run dev
```

**Backend runs on:** http://localhost:3001

### Terminal 2 - Frontend

```bash
npm run dev
```

**Frontend runs on:** http://localhost:5173

## 🧪 Testing Checklist

### ✅ Basic Functionality

- [ ] Frontend loads at <http://localhost:5173>
- [ ] Backend health check: <http://localhost:3001/api/v1/health>
- [ ] Database connection working
- [ ] User registration/login works

### ✅ Key Features to Test

- [ ] User authentication (register/login)
- [ ] Dashboard navigation
- [ ] CAT Engine integration
- [ ] Flashcard system
- [ ] Discussion forums
- [ ] Admin panel (if admin user)

### ✅ API Endpoints to Test

```bash
# Health check
curl http://localhost:3001/api/v1/health

# Auth endpoints
curl -X POST http://localhost:3001/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","fullName":"Test User"}'

# Get categories
curl http://localhost:3001/api/v1/discussions/categories
```

## 🔧 Common Issues & Solutions

### Database Connection Issues
```bash
# Check MySQL is running
mysql -u root -p -e "SHOW DATABASES;"

# Reset database if needed
mysql -u root -p -e "DROP DATABASE IF EXISTS haven_institute_local;"
mysql -u root -p < database-setup.sql
```

### Port Conflicts
```bash
# Kill processes on ports 3001 and 5173
npx kill-port 3001
npx kill-port 5173
```

### Permission Issues
```bash
# Make scripts executable
chmod +x scripts/*.sh
```

## 📊 Monitoring & Logs

### Backend Logs
- Check terminal output for API requests
- Database queries logged to console
- Error details in terminal

### Frontend Logs
- Browser Developer Tools (F12)
- Network tab for API calls
- Console for JavaScript errors

## 🧪 Development Tools

### Database Management
- **phpMyAdmin** (if using XAMPP)
- **MySQL Workbench** (official tool)
- **DBeaver** (cross-platform)

### API Testing
- **Postman** or **Insomnia** for API testing
- **curl** commands for quick tests

### Frontend Debugging
- Chrome DevTools
- React Developer Tools (browser extension)

## 🚨 Troubleshooting

### "Cannot connect to database"
1. Ensure MySQL server is running
2. Check credentials in .env file
3. Verify database was created

### "Port already in use"
1. Kill existing processes: `npx kill-port 3001`
2. Or change PORT in .env file

### "Module not found" errors
1. Run `npm install` in both root and backend directories
2. Clear node_modules and reinstall if needed

### CORS errors
1. Ensure frontend URL is in backend CORS settings
2. Check VITE_API_URL in .env.local

## 📝 Next Steps

Once local testing is complete:
1. ✅ Verify all core functionality works
2. ✅ Test admin features
3. ✅ Check error handling
4. ✅ Validate data persistence
5. ✅ Test with different user roles
6. 🚀 Ready for staging deployment!

---

**Need help?** Check the terminal output for detailed error messages, or review the logs in both frontend and backend terminals.
