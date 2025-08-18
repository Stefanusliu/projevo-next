'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../../../contexts/AuthContext';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '../../../../lib/firebase';

export default function HistoryComponent() {
  const { user } = useAuth();
  const [activeFilter, setActiveFilter] = useState('All');
  const [selectedYear, setSelectedYear] = useState('all');
  const [selectedProject, setSelectedProject] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  const handleViewDetails = (project) => {
    // Show project details inline
    setSelectedProject(project);
    setShowDetails(true);
  };

  const handleBackToList = () => {
    setShowDetails(false);
    setSelectedProject(null);
  };

  const [projectHistory, setProjectHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const filters = ['All', 'completed', 'in-progress', 'cancelled', 'on-hold'];
  const years = ['2024', '2023', '2022', '2021', '2020'];

  // Load vendor's completed and historical projects from Firebase
  useEffect(() => {
    if (!user?.uid) {
      setLoading(false);
      return;
    }

    console.log('Loading project history for vendor:', user.uid);
    setLoading(true);

    // Query projects where the current user is the selected vendor
    const projectsQuery = query(
      collection(db, 'projects'),
      where('selectedVendorId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(projectsQuery, (snapshot) => {
      const vendorProjects = [];
      
      snapshot.forEach((doc) => {
        const projectData = doc.data();
        
        // Map project data to history format
        const historyItem = {
          id: doc.id,
          title: projectData.title || projectData.projectTitle || 'Untitled Project',
          ownerName: projectData.ownerName || 'Unknown Client',
          ownerEmail: projectData.ownerEmail,
          status: projectData.status || 'in-progress',
          category: projectData.category || 'General',
          location: projectData.location || 'Not specified',
          budget: projectData.budget,
          description: projectData.description,
          createdAt: projectData.createdAt,
          completedAt: projectData.completedAt,
          selectedBid: projectData.selectedBid,
          timeline: projectData.timeline,
          rating: projectData.vendorRating || 0
        };
        
        vendorProjects.push(historyItem);
      });
      
      console.log('Loaded vendor projects:', vendorProjects);
      setProjectHistory(vendorProjects);
      setLoading(false);
    }, (error) => {
      console.error('Error loading vendor projects:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user?.uid]);

  // Filter projects based on status and year
  const filteredHistory = projectHistory.filter(project => {
    const matchesFilter = activeFilter === 'All' || project.status === activeFilter;
    const projectYear = project.createdAt ? new Date(project.createdAt.toDate()).getFullYear().toString() : new Date().getFullYear().toString();
    const matchesYear = projectYear === selectedYear;
    return matchesFilter && matchesYear;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'on-hold':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-slate-100 text-slate-800';
    }
  };

  const getCategoryIcon = (category) => {
    return (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    );
  };

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <svg
          key={i}
          className={`w-4 h-4 ${i <= rating ? 'text-yellow-400' : 'text-slate-300'}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      );
    }
    return stars;
  };

  const stats = {
    totalProjects: projectHistory.length,
    completedProjects: projectHistory.filter(p => p.status === 'completed').length,
    totalEarnings: projectHistory
      .filter(p => p.status === 'completed' && p.budget)
      .reduce((sum, p) => {
        const budget = typeof p.budget === 'number' ? p.budget : parseFloat(p.budget) || 0;
        return sum + budget;
      }, 0),
    averageRating: projectHistory.length > 0 ? 
      projectHistory.reduce((sum, p) => sum + (p.rating || 0), 0) / projectHistory.length : 0,
    successRate: projectHistory.length > 0 ? 
      Math.round((projectHistory.filter(p => p.status === 'completed').length / projectHistory.length) * 100) : 0
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-slate-600">Loading project history...</span>
      </div>
    );
  }

  // Show project details view
  if (showDetails && selectedProject) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="border-b border-slate-200 pb-6">
          <button
            onClick={handleBackToList}
            className="flex items-center text-slate-600 hover:text-slate-900 mb-4 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to History
          </button>
          <h1 className="text-2xl font-bold text-slate-900">Project Details</h1>
          <p className="text-slate-600">Complete information about this project</p>
        </div>

        {/* Project Details Content */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
          <div className="flex justify-between items-start mb-6">
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-slate-900 mb-2">{selectedProject.title}</h2>
              <div className="flex items-center space-x-4 mb-4">
                <span className={`inline-flex px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(selectedProject.status)}`}>
                  {selectedProject.status || 'Unknown'}
                </span>
                {selectedProject.rating && (
                  <div className="flex items-center space-x-2">
                    <div className="flex">{renderStars(selectedProject.rating)}</div>
                    <span className="text-slate-600">({selectedProject.rating}/5)</span>
                  </div>
                )}
              </div>
              <p className="text-slate-600 leading-relaxed">{selectedProject.description || 'No description available'}</p>
            </div>
            <div className="text-right ml-8">
              <div className="text-3xl font-bold text-slate-900 mb-2">
                {new Intl.NumberFormat('id-ID', {
                  style: 'currency',
                  currency: 'IDR',
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0,
                }).format(selectedProject.budget || 0)}
              </div>
              <p className="text-slate-600">Project Budget</p>
            </div>
          </div>

          {/* Project Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-900 border-b border-slate-200 pb-2">Basic Information</h3>
              <div>
                <label className="text-sm font-medium text-slate-600">Location</label>
                <p className="text-slate-900">{selectedProject.location || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600">Category</label>
                <p className="text-slate-900">{selectedProject.category || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600">Duration</label>
                <p className="text-slate-900">{selectedProject.timeline ? `${selectedProject.timeline} days` : 'N/A'}</p>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-900 border-b border-slate-200 pb-2">Timeline</h3>
              <div>
                <label className="text-sm font-medium text-slate-600">Start Date</label>
                <p className="text-slate-900">
                  {selectedProject.createdAt ? 
                    new Date(selectedProject.createdAt.toDate()).toLocaleDateString('id-ID', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    }) : 'N/A'
                  }
                </p>
              </div>
              {selectedProject.completedAt && (
                <div>
                  <label className="text-sm font-medium text-slate-600">Completion Date</label>
                  <p className="text-slate-900">
                    {new Date(selectedProject.completedAt.toDate()).toLocaleDateString('id-ID', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-900 border-b border-slate-200 pb-2">Client Information</h3>
              <div>
                <label className="text-sm font-medium text-slate-600">Client Name</label>
                <p className="text-slate-900">{selectedProject.ownerName || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600">Final Amount</label>
                <p className="text-slate-900">
                  {selectedProject.selectedBid ? 
                    new Intl.NumberFormat('id-ID', {
                      style: 'currency',
                      currency: 'IDR',
                      minimumFractionDigits: 0
                    }).format(selectedProject.selectedBid.amount) : 'N/A'
                  }
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-4 mt-8">
            {selectedProject.status === 'completed' && (
              <button className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors font-medium">
                Download Certificate
              </button>
            )}
            <button className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors font-medium">
              View Portfolio Entry
            </button>
            <button 
              onClick={handleBackToList}
              className="px-6 py-3 bg-slate-600 hover:bg-slate-700 text-white rounded-lg transition-colors font-medium"
            >
              Back to History
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Project History</h2>
          <p className="text-slate-600">Your complete portfolio of awarded projects and achievements</p>
        </div>
        <button className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-medium hover:from-blue-700 hover:to-blue-800 transition-all duration-200">
          Export Portfolio
        </button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-lg p-4 border border-slate-200">
          <div className="text-2xl font-bold text-slate-900">{stats.totalProjects}</div>
          <div className="text-sm text-slate-600">Total Projects</div>
        </div>
        <div className="bg-white rounded-lg p-4 border border-slate-200">
          <div className="text-2xl font-bold text-green-600">{stats.completedProjects}</div>
          <div className="text-sm text-slate-600">Completed</div>
        </div>
        <div className="bg-white rounded-lg p-4 border border-slate-200">
          <div className="text-2xl font-bold text-blue-600">
            {new Intl.NumberFormat('id-ID', {
              style: 'currency',
              currency: 'IDR',
              notation: 'compact',
              maximumFractionDigits: 1
            }).format(stats.totalEarnings)}
          </div>
          <div className="text-sm text-slate-600">Total Earnings</div>
        </div>
        <div className="bg-white rounded-lg p-4 border border-slate-200">
          <div className="text-2xl font-bold text-yellow-600">{stats.averageRating.toFixed(1)}</div>
          <div className="text-sm text-slate-600">Avg Rating</div>
        </div>
        <div className="bg-white rounded-lg p-4 border border-slate-200">
          <div className="text-2xl font-bold text-blue-600">{stats.successRate}%</div>
          <div className="text-sm text-slate-600">Success Rate</div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center">
        <div className="flex flex-wrap gap-2">
          {filters.map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeFilter === filter
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {filter === 'All' ? 'All' : filter.charAt(0).toUpperCase() + filter.slice(1).replace('-', ' ')}
            </button>
          ))}
        </div>
        <select
          value={selectedYear}
          onChange={(e) => setSelectedYear(e.target.value)}
          className="px-4 py-2 border border-slate-300 rounded-lg bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {years.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
      </div>

      {/* Project History List */}
      <div className="space-y-6">
        {filteredHistory.map((project) => (
          <div
            key={project.id}
            className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-lg transition-all duration-200 cursor-pointer"
            onClick={() => handleViewDetails(project)}
          >
            <div className="p-6">
              {/* Project Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start space-x-4">
                  <div className="p-3 bg-blue-100 rounded-lg text-blue-600">
                    {getCategoryIcon(project.category)}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-slate-900 mb-1">
                      {project.title}
                    </h3>
                    <p className="text-slate-600 mb-2">
                      {project.ownerName} • {project.location}
                    </p>
                    <div className="flex items-center space-x-4 text-sm text-slate-500">
                      <span>Started: {project.createdAt ? new Date(project.createdAt.toDate()).toLocaleDateString() : 'TBD'}</span>
                      {project.completedAt && <span>Completed: {new Date(project.completedAt.toDate()).toLocaleDateString()}</span>}
                      <span>Budget: {project.budget ? new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(project.budget) : 'TBD'}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(project.status)}`}>
                    {project.status.charAt(0).toUpperCase() + project.status.slice(1).replace('-', ' ')}
                  </span>
                  {project.rating > 0 && (
                    <div className="flex items-center space-x-1 mt-2">
                      {renderStars(project.rating)}
                      <span className="text-sm text-slate-600 ml-1">
                        {project.rating.toFixed(1)}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Project Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h4 className="text-sm font-medium text-slate-700 mb-2">Project Details</h4>
                  <div className="space-y-2">
                    {project.description && (
                      <p className="text-sm text-slate-600">{project.description}</p>
                    )}
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Category:</span>
                      <span className="text-slate-900">{project.category}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Budget:</span>
                      <span className="text-slate-900 font-medium">
                        {project.budget ? new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(project.budget) : 'TBD'}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-slate-700 mb-2">Project Status</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Status:</span>
                      <span className="text-slate-900">{project.status.charAt(0).toUpperCase() + project.status.slice(1).replace('-', ' ')}</span>
                    </div>
                    {project.selectedBid && (
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600">Your Bid:</span>
                        <span className="text-slate-900">
                          {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(project.selectedBid.amount)}
                        </span>
                      </div>
                    )}
                    {project.timeline && (
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600">Timeline:</span>
                        <span className="text-slate-900">{project.timeline} days</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex space-x-3">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleViewDetails(project);
                  }}
                  className="flex-1 px-4 py-2 bg-blue-50 text-blue-700 text-sm font-medium rounded-lg hover:bg-blue-100 transition-colors"
                >
                  View Full Details
                </button>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    alert('Download report functionality');
                  }}
                  className="px-4 py-2 bg-slate-100 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-200 transition-colors"
                >
                  Download Report
                </button>
                {project.status === 'completed' && (
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      alert('Use as reference functionality');
                    }}
                    className="px-4 py-2 bg-green-50 text-green-700 text-sm font-medium rounded-lg hover:bg-green-100 transition-colors"
                  >
                    Use as Reference
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredHistory.length === 0 && (
        <div className="text-center py-12">
          <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-12 h-12 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-slate-900 mb-2">No projects found</h3>
          <p className="text-slate-500 mb-4">
            No awarded projects match your current filters for {selectedYear}.
          </p>
          <button className="px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-medium hover:from-blue-700 hover:to-blue-800 transition-all duration-200">
            Browse Marketplace
          </button>
        </div>
      )}
    </div>
  );
}
