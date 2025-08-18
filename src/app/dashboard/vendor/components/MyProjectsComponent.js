'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../../../contexts/AuthContext';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '../../../../lib/firebase';
import ProjectStatusModal from './ProjectStatusModal';
import ProjectDetailPage from './ProjectDetailPage';
import VendorProposalModal from './VendorProposalModal';
import CreateProposalPage from './CreateProposalPage';
import { FiLoader, FiExternalLink, FiPlus, FiEdit, FiClock } from 'react-icons/fi';

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
    : typeFilteredProjects.filter(project => {
        const vendorStatus = getVendorStatus(project);
        // Handle multiple status mappings for the filter
        if (activeFilter === 'Under Review') {
          return vendorStatus === 'Under Review' || 
                 vendorStatus === 'Awaiting Review' || 
                 vendorStatus === 'Proposal Submitted';
        }
        return vendorStatus === activeFilter;
      });

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
        return 'bg-green-100 text-green-800';
      case 'Proposal Submitted':
        return 'bg-blue-100 text-blue-800';
      case 'Awaiting Review':
        return 'bg-amber-100 text-amber-800';
      case 'Negotiating':
        return 'bg-purple-100 text-purple-800';
      case 'Under Review':
        return 'bg-amber-100 text-amber-800';
      case 'Rejected':
        return 'bg-red-100 text-red-800';
      case 'Available':
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

  const formatDate = (date) => {
    if (!date) return 'TBD';
    if (typeof date === 'string') return date;
    if (date.toDate) return date.toDate().toLocaleDateString('id-ID');
    return new Date(date).toLocaleDateString('id-ID');
  };

  // Helper functions to match project-owner styling
  const getVendorPhase = (project) => {
    if (!user?.uid) return 'Unknown';
    
    // Check if vendor has been awarded
    if (project.awardedVendorId === user.uid) {
      return 'Implementation';
    }
    
    // Check proposal status
    const vendorProposal = project.proposals?.find(proposal => proposal.vendorId === user.uid);
    if (vendorProposal) {
      if (vendorProposal.status === 'accepted') {
        return 'Implementation';
      } else if (vendorProposal.status === 'rejected') {
        return 'Bid Rejected';
      } else {
        return 'Bidding';
      }
    }
    
    return 'Bidding';
  };

  const getVendorStatusColor = (project) => {
    const status = getVendorStatus(project);
    switch (status) {
      case 'In Progress':
        return '#22c55e'; // green
      case 'Proposal Submitted':
        return '#3b82f6'; // blue
      case 'Awaiting Review':
        return '#f59e0b'; // amber
      case 'Negotiating':
        return '#8b5cf6'; // purple
      case 'Under Review':
        return '#f59e0b'; // amber
      case 'Rejected':
        return '#ef4444'; // red
      case 'Completed':
        return '#3b82f6'; // blue
      case 'Available':
        return '#6b7280'; // gray
      default:
        return '#6b7280'; // gray
    }
  };

  const getVendorStatusProgress = (status) => {
    switch (status) {
      case 'Not Applied':
        return '0%';
      case 'Proposal Submitted':
        return '25%';
      case 'Awaiting Review':
        return '35%';
      case 'Negotiating':
        return '60%';
      case 'Under Review':
        return '35%';
      case 'In Progress':
        return '75%';
      case 'Completed':
        return '100%';
      case 'Rejected':
        return '10%';
      default:
        return '0%';
    }
  };

  const getVendorProposal = (project) => {
    if (!user?.uid || !project.proposals) return null;
    return project.proposals.find(proposal => proposal.vendorId === user.uid);
  };

  const getVendorPrice = (project) => {
    const proposal = getVendorProposal(project);
    if (!proposal) return 0;
    
    // Try multiple possible price fields
    return proposal.pricePerPcs || 
           proposal.vendorPrice || 
           proposal.unitPrice || 
           proposal.totalPrice || 
           proposal.price || 
           0;
  };

  // Helper function to determine action button based on vendor status - matches project owner structure exactly
  const getActionButton = (project) => {
    const vendorStatus = getVendorStatus(project);
    
    switch (vendorStatus) {
      case 'Not Applied':
        return (
          <div className="flex items-stretch gap-3 w-full">
            {/* Enhanced Available Status Card */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex-1 h-[80px] flex flex-col justify-center">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <span className="text-xs font-medium text-blue-700 uppercase tracking-wide">
                    Phase: Available
                  </span>
                </div>
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              </div>
              
              <div className="text-sm font-semibold text-blue-800">
                Status: Ready to Apply
              </div>
              
              <div className="text-xs text-blue-600 mt-1">
              </div>
            </div>
            
            {/* Action Button */}
            <button
              onClick={() => handleCreateProposal(project)}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 shadow-sm hover:shadow-md flex items-center justify-center gap-2 whitespace-nowrap flex-1 h-[80px]"
            >
              <FiPlus className="w-4 h-4" />
              Create Proposal
            </button>
          </div>
        );
        
      case 'Proposal Submitted':
      case 'Awaiting Review':
        return (
          <div className="flex items-stretch gap-3 w-full">
            {/* Enhanced Submitted Status Card */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex-1 h-[80px] flex flex-col justify-center">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <span className="text-xs font-medium text-yellow-700 uppercase tracking-wide">
                    Phase: Tender
                  </span>
                </div>
                <div className="flex space-x-1">
                  <div className="w-1 h-1 bg-yellow-500 rounded-full animate-pulse"></div>
                  <div className="w-1 h-1 bg-yellow-500 rounded-full animate-pulse" style={{animationDelay: '0.5s'}}></div>
                  <div className="w-1 h-1 bg-yellow-500 rounded-full animate-pulse" style={{animationDelay: '1s'}}></div>
                </div>
              </div>
              
              <div className="text-sm font-semibold text-yellow-800">
                Status: {vendorStatus}
              </div>
              
              <div className="text-xs text-yellow-600 mt-1">
              </div>
            </div>
            
            {/* Action Button */}
            <button
              onClick={() => handleViewProject(project)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors duration-200 flex items-center justify-center gap-2 whitespace-nowrap flex-1 h-[80px]"
            >
              <FiExternalLink className="w-4 h-4" />
              View Details
            </button>
          </div>
        );
        
      case 'Negotiating':
        return (
          <div className="flex items-stretch gap-3 w-full">
            {/* Enhanced Negotiation Status Card */}
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 flex-1 h-[80px] flex flex-col justify-center">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <span className="text-xs font-medium text-purple-700 uppercase tracking-wide">
                    Phase: Tender
                  </span>
                </div>
                <div className="flex space-x-1">
                  <div className="w-1 h-1 bg-purple-500 rounded-full animate-bounce"></div>
                  <div className="w-1 h-1 bg-purple-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                  <div className="w-1 h-1 bg-purple-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                </div>
              </div>
              
              <div className="text-sm font-semibold text-purple-800">
                Status: Negotiating
              </div>
              
              <div className="text-xs text-purple-600 mt-1">
              </div>
            </div>
            
            {/* Action Button */}
            <button
              onClick={() => handleEditProposal(project)}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors duration-200 flex items-center justify-center gap-2 whitespace-nowrap flex-1 h-[80px]"
            >
              <FiEdit className="w-4 h-4" />
              Update Proposal
            </button>
          </div>
        );
        
      case 'In Progress':
        return (
          <div className="flex items-stretch gap-3 w-full">
            {/* Enhanced In Progress Status Card */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex-1 h-[80px] flex flex-col justify-center">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <span className="text-xs font-medium text-green-700 uppercase tracking-wide">
                    Phase: Contract
                  </span>
                </div>
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              </div>
              
              <div className="text-sm font-semibold text-green-800">
                Status: In Progress
              </div>
              
              <div className="text-xs text-green-600 mt-1">
              </div>
            </div>
            
            {/* Action Button */}
            <button
              onClick={() => handleViewProject(project)}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors duration-200 flex items-center justify-center gap-2 whitespace-nowrap flex-1 h-[80px]"
            >
              <FiExternalLink className="w-4 h-4" />
              View Project
            </button>
          </div>
        );
        
      case 'Completed':
        return (
          <div className="flex items-stretch gap-3 w-full">
            {/* Enhanced Completed Status Card */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex-1 h-[80px] flex flex-col justify-center">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <span className="text-xs font-medium text-blue-700 uppercase tracking-wide">
                    Phase: Completed
                  </span>
                </div>
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              </div>
              
              <div className="text-sm font-semibold text-blue-800">
                Status: Completed
              </div>
              
              <div className="text-xs text-blue-600 mt-1">
              </div>
            </div>
            
            {/* Action Button */}
            <button
              onClick={() => handleViewProject(project)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors duration-200 flex items-center justify-center gap-2 whitespace-nowrap flex-1 h-[80px]"
            >
              <FiExternalLink className="w-4 h-4" />
              View Details
            </button>
          </div>
        );
        
      case 'Rejected':
        return (
          <div className="flex items-stretch gap-3 w-full">
            {/* Enhanced Rejected Status Card */}
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex-1 h-[80px] flex flex-col justify-center">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <span className="text-xs font-medium text-red-700 uppercase tracking-wide">
                    Phase: Tender
                  </span>
                </div>
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              </div>
              
              <div className="text-sm font-semibold text-red-800">
                Status: Rejected
              </div>
              
              <div className="text-xs text-red-600 mt-1">
              </div>
            </div>
            
            {/* Action Button */}
            <button
              onClick={() => handleViewProject(project)}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors duration-200 flex items-center justify-center gap-2 whitespace-nowrap flex-1 h-[80px]"
            >
              <FiExternalLink className="w-4 h-4" />
              View Details
            </button>
          </div>
        );
        
      default:
        return (
          <div className="flex items-stretch gap-3 w-full">
            {/* Default Status Card */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 flex-1 h-[80px] flex flex-col justify-center">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <span className="text-xs font-medium text-gray-700 uppercase tracking-wide">
                    Phase: Unknown
                  </span>
                </div>
                <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
              </div>
              
              <div className="text-sm font-semibold text-gray-800">
                Status: {vendorStatus}
              </div>
              
              <div className="text-xs text-gray-600 mt-1">
              </div>
            </div>
            
            {/* Action Button */}
            <button
              onClick={() => handleViewProject(project)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors duration-200 flex items-center justify-center gap-2 whitespace-nowrap flex-1 h-[80px]"
            >
              <FiExternalLink className="w-4 h-4" />
              View Project
            </button>
          </div>
        );
    }
  };

  const isProjectStarted = (project) => {
    if (!user?.uid) return false;
    
    // Check if vendor has been awarded and project has started
    if (project.awardedVendorId === user.uid) {
      return true;
    }
    
    // Check if vendor proposal has been accepted
    const vendorProposal = project.proposals?.find(proposal => proposal.vendorId === user.uid);
    return vendorProposal?.status === 'accepted';
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
                
                {/* Progress Bar under name */}
                <div className="mt-3">
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
                        <span className="text-xs font-medium text-gray-700">Progress Proyek</span>
                        <span className="text-xs text-gray-600">0%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-4 relative">
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-xs text-gray-500 font-medium">Proyek Belum Mulai</span>
                        </div>
                      </div>
                    </div>
                  )}
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

          {/* Project Status Modal */}
          <ProjectStatusModal
            project={selectedProject}
            isOpen={isModalOpen}
            onClose={closeModal}
          />
        </>
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
        </div>
      )}
    </>
  );
}
