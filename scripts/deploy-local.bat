@echo off
REM Haven Institute Local Deployment Script
REM For Windows without Docker Desktop

echo ========================================
echo Haven Institute Local Deployment
echo ========================================

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

REM Check if npm is installed
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: npm is not installed
    pause
    exit /b 1
)

echo.
echo [1/4] Installing frontend dependencies...
call npm install
if %errorlevel% neq 0 (
    echo ERROR: Failed to install frontend dependencies
    pause
    exit /b 1
)

echo.
echo [2/4] Building frontend for production...
call npm run build
if %errorlevel% neq 0 (
    echo ERROR: Failed to build frontend
    pause
    exit /b 1
)

echo.
echo [3/4] Installing backend dependencies...
cd backend
call npm install
if %errorlevel% neq 0 (
    echo ERROR: Failed to install backend dependencies
    pause
    exit /b 1
)

echo.
echo [4/4] Building backend...
call npm run build
if %errorlevel% neq 0 (
    echo ERROR: Failed to build backend
    pause
    exit /b 1
)

echo.
echo ========================================
echo Build Complete!
echo ========================================
echo.
echo Frontend built in: dist\
echo Backend built in: backend\dist\
echo.
echo To deploy to production:
echo 1. Copy dist\ folder to your web server
echo 2. Copy backend\dist\ folder to your server
echo 3. Set up environment variables
echo 4. Install dependencies and start backend
echo.
echo For Docker deployment, start Docker Desktop and run:
echo docker compose up -d
echo.
pause
