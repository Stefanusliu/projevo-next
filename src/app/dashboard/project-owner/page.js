"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from '../../../contexts/AuthContext';
import Tender from "./main-content/Tender";
import HomePage from "./main-content/HomePage";
import Profile from "./main-content/Profile";
import ProtectedRoute from "../../../components/auth/ProtectedRoute";
import Avatar from "../../../components/ui/Avatar";
import { 
  FiHome, 
  FiSearch, 
  FiBell, 
  FiMail 
} from 'react-icons/fi';

// Note: For client components, we'll handle SEO with next/head
import Head from 'next/head';

function ProjectOwnerDashboardContent() {
  const { user, userProfile } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("All Locations");
  const [activeView, setActiveView] = useState("home"); // Default to home page

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
            <div className="flex justify-between items-center py-2">
              {/* Logo */}
              <div className="flex items-center">
                <Link href="/" className="flex items-center space-x-2">
                  <Image 
                    src="/logo.png" 
                    alt="Projevo Logo" 
                    width={100}
                    height={32}
                    className="h-8 w-auto"
                  />
                </Link>
              </div>

              {/* Top Menu */}
              <nav className="hidden md:flex items-center space-x-6">
                <Link
                  href="/how-it-works"
                  className="text-white font-medium transition-colors hover:text-blue-400"
                  onMouseEnter={(e) => e.target.style.color = '#2373FF'}
                  onMouseLeave={(e) => e.target.style.color = ''}
                >
                  How it Works?
                </Link>
                <Link
                  href="/boq-maker"
                  className="text-white font-medium transition-colors hover:text-blue-400"
                  onMouseEnter={(e) => e.target.style.color = '#2373FF'}
                  onMouseLeave={(e) => e.target.style.color = ''}
                >
                  BOQ Generator
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
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center flex-1">
                <button
                  onClick={() => setActiveView("tender")}
                  className="px-4 py-2 rounded-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 mr-3 text-white"
                  style={{ backgroundColor: '#2373FF' }}
                >
                  Tender
                </button>
                <button
                  onClick={() => setActiveView("home")}
                  className="p-2 rounded-full transition-colors mr-3 text-white"
                  style={{ backgroundColor: '#2373FF' }}
                >
                  <FiHome className="w-5 h-5" />
                </button>
                <div className="flex items-center flex-1 mr-4">
                  <div className="relative flex-1 flex items-center bg-white border border-gray-300 rounded-lg shadow-md">
                    <input
                      type="text"
                      placeholder="Find Contractor"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="flex-1 px-3 py-2 bg-transparent border-0 rounded-l-lg text-black placeholder-gray-500 focus:outline-none focus:ring-0"
                    />
                    <select
                      value={selectedLocation}
                      onChange={(e) => setSelectedLocation(e.target.value)}
                      className="px-3 py-2 bg-transparent border-0 border-l border-gray-300 text-black focus:outline-none focus:ring-0 min-w-[150px]"
                    >
                      {locations.map((location) => (
                        <option key={location} value={location}>
                          {location}
                        </option>
                      ))}
                    </select>
                    <button 
                      className="p-2 text-gray-500 hover:text-gray-700 rounded-r-lg transition-colors border-l border-gray-300"
                    >
                      <FiSearch className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
              <div className="flex items-center">
                <button 
                  className="p-2 rounded-full text-white transition-colors relative mr-2"
                  style={{ backgroundColor: '#2373FF' }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#1a5ce6'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = '#2373FF'}
                >
                  <FiBell className="w-4 h-4" />
                  <span 
                    className="absolute -top-1 -right-1 w-4 h-4 text-white text-xs rounded-full flex items-center justify-center"
                    style={{ backgroundColor: '#2373FF' }}
                  >
                    3
                  </span>
                </button>
                <button 
                  className="p-2 rounded-full text-white transition-colors relative mr-3"
                  style={{ backgroundColor: '#2373FF' }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#1a5ce6'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = '#2373FF'}
                >
                  <FiMail className="w-4 h-4" />
                  <span 
                    className="absolute -top-1 -right-1 w-4 h-4 text-white text-xs rounded-full flex items-center justify-center"
                    style={{ backgroundColor: '#2373FF' }}
                  >
                    7
                  </span>
                </button>
                <button 
                  onClick={() => setActiveView("profile")}
                  className="rounded-full transition-all duration-200 transform hover:scale-105"
                >
                  <Avatar
                    src={userProfile?.photoURL || user?.photoURL}
                    alt="Profile"
                    name={userProfile?.displayName || user?.displayName || `${userProfile?.firstName || ''} ${userProfile?.lastName || ''}`.trim()}
                    size={36}
                    className="hover:ring-2 hover:ring-blue-300"
                  />
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
