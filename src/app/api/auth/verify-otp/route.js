// app/api/auth/verify-otp/route.js
import { NextResponse } from 'next/server';
import { adminDb } from '../../../../lib/firebase-admin';

export async function POST(request) {
  try {
    const { email, otp, userId } = await request.json();

    if (!email || !otp) {
      return NextResponse.json(
        { error: 'Email and OTP are required' },
        { status: 400 }
      );
    }

    // Get OTP data from Firestore
    const otpDoc = await adminDb.collection('email_otps').doc(email).get();
    
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
      await adminDb.collection('email_otps').doc(email).delete();
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
      await adminDb.collection('email_otps').doc(email).delete();
      return NextResponse.json(
        { error: 'Too many failed attempts. Please request a new verification code.' },
        { status: 400 }
      );
    }

    // Check if OTP matches
    if (otpData.otp !== otp) {
      // Increment attempts
      await adminDb.collection('email_otps').doc(email).update({
        attempts: otpData.attempts + 1
      });
      
      return NextResponse.json(
        { error: 'Invalid verification code. Please try again.' },
        { status: 400 }
      );
    }

    // OTP is valid - mark as verified
    await adminDb.collection('email_otps').doc(email).update({
      verified: true,
      verifiedAt: new Date()
    });

    // Update user's email verification status in Firestore using admin SDK
    if (userId) {
      try {
        // First check if user document exists
        const userDoc = await adminDb.collection('users').doc(userId).get();
        
        if (userDoc.exists) {
          // Document exists, just update it
          await adminDb.collection('users').doc(userId).update({
            emailVerified: true,
            updatedAt: new Date()
          });
        } else {
          // Document doesn't exist, create it with complete signup data if available
          console.log('User document not found, creating document for:', userId);
          
          let userDocData = {
            uid: userId,
            email: email,
            emailVerified: true,
            createdAt: new Date(),
            updatedAt: new Date(),
            status: 'active'
          };

          // If we have complete user data from signup, use it
          if (otpData.userData) {
            userDocData = {
              ...userDocData,
              firstName: otpData.userData.firstName || '',
              lastName: otpData.userData.lastName || '',
              displayName: otpData.userData.displayName || `${otpData.userData.firstName || ''} ${otpData.userData.lastName || ''}`.trim(),
              phoneNumber: otpData.userData.phoneNumber || '',
              userType: otpData.userData.userType || '',
              companyName: otpData.userData.companyName || '',
              phoneVerified: false,
              profileComplete: true // Set to true since we have the signup data
            };
            console.log('Using complete signup data for user document');
          } else {
            userDocData.profileComplete = false; // Will need to complete profile later
            console.log('Using basic user data - profile will need to be completed');
          }

          await adminDb.collection('users').doc(userId).set(userDocData);
        }
        console.log('User email verification status updated for userId:', userId);
      } catch (updateError) {
        console.error('Failed to update user verification status:', updateError);
        // Don't fail the whole operation if user update fails
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Email verified successfully'
    });

  } catch (error) {
    console.error('Error verifying OTP:', error);
    return NextResponse.json(
      { error: 'Failed to verify code' },
      { status: 500 }
    );
  }
}
