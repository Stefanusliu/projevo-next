// components/firebase/FirebaseDemo.js
'use client';

import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useCollection, firestoreService } from '../../hooks/useFirestore';
import { useStorage } from '../../hooks/useStorage';

export default function FirebaseDemo() {
  const { user, signIn, signUp, signInWithGoogle, logout } = useAuth();
  const { documents: projects, loading, error } = useCollection('projects');
  const { uploadFile, uploading, uploadProgress } = useStorage();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [projectName, setProjectName] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);

  const handleEmailSignIn = async (e) => {
    e.preventDefault();
    try {
      await signIn(email, password);
    } catch (error) {
      console.error('Sign in error:', error);
    }
  };

  const handleEmailSignUp = async (e) => {
    e.preventDefault();
    try {
      await signUp(email, password);
    } catch (error) {
      console.error('Sign up error:', error);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error('Google sign in error:', error);
    }
  };

  const handleAddProject = async (e) => {
    e.preventDefault();
    if (!projectName.trim()) return;
    
    try {
      await firestoreService.add('projects', {
        name: projectName,
        owner: user.uid,
        status: 'active',
        description: 'Demo project from Firebase integration'
      });
      setProjectName('');
    } catch (error) {
      console.error('Error adding project:', error);
    }
  };

  const handleFileUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) return;

    try {
      const downloadURL = await uploadFile(
        selectedFile,
        `project-files/${Date.now()}_${selectedFile.name}`,
        { trackProgress: true }
      );
      console.log('File uploaded successfully:', downloadURL);
      setSelectedFile(null);
    } catch (error) {
      console.error('Upload error:', error);
    }
  };

  if (!user) {
    return (
      <div className="p-6 max-w-md mx-auto bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-4">Firebase Authentication Demo</h2>
        
        <form onSubmit={handleEmailSignIn} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            />
          </div>
          
          <div className="flex space-x-2">
            <button
              type="submit"
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={handleEmailSignUp}
              className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700"
            >
              Sign Up
            </button>
          </div>
        </form>
        
        <div className="mt-4">
          <button
            onClick={handleGoogleSignIn}
            className="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700"
          >
            Sign In with Google
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto bg-white rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Firebase Integration Demo</h2>
        <button
          onClick={logout}
          className="bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700"
        >
          Logout
        </button>
      </div>
      
      <div className="mb-4 p-4 bg-gray-100 rounded-md">
        <h3 className="font-semibold">User Info:</h3>
        <p>Email: {user.email}</p>
        <p>UID: {user.uid}</p>
      </div>

      {/* Firestore Demo */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Firestore Demo - Projects</h3>
        
        <form onSubmit={handleAddProject} className="flex gap-2 mb-4">
          <input
            type="text"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            placeholder="Enter project name"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
          />
          <button
            type="submit"
            className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
          >
            Add Project
          </button>
        </form>

        {loading && <p>Loading projects...</p>}
        {error && <p className="text-red-600">Error: {error}</p>}
        
        <div className="space-y-2">
          {projects.map((project) => (
            <div key={project.id} className="p-3 bg-gray-50 rounded-md">
              <h4 className="font-medium">{project.name}</h4>
              <p className="text-sm text-gray-600">Status: {project.status}</p>
              <p className="text-sm text-gray-600">Created: {project.createdAt?.toDate?.()?.toLocaleDateString()}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Storage Demo */}
      <div>
        <h3 className="text-lg font-semibold mb-2">Firebase Storage Demo</h3>
        
        <form onSubmit={handleFileUpload} className="space-y-4">
          <div>
            <input
              type="file"
              onChange={(e) => setSelectedFile(e.target.files[0])}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>
          
          <button
            type="submit"
            disabled={!selectedFile || uploading}
            className="bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:opacity-50"
          >
            {uploading ? 'Uploading...' : 'Upload File'}
          </button>
          
          {uploading && (
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div 
                className="bg-blue-600 h-2.5 rounded-full transition-all duration-300" 
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
