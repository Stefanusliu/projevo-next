'use client';

export default function ProjectStatusModal({ project, isOpen, onClose }) {
  if (!isOpen || !project) return null;

  const getStatusColor = (status) => {
    switch (status) {
      case 'In Progress':
        return 'bg-blue-100 text-blue-800';
      case 'Completed':
        return 'bg-blue-100 text-blue-800';
      case 'Under Review':
        return 'bg-gray-100 text-gray-800';
      case 'On Hold':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-slate-100 text-slate-800';
    }
  };

  const getProgressColor = (progress) => {
    if (progress >= 75) return 'bg-blue-500';
    if (progress >= 25) return 'bg-blue-400';
    return 'bg-blue-300';
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(project.status)}`}>
              {project.status}
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">{project.title}</h2>
              <p className="text-slate-600">{project.client} &bull; {project.location}</p>
            </div>
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

        <div className="p-6">
          {/* Project Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <div className="lg:col-span-2">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Project Description</h3>
              <p className="text-slate-600 mb-6 leading-relaxed">
                {project.description}
              </p>

              {/* Progress Bar */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-lg font-semibold text-slate-900">Progress</h3>
                  <span className="text-2xl font-bold text-slate-900">{project.progress}%</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full transition-all duration-300 ${getProgressColor(project.progress)}`}
                    style={{ width: `${project.progress}%` }}
                  ></div>
                </div>
              </div>

              {/* Milestones */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Project Milestones</h3>
                <div className="space-y-4">
                  {project.milestones?.map((milestone, index) => (
                    <div key={index} className="flex items-center space-x-4">
                      <div className={`w-4 h-4 rounded-full ${
                        milestone.completed 
                          ? 'bg-blue-500' 
                          : 'bg-slate-300'
                      }`}>
                        {milestone.completed && (
                          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                      <div className="flex-1">
                        <p className={`font-medium ${
                          milestone.completed 
                            ? 'text-slate-900'
                            : 'text-slate-500'
                        }`}>
                          {milestone.name}
                        </p>
                        <p className="text-sm text-slate-500">
                          {milestone.completed ? 'Completed: ' : 'Expected: '}{milestone.date}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Team Members */}
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Team Members</h3>
                <div className="flex flex-wrap gap-2">
                  {project.team?.map((member, index) => (
                    <div key={index} className="flex items-center space-x-2 bg-blue-50 px-3 py-2 rounded-full">
                      <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs font-medium">
                          {member.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <span className="text-sm text-blue-800">{member}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              {/* Project Details */}
              <div className="bg-slate-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Project Details</h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-slate-500">Category:</p>
                    <span className="inline-block px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm font-medium">{project.category}</span>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Start Date:</p>
                    <p className="text-sm text-slate-700">{new Date(project.startDate).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Deadline:</p>
                    <p className="text-sm text-slate-700">{new Date(project.deadline).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>

              {/* Timeline Info */}
              <div className="bg-slate-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Timeline</h3>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Elapsed:</span>
                    <span className="text-slate-900 font-medium">
                      {Math.floor((new Date() - new Date(project.startDate)) / (1000 * 60 * 60 * 24))} days
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Remaining:</span>
                    <span className="text-slate-900 font-medium">
                      {Math.floor((new Date(project.deadline) - new Date()) / (1000 * 60 * 60 * 24))} days
                    </span>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-slate-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Quick Actions</h3>
                <div className="space-y-2">
                  {project.status === 'In Progress' && (
                    <>
                      <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
                        Update Progress
                      </button>
                      <button className="w-full px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors text-sm font-medium">
                        Upload Files
                      </button>
                    </>
                  )}
                  {project.status === 'Under Review' && (
                    <button className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm font-medium">
                      View Review Comments
                    </button>
                  )}
                  {project.status === 'Completed' && (
                    <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
                      View Final Report
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-slate-200">
            <button
              onClick={onClose}
              className="px-6 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Close
            </button>
            <button className="px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
              View Full Details
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
