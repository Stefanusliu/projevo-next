'use client';

import { useState } from 'react';

export default function HistoryComponent() {
  const [activeFilter, setActiveFilter] = useState('All');
  const [selectedYear, setSelectedYear] = useState('2024');
  
  const filters = ['All', 'Completed', 'Cancelled', 'On Hold'];
  const years = ['2024', '2023', '2022', '2021'];

  const projectHistory = [
    {
      id: 1,
      title: 'Office Building Renovation',
      client: 'Metropolitan Properties',
      status: 'Completed',
      category: 'Renovation',
      location: 'Jakarta Selatan',
      startDate: '2024-01-10',
      endDate: '2024-06-30',
      budget: 'Rp 1,800,000,000',
      finalAmount: 'Rp 1,825,000,000',
      duration: '5 months 20 days',
      rating: 4.9,
      review: 'Excellent work quality and on-time delivery. Professional team with great attention to detail.',
      teamSize: 12,
      challenges: 'Weather delays during facade work',
      achievements: ['Completed 2 weeks ahead of schedule', 'Zero safety incidents', 'Client satisfaction: 98%'],
      gallery: ['renovation1.jpg', 'renovation2.jpg', 'renovation3.jpg']
    },
    {
      id: 2,
      title: 'Luxury Hotel Interior Design',
      client: 'Hospitality Ventures Indonesia',
      status: 'Completed',
      category: 'Interior Design',
      location: 'Jakarta Selatan',
      startDate: '2024-02-15',
      endDate: '2024-08-10',
      budget: 'Rp 2,650,000,000',
      finalAmount: 'Rp 2,680,000,000',
      duration: '5 months 26 days',
      rating: 5.0,
      review: 'Outstanding design concept and flawless execution. The hotel has received numerous compliments from guests.',
      teamSize: 8,
      challenges: 'Custom furniture delivery delays',
      achievements: ['Design innovation award', 'Featured in architecture magazine', 'Client referral bonus'],
      gallery: ['hotel1.jpg', 'hotel2.jpg', 'hotel3.jpg', 'hotel4.jpg']
    },
    {
      id: 3,
      title: 'Residential Complex Phase 1',
      client: 'Green Living Development',
      status: 'Completed',
      category: 'Construction',
      location: 'Jakarta Timur',
      startDate: '2023-08-01',
      endDate: '2024-03-15',
      budget: 'Rp 5,800,000,000',
      finalAmount: 'Rp 5,750,000,000',
      duration: '7 months 14 days',
      rating: 4.8,
      review: 'Great project management and quality construction. Very satisfied with the sustainable approach.',
      teamSize: 25,
      challenges: 'Permit delays and material cost fluctuations',
      achievements: ['LEED Gold certification', 'Under budget completion', 'Zero environmental violations'],
      gallery: ['residential1.jpg', 'residential2.jpg', 'residential3.jpg']
    },
    {
      id: 4,
      title: 'Shopping Mall Food Court',
      client: 'Retail Development Corp',
      status: 'Completed',
      category: 'Interior Design',
      location: 'Jakarta Barat',
      startDate: '2023-11-20',
      endDate: '2024-02-28',
      budget: 'Rp 850,000,000',
      finalAmount: 'Rp 835,000,000',
      duration: '3 months 8 days',
      rating: 4.7,
      review: 'Creative design solution that maximized space utilization. Excellent project coordination.',
      teamSize: 6,
      challenges: 'Working around mall operating hours',
      achievements: ['Completed during mall operations', 'No disruption to existing tenants', 'Early completion bonus'],
      gallery: ['foodcourt1.jpg', 'foodcourt2.jpg']
    },
    {
      id: 5,
      title: 'Corporate Training Center',
      client: 'Professional Development Inc',
      status: 'Cancelled',
      category: 'Construction',
      location: 'Jakarta Pusat',
      startDate: '2023-10-01',
      endDate: null,
      budget: 'Rp 3,200,000,000',
      finalAmount: 'Rp 480,000,000',
      duration: '1 month 15 days (cancelled)',
      rating: null,
      review: null,
      teamSize: 15,
      challenges: 'Client funding issues',
      achievements: ['Partial completion payment received', 'Amicable termination agreement'],
      cancellationReason: 'Client budget constraints due to economic downturn'
    },
    {
      id: 6,
      title: 'Boutique Store Chain Fitout',
      client: 'Fashion Retail Group',
      status: 'On Hold',
      category: 'Interior Design',
      location: 'Jakarta Selatan',
      startDate: '2024-04-01',
      endDate: null,
      budget: 'Rp 650,000,000',
      finalAmount: 'Rp 195,000,000',
      duration: '2 months (on hold)',
      rating: null,
      review: null,
      teamSize: 4,
      challenges: 'Client rebranding strategy changes',
      achievements: ['Completed design phase', 'Material procurement 50% complete'],
      holdReason: 'Client requesting design revisions due to brand refresh'
    },
    {
      id: 7,
      title: 'Industrial Warehouse Construction',
      client: 'Logistics Solutions Ltd',
      status: 'Completed',
      category: 'Construction',
      location: 'Jakarta Utara',
      startDate: '2023-05-15',
      endDate: '2023-12-20',
      budget: 'Rp 4,200,000,000',
      finalAmount: 'Rp 4,150,000,000',
      duration: '7 months 5 days',
      rating: 4.6,
      review: 'Solid construction quality and good project management. Minor delays due to weather.',
      teamSize: 20,
      challenges: 'Monsoon season delays and soil conditions',
      achievements: ['Fire safety compliance', 'Structural integrity certification', 'Cost savings achieved'],
      gallery: ['warehouse1.jpg', 'warehouse2.jpg']
    },
    {
      id: 8,
      title: 'Medical Clinic Interior',
      client: 'Healthcare Partners',
      status: 'Completed',
      category: 'Interior Design',
      location: 'Jakarta Selatan',
      startDate: '2023-09-01',
      endDate: '2023-11-30',
      budget: 'Rp 420,000,000',
      finalAmount: 'Rp 415,000,000',
      duration: '2 months 29 days',
      rating: 4.9,
      review: 'Excellent understanding of healthcare facility requirements. Clean and efficient design.',
      teamSize: 5,
      challenges: 'Medical equipment coordination',
      achievements: ['Health ministry approval', 'Infection control compliance', 'Patient satisfaction: 95%'],
      gallery: ['clinic1.jpg', 'clinic2.jpg', 'clinic3.jpg']
    }
  ];

  const filteredHistory = projectHistory.filter(project => {
    const matchesFilter = activeFilter === 'All' || project.status === activeFilter;
    const matchesYear = new Date(project.startDate).getFullYear().toString() === selectedYear;
    return matchesFilter && matchesYear;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed':
        return 'bg-blue-100 text-blue-800';
      case 'Cancelled':
        return 'bg-red-100 text-red-800';
      case 'On Hold':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-slate-100 text-slate-800';
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'Construction':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        );
      case 'Interior Design':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z" />
          </svg>
        );
      case 'Renovation':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        );
    }
  };

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <svg
          key={i}
          className={`w-4 h-4 ${i <= rating ? 'text-blue-400' : 'text-slate-300'}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      );
    }
    return stars;
  };

  const stats = {
    totalProjects: projectHistory.length,
    completedProjects: projectHistory.filter(p => p.status === 'Completed').length,
    totalEarnings: projectHistory
      .filter(p => p.status === 'Completed')
      .reduce((sum, p) => sum + parseInt(p.finalAmount.replace(/[^\d]/g, '')), 0),
    averageRating: projectHistory
      .filter(p => p.rating)
      .reduce((sum, p) => sum + p.rating, 0) / projectHistory.filter(p => p.rating).length,
    successRate: Math.round((projectHistory.filter(p => p.status === 'Completed').length / projectHistory.length) * 100)
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Project History</h2>
          <p className="text-slate-600">Your complete portfolio of awarded projects and achievements</p>
        </div>
        <button className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-medium hover:from-blue-700 hover:to-blue-800 transition-all duration-200">
          Export Portfolio
        </button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-lg p-4 border border-slate-200">
          <div className="text-2xl font-bold text-slate-900">{stats.totalProjects}</div>
          <div className="text-sm text-slate-600">Total Projects</div>
        </div>
        <div className="bg-white rounded-lg p-4 border border-slate-200">
          <div className="text-2xl font-bold text-blue-600">{stats.completedProjects}</div>
          <div className="text-sm text-slate-600">Completed</div>
        </div>
        <div className="bg-white rounded-lg p-4 border border-slate-200">
          <div className="text-2xl font-bold text-blue-600">
            {new Intl.NumberFormat('id-ID', {
              style: 'currency',
              currency: 'IDR',
              notation: 'compact',
              maximumFractionDigits: 1
            }).format(stats.totalEarnings)}
          </div>
          <div className="text-sm text-slate-600">Total Earnings</div>
        </div>
        <div className="bg-white rounded-lg p-4 border border-slate-200">
          <div className="text-2xl font-bold text-gray-600">{stats.averageRating?.toFixed(1) || 'N/A'}</div>
          <div className="text-sm text-slate-600">Avg Rating</div>
        </div>
        <div className="bg-white rounded-lg p-4 border border-slate-200">
          <div className="text-2xl font-bold text-blue-600">{stats.successRate}%</div>
          <div className="text-sm text-slate-600">Success Rate</div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center">
        <div className="flex flex-wrap gap-2">
          {filters.map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeFilter === filter
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200:bg-slate-600'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
        <select
          value={selectedYear}
          onChange={(e) => setSelectedYear(e.target.value)}
          className="px-4 py-2 border border-slate-300 rounded-lg bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {years.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
      </div>

      {/* Project History List */}
      <div className="space-y-6">
        {filteredHistory.map((project) => (
          <div
            key={project.id}
            className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-lg transition-all duration-200"
          >
            <div className="p-6">
              {/* Project Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start space-x-4">
                  <div className="p-3 bg-blue-100 rounded-lg text-blue-600">
                    {getCategoryIcon(project.category)}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-slate-900 mb-1">
                      {project.title}
                    </h3>
                    <p className="text-slate-600 mb-2">
                      {project.client} • {project.location}
                    </p>
                    <div className="flex items-center space-x-4 text-sm text-slate-500">
                      <span>Started: {new Date(project.startDate).toLocaleDateString()}</span>
                      {project.endDate && <span>Completed: {new Date(project.endDate).toLocaleDateString()}</span>}
                      <span>Duration: {project.duration}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(project.status)}`}>
                    {project.status}
                  </span>
                  {project.rating && (
                    <div className="flex items-center space-x-1 mt-2">
                      {renderStars(project.rating)}
                      <span className="text-sm text-slate-600 ml-1">
                        {project.rating.toFixed(1)}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Project Details */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div>
                  <h4 className="text-sm font-medium text-slate-700 mb-2">Financial Details</h4>
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Budget:</span>
                      <span className="text-slate-900">{project.budget}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Final Amount:</span>
                      <span className="text-slate-900 font-medium">{project.finalAmount}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Team Size:</span>
                      <span className="text-slate-900">{project.teamSize} members</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-slate-700 mb-2">
                    {project.status === 'Completed' ? 'Achievements' : 'Current Status'}
                  </h4>
                  <div className="space-y-1">
                    {project.achievements.slice(0, 3).map((achievement, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                        <span className="text-sm text-slate-600">{achievement}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-slate-700 mb-2">
                    {project.status === 'Completed' ? 'Challenges Overcome' : 'Current Challenges'}
                  </h4>
                  <p className="text-sm text-slate-600">{project.challenges}</p>
                  {project.cancellationReason && (
                    <div className="mt-2">
                      <span className="text-sm font-medium text-red-600">Cancellation Reason:</span>
                      <p className="text-sm text-red-600">{project.cancellationReason}</p>
                    </div>
                  )}
                  {project.holdReason && (
                    <div className="mt-2">
                      <span className="text-sm font-medium text-gray-600">On Hold:</span>
                      <p className="text-sm text-gray-600">{project.holdReason}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Client Review */}
              {project.review && (
                <div className="bg-slate-50 rounded-lg p-4 mb-4">
                  <h4 className="text-sm font-medium text-slate-700 mb-2">Client Review</h4>
                  <p className="text-sm text-slate-600 italic">&ldquo;{project.review}&rdquo;</p>
                </div>
              )}

              {/* Gallery */}
              {project.gallery && project.gallery.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-slate-700 mb-2">Project Gallery</h4>
                  <div className="flex space-x-2">
                    {project.gallery.slice(0, 4).map((image, index) => (
                      <div
                        key={index}
                        className="w-16 h-16 bg-slate-200 rounded-lg flex items-center justify-center"
                      >
                        <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    ))}
                    {project.gallery.length > 4 && (
                      <div className="w-16 h-16 bg-slate-200 rounded-lg flex items-center justify-center">
                        <span className="text-xs text-slate-500">+{project.gallery.length - 4}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex space-x-3">
                <button className="flex-1 px-4 py-2 bg-blue-50 text-blue-700 text-sm font-medium rounded-lg hover:bg-blue-100 transition-colors">
                  View Full Details
                </button>
                <button className="px-4 py-2 bg-slate-100 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-200:bg-slate-600 transition-colors">
                  Download Report
                </button>
                {project.status === 'Completed' && (
                  <button className="px-4 py-2 bg-blue-50 text-blue-700 text-sm font-medium rounded-lg hover:bg-blue-100:bg-blue-900/30 transition-colors">
                    Use as Reference
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredHistory.length === 0 && (
        <div className="text-center py-12">
          <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-12 h-12 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-slate-900 mb-2">No projects found</h3>
          <p className="text-slate-500 mb-4">
            No awarded projects match your current filters for {selectedYear}.
          </p>
          <button className="px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-medium hover:from-blue-700 hover:to-blue-800 transition-all duration-200">
            Browse Marketplace
          </button>
        </div>
      )}
    </div>
  );
}
