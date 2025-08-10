#!/usr/bin/env python3
"""
Test script to verify payment intent creation with automatic_payment_methods
"""
import requests
import json

# First, we need to login to get a token
login_url = "https://caas-backend-102964896009.us-central1.run.app/api/v1/auth/login"
payment_url = "https://caas-backend-102964896009.us-central1.run.app/api/v1/payments/create-intent"

# Test credentials (you'll need real ones)
login_data = {
    "email": "test@example.com",
    "password": "Test123!"
}

print("🔐 Attempting login...")
login_response = requests.post(login_url, json=login_data)

if login_response.status_code == 200:
    tokens = login_response.json()
    access_token = tokens.get("access_token")
    print("✅ Login successful")
    
    # Create a test booking ID (you'd need a real one)
    test_booking_id = "test-booking-123"
    
    headers = {
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json"
    }
    
    payment_data = {
        "booking_id": test_booking_id,
        "save_payment_method": False
    }
    
    print(f"\n💳 Creating payment intent for booking: {test_booking_id}")
    payment_response = requests.post(payment_url, json=payment_data, headers=headers)
    
    print(f"Status: {payment_response.status_code}")
    print(f"Response: {json.dumps(payment_response.json(), indent=2)}")
    
    if payment_response.status_code == 200:
        data = payment_response.json()
        print(f"\n✅ Payment intent created successfully!")
        print(f"   Client Secret: {data.get('client_secret')[:20]}...")
        print(f"   Amount: £{data.get('amount')}")
        print(f"   Currency: {data.get('currency')}")
    else:
        print(f"\n❌ Failed to create payment intent")
else:
    print(f"❌ Login failed: {login_response.status_code}")
    print(f"Response: {login_response.text}")