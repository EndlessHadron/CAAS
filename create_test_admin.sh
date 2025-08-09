#!/bin/bash

# Create test admin user via API

echo "Creating test admin user..."

# Register the admin user
curl -X POST https://caas-backend-102964896009.europe-west2.run.app/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@neatly.com",
    "password": "NeatlyAdmin123!",
    "first_name": "Admin",
    "last_name": "User",
    "role": "admin"
  }'

echo ""
echo "Admin user created (if not already existing):"
echo "Email: admin@neatly.com"
echo "Password: NeatlyAdmin123!"
echo ""
echo "You can now log in at: https://caas-frontend-102964896009.europe-west2.run.app/auth/login"