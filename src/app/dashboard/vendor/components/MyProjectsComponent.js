'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../../../contexts/AuthContext';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '../../../../lib/firebase';
import ProjectStatusModal from './ProjectStatusModal';
import ProjectDetailPage from './ProjectDetailPage';
import { FiLoader } from 'react-icons/fi';

export default function MyProjectsComponent({ projectFilter = "All" }) {
  const { user } = useAuth();
  const [activeFilter, setActiveFilter] = useState('All');
  const [selectedProject, setSelectedProject] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDetailsView, setShowDetailsView] = useState(false);
  
  const filters = ['All', 'In Progress', 'Completed', 'Under Review', 'On Hold'];

  // Load projects where vendor has submitted proposals or been awarded
  useEffect(() => {
    if (!user?.uid) {
      setLoading(false);
      return;
    }
    
    console.log('Loading vendor projects for user:', user.uid);
    setLoading(true);
    
    // Query projects where the vendor has submitted proposals
    const projectsQuery = query(
      collection(db, 'projects'),
      orderBy('createdAt', 'desc')
    );
    
    const unsubscribe = onSnapshot(projectsQuery, (snapshot) => {
      const allProjects = [];
      snapshot.forEach((doc) => {
        allProjects.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      console.log('All projects loaded:', allProjects.length);
      console.log('Current user ID:', user.uid);
      
      // Debug: Log project procurement methods
      allProjects.forEach(project => {
        if (project.proposals && project.proposals.length > 0) {
          console.log(`Project ${project.id}: procurementMethod = ${project.procurementMethod}, hasProposals = ${project.proposals.length}`);
        }
      });
      
      // Filter projects where vendor has submitted proposals or been awarded
      const vendorProjects = allProjects.filter(project => {
        // Debug: Log each project's proposals
        if (project.proposals && project.proposals.length > 0) {
          console.log(`Project ${project.id} has proposals:`, project.proposals);
          project.proposals.forEach((proposal, index) => {
            console.log(`  Proposal ${index}: vendorId = ${proposal.vendorId}, current user = ${user.uid}`);
          });
        }
        
        // Check if vendor has submitted a proposal
        const hasProposal = project.proposals?.some(proposal => {
          console.log(`Checking proposal: ${proposal.vendorId} === ${user.uid} = ${proposal.vendorId === user.uid}`);
          // Check multiple possible vendor ID fields
          return proposal.vendorId === user.uid || 
                 proposal.userId === user.uid || 
                 proposal.submittedBy === user.uid;
        });
        
        // Check if vendor has been awarded
        const isAwarded = project.awardedVendorId === user.uid;
        
        console.log(`Project ${project.id}: hasProposal = ${hasProposal}, isAwarded = ${isAwarded}`);
        
        return hasProposal || isAwarded;
      });
      
      console.log('Filtered vendor projects:', vendorProjects.length, vendorProjects);
      
      // Debug: Log procurement methods of filtered projects
      vendorProjects.forEach(project => {
        console.log(`Vendor project ${project.id}: procurementMethod = "${project.procurementMethod}"`);
      });
      
      setProjects(vendorProjects);
      setLoading(false);
    }, (error) => {
      console.error('Error loading vendor projects:', error);
      setLoading(false);
    });
    
    return () => unsubscribe();
  }, [user?.uid]);

  // First filter by project type (from sidebar)
  console.log('Project filter received:', projectFilter);
  console.log('Projects before type filtering:', projects.length);
  
  let typeFilteredProjects = projects;
  if (projectFilter === 'Tender') {
    typeFilteredProjects = projects.filter(project => project.procurementMethod === 'Tender');
    console.log('Filtered for Tender projects:', typeFilteredProjects.length);
  } else if (projectFilter === 'Contract') {
    typeFilteredProjects = projects.filter(project => project.procurementMethod === 'Contract');
    console.log('Filtered for Contract projects:', typeFilteredProjects.length);
  } else if (projectFilter === 'All' || projectFilter === 'Project') {
    // Show all projects when "Project" or "All" is selected
    typeFilteredProjects = projects;
    console.log('Showing all projects:', typeFilteredProjects.length);
  }

  // Then filter by status
  const filteredProjects = activeFilter === 'All' 
    ? typeFilteredProjects 
    : typeFilteredProjects.filter(project => project.status === activeFilter);

  const handleViewProject = (project) => {
    setSelectedProject(project);
    setShowDetailsView(true);
  };

  const handleBackToList = () => {
    setShowDetailsView(false);
    setSelectedProject(null);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedProject(null);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed':
        return 'bg-blue-100 text-blue-800';
      case 'In Progress':
        return 'bg-blue-100 text-blue-800';
      case 'Under Review':
        return 'bg-gray-100 text-gray-800';
      case 'On Hold':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-slate-100 text-slate-800';
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'Tender':
        return 'bg-yellow-100 text-yellow-800';
      case 'Contract':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-slate-100 text-slate-800';
    }
  };

  const getCategoryIcon = (projectType) => {
    switch (projectType) {
      case 'Bangun':
      case 'Construction':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        );
      case 'Desain':
      case 'Interior Design':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z" />
          </svg>
        );
      case 'Renovasi':
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

  // Helper functions to format Firebase data
  const formatBudget = (budget) => {
    if (!budget) return 'Not specified';
    const numBudget = typeof budget === 'string' ? parseInt(budget.replace(/[^\d]/g, '')) : budget;
    if (isNaN(numBudget)) return 'Not specified';
    return `Rp ${numBudget.toLocaleString('id-ID')}`;
  };

  const getProjectType = (procurementMethod) => {
    switch (procurementMethod) {
      case 'Contract':
        return 'Contract';
      case 'Tender':
        return 'Tender';
      case 'Penunjukan Langsung':
        return 'Direct Appointment';
      default:
        return 'Contract';
    }
  };

  const getProjectLocation = (project) => {
    return project.marketplace?.location?.city || project.city || 'Unknown Location';
  };

  const getProjectDescription = (project) => {
    return project.specialNotes || project.description || 
           `${project.projectType} project for ${project.propertyType || 'property'} in ${getProjectLocation(project)}`;
  };

  const getMilestones = (project) => {
    if (project.attachedBOQ && project.attachedBOQ.tahapanKerja) {
      return project.attachedBOQ.tahapanKerja.map((tahapan, index) => ({
        name: tahapan.name || tahapan.nama || `Tahapan ${index + 1}`,
        completed: false,
        date: ''
      }));
    }
    
    if (project.milestones && project.milestones.length > 0) {
      return project.milestones;
    }
    
    // Default milestones based on project type
    const defaultMilestones = {
      'Desain': [
        { name: 'Concept Design', completed: false, date: '' },
        { name: 'Design Development', completed: false, date: '' },
        { name: 'Final Design', completed: false, date: '' },
        { name: 'Design Approval', completed: false, date: '' }
      ],
      'Bangun': [
        { name: 'Site Preparation', completed: false, date: '' },
        { name: 'Foundation', completed: false, date: '' },
        { name: 'Structure', completed: false, date: '' },
        { name: 'Finishing', completed: false, date: '' }
      ],
      'Renovasi': [
        { name: 'Demolition', completed: false, date: '' },
        { name: 'Reconstruction', completed: false, date: '' },
        { name: 'Finishing', completed: false, date: '' },
        { name: 'Final Inspection', completed: false, date: '' }
      ]
    };
    
    return defaultMilestones[project.projectType] || [
      { name: 'Planning', completed: false, date: '' },
      { name: 'Execution', completed: false, date: '' },
      { name: 'Review', completed: false, date: '' },
      { name: 'Completion', completed: false, date: '' }
    ];
  };

  const getVendorStatus = (project) => {
    if (!user?.uid) return 'Unknown';
    
    // Check if vendor has been awarded
    if (project.awardedVendorId === user.uid) {
      return 'In Progress';
    }
    
    // Check proposal status
    const vendorProposal = project.proposals?.find(proposal => proposal.vendorId === user.uid);
    if (vendorProposal) {
      if (vendorProposal.status === 'accepted') {
        return 'In Progress';
      } else if (vendorProposal.status === 'rejected') {
        return 'Rejected';
      } else {
        return 'Under Review';
      }
    }
    
    return 'Unknown';
  };

  const formatDate = (date) => {
    if (!date) return 'TBD';
    if (typeof date === 'string') return date;
    if (date.toDate) return date.toDate().toLocaleDateString('id-ID');
    return new Date(date).toLocaleDateString('id-ID');
  };

  return (
    <>
      {showDetailsView && selectedProject ? (
        <ProjectDetailPage
          project={selectedProject}
          onBack={handleBackToList}
        />
      ) : (
        <div className="space-y-6">
      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center h-64">
          <FiLoader className="animate-spin h-12 w-12" style={{ color: '#2373FF' }} />
          <span className="ml-3 text-gray-600">Loading your projects...</span>
        </div>
      )}

      {!loading && (
        <>
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">
                {projectFilter === 'All' || projectFilter === 'Project' ? 'All Projects' : 
                 projectFilter === 'Tender' ? 'Tender Projects' : 
                 'Contract Projects'}
              </h2>
              <p className="text-slate-600">
                {projectFilter === 'All' || projectFilter === 'Project' ? 'View and track your awarded projects' :
                 projectFilter === 'Tender' ? 'View and track your tender projects' :
                 'View and track your contract projects'}
              </p>
            </div>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
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
                ? 'bg-blue-600 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
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
            className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-lg transition-all duration-200 hover:-translate-y-1"
          >
            <div className="p-6">
              {/* Project ID */}
              <div className="mb-3">
                <p className="text-xs text-gray-500 mb-1">Project ID</p>
                <p className="text-sm font-mono text-gray-800 font-medium">
                  {project.customId || `#${project.id}`}
                </p>
              </div>

              {/* Project Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start space-x-3">
                  <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                    {getCategoryIcon(project.projectType)}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-1">
                      {project.projectTitle || project.title}
                    </h3>
                    <p className="text-sm text-slate-600 mb-1">
                      {project.ownerName || project.ownerEmail?.split('@')[0] || 'Unknown Client'} &bull; {getProjectLocation(project)}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${getStatusColor(getVendorStatus(project))}`}>
                    {getVendorStatus(project)}
                  </span>
                  <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${getTypeColor(getProjectType(project.procurementMethod))}`}>
                    {getProjectType(project.procurementMethod)}
                  </span>
                </div>
              </div>

              {/* Description */}
              <p className="text-sm text-slate-600 mb-4">
                {getProjectDescription(project)}
              </p>

              {/* Progress */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-slate-700">Progress</span>
                  <span className="text-sm text-slate-600">{project.progress || 0}%</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${project.progress || 0}%` }}
                  ></div>
                </div>
              </div>

              {/* Milestones */}
              <div className="mb-4">
                <h4 className="text-sm font-medium text-slate-700 mb-2">Milestones</h4>
                <div className="space-y-1">
                  {(() => {
                    const milestones = getMilestones(project);
                    return milestones.slice(0, 2).map((milestone, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <div className={`w-2 h-2 rounded-full ${milestone.completed ? 'bg-blue-500' : 'bg-slate-300'}`}></div>
                        <span className={`text-xs ${milestone.completed ? 'text-slate-900' : 'text-slate-500'}`}>
                          {milestone.name} {milestone.completed && milestone.date ? `(${milestone.date})` : ''}
                        </span>
                      </div>
                    ));
                  })()}
                  {(() => {
                    const milestones = getMilestones(project);
                    return milestones.length > 2 && (
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 rounded-full bg-slate-300"></div>
                        <span className="text-xs text-slate-500">
                          +{milestones.length - 2} more milestones
                        </span>
                      </div>
                    );
                  })()}
                </div>
              </div>

              {/* Project Info */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-xs text-slate-500">Budget</p>
                  <p className="text-sm font-semibold text-slate-900">
                    {formatBudget(project.marketplace?.budget || project.estimatedBudget || project.budget)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Start Date</p>
                  <p className="text-sm font-semibold text-slate-900">
                    {formatDate(project.estimatedStartDate || project.startDate)}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex space-x-3">
                <button 
                  onClick={() => handleViewProject(project)}
                  className="flex-1 px-3 py-2 bg-blue-50 text-blue-700 text-sm font-medium rounded-lg hover:bg-blue-100 transition-colors"
                >
                  View Details
                </button>
                <button className="px-3 py-2 bg-slate-100 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-200 transition-colors">
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
          <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-12 h-12 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-slate-900 mb-2">No projects found</h3>
          <p className="text-slate-500 mb-4">
            {activeFilter === 'All' 
              ? "You haven't been awarded any projects yet. Browse the marketplace to find and bid on projects." 
              : `No projects with status "${activeFilter}".`}
          </p>
          <button className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-all duration-200">
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
        </>
      )}
        </div>
      )}
    </>
  );
}
