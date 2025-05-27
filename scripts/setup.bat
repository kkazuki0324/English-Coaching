@echo off
REM English Coaching Project Setup Script for Windows
REM This script sets up the development environment for the English Coaching project

echo 🚀 Setting up English Coaching development environment...

REM Check prerequisites
echo 📋 Checking prerequisites...

REM Check Node.js
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js 20 LTS or higher.
    exit /b 1
)

REM Check Docker
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker is not installed. Please install Docker Desktop.
    exit /b 1
)

REM Check Azure CLI
az --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Azure CLI is not installed. Please install Azure CLI.
    exit /b 1
)

REM Check Azure Developer CLI
azd version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Azure Developer CLI is not installed. Please install azd.
    exit /b 1
)

echo ✅ All prerequisites are installed!

REM Create environment files
echo 📝 Setting up environment files...

REM Frontend environment file
if not exist "frontend\.env.local" (
    (
        echo # Frontend Environment Variables
        echo NEXT_PUBLIC_API_URL=http://localhost:3001
        echo NEXT_PUBLIC_AZURE_AD_CLIENT_ID=your-azure-ad-client-id
        echo NEXT_PUBLIC_AZURE_AD_TENANT_ID=your-azure-ad-tenant-id
        echo NEXT_PUBLIC_AZURE_AD_REDIRECT_URI=http://localhost:3000/auth/callback
    ) > frontend\.env.example
    copy frontend\.env.example frontend\.env.local >nul
    echo ✅ Created frontend\.env.local
)

REM Backend environment file
if not exist "backend\.env" (
    (
        echo # Backend Environment Variables
        echo NODE_ENV=development
        echo PORT=3001
        echo CORS_ORIGIN=http://localhost:3000
        echo.
        echo # Azure Services ^(will be populated by Azure deployment^)
        echo AZURE_COSMOS_DB_ENDPOINT=https://localhost:8081
        echo AZURE_COSMOS_DB_KEY=your-cosmos-db-key
        echo AZURE_OPENAI_ENDPOINT=your-openai-endpoint
        echo AZURE_OPENAI_API_KEY=your-openai-key
        echo AZURE_SPEECH_KEY=your-speech-key
        echo AZURE_SPEECH_REGION=your-speech-region
        echo AZURE_STORAGE_ACCOUNT_NAME=your-storage-account
        echo AZURE_STORAGE_ACCOUNT_KEY=your-storage-key
        echo.
        echo # JWT Secret
        echo JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
    ) > backend\.env.example
    copy backend\.env.example backend\.env >nul
    echo ✅ Created backend\.env
)

REM Install dependencies
echo 📦 Installing dependencies...

REM Root package.json dependencies
if exist "package.json" (
    npm install
)

REM Frontend dependencies
echo Installing frontend dependencies...
cd frontend && npm install && cd ..

REM Backend dependencies
echo Installing backend dependencies...
cd backend && npm install && cd ..

echo ✅ Dependencies installed!

echo.
echo 🎉 Setup complete!
echo.
echo Next steps:
echo 1. Update environment variables in frontend\.env.local and backend\.env
echo 2. Start development environment: npm run dev
echo 3. Deploy to Azure: azd up
echo.
echo For more information, see README.md and CONTRIBUTING.md
