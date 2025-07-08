// Final comprehensive test to check vendor access flow
import { NextResponse } from 'next/server';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../../../../lib/firebase';

export async function POST(request) {
  try {
    const { email, password } = await request.json();
    
    console.log('\n=== COMPREHENSIVE VENDOR ACCESS TEST ===');
    console.log('Testing email:', email);
    
    // Step 1: Test Firebase Auth login
    console.log('\n1. Testing Firebase Auth login...');
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    console.log('✅ Firebase Auth successful');
    console.log('   - User ID:', user.uid);
    console.log('   - Email:', user.email);
    console.log('   - Email verified (Auth):', user.emailVerified);
    
    // Step 2: Test Firestore profile fetch
    console.log('\n2. Testing Firestore profile fetch...');
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    
    if (!userDoc.exists()) {
      console.log('❌ No user profile found in Firestore');
      return NextResponse.json({
        success: false,
        error: 'No user profile found',
        step: 'firestore_fetch'
      });
    }
    
    const userProfile = userDoc.data();
    console.log('✅ Firestore profile found');
    console.log('   - User Type:', userProfile.userType);
    console.log('   - Email verified (Profile):', userProfile.emailVerified);
    console.log('   - Profile complete:', userProfile.profileComplete);
    
    // Step 3: Test ProtectedRoute logic simulation
    console.log('\n3. Simulating ProtectedRoute logic...');
    
    if (!userProfile.userType) {
      console.log('❌ UserType is empty or undefined');
      return NextResponse.json({
        success: false,
        error: 'UserType is empty',
        step: 'user_type_check',
        userProfile
      });
    }
    
    if (userProfile.userType !== 'vendor') {
      console.log('❌ UserType is not "vendor":', userProfile.userType);
      return NextResponse.json({
        success: false,
        error: `UserType is "${userProfile.userType}", not "vendor"`,
        step: 'user_type_validation',
        userProfile
      });
    }
    
    console.log('✅ UserType validation passed');
    
    // Step 4: Determine expected behavior
    console.log('\n4. Expected behavior analysis...');
    console.log('   - User should be able to access /dashboard/vendor');
    console.log('   - ProtectedRoute should NOT redirect to /login');
    console.log('   - ProtectedRoute should render vendor dashboard content');
    
    // Step 5: Consistency check
    console.log('\n5. Consistency check...');
    const authEmailVerified = user.emailVerified;
    const profileEmailVerified = userProfile.emailVerified;
    
    if (authEmailVerified !== profileEmailVerified) {
      console.log(`⚠️  Email verification mismatch: Auth=${authEmailVerified}, Profile=${profileEmailVerified}`);
    } else {
      console.log('✅ Email verification status is consistent');
    }
    
    console.log('\n=== TEST RESULT ===');
    console.log('🎉 All checks passed! Vendor should have access to protected routes.');
    
    return NextResponse.json({
      success: true,
      message: 'All vendor access checks passed',
      checks: {
        firebaseAuth: '✅ Passed',
        firestoreProfile: '✅ Passed',
        userTypeValidation: '✅ Passed',
        emailVerificationConsistency: authEmailVerified === profileEmailVerified ? '✅ Passed' : '⚠️ Warning'
      },
      user: {
        uid: user.uid,
        email: user.email,
        emailVerified: user.emailVerified
      },
      userProfile: {
        userType: userProfile.userType,
        emailVerified: userProfile.emailVerified,
        profileComplete: userProfile.profileComplete
      },
      expectedBehavior: {
        shouldAccessVendorDashboard: true,
        shouldNotRedirectToLogin: true,
        correctRedirectUrl: '/dashboard/vendor'
      }
    });
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    return NextResponse.json({
      success: false,
      error: error.message,
      code: error.code,
      step: 'firebase_auth'
    }, { status: 400 });
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Comprehensive vendor access test',
    usage: 'POST with email and password to run full test suite',
    testCredentials: {
      email: 'cobainhpsmg@gmail.com',
      password: 'asdasd'
    }
  });
}
