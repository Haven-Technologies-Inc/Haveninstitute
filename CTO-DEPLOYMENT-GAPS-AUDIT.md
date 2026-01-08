# Haven Institute - CTO Deployment Gaps Audit

**Date:** January 8, 2026
**Scope:** CI/CD Pipeline, Hetzner Deployment, Production Readiness
**Status:** DEPLOYMENT FAILING - CRITICAL ISSUES IDENTIFIED

---

## EXECUTIVE SUMMARY

The Haven Institute deployment to Hetzner via GitHub CI/CD is failing due to **multiple critical configuration issues**. This audit identifies all gaps, missing components, broken routes, and production readiness problems.

### Overall Deployment Status: FAILING

| Component | Status | Severity |
|-----------|--------|----------|
| CI/CD Workflow | BROKEN | CRITICAL |
| Docker Build | BROKEN | CRITICAL |
| Environment Secrets | MISSING | CRITICAL |
| Frontend Build | MISCONFIGURED | HIGH |
| Backend Health | PARTIAL | HIGH |
| Database Init | MISSING | CRITICAL |

---

## CRITICAL DEPLOYMENT ISSUES

### 1. CI/CD Workflow Path Mismatch (CRITICAL)

**File:** `.github/workflows/deploy.yml:23`

```yaml
# PROBLEM: Path doesn't exist on server
script: |
  cd ~/apps/Haveninstitute  # <-- Server path
```

**Issue:** The deploy script references `/path/to/Haveninstitute` and `~/apps/Haveninstitute` but the actual deployment path is not verified.

**Fix Required:**
- Verify actual path on Hetzner server
- Update all CI/CD scripts to use consistent paths
- Create deployment directory if missing

---

### 2. GitHub Secrets Not Configured (CRITICAL)

**Required Secrets (NOT SET):**

| Secret Name | Used In | Status |
|-------------|---------|--------|
| `HETZNER_HOST` | deploy.yml | REQUIRED |
| `HETZNER_USERNAME` | deploy.yml | REQUIRED |
| `HETZNER_SSH_KEY` | deploy.yml | REQUIRED |
| `DB_ROOT_PASSWORD` | ci-cd.yml | REQUIRED |
| `DB_PASSWORD` | docker-compose | REQUIRED |
| `REDIS_PASSWORD` | docker-compose | REQUIRED |
| `JWT_SECRET` | backend | REQUIRED |
| `JWT_REFRESH_SECRET` | backend | REQUIRED |
| `STRIPE_SECRET_KEY` | backend | REQUIRED |
| `STRIPE_PUBLISHABLE_KEY` | frontend | REQUIRED |
| `STRIPE_WEBHOOK_SECRET` | backend | REQUIRED |
| `OPENAI_API_KEY` | AI service | REQUIRED |
| `SLACK_WEBHOOK_URL` | notifications | OPTIONAL |

---

### 3. Dockerfile Build Error - Frontend (CRITICAL)

**File:** `Dockerfile:41`

```dockerfile
# PROBLEM: Wrong build output directory
COPY --from=builder /app/build /usr/share/nginx/html
#                       ^^^^^ Vite outputs to 'dist', not 'build'
```

**Fix Required:**
```dockerfile
COPY --from=builder /app/dist /usr/share/nginx/html
```

---

### 4. Missing nginx Health Endpoint (CRITICAL)

**File:** `nginx/default.conf`

The nginx config has a `/health` endpoint but it's not properly configured for the Docker healthcheck:

```nginx
location /health {
    access_log off;
    return 200 '{"status":"healthy"}';
    add_header Content-Type application/json;
}
```

**Issue:** The Dockerfile healthcheck uses wget but nginx isn't returning proper JSON.

---

### 5. Root .env File Missing (CRITICAL)

**File:** `.env` (DOES NOT EXIST)

The `docker-compose.yml` expects environment variables that are not provided:

```yaml
# docker-compose.yml references these without defaults:
- VITE_API_URL=${VITE_API_URL}
- VITE_WS_URL=${VITE_WS_URL}
- DOMAIN=${DOMAIN}
- DB_ROOT_PASSWORD=${DB_ROOT_PASSWORD}
```

**Fix Required:** Create production `.env` file or use GitHub secrets properly.

---

### 6. Database Initialization Missing (CRITICAL)

**Files Expected:** `./database/init/` directory

```yaml
# docker-compose.yml:76
volumes:
  - ./database/init:/docker-entrypoint-initdb.d
```

**Issue:** The `database/init/` directory does not exist. Database won't initialize.

**Fix Required:**
- Create `/database/init/` directory
- Copy schema from `backend/src/database/schema.sql`
- Or run migrations after container starts

---

### 7. Health Check Path Mismatch (HIGH)

**Backend Dockerfile:**
```dockerfile
# backend/Dockerfile:48
HEALTHCHECK ... CMD node -e "require('http').get('http://localhost:3001/api/v1/health'..."
```

**CI/CD deploy.yml:**
```bash
# deploy.yml:82
curl -sf http://localhost:3001/health
#                              ^^^^^^ Missing /api/v1 prefix
```

**Fix Required:** Use consistent health check path `/api/v1/health`

---

## FRONTEND ISSUES

### 8. Two Conflicting Frontend Codebases

The project has TWO separate frontend implementations:

| Location | Framework | Status |
|----------|-----------|--------|
| `/src/` (root) | React + Vite | MAIN - Feature complete |
| `/frontend/` | React + Vite | STUB - Chat only |

**Problem:** Build scripts don't specify which frontend to build.

**Root package.json:**
```json
"scripts": {
  "dev": "vite",
  "build": "vite build"
}
```

**frontend/package.json:**
```json
"scripts": {
  "dev": "vite",
  "build": "tsc -b && vite build"
}
```

**CI/CD builds from ROOT** - This is correct.

---

### 9. API Client Hardcoded URL (HIGH)

**File:** `frontend/src/api/client.ts:3`

```typescript
export const API_URL = 'http://localhost:3001/api/v1';
// ^^^^^^^^^ Hardcoded localhost - will fail in production
```

**Fix Required:** Use environment variables:
```typescript
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api/v1';
```

---

### 10. Missing VITE Build Args (HIGH)

**File:** `docker-compose.yml:11-14`

```yaml
args:
  - VITE_API_URL=${VITE_API_URL}
  - VITE_WS_URL=${VITE_WS_URL}
  - VITE_STRIPE_PUBLISHABLE_KEY=${VITE_STRIPE_PUBLISHABLE_KEY}
```

These are not being passed during CI/CD build:

**File:** `.github/workflows/ci-cd.yml:169-178`
```yaml
- name: Build and push frontend image
  uses: docker/build-push-action@v5
  with:
    context: .
    file: ./Dockerfile
    # NO build-args SPECIFIED!
```

---

## BACKEND ISSUES

### 11. Redis Connection Not Initialized in Server

**File:** `backend/src/server.ts`

```typescript
// Redis is imported in config but NOT connected on startup
import { websocketService } from './services/websocket.service';
// Missing: import { connectRedis } from './config/redis';

async function startServer() {
  await connectDatabase();  // Database is connected
  // connectRedis(); <-- MISSING!
}
```

**Services using Redis will FAIL silently**

---

### 12. Missing Routes (Not Registered)

The routes index doesn't register all available routes:

**Defined but NOT imported in `/backend/src/routes/index.ts`:**
- `health.routes.ts` - NOT REGISTERED at `/health`
- `studyPlanner.routes.ts` - NOT REGISTERED
- `quiz.routes.ts` - NOT REGISTERED
- `studyGroup.routes.ts` - NOT REGISTERED

**Current registration:**
```typescript
// Routes are imported but health.routes NOT included!
import healthRoutes from './health.routes';  // <-- NOT FOUND in imports
```

---

### 13. CORS Double Configuration

**File:** `backend/src/app.ts`

CORS is configured both via helmet and cors middleware:

```typescript
app.use(helmet({ ... }));  // Includes some CORS headers
app.use(cors({ ... }));    // Full CORS config
```

This can cause conflicts. Should use only one.

---

### 14. Missing Backend Migration Script

**File:** `backend/package.json`

```json
"scripts": {
  "migrate": "ts-node src/database/migrate.ts",
}
```

**But `src/database/migrate.ts` does NOT exist!**

Files that exist:
- `src/database/migrations/run-migrations.ts`
- `src/database/migrations/run-migration-006.ts`

**CI/CD runs:** `npm run migrate` - THIS WILL FAIL

---

## DOCKER CONFIGURATION ISSUES

### 15. Conflicting Docker Compose Files

| File | Purpose | Status |
|------|---------|--------|
| `docker-compose.yml` | Production | Uses Caddy |
| `docker-compose.ci.yml` | CI/CD | Uses Caddy + Traefik labels |
| `docker-compose.dev.yml` | Development | Different config |
| `backend/docker-compose.yml` | Backend only | Standalone |

**Problem:** CI/CD workflow uses main `docker-compose.yml` but references services that may not exist.

---

### 16. Traefik Labels Without Traefik Service

**File:** `docker-compose.yml:22-25`

```yaml
labels:
  - "traefik.enable=true"
  - "traefik.http.routers.frontend.rule=Host(`${DOMAIN}`)"
```

**But Traefik is NOT defined as a service!** Only Caddy exists.

These labels are ignored - not harmful but confusing.

---

### 17. Missing SSL Certificate Volume Mounts

**Backend expects Apple Sign-In certificate:**

```env
APPLE_PRIVATE_KEY_PATH=/app/certs/apple_private_key.p8
```

But NO volume mounts this certificate in any docker-compose file.

---

## SECURITY ISSUES

### 18. Production Secrets in Repository

**File:** `backend/.env.production`

Contains template secrets that should NOT be in git:

```env
JWT_SECRET=${JWT_SECRET}
OPENAI_API_KEY=YOUR_OPENAI_API_KEY_HERE
```

**This file is committed to the repository** - security risk.

---

### 19. Weak Default Rate Limits

**File:** `backend/.env.production:79`

```env
RATE_LIMIT_MAX_REQUESTS=50  # Per 15 minutes
AUTH_RATE_LIMIT_MAX_REQUESTS=10  # Per 15 minutes
```

Too low for production - will block legitimate users.

**Recommended:**
```env
RATE_LIMIT_MAX_REQUESTS=200
AUTH_RATE_LIMIT_MAX_REQUESTS=50
```

---

## MISSING COMPONENTS

### 20. No Database Migration Runner

The backend has migration SQL files but no automated runner:

```
backend/src/database/migrations/
├── 001_create_questions_table.sql
├── 002_create_cat_tables.sql
├── 003_create_quiz_tables.sql
├── 004_create_analytics_tables.sql
├── 005_seed_questions.sql
└── 006_create_remaining_tables.sql
```

**No script to run these in order during deployment.**

---

### 21. No Backup Script Integration

**File:** `backend/.env.production:119-121`

```env
BACKUP_ENABLED=true
BACKUP_SCHEDULE=0 2 * * *
BACKUP_RETENTION_DAYS=30
```

But NO backup service or cron job is configured in Docker.

---

### 22. Missing Log Aggregation

Logs go to local files only:

```env
LOG_FILE_PATH=./logs
```

No log rotation, no external log shipping (ELK, CloudWatch, etc.)

---

## IMMEDIATE FIX CHECKLIST

### Priority 1: Unblock Deployment

1. **Configure GitHub Secrets** (see section 2)
2. **Fix Dockerfile build path**: Change `/app/build` to `/app/dist`
3. **Create database init directory**: `mkdir database/init`
4. **Fix health check path in deploy.yml**: Use `/api/v1/health`
5. **Add build-args to CI/CD workflow** for VITE variables

### Priority 2: Fix Configuration

6. **Create production .env file** on server
7. **Fix frontend API client** to use env variables
8. **Add Redis connection** to server startup
9. **Register missing routes** in backend

### Priority 3: Infrastructure

10. **Set up database migrations** runner
11. **Configure backup service**
12. **Add log rotation/aggregation**
13. **Remove Traefik labels** or add Traefik service

---

## RECOMMENDED CI/CD WORKFLOW FIX

```yaml
# .github/workflows/deploy.yml - CORRECTED
name: Deploy to Hetzner

on:
  push:
    branches: [main]
  workflow_dispatch:

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to Hetzner VPS
        uses: appleboy/ssh-action@v1.0.3
        with:
          host: ${{ secrets.HETZNER_HOST }}
          username: ${{ secrets.HETZNER_USERNAME }}
          key: ${{ secrets.HETZNER_SSH_KEY }}
          port: 22
          command_timeout: 10m
          script: |
            # Use correct path
            cd /root/apps/Haveninstitute || cd ~/Haveninstitute || exit 1

            # Pull latest code
            git fetch origin main
            git reset --hard origin/main

            # Create .env if missing
            if [ ! -f .env ]; then
              cp .env.example .env
              echo "WARNING: Using example env - configure secrets!"
            fi

            # Ensure database init exists
            mkdir -p database/init
            cp backend/src/database/schema.sql database/init/01_schema.sql 2>/dev/null || true

            # Build and deploy
            docker compose down
            docker compose build --no-cache
            docker compose up -d

            # Wait for services
            sleep 30

            # Health check with correct path
            curl -sf http://localhost:3001/api/v1/health || exit 1

            # Run migrations
            docker compose exec -T backend npm run db:migrate 2>/dev/null || echo "Migrations skipped"

            echo "Deployment complete!"
```

---

## ENVIRONMENT VARIABLES REQUIRED

### Server .env (Production)

```env
# Domain
DOMAIN=havenstudy.com

# Frontend Build
VITE_API_URL=https://api.havenstudy.com/api/v1
VITE_WS_URL=wss://api.havenstudy.com
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_xxx
VITE_APP_ENV=production

# Database
DB_NAME=haven_institute
DB_USER=haven_user
DB_PASSWORD=SECURE_PASSWORD_HERE
DB_ROOT_PASSWORD=SECURE_ROOT_PASSWORD_HERE

# Redis
REDIS_PASSWORD=SECURE_REDIS_PASSWORD_HERE

# JWT (Generate with: openssl rand -hex 32)
JWT_SECRET=GENERATED_64_CHAR_HEX
JWT_REFRESH_SECRET=GENERATED_64_CHAR_HEX

# Stripe
STRIPE_SECRET_KEY=sk_live_xxx
STRIPE_PUBLISHABLE_KEY=pk_live_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx

# AI
OPENAI_API_KEY=sk-xxx
```

---

## CONCLUSION

The deployment is failing due to:

1. **Missing GitHub secrets** - Cannot SSH to server
2. **Wrong Dockerfile build output path** - `/app/build` should be `/app/dist`
3. **Missing database init directory** - Container won't start
4. **Health check path mismatch** - Deployment marked as failed
5. **Missing Redis initialization** - Services fail silently

**Estimated Fix Time:** 2-4 hours for critical issues

---

*Report generated by CTO Audit - January 8, 2026*
