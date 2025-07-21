'use client';

import { useState } from 'react';
import BOQDisplay from '../../../components/BOQDisplay';

export default function ProjectDetailModal({ project, isOpen, onClose, onCreateProposal }) {
  const [activeTab, setActiveTab] = useState('overview');
  
  if (!isOpen || !project) return null;

  // Enhanced project data with comprehensive details from project creation form
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
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                {enhancedProject.projectType}
              </span>
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                {project.category}
              </span>
            </div>
            <h2 className="text-2xl font-bold text-slate-900">{enhancedProject.projectTitle}</h2>
            <p className="text-slate-600">{enhancedProject.clientName} • {enhancedProject.city}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <svg className="w-6 h-6 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200 px-6">
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

        <div className="p-6">
          {/* Tab Content */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              <div className="lg:col-span-2 space-y-6">
                {/* Project Description */}
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-4">Project Description</h3>
                  <p className="text-slate-600 leading-relaxed mb-4">
                    {project.description}
                  </p>
                  
                  {/* Project Background & Goals */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="p-4 bg-slate-50 rounded-lg">
                      <h4 className="font-medium text-slate-900 mb-2">Project Background</h4>
                      <p className="text-sm text-slate-600">{enhancedProject.projectBackground}</p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-lg">
                      <h4 className="font-medium text-slate-900 mb-2">Project Goals</h4>
                      <p className="text-sm text-slate-600">{enhancedProject.projectGoals}</p>
                    </div>
                  </div>
                </div>

                {/* Location Details */}
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-4">Location & Property Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-slate-500">Full Address</p>
                        <p className="text-slate-900">{enhancedProject.fullAddress}</p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-500">Property Type</p>
                        <p className="text-slate-900">{enhancedProject.propertyType}</p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-slate-500">Property Size</p>
                        <p className="text-slate-900">{enhancedProject.propertySize}</p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-500">Property Condition</p>
                        <p className="text-slate-900">{enhancedProject.propertyCondition}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Project Scope */}
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-4">Project Scope</h3>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {enhancedProject.projectScope.map((scope, index) => (
                      <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                        {scope}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Requirements */}
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-4">Detailed Requirements</h3>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-slate-900 mb-2">Basic Requirements</h4>
                      <div className="space-y-2">
                        {project.requirements.map((requirement, index) => (
                          <div key={index} className="flex items-start space-x-3">
                            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                            <span className="text-slate-600">{requirement}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-slate-900 mb-2">Specific Requirements</h4>
                      <p className="text-slate-600">{enhancedProject.specificRequirements}</p>
                    </div>
                  </div>
                </div>

                {/* Technical Specifications */}
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-4">Technical Specifications</h3>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-slate-900 mb-2">Design Preferences</h4>
                      <div className="flex flex-wrap gap-2">
                        {enhancedProject.designPreferences.map((pref, index) => (
                          <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
                            {pref}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-slate-900 mb-2">Material Preferences</h4>
                      <div className="flex flex-wrap gap-2">
                        {enhancedProject.materialPreferences.map((material, index) => (
                          <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
                            {material}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium text-slate-900 mb-2">Quality Standards</h4>
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                        {enhancedProject.qualityStandards}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Supporting Documents */}
                {enhancedProject.uploadedDocuments && enhancedProject.uploadedDocuments.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-4">Supporting Documents</h3>
                    <div className="space-y-2">
                      {enhancedProject.uploadedDocuments.map((doc, index) => (
                        <div key={index} className="flex items-center space-x-3 p-3 bg-slate-50 rounded-lg">
                          <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-slate-900">{doc.title}</p>
                            <p className="text-xs text-slate-500">{doc.name}</p>
                          </div>
                          <button className="text-blue-600 hover:text-blue-800 text-sm">
                            Download
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-6">
                {/* Key Details */}
                <div className="bg-slate-50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-slate-900 mb-4">Project Summary</h3>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-slate-500">Budget</p>
                      <p className="text-xl font-bold text-slate-900">{project.budget}</p>
                      <p className="text-xs text-slate-500">Priority: {enhancedProject.budgetPriority}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Timeline</p>
                      <p className="text-lg font-semibold text-slate-900">{enhancedProject.estimatedDuration}</p>
                      <p className="text-xs text-slate-500">Start: {enhancedProject.estimatedStartDate}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Design Style</p>
                      <div className="space-y-1">
                        <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
                          Current: {enhancedProject.existingStyle}
                        </span>
                        <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
                          Desired: {enhancedProject.desiredStyle}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Competition & Deadline */}
                <div className="bg-slate-50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-slate-900 mb-4">Competition</h3>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-slate-500">Proposals Submitted</p>
                      <p className="text-2xl font-bold text-slate-900">{project.proposals}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Your Match Score</p>
                      <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getMatchColor(project.match)}`}>
                        {project.match}% Match
                      </span>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Deadline</p>
                      <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getBidCountdownColor(project.bidCountdown)}`}>
                        {project.bidCountdown}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* BOQ Tab */}
          {activeTab === 'boq' && (
            <div className="space-y-6">
              <BOQDisplay project={project} isVendorView={true} />
            </div>
          )}

          {/* Client & Timeline Tab */}
          {activeTab === 'client' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Client Information */}
              <div className="bg-slate-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Client Information</h3>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-medium">
                        {enhancedProject.clientName.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">{enhancedProject.clientName}</p>
                      <p className="text-sm text-slate-500">Verified Client</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 text-sm text-slate-600">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span>{enhancedProject.fullAddress}</span>
                    </div>
                    
                    <div className="flex items-center space-x-2 text-sm text-slate-600">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <span>{enhancedProject.clientEmail}</span>
                    </div>
                    
                    <div className="flex items-center space-x-2 text-sm text-slate-600">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      <span>{enhancedProject.clientPhone}</span>
                    </div>
                  </div>
                  
                  <div className="text-sm text-slate-600 space-y-1">
                    <p>• Average rating: 4.8/5</p>
                    <p>• 12 completed projects</p>
                    <p>• Member since 2021</p>
                    <p>• Response time: Within 24 hours</p>
                  </div>

                  {/* Communication Preferences */}
                  <div className="pt-4 border-t border-gray-200">
                    <h4 className="font-medium text-slate-900 mb-3">Communication Preferences</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Preferred Method:</span>
                        <span className="text-slate-900 font-medium">{enhancedProject.communicationPreference}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Reporting:</span>
                        <span className="text-slate-900 font-medium">{enhancedProject.reportingFrequency}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Meetings:</span>
                        <span className="text-slate-900 font-medium">{enhancedProject.meetingSchedule}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Timeline & Project Summary */}
              <div className="space-y-6">
                {/* Project Summary */}
                <div className="bg-slate-50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-slate-900 mb-4">Project Summary</h3>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-slate-500">Budget</p>
                      <p className="text-xl font-bold text-slate-900">{project.budget}</p>
                      <p className="text-xs text-slate-500">Priority: {enhancedProject.budgetPriority}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Timeline</p>
                      <p className="text-lg font-semibold text-slate-900">{enhancedProject.estimatedDuration}</p>
                      <p className="text-xs text-slate-500">Start: {enhancedProject.estimatedStartDate}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Category</p>
                      <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                        {project.category}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Industry</p>
                      <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                        {project.industry}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Competition & Deadline */}
                <div className="bg-slate-50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-slate-900 mb-4">Competition Info</h3>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-slate-500">Proposals Submitted</p>
                      <p className="text-2xl font-bold text-slate-900">{project.proposals}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Your Match Score</p>
                      <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getMatchColor(project.match)}`}>
                        {project.match}% Match
                      </span>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Tender Duration</p>
                      <p className="text-slate-900">{enhancedProject.tenderDuration}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Deadline</p>
                      <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getBidCountdownColor(project.bidCountdown)}`}>
                        {project.bidCountdown}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Timeline Information */}
                <div className="bg-slate-50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-slate-900 mb-4">Project Timeline</h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-slate-500">Estimated Start Date</p>
                      <p className="text-slate-900 font-medium">{enhancedProject.estimatedStartDate}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Project Duration</p>
                      <p className="text-slate-900 font-medium">{enhancedProject.estimatedDuration}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Urgency Level</p>
                      <span className="inline-block px-2 py-1 bg-gray-100 text-gray-800 rounded text-sm">
                        {enhancedProject.projectUrgency}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Working Hours</p>
                      <p className="text-slate-900">{enhancedProject.workingHours}</p>
                    </div>
                    {enhancedProject.accessRestrictions && (
                      <div>
                        <p className="text-sm text-slate-500">Access Restrictions</p>
                        <p className="text-slate-600 text-sm">{enhancedProject.accessRestrictions}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Special Notes */}
                {enhancedProject.specialNotes && (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-amber-900 mb-4">Special Notes</h3>
                    <p className="text-amber-800">{enhancedProject.specialNotes}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-slate-200">
            <button
              onClick={onClose}
              className="px-6 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Close
            </button>
            <button
              onClick={() => onCreateProposal(project)}
              className="px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-medium hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              Create Proposal
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
