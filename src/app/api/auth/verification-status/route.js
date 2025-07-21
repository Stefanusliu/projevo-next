// app/api/auth/verification-status/route.js
import { NextResponse } from 'next/server';
import { adminDb } from '../../../../lib/firebase-admin';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Get user document from Firestore using admin SDK
    const userDoc = await adminDb.collection('users').doc(userId).get();
    
    if (!userDoc.exists) {
      return NextResponse.json(
        { 
          exists: false,
          emailVerified: false,
          phoneVerified: false
        }
      );
    }

    const userData = userDoc.data();
    
    return NextResponse.json({
      exists: true,
      emailVerified: userData.emailVerified || false,
      phoneVerified: userData.phoneVerified || false,
      profileComplete: userData.profileComplete || false,
      userType: userData.userType || '',
      displayName: userData.displayName || '',
      phoneNumber: userData.phoneNumber || ''
    });

  } catch (error) {
    console.error('Error checking verification status:', error);
    return NextResponse.json(
      { error: 'Failed to check verification status' },
      { status: 500 }
    );
  }
}
