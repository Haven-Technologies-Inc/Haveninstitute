# Simple Fix Script for Haven Institute 502 Error

Write-Host "Haven Institute - Simple Fix Script" -ForegroundColor Blue
Write-Host "=====================================" -ForegroundColor Blue

$SERVER_IP = "5.78.147.82"
Write-Host "Connecting to server: $SERVER_IP" -ForegroundColor Yellow

# Simple SSH commands without complex formatting
$commands = @"
cd /opt/haveninstitute
echo "Checking current status..."
docker compose ps
echo "Stopping services..."
docker compose down
echo "Starting services with rebuild..."
docker compose up -d --build
echo "Waiting for services to start..."
sleep 30
echo "Checking final status..."
docker compose ps
echo "Testing backend health..."
curl http://localhost:3001/api/v1/health
echo "Fix completed!"
"@

# Execute SSH
ssh root@$SERVER_IP $commands

Write-Host ""
Write-Host "If the health check above shows success, your website should work!" -ForegroundColor Green
Write-Host "Test: https://havenstudy.com" -ForegroundColor Cyan
Write-Host "API: https://api.havenstudy.com/api/v1/health" -ForegroundColor Cyan
