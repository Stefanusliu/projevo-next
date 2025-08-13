import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  FiArrowLeft, 
  FiMapPin, 
  FiCalendar, 
  FiClock,
  FiDollarSign,
  FiUser,
  FiFileText,
  FiEdit3,
  FiEye,
  FiCheck,
  FiX,
  FiMessageSquare,
  FiChevronDown,
  FiChevronUp,
  FiFilter,
  FiTrendingUp,
  FiTrendingDown,
  FiPhone,
  FiMessageCircle,
  FiMail,
  FiAlertTriangle,
  FiInfo,
  FiBarChart,
  FiBell
} from 'react-icons/fi';
import BOQDisplay from '../../../components/BOQDisplay';
import { firestoreService } from '../../../../hooks/useFirestore';
import { normalizeProposals, getProposalsLength } from '../../../../utils/proposalsUtils';
import MidtransPaymentModal from '../../../../components/payments/MidtransPaymentModal';

const ProjectOwnerDetailPage = ({ project, onBack, onProjectUpdate }) => {
  // Early return if project is not valid
  if (!project || typeof project !== 'object') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Project Not Found</h2>
          <p className="text-gray-600 mb-4">The project data could not be loaded.</p>
          <button
            onClick={onBack}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Projects
          </button>
        </div>
      </div>
    );
  }

  // Log project structure for debugging
  console.log('📊 Project Owner Detail Page - Project data:', {
    id: project.id,
    ownerId: project.ownerId,
    ownerName: project.ownerName,
    client: project.client,
    proposalsCount: project.proposals ? (Array.isArray(project.proposals) ? project.proposals.length : Object.keys(project.proposals).length) : 0,
    hasFirestoreService: !!firestoreService
  });

  // Validate required project fields
  if (!project.id) {
    console.warn('⚠️ Project missing ID field');
  }

  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');
  const [showVendorProfile, setShowVendorProfile] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState(null);
  
  // Proposal filters state
  const [priceFilter, setPriceFilter] = useState('all'); // 'all', 'low-to-high', 'high-to-low'
  const [locationFilter, setLocationFilter] = useState('all'); // 'all' or specific location
  const [trustScoreFilter, setTrustScoreFilter] = useState('all'); // 'all', 'high', 'medium', 'low'
  
  // Payment modal state
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedProposalForPayment, setSelectedProposalForPayment] = useState(null);
  const [selectedProposalIndex, setSelectedProposalIndex] = useState(null);
  
  // Negotiation tab states
  const [negotiationFilter, setNegotiationFilter] = useState('all'); // 'all', 'newest', 'price-low', 'price-high', 'active', 'completed'
  const [newNegotiationCount, setNewNegotiationCount] = useState(0);
  const [lastViewedNegotiations, setLastViewedNegotiations] = useState(null);

  // Function to navigate to BOQ maker page in read-only mode
  const handleViewBOQInMaker = async (proposal) => {
    try {
      console.log('🔄 Navigating to BOQ Maker with proposal data:', proposal);
      
      // Prepare BOQ data for the maker page - use the existing boqPricing data
      const boqViewData = {
        readOnly: true,
        vendorName: proposal.vendorName || 'Unknown Vendor',
        projectTitle: project.projectTitle,
        projectId: project.id,
        proposalId: proposal.id,
        boqPricing: proposal.boqPricing || [],
        totalAmount: proposal.totalAmount,
        submittedAt: proposal.submittedAt || proposal.createdAt,
        vendorId: proposal.vendorId,
        type: 'proposal_view',
        // Include negotiation data if available
        negotiation: proposal.negotiation || null,
        finalAmount: proposal.negotiation?.counterOffer ? 
          proposal.negotiation.counterOffer.reduce((sum, item) => sum + (item.vendorPrice || 0), 0) : 
          proposal.totalAmount
      };
      
      // Store in localStorage with a simple key for this session
      const sessionKey = `boq_view_${proposal.id}_${Date.now()}`;
      try {
        localStorage.setItem(sessionKey, JSON.stringify(boqViewData));
        console.log('✅ BOQ data stored in localStorage with key:', sessionKey);
        
        // Navigate to BOQ maker page with the session key
        const queryParams = new URLSearchParams({
          mode: 'view',
          readOnly: 'true',
          sessionKey: sessionKey,
          vendorName: proposal.vendorName || 'Unknown Vendor',
          projectTitle: project.projectTitle || 'Unknown Project'
        });
        
        router.push(`/boq-maker?${queryParams.toString()}`);
        
      } catch (storageError) {
        console.error('❌ Failed to store BOQ data in localStorage:', storageError);
        alert('Unable to open BOQ viewer. Please try again.');
      }
      
    } catch (error) {
      console.error('❌ Error navigating to BOQ Maker:', error);
      alert('Unable to open BOQ in maker. Please try again.');
    }
  };


  const tabs = [
    { id: 'overview', label: 'Overview', icon: FiEye },
    { id: 'tahapan', label: 'Tahapan', icon: FiFileText },
    { id: 'boq', label: 'BOQ', icon: FiBarChart },
    { id: 'proposals', label: `Proposals (${getProposalsLength(project.proposals)})`, icon: FiUser },
    { 
      id: 'negotiation', 
      label: 'Negotiation', 
      icon: FiMessageSquare,
      hasNotification: newNegotiationCount > 0,
      notificationCount: newNegotiationCount
    },
  ];

  const formatCurrency = (amount) => {
    if (!amount) return 'Not specified';
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatBudget = (amount) => {
    if (!amount) return 'Not specified';
    // Remove any non-numeric characters except dots and commas
    const numericAmount = typeof amount === 'string' 
      ? parseFloat(amount.replace(/[^\d.-]/g, ''))
      : parseFloat(amount);
    
    if (isNaN(numericAmount)) return 'Not specified';
    
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(numericAmount);
  };

  const formatDate = (date) => {
    if (!date) return 'Not specified';
    if (typeof date === 'string') return date;
    if (date.toDate) return date.toDate().toLocaleDateString('id-ID');
    return new Date(date).toLocaleDateString('id-ID');
  };

  const formatTimestamp = (timestamp) => {
    try {
      // Handle different timestamp formats
      let date;
      if (timestamp && typeof timestamp.toDate === 'function') {
        // Firestore Timestamp
        date = timestamp.toDate();
      } else if (timestamp instanceof Date) {
        // JavaScript Date object
        date = timestamp;
      } else if (typeof timestamp === 'string' || typeof timestamp === 'number') {
        // String or number timestamp
        date = new Date(timestamp);
      } else {
        // Fallback to current date
        date = new Date();
      }

      return date.toLocaleDateString('id-ID', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.warn('Error formatting timestamp:', error);
      return 'Recently';
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'active':
      case 'open':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'locked':
        return 'bg-yellow-100 text-yellow-800';
      case 'closed':
        return 'bg-gray-100 text-gray-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  const getProposalStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'negotiating':
        return 'bg-yellow-100 text-yellow-800';
      case 'negotiate':
        return 'bg-blue-100 text-blue-800';
      case 'locked':
        return 'bg-yellow-100 text-yellow-800';
      case 'pending':
      case 'submitted':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  const handleAcceptProposal = async (proposalIndex, proposal) => {
    try {
      console.log('🔄 Starting vendor selection...', { proposalIndex, vendorName: proposal.vendorName });
      
      // Check if this is the first time selecting a vendor for this project
      const isFirstVendorSelection = !project.selectedVendorId && !project.status?.includes('vendor_selected');
      
      if (isFirstVendorSelection) {
        // Trigger payment modal for 50% down payment
        console.log('💳 First vendor selection - triggering payment modal');
        setSelectedProposalForPayment(proposal);
        setSelectedProposalIndex(proposalIndex);
        setShowPaymentModal(true);
      } else {
        // If vendor was already selected previously, proceed with normal acceptance
        console.log('✅ Subsequent vendor selection - no payment required');
        await completeProposalAcceptance(proposalIndex, proposal);
      }
      
    } catch (error) {
      console.error('❌ Error in vendor selection process:', error);
      alert(`Failed to select vendor: ${error.message}`);
    }
  };

  // Handle payment success and complete vendor selection
  const handlePaymentSuccess = async (paymentResult) => {
    try {
      console.log('✅ Payment successful, vendor selection will be completed by webhook');
      
      // Clear payment modal state
      setShowPaymentModal(false);
      setSelectedProposalForPayment(null);
      setSelectedProposalIndex(null);
      
      // Refresh the page or reload project data to see updated status
      // The webhook should have already updated the project status
      window.location.reload();
      
    } catch (error) {
      console.error('❌ Error handling payment success:', error);
      alert('Payment was successful, but there was an error updating the interface. Please refresh the page.');
    }
  };

  // Complete proposal acceptance (for cases where payment is not required)
  const completeProposalAcceptance = async (proposalIndex, proposal) => {
    try {
      const now = new Date();
      
      // Prepare updated proposals array
      const currentProposals = normalizeProposals(project.proposals);
      if (!currentProposals || !currentProposals[proposalIndex]) {
        throw new Error(`Proposal at index ${proposalIndex} not found`);
      }

      const updatedProposalsForAccept = [...currentProposals];
      updatedProposalsForAccept[proposalIndex] = {
        ...updatedProposalsForAccept[proposalIndex],
        status: 'accepted',
        acceptedAt: now,
        acceptedBy: project.ownerId,
        updatedAt: now
      };

      const updates = {
        proposals: updatedProposalsForAccept,
        updatedAt: now,
        lastModifiedBy: project.ownerId || 'project_owner'
      };

      console.log('📤 Updating project with proposal acceptance:', {
        projectId: project.id,
        proposalIndex,
        vendorName: proposal.vendorName
      });

      await firestoreService.update('projects', project.id, updates);
      
      // Update local project state if callback is provided
      if (onProjectUpdate) {
        const updatedProject = {
          ...project,
          proposals: updatedProposalsForAccept,
          updatedAt: now,
          lastModifiedBy: project.ownerId || 'project_owner'
        };
        onProjectUpdate(updatedProject);
      }
      
      console.log('✅ Proposal acceptance saved successfully');
      alert(`Successfully accepted proposal from ${proposal.vendorName}!`);
      
    } catch (error) {
      console.error('❌ Error saving proposal acceptance:', error);
      alert(`Failed to accept proposal: ${error.message}`);
    }
  };

  const handleRejectProposal = async (proposalIndex, proposal) => {
    try {
      console.log('🔄 Starting proposal rejection...', { proposalIndex, vendorName: proposal.vendorName });
      
      const now = new Date();
      
      // Prepare updated proposals array
      const currentProposalsForReject = normalizeProposals(project.proposals);
      if (!currentProposalsForReject || !currentProposalsForReject[proposalIndex]) {
        throw new Error(`Proposal at index ${proposalIndex} not found`);
      }

      const updatedProposalsForReject = [...currentProposalsForReject];
      updatedProposalsForReject[proposalIndex] = {
        ...updatedProposalsForReject[proposalIndex],
        status: 'rejected',
        rejectedAt: now,
        rejectedBy: project.ownerId,
        updatedAt: now
      };

      const updates = {
        proposals: updatedProposalsForReject,
        updatedAt: now,
        lastModifiedBy: project.ownerId || 'project_owner'
      };

      console.log('📤 Updating project with proposal rejection:', {
        projectId: project.id,
        proposalIndex,
        vendorName: proposal.vendorName
      });

      await firestoreService.update('projects', project.id, updates);
      
      // Update local project state if callback is provided
      if (onProjectUpdate) {
        const updatedProject = {
          ...project,
          proposals: updatedProposalsForReject,
          updatedAt: now,
          lastModifiedBy: project.ownerId || 'project_owner'
        };
        onProjectUpdate(updatedProject);
      }
      
      console.log('✅ Proposal rejection saved successfully');
      alert(`Successfully rejected proposal from ${proposal.vendorName}.`);
      
    } catch (error) {
      console.error('❌ Error saving proposal rejection:', error);
      alert(`Failed to reject proposal: ${error.message}`);
    }
  };

  const handleStartNegotiation = async (proposalIndex, proposal) => {
    try {
      console.log('🔄 Starting negotiation for proposal:', proposalIndex);
      
      const now = new Date();
      
      // Prepare updated proposals array
      const currentProposalsForNegotiation = normalizeProposals(project.proposals);
      if (!currentProposalsForNegotiation || !currentProposalsForNegotiation[proposalIndex]) {
        throw new Error(`Proposal at index ${proposalIndex} not found`);
      }

      const updatedProposalsForNegotiation = [...currentProposalsForNegotiation];
      updatedProposalsForNegotiation[proposalIndex] = {
        ...updatedProposalsForNegotiation[proposalIndex],
        status: 'negotiating',
        negotiationStartedAt: now,
        negotiationStartedBy: 'project_owner',
        updatedAt: now
      };

      const updates = {
        proposals: updatedProposalsForNegotiation,
        updatedAt: now,
        lastModifiedBy: project.ownerId || 'project_owner'
      };

      console.log('📤 Updating project with negotiation start:', {
        projectId: project.id,
        proposalIndex,
        vendorName: proposal.vendorName
      });
      
      await firestoreService.update('projects', project.id, updates);
      
      // Update local project state if callback is provided
      if (onProjectUpdate) {
        const updatedProject = {
          ...project,
          proposals: updatedProposalsForNegotiation,
          updatedAt: now,
          lastModifiedBy: project.ownerId || 'project_owner'
        };
        onProjectUpdate(updatedProject);
      }
      
      console.log('✅ Negotiation started and saved successfully');
      alert(`Negotiation started with ${proposal.vendorName}. The vendor will be notified to submit a new BOQ.`);
      
    } catch (error) {
      console.error('❌ Error starting negotiation:', error);
      alert(`Failed to start negotiation: ${error.message}`);
    }
  };

  const renderOverviewTab = () => (
    <div className="space-y-6">
      {/* Project Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{project.projectTitle}</h2>
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="px-3 py-1 text-sm font-medium rounded-full bg-blue-100 text-blue-800">
                {project.projectType}
              </span>
              <span className="px-3 py-1 text-sm font-medium rounded-full bg-purple-100 text-purple-800">
                {project.propertyType}
              </span>
              <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(project.status)}`}>
                {project.status || 'Active'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Project Milestones - Only show if project has started or vendor is chosen */}
      {isProjectStarted(project) && (
        <div className="bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-xl shadow-sm">
          <div className="max-w-full mx-auto px-4 sm:px-6 py-4 sm:py-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <FiCalendar className="text-blue-600" size={20} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Project Milestones</h3>
                <p className="text-sm text-gray-500">Track your project progress</p>
              </div>
            </div>
            
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-gray-700">Project Progress</span>
              <span className="text-lg font-bold text-blue-600">{calculateProgressPercentage(getMilestones(project))}%</span>
            </div>
            
            <div className="w-full bg-gray-200 rounded-full h-4 shadow-inner mb-6">
              <div 
                className="bg-gradient-to-r from-blue-500 via-blue-600 to-purple-600 h-4 rounded-full transition-all duration-1000 ease-out shadow-lg"
                style={{ width: `${calculateProgressPercentage(getMilestones(project))}%` }}
              ></div>
            </div>
            
            <div className="flex justify-between mt-6 overflow-x-auto pb-2">
              {getMilestones(project).map((milestone, index) => {
                const isCompleted = milestone.completed;
                const isCurrent = !isCompleted && index === getMilestones(project).findIndex(m => !m.completed);
                
                return (
                  <div key={index} className="flex flex-col items-center min-w-0 flex-1 px-1">
                    <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold transition-all duration-300 ${
                      isCompleted 
                        ? 'bg-green-500 text-white shadow-lg scale-110' 
                        : isCurrent 
                        ? 'bg-blue-500 text-white shadow-lg scale-110 animate-pulse'
                        : 'bg-gray-300 text-gray-600'
                    }`}>
                      {isCompleted ? '✓' : index + 1}
                    </div>
                    <span className="text-xs text-gray-600 mt-2 text-center leading-tight">
                      {milestone.name}
                    </span>
                    {isCompleted && milestone.date && (
                      <span className="text-xs text-green-600 mt-1">
                        {milestone.date}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Project Information - Indonesian Format */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Informasi Proyek</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-4">
            {/* Judul Proyek */}
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-600 mb-1">Judul Proyek</label>
              <p className="text-gray-900 font-medium">{project.projectTitle || 'Not specified'}</p>
            </div>

            {/* Lokasi Proyek */}
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-600 mb-1">Lokasi Proyek</label>
              <p className="text-gray-900 font-medium">
                {`${project.city || ''}, ${project.province || ''}`.replace(/^,\s*|,\s*$/g, '') || project.location || 'Not specified'}
              </p>
            </div>

            {/* Jenis Proyek */}
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-600 mb-1">Jenis Proyek</label>
              <p className="text-gray-900 font-medium">{project.projectType || 'Not specified'}</p>
            </div>

            {/* Ruang Lingkup */}
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-600 mb-1">Ruang Lingkup</label>
              <div className="flex flex-wrap gap-2">
                {Array.isArray(project.projectScope) ? (
                  project.projectScope.map((scope, index) => (
                    <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 rounded-md text-sm font-medium">
                      {scope}
                    </span>
                  ))
                ) : Array.isArray(project.scope) ? (
                  project.scope.map((scope, index) => (
                    <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 rounded-md text-sm font-medium">
                      {scope}
                    </span>
                  ))
                ) : (
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-md text-sm font-medium">
                    {project.projectScope || project.scope || 'General'}
                  </span>
                )}
              </div>
            </div>

            {/* Properti */}
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-600 mb-1">Properti</label>
              <p className="text-gray-900 font-medium">{project.propertyType || 'Not specified'}</p>
            </div>

            {/* Metode Pengadaan */}
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-600 mb-1">Metode Pengadaan</label>
              <p className="text-gray-900 font-medium">{project.procurementMethod || project.bidMethod || 'Not specified'}</p>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-4">
            {/* Estimasi Anggaran */}
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-600 mb-1">Estimasi Anggaran</label>
              <div className="flex items-center gap-2">
                <FiDollarSign className="text-green-600" size={18} />
                <p className="text-gray-900 font-semibold text-lg">
                  {formatBudget(project.marketplace?.budget || project.estimatedBudget || project.budget)}
                </p>
              </div>
            </div>

            {/* Estimasi Durasi Proyek */}
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-600 mb-1">Estimasi Durasi Proyek</label>
              <div className="flex items-center gap-2">
                <FiClock className="text-blue-600" size={18} />
                <p className="text-gray-900 font-medium">
                  {project.estimatedDuration || project.duration || 'Not specified'}
                </p>
              </div>
            </div>

            {/* Durasi Tender */}
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-600 mb-1">Durasi Tender</label>
              <div className="flex items-center gap-2">
                <FiCalendar className="text-red-600" size={18} />
                <p className="text-gray-900 font-medium">
                  {project.tenderDuration || project.bidCountdown || 'Not specified'}
                </p>
              </div>
            </div>

            {/* Estimasi Mulai Proyek */}
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-600 mb-1">Estimasi Mulai Proyek</label>
              <div className="flex items-center gap-2">
                <FiCalendar className="text-green-600" size={18} />
                <p className="text-gray-900 font-medium">
                  {formatDate(project.estimatedStartDate) || 'Not specified'}
                </p>
              </div>
            </div>

            {/* Project Owner */}
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-600 mb-1">Pemilik Proyek</label>
              <div className="flex items-center gap-2">
                <FiUser className="text-purple-600" size={18} />
                <p className="text-gray-900 font-medium">
                  {project.clientName || project.client || project.ownerName || 'Not specified'}
                </p>
              </div>
            </div>

            {/* Special Notes */}
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-600 mb-1">Special Notes</label>
              <p className="text-gray-900 font-medium">
                {project.specialNotes || project.notes || 'No special notes'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderNegotiationTab = () => {
    const allNegotiations = getNegotiationActivities(project);
    const filteredNegotiations = getFilteredNegotiations(allNegotiations);
    
    return (
      <div className="max-w-7xl mx-auto">
        {/* Top Right Dropdown */}
        <div className="flex justify-end mb-6">
          {allNegotiations.length > 0 && (
            <div className="flex items-center gap-2">
              {/* New Notification Badge */}
              {newNegotiationCount > 0 && (
                <span className="px-2 py-1 bg-red-500 text-white text-xs rounded-full">
                  {newNegotiationCount}
                </span>
              )}
              
              {/* Filter Dropdown */}
              <select
                value={negotiationFilter}
                onChange={(e) => setNegotiationFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All</option>
                <option value="newest">Newest</option>
                <option value="price-low">Price ↑</option>
                <option value="price-high">Price ↓</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          )}
        </div>

        {/* Negotiation Activities */}
        {filteredNegotiations.length > 0 ? (
          <div className="space-y-4">
            {filteredNegotiations.map((activity, index) => (
              <div key={`${activity.vendorId}-${index}`} className={`bg-white rounded-xl border p-6 shadow-sm transition-all hover:shadow-md ${
                activity.statusColor === 'green' ? 'border-green-200 bg-green-50' :
                activity.statusColor === 'orange' ? 'border-orange-200 bg-orange-50' :
                'border-gray-200'
              }`}>
                <div className="flex items-start gap-4">
                  {/* Status Icon */}
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                    activity.statusColor === 'green' ? 'bg-green-500' :
                    activity.statusColor === 'orange' ? 'bg-orange-500' :
                    'bg-blue-500'
                  }`}>
                    {activity.status === 'accepted' ? (
                      <FiCheck className="text-white" size={20} />
                    ) : activity.status === 'counter_offer' ? (
                      <FiAlertTriangle className="text-white" size={20} />
                    ) : (
                      <FiMessageSquare className="text-white" size={20} />
                    )}
                  </div>

                  <div className="flex-1">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-3">
                      <h4 className={`text-lg font-semibold ${
                        activity.statusColor === 'green' ? 'text-green-800' :
                        activity.statusColor === 'orange' ? 'text-orange-800' :
                        'text-gray-800'
                      }`}>
                        {activity.vendorName}
                      </h4>
                      <div className="flex items-center gap-3">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          activity.statusColor === 'green' ? 'bg-green-100 text-green-700' :
                          activity.statusColor === 'orange' ? 'bg-orange-100 text-orange-700' :
                          'bg-blue-100 text-blue-700'
                        }`}>
                          {activity.status === 'accepted' ? 'Completed' :
                           activity.status === 'counter_offer' ? 'Counter Offer' :
                           'Active'}
                        </span>
                        
                        {/* New Badge for recent activities */}
                        {(() => {
                          const activityTime = activity.lastActivity || activity.startedAt;
                          const activityTimestamp = activityTime?.toDate ? activityTime.toDate().getTime() : new Date(activityTime).getTime();
                          const hoursSinceActivity = (Date.now() - activityTimestamp) / (1000 * 60 * 60);
                          return hoursSinceActivity < 24;
                        })() && (
                          <span className="px-2 py-1 bg-red-500 text-white text-xs rounded-full">
                            NEW
                          </span>
                        )}
                      </div>
                    </div>
                    
                    {/* Message */}
                    <p className={`text-sm mb-4 ${
                      activity.statusColor === 'green' ? 'text-green-700' :
                      activity.statusColor === 'orange' ? 'text-orange-700' :
                      'text-gray-700'
                    }`}>
                      {activity.message}
                    </p>
                    
                    {/* Price Information Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-white bg-opacity-60 rounded-lg mb-4">
                      <div>
                        <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                          {activity.status === 'accepted' ? 'Final Price' : 'Current Price'}
                        </span>
                        <p className={`text-lg font-bold ${
                          activity.statusColor === 'green' ? 'text-green-800' :
                          activity.statusColor === 'orange' ? 'text-orange-800' :
                          'text-gray-800'
                        }`}>
                          {formatCurrency(activity.status === 'accepted' ? activity.finalPrice : activity.currentPrice)}
                        </p>
                      </div>
                      
                      {activity.originalPrice && activity.currentPrice !== activity.originalPrice && (
                        <div>
                          <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                            Original Price
                          </span>
                          <p className="text-lg font-bold text-gray-600 line-through">
                            {formatCurrency(activity.originalPrice)}
                          </p>
                          <p className="text-xs text-green-600 font-medium">
                            {activity.originalPrice > activity.currentPrice ? 'Reduced' : 'Increased'}
                          </p>
                        </div>
                      )}
                      
                      <div>
                        <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                          {activity.status === 'accepted' ? 'Completed' : 'Started'}
                        </span>
                        <p className="text-sm font-medium text-gray-700">
                          {formatDate(activity.status === 'accepted' ? activity.acceptedAt : activity.startedAt)}
                        </p>
                      </div>
                      
                      {activity.lastActivity && activity.status !== 'accepted' && (
                        <div>
                          <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                            Last Activity
                          </span>
                          <p className="text-sm font-medium text-gray-700">
                            {formatDate(activity.lastActivity)}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 flex-wrap">
                      {/* WhatsApp Button */}
                      {activity.vendorPhone && (
                        <a
                          href={`https://wa.me/62${activity.vendorPhone.replace(/\D/g, '').replace(/^62/, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center gap-2"
                        >
                          <FiMessageCircle size={16} />
                          WhatsApp
                        </a>
                      )}
                      
                      {/* Phone Button */}
                      {activity.vendorPhone && (
                        <a
                          href={`tel:${activity.vendorPhone}`}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2"
                        >
                          <FiPhone size={16} />
                          Phone
                        </a>
                      )}
                      
                      {/* Email Button */}
                      {activity.vendorEmail && (
                        <a
                          href={`mailto:${activity.vendorEmail}`}
                          className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium flex items-center gap-2"
                        >
                          <FiMail size={16} />
                          Email
                        </a>
                      )}

                      {/* View Details Button */}
                      <button
                        onClick={() => setActiveTab('proposals')}
                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium flex items-center gap-2"
                      >
                        <FiEye size={16} />
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* No Negotiations Message */
          <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiMessageSquare className="text-gray-400" size={32} />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {allNegotiations.length === 0 ? 'No Active Negotiations' : 'No Negotiations Match Filter'}
            </h3>
            <p className="text-gray-500 mb-4">
              {allNegotiations.length === 0 
                ? 'There are currently no vendor negotiations for this project.'
                : 'Try adjusting your filter to see more negotiation activities.'
              }
            </p>
            {allNegotiations.length === 0 ? (
              <button
                onClick={() => setActiveTab('proposals')}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                View Proposals
              </button>
            ) : (
              <button
                onClick={() => setNegotiationFilter('all')}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Show All Negotiations
              </button>
            )}
          </div>
        )}
      </div>
    );
  };

  const renderBOQTab = () => (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <BOQDisplay project={project} />
    </div>
  );

  // Helper function to calculate progress percentage
  const calculateProgressPercentage = (milestones) => {
    if (!milestones || milestones.length === 0) return 0;
    const completedCount = milestones.filter(milestone => milestone.completed).length;
    return Math.round((completedCount / milestones.length) * 100);
  };

  // Helper function to determine if project has started (entered execution phase)
  const isProjectStarted = (project) => {
    const status = project.status;
    const moderationStatus = project.moderationStatus;
    
    console.log('🔍 Checking if project started:', {
      projectId: project.id,
      status: status,
      moderationStatus: moderationStatus,
      initialPaymentCompleted: project.initialPaymentCompleted,
      paymentCompleted: project.paymentCompleted,
      selectedVendorId: project.selectedVendorId,
      negotiationAccepted: project.negotiationAccepted,
      proposals: project.proposals ? project.proposals.map(p => ({
        status: p.status,
        negotiationStatus: p.negotiation?.status,
        vendorId: p.vendorId
      })) : [],
      hasProposals: project.proposals ? project.proposals.length : 0
    });
    
    // Project is considered started ONLY when:
    // 1. Initial payment has been made, OR
    // 2. Project is in "On Going" status (but NOT "Active"), OR  
    // 3. A vendor has been formally selected AND negotiation is completed (not just started)
    
    if (project.initialPaymentCompleted || project.paymentCompleted) {
      console.log('✅ Project started: Payment completed');
      return true;
    }
    
    if (status === 'On Going') {
      console.log('✅ Project started: Status indicates ongoing work');
      return true;
    }
    
    // Check if any proposal has been FULLY accepted (vendor completed negotiation)
    if (project.proposals && Array.isArray(project.proposals)) {
      const hasAcceptedProposal = project.proposals.some(proposal => 
        proposal.status === 'accepted' || 
        (proposal.negotiation && proposal.negotiation.status === 'accepted')
      );
      if (hasAcceptedProposal) {
        console.log('✅ Project started: Proposal fully accepted');
        return true;
      }
    }
    
    // Check if vendor has been awarded AND negotiation is completed
    if (project.selectedVendorId && project.status === 'Awarded' && project.negotiationAccepted) {
      console.log('✅ Project started: Vendor awarded and negotiation completed');
      return true;
    }
    
    console.log('❌ Project NOT started: Still in setup/negotiation phase');
    return false;
  };

  // Helper function to get all negotiation activities (multiple vendors)
  const getNegotiationActivities = (project) => {
    if (!project.proposals || !Array.isArray(project.proposals)) {
      return [];
    }

    // Find all proposals that have negotiation activity
    const negotiationActivities = project.proposals
      .map((proposal, index) => ({
        ...proposal,
        originalIndex: index
      }))
      .filter(proposal => 
        proposal.status === 'negotiating' || 
        proposal.status === 'counter_offer' ||
        proposal.status === 'accepted' ||
        (proposal.negotiation && ['pending', 'active', 'counter_offer', 'accepted'].includes(proposal.negotiation.status))
      )
      .map(proposal => {
        const negotiation = proposal.negotiation || {};
        const startedAt = proposal.negotiationStartedAt || negotiation.startedAt;
        const lastActivity = negotiation.lastActivity || proposal.lastActivity || startedAt;
        
        let status = 'active';
        let statusColor = 'purple';
        let message = `Active negotiation with ${proposal.vendorName || 'vendor'}`;
        
        if (proposal.status === 'accepted' || negotiation.status === 'accepted') {
          status = 'accepted';
          statusColor = 'green';
          message = `Negotiation completed with ${proposal.vendorName || 'vendor'}`;
        } else if (proposal.status === 'counter_offer' || negotiation.status === 'counter_offer') {
          status = 'counter_offer';
          statusColor = 'orange';
          message = `Counter offer from ${proposal.vendorName || 'vendor'}`;
        }
        
        return {
          vendorName: proposal.vendorName || proposal.vendor?.name || 'Unknown Vendor',
          vendorId: proposal.vendorId,
          vendorPhone: proposal.vendorPhone,
          vendorEmail: proposal.vendorEmail,
          status: status,
          statusColor: statusColor,
          message: message,
          startedAt: startedAt,
          lastActivity: lastActivity,
          currentPrice: negotiation.currentPrice || proposal.currentPrice || proposal.totalAmount || proposal.totalPrice,
          originalPrice: proposal.originalPrice || proposal.totalAmount || proposal.totalPrice,
          finalPrice: negotiation.finalPrice || proposal.finalPrice,
          acceptedAt: negotiation.acceptedAt || proposal.acceptedAt,
          originalIndex: proposal.originalIndex
        };
      })
      .sort((a, b) => {
        // Sort by latest activity first
        const aTime = a.lastActivity || a.startedAt || new Date(0);
        const bTime = b.lastActivity || b.startedAt || new Date(0);
        
        const aDate = aTime?.toDate ? aTime.toDate() : new Date(aTime);
        const bDate = bTime?.toDate ? bTime.toDate() : new Date(bTime);
        
        return bDate.getTime() - aDate.getTime();
      });

    return negotiationActivities;
  };

  // Helper function to filter negotiations based on filter type
  const getFilteredNegotiations = (negotiations) => {
    switch (negotiationFilter) {
      case 'newest':
        return [...negotiations].sort((a, b) => {
          const aTime = a.lastActivity || a.startedAt || new Date(0);
          const bTime = b.lastActivity || b.startedAt || new Date(0);
          const aDate = aTime?.toDate ? aTime.toDate() : new Date(aTime);
          const bDate = bTime?.toDate ? bTime.toDate() : new Date(bTime);
          return bDate.getTime() - aDate.getTime();
        });
      case 'price-low':
        return [...negotiations].sort((a, b) => (a.currentPrice || 0) - (b.currentPrice || 0));
      case 'price-high':
        return [...negotiations].sort((a, b) => (b.currentPrice || 0) - (a.currentPrice || 0));
      case 'active':
        return negotiations.filter(n => n.status === 'active' || n.status === 'counter_offer');
      case 'completed':
        return negotiations.filter(n => n.status === 'accepted');
      default:
        return negotiations;
    }
  };

  // Helper function to check for new negotiations and update notification count
  const checkForNewNegotiations = () => {
    const currentNegotiations = getNegotiationActivities(project);
    const currentTimestamp = Date.now();
    const lastViewed = lastViewedNegotiations || currentTimestamp;
    
    const newCount = currentNegotiations.filter(negotiation => {
      const activityTime = negotiation.lastActivity || negotiation.startedAt;
      const activityTimestamp = activityTime?.toDate ? activityTime.toDate().getTime() : new Date(activityTime).getTime();
      return activityTimestamp > lastViewed;
    }).length;
    
    setNewNegotiationCount(newCount);
  };

  // Function to mark negotiations as viewed
  const markNegotiationsAsViewed = () => {
    setLastViewedNegotiations(Date.now());
    setNewNegotiationCount(0);
  };

  // useEffect to check for new negotiations when project updates
  useEffect(() => {
    if (project && project.proposals) {
      checkForNewNegotiations();
    }
  }, [project, lastViewedNegotiations]);

  // useEffect to mark negotiations as viewed when negotiation tab becomes active
  useEffect(() => {
    if (activeTab === 'negotiation') {
      markNegotiationsAsViewed();
    }
  }, [activeTab]);

  // Helper function to get milestones from BOQ data
  const getMilestones = (project) => {
    // If project has attached BOQ, create milestones from tahapan kerja
    if (project.attachedBOQ && project.attachedBOQ.tahapanKerja) {
      console.log('BOQ tahapanKerja found:', project.attachedBOQ.tahapanKerja);
      return project.attachedBOQ.tahapanKerja.map((tahapan, index) => {
        const milestoneName = tahapan.name || tahapan.nama || `Tahapan ${index + 1}`;
        console.log(`Milestone ${index + 1}:`, milestoneName, 'from tahapan:', tahapan);
        return {
          name: milestoneName,
          completed: false,
          date: ''
        };
      });
    }
    
    // Fallback to existing milestones or default ones
    if (project.milestones && project.milestones.length > 0) {
      return project.milestones;
    }
    
    // Default milestones based on project type
    const defaultMilestones = {
      'Desain': [
        { name: 'Concept Design', completed: true, date: '2024-01-15' },
        { name: 'Design Development', completed: true, date: '2024-02-20' },
        { name: 'Final Design', completed: false, date: '' },
        { name: 'Design Approval', completed: false, date: '' }
      ],
      'Bangun': [
        { name: 'Site Preparation', completed: true, date: '2024-01-10' },
        { name: 'Foundation', completed: true, date: '2024-02-15' },
        { name: 'Structure', completed: false, date: '' },
        { name: 'Finishing', completed: false, date: '' }
      ],
      'Renovasi': [
        { name: 'Demolition', completed: true, date: '2024-01-20' },
        { name: 'Reconstruction', completed: false, date: '' },
        { name: 'Finishing', completed: false, date: '' },
        { name: 'Final Inspection', completed: false, date: '' }
      ]
    };
    
    return defaultMilestones[project.projectType] || [
      { name: 'Planning', completed: true, date: '2024-01-05' },
      { name: 'Execution', completed: false, date: '' },
      { name: 'Review', completed: false, date: '' },
      { name: 'Completion', completed: false, date: '' }
    ];
  };

  const renderTahapanTab = () => {
    // Check for BOQ data in multiple possible locations
    const boqData = project.boq || 
                   project.attachedBOQ || 
                   project.boqData || 
                   project.originalData?.boq || 
                   project.originalData?.attachedBOQ;

    // Extract tahapan kerja for stages display
    const getTahapanKerja = () => {
      console.log('🔍 Analyzing BOQ data structure:', boqData);
      
      if (boqData?.tahapanKerja && Array.isArray(boqData.tahapanKerja)) {
        console.log('✅ Found tahapanKerja array:', boqData.tahapanKerja);
        
        return boqData.tahapanKerja.map((tahapan, tahapanIndex) => {
          console.log(`📋 Processing tahapan ${tahapanIndex}:`, tahapan);
          
          const items = [];
          
          // Process jenisKerja array
          if (tahapan.jenisKerja && Array.isArray(tahapan.jenisKerja)) {
            tahapan.jenisKerja.forEach((jenis, jenisIndex) => {
              console.log(`  🔧 Processing jenisKerja ${jenisIndex}:`, jenis);
              
              // Process uraian array within each jenisKerja
              if (jenis.uraian && Array.isArray(jenis.uraian)) {
                jenis.uraian.forEach((uraian, uraianIndex) => {
                  console.log(`    📝 Processing uraian ${uraianIndex}:`, uraian);
                  
                  // Process spec array within each uraian
                  if (uraian.spec && Array.isArray(uraian.spec)) {
                    uraian.spec.forEach((spec, specIndex) => {
                      console.log(`      🔍 Processing spec ${specIndex}:`, spec);
                      
                      items.push({
                        tahapanName: `Tahapan ${tahapanIndex + 1}`,
                        jenisName: jenis.name || `Jenis ${jenisIndex + 1}`,
                        uraianName: uraian.name || `Uraian ${uraianIndex + 1}`,
                        item: spec.description || spec.name || `Item ${specIndex + 1}`,
                        volume: spec.volume || 0,
                        unit: spec.satuan || 'unit',
                        id: spec.id || `${tahapanIndex}-${jenisIndex}-${uraianIndex}-${specIndex}`
                      });
                    });
                  }
                });
              }
            });
          }
          
          console.log(`✅ Tahapan ${tahapanIndex + 1} processed with ${items.length} items:`, items);
          
          return {
            name: `Tahapan ${tahapanIndex + 1}`,
            items: items,
            id: tahapan.id || tahapanIndex
          };
        });
      }
      
      if (boqData?.items && Array.isArray(boqData.items)) {
        console.log('✅ Found items array, grouping by tahapan');
        // Group items by tahapan
        const tahapanMap = new Map();
        boqData.items.forEach(item => {
          const tahapanName = item.tahapanName || 'Tahapan Umum';
          if (!tahapanMap.has(tahapanName)) {
            tahapanMap.set(tahapanName, {
              name: tahapanName,
              items: []
            });
          }
          tahapanMap.get(tahapanName).items.push(item);
        });
        return Array.from(tahapanMap.values());
      }
      
      console.log('❌ No valid BOQ data structure found');
      return [];
    };

    const tahapanList = getTahapanKerja();

    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Tahapan Pekerjaan</h3>
            <span className="text-sm text-gray-500">
              {tahapanList.length} tahapan kerja
            </span>
          </div>
          
          {tahapanList.length > 0 ? (
            <div className="space-y-6">
              {tahapanList.map((tahapan, tahapanIndex) => (
                <div key={tahapanIndex} className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                      {tahapanIndex + 1}
                    </div>
                    <h4 className="text-xl font-bold text-blue-900">
                      {tahapan.name || tahapan.nama || `Tahapan ${tahapanIndex + 1}`}
                    </h4>
                  </div>
                  
                  {tahapan.description && (
                    <p className="text-blue-800 mb-4 italic">
                      {tahapan.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <FiFileText className="mx-auto text-gray-400 mb-3" size={48} />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Tidak Ada Tahapan Kerja</h3>
              <p className="text-gray-500">
                Tahapan pekerjaan belum tersedia untuk proyek ini.
              </p>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderProposalsTab = () => {
    // Normalize proposals data to handle both array and object formats
    const proposals = normalizeProposals(project?.proposals);
    
    const formatCurrencyProposal = (amount) => {
      if (!amount) return 'Not specified';
      return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(amount);
    };

    // Get unique locations from proposals for filter dropdown
    const getUniqueLocations = (proposals) => {
      if (!proposals || !Array.isArray(proposals)) return [];
      const locations = proposals
        .map(proposal => {
          if (proposal.vendorCity && proposal.vendorProvince) {
            return `${proposal.vendorCity}, ${proposal.vendorProvince}`;
          } else if (proposal.vendorCity) {
            return proposal.vendorCity;
          } else if (proposal.vendorProvince) {
            return proposal.vendorProvince;
          } else {
            return proposal.vendorLocation || proposal.location || 'Unknown Location';
          }
        })
        .filter((location, index, arr) => arr.indexOf(location) === index)
        .sort();
      return locations;
    };

    // Filter and sort proposals based on current filters
    const getFilteredAndSortedProposals = (proposals) => {
      if (!proposals || !Array.isArray(proposals)) return [];
      
      let filteredProposals = [...proposals];

      // Apply location filter
      if (locationFilter !== 'all') {
        filteredProposals = filteredProposals.filter(proposal => {
          const proposalLocation = proposal.vendorCity && proposal.vendorProvince
            ? `${proposal.vendorCity}, ${proposal.vendorProvince}`
            : proposal.vendorCity || proposal.vendorProvince || proposal.vendorLocation || proposal.location || 'Unknown Location';
          return proposalLocation === locationFilter;
        });
      }

      // Apply trust score filter
      if (trustScoreFilter !== 'all') {
        filteredProposals = filteredProposals.filter(proposal => {
          const trustScore = proposal.trustScore || proposal.vendorTrustScore || 0;
          
          switch (trustScoreFilter) {
            case 'high':
              return trustScore >= 80;
            case 'medium':
              return trustScore >= 50 && trustScore < 80;
            case 'low':
              return trustScore < 50;
            default:
              return true;
          }
        });
      }

      // Apply price sorting
      if (priceFilter === 'low-to-high') {
        filteredProposals.sort((a, b) => {
          const priceA = a.totalAmount || 0;
          const priceB = b.totalAmount || 0;
          return priceA - priceB;
        });
      } else if (priceFilter === 'high-to-low') {
        filteredProposals.sort((a, b) => {
          const priceA = a.totalAmount || 0;
          const priceB = b.totalAmount || 0;
          return priceB - priceA;
        });
      } else if (priceFilter === 'trust-high-to-low') {
        filteredProposals.sort((a, b) => {
          const trustScoreA = a.trustScore || a.vendorTrustScore || 0;
          const trustScoreB = b.trustScore || b.vendorTrustScore || 0;
          return trustScoreB - trustScoreA;
        });
      } else if (priceFilter === 'trust-low-to-high') {
        filteredProposals.sort((a, b) => {
          const trustScoreA = a.trustScore || a.vendorTrustScore || 0;
          const trustScoreB = b.trustScore || b.vendorTrustScore || 0;
          return trustScoreA - trustScoreB;
        });
      }

      return filteredProposals;
    };

    const uniqueLocations = getUniqueLocations(proposals);
    const filteredProposals = getFilteredAndSortedProposals(proposals);

    const handleViewPortfolio = (vendorId, vendorName, proposal, proposalIndex) => {
      setSelectedVendor({ 
        id: vendorId, 
        name: vendorName,
        proposal: proposal,
        proposalIndex: proposalIndex
      });
      setShowVendorProfile(true);
    };

    // Trust Score Component
    const TrustScoreCircle = ({ score = 0, size = 40 }) => {
      // Normalize score to 0-100 range
      const normalizedScore = Math.max(0, Math.min(100, score));
      
      // Determine color based on score ranges
      const getColor = (score) => {
        if (score >= 0 && score <= 25) return '#EF4444'; // Red
        if (score >= 30 && score <= 45) return '#F97316'; // Orange
        if (score >= 50 && score <= 55) return '#84CC16'; // Light green
        if (score >= 60 && score <= 75) return '#22C55E'; // Green
        if (score >= 80 && score <= 85) return '#10B981'; // Green to blueish
        if (score >= 90 && score <= 100) return '#3B82F6'; // Blue
        return '#6B7280'; // Default gray
      };

      const color = getColor(normalizedScore);
      const radius = (size - 8) / 2;
      const circumference = 2 * Math.PI * radius;
      const strokeDasharray = circumference;
      const strokeDashoffset = circumference - (normalizedScore / 100) * circumference;

      return (
        <div className="flex flex-col items-center">
          <div className="relative" style={{ width: size, height: size }}>
            {/* Background circle */}
            <svg
              className="transform -rotate-90"
              width={size}
              height={size}
            >
              <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                stroke="#E5E7EB"
                strokeWidth="4"
                fill="transparent"
              />
              {/* Progress circle */}
              <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                stroke={color}
                strokeWidth="4"
                fill="transparent"
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                className="transition-all duration-500 ease-out"
              />
            </svg>
            {/* Center text */}
            <div 
              className="absolute inset-0 flex items-center justify-center"
              style={{ fontSize: size * 0.25 }}
            >
              <span className="font-bold" style={{ color }}>
                {normalizedScore}%
              </span>
            </div>
          </div>
          <span className="text-xs text-gray-600 mt-1 font-medium">
            Trust Score
          </span>
        </div>
      );
    };

    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">
              Submitted Proposals ({proposals.length})
            </h3>
            {Array.isArray(proposals) && proposals.length > 0 && (
              <div className="text-sm text-gray-500">
                Review proposals and negotiate terms
              </div>
            )}
          </div>

          {/* Filter Section */}
          {Array.isArray(proposals) && proposals.length > 0 && (
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-2 mb-4">
                <FiFilter className="text-gray-600" size={18} />
                <h4 className="text-sm font-medium text-gray-900">Filter Proposals</h4>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Price Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sort by
                  </label>
                  <select
                    value={priceFilter}
                    onChange={(e) => setPriceFilter(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                  >
                    <option value="all">Default Order</option>
                    <option value="low-to-high">Price: Low to High</option>
                    <option value="high-to-low">Price: High to Low</option>
                    <option value="trust-high-to-low">Trust Score: High to Low</option>
                    <option value="trust-low-to-high">Trust Score: Low to High</option>
                  </select>
                </div>

                {/* Location Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Filter by Vendor Location
                  </label>
                  <select
                    value={locationFilter}
                    onChange={(e) => setLocationFilter(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                  >
                    <option value="all">All Locations</option>
                    {uniqueLocations.map((location) => (
                      <option key={location} value={location}>
                        {location}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Trust Score Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Filter by Trust Score
                  </label>
                  <select
                    value={trustScoreFilter}
                    onChange={(e) => setTrustScoreFilter(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                  >
                    <option value="all">All Trust Scores</option>
                    <option value="high">High (80-100)</option>
                    <option value="medium">Medium (50-79)</option>
                    <option value="low">Low (0-49)</option>
                  </select>
                </div>
              </div>

              {/* Filter Results Summary */}
              <div className="mt-4 flex items-center gap-4 text-sm text-gray-600">
                <span>
                  Showing {filteredProposals.length} of {proposals.length} proposals
                </span>
                {(priceFilter !== 'all' || locationFilter !== 'all' || trustScoreFilter !== 'all') && (
                  <button
                    onClick={() => {
                      setPriceFilter('all');
                      setLocationFilter('all');
                      setTrustScoreFilter('all');
                    }}
                    className="text-blue-600 hover:text-blue-800 underline"
                  >
                    Clear filters
                  </button>
                )}
              </div>
            </div>
          )}

          {!Array.isArray(proposals) || proposals.length === 0 ? (
            <div className="text-center py-12">
              <FiUser className="mx-auto text-gray-400 mb-3" size={48} />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Proposals Yet</h3>
              <p className="text-gray-500 mb-4">
                No vendors have submitted proposals for this project yet.
              </p>
              <div className="text-sm text-gray-400">
                Proposals will appear here once vendors submit their bids.
              </div>
            </div>
          ) : filteredProposals.length === 0 ? (
            <div className="text-center py-12">
              <FiFilter className="mx-auto text-gray-400 mb-3" size={48} />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Matching Proposals</h3>
              <p className="text-gray-500 mb-4">
                No proposals match your current filter criteria.
              </p>
              <button
                onClick={() => {
                  setPriceFilter('all');
                  setLocationFilter('all');
                  setTrustScoreFilter('all');
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {filteredProposals.map((proposal, index) => {
                // Get original index for proper handling
                const originalIndex = proposals.findIndex(p => p === proposal);
                const proposalStatus = proposal.status || 'pending';

                // Status detection logic for project owner actions
                const canOwnerAct = ['pending', 'submitted'].includes(proposalStatus);
                const isWaitingForVendor = proposalStatus === 'waiting_for_vendor';
                const isNegotiateStatus = proposalStatus === 'negotiate';
                const showActionButtons = canOwnerAct && !isWaitingForVendor && !isNegotiateStatus;

                console.log(`📋 Proposal ${originalIndex} (${proposal.vendorName}):`, {
                  proposalStatus,
                  canOwnerAct,
                  isWaitingForVendor,
                  isNegotiateStatus,
                  showActionButtons
                });

                return (
                  <div key={originalIndex} className="border border-gray-200 rounded-lg overflow-hidden">
                    {/* Proposal Header */}
                    <div className="p-6 bg-white">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-4 mb-2">
                            <div className="flex items-center gap-3">
                              <button
                                onClick={() => handleViewPortfolio(proposal.vendorId, proposal.vendorName, proposal, originalIndex)}
                                className="text-lg font-semibold text-blue-600 hover:text-blue-800 hover:underline transition-colors"
                              >
                                {proposal.vendorName || 'Unknown Vendor'}
                              </button>
                              <span className={`px-3 py-1 text-xs font-medium rounded-full ${getProposalStatusColor(proposalStatus)}`}>
                                {proposalStatus.charAt(0).toUpperCase() + proposalStatus.slice(1)}
                              </span>
                            </div>
                            {/* Trust Score Component */}
                            <TrustScoreCircle 
                              score={proposal.trustScore || proposal.vendorTrustScore || Math.floor(Math.random() * 101)} 
                              size={50} 
                            />
                          </div>
                          <div className="text-sm text-gray-500 mb-3">
                            <div className="flex items-center gap-4 flex-wrap">
                              <span>
                                Submitted on: {proposal.submittedAt ? 
                                  new Date(proposal.submittedAt).toLocaleDateString('id-ID', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  }) : 'Unknown date'
                                }
                              </span>
                              {/* Vendor Location Display */}
                              <div className="flex items-center gap-1">
                                <FiMapPin size={14} className="text-gray-400" />
                                <span className="text-sm font-medium text-gray-600">
                                  {proposal.vendorCity && proposal.vendorProvince ? 
                                    `${proposal.vendorCity}, ${proposal.vendorProvince}` :
                                    proposal.vendorLocation || proposal.location || 'Location not specified'
                                  }
                                </span>
                              </div>
                              {/* Vendor Full Name/Company Display */}
                              {proposal.vendorAccountType === 'perusahaan' ? (
                                proposal.vendorCompany && (
                                  <div className="flex items-center gap-1">
                                    <FiUser size={14} className="text-gray-400" />
                                    <span className="text-sm font-medium text-gray-600">
                                      {proposal.vendorCompany}
                                    </span>
                                  </div>
                                )
                              ) : (
                                (proposal.vendorFirstName || proposal.vendorLastName) && (
                                  <div className="flex items-center gap-1">
                                    <FiUser size={14} className="text-gray-400" />
                                    <span className="text-sm font-medium text-gray-600">
                                      {`${proposal.vendorFirstName || ''} ${proposal.vendorLastName || ''}`.trim()}
                                    </span>
                                  </div>
                                )
                              )}
                              {/* Vendor Phone Number Display */}
                              {proposal.vendorPhone && (
                                <div className="flex items-center gap-1">
                                  <FiPhone size={14} className="text-gray-400" />
                                  <span className="text-sm font-medium text-gray-600">
                                    {proposal.vendorPhone}
                                  </span>
                                </div>
                              )}
                              {/* Vendor Email Display */}
                              {proposal.vendorEmail && (
                                <div className="flex items-center gap-1">
                                  <FiMail size={14} className="text-gray-400" />
                                  <span className="text-sm font-medium text-gray-600">
                                    {proposal.vendorEmail}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        {/* Action Buttons */}
                        <div className="flex gap-2 flex-wrap">
                          {/* Status-based display */}
                          {isWaitingForVendor ? (
                            <div className="px-4 py-2 bg-orange-100 text-orange-800 rounded-lg font-medium flex items-center gap-2">
                              <FiClock size={16} />
                              Waiting for vendor to submit new BOQ...
                            </div>
                          ) : isNegotiateStatus ? (
                            <div className="px-4 py-2 bg-blue-100 text-blue-800 rounded-lg font-medium flex items-center gap-2">
                              <FiClock size={16} />
                              Waiting vendor response
                            </div>
                          ) : showActionButtons ? (
                            <>
                              <button
                                onClick={() => {
                                  console.log('🔘 Accept button clicked', { originalIndex, proposalStatus, vendorName: proposal.vendorName });
                                  handleAcceptProposal(originalIndex, proposal);
                                }}
                                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center gap-2"
                              >
                                <FiCheck size={16} />
                                Accept
                              </button>
                              <button
                                onClick={() => {
                                  console.log('🔘 Negotiate button clicked', { originalIndex, proposalStatus, vendorName: proposal.vendorName });
                                  handleStartNegotiation(originalIndex, proposal);
                                }}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2"
                              >
                                <FiMessageSquare size={16} />
                                Negotiate
                              </button>
                              <button
                                onClick={() => {
                                  console.log('🔘 Reject button clicked', { originalIndex, proposalStatus, vendorName: proposal.vendorName });
                                  handleRejectProposal(originalIndex, proposal);
                                }}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium flex items-center gap-2"
                              >
                                <FiX size={16} />
                                Reject
                              </button>
                            </>
                          ) : null}
                        </div>
                      </div>

                      {/* Proposal Summary */}
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <p className="text-sm text-gray-500 mb-1">Total Bid Amount</p>
                          <p className="font-semibold text-gray-900">
                            {formatCurrencyProposal(proposal.totalAmount)}
                          </p>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <p className="text-sm text-gray-500 mb-1">BOQ Type</p>
                          <p className="font-semibold text-gray-900">
                            {proposal.boqType || proposal.proposalType || 'Standard'}
                          </p>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <p className="text-sm text-gray-500 mb-1">Negotiable</p>
                          <p className="font-semibold text-gray-900">
                            {proposal.negotiable === 'negotiable' ? 'Yes' : 'No'}
                          </p>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <p className="text-sm text-gray-500 mb-1">Items Count</p>
                          <p className="font-semibold text-gray-900">
                            {proposal.boqPricing?.length || 0} items
                          </p>
                        </div>
                      </div>

                      {/* Vendor Message */}
                      {proposal.message && (
                        <div className="bg-blue-50 p-4 rounded-lg mb-4">
                          <h5 className="text-sm font-medium text-gray-900 mb-2">Vendor Message:</h5>
                          <p className="text-sm text-gray-700">{proposal.message}</p>
                        </div>
                      )}

                      {/* BOQ Actions */}
                      <button
                        onClick={() => handleViewBOQInMaker(proposal)}
                        className="flex items-center gap-2 w-full py-3 px-4 bg-white hover:bg-gray-50 rounded-lg transition-colors text-left border border-gray-200 shadow-sm"
                      >
                        <FiFileText size={16} className="text-blue-700" />
                        <span className="font-medium text-blue-900">
                          View Detailed BOQ in Maker
                        </span>
                        <FiEye size={16} className="text-blue-700 ml-auto" />
                      </button>

                      {/* Contact Section - Show when negotiating or negotiate status */}
                      {(proposalStatus === 'negotiating' || proposalStatus === 'negotiate') && (
                        <div className="bg-white border border-gray-200 p-4 rounded-lg mt-4 shadow-sm">
                          <h5 className="text-sm font-medium text-blue-900 mb-4 flex items-center gap-2">
                            <FiMessageSquare size={16} />
                            Contact Vendor for Negotiation
                            <div className="relative group">
                              <FiInfo size={14} className="text-blue-600 cursor-help" />
                              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-10">
                                Negotiate directly with the vendor outside the platform. Once you reach an agreement, the vendor will submit a new BOQ for your approval.
                                <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                              </div>
                            </div>
                          </h5>
                          
                          <div className="flex gap-3 flex-wrap">
                            {/* WhatsApp Button */}
                            {proposal.vendorPhone && (
                              <a
                                href={`https://wa.me/62${proposal.vendorPhone.replace(/\D/g, '').replace(/^62/, '')}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center gap-2"
                              >
                                <FiMessageCircle size={16} />
                                WhatsApp
                              </a>
                            )}
                            {/* Phone Button */}
                            {proposal.vendorPhone && (
                              <a
                                href={`tel:${proposal.vendorPhone}`}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2"
                              >
                                <FiPhone size={16} />
                                Phone
                              </a>
                            )}
                            {/* Email Button */}
                            {proposal.vendorEmail && (
                              <a
                                href={`mailto:${proposal.vendorEmail}`}
                                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium flex items-center gap-2"
                              >
                                <FiMail size={16} />
                                Email
                              </a>
                            )}
                            {/* Show message when phone number is missing */}
                            {!proposal.vendorPhone && proposal.vendorEmail && (
                              <div className="px-4 py-2 bg-amber-50 text-amber-800 border border-amber-200 rounded-lg text-sm">
                                <div className="flex items-center gap-2">
                                  <FiAlertTriangle size={16} />
                                  <span>Phone number not available - Contact via email</span>
                                </div>
                              </div>
                            )}
                            {/* Show message if no contact available */}
                            {!proposal.vendorPhone && !proposal.vendorEmail && (
                              <div className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium">
                                Contact information not available
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderVendorProfileView = () => {
    if (!selectedVendor) return null;

    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowVendorProfile(false)}
                className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <FiArrowLeft size={20} />
                <span className="font-medium">Back to Proposals</span>
              </button>
              <h2 className="text-2xl font-bold text-gray-900">{selectedVendor.name}</h2>
            </div>
          </div>

          {/* Vendor Profile Content */}
          <div className="space-y-8">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Company Information</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-500">Company Name</p>
                    <p className="font-medium text-gray-900">{selectedVendor.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Vendor ID</p>
                    <p className="font-medium text-gray-900">{selectedVendor.id || 'Not specified'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Specialization</p>
                    <p className="font-medium text-gray-900">Construction & Design</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Contact Information</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium text-gray-900">contact@{selectedVendor.name?.toLowerCase().replace(/\s+/g, '')}.com</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Phone</p>
                    <p className="font-medium text-gray-900">+62 xxx-xxxx-xxxx</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Location</p>
                    <p className="font-medium text-gray-900">Jakarta, Indonesia</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Proposal Summary */}
            {selectedVendor.proposal && (
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Proposal Summary</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Total Bid Amount</p>
                    <p className="text-xl font-bold text-blue-600">
                      {formatCurrency(selectedVendor.proposal.totalAmount || 0)}
                    </p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Estimated Duration</p>
                    <p className="text-xl font-bold text-green-600">
                      {selectedVendor.proposal.estimatedDuration || 'Not specified'}
                    </p>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">BOQ Items</p>
                    <p className="text-xl font-bold text-purple-600">
                      {selectedVendor.proposal.boqPricing?.length || 0} items
                    </p>
                  </div>
                </div>

                {selectedVendor.proposal.message && (
                  <div className="bg-gray-50 p-4 rounded-lg mb-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Vendor Message:</h4>
                    <p className="text-sm text-gray-700">{selectedVendor.proposal.message}</p>
                  </div>
                )}
              </div>
            )}

            {/* Portfolio Section - Placeholder */}
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Portfolio</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Placeholder portfolio items */}
                {[1, 2, 3].map((item) => (
                  <div key={item} className="border border-gray-200 rounded-lg overflow-hidden">
                    <div className="h-48 bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-500">Portfolio Image {item}</span>
                    </div>
                    <div className="p-4">
                      <h4 className="font-medium text-gray-900 mb-2">Project {item}</h4>
                      <p className="text-sm text-gray-600">
                        Sample project description showcasing the vendor's work quality and expertise.
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="border-t border-gray-200 pt-6 flex gap-4">
              <button
                onClick={() => {
                  console.log('Select vendor:', selectedVendor.name);
                  // Add vendor selection logic here
                }}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Select This Vendor
              </button>
              <button
                onClick={() => setShowVendorProfile(false)}
                className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              >
                Back to Proposals
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderTabContent = () => {
    if (showVendorProfile) {
      return renderVendorProfileView();
    }

    switch (activeTab) {
      case 'overview':
        return renderOverviewTab();
      case 'tahapan':
        return renderTahapanTab();
      case 'boq':
        return renderBOQTab();
      case 'proposals':
        return renderProposalsTab();
      case 'negotiation':
        return renderNegotiationTab();
      default:
        return renderOverviewTab();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={onBack}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <FiArrowLeft size={20} />
              <span className="font-medium">Back to Projects</span>
            </button>
            
            <div className="text-sm text-gray-500">
              Project Owner Dashboard
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation - Hide when viewing vendor profile */}
      {!showVendorProfile && (
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <nav className="flex space-x-8">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`relative flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon size={16} />
                    {tab.label}
                    {tab.hasNotification && tab.notificationCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {tab.notificationCount > 9 ? '9+' : tab.notificationCount}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderTabContent()}
      </div>

      {/* Midtrans Payment Modal */}
      <MidtransPaymentModal
        isOpen={showPaymentModal}
        onClose={() => {
          setShowPaymentModal(false);
          setSelectedProposalForPayment(null);
          setSelectedProposalIndex(null);
        }}
        projectData={project}
        selectedProposal={selectedProposalForPayment}
        proposalIndex={selectedProposalIndex}
        onPaymentSuccess={handlePaymentSuccess}
      />
    </div>
  );
};

export default ProjectOwnerDetailPage;
