'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from './Sidebar';
import { MdSecurity, MdNotifications, MdKeyboardArrowDown, MdLogout, MdPerson } from 'react-icons/md';
import { useAuth } from '../../../contexts/AuthContext';

export default function DashboardLayout({ children, activeTab, setActiveTab }) {
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const { logout } = useAuth();
  const router = useRouter();
  const dropdownRef = useRef(null);

  const handleSignOut = async () => {
    try {
      console.log('Admin signing out...');
      await logout();
      console.log('Admin signed out successfully, redirecting to login...');
      router.push('/admin/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowProfileDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Admin Header */}
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <MdSecurity className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">Admin Dashboard</h1>
                <p className="text-sm text-slate-600">Project Management & Review</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <div className="relative">
                <button className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
                  <div className="relative">
                    <MdNotifications className="w-6 h-6" />
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      3
                    </span>
                  </div>
                </button>
              </div>

              {/* Admin Profile Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                  className="flex items-center space-x-3 p-2 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-medium">A</span>
                  </div>
                  <div className="hidden sm:block text-left">
                    <p className="text-sm font-medium text-slate-900">Admin User</p>
                    <p className="text-xs text-slate-600">admin@projevo.com</p>
                  </div>
                  <MdKeyboardArrowDown className={`w-4 h-4 text-slate-400 transition-transform ${showProfileDropdown ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Menu */}
                {showProfileDropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-slate-200 py-2 z-50">
                    <div className="px-4 py-2 border-b border-slate-200">
                      <p className="text-sm font-medium text-slate-900">Admin User</p>
                      <p className="text-xs text-slate-600">admin@projevo.com</p>
                    </div>
                    
                    <button
                      onClick={() => {
                        setShowProfileDropdown(false);
                        // Add profile management functionality here if needed
                      }}
                      className="w-full flex items-center px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 transition-colors"
                    >
                      <MdPerson className="w-4 h-4 mr-3" />
                      Profile Settings
                    </button>
                    
                    <button
                      onClick={() => {
                        setShowProfileDropdown(false);
                        handleSignOut();
                      }}
                      className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <MdLogout className="w-4 h-4 mr-3" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Left Sidebar Menu */}
          <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

          {/* Main Content Area */}
          <div className="flex-1">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
