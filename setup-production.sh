#!/bin/bash

echo "=== EchoVault Backend Setup ==="
echo ""

# Step 1: Push Prisma schema to database
echo "Step 1: Pushing Prisma schema to database..."
npx prisma db push --skip-generate

if [ $? -ne 0 ]; then
  echo "❌ Prisma db push failed"
  exit 1
fi

echo "✓ Database schema created"
echo ""

# Step 2: Create super admin user
echo "Step 2: Creating super admin user..."
node create-super-admin.js

if [ $? -ne 0 ]; then
  echo "❌ Failed to create super admin"
  exit 1
fi

echo ""
echo "=== Setup Complete ==="
echo "You can now log in with:"
echo "  Email: akwera@echovaultz.com"
echo "  Password: Deandre360xi!"
echo ""
echo "Restarting the backend container..."
docker restart echo-vault-backend-app-1

echo "✓ Backend restarted"
echo "Visit https://admin.echovaultz.com to access the admin dashboard"
