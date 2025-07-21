'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../contexts/AuthContext';
import ProtectedRoute from '../../components/auth/ProtectedRoute';
import { VerificationAlert } from '../../hooks/useVerificationStatus';

function DashboardContent() {
  const router = useRouter();
  const { user, userProfile, logout, setUserType } = useAuth();
  const [isRedirecting, setIsRedirecting] = useState(true);
  const [isUpdatingUserType, setIsUpdatingUserType] = useState(false);
  const [error, setError] = useState('');
  
  useEffect(() => {
    console.log('🔍 Dashboard useEffect - userProfile:', userProfile, 'user:', user);
    console.log('🔍 Dashboard - userProfile?.userType:', userProfile?.userType);
    
    if (userProfile?.userType) {
      console.log('✅ User has userType:', userProfile.userType);
      // Redirect to appropriate dashboard based on user type
      if (userProfile.userType === 'project-owner') {
        console.log('🚀 Redirecting to project-owner dashboard');
        router.push('/dashboard/project-owner');
      } else if (userProfile.userType === 'vendor') {
        console.log('🚀 Redirecting to vendor dashboard');
        router.push('/dashboard/vendor');
      } else {
        // Unknown user type, redirect to user type selection
        console.log('❓ Unknown user type, redirecting to user type selection');
        router.push('/select-user-type');
      }
    } else if (userProfile && !userProfile.userType) {
      // User exists but no userType set, redirect to selection
      console.log('⚠️ User profile exists but no userType, redirecting to user type selection');
      router.push('/select-user-type');
    } else if (user && userProfile === null) {
      // User is authenticated but profile is still loading or doesn't exist
      // Give it a moment, then redirect to selection if still no profile
      console.log('⏳ User authenticated but profile loading/missing, waiting...');
      const timer = setTimeout(() => {
        console.log('⏰ Timeout reached, redirecting to user type selection');
        router.push('/select-user-type');
      }, 3000); // Increased timeout to 3 seconds
      
      return () => clearTimeout(timer);
    } else if (!user) {
      // No user, should be redirected by ProtectedRoute
      console.log('❌ No user found');
    }
  }, [userProfile, user, router]);

  const handleUserTypeSelection = async (type) => {
    setIsUpdatingUserType(true);
    setError('');
    
    try {
      // Update user profile with selected type
      await setUserType(type);
      
      // Redirect to appropriate dashboard
      if (type === 'project-owner') {
        router.push('/dashboard/project-owner');
      } else if (type === 'vendor') {
        router.push('/dashboard/vendor');
      }
    } catch (error) {
      console.error('Error updating user type:', error);
      setError('Failed to update user type. Please try again.');
      setIsUpdatingUserType(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (isRedirecting) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: '#2373FF' }}></div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            Setting up your dashboard...
          </h2>
          <p className="text-gray-600">
            Redirecting you to the right place.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Header */}
      <header className="bg-white dark:bg-slate-800 shadow-sm border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Projevo
            </Link>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-slate-600 dark:text-slate-400">
                Welcome, {userProfile?.displayName || userProfile?.firstName || user?.email}
              </span>
              <button
                onClick={handleLogout}
                className="text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-8 max-w-md w-full mx-4">
          {/* Verification Alert */}
          <VerificationAlert />
          
          {/* Error Display */}
          {error && (
            <div className="mb-4 p-3 border border-red-300 rounded-lg bg-red-50 dark:bg-red-900/20 dark:border-red-600">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}
          
          <div className="text-center mb-6">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Choose Your Dashboard</h2>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              Select your role to access the appropriate dashboard
            </p>
          </div>
          
          <div className="space-y-4">
            <button
              onClick={() => handleUserTypeSelection('project-owner')}
              disabled={isUpdatingUserType}
              className="w-full flex items-center justify-center px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUpdatingUserType ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-slate-600 mr-2"></div>
                  Updating...
                </div>
              ) : (
                <>
                  <svg className="mr-3 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  Project Owner Dashboard
                </>
              )}
            </button>
            
            <button
              onClick={() => handleUserTypeSelection('vendor')}
              disabled={isUpdatingUserType}
              className="w-full flex items-center justify-center px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUpdatingUserType ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-slate-600 mr-2"></div>
                  Updating...
                </div>
              ) : (
                <>
                  <svg className="mr-3 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 00-2 2H10a2 2 0 00-2-2V6m8 0h2a2 2 0 012 2v6.5" />
                  </svg>
                  Vendor Dashboard
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  return <DashboardContent />;
}
