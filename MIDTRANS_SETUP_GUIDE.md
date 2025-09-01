# Midtrans Payment Integration Setup Guide

## Overview
This implementation adds a 50% down payment requirement when a project owner selects a vendor for the first time. The payment is processed through Midtrans Snap integration.

## Features Implemented

### 1. Payment Flow
- **Trigger**: When project owner accepts a proposal (first vendor selection)
- **Amount**: 50% of the total proposal amount
- **Payment Gateway**: Midtrans Snap (supports various payment methods)
- **Process**: Payment → Vendor Selection → Notifications

### 2. API Endpoints
- `POST /api/midtrans/create-payment` - Creates payment token
- `POST /api/midtrans/webhook` - Handles payment notifications

### 3. Components
- `MidtransPaymentModal` - Payment interface modal
- Updated `ProjectOwnerDetailPage` - Integrated payment flow

### 4. Email Notifications
- **Vendor**: Notified when selected and payment is completed
- **Project Owner**: Payment confirmation

## Setup Instructions

### 1. Midtrans Account Setup
1. Create a Midtrans account at [https://midtrans.com](https://midtrans.com)
2. Get your credentials from the dashboard:
   - Client Key (for frontend)
   - Server Key (for backend)

### 2. Environment Variables
Update your `.env.local` file with your Midtrans credentials:

```env
# Midtrans Configuration
NEXT_PUBLIC_MIDTRANS_CLIENT_KEY=SB-Mid-client-YOUR_CLIENT_KEY_HERE
MIDTRANS_SERVER_KEY=SB-Mid-server-YOUR_SERVER_KEY_HERE
MIDTRANS_IS_PRODUCTION=false
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**For Sandbox Testing:**
- Client Key starts with `SB-Mid-client-`
- Server Key starts with `SB-Mid-server-`

**For Production:**
- Set `MIDTRANS_IS_PRODUCTION=true`
- Use production keys (without `SB-` prefix)

### 3. Webhook Setup
Configure the webhook URL in your Midtrans dashboard:
- **Sandbox**: `http://your-ngrok-url.ngrok.io/api/midtrans/webhook`
- **Production**: `https://yourdomain.com/api/midtrans/webhook`

## How It Works

### 1. User Flow
1. Project owner reviews vendor proposals
2. Clicks "Accept" on a proposal
3. **Payment modal appears** (for first vendor selection)
4. Project owner completes 50% payment via Midtrans
5. Vendor is automatically selected upon successful payment
6. Both parties receive email notifications

### 2. Technical Flow
1. `handleAcceptProposal` checks if it's first vendor selection
2. Opens payment modal with proposal details
3. Modal calls `/api/midtrans/create-payment` to get payment token
4. Midtrans Snap processes payment
5. Webhook receives payment notification
6. System completes vendor selection automatically
7. Email notifications sent to both parties

### 3. Database Changes
When payment is successful, the system updates:
- Project status: `vendor_selected`
- Proposal status: `selected`
- Adds payment reference
- Stores payment record in `payments` collection

## Testing

### Test Payment (Sandbox)
Use Midtrans test cards:
- **Success**: `4811 1111 1111 1114`
- **Failure**: `4011 1111 1111 1112`
- **CVV**: Any 3 digits
- **Expiry**: Any future date

### Test Scenario
1. Create a project as project owner
2. Submit a proposal as vendor
3. Accept the proposal as project owner
4. Complete the payment flow
5. Verify vendor receives notification
6. Check payment record in Firestore

## Security Considerations

### 1. Environment Variables
- Never commit `.env.local` to version control
- Use different keys for sandbox and production
- Restrict server key access

### 2. Webhook Security
- Implement signature verification in production
- Validate payment amounts match expected values
- Log all webhook events for audit

### 3. Frontend Security
- Client key is safe to expose (frontend only)
- Server key must remain server-side only
- Validate user permissions before payment

## Customization Options

### 1. Payment Amount
Currently set to 50%. To change:
```javascript
// In /api/midtrans/create-payment/route.js
const paymentAmount = Math.round(amount * 0.5); // Change 0.5 to desired percentage
```

### 2. Payment Methods
Configure in Midtrans dashboard:
- Credit/Debit Cards
- Bank Transfer
- E-Wallets (GoPay, OVO, Dana)
- Convenience Store payments

### 3. Email Templates
Customize email content in `/api/midtrans/webhook/route.js`:
- `sendVendorNotification()`
- `sendProjectOwnerConfirmation()`

## Troubleshooting

### Common Issues
1. **Script not loaded**: Ensure Midtrans script is in layout.js
2. **Invalid credentials**: Check environment variables
3. **Webhook not triggered**: Verify webhook URL configuration
4. **Payment fails**: Check sandbox vs production settings

### Debugging
- Check browser console for JavaScript errors
- Monitor API endpoints in Network tab
- Check server logs for webhook processing
- Verify Firestore updates

## Next Steps
1. Set up actual Midtrans account
2. Configure production webhook URL
3. Test payment flow end-to-end
4. Configure email templates
5. Set up monitoring and logging

## Support
- Midtrans Documentation: [https://docs.midtrans.com](https://docs.midtrans.com)
- Midtrans Support: [https://help.midtrans.com](https://help.midtrans.com)
