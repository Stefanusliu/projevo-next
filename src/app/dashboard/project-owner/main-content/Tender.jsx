import React, { useState, useEffect, useRef } from 'react';

const Tender = () => {
  const [selectedProjectTypes, setSelectedProjectTypes] = useState([]);
  const [selectedScopes, setSelectedScopes] = useState([]);
  const [selectedPropertyTypes, setSelectedPropertyTypes] = useState([]);
  const [showProjectTypeFilter, setShowProjectTypeFilter] = useState(false);
  const [showScopeFilter, setShowScopeFilter] = useState(false);
  const [showPropertyFilter, setShowPropertyFilter] = useState(false);
  const [sortBy, setSortBy] = useState('Paling Relevan');
  const [showSortFilter, setShowSortFilter] = useState(false);
  const projectTypeFilterRef = useRef(null);
  const scopeFilterRef = useRef(null);
  const propertyFilterRef = useRef(null);
  const sortFilterRef = useRef(null);

  const [marketData, setMarketData] = useState([
    {
      id: 1,
      projectTitle: "Bangun Interior Rumah BSD Minimalis Modern",
      location: "Jakarta Selatan",
      scope: ["Interior", "Furniture"],
      projectType: "Bangun",
      propertyType: "Rumah Tinggal",
      budget: "Rp 750,000,000",
      duration: "4 bulan",
      bidCountdown: "2 hari 14 jam",
    },
    {
      id: 2,
      projectTitle: "Renovasi Kantor Modern SCBD",
      location: "Jakarta Pusat",
      scope: ["Interior", "Sipil"],
      projectType: "Renovasi",
      propertyType: "Kantor",
      budget: "Rp 2,500,000,000",
      duration: "8 bulan",
      bidCountdown: "5 hari 8 jam",
    },
    {
      id: 3,
      projectTitle: "Desain Interior Apartemen Luxury Sudirman",
      location: "Jakarta Pusat",
      scope: ["Interior", "Furniture"],
      projectType: "Desain",
      propertyType: "Apartemen",
      budget: "Rp 520,000,000",
      duration: "12 minggu",
      bidCountdown: "1 minggu 3 hari",
    },
    {
      id: 4,
      projectTitle: "Bangun Ruko 3 Lantai Kelapa Gading",
      location: "Jakarta Utara",
      scope: ["Sipil", "Eksterior"],
      projectType: "Bangun",
      propertyType: "Ruko",
      budget: "Rp 1,200,000,000",
      duration: "6 bulan",
      bidCountdown: "3 hari 6 jam",
    },
    {
      id: 5,
      projectTitle: "Renovasi Restaurant Modern PIK",
      location: "Jakarta Utara",
      scope: ["Interior", "Furniture"],
      projectType: "Renovasi",
      propertyType: "Restoran",
      budget: "Rp 850,000,000",
      duration: "4 bulan",
      bidCountdown: "2 minggu 1 hari",
    },
    {
      id: 6,
      projectTitle: "Desain Hotel Boutique Kemang",
      location: "Jakarta Selatan",
      scope: ["Interior", "Eksterior", "Taman & Hardscape"],
      projectType: "Desain",
      propertyType: "Hotel / Penginapan",
      budget: "Rp 3,800,000,000",
      duration: "10 bulan",
      bidCountdown: "1 minggu 2 hari",
    },
    {
      id: 7,
      projectTitle: "Bangun Gudang Industri Cakung",
      location: "Jakarta Timur",
      scope: ["Sipil"],
      projectType: "Bangun",
      propertyType: "Gudang",
      budget: "Rp 4,200,000,000",
      duration: "8 bulan",
      bidCountdown: "4 hari 12 jam",
    },
    {
      id: 8,
      projectTitle: "Renovasi Sekolah Dasar Tangerang",
      location: "Tangerang",
      scope: ["Interior", "Sipil"],
      projectType: "Renovasi",
      propertyType: "Sekolah",
      budget: "Rp 680,000,000",
      duration: "5 bulan",
      bidCountdown: "6 hari 4 jam",
    },
  ]);

  // Get unique filter options
  const allProjectTypes = [...new Set(marketData.map(item => item.projectType))];
  const allScopes = [...new Set(marketData.flatMap(item => item.scope))];
  const allPropertyTypes = [...new Set(marketData.map(item => item.propertyType))];
  const sortOptions = [
    'Paling Relevan',
    'Budget Tertinggi', 
    'Budget Terendah',
    'Kompetisi Terendah',
    'Deadline Terlama',
    'Deadline Tercepat'
  ];

  // Filter data based on selected filters
  const filteredData = marketData.filter(item => {
    const projectTypeMatch = selectedProjectTypes.length === 0 || selectedProjectTypes.includes(item.projectType);
    const scopeMatch = selectedScopes.length === 0 || selectedScopes.some(scope => item.scope.includes(scope));
    const propertyMatch = selectedPropertyTypes.length === 0 || selectedPropertyTypes.includes(item.propertyType);
    
    return projectTypeMatch && scopeMatch && propertyMatch;
  });

  // Sort filtered data
  const sortedData = [...filteredData].sort((a, b) => {
    switch (sortBy) {
      case 'Budget Tertinggi':
        const budgetA = parseInt(a.budget.replace(/[^\d]/g, ''));
        const budgetB = parseInt(b.budget.replace(/[^\d]/g, ''));
        return budgetB - budgetA;
      
      case 'Budget Terendah':
        const budgetAsc = parseInt(a.budget.replace(/[^\d]/g, ''));
        const budgetBsc = parseInt(b.budget.replace(/[^\d]/g, ''));
        return budgetAsc - budgetBsc;
      
      case 'Kompetisi Terendah':
        // Assuming lower project ID means fewer competitors (mock logic)
        return a.id - b.id;
      
      case 'Deadline Terlama':
        const hoursA = getHoursFromCountdown(a.bidCountdown);
        const hoursB = getHoursFromCountdown(b.bidCountdown);
        return hoursB - hoursA;
      
      case 'Deadline Tercepat':
        const hoursAsc = getHoursFromCountdown(a.bidCountdown);
        const hoursBsc = getHoursFromCountdown(b.bidCountdown);
        return hoursAsc - hoursBsc;
      
      default: // Paling Relevan
        return 0; // Keep original order
    }
  });

  // Helper function to convert countdown to hours
  const getHoursFromCountdown = (countdown) => {
    let totalHours = 0;
    
    if (countdown.includes('minggu')) {
      const weeks = parseInt(countdown.match(/(\d+)\s*minggu/)?.[1] || 0);
      totalHours += weeks * 7 * 24;
    }
    if (countdown.includes('hari')) {
      const days = parseInt(countdown.match(/(\d+)\s*hari/)?.[1] || 0);
      totalHours += days * 24;
    }
    if (countdown.includes('jam')) {
      const hours = parseInt(countdown.match(/(\d+)\s*jam/)?.[1] || 0);
      totalHours += hours;
    }
    
    return totalHours;
  };

  const handleProjectTypeFilter = (projectType) => {
    setSelectedProjectTypes(prev => 
      prev.includes(projectType) 
        ? prev.filter(type => type !== projectType)
        : [...prev, projectType]
    );
  };

  const handleScopeFilter = (scope) => {
    setSelectedScopes(prev => 
      prev.includes(scope) 
        ? prev.filter(s => s !== scope)
        : [...prev, scope]
    );
  };

  const handlePropertyFilter = (propertyType) => {
    setSelectedPropertyTypes(prev => 
      prev.includes(propertyType) 
        ? prev.filter(type => type !== propertyType)
        : [...prev, propertyType]
    );
  };

  const handleSortChange = (sortOption) => {
    setSortBy(sortOption);
    setShowSortFilter(false);
  };

  // Close filter dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (projectTypeFilterRef.current && !projectTypeFilterRef.current.contains(event.target)) {
        setShowProjectTypeFilter(false);
      }
      if (scopeFilterRef.current && !scopeFilterRef.current.contains(event.target)) {
        setShowScopeFilter(false);
      }
      if (propertyFilterRef.current && !propertyFilterRef.current.contains(event.target)) {
        setShowPropertyFilter(false);
      }
      if (sortFilterRef.current && !sortFilterRef.current.contains(event.target)) {
        setShowSortFilter(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);



  const getBidCountdownColor = (countdown) => {
    // Extract time values and convert to hours for comparison
    let totalHours = 0;
    
    if (countdown.includes('minggu')) {
      const weeks = parseInt(countdown.match(/(\d+)\s*minggu/)?.[1] || 0);
      totalHours += weeks * 7 * 24;
    }
    if (countdown.includes('hari')) {
      const days = parseInt(countdown.match(/(\d+)\s*hari/)?.[1] || 0);
      totalHours += days * 24;
    }
    if (countdown.includes('jam')) {
      const hours = parseInt(countdown.match(/(\d+)\s*jam/)?.[1] || 0);
      totalHours += hours;
    }

    if (totalHours <= 72) // 3 days or less
      return "text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-900/20";
    if (totalHours <= 168) // 7 days or less
      return "text-orange-600 bg-orange-50 dark:text-orange-400 dark:bg-orange-900/20";
    return "text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-900/20";
  };

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tender Title */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            Tender
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2">
            Discover and connect with qualified contractors for your projects
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-3 mb-6">
          <div className="flex items-center gap-2 flex-wrap">
            {/* Jenis Proyek Filter */}
            <div className="relative min-w-[160px] flex-1" ref={projectTypeFilterRef}>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                Jenis Proyek
              </label>
              <button
                onClick={() => setShowProjectTypeFilter(!showProjectTypeFilter)}
                className="w-full flex items-center justify-between gap-1 px-2 py-1.5 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors text-left text-sm"
              >
                <div className="flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  <span className="text-xs font-medium text-slate-900 dark:text-white">
                    {selectedProjectTypes.length > 0 
                      ? `${selectedProjectTypes.length} dipilih` 
                      : 'Semua'
                    }
                  </span>
                </div>
                <svg className={`w-3.5 h-3.5 transition-transform ${showProjectTypeFilter ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Project Type Filter Dropdown */}
              {showProjectTypeFilter && (
                <div className="absolute top-full left-0 mt-1 w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md shadow-lg z-10">
                  <div className="p-3">
                    <h3 className="text-xs font-semibold text-slate-900 dark:text-white mb-2">Pilih Jenis Proyek</h3>
                    <div className="space-y-1.5 max-h-40 overflow-y-auto">
                      {allProjectTypes.map(type => (
                        <label key={type} className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selectedProjectTypes.includes(type)}
                            onChange={() => handleProjectTypeFilter(type)}
                            className="w-3.5 h-3.5 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                          />
                          <span className="text-xs text-slate-700 dark:text-slate-300">{type}</span>
                        </label>
                      ))}
                    </div>
                    {selectedProjectTypes.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-slate-200 dark:border-slate-600">
                        <button
                          onClick={() => setSelectedProjectTypes([])}
                          className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                          Clear All
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Ruang Lingkup Filter */}
            <div className="relative min-w-[160px] flex-1" ref={scopeFilterRef}>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                Ruang Lingkup
              </label>
              <button
                onClick={() => setShowScopeFilter(!showScopeFilter)}
                className="w-full flex items-center justify-between gap-1 px-2 py-1.5 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors text-left text-sm"
              >
                <div className="flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                  <span className="text-xs font-medium text-slate-900 dark:text-white">
                    {selectedScopes.length > 0 
                      ? `${selectedScopes.length} dipilih` 
                      : 'Semua'
                    }
                  </span>
                </div>
                <svg className={`w-3.5 h-3.5 transition-transform ${showScopeFilter ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Scope Filter Dropdown */}
              {showScopeFilter && (
                <div className="absolute top-full left-0 mt-1 w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md shadow-lg z-10">
                  <div className="p-3">
                    <h3 className="text-xs font-semibold text-slate-900 dark:text-white mb-2">Pilih Ruang Lingkup</h3>
                    <div className="space-y-1.5 max-h-40 overflow-y-auto">
                      {allScopes.map(scope => (
                        <label key={scope} className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selectedScopes.includes(scope)}
                            onChange={() => handleScopeFilter(scope)}
                            className="w-3.5 h-3.5 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                          />
                          <span className="text-xs text-slate-700 dark:text-slate-300">{scope}</span>
                        </label>
                      ))}
                    </div>
                    {selectedScopes.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-slate-200 dark:border-slate-600">
                        <button
                          onClick={() => setSelectedScopes([])}
                          className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                          Clear All
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Property Filter */}
            <div className="relative min-w-[160px] flex-1" ref={propertyFilterRef}>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                Property
              </label>
              <button
                onClick={() => setShowPropertyFilter(!showPropertyFilter)}
                className="w-full flex items-center justify-between gap-1 px-2 py-1.5 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors text-left text-sm"
              >
                <div className="flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 21l8-12" />
                  </svg>
                  <span className="text-xs font-medium text-slate-900 dark:text-white">
                    {selectedPropertyTypes.length > 0 
                      ? `${selectedPropertyTypes.length} dipilih` 
                      : 'Semua'
                    }
                  </span>
                </div>
                <svg className={`w-3.5 h-3.5 transition-transform ${showPropertyFilter ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Property Filter Dropdown */}
              {showPropertyFilter && (
                <div className="absolute top-full left-0 mt-1 w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md shadow-lg z-10">
                  <div className="p-3">
                    <h3 className="text-xs font-semibold text-slate-900 dark:text-white mb-2">Pilih Property</h3>
                    <div className="space-y-1.5 max-h-40 overflow-y-auto">
                      {allPropertyTypes.map(property => (
                        <label key={property} className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selectedPropertyTypes.includes(property)}
                            onChange={() => handlePropertyFilter(property)}
                            className="w-3.5 h-3.5 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                          />
                          <span className="text-xs text-slate-700 dark:text-slate-300">{property}</span>
                        </label>
                      ))}
                    </div>
                    {selectedPropertyTypes.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-slate-200 dark:border-slate-600">
                        <button
                          onClick={() => setSelectedPropertyTypes([])}
                          className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                          Clear All
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Sort By Filter */}
            <div className="relative min-w-[160px] flex-1" ref={sortFilterRef}>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                Sort By
              </label>
              <button
                onClick={() => setShowSortFilter(!showSortFilter)}
                className="w-full flex items-center justify-between gap-1 px-2 py-1.5 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors text-left text-sm"
              >
                <div className="flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
                  </svg>
                  <span className="text-xs font-medium text-slate-900 dark:text-white truncate">
                    {sortBy}
                  </span>
                </div>
                <svg className={`w-3.5 h-3.5 transition-transform ${showSortFilter ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Sort Filter Dropdown */}
              {showSortFilter && (
                <div className="absolute top-full left-0 mt-1 w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md shadow-lg z-10">
                  <div className="p-3">
                    <h3 className="text-xs font-semibold text-slate-900 dark:text-white mb-2">Pilih Urutan</h3>
                    <div className="space-y-1.5 max-h-40 overflow-y-auto">
                      {sortOptions.map(option => (
                        <button
                          key={option}
                          onClick={() => handleSortChange(option)}
                          className={`w-full text-left px-2 py-1.5 text-xs rounded hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors ${
                            sortBy === option 
                              ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400' 
                              : 'text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Apply Filters Button */}
            <div className="ml-2">
              <label className="block text-xs font-medium text-transparent mb-1">Apply</label>
              <button 
                onClick={() => {
                  setShowProjectTypeFilter(false);
                  setShowScopeFilter(false);
                  setShowPropertyFilter(false);
                  setShowSortFilter(false);
                }}
                className="px-4 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-md font-medium hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-md hover:shadow-lg text-xs"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>

        {/* Project Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {sortedData.map((project) => (
            <div
              key={project.id}
              className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden hover:shadow-lg transition-all duration-200 hover:-translate-y-1"
            >
              <div className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span
                        className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                          project.projectType === "Desain"
                            ? "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400"
                            : project.projectType === "Bangun"
                            ? "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400"
                            : project.projectType === "Renovasi"
                            ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                            : "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400"
                        }`}
                      >
                        {project.projectType}
                      </span>
                      <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300">
                        {project.propertyType}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">
                      {project.projectTitle}
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {project.location}
                    </p>
                  </div>
                  <div className="text-right ml-4">
                    <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${getBidCountdownColor(project.bidCountdown)}`}>
                      {project.bidCountdown}
                    </span>
                  </div>
                </div>

                {/* Scope */}
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-slate-900 dark:text-white mb-2">Ruang Lingkup</h4>
                  <div className="flex flex-wrap gap-1">
                    {project.scope.map((scopeItem, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 text-xs bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400 rounded"
                      >
                        {scopeItem}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Budget</p>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">{project.budget}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Duration</p>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">{project.duration}</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex space-x-3">
                  <button className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-medium rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
                    View Bids
                  </button>
                  <button className="px-4 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 text-sm font-medium rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                    Edit Project
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Load More */}
        <div className="text-center mt-8">
          <button className="px-6 py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-medium rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
            Load More Projects
          </button>
        </div>
      </main>
  )
}

export default Tender