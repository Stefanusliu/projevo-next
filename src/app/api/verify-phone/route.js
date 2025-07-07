// app/api/verify-phone/route.js
import { NextResponse } from 'next/server';
import { adminDb, adminAuth } from '../../../lib/firebase-admin';

export async function POST(request) {
  try {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authorization header required' },
        { status: 401 }
      );
    }

    const idToken = authHeader.split('Bearer ')[1];
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    
    const { phoneNumber, verified = true } = await request.json();

    if (!phoneNumber) {
      return NextResponse.json(
        { error: 'Phone number is required' },
        { status: 400 }
      );
    }

    // Update user's phone verification status
    await adminDb.collection('users').doc(decodedToken.uid).update({
      phoneNumber: phoneNumber,
      phoneVerified: verified,
      updatedAt: new Date()
    });

    // Get updated user data
    const updatedDoc = await adminDb.collection('users').doc(decodedToken.uid).get();
    const userData = updatedDoc.data();

    return NextResponse.json({
      success: true,
      message: 'Phone number verified successfully',
      user: {
        uid: userData.uid,
        phoneNumber: userData.phoneNumber,
        phoneVerified: userData.phoneVerified
      }
    });

  } catch (error) {
    console.error('Error verifying phone number:', error);
    return NextResponse.json(
      { error: 'Failed to verify phone number' },
      { status: 500 }
    );
  }
}
