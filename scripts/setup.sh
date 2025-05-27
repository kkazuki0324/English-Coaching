#!/bin/bash

# English Coaching Project Setup Script
# This script sets up the development environment for the English Coaching project

set -e

echo "🚀 Setting up English Coaching development environment..."

# Check prerequisites
check_prerequisites() {
    echo "📋 Checking prerequisites..."
    
    # Check Node.js
    if ! command -v node &> /dev/null; then
        echo "❌ Node.js is not installed. Please install Node.js 20 LTS or higher."
        exit 1
    fi
    
    NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 20 ]; then
        echo "❌ Node.js version must be 20 or higher. Current version: $(node -v)"
        exit 1
    fi
    
    # Check Docker
    if ! command -v docker &> /dev/null; then
        echo "❌ Docker is not installed. Please install Docker Desktop."
        exit 1
    fi
    
    # Check Azure CLI
    if ! command -v az &> /dev/null; then
        echo "❌ Azure CLI is not installed. Please install Azure CLI."
        exit 1
    fi
    
    # Check Azure Developer CLI
    if ! command -v azd &> /dev/null; then
        echo "❌ Azure Developer CLI is not installed. Please install azd."
        exit 1
    fi
    
    echo "✅ All prerequisites are installed!"
}

# Create environment files
setup_environment_files() {
    echo "📝 Setting up environment files..."
    
    # Frontend environment file
    if [ ! -f "frontend/.env.local" ]; then
        cat > frontend/.env.example << EOF
# Frontend Environment Variables
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_AZURE_AD_CLIENT_ID=your-azure-ad-client-id
NEXT_PUBLIC_AZURE_AD_TENANT_ID=your-azure-ad-tenant-id
NEXT_PUBLIC_AZURE_AD_REDIRECT_URI=http://localhost:3000/auth/callback
EOF
        cp frontend/.env.example frontend/.env.local
        echo "✅ Created frontend/.env.local"
    fi
    
    # Backend environment file
    if [ ! -f "backend/.env" ]; then
        cat > backend/.env.example << EOF
# Backend Environment Variables
NODE_ENV=development
PORT=3001
CORS_ORIGIN=http://localhost:3000

# Azure Services (will be populated by Azure deployment)
AZURE_COSMOS_DB_ENDPOINT=https://localhost:8081
AZURE_COSMOS_DB_KEY=your-cosmos-db-key
AZURE_OPENAI_ENDPOINT=your-openai-endpoint
AZURE_OPENAI_API_KEY=your-openai-key
AZURE_SPEECH_KEY=your-speech-key
AZURE_SPEECH_REGION=your-speech-region
AZURE_STORAGE_ACCOUNT_NAME=your-storage-account
AZURE_STORAGE_ACCOUNT_KEY=your-storage-key

# JWT Secret
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
EOF
        cp backend/.env.example backend/.env
        echo "✅ Created backend/.env"
    fi
}

# Install dependencies
install_dependencies() {
    echo "📦 Installing dependencies..."
    
    # Root package.json dependencies
    if [ -f "package.json" ]; then
        npm install
    fi
    
    # Frontend dependencies
    echo "Installing frontend dependencies..."
    cd frontend && npm install && cd ..
    
    # Backend dependencies
    echo "Installing backend dependencies..."
    cd backend && npm install && cd ..
    
    echo "✅ Dependencies installed!"
}

# Setup Git hooks (optional)
setup_git_hooks() {
    echo "🔧 Setting up Git hooks..."
    
    # Pre-commit hook for linting
    cat > .git/hooks/pre-commit << 'EOF'
#!/bin/sh
# Pre-commit hook for linting

echo "🔍 Running pre-commit checks..."

# Run frontend linting
cd frontend && npm run lint
FRONTEND_LINT_EXIT_CODE=$?

# Run backend linting
cd ../backend && npm run lint
BACKEND_LINT_EXIT_CODE=$?

cd ..

if [ $FRONTEND_LINT_EXIT_CODE -ne 0 ] || [ $BACKEND_LINT_EXIT_CODE -ne 0 ]; then
    echo "❌ Linting failed. Please fix the issues before committing."
    exit 1
fi

echo "✅ Pre-commit checks passed!"
EOF
    
    chmod +x .git/hooks/pre-commit
    echo "✅ Git hooks setup complete!"
}

# Main setup function
main() {
    check_prerequisites
    setup_environment_files
    install_dependencies
    
    # Only setup git hooks if .git directory exists
    if [ -d ".git" ]; then
        setup_git_hooks
    fi
    
    echo ""
    echo "🎉 Setup complete!"
    echo ""
    echo "Next steps:"
    echo "1. Update environment variables in frontend/.env.local and backend/.env"
    echo "2. Start development environment: npm run dev"
    echo "3. Deploy to Azure: azd up"
    echo ""
    echo "For more information, see README.md and CONTRIBUTING.md"
}

# Run main function
main
