// app/api/auth/send-phone-otp/route.js
import { NextResponse } from 'next/server';
import { adminDb } from '../../../../lib/firebase-admin';

export async function POST(request) {
  try {
    const { phoneNumber, userId } = await request.json();

    if (!phoneNumber || !userId) {
      return NextResponse.json(
        { error: 'Phone number and user ID are required' },
        { status: 400 }
      );
    }

    // Validate phone number format (basic validation)
    if (!/^\+?[1-9]\d{1,14}$/.test(phoneNumber.replace(/\s+/g, ''))) {
      return NextResponse.json(
        { error: 'Invalid phone number format' },
        { status: 400 }
      );
    }

    // Generate 6-digit OTP for phone
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Store OTP in database with expiration (5 minutes)
    const otpData = {
      otp: otp,
      phoneNumber: phoneNumber,
      userId: userId,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes
      verified: false,
      attempts: 0
    };

    // Save OTP to Firestore
    await adminDb.collection('phone_otps').doc(phoneNumber).set(otpData);

    // Log OTP for development/debugging
    if (process.env.NODE_ENV === 'development') {
      console.log(`📱 Phone OTP for ${phoneNumber}: ${otp}`);
    }

    return NextResponse.json({
      success: true,
      message: 'Verification code sent successfully',
      expiresIn: 300, // 5 minutes in seconds
      // In development, return OTP for testing
      ...(process.env.NODE_ENV === 'development' && { otp })
    });

  } catch (error) {
    console.error('Error sending phone OTP:', error);
    return NextResponse.json(
      { error: 'Failed to send verification code' },
      { status: 500 }
    );
  }
}
