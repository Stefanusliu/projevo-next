// filepath: /Users/kevinseptian/Downloads/Fastwork/project18 (Projevo)/projevo/src/app/dashboard/project-owner/components/ProjectCompleteComponent.js
'use client';

import Image from 'next/image';
import { useState } from 'react';

export default function ProjectCompleteComponent({ project, onBack }) {
  const [activeSection, setActiveSection] = useState('details');
  const [imageErrors, setImageErrors] = useState({});

  // Dummy image fallback
  const dummyImage = "data:image/svg+xml,%3Csvg width='400' height='300' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='100%25' height='100%25' fill='%23f1f5f9'/%3E%3Ctext x='50%25' y='50%25' font-size='16' fill='%2364748b' text-anchor='middle' dy='.3em'%3EImage not available%3C/text%3E%3C/svg%3E";
  const dummyAvatar = "data:image/svg+xml,%3Csvg width='48' height='48' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='100%25' height='100%25' fill='%23e2e8f0' rx='24'/%3E%3Cpath d='M24 14a6 6 0 0 1 6 6c0 1.657-.672 3.157-1.757 4.243A6 6 0 0 1 24 26a6 6 0 0 1-6-6c0-1.657.672-3.157 1.757-4.243A6 6 0 0 1 24 14zm0 20c-4.418 0-8-1.79-8-4s3.582-4 8-4 8 1.79 8 4-3.582 4-8 4z' fill='%2364748b'/%3E%3C/svg%3E";

  const handleImageError = (imageId) => {
    setImageErrors(prev => ({ ...prev, [imageId]: true }));
  };

  // Enhanced completed project data structure
  const completedProjectData = {
    id: project?.id || 1,
    projectName: project?.title || "Modern Cafe Interior Design",
    completedDate: project?.completedDate || "2024-06-15",
    projectType: project?.projectType || "Interior Design",
    status: "Completed",
    client: {
      name: project?.client?.name || "PT. Kopi Nusantara",
      contact: project?.client?.contact || "Budi Santoso",
      email: project?.client?.email || "budi@kopinusantara.co.id",
      phone: "+62 21 5555-1234",
      avatar: "/api/placeholder/60/60"
    },
    location: project?.location || "South Jakarta",
    totalTime: project?.duration || "4.5 months",
    totalCost: project?.budget || "Rp 185.000.000",
    clientReview: {
      rating: project?.rating || 4.8,
      comment: project?.review || "Exceptional work! The team delivered beyond our expectations. The modern design perfectly captures our brand identity, and the quality of workmanship is outstanding. Highly recommended for future projects.",
      reviewDate: "2024-06-20",
      photos: [
        "/api/placeholder/400/300",
        "/api/placeholder/400/300",
        "/api/placeholder/400/300"
      ]
    },
    projectDetails: {
      startDate: project?.startDate || "2024-02-01",
      originalBudget: "Rp 180.000.000",
      finalBudget: project?.budget || "Rp 185.000.000",
      budgetVariance: "+2.8%",
      originalDuration: "4 months",
      actualDuration: "4.5 months",
      timeVariance: "+12.5%",
      contractor: project?.profileName || "CV. Kreasi Interior",
      projectManager: "Sarah Wijaya",
      phases: [
        { name: "Planning & Design", duration: "1 month", status: "completed" },
        { name: "Material Procurement", duration: "0.5 months", status: "completed" },
        { name: "Construction", duration: "2.5 months", status: "completed" },
        { name: "Finishing & Handover", duration: "0.5 months", status: "completed" }
      ]
    },
    deliverables: [
      "Complete interior renovation",
      "Custom furniture installation", 
      "Lighting system upgrade",
      "Sound system integration",
      "Final documentation & warranties"
    ],
    keyHighlights: [
      "Delivered on time with minimal delays",
      "Exceptional client satisfaction rating",
      "Budget managed within 3% variance",
      "Zero safety incidents",
      "High-quality finishing standards"
    ]
  };

  const renderStarRating = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <svg key={i} className="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      );
    }

    if (hasHalfStar) {
      stars.push(
        <svg key="half" className="w-5 h-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          <defs>
            <linearGradient id="half-fill">
              <stop offset="50%" stopColor="currentColor"/>
              <stop offset="50%" stopColor="transparent"/>
            </linearGradient>
          </defs>
        </svg>
      );
    }

    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <svg key={`empty-${i}`} className="w-5 h-5 text-slate-300 dark:text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.289 3.975a1 1 0 00.95.69h4.176c.969 0 1.371 1.24.588 1.81l-3.38 2.455a1 1 0 00-.364 1.118l1.29 3.975c.3.921-.755 1.688-1.54 1.118l-3.38-2.455a1 1 0 00-1.175 0l-3.38 2.455c-.784.57-1.838-.197-1.539-1.118l1.29-3.975a1 1 0 00-.364-1.118L2.049 8.402c-.783-.57-.38-1.81.588-1.81h4.176a1 1 0 00.95-.69l1.29-3.975z" />
        </svg>
      );
    }

    return stars;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(parseInt(amount.replace(/[^\d]/g, '')));
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
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
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
            <svg className="w-4 h-4 mr-1.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            {completedProjectData.status}
          </span>
        </div>
      </div>

      {/* Project Header Card */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/10 dark:to-emerald-900/10 rounded-2xl p-8 border border-green-200 dark:border-green-800">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-6 lg:space-y-0">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-4">
              <span className="inline-flex items-center px-3 py-1 rounded-lg text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
                {completedProjectData.projectType}
              </span>
              <div className="h-1 w-1 bg-slate-400 rounded-full"></div>
              <span className="text-sm text-slate-600 dark:text-slate-400">
                Completed on {formatDate(completedProjectData.completedDate)}
              </span>
            </div>
            
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-3">
              {completedProjectData.projectName}
            </h1>
            
            <div className="flex flex-wrap items-center gap-6 text-sm text-slate-600 dark:text-slate-400">
              <div className="flex items-center space-x-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>{completedProjectData.location}</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{completedProjectData.totalTime}</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
                <span className="font-semibold">{formatCurrency(completedProjectData.totalCost)}</span>
              </div>
            </div>
          </div>
          
          {/* Client Info */}
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700 min-w-[280px]">
            <div className="flex items-center space-x-4">
              <Image 
                src={imageErrors['client-avatar'] ? dummyAvatar : completedProjectData.client.avatar} 
                alt={completedProjectData.client.name}
                className="w-12 h-12 rounded-full object-cover border-2 border-slate-200 dark:border-slate-600"
                width={48}
                height={48}
                onError={() => handleImageError('client-avatar')}
              />
              <div className="flex-1">
                <h3 className="font-semibold text-slate-900 dark:text-white">
                  {completedProjectData.client.name}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {completedProjectData.client.contact}
                </p>
                <div className="flex items-center space-x-1 mt-1">
                  {renderStarRating(completedProjectData.clientReview.rating)}
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300 ml-2">
                    {completedProjectData.clientReview.rating.toFixed(1)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-slate-100 dark:bg-slate-800 rounded-xl p-1">
        {[
          { id: 'details', name: 'Project Details', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
          { id: 'review', name: 'Client Review', icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z' },
          { id: 'timeline', name: 'Project Timeline', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' }
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
      {activeSection === 'details' && (
        <div className="space-y-8">
          {/* Key Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                label: 'Total Cost',
                value: formatCurrency(completedProjectData.totalCost),
                subtext: `Budget variance: ${completedProjectData.projectDetails.budgetVariance}`,
                icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1',
                color: 'bg-green-50 dark:bg-green-900/10 text-green-600 dark:text-green-400'
              },
              {
                label: 'Total Time',
                value: completedProjectData.totalTime,
                subtext: `Time variance: ${completedProjectData.projectDetails.timeVariance}`,
                icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
                color: 'bg-blue-50 dark:bg-blue-900/10 text-blue-600 dark:text-blue-400'
              },
              {
                label: 'Client Rating',
                value: `${completedProjectData.clientReview.rating.toFixed(1)}/5.0`,
                subtext: 'Exceptional satisfaction',
                icon: 'M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.289 3.975a1 1 0 00.95.69h4.176c.969 0 1.371 1.24.588 1.81l-3.38 2.455a1 1 0 00-.364 1.118l1.29 3.975c.3.921-.755 1.688-1.54 1.118l-3.38-2.455a1 1 0 00-1.175 0l-3.38 2.455c-.784.57-1.838-.197-1.539-1.118l1.29-3.975a1 1 0 00-.364-1.118L2.049 8.402c-.783-.57-.38-1.81.588-1.81h4.176a1 1 0 00.95-.69l1.29-3.975z',
                color: 'bg-yellow-50 dark:bg-yellow-900/10 text-yellow-600 dark:text-yellow-400'
              },
              {
                label: 'Project Status',
                value: 'Completed',
                subtext: formatDate(completedProjectData.completedDate),
                icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
                color: 'bg-emerald-50 dark:bg-emerald-900/10 text-emerald-600 dark:text-emerald-400'
              }
            ].map((stat, index) => (
              <div key={index} className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                <div className={`inline-flex p-3 rounded-lg ${stat.color} mb-4`}>
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={stat.icon} />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
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

          {/* Project Information */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column */}
            <div className="space-y-6">
              {/* Basic Information */}
              <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Project Information</h3>
                <div className="space-y-4">
                  {[
                    { label: 'Project Name', value: completedProjectData.projectName },
                    { label: 'Project Type', value: completedProjectData.projectType },
                    { label: 'Location', value: completedProjectData.location },
                    { label: 'Start Date', value: formatDate(completedProjectData.projectDetails.startDate) },
                    { label: 'Completion Date', value: formatDate(completedProjectData.completedDate) },
                    { label: 'Contractor', value: completedProjectData.projectDetails.contractor },
                    { label: 'Project Manager', value: completedProjectData.projectDetails.projectManager }
                  ].map((item, index) => (
                    <div key={index} className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-700 last:border-b-0">
                      <span className="text-sm text-slate-600 dark:text-slate-400">{item.label}</span>
                      <span className="text-sm font-medium text-slate-900 dark:text-white">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Key Highlights */}
              <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Key Highlights</h3>
                <div className="space-y-3">
                  {completedProjectData.keyHighlights.map((highlight, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span className="text-sm text-slate-700 dark:text-slate-300">{highlight}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Budget Information */}
              <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Budget Analysis</h3>
                <div className="space-y-4">
                  {[
                    { label: 'Original Budget', value: formatCurrency(completedProjectData.projectDetails.originalBudget) },
                    { label: 'Final Budget', value: formatCurrency(completedProjectData.projectDetails.finalBudget) },
                    { label: 'Budget Variance', value: completedProjectData.projectDetails.budgetVariance },
                    { label: 'Original Duration', value: completedProjectData.projectDetails.originalDuration },
                    { label: 'Actual Duration', value: completedProjectData.projectDetails.actualDuration },
                    { label: 'Time Variance', value: completedProjectData.projectDetails.timeVariance }
                  ].map((item, index) => (
                    <div key={index} className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-700 last:border-b-0">
                      <span className="text-sm text-slate-600 dark:text-slate-400">{item.label}</span>
                      <span className={`text-sm font-medium ${
                        item.label.includes('Variance') 
                          ? item.value.startsWith('+') 
                            ? 'text-red-600 dark:text-red-400' 
                            : 'text-green-600 dark:text-green-400'
                          : 'text-slate-900 dark:text-white'
                      }`}>
                        {item.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Deliverables */}
              <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Project Deliverables</h3>
                <div className="space-y-3">
                  {completedProjectData.deliverables.map((deliverable, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <svg className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span className="text-sm text-slate-700 dark:text-slate-300">{deliverable}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Client Contact */}
              <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Client Details</h3>
                <div className="space-y-4">
                  {[
                    { label: 'Company', value: completedProjectData.client.name },
                    { label: 'Contact Person', value: completedProjectData.client.contact },
                    { label: 'Email', value: completedProjectData.client.email },
                    { label: 'Phone', value: completedProjectData.client.phone }
                  ].map((item, index) => (
                    <div key={index} className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-700 last:border-b-0">
                      <span className="text-sm text-slate-600 dark:text-slate-400">{item.label}</span>
                      <span className="text-sm font-medium text-slate-900 dark:text-white">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeSection === 'review' && (
        <div className="space-y-8">
          {/* Client Review Header */}
          <div className="bg-white dark:bg-slate-800 p-8 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0 mb-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Client Review</h2>
                <p className="text-slate-600 dark:text-slate-400">
                  Review submitted on {formatDate(completedProjectData.clientReview.reviewDate)}
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-1">
                  {renderStarRating(completedProjectData.clientReview.rating)}
                </div>
                <span className="text-3xl font-bold text-slate-900 dark:text-white">
                  {completedProjectData.clientReview.rating.toFixed(1)}
                </span>
              </div>
            </div>
            
            <div className="bg-slate-50 dark:bg-slate-700/50 p-6 rounded-lg">
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed italic">
                &ldquo;{completedProjectData.clientReview.comment}&rdquo;
              </p>
            </div>
            
            <div className="mt-6 flex items-center space-x-4">
              <Image 
                width={48}
                height={48} 
                src={imageErrors['review-avatar'] ? dummyAvatar : completedProjectData.client.avatar}
                alt={completedProjectData.client.name}
                className="w-12 h-12 rounded-full object-cover border-2 border-slate-200 dark:border-slate-600"
                onError={() => handleImageError('review-avatar')}
              />
              <div>
                <h4 className="font-semibold text-slate-900 dark:text-white">
                  {completedProjectData.client.contact}
                </h4>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {completedProjectData.client.name}
                </p>
              </div>
            </div>
          </div>

          {/* Project Photos */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Project Photos</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {completedProjectData.clientReview.photos.map((photo, index) => (
                <div key={index} className="aspect-video bg-slate-100 dark:bg-slate-700 rounded-lg overflow-hidden">
                  <Image 
                    width={400}
                    height={300} 
                    src={imageErrors[`photo-${index}`] ? dummyImage : photo}
                    alt={`Project photo ${index + 1}`}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
                    onError={() => handleImageError(`photo-${index}`)}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeSection === 'timeline' && (
        <div className="space-y-8">
          {/* Timeline Header */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Project Timeline</h2>
            <p className="text-slate-600 dark:text-slate-400">
              Complete project timeline from start to completion
            </p>
          </div>

          {/* Timeline Visualization */}
          <div className="bg-white dark:bg-slate-800 p-8 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Project Phases</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Started: {formatDate(completedProjectData.projectDetails.startDate)} • 
                  Completed: {formatDate(completedProjectData.completedDate)}
                </p>
              </div>
            </div>

            {/* Phase Timeline */}
            <div className="relative">
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-slate-200 dark:bg-slate-700"></div>
              <div className="space-y-8">
                {completedProjectData.projectDetails.phases.map((phase, index) => (
                  <div key={index} className="relative flex items-start space-x-6">
                    <div className={`flex-shrink-0 w-8 h-8 rounded-full border-4 border-white dark:border-slate-800 ${
                      phase.status === 'completed' 
                        ? 'bg-green-500' 
                        : 'bg-slate-300 dark:bg-slate-600'
                    } relative z-10`}>
                      {phase.status === 'completed' && (
                        <svg className="w-4 h-4 text-white absolute inset-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
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
                            : 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300'
                        }`}>
                          {phase.status === 'completed' ? 'Completed' : 'Pending'}
                        </span>
                      </div>
                      <p className="text-slate-600 dark:text-slate-400">
                        Duration: {phase.duration}
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
