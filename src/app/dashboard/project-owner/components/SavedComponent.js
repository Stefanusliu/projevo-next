'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function SavedComponent() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('All Locations');

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
      savedDate: "2024-06-15",
      budget: "Rp 2.5 - 3.5 Miliar",
      timeline: "6 months"
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
      savedDate: "2024-06-14",
      budget: "Rp 15 - 20 Miliar",
      timeline: "18 months"
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
      savedDate: "2024-06-13",
      budget: "Rp 800 Juta - 1.2 Miliar",
      timeline: "4 months"
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
      savedDate: "2024-06-12",
      budget: "Rp 1.5 - 2 Miliar",
      timeline: "3 months"
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
      savedDate: "2024-06-11",
      budget: "Rp 500 - 800 Juta",
      timeline: "2 months"
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
      savedDate: "2024-06-10",
      budget: "Rp 25 - 30 Miliar",
      timeline: "24 months"
    },
    {
      id: 7,
      projectType: "Interior Design",
      title: "Modern Coworking Space Design",
      location: "Menteng, Jakarta",
      profileName: "Space Innovators",
      contractType: "Contract",
      status: "available",
      projectStatus: "Open for Tender",
      savedDate: "2024-06-09",
      budget: "Rp 750 Juta - 1 Miliar",
      timeline: "3 months"
    },
    {
      id: 8,
      projectType: "Renovation",
      title: "Historic Building Restoration",
      location: "Kota Tua, Jakarta",
      profileName: "Heritage Builders",
      contractType: "Tender",
      status: "available",
      projectStatus: "Specialist Required",
      savedDate: "2024-06-08",
      budget: "Rp 3 - 4 Miliar",
      timeline: "8 months"
    }
  ]);

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
      case 'Specialist Required':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default:
        return 'bg-slate-100 text-slate-800 dark:bg-slate-900/20 dark:text-slate-400';
    }
  };

  const getProjectTypeColor = (projectType) => {
    switch (projectType) {
      case 'Interior Design':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'Construction':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'Architecture':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400';
      case 'Renovation':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400';
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
    <div className="space-y-8">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Saved Projects</h1>
            <p className="text-slate-600 dark:text-slate-400">
              Projects you&apos;ve bookmarked for later review • {filteredProjects.length} projects
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

      {/* Search and Filter Section */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex-1 min-w-64">
            <div className="relative">
              <input
                type="text"
                placeholder="Search saved projects..."
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
          </div>
          <select
            value={selectedLocation}
            onChange={(e) => setSelectedLocation(e.target.value)}
            className="px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {locations.map((location) => (
              <option key={location} value={location}>
                {location}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Project Cards */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
        {filteredProjects.map((project) => (
          <div key={project.id} className="p-6 border-b border-slate-200 dark:border-slate-700 last:border-b-0 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium ${getProjectTypeColor(project.projectType)}`}>
                      {project.projectType}
                    </span>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${getStatusColor(project.status)}`}>
                      {project.status}
                    </span>
                  </div>
                  <button
                    onClick={() => handleUnsaveProject(project.id)}
                    className="p-2 text-yellow-600 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all duration-200 group"
                    title="Remove from saved"
                  >
                    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                      <path d="M17 3H7c-1.1 0-2 .9-2 2v16l7-3 7 3V5c0-1.1-.9-2-2-2z"/>
                    </svg>
                  </button>
                </div>

                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2 leading-tight">
                    {project.title}
                  </h3>
                  <div className="flex items-center space-x-4 text-sm text-slate-600 dark:text-slate-400">
                    <div className="flex items-center">
                      <svg className="w-4 h-4 mr-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span>{project.location}</span>
                    </div>
                    <div className="flex items-center">
                      <svg className="w-4 h-4 mr-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <span>{project.profileName}</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Budget</div>
                    <div className="text-sm font-semibold text-slate-900 dark:text-white">{project.budget}</div>
                  </div>
                  <div>
                    <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Timeline</div>
                    <div className="text-sm font-semibold text-slate-900 dark:text-white">{project.timeline}</div>
                  </div>
                  <div>
                    <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Contract Type</div>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${
                      project.contractType === 'Contract' 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                        : 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400'
                    }`}>
                      {project.contractType}
                    </span>
                  </div>
                  <div>
                    <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Status</div>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${getProjectStatusColor(project.projectStatus)}`}>
                      {project.projectStatus}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-xs text-slate-400 dark:text-slate-500">
                    Saved on {new Date(project.savedDate).toLocaleDateString('id-ID', { 
                      day: 'numeric', 
                      month: 'long',
                      year: 'numeric'
                    })}
                  </div>
                  <div className="flex space-x-2">
                    <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors">
                      View Details
                    </button>
                    <button className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors">
                      Apply Now
                    </button>
                  </div>
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
                : 'Start saving projects you&apos;re interested in to see them here.'
              }
            </p>
            <button 
              className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
              onClick={() => {
                setSearchQuery('');
                setSelectedLocation('All Locations');
              }}
            >
              {searchQuery || selectedLocation !== 'All Locations' ? 'Clear Filters' : 'Browse Projects'}
            </button>
          </div>
        )}
      </div>

      {/* Summary Stats */}
      {filteredProjects.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6 text-center">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-2">{filteredProjects.length}</div>
            <div className="text-slate-600 dark:text-slate-400 text-sm">Total Saved Projects</div>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6 text-center">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400 mb-2">
              {filteredProjects.filter(p => p.status === 'available').length}
            </div>
            <div className="text-slate-600 dark:text-slate-400 text-sm">Available Projects</div>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6 text-center">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 mb-2">
              {new Set(filteredProjects.map(p => p.projectType)).size}
            </div>
            <div className="text-slate-600 dark:text-slate-400 text-sm">Project Types</div>
          </div>
        </div>
      )}
    </div>
  );
}