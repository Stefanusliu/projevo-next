# Firebase Phone Authentication Setup

This document explains how to set up Firebase Phone Authentication for the Projevo platform.

## Current Status

✅ Email verification (custom OTP via SMTP)  
⚠️ Phone verification (requires Firebase Phone Auth setup)  

## Setup Instructions

### 1. Enable Phone Authentication in Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project (`projevo-cc635`)
3. Navigate to **Authentication** → **Sign-in method**
4. Find **Phone** provider and click **Enable**
5. Click **Save**

### 2. Configure Authorized Domains

1. In the same **Sign-in method** tab, scroll down to **Authorized domains**
2. Make sure these domains are added:
   - `localhost` (for development)
   - `projevo.com` (for production)
   - Your deployment domain (if different)

### 3. reCAPTCHA Configuration

Firebase Phone Auth uses reCAPTCHA for verification. The setup is automatic, but you may need to:

1. Check if reCAPTCHA is working in your browser
2. Ensure popup blockers are disabled for your domain
3. Test with different phone numbers

### 4. Testing & Development

For development and testing, you can:

1. **Use Development Mode**: Add this to your `.env.local`:
   ```
   NEXT_PUBLIC_FIREBASE_PHONE_AUTH_DISABLED=true
   ```
   This simulates phone verification using code `123456`

2. **Test Phone Numbers**: Firebase provides test phone numbers that don't send real SMS:
   - Add test numbers in Firebase Console → Authentication → Settings → Phone numbers for testing

## Troubleshooting

### "invalid-app-credential" Error

This means Phone Authentication is not enabled in Firebase Console. Follow Step 1 above.

### "quota-exceeded" Error

You've reached the SMS sending limit. Options:
- Wait for quota reset
- Upgrade Firebase plan
- Use test phone numbers
- Use development mode

### reCAPTCHA Issues

- Ensure domain is whitelisted
- Disable popup blockers
- Try incognito/private browsing
- Check browser console for errors

## Implementation Details

### Current Flow

1. User signs up with email/password
2. Custom email OTP verification (✅ Working)
3. Phone number verification via Firebase (⚠️ Needs setup)
4. User profile saved to Firestore with verification status

### Verification Status

User documents in Firestore include:
```javascript
{
  emailVerified: boolean,
  phoneVerified: boolean,
  // ... other user data
}
```

### Development Workflow

1. **Without Firebase Phone Auth**: Use development mode flag
2. **With Firebase Phone Auth**: Complete setup steps above
3. **Production**: Ensure all domains are authorized and quotas are sufficient

## Next Steps

1. Complete Firebase Phone Auth setup
2. Test with real phone numbers
3. Configure production domains
4. Monitor SMS usage and quotas
5. Consider implementing fallback verification methods

## Support

If you encounter issues:
1. Check Firebase Console logs
2. Review browser console errors
3. Verify environment variables
4. Test with different browsers/devices
5. Consult [Firebase Phone Auth Documentation](https://firebase.google.com/docs/auth/web/phone-auth)
