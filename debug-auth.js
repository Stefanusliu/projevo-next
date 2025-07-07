// Debug script to test authentication flow
console.log('Starting authentication debug...');

// Test if Firebase is properly initialized
import { auth, db } from './src/lib/firebase.js';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

console.log('Firebase auth:', auth);
console.log('Firebase db:', db);

// Listen to auth state changes
onAuthStateChanged(auth, async (user) => {
  console.log('Auth state changed:', user);
  
  if (user) {
    console.log('User details:', {
      uid: user.uid,
      email: user.email,
      emailVerified: user.emailVerified,
      displayName: user.displayName,
      phoneNumber: user.phoneNumber
    });
    
    // Try to fetch user profile
    try {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        console.log('User profile exists:', userDoc.data());
      } else {
        console.log('User profile does not exist');
        
        // Check email-verifications
        try {
          const emailVerificationDoc = await getDoc(doc(db, 'email-verifications', user.email));
          if (emailVerificationDoc.exists()) {
            console.log('Email verification data:', emailVerificationDoc.data());
          } else {
            console.log('No email verification data found');
          }
        } catch (emailError) {
          console.error('Error checking email verifications:', emailError);
        }
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  } else {
    console.log('No user logged in');
  }
});
