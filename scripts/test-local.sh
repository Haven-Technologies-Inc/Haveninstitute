#!/bin/bash

# Haven Institute Local Testing Script
# This script helps you set up and test the application locally

echo "🚀 Haven Institute Local Testing Setup"
echo "======================================"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2)
REQUIRED_VERSION="18.0.0"

if [ "$(printf '%s\n' "$REQUIRED_VERSION" "$NODE_VERSION" | sort -V | head -n1)" != "$REQUIRED_VERSION" ]; then
    echo "❌ Node.js version $NODE_VERSION is too old. Please upgrade to 18+"
    exit 1
fi

echo "✅ Node.js version: $NODE_VERSION"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed."
    exit 1
fi

echo "✅ npm version: $(npm -v)"

# Check if MySQL is running
if ! command -v mysql &> /dev/null; then
    echo "⚠️  MySQL command not found. Please ensure MySQL is installed and running."
    echo "   You can use XAMPP, MAMP, or MySQL Server directly."
fi

# Install frontend dependencies
echo ""
echo "📦 Installing frontend dependencies..."
cd "$(dirname "$0")/.."
npm install

# Install backend dependencies
echo ""
echo "📦 Installing backend dependencies..."
cd backend
npm install

# Build backend
echo ""
echo "🔨 Building backend..."
npm run build

# Go back to root
cd ..

echo ""
echo "✅ Setup complete! Now you can start the application:"
echo ""
echo "   🗄️  Database Setup:"
echo "      1. Start MySQL server"
echo "      2. Run: mysql -u root -p < database-setup.sql"
echo ""
echo "   🚀 Start Development Servers:"
echo "      Terminal 1 (Backend): cd backend && npm run dev"
echo "      Terminal 2 (Frontend): npm run dev"
echo ""
echo "   🌐 Access the application:"
echo "      Frontend: http://localhost:5173"
echo "      Backend API: http://localhost:3001"
echo "      API Health: http://localhost:3001/api/v1/health"
echo ""
echo "   📝 Environment file created: .env.local"
echo "      Adjust settings as needed for your local setup"
