# Quick Fix Script for Haven Institute 502 Error
# Run this in PowerShell on your local machine

Write-Host "🚨 Haven Institute - Quick Fix Script" -ForegroundColor Blue
Write-Host "=====================================" -ForegroundColor Blue

# Server IP
$SERVER_IP = "5.78.147.82"

Write-Host "Connecting to server: $SERVER_IP" -ForegroundColor Yellow

# SSH command to fix everything
$SSH_COMMAND = @"
cd /opt/haveninstitute
echo "📍 Current directory: \$(Get-Location)"
echo ""
echo "🔍 Checking current status..."
docker compose ps
echo ""
echo "🛑 Stopping services..."
docker compose down
echo ""
echo "🚀 Starting services with rebuild..."
docker compose up -d --build
echo ""
echo "⏳ Waiting for services to start..."
sleep 30
echo ""
echo "📊 Checking final status..."
docker compose ps
echo ""
echo "🏥 Testing backend health..."
curl http://localhost:3001/api/v1/health
echo ""
echo "✅ Fix completed!"
"@

# Execute the SSH command
ssh root@$SERVER_IP $SSH_COMMAND

Write-Host ""
Write-Host "🎯 If the health check above shows success, your website should work!" -ForegroundColor Green
Write-Host "Test: https://havenstudy.com" -ForegroundColor Cyan
Write-Host "API: https://api.havenstudy.com/api/v1/health" -ForegroundColor Cyan
