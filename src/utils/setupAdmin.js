// src/utils/setupAdmin.js
// Client-side script to create admin user
// Run this in browser console on the login page

import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';

export const setupAdminUser = async () => {
  try {
    const adminEmail = 'admin@projevo.com';
    const adminPassword = 'admin123';
    
    console.log('🔄 Creating admin user...');
    
    // Create user in Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, adminEmail, adminPassword);
    const user = userCredential.user;
    
    console.log('✅ Admin user created in Firebase Auth with UID:', user.uid);
    
    // Create user profile in Firestore
    const adminUserData = {
      uid: user.uid,
      email: adminEmail,
      displayName: 'Administrator',
      firstName: 'Admin',
      lastName: 'User',
      role: 'admin',
      isAdmin: true,
      userType: 'admin',
      emailVerified: true,
      phoneVerified: true,
      profileComplete: true,
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    console.log('🔄 Creating admin user profile in Firestore...');
    
    await setDoc(doc(db, 'users', user.uid), adminUserData);
    
    console.log('✅ Admin user profile created in Firestore');
    console.log('📋 Admin credentials:');
    console.log('   Email:', adminEmail);
    console.log('   Password:', adminPassword);
    console.log('   UID:', user.uid);
    
    return { user, adminUserData };
    
  } catch (error) {
    if (error.code === 'auth/email-already-exists') {
      console.log('⚠️  Admin user already exists');
    } else {
      console.error('❌ Error creating admin user:', error);
    }
    throw error;
  }
};

// For browser console usage
if (typeof window !== 'undefined') {
  window.setupAdminUser = setupAdminUser;
  console.log('🎯 Admin setup function available as window.setupAdminUser()');
  console.log('   Run setupAdminUser() in browser console to create admin user');
}
