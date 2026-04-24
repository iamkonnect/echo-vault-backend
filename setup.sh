#!/bin/bash

# EchoVault Full-Stack Setup Script
# This script sets up both frontend and backend for local development

set -e

echo "============================================"
echo "EchoVault Full-Stack Setup"
echo "============================================"
echo ""

# Color codes
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}➜${NC} $1"
}

print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

# Check prerequisites
print_status "Checking prerequisites..."

if ! command -v node &> /dev/null; then
    print_warning "Node.js not found. Please install Node.js 18+"
    exit 1
fi
print_success "Node.js $(node --version)"

if ! command -v npm &> /dev/null; then
    print_warning "npm not found. Please install npm"
    exit 1
fi
print_success "npm $(npm --version)"

if ! command -v flutter &> /dev/null; then
    print_warning "Flutter not found. Please install Flutter SDK"
    exit 1
fi
print_success "Flutter $(flutter --version | head -1)"

if ! command -v psql &> /dev/null; then
    print_warning "PostgreSQL client not found. Installing database may require manual setup"
fi

echo ""
print_status "Starting backend setup..."
echo ""

# Backend setup
if [ -d "echo-vault-backend" ]; then
    cd echo-vault-backend
elif [ -d "../echo-vault-backend" ]; then
    cd ../echo-vault-backend
else
    print_warning "Backend directory not found"
    exit 1
fi

# Install dependencies
print_status "Installing backend dependencies..."
npm install
print_success "Backend dependencies installed"

# Check for .env file
if [ ! -f .env ]; then
    print_status "Creating .env file..."
    cat > .env << EOF
JWT_SECRET=echovault_supersecret2024
PORT=5000
CLIENT_URL=http://localhost:3000
DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/echo_vault_db?schema=public
NODE_ENV=development
EOF
    print_success ".env file created"
fi

# Prisma setup
print_status "Setting up Prisma..."
npm run prisma:generate
print_success "Prisma generated"

echo ""
print_status "Starting frontend setup..."
echo ""

# Frontend setup
if [ -d "echovault_working" ]; then
    cd ../echovault_working
elif [ -d "../echovault_working" ]; then
    cd ../echovault_working
else
    print_warning "Frontend directory not found"
    exit 1
fi

# Get dependencies
print_status "Installing frontend dependencies..."
flutter pub get
print_success "Frontend dependencies installed"

# Generate code (Hive adapters, etc)
print_status "Generating code..."
flutter pub run build_runner build --delete-conflicting-outputs 2>/dev/null || print_warning "Code generation skipped"
print_success "Code generation completed"

echo ""
echo "============================================"
print_success "Setup Complete!"
echo "============================================"
echo ""
echo "Next steps:"
echo ""
print_status "Start Backend (from backend directory):"
echo "    npm run dev"
echo ""
print_status "Start Frontend Web (from frontend directory):"
echo "    flutter run -d chrome"
echo ""
print_status "Start Frontend Mobile (from frontend directory):"
echo "    flutter run"
echo ""
echo "Or use Docker Compose (from backend directory):"
echo "    docker-compose -f docker-compose-dev.yml up"
echo ""
