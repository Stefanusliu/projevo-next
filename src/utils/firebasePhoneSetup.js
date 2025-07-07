// utils/firebasePhoneSetup.js

export const checkFirebasePhoneSetup = () => {
  const issues = [];
  
  // Check if running in localhost
  if (typeof window !== 'undefined' && 
      (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
    issues.push({
      type: 'warning',
      message: 'Phone verification may not work on localhost. Consider testing on a deployed domain.'
    });
  }
  
  // Check Firebase config
  if (!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) {
    issues.push({
      type: 'error',
      message: 'Firebase project ID is missing from environment variables.'
    });
  }
  
  if (!process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN) {
    issues.push({
      type: 'error',
      message: 'Firebase auth domain is missing from environment variables.'
    });
  }
  
  return issues;
};

export const getFirebasePhoneSetupInstructions = () => {
  return {
    title: 'Firebase Phone Authentication Setup Required',
    instructions: [
      {
        step: 1,
        title: 'Enable Phone Authentication',
        description: 'Go to Firebase Console > Authentication > Sign-in method > Phone'
      },
      {
        step: 2,
        title: 'Add Authorized Domains',
        description: 'Add your domain to the authorized domains list (including localhost for development)'
      },
      {
        step: 3,
        title: 'Configure reCAPTCHA',
        description: 'Ensure reCAPTCHA is properly configured for your domain'
      },
      {
        step: 4,
        title: 'Test Setup',
        description: 'Try phone verification again after completing the setup'
      }
    ],
    links: {
      firebaseConsole: `https://console.firebase.google.com/project/${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}/authentication/providers`,
      documentation: 'https://firebase.google.com/docs/auth/web/phone-auth'
    }
  };
};
