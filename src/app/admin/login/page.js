'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../contexts/AuthContext';
import { doc, updateDoc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../../lib/firebase';

export default function AdminLogin() {
  const router = useRouter();
  const { signIn } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [attemptCount, setAttemptCount] = useState(0);
  const [isBlocked, setIsBlocked] = useState(false);

  // Rate limiting - block after 5 failed attempts
  const MAX_ATTEMPTS = 5;
  const BLOCK_DURATION = 15 * 60 * 1000; // 15 minutes

  const checkRateLimit = () => {
    const storedAttempts = localStorage.getItem('adminLoginAttempts');
    const lastAttempt = localStorage.getItem('lastAdminLoginAttempt');
    
    if (storedAttempts && lastAttempt) {
      const attempts = parseInt(storedAttempts);
      const timeSinceLastAttempt = Date.now() - parseInt(lastAttempt);
      
      if (attempts >= MAX_ATTEMPTS && timeSinceLastAttempt < BLOCK_DURATION) {
        const remainingTime = Math.ceil((BLOCK_DURATION - timeSinceLastAttempt) / 60000);
        setError(`Terlalu banyak percobaan gagal. Coba lagi dalam ${remainingTime} menit.`);
        setIsBlocked(true);
        return false;
      } else if (timeSinceLastAttempt >= BLOCK_DURATION) {
        // Reset attempts after block duration
        localStorage.removeItem('adminLoginAttempts');
        localStorage.removeItem('lastAdminLoginAttempt');
        setAttemptCount(0);
        setIsBlocked(false);
      } else {
        setAttemptCount(attempts);
      }
    }
    return true;
  };

  const recordFailedAttempt = () => {
    const newAttemptCount = attemptCount + 1;
    setAttemptCount(newAttemptCount);
    localStorage.setItem('adminLoginAttempts', newAttemptCount.toString());
    localStorage.setItem('lastAdminLoginAttempt', Date.now().toString());
    
    if (newAttemptCount >= MAX_ATTEMPTS) {
      setIsBlocked(true);
      const remainingTime = Math.ceil(BLOCK_DURATION / 60000);
      setError(`Account temporarily locked due to multiple failed attempts. Try again in ${remainingTime} minutes.`);
    }
  };

  const clearAttempts = () => {
    localStorage.removeItem('adminLoginAttempts');
    localStorage.removeItem('lastAdminLoginAttempt');
    setAttemptCount(0);
    setIsBlocked(false);
  };

  // Security logging function
  const logSecurityEvent = (event, details = {}) => {
    const timestamp = new Date().toISOString();
    const userAgent = navigator.userAgent;
    const ip = 'client-side'; // In production, this would be handled server-side
    
    console.warn(`[SECURITY] ${timestamp} - ${event}`, {
      timestamp,
      event,
      userAgent,
      ip,
      ...details
    });
    
    // In production, this should send to a security monitoring service
    // Example: sendToSecurityMonitoring({ timestamp, event, userAgent, ip, ...details });
  };

  // Check rate limiting on component mount
  useEffect(() => {
    const storedAttempts = localStorage.getItem('adminLoginAttempts');
    const lastAttempt = localStorage.getItem('lastAdminLoginAttempt');
    
    if (storedAttempts && lastAttempt) {
      const attempts = parseInt(storedAttempts);
      const timeSinceLastAttempt = Date.now() - parseInt(lastAttempt);
      
      if (attempts >= MAX_ATTEMPTS && timeSinceLastAttempt < BLOCK_DURATION) {
        const remainingTime = Math.ceil((BLOCK_DURATION - timeSinceLastAttempt) / 60000);
        setError(`Too many failed attempts. Try again in ${remainingTime} minutes.`);
        setIsBlocked(true);
      } else if (timeSinceLastAttempt >= BLOCK_DURATION) {
        // Reset attempts after block duration
        localStorage.removeItem('adminLoginAttempts');
        localStorage.removeItem('lastAdminLoginAttempt');
        setAttemptCount(0);
        setIsBlocked(false);
      } else {
        setAttemptCount(attempts);
      }
    }
  }, [BLOCK_DURATION, MAX_ATTEMPTS]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Security logging
    logSecurityEvent('ADMIN_LOGIN_ATTEMPT', { email: formData.email });
    
    // Check rate limiting
    if (!checkRateLimit() || isBlocked) {
      logSecurityEvent('ADMIN_LOGIN_BLOCKED', { email: formData.email, reason: 'rate_limit' });
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    console.log('Admin login attempt for email:', formData.email);
    
    // Basic validation
    if (!formData.email || !formData.password) {
      setError('Silakan masukkan email dan kata sandi');
      setIsLoading(false);
      logSecurityEvent('ADMIN_LOGIN_FAILED', { email: formData.email, reason: 'incomplete_fields' });
      return;
    }
    
    // Check admin credentials - must use exact admin email
    if (formData.email !== 'admin@projevo.com' || formData.password !== 'admin123') {
      recordFailedAttempt();
      setError('Kredensial admin tidak valid');
      setIsLoading(false);
      logSecurityEvent('ADMIN_LOGIN_FAILED', { 
        email: formData.email, 
        reason: 'invalid_credentials',
        attemptCount: attemptCount + 1
      });
      return;
    }
    
    try {
      // Use the admin email directly from form data
      console.log('Attempting Firebase authentication for admin...');
      
      const result = await signIn(formData.email, formData.password);
      console.log('Admin sign in successful:', result.user.uid);
      
      if (result.user) {
        // Ensure the user has admin role in Firestore
        const userDocRef = doc(db, 'users', result.user.uid);
        const userDoc = await getDoc(userDocRef);
        
        if (userDoc.exists()) {
          const userData = userDoc.data();
          console.log('Admin user data verified');
          
          // Update admin role if not set
          if (userData.role !== 'admin' && !userData.isAdmin) {
            console.log('Setting admin role for user');
            await updateDoc(userDocRef, {
              role: 'admin',
              isAdmin: true,
              lastLogin: new Date(),
              updatedAt: new Date()
            });
          } else {
            // Update last login
            await updateDoc(userDocRef, {
              lastLogin: new Date(),
              updatedAt: new Date()
            });
          }
        } else {
          // Create admin profile if it doesn't exist
          console.log('Creating admin profile');
          await setDoc(userDocRef, {
            uid: result.user.uid,
            email: formData.email,
            displayName: 'Administrator',
            firstName: 'Admin',
            lastName: 'User',
            role: 'admin',
            isAdmin: true,
            userType: 'admin',
            emailVerified: true,
            phoneVerified: true,
            profileComplete: true,
            status: 'active',
            lastLogin: new Date(),
            createdAt: new Date(),
            updatedAt: new Date()
          });
        }
        
        // Clear failed attempts on successful login
        clearAttempts();
        
        // Log successful login
        logSecurityEvent('ADMIN_LOGIN_SUCCESS', { 
          email: formData.email,
          uid: result.user.uid
        });
        
        console.log('Admin login successful, redirecting to admin dashboard...');
        router.push('/admin');
      }
      
    } catch (error) {
      console.error('Admin login error:', error);
      recordFailedAttempt();
      
      logSecurityEvent('ADMIN_LOGIN_ERROR', { 
        email: formData.email,
        error: error.code || error.message,
        attemptCount: attemptCount + 1
      });
      
      if (error.code === 'auth/user-not-found') {
        setError('Kredensial tidak valid. Hubungi administrator sistem jika Anda perlu akses.');
      } else if (error.code === 'auth/wrong-password') {
        setError('Kredensial admin tidak valid');
      } else if (error.code === 'auth/invalid-credential') {
        setError('Kredensial admin tidak valid');
      } else if (error.code === 'auth/too-many-requests') {
        setError('Terlalu banyak percobaan gagal. Silakan coba lagi nanti.');
      } else {
        setError('Autentikasi gagal. Silakan coba lagi.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20"></div>
        <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute top-0 -right-4 w-72 h-72 bg-yellow-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Login Card */}
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/20 overflow-hidden">
          {/* Header Section */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-8 text-center relative">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="relative z-10">
              {/* Admin Icon */}
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-4 border border-white/30">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-white mb-2">Portal Admin</h1>
              <p className="text-blue-100 text-sm">Akses Administrator Aman</p>
            </div>
          </div>

          {/* Form Section */}
          <div className="px-8 py-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-md">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-red-700">{error}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Email Field */}
              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700">
                  Alamat Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                    </svg>
                  </div>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-gray-50 focus:bg-white text-gray-900 placeholder-gray-500"
                    placeholder="Masukkan alamat email admin"
                    required
                    autoComplete="email"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <label htmlFor="password" className="block text-sm font-semibold text-gray-700">
                  Kata Sandi
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-gray-50 focus:bg-white text-gray-900 placeholder-gray-500"
                    placeholder="Masukkan kata sandi admin"
                    required
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? (
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                      </svg>
                    ) : (
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading || isBlocked}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:transform-none disabled:hover:shadow-lg"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Authenticating...</span>
                  </>
                ) : isBlocked ? (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    <span>Akun Terkunci</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Akses Panel Admin</span>
                  </>
                )}
              </button>
            </form>

            {/* Footer Links */}
            <div className="mt-8 pt-6 border-t border-gray-200 text-center space-y-3">
              <button
                onClick={() => router.push('/')}
                className="text-sm text-gray-600 hover:text-blue-600 transition-colors font-medium"
              >
                ← Kembali ke Situs Utama
              </button>
              
              <div className="text-xs text-gray-500">
                <p>Hanya akses administrator</p>
                <p>Akses tidak sah dilarang dan dipantau</p>
              </div>
            </div>
          </div>
        </div>

        {/* Security Notice */}
        <div className="mt-6 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-300" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-medium text-white mb-2">
                Pemberitahuan Keamanan
              </h3>
              <div className="text-sm text-gray-300 space-y-1">
                <p>Sistem ini hanya untuk administrator yang berwenang.</p>
                <p>Semua upaya akses dicatat dan dipantau.</p>
                <p>Hanya alamat email admin yang ditentukan yang diizinkan.</p>
                <p className="text-xs text-gray-400 mt-2">
                  Jika Anda memerlukan akses, hubungi administrator sistem Anda.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Custom CSS for blob animation */}
      <style jsx>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}
