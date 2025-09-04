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
import { 
  FiBriefcase, 
  FiShield, 
  FiSettings,
  FiUser,
  FiHome,
  FiMapPin,
  FiAlertTriangle
} from 'react-icons/fi';
import OTPModal from '../../../../components/auth/OTPModal';
import PhoneOTPModal from '../../../../components/auth/PhoneOTPModal';
import Avatar from '../../../../components/ui/Avatar';

export default function Profile() {
  const { user, userProfile, updateUserProfile, logout } = useAuth();
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
    avatar: '',
    accountType: 'individu', // 'individu' or 'perusahaan'
    npwp: '',
    
    // Company Information (only for 'perusahaan')
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
        avatar: userProfile.photoURL || user.photoURL || '',
        accountType: userProfile.accountType || 'individu', // 'individu' or 'perusahaan'
        npwp: userProfile.npwp || '',
        
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

  // Define tabs based on account type
  const tabs = [
    { 
      id: 'personal', 
      label: 'Info Personal', 
      icon: <FiUser className="w-4 h-4" />
    },
    // Only show company tab for 'perusahaan' account type
    ...(profileData.accountType === 'perusahaan' ? [{ 
      id: 'company', 
      label: 'Perusahaan', 
      icon: <FiHome className="w-4 h-4" />
    }] : []),
    { 
      id: 'address', 
      label: 'Alamat', 
      icon: <FiMapPin className="w-4 h-4" />
    },
    // Professional tab removed for project owners
    { 
      id: 'preferences', 
      label: 'Preferensi', 
      icon: <FiSettings className="w-4 h-4" />
    },
    { 
      id: 'security', 
      label: 'Keamanan', 
      icon: <FiShield className="w-4 h-4" />
    }
  ];

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#d9d9d9' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Pengaturan Profil</h1>
              <p className="text-gray-600 mt-2">
                Kelola informasi akun dan preferensi Anda
              </p>
            </div>
            <div className="flex items-center space-x-3">
              {isEditing ? (
                <>
                  <button
                    onClick={handleCancel}
                    disabled={loading}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                  >
                    Batal
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={loading}
                    className="px-6 py-2 text-white rounded-lg transition-colors shadow-lg hover:shadow-xl disabled:opacity-50"
                    style={{ backgroundColor: '#2373FF' }}
                    onMouseEnter={(e) => !loading && (e.target.style.backgroundColor = '#1a5ce6')}
                    onMouseLeave={(e) => !loading && (e.target.style.backgroundColor = '#2373FF')}
                  >
                    {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-6 py-2 text-white rounded-lg transition-colors shadow-lg hover:shadow-xl flex items-center space-x-2"
                    style={{ backgroundColor: '#2373FF' }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = '#1a5ce6'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = '#2373FF'}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                    <span>Edit Profil</span>
                  </button>
                  <button
                    onClick={() => logout()}
                    className="px-4 py-2 border border-red-300 text-red-700 bg-red-50 rounded-lg hover:bg-red-100 transition-colors flex items-center space-x-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    <span>Keluar</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Message */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg ${
            message.includes('success') || message.includes('successfully') 
              ? 'bg-green-50 text-green-800 border border-green-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}>
            {message}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Profile Summary Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-8">
              <div className="text-center">
                <div className="relative inline-block">
                  {/* Profile Photo or Initial Avatar */}
                  <div className="border-4 border-blue-100 rounded-full">
                    <Avatar
                      src={profileData.avatar}
                      alt="Profile"
                      name={profileData.accountType === 'perusahaan' 
                        ? profileData.companyName 
                        : `${profileData.firstName || ''} ${profileData.lastName || ''}`
                      }
                      size={128}
                      className="mx-auto"
                      textClassName="text-3xl"
                    />
                  </div>
                  
                  {isEditing && (
                    <label className="absolute bottom-0 right-0 w-8 h-8 text-white rounded-full flex items-center justify-center cursor-pointer transition-colors"
                      style={{ backgroundColor: '#2373FF' }}
                      onMouseEnter={(e) => e.target.style.backgroundColor = '#1a5ce6'}
                      onMouseLeave={(e) => e.target.style.backgroundColor = '#2373FF'}
                    >
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
                <h2 className="text-xl font-bold text-gray-900 mt-4">
                  {profileData.accountType === 'perusahaan' 
                    ? profileData.companyName || 'Company Name'
                    : `${profileData.firstName} ${profileData.lastName}`
                  }
                </h2>
                <p className="font-medium" style={{ color: '#2373FF' }}>
                  {profileData.accountType === 'perusahaan' 
                    ? (profileData.position || 'Project Owner')
                    : 'Individual Project Owner'
                  }
                </p>
                {profileData.accountType === 'perusahaan' && (
                  <p className="text-gray-600 text-sm mt-1">
                    {profileData.companyName}
                  </p>
                )}
                
                {/* Quick Stats */}
                <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-gray-200">
                  <div className="text-center">
                    <div className="text-2xl font-bold" style={{ color: '#2373FF' }}>
                      {profileData.projectsCompleted || 0}
                    </div>
                    <div className="text-xs text-gray-600">
                      Proyek
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-600">
                      {profileData.yearsOfExperience || 0}
                    </div>
                    <div className="text-xs text-gray-600">
                      Tahun Pengalaman
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
                        ? 'text-white border-l-4 shadow-md'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                    style={activeTab === tab.id ? { backgroundColor: '#2373FF', borderColor: '#2373FF' } : {}}
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
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
              
              {/* Personal Information Tab */}
              {activeTab === 'personal' && (
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-6">
                    Informasi Personal
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nama Depan
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={profileData.firstName}
                          onChange={(e) => handleInputChange('firstName', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          style={{ focusRingColor: '#2373FF' }}
                          onFocus={(e) => e.target.style.borderColor = '#2373FF'}
                          onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                        />
                      ) : (
                        <p className="text-gray-900 font-medium py-2">{profileData.firstName}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nama Belakang
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={profileData.lastName}
                          onChange={(e) => handleInputChange('lastName', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          style={{ focusRingColor: '#2373FF' }}
                          onFocus={(e) => e.target.style.borderColor = '#2373FF'}
                          onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                        />
                      ) : (
                        <p className="text-gray-900 font-medium py-2">{profileData.lastName}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Alamat Email
                      </label>
                      <div className="space-y-2">
                        {isEditing ? (
                          <input
                            type="email"
                            value={profileData.email}
                            onChange={(e) => handleInputChange('email', e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            style={{ focusRingColor: '#2373FF' }}
                            onFocus={(e) => e.target.style.borderColor = '#2373FF'}
                            onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                          />
                        ) : (
                          <div className="flex items-center justify-between">
                            <p className="text-gray-900 font-medium py-2">{profileData.email}</p>
                            <div className="flex items-center space-x-2">
                              {user?.emailVerified || userProfile?.emailVerified ? (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                  <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                  </svg>
                                  Terverifikasi
                                </span>
                              ) : (
                                <div className="flex items-center space-x-2">
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 ">
                                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                    </svg>
                                    Belum Terverifikasi
                                  </span>
                                  <button
                                    onClick={handleEmailVerification}
                                    disabled={verifyingEmail}
                                    className="text-sm px-3 py-1 text-white rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    style={{ backgroundColor: '#2373FF' }}
                                    onMouseEnter={(e) => !verifyingEmail && (e.target.style.backgroundColor = '#1a5ce6')}
                                    onMouseLeave={(e) => !verifyingEmail && (e.target.style.backgroundColor = '#2373FF')}
                                  >
                                    {verifyingEmail ? 'Mengirim...' : 'Verifikasi'}
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nomor Telepon
                      </label>
                      <div className="space-y-2">
                        {isEditing ? (
                          <input
                            type="tel"
                            value={profileData.phone}
                            onChange={(e) => handleInputChange('phone', e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        ) : (
                          <div className="flex items-center justify-between">
                            <p className="text-gray-900 font-medium py-2">{profileData.phone || 'Tidak tersedia'}</p>
                            <div className="flex items-center space-x-2">
                              {userProfile?.phoneVerified ? (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 ">
                                  <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                  </svg>
                                  Terverifikasi
                                </span>
                              ) : profileData.phone ? (
                                <div className="flex items-center space-x-2">
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 ">
                                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                    </svg>
                                    Belum Terverifikasi
                                  </span>
                                  <button
                                    onClick={handlePhoneVerification}
                                    disabled={verifyingPhone}
                                    className="text-sm px-3 py-1 text-white rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    style={{ backgroundColor: '#2373FF' }}
                                    onMouseEnter={(e) => !verifyingPhone && (e.target.style.backgroundColor = '#1a5ce6')}
                                    onMouseLeave={(e) => !verifyingPhone && (e.target.style.backgroundColor = '#2373FF')}
                                  >
                                    {verifyingPhone ? 'Mengirim...' : 'Verifikasi'}
                                  </button>
                                </div>
                              ) : (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600 ">
                                  Tidak tersedia
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tanggal Lahir
                      </label>
                      {isEditing ? (
                        <input
                          type="date"
                          value={profileData.dateOfBirth}
                          onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      ) : (
                        <p className="text-gray-900 font-medium py-2">
                          {profileData.dateOfBirth ? new Date(profileData.dateOfBirth).toLocaleDateString() : ''}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Jenis Kelamin
                      </label>
                      {isEditing ? (
                        <select
                          value={profileData.gender}
                          onChange={(e) => handleInputChange('gender', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="">Pilih Jenis Kelamin</option>
                          <option value="Male">Laki-laki</option>
                          <option value="Female">Perempuan</option>
                          <option value="Other">Lainnya</option>
                          <option value="Prefer not to say">Tidak ingin menyebutkan</option>
                        </select>
                      ) : (
                        <p className="text-gray-900 font-medium py-2">{profileData.gender}</p>
                      )}
                    </div>

                    {/* NPWP field - only for perusahaan accounts */}
                    {profileData.accountType === 'perusahaan' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          NPWP
                        </label>
                        {isEditing ? (
                          <input
                            type="text"
                            value={profileData.npwp}
                            onChange={(e) => handleInputChange('npwp', e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="XX.XXX.XXX.X-XXX.XXX"
                          />
                        ) : (
                          <p className="text-gray-900 font-medium py-2">{profileData.npwp || 'Tidak tersedia'}</p>
                        )}
                      </div>
                    )}

                    <div className={profileData.accountType === 'perusahaan' ? '' : 'md:col-span-2'}>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Kewarganegaraan
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={profileData.nationality}
                          onChange={(e) => handleInputChange('nationality', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      ) : (
                        <p className="text-gray-900 font-medium py-2">{profileData.nationality}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Company Information Tab */}
              {activeTab === 'company' && (
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-6">
                    Informasi Perusahaan
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nama Perusahaan
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={profileData.companyName}
                          onChange={(e) => handleInputChange('companyName', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      ) : (
                        <p className="text-gray-900 font-medium py-2">{profileData.companyName}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Posisi
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={profileData.position}
                          onChange={(e) => handleInputChange('position', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      ) : (
                        <p className="text-gray-900 font-medium py-2">{profileData.position}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Industri
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={profileData.industry}
                          onChange={(e) => handleInputChange('industry', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      ) : (
                        <p className="text-gray-900 font-medium py-2">{profileData.industry}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Ukuran Perusahaan
                      </label>
                      {isEditing ? (
                        <select
                          value={profileData.companySize}
                          onChange={(e) => handleInputChange('companySize', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="">Pilih Ukuran Perusahaan</option>
                          <option value="1-10 employees">1-10 karyawan</option>
                          <option value="11-50 employees">11-50 karyawan</option>
                          <option value="50-100 employees">50-100 karyawan</option>
                          <option value="101-500 employees">101-500 karyawan</option>
                          <option value="500+ employees">500+ karyawan</option>
                        </select>
                      ) : (
                        <p className="text-gray-900 font-medium py-2">{profileData.companySize}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Telepon Perusahaan
                      </label>
                      {isEditing ? (
                        <input
                          type="tel"
                          value={profileData.companyPhone}
                          onChange={(e) => handleInputChange('companyPhone', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      ) : (
                        <p className="text-gray-900 font-medium py-2">{profileData.companyPhone}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Website Perusahaan
                      </label>
                      {isEditing ? (
                        <input
                          type="url"
                          value={profileData.companyWebsite}
                          onChange={(e) => handleInputChange('companyWebsite', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      ) : (
                        <a href={profileData.companyWebsite ? `https://${profileData.companyWebsite}` : '#'} target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline font-medium py-2 block">
                          {profileData.companyWebsite}
                        </a>
                      )}
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Alamat Perusahaan
                      </label>
                      {isEditing ? (
                        <textarea
                          value={profileData.companyAddress}
                          onChange={(e) => handleInputChange('companyAddress', e.target.value)}
                          rows={3}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      ) : (
                        <p className="text-gray-900 font-medium py-2">{profileData.companyAddress}</p>
                      )}
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Deskripsi Perusahaan
                      </label>
                      {isEditing ? (
                        <textarea
                          value={profileData.companyDescription}
                          onChange={(e) => handleInputChange('companyDescription', e.target.value)}
                          rows={4}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      ) : (
                        <p className="text-gray-900 font-medium py-2">{profileData.companyDescription}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Address Information Tab */}
              {activeTab === 'address' && (
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-6">
                    Informasi Alamat
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Alamat Jalan
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={profileData.streetAddress}
                          onChange={(e) => handleInputChange('streetAddress', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      ) : (
                        <p className="text-gray-900 font-medium py-2">{profileData.streetAddress}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Kota
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={profileData.city}
                          onChange={(e) => handleInputChange('city', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      ) : (
                        <p className="text-gray-900 font-medium py-2">{profileData.city}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Provinsi
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={profileData.state}
                          onChange={(e) => handleInputChange('state', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      ) : (
                        <p className="text-gray-900 font-medium py-2">{profileData.state}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Kode Pos
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={profileData.postalCode}
                          onChange={(e) => handleInputChange('postalCode', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      ) : (
                        <p className="text-gray-900 font-medium py-2">{profileData.postalCode}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Negara
                      </label>
                      {isEditing ? (
                        <select
                          value={profileData.country}
                          onChange={(e) => handleInputChange('country', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                        <p className="text-gray-900 font-medium py-2">{profileData.country}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Preferences Tab */}
              {activeTab === 'preferences' && (
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-6">
                    Preferensi & Pengaturan
                  </h3>
                  <div className="space-y-8">
                    {/* Language & Timezone */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Bahasa
                        </label>
                        {isEditing ? (
                          <select
                            value={profileData.language}
                            onChange={(e) => handleInputChange('language', e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          >
                            <option value="Bahasa Indonesia">Bahasa Indonesia</option>
                            <option value="English">English</option>
                            <option value="Mandarin">Mandarin</option>
                          </select>
                        ) : (
                          <p className="text-gray-900 font-medium py-2">{profileData.language}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Zona Waktu
                        </label>
                        {isEditing ? (
                          <select
                            value={profileData.timezone}
                            onChange={(e) => handleInputChange('timezone', e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          >
                            <option value="Asia/Jakarta">Asia/Jakarta (WIB)</option>
                            <option value="Asia/Makassar">Asia/Makassar (WITA)</option>
                            <option value="Asia/Jayapura">Asia/Jayapura (WIT)</option>
                          </select>
                        ) : (
                          <p className="text-gray-900 font-medium py-2">{profileData.timezone}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Currency
                        </label>
                        {isEditing ? (
                          <select
                            value={profileData.currency}
                            onChange={(e) => handleInputChange('currency', e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          >
                            <option value="IDR">IDR (Indonesian Rupiah)</option>
                            <option value="USD">USD (US Dollar)</option>
                            <option value="SGD">SGD (Singapore Dollar)</option>
                          </select>
                        ) : (
                          <p className="text-gray-900 font-medium py-2">{profileData.currency}</p>
                        )}
                      </div>
                    </div>

                    {/* Notification Preferences */}
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">
                        Notification Preferences
                      </h4>
                      <div className="space-y-4">
                        {Object.entries(profileData.notifications).map(([key, value]) => (
                          <div key={key} className="flex items-center justify-between py-3 border-b border-slate-200 dark:border-slate-700">
                            <div>
                              <p className="font-medium text-gray-900 capitalize">
                                {key === 'email' ? 'Email Notifications' : 
                                 key === 'sms' ? 'SMS Notifications' :
                                 key === 'push' ? 'Push Notifications' :
                                 'Marketing Communications'}
                              </p>
                              <p className="text-sm text-gray-600">
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
                  <h3 className="text-xl font-semibold text-gray-900 mb-6">
                    Pengaturan Keamanan
                  </h3>
                  <div className="space-y-8">
                    {/* Password Change */}
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">
                        Ganti Kata Sandi
                      </h4>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Kata Sandi Saat Ini
                          </label>
                          <input
                            type="password"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Masukkan kata sandi saat ini"
                          />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Kata Sandi Baru
                            </label>
                            <input
                              type="password"
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              placeholder="Masukkan kata sandi baru"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Konfirmasi Kata Sandi Baru
                            </label>
                            <input
                              type="password"
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              placeholder="Konfirmasi kata sandi baru"
                            />
                          </div>
                        </div>
                        <button 
                          className="px-6 py-2 text-white rounded-lg transition-colors"
                          style={{ backgroundColor: '#2373FF' }}
                          onMouseEnter={(e) => e.target.style.backgroundColor = '#1a5ce6'}
                          onMouseLeave={(e) => e.target.style.backgroundColor = '#2373FF'}
                        >
                          Perbarui Kata Sandi
                        </button>
                      </div>
                    </div>

                    {/* Two-Factor Authentication */}
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h4 className="text-lg font-semibold text-gray-900">
                            Autentikasi Dua Faktor
                          </h4>
                          <p className="text-gray-600 text-sm">
                            Tambahkan lapisan keamanan ekstra pada akun Anda
                          </p>
                        </div>
                        <button 
                          className="px-4 py-2 text-white rounded-lg transition-colors"
                          style={{ backgroundColor: '#2373FF' }}
                          onMouseEnter={(e) => e.target.style.backgroundColor = '#1a5ce6'}
                          onMouseLeave={(e) => e.target.style.backgroundColor = '#2373FF'}
                        >
                          Aktifkan 2FA
                        </button>
                      </div>
                    </div>

                    {/* Account Security Info */}
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">
                        Keamanan Akun
                      </h4>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <FiShield className="w-5 h-5 text-gray-600" />
                            <div>
                              <p className="font-medium text-gray-900">
                                Sesi Saat Ini
                              </p>
                              <p className="text-sm text-gray-600">
                                {user?.email} • Aktif sekarang
                              </p>
                            </div>
                          </div>
                          <span className="text-gray-600 text-sm font-medium">
                            Aman
                          </span>
                        </div>
                        
                        <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <FiBriefcase className="w-5 h-5 text-gray-600" />
                            <div>
                              <p className="font-medium text-gray-900">
                                Akun Dibuat
                              </p>
                              <p className="text-sm text-gray-600">
                                {user?.metadata?.creationTime ? new Date(user.metadata.creationTime).toLocaleDateString() : 'Baru-baru ini'}
                              </p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <FiAlertTriangle className="w-5 h-5 text-gray-600" />
                            <div>
                              <p className="font-medium text-gray-900">
                                Verifikasi Email
                              </p>
                              <p className="text-sm text-gray-600">
                                {user?.emailVerified ? 'Email sudah terverifikasi' : 'Email belum terverifikasi'}
                              </p>
                            </div>
                          </div>
                          {!user?.emailVerified && (
                            <button 
                              className="text-white text-sm font-medium px-3 py-1 rounded transition-colors"
                              style={{ backgroundColor: '#2373FF' }}
                              onMouseEnter={(e) => e.target.style.backgroundColor = '#1a5ce6'}
                              onMouseLeave={(e) => e.target.style.backgroundColor = '#2373FF'}
                            >
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
