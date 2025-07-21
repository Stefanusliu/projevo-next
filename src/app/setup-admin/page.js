'use client';

import { useState, useEffect } from 'react';
import { setupAdminUser } from '../../utils/setupAdmin';
import { useRouter } from 'next/navigation';

export default function SetupAdmin() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [accessKey, setAccessKey] = useState('');
  const router = useRouter();

  // Production security - require access key
  const SETUP_ACCESS_KEY = process.env.NEXT_PUBLIC_SETUP_ACCESS_KEY || 'SETUP_KEY_2024_SECURE';

  const handleAccessSubmit = (e) => {
    e.preventDefault();
    if (accessKey === SETUP_ACCESS_KEY) {
      setIsAuthorized(true);
      setError(null);
    } else {
      setError('Invalid access key. Contact system administrator.');
    }
  };

  const handleSetup = async () => {
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const adminResult = await setupAdminUser();
      setResult(adminResult);
      console.log('Admin setup successful:', adminResult);
    } catch (error) {
      setError(error.message);
      console.error('Admin setup failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Security warning for production
  useEffect(() => {
    console.warn('[SECURITY WARNING] Admin setup page accessed. This should be disabled in production.');
    
    // In production, you might want to completely disable this page
    const isProduction = process.env.NODE_ENV === 'production';
    if (isProduction && !process.env.NEXT_PUBLIC_ALLOW_ADMIN_SETUP) {
      router.push('/404');
      return;
    }
  }, [router]);

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="text-center mb-6">
              <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Protected Setup</h1>
              <p className="text-gray-600">System administrator setup requires authorization</p>
            </div>

            <form onSubmit={handleAccessSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <div>
                <label htmlFor="accessKey" className="block text-sm font-medium text-gray-700 mb-2">
                  Setup Access Key
                </label>
                <input
                  type="password"
                  id="accessKey"
                  value={accessKey}
                  onChange={(e) => setAccessKey(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                  placeholder="Enter setup access key"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
              >
                Verify Access
              </button>
            </form>

            <div className="mt-6 text-center">
              <button
                onClick={() => router.push('/admin/login')}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                ← Back to Admin Login
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Admin Setup</h1>
            <div className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-xs font-medium">
              RESTRICTED ACCESS
            </div>
          </div>
          
          <div className="mb-6">
            <p className="text-gray-600 mb-4">
              This page creates the initial admin user for the system. 
              Use this only during initial system setup.
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p><strong>Email:</strong> admin@projevo.com</p>
              <p><strong>Password:</strong> admin123</p>
              <p><strong>Role:</strong> admin</p>
            </div>
          </div>

          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              <h3 className="font-medium">Error:</h3>
              <p>{error}</p>
            </div>
          )}

          {result && (
            <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
              <h3 className="font-medium">Success!</h3>
              <p>Admin user created with UID: {result.user.uid}</p>
              <p>You can now use the admin login page to access the admin dashboard.</p>
            </div>
          )}

          <button
            onClick={handleSetup}
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center mb-4"
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Creating Admin User...
              </>
            ) : (
              'Create Admin User'
            )}
          </button>

          <div className="text-center">
            <a 
              href="/admin/login"
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Go to Admin Login →
            </a>
          </div>

          <div className="mt-8 p-4 bg-red-50 border border-red-200 rounded-lg">
            <h3 className="font-medium text-red-800 mb-2">Production Security Notice:</h3>
            <ul className="text-sm text-red-700 space-y-1">
              <li>• This page should be disabled or removed in production</li>
              <li>• Access is logged and monitored</li>
              <li>• Use only during initial system setup</li>
              <li>• Change default credentials immediately after setup</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
