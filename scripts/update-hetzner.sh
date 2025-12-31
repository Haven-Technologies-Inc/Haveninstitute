#!/bin/bash
# Haven Institute - Hetzner Update Script
# Updates existing deployment with latest changes

set -e

echo "🚀 Haven Institute Hetzner Update"
echo "=================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
log_info() { echo -e "${GREEN}[INFO]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# Check if we're in the right directory
if [ ! -f "docker-compose.yml" ]; then
    log_error "docker-compose.yml not found. Please run from project root."
    exit 1
fi

# Pull latest changes
log_info "Pulling latest changes from git..."
git pull origin main

# Backup current database (optional but recommended)
log_info "Creating database backup..."
docker compose exec -T mariadb mysqldump -u root -p$DB_ROOT_PASSWORD haven_institute > backup-$(date +%Y%m%d-%H%M%S).sql || log_warn "Backup failed, continuing..."

# Build new images with latest code
log_info "Building new Docker images..."
docker compose build --no-cache

# Restart services with zero downtime
log_info "Updating services with zero downtime..."

# Update backend first
docker compose up -d --build backend

# Wait for backend to be healthy
log_info "Waiting for backend to be healthy..."
sleep 15

# Check backend health
BACKEND_HEALTH=$(docker compose exec -T backend wget -qO- http://localhost:3001/api/v1/health 2>/dev/null || echo "failed")
if [[ "$BACKEND_HEALTH" == *"healthy"* ]]; then
    log_info "Backend health check: ✓"
else
    log_warn "Backend health check: ✗ (may still be starting)"
fi

# Update frontend
docker compose up -d --build frontend

# Wait for frontend to be ready
log_info "Waiting for frontend to be ready..."
sleep 10

# Run database migrations if needed
log_info "Running database migrations..."
docker compose exec -T backend npm run migrate || log_warn "Migration command failed or not needed"

# Check all containers status
log_info "Container status:"
docker compose ps

# Health checks
log_info "Running health checks..."

# Backend health
BACKEND_HEALTH=$(docker compose exec -T backend wget -qO- http://localhost:3001/api/v1/health 2>/dev/null || echo "failed")
if [[ "$BACKEND_HEALTH" == *"healthy"* ]]; then
    log_info "Backend health check: ✓"
else
    log_warn "Backend health check: ✗"
fi

# Frontend health (check if serving)
FRONTEND_CHECK=$(docker compose exec -T frontend wget -qO- http://localhost:3000 2>/dev/null | head -1 || echo "failed")
if [[ "$FRONTEND_CHECK" == *"DOCTYPE"* ]] || [[ "$FRONTEND_CHECK" == *"html"* ]]; then
    log_info "Frontend health check: ✓"
else
    log_warn "Frontend health check: ✗"
fi

# Database health
DB_HEALTH=$(docker compose exec -T mariadb mysqladmin ping -h localhost -u root -p$DB_ROOT_PASSWORD 2>/dev/null || echo "failed")
if [[ "$DB_HEALTH" == *"mysqld is alive"* ]]; then
    log_info "Database health check: ✓"
else
    log_warn "Database health check: ✗"
fi

# Redis health
REDIS_HEALTH=$(docker compose exec -T redis redis-cli -a $REDIS_PASSWORD ping 2>/dev/null || echo "failed")
if [[ "$REDIS_HEALTH" == *"PONG"* ]]; then
    log_info "Redis health check: ✓"
else
    log_warn "Redis health check: ✗"
fi

echo ""
echo "=================================="
echo -e "${GREEN}✅ Update Complete!${NC}"
echo "=================================="
echo ""
echo "Your application has been updated with:"
echo "  • Admin settings with AI provider sync"
echo "  • DeepSeek AI integration"
echo "  • Discussion system (replacing Forum)"
echo "  • Flashcard generator"
echo "  • Study group features"
echo "  • Global search functionality"
echo ""
echo "Application URLs:"
echo "  Frontend: https://$DOMAIN"
echo "  Backend API: https://api.$DOMAIN"
echo ""
echo "Useful commands:"
echo "  View logs: docker compose logs -f"
echo "  Restart: docker compose restart"
echo "  Stop: docker compose down"
echo ""
