"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from '../../../contexts/AuthContext';
import { db } from '../../../lib/firebase';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import Tender from "./main-content/Tender";
import HomePage from "./main-content/HomePage";
import Profile from "./main-content/Profile";
import ProtectedRoute from "../../../components/auth/ProtectedRoute";
import Avatar from "../../../components/ui/Avatar";
import { 
  FiHome, 
  FiSearch, 
  FiBell, 
  FiMail,
  FiUser,
  FiMapPin,
  FiPhone,
  FiMail as FiEmail,
  FiBriefcase,
  FiX,
  FiExternalLink
} from 'react-icons/fi';

// Note: For client components, we'll handle SEO with next/head
import Head from 'next/head';

function ProjectOwnerDashboardContent() {
  const { user, userProfile } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("Semua Lokasi");
  const [activeView, setActiveView] = useState("home"); // Default to home page
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [showPortfolioModal, setShowPortfolioModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const locations = [
    "Semua Lokasi",
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

  // Search function to find contractors and project owners
  const performSearch = useCallback(async () => {
    if (!searchQuery.trim() || !user) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    setIsSearching(true);
    try {
      const usersRef = collection(db, 'users');
      const searchTerms = searchQuery.toLowerCase().split(' ').filter(term => term.length > 0);
      
      // We'll search for users and collect results
      const allResults = [];
      
      // Search in users collection
      const usersQuery = query(usersRef, orderBy('displayName'));
      const usersSnapshot = await getDocs(usersQuery);
      
      usersSnapshot.forEach((doc) => {
        const userData = doc.data();
        const userId = doc.id;
        
        // Skip current user
        if (user?.uid && userId === user.uid) return;
        
        // Skip administrators from search results
        if (userData.userType && userData.userType.toLowerCase().includes('admin')) {
          return;
        }
        
        // Create searchable text from user data
        const searchableText = [
          userData.displayName,
          userData.firstName,
          userData.lastName,
          userData.email,
          userData.company,
          userData.companyName,
          userData.specialization,
          userData.userType,
          userData.accountType,
          userData.city,
          userData.province,
          userData.location,
          userData.skills?.join(' '),
          userData.industry
        ].filter(Boolean).join(' ').toLowerCase();
        
        // Check if any search term matches
        const matchFound = searchTerms.some(term => 
          searchableText.includes(term)
        );
        
        // Apply location filter if specified
        let locationMatch = true;
        if (selectedLocation !== "Semua Lokasi") {
          const userLocation = [
            userData.city,
            userData.province,
            userData.location
          ].filter(Boolean).join(' ').toLowerCase();
          
          locationMatch = userLocation.includes(selectedLocation.toLowerCase());
        }
        
        if (matchFound && locationMatch) {
          allResults.push({
            id: userId,
            type: userData.userType === 'vendor' ? 'vendor' : 'project-owner',
            name: userData.displayName || 
                  (userData.accountType === 'perusahaan' ? userData.company || userData.companyName : 
                   `${userData.firstName || ''} ${userData.lastName || ''}`.trim()) || 
                  userData.email?.split('@')[0] || 'Unknown User',
            email: userData.email,
            phone: userData.phone || userData.phoneNumber,
            company: userData.company || userData.companyName,
            specialization: userData.specialization,
            location: userData.city && userData.province ? 
                     `${userData.city}, ${userData.province}` : 
                     userData.location || 'Location not specified',
            userType: userData.userType || 'user',
            accountType: userData.accountType,
            avatar: userData.photoURL,
            experience: userData.experience || userData.yearsOfExperience,
            skills: userData.skills || [],
            rating: userData.rating || 0,
            projectsCompleted: userData.projectsCompleted || 0,
            verified: userData.verified || false
          });
        }
      });
      
      // Sort results: vendors first, then project owners
      allResults.sort((a, b) => {
        if (a.type === 'vendor' && b.type !== 'vendor') return -1;
        if (a.type !== 'vendor' && b.type === 'vendor') return 1;
        return a.name.localeCompare(b.name);
      });
      
      setSearchResults(allResults);
      setShowSearchResults(true);
      
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, [searchQuery, selectedLocation, user?.uid]);

  // Handle search input changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery.trim()) {
        performSearch();
      } else {
        setSearchResults([]);
        setShowSearchResults(false);
      }
    }, 300); // Debounce search

    return () => clearTimeout(timeoutId);
  }, [searchQuery, selectedLocation]);

  // Handle search button click
  const handleSearchClick = () => {
    performSearch();
  };

  // Handle clicking outside search results to close them
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.search-container')) {
        setShowSearchResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Contact handler
  const handleContact = (person, method) => {
    if (method === 'email' && person.email) {
      window.open(`mailto:${person.email}`, '_blank');
    } else if (method === 'phone' && person.phone) {
      window.open(`tel:${person.phone}`, '_blank');
    } else if (method === 'whatsapp' && person.phone) {
      const cleanPhone = person.phone.replace(/\D/g, '').replace(/^62/, '');
      window.open(`https://wa.me/62${cleanPhone}`, '_blank');
    }
  };

  // Handle user click based on type
  const handleUserClick = (person) => {
    setSelectedUser(person);
    if (person.type === 'vendor') {
      setShowPortfolioModal(true);
    } else if (person.type === 'project-owner') {
      setShowHistoryModal(true);
    }
  };

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
                    src="/logo-white.png" 
                    alt="Projevo Logo" 
                    width={120}
                    height={30}
                    className="w-full h-auto max-w-[70px] object-contain"
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
                  Bagaimana Cara Kerjanya?
                </Link>
                <Link
                  href="/boq-maker"
                  className="text-white font-medium transition-colors hover:text-blue-400"
                  onMouseEnter={(e) => e.target.style.color = '#2373FF'}
                  onMouseLeave={(e) => e.target.style.color = ''}
                >
                  BOQ Studio
                </Link>
                <Link
                  href="/contact"
                  className="text-white font-medium transition-colors hover:text-blue-400"
                  onMouseEnter={(e) => e.target.style.color = '#2373FF'}
                  onMouseLeave={(e) => e.target.style.color = ''}
                >
                  Hubungi Kami
                </Link>
                <Link
                  href="/about"
                  className="text-white font-medium transition-colors hover:text-blue-400"
                  onMouseEnter={(e) => e.target.style.color = '#2373FF'}
                  onMouseLeave={(e) => e.target.style.color = ''}
                >
                  Tentang Kami
                </Link>
                <Link
                  href="/partners"
                  className="text-white font-medium transition-colors hover:text-blue-400"
                  onMouseEnter={(e) => e.target.style.color = '#2373FF'}
                  onMouseLeave={(e) => e.target.style.color = ''}
                >
                  Mitra
                </Link>
                <Link
                  href="/promotions"
                  className="text-white font-medium transition-colors hover:text-blue-400"
                  onMouseEnter={(e) => e.target.style.color = '#2373FF'}
                  onMouseLeave={(e) => e.target.style.color = ''}
                >
                  Promosi
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
                  <div className="relative flex-1 flex items-center bg-white border border-gray-300 rounded-lg shadow-md search-container">
                    <input
                      type="text"
                      placeholder="Cari Kontraktor"
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
                      onClick={handleSearchClick}
                      disabled={isSearching}
                      className="p-2 text-gray-500 hover:text-gray-700 rounded-r-lg transition-colors border-l border-gray-300 disabled:opacity-50"
                    >
                      <FiSearch className="w-4 h-4" />
                    </button>
                    
                    {/* Search Results Dropdown */}
                    {showSearchResults && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
                        {isSearching ? (
                          <div className="p-4 text-center text-gray-500">
                            <FiSearch className="w-5 h-5 animate-spin mx-auto mb-2" />
                            Mencari...
                          </div>
                        ) : searchResults.length > 0 ? (
                          <>
                            <div className="p-3 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
                              <span className="text-sm font-medium text-gray-700">
                                Ditemukan {searchResults.length} hasil
                              </span>
                              <button
                                onClick={() => setShowSearchResults(false)}
                                className="text-gray-400 hover:text-gray-600"
                              >
                                <FiX className="w-4 h-4" />
                              </button>
                            </div>
                            <div className="max-h-80 overflow-y-auto">
                              {searchResults.map((person) => (
                                <div 
                                  key={person.id} 
                                  className="p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer"
                                  onClick={() => handleUserClick(person)}
                                >
                                  <div className="flex items-start gap-3">
                                    <div className="flex-shrink-0">
                                      {person.avatar ? (
                                        <img 
                                          src={person.avatar} 
                                          alt={person.name}
                                          className="w-10 h-10 rounded-full object-cover"
                                        />
                                      ) : (
                                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                          <FiUser className="w-5 h-5 text-blue-600" />
                                        </div>
                                      )}
                                    </div>
                                    
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center gap-2 mb-1">
                                        <h4 className="text-sm font-semibold text-gray-900 truncate">
                                          {person.name}
                                        </h4>
                                        <span className={`px-2 py-1 text-xs rounded-full ${
                                          person.type === 'vendor' 
                                            ? 'bg-green-100 text-green-700' 
                                            : 'bg-blue-100 text-blue-700'
                                        }`}>
                                          {person.type === 'vendor' ? 'Vendor' : 'Pemilik Proyek'}
                                        </span>
                                        {person.verified && (
                                          <span className="text-green-500">
                                            ✓
                                          </span>
                                        )}
                                      </div>
                                      
                                      {person.company && (
                                        <div className="flex items-center gap-1 mb-1">
                                          <FiBriefcase className="w-3 h-3 text-gray-400" />
                                          <span className="text-xs text-gray-600 truncate">{person.company}</span>
                                        </div>
                                      )}
                                      
                                      {person.specialization && (
                                        <p className="text-xs text-gray-600 mb-1 truncate">{person.specialization}</p>
                                      )}
                                      
                                      <div className="flex items-center gap-1 mb-2">
                                        <FiMapPin className="w-3 h-3 text-gray-400" />
                                        <span className="text-xs text-gray-500 truncate">{person.location}</span>
                                      </div>
                                      
                                      {person.type === 'vendor' && (
                                        <div className="flex items-center gap-4 text-xs text-gray-500 mb-2">
                                          {person.experience && (
                                            <span>{person.experience} pengalaman</span>
                                          )}
                                          {person.projectsCompleted > 0 && (
                                            <span>{person.projectsCompleted} proyek</span>
                                          )}
                                          {person.rating > 0 && (
                                            <span>★ {person.rating}/5</span>
                                          )}
                                        </div>
                                      )}
                                      
                                      <div className="flex gap-2 mt-2">
                                        {person.email && (
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleContact(person, 'email');
                                            }}
                                            className="flex items-center gap-1 px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                                          >
                                            <FiEmail className="w-3 h-3" />
                                            Email
                                          </button>
                                        )}
                                        {person.phone && (
                                          <>
                                            <button
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                handleContact(person, 'phone');
                                              }}
                                              className="flex items-center gap-1 px-2 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
                                            >
                                              <FiPhone className="w-3 h-3" />
                                              Telepon
                                            </button>
                                            <button
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                handleContact(person, 'whatsapp');
                                              }}
                                              className="flex items-center gap-1 px-2 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
                                            >
                                              <FiExternalLink className="w-3 h-3" />
                                              WhatsApp
                                            </button>
                                          </>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </>
                        ) : (
                          <div className="p-4 text-center text-gray-500">
                            <FiUser className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                            <p className="text-sm">Tidak ada kontraktor atau pemilik proyek ditemukan</p>
                            <p className="text-xs text-gray-400 mt-1">Coba kata kunci atau lokasi yang berbeda</p>
                          </div>
                        )}
                      </div>
                    )}
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

        {/* Portfolio Modal for Vendors */}
        {showPortfolioModal && selectedUser && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg max-w-4xl w-full m-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b">
                <h2 className="text-xl font-bold text-gray-900">
                  {selectedUser.name} - Portfolio
                </h2>
                <button
                  onClick={() => {
                    setShowPortfolioModal(false);
                    setSelectedUser(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <FiX className="w-6 h-6" />
                </button>
              </div>
              <div className="p-6">
                <div className="flex items-center gap-4 mb-6">
                  {selectedUser.avatar ? (
                    <img 
                      src={selectedUser.avatar} 
                      alt={selectedUser.name}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                      <FiUser className="w-8 h-8 text-blue-600" />
                    </div>
                  )}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{selectedUser.name}</h3>
                    {selectedUser.company && (
                      <p className="text-gray-600">{selectedUser.company}</p>
                    )}
                    {selectedUser.specialization && (
                      <p className="text-gray-500 text-sm">{selectedUser.specialization}</p>
                    )}
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                      <span><FiMapPin className="inline w-4 h-4 mr-1" />{selectedUser.location}</span>
                      {selectedUser.experience && (
                        <span>{selectedUser.experience} experience</span>
                      )}
                      {selectedUser.projectsCompleted > 0 && (
                        <span>{selectedUser.projectsCompleted} projects</span>
                      )}
                      {selectedUser.rating > 0 && (
                        <span>★ {selectedUser.rating}/5</span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="text-center py-12 text-gray-500">
                  <FiBriefcase className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <h4 className="text-lg font-medium mb-2">Portfolio Not Available</h4>
                  <p className="text-sm">Portfolio details are not available in this view.</p>
                  <p className="text-sm mt-1">Contact the vendor directly for their portfolio and work samples.</p>
                  
                  <div className="flex gap-3 justify-center mt-6">
                    {selectedUser.email && (
                      <button
                        onClick={() => handleContact(selectedUser, 'email')}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <FiEmail className="w-4 h-4" />
                        Email
                      </button>
                    )}
                    {selectedUser.phone && (
                      <>
                        <button
                          onClick={() => handleContact(selectedUser, 'phone')}
                          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                        >
                          <FiPhone className="w-4 h-4" />
                          Call
                        </button>
                        <button
                          onClick={() => handleContact(selectedUser, 'whatsapp')}
                          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                        >
                          <FiExternalLink className="w-4 h-4" />
                          WhatsApp
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* History Modal for Project Owners */}
        {showHistoryModal && selectedUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg max-w-4xl w-full m-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b">
                <h2 className="text-xl font-bold text-gray-900">
                  {selectedUser.name} - Project History
                </h2>
                <button
                  onClick={() => {
                    setShowHistoryModal(false);
                    setSelectedUser(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <FiX className="w-6 h-6" />
                </button>
              </div>
              <div className="p-6">
                <div className="flex items-center gap-4 mb-6">
                  {selectedUser.avatar ? (
                    <img 
                      src={selectedUser.avatar} 
                      alt={selectedUser.name}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                      <FiUser className="w-8 h-8 text-blue-600" />
                    </div>
                  )}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{selectedUser.name}</h3>
                    {selectedUser.company && (
                      <p className="text-gray-600">{selectedUser.company}</p>
                    )}
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                      <span><FiMapPin className="inline w-4 h-4 mr-1" />{selectedUser.location}</span>
                    </div>
                  </div>
                </div>
                
                <div className="text-center py-12 text-gray-500">
                  <FiBriefcase className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <h4 className="text-lg font-medium mb-2">Project History Not Available</h4>
                  <p className="text-sm">Project history details are not available in this view.</p>
                  <p className="text-sm mt-1">Contact the project owner directly for information about their past projects.</p>
                  
                  <div className="flex gap-3 justify-center mt-6">
                    {selectedUser.email && (
                      <button
                        onClick={() => handleContact(selectedUser, 'email')}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <FiEmail className="w-4 h-4" />
                        Email
                      </button>
                    )}
                    {selectedUser.phone && (
                      <>
                        <button
                          onClick={() => handleContact(selectedUser, 'phone')}
                          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                        >
                          <FiPhone className="w-4 h-4" />
                          Call
                        </button>
                        <button
                          onClick={() => handleContact(selectedUser, 'whatsapp')}
                          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                        >
                          <FiExternalLink className="w-4 h-4" />
                          WhatsApp
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

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
