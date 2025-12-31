# Haven Institute Deployment Guide

## Overview
This guide covers deploying Haven Institute to production using Docker containers on a cloud server (recommended: Hetzner VPS).

## Prerequisites
- Docker & Docker Compose installed
- Domain name pointing to your server
- SSL certificates (handled automatically by Caddy)
- Production API keys for Stripe, OpenAI/DeepSeek, etc.

## Quick Deploy (Docker Compose)

### 1. Server Setup
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

### 2. Clone Repository
```bash
git clone https://github.com/Haven-Technologies-Inc/Haveninstitute.git
cd Haveninstitute
```

### 3. Configure Environment
```bash
# Copy environment template
cp .env.example .env

# Edit with your production values
nano .env
```

**Required Environment Variables:**
```env
# Domain
DOMAIN=yourdomain.com

# Database
DB_NAME=haven_institute
DB_USER=haven_user
DB_PASSWORD=your_secure_password
DB_ROOT_PASSWORD=your_root_password

# Redis
REDIS_PASSWORD=your_redis_password

# Email for SSL
ACME_EMAIL=admin@yourdomain.com

# Stripe (Production)
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# AI Provider Keys
DEEPSEEK_API_KEY=sk-...
OPENAI_API_KEY=sk-...
GROK_API_KEY=xai-...
```

### 4. Deploy
```bash
# Make deploy script executable
chmod +x scripts/deploy.sh

# Run deployment
./scripts/deploy.sh production
```

## Manual Deployment Steps

### 1. Build Frontend
```bash
# Install dependencies
npm install

# Build for production
npm run build
```

### 2. Build Backend
```bash
cd backend

# Install dependencies
npm install

# Build TypeScript
npm run build

# Run migrations
npm run migrate
```

### 3. Start Services
```bash
# Start all containers
docker compose up -d

# Check status
docker compose ps

# View logs
docker compose logs -f
```

## Environment Configuration

### Frontend (.env)
```env
VITE_API_URL=https://api.yourdomain.com/api/v1
VITE_WS_URL=wss://api.yourdomain.com
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...
VITE_APP_ENV=production
```

### Backend (backend/.env.production)
```env
NODE_ENV=production
DB_HOST=mariadb
DB_PORT=3306
DB_NAME=haven_institute
DB_USER=haven_user
DB_PASSWORD=your_secure_password

# AI Provider (Primary: DeepSeek)
AI_PROVIDER=deepseek
DEEPSEEK_API_KEY=sk-...
DEEPSEEK_MODEL=deepseek-chat

# OpenAI (Secondary)
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4o-mini

# Grok (Tertiary)
GROK_API_KEY=xai-...
GROK_MODEL=grok-beta

# Stripe
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# JWT
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d
```

## Service URLs After Deployment

- **Frontend**: https://yourdomain.com
- **Backend API**: https://api.yourdomain.com
- **Database**: localhost:3306 (internal)
- **Redis**: localhost:6379 (internal)

## SSL Certificates

SSL certificates are automatically handled by Caddy reverse proxy using Let's Encrypt.

## Monitoring

### Check Service Health
```bash
# Backend health
curl https://api.yourdomain.com/api/v1/health

# Container status
docker compose ps

# Resource usage
docker stats
```

### Logs
```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f backend
docker compose logs -f frontend
```

## Troubleshooting

### Common Issues

1. **Container won't start**
   ```bash
   # Check logs
   docker compose logs service-name
   
   # Restart
   docker compose restart service-name
   ```

2. **Database connection failed**
   ```bash
   # Check MariaDB container
   docker compose logs mariadb
   
   # Verify environment variables
   docker compose exec backend env | grep DB_
   ```

3. **SSL certificate issues**
   ```bash
   # Check Caddy logs
   docker compose logs caddy
   
   # Restart Caddy
   docker compose restart caddy
   ```

### Reset Deployment
```bash
# Stop all services
docker compose down

# Remove volumes (WARNING: Deletes data)
docker compose down -v

# Rebuild and start
docker compose build --no-cache
docker compose up -d
```

## Production Optimizations

### Database
- Enable query caching
- Set up read replicas for scaling
- Regular backups

### Backend
- Enable Redis caching
- Set up monitoring
- Configure rate limiting

### Frontend
- Enable CDN
- Optimize bundle size
- Enable compression

## Security

1. **Change default passwords**
2. **Use strong API keys**
3. **Enable firewall**
4. **Regular updates**
5. **Monitor access logs**

## Backup Strategy

### Database Backup
```bash
# Create backup
docker compose exec mariadb mysqldump -u root -p haven_institute > backup.sql

# Restore backup
docker compose exec -i mariadb mysql -u root -p haven_institute < backup.sql
```

### File Backup
```bash
# Backup volumes
docker run --rm -v haveninstitute_mariadb_data:/data -v $(pwd):/backup ubuntu tar cvf /backup/mariadb_backup.tar /data
```

## Scaling

### Horizontal Scaling
- Load balancer setup
- Multiple backend instances
- Database clustering

### Vertical Scaling
- Increase server resources
- Optimize database queries
- Enable caching

## Support

For deployment issues:
1. Check logs: `docker compose logs -f`
2. Verify environment variables
3. Check resource usage
4. Review this guide

## Domain Configuration

Point your domain A records to your server IP:
- `yourdomain.com` → Server IP
- `api.yourdomain.com` → Server IP
- `www.yourdomain.com` → Server IP

## Performance Monitoring

Monitor these metrics:
- CPU/Memory usage
- Database response time
- API response times
- Error rates
- User activity
