// Debug endpoint to check users in Firestore
import { NextResponse } from 'next/server';
import { adminDb } from '../../../../lib/firebase-admin';

export async function GET() {
  try {
    console.log('Debug API: Fetching all users...');
    
    // Get all users from Firestore using admin SDK
    const usersSnapshot = await adminDb.collection('users').get();
    const users = [];
    
    usersSnapshot.forEach((doc) => {
      const userData = doc.data();
      users.push({
        id: doc.id,
        email: userData.email,
        userType: userData.userType,
        displayName: userData.displayName,
        createdAt: userData.createdAt,
        profileComplete: userData.profileComplete
      });
    });
    
    console.log('Debug API: Found users:', users);
    
    // Also check OTP collections
    const otpSnapshot = await adminDb.collection('otps').get();
    const otps = [];
    
    otpSnapshot.forEach((doc) => {
      const otpData = doc.data();
      otps.push({
        id: doc.id,
        email: otpData.email,
        userType: otpData.userData?.userType,
        verified: otpData.verified,
        createdAt: otpData.createdAt
      });
    });
    
    console.log('Debug API: Found OTPs:', otps);
    
    return NextResponse.json({
      success: true,
      users,
      otps,
      totalUsers: users.length,
      totalOtps: otps.length
    });
    
  } catch (error) {
    console.error('Debug API error:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}
