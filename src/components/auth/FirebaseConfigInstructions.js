// components/auth/FirebaseConfigInstructions.js
'use client';

export default function FirebaseConfigInstructions({ onSkip, onRetry }) {
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Backdrop */}
        <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" />
        
        {/* Modal */}
        <div className="relative bg-white dark:bg-slate-800 rounded-xl shadow-xl max-w-2xl w-full p-6">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="mx-auto w-16 h-16 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
              Phone Authentication Setup Required
            </h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm">
              Phone verification needs to be enabled in Firebase Console
            </p>
          </div>

          {/* Instructions */}
          <div className="space-y-4 mb-6">
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900 dark:text-blue-200 mb-3">
                📋 Setup Instructions
              </h4>
              <ol className="text-sm text-blue-800 dark:text-blue-300 space-y-2 list-decimal list-inside">
                <li>
                  Go to <a href="https://console.firebase.google.com" target="_blank" rel="noopener noreferrer" className="underline hover:no-underline">Firebase Console</a>
                </li>
                <li>Select your project</li>
                <li>Navigate to <strong>Authentication</strong> → <strong>Sign-in method</strong></li>
                <li>Enable <strong>Phone</strong> provider</li>
                <li>Add your domain to authorized domains (localhost for development)</li>
                <li>Configure reCAPTCHA settings if needed</li>
              </ol>
            </div>

            {/* Development Mode Info */}
            {process.env.NODE_ENV === 'development' && (
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <h4 className="font-semibold text-green-900 dark:text-green-200 mb-2">
                  🔧 Development Mode Available
                </h4>
                <p className="text-sm text-green-800 dark:text-green-300">
                  For testing purposes, you can add this environment variable to your <code className="bg-green-100 dark:bg-green-800 px-1 rounded">.env.local</code>:
                </p>
                <div className="mt-2 p-2 bg-green-100 dark:bg-green-800 rounded font-mono text-xs">
                  NEXT_PUBLIC_FIREBASE_PHONE_AUTH_DISABLED=true
                </div>
                <p className="text-xs text-green-700 dark:text-green-400 mt-2">
                  This will simulate phone verification using code <strong>123456</strong>
                </p>
              </div>
            )}

            {/* Alternative Options */}
            <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 dark:text-gray-200 mb-2">
                ⚡ Quick Options
              </h4>
              <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                <li>• Skip phone verification for now (can be completed later in settings)</li>
                <li>• Continue with email verification only</li>
                <li>• Set up Firebase phone authentication and retry</li>
              </ul>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onSkip}
              className="flex-1 px-4 py-3 text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg font-medium transition-colors"
            >
              Skip Phone Verification
            </button>
            <button
              type="button"
              onClick={onRetry}
              className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
            >
              Retry After Setup
            </button>
          </div>

          {/* Help Links */}
          <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700 text-center">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Need help? Check the{' '}
              <a 
                href="https://firebase.google.com/docs/auth/web/phone-auth" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 dark:text-blue-400 hover:underline"
              >
                Firebase Phone Auth Documentation
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
