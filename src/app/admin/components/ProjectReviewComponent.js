'use client';

import { useState } from 'react';

export default function ProjectReviewComponent() {
  const [projects] = useState([
    {
      id: 1,
      title: "Modern Cafe Interior Design",
      client: "PT. Kuliner Modern",
      clientEmail: "admin@kulinermodern.co.id",
      clientPhone: "+62812345678",
      submittedDate: "2024-06-18",
      status: "pending_review",
      budget: "Rp 185M",
      estimatedDuration: "4 months",
      priority: "high",
      type: "Interior Design",
      location: "South Jakarta",
      description: "Design interior modern untuk cafe dengan konsep minimalis dan cozy. Target market adalah young professionals dan students. Dibutuhkan area seating untuk 50 orang, bar counter, dan kitchen area.",
      scope: ["Interior Design", "Furniture Selection", "Lighting Design", "Color Scheme"],
      requirements: [
        "Modern minimalist design",
        "Comfortable seating for 50 people",
        "Professional kitchen layout",
        "Ambient lighting system",
        "WiFi-friendly workspace areas"
      ],
      attachments: [
        { name: "Floor Plan.pdf", size: "2.4 MB" },
        { name: "Reference Images.zip", size: "15.2 MB" },
        { name: "Budget Breakdown.xlsx", size: "1.1 MB" }
      ]
    },
    {
      id: 2,
      title: "Office Building Renovation",
      client: "CV. Berkah Jaya",
      clientEmail: "project@berkahjaya.co.id",
      clientPhone: "+62812345679",
      submittedDate: "2024-06-17",
      status: "under_review",
      budget: "Rp 450M",
      estimatedDuration: "6 months",
      priority: "medium",
      type: "Renovation",
      location: "Central Jakarta",
      description: "Renovasi complete office building 5 lantai untuk meningkatkan efisiensi dan modernitas. Termasuk upgrade sistem MEP, interior design, dan facade renovation.",
      scope: ["Structural Renovation", "MEP Upgrade", "Interior Design", "Facade Renovation"],
      requirements: [
        "Energy-efficient building systems",
        "Modern office layout",
        "Improved natural lighting",
        "Upgraded HVAC system",
        "Modern facade design"
      ],
      attachments: [
        { name: "Building Plans.pdf", size: "8.4 MB" },
        { name: "Structural Report.pdf", size: "3.2 MB" },
        { name: "MEP Specifications.pdf", size: "2.8 MB" }
      ],
      reviewer: "Tech Team Alpha",
      reviewStartDate: "2024-06-17",
      reviewProgress: 65
    },
    {
      id: 3,
      title: "Residential Complex Architecture",
      client: "PT. Properti Nusantara",
      clientEmail: "development@propertinusantara.co.id",
      clientPhone: "+62812345680",
      submittedDate: "2024-06-16",
      status: "needs_revision",
      budget: "Rp 1.2B",
      estimatedDuration: "12 months",
      priority: "high",
      type: "Architecture",
      location: "Bekasi",
      description: "Desain kompleks perumahan dengan 50 unit rumah, fasilitas umum, dan infrastructure. Target market adalah middle-class families dengan konsep modern tropical.",
      scope: ["Master Planning", "Architectural Design", "Infrastructure Design", "Landscape Design"],
      requirements: [
        "50 residential units",
        "Community facilities",
        "Modern tropical architecture",
        "Sustainable design principles",
        "Complete infrastructure"
      ],
      attachments: [
        { name: "Master Plan.pdf", size: "12.4 MB" },
        { name: "Site Analysis.pdf", size: "6.2 MB" },
        { name: "Unit Designs.pdf", size: "9.8 MB" }
      ],
      reviewer: "Senior Architect",
      reviewStartDate: "2024-06-16",
      reviewNotes: "Design concept excellent, but needs revision on unit layout efficiency and parking allocation."
    }
  ]);

  const [selectedProject, setSelectedProject] = useState(null);
  const [reviewModal, setReviewModal] = useState(false);
  const [reviewAction, setReviewAction] = useState('');
  const [reviewNotes, setReviewNotes] = useState('');

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending_review':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'under_review':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'needs_revision':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400';
      case 'approved':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'rejected':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-900/20';
      case 'medium':
        return 'text-orange-600 bg-orange-50 dark:text-orange-400 dark:bg-orange-900/20';
      case 'low':
        return 'text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-900/20';
      default:
        return 'text-gray-600 bg-gray-50 dark:text-gray-400 dark:bg-gray-900/20';
    }
  };

  const handleReview = (project, action) => {
    setSelectedProject(project);
    setReviewAction(action);
    setReviewModal(true);
  };

  const submitReview = () => {
    // Here you would typically send the review data to your backend
    console.log('Review submitted:', {
      project: selectedProject,
      action: reviewAction,
      notes: reviewNotes
    });
    
    setReviewModal(false);
    setSelectedProject(null);
    setReviewAction('');
    setReviewNotes('');
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            Project Review
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2">
            Review and approve project submissions from clients
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          <select className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white">
            <option>All Status</option>
            <option>Pending Review</option>
            <option>Under Review</option>
            <option>Needs Revision</option>
            <option>Approved</option>
            <option>Rejected</option>
          </select>
          
          <select className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white">
            <option>All Priorities</option>
            <option>High</option>
            <option>Medium</option>
            <option>Low</option>
          </select>
        </div>
      </div>

      {/* Projects List */}
      <div className="space-y-4">
        {projects.map((project) => (
          <div key={project.id} className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-3">
                  <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                    {project.title}
                  </h2>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(project.priority)}`}>
                    {project.priority.toUpperCase()}
                  </span>
                  <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(project.status)}`}>
                    {project.status.replace('_', ' ').toUpperCase()}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Client</p>
                    <p className="font-medium text-slate-900 dark:text-white">{project.client}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Budget</p>
                    <p className="font-medium text-slate-900 dark:text-white">{project.budget}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Submitted</p>
                    <p className="font-medium text-slate-900 dark:text-white">{formatDate(project.submittedDate)}</p>
                  </div>
                </div>

                <p className="text-slate-600 dark:text-slate-400 mb-4 line-clamp-2">
                  {project.description}
                </p>

                <div className="flex items-center space-x-4 text-sm text-slate-500 dark:text-slate-400">
                  <div className="flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {project.location}
                  </div>
                  <div className="flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    {project.type}
                  </div>
                  <div className="flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {project.estimatedDuration}
                  </div>
                  <div className="flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                    </svg>
                    {project.attachments.length} files
                  </div>
                </div>

                {project.status === 'under_review' && (
                  <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-blue-700 dark:text-blue-300">
                        Under review by {project.reviewer} since {formatDate(project.reviewStartDate)}
                      </span>
                      <span className="text-blue-600 dark:text-blue-400 font-medium">
                        {project.reviewProgress}% complete
                      </span>
                    </div>
                    <div className="mt-2 w-full bg-blue-200 dark:bg-blue-800 rounded-full h-2">
                      <div 
                        className="bg-blue-600 dark:bg-blue-400 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${project.reviewProgress}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                {project.status === 'needs_revision' && project.reviewNotes && (
                  <div className="mt-4 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                    <p className="text-sm text-orange-700 dark:text-orange-300 font-medium mb-1">
                      Revision Required:
                    </p>
                    <p className="text-sm text-orange-600 dark:text-orange-400">
                      {project.reviewNotes}
                    </p>
                  </div>
                )}
              </div>

              <div className="flex items-center space-x-3 ml-6">
                <button 
                  onClick={() => setSelectedProject(project)}
                  className="px-4 py-2 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors"
                >
                  View Details
                </button>
                
                {project.status === 'pending_review' && (
                  <>
                    <button 
                      onClick={() => handleReview(project, 'approve')}
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                    >
                      Approve
                    </button>
                    <button 
                      onClick={() => handleReview(project, 'reject')}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                    >
                      Reject
                    </button>
                    <button 
                      onClick={() => handleReview(project, 'revision')}
                      className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors"
                    >
                      Request Revision
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Project Detail Modal */}
      {selectedProject && !reviewModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-6 py-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{selectedProject.title}</h2>
              <button
                onClick={() => setSelectedProject(null)}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                <svg className="w-6 h-6 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Project Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Project Information</h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-slate-500 dark:text-slate-400">Client</p>
                      <p className="font-medium text-slate-900 dark:text-white">{selectedProject.client}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500 dark:text-slate-400">Email</p>
                      <p className="font-medium text-slate-900 dark:text-white">{selectedProject.clientEmail}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500 dark:text-slate-400">Phone</p>
                      <p className="font-medium text-slate-900 dark:text-white">{selectedProject.clientPhone}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500 dark:text-slate-400">Location</p>
                      <p className="font-medium text-slate-900 dark:text-white">{selectedProject.location}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Project Details</h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-slate-500 dark:text-slate-400">Budget</p>
                      <p className="font-medium text-slate-900 dark:text-white">{selectedProject.budget}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500 dark:text-slate-400">Duration</p>
                      <p className="font-medium text-slate-900 dark:text-white">{selectedProject.estimatedDuration}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500 dark:text-slate-400">Type</p>
                      <p className="font-medium text-slate-900 dark:text-white">{selectedProject.type}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500 dark:text-slate-400">Submitted</p>
                      <p className="font-medium text-slate-900 dark:text-white">{formatDate(selectedProject.submittedDate)}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">Description</h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{selectedProject.description}</p>
              </div>

              {/* Scope */}
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">Project Scope</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedProject.scope.map((item, index) => (
                    <span key={index} className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-full text-sm">
                      {item}
                    </span>
                  ))}
                </div>
              </div>

              {/* Requirements */}
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">Requirements</h3>
                <ul className="space-y-2">
                  {selectedProject.requirements.map((req, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <span className="text-green-500 mt-1">✓</span>
                      <span className="text-slate-600 dark:text-slate-400">{req}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Attachments */}
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">Attachments</h3>
                <div className="space-y-2">
                  {selectedProject.attachments.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                        <span className="text-slate-900 dark:text-white font-medium">{file.name}</span>
                        <span className="text-slate-500 dark:text-slate-400 text-sm">({file.size})</span>
                      </div>
                      <button className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300">
                        Download
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {reviewModal && selectedProject && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl max-w-2xl w-full">
            <div className="p-6 border-b border-slate-200 dark:border-slate-700">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                {reviewAction === 'approve' ? 'Approve Project' : 
                 reviewAction === 'reject' ? 'Reject Project' : 'Request Revision'}
              </h2>
              <p className="text-slate-600 dark:text-slate-400 mt-1">{selectedProject.title}</p>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  {reviewAction === 'approve' ? 'Approval Notes' : 
                   reviewAction === 'reject' ? 'Rejection Reason' : 'Revision Requirements'}
                </label>
                <textarea
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                  placeholder={`Enter ${reviewAction} notes...`}
                />
              </div>
              
              {reviewAction === 'approve' && (
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <p className="text-sm text-green-700 dark:text-green-300">
                    This project will be approved and made available for vendor bidding.
                  </p>
                </div>
              )}
              
              {reviewAction === 'reject' && (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <p className="text-sm text-red-700 dark:text-red-300">
                    This project will be rejected and the client will be notified.
                  </p>
                </div>
              )}
              
              {reviewAction === 'revision' && (
                <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                  <p className="text-sm text-orange-700 dark:text-orange-300">
                    The client will be asked to make revisions based on your feedback.
                  </p>
                </div>
              )}
            </div>
            
            <div className="p-6 border-t border-slate-200 dark:border-slate-700 flex justify-end space-x-3">
              <button
                onClick={() => setReviewModal(false)}
                className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={submitReview}
                className={`px-6 py-2 text-white rounded-lg transition-colors ${
                  reviewAction === 'approve' ? 'bg-green-600 hover:bg-green-700' :
                  reviewAction === 'reject' ? 'bg-red-600 hover:bg-red-700' :
                  'bg-orange-600 hover:bg-orange-700'
                }`}
              >
                {reviewAction === 'approve' ? 'Approve Project' : 
                 reviewAction === 'reject' ? 'Reject Project' : 'Request Revision'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
