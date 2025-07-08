'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { doc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { updateProfile } from 'firebase/auth';
import { db, storage, auth } from '../../lib/firebase';
import Image from 'next/image';

export default function ProfilePage() {
  const { user, userProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [userProjects, setUserProjects] = useState([]);
  const [projectsLoading, setProjectsLoading] = useState(true);

  // Profile form data
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    displayName: '',
    email: '',
    phoneNumber: '',
    companyName: '',
    userType: '',
    photoURL: '',
    bio: '',
    specialization: '',
    experience: '',
    location: '',
    website: ''
  });

  // Load profile data when userProfile changes
  useEffect(() => {
    if (userProfile) {
      setProfileData({
        firstName: userProfile.firstName || '',
        lastName: userProfile.lastName || '',
        displayName: userProfile.displayName || '',
        email: userProfile.email || '',
        phoneNumber: userProfile.phoneNumber || '',
        companyName: userProfile.companyName || '',
        userType: userProfile.userType || '',
        photoURL: userProfile.photoURL || user?.photoURL || '',
        bio: userProfile.bio || '',
        specialization: userProfile.specialization || '',
        experience: userProfile.experience || '',
        location: userProfile.location || '',
        website: userProfile.website || ''
      });
    }
  }, [userProfile, user]);

  // Load user projects
  useEffect(() => {
    const loadUserProjects = async () => {
      if (!user?.uid) return;

      setProjectsLoading(true);
      try {
        const projectsQuery = query(
          collection(db, 'projects'),
          where('ownerId', '==', user.uid)
        );
        
        const snapshot = await getDocs(projectsQuery);
        const projects = [];
        snapshot.forEach((doc) => {
          projects.push({ id: doc.id, ...doc.data() });
        });
        
        setUserProjects(projects);
      } catch (error) {
        console.error('Error loading user projects:', error);
      }
      setProjectsLoading(false);
    };

    loadUserProjects();
  }, [user]);

  const handleInputChange = (field, value) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
  };

  const handleProfileImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !user?.uid) return;

    // Validate file
    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      setMessage('Image size must be less than 5MB');
      return;
    }

    if (!file.type.startsWith('image/')) {
      setMessage('Please select a valid image file');
      return;
    }

    setUploading(true);
    setMessage('');

    try {
      // Delete old profile image if exists
      if (profileData.photoURL && profileData.photoURL.includes('firebase')) {
        try {
          const oldImageRef = ref(storage, profileData.photoURL);
          await deleteObject(oldImageRef);
        } catch (error) {
          console.log('Old image not found or already deleted');
        }
      }

      // Upload new image
      const imageRef = ref(storage, `profile-images/${user.uid}/${Date.now()}_${file.name}`);
      const snapshot = await uploadBytes(imageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);

      // Update profile data
      const updatedData = { ...profileData, photoURL: downloadURL };
      setProfileData(updatedData);

      // Update Firebase Auth profile
      await updateProfile(auth.currentUser, {
        photoURL: downloadURL
      });

      // Update Firestore
      await updateDoc(doc(db, 'users', user.uid), {
        photoURL: downloadURL,
        updatedAt: new Date()
      });

      setMessage('Profile picture updated successfully!');
    } catch (error) {
      console.error('Error uploading profile image:', error);
      setMessage('Failed to upload profile picture. Please try again.');
    }

    setUploading(false);
  };

  const handleSaveProfile = async () => {
    if (!user?.uid) return;

    setLoading(true);
    setMessage('');

    try {
      const updateData = {
        ...profileData,
        updatedAt: new Date()
      };

      // Update Firestore
      await updateDoc(doc(db, 'users', user.uid), updateData);

      // Update Firebase Auth profile if displayName changed
      if (profileData.displayName !== user.displayName) {
        await updateProfile(auth.currentUser, {
          displayName: profileData.displayName
        });
      }

      setMessage('Profile updated successfully!');
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage('Failed to update profile. Please try again.');
    }

    setLoading(false);
  };

  const tabs = [
    { id: 'profile', label: 'Profile Information' },
    { id: 'projects', label: 'My Projects' },
    { id: 'settings', label: 'Account Settings' }
  ];
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">Please log in to view your profile</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Profile</h1>
            <p className="text-slate-600 dark:text-slate-400 mt-2">
              Manage your profile information and account settings
            </p>
          </div>

          {/* Message */}
          {message && (
            <div className={`mb-6 p-4 rounded-lg ${
              message.includes('successfully') 
                ? 'bg-green-50 border border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-200'
                : 'bg-red-50 border border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-200'
            }`}>
              {message}
            </div>
          )}

          {/* Tabs */}
          <div className="border-b border-slate-200 dark:border-slate-700 mb-8">
            <nav className="-mb-px flex space-x-8">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300 dark:text-slate-400 dark:hover:text-slate-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Profile Information Tab */}
          {activeTab === 'profile' && (
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-6">
              {/* Profile Picture Section */}
              <div className="mb-8">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Profile Picture</h2>
                <div className="flex items-center space-x-6">
                  <div className="relative">
                    <div className="w-24 h-24 rounded-full overflow-hidden bg-slate-200 dark:bg-slate-700">
                      {profileData.photoURL ? (
                        <Image
                          src={profileData.photoURL}
                          alt="Profile"
                          width={96}
                          height={96}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-400 dark:text-slate-500">
                          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                      )}
                    </div>
                    {uploading && (
                      <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block">
                      <span className="sr-only">Choose profile photo</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleProfileImageUpload}
                        disabled={uploading}
                        className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-blue-900/20 dark:file:text-blue-400"
                      />
                    </label>
                    <p className="text-xs text-slate-500 mt-1">PNG, JPG up to 5MB</p>
                  </div>
                </div>
              </div>

              {/* Profile Form */}
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Personal Information</h2>
                  <button
                    onClick={() => isEditing ? handleSaveProfile() : setIsEditing(true)}
                    disabled={loading}
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                  >
                    {loading ? 'Saving...' : isEditing ? 'Save Changes' : 'Edit Profile'}
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* First Name */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      First Name
                    </label>
                    <input
                      type="text"
                      value={profileData.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      disabled={!isEditing}
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-slate-50 disabled:text-slate-500 dark:bg-slate-700 dark:text-white dark:disabled:bg-slate-800"
                    />
                  </div>

                  {/* Last Name */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Last Name
                    </label>
                    <input
                      type="text"
                      value={profileData.lastName}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                      disabled={!isEditing}
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-slate-50 disabled:text-slate-500 dark:bg-slate-700 dark:text-white dark:disabled:bg-slate-800"
                    />
                  </div>

                  {/* Display Name */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Display Name
                    </label>
                    <input
                      type="text"
                      value={profileData.displayName}
                      onChange={(e) => handleInputChange('displayName', e.target.value)}
                      disabled={!isEditing}
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-slate-50 disabled:text-slate-500 dark:bg-slate-700 dark:text-white dark:disabled:bg-slate-800"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={profileData.email}
                      disabled={true}
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
                    />
                    <p className="text-xs text-slate-500 mt-1">Email cannot be changed</p>
                  </div>

                  {/* Phone Number */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={profileData.phoneNumber}
                      onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                      disabled={!isEditing}
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-slate-50 disabled:text-slate-500 dark:bg-slate-700 dark:text-white dark:disabled:bg-slate-800"
                    />
                  </div>

                  {/* User Type */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      User Type
                    </label>
                    <select
                      value={profileData.userType}
                      onChange={(e) => handleInputChange('userType', e.target.value)}
                      disabled={!isEditing}
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-slate-50 disabled:text-slate-500 dark:bg-slate-700 dark:text-white dark:disabled:bg-slate-800"
                    >
                      <option value="">Select user type</option>
                      <option value="project-owner">Project Owner</option>
                      <option value="vendor">Vendor</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>

                  {/* Company Name */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Company Name
                    </label>
                    <input
                      type="text"
                      value={profileData.companyName}
                      onChange={(e) => handleInputChange('companyName', e.target.value)}
                      disabled={!isEditing}
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-slate-50 disabled:text-slate-500 dark:bg-slate-700 dark:text-white dark:disabled:bg-slate-800"
                    />
                  </div>

                  {/* Bio */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Bio
                    </label>
                    <textarea
                      value={profileData.bio}
                      onChange={(e) => handleInputChange('bio', e.target.value)}
                      disabled={!isEditing}
                      rows={4}
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-slate-50 disabled:text-slate-500 dark:bg-slate-700 dark:text-white dark:disabled:bg-slate-800"
                      placeholder="Tell us about yourself..."
                    />
                  </div>

                  {/* Specialization */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Specialization
                    </label>
                    <input
                      type="text"
                      value={profileData.specialization}
                      onChange={(e) => handleInputChange('specialization', e.target.value)}
                      disabled={!isEditing}
                      placeholder="e.g., Interior Design, Construction"
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-slate-50 disabled:text-slate-500 dark:bg-slate-700 dark:text-white dark:disabled:bg-slate-800"
                    />
                  </div>

                  {/* Experience */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Years of Experience
                    </label>
                    <input
                      type="text"
                      value={profileData.experience}
                      onChange={(e) => handleInputChange('experience', e.target.value)}
                      disabled={!isEditing}
                      placeholder="e.g., 5 years"
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-slate-50 disabled:text-slate-500 dark:bg-slate-700 dark:text-white dark:disabled:bg-slate-800"
                    />
                  </div>

                  {/* Location */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Location
                    </label>
                    <input
                      type="text"
                      value={profileData.location}
                      onChange={(e) => handleInputChange('location', e.target.value)}
                      disabled={!isEditing}
                      placeholder="e.g., Jakarta, Indonesia"
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-slate-50 disabled:text-slate-500 dark:bg-slate-700 dark:text-white dark:disabled:bg-slate-800"
                    />
                  </div>

                  {/* Website */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Website
                    </label>
                    <input
                      type="url"
                      value={profileData.website}
                      onChange={(e) => handleInputChange('website', e.target.value)}
                      disabled={!isEditing}
                      placeholder="https://yourwebsite.com"
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-slate-50 disabled:text-slate-500 dark:bg-slate-700 dark:text-white dark:disabled:bg-slate-800"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* My Projects Tab */}
          {activeTab === 'projects' && (
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">My Projects</h2>
              
              {projectsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <span className="ml-3 text-slate-600 dark:text-slate-400">Loading projects...</span>
                </div>
              ) : userProjects.length === 0 ? (
                <div className="text-center py-12">
                  <svg className="mx-auto h-12 w-12 text-slate-400 dark:text-slate-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">No projects yet</h3>
                  <p className="text-slate-500 dark:text-slate-400">
                    You haven&apos;t created any projects yet. Start by creating your first project.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {userProjects.map((project) => (
                    <div key={project.id} className="border border-slate-200 dark:border-slate-700 rounded-lg p-4">
                      <h3 className="font-semibold text-slate-900 dark:text-white mb-2">
                        {project.title || project.projectTitle || 'Untitled Project'}
                      </h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                        {project.description || 'No description available'}
                      </p>
                      <div className="flex flex-wrap gap-2 mb-2">
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 text-xs rounded">
                          {project.status || 'Unknown'}
                        </span>
                        <span className="px-2 py-1 bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 text-xs rounded">
                          {project.projectType || 'General'}
                        </span>
                      </div>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        Budget: {project.estimatedBudget || project.budget || 'Not specified'}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Account Settings Tab */}
          {activeTab === 'settings' && (
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">Account Settings</h2>
              
              <div className="space-y-6">
                {/* Account Status */}
                <div>
                  <h3 className="text-sm font-medium text-slate-900 dark:text-white mb-2">Account Status</h3>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center">
                      <div className={`w-3 h-3 rounded-full mr-2 ${
                        user?.emailVerified ? 'bg-green-500' : 'bg-red-500'
                      }`}></div>
                      <span className="text-sm text-slate-600 dark:text-slate-400">
                        Email {user?.emailVerified ? 'Verified' : 'Not Verified'}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <div className={`w-3 h-3 rounded-full mr-2 ${
                        userProfile?.phoneVerified ? 'bg-green-500' : 'bg-red-500'
                      }`}></div>
                      <span className="text-sm text-slate-600 dark:text-slate-400">
                        Phone {userProfile?.phoneVerified ? 'Verified' : 'Not Verified'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Account Information */}
                <div>
                  <h3 className="text-sm font-medium text-slate-900 dark:text-white mb-2">Account Information</h3>
                  <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-4 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-600 dark:text-slate-400">User ID:</span>
                      <span className="text-sm font-mono text-slate-900 dark:text-white">{user?.uid}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-600 dark:text-slate-400">Created:</span>
                      <span className="text-sm text-slate-900 dark:text-white">
                        {userProfile?.createdAt?.toDate?.()?.toLocaleDateString() || 'Unknown'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-600 dark:text-slate-400">Last Updated:</span>
                      <span className="text-sm text-slate-900 dark:text-white">
                        {userProfile?.updatedAt?.toDate?.()?.toLocaleDateString() || 'Unknown'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
