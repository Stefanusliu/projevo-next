// app/signup/page.js
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '../../contexts/AuthContext';
import OTPModal from '../../components/auth/OTPModal';
import PhoneOTPModal from '../../components/auth/PhoneOTPModal';
import FirebaseConfigInstructions from '../../components/auth/FirebaseConfigInstructions';

export default function SignUp() {
  const router = useRouter();
  const { signUp, signInWithGoogle, verifyCustomOTP, resendEmailVerification, sendPhoneVerification, verifyPhoneForSignup, setupRecaptcha } = useAuth();
  const [formData, setFormData] = useState({
    accountType: '', // 'individu' or 'perusahaan'
    firstName: '',
    lastName: '',
    companyName: '',
    npwp: '',
    email: '',
    password: '',
    confirmPassword: '',
    userType: '',
    phoneNumber: '',
    agreeToTerms: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState(1); // 1: form, 2: email verification, 3: phone verification, 4: success
  const [verificationSent, setVerificationSent] = useState(false);
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  
  // Phone verification states
  const [showPhoneOTPModal, setShowPhoneOTPModal] = useState(false);
  const [phoneOtpLoading, setPhoneOtpLoading] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [phoneVerificationStep, setPhoneVerificationStep] = useState('send'); // 'send' or 'verify'
  const [showFirebaseConfigInstructions, setShowFirebaseConfigInstructions] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
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
        [name]: type === 'checkbox' ? checked : value
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Validate account type selection
    if (!formData.accountType) {
      setError('Please select account type (Individu or Perusahaan)');
      return;
    }

    // Validate required fields based on account type
    if (formData.accountType === 'individu') {
      if (!formData.firstName || !formData.lastName) {
        setError('Please fill in your first and last name');
        return;
      }
    } else if (formData.accountType === 'perusahaan') {
      if (!formData.companyName || !formData.npwp) {
        setError('Please fill in company name and NPWP');
        return;
      }
      // Validate NPWP format (should be 15 digits)
      if (formData.npwp.replace(/\D/g, '').length !== 15) {
        setError('NPWP must be exactly 15 digits');
        return;
      }
    }

    // Validate required fields
    if (!formData.userType) {
      setError('Please select whether you are a Project Owner or Vendor');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (!formData.agreeToTerms) {
      setError('Please agree to the Terms of Service and Privacy Policy');
      return;
    }
    
    setLoading(true);
    
    try {
      // Create Firebase user with the expected userData object
      const userData = {
        email: formData.email,
        password: formData.password,
        accountType: formData.accountType,
        firstName: formData.accountType === 'individu' ? formData.firstName : '',
        lastName: formData.accountType === 'individu' ? formData.lastName : '',
        companyName: formData.accountType === 'perusahaan' ? formData.companyName : '',
        npwp: formData.accountType === 'perusahaan' ? formData.npwp : '',
        phoneNumber: formData.phoneNumber ? `+62${formData.phoneNumber}` : '', // Prepend +62
        userType: formData.userType
      };

      console.log('Signup page - userData being passed to signUp:', userData);
      console.log('Signup page - formData.userType:', formData.userType);

      const result = await signUp(userData);
      
      // Handle potential profile save error
      if (result.profileSaveError) {
        console.warn('User created but profile data could not be saved. Will retry on next login.');
      }
      
      // Send OTP email automatically after successful signup
      try {
        await sendOTP();
        setShowOTPModal(true);
        setVerificationSent(true);
      } catch (otpError) {
        console.error('Failed to send OTP:', otpError);
        // Show OTP modal anyway so user can try resending
        setShowOTPModal(true);
        setVerificationSent(false); // Indicate that initial send failed
        setError(`OTP sending failed: ${otpError.message}. Please try resending.`);
      }
      
    } catch (error) {
      console.error('Signup error:', error);
      
      // Handle specific Firebase errors
      let errorMessage = 'Failed to create account. Please try again.';
      
      if (error.code === 'auth/admin-restricted-operation') {
        errorMessage = 'Account creation is currently restricted. Please contact support or try again later.';
      } else if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'An account with this email already exists. Please sign in instead.';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password is too weak. Please choose a stronger password.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Please enter a valid email address.';
      } else if (error.code === 'auth/operation-not-allowed') {
        errorMessage = 'Email/password accounts are not enabled. Please contact support.';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many unsuccessful sign up attempts. Please try again later.';
      } else if (error.code === 'permission-denied' || error.code === 'insufficient-permissions') {
        errorMessage = 'Account created but profile data could not be saved. Please complete your profile after signing in.';
        // Still move to verification step since user was created
        setStep(2);
        return;
      } else if (error.code === 'unavailable') {
        errorMessage = 'Service is temporarily unavailable. Please try again in a few moments.';
      } else if (error.name === 'NetworkError' || error.message.includes('network')) {
        errorMessage = 'Network error. Please check your internet connection and try again.';
      } else if (error.message) {
        // Use the error message but make it more user-friendly
        errorMessage = error.message.replace(/firebase:/gi, '').replace(/auth\//gi, '').trim();
        errorMessage = errorMessage.charAt(0).toUpperCase() + errorMessage.slice(1);
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setError('');
    setLoading(true);
    
    try {
      const result = await signInWithGoogle();
      
      // Google sign-in is handled by AuthContext
      // Redirect to select-user-type page for account setup
      router.push('/select-user-type');
      
    } catch (error) {
      console.error('Google signup error:', error);
      
      let errorMessage = 'Failed to sign up with Google';
      if (error.code === 'auth/popup-closed-by-user') {
        errorMessage = 'Sign-up was cancelled. Please try again.';
      } else if (error.code === 'auth/popup-blocked') {
        errorMessage = 'Popup was blocked. Please allow popups and try again.';
      } else if (error.code === 'auth/cancelled-popup-request') {
        errorMessage = 'Only one popup request is allowed at a time.';
      } else if (error.code === 'auth/account-exists-with-different-credential') {
        errorMessage = 'An account already exists with the same email but different sign-in method.';
      } else if (error.code === 'auth/operation-not-allowed') {
        errorMessage = 'Google sign-in is not enabled. Please contact support.';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many requests. Please try again later.';
      } else if (error.name === 'NetworkError' || error.message.includes('network')) {
        errorMessage = 'Network error. Please check your internet connection and try again.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Send OTP Email
  const sendOTP = async () => {
    try {
      const otpUserData = {
        accountType: formData.accountType,
        firstName: formData.accountType === 'individu' ? formData.firstName : '',
        lastName: formData.accountType === 'individu' ? formData.lastName : '',
        companyName: formData.accountType === 'perusahaan' ? formData.companyName : '',
        npwp: formData.accountType === 'perusahaan' ? formData.npwp : '',
        email: formData.email,
        phoneNumber: formData.phoneNumber ? `+62${formData.phoneNumber}` : '',
        userType: formData.userType,
        displayName: formData.accountType === 'individu' 
          ? `${formData.firstName} ${formData.lastName}` 
          : formData.companyName
      };

      console.log('SendOTP - formData.userType:', formData.userType);
      console.log('SendOTP - otpUserData:', otpUserData);

      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          name: formData.accountType === 'individu' 
            ? `${formData.firstName} ${formData.lastName}` 
            : formData.companyName,
          userData: otpUserData
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Server error (${response.status}): Failed to send verification code`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error sending OTP:', error);
      
      // Handle network and API errors more specifically
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Network error: Please check your internet connection and try again.');
      } else if (error.name === 'AbortError') {
        throw new Error('Request timed out. Please try again.');
      } else if (error.message.includes('JSON')) {
        throw new Error('Server communication error. Please try again.');
      }
      
      throw error;
    }
  };

  // Verify OTP
  const handleVerifyOTP = async (otp) => {
    setOtpLoading(true);
    
    try {
      // Use the AuthContext's verifyCustomOTP function
      // This will verify the OTP and update the user's emailVerified status in Firestore
      await verifyCustomOTP(otp);
      
      // OTP verified successfully
      setShowOTPModal(false);
      
      // Check if user has a phone number to verify
      if (formData.phoneNumber) {
        // Proceed to phone verification
        setStep(3);
        await initPhoneVerification();
      } else {
        // Skip phone verification, go to success
        setStep(4);
      }
      
    } catch (error) {
      console.error('OTP verification error:', error);
      
      // Check if it's a profile refresh error but OTP was actually verified
      if (error.message && error.message.includes('Missing or insufficient permissions')) {
        console.warn('Profile refresh failed but OTP verification might have succeeded. Continuing...');
        setShowOTPModal(false);
        
        // Try to proceed anyway
        if (formData.phoneNumber) {
          setStep(3);
          await initPhoneVerification();
        } else {
          setStep(4);
        }
      } else {
        // Re-throw other errors to be handled by the OTP modal
        throw error;
      }
    } finally {
      setOtpLoading(false);
    }
  };

  // Resend OTP
  const handleResendOTP = async () => {
    try {
      // Use AuthContext's resendEmailVerification which now uses our custom OTP system
      await resendEmailVerification();
    } catch (error) {
      console.error('Error resending OTP:', error);
      throw error;
    }
  };

  // Initialize phone verification
  const initPhoneVerification = async () => {
    try {
      setError(''); // Clear any previous errors
      console.log('Initializing phone verification...');
      
      // Just show the modal - let the modal handle reCAPTCHA setup
      setShowPhoneOTPModal(true);
      setPhoneVerificationStep('send');
      
      console.log('Phone verification modal opened');
    } catch (error) {
      console.error('Error initializing phone verification:', error);
      setError(`Failed to initialize phone verification: ${error.message}. Please try again.`);
    }
  };

  // Send phone verification code
  const handleSendPhoneVerification = async () => {
    setPhoneOtpLoading(true);
    
    try {
      console.log('Setting up reCAPTCHA...');
      // Setup reCAPTCHA first if not already done
      await setupRecaptcha('phone-recaptcha-container');
      
      const phoneNumber = `+62${formData.phoneNumber}`;
      console.log('Sending verification code to:', phoneNumber);
      
      const confirmation = await sendPhoneVerification(phoneNumber);
      setConfirmationResult(confirmation);
      setPhoneVerificationStep('verify');
      
      console.log('Verification code sent successfully');
      return confirmation;
    } catch (error) {
      console.error('Error sending phone verification:', error);
      
      // Check if it's a Firebase configuration error
      if (error.message === 'FIREBASE_PHONE_AUTH_NOT_CONFIGURED') {
        // Close the phone modal and show configuration instructions
        setShowPhoneOTPModal(false);
        setShowFirebaseConfigInstructions(true);
        return;
      }
      
      // Provide helpful error messages based on the specific error
      let userFriendlyMessage = 'Failed to send verification code. ';
      
      if (error.message && error.message.includes('invalid-app-credential')) {
        userFriendlyMessage = 'Phone verification is not properly configured in Firebase. Please skip this step for now and complete it later in your account settings.';
      } else if (error.message && error.message.includes('missing-app-credentials')) {
        userFriendlyMessage = 'Authentication service configuration error. Please skip phone verification for now.';
      } else if (error.message && error.message.includes('auth/invalid-phone-number')) {
        userFriendlyMessage = 'The phone number format is invalid. Please check the number and try again.';
      } else if (error.message && error.message.includes('auth/quota-exceeded')) {
        userFriendlyMessage = 'SMS quota exceeded. Please try again later or skip for now.';
      } else if (error.message && error.message.includes('reCAPTCHA')) {
        userFriendlyMessage = 'reCAPTCHA verification failed. Please refresh the page and try again.';
      } else if (error.message) {
        userFriendlyMessage += error.message;
      } else {
        userFriendlyMessage += 'Please try again or skip this step.';
      }
      
      // Create a more detailed error for logging
      const detailedError = new Error(userFriendlyMessage);
      detailedError.originalError = error;
      
      throw detailedError;
    } finally {
      setPhoneOtpLoading(false);
    }
  };

  // Verify phone OTP
  const handleVerifyPhoneOTP = async (code) => {
    setPhoneOtpLoading(true);
    
    try {
      if (!confirmationResult) {
        throw new Error('No confirmation result available. Please request a new code.');
      }
      
      await verifyPhoneForSignup(confirmationResult, code);
      
      // Phone verification successful
      setShowPhoneOTPModal(false);
      setStep(4); // Move to success step
      
    } catch (error) {
      console.error('Phone verification error:', error);
      throw error;
    } finally {
      setPhoneOtpLoading(false);
    }
  };

  // Resend phone verification
  const handleResendPhoneOTP = async () => {
    try {
      const phoneNumber = `+62${formData.phoneNumber}`;
      const confirmation = await sendPhoneVerification(phoneNumber);
      setConfirmationResult(confirmation);
      return confirmation;
    } catch (error) {
      console.error('Error resending phone verification:', error);
      throw error;
    }
  };

  return (
    <>
      <Head>
        <title>Sign Up - Join Projevo Construction Platform | Projevo</title>
        <meta
          name="description"
          content="Join Projevo today! Create your account as a Project Owner to find contractors or as a Vendor to discover construction, interior design, and architecture opportunities in Indonesia."
        />
        <meta 
          name="keywords" 
          content="Projevo signup, construction platform registration, project owner registration, vendor registration, contractor platform signup, join Projevo" 
        />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://projevo.com/signup" />
      </Head>

      <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Background gradient effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-slate-900 dark:via-blue-900/20 dark:to-indigo-900/20"></div>
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-full h-full">
          <div className="w-96 h-96 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full blur-3xl absolute top-20 left-1/4"></div>
          <div className="w-96 h-96 bg-gradient-to-r from-indigo-400/20 to-pink-400/20 rounded-full blur-3xl absolute top-40 right-1/4"></div>
          <div className="w-96 h-96 bg-gradient-to-r from-purple-400/15 to-blue-400/15 rounded-full blur-3xl absolute bottom-20 left-1/3"></div>
        </div>

        <div className="relative max-w-md w-full space-y-8">
          {/* Logo and header */}
          <div className="text-center">
            <Link href="/" className="inline-flex items-center space-x-2 mb-6">
              <Image 
                src="/logo.png" 
                alt="Projevo Logo" 
                width={120}
                height={40}
                className="h-10 w-auto"
                priority
                unoptimized={process.env.NODE_ENV === 'development'}
              />
            </Link>
            <h2 className="text-3xl font-bold text-white mb-2">
              Start your evolution
            </h2>
            <p className="text-white/90">
              Create your account and transform how you manage projects
            </p>
          </div>

          {/* Signup form */}
          <div className="bg-black/20 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-8">
            {error && (
              <div className="mb-4 p-4 bg-red-900/30 border border-red-500/50 rounded-lg backdrop-blur-sm">
                <p className="text-red-200 text-sm">{error}</p>
              </div>
            )}

            {step === 1 && (
              <form className="space-y-6" onSubmit={handleSubmit}>
              
              {/* Account Type Selection */}
              <div>
                <label className="block text-sm font-medium text-white mb-4">
                  Jenis Akun
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, accountType: 'individu' }))}
                    className={`p-6 border-2 rounded-lg text-center transition-all duration-200 ${
                      formData.accountType === 'individu'
                        ? 'border-blue-400 bg-blue-50 text-blue-700'
                        : 'border-white/30 hover:border-white/50 text-white bg-white/10 hover:bg-white/20'
                    }`}
                  >
                    <div className="text-lg font-semibold mb-2">Individu</div>
                    <div className="text-sm opacity-75">Akun perorangan</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, accountType: 'perusahaan' }))}
                    className={`p-6 border-2 rounded-lg text-center transition-all duration-200 ${
                      formData.accountType === 'perusahaan'
                        ? 'border-blue-400 bg-blue-50 text-blue-700'
                        : 'border-white/30 hover:border-white/50 text-white bg-white/10 hover:bg-white/20'
                    }`}
                  >
                    <div className="text-lg font-semibold mb-2">Perusahaan</div>
                    <div className="text-sm opacity-75">Akun perusahaan</div>
                  </button>
                </div>
              </div>

              {/* Name fields - show different fields based on account type */}
              {formData.accountType === 'individu' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>                      <label htmlFor="firstName" className="block text-sm font-medium text-white mb-2">
                        First name
                      </label>
                    <input
                      id="firstName"
                      name="firstName"
                      type="text"
                      required
                      value={formData.firstName}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      placeholder="First name"
                    />
                  </div>
                  <div>                      <label htmlFor="lastName" className="block text-sm font-medium text-white mb-2">
                        Last name
                      </label>
                    <input
                      id="lastName"
                      name="lastName"
                      type="text"
                      required
                      value={formData.lastName}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      placeholder="Last name"
                    />
                  </div>
                </div>
              )}

              {/* Company fields - only show for perusahaan */}
              {formData.accountType === 'perusahaan' && (
                <div className="space-y-4">
                  <div>
                    <label htmlFor="companyName" className="block text-sm font-medium text-white mb-2">
                      Company Name
                    </label>
                    <input
                      id="companyName"
                      name="companyName"
                      type="text"
                      required
                      value={formData.companyName}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      placeholder="Enter company name"
                    />
                  </div>
                  <div>
                    <label htmlFor="npwp" className="block text-sm font-medium text-white mb-2">
                      NPWP
                    </label>
                    <input
                      id="npwp"
                      name="npwp"
                      type="text"
                      required
                      value={formatNPWPDisplay(formData.npwp)}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      placeholder="XX.XXX.XXX.X-XXX.XXX"
                      maxLength="20"
                    />
                    <p className="mt-1 text-xs text-white/70">
                      15-digit tax identification number
                    </p>
                  </div>
                </div>
              )}

              {/* Show remaining fields only after account type is selected */}
              {formData.accountType && (
                <>
                  {/* Email field */}
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-white mb-2">
                      Email address
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      placeholder="Enter your email"
                    />
                  </div>

                  {/* Phone Number field */}
                  <div>
                    <label htmlFor="phoneNumber" className="block text-sm font-medium text-white mb-2">
                      Phone Number
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 sm:text-sm">+62</span>
                      </div>
                      <input
                        id="phoneNumber"
                        name="phoneNumber"
                        type="tel"
                        required
                        value={formatPhoneDisplay(formData.phoneNumber)}
                        onChange={handleChange}
                        className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg bg-white text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        placeholder="812 3456 7890"
                        maxLength="15"
                      />
                    </div>
                    <p className="mt-1 text-xs text-white/70">
                      Enter your number starting with 8 (e.g., 812 3456 7890)
                    </p>
                  </div>

                  {/* User Type dropdown */}
                  <div>
                    <label htmlFor="userType" className="block text-sm font-medium text-white mb-2">
                      I am a
                    </label>
                    <select
                      id="userType"
                      name="userType"
                      required
                      value={formData.userType}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-black focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    >
                      <option value="">Select your role</option>
                      <option value="project-owner">Project Owner</option>
                      <option value="vendor">Vendor</option>
                    </select>
                    <p className="mt-1 text-xs text-white/70">
                      {formData.userType === 'project-owner' && "Looking for qualified vendors to complete your projects"}
                      {formData.userType === 'vendor' && "Ready to provide services and grow your business"}
                    </p>
                  </div>

                  {/* Password field */}
                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-white mb-2">
                      Password
                    </label>
                    <div className="relative">
                      <input
                        id="password"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={formData.password}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        placeholder="Create a strong password"
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <svg className="h-5 w-5 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                          </svg>
                        ) : (
                          <svg className="h-5 w-5 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Confirm Password field */}
                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-white mb-2">
                      Confirm password
                    </label>
                    <div className="relative">
                      <input
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        required
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        placeholder="Confirm your password"
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? (
                          <svg className="h-5 w-5 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                        </svg>
                        ) : (
                          <svg className="h-5 w-5 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Terms and conditions */}
                  <div className="flex items-start">
                    <input
                      id="agreeToTerms"
                      name="agreeToTerms"
                      type="checkbox"
                      required
                      checked={formData.agreeToTerms}
                      onChange={handleChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-1"
                    />
                    <label htmlFor="agreeToTerms" className="ml-2 block text-sm text-white">
                      I agree to the{' '}
                      <Link href="/terms" className="text-blue-300 hover:text-blue-200 underline">
                        Terms of Service
                      </Link>
                      {' '}and{' '}
                      <Link href="/privacy" className="text-blue-300 hover:text-blue-200 underline">
                        Privacy Policy
                      </Link>
                    </label>
                  </div>

                  {/* Submit button */}
                  <div>
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                      style={{ backgroundColor: '#2373FF' }}
                    >
                      {loading ? (
                        <span className="flex items-center justify-center">
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Creating account...
                        </span>
                      ) : (
                        formData.userType === 'project-owner' 
                          ? 'Start Finding Vendors' 
                          : formData.userType === 'vendor' 
                          ? 'Start Getting Projects' 
                          : 'Create your Projevo account'
                      )}
                    </button>
                  </div>
                </>
              )}

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/30" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-transparent text-white">
                    Or sign up with
                  </span>
                </div>
              </div>

              {/* Google signup button */}
              <div>
                <button
                  type="button"
                  onClick={handleGoogleSignUp}
                  disabled={loading}
                  className="w-full inline-flex justify-center py-3 px-4 border-2 border-white/30 hover:border-white/50 rounded-lg shadow-sm bg-white/10 hover:bg-white/20 text-sm font-medium text-white transition-all duration-200 group disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <svg className="animate-spin h-5 w-5 text-gray-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    <>
                      <svg className="w-5 h-5 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg>
                      <span className="ml-2">Continue with Google</span>
                    </>
                  )}
                </button>
              </div>
            </form>
            )}

            {/* Email Verification Step */}
            {step === 2 && (
              <div className="text-center space-y-6">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                  <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">
                    Check your email
                  </h3>
                  <p className="text-white/90">
                    We&apos;ve sent a verification code to <strong>{formData.email}</strong>
                  </p>
                  <p className="text-sm text-white/70 mt-2">
                    Enter the 6-digit code from your email to continue.
                  </p>
                </div>
                <div className="space-y-3">
                  <button
                    onClick={() => setShowOTPModal(true)}
                    className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-all duration-200"
                    style={{ backgroundColor: '#2373FF' }}
                  >
                    Enter Verification Code
                  </button>
                  <button
                    onClick={() => setStep(1)}
                    className="w-full text-white/90 py-2 px-4 rounded-lg hover:bg-white/10 transition-all duration-200"
                  >
                    Back to form
                  </button>
                </div>
              </div>
            )}

            {/* Phone Verification Step */}
            {step === 3 && (
              <div className="text-center space-y-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">
                    Verify your phone number
                  </h3>
                  <p className="text-white/90">
                    Secure your account with phone verification
                  </p>
                  <p className="text-sm text-white/70 mt-2">
                    Phone: <strong>+62{formatPhoneDisplay(formData.phoneNumber)}</strong>
                  </p>
                </div>
                
                <div className="space-y-3">
                  <button
                    onClick={initPhoneVerification}
                    disabled={phoneOtpLoading}
                    className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-green-700 disabled:bg-green-400 transition-all duration-200"
                  >
                    {phoneOtpLoading ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Setting up verification...
                      </span>
                    ) : (
                      'Start Phone Verification'
                    )}
                  </button>
                  
                  <button
                    onClick={() => setStep(4)} // Skip phone verification
                    className="w-full text-white/90 py-2 px-4 rounded-lg hover:bg-white/10 transition-all duration-200"
                  >
                    Skip for now
                  </button>
                </div>
              </div>
            )}

            {/* Success Step */}
            {step === 4 && (
              <div className="text-center space-y-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">
                    Welcome to Projevo!
                  </h3>
                  <p className="text-white/90">
                    Your account has been created successfully. You can now access your dashboard and start using the platform.
                  </p>
                  {formData.phoneNumber && (
                    <p className="text-sm text-white/70 mt-2">
                      📱 Phone verification {phoneVerificationStep === 'verify' || step === 4 ? 'completed' : 'can be completed later in settings'}
                    </p>
                  )}
                </div>
                <div className="space-y-3">
                  <button
                    onClick={() => router.push('/dashboard')}
                    className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-all duration-200"
                    style={{ backgroundColor: '#2373FF' }}
                  >
                    Continue to Dashboard
                  </button>
                </div>
              </div>
            )}

            {/* Sign in link - only show on step 1 */}
            {step === 1 && (
              <div className="mt-6 text-center">
                <p className="text-sm text-white/90">
                  Already have an account?{' '}
                  <Link href="/login" className="font-medium text-blue-300 hover:text-blue-200 underline transition-colors">
                    Sign in
                  </Link>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* OTP Modal */}
      <OTPModal
        isOpen={showOTPModal}
        onClose={() => setShowOTPModal(false)}
        onVerify={handleVerifyOTP}
        email={formData.email}
        name={`${formData.firstName} ${formData.lastName}`}
        onResendOTP={handleResendOTP}
        loading={otpLoading}
      />

      {/* Phone OTP Modal */}
      <PhoneOTPModal
        isOpen={showPhoneOTPModal}
        onClose={() => {
          setShowPhoneOTPModal(false);
          setStep(4); // Go to success step if they close
        }}
        onVerify={handleVerifyPhoneOTP}
        onResend={handleResendPhoneOTP}
        onSendCode={handleSendPhoneVerification}
        phoneNumber={`+62${formData.phoneNumber}`}
        loading={phoneOtpLoading}
        step={phoneVerificationStep}
      />

      {/* Firebase Configuration Instructions Modal */}
      {showFirebaseConfigInstructions && (
        <FirebaseConfigInstructions
          onSkip={() => {
            setShowFirebaseConfigInstructions(false);
            setStep(4); // Go to success step
          }}
          onRetry={() => {
            setShowFirebaseConfigInstructions(false);
            // Try to initialize phone verification again
            initPhoneVerification();
          }}
        />
      )}
    </>
  );
}
