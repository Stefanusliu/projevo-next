// hooks/useVerificationStatus.js
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

export function useVerificationStatus() {
  const { user, userProfile } = useAuth();
  const [verificationStatus, setVerificationStatus] = useState({
    emailVerified: false,
    phoneVerified: false,
    isCompletelyVerified: false,
    needsEmailVerification: false,
    needsPhoneVerification: false,
    loading: true
  });

  useEffect(() => {
    if (!user) {
      setVerificationStatus({
        emailVerified: false,
        phoneVerified: false,
        isCompletelyVerified: false,
        needsEmailVerification: false,
        needsPhoneVerification: false,
        loading: false
      });
      return;
    }

    // Check verification status from user profile
    const emailVerified = userProfile?.emailVerified || false;
    const phoneVerified = userProfile?.phoneVerified || false;
    const hasPhoneNumber = !!(userProfile?.phoneNumber);

    const isCompletelyVerified = emailVerified && (phoneVerified || !hasPhoneNumber);
    const needsEmailVerification = !emailVerified;
    const needsPhoneVerification = hasPhoneNumber && !phoneVerified;

    setVerificationStatus({
      emailVerified,
      phoneVerified,
      isCompletelyVerified,
      needsEmailVerification,
      needsPhoneVerification,
      hasPhoneNumber,
      loading: false
    });
  }, [user, userProfile]);

  return verificationStatus;
}

// Component to show verification alerts
export function VerificationAlert({ onEmailVerify, onPhoneVerify }) {
  const verificationStatus = useVerificationStatus();

  if (verificationStatus.loading || verificationStatus.isCompletelyVerified) {
    return null;
  }

  return (
    <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-6">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
            Account Verification Required
          </h3>
          <div className="mt-2 text-sm text-yellow-700 dark:text-yellow-300">
            <p>
              To ensure account security and access all features, please complete the following verifications:
            </p>
            <ul className="mt-2 space-y-1">
              {verificationStatus.needsEmailVerification && (
                <li className="flex items-center">
                  <span className="flex-1">• Email verification</span>
                  {onEmailVerify && (
                    <button
                      onClick={onEmailVerify}
                      className="ml-2 text-yellow-800 dark:text-yellow-200 underline hover:no-underline"
                    >
                      Verify now
                    </button>
                  )}
                </li>
              )}
              {verificationStatus.needsPhoneVerification && (
                <li className="flex items-center">
                  <span className="flex-1">• Phone number verification</span>
                  {onPhoneVerify && (
                    <button
                      onClick={onPhoneVerify}
                      className="ml-2 text-yellow-800 dark:text-yellow-200 underline hover:no-underline"
                    >
                      Verify now
                    </button>
                  )}
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
