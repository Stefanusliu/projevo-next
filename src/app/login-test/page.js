'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../lib/firebase';
import { useRouter } from 'next/navigation';

export default function LoginTestPage() {
  const { user, userProfile, loading } = useAuth();
  const router = useRouter();
  const [status, setStatus] = useState('Ready to test');
  const [logs, setLogs] = useState([]);

  const addLog = (message) => {
    console.log('LoginTest:', message);
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  useEffect(() => {
    addLog(`Auth state update - loading: ${loading}, user: ${user?.uid || 'null'}, userProfile.userType: ${userProfile?.userType || 'null'}`);
  }, [loading, user, userProfile]);

  const testVendorLogin = async () => {
    try {
      addLog('🔄 Starting vendor login...');
      setStatus('Logging in...');
      
      const userCredential = await signInWithEmailAndPassword(auth, 'cobainhpsmg@gmail.com', 'asdasd');
      addLog(`✅ Login successful: ${userCredential.user.uid}`);
      setStatus('Login successful - waiting for profile...');
      
      // Wait for AuthContext to load the profile
      let attempts = 0;
      const checkProfile = () => {
        attempts++;
        addLog(`Profile check attempt ${attempts}...`);
        
        // The useEffect above will trigger when userProfile changes
        if (userProfile && userProfile.userType) {
          addLog(`✅ Profile loaded: userType = ${userProfile.userType}`);
          setStatus('Profile loaded - testing vendor access...');
          
          setTimeout(() => {
            addLog('🚀 Navigating to vendor dashboard...');
            setStatus('Navigating to vendor dashboard...');
            router.push('/dashboard/vendor');
          }, 1000);
        } else if (attempts < 20) {
          // Keep checking for up to 10 seconds
          setTimeout(checkProfile, 500);
        } else {
          addLog('❌ Timeout: Profile not loaded after 10 seconds');
          setStatus('Failed: Profile not loaded');
        }
      };
      
      // Start checking after a brief delay
      setTimeout(checkProfile, 1000);
      
    } catch (error) {
      addLog(`❌ Login failed: ${error.message}`);
      setStatus(`Login failed: ${error.message}`);
    }
  };

  const clearLogs = () => {
    setLogs([]);
    setStatus('Ready to test');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">End-to-End Vendor Login Test</h1>
        
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-xl font-semibold mb-4">Current Status</h2>
          <p className="text-lg mb-4">
            <span className="font-semibold">Status:</span> {status}
          </p>
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <strong>Loading:</strong> {loading ? 'Yes' : 'No'}
            </div>
            <div>
              <strong>User:</strong> {user ? `${user.uid.substring(0, 8)}...` : 'None'}
            </div>
            <div>
              <strong>Email:</strong> {user?.email || 'None'}
            </div>
            <div>
              <strong>Email Verified:</strong> {user?.emailVerified ? 'Yes' : 'No'}
            </div>
            <div>
              <strong>Profile Loaded:</strong> {userProfile ? 'Yes' : 'No'}
            </div>
            <div>
              <strong>User Type:</strong> {userProfile?.userType || 'Unknown'}
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-xl font-semibold mb-4">Test Actions</h2>
          <div className="space-x-4">
            <button 
              onClick={testVendorLogin}
              className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600"
              disabled={status.includes('Logging') || status.includes('Navigating')}
            >
              Login as Vendor & Test Access
            </button>
            <button 
              onClick={() => router.push('/dashboard/vendor')}
              className="bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600"
            >
              Go to Vendor Dashboard
            </button>
            <button 
              onClick={clearLogs}
              className="bg-gray-500 text-white px-6 py-2 rounded hover:bg-gray-600"
            >
              Clear Logs
            </button>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Debug Logs</h2>
          <div className="bg-gray-100 p-4 rounded max-h-96 overflow-y-auto">
            {logs.length === 0 ? (
              <p className="text-gray-500">No logs yet. Click &quot;Login as Vendor&quot; to start the test.</p>
            ) : (
              logs.map((log, index) => (
                <div key={index} className="text-sm font-mono mb-1">
                  {log}
                </div>
              ))
            )}
          </div>
        </div>
        
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded">
          <h3 className="font-semibold text-blue-800 mb-2">Expected Flow:</h3>
          <ol className="text-sm text-blue-700 space-y-1">
            <li>1. Click &quot;Login as Vendor &amp; Test Access&quot;</li>
            <li>2. Firebase Auth should succeed</li>
            <li>3. AuthContext should load the user profile</li>
            <li>4. Profile should show userType: &quot;vendor&quot;</li>
            <li>5. Auto-navigate to /dashboard/vendor</li>
            <li>6. ProtectedRoute should allow access (not redirect to /login)</li>
            <li>7. You should see the vendor dashboard content</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
