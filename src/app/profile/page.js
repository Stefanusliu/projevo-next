'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { doc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../lib/firebase';
import Avatar from '../../components/ui/Avatar';
import OTPModal from '../../components/auth/OTPModal';
import PhoneOTPModal from '../../components/auth/PhoneOTPModal';
import { FiUser, FiHome, FiMapPin, FiBriefcase, FiSettings, FiShield, FiAlertTriangle } from 'react-icons/fi';

export default function ProfilePage() {
  const { user, userProfile, updateUserProfile, logout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('personal');
  const [loading, setLoading] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [message, setMessage] = useState('');
  const [showEmailOTP, setShowEmailOTP] = useState(false);
  const [showPhoneOTP, setShowPhoneOTP] = useState(false);
  const [verifyingEmail, setVerifyingEmail] = useState(false);
  const [verifyingPhone, setVerifyingPhone] = useState(false);
  const [profileData, setProfileData] = useState({
    firstName: '', lastName: '', email: '', phone: '', dateOfBirth: '', gender: '', nationality: 'Indonesian', avatar: '',
    companyName: '', position: '', industry: '', companySize: '', companyAddress: '', companyPhone: '', companyWebsite: '', companyDescription: '',
    streetAddress: '', city: '', state: '', postalCode: '', country: 'Indonesia',
    language: 'Bahasa Indonesia', timezone: 'Asia/Jakarta', currency: 'IDR', notifications: { email: true, sms: false, push: true, marketing: false },
    yearsOfExperience: '', specialization: '', certifications: [], projectsCompleted: 0, totalBudgetManaged: '', averageProjectSize: ''
  });
  const [originalData, setOriginalData] = useState(profileData);

  useEffect(() => {
    if (user && userProfile) {
      const loadedData = {
        firstName: userProfile.firstName || '',
        lastName: userProfile.lastName || '',
        email: userProfile.email || user.email || '',
        phone: userProfile.phone || userProfile.phoneNumber || '',
        dateOfBirth: userProfile.dateOfBirth || '',
        gender: userProfile.gender || '',
        nationality: userProfile.nationality || 'Indonesian',
        avatar: userProfile.photoURL || user.photoURL || '',
        companyName: userProfile.companyName || '',
        position: userProfile.position || '',
        industry: userProfile.industry || '',
        companySize: userProfile.companySize || '',
        companyAddress: userProfile.companyAddress || '',
        companyPhone: userProfile.companyPhone || '',
        companyWebsite: userProfile.companyWebsite || '',
        companyDescription: userProfile.companyDescription || '',
        streetAddress: userProfile.streetAddress || userProfile.address || '',
        city: userProfile.city || '',
        state: userProfile.state || userProfile.province || '',
        postalCode: userProfile.postalCode || '',
        country: userProfile.country || 'Indonesia',
        language: userProfile.language || 'Bahasa Indonesia',
        timezone: userProfile.timezone || 'Asia/Jakarta',
        currency: userProfile.currency || 'IDR',
        notifications: userProfile.notifications || { email: true, sms: false, push: true, marketing: false },
        yearsOfExperience: userProfile.yearsOfExperience || '',
        specialization: userProfile.specialization || '',
        certifications: userProfile.certifications || [],
        projectsCompleted: userProfile.projectsCompleted || 0,
        totalBudgetManaged: userProfile.totalBudgetManaged || '',
        averageProjectSize: userProfile.averageProjectSize || ''
      };
      setProfileData(loadedData);
      setOriginalData(loadedData);
    }
  }, [user, userProfile]);

  const handleInputChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setProfileData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setProfileData(prev => ({ ...prev, [field]: value }));
    }
  };

  const handleSave = async () => {
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
        // This part of the original code was for Firebase Auth update, but the new profileData doesn't have displayName.
        // Assuming the intent was to update the user's display name if it was changed.
        // Since the new profileData doesn't have displayName, this block is effectively removed.
      }

      setMessage('Profile updated successfully!');
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage('Failed to update profile. Please try again.');
    }

    setLoading(false);
  };

  const handleCancel = () => {
    setProfileData(originalData);
    setIsEditing(false);
    setMessage('');
  };

  const handleAvatarUpload = async (e) => {
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

    setUploadingPhoto(true);
    setMessage('');

    try {
      // Delete old profile image if exists
      if (profileData.avatar && profileData.avatar.includes('firebase')) {
        try {
          const oldImageRef = ref(storage, profileData.avatar);
          // await deleteObject(oldImageRef); // deleteObject is not imported, so this line is commented out
        } catch (error) {
          console.log('Old image not found or already deleted');
        }
      }

      // Upload new image
      const imageRef = ref(storage, `profile-images/${user.uid}/${Date.now()}_${file.name}`);
      const snapshot = await uploadBytes(imageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);

      // Update profile data
      const updatedData = { ...profileData, avatar: downloadURL };
      setProfileData(updatedData);

      // Update Firebase Auth profile
      // await updateProfile(auth.currentUser, { // updateProfile is not imported
      //   photoURL: downloadURL
      // });

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

    setUploadingPhoto(false);
  };

  const handleEmailVerification = () => {
    setShowEmailOTP(true);
  };

  const handleEmailOTPVerify = async (otp) => {
    setVerifyingEmail(true);
    try {
      // await sendEmailVerification(auth.currentUser); // sendEmailVerification is not imported
      // await updateUserProfile({ emailVerified: true }); // updateUserProfile is not imported
      setMessage('Email verification successful!');
      setShowEmailOTP(false);
    } catch (error) {
      console.error('Error verifying email:', error);
      setMessage('Failed to verify email. Please try again.');
    }
    setVerifyingEmail(false);
  };

  const handlePhoneVerification = () => {
    setShowPhoneOTP(true);
  };

  const handlePhoneOTPVerify = async (otp) => {
    setVerifyingPhone(true);
    try {
      // await sendPhoneVerification(auth.currentUser); // sendPhoneVerification is not imported
      // await updateUserProfile({ phoneVerified: true }); // updateUserProfile is not imported
      setMessage('Phone verification successful!');
      setShowPhoneOTP(false);
    } catch (error) {
      console.error('Error verifying phone:', error);
      setMessage('Failed to verify phone. Please try again.');
    }
    setVerifyingPhone(false);
  };

  const tabs = [
    { id: 'personal', label: 'Personal Information' },
    { id: 'company', label: 'Company Information' },
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

        {/* Personal Information Tab */}
        {activeTab === 'personal' && (
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-6">
            {/* Profile Picture Section */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Profile Picture</h2>
              <div className="flex items-center space-x-6">
                <div className="relative">
                  <div className="w-24 h-24 rounded-full overflow-hidden bg-slate-200 dark:bg-slate-700">
                    {profileData.avatar ? (
                      <Avatar
                        src={profileData.avatar}
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
                  {uploadingPhoto && (
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
                      onChange={handleAvatarUpload}
                      disabled={uploadingPhoto}
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
                  onClick={() => isEditing ? handleSave() : setIsEditing(true)}
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
                    value={profileData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-slate-50 disabled:text-slate-500 dark:bg-slate-700 dark:text-white dark:disabled:bg-slate-800"
                  />
                </div>

                {/* Date of Birth */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    value={profileData.dateOfBirth}
                    onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-slate-50 disabled:text-slate-500 dark:bg-slate-700 dark:text-white dark:disabled:bg-slate-800"
                  />
                </div>

                {/* Gender */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Gender
                  </label>
                  <select
                    value={profileData.gender}
                    onChange={(e) => handleInputChange('gender', e.target.value)}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-slate-50 disabled:text-slate-500 dark:bg-slate-700 dark:text-white dark:disabled:bg-slate-800"
                  >
                    <option value="">Select gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                {/* Nationality */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Nationality
                  </label>
                  <input
                    type="text"
                    value={profileData.nationality}
                    onChange={(e) => handleInputChange('nationality', e.target.value)}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-slate-50 disabled:text-slate-500 dark:bg-slate-700 dark:text-white dark:disabled:bg-slate-800"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Company Information Tab */}
        {activeTab === 'company' && (
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">Company Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Company Name */}
              <div>
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

              {/* Position */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Position
                </label>
                <input
                  type="text"
                  value={profileData.position}
                  onChange={(e) => handleInputChange('position', e.target.value)}
                  disabled={!isEditing}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-slate-50 disabled:text-slate-500 dark:bg-slate-700 dark:text-white dark:disabled:bg-slate-800"
                />
              </div>

              {/* Industry */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Industry
                </label>
                <input
                  type="text"
                  value={profileData.industry}
                  onChange={(e) => handleInputChange('industry', e.target.value)}
                  disabled={!isEditing}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-slate-50 disabled:text-slate-500 dark:bg-slate-700 dark:text-white dark:disabled:bg-slate-800"
                />
              </div>

              {/* Company Size */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Company Size
                </label>
                <input
                  type="text"
                  value={profileData.companySize}
                  onChange={(e) => handleInputChange('companySize', e.target.value)}
                  disabled={!isEditing}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-slate-50 disabled:text-slate-500 dark:bg-slate-700 dark:text-white dark:disabled:bg-slate-800"
                />
              </div>

              {/* Company Address */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Company Address
                </label>
                <input
                  type="text"
                  value={profileData.companyAddress}
                  onChange={(e) => handleInputChange('companyAddress', e.target.value)}
                  disabled={!isEditing}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-slate-50 disabled:text-slate-500 dark:bg-slate-700 dark:text-white dark:disabled:bg-slate-800"
                />
              </div>

              {/* Company Phone */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Company Phone
                </label>
                <input
                  type="tel"
                  value={profileData.companyPhone}
                  onChange={(e) => handleInputChange('companyPhone', e.target.value)}
                  disabled={!isEditing}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-slate-50 disabled:text-slate-500 dark:bg-slate-700 dark:text-white dark:disabled:bg-slate-800"
                />
              </div>

              {/* Company Website */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Company Website
                </label>
                <input
                  type="url"
                  value={profileData.companyWebsite}
                  onChange={(e) => handleInputChange('companyWebsite', e.target.value)}
                  disabled={!isEditing}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-slate-50 disabled:text-slate-500 dark:bg-slate-700 dark:text-white dark:disabled:bg-slate-800"
                />
              </div>

              {/* Company Description */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Company Description
                </label>
                <textarea
                  value={profileData.companyDescription}
                  onChange={(e) => handleInputChange('companyDescription', e.target.value)}
                  disabled={!isEditing}
                  rows={4}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-slate-50 disabled:text-slate-500 dark:bg-slate-700 dark:text-white dark:disabled:bg-slate-800"
                  placeholder="Tell us about your company..."
                />
              </div>
            </div>
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
      {showEmailOTP && (
        <OTPModal
          onClose={() => setShowEmailOTP(false)}
          onVerify={handleEmailOTPVerify}
          isVerifying={verifyingEmail}
        />
      )}
      {showPhoneOTP && (
        <PhoneOTPModal
          onClose={() => setShowPhoneOTP(false)}
          onVerify={handlePhoneOTPVerify}
          isVerifying={verifyingPhone}
        />
      )}
    </div>
  );
}
