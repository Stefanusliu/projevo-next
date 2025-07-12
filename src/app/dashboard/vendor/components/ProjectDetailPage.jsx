'use client';

import { useState } from 'react';
import BOQDisplay from '../../../components/BOQDisplay';

export default function ProjectDetailPage({ project, onBack, onCreateProposal }) {
  const [activeTab, setActiveTab] = useState('overview');
  
  if (!project) return null;

  // Enhanced project data with comprehensive details
  const enhancedProject = {
    ...project,
    // General Information
    projectTitle: project.name || 'Modern Office Interior Design - Jakarta',
    province: 'DKI Jakarta',
    city: 'Jakarta Selatan',
    fullAddress: 'Jl. Sudirman No. 123, Jakarta Selatan 12190',
    clientName: project.client || 'PT. Modern Workspace',
    clientPhone: '+62 21 5555-1234',
    clientEmail: 'info@modernworkspace.co.id',
    projectBackground: 'Our company is expanding and needs a modern workspace that reflects our innovative culture and supports collaborative work.',
    projectGoals: 'Create a productive, inspiring workspace that enhances employee satisfaction and company brand image.',
    
    // Classification & Scope
    projectType: project.type === 'Interior' ? 'Desain' : project.type === 'Construction' ? 'Bangun' : 'Renovasi',
    projectScope: ['Interior', 'Furniture', 'Lighting Design', 'HVAC'],
    propertyType: 'Kantor',
    propertySize: '450 m²',
    propertyAge: '5 tahun',
    propertyCondition: 'Baik (Terawat dengan baik)',
    existingStyle: 'Contemporary',
    desiredStyle: 'Modern',
    budgetPriority: 'Seimbang - Kualitas dan harga',
    estimatedDuration: project.timeEstimation || '4 months',
    tenderDuration: '2 minggu',
    estimatedStartDate: '2024-08-01',
    projectUrgency: 'Normal (2-6 bulan)',
    workingHours: 'Senin-Jumat (Jam kerja normal)',
    accessRestrictions: 'Akses terbatas pada jam kerja kantor, tidak mengganggu operasional existing',
    
    // Technical Specifications
    designPreferences: ['Smart Home/Building', 'Hemat Energi', 'Natural Lighting', 'Sound Proofing'],
    specificRequirements: 'Ruang meeting untuk 12 orang, area kolaborasi terbuka, ruang istirahat modern, sistem keamanan terintegrasi',
    qualityStandards: 'High Quality (Kualitas tinggi)',
    materialPreferences: ['Eco-Friendly', 'Low Maintenance', 'Durable Materials'],
    colorPreferences: 'Warna netral dengan aksen hijau dan biru untuk menciptakan suasana tenang dan produktif',
    sustainabilityRequirements: 'Penggunaan material ramah lingkungan, sistem pencahayaan LED hemat energi',
    accessibilityNeeds: 'Akses ramah disabilitas sesuai standar universal design',
    
    // Stakeholder & Communication
    decisionMakers: 'CEO, Operations Manager, HR Director',
    projectTeam: 'Internal facilities team dan IT support',
    communicationPreference: 'WhatsApp',
    reportingFrequency: 'Mingguan',
    meetingSchedule: 'Setiap Jumat pagi untuk review progress',
    
    // Additional Information
    specialNotes: 'Proyek harus selesai sebelum akhir tahun untuk kebutuhan ekspansi tim',
    risksAndChallenges: 'Koordinasi dengan operasional kantor yang sedang berjalan',
    successCriteria: 'Workspace yang meningkatkan produktivitas tim, selesai tepat waktu, dalam budget',
    
    // Documents (simulated)
    uploadedDocuments: [
      { name: 'Floor Plan.dwg', title: 'Denah Lantai Existing' },
      { name: 'Requirements.pdf', title: 'Detail Requirements' },
      { name: 'Budget Breakdown.xlsx', title: 'Breakdown Budget' }
    ]
  };

  const getBidCountdownColor = (countdown) => {
    const days = parseInt(countdown.split(" ")[0]);
    if (days <= 3)
      return "text-red-600 bg-red-50";
    if (days <= 7)
      return "text-gray-600 bg-gray-50";
    return "text-blue-600 bg-blue-50";
  };

  const getMatchColor = (match) => {
    if (match >= 90) return "text-blue-600 bg-blue-50";
    if (match >= 80) return "text-blue-600 bg-blue-50";
    return "text-gray-600 bg-gray-50";
  };

  return (
    <div className="bg-white min-h-screen">
      {/* Header with Back Button */}
      <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 z-40">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={onBack}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span className="font-medium">Back to Projects</span>
            </button>
            <div className="h-6 w-px bg-gray-300"></div>
            <div>
              <div className="flex items-center space-x-3 mb-1">
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                  {enhancedProject.projectType}
                </span>
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                  {project.category}
                </span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900">{enhancedProject.projectTitle}</h1>
              <p className="text-gray-600">{enhancedProject.clientName} • {enhancedProject.city}</p>
            </div>
          </div>
          <button
            onClick={() => onCreateProposal(project)}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-medium hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            Create Proposal
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 px-6 bg-white sticky top-[88px] z-30">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'overview'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Project Overview
          </button>
          <button
            onClick={() => setActiveTab('boq')}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'boq'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Bill of Quantities
          </button>
          <button
            onClick={() => setActiveTab('client')}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'client'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Client & Timeline
          </button>
        </nav>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-8">
                {/* Project Description */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Project Description</h2>
                  <p className="text-gray-600 leading-relaxed mb-6">
                    {project.description}
                  </p>
                  
                  {/* Project Background & Goals */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <h3 className="font-semibold text-gray-900 mb-2">Project Background</h3>
                      <p className="text-sm text-gray-600">{enhancedProject.projectBackground}</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <h3 className="font-semibold text-gray-900 mb-2">Project Goals</h3>
                      <p className="text-sm text-gray-600">{enhancedProject.projectGoals}</p>
                    </div>
                  </div>
                </div>

                {/* Location Details */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Location & Property Details</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm font-medium text-gray-500">Full Address</p>
                        <p className="text-gray-900">{enhancedProject.fullAddress}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Property Type</p>
                        <p className="text-gray-900">{enhancedProject.propertyType}</p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm font-medium text-gray-500">Property Size</p>
                        <p className="text-gray-900">{enhancedProject.propertySize}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Property Condition</p>
                        <p className="text-gray-900">{enhancedProject.propertyCondition}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Project Scope */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Project Scope</h2>
                  <div className="flex flex-wrap gap-2">
                    {enhancedProject.projectScope.map((scope, index) => (
                      <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                        {scope}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Requirements */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Detailed Requirements</h2>
                  <div className="space-y-6">
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-3">Basic Requirements</h3>
                      <div className="space-y-2">
                        {project.requirements.map((requirement, index) => (
                          <div key={index} className="flex items-start space-x-3">
                            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                            <span className="text-gray-600">{requirement}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-3">Specific Requirements</h3>
                      <p className="text-gray-600">{enhancedProject.specificRequirements}</p>
                    </div>
                  </div>
                </div>

                {/* Technical Specifications */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Technical Specifications</h2>
                  <div className="space-y-6">
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-3">Design Preferences</h3>
                      <div className="flex flex-wrap gap-2">
                        {enhancedProject.designPreferences.map((pref, index) => (
                          <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
                            {pref}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-3">Material Preferences</h3>
                      <div className="flex flex-wrap gap-2">
                        {enhancedProject.materialPreferences.map((material, index) => (
                          <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
                            {material}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold text-gray-900 mb-3">Color Preferences</h3>
                      <p className="text-gray-600">{enhancedProject.colorPreferences}</p>
                    </div>

                    <div>
                      <h3 className="font-semibold text-gray-900 mb-3">Quality Standards</h3>
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                        {enhancedProject.qualityStandards}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Supporting Documents */}
                {enhancedProject.uploadedDocuments && enhancedProject.uploadedDocuments.length > 0 && (
                  <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Supporting Documents</h2>
                    <div className="space-y-3">
                      {enhancedProject.uploadedDocuments.map((doc, index) => (
                        <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                          <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">{doc.title}</p>
                            <p className="text-sm text-gray-500">{doc.name}</p>
                          </div>
                          <button className="text-blue-600 hover:text-blue-800 font-medium">
                            Download
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Project Summary */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h2 className="text-lg font-bold text-gray-900 mb-4">Project Summary</h2>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Budget</p>
                      <p className="text-2xl font-bold text-gray-900">{project.budget}</p>
                      <p className="text-xs text-gray-500">Priority: {enhancedProject.budgetPriority}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Timeline</p>
                      <p className="text-lg font-semibold text-gray-900">{enhancedProject.estimatedDuration}</p>
                      <p className="text-xs text-gray-500">Start: {enhancedProject.estimatedStartDate}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Design Style</p>
                      <div className="space-y-1">
                        <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
                          Current: {enhancedProject.existingStyle}
                        </span>
                        <br />
                        <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
                          Desired: {enhancedProject.desiredStyle}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Competition & Deadline */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h2 className="text-lg font-bold text-gray-900 mb-4">Competition</h2>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Proposals Submitted</p>
                      <p className="text-3xl font-bold text-gray-900">{project.proposals}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Your Match Score</p>
                      <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getMatchColor(project.match)}`}>
                        {project.match}% Match
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Deadline</p>
                      <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getBidCountdownColor(project.bidCountdown)}`}>
                        {project.bidCountdown}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* BOQ Tab */}
        {activeTab === 'boq' && (
          <div className="max-w-7xl mx-auto">
            <BOQDisplay project={project} isVendorView={true} />
          </div>
        )}

        {/* Client & Timeline Tab */}
        {activeTab === 'client' && (
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Client Information */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Client Information</h2>
                <div className="space-y-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-lg font-medium">
                        {enhancedProject.clientName.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-gray-900">{enhancedProject.clientName}</p>
                      <p className="text-sm text-gray-500">Verified Client</p>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3 text-gray-600">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span>{enhancedProject.fullAddress}</span>
                    </div>
                    
                    <div className="flex items-center space-x-3 text-gray-600">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <span>{enhancedProject.clientEmail}</span>
                    </div>
                    
                    <div className="flex items-center space-x-3 text-gray-600">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      <span>{enhancedProject.clientPhone}</span>
                    </div>
                  </div>
                  
                  <div className="border-t border-gray-200 pt-4">
                    <h3 className="font-semibold text-gray-900 mb-3">Client Statistics</h3>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>• Average rating: 4.8/5</p>
                      <p>• 12 completed projects</p>
                      <p>• Member since 2021</p>
                      <p>• Response time: Within 24 hours</p>
                    </div>
                  </div>

                  {/* Communication Preferences */}
                  <div className="border-t border-gray-200 pt-4">
                    <h3 className="font-semibold text-gray-900 mb-3">Communication Preferences</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Preferred Method:</span>
                        <span className="text-gray-900 font-medium">{enhancedProject.communicationPreference}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Reporting:</span>
                        <span className="text-gray-900 font-medium">{enhancedProject.reportingFrequency}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Meetings:</span>
                        <span className="text-gray-900 font-medium">{enhancedProject.meetingSchedule}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Timeline & Competition */}
              <div className="space-y-6">
                {/* Timeline Information */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Project Timeline</h2>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Estimated Start Date</p>
                      <p className="text-gray-900 font-semibold">{enhancedProject.estimatedStartDate}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Project Duration</p>
                      <p className="text-gray-900 font-semibold">{enhancedProject.estimatedDuration}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Urgency Level</p>
                      <span className="inline-block px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm">
                        {enhancedProject.projectUrgency}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Working Hours</p>
                      <p className="text-gray-900">{enhancedProject.workingHours}</p>
                    </div>
                    {enhancedProject.accessRestrictions && (
                      <div>
                        <p className="text-sm font-medium text-gray-500">Access Restrictions</p>
                        <p className="text-gray-600 text-sm">{enhancedProject.accessRestrictions}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Special Notes */}
                {enhancedProject.specialNotes && (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
                    <h2 className="text-lg font-bold text-amber-900 mb-3">Special Notes</h2>
                    <p className="text-amber-800">{enhancedProject.specialNotes}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Action Bar */}
      <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4">
        <div className="flex justify-between items-center max-w-7xl mx-auto">
          <button
            onClick={onBack}
            className="flex items-center space-x-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span>Back to Projects</span>
          </button>
          <button
            onClick={() => onCreateProposal(project)}
            className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-medium hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            Create Proposal
          </button>
        </div>
      </div>
    </div>
  );
}
