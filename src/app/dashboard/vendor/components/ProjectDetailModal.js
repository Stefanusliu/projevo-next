'use client';

import { useState } from 'react';

export default function ProjectDetailModal({ project, isOpen, onClose, onCreateProposal }) {
  if (!isOpen || !project) return null;

  const getBidCountdownColor = (countdown) => {
    const days = parseInt(countdown.split(" ")[0]);
    if (days <= 3)
      return "text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-900/20";
    if (days <= 7)
      return "text-orange-600 bg-orange-50 dark:text-orange-400 dark:bg-orange-900/20";
    return "text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-900/20";
  };

  const getMatchColor = (match) => {
    if (match >= 90) return "text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-900/20";
    if (match >= 80) return "text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-900/20";
    return "text-yellow-600 bg-yellow-50 dark:text-yellow-400 dark:bg-yellow-900/20";
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{project.name}</h2>
            <p className="text-slate-600 dark:text-slate-400">{project.client} • {project.location}</p>
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
          {/* Project Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <div className="lg:col-span-2">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Project Description</h3>
              <p className="text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
                {project.description}
              </p>

              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Detailed Requirements</h3>
              <div className="space-y-3">
                {project.requirements.map((requirement, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-slate-600 dark:text-slate-400">{requirement}</span>
                  </div>
                ))}
              </div>

              <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <h4 className="font-medium text-blue-900 dark:text-blue-400 mb-2">Additional Information</h4>
                <ul className="text-sm text-blue-800 dark:text-blue-300 space-y-1">
                  <li>• Site visit will be arranged for shortlisted vendors</li>
                  <li>• All materials must comply with local building codes</li>
                  <li>• Insurance certificate required before project start</li>
                  <li>• Weekly progress reports mandatory</li>
                </ul>
              </div>
            </div>

            <div className="space-y-6">
              {/* Key Details */}
              <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Project Details</h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Budget</p>
                    <p className="text-xl font-bold text-slate-900 dark:text-white">{project.budget}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Timeline</p>
                    <p className="text-lg font-semibold text-slate-900 dark:text-white">{project.timeEstimation}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Category</p>
                    <span className="inline-block px-3 py-1 bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 rounded-full text-sm font-medium">
                      {project.category}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Industry</p>
                    <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400 rounded-full text-sm font-medium">
                      {project.industry}
                    </span>
                  </div>
                </div>
              </div>

              {/* Competition & Deadline */}
              <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Competition</h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Proposals Submitted</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">{project.proposals}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Your Match Score</p>
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getMatchColor(project.match)}`}>
                      {project.match}% Match
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Deadline</p>
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getBidCountdownColor(project.bidCountdown)}`}>
                      {project.bidCountdown}
                    </span>
                  </div>
                </div>
              </div>

              {/* Client Information */}
              <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Client Information</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-medium">
                        {project.client.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white">{project.client}</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">Verified Client</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-slate-600 dark:text-slate-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>{project.location}</span>
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">
                    <p>• Average rating: 4.8/5</p>
                    <p>• 12 completed projects</p>
                    <p>• Member since 2021</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-slate-200 dark:border-slate-700">
            <button
              onClick={onClose}
              className="px-6 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >
              Close
            </button>
            <button
              onClick={() => onCreateProposal(project)}
              className="px-6 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg font-medium hover:from-green-700 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              Create Proposal
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
