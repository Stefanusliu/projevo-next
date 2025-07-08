// Debug endpoint to check a specific user's data
import { NextResponse } from 'next/server';
import { adminDb } from '../../../../../lib/firebase-admin';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const email = searchParams.get('email');
    
    if (!userId && !email) {
      return NextResponse.json({
        success: false,
        error: 'Either userId or email is required'
      }, { status: 400 });
    }
    
    console.log('Debug User API: Fetching user data for:', { userId, email });
    
    let userDoc;
    if (userId) {
      userDoc = await adminDb.collection('users').doc(userId).get();
    } else {
      // Find user by email
      const querySnapshot = await adminDb.collection('users').where('email', '==', email).get();
      userDoc = querySnapshot.empty ? null : querySnapshot.docs[0];
    }
    
    if (!userDoc || !userDoc.exists) {
      return NextResponse.json({
        success: false,
        error: 'User not found'
      }, { status: 404 });
    }
    
    const userData = userDoc.data();
    console.log('Debug User API: Found user data:', userData);
    
    // Also check if there's an OTP record for this user
    let otpData = null;
    if (email || userData.email) {
      const otpEmail = email || userData.email;
      const otpSnapshot = await adminDb.collection('otps').where('email', '==', otpEmail).get();
      if (!otpSnapshot.empty) {
        otpData = otpSnapshot.docs[0].data();
        console.log('Debug User API: Found OTP data:', otpData);
      }
    }
    
    return NextResponse.json({
      success: true,
      user: {
        id: userDoc.id,
        ...userData
      },
      otpData
    });
    
  } catch (error) {
    console.error('Debug User API error:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}
