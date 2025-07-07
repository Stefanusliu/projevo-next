// app/auth-demo/page.js
'use client';

import { useAuth } from '../../contexts/AuthContext';
import { useState } from 'react';

export default function AuthDemoPage() {
  const { user, userProfile, logout, updateUserProfile, checkEmailVerification } = useAuth();
  const [testResult, setTestResult] = useState('');

  const handleTestEmailVerification = async () => {
    try {
      const isVerified = await checkEmailVerification();
      setTestResult(`Email verification status: ${isVerified ? 'Verified' : 'Not verified'}`);
    } catch (error) {
      setTestResult(`Error checking email verification: ${error.message}`);
    }
  };

  const handleUpdateProfile = async () => {
    try {
      await updateUserProfile({
        profileComplete: true,
        lastUpdated: new Date().toISOString()
      });
      setTestResult('Profile updated successfully');
    } catch (error) {
      setTestResult(`Error updating profile: ${error.message}`);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Authentication Demo</h1>
          <p className="mb-4">Please sign up or log in to test the authentication features.</p>
          <div className="space-x-4">
            <a
              href="/signup"
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Sign Up
            </a>
            <a
              href="/login"
              className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
            >
              Log In
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h1 className="text-3xl font-bold mb-4">Authentication Demo</h1>
          
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-xl font-semibold">Welcome, {user.displayName || user.email}!</h2>
              <p className="text-gray-600">UID: {user.uid}</p>
            </div>
            <button
              onClick={logout}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            >
              Logout
            </button>
          </div>

          {/* User Authentication Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold mb-2">Authentication Status</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Email:</span>
                  <span className="font-medium">{user.email}</span>
                </div>
                <div className="flex justify-between">
                  <span>Email Verified:</span>
                  <span className={`font-medium ${user.emailVerified ? 'text-green-600' : 'text-red-600'}`}>
                    {user.emailVerified ? 'Yes' : 'No'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Phone:</span>
                  <span className="font-medium">{user.phoneNumber || 'Not provided'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Display Name:</span>
                  <span className="font-medium">{user.displayName || 'Not set'}</span>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold mb-2">Profile Information</h3>
              {userProfile ? (
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>First Name:</span>
                    <span className="font-medium">{userProfile.firstName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Last Name:</span>
                    <span className="font-medium">{userProfile.lastName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>User Type:</span>
                    <span className="font-medium">{userProfile.userType || 'Not set'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Company:</span>
                    <span className="font-medium">{userProfile.companyName || 'Not provided'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Phone Verified:</span>
                    <span className={`font-medium ${userProfile.phoneVerified ? 'text-green-600' : 'text-red-600'}`}>
                      {userProfile.phoneVerified ? 'Yes' : 'No'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Profile Complete:</span>
                    <span className={`font-medium ${userProfile.profileComplete ? 'text-green-600' : 'text-orange-600'}`}>
                      {userProfile.profileComplete ? 'Yes' : 'No'}
                    </span>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500">Loading profile...</p>
              )}
            </div>
          </div>

          {/* Test Actions */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="font-semibold mb-4">Test Actions</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={handleTestEmailVerification}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Check Email Verification
              </button>
              <button
                onClick={handleUpdateProfile}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              >
                Update Profile
              </button>
              <a
                href="/signup"
                className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 text-center"
              >
                Test Signup Flow
              </a>
            </div>
          </div>

          {/* Test Result */}
          {testResult && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-800 mb-2">Test Result:</h4>
              <p className="text-blue-700">{testResult}</p>
            </div>
          )}

          {/* Feature Checklist */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold mb-4">Firebase Features Implemented</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium mb-2">Authentication:</h4>
                <ul className="space-y-1 text-sm">
                  <li className="flex items-center">
                    <span className="text-green-600 mr-2">✓</span>
                    Email/Password signup & signin
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-600 mr-2">✓</span>
                    Google OAuth integration
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-600 mr-2">✓</span>
                    Phone number verification
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-600 mr-2">✓</span>
                    Email verification
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">Data Management:</h4>
                <ul className="space-y-1 text-sm">
                  <li className="flex items-center">
                    <span className="text-green-600 mr-2">✓</span>
                    User data saved to Firestore
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-600 mr-2">✓</span>
                    Real-time profile updates
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-600 mr-2">✓</span>
                    User type differentiation
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-600 mr-2">✓</span>
                    Server-side validation
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
