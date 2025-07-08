// API to fix email verification for the vendor user
import { NextResponse } from 'next/server';
import { adminAuth, adminDb } from '../../../../lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

export async function POST(request) {
  try {
    const { email } = await request.json();
    
    console.log('Fix Email Verification: Processing for email:', email);
    
    // Get user by email
    const userRecord = await adminAuth.getUserByEmail(email);
    console.log('Fix Email Verification: Found user:', userRecord.uid);
    console.log('Fix Email Verification: Current emailVerified:', userRecord.emailVerified);
    
    if (!userRecord.emailVerified) {
      // Update email verification status
      await adminAuth.updateUser(userRecord.uid, {
        emailVerified: true
      });
      console.log('Fix Email Verification: Updated emailVerified to true');
    }
    
    // Also update in Firestore to ensure consistency
    await adminDb.collection('users').doc(userRecord.uid).update({
      emailVerified: true,
      updatedAt: FieldValue.serverTimestamp()
    });
    console.log('Fix Email Verification: Updated Firestore profile');
    
    // Get updated user record
    const updatedUser = await adminAuth.getUser(userRecord.uid);
    
    return NextResponse.json({
      success: true,
      user: {
        uid: updatedUser.uid,
        email: updatedUser.email,
        emailVerified: updatedUser.emailVerified
      },
      message: 'Email verification status updated'
    });
    
  } catch (error) {
    console.error('Fix Email Verification error:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'POST with email to fix email verification status'
  });
}
