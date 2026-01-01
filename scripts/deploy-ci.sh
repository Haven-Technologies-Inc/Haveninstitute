#!/bin/bash
# Haven Institute - CI/CD Deployment Script
# Used by GitHub Actions for automated deployment

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
log_info() { echo -e "${GREEN}[INFO]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }
log_step() { echo -e "${BLUE}[STEP]${NC} $1"; }

# Configuration
PROJECT_DIR="${PROJECT_DIR:-/opt/haveninstitute}"
BACKUP_DIR="${PROJECT_DIR}/backups"
LOG_FILE="${PROJECT_DIR}/logs/deploy.log"

# Ensure log directory exists
mkdir -p "$(dirname "$LOG_FILE")"
mkdir -p "$BACKUP_DIR"

# Log everything
exec > >(tee -a "$LOG_FILE")
exec 2>&1

log_step "Starting Haven Institute CI/CD Deployment"
echo "Timestamp: $(date)"
echo "Branch: ${BRANCH:-main}"
echo "Commit: ${COMMIT_SHA:-latest}"
echo "=================================="

# Navigate to project directory
cd "$PROJECT_DIR"

# Health check before deployment
log_step "Running pre-deployment health check..."
if docker compose ps | grep -q "Up"; then
    log_info "Services are running, proceeding with deployment"
else
    log_warn "Some services are down, proceeding anyway"
fi

# Create database backup
log_step "Creating database backup..."
BACKUP_FILE="$BACKUP_DIR/backup-$(date +%Y%m%d-%H%M%S).sql"
if docker compose exec -T mariadb mysqldump -u root -p"$DB_ROOT_PASSWORD" haven_institute > "$BACKUP_FILE"; then
    log_info "Database backup created: $BACKUP_FILE"
else
    log_error "Failed to create database backup"
    exit 1
fi

# Pull latest changes
log_step "Pulling latest changes from repository..."
git pull origin "${BRANCH:-main}"

# Update environment variables if needed
if [ -f ".env.ci" ]; then
    log_step "Updating environment configuration..."
    cp .env.ci .env.production
    
    # Update image tags
    if [ -n "$IMAGE_TAG" ]; then
        sed -i "s|FRONTEND_IMAGE=.*|FRONTEND_IMAGE=ghcr.io/haven-technologies-inc/haveninstitute-frontend:$IMAGE_TAG|" .env.production
        sed -i "s|BACKEND_IMAGE=.*|BACKEND_IMAGE=ghcr.io/haven-technologies-inc/haveninstitute-backend:$IMAGE_TAG|" .env.production
    fi
fi

# Pull new Docker images
log_step "Pulling new Docker images..."
docker compose pull

# Zero-downtime deployment
log_step "Starting zero-downtime deployment..."

# Update backend first
log_info "Updating backend service..."
docker compose up -d --no-deps --scale backend=2 backend

# Wait for backend to be healthy
log_info "Waiting for backend health check..."
sleep 15

# Check backend health
BACKEND_HEALTH=$(curl -s --max-time 10 http://localhost:3001/api/v1/health || echo "failed")
if [[ "$BACKEND_HEALTH" == *"healthy"* ]]; then
    log_info "Backend health check passed"
else
    log_error "Backend health check failed"
    log_error "Response: $BACKEND_HEALTH"
    
    # Rollback
    log_warn "Rolling back deployment..."
    docker compose rollback || docker compose up -d --no-deps backend
    exit 1
fi

# Run database migrations
log_step "Running database migrations..."
if docker compose exec -T backend npm run migrate; then
    log_info "Database migrations completed"
else
    log_warn "Migration failed or not needed"
fi

# Update frontend
log_info "Updating frontend service..."
docker compose up -d --no-deps frontend

# Wait for frontend to be ready
log_info "Waiting for frontend to be ready..."
sleep 10

# Check frontend health
FRONTEND_CHECK=$(curl -s --max-time 10 http://localhost:3000 | head -1 || echo "failed")
if [[ "$FRONTEND_CHECK" == *"DOCTYPE"* ]] || [[ "$FRONTEND_CHECK" == *"html"* ]]; then
    log_info "Frontend health check passed"
else
    log_error "Frontend health check failed"
    exit 1
fi

# Scale back to normal
log_step "Scaling services to normal levels..."
docker compose up -d --scale backend=1

# Clean up old images
log_step "Cleaning up old Docker images..."
docker image prune -f

# Final health checks
log_step "Running final health checks..."

# Check all containers
log_info "Container status:"
docker compose ps

# Database health
log_info "Checking database connection..."
DB_HEALTH=$(docker compose exec -T mariadb mysqladmin ping -h localhost -u root -p"$DB_ROOT_PASSWORD" 2>/dev/null || echo "failed")
if [[ "$DB_HEALTH" == *"mysqld is alive"* ]]; then
    log_info "Database health check: ✓"
else
    log_warn "Database health check: ✗"
fi

# Redis health
log_info "Checking Redis connection..."
REDIS_HEALTH=$(docker compose exec -T redis redis-cli -a "$REDIS_PASSWORD" ping 2>/dev/null || echo "failed")
if [[ "$REDIS_HEALTH" == *"PONG"* ]]; then
    log_info "Redis health check: ✓"
else
    log_warn "Redis health check: ✗"
fi

# Cleanup old backups (keep last 7 days)
log_step "Cleaning up old backups..."
find "$BACKUP_DIR" -name "backup-*.sql" -mtime +7 -delete

# Deployment summary
echo ""
echo "=================================="
log_info "🎉 Deployment Completed Successfully!"
echo "=================================="
echo "Deployment Details:"
echo "  - Branch: ${BRANCH:-main}"
echo "  - Commit: ${COMMIT_SHA:-latest}"
echo "  - Timestamp: $(date)"
echo "  - Backup: $BACKUP_FILE"
echo ""
echo "Service URLs:"
echo "  - Frontend: https://$DOMAIN"
echo "  - Backend API: https://api.$DOMAIN"
echo "  - Health Check: https://api.$DOMAIN/api/v1/health"
echo ""
echo "Useful Commands:"
echo "  - View logs: docker compose logs -f"
echo "  - Restart services: docker compose restart"
echo "  - Check status: docker compose ps"
echo ""

# Send notification (if webhook is configured)
if [ -n "$SLACK_WEBHOOK_URL" ]; then
    curl -X POST -H 'Content-type: application/json' \
        --data "{\"text\":\"🚀 Haven Institute Deployment Successful\\n• Environment: Production\\n• Branch: ${BRANCH:-main}\\n• Commit: ${COMMIT_SHA:-latest}\\n• Time: $(date)\\n• URL: https://$DOMAIN\"}" \
        "$SLACK_WEBHOOK_URL" || log_warn "Failed to send Slack notification"
fi

log_info "Deployment process completed successfully!"
