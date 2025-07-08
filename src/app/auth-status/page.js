'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../lib/firebase';

export default function AuthStatusPage() {
  const { user, userProfile, loading } = useAuth();
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [firebaseLoading, setFirebaseLoading] = useState(true);
  const [logs, setLogs] = useState([]);

  const addLog = (message) => {
    console.log('AuthStatus:', message);
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  // Direct Firebase Auth listener
  useEffect(() => {
    addLog('Setting up direct Firebase Auth listener...');
    
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      addLog(`Direct Firebase Auth change: ${user ? `User ${user.uid}` : 'No user'}`);
      setFirebaseUser(user);
      setFirebaseLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // AuthContext state changes
  useEffect(() => {
    addLog(`AuthContext change - loading: ${loading}, user: ${user?.uid || 'null'}, profile: ${userProfile?.userType || 'null'}`);
  }, [loading, user, userProfile]);

  const checkLocalStorage = () => {
    try {
      const keys = Object.keys(localStorage);
      const firebaseKeys = keys.filter(key => key.includes('firebase'));
      addLog(`LocalStorage Firebase keys: ${firebaseKeys.length > 0 ? firebaseKeys.join(', ') : 'None'}`);
      
      // Check specific Firebase auth keys
      const authKey = keys.find(key => key.includes('authUser'));
      if (authKey) {
        addLog(`Found auth key: ${authKey}`);
      } else {
        addLog('No Firebase auth key found in localStorage');
      }
    } catch (error) {
      addLog(`LocalStorage check error: ${error.message}`);
    }
  };

  const clearStorage = () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
      addLog('Cleared localStorage and sessionStorage');
    } catch (error) {
      addLog(`Storage clear error: ${error.message}`);
    }
  };

  const refreshAuth = () => {
    addLog('Refreshing auth state...');
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Authentication Status Debug</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* AuthContext State */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">AuthContext State</h2>
            <div className="space-y-2 text-sm">
              <div><strong>Loading:</strong> {loading ? 'Yes' : 'No'}</div>
              <div><strong>User:</strong> {user ? `${user.uid.substring(0, 8)}...` : 'None'}</div>
              <div><strong>Email:</strong> {user?.email || 'None'}</div>
              <div><strong>Email Verified:</strong> {user?.emailVerified ? 'Yes' : 'No'}</div>
              <div><strong>Profile:</strong> {userProfile ? 'Loaded' : 'None'}</div>
              <div><strong>User Type:</strong> {userProfile?.userType || 'Unknown'}</div>
            </div>
          </div>

          {/* Direct Firebase Auth */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Direct Firebase Auth</h2>
            <div className="space-y-2 text-sm">
              <div><strong>Loading:</strong> {firebaseLoading ? 'Yes' : 'No'}</div>
              <div><strong>User:</strong> {firebaseUser ? `${firebaseUser.uid.substring(0, 8)}...` : 'None'}</div>
              <div><strong>Email:</strong> {firebaseUser?.email || 'None'}</div>
              <div><strong>Email Verified:</strong> {firebaseUser?.emailVerified ? 'Yes' : 'No'}</div>
              <div><strong>Matches AuthContext:</strong> {
                (user?.uid === firebaseUser?.uid) ? 'Yes' : 'No'
              }</div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-xl font-semibold mb-4">Actions</h2>
          <div className="space-x-4">
            <button 
              onClick={checkLocalStorage}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Check Storage
            </button>
            <button 
              onClick={clearStorage}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            >
              Clear Storage
            </button>
            <button 
              onClick={refreshAuth}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            >
              Refresh Auth
            </button>
            <button 
              onClick={() => window.location.href = '/dashboard/vendor'}
              className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600"
            >
              Go to Vendor Dashboard
            </button>
          </div>
        </div>

        {/* Logs */}
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
          <button 
            onClick={() => setLogs([])}
            className="mt-4 bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
          >
            Clear Logs
          </button>
        </div>
      </div>
    </div>
  );
}
