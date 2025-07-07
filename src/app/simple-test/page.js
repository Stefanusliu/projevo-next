'use client';

import { useEffect, useState } from 'react';
import { auth } from '../../lib/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';

export default function SimpleTest() {
  const [message, setMessage] = useState('Testing Firebase...');

  useEffect(() => {
    console.log('SimpleTest: Component mounted');
    console.log('Auth object:', auth);
    console.log('Auth config:', auth.config);
    
    // Test if Firebase is properly initialized
    if (auth && auth.app) {
      setMessage('Firebase auth is initialized');
      console.log('Firebase auth domain:', auth.app.options.authDomain);
      console.log('Firebase project ID:', auth.app.options.projectId);
    } else {
      setMessage('Firebase auth not initialized properly');
      console.error('Firebase auth not initialized');
    }
  }, []);

  const testLogin = async () => {
    setMessage('Attempting to sign in...');
    console.log('Starting sign in test...');
    
    try {
      const email = 'test@example.com';
      const password = 'password123';
      
      console.log('Calling signInWithEmailAndPassword...');
      const result = await signInWithEmailAndPassword(auth, email, password);
      console.log('Sign in result:', result);
      setMessage('Sign in successful');
    } catch (error) {
      console.error('Sign in error:', error);
      setMessage(`Sign in error: ${error.code} - ${error.message}`);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Simple Firebase Test</h1>
      <p className="mb-4">{message}</p>
      <button 
        onClick={testLogin}
        className="px-4 py-2 bg-blue-500 text-white rounded"
      >
        Test Login
      </button>
    </div>
  );
}
