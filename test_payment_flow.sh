#!/bin/bash

# Test payment flow
API_URL="https://caas-backend-102964896009.us-central1.run.app"

echo "Testing Payment Flow"
echo "==================="

# 1. Login as test client
echo "1. Logging in as client..."
LOGIN_RESPONSE=$(curl -s -X POST "$API_URL/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"client@neatly.com","password":"Client123!"}')

ACCESS_TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.access_token')

if [ "$ACCESS_TOKEN" == "null" ]; then
  echo "❌ Login failed"
  echo $LOGIN_RESPONSE | jq
  exit 1
fi

echo "✅ Login successful"

# 2. Get user's bookings
echo ""
echo "2. Getting user bookings..."
BOOKINGS=$(curl -s -X GET "$API_URL/api/v1/bookings" \
  -H "Authorization: Bearer $ACCESS_TOKEN")

BOOKING_ID=$(echo $BOOKINGS | jq -r '.[0].booking_id')

if [ "$BOOKING_ID" == "null" ]; then
  echo "No bookings found. Creating a test booking..."
  
  # Create a test booking
  BOOKING_RESPONSE=$(curl -s -X POST "$API_URL/api/v1/bookings" \
    -H "Authorization: Bearer $ACCESS_TOKEN" \
    -H "Content-Type: application/json" \
    -d '{
      "service": {
        "type": "regular",
        "duration": 2,
        "price": 50.00,
        "special_requirements": []
      },
      "schedule": {
        "date": "2025-08-15",
        "time": "10:00"
      },
      "location": {
        "address": {
          "line1": "123 Test Street",
          "line2": "",
          "city": "London",
          "postcode": "SW1A 1AA"
        }
      },
      "notes": "Test booking for payment"
    }')
  
  BOOKING_ID=$(echo $BOOKING_RESPONSE | jq -r '.booking_id')
  echo "✅ Created test booking: $BOOKING_ID"
else
  echo "✅ Found existing booking: $BOOKING_ID"
fi

# 3. Create payment intent
echo ""
echo "3. Creating payment intent..."
PAYMENT_RESPONSE=$(curl -s -X POST "$API_URL/api/v1/payments/create-intent" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"booking_id\": \"$BOOKING_ID\",
    \"save_payment_method\": false
  }")

PAYMENT_INTENT_ID=$(echo $PAYMENT_RESPONSE | jq -r '.payment_intent_id')
CLIENT_SECRET=$(echo $PAYMENT_RESPONSE | jq -r '.client_secret')

if [ "$PAYMENT_INTENT_ID" == "null" ]; then
  echo "❌ Failed to create payment intent"
  echo $PAYMENT_RESPONSE | jq
  exit 1
fi

echo "✅ Payment intent created successfully"
echo "   Payment Intent ID: $PAYMENT_INTENT_ID"
echo "   Client Secret: ${CLIENT_SECRET:0:30}..."
echo "   Amount: $(echo $PAYMENT_RESPONSE | jq -r '.amount') $(echo $PAYMENT_RESPONSE | jq -r '.currency')"

echo ""
echo "🎉 Payment flow test successful!"
echo ""
echo "You can now test the payment in the UI at:"
echo "http://localhost:3000/bookings/pay/$BOOKING_ID"