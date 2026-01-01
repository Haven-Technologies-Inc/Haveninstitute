# Haven Institute - 502 Error Local Diagnosis Script
# Run this script to diagnose the 502 error on havenstudy.com

Write-Host "🔍 Haven Institute - 502 Error Diagnosis" -ForegroundColor Blue
Write-Host "=========================================" -ForegroundColor Blue
Write-Host "Timestamp: $(Get-Date)" -ForegroundColor Gray
Write-Host ""

# Function to write colored output
function Write-Info($message) { Write-Host $message -ForegroundColor Green }
function Write-Warn($message) { Write-Host $message -ForegroundColor Yellow }
function Write-Error($message) { Write-Host $message -ForegroundColor Red }
function Write-Step($message) { Write-Host $message -ForegroundColor Blue }

# Test website connectivity
Write-Step "1. Testing website connectivity..."
Write-Host ""

try {
    $response = Invoke-WebRequest -Uri "https://havenstudy.com" -UseBasicParsing -TimeoutSec 10
    Write-Info "✅ Website responded with status: $($response.StatusCode)"
} catch {
    Write-Error "❌ Website failed to respond: $($_.Exception.Message)"
    
    # Try HTTP
    try {
        $httpResponse = Invoke-WebRequest -Uri "http://havenstudy.com" -UseBasicParsing -TimeoutSec 10
        Write-Warn "⚠️ HTTP responded but HTTPS failed: $($httpResponse.StatusCode)"
    } catch {
        Write-Error "❌ Both HTTP and HTTPS failed"
    }
}

Write-Host ""

# Test API endpoint
Write-Step "2. Testing API endpoint..."
Write-Host ""

try {
    $apiResponse = Invoke-WebRequest -Uri "https://api.havenstudy.com/api/v1/health" -UseBasicParsing -TimeoutSec 10
    Write-Info "✅ API responded with status: $($apiResponse.StatusCode)"
    Write-Host "API Response: $($apiResponse.Content)"
} catch {
    Write-Error "❌ API failed to respond: $($_.Exception.Message)"
    
    # Try HTTP API
    try {
        $httpApiResponse = Invoke-WebRequest -Uri "http://api.havenstudy.com/api/v1/health" -UseBasicParsing -TimeoutSec 10
        Write-Warn "⚠️ HTTP API responded but HTTPS failed: $($httpApiResponse.StatusCode)"
    } catch {
        Write-Error "❌ Both HTTP and HTTPS API failed"
    }
}

Write-Host ""

# DNS resolution check
Write-Step "3. Checking DNS resolution..."
Write-Host ""

try {
    $dnsResult = Resolve-DnsName -Name "havenstudy.com" -ErrorAction Stop
    Write-Info "✅ DNS resolution successful:"
    $dnsResult | ForEach-Object { Write-Host "   $($_.Name) -> $($_.IPAddress)" }
} catch {
    Write-Error "❌ DNS resolution failed: $($_.Exception.Message)"
}

try {
    $apiDnsResult = Resolve-DnsName -Name "api.havenstudy.com" -ErrorAction Stop
    Write-Info "✅ API DNS resolution successful:"
    $apiDnsResult | ForEach-Object { Write-Host "   $($_.Name) -> $($_.IPAddress)" }
} catch {
    Write-Error "❌ API DNS resolution failed: $($_.Exception.Message)"
}

Write-Host ""

# Port connectivity test
Write-Step "4. Testing port connectivity..."
Write-Host ""

$ports = @(80, 443, 3001)
$domains = @("havenstudy.com", "api.havenstudy.com")

foreach ($domain in $domains) {
    Write-Host "Testing ${domain}:"
    foreach ($port in $ports) {
        try {
            $tcpClient = New-Object System.Net.Sockets.TcpClient
            $connect = $tcpClient.BeginConnect($domain, $port, $null, $null)
            $wait = $connect.AsyncWaitHandle.WaitOne(3000, $false)
            if ($wait) {
                Write-Info "   ✅ Port $port is open"
                $tcpClient.EndConnect($connect)
            } else {
                Write-Warn "   ⚠️ Port $port is filtered or not responding"
            }
            $tcpClient.Close()
        } catch {
            Write-Error "   ❌ Port $port connection failed: $($_.Exception.Message)"
        }
    }
    Write-Host ""
}

# Provide remote commands
Write-Step "5. Remote fix commands (run on server)..."
Write-Host ""

Write-Host "SSH into your server and run:" -ForegroundColor Yellow
Write-Host ""
Write-Host "# Quick restart" -ForegroundColor Cyan
Write-Host "cd /opt/haveninstitute"
Write-Host "docker compose restart"
Write-Host ""
Write-Host "# Full restart" -ForegroundColor Cyan
Write-Host "cd /opt/haveninstitute"
Write-Host "docker compose down"
Write-Host "docker compose up -d"
Write-Host ""
Write-Host "# Check logs" -ForegroundColor Cyan
Write-Host "cd /opt/haveninstitute"
Write-Host "docker compose logs -f"
Write-Host ""
Write-Host "# Check specific service" -ForegroundColor Cyan
Write-Host "cd /opt/haveninstitute"
Write-Host "docker compose logs backend"
Write-Host "docker compose logs caddy"
Write-Host ""
Write-Host "# Health check" -ForegroundColor Cyan
Write-Host "curl http://localhost:3001/api/v1/health"
Write-Host ""

# Common 502 causes and solutions
Write-Step "6. Common 502 Error Causes..."
Write-Host ""

Write-Host "🔍 Most likely causes:" -ForegroundColor Yellow
Write-Host "1. Backend service crashed or not starting"
Write-Host "2. Database connection issues"
Write-Host "3. Reverse proxy configuration problems"
Write-Host "4. SSL certificate issues"
Write-Host "5. Memory or disk space exhaustion"
Write-Host "6. Recent deployment or update failure"
Write-Host ""

Write-Host "🔧 Quick fixes to try:" -ForegroundColor Green
Write-Host "1. Restart services: docker compose restart"
Write-Host "2. Check logs: docker compose logs -f"
Write-Host "3. Rebuild: docker compose up -d --build"
Write-Host "4. Pull latest: git pull ; docker compose pull ; docker compose up -d"
Write-Host ""

Write-Host "📞 If issues persist:" -ForegroundColor Red
Write-Host "1. Check server resources: df -h && free -h"
Write-Host "2. Check Docker status: docker ps"
Write-Host "3. Review recent changes: git log --oneline -10"
Write-Host "4. Contact hosting provider if server issues"
Write-Host ""

Write-Host "🚀 After fixing, test with:" -ForegroundColor Blue
Write-Host "curl https://api.havenstudy.com/api/v1/health"
Write-Host "curl https://havenstudy.com"
Write-Host ""
