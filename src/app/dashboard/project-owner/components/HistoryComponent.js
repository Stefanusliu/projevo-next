'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../../../contexts/AuthContext';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '../../../../lib/firebase';
import Link from 'next/link';

export default function HistoryComponent() {
  const { user, userProfile } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('All Locations');
  const [selectedStatus, setSelectedStatus] = useState('All Status');
  const [selectedTimeRange, setSelectedTimeRange] = useState('All Time');
  const [completedProjects, setCompletedProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load completed projects from Firestore
  useEffect(() => {
    if (!user?.uid) {
      setLoading(false);
      return;
    }
    
    console.log('Loading completed projects for user:', user.uid);
    setLoading(true);
    
    // Simple query first - get all user's projects and filter client-side
    const projectsQuery = query(
      collection(db, 'projects'),
      where('ownerId', '==', user.uid)
    );
    
    const unsubscribe = onSnapshot(projectsQuery, (snapshot) => {
      const projectsData = [];
      snapshot.forEach((doc) => {
        const data = { id: doc.id, ...doc.data() };
        // Filter completed projects on the client side
        if (['Completed', 'Cancelled', 'Terminated', 'Expired'].includes(data.status)) {
          projectsData.push(data);
        }
      });
      
      // Sort by completedDate or createdAt
      projectsData.sort((a, b) => {
        const dateA = new Date(a.completedDate || a.createdAt?.seconds ? a.createdAt.seconds * 1000 : a.createdAt || 0);
        const dateB = new Date(b.completedDate || b.createdAt?.seconds ? b.createdAt.seconds * 1000 : b.createdAt || 0);
        return dateB - dateA; // Newest first
      });
      
      console.log('Loaded completed projects:', projectsData);
      setCompletedProjects(projectsData);
      setLoading(false);
    }, (error) => {
      console.error('Error loading completed projects:', error);
      setLoading(false);
    });
    
    return () => unsubscribe();
  }, [user?.uid]);

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

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed':
        return 'bg-blue-600 text-white';
      case 'Cancelled':
        return 'bg-gray-600 text-white';
      case 'Terminated':
        return 'bg-gray-600 text-white';
      case 'Expired':
        return 'bg-gray-600 text-white';
      default:
        return 'bg-gray-600 text-white';
    }
  };

  const getFinalStatusColor = (finalStatus) => {
    if (finalStatus.includes('Successfully') || finalStatus.includes('Excellence') || finalStatus.includes('Outstanding')) {
      return 'bg-blue-600 text-white';
    } else if (finalStatus.includes('Cancelled') || finalStatus.includes('Terminated') || finalStatus.includes('Expired')) {
      return 'bg-gray-600 text-white';
    } else if (finalStatus.includes('Delivered')) {
      return 'bg-blue-600 text-white';
    }
    return 'bg-gray-600 text-white';
  };

  const getProjectTypeColor = (projectType) => {
    switch (projectType) {
      case 'Interior Design':
        return 'bg-blue-600 text-white';
      case 'Construction':
        return 'bg-gray-600 text-white';
      case 'Architecture':
        return 'bg-gray-600 text-white';
      case 'Renovation':
        return 'bg-gray-600 text-white';
      default:
        return 'bg-gray-600 text-white';
    }
  };

  const renderStarRating = (rating) => {
    if (!rating) return <span className="text-gray-500 text-sm">No rating</span>;
    
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <svg
            key={star}
            className={`w-4 h-4 ${star <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
        <span className="text-sm font-medium text-gray-600 ml-1">
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
    const matchesLocation = selectedLocation === 'All Locations' || 
      (project.location || project.city || '').includes(selectedLocation);
    const matchesStatus = selectedStatus === 'All Status' || project.status === selectedStatus;
    const matchesSearch = searchQuery === '' || 
      (project.title || project.projectTitle || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (project.profileName || project.description || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (project.projectType || project.category || '').toLowerCase().includes(searchQuery.toLowerCase());
    
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

  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: '#2373FF' }}></div>
        <span className="ml-3 text-gray-600">Loading project history...</span>
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto space-y-10 p-10">
      {/* Header Section */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-4xl font-bold text-black mb-1">Project History</h1>
            <p className="text-gray-600 text-base">
              View all your completed and past projects <span className="text-blue-600 font-semibold">• {filteredProjects.length} projects</span>
            </p>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Historical Data</span>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-blue-600 mb-1">{stats.completed}</div>
            <div className="text-sm text-gray-600 font-medium">Completed</div>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-gray-600 mb-1">{stats.cancelled}</div>
            <div className="text-sm text-gray-600 font-medium">Cancelled</div>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-gray-600 mb-1">{stats.terminated}</div>
            <div className="text-sm text-gray-600 font-medium">Terminated</div>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-gray-600 mb-1">{stats.expired}</div>
            <div className="text-sm text-gray-600 font-medium">Expired</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-4">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex flex-col md:flex-row gap-4 flex-1">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 bg-white text-black rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {statusOptions.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="px-4 py-2 border border-gray-300 bg-white text-black rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {locations.map((location) => (
                <option key={location} value={location}>
                  {location}
                </option>
              ))}
            </select>
            <select
              value={selectedTimeRange}
              onChange={(e) => setSelectedTimeRange(e.target.value)}
              className="px-4 py-2 border border-gray-300 bg-white text-black rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {timeRanges.map((range) => (
                <option key={range} value={range}>
                  {range}
                </option>
              ))}
            </select>
          </div>
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search by project name, contractor, or type..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 bg-white text-black rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Project History Cards */}
      <div className="bg-white border border-gray-200 rounded-lg divide-y divide-gray-200">
        {filteredProjects.map((project) => (
          <div key={project.id} className="p-6 hover:bg-gray-50 transition-colors">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-3">
              <div className="flex items-center space-x-3">
                <span className={`inline-flex items-center px-2.5 py-1 text-xs font-medium rounded ${getProjectTypeColor(project.projectType)}`}>
                  {project.projectType}
                </span>
                <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded ${getStatusColor(project.status)}`}>
                  {project.status}
                </span>
              </div>
              <div className="text-xs text-gray-500 text-right">
                <div className="font-medium">Completed</div>
                <div>{new Date(project.completedDate).toLocaleDateString('id-ID', { 
                  day: '2-digit', 
                  month: 'short',
                  year: 'numeric'
                })}</div>
              </div>
            </div>

            <div className="mb-3 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
              <h3 className="text-lg font-semibold text-black leading-tight">
                {project.title || project.projectTitle}
              </h3>
              <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                <div className="flex items-center">
                  <svg className="w-4 h-4 mr-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>{project.location || project.city || 'Location not specified'}</span>
                </div>
                <div className="flex items-center">
                  <svg className="w-4 h-4 mr-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span>{project.profileName || project.companyName || 'Client not specified'}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
              <div>
                <div className="text-xs font-medium text-gray-500 mb-1">Budget</div>
                <div className="text-sm font-semibold text-black">
                  {formatCurrency(project.budget || project.estimatedBudget || '0')}
                </div>
              </div>
              <div>
                <div className="text-xs font-medium text-gray-500 mb-1">Duration</div>
                <div className="text-sm font-semibold text-black">
                  {project.duration || project.estimatedDuration || 'Not specified'}
                </div>
              </div>
              <div>
                <div className="text-xs font-medium text-gray-500 mb-1">Final Status</div>
                <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded ${getFinalStatusColor(project.finalStatus)}`}>
                  {project.finalStatus}
                </span>
              </div>
              <div>
                <div className="text-xs font-medium text-gray-500 mb-1">Rating</div>
                <div className="flex items-center">
                  {renderStarRating(project.rating)}
                </div>
              </div>
            </div>

            {/* Expandable Details */}
            <div className="pt-4 border-t border-gray-100">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-gray-600">
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
                  <div>{project.customId || `#${project.id.toString().padStart(4, '0')}`}</div>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Empty State */}
        {filteredProjects.length === 0 && (
          <div className="text-center py-16">
            <svg className="w-24 h-24 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-lg font-medium text-black mb-2">No project history found</h3>
            <p className="text-gray-600 mb-4">
              {searchQuery || selectedStatus !== 'All Status' || selectedLocation !== 'All Locations'
                ? 'Try adjusting your search criteria or filters.'
                : 'Your completed projects will appear here.'
              }
            </p>
            <button 
              className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white transition-colors font-medium rounded"
              onClick={() => {
                setSearchQuery('');
                setSelectedStatus('All Status');
                setSelectedLocation('All Locations');
                setSelectedTimeRange('All Time');
              }}
            >
              {searchQuery || selectedStatus !== 'All Status' || selectedLocation !== 'All Locations' ? 'Clear Filters' : 'Browse Active Projects'}
            </button>
          </div>
        )}
      </div>

      {/* Additional Statistics */}
      {filteredProjects.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <div className="bg-white border border-gray-200 rounded-lg p-6 text-center">
            <div className="text-2xl font-bold text-blue-600 mb-2">
              {(filteredProjects.filter(p => p.rating).reduce((sum, p) => sum + p.rating, 0) / filteredProjects.filter(p => p.rating).length || 0).toFixed(1)}
            </div>
            <div className="text-gray-600 text-sm">Average Rating</div>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-6 text-center">
            <div className="text-2xl font-bold text-blue-600 mb-2">
              {Math.round((filteredProjects.filter(p => p.status === 'Completed').length / filteredProjects.length) * 100) || 0}%
            </div>
            <div className="text-gray-600 text-sm">Success Rate</div>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-6 text-center">
            <div className="text-2xl font-bold text-blue-600 mb-2">
              {new Set(filteredProjects.map(p => p.projectType)).size}
            </div>
            <div className="text-gray-600 text-sm">Project Types</div>
          </div>
        </div>
      )}
    </div>
  );
}