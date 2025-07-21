// scripts/createAdminUser.js
// Script to create admin user using Firebase Admin SDK

const { adminAuth, adminDb } = require('../src/lib/firebase-admin');

const createAdminUser = async () => {
  try {
    const adminEmail = 'admin@projevo.com';
    const adminPassword = 'admin123';
    
    console.log('🔄 Creating admin user in Firebase Auth...');
    
    // Create user in Firebase Auth
    const userRecord = await adminAuth.createUser({
      email: adminEmail,
      password: adminPassword,
      displayName: 'Administrator',
      emailVerified: true,
    });
    
    console.log('✅ Admin user created in Firebase Auth with UID:', userRecord.uid);
    
    // Create user profile in Firestore
    const adminUserData = {
      uid: userRecord.uid,
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
    
    await adminDb.collection('users').doc(userRecord.uid).set(adminUserData);
    
    console.log('✅ Admin user profile created in Firestore');
    console.log('📋 Admin credentials:');
    console.log('   Email:', adminEmail);
    console.log('   Password:', adminPassword);
    console.log('   UID:', userRecord.uid);
    
  } catch (error) {
    if (error.code === 'auth/email-already-exists') {
      console.log('⚠️  Admin user already exists in Firebase Auth');
      
      // Get existing user and update Firestore profile
      try {
        const userRecord = await adminAuth.getUserByEmail('admin@projevo.com');
        console.log('📋 Existing admin user UID:', userRecord.uid);
        
        // Update Firestore profile to ensure admin role
        const adminUserData = {
          uid: userRecord.uid,
          email: userRecord.email,
          displayName: userRecord.displayName || 'Administrator',
          firstName: 'Admin',
          lastName: 'User',
          role: 'admin',
          isAdmin: true,
          userType: 'admin',
          emailVerified: true,
          phoneVerified: true,
          profileComplete: true,
          status: 'active',
          updatedAt: new Date()
        };
        
        await adminDb.collection('users').doc(userRecord.uid).set(adminUserData, { merge: true });
        console.log('✅ Admin user profile updated in Firestore');
        
      } catch (updateError) {
        console.error('❌ Error updating existing admin user:', updateError);
      }
    } else {
      console.error('❌ Error creating admin user:', error);
    }
  }
};

// Export for use in other files or run directly
if (require.main === module) {
  createAdminUser().then(() => {
    console.log('🎉 Admin user setup complete!');
    process.exit(0);
  }).catch((error) => {
    console.error('💥 Failed to create admin user:', error);
    process.exit(1);
  });
}

module.exports = { createAdminUser };
