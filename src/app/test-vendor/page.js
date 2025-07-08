'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../lib/firebase';

export default function VendorTestPage() {
  const { user, userProfile, loading } = useAuth();
  const [loginStatus, setLoginStatus] = useState('Not logged in');
  const [logs, setLogs] = useState([]);

  const addLog = (message) => {
    console.log('VendorTest:', message);
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  useEffect(() => {
    addLog(`Auth state - loading: ${loading}, user: ${user?.uid || 'null'}, userProfile: ${userProfile?.userType || 'null'}`);
  }, [loading, user, userProfile]);

  const testLogin = async () => {
    try {
      addLog('Starting vendor login test...');
      setLoginStatus('Logging in...');
      
      const userCredential = await signInWithEmailAndPassword(auth, 'cobainhpsmg@gmail.com', 'asdasd');
      addLog(`Login successful: ${userCredential.user.uid}`);
      setLoginStatus('Login successful');
      
    } catch (error) {
      addLog(`Login failed: ${error.message}`);
      setLoginStatus(`Login failed: ${error.message}`);
    }
  };

  const testVendorAccess = () => {
    if (!user) {
      addLog('No user - cannot test vendor access');
      return;
    }
    
    if (!userProfile) {
      addLog('No user profile - waiting for profile to load');
      return;
    }
    
    addLog(`Testing vendor access - userType: ${userProfile.userType}`);
    
    if (userProfile.userType === 'vendor') {
      addLog('✅ User is vendor - should have access to vendor dashboard');
      // Try to navigate to vendor dashboard
      window.location.href = '/dashboard/vendor';
    } else {
      addLog(`❌ User is not vendor (userType: ${userProfile.userType}) - should redirect`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Vendor Login Test</h1>
        
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-xl font-semibold mb-4">Current Auth State</h2>
          <div className="space-y-2">
            <p><strong>Loading:</strong> {loading ? 'Yes' : 'No'}</p>
            <p><strong>User:</strong> {user ? `${user.uid} (${user.email})` : 'None'}</p>
            <p><strong>Email Verified (Auth):</strong> {user?.emailVerified ? 'Yes' : 'No'}</p>
            <p><strong>User Profile:</strong> {userProfile ? 'Loaded' : 'None'}</p>
            <p><strong>User Type:</strong> {userProfile?.userType || 'Unknown'}</p>
            <p><strong>Email Verified (Profile):</strong> {userProfile?.emailVerified ? 'Yes' : 'No'}</p>
            <p><strong>Profile Complete:</strong> {userProfile?.profileComplete ? 'Yes' : 'No'}</p>
            <p><strong>Login Status:</strong> {loginStatus}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-xl font-semibold mb-4">Actions</h2>
          <div className="space-x-4">
            <button 
              onClick={testLogin}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Login as Vendor (cobainhpsmg@gmail.com)
            </button>
            <button 
              onClick={testVendorAccess}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
              disabled={!user || !userProfile}
            >
              Test Vendor Dashboard Access
            </button>
            <button 
              onClick={() => window.location.href = '/dashboard/vendor'}
              className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600"
            >
              Go to Vendor Dashboard
            </button>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Debug Logs</h2>
          <div className="bg-gray-100 p-4 rounded max-h-96 overflow-y-auto">
            {logs.length === 0 ? (
              <p className="text-gray-500">No logs yet...</p>
            ) : (
              logs.map((log, index) => (
                <div key={index} className="text-sm font-mono mb-1">
                  {log}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
