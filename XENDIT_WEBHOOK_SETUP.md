# Xendit Webhook Setup Guide

## Overview

This guide explains how to set up Xendit webhooks to properly handle payment notifications and update project status automatically.

## Current Implementation

### 1. Webhook Endpoint

- **URL**: `/api/xendit/webhook`
- **Method**: POST
- **Purpose**: Receives payment status updates from Xendit

### 2. Payment Flow

1. User clicks "Bayar Termin 1 & 2" button
2. Payment invoice is created with external_id format: `proj-{projectId}-{timestamp}`
3. User is redirected to Xendit payment page
4. After payment completion, Xendit sends webhook to our endpoint
5. Webhook updates project status to "Berjalan" (running)

### 3. Webhook Configuration in Xendit Dashboard

#### For Development/Testing:

1. Login to Xendit Dashboard (https://dashboard.xendit.co/)
2. Go to Settings > Developers > Webhooks
3. Add new webhook with:
   - **URL**: `http://localhost:3000/api/xendit/webhook` (for local testing)
   - **Events**: Select "Invoice" events
   - **Status**: Active
   - **Verification Token**: `sfDQ78ovuNRUh4dxDsyk4uXDJ99rwsawOUuWXu3By38NjwAb`

#### For Production:

1. Replace localhost URL with your production domain:
   - **URL**: `https://yourdomain.com/api/xendit/webhook`
2. Use the same verification token

#### Important Security Notes:

- The webhook endpoint verifies the `x-callback-token` header for security
- Only requests with the correct token will be processed
- Unauthorized requests return 401 status code

### 4. Testing Payment Status

#### Scenario 1: Successful Payment

1. Click "Bayar Termin 1 & 2"
2. Complete payment on Xendit page
3. Webhook receives PAID status
4. Project status automatically changes to "Berjalan"
5. Button changes from "Bayar Termin 1 & 2" to "Pantau Progres"

#### Scenario 2: Unpaid/Failed Payment

1. Click "Bayar Termin 1 & 2"
2. Close payment page without completing payment OR select failure in test mode
3. No webhook is sent or webhook shows EXPIRED/FAILED status
4. Project remains in "Diberikan" status
5. Button remains "Bayar Termin 1 & 2"

### 5. Manual Testing

You can manually test webhook processing using the test endpoint:

```bash
# Test successful payment
curl -X POST http://localhost:3000/api/xendit/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "id": "test-invoice-id",
    "external_id": "proj-YOUR_PROJECT_ID-1234567890",
    "status": "PAID",
    "amount": 25000000,
    "paid_at": "2025-09-15T10:00:00.000Z",
    "payment_id": "test-payment-id",
    "payment_method": "BANK_TRANSFER"
  }'
```

### 6. Webhook Security & Verification

The webhook endpoint includes several security measures:

#### ✅ **Token Verification**

- Verifies `x-callback-token` header matches our verification token
- Rejects unauthorized requests with 401 status
- Prevents malicious webhook attempts

#### ✅ **Duplicate Prevention**

- Checks `payment_id` to prevent duplicate processing
- Protects against money loss from duplicate webhooks
- Maintains webhook history for audit trail

#### ✅ **Quick Acknowledgement**

- Responds with 200 status immediately after processing
- Prevents Xendit retries due to timeouts
- Includes verification status in response

#### ✅ **Error Handling**

- Logs all webhook activity for debugging
- Returns 200 even on errors to prevent retries
- Graceful handling of missing or invalid data

### 7. Webhook Verification

The webhook endpoint:

- ✅ Validates webhook verification token
- ✅ Validates required fields
- ✅ Extracts project ID from external_id
- ✅ Prevents duplicate processing
- ✅ Updates project payment status
- ✅ Sets firstPaymentCompleted = true
- ✅ Changes project status to "Berjalan"
- ✅ Always returns 200 to prevent retries
- ✅ Logs all webhook activity

### 8. Project Status Flow

```
[Proposal Accepted]
    ↓
[Status: "Diberikan" + Button: "Bayar Termin 1 & 2"]
    ↓ (Payment initiated)
[Payment tracking stored]
    ↓ (Webhook confirms payment)
[Status: "Berjalan" + Button: "Pantau Progres"]
```

### 9. Database Updates

When webhook confirms payment:

```javascript
{
  firstPaymentCompleted: true,
  initialPaymentCompleted: true,
  status: "Berjalan",
  paymentCompletedAt: Date,
  payment: {
    status: "completed",
    orderId: "payment_id",
    externalId: "external_id",
    amount: Number,
    paidAmount: Number,
    paymentMethod: "BANK_TRANSFER",
    paymentChannel: "BCA",
    paidAt: Date,
    webhookProcessedAt: Date
  },
  webhookHistory: [
    {
      payment_id: "payment_id",
      status: "PAID",
      processedAt: Date,
      external_id: "external_id"
    }
  ]
}
```

## Troubleshooting

### Issue: Payment always shows as successful

- **Cause**: No webhook configured or webhook not working
- **Solution**: Set up webhook URL in Xendit dashboard

### Issue: Webhook not receiving data

- **Cause**: Incorrect webhook URL or firewall blocking
- **Solution**: Check URL is accessible and webhook is active in Xendit

### Issue: Project status not updating

- **Cause**: external_id format mismatch or project not found
- **Solution**: Check logs for webhook processing errors

## Security Notes

1. In production, consider adding webhook signature verification
2. Validate webhook source IP if needed
3. Use HTTPS URLs for webhook endpoints
4. Monitor webhook logs for suspicious activity
