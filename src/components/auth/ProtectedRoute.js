// components/auth/ProtectedRoute.js
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';

export default function ProtectedRoute({ children, requiredUserType = null, allowedUserTypes = null }) {
  const { user, userProfile, loading } = useAuth();
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [hasWaitedForAuth, setHasWaitedForAuth] = useState(false);

  useEffect(() => {
    console.log('🔍 ProtectedRoute - loading:', loading, 'user:', user?.uid, 'userProfile:', userProfile, 'hasWaitedForAuth:', hasWaitedForAuth);
    console.log('🔍 ProtectedRoute - requiredUserType:', requiredUserType, 'allowedUserTypes:', allowedUserTypes);
    console.log('🔍 ProtectedRoute - userProfile.userType:', userProfile?.userType);
    
    // Wait for auth to load
    if (loading) {
      console.log('⏳ ProtectedRoute - still loading auth...');
      return;
    }

    // If we haven't waited for auth yet, wait a bit longer to ensure Firebase auth state is fully loaded
    if (!hasWaitedForAuth) {
      console.log('⏳ ProtectedRoute - waiting for auth state to stabilize...');
      const timer = setTimeout(() => {
        setHasWaitedForAuth(true);
      }, 1000); // Wait 1 second for auth state to stabilize
      return () => clearTimeout(timer);
    }

    // If no user after waiting, redirect to login
    if (!user) {
      console.log('❌ ProtectedRoute - no user after waiting, redirecting to login');
      router.push('/login');
      return;
    }

    // If user exists but no profile yet, wait longer before giving up
    if (!userProfile) {
      console.log('⏳ ProtectedRoute - user exists but no profile, waiting...');
      const timer = setTimeout(() => {
        if (!userProfile) {
          console.log('⚠️ ProtectedRoute - timeout reached, still no profile');
          // Instead of redirecting to login, allow access to dashboard
          // The dashboard will handle user type selection
          setIsAuthorized(true);
        }
      }, 5000); // Increased timeout to 5 seconds
      return () => clearTimeout(timer);
    }

    // Check if user type is allowed
    if (requiredUserType && userProfile.userType !== requiredUserType) {
      console.log(`❌ ProtectedRoute - user type mismatch: required "${requiredUserType}", got "${userProfile.userType}", redirecting...`);
      // Redirect to correct dashboard based on user type
      if (userProfile.userType === 'project-owner') {
        router.push('/dashboard/project-owner');
      } else if (userProfile.userType === 'vendor') {
        router.push('/dashboard/vendor');
      } else {
        router.push('/dashboard');
      }
      return;
    }

    if (allowedUserTypes && !allowedUserTypes.includes(userProfile.userType)) {
      console.log(`❌ ProtectedRoute - user type "${userProfile.userType}" not in allowed list ${allowedUserTypes}, redirecting...`);
      // Redirect to correct dashboard based on user type
      if (userProfile.userType === 'project-owner') {
        router.push('/dashboard/project-owner');
      } else if (userProfile.userType === 'vendor') {
        router.push('/dashboard/vendor');
      } else {
        router.push('/dashboard');
      }
      return;
    }

    // User is authorized
    console.log('✅ ProtectedRoute - user authorized');
    setIsAuthorized(true);
  }, [user, userProfile, loading, router, requiredUserType, allowedUserTypes, hasWaitedForAuth]);

  // Show loading while checking authentication
  if (loading || !isAuthorized) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: '#2373FF' }}></div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            {loading ? 'Loading...' : 'Checking authorization...'}
          </h2>
          <p className="text-gray-600">
            Please wait while we verify your access.
          </p>
        </div>
      </div>
    );
  }

  // Render children if authorized
  return children;
}

// Higher-order component for easier usage
export function withAuth(Component, options = {}) {
  return function AuthenticatedComponent(props) {
    return (
      <ProtectedRoute {...options}>
        <Component {...props} />
      </ProtectedRoute>
    );
  };
}
