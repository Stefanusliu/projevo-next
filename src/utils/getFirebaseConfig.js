// utils/getFirebaseConfig.js
// This utility helps extract client-side config from Firebase Console

/**
 * Instructions to get Firebase Client Configuration:
 * 
 * 1. Go to Firebase Console: https://console.firebase.google.com/
 * 2. Select your project: projevo-cc635
 * 3. Click on the gear icon (Settings) → Project settings
 * 4. Scroll down to "Your apps" section
 * 5. If you don't have a web app, click "Add app" → Web app
 * 6. Copy the configuration object
 * 
 * Example configuration object from Firebase Console:
 * 
 * const firebaseConfig = {
 *   apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
 *   authDomain: "projevo-cc635.firebaseapp.com",
 *   projectId: "projevo-cc635",
 *   storageBucket: "projevo-cc635.appspot.com",
 *   messagingSenderId: "123456789012",
 *   appId: "1:123456789012:web:abcdefghijklmnop"
 * };
 * 
 * Take these values and add them to your .env.local file:
 * 
 * NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
 * NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=projevo-cc635.firebaseapp.com
 * NEXT_PUBLIC_FIREBASE_PROJECT_ID=projevo-cc635
 * NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=projevo-cc635.appspot.com
 * NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789012
 * NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789012:web:abcdefghijklmnop
 */

// Cache validation result to avoid repeated checks
let validationCache = null;
let validationChecked = false;

// Validate that all required environment variables are present
export function validateFirebaseConfig() {
  // Return cached result if already validated
  if (validationChecked) {
    return validationCache;
  }

  const requiredVars = [
    'NEXT_PUBLIC_FIREBASE_API_KEY',
    'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
    'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
    'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
    'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
    'NEXT_PUBLIC_FIREBASE_APP_ID'
  ];

  const missing = requiredVars.filter(varName => !process.env[varName]);
  
  if (missing.length > 0) {
    // Only log error once to reduce console spam
    if (!validationChecked) {
      console.warn('⚠️ Firebase configuration incomplete:', missing.join(', '));
    }
    validationCache = false;
  } else {
    validationCache = true;
  }
  
  validationChecked = true;
  return validationCache;
}

// Get the current Firebase configuration (for debugging)
export function getCurrentFirebaseConfig() {
  return {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'MISSING',
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'MISSING',
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'MISSING',
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'MISSING',
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || 'MISSING',
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || 'MISSING'
  };
}

// Silent validation for runtime checks (no console output)
export function isFirebaseConfigured() {
  const requiredVars = [
    'NEXT_PUBLIC_FIREBASE_API_KEY',
    'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
    'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
    'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
    'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
    'NEXT_PUBLIC_FIREBASE_APP_ID'
  ];

  return requiredVars.every(varName => !!process.env[varName]);
}
