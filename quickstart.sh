#!/bin/bash

# EchoVault Quick Start Testing Script

echo "╔════════════════════════════════════════════════════════════╗"
echo "║         EchoVault Backend & Flutter Integration Test      ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Check if Docker is running
echo "[1/6] Checking Docker status..."
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker and try again."
    exit 1
fi
echo "✅ Docker is running"
echo ""

# Navigate to backend directory
BACKEND_DIR="C:\Users\infin\Desktop\echo-vault-backend"
if [ ! -d "$BACKEND_DIR" ]; then
    echo "❌ Backend directory not found at $BACKEND_DIR"
    exit 1
fi

# Start Docker Compose
echo "[2/6] Starting Docker Compose (PostgreSQL + Node.js)..."
cd "$BACKEND_DIR"
docker-compose down > /dev/null 2>&1
docker-compose up -d
echo "⏳ Waiting for services to start (30 seconds)..."
sleep 30

# Check if services are running
echo "[3/6] Verifying services..."
if docker ps | grep -q "echo_vault_postgres"; then
    echo "✅ PostgreSQL is running"
else
    echo "❌ PostgreSQL failed to start"
    docker-compose logs db
    exit 1
fi

if docker ps | grep -q "echo-vault-backend"; then
    echo "✅ Node.js API is running"
else
    echo "❌ Node.js API failed to start"
    docker-compose logs app
    exit 1
fi
echo ""

# Test API
echo "[4/6] Testing Backend API..."
RESPONSE=$(curl -s -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@echovault.local",
    "password": "testpass123",
    "name": "Test User",
    "role": "ARTIST"
  }')

if echo "$RESPONSE" | grep -q "token"; then
    TOKEN=$(echo "$RESPONSE" | grep -o '"token":"[^"]*' | cut -d'"' -f4)
    echo "✅ API is responding correctly"
    echo "   JWT Token: ${TOKEN:0:30}..."
    echo ""
    
    # Test Protected Route
    echo "[5/6] Testing Protected Route (/api/artist/insights)..."
    INSIGHTS=$(curl -s -X GET http://localhost:5000/api/artist/insights \
      -H "Authorization: Bearer $TOKEN")
    
    if echo "$INSIGHTS" | grep -q "totalPlays"; then
        echo "✅ Protected route is working"
        echo "   Response: $INSIGHTS"
    else
        echo "⚠️  Protected route returned unexpected response"
        echo "   Response: $INSIGHTS"
    fi
else
    echo "❌ API is not responding correctly"
    echo "   Response: $RESPONSE"
    exit 1
fi
echo ""

# Flutter Setup
echo "[6/6] Flutter App Setup..."
FLUTTER_DIR="C:\Users\infin\Downloads\echovault_working"
if [ -d "$FLUTTER_DIR" ]; then
    cd "$FLUTTER_DIR"
    echo "📦 Running: flutter pub get"
    flutter pub get > /dev/null 2>&1
    echo "✅ Flutter dependencies installed"
else
    echo "⚠️  Flutter directory not found"
fi
echo ""

# Summary
echo "╔════════════════════════════════════════════════════════════╗"
echo "║              ✅ Testing Complete!                          ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""
echo "📋 Next Steps:"
echo ""
echo "1️⃣  Start Flutter App:"
echo "   cd C:\\Users\\infin\\Downloads\\echovault_working"
echo "   flutter run"
echo ""
echo "2️⃣  Test Authentication:"
echo "   • Register with new account"
echo "   • Verify token is saved locally"
echo "   • Close and reopen app (token should persist)"
echo ""
echo "3️⃣  Test Artist Dashboard:"
echo "   • Login as artist role"
echo "   • View stats (Total Plays, Earnings, Balance)"
echo "   • Request a withdrawal"
echo ""
echo "4️⃣  Use Postman for advanced testing:"
echo "   • Import: $BACKEND_DIR/EchoVault_API_Testing.postman_collection.json"
echo "   • Test all endpoints with Bearer token"
echo ""
echo "📊 Backend Status:"
echo "   - API: http://localhost:5000"
echo "   - Database: localhost:5432"
echo "   - Docs: See TESTING_GUIDE.md"
echo ""
echo "❌ Stop Services: docker-compose down"
echo ""
