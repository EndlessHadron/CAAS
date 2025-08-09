#!/bin/bash

echo "Creating test users for neatly..."
echo "================================"

# Create client user
echo "Creating client user..."
curl -s -X POST https://caas-backend-102964896009.europe-west2.run.app/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "client@neatly.com",
    "password": "Client123!",
    "first_name": "John",
    "last_name": "Client",
    "role": "client"
  }' > /dev/null 2>&1

echo "✅ Client user created"

# Create cleaner user
echo "Creating cleaner user..."
curl -s -X POST https://caas-backend-102964896009.europe-west2.run.app/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "cleaner@neatly.com",
    "password": "Cleaner123!",
    "first_name": "Sarah",
    "last_name": "Cleaner",
    "role": "cleaner"
  }' > /dev/null 2>&1

echo "✅ Cleaner user created"

echo ""
echo "================================"
echo "Test Credentials for neatly:"
echo "================================"
echo ""
echo "🔑 ADMIN USER:"
echo "   Email: admin@neatly.com"
echo "   Password: NeatlyAdmin123!"
echo "   Dashboard: https://caas-frontend-102964896009.europe-west2.run.app/admin"
echo ""
echo "🔑 CLIENT USER:"
echo "   Email: client@neatly.com"
echo "   Password: Client123!"
echo "   Dashboard: https://caas-frontend-102964896009.europe-west2.run.app/client"
echo ""
echo "🔑 CLEANER USER:"
echo "   Email: cleaner@neatly.com"
echo "   Password: Cleaner123!"
echo "   Dashboard: https://caas-frontend-102964896009.europe-west2.run.app/cleaner"
echo ""
echo "Login at: https://caas-frontend-102964896009.europe-west2.run.app/auth/login"
echo "================================"