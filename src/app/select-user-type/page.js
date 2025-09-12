'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from '../../contexts/AuthContext';

export default function SelectUserTypePage() {
  const router = useRouter();
  const { user, userProfile, updateUserProfile, loading } = useAuth();
  const [selectedUserType, setSelectedUserType] = useState('');
  const [selectedAccountType, setSelectedAccountType] = useState('');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    companyName: '',
    npwp: '',
    phoneNumber: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [hasWaitedForAuth, setHasWaitedForAuth] = useState(false);
  const [step, setStep] = useState(1); // 1: user type selection, 2: account type and details

  // Pre-populate form with Google user data if available
  useEffect(() => {
    if (user && user.displayName) {
      const [firstName, lastName] = user.displayName.split(' ') || ['', ''];
      setFormData(prev => ({
        ...prev,
        firstName: firstName || '',
        lastName: lastName || '',
        phoneNumber: user.phoneNumber ? user.phoneNumber.replace('+62', '') : ''
      }));
    }
  }, [user]);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'phoneNumber') {
      // Only allow numbers and limit length
      const numericValue = value.replace(/\D/g, '');
      // Ensure it starts with 8 and limit to reasonable length (10-12 digits after 8)
      if (numericValue === '' || (numericValue.startsWith('8') && numericValue.length <= 13)) {
        setFormData(prev => ({
          ...prev,
          [name]: numericValue
        }));
      }
    } else if (name === 'npwp') {
      // Only allow numbers for NPWP and limit to 15 digits
      const numericValue = value.replace(/\D/g, '');
      if (numericValue.length <= 15) {
        setFormData(prev => ({
          ...prev,
          [name]: numericValue
        }));
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  // Format phone number for display (add spaces for readability)
  const formatPhoneDisplay = (phone) => {
    if (!phone) return '';
    // Format: 8xx xxx xxxx or 8xx xxxx xxxx
    if (phone.length <= 3) return phone;
    if (phone.length <= 6) return `${phone.slice(0, 3)} ${phone.slice(3)}`;
    if (phone.length <= 10) return `${phone.slice(0, 3)} ${phone.slice(3, 6)} ${phone.slice(6)}`;
    return `${phone.slice(0, 3)} ${phone.slice(3, 7)} ${phone.slice(7)}`;
  };

  // Format NPWP for display (add dots and dashes)
  const formatNPWPDisplay = (npwp) => {
    if (!npwp) return '';
    // Format: XX.XXX.XXX.X-XXX.XXX
    if (npwp.length <= 2) return npwp;
    if (npwp.length <= 5) return `${npwp.slice(0, 2)}.${npwp.slice(2)}`;
    if (npwp.length <= 8) return `${npwp.slice(0, 2)}.${npwp.slice(2, 5)}.${npwp.slice(5)}`;
    if (npwp.length <= 9) return `${npwp.slice(0, 2)}.${npwp.slice(2, 5)}.${npwp.slice(5, 8)}.${npwp.slice(8)}`;
    if (npwp.length <= 12) return `${npwp.slice(0, 2)}.${npwp.slice(2, 5)}.${npwp.slice(5, 8)}.${npwp.slice(8, 9)}-${npwp.slice(9)}`;
    return `${npwp.slice(0, 2)}.${npwp.slice(2, 5)}.${npwp.slice(5, 8)}.${npwp.slice(8, 9)}-${npwp.slice(9, 12)}.${npwp.slice(12)}`;
  };

  // Handle redirects in useEffect to avoid SSR issues
  useEffect(() => {
    console.log('SelectUserType - useEffect triggered');
    console.log('SelectUserType - loading:', loading);
    console.log('SelectUserType - user:', user?.uid || 'null');
    console.log('SelectUserType - userProfile:', userProfile);
    console.log('SelectUserType - userProfile?.userType:', userProfile?.userType);
    console.log('SelectUserType - hasWaitedForAuth:', hasWaitedForAuth);
    
    // Don't redirect while still loading auth state
    if (loading) {
      console.log('SelectUserType - Auth still loading, waiting...');
      return;
    }

    // Wait a bit for auth state to stabilize before making decisions
    if (!hasWaitedForAuth) {
      console.log('SelectUserType - Waiting for auth state to stabilize...');
      const timer = setTimeout(() => {
        setHasWaitedForAuth(true);
      }, 2000); // Wait 2 seconds for auth state to load
      return () => clearTimeout(timer);
    }
    
    // If user already has a userType, redirect to appropriate dashboard
    if (userProfile?.userType) {
      console.log('SelectUserType - User has userType, redirecting to dashboard');
      if (userProfile.userType === 'vendor') {
        router.push('/dashboard/vendor');
      } else if (userProfile.userType === 'project-owner') {
        router.push('/dashboard/project-owner');
      }
      return;
    }

    // Only redirect to login if we've waited and still no user
    if (!user && hasWaitedForAuth) {
      console.log('SelectUserType - No user found after waiting, redirecting to login');
      router.push('/login');
      return;
    }
    
    if (user) {
      console.log('SelectUserType - User exists but no userType, showing selection UI');
    }
  }, [user, userProfile, loading, router, hasWaitedForAuth]);

  const handleUserTypeSelection = async () => {
    if (!selectedUserType) {
      setError('Please select your account type');
      return;
    }

    setError('');
    setStep(2); // Move to account type and details step
  };

  const handleFinalSubmission = async () => {
    setError('');

    // Validate account type selection
    if (!selectedAccountType) {
      setError('Silakan pilih jenis akun (Individu atau Perusahaan)');
      return;
    }

    // Validate required fields based on account type
    if (selectedAccountType === 'individu') {
      if (!formData.firstName || !formData.lastName) {
        setError('Silakan isi nama depan dan nama belakang Anda');
        return;
      }
    } else if (selectedAccountType === 'perusahaan') {
      if (!formData.companyName || !formData.npwp) {
        setError('Silakan isi nama perusahaan dan NPWP');
        return;
      }
      // Validate NPWP format (should be 15 digits)
      if (formData.npwp.replace(/\D/g, '').length !== 15) {
        setError('NPWP harus tepat 15 digit');
        return;
      }
    }

    setIsLoading(true);

    try {
      // Prepare profile data
      const profileData = {
        userType: selectedUserType,
        accountType: selectedAccountType,
        firstName: selectedAccountType === 'individu' ? formData.firstName : '',
        lastName: selectedAccountType === 'individu' ? formData.lastName : '',
        companyName: selectedAccountType === 'perusahaan' ? formData.companyName : '',
        npwp: selectedAccountType === 'perusahaan' ? formData.npwp : '',
        phoneNumber: formData.phoneNumber ? `+62${formData.phoneNumber}` : '',
        profileComplete: true
      };

      // Update user profile with all the data
      await updateUserProfile(profileData);

      // Redirect to appropriate dashboard
      if (selectedUserType === 'vendor') {
        router.push('/dashboard/vendor');
      } else if (selectedUserType === 'project-owner') {
        router.push('/dashboard/project-owner');
      }
    } catch (error) {
      console.error('Error updating user profile:', error);
      setError('Failed to update account information. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading only while auth is explicitly loading, not while waiting for auth to stabilize
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: '#2373FF' }}></div>
          <p className="text-gray-600">Loading authentication...</p>
        </div>
      </div>
    );
  }

  // If user has userType or we're redirecting, show loading
  if (userProfile?.userType) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: '#2373FF' }}></div>
          <p className="text-gray-600">Redirecting to dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background gradient effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-slate-900 dark:via-blue-900/20 dark:to-indigo-900/20"></div>
      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-full h-full">
        <div className="w-96 h-96 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full blur-3xl absolute top-20 left-1/4"></div>
        <div className="w-96 h-96 bg-gradient-to-r from-indigo-400/20 to-pink-400/20 rounded-full blur-3xl absolute top-40 right-1/4"></div>
        <div className="w-96 h-96 bg-gradient-to-r from-purple-400/15 to-blue-400/15 rounded-full blur-3xl absolute bottom-20 left-1/3"></div>
      </div>
      
      <div className="relative max-w-md w-full bg-white rounded-xl shadow-lg p-8">
        <div className="text-center mb-8">
          <div className="mb-6">
            <Image 
              src="/logo-black.png" 
              alt="Projevo Logo" 
              width={120}
              height={40}
              className="h-10 w-auto mx-auto"
            />
          </div>
          <h1 className="text-2xl font-bold text-black mb-2">
            {step === 1 ? 'Welcome to Projevo!' : 'Complete Your Profile'}
          </h1>
          <p className="text-gray-600">
            {step === 1 
              ? 'Please select your account type to continue'
              : 'Please provide additional information'
            }
          </p>
        </div>

        {step === 1 && (
          <>
            <div className="space-y-4 mb-6">
              {/* Project Owner Option */}
              <div 
                className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                  selectedUserType === 'project-owner' 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-blue-300'
                }`}
                onClick={() => setSelectedUserType('project-owner')}
              >
                <div className="flex items-center">
                  <input
                    type="radio"
                    name="userType"
                    value="project-owner"
                    checked={selectedUserType === 'project-owner'}
                    onChange={(e) => setSelectedUserType(e.target.value)}
                    className="mr-3 text-blue-500"
                  />
                  <div>
                    <h3 className="font-semibold text-black">Project Owner</h3>
                    <p className="text-sm text-gray-600">
                      I need to hire contractors and manage construction projects
                    </p>
                  </div>
                </div>
              </div>

              {/* Vendor Option */}
              <div 
                className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                  selectedUserType === 'vendor' 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-blue-300'
                }`}
                onClick={() => setSelectedUserType('vendor')}
              >
                <div className="flex items-center">
                  <input
                    type="radio"
                    name="userType"
                    value="vendor"
                    checked={selectedUserType === 'vendor'}
                    onChange={(e) => setSelectedUserType(e.target.value)}
                    className="mr-3 text-blue-500"
                  />
                  <div>
                    <h3 className="font-semibold text-black">Vendor/Contractor</h3>
                    <p className="text-sm text-gray-600">
                      I provide construction services and want to find projects
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <button
              onClick={handleUserTypeSelection}
              disabled={!selectedUserType}
              className={`w-full py-3 px-4 rounded-md font-medium transition-colors ${
                !selectedUserType
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'text-white hover:bg-blue-700'
              }`}
              style={{ backgroundColor: !selectedUserType ? undefined : '#2373FF' }}
            >
              Continue
            </button>
          </>
        )}

        {step === 2 && (
          <>
            <div className="space-y-6">
              {/* Account Type Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-4">
                  Jenis Akun
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setSelectedAccountType('individu')}
                    className={`p-4 border-2 rounded-lg text-center transition-all duration-200 ${
                      selectedAccountType === 'individu'
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-300 hover:border-gray-400 text-gray-700'
                    }`}
                  >
                    <div className="text-sm font-semibold mb-1">Individu</div>
                    <div className="text-xs opacity-75">Akun perorangan</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedAccountType('perusahaan')}
                    className={`p-4 border-2 rounded-lg text-center transition-all duration-200 ${
                      selectedAccountType === 'perusahaan'
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-300 hover:border-gray-400 text-gray-700'
                    }`}
                  >
                    <div className="text-sm font-semibold mb-1">Perusahaan</div>
                    <div className="text-xs opacity-75">Akun perusahaan</div>
                  </button>
                </div>
              </div>

              {/* Name fields for Individu */}
              {selectedAccountType === 'individu' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                        First name
                      </label>
                      <input
                        id="firstName"
                        name="firstName"
                        type="text"
                        required
                        value={formData.firstName}
                        onChange={handleFormChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        placeholder="First name"
                      />
                    </div>
                    <div>
                      <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                        Last name
                      </label>
                      <input
                        id="lastName"
                        name="lastName"
                        type="text"
                        required
                        value={formData.lastName}
                        onChange={handleFormChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        placeholder="Last name"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Company fields for Perusahaan */}
              {selectedAccountType === 'perusahaan' && (
                <div className="space-y-4">
                  <div>
                    <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 mb-2">
                      Company Name
                    </label>
                    <input
                      id="companyName"
                      name="companyName"
                      type="text"
                      required
                      value={formData.companyName}
                      onChange={handleFormChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      placeholder="Enter company name"
                    />
                  </div>
                  <div>
                    <label htmlFor="npwp" className="block text-sm font-medium text-gray-700 mb-2">
                      NPWP
                    </label>
                    <input
                      id="npwp"
                      name="npwp"
                      type="text"
                      required
                      value={formatNPWPDisplay(formData.npwp)}
                      onChange={handleFormChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      placeholder="XX.XXX.XXX.X-XXX.XXX"
                      maxLength="20"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      15-digit tax identification number
                    </p>
                  </div>
                </div>
              )}

              {/* Phone Number field (optional) */}
              {selectedAccountType && (
                <div>
                  <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number (Optional)
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 text-sm">+62</span>
                    </div>
                    <input
                      id="phoneNumber"
                      name="phoneNumber"
                      type="tel"
                      value={formatPhoneDisplay(formData.phoneNumber)}
                      onChange={handleFormChange}
                      className="w-full pl-12 pr-3 py-2 border border-gray-300 rounded-lg bg-white text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      placeholder="812 3456 7890"
                      maxLength="15"
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    Enter your number starting with 8 (e.g., 812 3456 7890)
                  </p>
                </div>
              )}
            </div>

            {error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <div className="mt-6 space-y-3">
              <button
                onClick={handleFinalSubmission}
                disabled={isLoading || !selectedAccountType}
                className={`w-full py-3 px-4 rounded-md font-medium transition-colors ${
                  isLoading || !selectedAccountType
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'text-white hover:bg-blue-700'
                }`}
                style={{ backgroundColor: isLoading || !selectedAccountType ? undefined : '#2373FF' }}
              >
                {isLoading ? 'Setting up your account...' : 'Complete Setup'}
              </button>

              <button
                onClick={() => setStep(1)}
                disabled={isLoading}
                className="w-full py-2 px-4 text-gray-600 hover:bg-gray-50 rounded-md transition-all duration-200"
              >
                Back
              </button>
            </div>
          </>
        )}

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            You can change this later in your profile settings
          </p>
        </div>
      </div>
    </div>
  );
}
