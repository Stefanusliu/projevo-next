// app/api/user/update-profile/route.js
import { NextResponse } from 'next/server';
import { adminDb } from '../../../../lib/firebase-admin';

export async function POST(request) {
  try {
    const body = await request.json();
    const { userId, ...profileData } = body;
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Update user document in Firestore
    const userRef = adminDb.collection('users').doc(userId);
    
    // Add timestamp for update
    const updateData = {
      ...profileData,
      updatedAt: new Date(),
    };

    // Check if document exists first
    const userDoc = await userRef.get();
    
    if (!userDoc.exists) {
      // If document doesn't exist, create it with basic data
      const defaultData = {
        uid: userId,
        email: profileData.email || '',
        firstName: profileData.firstName || '',
        lastName: profileData.lastName || '',
        displayName: profileData.displayName || '',
        phoneNumber: profileData.phoneNumber || '',
        userType: profileData.userType || '',
        companyName: profileData.companyName || '',
        emailVerified: profileData.emailVerified || false,
        phoneVerified: profileData.phoneVerified || false,
        profileComplete: profileData.profileComplete || false,
        createdAt: new Date(),
        updatedAt: new Date(),
        status: 'active'
      };
      
      await userRef.set(defaultData);
      
      return NextResponse.json({
        success: true,
        user: defaultData,
        created: true
      });
    } else {
      // Update existing document
      await userRef.update(updateData);
      
      // Get updated document
      const updatedDoc = await userRef.get();
      const userData = updatedDoc.data();
      
      return NextResponse.json({
        success: true,
        user: userData,
        updated: true
      });
    }

  } catch (error) {
    console.error('Error updating user profile:', error);
    return NextResponse.json(
      { error: 'Failed to update user profile' },
      { status: 500 }
    );
  }
}
