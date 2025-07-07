// app/api/auth/update-verification/route.js
import { NextResponse } from 'next/server';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../../../../lib/firebase';

export async function POST(request) {
  try {
    const { userId, emailVerified, phoneVerified } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Prepare update data
    const updateData = {};
    if (typeof emailVerified === 'boolean') {
      updateData.emailVerified = emailVerified;
    }
    if (typeof phoneVerified === 'boolean') {
      updateData.phoneVerified = phoneVerified;
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: 'No verification status to update' }, { status: 400 });
    }

    // Update user document
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      ...updateData,
      updatedAt: new Date()
    });

    // Get updated user data
    const updatedDoc = await getDoc(userRef);
    const userData = updatedDoc.exists() ? updatedDoc.data() : null;

    return NextResponse.json({
      success: true,
      message: 'Verification status updated successfully',
      userData
    });

  } catch (error) {
    console.error('Error updating verification status:', error);
    return NextResponse.json(
      { error: 'Failed to update verification status' },
      { status: 500 }
    );
  }
}
