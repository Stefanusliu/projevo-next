// Test that simulates the full login flow and dashboard access
import { NextResponse } from 'next/server';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth } from '../../../../lib/firebase';

export async function POST(request) {
  try {
    const { email, password, testFlow } = await request.json();
    
    console.log('\n🧪 === FULL LOGIN FLOW TEST ===');
    console.log('Test flow:', testFlow);
    console.log('Email:', email);
    
    // Step 1: Ensure we start fresh
    if (testFlow === 'full') {
      console.log('\n1. Signing out any existing user...');
      try {
        await signOut(auth);
        console.log('✅ Signed out successfully');
      } catch (e) {
        console.log('ℹ️ No user to sign out');
      }
      
      // Wait a moment for auth state to clear
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    // Step 2: Perform login
    console.log('\n2. Attempting login...');
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    console.log('✅ Login successful');
    console.log('   - User ID:', user.uid);
    console.log('   - Email:', user.email);
    console.log('   - Email verified:', user.emailVerified);
    
    // Step 3: Wait for auth state to propagate
    console.log('\n3. Waiting for auth state to propagate...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Step 4: Get current auth state
    const currentUser = auth.currentUser;
    console.log('\n4. Current auth state:');
    console.log('   - Current user:', currentUser?.uid);
    console.log('   - Auth ready:', !!currentUser);
    
    return NextResponse.json({
      success: true,
      message: 'Login flow test completed',
      user: {
        uid: user.uid,
        email: user.email,
        emailVerified: user.emailVerified
      },
      authState: {
        currentUser: currentUser?.uid || null,
        ready: !!currentUser
      },
      nextSteps: [
        'Now navigate to /dashboard in the browser',
        'Check browser console for AuthContext and Dashboard logs',
        'Should see redirect from /dashboard to /dashboard/vendor',
        'Finally access /dashboard/vendor directly'
      ]
    });
    
  } catch (error) {
    console.error('\n❌ Login flow test failed:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      code: error.code
    }, { status: 400 });
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Full login flow test',
    usage: 'POST with email, password, and testFlow: "full"',
    testCredentials: {
      email: 'cobainhpsmg@gmail.com',
      password: 'asdasd',
      testFlow: 'full'
    }
  });
}
