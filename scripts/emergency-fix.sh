#!/bin/bash
# Emergency fix for Haven Institute 502 error and CORS issues

echo "🚨 HAVEN INSTITUTE - EMERGENCY FIX"
echo "==================================="
echo "Server: 5.78.147.82"
echo "Issue: 502 Error + CORS Problems"
echo "Timestamp: $(date)"
echo ""

# Navigate to project
cd /opt/haveninstitute || {
    echo "❌ Project directory not found!"
    exit 1
}

echo "📍 Current directory: $(pwd)"
echo ""

# Step 1: Check what's running
echo "🔍 Step 1: Checking current service status..."
echo ""
docker compose ps
echo ""

# Step 2: Stop everything clean
echo "🛑 Step 2: Stopping all services..."
echo ""
docker compose down --remove-orphans
echo ""

# Step 3: Clean up Docker
echo "🧹 Step 3: Cleaning up Docker..."
echo ""
docker system prune -f
echo ""

# Step 4: Pull latest changes
echo "📥 Step 4: Pulling latest changes..."
echo ""
git pull origin main
echo ""

# Step 5: Check environment
echo "⚙️ Step 5: Checking environment configuration..."
echo ""
if [ ! -f ".env.production" ]; then
    echo "⚠️ .env.production not found, copying from template..."
    cp .env.ci.template .env.production
    echo "📝 Please edit .env.production with your values!"
fi

# Step 6: Start services
echo "🚀 Step 6: Starting all services..."
echo ""
docker compose up -d --build
echo ""

# Step 7: Wait for startup
echo "⏳ Step 7: Waiting for services to start..."
echo ""
sleep 30

# Step 8: Check status
echo "📊 Step 8: Checking service status..."
echo ""
docker compose ps
echo ""

# Step 9: Test backend health
echo "🏥 Step 9: Testing backend health..."
echo ""
if curl -f http://localhost:3001/api/v1/health 2>/dev/null; then
    echo "✅ Backend health check PASSED"
else
    echo "❌ Backend health check FAILED"
    echo "📋 Backend logs:"
    docker compose logs --tail=20 backend
    echo ""
fi

# Step 10: Test CORS
echo "🌐 Step 10: Testing CORS..."
echo ""
if curl -H "Origin: https://havenstudy.com" -H "Access-Control-Request-Method: POST" -H "Access-Control-Request-Headers: Content-Type" -X OPTIONS http://localhost:3001/api/v1/auth/login 2>/dev/null; then
    echo "✅ CORS preflight check PASSED"
else
    echo "❌ CORS preflight check FAILED"
    echo "📋 Checking CORS configuration..."
fi

# Step 11: Test external access
echo "🔗 Step 11: Testing external access..."
echo ""
echo "Testing HTTP (port 80):"
if curl -I http://localhost 2>/dev/null | head -1; then
    echo "✅ HTTP accessible"
else
    echo "❌ HTTP not accessible"
fi

echo ""
echo "Testing HTTPS (port 443):"
if curl -I https://localhost 2>/dev/null | head -1; then
    echo "✅ HTTPS accessible"
else
    echo "❌ HTTPS not accessible"
fi

# Step 12: Final instructions
echo ""
echo "🎯 FINAL TEST INSTRUCTIONS:"
echo "=========================="
echo "1. Open browser and test: https://havenstudy.com"
echo "2. Test API: https://api.havenstudy.com/api/v1/health"
echo "3. Try login: Should work without CORS errors"
echo ""
echo "📋 If still broken:"
echo "- Check logs: docker compose logs -f"
echo "- Check resources: df -h && free -h"
echo "- Restart specific: docker compose restart backend caddy"
echo ""
echo "🎉 Emergency fix completed!"
