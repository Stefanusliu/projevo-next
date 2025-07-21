// app/api/auth/verify-phone-otp/route.js
import { NextResponse } from 'next/server';
import { adminDb } from '../../../../lib/firebase-admin';

export async function POST(request) {
  try {
    const { phoneNumber, otp, userId } = await request.json();

    if (!phoneNumber || !otp || !userId) {
      return NextResponse.json(
        { error: 'Phone number, OTP, and user ID are required' },
        { status: 400 }
      );
    }

    // Get OTP data from Firestore
    const otpDoc = await adminDb.collection('phone_otps').doc(phoneNumber).get();
    
    if (!otpDoc.exists) {
      return NextResponse.json(
        { error: 'Verification code not found or expired' },
        { status: 400 }
      );
    }

    const otpData = otpDoc.data();
    
    // Check if OTP has expired
    if (new Date() > otpData.expiresAt.toDate()) {
      // Clean up expired OTP
      await adminDb.collection('phone_otps').doc(phoneNumber).delete();
      return NextResponse.json(
        { error: 'Verification code has expired. Please request a new one.' },
        { status: 400 }
      );
    }

    // Check if already verified
    if (otpData.verified) {
      return NextResponse.json(
        { error: 'Verification code has already been used' },
        { status: 400 }
      );
    }

    // Check if too many attempts
    if (otpData.attempts >= 3) {
      await adminDb.collection('phone_otps').doc(phoneNumber).delete();
      return NextResponse.json(
        { error: 'Too many failed attempts. Please request a new verification code.' },
        { status: 400 }
      );
    }

    // Verify OTP
    if (otpData.otp !== otp) {
      // Increment attempts
      await adminDb.collection('phone_otps').doc(phoneNumber).update({
        attempts: otpData.attempts + 1
      });
      
      return NextResponse.json(
        { error: 'Invalid verification code' },
        { status: 400 }
      );
    }

    // OTP is valid - mark as verified and update user profile
    await adminDb.collection('phone_otps').doc(phoneNumber).update({
      verified: true
    });

    // Update user profile to mark phone as verified
    const userRef = adminDb.collection('users').doc(userId);
    await userRef.update({
      phoneVerified: true,
      phoneNumber: phoneNumber,
      updatedAt: new Date()
    });

    // Clean up OTP
    await adminDb.collection('phone_otps').doc(phoneNumber).delete();

    return NextResponse.json({
      success: true,
      message: 'Phone number verified successfully'
    });

  } catch (error) {
    console.error('Error verifying phone OTP:', error);
    return NextResponse.json(
      { error: 'Failed to verify phone number' },
      { status: 500 }
    );
  }
}
