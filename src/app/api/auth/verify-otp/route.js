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
        
        console.log('OTP verification - userDoc.exists:', userDoc.exists);
        
        if (userDoc.exists) {
          console.log('OTP verification - User document EXISTS, updating emailVerified and preserving userType');
          const existingData = userDoc.data();
          console.log('OTP verification - Existing userType:', existingData.userType);
          
          // If the existing document has an empty userType but we have userData with userType, update it
          let updateData = {
            emailVerified: true,
            updatedAt: new Date()
          };
          
          // If existing userType is empty/missing but we have it in OTP userData, preserve it
          if ((!existingData.userType || existingData.userType === '') && otpData.userData && otpData.userData.userType) {
            console.log('OTP verification - Existing userType is empty, updating from OTP data:', otpData.userData.userType);
            updateData.userType = otpData.userData.userType;
            updateData.companyName = otpData.userData.companyName || existingData.companyName || '';
            updateData.displayName = otpData.userData.displayName || existingData.displayName || '';
            updateData.firstName = otpData.userData.firstName || existingData.firstName || '';
            updateData.lastName = otpData.userData.lastName || existingData.lastName || '';
            updateData.phoneNumber = otpData.userData.phoneNumber || existingData.phoneNumber || '';
          }
          
          await adminDb.collection('users').doc(userId).update(updateData);
          console.log('OTP verification - Document updated with:', updateData);
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
            console.log('OTP verification - Using userData from OTP, userType:', otpData.userData.userType);
            
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
            console.log('OTP verification - Creating document with userType:', userDocData.userType);
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
