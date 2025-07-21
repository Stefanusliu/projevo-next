// components/auth/PhoneVerification.js
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';

export default function PhoneVerification({ user, phoneNumber, onVerified, onBack }) {
  const { setupRecaptcha, sendPhoneVerification, verifyPhoneCode } = useAuth();
  const [verificationCode, setVerificationCode] = useState('');
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [error, setError] = useState('');
  const [codeSent, setCodeSent] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  // Setup reCAPTCHA on component mount
  useEffect(() => {
    try {
      setupRecaptcha('recaptcha-container');
    } catch (error) {
      console.error('Error setting up reCAPTCHA:', error);
      setError('Failed to initialize phone verification. Please refresh and try again.');
    }
  }, [setupRecaptcha]);

  // Countdown timer for resend button
  useEffect(() => {
    let interval = null;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer(timer => timer - 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [resendTimer]);

  const sendCode = async () => {
    setLoading(true);
    setError('');
    
    try {
      const confirmation = await sendPhoneVerification(phoneNumber);
      setConfirmationResult(confirmation);
      setCodeSent(true);
      setResendTimer(60); // 60 second cooldown
    } catch (error) {
      console.error('Error sending verification code:', error);
      setError('Failed to send verification code. Please check your phone number and try again.');
    } finally {
      setLoading(false);
    }
  };

  const verifyCode = async () => {
    if (!confirmationResult) {
      setError('Please request a verification code first.');
      return;
    }

    if (!verificationCode || verificationCode.length < 6) {
      setError('Please enter a valid 6-digit verification code.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await verifyPhoneCode(confirmationResult, verificationCode);
      onVerified();
    } catch (error) {
      console.error('Error verifying code:', error);
      if (error.code === 'auth/invalid-verification-code') {
        setError('Invalid verification code. Please check and try again.');
      } else if (error.code === 'auth/code-expired') {
        setError('Verification code has expired. Please request a new one.');
        setCodeSent(false);
        setConfirmationResult(null);
      } else {
        setError('Failed to verify code. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const resendCode = async () => {
    if (resendTimer > 0) return;
    
    setResendLoading(true);
    setError('');
    
    try {
      const confirmation = await sendPhoneVerification(phoneNumber);
      setConfirmationResult(confirmation);
      setResendTimer(60);
      setVerificationCode('');
    } catch (error) {
      console.error('Error resending verification code:', error);
      setError('Failed to resend verification code. Please try again.');
    } finally {
      setResendLoading(false);
    }
  };

  const formatPhoneNumber = (phone) => {
    // Format phone number for display
    if (phone.startsWith('+62')) {
      return phone.replace('+62', '+62 ').replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3');
    }
    return phone;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="mx-auto h-12 w-12 text-blue-600">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
            </svg>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Verify Your Phone Number
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            We&apos;ll send a verification code to
          </p>
          <p className="text-center text-sm font-medium text-gray-900">
            {formatPhoneNumber(phoneNumber)}
          </p>
        </div>

        <div className="mt-8 space-y-6">
          {!codeSent ? (
            // Step 1: Send verification code
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-blue-800">
                      Phone Verification
                    </h3>
                    <div className="mt-2 text-sm text-blue-700">
                      <p>
                        Click the button below to receive a 6-digit verification code via SMS.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-md p-4">
                  <p className="text-red-800 text-sm">{error}</p>
                </div>
              )}

              <button
                onClick={sendCode}
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {loading ? 'Sending Code...' : 'Send Verification Code'}
              </button>
            </div>
          ) : (
            // Step 2: Enter verification code
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-md p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-green-800">
                      Code Sent!
                    </h3>
                    <div className="mt-2 text-sm text-green-700">
                      <p>
                        A 6-digit verification code has been sent to your phone number.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-md p-4">
                  <p className="text-red-800 text-sm">{error}</p>
                </div>
              )}

              <div>
                <label htmlFor="verificationCode" className="block text-sm font-medium text-gray-700">
                  Verification Code
                </label>
                <input
                  id="verificationCode"
                  name="verificationCode"
                  type="text"
                  maxLength="6"
                  placeholder="000000"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/[^0-9]/g, ''))}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-center text-lg tracking-widest"
                />
                <p className="text-sm text-gray-500 mt-1">Enter the 6-digit code sent to your phone</p>
              </div>

              <button
                onClick={verifyCode}
                disabled={loading || verificationCode.length < 6}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {loading ? 'Verifying...' : 'Verify Code'}
              </button>

              <div className="text-center">
                <p className="text-sm text-gray-600">
                  Didn&apos;t receive the code?
                </p>
                <button
                  onClick={resendCode}
                  disabled={resendLoading || resendTimer > 0}
                  className="mt-2 text-sm font-medium text-blue-600 hover:text-blue-500 disabled:opacity-50"
                >
                  {resendLoading ? 'Sending...' : 
                   resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend code'}
                </button>
              </div>
            </div>
          )}

          <div className="text-center">
            <button
              onClick={onBack}
              className="text-sm font-medium text-gray-600 hover:text-gray-500"
            >
              ← Back to email verification
            </button>
          </div>

          {/* reCAPTCHA container */}
          <div id="recaptcha-container"></div>

          <div className="mt-6">
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">
                    Having trouble?
                  </h3>
                  <div className="mt-2 text-sm text-yellow-700">
                    <ul className="list-disc list-inside space-y-1">
                      <li>Make sure your phone has signal and can receive SMS</li>
                      <li>Check if the number includes the correct country code</li>
                      <li>The code expires after 5 minutes</li>
                      <li>Contact support if you continue having issues</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
