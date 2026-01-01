#!/bin/bash
# Haven Institute - Hetzner 502 Error Fix Script
# Server: 5.78.147.82

echo "🚨 Haven Institute - Hetzner 502 Error Fix"
echo "=========================================="
echo "Server: 5.78.147.82"
echo "Timestamp: $(date)"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() { echo -e "${GREEN}[INFO]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_step() { echo -e "${BLUE}[STEP]${NC} $1"; }

# Step 1: Check current service status
log_step "1. Checking current service status..."
echo ""
docker compose ps
echo ""

# Step 2: Check which services are down
log_step "2. Identifying failed services..."
echo ""
FAILED_SERVICES=$(docker compose ps --services --filter "status=exited" 2>/dev/null || echo "")
if [ -n "$FAILED_SERVICES" ]; then
    log_error "Failed services: $FAILED_SERVICES"
else
    log_info "All services appear to be running"
fi

# Step 3: Quick restart attempt
log_step "3. Attempting quick restart..."
echo ""
docker compose restart
echo ""

# Step 4: Wait for services to start
log_step "4. Waiting for services to initialize..."
echo ""
sleep 15

# Step 5: Check service status again
log_step "5. Checking service status after restart..."
echo ""
docker compose ps
echo ""

# Step 6: Test backend health
log_step "6. Testing backend health..."
echo ""
if curl -f http://localhost:3001/api/v1/health 2>/dev/null; then
    log_info "✅ Backend health check PASSED"
else
    log_error "❌ Backend health check FAILED"
    echo "Backend logs:"
    docker compose logs --tail=20 backend
    echo ""
    
    log_step "7. Attempting full rebuild..."
    echo ""
    docker compose down
    sleep 5
    docker compose up -d --build
    echo ""
    
    log_step "8. Waiting for rebuild to complete..."
    echo ""
    sleep 30
    
    log_step "9. Final health check..."
    echo ""
    if curl -f http://localhost:3001/api/v1/health 2>/dev/null; then
        log_info "✅ Backend health check PASSED after rebuild"
    else
        log_error "❌ Backend still failing - checking logs..."
        docker compose logs --tail=30 backend
        echo ""
        docker compose logs --tail=20 caddy
    fi
fi

# Step 10: Test external access
log_step "10. Testing external access..."
echo ""
if curl -f http://localhost:80 2>/dev/null; then
    log_info "✅ Frontend accessible"
else
    log_error "❌ Frontend not accessible"
fi

if curl -f http://localhost:443 2>/dev/null; then
    log_info "✅ HTTPS accessible"
else
    log_warn "⚠️ HTTPS may have issues"
fi

# Step 11: Final status
echo ""
log_step "11. Final Status Summary..."
echo ""
echo "Service Status:"
docker compose ps
echo ""
echo "External Test:"
echo "Website: https://havenstudy.com"
echo "API: https://api.havenstudy.com/api/v1/health"
echo ""

log_info "🎉 Fix script completed!"
echo ""
echo "If services are still down, check:"
echo "1. Disk space: df -h"
echo "2. Memory: free -h"
echo "3. Docker logs: docker compose logs -f"
echo "4. Recent changes: git log --oneline -5"
