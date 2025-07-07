import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../../../contexts/AuthContext';
import { db } from '../../../../lib/firebase';
import { collection, query, where, orderBy, onSnapshot, doc, getDoc } from 'firebase/firestore';

const Tender = () => {
  const { user } = useAuth();
  const [selectedProjectTypes, setSelectedProjectTypes] = useState([]);
  const [selectedScopes, setSelectedScopes] = useState([]);
  const [selectedPropertyTypes, setSelectedPropertyTypes] = useState([]);
  const [showProjectTypeFilter, setShowProjectTypeFilter] = useState(false);
  const [showScopeFilter, setShowScopeFilter] = useState(false);
  const [showPropertyFilter, setShowPropertyFilter] = useState(false);
  const [sortBy, setSortBy] = useState('Paling Relevan');
  const [showSortFilter, setShowSortFilter] = useState(false);
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [bookmarkedProjects, setBookmarkedProjects] = useState([]);
  const [marketData, setMarketData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const projectTypeFilterRef = useRef(null);
  const scopeFilterRef = useRef(null);
  const propertyFilterRef = useRef(null);
  const sortFilterRef = useRef(null);

  // Load tender projects from Firestore
  useEffect(() => {
    const loadTenderProjects = async () => {
      if (!user) {
        console.log('No user found, skipping tender projects load');
        setLoading(false);
        return;
      }

      console.log('Loading tender projects for user:', user.uid);
      setLoading(true);
      setError(null);

      try {
        // Import Firestore functions
        const { getDocs } = await import('firebase/firestore');
        
        // Simple query to get all projects first
        const projectsQuery = query(collection(db, 'projects'));
        console.log('Executing query for all projects...');
        
        const snapshot = await getDocs(projectsQuery);
        console.log('Query successful! Retrieved', snapshot.size, 'documents');
        
        const projects = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          console.log('Processing project:', doc.id, {
            procurementMethod: data.procurementMethod,
            status: data.status,
            title: data.title || data.projectTitle
          });
          
          // Filter for tender projects
          if (data.procurementMethod === 'Tender') {
            console.log('Found tender project:', doc.id, data.status);
            
            const project = {
              id: doc.id,
              projectTitle: data.title || data.projectTitle || 'Untitled Project',
              location: data.location || data.city || 'Location not specified',
              scope: data.scope || data.scopes || (data.category ? [data.category] : ['General']),
              projectType: data.projectType || data.category || 'General',
              propertyType: data.propertyType || 'Commercial',
              budget: data.estimatedBudget || data.budget || 'Budget not specified',
              duration: data.estimatedDuration || data.duration || 'Duration not specified',
              bidCountdown: calculateBidCountdown(data.tenderDeadline || data.deadline),
              tenderDeadline: data.tenderDeadline,
              deadline: data.deadline,
              description: data.description || '',
              client: data.client || 'Client not specified',
              estimatedStartDate: data.estimatedStartDate || data.startDate,
              status: data.status,
              ...data
            };
            projects.push(project);
          }
        });

        console.log('Processed tender projects:', projects);
        setMarketData(projects);
        setLoading(false);
        
      } catch (error) {
        console.error('Error loading tender projects:', error);
        console.error('Error code:', error.code);
        console.error('Error message:', error.message);
        
        let errorMessage = 'Failed to load tender projects. Please try again.';
        if (error.code === 'permission-denied') {
          errorMessage = 'Permission denied. Please check your authentication and try again.';
        } else if (error.code === 'unavailable') {
          errorMessage = 'Service temporarily unavailable. Please try again later.';
        } else if (error.message) {
          errorMessage = `Failed to load tender projects: ${error.message}`;
        }
        
        setError(errorMessage);
        setLoading(false);
      }
    };

    loadTenderProjects();
  }, [user]);

  // Calculate bid countdown
  const calculateBidCountdown = (deadline) => {
    if (!deadline) return 'No deadline set';
    
    try {
      let deadlineDate;
      if (deadline?.toDate) {
        // Firestore timestamp
        deadlineDate = deadline.toDate();
      } else if (typeof deadline === 'string') {
        // String date
        deadlineDate = new Date(deadline);
      } else {
        return 'Invalid deadline';
      }

      const now = new Date();
      const diffTime = deadlineDate.getTime() - now.getTime();
      
      if (diffTime <= 0) {
        return 'Deadline passed';
      }

      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      const diffHours = Math.floor((diffTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      
      if (diffDays > 7) {
        const weeks = Math.floor(diffDays / 7);
        const remainingDays = diffDays % 7;
        return `${weeks} minggu${remainingDays > 0 ? ` ${remainingDays} hari` : ''}`;
      } else if (diffDays > 0) {
        return `${diffDays} hari ${diffHours} jam`;
      } else {
        return `${diffHours} jam`;
      }
    } catch (error) {
      console.error('Error calculating countdown:', error);
      return 'Invalid deadline';
    }
  };

  // Get unique filter options from real data
  const allProjectTypes = [...new Set(marketData.map(item => item.projectType))];
  const allScopes = [...new Set(marketData.flatMap(item => {
    if (Array.isArray(item.scope)) return item.scope;
    return item.scope ? [item.scope] : [];
  }))];
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
    const scopeMatch = selectedScopes.length === 0 || selectedScopes.some(scope => {
      if (Array.isArray(item.scope)) {
        return item.scope.includes(scope);
      }
      return item.scope === scope;
    });
    const propertyMatch = selectedPropertyTypes.length === 0 || selectedPropertyTypes.includes(item.propertyType);
    
    return projectTypeMatch && scopeMatch && propertyMatch;
  });

  // Sort filtered data
  const sortedData = [...filteredData].sort((a, b) => {
    switch (sortBy) {
      case 'Budget Tertinggi':
        const budgetA = extractBudgetNumber(a.budget);
        const budgetB = extractBudgetNumber(b.budget);
        return budgetB - budgetA;
      
      case 'Budget Terendah':
        const budgetAsc = extractBudgetNumber(a.budget);
        const budgetBsc = extractBudgetNumber(b.budget);
        return budgetAsc - budgetBsc;
      
      case 'Kompetisi Terendah':
        // Sort by creation date (newer projects might have fewer bids)
        return new Date(b.createdAt?.toDate?.() || b.createdAt || 0) - new Date(a.createdAt?.toDate?.() || a.createdAt || 0);
      
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

  // Helper function to extract budget number for sorting
  const extractBudgetNumber = (budget) => {
    if (!budget || typeof budget !== 'string') return 0;
    const numbers = budget.replace(/[^\d]/g, '');
    return parseInt(numbers) || 0;
  };

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

  const handleRetry = () => {
    setError(null);
    setLoading(true);
    setMarketData([]); // Clear existing data
    // Trigger re-load by changing a dependency
    window.location.reload();
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

  const handleCreateOffer = (project) => {
    setSelectedProject(project);
    setShowOfferModal(true);
  };

  const handleViewDetails = (project) => {
    setSelectedProject(project);
    setShowDetailsModal(true);
  };

  const closeModals = () => {
    setShowOfferModal(false);
    setShowDetailsModal(false);
    setSelectedProject(null);
  };

  const toggleBookmark = (projectId) => {
    setBookmarkedProjects(prev => 
      prev.includes(projectId) 
        ? prev.filter(id => id !== projectId)
        : [...prev, projectId]
    );
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
            Discover projects open for tender and bidding
          </p>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
            <div className="flex">
              <svg className="w-5 h-5 text-red-400 dark:text-red-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <div className="ml-3 flex-1">
                <h3 className="text-sm font-medium text-red-800 dark:text-red-200">Error loading tender projects</h3>
                <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                  <p>{error}</p>
                </div>
                <div className="mt-3">
                  <button
                    onClick={handleRetry}
                    className="bg-red-100 hover:bg-red-200 dark:bg-red-800 dark:hover:bg-red-700 text-red-800 dark:text-red-200 px-3 py-1 rounded text-sm font-medium transition-colors mr-2"
                  >
                    Try Again
                  </button>
                  <button
                    onClick={() => window.location.reload()}
                    className="bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 px-3 py-1 rounded text-sm font-medium transition-colors"
                  >
                    Refresh Page
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-slate-600 dark:text-slate-400">Loading tender projects...</p>
          </div>
        ) : (
          <>
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
        {sortedData.length === 0 ? (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-slate-400 dark:text-slate-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">No tender projects found</h3>
            <p className="text-slate-500 dark:text-slate-400">
              {marketData.length === 0 
                ? "There are no projects currently open for tender."
                : "No projects match your current filter criteria. Try adjusting your filters."
              }
            </p>
          </div>
        ) : (
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
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1 line-clamp-2 h-14 flex items-start">
                      <span className="leading-tight">
                        {project.projectTitle}
                      </span>
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
                    {/* Bookmark Button */}
                    <button
                      onClick={() => toggleBookmark(project.id)}
                      className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors mb-2"
                      title={bookmarkedProjects.includes(project.id) ? "Remove bookmark" : "Add bookmark"}
                    >
                      <svg 
                        className={`w-5 h-5 ${
                          bookmarkedProjects.includes(project.id) 
                            ? "text-yellow-500 fill-yellow-500" 
                            : "text-slate-400 hover:text-yellow-500"
                        }`} 
                        fill={bookmarkedProjects.includes(project.id) ? "currentColor" : "none"} 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Scope */}
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-slate-900 dark:text-white mb-2">Ruang Lingkup</h4>
                  <div className="flex flex-wrap gap-1">
                    {(Array.isArray(project.scope) ? project.scope : [project.scope]).filter(Boolean).map((scopeItem, index) => (
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
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Budget</p>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">{project.budget}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Duration</p>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">{project.duration}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Deadline</p>
                    <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${getBidCountdownColor(project.bidCountdown)}`}>
                      {project.bidCountdown}
                    </span>
                  </div>
                  <div>
                    {/* Empty space for alignment */}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex space-x-3">
                  <button 
                    onClick={() => handleCreateOffer(project)}
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-medium rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  >
                    Buat Penawaran
                  </button>
                  <button 
                    onClick={() => handleViewDetails(project)}
                    className="px-4 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 text-sm font-medium rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                  >
                    View Details
                  </button>
                </div>
              </div>
            </div>
          ))}
          </div>
        )}

        {/* Load More - only show if there are projects */}
        {sortedData.length > 0 && (
          <div className="text-center mt-8">
            <button className="px-6 py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-medium rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
              Load More Projects
            </button>
          </div>
        )}

        {/* Create Offer Modal */}
        {showOfferModal && selectedProject && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto scrollbar-hide">
              <div className="p-6">
                {/* Modal Header */}
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                    Buat Penawaran
                  </h2>
                  <button
                    onClick={closeModals}
                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Project Info */}
                <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-4 mb-6">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                    {selectedProject.projectTitle}
                  </h3>
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                      selectedProject.projectType === "Desain"
                        ? "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400"
                        : selectedProject.projectType === "Bangun"
                        ? "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400"
                        : selectedProject.projectType === "Renovasi"
                        ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                        : "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400"
                    }`}>
                      {selectedProject.projectType}
                    </span>
                    <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300">
                      {selectedProject.propertyType}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Budget: {selectedProject.budget} | Duration: {selectedProject.duration}
                  </p>
                </div>

                {/* Offer Form */}
                <form className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Penawaran Harga
                    </label>
                    <input
                      type="text"
                      placeholder="Masukkan penawaran harga Anda"
                      className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Estimasi Waktu Pengerjaan
                    </label>
                    <input
                      type="text"
                      placeholder="Contoh: 3 bulan"
                      className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Deskripsi Penawaran
                    </label>
                    <textarea
                      rows={4}
                      placeholder="Jelaskan detail penawaran, metodologi, dan keunggulan Anda..."
                      className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:text-white resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Upload Portfolio/Dokumen Pendukung
                    </label>
                    <div className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg p-6 text-center">
                      <svg className="w-12 h-12 mx-auto text-slate-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        Drag & drop files here, or click to select
                      </p>
                    </div>
                  </div>

                  {/* Modal Actions */}
                  <div className="flex space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={closeModals}
                      className="flex-1 px-6 py-3 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-medium rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                    >
                      Kirim Penawaran
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* View Details Modal */}
        {showDetailsModal && selectedProject && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
            <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-6xl w-full max-h-[95vh] overflow-hidden relative border border-slate-200/30 dark:border-slate-700/30 ring-1 ring-slate-900/5 dark:ring-slate-100/5 animate-in slide-in-from-bottom-4 duration-300">
              {/* Modal Header - Sticky */}
              <div className="sticky top-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-700/50 px-8 py-6 flex items-center justify-between z-10">
                <div>
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-slate-900 via-slate-800 to-slate-700 dark:from-white dark:via-slate-100 dark:to-slate-300 bg-clip-text text-transparent">
                    Detail Proyek
                  </h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">
                    Informasi lengkap proyek untuk referensi penawaran
                  </p>
                </div>
                <button
                  onClick={closeModals}
                  className="p-3 hover:bg-slate-100/80 dark:hover:bg-slate-800/80 rounded-2xl transition-all duration-200 hover:scale-105 group"
                >
                  <svg className="w-6 h-6 text-slate-500 group-hover:text-slate-700 dark:text-slate-400 dark:group-hover:text-slate-200 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Modal Content - Scrollable with hidden scrollbar */}
              <div 
                className="overflow-y-auto px-8 pb-12 scrollbar-hide" 
                style={{ 
                  maxHeight: 'calc(95vh - 180px)',
                  scrollbarWidth: 'none',
                  msOverflowStyle: 'none',
                  WebkitScrollbar: { display: 'none' }
                }}
              >
                <div className="space-y-8 pt-6">
                  {/* Project Overview Card */}
                  <div className="relative bg-gradient-to-br from-blue-50/80 via-indigo-50/60 to-purple-50/80 dark:from-slate-800/90 dark:via-slate-800/70 dark:to-slate-700/80 rounded-2xl p-6 border border-slate-200/50 dark:border-slate-600/30 shadow-lg shadow-slate-900/5 backdrop-blur-sm">
                    {/* Decorative elements */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-indigo-400/10 to-blue-400/10 rounded-full blur-2xl"></div>
                    
                    <div className="relative">
                      {/* Judul Proyek */}
                      <div className="mb-6">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                          </div>
                          <div>
                            <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-300 tracking-wide uppercase">Judul Proyek</h3>
                            <div className="w-12 h-0.5 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full mt-1"></div>
                          </div>
                        </div>
                        <p className="text-xl font-bold text-slate-900 dark:text-white leading-relaxed">
                          {selectedProject.projectTitle || "Bangun Interior Rumah BSD Minimalis Modern"}
                        </p>
                      </div>

                      {/* Location with icon */}
                      <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400">
                        <div className="w-8 h-8 bg-slate-100 dark:bg-slate-700 rounded-lg flex items-center justify-center">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        </div>
                        <span className="font-medium">{selectedProject.location || "Jakarta Selatan"}</span>
                      </div>
                    </div>
                  </div>

                  {/* Project Classification Section */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Jenis Proyek */}
                    <div className="relative group">
                      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10 dark:from-purple-500/5 dark:to-pink-500/5 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300"></div>
                      <div className="relative bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-2xl p-6 border border-slate-200/50 dark:border-slate-600/30 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center shadow-md">
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a1.994 1.994 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                            </svg>
                          </div>
                          <h4 className="text-sm font-semibold text-slate-600 dark:text-slate-300 tracking-wide uppercase">Jenis Proyek</h4>
                        </div>
                        <span className={`inline-flex items-center px-4 py-2 text-sm font-semibold rounded-full shadow-sm ${
                          selectedProject.projectType === "Desain"
                            ? "bg-gradient-to-r from-purple-100 to-purple-200 text-purple-800 dark:from-purple-900/40 dark:to-purple-800/40 dark:text-purple-300"
                            : selectedProject.projectType === "Bangun"
                            ? "bg-gradient-to-r from-orange-100 to-orange-200 text-orange-800 dark:from-orange-900/40 dark:to-orange-800/40 dark:text-orange-300"
                            : selectedProject.projectType === "Renovasi"
                            ? "bg-gradient-to-r from-green-100 to-green-200 text-green-800 dark:from-green-900/40 dark:to-green-800/40 dark:text-green-300"
                            : "bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 dark:from-gray-900/40 dark:to-gray-800/40 dark:text-gray-300"
                        }`}>
                          {selectedProject.projectType}
                        </span>
                      </div>
                    </div>

                    {/* Properti */}
                    <div className="relative group">
                      <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 dark:from-emerald-500/5 dark:to-teal-500/5 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300"></div>
                      <div className="relative bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-2xl p-6 border border-slate-200/50 dark:border-slate-600/30 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center shadow-md">
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                            </svg>
                          </div>
                          <h4 className="text-sm font-semibold text-slate-600 dark:text-slate-300 tracking-wide uppercase">Properti</h4>
                        </div>
                        <span className="inline-flex items-center px-4 py-2 text-sm font-semibold bg-gradient-to-r from-slate-100 to-slate-200 text-slate-700 dark:from-slate-600/50 dark:to-slate-700/50 dark:text-slate-300 rounded-full shadow-sm">
                          {selectedProject.propertyType}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Ruang Lingkup */}
                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-indigo-500/5 rounded-2xl blur-xl"></div>
                    <div className="relative bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-2xl p-6 border border-slate-200/50 dark:border-slate-600/30 shadow-lg">
                      <div className="flex items-center gap-3 mb-5">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-md">
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                          </svg>
                        </div>
                        <h4 className="text-sm font-semibold text-slate-600 dark:text-slate-300 tracking-wide uppercase">Ruang Lingkup</h4>
                      </div>
                      <div className="flex flex-wrap gap-3">
                        {(Array.isArray(selectedProject.scope) ? selectedProject.scope : [selectedProject.scope]).filter(Boolean).map((scopeItem, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-4 py-2 text-sm font-medium bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 dark:from-blue-900/40 dark:to-blue-800/40 dark:text-blue-300 rounded-full shadow-sm hover:shadow-md transition-all duration-200 hover:scale-105"
                          >
                            {scopeItem}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Financial & Timeline Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Estimasi Anggaran */}
                    <div className="relative group">
                      <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 to-yellow-500/10 dark:from-amber-500/5 dark:to-yellow-500/5 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300"></div>
                      <div className="relative bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-2xl p-6 border border-slate-200/50 dark:border-slate-600/30 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-yellow-600 rounded-lg flex items-center justify-center shadow-md">
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                            </svg>
                          </div>
                          <h4 className="text-sm font-semibold text-slate-600 dark:text-slate-300 tracking-wide uppercase">Estimasi Anggaran</h4>
                        </div>
                        <p className="text-2xl font-bold bg-gradient-to-r from-amber-600 to-yellow-600 dark:from-amber-400 dark:to-yellow-400 bg-clip-text text-transparent">
                          {selectedProject.budget}
                        </p>
                      </div>
                    </div>

                    {/* Estimasi Durasi Proyek */}
                    <div className="relative group">
                      <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 dark:from-cyan-500/5 dark:to-blue-500/5 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300"></div>
                      <div className="relative bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-2xl p-6 border border-slate-200/50 dark:border-slate-600/30 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center shadow-md">
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                          <h4 className="text-sm font-semibold text-slate-600 dark:text-slate-300 tracking-wide uppercase">Estimasi Durasi</h4>
                        </div>
                        <p className="text-lg font-semibold text-slate-700 dark:text-slate-300">{selectedProject.duration}</p>
                      </div>
                    </div>

                    {/* Durasi Tender */}
                    <div className="relative group">
                      <div className="absolute inset-0 bg-gradient-to-r from-rose-500/10 to-pink-500/10 dark:from-rose-500/5 dark:to-pink-500/5 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300"></div>
                      <div className="relative bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-2xl p-6 border border-slate-200/50 dark:border-slate-600/30 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-8 h-8 bg-gradient-to-br from-rose-500 to-pink-600 rounded-lg flex items-center justify-center shadow-md">
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                          </div>
                          <h4 className="text-sm font-semibold text-slate-600 dark:text-slate-300 tracking-wide uppercase">Durasi Tender</h4>
                        </div>
                        <span className={`inline-flex items-center px-4 py-2 text-sm font-semibold rounded-full shadow-sm ${getBidCountdownColor(selectedProject.bidCountdown)}`}>
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {selectedProject.bidCountdown}
                        </span>
                      </div>
                    </div>

                    {/* Estimasi Mulai Proyek */}
                    <div className="relative group">
                      <div className="absolute inset-0 bg-gradient-to-r from-violet-500/10 to-purple-500/10 dark:from-violet-500/5 dark:to-purple-500/5 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300"></div>
                      <div className="relative bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-2xl p-6 border border-slate-200/50 dark:border-slate-600/30 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-purple-600 rounded-lg flex items-center justify-center shadow-md">
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                          <h4 className="text-sm font-semibold text-slate-600 dark:text-slate-300 tracking-wide uppercase">Estimasi Mulai</h4>
                        </div>
                        <p className="text-lg font-semibold text-slate-700 dark:text-slate-300">Q1 2025</p>
                      </div>
                    </div>
                  </div>

                  {/* Catatan Khusus */}
                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 to-purple-500/5 rounded-2xl blur-xl"></div>
                    <div className="relative bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-2xl p-6 border border-slate-200/50 dark:border-slate-600/30 shadow-lg">
                      <div className="flex items-center gap-3 mb-5">
                        <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center shadow-md">
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                        <h4 className="text-sm font-semibold text-slate-600 dark:text-slate-300 tracking-wide uppercase">Catatan Khusus</h4>
                      </div>
                      <div className="bg-gradient-to-br from-slate-50/80 to-slate-100/80 dark:from-slate-700/50 dark:to-slate-800/50 rounded-xl p-5 border border-slate-200/50 dark:border-slate-600/30">
                        <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-sm">
                          Harap mempertimbangkan aspek keamanan dan kenyamanan selama proses konstruksi. 
                          Koordinasi dengan tetangga untuk meminimalkan gangguan. Dokumentasi progress harian diperlukan. 
                          Material harus eco-friendly dan bergaransi minimal 5 tahun.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Actions - Sticky Footer */}
              <div className="sticky bottom-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-t border-slate-200/50 dark:border-slate-700/50 px-8 py-6 shadow-2xl shadow-slate-900/5">
                <div className="flex space-x-4">
                  <button
                    onClick={closeModals}
                    className="flex-1 px-6 py-3.5 border-2 border-slate-300/60 dark:border-slate-600/60 text-slate-700 dark:text-slate-300 font-semibold rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-slate-400/80 dark:hover:border-slate-500/80 transition-all duration-200 hover:scale-[1.02]"
                  >
                    Tutup
                  </button>
                  <button
                    onClick={() => {
                      closeModals();
                      handleCreateOffer(selectedProject);
                    }}
                    className="flex-1 px-6 py-3.5 bg-gradient-to-r from-blue-600 via-blue-600 to-indigo-600 hover:from-blue-700 hover:via-blue-700 hover:to-indigo-700 text-white font-semibold rounded-2xl transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-[1.02] flex items-center justify-center gap-3 group"
                  >
                    <svg className="w-5 h-5 group-hover:rotate-90 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Buat Penawaran
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        </>
        )}
      </main>
  )
}

export default Tender