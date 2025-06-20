'use client';

export default function ProposalDetailModal({ proposal, isOpen, onClose }) {
  if (!isOpen || !proposal) return null;

  const getStatusColor = (status) => {
    switch (status) {
      case 'Accepted':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'Under Review':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'Rejected':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'Draft':
        return 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300';
      default:
        return 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Accepted':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'Pending':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'Under Review':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
          </svg>
        );
      case 'Rejected':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'Draft':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`flex items-center space-x-2 px-3 py-1 rounded-full ${getStatusColor(proposal.status)}`}>
              {getStatusIcon(proposal.status)}
              <span className="text-sm font-medium">{proposal.status}</span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">{proposal.projectTitle}</h2>
              <p className="text-slate-600 dark:text-slate-400">{proposal.client}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            <svg className="w-6 h-6 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6">
          {/* Proposal Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <div className="lg:col-span-2">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Project Description</h3>
              <p className="text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
                {proposal.description}
              </p>

              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Your Proposal</h3>
              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 mb-6">
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                  {proposal.proposal}
                </p>
              </div>

              {/* Status-specific content */}
              {proposal.status === 'Under Review' && proposal.reviewStage && (
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mb-6">
                  <h4 className="font-medium text-blue-900 dark:text-blue-400 mb-2">Review Progress</h4>
                  <div className="flex items-center space-x-3">
                    <div className="flex-1 bg-blue-200 dark:bg-blue-800 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${proposal.reviewProgress}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-blue-700 dark:text-blue-300">{proposal.reviewProgress}%</span>
                  </div>
                  <p className="text-sm text-blue-700 dark:text-blue-300 mt-2">
                    Current stage: {proposal.reviewStage}
                  </p>
                </div>
              )}

              {proposal.status === 'Draft' && proposal.draftProgress && (
                <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-4 mb-6">
                  <h4 className="font-medium text-slate-900 dark:text-slate-300 mb-2">Draft Progress</h4>
                  <div className="flex items-center space-x-3">
                    <div className="flex-1 bg-slate-200 dark:bg-slate-600 rounded-full h-2">
                      <div
                        className="bg-slate-600 dark:bg-slate-400 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${proposal.draftProgress}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-slate-700 dark:text-slate-300">{proposal.draftProgress}%</span>
                  </div>
                  {proposal.deadline && (
                    <p className="text-sm text-red-600 dark:text-red-400 mt-2">
                      Deadline: {new Date(proposal.deadline).toLocaleDateString()}
                    </p>
                  )}
                </div>
              )}

              {proposal.status === 'Rejected' && proposal.rejectionReason && (
                <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 mb-6">
                  <h4 className="font-medium text-red-900 dark:text-red-400 mb-2">Rejection Reason</h4>
                  <p className="text-red-800 dark:text-red-300 text-sm">
                    {proposal.rejectionReason}
                  </p>
                  {proposal.feedback && (
                    <div className="mt-3 pt-3 border-t border-red-200 dark:border-red-800">
                      <p className="text-red-700 dark:text-red-300 text-sm">
                        <strong>Client Feedback:</strong> {proposal.feedback}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Attachments */}
              {proposal.attachments && proposal.attachments.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Attachments</h3>
                  <div className="space-y-2">
                    {proposal.attachments.map((attachment, index) => (
                      <div key={index} className="flex items-center space-x-3 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                        <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                        </svg>
                        <span className="text-sm text-slate-700 dark:text-slate-300">{attachment}</span>
                        <button className="ml-auto text-green-600 hover:text-green-700 text-sm font-medium">
                          Download
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-6">
              {/* Proposal Details */}
              <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Proposal Details</h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Your Bid</p>
                    <p className="text-xl font-bold text-green-600 dark:text-green-400">{proposal.proposedBudget}</p>
                    <p className="text-xs text-slate-500">vs {proposal.budget} budget</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Timeline</p>
                    <p className="text-lg font-semibold text-slate-900 dark:text-white">{proposal.timeline}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Category</p>
                    <span className="inline-block px-3 py-1 bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 rounded-full text-sm font-medium">
                      {proposal.category}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Location</p>
                    <p className="text-sm text-slate-700 dark:text-slate-300">{proposal.location}</p>
                  </div>
                  {proposal.submittedDate && (
                    <div>
                      <p className="text-sm text-slate-500 dark:text-slate-400">Submitted</p>
                      <p className="text-sm text-slate-700 dark:text-slate-300">
                        {new Date(proposal.submittedDate).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Competition Info */}
              <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Competition</h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Total Proposals</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">{proposal.competitorCount}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Response Status</p>
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{proposal.responseTime}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between items-center pt-6 border-t border-slate-200 dark:border-slate-700">
            <div className="text-sm text-slate-500">
              {proposal.status === 'Draft' && (
                <p>💡 Complete your draft to submit this proposal</p>
              )}
              {proposal.status === 'Pending' && (
                <p>⏳ Waiting for client response</p>
              )}
              {proposal.status === 'Under Review' && (
                <p>👀 Your proposal is being evaluated</p>
              )}
              {proposal.status === 'Accepted' && (
                <p>🎉 Congratulations! Your proposal was accepted</p>
              )}
              {proposal.status === 'Rejected' && (
                <p>📝 Learn from this experience for future proposals</p>
              )}
            </div>
            <div className="flex space-x-4">
              <button
                onClick={onClose}
                className="px-6 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
              >
                Close
              </button>
              {proposal.status === 'Draft' && (
                <button className="px-6 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg font-medium hover:from-green-700 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
                  Complete Draft
                </button>
              )}
              {proposal.status === 'Accepted' && (
                <button className="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
                  Start Project
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
