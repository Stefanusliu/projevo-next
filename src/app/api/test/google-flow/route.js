// Test Google login flow with user type selection
import { NextResponse } from 'next/server';
import { adminAuth, adminDb } from '../../../../lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

export async function POST(request) {
  try {
    const { action, email } = await request.json();
    
    if (action === 'create-google-user') {
      console.log('Creating Google user without userType for testing...');
      
      // Create a test user that simulates Google login (no userType)
      const userRecord = await adminAuth.createUser({
        email: email,
        displayName: 'Test Google User',
        emailVerified: true,
        password: 'testpassword123' // For testing purposes
      });
      
      console.log('Created user:', userRecord.uid);
      
      // Create user profile without userType (simulating Google login)
      await adminDb.collection('users').doc(userRecord.uid).set({
        uid: userRecord.uid,
        email: email,
        displayName: 'Test Google User',
        firstName: 'Test',
        lastName: 'User',
        emailVerified: true,
        phoneVerified: false,
        userType: '', // Empty userType to test selection flow
        profileComplete: false,
        status: 'active',
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp()
      });
      
      console.log('Created user profile without userType');
      
      return NextResponse.json({
        success: true,
        message: 'Test Google user created successfully',
        user: {
          uid: userRecord.uid,
          email: userRecord.email,
          userType: '' // Empty to test selection flow
        },
        testCredentials: {
          email: email,
          password: 'testpassword123'
        },
        instructions: [
          '1. Go to /login',
          '2. Login with the provided credentials',
          '3. Should redirect to /select-user-type',
          '4. Select user type (vendor or project-owner)',
          '5. Should redirect to appropriate dashboard'
        ]
      });
      
    } else if (action === 'cleanup') {
      // Clean up test user
      try {
        const userRecord = await adminAuth.getUserByEmail(email);
        await adminAuth.deleteUser(userRecord.uid);
        await adminDb.collection('users').doc(userRecord.uid).delete();
        
        return NextResponse.json({
          success: true,
          message: 'Test user cleaned up'
        });
      } catch (error) {
        if (error.code === 'auth/user-not-found') {
          return NextResponse.json({
            success: true,
            message: 'User already does not exist'
          });
        }
        throw error;
      }
    }
    
    return NextResponse.json({
      success: false,
      error: 'Invalid action'
    });
    
  } catch (error) {
    console.error('Google user test error:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Google login user type selection test',
    usage: 'POST with action "create-google-user" and email to create test user',
    actions: {
      'create-google-user': 'Creates a user without userType to test selection flow',
      'cleanup': 'Removes the test user'
    }
  });
}
