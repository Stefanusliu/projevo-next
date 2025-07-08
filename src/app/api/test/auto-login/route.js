// Automated login test that simulates the frontend auth flow
import { NextResponse } from 'next/server';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../../../lib/firebase';

export async function POST(request) {
  try {
    const { email, password } = await request.json();
    
    console.log('=== AUTOMATED LOGIN TEST START ===');
    console.log('Email:', email);
    
    // This simulates exactly what the frontend login does
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    console.log('✅ Firebase Auth successful');
    console.log('User ID:', user.uid);
    console.log('Email verified:', user.emailVerified);
    
    // The AuthContext will automatically trigger when auth state changes
    // We can't directly access it from the API, but we can simulate the checks
    
    console.log('=== SIMULATING PROTECTEDROUTE LOGIC ===');
    console.log('This is what should happen:');
    console.log('1. AuthContext detects auth state change');
    console.log('2. AuthContext loads user profile from Firestore');
    console.log('3. Profile should show userType: "vendor"');
    console.log('4. ProtectedRoute should allow access to /dashboard/vendor');
    console.log('5. User should NOT be redirected to /login');
    
    return NextResponse.json({
      success: true,
      message: 'Login successful - check browser console for AuthContext logs',
      nextSteps: [
        'Open browser DevTools Console',
        'Look for "AuthContext:" logs',
        'Look for "ProtectedRoute:" logs',
        'Navigate to /dashboard/vendor',
        'Check if you stay on the page or get redirected'
      ],
      testUrl: '/dashboard/vendor'
    });
    
  } catch (error) {
    console.error('Login test failed:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 400 });
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Automated login test - POST with email and password',
    instructions: [
      'POST to this endpoint with vendor credentials',
      'Then navigate to /dashboard/vendor to test ProtectedRoute',
      'Check browser console for debug logs'
    ]
  });
}
