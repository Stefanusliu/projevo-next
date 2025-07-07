// utils/testFirebase.js
import { auth, db } from '../lib/firebase';
import { collection, getDocs } from 'firebase/firestore';

export const testFirebaseConnection = async () => {
  try {
    console.log('Testing Firebase connection...');
    
    // Test Auth
    console.log('Auth instance:', auth);
    console.log('Current user:', auth.currentUser);
    
    // Test Firestore
    console.log('Firestore instance:', db);
    
    // Try to read from a collection (this will test permissions)
    try {
      const testCollection = collection(db, 'test');
      await getDocs(testCollection);
      console.log('✅ Firestore connection successful');
    } catch (firestoreError) {
      console.log('❌ Firestore connection failed:', firestoreError.message);
      console.log('Error code:', firestoreError.code);
    }
    
    return true;
  } catch (error) {
    console.error('❌ Firebase connection test failed:', error);
    return false;
  }
};

// Simple function to test auth state
export const getCurrentAuthState = () => {
  return {
    user: auth.currentUser,
    uid: auth.currentUser?.uid,
    email: auth.currentUser?.email,
    emailVerified: auth.currentUser?.emailVerified
  };
};
