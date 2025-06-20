'use client';

import Image from 'next/image';
import { useState } from 'react';

export default function RejectedComponent({ project, onBack }) {
  const [activeSection, setActiveSection] = useState('overview');

  // Enhanced rejected project data structure
  const rejectedProjectData = {
    id: project?.id || 7,
    projectName: project?.title || "Office Building Construction",
    submittedDate: project?.submittedDate || "2024-05-10",
    rejectedDate: project?.rejectedDate || "2024-06-05",
    projectType: project?.projectType || "Construction",
    status: "Rejected",
    client: {
      name: project?.client?.name || "PT. Konstruksi Prima",
      contact: project?.client?.contact || "Ahmad Wijaya", 
      email: project?.client?.email || "ahmad@konstruksiprime.co.id",
      phone: "+62 21 7777-8888",
      avatar: "/api/placeholder/60/60"
    },
    location: project?.location || "Kuningan, Jakarta",
    estimatedDuration: project?.estimatedDuration || "12 months",
    proposedBudget: project?.budget || "Rp 850.000.000",
    rejectionDetails: {
      rejectionReason: project?.rejectionReason || "Budget constraints and timeline concerns",
      rejectionCategory: project?.rejectionCategory || "Financial",
      feedback: project?.feedback || "The proposal was well-prepared, but the budget exceeds our current allocation and timeline doesn't align with our project phases.",
      rejectedBy: project?.rejectedBy || "Project Committee",
      appealOption: true,
      appealDeadline: project?.appealDeadline || "2024-06-20",
      nextOpportunity: project?.nextOpportunity || "Next quarter tender process"
    },
    proposal: {
      title: project?.title || "Modern Office Building Construction",
      description: "Comprehensive construction proposal for a modern 15-story office building featuring sustainable design, energy-efficient systems, and contemporary workspace solutions.",
      keyFeatures: [
        "15-story modern office building",
        "LEED Gold certified sustainable design",
        "Energy-efficient HVAC and lighting systems",
        "Contemporary workspace layouts",
        "Underground parking facility",
        "Rooftop garden and recreational areas"
      ],
      deliverables: [
        "Complete architectural and structural drawings",
        "Construction management plan",
        "Material specifications and sourcing",
        "Quality assurance protocols",
        "Project timeline and milestones",
        "Budget breakdown and cost analysis"
      ],
      requirements: [
        "Building permits and regulatory approvals",
        "Environmental impact assessment",
        "Structural engineering certifications",
        "Safety and compliance protocols"
      ]
    },
    timeline: [
      {
        id: 1,
        date: "2024-05-10",
        title: "Initial Proposal Submitted",
        description: "Comprehensive construction proposal submitted for review",
        status: "completed",
        type: "submission"
      },
      {
        id: 2,
        date: "2024-05-15",
        title: "Technical Review",
        description: "Technical committee reviewed architectural and engineering plans",
        status: "completed",
        type: "review"
      },
      {
        id: 3,
        date: "2024-05-25",
        title: "Financial Evaluation",
        description: "Budget and cost analysis review conducted",
        status: "completed",
        type: "review"
      },
      {
        id: 4,
        date: "2024-06-01",
        title: "Committee Discussion",
        description: "Project committee meeting to discuss proposal",
        status: "completed",
        type: "meeting"
      },
      {
        id: 5,
        date: "2024-06-05",
        title: "Proposal Rejected",
        description: "Final decision made to reject the proposal",
        status: "completed",
        type: "decision"
      }
    ]
  };

  // Helper functions
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    if (typeof amount === 'string' && amount.startsWith('Rp')) {
      return amount;
    }
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getRejectionCategoryColor = (category) => {
    switch (category) {
      case 'Financial':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'Technical':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400';
      case 'Timeline':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'Compliance':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getTimelineStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-red-500';
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
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
          </svg>
        );
      case 'decision':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        );
      case 'meeting':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
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
                {rejectedProjectData.projectName}
              </h1>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400">
                Rejected
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
              { id: 'overview', label: 'Rejection Overview', icon: '❌' },
              { id: 'proposal', label: 'Proposal Details', icon: '📋' },
              { id: 'timeline', label: 'Review Timeline', icon: '📅' },
              { id: 'actions', label: 'Next Actions', icon: '🔧' }
            ].map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeSection === section.id
                    ? 'border-red-500 text-red-600 dark:text-red-400'
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
            {/* Rejection Alert */}
            <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-lg p-6">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-red-800 dark:text-red-400 mb-2">
                    Proposal Rejected
                  </h3>
                  <p className="text-red-700 dark:text-red-300 mb-4">
                    Your proposal was rejected on {formatDate(rejectedProjectData.rejectedDate)}. 
                    Review the feedback below and consider the available next steps.
                  </p>
                  <div className="flex items-center space-x-4 text-sm">
                    <span className={`inline-flex items-center px-2 py-1 rounded-md font-medium ${getRejectionCategoryColor(rejectedProjectData.rejectionDetails.rejectionCategory)}`}>
                      {rejectedProjectData.rejectionDetails.rejectionCategory} Issue
                    </span>
                    <span className="text-red-600 dark:text-red-400">
                      Rejected by: {rejectedProjectData.rejectionDetails.rejectedBy}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Rejection Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-slate-800 rounded-lg p-6 border border-slate-200 dark:border-slate-700">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Rejection Details</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600 dark:text-slate-400">Rejection Date:</span>
                    <span className="text-sm font-medium text-slate-900 dark:text-white">
                      {formatDate(rejectedProjectData.rejectedDate)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600 dark:text-slate-400">Reason:</span>
                    <span className="text-sm font-medium text-slate-900 dark:text-white">
                      {rejectedProjectData.rejectionDetails.rejectionReason}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600 dark:text-slate-400">Category:</span>
                    <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${getRejectionCategoryColor(rejectedProjectData.rejectionDetails.rejectionCategory)}`}>
                      {rejectedProjectData.rejectionDetails.rejectionCategory}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600 dark:text-slate-400">Rejected By:</span>
                    <span className="text-sm font-medium text-slate-900 dark:text-white">
                      {rejectedProjectData.rejectionDetails.rejectedBy}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-800 rounded-lg p-6 border border-slate-200 dark:border-slate-700">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Client Information</h3>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Image 
                      src={rejectedProjectData.client.avatar} 
                      alt={rejectedProjectData.client.name}
                      className="w-12 h-12 rounded-full"
                      width={48}
                      height={48}
                    />
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white">
                        {rejectedProjectData.client.name}
                      </p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        Contact: {rejectedProjectData.client.contact}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600 dark:text-slate-400">Email:</span>
                      <span className="text-sm font-medium text-slate-900 dark:text-white">
                        {rejectedProjectData.client.email}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600 dark:text-slate-400">Phone:</span>
                      <span className="text-sm font-medium text-slate-900 dark:text-white">
                        {rejectedProjectData.client.phone}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Client Feedback */}
            <div className="bg-white dark:bg-slate-800 rounded-lg p-6 border border-slate-200 dark:border-slate-700">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center">
                <span className="mr-2">💬</span>
                Client Feedback
              </h3>
              <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-4">
                <p className="text-slate-700 dark:text-slate-300 italic">
                  &ldquo;{rejectedProjectData.rejectionDetails.feedback}&rdquo;
                </p>
              </div>
            </div>

            {/* Project Summary */}
            <div className="bg-white dark:bg-slate-800 rounded-lg p-6 border border-slate-200 dark:border-slate-700">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Project Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
                  <p className="text-sm text-slate-600 dark:text-slate-400">Project Type</p>
                  <p className="text-lg font-semibold text-slate-900 dark:text-white">
                    {rejectedProjectData.projectType}
                  </p>
                </div>
                <div className="text-center p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
                  <p className="text-sm text-slate-600 dark:text-slate-400">Location</p>
                  <p className="text-lg font-semibold text-slate-900 dark:text-white">
                    {rejectedProjectData.location}
                  </p>
                </div>
                <div className="text-center p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
                  <p className="text-sm text-slate-600 dark:text-slate-400">Proposed Budget</p>
                  <p className="text-lg font-semibold text-slate-900 dark:text-white">
                    {formatCurrency(rejectedProjectData.proposedBudget)}
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
                {rejectedProjectData.proposal.title}
              </h2>
              <p className="text-slate-600 dark:text-slate-400 mb-4">
                {rejectedProjectData.proposal.description}
              </p>
              <div className="flex items-center space-x-4 text-sm text-slate-500 dark:text-slate-400">
                <span>📅 Submitted: {formatDate(rejectedProjectData.submittedDate)}</span>
                <div className="flex items-center">
                  <svg className="w-4 h-4 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                  <span>Budget: {formatCurrency(rejectedProjectData.proposedBudget)}</span>
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
                  {rejectedProjectData.proposal.keyFeatures.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <div className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
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
                  {rejectedProjectData.proposal.deliverables.map((deliverable, index) => (
                    <li key={index} className="flex items-start">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
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
                {rejectedProjectData.proposal.requirements.map((requirement, index) => (
                  <div key={index} className="flex items-center p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
                    <div className="w-4 h-4 border-2 border-red-500 rounded mr-3"></div>
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
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Review Timeline</h2>
              <p className="text-slate-600 dark:text-slate-400">
                Complete timeline of the proposal review process that led to rejection
              </p>
            </div>

            {/* Timeline */}
            <div className="bg-white dark:bg-slate-800 rounded-lg p-6 border border-slate-200 dark:border-slate-700">
              <div className="flow-root">
                <ul className="-mb-8">
                  {rejectedProjectData.timeline.map((item, itemIdx) => (
                    <li key={item.id}>
                      <div className="relative pb-8">
                        {itemIdx !== rejectedProjectData.timeline.length - 1 ? (
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
                                      ? item.type === 'decision' 
                                        ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                                        : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
                                      : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
                                  }`}
                                >
                                  {item.status === 'completed' && item.type === 'decision' && '❌ Rejected'}
                                  {item.status === 'completed' && item.type !== 'decision' && '✓ Completed'}
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
          </div>
        )}

        {activeSection === 'actions' && (
          <div className="space-y-6">
            {/* Next Steps */}
            <div className="bg-white dark:bg-slate-800 rounded-lg p-6 border border-slate-200 dark:border-slate-700">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Next Steps & Options</h2>
              
              {/* Appeal Option */}
              {rejectedProjectData.rejectionDetails.appealOption && (
                <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
                  <div className="flex items-start space-x-3">
                    <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <h3 className="text-sm font-semibold text-blue-800 dark:text-blue-400 mb-1">
                        Appeal Available
                      </h3>
                      <p className="text-sm text-blue-700 dark:text-blue-300 mb-2">
                        You can submit an appeal for this rejection. Appeal deadline: {formatDate(rejectedProjectData.rejectionDetails.appealDeadline)}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Future Opportunities */}
              <div className="bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-6">
                <div className="flex items-start space-x-3">
                  <svg className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <h3 className="text-sm font-semibold text-green-800 dark:text-green-400 mb-1">
                      Future Opportunity
                    </h3>
                    <p className="text-sm text-green-700 dark:text-green-300">
                      {rejectedProjectData.rejectionDetails.nextOpportunity}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="bg-white dark:bg-slate-800 rounded-lg p-6 border border-slate-200 dark:border-slate-700">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Available Actions</h3>
              <div className="flex flex-wrap gap-3">
                {rejectedProjectData.rejectionDetails.appealOption && (
                  <button className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Submit Appeal
                  </button>
                )}
                <button className="flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Create New Proposal
                </button>
                <button className="flex items-center px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Contact Client
                </button>
                <button className="flex items-center px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Download Report
                </button>
              </div>
            </div>

            {/* Lessons Learned */}
            <div className="bg-white dark:bg-slate-800 rounded-lg p-6 border border-slate-200 dark:border-slate-700">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center">
                <span className="mr-2">💡</span>
                Lessons Learned
              </h3>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-sm text-slate-700 dark:text-slate-300">
                    Consider budget constraints more carefully in future proposals
                  </p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-sm text-slate-700 dark:text-slate-300">
                    Align project timeline with client&apos;s business phases
                  </p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-sm text-slate-700 dark:text-slate-300">
                    Request detailed requirements before proposal submission
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
