'use client';

import { useState } from 'react';
import ProjectStatusModal from './ProjectStatusModal';

export default function MyProjectsComponent() {
  const [activeFilter, setActiveFilter] = useState('All');
  const [selectedProject, setSelectedProject] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const filters = ['All', 'In Progress', 'Completed', 'Under Review', 'On Hold'];

  const projects = [
    {
      id: 1,
      title: 'Corporate Headquarters Construction',
      client: 'TechCorp Solutions',
      status: 'In Progress',
      budget: 'Rp 3,200,000,000',
      startDate: '2024-03-15',
      deadline: '2025-01-15',
      progress: 75,
      category: 'Construction',
      location: 'Jakarta Pusat',
      description: 'Modern corporate headquarters with smart building technology and LEED certification.',
      team: ['Alex Smith', 'John Doe', 'Sarah Wilson'],
      milestones: [
        { name: 'Foundation', completed: true, date: '2024-04-20' },
        { name: 'Structure', completed: true, date: '2024-07-15' },
        { name: 'MEP Installation', completed: false, date: '2024-10-30' },
        { name: 'Finishing', completed: false, date: '2024-12-15' },
      ]
    },
    {
      id: 2,
      title: 'Luxury Restaurant Interior Design',
      client: 'Culinary Ventures Indonesia',
      status: 'Under Review',
      budget: 'Rp 750,000,000',
      startDate: '2024-02-01',
      deadline: '2024-08-15',
      progress: 100,
      category: 'Interior Design',
      location: 'Jakarta Utara',
      description: 'High-end restaurant interior with contemporary design and premium finishes.',
      team: ['Alex Smith', 'Maria Garcia'],
      milestones: [
        { name: 'Design Concept', completed: true, date: '2024-02-15' },
        { name: 'Material Selection', completed: true, date: '2024-03-01' },
        { name: 'Installation', completed: true, date: '2024-07-15' },
        { name: 'Final Touches', completed: true, date: '2024-08-10' },
      ]
    },
    {
      id: 3,
      title: 'Office Building Renovation',
      client: 'Metropolitan Properties',
      status: 'Completed',
      budget: 'Rp 1,800,000,000',
      startDate: '2024-01-10',
      deadline: '2024-06-30',
      progress: 100,
      category: 'Renovation',
      location: 'Jakarta Selatan',
      description: 'Complete renovation of 20-story office building including facade upgrade.',
      team: ['Alex Smith', 'Robert Chen', 'Lisa Park'],
      milestones: [
        { name: 'Planning', completed: true, date: '2024-01-25' },
        { name: 'Demolition', completed: true, date: '2024-02-28' },
        { name: 'Reconstruction', completed: true, date: '2024-05-15' },
        { name: 'Handover', completed: true, date: '2024-06-25' },
      ]
    },
    {
      id: 4,
      title: 'Shopping Mall Extension',
      client: 'Kemang Properties Ltd',
      status: 'In Progress',
      budget: 'Rp 2,500,000,000',
      startDate: '2024-05-01',
      deadline: '2025-03-01',
      progress: 45,
      category: 'Construction',
      location: 'Jakarta Selatan',
      description: 'Major extension project including new wing construction and infrastructure upgrades.',
      team: ['Alex Smith', 'David Kumar', 'Emma Thompson'],
      milestones: [
        { name: 'Site Preparation', completed: true, date: '2024-05-20' },
        { name: 'Foundation Work', completed: true, date: '2024-07-30' },
        { name: 'Structural Work', completed: false, date: '2024-12-15' },
        { name: 'Final Phase', completed: false, date: '2025-02-20' },
      ]
    },
    {
      id: 5,
      title: 'Startup Office Interior',
      client: 'InnovateTech Startup',
      status: 'On Hold',
      budget: 'Rp 320,000,000',
      startDate: '2024-04-15',
      deadline: '2024-09-30',
      progress: 30,
      category: 'Interior Design',
      location: 'Jakarta Selatan',
      description: 'Modern, flexible workspace design for tech startup with collaborative spaces.',
      team: ['Alex Smith', 'Amy Johnson'],
      milestones: [
        { name: 'Concept Design', completed: true, date: '2024-04-30' },
        { name: 'Space Planning', completed: false, date: '2024-06-15' },
        { name: 'Implementation', completed: false, date: '2024-08-30' },
        { name: 'Completion', completed: false, date: '2024-09-25' },
      ]
    }
  ];

  const filteredProjects = activeFilter === 'All' 
    ? projects 
    : projects.filter(project => project.status === activeFilter);

  const handleViewProject = (project) => {
    setSelectedProject(project);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedProject(null);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'In Progress':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'Under Review':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'On Hold':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default:
        return 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300';
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">My Projects</h2>
          <p className="text-slate-600 dark:text-slate-400">Manage and track your awarded projects</p>
        </div>
        <button className="px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg font-medium hover:from-green-700 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
          Browse Projects
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {filters.map((filter) => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeFilter === filter
                ? 'bg-green-600 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600'
            }`}
          >
            {filter}
          </button>
        ))}
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredProjects.map((project) => (
          <div
            key={project.id}
            className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden hover:shadow-lg transition-all duration-200 hover:-translate-y-1"
          >
            <div className="p-6">
              {/* Project Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start space-x-3">
                  <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg text-green-600 dark:text-green-400">
                    {getCategoryIcon(project.category)}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">
                      {project.title}
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {project.client} • {project.location}
                    </p>
                  </div>
                </div>
                <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${getStatusColor(project.status)}`}>
                  {project.status}
                </span>
              </div>

              {/* Description */}
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                {project.description}
              </p>

              {/* Progress */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Progress</span>
                  <span className="text-sm text-slate-600 dark:text-slate-400">{project.progress}%</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${project.progress}%` }}
                  ></div>
                </div>
              </div>

              {/* Milestones */}
              <div className="mb-4">
                <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Milestones</h4>
                <div className="space-y-1">
                  {project.milestones.slice(0, 2).map((milestone, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <div className={`w-2 h-2 rounded-full ${milestone.completed ? 'bg-green-500' : 'bg-slate-300 dark:bg-slate-600'}`}></div>
                      <span className={`text-xs ${milestone.completed ? 'text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400'}`}>
                        {milestone.name} {milestone.completed && `(${milestone.date})`}
                      </span>
                    </div>
                  ))}
                  {project.milestones.length > 2 && (
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-600"></div>
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        +{project.milestones.length - 2} more milestones
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Project Info */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Budget</p>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">{project.budget}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Deadline</p>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">
                    {new Date(project.deadline).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Team */}
              <div className="mb-4">
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">Team</p>
                <div className="flex -space-x-2">
                  {project.team.slice(0, 3).map((member, index) => (
                    <div
                      key={index}
                      className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center text-white text-xs font-medium border-2 border-white dark:border-slate-800"
                    >
                      {member.split(' ').map(n => n[0]).join('')}
                    </div>
                  ))}
                  {project.team.length > 3 && (
                    <div className="w-8 h-8 bg-slate-300 dark:bg-slate-600 rounded-full flex items-center justify-center text-slate-700 dark:text-slate-300 text-xs font-medium border-2 border-white dark:border-slate-800">
                      +{project.team.length - 3}
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex space-x-3">
                <button 
                  onClick={() => handleViewProject(project)}
                  className="flex-1 px-3 py-2 bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400 text-sm font-medium rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
                >
                  View Details
                </button>
                <button className="px-3 py-2 bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300 text-sm font-medium rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">
                  Update
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredProjects.length === 0 && (
        <div className="text-center py-12">
          <div className="w-24 h-24 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-12 h-12 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">No projects found</h3>
          <p className="text-slate-500 dark:text-slate-400 mb-4">
            {activeFilter === 'All' 
              ? "You haven't been awarded any projects yet. Browse the marketplace to find and bid on projects." 
              : `No projects with status "${activeFilter}".`}
          </p>
          <button className="px-6 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg font-medium hover:from-green-700 hover:to-emerald-700 transition-all duration-200">
            Browse Marketplace
          </button>
        </div>
      )}

      {/* Project Status Modal */}
      <ProjectStatusModal
        project={selectedProject}
        isOpen={isModalOpen}
        onClose={closeModal}
      />
    </div>
  );
}
