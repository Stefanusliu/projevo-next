'use client';

import { useState } from 'react';
import Image from 'next/image';

export default function PendingComponent({ project, onBack }) {
  const [activeSection, setActiveSection] = useState('overview');

  // Enhanced pending project data structure
  const pendingProjectData = {
    id: project?.id || 4,
    projectName: project?.title || "Boutique Store Renovation",
    submittedDate: project?.submittedDate || "2024-05-15",
    projectType: project?.projectType || "Renovation",
    status: "Pending",
    client: {
      name: project?.client?.name || "Boutique Style Co.",
      contact: project?.client?.contact || "Maria Santoso", 
      email: project?.client?.email || "maria@boutiquestyle.co.id",
      phone: "+62 21 4444-5678",
      avatar: "/api/placeholder/60/60"
    },
    location: project?.location || "PIK Jakarta",
    estimatedDuration: project?.estimatedDuration || "3 months",
    proposedBudget: project?.budget || "Rp 95.000.000",
    pendingDetails: {
      submissionDate: project?.submittedDate || "2024-05-15",
      lastUpdate: project?.lastUpdate || "2024-06-10",
      pendingReason: project?.pendingReason || "Client Documentation Review",
      actionRequired: project?.actionRequired || "Awaiting client approval",
      priority: project?.priority || "Medium",
      daysWaiting: project?.daysWaiting || 35,
      nextFollowUp: project?.nextFollowUp || "2024-06-20",
      assignedTo: project?.assignedTo || "Project Manager"
    },
    proposal: {
      title: project?.title || "Modern Boutique Store Renovation",
      description: "Complete renovation proposal for a modern boutique store featuring contemporary design elements, improved customer flow, and enhanced retail display areas.",
      keyFeatures: [
        "Modern storefront design and lighting",
        "Optimized customer flow and layout", 
        "Enhanced product display systems",
        "Upgraded flooring and wall finishes",
        "Improved fitting room design"
      ],
      deliverables: [
        "Renovation design plans",
        "3D renderings and visualizations",
        "Material specifications",
        "Project timeline and phases",
        "Cost breakdown analysis"
      ],
      requirements: [
        "Building permits and approvals",
        "Structural assessment report",
        "Client final design approval",
        "Construction timeline coordination"
      ]
    },
    timeline: [
      {
        id: 1,
        date: "2024-05-15",
        title: "Initial Proposal Submitted",
        description: "Comprehensive renovation proposal submitted to client",
        status: "completed",
        type: "submission"
      },
      {
        id: 2,
        date: "2024-05-20",
        title: "Client Initial Review",
        description: "Client conducted initial review of proposal",
        status: "completed",
        type: "review"
      },
      {
        id: 3,
        date: "2024-05-25",
        title: "Design Modifications Requested",
        description: "Client requested minor design modifications",
        status: "completed",
        type: "feedback"
      },
      {
        id: 4,
        date: "2024-06-01",
        title: "Revised Proposal Submitted",
        description: "Updated proposal with client modifications submitted",
        status: "completed",
        type: "submission"
      },
      {
        id: 5,
        date: "2024-06-10",
        title: "Documentation Review",
        description: "Client reviewing final documentation and permits",
        status: "in-progress",
        type: "review"
      },
      {
        id: 6,
        date: "2024-06-20",
        title: "Follow-up Scheduled",
        description: "Next follow-up meeting with client scheduled",
        status: "upcoming",
        type: "meeting"
      }
    ]
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount.replace(/[^\d]/g, ''));
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getDaysWaitingColor = (days) => {
    if (days < 14) return 'text-green-600 dark:text-green-400';
    if (days < 30) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getPriorityColor = (priority) => {
    switch (priority.toLowerCase()) {
      case 'high':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'low':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getTimelineStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500';
      case 'in-progress':
        return 'bg-orange-500';
      case 'upcoming':
        return 'bg-gray-300 dark:bg-gray-600';
      default:
        return 'bg-gray-300 dark:bg-gray-600';
    }
  };

  const getTimelineTypeIcon = (type) => {
    switch (type) {
      case 'submission':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        );
      case 'review':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'feedback':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        );
      case 'meeting':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        );
      default:
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={onBack}
                className="flex items-center text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Projects
              </button>
              <div className="h-6 w-px bg-slate-300 dark:bg-slate-600"></div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                {pendingProjectData.projectName}
              </h1>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400">
                Pending
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
        <div className="px-6">
          <nav className="flex space-x-8">
            {[
              { id: 'overview', label: 'Pending Overview', icon: '⏳' },
              { id: 'proposal', label: 'Proposal Details', icon: '📋' },
              { id: 'timeline', label: 'Action Timeline', icon: '📅' }
            ].map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeSection === section.id
                    ? 'border-orange-500 text-orange-600 dark:text-orange-400'
                    : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'
                }`}
              >
                <span className="mr-2">{section.icon}</span>
                {section.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 py-6">
        {activeSection === 'overview' && (
          <div className="space-y-6">
            {/* Status Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white dark:bg-slate-800 rounded-lg p-6 border border-slate-200 dark:border-slate-700">
                <div className="flex items-center">
                  <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
                    <svg className="w-6 h-6 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Days Waiting</p>
                    <p className={`text-2xl font-bold ${getDaysWaitingColor(pendingProjectData.pendingDetails.daysWaiting)}`}>
                      {pendingProjectData.pendingDetails.daysWaiting}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-800 rounded-lg p-6 border border-slate-200 dark:border-slate-700">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                    <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Priority Level</p>
                    <span className={`inline-flex items-center px-2 py-1 rounded-md text-sm font-medium ${getPriorityColor(pendingProjectData.pendingDetails.priority)}`}>
                      {pendingProjectData.pendingDetails.priority}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-800 rounded-lg p-6 border border-slate-200 dark:border-slate-700">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                    <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Next Follow-up</p>
                    <p className="text-lg font-semibold text-slate-900 dark:text-white">
                      {formatDate(pendingProjectData.pendingDetails.nextFollowUp)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-800 rounded-lg p-6 border border-slate-200 dark:border-slate-700">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                    <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Project Budget</p>
                    <p className="text-lg font-semibold text-slate-900 dark:text-white">
                      {formatCurrency(pendingProjectData.proposedBudget)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Project Status Information */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-slate-800 rounded-lg p-6 border border-slate-200 dark:border-slate-700">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Pending Status</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600 dark:text-slate-400">Pending Reason:</span>
                    <span className="text-sm font-medium text-slate-900 dark:text-white">
                      {pendingProjectData.pendingDetails.pendingReason}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600 dark:text-slate-400">Action Required:</span>
                    <span className="text-sm font-medium text-slate-900 dark:text-white">
                      {pendingProjectData.pendingDetails.actionRequired}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600 dark:text-slate-400">Assigned To:</span>
                    <span className="text-sm font-medium text-slate-900 dark:text-white">
                      {pendingProjectData.pendingDetails.assignedTo}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600 dark:text-slate-400">Last Update:</span>
                    <span className="text-sm font-medium text-slate-900 dark:text-white">
                      {formatDate(pendingProjectData.pendingDetails.lastUpdate)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-800 rounded-lg p-6 border border-slate-200 dark:border-slate-700">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Client Information</h3>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Image 
                      src={pendingProjectData.client.avatar} 
                      alt={pendingProjectData.client.name}
                      width={48}
                      height={48}
                      className="w-12 h-12 rounded-full"
                    />
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white">
                        {pendingProjectData.client.name}
                      </p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        Contact: {pendingProjectData.client.contact}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600 dark:text-slate-400">Email:</span>
                      <span className="text-sm font-medium text-slate-900 dark:text-white">
                        {pendingProjectData.client.email}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600 dark:text-slate-400">Phone:</span>
                      <span className="text-sm font-medium text-slate-900 dark:text-white">
                        {pendingProjectData.client.phone}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Project Details */}
            <div className="bg-white dark:bg-slate-800 rounded-lg p-6 border border-slate-200 dark:border-slate-700">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Project Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
                  <p className="text-sm text-slate-600 dark:text-slate-400">Project Type</p>
                  <p className="text-lg font-semibold text-slate-900 dark:text-white">
                    {pendingProjectData.projectType}
                  </p>
                </div>
                <div className="text-center p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
                  <p className="text-sm text-slate-600 dark:text-slate-400">Location</p>
                  <p className="text-lg font-semibold text-slate-900 dark:text-white">
                    {pendingProjectData.location}
                  </p>
                </div>
                <div className="text-center p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
                  <p className="text-sm text-slate-600 dark:text-slate-400">Estimated Duration</p>
                  <p className="text-lg font-semibold text-slate-900 dark:text-white">
                    {pendingProjectData.estimatedDuration}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeSection === 'proposal' && (
          <div className="space-y-6">
            {/* Proposal Header */}
            <div className="bg-white dark:bg-slate-800 rounded-lg p-6 border border-slate-200 dark:border-slate-700">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                {pendingProjectData.proposal.title}
              </h2>
              <p className="text-slate-600 dark:text-slate-400 mb-4">
                {pendingProjectData.proposal.description}
              </p>
              <div className="flex items-center space-x-4 text-sm text-slate-500 dark:text-slate-400">
                <span>📅 Submitted: {formatDate(pendingProjectData.pendingDetails.submissionDate)}</span>
                <div className="flex items-center">
                  <svg className="w-4 h-4 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                  <span>Budget: {formatCurrency(pendingProjectData.proposedBudget)}</span>
                </div>
              </div>
            </div>

            {/* Key Features & Deliverables */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-slate-800 rounded-lg p-6 border border-slate-200 dark:border-slate-700">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center">
                  <span className="mr-2">✨</span>
                  Key Features
                </h3>
                <ul className="space-y-3">
                  {pendingProjectData.proposal.keyFeatures.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <span className="text-slate-700 dark:text-slate-300">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-white dark:bg-slate-800 rounded-lg p-6 border border-slate-200 dark:border-slate-700">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center">
                  <span className="mr-2">📦</span>
                  Deliverables
                </h3>
                <ul className="space-y-3">
                  {pendingProjectData.proposal.deliverables.map((deliverable, index) => (
                    <li key={index} className="flex items-start">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <span className="text-slate-700 dark:text-slate-300">{deliverable}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Requirements */}
            <div className="bg-white dark:bg-slate-800 rounded-lg p-6 border border-slate-200 dark:border-slate-700">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center">
                <span className="mr-2">📋</span>
                Project Requirements
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pendingProjectData.proposal.requirements.map((requirement, index) => (
                  <div key={index} className="flex items-center p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
                    <div className="w-4 h-4 border-2 border-orange-500 rounded mr-3"></div>
                    <span className="text-slate-700 dark:text-slate-300">{requirement}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeSection === 'timeline' && (
          <div className="space-y-6">
            {/* Timeline Header */}
            <div className="bg-white dark:bg-slate-800 rounded-lg p-6 border border-slate-200 dark:border-slate-700">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Action Timeline</h2>
              <p className="text-slate-600 dark:text-slate-400">
                Track the progress and upcoming actions for this pending project
              </p>
            </div>

            {/* Timeline */}
            <div className="bg-white dark:bg-slate-800 rounded-lg p-6 border border-slate-200 dark:border-slate-700">
              <div className="flow-root">
                <ul className="-mb-8">
                  {pendingProjectData.timeline.map((item, itemIdx) => (
                    <li key={item.id}>
                      <div className="relative pb-8">
                        {itemIdx !== pendingProjectData.timeline.length - 1 ? (
                          <span
                            className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-slate-200 dark:bg-slate-700"
                            aria-hidden="true"
                          />
                        ) : null}
                        <div className="relative flex space-x-3">
                          <div>
                            <span
                              className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white dark:ring-slate-800 ${getTimelineStatusColor(item.status)}`}
                            >
                              <span className="text-white">
                                {getTimelineTypeIcon(item.type)}
                              </span>
                            </span>
                          </div>
                          <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                            <div>
                              <p className="text-sm font-medium text-slate-900 dark:text-white">
                                {item.title}
                              </p>
                              <p className="text-sm text-slate-600 dark:text-slate-400">
                                {item.description}
                              </p>
                            </div>
                            <div className="text-right text-sm whitespace-nowrap text-slate-500 dark:text-slate-400">
                              <time dateTime={item.date}>{formatDate(item.date)}</time>
                              <div className="mt-1">
                                <span
                                  className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                    item.status === 'completed' 
                                      ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                                      : item.status === 'in-progress'
                                      ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400'
                                      : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
                                  }`}
                                >
                                  {item.status === 'completed' && '✓ Completed'}
                                  {item.status === 'in-progress' && '⏳ In Progress'}
                                  {item.status === 'upcoming' && '📅 Upcoming'}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="bg-white dark:bg-slate-800 rounded-lg p-6 border border-slate-200 dark:border-slate-700">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Quick Actions</h3>
              <div className="flex flex-wrap gap-3">
                <button className="flex items-center px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Send Follow-up
                </button>
                <button className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Schedule Meeting
                </button>
                <button className="flex items-center px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                  Update Status
                </button>
              </div>
            </div>
          </div>
        )}
      </div> {/* Close Content div */}
    </div>
  );
}
