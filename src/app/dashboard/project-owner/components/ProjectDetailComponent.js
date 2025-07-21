'use client';
import React, { useState } from 'react';
import Image from 'next/image';

export default function ProjectDetailComponent({ project, onBack }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [imageErrors, setImageErrors] = useState({});

  // Dummy image fallback
  const dummyImage = "data:image/svg+xml,%3Csvg width='300' height='200' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='100%25' height='100%25' fill='%23f1f5f9'/%3E%3Ctext x='50%25' y='50%25' font-size='14' fill='%2364748b' text-anchor='middle' dy='.3em'%3EImage not available%3C/text%3E%3C/svg%3E";

  const handleImageError = (imageId) => {
    setImageErrors(prev => ({ ...prev, [imageId]: true }));
  };

  // Sample project data - replace with actual project data
  const projectData = {
    id: project.id,
    title: project.title || 'Modern Cafe Interior Design Jakarta',
    progress: project.progress || 75,
    status: project.status || 'In Progress',
    dueDate: project.dueDate || 'March 15, 2025',
    budget: project.budget || 'Rp 185.000.000',
    phases: [
      { name: 'Planning', completed: true },
      { name: 'Design', completed: true },
      { name: 'Construction', completed: false, current: true },
      { name: 'Finishing', completed: false },
      { name: 'Handover', completed: false }
    ],
    client: {
      name: 'PT. Kopi Nusantara',
      contact: 'Budi Santoso',
      email: 'budi@kopinusantara.co.id',
      phone: '+62 21 5555-1234',
      avatar: '/api/placeholder/60/60'
    },
    recentActivities: [
      {
        id: 1,
        type: 'update',
        title: 'Interior Design Approval Completed',
        description: 'All interior design mockups have been approved by client with modern minimalist theme',
        user: 'Interior Design Team',
        timestamp: '2 hours ago'
      },
      {
        id: 2,
        type: 'milestone',
        title: 'Construction Phase Started',
        description: 'Interior construction work has begun with partition and ceiling installation',
        user: 'Main Contractor',
        timestamp: '1 day ago'
      },
      {
        id: 3,
        type: 'comment',
        title: 'Client Feedback Received',
        description: 'Client provided input regarding material selection and room color scheme',
        user: 'Budi Santoso',
        timestamp: '3 days ago'
      }
    ],
    documents: [
      { id: 1, name: 'Project Budget Estimate.pdf', size: '3.2 MB', uploadDate: 'January 15, 2025' },
      { id: 2, name: 'Design Drawings.dwg', size: '28.4 MB', uploadDate: 'January 20, 2025' },
      { id: 3, name: 'Material Specifications.docx', size: '2.1 MB', uploadDate: 'January 22, 2025' },
      { id: 4, name: 'Building Permits.pdf', size: '1.8 MB', uploadDate: 'January 10, 2025' }
    ],
    gallery: [
      { id: 1, title: 'Main Area Design Concept', description: 'Seating area layout with modern concept', uploadDate: 'January 20, 2025', url: '/api/placeholder/300/200' },
      { id: 2, title: 'Bar Counter Design', description: 'Counter concept with teak wood material', uploadDate: 'January 21, 2025', url: '/api/placeholder/300/200' },
      { id: 3, title: 'Construction Progress', description: 'Room partition installation progress', uploadDate: 'January 22, 2025', url: '/api/placeholder/300/200' },
      { id: 4, title: 'Material Sample', description: 'Floor and wall material samples', uploadDate: 'January 18, 2025', url: '/api/placeholder/300/200' }
    ]
  };

  const tabs = [
    { 
      id: 'overview', 
      label: 'Overview', 
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      )
    },
    { 
      id: 'client', 
      label: 'Client Details', 
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      )
    },
    { 
      id: 'documents', 
      label: 'Documents', 
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      )
    },
    { 
      id: 'gallery', 
      label: 'Gallery', 
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      )
    },
    { 
      id: 'activity', 
      label: 'Activity', 
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      )
    }
  ];

  const getActivityIcon = (type) => {
    const iconProps = {
      className: "w-4 h-4",
      fill: "none",
      stroke: "currentColor",
      viewBox: "0 0 24 24"
    };

    switch (type) {
      case 'update':
        return (
          <svg {...iconProps}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        );
      case 'milestone':
        return (
          <svg {...iconProps}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        );
      case 'comment':
        return (
          <svg {...iconProps}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        );
      case 'file':
        return (
          <svg {...iconProps}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
          </svg>
        );
      case 'task':
        return (
          <svg {...iconProps}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      default:
        return (
          <svg {...iconProps}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm dark:bg-slate-800/90 border-b border-gray-200/50 dark:border-slate-700/50 sticky top-0 z-50">
        {/* Breadcrumb */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2 border-b border-gray-100 dark:border-slate-700/50">
          <nav className="flex items-center space-x-2 text-sm">
            <button 
              onClick={onBack}
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              All Projects
            </button>
            <span className="text-gray-400">›</span>
            <span className="text-gray-600 dark:text-gray-400 truncate">{projectData.title}</span>
          </nav>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-4 min-w-0 flex-1">
              <button
                onClick={onBack}
                className="p-2 rounded-xl bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 transition-all duration-200 hover:scale-105 flex-shrink-0"
              >
                <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div className="min-w-0 flex-1">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white truncate">{projectData.title}</h1>
                <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-2">
                  <span className={`px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${
                    projectData.status === 'In Progress' 
                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
                      : projectData.status === 'Selesai'
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                      : projectData.status === 'Menunggu Persetujuan'
                      ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
                  }`}>
                    {projectData.status}
                  </span>
                  <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Deadline: {projectData.dueDate}</span>
                  <span className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">{projectData.budget}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-3 w-full sm:w-auto">
              <button className="flex-1 sm:flex-none px-4 sm:px-6 py-2 sm:py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 text-sm sm:text-base">
                💬 Chat
              </button>
              <button className="flex-1 sm:flex-none px-4 sm:px-6 py-2 sm:py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 text-sm sm:text-base">
                📋 Request Change
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white/80 backdrop-blur-sm dark:bg-slate-800/90 border-b border-gray-200/50 dark:border-slate-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Project Progress</span>
            <span className="text-lg font-bold text-blue-600 dark:text-blue-400">{projectData.progress}%</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-4 shadow-inner">
            <div 
              className="bg-gradient-to-r from-blue-500 via-blue-600 to-purple-600 h-4 rounded-full transition-all duration-1000 ease-out shadow-lg"
              style={{ width: `${projectData.progress}%` }}
            ></div>
          </div>
          <div className="flex justify-between mt-6 overflow-x-auto pb-2">
            {projectData.phases.map((phase, index) => (
              <div key={index} className="flex flex-col items-center min-w-0 flex-1 px-1">
                <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold transition-all duration-300 ${
                  phase.completed 
                    ? 'bg-green-500 text-white shadow-lg scale-110' 
                    : phase.current 
                    ? 'bg-blue-500 text-white shadow-lg scale-110 animate-pulse'
                    : 'bg-gray-300 text-gray-600 dark:bg-slate-600 dark:text-gray-400'
                }`}>
                  {phase.completed ? '✓' : index + 1}
                </div>
                <span className="text-xs text-gray-600 dark:text-gray-400 mt-2 text-center leading-tight">{phase.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white/80 backdrop-blur-sm dark:bg-slate-800/90 border-b border-gray-200/50 dark:border-slate-700/50 sticky top-20 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex space-x-2 sm:space-x-8 overflow-x-auto pb-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-3 sm:py-4 px-3 sm:px-2 border-b-2 font-medium text-xs sm:text-sm transition-all duration-200 whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400 transform scale-105'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 hover:border-gray-300'
                }`}
              >
                <span className="mr-1 sm:mr-2 flex items-center">{tab.icon}</span>
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
            {/* Recent Activity */}
            <div className="lg:col-span-2">
              <div className="bg-white/80 backdrop-blur-sm dark:bg-slate-800/90 rounded-2xl p-4 sm:p-6 border border-gray-200/50 dark:border-slate-700/50 shadow-lg">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">Recent Activity</h3>
                  <button className="text-blue-600 dark:text-blue-400 text-sm hover:underline">View All</button>
                </div>
                <div className="space-y-4 sm:space-y-6">
                  {projectData.recentActivities.map((activity, index) => (
                    <div key={activity.id} className="flex items-start space-x-3 sm:space-x-4 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
                      <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center text-sm sm:text-lg">
                        {getActivityIcon(activity.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-0">
                          <h4 className="text-sm font-semibold text-gray-900 dark:text-white">{activity.title}</h4>
                          <span className="text-xs text-gray-500 dark:text-gray-400">{activity.timestamp}</span>
                        </div>
                        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">{activity.description}</p>
                        <p className="text-xs text-blue-600 dark:text-blue-400 mt-2 font-medium">oleh {activity.user}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar with Calendar & Stats */}
            <div className="space-y-6">
              {/* Project Calendar */}
              <div className="bg-white/80 backdrop-blur-sm dark:bg-slate-800/90 rounded-2xl p-4 sm:p-6 border border-gray-200/50 dark:border-slate-700/50 shadow-lg">
                <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white mb-4">Upcoming Schedule</h3>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                    <div className="text-2xl">📅</div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">Construction Progress Review</p>
                      <p className="text-xs text-blue-600 dark:text-blue-400">10 March 2025</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-xl">
                    <div className="text-2xl">🎯</div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">Client Presentation</p>
                      <p className="text-xs text-orange-600 dark:text-orange-400">15 March 2025</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-xl">
                    <div className="text-2xl">🏗️</div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">Start Finishing Phase</p>
                      <p className="text-xs text-green-600 dark:text-green-400">20 March 2025</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Project Stats */}
              <div className="bg-white/80 backdrop-blur-sm dark:bg-slate-800/90 rounded-2xl p-4 sm:p-6 border border-gray-200/50 dark:border-slate-700/50 shadow-lg">
                <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white mb-4">Project Statistics</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-xl">
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">18</div>
                    <div className="text-xs text-green-700 dark:text-green-300">Tasks Completed</div>
                  </div>
                  <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">6</div>
                    <div className="text-xs text-blue-700 dark:text-blue-300">Remaining Tasks</div>
                  </div>
                  <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
                    <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">124h</div>
                    <div className="text-xs text-purple-700 dark:text-purple-300">Work Hours</div>
                  </div>
                  <div className="text-center p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl">
                    <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">8</div>
                    <div className="text-xs text-indigo-700 dark:text-indigo-300">Team Members</div>
                  </div>
                </div>
              </div>

              {/* Team Members */}
              <div className="bg-white/80 backdrop-blur-sm dark:bg-slate-800/90 rounded-2xl p-4 sm:p-6 border border-gray-200/50 dark:border-slate-700/50 shadow-lg">
                <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white mb-4">Project Team</h3>
                <div className="space-y-3">
                  {[
                    { name: 'Arif Wijaya', role: 'Lead Architect', avatar: '👨‍🎨' },
                    { name: 'Sari Indah', role: 'Interior Designer', avatar: '👩‍🎨' },
                    { name: 'Budi Konstruksi', role: 'Contractor', avatar: '👷‍♂️' },
                    { name: 'Maya Project', role: 'Project Manager', avatar: '👩‍💼' }
                  ].map((member, index) => (
                    <div key={index} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
                      <div className="w-8 h-8 bg-gray-200 dark:bg-slate-700 rounded-full flex items-center justify-center text-sm">
                        {member.avatar}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{member.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{member.role}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'client' && (
          <div className="max-w-4xl mx-auto">
            <div className="bg-white/80 backdrop-blur-sm dark:bg-slate-800/90 rounded-2xl p-6 sm:p-8 border border-gray-200/50 dark:border-slate-700/50 shadow-lg">
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-6 sm:mb-8">Client Information</h3>
              <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-6 mb-8">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-2xl sm:text-3xl text-white shadow-lg">
                  🏢
                </div>
                <div className="flex-1">
                  <h4 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">{projectData.client.name}</h4>
                  <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">{projectData.client.contact}</p>
                  <div className="flex items-center space-x-2 mt-2">
                    <span className="px-2 py-1 bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400 text-xs rounded-full">Active Client</span>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
                <div className="space-y-4">
                  <div className="p-4 bg-gray-50 dark:bg-slate-700/50 rounded-xl">
                    <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      Email Address
                    </label>
                    <p className="text-gray-900 dark:text-white font-medium">{projectData.client.email}</p>
                    <button className="text-blue-600 dark:text-blue-400 hover:underline text-sm mt-1">Send Email</button>
                  </div>
                  <div className="p-4 bg-gray-50 dark:bg-slate-700/50 rounded-xl">
                    <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      Phone Number
                    </label>
                    <p className="text-gray-900 dark:text-white font-medium">{projectData.client.phone}</p>
                    <button className="text-blue-600 dark:text-blue-400 hover:underline text-sm mt-1">Call Now</button>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="p-4 bg-gray-50 dark:bg-slate-700/50 rounded-xl">
                    <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                      Company
                    </label>
                    <p className="text-gray-900 dark:text-white font-medium">{projectData.client.name}</p>
                  </div>
                  <div className="p-4 bg-gray-50 dark:bg-slate-700/50 rounded-xl">
                    <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      Project Location
                    </label>
                    <p className="text-gray-900 dark:text-white font-medium">Jakarta Selatan, Indonesia</p>
                  </div>
                  <div className="p-4 bg-gray-50 dark:bg-slate-700/50 rounded-xl">
                    <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                      </svg>
                      Contract Value
                    </label>
                    <p className="text-gray-900 dark:text-white font-medium text-lg">{projectData.budget}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'documents' && (
          <div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 sm:mb-8">
              <div>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Project Documents</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">Budget estimates, technical drawings, and supporting documents</p>
              </div>
              <button className="w-full sm:w-auto flex items-center justify-center px-4 sm:px-6 py-2 sm:py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                </svg>
                Upload Document
              </button>
            </div>
            <div className="bg-white/80 backdrop-blur-sm dark:bg-slate-800/90 rounded-2xl border border-gray-200/50 dark:border-slate-700/50 shadow-lg overflow-hidden">
              {projectData.documents.map((doc, index) => (
                <div key={doc.id} className={`p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors ${index !== projectData.documents.length - 1 ? 'border-b border-gray-200 dark:border-slate-700' : ''}`}>
                  <div className="flex items-center space-x-4 flex-1">
                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-xl flex items-center justify-center text-blue-600 dark:text-blue-400 flex-shrink-0">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base">{doc.name}</h4>
                      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">{doc.size} • {doc.uploadDate}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 w-full sm:w-auto">
                    <button className="flex-1 sm:flex-none px-3 sm:px-4 py-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors text-sm font-medium">
                      Preview
                    </button>
                    <button className="flex-1 sm:flex-none px-3 sm:px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-900/20 rounded-lg transition-colors text-sm font-medium">
                      Download
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'gallery' && (
          <div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 sm:mb-8">
              <div>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Project Gallery</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">Progress visuals and design documentation</p>
              </div>
              <button className="w-full sm:w-auto flex items-center justify-center px-4 sm:px-6 py-2 sm:py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Add Image
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {projectData.gallery.map((image, index) => (
                <div key={image.id} className="bg-white/80 backdrop-blur-sm dark:bg-slate-800/90 rounded-2xl overflow-hidden border border-gray-200/50 dark:border-slate-700/50 group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                  <div className="aspect-video bg-gradient-to-br from-gray-200 to-gray-300 dark:from-slate-700 dark:to-slate-600 relative overflow-hidden">
                    <Image
                      src={imageErrors[`gallery-${image.id}`] ? dummyImage : image.url}
                      alt={image.title}
                      width={300}
                      height={200}
                      className="w-full h-full object-cover"
                      onError={() => handleImageError(`gallery-${image.id}`)}
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <div className="flex space-x-2">
                        <button className="px-3 py-2 bg-white text-gray-900 rounded-lg font-medium text-sm hover:bg-gray-100 transition-colors">
                          View
                        </button>
                        <button className="px-3 py-2 bg-blue-600 text-white rounded-lg font-medium text-sm hover:bg-blue-700 transition-colors">
                          Download
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 sm:p-5">
                    <h4 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base">{image.title}</h4>
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">{image.description}</p>
                    <div className="flex items-center justify-between mt-3">
                      <p className="text-xs text-gray-500 dark:text-gray-500">{image.uploadDate}</p>
                      <div className="flex items-center space-x-1">
                        <button className="p-1 hover:bg-gray-100 dark:hover:bg-slate-700 rounded">
                          <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                          </svg>
                        </button>
                        <button className="p-1 hover:bg-gray-100 dark:hover:bg-slate-700 rounded">
                          <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {/* Add New Image Card */}
              <div className="bg-white/60 backdrop-blur-sm dark:bg-slate-800/60 rounded-2xl border-2 border-dashed border-gray-300 dark:border-slate-600 group hover:border-blue-500 dark:hover:border-blue-400 transition-all duration-300 cursor-pointer min-h-[300px] flex flex-col items-center justify-center">
                <div className="text-6xl text-gray-400 dark:text-slate-500 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors mb-4">
                  📷
                </div>
                <p className="text-gray-600 dark:text-gray-400 font-medium mb-2">Add New Image</p>
                <p className="text-xs text-gray-500 dark:text-gray-500 text-center px-4">Click to upload or drag and drop</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'activity' && (
          <div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 sm:mb-8">
              <div>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Activity Timeline</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">Complete project activity history</p>
              </div>
              <div className="flex items-center space-x-2">
                <select className="px-3 py-2 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  <option>All Activities</option>
                  <option>Update</option>
                  <option>Milestone</option>
                  <option>Comments</option>
                </select>
                <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors">
                  Export
                </button>
              </div>
            </div>
            
            <div className="bg-white/80 backdrop-blur-sm dark:bg-slate-800/90 rounded-2xl p-6 sm:p-8 border border-gray-200/50 dark:border-slate-700/50 shadow-lg">
              <div className="space-y-6 sm:space-y-8">
                {[
                  { 
                    icon: (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    ), 
                    title: 'Design proposal uploaded', 
                    desc: 'New design proposal has been submitted by CV. Kreasi Interior with updated color scheme and layout', 
                    time: '2 hours ago', 
                    user: 'CV. Kreasi Interior',
                    type: 'file',
                    priority: 'high'
                  },
                  { 
                    icon: (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    ), 
                    title: 'Phase 2 completed', 
                    desc: 'Interior layout phase has been completed successfully. All deliverables have been approved by client', 
                    time: '1 day ago', 
                    user: 'Project Manager',
                    type: 'milestone',
                    priority: 'high'
                  },
                  { 
                    icon: (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                    ), 
                    title: 'New message received', 
                    desc: 'Client provided detailed feedback regarding color scheme and material selection', 
                    time: '2 days ago', 
                    user: 'Budi Santoso',
                    type: 'comment',
                    priority: 'medium'
                  },
                  { 
                    icon: (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    ), 
                    title: 'Contract change requested', 
                    desc: 'Additional lighting requirements added to scope. Budget adjustment needed', 
                    time: '3 days ago', 
                    user: 'CV. Kreasi Interior',
                    type: 'contract',
                    priority: 'high'
                  },
                  {
                    icon: (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    ), 
                    title: 'Milestone achieved', 
                    desc: 'Design phase milestone achieved ahead of schedule', 
                    time: '1 week ago', 
                    user: 'Design Team',
                    type: 'milestone',
                    priority: 'medium'
                  }
                ].map((activity, index) => (
                  <div key={index} className="relative">
                    {index !== 4 && (
                      <div className="absolute left-6 top-14 w-px h-16 bg-gradient-to-b from-gray-200 to-transparent dark:from-slate-700 dark:to-transparent"></div>
                    )}
                    <div className="flex flex-col sm:flex-row items-start space-y-3 sm:space-y-0 sm:space-x-6 p-4 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-all duration-200 group">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl flex-shrink-0 shadow-lg ${
                        activity.type === 'milestone' ? 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400' :
                        activity.type === 'file' ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' :
                        activity.type === 'comment' ? 'bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400' :
                        activity.type === 'contract' ? 'bg-orange-100 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400' :
                        'bg-gray-100 dark:bg-gray-900/20 text-gray-600 dark:text-gray-400'
                      }`}>
                        {activity.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h4 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{activity.title}</h4>
                              {activity.priority === 'high' && (
                                <span className="px-2 py-1 bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-xs rounded-full font-medium">
                                  High Priority
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-3">{activity.desc}</p>
                            <div className="flex items-center space-x-4">
                              <span className="text-sm text-blue-600 dark:text-blue-400 font-medium">by {activity.user}</span>
                              <span className="text-xs text-gray-500 dark:text-gray-500">•</span>
                              <span className="text-xs text-gray-500 dark:text-gray-500">{activity.time}</span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2 mt-2 sm:mt-0">
                            <button className="p-2 hover:bg-gray-200 dark:hover:bg-slate-600 rounded-lg transition-colors">
                              <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                              </svg>
                            </button>
                            <button className="p-2 hover:bg-gray-200 dark:hover:bg-slate-600 rounded-lg transition-colors">
                              <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Load More Button */}
              <div className="mt-8 text-center">
                <button className="px-6 py-3 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 text-gray-700 dark:text-gray-300 rounded-xl font-medium transition-colors">
                  Load More Activities
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Floating Action Button - Mobile Only */}
      <div className="fixed bottom-6 right-6 sm:hidden z-50">
        <div className="flex flex-col space-y-3">
          <button className="w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center transform hover:scale-110">
            💬
          </button>
          <button className="w-14 h-14 bg-orange-600 hover:bg-orange-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center transform hover:scale-110">
            📋
          </button>
        </div>
      </div>

      {/* Progress Indicator - Mobile */}
      <div className="fixed top-20 left-0 right-0 h-1 bg-gray-200 dark:bg-slate-700 sm:hidden z-40">
        <div 
          className="h-full bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-500"
          style={{ width: `${(tabs.findIndex(tab => tab.id === activeTab) + 1) / tabs.length * 100}%` }}
        ></div>
      </div>
    </div>
  );
}
