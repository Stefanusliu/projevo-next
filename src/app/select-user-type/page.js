'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from '../../contexts/AuthContext';

export default function SelectUserTypePage() {
  const router = useRouter();
  const { user, userProfile, updateUserProfile, loading } = useAuth();
  const [selectedUserType, setSelectedUserType] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [hasWaitedForAuth, setHasWaitedForAuth] = useState(false);

  // Handle redirects in useEffect to avoid SSR issues
  useEffect(() => {
    console.log('SelectUserType - useEffect triggered');
    console.log('SelectUserType - loading:', loading);
    console.log('SelectUserType - user:', user?.uid || 'null');
    console.log('SelectUserType - userProfile:', userProfile);
    console.log('SelectUserType - userProfile?.userType:', userProfile?.userType);
    console.log('SelectUserType - hasWaitedForAuth:', hasWaitedForAuth);
    
    // Don't redirect while still loading auth state
    if (loading) {
      console.log('SelectUserType - Auth still loading, waiting...');
      return;
    }

    // Wait a bit for auth state to stabilize before making decisions
    if (!hasWaitedForAuth) {
      console.log('SelectUserType - Waiting for auth state to stabilize...');
      const timer = setTimeout(() => {
        setHasWaitedForAuth(true);
      }, 2000); // Wait 2 seconds for auth state to load
      return () => clearTimeout(timer);
    }
    
    // If user already has a userType, redirect to appropriate dashboard
    if (userProfile?.userType) {
      console.log('SelectUserType - User has userType, redirecting to dashboard');
      if (userProfile.userType === 'vendor') {
        router.push('/dashboard/vendor');
      } else if (userProfile.userType === 'project-owner') {
        router.push('/dashboard/project-owner');
      }
      return;
    }

    // Only redirect to login if we've waited and still no user
    if (!user && hasWaitedForAuth) {
      console.log('SelectUserType - No user found after waiting, redirecting to login');
      router.push('/login');
      return;
    }
    
    if (user) {
      console.log('SelectUserType - User exists but no userType, showing selection UI');
    }
  }, [user, userProfile, loading, router, hasWaitedForAuth]);

  const handleUserTypeSelection = async () => {
    if (!selectedUserType) {
      setError('Please select your account type');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Update user profile with selected user type
      await updateUserProfile({
        userType: selectedUserType,
        profileComplete: true
      });

      // Redirect to appropriate dashboard
      if (selectedUserType === 'vendor') {
        router.push('/dashboard/vendor');
      } else if (selectedUserType === 'project-owner') {
        router.push('/dashboard/project-owner');
      }
    } catch (error) {
      console.error('Error updating user type:', error);
      setError('Failed to update account type. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading only while auth is explicitly loading, not while waiting for auth to stabilize
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: '#2373FF' }}></div>
          <p className="text-gray-600">Loading authentication...</p>
        </div>
      </div>
    );
  }

  // If user has userType or we're redirecting, show loading
  if (userProfile?.userType) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: '#2373FF' }}></div>
          <p className="text-gray-600">Redirecting to dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
        <div className="text-center mb-8">
          <div className="mb-6">
            <Image 
              src="/logo.png" 
              alt="Projevo Logo" 
              width={120}
              height={40}
              className="h-10 w-auto mx-auto"
            />
          </div>
          <h1 className="text-2xl font-bold text-black mb-2">
            Welcome to Projevo!
          </h1>
          <p className="text-gray-600">
            Please select your account type to continue
          </p>
        </div>

        <div className="space-y-4 mb-6">
          {/* Project Owner Option */}
          <div 
            className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
              selectedUserType === 'project-owner' 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-200 hover:border-blue-300'
            }`}
            onClick={() => setSelectedUserType('project-owner')}
          >
            <div className="flex items-center">
              <input
                type="radio"
                name="userType"
                value="project-owner"
                checked={selectedUserType === 'project-owner'}
                onChange={(e) => setSelectedUserType(e.target.value)}
                className="mr-3 text-blue-500"
              />
              <div>
                <h3 className="font-semibold text-black">Project Owner</h3>
                <p className="text-sm text-gray-600">
                  I need to hire contractors and manage construction projects
                </p>
              </div>
            </div>
          </div>

          {/* Vendor Option */}
          <div 
            className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
              selectedUserType === 'vendor' 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-200 hover:border-blue-300'
            }`}
            onClick={() => setSelectedUserType('vendor')}
          >
            <div className="flex items-center">
              <input
                type="radio"
                name="userType"
                value="vendor"
                checked={selectedUserType === 'vendor'}
                onChange={(e) => setSelectedUserType(e.target.value)}
                className="mr-3 text-blue-500"
              />
              <div>
                <h3 className="font-semibold text-black">Vendor/Contractor</h3>
                <p className="text-sm text-gray-600">
                  I provide construction services and want to find projects
                </p>
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <button
          onClick={handleUserTypeSelection}
          disabled={isLoading || !selectedUserType}
          className={`w-full py-3 px-4 rounded-md font-medium transition-colors ${
            isLoading || !selectedUserType
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'text-white hover:bg-blue-700'
          }`}
          style={{ backgroundColor: isLoading || !selectedUserType ? undefined : '#2373FF' }}
        >
          {isLoading ? 'Setting up your account...' : 'Continue'}
        </button>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            You can change this later in your profile settings
          </p>
        </div>
      </div>
    </div>
  );
}
