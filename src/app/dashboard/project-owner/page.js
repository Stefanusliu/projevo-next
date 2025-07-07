"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from '../../../contexts/AuthContext';
import Tender from "./main-content/Tender";
import HomePage from "./main-content/HomePage";
import Profile from "./main-content/Profile";
import ProtectedRoute from "../../../components/auth/ProtectedRoute";

// Note: For client components, we'll handle SEO with next/head
import Head from 'next/head';

function ProjectOwnerDashboardContent() {
  const { user, userProfile } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("All Locations");
  const [activeView, setActiveView] = useState("tender"); // Add state for active view

  const locations = [
    "All Locations",
    "Jakarta Selatan",
    "Jakarta Pusat",
    "Jakarta Barat",
    "Jakarta Utara",
    "Jakarta Timur",
    "Depok",
    "Tangerang",
    "Bekasi",
    "Bogor",
  ];

  return (
    <>
      <Head>
        <title>Project Owner Dashboard - Manage Your Projects | Projevo</title>
        <meta 
          name="description" 
          content="Manage your construction and design projects, find qualified vendors, create tenders, and track project progress on Projevo's Project Owner Dashboard." 
        />
        <meta 
          name="keywords" 
          content="project owner dashboard, construction project management, find contractors, tender management, project tracking, vendor selection" 
        />
        <meta name="robots" content="noindex, nofollow" />
        <link rel="canonical" href="https://projevo.com/dashboard/project-owner" />
      </Head>
      
      <div className="min-h-screen" style={{ backgroundColor: '#d9d9d9' }}>
        {/* Top Header with Logo and Menu - Flat Black */}
        <header className="bg-black shadow-sm border-b border-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              {/* Logo */}
              <div className="flex items-center">
                <Link href="/" className="flex items-center space-x-2">
                  <Image 
                    src="/logo.png" 
                    alt="Projevo Logo" 
                    width={120}
                    height={40}
                    className="h-10 w-auto"
                  />
                </Link>
              </div>

              {/* Top Menu */}
              <nav className="hidden md:flex items-center space-x-8">
                <Link
                  href="/how-it-works"
                  className="text-white font-medium transition-colors hover:text-blue-400"
                  onMouseEnter={(e) => e.target.style.color = '#2373FF'}
                  onMouseLeave={(e) => e.target.style.color = ''}
                >
                  How it Works?
                </Link>
                <Link
                  href="/contact"
                  className="text-white font-medium transition-colors hover:text-blue-400"
                  onMouseEnter={(e) => e.target.style.color = '#2373FF'}
                  onMouseLeave={(e) => e.target.style.color = ''}
                >
                  Contact Us
                </Link>
                <Link
                  href="/about"
                  className="text-white font-medium transition-colors hover:text-blue-400"
                  onMouseEnter={(e) => e.target.style.color = '#2373FF'}
                  onMouseLeave={(e) => e.target.style.color = ''}
                >
                  About Us
                </Link>
                <Link
                  href="/partners"
                  className="text-white font-medium transition-colors hover:text-blue-400"
                  onMouseEnter={(e) => e.target.style.color = '#2373FF'}
                  onMouseLeave={(e) => e.target.style.color = ''}
                >
                  Partners
                </Link>
                <Link
                  href="/promotions"
                  className="text-white font-medium transition-colors hover:text-blue-400"
                  onMouseEnter={(e) => e.target.style.color = '#2373FF'}
                  onMouseLeave={(e) => e.target.style.color = ''}
                >
                  Promotions
                </Link>
              </nav>
            </div>
          </div>
        </header>

        {/* Secondary Header with Actions - White Background */}
        <div className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between py-4">
              <div className="flex items-center flex-1">
                <button
                  onClick={() => setActiveView("tender")}
                  className={`px-6 py-2.5 rounded-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 mr-4 ${
                    activeView === "tender"
                      ? "text-white shadow-lg hover:shadow-xl"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                  style={activeView === "tender" ? { backgroundColor: '#2373FF' } : {}}
                >
                  Tender
                </button>
                <button
                  onClick={() => setActiveView("home")}
                  className="p-2.5 rounded-full transition-colors mr-4 text-white"
                  style={{ backgroundColor: '#2373FF' }}
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                    />
                  </svg>
                </button>
                <div className="flex items-center flex-1 mr-6">
                  <div className="relative flex-1 flex items-center bg-white border border-gray-300 rounded-lg shadow-md">
                    <input
                      type="text"
                      placeholder="Find Contractor"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="flex-1 px-4 py-2.5 bg-transparent border-0 rounded-l-lg text-black placeholder-gray-500 focus:outline-none focus:ring-0"
                    />
                    <select
                      value={selectedLocation}
                      onChange={(e) => setSelectedLocation(e.target.value)}
                      className="px-4 py-2.5 bg-transparent border-0 border-l border-gray-300 text-black focus:outline-none focus:ring-0 min-w-[150px]"
                    >
                      {locations.map((location) => (
                        <option key={location} value={location}>
                          {location}
                        </option>
                      ))}
                    </select>
                    <button 
                      className="p-2.5 text-gray-500 hover:text-gray-700 rounded-r-lg transition-colors border-l border-gray-300"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
              <div className="flex items-center">
                <button 
                  className="p-2.5 rounded-full text-white transition-colors relative mr-3"
                  style={{ backgroundColor: '#2373FF' }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#1a5ce6'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = '#2373FF'}
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                    />
                  </svg>
                  <span 
                    className="absolute -top-1 -right-1 w-5 h-5 text-white text-xs rounded-full flex items-center justify-center"
                    style={{ backgroundColor: '#2373FF' }}
                  >
                    3
                  </span>
                </button>
                <button 
                  className="p-2.5 rounded-full text-white transition-colors relative mr-4"
                  style={{ backgroundColor: '#2373FF' }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#1a5ce6'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = '#2373FF'}
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                  <span 
                    className="absolute -top-1 -right-1 w-5 h-5 text-white text-xs rounded-full flex items-center justify-center"
                    style={{ backgroundColor: '#2373FF' }}
                  >
                    7
                  </span>
                </button>
                <button 
                  onClick={() => setActiveView("profile")}
                  className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 transform hover:scale-105 overflow-hidden"
                  style={{ backgroundColor: '#2373FF' }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#1a5ce6'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = '#2373FF'}
                >
                  {userProfile?.photoURL || user?.photoURL ? (
                    <Image 
                      src={userProfile?.photoURL || user?.photoURL} 
                      alt="Profile" 
                      width={40}
                      height={40}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-white text-sm font-medium">
                      {userProfile?.firstName && userProfile?.lastName 
                        ? `${userProfile.firstName.charAt(0)}${userProfile.lastName.charAt(0)}`
                        : userProfile?.displayName
                        ? userProfile.displayName.charAt(0).toUpperCase()
                        : user?.displayName
                        ? user.displayName.charAt(0).toUpperCase()
                        : 'U'
                      }
                    </span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        {activeView === "tender" ? <Tender /> : activeView === "profile" ? <Profile /> : <HomePage />}
      </div>
    </>
  );
}

export default function ProjectOwnerDashboard() {
  return (
    <ProtectedRoute requiredUserType="project-owner">
      <ProjectOwnerDashboardContent />
    </ProtectedRoute>
  );
}
