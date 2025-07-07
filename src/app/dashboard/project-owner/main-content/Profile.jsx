'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../../../contexts/AuthContext';
import { db, storage, auth } from '../../../../lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { 
  sendEmailVerification, 
  PhoneAuthProvider,
  linkWithCredential,
  updatePhoneNumber
} from 'firebase/auth';
import OTPModal from '../../../../components/auth/OTPModal';
import PhoneOTPModal from '../../../../components/auth/PhoneOTPModal';

export default function Profile() {
  const { user, userProfile, updateUserProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('personal');
  const [loading, setLoading] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [message, setMessage] = useState('');
  
  // OTP Modal states
  const [showEmailOTP, setShowEmailOTP] = useState(false);
  const [showPhoneOTP, setShowPhoneOTP] = useState(false);
  const [verifyingEmail, setVerifyingEmail] = useState(false);
  const [verifyingPhone, setVerifyingPhone] = useState(false);
  
  // Firebase Phone Auth states (simplified without reCAPTCHA)
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [profileData, setProfileData] = useState({
    // Personal Information
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    gender: '',
    nationality: 'Indonesian',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=150&h=150&q=80',
    
    // Company Information
    companyName: '',
    position: '',
    industry: '',
    companySize: '',
    companyAddress: '',
    companyPhone: '',
    companyWebsite: '',
    companyDescription: '',
    
    // Address Information
    streetAddress: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'Indonesia',
    
    // Preferences
    language: 'Bahasa Indonesia',
    timezone: 'Asia/Jakarta',
    currency: 'IDR',
    notifications: {
      email: true,
      sms: false,
      push: true,
      marketing: false
    },
    
    // Professional Information
    yearsOfExperience: '',
    specialization: '',
    certifications: [],
    projectsCompleted: 0,
    totalBudgetManaged: '',
    averageProjectSize: ''
  });

  const [originalData, setOriginalData] = useState(profileData);

  // Load user data when component mounts
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
        avatar: userProfile.photoURL || user.photoURL || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=150&h=150&q=80',
        
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
        notifications: userProfile.notifications || {
          email: true,
          sms: false,
          push: true,
          marketing: false
        },
        
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
    if (!user) return;

    setLoading(true);
    setMessage('');

    try {
      // Update user document in Firestore
      const userDocRef = doc(db, 'users', user.uid);
      const updateData = {
        ...profileData,
        photoURL: profileData.avatar, // Map avatar back to photoURL
        updatedAt: new Date()
      };
      delete updateData.avatar; // Remove avatar field

      await updateDoc(userDocRef, updateData);

      // Update the user profile in AuthContext
      await updateUserProfile(updateData);

      setOriginalData(profileData);
      setIsEditing(false);
      setMessage('Profile updated successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage('Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setProfileData(originalData);
    setIsEditing(false);
    setMessage('');
  };

  const handleAvatarUpload = async (event) => {
    const file = event.target.files[0];
    
    console.log('Photo upload started:', { 
      file: file ? file.name : 'no file', 
      user: user ? user.uid : 'no user',
      updateUserProfile: typeof updateUserProfile
    });
    
    if (!file || !user) {
      const message = !file ? 'Please select a file.' : 'Please ensure you are logged in.';
      setMessage(message);
      console.error('Upload failed:', message);
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      const message = 'Please select a valid image file (JPG, PNG, GIF, etc.).';
      setMessage(message);
      console.error('Upload failed:', message, 'File type:', file.type);
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      const message = 'Image file size must be less than 5MB.';
      setMessage(message);
      console.error('Upload failed:', message, 'File size:', file.size);
      return;
    }

    setUploadingPhoto(true);
    setMessage('Uploading photo...');

    try {
      // Create a unique filename with timestamp
      const timestamp = Date.now();
      const fileExtension = file.name.split('.').pop() || 'jpg'; // fallback to jpg
      const fileName = `profile-${timestamp}.${fileExtension}`;
      
      // Create storage reference - using profile-images path to match storage rules
      const photoRef = ref(storage, `profile-images/${user.uid}/${fileName}`);
      
      console.log('Storage reference created:', {
        path: photoRef.fullPath,
        bucket: photoRef.bucket,
        name: photoRef.name
      });
      
      // Upload the file
      console.log('Starting file upload...');
      const snapshot = await uploadBytes(photoRef, file);
      console.log('Upload successful:', {
        bytesTransferred: snapshot.totalBytes,
        fullPath: snapshot.ref.fullPath
      });
      
      // Get the download URL
      console.log('Getting download URL...');
      const downloadURL = await getDownloadURL(snapshot.ref);
      console.log('Download URL obtained:', downloadURL);
      
      // Update local state immediately
      setProfileData(prev => ({ ...prev, avatar: downloadURL }));
      
      // Also save to Firestore immediately
      console.log('Saving to Firestore...');
      const userDocRef = doc(db, 'users', user.uid);
      await updateDoc(userDocRef, {
        photoURL: downloadURL,
        updatedAt: new Date()
      });
      console.log('Firestore update successful');
      
      // Update the user profile in AuthContext
      console.log('Updating user profile in AuthContext...');
      if (typeof updateUserProfile === 'function') {
        await updateUserProfile({ photoURL: downloadURL });
        console.log('AuthContext update successful');
      } else {
        console.warn('updateUserProfile is not a function:', typeof updateUserProfile);
      }
      
      // Update original data so cancel doesn't revert the photo
      setOriginalData(prev => ({ ...prev, avatar: downloadURL }));
      
      setMessage('Photo uploaded and saved successfully!');
      setTimeout(() => setMessage(''), 3000);
      
    } catch (error) {
      console.error('Error uploading photo:', error);
      console.error('Error details:', {
        code: error.code,
        message: error.message,
        name: error.name,
        stack: error.stack
      });
      
      // Provide more specific error messages
      let errorMessage = 'Failed to upload photo. ';
      if (error.code === 'storage/unauthorized') {
        errorMessage += 'You do not have permission to upload files. Please check your authentication.';
      } else if (error.code === 'storage/canceled') {
        errorMessage += 'Upload was canceled.';
      } else if (error.code === 'storage/invalid-format') {
        errorMessage += 'Invalid file format.';
      } else if (error.code === 'storage/quota-exceeded') {
        errorMessage += 'Storage quota exceeded.';
      } else if (error.code === 'storage/unauthenticated') {
        errorMessage += 'Authentication required. Please log in again.';
      } else if (error.code === 'storage/retry-limit-exceeded') {
        errorMessage += 'Too many attempts. Please try again later.';
      } else if (error.code === 'storage/invalid-checksum') {
        errorMessage += 'File corrupted during upload. Please try again.';
      } else {
        errorMessage += `Error: ${error.message}. Please try again or contact support.`;
      }
      
      setMessage(errorMessage);
    } finally {
      setUploadingPhoto(false);
      // Clear the file input to allow re-uploading the same file
      event.target.value = '';
    }
  };

  // Email verification functions
  const handleEmailVerification = async () => {
    if (!user || !profileData.email) return;
    
    setVerifyingEmail(true);
    setMessage('Sending verification email...');
    
    try {
      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: profileData.email,
          name: `${profileData.firstName} ${profileData.lastName}`,
          userId: user.uid,
          type: 'email_verification'
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setShowEmailOTP(true);
        setMessage('Verification code sent to your email');
      } else {
        setMessage(data.error || 'Failed to send verification code');
      }
    } catch (error) {
      console.error('Error sending email verification:', error);
      setMessage('Failed to send verification code');
    } finally {
      setVerifyingEmail(false);
    }
  };

  const handleEmailOTPVerify = async (otp) => {
    if (!user || !profileData.email) return;
    
    try {
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: profileData.email,
          otp: otp,
          userId: user.uid,
          type: 'email_verification'
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Update user profile to mark email as verified
        await updateUserProfile({ emailVerified: true });
        setShowEmailOTP(false);
        setMessage('Email verified successfully!');
        setTimeout(() => setMessage(''), 3000);
      } else {
        throw new Error(data.error || 'Verification failed');
      }
    } catch (error) {
      console.error('Error verifying email OTP:', error);
      throw error;
    }
  };

  // Phone verification functions (dummy implementation - UI only)
  const handlePhoneVerification = async () => {
    if (!user || !profileData.phone) {
      setMessage('Please enter a phone number');
      return;
    }
    
    setVerifyingPhone(true);
    setMessage('Sending verification code...');
    
    // Simulate API delay
    setTimeout(() => {
      // Format phone number for display
      let phoneNumber = profileData.phone.trim();
      if (phoneNumber.startsWith('08')) {
        phoneNumber = '+628' + phoneNumber.substring(2);
      } else if (phoneNumber.startsWith('8')) {
        phoneNumber = '+628' + phoneNumber.substring(1);
      } else if (!phoneNumber.startsWith('+')) {
        phoneNumber = '+62' + phoneNumber;
      }

      console.log('(DUMMY) Sending SMS to:', phoneNumber);
      
      // Show OTP modal without actual API call
      setShowPhoneOTP(true);
      setMessage('Verification code sent to your phone (DEMO MODE)');
      setVerifyingPhone(false);
    }, 1500); // 1.5 second delay to simulate API call
  };

  const handlePhoneOTPVerify = async (otp) => {
    if (!user || !profileData.phone) {
      throw new Error('Phone number is required');
    }
    
    try {
      // Simulate verification delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Format phone number
      let phoneNumber = profileData.phone.trim();
      if (phoneNumber.startsWith('08')) {
        phoneNumber = '+628' + phoneNumber.substring(2);
      } else if (phoneNumber.startsWith('8')) {
        phoneNumber = '+628' + phoneNumber.substring(1);
      } else if (!phoneNumber.startsWith('+')) {
        phoneNumber = '+62' + phoneNumber;
      }
      
      console.log('(DUMMY) Verifying OTP for:', phoneNumber);
      
      // For demo purposes, accept any OTP that's 6 digits
      if (otp && otp.length === 6 && /^\d+$/.test(otp)) {
        // Update user profile in Firestore
        const userDocRef = doc(db, 'users', user.uid);
        await updateDoc(userDocRef, {
          phoneNumber: phoneNumber,
          phoneVerified: true,
          updatedAt: new Date()
        });
        
        // Update the user profile in AuthContext
        await updateUserProfile({ 
          phoneNumber: phoneNumber,
          phoneVerified: true 
        });
        
        setShowPhoneOTP(false);
        setMessage('Phone number verified successfully! (DEMO MODE)');
        setTimeout(() => setMessage(''), 3000);
      } else {
        throw new Error('Please enter a valid 6-digit verification code');
      }
      
    } catch (error) {
      console.error('Error verifying phone OTP:', error);
      throw error;
    }
  };

  const tabs = [
    { 
      id: 'personal', 
      label: 'Personal Info', 
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      )
    },
    { 
      id: 'company', 
      label: 'Company', 
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      )
    },
    { 
      id: 'address', 
      label: 'Address', 
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      )
    },
    { id: 'professional', label: 'Professional', icon: '💼' },
    { id: 'preferences', label: 'Preferences', icon: '⚙️' },
    { id: 'security', label: 'Security', icon: '🔒' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Profile Settings</h1>
              <p className="text-slate-600 dark:text-slate-400 mt-2">
                Manage your account information and preferences
              </p>
            </div>
            <div className="flex items-center space-x-3">
              {isEditing ? (
                <>
                  <button
                    onClick={handleCancel}
                    disabled={loading}
                    className="px-4 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={loading}
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors shadow-lg hover:shadow-xl disabled:opacity-50"
                  >
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors shadow-lg hover:shadow-xl flex items-center space-x-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                  <span>Edit Profile</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Message */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg ${
            message.includes('success') || message.includes('successfully') 
              ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200 border border-green-200 dark:border-green-800'
              : 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 border border-red-200 dark:border-red-800'
          }`}>
            {message}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Profile Summary Card */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 sticky top-8">
              <div className="text-center">
                <div className="relative inline-block">
                  <img
                    src={profileData.avatar}
                    alt="Profile"
                    className="w-32 h-32 rounded-full object-cover border-4 border-blue-100 dark:border-blue-900 mx-auto"
                  />
                  {isEditing && (
                    <label className="absolute bottom-0 right-0 w-8 h-8 bg-blue-600 hover:bg-blue-700 text-white rounded-full flex items-center justify-center cursor-pointer transition-colors">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarUpload}
                        className="hidden"
                        disabled={uploadingPhoto}
                      />
                    </label>
                  )}
                  {uploadingPhoto && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                    </div>
                  )}
                </div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-4">
                  {profileData.firstName} {profileData.lastName}
                </h2>
                <p className="text-blue-600 dark:text-blue-400 font-medium">
                  {profileData.position || 'Project Owner'}
                </p>
                <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">
                  {profileData.companyName}
                </p>
                
                {/* Quick Stats */}
                <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {profileData.projectsCompleted || 0}
                    </div>
                    <div className="text-xs text-slate-600 dark:text-slate-400">
                      Projects
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {profileData.yearsOfExperience || 0}
                    </div>
                    <div className="text-xs text-slate-600 dark:text-slate-400">
                      Years Exp.
                    </div>
                  </div>
                </div>
              </div>

              {/* Navigation Tabs */}
              <nav className="mt-8 space-y-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                      activeTab === tab.id
                        ? 'bg-blue-50 text-blue-600 border-l-4 border-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
                        : 'text-slate-600 hover:text-blue-600 hover:bg-blue-50 dark:text-slate-400 dark:hover:text-blue-400 dark:hover:bg-blue-900/20'
                    }`}
                  >
                    <span className="flex items-center">{tab.icon}</span>
                    <span className="font-medium">{tab.label}</span>
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-8">
              
              {/* Personal Information Tab */}
              {activeTab === 'personal' && (
                <div>
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-6">
                    Personal Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        First Name
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={profileData.firstName}
                          onChange={(e) => handleInputChange('firstName', e.target.value)}
                          className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      ) : (
                        <p className="text-slate-900 dark:text-white font-medium py-2">{profileData.firstName}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Last Name
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={profileData.lastName}
                          onChange={(e) => handleInputChange('lastName', e.target.value)}
                          className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      ) : (
                        <p className="text-slate-900 dark:text-white font-medium py-2">{profileData.lastName}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Email Address
                      </label>
                      <div className="space-y-2">
                        {isEditing ? (
                          <input
                            type="email"
                            value={profileData.email}
                            onChange={(e) => handleInputChange('email', e.target.value)}
                            className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        ) : (
                          <div className="flex items-center justify-between">
                            <p className="text-slate-900 dark:text-white font-medium py-2">{profileData.email}</p>
                            <div className="flex items-center space-x-2">
                              {user?.emailVerified || userProfile?.emailVerified ? (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                                  <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                  </svg>
                                  Verified
                                </span>
                              ) : (
                                <div className="flex items-center space-x-2">
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                    </svg>
                                    Not Verified
                                  </span>
                                  <button
                                    onClick={handleEmailVerification}
                                    disabled={verifyingEmail}
                                    className="text-sm px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                  >
                                    {verifyingEmail ? 'Sending...' : 'Verify'}
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Phone Number
                      </label>
                      <div className="space-y-2">
                        {isEditing ? (
                          <input
                            type="tel"
                            value={profileData.phone}
                            onChange={(e) => handleInputChange('phone', e.target.value)}
                            className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        ) : (
                          <div className="flex items-center justify-between">
                            <p className="text-slate-900 dark:text-white font-medium py-2">{profileData.phone || 'Not provided'}</p>
                            <div className="flex items-center space-x-2">
                              {userProfile?.phoneVerified ? (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                                  <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                  </svg>
                                  Verified
                                </span>
                              ) : profileData.phone ? (
                                <div className="flex items-center space-x-2">
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                    </svg>
                                    Not Verified
                                  </span>
                                  <button
                                    onClick={handlePhoneVerification}
                                    disabled={verifyingPhone}
                                    className="text-sm px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                  >
                                    {verifyingPhone ? 'Sending...' : 'Verify'}
                                  </button>
                                </div>
                              ) : (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                                  Not provided
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Date of Birth
                      </label>
                      {isEditing ? (
                        <input
                          type="date"
                          value={profileData.dateOfBirth}
                          onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                          className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      ) : (
                        <p className="text-slate-900 dark:text-white font-medium py-2">
                          {profileData.dateOfBirth ? new Date(profileData.dateOfBirth).toLocaleDateString() : ''}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Gender
                      </label>
                      {isEditing ? (
                        <select
                          value={profileData.gender}
                          onChange={(e) => handleInputChange('gender', e.target.value)}
                          className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="">Select Gender</option>
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                          <option value="Prefer not to say">Prefer not to say</option>
                        </select>
                      ) : (
                        <p className="text-slate-900 dark:text-white font-medium py-2">{profileData.gender}</p>
                      )}
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Nationality
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={profileData.nationality}
                          onChange={(e) => handleInputChange('nationality', e.target.value)}
                          className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      ) : (
                        <p className="text-slate-900 dark:text-white font-medium py-2">{profileData.nationality}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Company Information Tab */}
              {activeTab === 'company' && (
                <div>
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-6">
                    Company Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Company Name
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={profileData.companyName}
                          onChange={(e) => handleInputChange('companyName', e.target.value)}
                          className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      ) : (
                        <p className="text-slate-900 dark:text-white font-medium py-2">{profileData.companyName}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Position
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={profileData.position}
                          onChange={(e) => handleInputChange('position', e.target.value)}
                          className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      ) : (
                        <p className="text-slate-900 dark:text-white font-medium py-2">{profileData.position}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Industry
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={profileData.industry}
                          onChange={(e) => handleInputChange('industry', e.target.value)}
                          className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      ) : (
                        <p className="text-slate-900 dark:text-white font-medium py-2">{profileData.industry}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Company Size
                      </label>
                      {isEditing ? (
                        <select
                          value={profileData.companySize}
                          onChange={(e) => handleInputChange('companySize', e.target.value)}
                          className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="">Select Company Size</option>
                          <option value="1-10 employees">1-10 employees</option>
                          <option value="11-50 employees">11-50 employees</option>
                          <option value="50-100 employees">50-100 employees</option>
                          <option value="101-500 employees">101-500 employees</option>
                          <option value="500+ employees">500+ employees</option>
                        </select>
                      ) : (
                        <p className="text-slate-900 dark:text-white font-medium py-2">{profileData.companySize}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Company Phone
                      </label>
                      {isEditing ? (
                        <input
                          type="tel"
                          value={profileData.companyPhone}
                          onChange={(e) => handleInputChange('companyPhone', e.target.value)}
                          className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      ) : (
                        <p className="text-slate-900 dark:text-white font-medium py-2">{profileData.companyPhone}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Company Website
                      </label>
                      {isEditing ? (
                        <input
                          type="url"
                          value={profileData.companyWebsite}
                          onChange={(e) => handleInputChange('companyWebsite', e.target.value)}
                          className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      ) : (
                        <a href={profileData.companyWebsite ? `https://${profileData.companyWebsite}` : '#'} target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline font-medium py-2 block">
                          {profileData.companyWebsite}
                        </a>
                      )}
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Company Address
                      </label>
                      {isEditing ? (
                        <textarea
                          value={profileData.companyAddress}
                          onChange={(e) => handleInputChange('companyAddress', e.target.value)}
                          rows={3}
                          className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      ) : (
                        <p className="text-slate-900 dark:text-white font-medium py-2">{profileData.companyAddress}</p>
                      )}
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Company Description
                      </label>
                      {isEditing ? (
                        <textarea
                          value={profileData.companyDescription}
                          onChange={(e) => handleInputChange('companyDescription', e.target.value)}
                          rows={4}
                          className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      ) : (
                        <p className="text-slate-900 dark:text-white font-medium py-2">{profileData.companyDescription}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Address Information Tab */}
              {activeTab === 'address' && (
                <div>
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-6">
                    Address Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Street Address
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={profileData.streetAddress}
                          onChange={(e) => handleInputChange('streetAddress', e.target.value)}
                          className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      ) : (
                        <p className="text-slate-900 dark:text-white font-medium py-2">{profileData.streetAddress}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        City
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={profileData.city}
                          onChange={(e) => handleInputChange('city', e.target.value)}
                          className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      ) : (
                        <p className="text-slate-900 dark:text-white font-medium py-2">{profileData.city}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        State/Province
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={profileData.state}
                          onChange={(e) => handleInputChange('state', e.target.value)}
                          className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      ) : (
                        <p className="text-slate-900 dark:text-white font-medium py-2">{profileData.state}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Postal Code
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={profileData.postalCode}
                          onChange={(e) => handleInputChange('postalCode', e.target.value)}
                          className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      ) : (
                        <p className="text-slate-900 dark:text-white font-medium py-2">{profileData.postalCode}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Country
                      </label>
                      {isEditing ? (
                        <select
                          value={profileData.country}
                          onChange={(e) => handleInputChange('country', e.target.value)}
                          className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="Indonesia">Indonesia</option>
                          <option value="Malaysia">Malaysia</option>
                          <option value="Singapore">Singapore</option>
                          <option value="Thailand">Thailand</option>
                          <option value="Philippines">Philippines</option>
                          <option value="Vietnam">Vietnam</option>
                          <option value="Other">Other</option>
                        </select>
                      ) : (
                        <p className="text-slate-900 dark:text-white font-medium py-2">{profileData.country}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Professional Information Tab */}
              {activeTab === 'professional' && (
                <div>
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-6">
                    Professional Information
                  </h3>
                  <div className="space-y-8">
                    {/* Experience & Statistics */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl p-6 text-center">
                        <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                          {profileData.yearsOfExperience || 0}
                        </div>
                        <div className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                          Years of Experience
                        </div>
                      </div>
                      
                      <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl p-6 text-center">
                        <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                          {profileData.projectsCompleted || 0}
                        </div>
                        <div className="text-sm text-green-700 dark:text-green-300 mt-1">
                          Projects Completed
                        </div>
                      </div>
                      
                      <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl p-6 text-center">
                        <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                          {profileData.totalBudgetManaged || 'N/A'}
                        </div>
                        <div className="text-sm text-purple-700 dark:text-purple-300 mt-1">
                          Total Budget Managed
                        </div>
                      </div>
                    </div>

                    {/* Specialization */}
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Specialization
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={profileData.specialization}
                          onChange={(e) => handleInputChange('specialization', e.target.value)}
                          className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="e.g., Commercial Construction, Project Management"
                        />
                      ) : (
                        <p className="text-slate-900 dark:text-white font-medium py-2">{profileData.specialization}</p>
                      )}
                    </div>

                    {/* Average Project Size */}
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Average Project Size
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={profileData.averageProjectSize}
                          onChange={(e) => handleInputChange('averageProjectSize', e.target.value)}
                          className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="e.g., Rp 1,500,000,000"
                        />
                      ) : (
                        <p className="text-slate-900 dark:text-white font-medium py-2">{profileData.averageProjectSize}</p>
                      )}
                    </div>

                    {/* Certifications */}
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-4">
                        Certifications & Qualifications
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {profileData.certifications && profileData.certifications.length > 0 ? (
                          profileData.certifications.map((cert, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400"
                            >
                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              {cert}
                            </span>
                          ))
                        ) : (
                          <p className="text-slate-500 dark:text-slate-400 text-sm">No certifications added yet</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Preferences Tab */}
              {activeTab === 'preferences' && (
                <div>
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-6">
                    Preferences & Settings
                  </h3>
                  <div className="space-y-8">
                    {/* Language & Timezone */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                          Language
                        </label>
                        {isEditing ? (
                          <select
                            value={profileData.language}
                            onChange={(e) => handleInputChange('language', e.target.value)}
                            className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          >
                            <option value="Bahasa Indonesia">Bahasa Indonesia</option>
                            <option value="English">English</option>
                            <option value="Mandarin">Mandarin</option>
                          </select>
                        ) : (
                          <p className="text-slate-900 dark:text-white font-medium py-2">{profileData.language}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                          Timezone
                        </label>
                        {isEditing ? (
                          <select
                            value={profileData.timezone}
                            onChange={(e) => handleInputChange('timezone', e.target.value)}
                            className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          >
                            <option value="Asia/Jakarta">Asia/Jakarta (WIB)</option>
                            <option value="Asia/Makassar">Asia/Makassar (WITA)</option>
                            <option value="Asia/Jayapura">Asia/Jayapura (WIT)</option>
                          </select>
                        ) : (
                          <p className="text-slate-900 dark:text-white font-medium py-2">{profileData.timezone}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                          Currency
                        </label>
                        {isEditing ? (
                          <select
                            value={profileData.currency}
                            onChange={(e) => handleInputChange('currency', e.target.value)}
                            className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          >
                            <option value="IDR">IDR (Indonesian Rupiah)</option>
                            <option value="USD">USD (US Dollar)</option>
                            <option value="SGD">SGD (Singapore Dollar)</option>
                          </select>
                        ) : (
                          <p className="text-slate-900 dark:text-white font-medium py-2">{profileData.currency}</p>
                        )}
                      </div>
                    </div>

                    {/* Notification Preferences */}
                    <div>
                      <h4 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                        Notification Preferences
                      </h4>
                      <div className="space-y-4">
                        {Object.entries(profileData.notifications).map(([key, value]) => (
                          <div key={key} className="flex items-center justify-between py-3 border-b border-slate-200 dark:border-slate-700">
                            <div>
                              <p className="font-medium text-slate-900 dark:text-white capitalize">
                                {key === 'email' ? 'Email Notifications' : 
                                 key === 'sms' ? 'SMS Notifications' :
                                 key === 'push' ? 'Push Notifications' :
                                 'Marketing Communications'}
                              </p>
                              <p className="text-sm text-slate-600 dark:text-slate-400">
                                {key === 'email' ? 'Receive project updates via email' :
                                 key === 'sms' ? 'Receive urgent alerts via SMS' :
                                 key === 'push' ? 'Browser and mobile push notifications' :
                                 'Promotional offers and market updates'}
                              </p>
                            </div>
                            <button
                              onClick={() => isEditing && handleInputChange(`notifications.${key}`, !value)}
                              disabled={!isEditing}
                              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                                value ? 'bg-blue-600' : 'bg-slate-200 dark:bg-slate-700'
                              } ${!isEditing ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                            >
                              <span
                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                  value ? 'translate-x-6' : 'translate-x-1'
                                }`}
                              />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Security Tab */}
              {activeTab === 'security' && (
                <div>
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-6">
                    Security Settings
                  </h3>
                  <div className="space-y-8">
                    {/* Password Change */}
                    <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-6">
                      <h4 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                        Change Password
                      </h4>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            Current Password
                          </label>
                          <input
                            type="password"
                            className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Enter current password"
                          />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                              New Password
                            </label>
                            <input
                              type="password"
                              className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder="Enter new password"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                              Confirm New Password
                            </label>
                            <input
                              type="password"
                              className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder="Confirm new password"
                            />
                          </div>
                        </div>
                        <button className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
                          Update Password
                        </button>
                      </div>
                    </div>

                    {/* Two-Factor Authentication */}
                    <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h4 className="text-lg font-semibold text-slate-900 dark:text-white">
                            Two-Factor Authentication
                          </h4>
                          <p className="text-slate-600 dark:text-slate-400 text-sm">
                            Add an extra layer of security to your account
                          </p>
                        </div>
                        <button className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors">
                          Enable 2FA
                        </button>
                      </div>
                    </div>

                    {/* Account Security Info */}
                    <div>
                      <h4 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                        Account Security
                      </h4>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                              <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            </div>
                            <div>
                              <p className="font-medium text-slate-900 dark:text-white">
                                Current Session
                              </p>
                              <p className="text-sm text-slate-600 dark:text-slate-400">
                                {user?.email} • Active now
                              </p>
                            </div>
                          </div>
                          <span className="text-green-600 dark:text-green-400 text-sm font-medium">
                            Secure
                          </span>
                        </div>
                        
                        <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                              <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                              </svg>
                            </div>
                            <div>
                              <p className="font-medium text-slate-900 dark:text-white">
                                Account Created
                              </p>
                              <p className="text-sm text-slate-600 dark:text-slate-400">
                                {user?.metadata?.creationTime ? new Date(user.metadata.creationTime).toLocaleDateString() : 'Recently'}
                              </p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900/20 rounded-full flex items-center justify-center">
                              <svg className="w-5 h-5 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.12 16.5c-.77.833.192 2.5 1.732 2.5z" />
                              </svg>
                            </div>
                            <div>
                              <p className="font-medium text-slate-900 dark:text-white">
                                Email Verification
                              </p>
                              <p className="text-sm text-slate-600 dark:text-slate-400">
                                {user?.emailVerified ? 'Email verified' : 'Email not verified'}
                              </p>
                            </div>
                          </div>
                          {!user?.emailVerified && (
                            <button className="text-blue-600 hover:text-blue-700 dark:text-blue-400 text-sm font-medium">
                              Verify
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      </div>

      {/* Email OTP Modal */}
      <OTPModal
        isOpen={showEmailOTP}
        onClose={() => setShowEmailOTP(false)}
        onVerify={handleEmailOTPVerify}
        email={profileData.email}
        name={`${profileData.firstName} ${profileData.lastName}`}
        onResendOTP={handleEmailVerification}
        loading={verifyingEmail}
      />

      {/* Phone OTP Modal */}
      <PhoneOTPModal
        isOpen={showPhoneOTP}
        onClose={() => setShowPhoneOTP(false)}
        onVerify={handlePhoneOTPVerify}
        onResend={handlePhoneVerification}
        phoneNumber={profileData.phone}
        loading={verifyingPhone}
        step="verify"
      />
    </div>
  );
}
