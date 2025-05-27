@echo off
REM Quick setup and test script for English Coaching
echo 🚀 Quick setup and test for English Coaching...

REM Check prerequisites
echo 📋 Checking prerequisites...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js not found. Please install Node.js 20 LTS or higher.
    exit /b 1
)

docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker not found. Please install Docker Desktop.
    exit /b 1
)

echo ✅ Prerequisites check passed!

REM Install dependencies
echo 📦 Installing dependencies...
cd frontend && npm install --silent && cd ..
cd backend && npm install --silent && cd ..

echo ✅ Dependencies installed!

REM Run type checks
echo 🔍 Running type checks...
cd frontend && npm run type-check && cd ..
cd backend && npm run type-check && cd ..

echo ✅ Type checks passed!

REM Run linting
echo 🧹 Running linting...
cd frontend && npm run lint && cd ..
cd backend && npm run lint && cd ..

echo ✅ Linting passed!

REM Build projects
echo 🏗️ Building projects...
cd frontend && npm run build && cd ..
cd backend && npm run build && cd ..

echo ✅ Build successful!

echo.
echo 🎉 Setup and tests completed successfully!
echo.
echo Next steps:
echo 1. Start development environment: npm run dev
echo 2. Access frontend: http://localhost:3000
echo 3. Access backend API: http://localhost:3001
echo 4. Deploy to Azure: azd up
