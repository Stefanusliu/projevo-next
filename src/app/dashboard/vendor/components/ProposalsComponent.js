'use client';

import { useState } from 'react';
import ProposalDetailModal from './ProposalDetailModal';

export default function ProposalsComponent() {
  const [activeFilter, setActiveFilter] = useState('All');
  const [selectedProposal, setSelectedProposal] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  
  const filters = ['All', 'Pending', 'Under Review', 'Accepted', 'Rejected', 'Draft'];

  const proposals = [
    {
      id: 1,
      projectTitle: 'Modern Office Complex - Sudirman',
      client: 'Corporate Real Estate Ltd',
      status: 'Pending',
      submittedDate: '2024-06-15',
      budget: 'Rp 4,500,000,000',
      proposedBudget: 'Rp 4,200,000,000',
      timeline: '14 months',
      category: 'Construction',
      location: 'Jakarta Pusat',
      competitorCount: 8,
      responseTime: '3 days remaining',
      description: 'Complete construction of modern office complex with sustainable design features and smart building technology.',
      proposal: 'Our team proposes a comprehensive approach utilizing green building materials and latest construction technologies to deliver this project efficiently while maintaining the highest quality standards.',
      attachments: ['Technical_Proposal.pdf', 'Project_Timeline.pdf', 'Budget_Breakdown.xlsx']
    },
    {
      id: 2,
      projectTitle: 'Luxury Hotel Interior Design',
      client: 'Hospitality Ventures Indonesia',
      status: 'Accepted',
      submittedDate: '2024-06-10',
      budget: 'Rp 2,800,000,000',
      proposedBudget: 'Rp 2,650,000,000',
      timeline: '8 months',
      category: 'Interior Design',
      location: 'Jakarta Selatan',
      competitorCount: 5,
      responseTime: 'Accepted',
      description: 'Complete interior design and fitout for 5-star luxury hotel including lobby, restaurants, guest rooms, and common areas.',
      proposal: 'We propose a sophisticated design concept that blends modern luxury with Indonesian cultural elements, creating a unique and memorable guest experience.',
      attachments: ['Design_Concept.pdf', 'Material_Samples.pdf', 'Portfolio.pdf']
    },
    {
      id: 3,
      projectTitle: 'Shopping Center Renovation',
      client: 'Retail Properties Group',
      status: 'Rejected',
      submittedDate: '2024-06-05',
      budget: 'Rp 1,500,000,000',
      proposedBudget: 'Rp 1,450,000,000',
      timeline: '6 months',
      category: 'Renovation',
      location: 'Jakarta Barat',
      competitorCount: 12,
      responseTime: 'Rejected',
      description: 'Comprehensive renovation of existing shopping center including facade upgrade, interior modernization, and MEP systems improvement.',
      proposal: 'Our renovation approach focuses on minimal disruption to ongoing operations while delivering maximum impact through strategic design improvements.',
      attachments: ['Renovation_Plan.pdf', 'Timeline.pdf'],
      rejectionReason: 'Budget constraints - client selected lower cost proposal',
      feedback: 'Your proposal was well-structured, but we went with a more cost-effective solution. We encourage you to bid on future projects.'
    },
    {
      id: 4,
      projectTitle: 'Residential Complex Architecture',
      client: 'Green Living Development',
      status: 'Under Review',
      submittedDate: '2024-06-18',
      budget: 'Rp 6,200,000,000',
      proposedBudget: 'Rp 5,800,000,000',
      timeline: '18 months',
      category: 'Architecture',
      location: 'Jakarta Timur',
      competitorCount: 6,
      responseTime: '5 days remaining',
      description: 'Architectural design for eco-friendly residential complex with 150 units, community facilities, and sustainable infrastructure.',
      proposal: 'We propose an innovative sustainable design approach incorporating renewable energy systems, rainwater harvesting, and green building materials.',
      attachments: ['Architectural_Design.pdf', 'Sustainability_Report.pdf', 'Site_Analysis.pdf'],
      reviewStage: 'Technical Evaluation',
      reviewProgress: 75
    },
    {
      id: 5,
      projectTitle: 'Corporate Office Interior',
      client: 'TechStart Solutions',
      status: 'Draft',
      submittedDate: null,
      budget: 'Rp 450,000,000',
      proposedBudget: 'Rp 420,000,000',
      timeline: '10 weeks',
      category: 'Interior Design',
      location: 'Jakarta Selatan',
      competitorCount: 4,
      responseTime: '2 days left to submit',
      description: 'Modern startup office interior design with flexible workspaces, collaboration areas, and recreational facilities.',
      proposal: 'Draft proposal focusing on creating an inspiring work environment that promotes creativity and collaboration...',
      attachments: [],
      draftProgress: 85,
      deadline: '2024-06-25'
    },
    {
      id: 5,
      projectTitle: 'Corporate Campus Interior',
      client: 'Tech Innovation Corp',
      status: 'Draft',
      submittedDate: null,
      budget: 'Rp 3,500,000,000',
      proposedBudget: 'Rp 3,200,000,000',
      timeline: '10 months',
      category: 'Interior Design',
      location: 'Jakarta Selatan',
      competitorCount: 4,
      responseTime: 'Draft - 2 days to submit',
      description: 'Interior design for new corporate campus including offices, meeting spaces, cafeteria, and recreational areas.',
      proposal: 'Our design concept creates a modern, collaborative workspace that promotes creativity and productivity while reflecting the company\'s innovative culture.',
      attachments: ['Draft_Proposal.pdf']
    },
    {
      id: 6,
      projectTitle: 'Restaurant Chain Fitout',
      client: 'Culinary Expansion LLC',
      status: 'Accepted',
      submittedDate: '2024-06-08',
      budget: 'Rp 980,000,000',
      proposedBudget: 'Rp 920,000,000',
      timeline: '4 months',
      category: 'Interior Design',
      location: 'Jakarta Pusat',
      competitorCount: 7,
      responseTime: 'Accepted',
      description: 'Interior design and fitout for new restaurant chain location with modern casual dining concept.',
      proposal: 'We propose a flexible design solution that can be easily replicated across multiple locations while maintaining brand consistency.',
      attachments: ['Brand_Guidelines.pdf', 'Design_Proposal.pdf', 'Cost_Analysis.xlsx']
    }
  ];

  const filteredProposals = activeFilter === 'All' 
    ? proposals 
    : proposals.filter(proposal => proposal.status === activeFilter);

  const handleViewProposal = (proposal) => {
    setSelectedProposal(proposal);
    setIsDetailModalOpen(true);
  };

  const closeModal = () => {
    setIsDetailModalOpen(false);
    setSelectedProposal(null);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Accepted':
        return 'bg-blue-100 text-blue-800';
      case 'Pending':
        return 'bg-gray-100 text-gray-800';
      case 'Under Review':
        return 'bg-blue-100 text-blue-800';
      case 'negotiate':
      case 'Negotiate':
        return 'bg-blue-100 text-blue-800';
      case 'Rejected':
        return 'bg-red-100 text-red-800';
      case 'Draft':
        return 'bg-slate-100 text-slate-800';
      default:
        return 'bg-slate-100 text-slate-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Accepted':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'Pending':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'Under Review':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
          </svg>
        );
      case 'negotiate':
      case 'Negotiate':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        );
      case 'Rejected':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'Draft':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        );
      default:
        return null;
    }
  };

  const stats = {
    total: proposals.length,
    pending: proposals.filter(p => p.status === 'Pending').length,
    accepted: proposals.filter(p => p.status === 'Accepted').length,
    rejected: proposals.filter(p => p.status === 'Rejected').length,
    draft: proposals.filter(p => p.status === 'Draft').length,
    successRate: Math.round((proposals.filter(p => p.status === 'Accepted').length / proposals.filter(p => p.status !== 'Draft').length) * 100)
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">My Proposals</h2>
          <p className="text-slate-600">Track your submitted proposals and their status</p>
        </div>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
          Tender
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <div className="bg-white rounded-lg p-4 border border-slate-200">
          <div className="text-2xl font-bold text-slate-900">{stats.total}</div>
          <div className="text-sm text-slate-600">Total</div>
        </div>
        <div className="bg-white rounded-lg p-4 border border-slate-200">
          <div className="text-2xl font-bold text-gray-600">{stats.pending}</div>
          <div className="text-sm text-slate-600">Pending</div>
        </div>
        <div className="bg-white rounded-lg p-4 border border-slate-200">
          <div className="text-2xl font-bold text-blue-600">{stats.accepted}</div>
          <div className="text-sm text-slate-600">Accepted</div>
        </div>
        <div className="bg-white rounded-lg p-4 border border-slate-200">
          <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
          <div className="text-sm text-slate-600">Rejected</div>
        </div>
        <div className="bg-white rounded-lg p-4 border border-slate-200">
          <div className="text-2xl font-bold text-slate-600">{stats.draft}</div>
          <div className="text-sm text-slate-600">Draft</div>
        </div>
        <div className="bg-white rounded-lg p-4 border border-slate-200">
          <div className="text-2xl font-bold text-blue-600">{stats.successRate}%</div>
          <div className="text-sm text-slate-600">Success Rate</div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {filters.map((filter) => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeFilter === filter
                ? 'bg-blue-600 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            {filter}
          </button>
        ))}
      </div>

      {/* Proposals List */}
      <div className="space-y-4">
        {filteredProposals.map((proposal) => (
          <div
            key={proposal.id}
            className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-lg transition-all duration-200"
          >
            <div className="p-6">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-semibold text-slate-900">
                      {proposal.projectTitle}
                    </h3>
                    <span className={`inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-full ${getStatusColor(proposal.status)}`}>
                      {getStatusIcon(proposal.status)}
                      <span className="ml-1">{proposal.status}</span>
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 mb-1">
                    {proposal.client} &bull; {proposal.location}
                  </p>
                  <p className="text-sm text-slate-500">
                    {proposal.submittedDate ? `Submitted: ${new Date(proposal.submittedDate).toLocaleDateString()}` : 'Draft'}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-slate-900">
                    {proposal.responseTime}
                  </div>
                  <div className="text-xs text-slate-500">
                    {proposal.competitorCount} competitors
                  </div>
                </div>
              </div>

              {/* Description */}
              <p className="text-sm text-slate-600 mb-4">
                {proposal.description}
              </p>

              {/* Proposal Summary */}
              <div className="bg-slate-50 rounded-lg p-4 mb-4">
                <h4 className="text-sm font-medium text-slate-900 mb-2">Your Proposal</h4>
                <p className="text-sm text-slate-600">
                  {proposal.proposal}
                </p>
              </div>

              {/* Rejection Reason */}
              {proposal.status === 'Rejected' && proposal.rejectionReason && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                  <h4 className="text-sm font-medium text-red-800 mb-1">Rejection Reason</h4>
                  <p className="text-sm text-red-700">
                    {proposal.rejectionReason}
                  </p>
                </div>
              )}

              {/* Details Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <p className="text-xs text-slate-500">Budget</p>
                  <p className="text-sm font-semibold text-slate-900">
                    {proposal.budget}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Proposal</p>
                  <p className="text-sm font-semibold text-slate-900">
                    {proposal.proposedBudget}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Timeline</p>
                  <p className="text-sm font-semibold text-slate-900">
                    {proposal.timeline}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Status</p>
                  <p className="text-sm font-semibold text-slate-900">
                    {proposal.status}
                  </p>
                </div>
              </div>

              {/* Attachments */}
              {proposal.attachments && proposal.attachments.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-slate-700 mb-2">Attachments</h4>
                  <div className="flex flex-wrap gap-2">
                    {proposal.attachments.map((attachment, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2.5 py-1 text-xs bg-blue-50 text-blue-700 rounded"
                      >
                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                        </svg>
                        {attachment}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex space-x-3">
                {proposal.status === 'Draft' ? (
                  <>
                    <button className="flex-1 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-all">
                      Complete & Submit
                    </button>
                    <button className="px-4 py-2 bg-slate-100 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-200 transition-colors">
                      Edit Draft
                    </button>
                  </>
                ) : (
                  <>
                    <button 
                      onClick={() => handleViewProposal(proposal)}
                      className="flex-1 px-4 py-2 bg-blue-50 text-blue-700 text-sm font-medium rounded-lg hover:bg-blue-100 transition-colors"
                    >
                      View Details
                    </button>
                    {proposal.status === 'Rejected' && (
                      <button className="px-4 py-2 bg-blue-50 text-blue-700 text-sm font-medium rounded-lg hover:bg-blue-100 transition-colors">
                        Resubmit
                      </button>
                    )}
                    {proposal.status === 'Accepted' && (
                      <button className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">
                        Start Project
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredProposals.length === 0 && (
        <div className="text-center py-12">
          <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-12 h-12 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2h-1" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-slate-900">No proposals found</h3>
          <p className="text-slate-500 mt-2">
            There are no proposals matching the filter &quot;{activeFilter}&quot;.
          </p>
        </div>
      )}

      {selectedProposal && (
        <ProposalDetailModal 
          isOpen={isDetailModalOpen} 
          onClose={closeModal} 
          proposal={selectedProposal}
        />
      )}
    </div>
  );
}
