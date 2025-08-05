"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from '../../../contexts/AuthContext';
import Avatar from "../../../components/ui/Avatar";
import ProjectMarketplace from "./main-content/ProjectMarketplace";
import HomePage from "./main-content/HomePage";
import Profile from "./main-content/Profile";
import ProtectedRoute from "../../../components/auth/ProtectedRoute";
import { 
  FiHome, 
  FiSearch, 
  FiBell, 
  FiMail 
} from 'react-icons/fi';

// Note: For client components, we'll handle SEO with next/head
import Head from 'next/head';

function VendorDashboardContent() {
  const { user, userProfile } = useAuth();
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("All Locations");
  
  // Initialize activeView from URL parameter or default to "projects"
  const [activeView, setActiveView] = useState(() => {
    const tab = searchParams.get('tab');
    return tab === 'profile' ? 'profile' : 'projects';
  });

  // Update activeView when URL parameters change
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab === 'profile') {
      setActiveView('profile');
    }
  }, [searchParams]);

  // Get display name from userProfile or user
  const displayName = userProfile?.displayName || user?.displayName || `${userProfile?.firstName || ''} ${userProfile?.lastName || ''}`.trim() || 'User';
  const userType = userProfile?.userType || 'Vendor';

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
        <title>Vendor Dashboard - Find Projects & Submit Proposals | Projevo</title>
        <meta 
          name="description" 
          content="Browse construction and design projects, submit proposals, track your bids, and grow your business on Projevo's Vendor Dashboard. Find your next project opportunity." 
        />
        <meta 
          name="keywords" 
          content="vendor dashboard, construction projects, contractor marketplace, submit proposals, project bidding, vendor opportunities" 
        />
        <meta name="robots" content="noindex, nofollow" />
        <link rel="canonical" href="https://projevo.com/dashboard/vendor" />
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
            <div className="flex items-center justify-between py-4">
              <div className="flex items-center flex-1">
                <button
                  onClick={() => setActiveView("projects")}
                  className="px-6 py-2.5 rounded-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 mr-4 text-white"
                  style={{ backgroundColor: '#2373FF' }}
                >
                  Tender
                </button>
                <button
                  onClick={() => setActiveView("home")}
                  className="p-2.5 rounded-full transition-colors mr-4 text-white"
                  style={{ backgroundColor: '#2373FF' }}
                >
                  <FiHome className="w-6 h-6" />
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
                      <FiSearch className="w-5 h-5" />
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
                  <FiBell className="w-5 h-5" />
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
                  <FiMail className="w-5 h-5" />
                  <span 
                    className="absolute -top-1 -right-1 w-5 h-5 text-white text-xs rounded-full flex items-center justify-center"
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
                    name={displayName}
                    size={40}
                    className="hover:ring-2 hover:ring-blue-300"
                  />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        {activeView === "projects" ? <ProjectMarketplace /> : activeView === "profile" ? <Profile /> : <HomePage />}
      </div>
    </>
  );
}

export default function VendorDashboard() {
  return (
    <ProtectedRoute requiredUserType="vendor">
      <VendorDashboardContent />
    </ProtectedRoute>
  );
}
