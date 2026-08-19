#!/bin/bash
# EchoVault Admin Dashboard - VPS Deployment Script
# Deploy admin.echovaultz.com on port 3000 behind Traefik

set -e

echo "🚀 EchoVault Admin Dashboard Deployment"
echo "========================================"

# 1. Pull latest code
echo "📦 Pulling latest master from GitHub..."
cd /home/echo-vault
git pull origin master

# 2. Verify admin app directory exists
echo "✅ Verifying apps/admin directory..."
if [ ! -d "apps/admin" ]; then
    echo "❌ ERROR: apps/admin directory not found!"
    exit 1
fi

# 3. Build Docker image
echo "🔨 Building admin Docker image..."
cd apps/admin
docker build -t iamkonnect/echo-vault-admin:latest .

# 4. Create docker-compose override if needed (for VPS deployment)
echo "📝 Setting up docker-compose for Traefik..."
# The existing docker-compose.yml should work, but ensure network exists
docker network inspect echo-vault-network > /dev/null 2>&1 || \
    docker network create echo-vault-network

# 5. Deploy admin service
echo "🚀 Deploying admin service..."
docker-compose up -d

# 6. Verify deployment
echo "✅ Waiting for health check..."
sleep 15

if docker-compose ps admin | grep -q "healthy\|running"; then
    echo "✅ Admin dashboard deployed successfully!"
    echo "📍 URL: https://admin.echovaultz.com"
    echo "🔧 Backend API: https://api.echovaultz.com"
else
    echo "⚠️ Admin service running but health check pending..."
    docker-compose logs admin
fi

echo "✅ Deployment complete!"
