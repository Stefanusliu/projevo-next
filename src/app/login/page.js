'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import Head from 'next/head';
import { useAuth } from '../../contexts/AuthContext';

export default function Login() {
  const router = useRouter();
  const { user, userProfile, signIn, signInWithGoogle, loading } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isProfileLoading, setIsProfileLoading] = useState(false);
  const [error, setError] = useState('');
  const [loginCompleted, setLoginCompleted] = useState(false);

  // Effect to handle profile loading after login
  useEffect(() => {
    if (loginCompleted && userProfile && userProfile.userType) {
      console.log(`User type found: ${userProfile.userType}`);
      setIsProfileLoading(false);
      setLoginCompleted(false);
      
      if (userProfile.userType === 'vendor') {
        console.log('Redirecting to vendor dashboard...');
        window.location.href = '/dashboard/vendor';
      } else if (userProfile.userType === 'project-owner') {
        console.log('Redirecting to project owner dashboard...');
        window.location.href = '/dashboard/project-owner';
      } else {
        console.log('Unknown user type, redirecting to user type selection...');
        window.location.href = '/select-user-type';
      }
    } else if (loginCompleted && userProfile && !userProfile.userType) {
      console.log('User profile found but no userType, redirecting to user type selection...');
      setIsProfileLoading(false);
      setLoginCompleted(false);
      window.location.href = '/select-user-type';
    }
  }, [loginCompleted, userProfile]);

  // Timeout effect for profile loading
  useEffect(() => {
    if (isProfileLoading) {
      const timeout = setTimeout(() => {
        console.log('Profile loading timeout, redirecting to user type selection...');
        setIsProfileLoading(false);
        setLoginCompleted(false);
        window.location.href = '/select-user-type';
      }, 10000); // 10 second timeout

      return () => clearTimeout(timeout);
    }
  }, [isProfileLoading]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    console.log('Login form submitted with:', { email: formData.email, password: formData.password ? '[HIDDEN]' : 'empty' });
    
    // Basic validation
    if (!formData.email || !formData.password) {
      setError('Please enter both email and password');
      setIsLoading(false);
      return;
    }
    
    try {
      console.log('Attempting to sign in...');
      const result = await signIn(formData.email, formData.password);
      console.log('Sign in result:', result);
      
      // Wait for userProfile to be loaded by AuthContext
      console.log('Login successful, waiting for user profile...');
      setIsProfileLoading(true);
      setLoginCompleted(true);
      
    } catch (error) {
      console.error('Login error:', error);
      
      let errorMessage = 'Failed to sign in. Please check your credentials.';
      
      if (error.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email. Please sign up first.';
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = 'Incorrect password. Please try again.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Please enter a valid email address.';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many failed login attempts. Please try again later.';
      } else if (error.code === 'auth/user-disabled') {
        errorMessage = 'This account has been disabled. Please contact support.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
      // Don't reset profile loading here - let useEffect handle it
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setIsLoading(true);
    
    try {
      await signInWithGoogle();
      console.log('Google login successful, waiting for user profile...');
      setIsProfileLoading(true);
      setLoginCompleted(true);
      
    } catch (error) {
      console.error('Google login error:', error);
      
      let errorMessage = 'Failed to sign in with Google';
      if (error.code === 'auth/popup-closed-by-user') {
        errorMessage = 'Sign-in was cancelled. Please try again.';
      } else if (error.code === 'auth/popup-blocked') {
        errorMessage = 'Popup was blocked. Please allow popups and try again.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
      // Don't reset profile loading here - let useEffect handle it
    }
  };

  // Show loading while auth state is being determined
  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: '#2373FF' }}></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Login - Access Your Projevo Account | Projevo</title>
        <meta 
          name="description" 
          content="Sign in to your Projevo account to manage construction projects, find contractors, submit proposals, and access our platform for project owners and vendors." 
        />
        <meta 
          name="keywords" 
          content="Projevo login, construction platform login, project owner sign in, vendor login, contractor platform access" 
        />
        <meta name="robots" content="noindex, nofollow" />
        <link rel="canonical" href="https://projevo.com/login" />
      </Head>

      <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden bg-gray-50">
        {/* Light Background gradient effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50"></div>
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-full h-full">
          <div className="w-96 h-96 bg-gradient-to-r from-blue-100/60 to-purple-100/60 rounded-full blur-3xl absolute top-20 left-1/4"></div>
          <div className="w-96 h-96 bg-gradient-to-r from-indigo-100/60 to-pink-100/60 rounded-full blur-3xl absolute top-40 right-1/4"></div>
          <div className="w-96 h-96 bg-gradient-to-r from-purple-100/40 to-blue-100/40 rounded-full blur-3xl absolute bottom-20 left-1/3"></div>
        </div>

        <div className="relative max-w-md w-full space-y-8">
          {/* Logo and header */}
          <div className="text-center">
            <Link href="/" className="inline-flex items-center space-x-2 mb-8">
              <Image 
                src="/logo.png" 
                alt="Projevo Logo" 
                width={120}
                height={40}
                className="h-10 w-auto"
              />
            </Link>
            <h2 className="text-3xl font-bold text-gray-900 mb-3">
              Welcome back
            </h2>
            <p className="text-gray-600 mb-8">
              Sign in to your account to continue your project evolution
            </p>
          </div>

          {/* Login card */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
            {/* Error message */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            {/* Profile loading message */}
            {isProfileLoading && (
              <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-blue-600 text-sm">Loading your profile and redirecting to dashboard...</p>
                </div>
              </div>
            )}

            {/* Login form */}
            <form className="space-y-6" onSubmit={handleSubmit}>
              {/* Email field */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email address
                </label>
                <div className="relative">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="Enter your email"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Password field */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <svg className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                      </svg>
                    ) : (
                      <svg className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Remember me and forgot password */}
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="rememberMe"
                    name="rememberMe"
                    type="checkbox"
                    checked={formData.rememberMe}
                    onChange={handleChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 bg-white rounded"
                  />
                  <label htmlFor="rememberMe" className="ml-2 block text-sm text-gray-700">
                    Remember me
                  </label>
                </div>

                <div className="text-sm">
                  <Link href="/forgot-password" className="font-medium text-blue-600 hover:text-blue-500 transition-colors">
                    Forgot password?
                  </Link>
                </div>
              </div>

              {/* Submit button */}
              <div>
                <button
                  type="submit"
                  disabled={isLoading || isProfileLoading}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  style={{ backgroundColor: '#2373FF' }}
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Signing in...</span>
                    </div>
                  ) : isProfileLoading ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Loading profile...</span>
                    </div>
                  ) : (
                    'Sign in to Projevo'
                  )}
                </button>
              </div>
            </form>

            {/* Divider */}
            <div className="my-6 flex items-center">
              <div className="flex-1 border-t border-gray-300"></div>
              <span className="px-4 text-sm text-gray-500">Or continue with</span>
              <div className="flex-1 border-t border-gray-300"></div>
            </div>

            {/* Google login button */}
            <button
              onClick={handleGoogleLogin}
              type="button"
              disabled={isLoading || isProfileLoading}
              className="w-full bg-gray-50 border-2 border-gray-300 hover:border-blue-400 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 shadow-sm hover:shadow-md group disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="flex items-center justify-center space-x-3">
                {isLoading || isProfileLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-gray-600 border-t-transparent rounded-full animate-spin"></div>
                    <span>{isProfileLoading ? 'Loading profile...' : 'Signing in...'}</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    <span>Continue with Google</span>
                  </>
                )}
              </div>
            </button>

            {/* User type info */}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-start space-x-2">
                <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Automatic Role Detection</h4>
                  <p className="text-xs text-gray-600 mt-1">
                    Our system will automatically identify whether you&apos;re a Project Owner or Vendor based on your account.
                  </p>
                </div>
              </div>
            </div>

            {/* Sign up link */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Don&apos;t have an account?{' '}
                <Link href="/signup" className="font-medium text-blue-600 hover:text-blue-500 transition-colors">
                  Sign up for free
                </Link>
              </p>
            </div>
          </div>

          {/* Additional info */}
          <div className="text-center">
            <p className="text-xs text-gray-500">
              By signing in, you agree to our{' '}
              <Link href="/terms" className="underline hover:text-gray-700">
                Terms of Service
              </Link>
              {' '}and{' '}
              <Link href="/privacy" className="underline hover:text-gray-700">
                Privacy Policy
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
