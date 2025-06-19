'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function SavedPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('All Locations');
  const [activeMenu, setActiveMenu] = useState('Saved');

  const locations = [
    'All Locations',
    'Jakarta Selatan',
    'Jakarta Pusat',
    'Jakarta Barat',
    'Jakarta Utara',
    'Jakarta Timur',
    'Depok',
    'Tangerang',
    'Bekasi',
    'Bogor'
  ];

  const [savedProjects, setSavedProjects] = useState([
    {
      id: 1,
      projectType: "Interior Design",
      title: "Luxury Hotel Lobby Interior Design",
      location: "Jakarta Selatan",
      profileName: "CV. Elite Interior",
      contractType: "Contract",
      status: "available",
      projectStatus: "Open for Tender",
      savedDate: "2024-06-15"
    },
    {
      id: 2,
      projectType: "Construction",
      title: "Shopping Mall Construction",
      location: "Tangerang",
      profileName: "PT. Mega Konstruksi",
      contractType: "Tender",
      status: "available",
      projectStatus: "Accepting Proposals",
      savedDate: "2024-06-14"
    },
    {
      id: 3,
      projectType: "Architecture",
      title: "Modern Residential Complex Design",
      location: "Depok",
      profileName: "Arsitek Nusantara",
      contractType: "Contract",
      status: "available",
      projectStatus: "Open for Consultation",
      savedDate: "2024-06-13"
    },
    {
      id: 4,
      projectType: "Renovation",
      title: "Corporate Office Renovation",
      location: "SCBD Jakarta",
      profileName: "Renovasi Master",
      contractType: "Tender",
      status: "available",
      projectStatus: "Bidding Process",
      savedDate: "2024-06-12"
    },
    {
      id: 5,
      projectType: "Interior Design",
      title: "Fine Dining Restaurant Interior",
      location: "Kemang, Jakarta",
      profileName: "Design Studio Pro",
      contractType: "Contract",
      status: "available",
      projectStatus: "Looking for Partners",
      savedDate: "2024-06-11"
    },
    {
      id: 6,
      projectType: "Construction",
      title: "High-Rise Apartment Construction",
      location: "Bekasi",
      profileName: "Konstruksi Prima",
      contractType: "Tender",
      status: "available",
      projectStatus: "Pre-qualification Stage",
      savedDate: "2024-06-10"
    }
  ]);

  const menuItems = ['Project', 'Portfolio', 'Saved', 'History'];

  const getStatusColor = (status) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'closed':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      default:
        return 'bg-slate-100 text-slate-800 dark:bg-slate-900/20 dark:text-slate-400';
    }
  };

  const getProjectStatusColor = (projectStatus) => {
    switch (projectStatus) {
      case 'Open for Tender':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'Accepting Proposals':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'Open for Consultation':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400';
      case 'Bidding Process':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400';
      case 'Looking for Partners':
        return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-400';
      case 'Pre-qualification Stage':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      default:
        return 'bg-slate-100 text-slate-800 dark:bg-slate-900/20 dark:text-slate-400';
    }
  };

  const handleUnsaveProject = (projectId) => {
    setSavedProjects(savedProjects.filter(project => project.id !== projectId));
  };

  const filteredProjects = savedProjects.filter(project => 
    (selectedLocation === 'All Locations' || project.location.includes(selectedLocation)) &&
    (searchQuery === '' || 
     project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
     project.profileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
     project.projectType.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Top Header with Logo and Menu */}
      <header className="bg-white dark:bg-slate-800 shadow-sm border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <Link href="/" className="flex items-center space-x-2">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold text-xl">P</span>
                </div>
                <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Projevo
                </span>
              </Link>
            </div>
            <nav className="hidden md:flex items-center space-x-8">
              <Link href="/how-it-works" className="text-slate-600 hover:text-blue-600 dark:text-slate-300 dark:hover:text-blue-400 font-medium transition-colors">
                How it Works?
              </Link>
              <Link href="/contact" className="text-slate-600 hover:text-blue-600 dark:text-slate-300 dark:hover:text-blue-400 font-medium transition-colors">
                Contact Us
              </Link>
              <Link href="/about" className="text-slate-600 hover:text-blue-600 dark:text-slate-300 dark:hover:text-blue-400 font-medium transition-colors">
                About Us
              </Link>
              <Link href="/partners" className="text-slate-600 hover:text-blue-600 dark:text-slate-300 dark:hover:text-blue-400 font-medium transition-colors">
                Partners
              </Link>
              <Link href="/promotions" className="text-slate-600 hover:text-blue-600 dark:text-slate-300 dark:hover:text-blue-400 font-medium transition-colors">
                Promotions
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Secondary Header with Actions */}
      <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center flex-1">
              <button className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-2.5 rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 mr-4">
                Tender
              </button>
              <Link href="/dashboard/project-owner/home" className="p-2.5 rounded-lg text-slate-600 hover:text-blue-600 hover:bg-blue-50 dark:text-slate-300 dark:hover:text-blue-400 dark:hover:bg-blue-900/20 transition-colors mr-4">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              </Link>
              <div className="flex items-center flex-1">
                <div className="relative flex-1 mr-2">
                  <input
                    type="text"
                    placeholder="Search saved projects"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-4 pr-10 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <svg className="h-5 w-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                </div>
                <select
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  className="px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent mr-2"
                >
                  {locations.map((location) => (
                    <option key={location} value={location}>
                      {location}
                    </option>
                  ))}
                </select>
                <button className="p-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors shadow-lg">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="flex items-center">
              <button className="p-2.5 rounded-lg text-slate-600 hover:text-blue-600 hover:bg-blue-50 dark:text-slate-300 dark:hover:text-blue-400 dark:hover:bg-blue-900/20 transition-colors relative mr-2">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">3</span>
              </button>
              <button className="p-2.5 rounded-lg text-slate-600 hover:text-blue-600 hover:bg-blue-50 dark:text-slate-300 dark:hover:text-blue-400 dark:hover:bg-blue-900/20 transition-colors relative mr-4">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-blue-500 text-white text-xs rounded-full flex items-center justify-center">7</span>
              </button>
              <div className="flex items-center">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center mr-3">
                  <span className="text-white text-sm font-medium">JD</span>
                </div>
                <div className="hidden sm:block">
                  <p className="text-sm font-medium text-slate-900 dark:text-white">John Doe</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Project Owner</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Left Sidebar Menu */}
          <div className="w-64 flex-shrink-0">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
              <nav className="space-y-2">
                {menuItems.map((item) => (
                  <Link
                    key={item}
                    href={item === 'Portfolio' ? '/dashboard/project-owner/portfolio' : item === 'Project' ? '/dashboard/project-owner/home' : `/dashboard/project-owner/${item.toLowerCase()}`}
                    className={`block w-full text-left px-4 py-3 rounded-lg font-medium transition-colors ${
                      activeMenu === item
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'text-slate-600 hover:text-blue-600 hover:bg-blue-50 dark:text-slate-300 dark:hover:text-blue-400 dark:hover:bg-blue-900/20'
                    }`}
                  >
                    {item}
                  </Link>
                ))}
              </nav>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1">
            {/* Header Section */}
            <div className="mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Saved Projects</h1>
                  <p className="text-slate-600 dark:text-slate-400">
                    Projects you've bookmarked for later review • {filteredProjects.length} projects
                  </p>
                </div>
                <div className="flex items-center space-x-2 text-sm text-slate-500 dark:text-slate-400">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17 3H7c-1.1 0-2 .9-2 2v16l7-3 7 3V5c0-1.1-.9-2-2-2z"/>
                  </svg>
                  <span>Bookmarked</span>
                </div>
              </div>
            </div>

            {/* Project Cards */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
              {filteredProjects.map((project) => (
                <div key={project.id} className="p-6 border-b border-slate-200 dark:border-slate-700 last:border-b-0 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                  <div className="grid grid-cols-12 gap-4 items-start">
                    {/* Column 1 - Project Type */}
                    <div className="col-span-2">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
                        {project.projectType}
                      </span>
                    </div>

                    {/* Column 2 - Title, Location, Profile Name */}
                    <div className="col-span-4">
                      <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-1 leading-tight">
                        {project.title}
                      </h3>
                      <div className="space-y-0.5 text-xs text-slate-600 dark:text-slate-400">
                        <div className="flex items-center">
                          <svg className="w-3 h-3 mr-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <span className="truncate">{project.location}</span>
                        </div>
                        <div className="flex items-center">
                          <svg className="w-3 h-3 mr-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          <span className="truncate">{project.profileName}</span>
                        </div>
                      </div>
                    </div>

                    {/* Column 3 - Contract Type and Status */}
                    <div className="col-span-3">
                      <div className="space-y-2">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${
                          project.contractType === 'Contract' 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                            : 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400'
                        }`}>
                          {project.contractType}
                        </span>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${getStatusColor(project.status)}`}>
                          {project.status}
                        </span>
                      </div>
                    </div>

                    {/* Column 4 - Project Status */}
                    <div className="col-span-2">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${getProjectStatusColor(project.projectStatus)} max-w-full`}>
                        <span className="truncate">{project.projectStatus}</span>
                      </span>
                    </div>

                    {/* Column 5 - Save Action & Date */}
                    <div className="col-span-1 flex flex-col items-end space-y-2">
                      <button
                        onClick={() => handleUnsaveProject(project.id)}
                        className="p-2 text-yellow-600 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all duration-200 group"
                        title="Remove from saved"
                      >
                        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                          <path d="M17 3H7c-1.1 0-2 .9-2 2v16l7-3 7 3V5c0-1.1-.9-2-2-2z"/>
                        </svg>
                      </button>
                      <div className="text-xs text-slate-400 dark:text-slate-500 text-right">
                        <div>Saved</div>
                        <div>{new Date(project.savedDate).toLocaleDateString('id-ID', { 
                          day: '2-digit', 
                          month: 'short' 
                        })}</div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* Empty State */}
              {filteredProjects.length === 0 && (
                <div className="text-center py-16">
                  <svg className="w-24 h-24 mx-auto text-slate-400 dark:text-slate-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                  </svg>
                  <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">No saved projects found</h3>
                  <p className="text-slate-600 dark:text-slate-400 mb-4">
                    {searchQuery || selectedLocation !== 'All Locations' 
                      ? 'Try adjusting your search criteria or location filter.'
                      : 'Start saving projects you\'re interested in to see them here.'
                    }
                  </p>
                  <Link 
                    href="/dashboard/project-owner/home" 
                    className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
                  >
                    Browse Projects
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
