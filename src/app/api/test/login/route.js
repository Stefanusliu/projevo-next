// Test login endpoint to debug the vendor login flow
import { NextResponse } from 'next/server';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../../../../lib/firebase';

export async function POST(request) {
  try {
    const { email, password } = await request.json();
    
    console.log('Test Login: Attempting to sign in with:', email);
    
    // Sign in with Firebase Auth
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    console.log('Test Login: Firebase auth successful, user:', user.uid);
    console.log('Test Login: User email verified:', user.emailVerified);
    
    // Fetch user profile from Firestore
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    let userProfile = null;
    
    if (userDoc.exists()) {
      userProfile = userDoc.data();
      console.log('Test Login: User profile found:', userProfile);
      console.log('Test Login: User type:', userProfile.userType);
      console.log('Test Login: Profile complete:', userProfile.profileComplete);
    } else {
      console.log('Test Login: No user profile found in Firestore');
    }
    
    // Determine redirect based on user type
    let redirectUrl = '/dashboard';
    if (userProfile?.userType === 'project-owner') {
      redirectUrl = '/dashboard/project-owner';
    } else if (userProfile?.userType === 'vendor') {
      redirectUrl = '/dashboard/vendor';
    }
    
    console.log('Test Login: Should redirect to:', redirectUrl);
    
    return NextResponse.json({
      success: true,
      user: {
        uid: user.uid,
        email: user.email,
        emailVerified: user.emailVerified
      },
      userProfile,
      redirectUrl,
      message: 'Login successful'
    });
    
  } catch (error) {
    console.error('Test Login error:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      code: error.code
    }, { status: 400 });
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Test login endpoint. POST with email and password to test login flow.',
    testCredentials: {
      email: 'cobainhpsmg@gmail.com',
      password: 'asdasd'
    }
  });
}
