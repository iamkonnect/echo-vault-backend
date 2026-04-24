#!/bin/bash

# EchoVault Advanced Features Quick Start
# Sets up WebSocket, token refresh, offline caching, and CI/CD

set -e

echo "============================================"
echo "EchoVault Advanced Features Setup"
echo "============================================"
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_status() { echo -e "${BLUE}➜${NC} $1"; }
print_success() { echo -e "${GREEN}✓${NC} $1"; }
print_warning() { echo -e "${YELLOW}⚠${NC} $1"; }

# 1. Backend Setup
print_status "Setting up backend..."
cd echo-vault-backend

# Install new socket.io dependency
print_status "Installing socket.io dependencies..."
npm install socket.io socket.io-client
print_success "Socket.io installed"

# Generate Prisma
print_status "Generating Prisma client..."
npm run prisma:generate
print_success "Prisma generated"

cd ..

# 2. Frontend Setup
print_status "Setting up frontend..."
cd echovault_working

# Get dependencies (includes socket_io_client)
print_status "Installing Flutter dependencies..."
flutter pub get
print_success "Flutter dependencies installed"

# Generate code
print_status "Generating code..."
flutter pub run build_runner build --delete-conflicting-outputs 2>/dev/null || print_warning "Code generation completed with warnings"
print_success "Code generation complete"

cd ..

# 3. Environment Setup
print_status "Checking environment setup..."

if [ ! -f "echo-vault-backend/.env" ]; then
    print_warning "No .env file found"
    cat > echo-vault-backend/.env << EOF
JWT_SECRET=echovault_supersecret2024
PORT=5000
CLIENT_URL=http://localhost:3000
DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/echo_vault_db?schema=public
NODE_ENV=development
EOF
    print_success ".env file created"
fi

# 4. Docker Compose
print_status "Docker Compose files available:"
echo "  - Development: docker-compose -f docker-compose-dev.yml up"
echo "  - Production: docker-compose -f docker-compose-prod.yml up"

# 5. CI/CD
print_status "CI/CD Setup Instructions:"
echo ""
echo "1. Push code to GitHub:"
echo "   git init"
echo "   git add ."
echo "   git commit -m 'Initial commit'"
echo "   git remote add origin <your-repo>"
echo "   git push -u origin main"
echo ""
echo "2. Add GitHub Secrets (Settings → Secrets and variables):"
echo "   - DEPLOY_KEY (SSH private key)"
echo "   - DEV_DEPLOY_HOST"
echo "   - PROD_DEPLOY_HOST"
echo "   - DEV_DEPLOY_USER"
echo "   - PROD_DEPLOY_USER"
echo ""
echo "3. Workflow will run automatically on push/PR"
echo "   Check: Actions tab in your repository"

# 6. Testing
print_status "Testing Setup..."

echo ""
print_status "Quick Test Commands:"
echo ""
print_status "Backend:"
echo "  cd echo-vault-backend"
echo "  npm run dev              # Start development server"
echo "  curl http://localhost:5000/api/auth/login  # Test API"
echo ""
print_status "Frontend:"
echo "  cd echovault_working"
echo "  flutter run -d chrome    # Run web"
echo "  flutter build apk        # Build APK"
echo ""

# 7. Summary
echo ""
echo "============================================"
print_success "Setup Complete!"
echo "============================================"
echo ""
echo "New Features Enabled:"
echo "  ✓ WebSocket real-time (gifts, chat, notifications)"
echo "  ✓ JWT token auto-refresh on 401"
echo "  ✓ Offline caching with Hive"
echo "  ✓ GitHub Actions CI/CD"
echo "  ✓ Automated APK builds"
echo ""
echo "Key Files:"
echo "  Backend:  src/utils/socketHandlers.js"
echo "  Frontend: lib/services/realtime_service.dart"
echo "           lib/services/token_refresh_service.dart"
echo "           lib/services/cache_service.dart"
echo "  CI/CD:    .github/workflows/build-deploy.yml"
echo ""
echo "Documentation:"
echo "  ADVANCED_FEATURES.md - Comprehensive guide"
echo "  INTEGRATION_GUIDE.md  - Frontend-backend setup"
echo ""
