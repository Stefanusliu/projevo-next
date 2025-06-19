'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function VendorDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const stats = [
    { name: 'Active Bids', value: '8', change: '+3 this week', color: 'bg-gradient-to-r from-blue-500 to-blue-600', icon: 'M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
    { name: 'Won Projects', value: '34', change: '+5 this month', color: 'bg-gradient-to-r from-green-500 to-green-600', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
    { name: 'Pending Reviews', value: '12', change: '4 need attention', color: 'bg-gradient-to-r from-yellow-500 to-yellow-600', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
    { name: 'Total Earnings', value: '$45,280', change: '+$8,500 this month', color: 'bg-gradient-to-r from-purple-500 to-purple-600', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1' }
  ];

  const availableProjects = [
    {
      id: 1,
      title: 'E-commerce Website Development',
      client: 'RetailMax Corp',
      status: 'Open for Bids',
      budget: '$18,000',
      deadline: '2025-08-15',
      proposals: 15,
      category: 'Web Development',
      match: 95
    },
    {
      id: 2,
      title: 'Mobile App UI/UX Design',
      client: 'StartupTech Inc',
      status: 'Open for Bids',
      budget: '$12,500',
      deadline: '2025-07-30',
      proposals: 8,
      category: 'Design',
      match: 88
    },
    {
      id: 3,
      title: 'Digital Marketing Campaign',
      client: 'GrowthLab',
      status: 'Open for Bids',
      budget: '$8,000',
      deadline: '2025-07-20',
      proposals: 23,
      category: 'Marketing',
      match: 76
    },
    {
      id: 4,
      title: 'Brand Identity Package',
      client: 'Creative Boutique',
      status: 'Open for Bids',
      budget: '$6,500',
      deadline: '2025-08-10',
      proposals: 12,
      category: 'Branding',
      match: 82
    }
  ];

  const myProjects = [
    {
      id: 1,
      title: 'Corporate Website Redesign',
      client: 'TechCorp Solutions',
      status: 'In Progress',
      budget: '$15,000',
      deadline: '2025-07-15',
      progress: 75,
      category: 'Web Development'
    },
    {
      id: 2,
      title: 'Marketing Website',
      client: 'GrowthLab',
      status: 'Under Review',
      budget: '$12,500',
      deadline: '2025-06-15',
      progress: 100,
      category: 'Web Development'
    },
    {
      id: 3,
      title: 'Brand Identity Design',
      client: 'Creative Studio',
      status: 'Completed',
      budget: '$8,500',
      deadline: '2025-06-01',
      progress: 100,
      category: 'Design'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Header */}
      <header className="bg-white dark:bg-slate-800 shadow-sm border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            {/* Logo */}
            <div className="flex items-center">
              <Link href="/" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">P</span>
                </div>
                <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Projevo
                </span>
              </Link>
            </div>

            {/* User menu */}
            <div className="flex items-center space-x-4">
              {/* Demo Dashboard Switcher */}
              <Link 
                href="/dashboard/project-owner"
                className="hidden md:flex items-center px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 dark:text-blue-400 dark:bg-blue-900/20 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
              >
                Switch to Project Owner View
              </Link>
              
              <div className="hidden md:flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">AS</span>
                </div>
                <div className="text-sm">
                  <p className="font-medium text-slate-900 dark:text-white">Alex Smith</p>
                  <p className="text-slate-500 dark:text-slate-400">Vendor • Verified</p>
                </div>
              </div>
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="md:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <div className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 transition-transform duration-300 ease-in-out fixed md:static inset-y-0 left-0 z-50 w-64 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 pt-16 md:pt-0`}>
          <nav className="p-4 space-y-2">
            <a href="#" className="flex items-center space-x-3 px-3 py-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 font-medium">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
              </svg>
              <span>Dashboard</span>
            </a>
            <a href="#" className="flex items-center space-x-3 px-3 py-2 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <span>Find Projects</span>
            </a>
            <a href="#" className="flex items-center space-x-3 px-3 py-2 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>My Projects</span>
            </a>
            <a href="#" className="flex items-center space-x-3 px-3 py-2 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v6a2 2 0 002 2h2m0-8a2 2 0 012-2h6a2 2 0 012 2v6a2 2 0 01-2 2h-6m4-6v6m4-4v2" />
              </svg>
              <span>My Proposals</span>
            </a>
            <a href="#" className="flex items-center space-x-3 px-3 py-2 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <span>Messages</span>
            </a>
            <a href="#" className="flex items-center space-x-3 px-3 py-2 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span>Profile</span>
            </a>
            <a href="#" className="flex items-center space-x-3 px-3 py-2 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <span>Earnings</span>
            </a>
            <a href="#" className="flex items-center space-x-3 px-3 py-2 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>Settings</span>
            </a>
          </nav>

          {/* Logout */}
          <div className="absolute bottom-4 left-4 right-4">
            <Link
              href="/login"
              className="flex items-center space-x-3 px-3 py-2 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-700 dark:hover:text-red-400 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span>Logout</span>
            </Link>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 md:ml-0">
          <main className="p-6">
            {/* Welcome section */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                Welcome back, Alex! 💼
              </h1>
              <p className="text-slate-600 dark:text-slate-400">
                Discover new opportunities, manage your projects, and grow your business with Projevo.
              </p>
            </div>

            {/* Quick Actions */}
            <div className="mb-8 flex flex-wrap gap-4">
              <button className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-lg font-medium hover:from-green-700 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
                Browse New Projects
              </button>
              <button className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 px-6 py-3 rounded-lg font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                Update Profile
              </button>
              <button className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 px-6 py-3 rounded-lg font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                View Earnings
              </button>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {stats.map((stat, index) => (
                <div key={index} className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-600 dark:text-slate-400">{stat.name}</p>
                      <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{stat.value}</p>
                    </div>
                    <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center`}>
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={stat.icon} />
                      </svg>
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">{stat.change}</p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Available Projects */}
              <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">
                  <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Available Projects</h2>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {availableProjects.map((project) => (
                      <div key={project.id} className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-medium text-slate-900 dark:text-white">{project.title}</h3>
                            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                              Client: {project.client} • Category: {project.category}
                            </p>
                            <div className="flex items-center space-x-4 mt-2">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                                {project.match}% Match
                              </span>
                              <span className="text-xs text-slate-500 dark:text-slate-400">
                                Due: {new Date(project.deadline).toLocaleDateString()}
                              </span>
                              <span className="text-xs text-blue-600 dark:text-blue-400">
                                {project.proposals} proposals
                              </span>
                            </div>
                          </div>
                          <div className="text-right ml-4">
                            <p className="text-sm font-medium text-slate-900 dark:text-white">{project.budget}</p>
                            <button className="mt-2 px-3 py-1 bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-xs rounded-lg hover:from-blue-600 hover:to-indigo-600 transition-all">
                              Submit Proposal
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-6 text-center">
                    <button className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium text-sm">
                      View All Projects →
                    </button>
                  </div>
                </div>
              </div>

              {/* My Projects */}
              <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">
                  <h2 className="text-lg font-semibold text-slate-900 dark:text-white">My Projects</h2>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {myProjects.map((project) => (
                      <div key={project.id} className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-medium text-slate-900 dark:text-white">{project.title}</h3>
                            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                              Client: {project.client} • Category: {project.category}
                            </p>
                            <div className="flex items-center space-x-4 mt-2">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                project.status === 'Completed' 
                                  ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                                  : project.status === 'In Progress'
                                  ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
                                  : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                              }`}>
                                {project.status}
                              </span>
                              <span className="text-xs text-slate-500 dark:text-slate-400">
                                Due: {new Date(project.deadline).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                          <div className="text-right ml-4">
                            <p className="text-sm font-medium text-slate-900 dark:text-white">{project.budget}</p>
                            <div className="flex items-center space-x-2 mt-1">
                              <div className="w-20 bg-slate-200 dark:bg-slate-600 rounded-full h-2">
                                <div 
                                  className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full"
                                  style={{ width: `${project.progress}%` }}
                                ></div>
                              </div>
                              <span className="text-xs text-slate-500 dark:text-slate-400">{project.progress}%</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-6 text-center">
                    <button className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium text-sm">
                      View All Projects →
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
