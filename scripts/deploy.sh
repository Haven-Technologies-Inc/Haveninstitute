#!/bin/bash
# Haven Institute - Hetzner Deployment Script
# Usage: ./scripts/deploy.sh [production|staging]

set -e

ENVIRONMENT=${1:-production}
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

echo "🚀 Haven Institute Deployment Script"
echo "Environment: $ENVIRONMENT"
echo "Project Directory: $PROJECT_DIR"
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

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    log_error "Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    log_error "Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Navigate to project directory
cd "$PROJECT_DIR"

# Check for .env file
if [ ! -f ".env" ]; then
    log_warn ".env file not found. Copying from .env.docker template..."
    cp .env.docker .env
    log_error "Please edit .env with your production values before deploying!"
    exit 1
fi

# Load environment variables
source .env

# Validate required environment variables
REQUIRED_VARS=("DOMAIN" "DB_PASSWORD" "REDIS_PASSWORD" "ACME_EMAIL")
for var in "${REQUIRED_VARS[@]}"; do
    if [ -z "${!var}" ]; then
        log_error "Required environment variable $var is not set in .env"
        exit 1
    fi
done

log_info "Environment variables validated ✓"

# Pull latest changes (if using git)
if [ -d ".git" ]; then
    log_info "Pulling latest changes from git..."
    git pull origin main || log_warn "Git pull failed, continuing with local files"
fi

# Build and start containers
log_info "Building Docker images..."
docker compose build --no-cache

log_info "Starting containers..."
docker compose up -d

# Wait for services to be healthy
log_info "Waiting for services to be healthy..."
sleep 10

# Check container status
log_info "Container status:"
docker compose ps

# Run database migrations (if applicable)
log_info "Running database migrations..."
docker compose exec -T backend npm run migrate || log_warn "Migration command not found, skipping"

# Health check
log_info "Running health checks..."
BACKEND_HEALTH=$(docker compose exec -T backend wget -qO- http://localhost:3001/api/v1/health 2>/dev/null || echo "failed")

if [[ "$BACKEND_HEALTH" == *"healthy"* ]]; then
    log_info "Backend health check: ✓"
else
    log_warn "Backend health check: ✗ (may still be starting)"
fi

echo ""
echo "=================================="
echo -e "${GREEN}🎉 Deployment Complete!${NC}"
echo "=================================="
echo ""
echo "Your application should be available at:"
echo "  Frontend: https://$DOMAIN"
echo "  Backend API: https://api.$DOMAIN"
echo "  Traefik Dashboard: https://traefik.$DOMAIN"
echo ""
echo "Useful commands:"
echo "  View logs: docker compose logs -f"
echo "  Stop: docker compose down"
echo "  Restart: docker compose restart"
echo ""
