import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../../contexts/AuthContext';
import { db } from '../../../../lib/firebase';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { FiLoader } from 'react-icons/fi';
import ProjectDetailPage from './ProjectDetailPage';
import VendorProposalModal from './VendorProposalModal';
import CreateProposalPage from './CreateProposalPage';
import ProjectStatusModal from './ProjectStatusModal';

export default function MyProjectsComponent({ projectFilter = "All" }) {
  const { user } = useAuth();
  const [activeFilter, setActiveFilter] = useState('All');
  const [selectedProject, setSelectedProject] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDetailsView, setShowDetailsView] = useState(false);
  const [showCreateProposal, setShowCreateProposal] = useState(false);
  
  const filters = ['All', 'In Progress', 'Completed', 'Under Review', 'On Hold'];

  // Helper function to get milestones from BOQ data
  const getMilestones = (project) => {
    // If project has attached BOQ, create milestones from tahapan kerja
    if (project.attachedBOQ && project.attachedBOQ.tahapanKerja) {
      return project.attachedBOQ.tahapanKerja.map((tahapan, index) => {
        const milestoneName = tahapan.name || tahapan.nama || `Tahapan ${index + 1}`;
        return {
          name: milestoneName,
          completed: false,
          date: ''
        };
      });
    }
    
    // Check for BOQ data in other possible locations
    if (project.boq?.tahapanKerja && project.boq.tahapanKerja.length > 0) {
      return project.boq.tahapanKerja.map((tahapan, index) => {
        const milestoneName = tahapan.name || tahapan.nama || `Tahapan ${index + 1}`;
        return {
          name: milestoneName,
          completed: false,
          date: ''
        };
      });
    }
    
    // Fallback to existing milestones
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

  // Handle proposal creation/editing
  const handleCreateProposal = (project) => {
    setSelectedProject(project);
    
    // Check if this is a resubmission (vendor wants to edit existing proposal)
    if (project.isResubmission) {
      console.log('🔄 Opening proposal editor for resubmission:', project.existingProposal);
      setShowCreateProposal(true);
    } else {
      // Regular proposal creation - show modal
      setIsModalOpen(true);
    }
  };

  const handleEditProposal = (project) => {
    setSelectedProject({
      ...project,
      isResubmission: true,
      existingProposal: getVendorProposal(project)
    });
    setShowCreateProposal(true);
  };

  // Get vendor's proposal from project
  const getVendorProposal = (project) => {
    if (!user?.uid || !project.proposals) return null;
    return project.proposals.find(proposal => 
      proposal.vendorId === user.uid || 
      proposal.userId === user.uid
    );
  };

  // Get vendor project status
  const getVendorProjectStatus = (project) => {
    if (!user?.uid) return 'Unknown';
    
    // Check if vendor has been awarded
    if (project.awardedVendorId === user.uid) {
      return 'In Progress';
    }
    
    // Check proposal status
    const vendorProposal = getVendorProposal(project);
    if (vendorProposal) {
      if (vendorProposal.status === 'accepted') {
        return 'In Progress';
      } else if (vendorProposal.status === 'rejected') {
        return 'Rejected';
      } else if (vendorProposal.status === 'pending_review') {
        return 'Proposal Submitted';
      } else if (vendorProposal.status === 'negotiating') {
        return 'Negotiating';
      } else if (vendorProposal.status === 'pending') {
        return 'Awaiting Review';
      } else {
        return 'Under Review';
      }
    }
    
    return 'Available';
  };

  // Check if project has started (for progress tracking)
  const isProjectStarted = (project) => {
    // Check if vendor has been awarded and project has started
    if (project.awardedVendorId === user.uid) {
      return true;
    }
    
    // Check if vendor proposal has been accepted
    const vendorProposal = project.proposals?.find(proposal => proposal.vendorId === user.uid);
    return vendorProposal?.status === 'accepted';
  };

  // Format budget
  const formatBudget = (budget) => {
    if (!budget) return 'Budget not specified';
    const numBudget = parseInt(budget.toString().replace(/[^\d]/g, ''));
    if (isNaN(numBudget)) return 'Budget not specified';
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR'
    }).format(numBudget);
  };

  // Action buttons based on project status
  const getActionButton = (project) => {
    const status = getVendorProjectStatus(project);
    
    switch (status) {
      case 'Available':
        return (
          <button
            onClick={() => handleCreateProposal(project)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors duration-200 flex items-center justify-center gap-2 whitespace-nowrap flex-1 h-[80px]"
          >
            Create Proposal
          </button>
        );
      
      case 'Proposal Submitted':
      case 'Awaiting Review':
        return (
          <button
            onClick={() => handleEditProposal(project)}
            className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors duration-200 flex items-center justify-center gap-2 whitespace-nowrap flex-1 h-[80px]"
          >
            Update Proposal
          </button>
        );
        
      case 'In Progress':
        return (
          <button
            onClick={() => setSelectedProject(project)}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors duration-200 flex items-center justify-center gap-2 whitespace-nowrap flex-1 h-[80px]"
          >
            View Details
          </button>
        );
        
      case 'Negotiating':
        return (
          <button
            onClick={() => setSelectedProject(project)}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors duration-200 flex items-center justify-center gap-2 whitespace-nowrap flex-1 h-[80px]"
          >
            View Details
          </button>
        );
        
      case 'Completed':
        return (
          <button
            onClick={() => setSelectedProject(project)}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors duration-200 flex items-center justify-center gap-2 whitespace-nowrap flex-1 h-[80px]"
          >
            View Results
          </button>
        );
        
      default:
        return (
          <button
            onClick={() => setSelectedProject(project)}
            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors duration-200 flex items-center justify-center gap-2 whitespace-nowrap flex-1 h-[80px]"
          >
            View Details
          </button>
        );
    }
  };

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
      
      // Filter projects where vendor has submitted proposals or been awarded
      const vendorProjects = allProjects.filter(project => {
        // Check if vendor has submitted a proposal
        const hasProposal = project.proposals?.some(proposal => {
          return proposal.vendorId === user.uid || 
                 proposal.userId === user.uid || 
                 proposal.submittedBy === user.uid;
        });
        
        // Check if vendor has been awarded
        const isAwarded = project.awardedVendorId === user.uid || 
                         project.selectedVendorId === user.uid;
        
        return hasProposal || isAwarded;
      });
      
      console.log('Vendor projects found:', vendorProjects.length);
      setProjects(vendorProjects);
      setLoading(false);
    }, (error) => {
      console.error('Error loading vendor projects:', error);
      setLoading(false);
    });
    
    return () => unsubscribe();
  }, [user]);

  // Filter projects based on active filter
  const filteredProjects = projects.filter(project => {
    if (activeFilter === 'All') return true;
    const status = getVendorProjectStatus(project);
    return status === activeFilter;
  });

  const handleBackToList = () => {
    setShowDetailsView(false);
    setShowCreateProposal(false);
    setSelectedProject(null);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedProject(null);
  };

  return (
    <>
      {showDetailsView && selectedProject ? (
        <ProjectDetailPage
          project={selectedProject}
          onBack={handleBackToList}
          onCreateProposal={handleCreateProposal}
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
              </div>

              {/* Filters */}
              <div className="flex flex-wrap gap-2">
                {filters.map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setActiveFilter(filter)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      activeFilter === filter
                        ? 'text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                    style={activeFilter === filter ? { backgroundColor: '#2373FF' } : {}}
                  >
                    {filter}
                  </button>
                ))}
              </div>

              {/* Projects Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredProjects.map((project) => (
                  <div
                    key={project.id}
                    className="bg-white rounded-lg shadow-sm border border-gray-300 overflow-hidden hover:shadow-md transition-all duration-200 hover:-translate-y-1 flex flex-col relative"
                  >
                    <div className="p-6 flex flex-col">
                      {/* Project ID */}
                      <div className="mb-3">
                        <p className="text-xs text-gray-500 mb-1">Project ID</p>
                        <p className="text-sm font-mono text-gray-800 font-medium">
                          {project.customId || `#${project.id}`}
                        </p>
                      </div>

                      {/* Project Header */}
                      <div className="mb-4">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-semibold text-black mb-1 truncate">
                            {project.title || project.projectTitle}
                          </h3>
                          <p className="text-sm text-gray-600 truncate">
                            {project.marketplace?.location?.city || project.city || 'Unknown Location'}, Indonesia
                          </p>
                        </div>
                        
                        {/* Milestone Progress Bar */}
                        <div className="mt-3 mb-4">
                          {isProjectStarted(project) && project.progress && project.progress > 0 ? (
                            <div>
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-medium text-gray-700">Progress Proyek</span>
                                <span className="text-xs text-gray-600">{project.progress}%</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-4">
                                <div
                                  className="h-4 rounded-full transition-all duration-300"
                                  style={{ 
                                    width: `${project.progress}%`,
                                    backgroundColor: '#2373FF'
                                  }}
                                ></div>
                              </div>
                            </div>
                          ) : (
                            <div>
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-medium text-gray-700">Milestone Progress</span>
                                <span className="text-xs text-gray-600">0% selesai</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-3 relative">
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <span className="text-xs text-gray-500 font-medium">Proyek Belum Mulai</span>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Milestone Tahapan from BOQ */}
                        <div className="mb-4">
                          <p className="text-xs text-gray-500 mb-2">Milestone Tahapan</p>
                          <div className="flex flex-wrap gap-1">
                            {(() => {
                              const milestones = getMilestones(project);
                              return milestones.slice(0, 3).map((milestone, index) => (
                                <span
                                  key={index}
                                  className={`px-2 py-1 text-xs font-medium rounded ${
                                    milestone.completed 
                                      ? 'bg-green-100 text-green-800' 
                                      : 'bg-gray-100 text-gray-600'
                                  }`}
                                >
                                  {milestone.name}
                                </span>
                              ));
                            })()}
                            {(() => {
                              const milestones = getMilestones(project);
                              return milestones.length > 3 && (
                                <span className="px-2 py-1 text-xs text-gray-500 bg-gray-100 rounded">
                                  +{milestones.length - 3} more
                                </span>
                              );
                            })()}
                          </div>
                        </div>
                      </div>

                      {/* Project Details */}
                      <div>
                        <div className="space-y-4">
                          {/* Anggaran */}
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Anggaran</p>
                            <p className="text-base font-bold text-black">
                              {formatBudget(project.marketplace?.budget || project.estimatedBudget || project.budget)}
                            </p>
                          </div>

                          {/* Jenis Proyek & Properti */}
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-xs text-gray-500 mb-1">Jenis Proyek</p>
                              <p className="text-sm font-bold text-black">
                                {project.projectType || 'Not specified'}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 mb-1">Properti</p>
                              <p className="text-sm font-bold text-black">
                                {project.propertyType || 'Not specified'}
                              </p>
                            </div>
                          </div>

                          {/* Ruang Lingkup & Metode Pengadaan */}
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-xs text-gray-500 mb-1">Ruang Lingkup</p>
                              <p className="text-sm font-bold text-black">
                                {(project.projectScope || project.scope || []).length > 0 
                                  ? (project.projectScope || project.scope || [])[0]
                                  : 'No scope'
                                }
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 mb-1">Metode Pengadaan</p>
                              <p className="text-sm font-bold text-black">
                                {project.procurementMethod === 'Tender' ? 'Tender' : 
                                 project.procurementMethod === 'Penunjukan Langsung' ? 'Langsung' : 
                                 'Langsung'}
                              </p>
                            </div>
                          </div>

                          {/* Durasi Tender, Durasi Proyek, Estimasi Mulai, Pemilik Proyek - 4 columns in one row */}
                          <div className="grid grid-cols-4 gap-4">
                            <div>
                              <p className="text-xs text-gray-500 mb-1">Durasi Tender</p>
                              <p className="text-sm font-bold text-black">
                                {project.tenderDuration || 'Not specified'}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 mb-1">Durasi Proyek</p>
                              <p className="text-sm font-bold text-black">
                                {project.estimatedDuration || 'Not specified'}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 mb-1">Estimasi Mulai</p>
                              <p className="text-sm font-bold text-black">
                                {project.estimatedStartDate 
                                  ? new Date(project.estimatedStartDate).toLocaleDateString('id-ID', { 
                                      year: 'numeric', 
                                      month: 'long' 
                                    })
                                  : 'Not specified'
                                }
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 mb-1">Pemilik Proyek</p>
                              <p className="text-sm font-bold text-black">
                                {project.ownerName || project.ownerEmail?.split('@')[0] || 'Unknown Owner'}
                              </p>
                            </div>
                          </div>

                          {/* Catatan & Status */}
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-xs text-gray-500 mb-1">Catatan</p>
                              <div className="bg-gray-100 p-3 rounded-lg">
                                <p className="text-xs text-gray-700">
                                  {project.specialNotes || project.notes || project.description?.slice(0, 100) || 'Tidak ada catatan khusus'}
                                  {(project.description && project.description.length > 100) && '...'}
                                </p>
                              </div>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 mb-1">Status</p>
                              <div className="bg-gray-100 p-3 rounded-lg flex items-center justify-center">
                                <span className="text-xs font-medium text-gray-700">
                                  {getVendorProjectStatus(project)}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex-shrink-0 mt-5">
                        {getActionButton(project)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Empty State */}
              {filteredProjects.length === 0 && (
                <div className="text-center py-12 bg-white rounded-lg border border-gray-300">
                  <p className="text-gray-500">No projects found</p>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Project Status Modal */}
      {isModalOpen && selectedProject && (
        <ProjectStatusModal
          project={selectedProject}
          isOpen={isModalOpen}
          onClose={closeModal}
        />
      )}
      
      {/* Proposal Creation Modal */}
      {isModalOpen && selectedProject && (
        <VendorProposalModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          project={selectedProject}
          onProposalSubmitted={() => {
            setIsModalOpen(false);
            setSelectedProject(null);
          }}
        />
      )}
      
      {/* Create Proposal Page */}
      {showCreateProposal && selectedProject && (
        <CreateProposalPage
          project={selectedProject}
          onBack={() => {
            setShowCreateProposal(false);
            setSelectedProject(null);
          }}
          onSubmit={() => {
            setShowCreateProposal(false);
            setSelectedProject(null);
          }}
        />
      )}
    </>
  );
}
