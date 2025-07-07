// app/api/auth/send-otp/route.js
import { NextResponse } from 'next/server';
import { generateOTP, sendOTPEmail } from '../../../../lib/emailService';
import { adminDb } from '../../../../lib/firebase-admin';

export async function POST(request) {
  try {
    console.log('Send OTP API called');
    console.log('Environment check:', {
      EMAIL_HOST: process.env.EMAIL_HOST,
      EMAIL_PORT: process.env.EMAIL_PORT,
      EMAIL_USER: process.env.EMAIL_USER,
      EMAIL_FROM: process.env.EMAIL_FROM,
      hasEmailPass: !!process.env.EMAIL_PASS
    });

    const { email, name, userId, userData } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Generate 4-digit OTP
    const otp = generateOTP();
    
    // Store OTP in database with expiration (10 minutes)
    const otpData = {
      otp: otp,
      email: email,
      userId: userId || null,
      userData: userData || null, // Store complete signup data for fallback
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
      verified: false,
      attempts: 0
    };

    // Save OTP to Firestore
    await adminDb.collection('email_otps').doc(email).set(otpData);

    // Send OTP email
    await sendOTPEmail(email, otp, name);

    return NextResponse.json({
      success: true,
      message: 'Verification code sent successfully',
      expiresIn: 600 // 10 minutes in seconds
    });

  } catch (error) {
    console.error('Error sending OTP:', error);
    console.error('Error stack:', error.stack);
    
    // Provide more specific error messages
    let errorMessage = 'Failed to send verification code';
    if (error.message.includes('authentication')) {
      errorMessage = 'Email authentication failed. Please check email credentials.';
    } else if (error.message.includes('connection')) {
      errorMessage = 'Failed to connect to email server. Please try again.';
    } else if (error.message.includes('timeout')) {
      errorMessage = 'Email sending timed out. Please try again.';
    }
    
    return NextResponse.json(
      { 
        error: errorMessage,
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}
