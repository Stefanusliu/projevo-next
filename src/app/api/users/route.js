// app/api/users/route.js
import { NextResponse } from 'next/server';
import { adminDb, adminAuth } from '../../../lib/firebase-admin';

export async function GET(request) {
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

    // Get user profile from Firestore
    const userDoc = await adminDb.collection('users').doc(decodedToken.uid).get();
    
    if (!userDoc.exists) {
      return NextResponse.json(
        { error: 'User profile not found' },
        { status: 404 }
      );
    }

    const userData = userDoc.data();
    
    // Remove sensitive information
    const { createdAt, updatedAt, ...safeUserData } = userData;
    
    return NextResponse.json({
      user: {
        ...safeUserData,
        createdAt: createdAt?.toDate?.()?.toISOString(),
        updatedAt: updatedAt?.toDate?.()?.toISOString()
      }
    });

  } catch (error) {
    console.error('Error fetching user profile:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user profile' },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
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

    const updateData = await request.json();
    
    // Remove fields that shouldn't be updated directly
    const { uid, email, createdAt, ...allowedUpdates } = updateData;

    // Update user profile in Firestore
    await adminDb.collection('users').doc(decodedToken.uid).update({
      ...allowedUpdates,
      updatedAt: new Date()
    });

    // Get updated user data
    const updatedDoc = await adminDb.collection('users').doc(decodedToken.uid).get();
    const userData = updatedDoc.data();

    return NextResponse.json({
      success: true,
      user: {
        ...userData,
        createdAt: userData.createdAt?.toDate?.()?.toISOString(),
        updatedAt: userData.updatedAt?.toDate?.()?.toISOString()
      }
    });

  } catch (error) {
    console.error('Error updating user profile:', error);
    return NextResponse.json(
      { error: 'Failed to update user profile' },
      { status: 500 }
    );
  }
}
