'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'next/navigation';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, userProfile, logout } = useAuth();
  const router = useRouter();

  // Function to determine the correct dashboard URL based on user type
  const getDashboardUrl = () => {
    if (!userProfile?.userType) return '/dashboard';
    
    switch (userProfile.userType.toLowerCase()) {
      case 'vendor':
      case 'contractor':
        return '/dashboard/vendor';
      case 'project-owner':
      case 'project_owner':
        return '/dashboard/project-owner';
      case 'admin':
      case 'administrator':
        return '/admin';
      default:
        return '/dashboard';
    }
  };

  const handleProfileClick = () => {
    const dashboardUrl = getDashboardUrl();
    router.push(dashboardUrl);
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <header className="relative z-50 bg-black border-b border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <div className="flex items-center">
            <div className="flex items-center space-x-3">
              <Image 
                src="/logo-white.png" 
                alt="Projevo Logo" 
                width={120} 
                height={80}
                className="rounded-lg"
              />
              <span className="text-2xl font-bold text-white">
                Projevo
              </span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#how-it-works" className="text-white hover:text-blue-400 transition-colors font-medium">
              How it Works?
            </a>
            <Link href="/contact" className="text-white hover:text-blue-400 transition-colors font-medium">
              Contact Us
            </Link>
            <a href="#about-us" className="text-white hover:text-blue-400 transition-colors font-medium">
              About Us
            </a>
          </nav>

          {/* Desktop CTA Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              /* User is logged in - show profile button and logout */
              <div className="flex items-center space-x-3">
                <button
                  onClick={handleProfileClick}
                  className="flex items-center space-x-2 text-white hover:text-blue-400 transition-colors"
                  title={`Go to ${userProfile?.userType || 'User'} Dashboard`}
                >
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                    {userProfile?.photoURL ? (
                      <img 
                        src={userProfile.photoURL} 
                        alt="Profile" 
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    )}
                  </div>
                  <span className="font-medium">
                    {userProfile?.displayName || userProfile?.firstName || 'Dashboard'}
                  </span>
                </button>
                <button
                  onClick={handleLogout}
                  className="text-gray-300 hover:text-white transition-colors"
                  title="Logout"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </button>
              </div>
            ) : (
              /* User is not logged in - show login/signup buttons */
              <>
                <Link href="/login" className="text-white hover:text-blue-400 font-medium">
                  Sign In
                </Link>
                <Link href="/signup" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl">
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 rounded-lg text-white hover:bg-gray-800"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden pb-4 border-t border-gray-700 mt-4 pt-4">
            <div className="flex flex-col space-y-4">
              <a href="#how-it-works" className="text-white hover:text-blue-400 font-medium">
                How it Works?
              </a>
              <Link href="/contact" className="text-white hover:text-blue-400 font-medium">
                Contact Us
              </Link>
              <a href="#about-us" className="text-white hover:text-blue-400 font-medium">
                About Us
              </a>
              <div className="flex flex-col space-y-2 pt-4 border-t border-gray-700">
                {user ? (
                  /* User is logged in - show profile and logout */
                  <>
                    <button
                      onClick={handleProfileClick}
                      className="flex items-center space-x-3 text-left text-white hover:text-blue-400 font-medium p-2 rounded-lg hover:bg-gray-800 transition-colors"
                    >
                      <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                        {userProfile?.photoURL ? (
                          <img 
                            src={userProfile.photoURL} 
                            alt="Profile" 
                            className="w-8 h-8 rounded-full object-cover"
                          />
                        ) : (
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        )}
                      </div>
                      <div>
                        <div className="font-medium">
                          {userProfile?.displayName || userProfile?.firstName || 'Dashboard'}
                        </div>
                        <div className="text-sm text-gray-400">
                          {userProfile?.userType || 'User'}
                        </div>
                      </div>
                    </button>
                    <button
                      onClick={handleLogout}
                      className="text-left text-gray-300 hover:text-white font-medium p-2 rounded-lg hover:bg-gray-800 transition-colors"
                    >
                      Sign Out
                    </button>
                  </>
                ) : (
                  /* User is not logged in - show login/signup */
                  <>
                    <Link href="/login" className="text-left text-white hover:text-blue-400 font-medium">
                      Sign In
                    </Link>
                    <Link href="/signup" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-all duration-200 font-medium shadow-lg text-center">
                      Sign Up
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
