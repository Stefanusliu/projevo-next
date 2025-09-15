#!/bin/bash

# Test Xendit Webhook with Verification Token
# Replace PROJECT_ID with actual project ID

PROJECT_ID="your_project_id_here"
WEBHOOK_URL="http://localhost:3000/api/xendit/webhook"
VERIFICATION_TOKEN="sfDQ78ovuNRUh4dxDsyk4uXDJ99rwsawOUuWXu3By38NjwAb"

echo "🧪 Testing Xendit Webhook with Verification Token"
echo "================================================"

# Test 1: Valid webhook with correct token
echo "Test 1: Valid webhook with correct token"
curl -X POST $WEBHOOK_URL \
  -H "Content-Type: application/json" \
  -H "x-callback-token: $VERIFICATION_TOKEN" \
  -d "{
    \"id\": \"test-invoice-$(date +%s)\",
    \"external_id\": \"proj-$PROJECT_ID-$(date +%s)\",
    \"status\": \"PAID\",
    \"amount\": 25000000,
    \"paid_amount\": 25000000,
    \"paid_at\": \"$(date -u +%Y-%m-%dT%H:%M:%S.000Z)\",
    \"payment_id\": \"test-payment-$(date +%s)\",
    \"payment_method\": \"BANK_TRANSFER\",
    \"payment_channel\": \"BCA\",
    \"payer_email\": \"test@example.com\",
    \"description\": \"Test payment\"
  }"

echo -e "\n\n"

# Test 2: Invalid webhook with wrong token
echo "Test 2: Invalid webhook with wrong token"
curl -X POST $WEBHOOK_URL \
  -H "Content-Type: application/json" \
  -H "x-callback-token: wrong_token" \
  -d "{
    \"id\": \"test-invoice-invalid\",
    \"external_id\": \"proj-$PROJECT_ID-invalid\",
    \"status\": \"PAID\",
    \"amount\": 25000000
  }"

echo -e "\n\n"

# Test 3: Webhook without token
echo "Test 3: Webhook without token"
curl -X POST $WEBHOOK_URL \
  -H "Content-Type: application/json" \
  -d "{
    \"id\": \"test-invoice-no-token\",
    \"external_id\": \"proj-$PROJECT_ID-no-token\",
    \"status\": \"PAID\",
    \"amount\": 25000000
  }"

echo -e "\n\n"

echo "✅ Webhook tests completed!"
echo ""
echo "Expected results:"
echo "- Test 1: Should return 200 with 'verified: true'"
echo "- Test 2: Should return 401 'Unauthorized'"  
echo "- Test 3: Should return 401 'Unauthorized'"
