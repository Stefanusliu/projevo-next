// Test script to create a vendor user for testing
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../lib/firebase.js';

async function createTestVendor() {
  const testEmail = 'testvendor@test.com';
  const testPassword = 'password123';
  
  try {
    console.log('Creating test vendor account...');
    
    // Create user with email and password
    const userCredential = await createUserWithEmailAndPassword(auth, testEmail, testPassword);
    const user = userCredential.user;

    // Update user profile
    await updateProfile(user, {
      displayName: 'Test Vendor'
    });

    console.log('User created, now saving to Firestore...');

    // Save user data to Firestore
    const userDataToSave = {
      uid: user.uid,
      email: testEmail,
      firstName: 'Test',
      lastName: 'Vendor',
      displayName: 'Test Vendor',
      phoneNumber: '+1234567890',
      userType: 'vendor',
      companyName: 'Test Company',
      emailVerified: user.emailVerified,
      phoneVerified: false,
      profileComplete: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      status: 'active'
    };

    await setDoc(doc(db, 'users', user.uid), userDataToSave);
    console.log('Test vendor created successfully!', user.uid);
    console.log('Email:', testEmail);
    console.log('Password:', testPassword);
    
  } catch (error) {
    console.error('Error creating test vendor:', error);
  }
}

// Run the test
createTestVendor();
