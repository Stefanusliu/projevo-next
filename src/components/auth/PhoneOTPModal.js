// components/auth/PhoneOTPModal.js
'use client';

import { useState, useEffect } from 'react';

export default function PhoneOTPModal({ 
  isOpen, 
  onClose, 
  onVerify, 
  onResend, 
  onSendCode,
  phoneNumber,
  loading = false,
  step = 'send' // 'send' or 'verify'
}) {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [timeLeft, setTimeLeft] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [currentStep, setCurrentStep] = useState(step);

  useEffect(() => {
    setCurrentStep(step);
  }, [step]);

  useEffect(() => {
    if (isOpen && currentStep === 'verify' && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0) {
      setCanResend(true);
    }
  }, [isOpen, currentStep, timeLeft]);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setOtp(['', '', '', '', '', '']);
      setError('');
      setTimeLeft(60);
      setCanResend(false);
    }
  }, [isOpen]);

  const handleOtpChange = (index, value) => {
    if (value.length > 1) return;
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`phone-otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`phone-otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleSendCode = async () => {
    setError('');
    try {
      if (onSendCode) {
        await onSendCode();
        setCurrentStep('verify');
        setTimeLeft(60);
        setCanResend(false);
      }
    } catch (error) {
      console.error('Error sending verification code:', error);
      
      let errorMessage = 'Failed to send verification code. ';
      
      if (error.message && error.message.includes('invalid-app-credential')) {
        errorMessage = 'Phone verification is not properly configured. Please contact support or try again later.';
      } else if (error.message && error.message.includes('missing-app-credentials')) {
        errorMessage = 'Authentication service configuration error. Please contact support.';
      } else if (error.message && error.message.includes('reCAPTCHA')) {
        errorMessage = 'reCAPTCHA verification failed. Please refresh the page and try again.';
      } else if (error.message && error.message.includes('Container') && error.message.includes('not found')) {
        errorMessage = 'Verification setup failed. Please refresh the page and try again.';
      } else if (error.message) {
        errorMessage += error.message;
      } else {
        errorMessage += 'Please try again.';
      }
      
      setError(errorMessage);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const otpCode = otp.join('');
    
    if (otpCode.length !== 6) {
      setError('Please enter all 6 digits');
      return;
    }

    setError('');
    try {
      await onVerify(otpCode);
    } catch (error) {
      setError(error.message || 'Invalid verification code');
    }
  };

  const handleResend = async () => {
    setError('');
    setTimeLeft(60);
    setCanResend(false);
    try {
      await onResend();
    } catch (error) {
      setError(error.message || 'Failed to resend code');
    }
  };

  const formatPhoneNumber = (phone) => {
    if (!phone) return '';
    // Format +6281234567890 to +62 812 **** 7890
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length >= 10) {
      return `+${cleaned.slice(0, 2)} ${cleaned.slice(2, 5)} **** ${cleaned.slice(-4)}`;
    }
    return phone;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
          onClick={onClose}
        />
        
        {/* Modal */}
        <div className="relative bg-white dark:bg-slate-800 rounded-xl shadow-xl max-w-md w-full p-6">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="mx-auto w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
              {currentStep === 'send' ? 'Send Verification Code' : 'Verify Phone Number'}
            </h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm">
              {currentStep === 'send' 
                ? `We'll send a 6-digit code to` 
                : `We sent a 6-digit code to`
              }
            </p>
            <p className="text-slate-900 dark:text-white font-medium">
              {formatPhoneNumber(phoneNumber)}
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
            </div>
          )}

          {currentStep === 'send' ? (
            /* Send Code Step */
            <div className="space-y-4">
              {/* reCAPTCHA container */}
              <div id="phone-recaptcha-container" className="flex justify-center min-h-[78px]"></div>
              
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-3 text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg font-medium transition-colors"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSendCode}
                  disabled={loading}
                  className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg font-medium transition-colors disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Sending...
                    </span>
                  ) : (
                    'Send Code'
                  )}
                </button>
              </div>
            </div>
          ) : (
            /* Verify Code Step */
            <form onSubmit={handleSubmit}>
              <div className="flex space-x-2 justify-center mb-6">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    id={`phone-otp-${index}`}
                    type="text"
                    maxLength="1"
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className="w-12 h-12 text-center text-xl font-semibold border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={loading}
                  />
                ))}
              </div>

              {/* Timer and Resend */}
              <div className="text-center mb-6">
                {canResend ? (
                  <button
                    type="button"
                    onClick={handleResend}
                    className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium text-sm"
                    disabled={loading}
                  >
                    Resend verification code
                  </button>
                ) : (
                  <p className="text-slate-500 dark:text-slate-400 text-sm">
                    Resend code in {timeLeft}s
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-3 text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg font-medium transition-colors"
                  disabled={loading}
                >
                  Skip for now
                </button>
                <button
                  type="submit"
                  disabled={loading || otp.join('').length !== 6}
                  className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg font-medium transition-colors disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Verifying...
                    </span>
                  ) : (
                    'Verify & Continue'
                  )}
                </button>
              </div>
            </form>
          )}

          {/* Info */}
          <div className="mt-6 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <p className="text-blue-800 dark:text-blue-200 text-xs text-center">
              💡 Phone verification helps secure your account and enables project notifications.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
