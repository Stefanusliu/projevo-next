// Script to create admin user in Firebase
// Run this in browser console on a page with Firebase initialized, or use Firebase CLI

const createAdminUser = async () => {
  try {
    // This is the information for the admin user
    const adminEmail = 'admin@projevo.com';
    const adminPassword = 'admin123';
    
    console.log('Creating admin user...');
    
    // Note: This should be run manually through Firebase Console or Firebase CLI
    // as createUserWithEmailAndPassword requires special permissions
    
    const adminUserData = {
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
    
    console.log('Admin user data to be created:', adminUserData);
    console.log('Email:', adminEmail);
    console.log('Password:', adminPassword);
    
    // Instructions for manual creation
    console.log('\n=== MANUAL CREATION INSTRUCTIONS ===');
    console.log('1. Go to Firebase Console: https://console.firebase.google.com/');
    console.log('2. Select your project');
    console.log('3. Go to Authentication > Users');
    console.log('4. Click "Add user"');
    console.log('5. Enter email:', adminEmail);
    console.log('6. Enter password:', adminPassword);
    console.log('7. Click "Add user"');
    console.log('8. Copy the generated UID');
    console.log('9. Go to Firestore Database');
    console.log('10. Navigate to "users" collection');
    console.log('11. Create a new document with the UID as document ID');
    console.log('12. Add the following fields:');
    console.log(JSON.stringify(adminUserData, null, 2));
    
  } catch (error) {
    console.error('Error creating admin user:', error);
  }
};

// Export for use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { createAdminUser };
} else {
  // Run immediately if in browser
  createAdminUser();
}
