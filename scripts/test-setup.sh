#!/bin/bash

# Quick setup and test script for English Coaching
echo "🚀 Quick setup and test for English Coaching..."

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
echo "📋 Checking prerequisites..."
if ! command_exists node; then
    echo "❌ Node.js not found. Please install Node.js 20 LTS or higher."
    exit 1
fi

if ! command_exists docker; then
    echo "❌ Docker not found. Please install Docker Desktop."
    exit 1
fi

echo "✅ Prerequisites check passed!"

# Install dependencies
echo "📦 Installing dependencies..."
cd frontend && npm install --silent && cd ..
cd backend && npm install --silent && cd ..

echo "✅ Dependencies installed!"

# Run type checks
echo "🔍 Running type checks..."
cd frontend && npm run type-check && cd ..
cd backend && npm run type-check && cd ..

echo "✅ Type checks passed!"

# Run linting
echo "🧹 Running linting..."
cd frontend && npm run lint && cd ..
cd backend && npm run lint && cd ..

echo "✅ Linting passed!"

# Build projects
echo "🏗️ Building projects..."
cd frontend && npm run build && cd ..
cd backend && npm run build && cd ..

echo "✅ Build successful!"

echo ""
echo "🎉 Setup and tests completed successfully!"
echo ""
echo "Next steps:"
echo "1. Start development environment: npm run dev"
echo "2. Access frontend: http://localhost:3000"
echo "3. Access backend API: http://localhost:3001"
echo "4. Deploy to Azure: azd up"
