'use client';

import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

export default function TestAuth() {
  const { user, userProfile, signIn, signUp, loading } = useAuth();
  const [email, setEmail] = useState('test@projevo.com');
  const [password, setPassword] = useState('testpass123');
  const [message, setMessage] = useState('');

  const handleSignUp = async () => {
    setMessage('Creating test user...');
    try {
      const userData = {
        email,
        password,
        firstName: 'Test',
        lastName: 'User',
        phoneNumber: '+1234567890',
        userType: 'project-owner',
        companyName: 'Test Company'
      };
      
      await signUp(userData);
      setMessage('User created successfully! Check console for details.');
    } catch (error) {
      setMessage(`Signup error: ${error.message}`);
      console.error('Signup error:', error);
    }
  };

  const handleSignIn = async () => {
    setMessage('Signing in...');
    try {
      await signIn(email, password);
      setMessage('Signed in successfully! Check console for details.');
    } catch (error) {
      setMessage(`Login error: ${error.message}`);
      console.error('Login error:', error);
    }
  };

  if (loading) {
    return <div className="p-4">Loading auth...</div>;
  }

  return (
    <div className="p-8 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-6">Test Authentication</h1>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 border rounded"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 border rounded"
          />
        </div>
        
        <div className="space-x-2">
          <button
            onClick={handleSignUp}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Sign Up
          </button>
          <button
            onClick={handleSignIn}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Sign In
          </button>
        </div>
        
        {message && (
          <div className="p-3 bg-gray-100 rounded">
            {message}
          </div>
        )}
        
        <div className="mt-6">
          <h2 className="text-lg font-semibold mb-2">Current Auth State:</h2>
          <div className="space-y-2 text-sm">
            <div>User: {user ? `${user.email} (${user.uid})` : 'Not logged in'}</div>
            <div>Email Verified: {user?.emailVerified ? 'Yes' : 'No'}</div>
            <div>Phone: {user?.phoneNumber || 'None'}</div>
            <div>Profile: {userProfile ? JSON.stringify(userProfile, null, 2) : 'No profile'}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
