'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function HistoryPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('All Locations');
  const [activeMenu, setActiveMenu] = useState('History');
  const [selectedStatus, setSelectedStatus] = useState('All Status');
  const [selectedTimeRange, setSelectedTimeRange] = useState('All Time');

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

  const statusOptions = [
    'All Status',
    'Completed',
    'Cancelled',
    'Terminated',
    'Expired'
  ];

  const timeRanges = [
    'All Time',
    'Last 30 Days',
    'Last 3 Months',
    'Last 6 Months',
    'This Year',
    'Last Year'
  ];

  const [completedProjects, setCompletedProjects] = useState([
    {
      id: 1,
      projectType: "Interior Design",
      title: "Luxury Restaurant Interior Renovation",
      location: "Jakarta Selatan",
      profileName: "CV. Kreasi Interior",
      contractType: "Contract",
      status: "Completed",
      finalStatus: "Successfully Completed",
      completedDate: "2024-05-15",
      startDate: "2024-02-01",
      budget: "Rp 450.000.000",
      duration: "3.5 months",
      rating: 4.8
    },
    {
      id: 2,
      projectType: "Construction",
      title: "Office Building Construction Phase 1",
      location: "Menteng, Jakarta",
      profileName: "PT. Bangun Jaya",
      contractType: "Tender",
      status: "Completed",
      finalStatus: "Delivered on Time",
      completedDate: "2024-04-20",
      startDate: "2023-10-15",
      budget: "Rp 2.500.000.000",
      duration: "6 months",
      rating: 4.5
    },
    {
      id: 3,
      projectType: "Architecture",
      title: "Modern Villa Design & Construction",
      location: "Kemang, Jakarta",
      profileName: "Studio Arsitek Modern",
      contractType: "Contract",
      status: "Completed",
      finalStatus: "Excellent Results",
      completedDate: "2024-03-30",
      startDate: "2023-08-01",
      budget: "Rp 1.800.000.000",
      duration: "8 months",
      rating: 5.0
    },
    {
      id: 4,
      projectType: "Renovation",
      title: "Shopping Center Food Court Renovation",
      location: "PIK Jakarta",
      profileName: "Renovasi Pro",
      contractType: "Tender",
      status: "Cancelled",
      finalStatus: "Cancelled by Client",
      completedDate: "2024-01-15",
      startDate: "2023-12-01",
      budget: "Rp 750.000.000",
      duration: "1.5 months",
      rating: null
    },
    {
      id: 5,
      projectType: "Interior Design",
      title: "Corporate Office Interior Design",
      location: "SCBD Jakarta",
      profileName: "Design Excellence",
      contractType: "Contract",
      status: "Completed",
      finalStatus: "Outstanding Performance",
      completedDate: "2023-12-10",
      startDate: "2023-09-15",
      budget: "Rp 950.000.000",
      duration: "3 months",
      rating: 4.9
    },
    {
      id: 6,
      projectType: "Construction",
      title: "Warehouse Construction Project",
      location: "Tangerang",
      profileName: "Konstruksi Mandiri",
      contractType: "Tender",
      status: "Terminated",
      finalStatus: "Contract Terminated",
      completedDate: "2023-11-20",
      startDate: "2023-07-01",
      budget: "Rp 1.200.000.000",
      duration: "4.5 months",
      rating: 2.5
    },
    {
      id: 7,
      projectType: "Architecture",
      title: "Residential Complex Master Plan",
      location: "Depok",
      profileName: "Arsitek Nusantara",
      contractType: "Contract",
      status: "Completed",
      finalStatus: "Project Excellence Award",
      completedDate: "2023-10-05",
      startDate: "2023-03-01",
      budget: "Rp 3.200.000.000",
      duration: "7 months",
      rating: 4.7
    },
    {
      id: 8,
      projectType: "Renovation",
      title: "Hotel Lobby Renovation",
      location: "Jakarta Pusat",
      profileName: "Renovasi Master",
      contractType: "Contract",
      status: "Expired",
      finalStatus: "Contract Expired",
      completedDate: "2023-09-15",
      startDate: "2023-06-01",
      budget: "Rp 680.000.000",
      duration: "3.5 months",
      rating: null
    }
  ]);

  const menuItems = ['Project', 'Portfolio', 'Saved', 'History'];

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'Cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'Terminated':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400';
      case 'Expired':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
      default:
        return 'bg-slate-100 text-slate-800 dark:bg-slate-900/20 dark:text-slate-400';
    }
  };

  const getFinalStatusColor = (finalStatus) => {
    if (finalStatus.includes('Successfully') || finalStatus.includes('Excellence') || finalStatus.includes('Outstanding')) {
      return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
    } else if (finalStatus.includes('Cancelled') || finalStatus.includes('Terminated') || finalStatus.includes('Expired')) {
      return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
    } else if (finalStatus.includes('Delivered')) {
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
    }
    return 'bg-slate-100 text-slate-800 dark:bg-slate-900/20 dark:text-slate-400';
  };

  const renderStarRating = (rating) => {
    if (!rating) return <span className="text-slate-400 text-sm">No rating</span>;
    
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <svg
            key={star}
            className={`w-4 h-4 ${star <= rating ? 'text-yellow-400' : 'text-slate-300'}`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
        <span className="text-sm font-medium text-slate-700 dark:text-slate-300 ml-1">
          {rating.toFixed(1)}
        </span>
      </div>
    );
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(parseInt(amount.replace(/[^\d]/g, '')));
  };

  const filteredProjects = completedProjects.filter(project => {
    const matchesLocation = selectedLocation === 'All Locations' || project.location.includes(selectedLocation);
    const matchesStatus = selectedStatus === 'All Status' || project.status === selectedStatus;
    const matchesSearch = searchQuery === '' || 
      project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.profileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.projectType.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesLocation && matchesStatus && matchesSearch;
  });

  const getProjectStats = () => {
    const completed = completedProjects.filter(p => p.status === 'Completed').length;
    const cancelled = completedProjects.filter(p => p.status === 'Cancelled').length;
    const terminated = completedProjects.filter(p => p.status === 'Terminated').length;
    const expired = completedProjects.filter(p => p.status === 'Expired').length;
    
    return { completed, cancelled, terminated, expired };
  };

  const stats = getProjectStats();

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
                    placeholder="Search project history"
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
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Project History</h1>
                  <p className="text-slate-600 dark:text-slate-400">
                    View all your completed and past projects • {filteredProjects.length} projects
                  </p>
                </div>
                <div className="flex items-center space-x-2 text-sm text-slate-500 dark:text-slate-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Historical Data</span>
                </div>
              </div>

              {/* Statistics Cards */}
              <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 mb-8">
                <div className="grid grid-cols-4 gap-8">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400 mb-2">{stats.completed}</div>
                    <div className="text-sm text-slate-600 dark:text-slate-400 font-medium">Completed</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600 dark:text-red-400 mb-2">{stats.cancelled}</div>
                    <div className="text-sm text-slate-600 dark:text-slate-400 font-medium">Cancelled</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600 dark:text-orange-400 mb-2">{stats.terminated}</div>
                    <div className="text-sm text-slate-600 dark:text-slate-400 font-medium">Terminated</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-600 dark:text-gray-400 mb-2">{stats.expired}</div>
                    <div className="text-sm text-slate-600 dark:text-slate-400 font-medium">Expired</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Filters */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 mb-6">
              <div className="flex flex-wrap gap-4 items-center">
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {statusOptions.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
                <select
                  value={selectedTimeRange}
                  onChange={(e) => setSelectedTimeRange(e.target.value)}
                  className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {timeRanges.map((range) => (
                    <option key={range} value={range}>
                      {range}
                    </option>
                  ))}
                </select>
                <div className="flex-1 max-w-md">
                  <input
                    type="text"
                    placeholder="Search by project name, contractor, or type..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Project History Cards */}
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

                    {/* Column 3 - Status and Final Status */}
                    <div className="col-span-3">
                      <div className="space-y-2">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${getStatusColor(project.status)}`}>
                          {project.status}
                        </span>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${getFinalStatusColor(project.finalStatus)}`}>
                          <span className="truncate">{project.finalStatus}</span>
                        </span>
                      </div>
                    </div>

                    {/* Column 4 - Budget & Duration */}
                    <div className="col-span-2">
                      <div className="text-xs space-y-1">
                        <div className="font-semibold text-slate-900 dark:text-white">
                          {formatCurrency(project.budget)}
                        </div>
                        <div className="text-slate-600 dark:text-slate-400">
                          {project.duration}
                        </div>
                      </div>
                    </div>

                    {/* Column 5 - Date & Rating */}
                    <div className="col-span-1 flex flex-col items-end space-y-2">
                      <div className="text-xs text-slate-500 dark:text-slate-400 text-right">
                        <div className="font-medium">Completed</div>
                        <div>{new Date(project.completedDate).toLocaleDateString('id-ID', { 
                          day: '2-digit', 
                          month: 'short',
                          year: 'numeric'
                        })}</div>
                      </div>
                      <div className="flex flex-col items-end">
                        {renderStarRating(project.rating)}
                      </div>
                    </div>
                  </div>

                  {/* Expandable Details (Optional) */}
                  <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-600">
                    <div className="grid grid-cols-3 gap-4 text-xs text-slate-600 dark:text-slate-400">
                      <div>
                        <span className="font-medium">Start Date:</span>
                        <div>{new Date(project.startDate).toLocaleDateString('id-ID')}</div>
                      </div>
                      <div>
                        <span className="font-medium">Contract Type:</span>
                        <div>{project.contractType}</div>
                      </div>
                      <div>
                        <span className="font-medium">Project ID:</span>
                        <div>#{project.id.toString().padStart(4, '0')}</div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* Empty State */}
              {filteredProjects.length === 0 && (
                <div className="text-center py-16">
                  <svg className="w-24 h-24 mx-auto text-slate-400 dark:text-slate-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">No project history found</h3>
                  <p className="text-slate-600 dark:text-slate-400 mb-4">
                    {searchQuery || selectedStatus !== 'All Status' || selectedLocation !== 'All Locations'
                      ? 'Try adjusting your search criteria or filters.'
                      : 'Your completed projects will appear here.'
                    }
                  </p>
                  <Link 
                    href="/dashboard/project-owner/home" 
                    className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
                  >
                    Browse Active Projects
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
