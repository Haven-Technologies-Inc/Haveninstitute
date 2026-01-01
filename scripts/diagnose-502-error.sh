#!/bin/bash
# Haven Institute - 502 Error Diagnosis & Fix Script

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo "🔍 Haven Institute - 502 Error Diagnosis Tool"
echo "=============================================="
echo "Timestamp: $(date)"
echo ""

# Function to print colored output
log_info() { echo -e "${GREEN}[INFO]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }
log_step() { echo -e "${BLUE}[STEP]${NC} $1"; }

# Check if running on server or local
if [ -d "/opt/haveninstitute" ]; then
    log_info "Running on production server"
    PROJECT_DIR="/opt/haveninstitute"
else
    log_info "Running locally - will provide remote commands"
    PROJECT_DIR="$(pwd)"
fi

cd "$PROJECT_DIR"

# 1. Check Docker services status
log_step "1. Checking Docker services status..."
echo ""

if command -v docker &> /dev/null; then
    echo "Docker Services Status:"
    docker compose ps
    echo ""
    
    # Check which services are down
    DOWN_SERVICES=$(docker compose ps --services --filter "status=exited" 2>/dev/null || echo "")
    if [ -n "$DOWN_SERVICES" ]; then
        log_error "Services that are down: $DOWN_SERVICES"
    else
        log_info "All services appear to be running"
    fi
else
    log_error "Docker is not installed or not accessible"
fi

echo ""

# 2. Check backend health specifically
log_step "2. Checking backend health..."
echo ""

if command -v docker &> /dev/null; then
    # Check if backend container is running
    BACKEND_STATUS=$(docker compose ps -q backend 2>/dev/null)
    if [ -n "$BACKEND_STATUS" ]; then
        echo "Backend container is running"
        
        # Check backend health endpoint
        echo "Testing backend health endpoint..."
        if docker compose exec -T backend curl -f http://localhost:3001/api/v1/health 2>/dev/null; then
            log_info "Backend health check: ✅ PASSED"
        else
            log_error "Backend health check: ❌ FAILED"
            echo "Backend logs:"
            docker compose logs --tail=20 backend
        fi
    else
        log_error "Backend container is not running"
    fi
else
    echo "Cannot check backend - Docker not available"
fi

echo ""

# 3. Check reverse proxy (Caddy/Nginx)
log_step "3. Checking reverse proxy status..."
echo ""

if command -v docker &> /dev/null; then
    # Check Caddy status
    CADDY_STATUS=$(docker compose ps -q caddy 2>/dev/null)
    if [ -n "$CADDY_STATUS" ]; then
        echo "Caddy container is running"
        
        # Check Caddy logs for errors
        echo "Recent Caddy logs:"
        docker compose logs --tail=10 caddy
    else
        log_error "Caddy container is not running"
    fi
else
    echo "Cannot check reverse proxy - Docker not available"
fi

echo ""

# 4. Check network connectivity
log_step "4. Checking network connectivity..."
echo ""

# Check if port 80 and 443 are accessible
echo "Checking port 80 (HTTP)..."
if netstat -tuln | grep -q ":80 "; then
    log_info "Port 80 is listening"
else
    log_warn "Port 80 is not listening"
fi

echo "Checking port 443 (HTTPS)..."
if netstat -tuln | grep -q ":443 "; then
    log_info "Port 443 is listening"
else
    log_warn "Port 443 is not listening"
fi

echo "Checking port 3001 (Backend)..."
if netstat -tuln | grep -q ":3001 "; then
    log_info "Port 3001 is listening"
else
    log_warn "Port 3001 is not listening"
fi

echo ""

# 5. Check disk space
log_step "5. Checking disk space..."
echo ""
df -h | grep -E "(/$|/opt)" || df -h

echo ""

# 6. Check memory usage
log_step "6. Checking memory usage..."
echo ""
free -h 2>/dev/null || echo "Memory check not available"

echo ""

# 7. Provide fix commands
log_step "7. Providing fix commands..."
echo ""

echo "🔧 Common 502 Error Fixes:"
echo ""

echo "1. Restart all services:"
echo "   docker compose restart"
echo ""

echo "2. Restart backend specifically:"
echo "   docker compose restart backend"
echo ""

echo "3. Rebuild and restart services:"
echo "   docker compose down"
echo "   docker compose up -d --build"
echo ""

echo "4. Check and fix configuration:"
echo "   docker compose config"
echo ""

echo "5. Clear Docker cache and rebuild:"
echo "   docker system prune -f"
echo "   docker compose build --no-cache"
echo "   docker compose up -d"
echo ""

echo "6. Check for recent updates:"
echo "   git pull origin main"
echo "   docker compose pull"
echo "   docker compose up -d"
echo ""

echo "7. If database issues:"
echo "   docker compose restart mariadb"
echo "   docker compose logs mariadb"
echo ""

echo "8. Check SSL certificate issues:"
echo "   docker compose logs caddy"
echo "   docker compose restart caddy"
echo ""

# 8. Create emergency restart script
log_step "8. Creating emergency restart script..."
echo ""

cat > emergency-restart.sh << 'EOF'
#!/bin/bash
# Emergency restart for Haven Institute

echo "🚨 Emergency Restart - Haven Institute"
echo "====================================="

# Stop all services
echo "Stopping all services..."
docker compose down

# Pull latest changes
echo "Pulling latest changes..."
git pull origin main

# Remove orphaned containers
echo "Cleaning up..."
docker compose down --remove-orphans

# Start services
echo "Starting services..."
docker compose up -d

# Wait for services to start
echo "Waiting for services to start..."
sleep 30

# Check status
echo "Checking service status..."
docker compose ps

# Check health
echo "Checking backend health..."
if curl -f http://localhost:3001/api/v1/health 2>/dev/null; then
    echo "✅ Backend is healthy"
else
    echo "❌ Backend health check failed"
    echo "Backend logs:"
    docker compose logs --tail=20 backend
fi

echo "Emergency restart completed!"
EOF

chmod +x emergency-restart.sh

log_info "Emergency restart script created: ./emergency-restart.sh"

echo ""
echo "📋 Quick Diagnosis Summary:"
echo "=========================="
echo "- Check Docker services status above"
echo "- Look for any failed containers"
echo "- Review backend health check results"
echo "- Check reverse proxy logs for errors"
echo ""
echo "🚀 Next Steps:"
echo "1. Run: ./emergency-restart.sh"
echo "2. Monitor: docker compose logs -f"
echo "3. Test: curl http://localhost:3001/api/v1/health"
echo ""
echo "If issues persist, check the specific service logs above."
