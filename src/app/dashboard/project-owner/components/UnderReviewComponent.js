'use client';

import { useState } from 'react';

export default function UnderReviewComponent({ project, onBack }) {
  const [activeSection, setActiveSection] = useState('overview');

  // Enhanced under review project data structure
  const underReviewProjectData = {
    id: project?.id || 1,
    projectName: project?.title || "Co-working Space Design",
    submittedDate: project?.submittedDate || "2024-06-10",
    projectType: project?.projectType || "Architecture",
    status: "Under Review",
    client: {
      name: project?.client?.name || "PT. Modern Workspace",
      contact: project?.client?.contact || "Lisa Ananda", 
      email: project?.client?.email || "lisa@modernworkspace.co.id",
      phone: "+62 21 5555-5678",
      avatar: "/api/placeholder/60/60"
    },
    location: project?.location || "Kemang, Jakarta",
    estimatedDuration: project?.estimatedDuration || "4 months",
    proposedBudget: project?.budget || "Rp 150.000.000",
    reviewDetails: {
      submissionDate: project?.submittedDate || "2024-06-10",
      expectedDecision: project?.expectedDecision || "2024-06-25",
      reviewStage: project?.reviewStage || "Technical Evaluation",
      reviewProgress: project?.reviewProgress || 65,
      daysRemaining: project?.daysRemaining || 6,
      reviewer: project?.reviewer || "Technical Review Committee",
      submissionType: project?.contractType || "Contract"
    },
    proposal: {
      title: project?.title || "Modern Co-working Space Design",
      description: "Comprehensive design proposal for a modern co-working space featuring flexible work areas, meeting rooms, and collaborative zones with contemporary aesthetic and sustainable materials.",
      keyFeatures: [
        "Open-plan flexible workspace design",
        "Private meeting and phone booth areas", 
        "Collaborative lounge and kitchen spaces",
        "Sustainable and eco-friendly materials",
        "Smart building technology integration"
      ],
      deliverables: [
        "Architectural design drawings",
        "3D visualizations and renderings",
        "Material and furniture specifications",
        "Project timeline and milestones",
        "Budget breakdown and cost analysis"
      ],
      methodology: [
        "Initial site survey and analysis",
        "Client consultation and requirement gathering",
        "Concept development and design iterations",
        "Technical documentation preparation",
        "Final presentation and approval process"
      ]
    },
    timeline: {
      phases: [
        { name: "Proposal Submitted", date: "2024-06-10", status: "completed", description: "Initial proposal and documentation submitted" },
        { name: "Document Review", date: "2024-06-12", status: "completed", description: "Administrative and document completeness check" },
        { name: "Technical Evaluation", date: "2024-06-15", status: "current", description: "Technical team reviewing design approach and feasibility" },
        { name: "Client Presentation", date: "2024-06-22", status: "pending", description: "Presentation to client stakeholders" },
        { name: "Final Decision", date: "2024-06-25", status: "pending", description: "Final approval or rejection decision" }
      ]
    },
    documents: [
      { name: "Project Proposal.pdf", size: "4.2 MB", uploadDate: "June 10, 2024", status: "approved" },
      { name: "Design Concept.pdf", size: "8.7 MB", uploadDate: "June 10, 2024", status: "under review" },
      { name: "Budget Estimation.xlsx", size: "1.5 MB", uploadDate: "June 10, 2024", status: "approved" },
      { name: "Company Portfolio.pdf", size: "12.3 MB", uploadDate: "June 10, 2024", status: "approved" },
      { name: "Technical Specifications.docx", size: "2.8 MB", uploadDate: "June 10, 2024", status: "under review" }
    ]
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      day: '2-digit',
      month: 'long', 
      year: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(parseInt(amount.replace(/[^\d]/g, '')));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'under review':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'rejected':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header with Back Button */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center space-x-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span>Back to Projects</span>
        </button>
        
        {/* Status Badge */}
        <div className="flex items-center space-x-3">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400">
            <svg className="w-4 h-4 mr-1.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            {underReviewProjectData.status}
          </span>
        </div>
      </div>

      {/* Project Header Card */}
      <div className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/10 dark:to-orange-900/10 rounded-2xl p-8 border border-yellow-200 dark:border-yellow-800">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-6 lg:space-y-0">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-4">
              <span className="inline-flex items-center px-3 py-1 rounded-lg text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
                {underReviewProjectData.projectType}
              </span>
              <div className="h-1 w-1 bg-slate-400 rounded-full"></div>
              <span className="text-sm text-slate-600 dark:text-slate-400">
                Submitted on {formatDate(underReviewProjectData.submittedDate)}
              </span>
            </div>
            
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-3">
              {underReviewProjectData.projectName}
            </h1>
            
            <div className="flex flex-wrap items-center gap-6 text-sm text-slate-600 dark:text-slate-400">
              <div className="flex items-center space-x-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>{underReviewProjectData.location}</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{underReviewProjectData.estimatedDuration}</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
                <span className="font-semibold">{formatCurrency(underReviewProjectData.proposedBudget)}</span>
              </div>
            </div>
          </div>
          
          {/* Review Progress Card */}
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700 min-w-[280px]">
            <div className="text-center">
              <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Review Progress</h3>
              <div className="relative w-20 h-20 mx-auto mb-3">
                <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 36 36">
                  <path className="text-slate-200 dark:text-slate-700" stroke="currentColor" strokeWidth="3" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                  <path className="text-yellow-500" stroke="currentColor" strokeWidth="3" fill="none" strokeDasharray={`${underReviewProjectData.reviewDetails.reviewProgress}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-lg font-bold text-slate-900 dark:text-white">{underReviewProjectData.reviewDetails.reviewProgress}%</span>
                </div>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">{underReviewProjectData.reviewDetails.reviewStage}</p>
              <p className="text-xs text-orange-600 dark:text-orange-400 font-medium">
                {underReviewProjectData.reviewDetails.daysRemaining} days remaining
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-slate-100 dark:bg-slate-800 rounded-xl p-1">
        {[
          { id: 'overview', name: 'Review Overview', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
          { id: 'proposal', name: 'Proposal Details', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
          { id: 'timeline', name: 'Review Timeline', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveSection(tab.id)}
            className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium text-sm transition-all duration-200 ${
              activeSection === tab.id
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={tab.icon} />
            </svg>
            <span>{tab.name}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeSection === 'overview' && (
        <div className="space-y-8">
          {/* Review Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                label: 'Proposed Budget',
                value: formatCurrency(underReviewProjectData.proposedBudget),
                subtext: 'Contract proposal',
                icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1',
                color: 'bg-blue-50 dark:bg-blue-900/10 text-blue-600 dark:text-blue-400'
              },
              {
                label: 'Est. Duration',
                value: underReviewProjectData.estimatedDuration,
                subtext: 'Project timeline',
                icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
                color: 'bg-green-50 dark:bg-green-900/10 text-green-600 dark:text-green-400'
              },
              {
                label: 'Review Stage',
                value: underReviewProjectData.reviewDetails.reviewStage,
                subtext: `${underReviewProjectData.reviewDetails.reviewProgress}% complete`,
                icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4',
                color: 'bg-yellow-50 dark:bg-yellow-900/10 text-yellow-600 dark:text-yellow-400'
              },
              {
                label: 'Days Remaining',
                value: `${underReviewProjectData.reviewDetails.daysRemaining} days`,
                subtext: `Decision by ${formatDate(underReviewProjectData.reviewDetails.expectedDecision)}`,
                icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
                color: 'bg-orange-50 dark:bg-orange-900/10 text-orange-600 dark:text-orange-400'
              }
            ].map((stat, index) => (
              <div key={index} className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                <div className={`inline-flex p-3 rounded-lg ${stat.color} mb-4`}>
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={stat.icon} />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
                  {stat.value}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                  {stat.label}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-500">
                  {stat.subtext}
                </p>
              </div>
            ))}
          </div>

          {/* Review Information */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column */}
            <div className="space-y-6">
              {/* Review Details */}
              <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Review Information</h3>
                <div className="space-y-4">
                  {[
                    { label: 'Project Name', value: underReviewProjectData.projectName },
                    { label: 'Submission Type', value: underReviewProjectData.reviewDetails.submissionType },
                    { label: 'Location', value: underReviewProjectData.location },
                    { label: 'Submission Date', value: formatDate(underReviewProjectData.reviewDetails.submissionDate) },
                    { label: 'Expected Decision', value: formatDate(underReviewProjectData.reviewDetails.expectedDecision) },
                    { label: 'Current Stage', value: underReviewProjectData.reviewDetails.reviewStage },
                    { label: 'Reviewer', value: underReviewProjectData.reviewDetails.reviewer }
                  ].map((item, index) => (
                    <div key={index} className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-700 last:border-b-0">
                      <span className="text-sm text-slate-600 dark:text-slate-400">{item.label}</span>
                      <span className="text-sm font-medium text-slate-900 dark:text-white">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Documents Status */}
              <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Document Status</h3>
                <div className="space-y-3">
                  {underReviewProjectData.documents.map((doc, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <div>
                          <p className="text-sm font-medium text-slate-900 dark:text-white">{doc.name}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">{doc.size}</p>
                        </div>
                      </div>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(doc.status)}`}>
                        {doc.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Client Information */}
              <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Client Details</h3>
                <div className="space-y-4">
                  {[
                    { label: 'Company', value: underReviewProjectData.client.name },
                    { label: 'Contact Person', value: underReviewProjectData.client.contact },
                    { label: 'Email', value: underReviewProjectData.client.email },
                    { label: 'Phone', value: underReviewProjectData.client.phone }
                  ].map((item, index) => (
                    <div key={index} className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-700 last:border-b-0">
                      <span className="text-sm text-slate-600 dark:text-slate-400">{item.label}</span>
                      <span className="text-sm font-medium text-slate-900 dark:text-white">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Next Steps */}
              <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Next Steps</h3>
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
                    <div>
                      <p className="text-sm font-medium text-slate-900 dark:text-white">Technical Review in Progress</p>
                      <p className="text-xs text-slate-600 dark:text-slate-400">Team is evaluating technical feasibility and approach</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <div>
                      <p className="text-sm font-medium text-slate-900 dark:text-white">Prepare for Presentation</p>
                      <p className="text-xs text-slate-600 dark:text-slate-400">You may be invited to present your proposal</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <div>
                      <p className="text-sm font-medium text-slate-900 dark:text-white">Final Decision Expected</p>
                      <p className="text-xs text-slate-600 dark:text-slate-400">Decision by {formatDate(underReviewProjectData.reviewDetails.expectedDecision)}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeSection === 'proposal' && (
        <div className="space-y-8">
          {/* Proposal Overview */}
          <div className="bg-white dark:bg-slate-800 p-8 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Proposal Overview</h2>
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">{underReviewProjectData.proposal.title}</h3>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-6">
              {underReviewProjectData.proposal.description}
            </p>
          </div>

          {/* Proposal Details */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              {/* Key Features */}
              <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Key Features</h3>
                <div className="space-y-3">
                  {underReviewProjectData.proposal.keyFeatures.map((feature, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span className="text-sm text-slate-700 dark:text-slate-300">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Methodology */}
              <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Project Methodology</h3>
                <div className="space-y-3">
                  {underReviewProjectData.proposal.methodology.map((step, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                        {index + 1}
                      </div>
                      <span className="text-sm text-slate-700 dark:text-slate-300">{step}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              {/* Deliverables */}
              <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Project Deliverables</h3>
                <div className="space-y-3">
                  {underReviewProjectData.proposal.deliverables.map((deliverable, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <svg className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span className="text-sm text-slate-700 dark:text-slate-300">{deliverable}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Project Budget Breakdown */}
              <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Budget Information</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-700">
                    <span className="text-sm text-slate-600 dark:text-slate-400">Total Proposed Budget</span>
                    <span className="text-lg font-bold text-slate-900 dark:text-white">{formatCurrency(underReviewProjectData.proposedBudget)}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-700">
                    <span className="text-sm text-slate-600 dark:text-slate-400">Estimated Duration</span>
                    <span className="text-sm font-medium text-slate-900 dark:text-white">{underReviewProjectData.estimatedDuration}</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-sm text-slate-600 dark:text-slate-400">Contract Type</span>
                    <span className="text-sm font-medium text-slate-900 dark:text-white">{underReviewProjectData.reviewDetails.submissionType}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeSection === 'timeline' && (
        <div className="space-y-8">
          {/* Timeline Header */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Review Timeline</h2>
            <p className="text-slate-600 dark:text-slate-400">
              Track the progress of your proposal review process
            </p>
          </div>

          {/* Timeline Visualization */}
          <div className="bg-white dark:bg-slate-800 p-8 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
            <div className="relative">
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-slate-200 dark:bg-slate-700"></div>
              <div className="space-y-8">
                {underReviewProjectData.timeline.phases.map((phase, index) => (
                  <div key={index} className="relative flex items-start space-x-6">
                    <div className={`flex-shrink-0 w-8 h-8 rounded-full border-4 border-white dark:border-slate-800 relative z-10 ${
                      phase.status === 'completed' 
                        ? 'bg-green-500' 
                        : phase.status === 'current'
                        ? 'bg-yellow-500'
                        : 'bg-slate-300 dark:bg-slate-600'
                    }`}>
                      {phase.status === 'completed' && (
                        <svg className="w-4 h-4 text-white absolute inset-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                      {phase.status === 'current' && (
                        <div className="w-2 h-2 bg-white rounded-full absolute inset-3"></div>
                      )}
                    </div>
                    
                    <div className="flex-1 bg-slate-50 dark:bg-slate-700/50 rounded-xl p-6">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-lg font-semibold text-slate-900 dark:text-white">
                          {phase.name}
                        </h4>
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                          phase.status === 'completed'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                            : phase.status === 'current'
                            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                            : 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300'
                        }`}>
                          {phase.status === 'completed' ? 'Completed' : phase.status === 'current' ? 'In Progress' : 'Pending'}
                        </span>
                      </div>
                      <p className="text-slate-600 dark:text-slate-400 mb-2">
                        {phase.description}
                      </p>
                      <p className="text-sm font-medium text-slate-500 dark:text-slate-500">
                        {formatDate(phase.date)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
