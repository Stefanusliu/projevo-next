import React, { useState, useEffect } from 'react';
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
  FiChevronUp
} from 'react-icons/fi';
import BOQDisplay from '../../../components/BOQDisplay';
import { firestoreService } from '../../../../hooks/useFirestore';
import { normalizeProposals, getProposalsLength } from '../../../../utils/proposalsUtils';
import MidtransPaymentModal from '../../../../components/payments/MidtransPaymentModal';

const ProjectOwnerDetailPage = ({ project, onBack }) => {
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

  const [activeTab, setActiveTab] = useState('overview');
  const [showVendorProfile, setShowVendorProfile] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [expandedProposals, setExpandedProposals] = useState({});
  const [negotiations, setNegotiations] = useState({});
  const [negotiationMode, setNegotiationMode] = useState({});
  const [counterOffers, setCounterOffers] = useState({});
  
  // Payment modal state
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedProposalForPayment, setSelectedProposalForPayment] = useState(null);
  const [selectedProposalIndex, setSelectedProposalIndex] = useState(null);


  const tabs = [
    { id: 'overview', label: 'Overview', icon: FiEye },
    { id: 'boq', label: 'BOQ', icon: FiFileText },
    { id: 'proposals', label: `Proposals (${getProposalsLength(project.proposals)})`, icon: FiUser },
  ];

  // Load negotiation data from project proposals (unified architecture)
  useEffect(() => {
    const loadNegotiationData = () => {
      // Normalize proposals data to handle both array and object formats
      const normalizedProposals = normalizeProposals(project?.proposals);
      
      if (!project || !normalizedProposals || normalizedProposals.length === 0) {
        console.log('No proposals available in project:', { 
          hasProject: !!project, 
          hasProposals: !!project?.proposals, 
          normalizedLength: normalizedProposals?.length,
          originalType: typeof project?.proposals,
          isArray: Array.isArray(project?.proposals)
        });
        return;
      }

      console.log('Loading negotiation data from project proposals...');
      
      const negotiationsMap = {};
      const counterOffersMap = {};
      
      normalizedProposals.forEach((proposal, index) => {
        // Extract negotiation data from proposal
        if (proposal && proposal.negotiation) {
          negotiationsMap[index] = {
            status: proposal.negotiation.status || proposal.status || 'pending',
            history: proposal.negotiation.history || [],
            counterOffer: proposal.negotiation.counterOffer
          };
          
          // Extract counter offers from negotiation data
          if (proposal.negotiation.counterOffer) {
            Object.keys(proposal.negotiation.counterOffer).forEach(itemIndex => {
              const key = `${index}_${itemIndex}`;
              counterOffersMap[key] = proposal.negotiation.counterOffer[itemIndex];
            });
          }
        } else if (proposal) {
          // Initialize with default values if no negotiation data exists
          negotiationsMap[index] = {
            status: proposal.status || 'pending',
            history: [],
            counterOffer: null
          };
        }
      });
      
      console.log('Loaded negotiations map:', negotiationsMap);
      console.log('Loaded counter offers map:', counterOffersMap);
      
      setNegotiations(negotiationsMap);
      setCounterOffers(counterOffersMap);
      
      console.log('Loaded negotiation data:', {
        negotiations: negotiationsMap,
        counterOffers: counterOffersMap,
        proposalsCount: normalizedProposals.length
      });
    };

    loadNegotiationData();
  }, [project?.proposals]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
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
      case 'pending':
      case 'submitted':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  const toggleProposalExpansion = (proposalIndex) => {
    setExpandedProposals(prev => ({
      ...prev,
      [proposalIndex]: !prev[proposalIndex]
    }));
  };

  const handleAcceptProposal = async (proposalIndex, proposal) => {
    try {
      console.log('🔄 Starting vendor selection with payment...', { proposalIndex, vendorName: proposal.vendorName });
      
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
      const negotiationData = {
        status: 'accepted',
        acceptedAt: now,
        acceptedBy: 'project_owner',
        history: [
          ...(negotiations[proposalIndex]?.history || []),
          {
            action: 'accepted',
            by: 'project_owner',
            ownerId: project.ownerId,
            ownerName: project.ownerName || project.client || 'Project Owner',
            timestamp: now,
            message: 'Proposal accepted by project owner'
          }
        ]
      };

      // Update local state first
      setNegotiations(prev => ({
        ...prev,
        [proposalIndex]: negotiationData
      }));

      // Prepare updated proposals array
      const currentProposals = normalizeProposals(project.proposals);
      if (!currentProposals || !currentProposals[proposalIndex]) {
        throw new Error(`Proposal at index ${proposalIndex} not found`);
      }

      const updatedProposalsForAccept = [...currentProposals];
      updatedProposalsForAccept[proposalIndex] = {
        ...updatedProposalsForAccept[proposalIndex],
        negotiation: negotiationData,
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
        updates: {
          proposalsCount: updates.proposals.length,
          acceptedProposal: updates.proposals[proposalIndex].status,
          vendorName: proposal.vendorName
        }
      });

      await firestoreService.update('projects', project.id, updates);
      
      console.log('✅ Proposal acceptance saved successfully');
      console.log(`🎉 Accepted proposal from: ${proposal.vendorName}`);
      
      // Show success feedback to user
      alert(`Successfully accepted proposal from ${proposal.vendorName}!`);
      
    } catch (error) {
      console.error('❌ Error saving proposal acceptance:', error);
      console.error('Error details:', {
        message: error.message,
        projectId: project.id,
        proposalIndex,
        vendorName: proposal.vendorName
      });
      
      // Revert local state on error
      setNegotiations(prev => {
        const reverted = { ...prev };
        delete reverted[proposalIndex];
        return reverted;
      });
      
      // Show error feedback to user
      alert(`Failed to accept proposal: ${error.message}`);
    }
  };

  const handleRejectProposal = async (proposalIndex, proposal) => {
    try {
      console.log('🔄 Starting proposal rejection...', { proposalIndex, vendorName: proposal.vendorName });
      
      const now = new Date();
      const negotiationData = {
        status: 'rejected',
        rejectedAt: now,
        rejectedBy: 'project_owner',
        history: [
          ...(negotiations[proposalIndex]?.history || []),
          {
            action: 'rejected',
            by: 'project_owner',
            ownerId: project.ownerId,
            ownerName: project.ownerName || project.client || 'Project Owner',
            timestamp: now,
            message: 'Proposal rejected by project owner'
          }
        ]
      };

      // Update local state first
      setNegotiations(prev => ({
        ...prev,
        [proposalIndex]: negotiationData
      }));

      // Prepare updated proposals array
      const currentProposalsForReject = normalizeProposals(project.proposals);
      if (!currentProposalsForReject || !currentProposalsForReject[proposalIndex]) {
        throw new Error(`Proposal at index ${proposalIndex} not found`);
      }

      const updatedProposalsForReject = [...currentProposalsForReject];
      updatedProposalsForReject[proposalIndex] = {
        ...updatedProposalsForReject[proposalIndex],
        negotiation: negotiationData,
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
        updates: {
          proposalsCount: updates.proposals.length,
          rejectedProposal: updates.proposals[proposalIndex].status,
          vendorName: proposal.vendorName
        }
      });

      await firestoreService.update('projects', project.id, updates);
      
      console.log('✅ Proposal rejection saved successfully');
      console.log(`❌ Rejected proposal from: ${proposal.vendorName}`);
      
      // Show success feedback to user
      alert(`Successfully rejected proposal from ${proposal.vendorName}.`);
      
    } catch (error) {
      console.error('❌ Error saving proposal rejection:', error);
      console.error('Error details:', {
        message: error.message,
        projectId: project.id,
        proposalIndex,
        vendorName: proposal.vendorName
      });
      
      // Revert local state on error
      setNegotiations(prev => {
        const reverted = { ...prev };
        delete reverted[proposalIndex];
        return reverted;
      });
      
      // Show error feedback to user
      alert(`Failed to reject proposal: ${error.message}`);
    }
  };

  const handleStartNegotiation = async (proposalIndex) => {
    try {
      console.log('🔄 Starting negotiation for proposal:', proposalIndex);
      
      // Set negotiation mode first
      setNegotiationMode(prev => ({
        ...prev,
        [proposalIndex]: true
      }));

      const now = new Date();
      const negotiationData = {
        status: 'negotiating',
        negotiationStartedAt: now,
        negotiationStartedBy: 'project_owner',
        history: [
          ...(negotiations[proposalIndex]?.history || []),
          {
            action: 'negotiation_started',
            by: 'project_owner',
            ownerId: project.ownerId,
            ownerName: project.ownerName || project.client || 'Project Owner',
            timestamp: now,
            message: 'Negotiation started by project owner'
          }
        ]
      };

      // Update local state
      setNegotiations(prev => ({
        ...prev,
        [proposalIndex]: negotiationData
      }));

      // Prepare updated proposals array
      const currentProposalsForNegotiation = normalizeProposals(project.proposals);
      if (!currentProposalsForNegotiation || !currentProposalsForNegotiation[proposalIndex]) {
        throw new Error(`Proposal at index ${proposalIndex} not found`);
      }

      const updatedProposalsForNegotiation = [...currentProposalsForNegotiation];
      updatedProposalsForNegotiation[proposalIndex] = {
        ...updatedProposalsForNegotiation[proposalIndex],
        negotiation: negotiationData,
        status: 'negotiating',
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
        negotiationStatus: 'negotiating'
      });
      
      await firestoreService.update('projects', project.id, updates);
      
      console.log('✅ Negotiation started and saved successfully');
      
    } catch (error) {
      console.error('❌ Error starting negotiation:', error);
      console.error('Error details:', {
        message: error.message,
        projectId: project.id,
        proposalIndex
      });
      
      // Revert negotiation mode on error
      setNegotiationMode(prev => ({
        ...prev,
        [proposalIndex]: false
      }));
      
      // Show error feedback to user
      alert(`Failed to start negotiation: ${error.message}`);
    }
  };

  const handleCounterOfferChange = (proposalIndex, itemIndex, field, value) => {
    // Only allow vendorPrice changes, volume is fixed
    if (field === 'vendorPrice') {
      setCounterOffers(prev => ({
        ...prev,
        [`${proposalIndex}_${itemIndex}`]: {
          ...(prev[`${proposalIndex}_${itemIndex}`] || {}),
          [field]: value
        }
      }));
    }
  };

  const handleSubmitCounterOffer = async (proposalIndex, proposal) => {
    console.log('Submitting counter offer for proposal:', proposalIndex);
    console.log('Project ID:', project.id);
    console.log('Counter offers state:', counterOffers);
    
    const counterOfferData = Object.keys(counterOffers)
      .filter(key => key.startsWith(`${proposalIndex}_`))
      .reduce((acc, key) => {
        const itemIndex = key.split('_')[1];
        acc[itemIndex] = counterOffers[key];
        return acc;
      }, {});

    console.log('Processed counter offer data:', counterOfferData);

    const now = new Date();
    const negotiationData = {
      status: 'negotiating',
      counterOffer: counterOfferData,
      history: [
        ...(negotiations[proposalIndex]?.history || []),
        {
          action: 'counter_offer_sent',
          by: 'project_owner',
          timestamp: now,
          message: 'Counter offer sent to vendor',
          data: counterOfferData
        }
      ]
    };

    // Update local state
    setNegotiations(prev => ({
      ...prev,
      [proposalIndex]: negotiationData
    }));

    setNegotiationMode(prev => ({
      ...prev,
      [proposalIndex]: false
    }));

    // Save to Firebase - Update project proposal with negotiation data
    try {
      if (project.id && project.proposals && Array.isArray(project.proposals) && project.proposals[proposalIndex]) {
        // Prepare the new history entry
        const newHistoryEntry = {
          action: 'counter_offer_sent',
          by: 'project_owner',
          ownerId: project.ownerId,
          ownerName: project.ownerName || 'Project Owner',
          timestamp: new Date(),
          message: 'Counter offer sent to vendor',
          data: counterOfferData
        };

        // Get current proposal negotiation data
        const normalizedProposals = normalizeProposals(project.proposals);
        const currentProposal = normalizedProposals[proposalIndex];
        const existingNegotiation = currentProposal?.negotiation || { history: [] };

        // Update negotiation data with enhanced tracking
        const updatedNegotiation = {
          status: 'pending_vendor_response', // Project owner sent offer, now vendor can respond
          negotiationStatus: 'owner_counter_offer', // Clear status indicator
          lastActionBy: 'project_owner', 
          lastActionAt: new Date(),
          ownerInfo: {
            ownerId: project.ownerId,
            ownerName: project.ownerName || 'Project Owner'
          },
          // Preserve vendor info from existing negotiation or get from proposal
          vendorInfo: existingNegotiation.vendorInfo || {
            vendorId: currentProposal?.vendorId,
            vendorName: currentProposal?.vendorName || 'Unknown Vendor',
            vendorEmail: currentProposal?.vendorEmail
          },
          counterOffer: counterOfferData,
          history: [
            ...(existingNegotiation.history || []),
            newHistoryEntry
          ],
          updatedAt: new Date()
        };

        // Update the project document with new negotiation data
        // Instead of using dot notation which can convert arrays to objects,
        // we'll update the entire proposals array
        const currentProposals = normalizeProposals(project.proposals);
        const updatedProposalsArray = [...currentProposals];
        updatedProposalsArray[proposalIndex] = {
          ...updatedProposalsArray[proposalIndex],
          negotiation: updatedNegotiation
        };

        await firestoreService.update('projects', project.id, {
          proposals: updatedProposalsArray,
          updatedAt: new Date()
        });
        
        console.log('✅ Updated project proposal negotiation data');
        
        // Update local negotiations state to match
        setNegotiations(prev => ({
          ...prev,
          [proposalIndex]: updatedNegotiation
        }));
        
      } else {
        console.error('❌ Cannot save counter offer: Missing project ID or proposal data', {
          hasProjectId: !!project.id,
          hasProposals: !!project.proposals,
          isProposalsArray: Array.isArray(project.proposals),
          proposalExists: !!(project.proposals && project.proposals[proposalIndex]),
          proposalIndex
        });
      }
    } catch (error) {
      console.error('❌ Error saving counter offer to Firebase:', error);
      console.error('Error details:', error.message);
    }

    console.log('✅ Counter offer submitted for proposal:', proposalIndex, counterOfferData);
  };

  const calculateCounterOfferTotal = (proposalIndex, boqData) => {
    if (!boqData) return 0;
    
    return boqData.reduce((total, item, itemIndex) => {
      const counterOffer = counterOffers[`${proposalIndex}_${itemIndex}`];
      const negotiationData = negotiations[proposalIndex];
      
      // Get the latest negotiated price - prioritize latest counter offer over original price
      let latestPrice = parseFloat(item.vendorPrice || 0); // Start with original vendor price
      
      // Check if there's a counter offer in negotiation history
      if (negotiationData?.counterOffer && negotiationData.counterOffer[itemIndex]) {
        latestPrice = parseFloat(negotiationData.counterOffer[itemIndex].vendorPrice || latestPrice);
      }
      
      // If currently negotiating, use the counter offer input value
      if (counterOffer?.vendorPrice !== undefined) {
        latestPrice = parseFloat(counterOffer.vendorPrice || latestPrice);
      }
      
      const volume = item.volume || 0; // Volume is always fixed to original
      return total + (latestPrice * volume);
    }, 0);
  };

  const calculateLatestNegotiatedTotal = (proposalIndex, boqData) => {
    if (!boqData) return 0;
    
    return boqData.reduce((total, item, itemIndex) => {
      const negotiationData = negotiations[proposalIndex];
      
      // Priority for getting the latest price:
      // 1. Current counter offer input (if actively negotiating)
      // 2. Negotiated price from BOQ item itself
      // 3. Counter offer from negotiation data
      // 4. Original vendor price
      
      let latestPrice = parseFloat(item.vendorPrice || 0);
      
      // Check for negotiated price directly in the BOQ item
      if (item.negotiatedPrice && item.negotiatedPrice !== item.vendorPrice) {
        latestPrice = parseFloat(item.negotiatedPrice);
        console.log(`Item ${itemIndex}: Using negotiated price from BOQ ${latestPrice} (was ${item.vendorPrice})`);
      }
      
      // Check if there's a counter offer in negotiation history
      if (negotiationData?.counterOffer && negotiationData.counterOffer[itemIndex]) {
        latestPrice = parseFloat(negotiationData.counterOffer[itemIndex].vendorPrice || latestPrice);
        console.log(`Item ${itemIndex}: Using negotiated price from history ${latestPrice}`);
      }
      
      // Check counter offers state for the most recent input (if currently negotiating)
      const counterOfferKey = `${proposalIndex}_${itemIndex}`;
      if (counterOffers[counterOfferKey]?.vendorPrice !== undefined) {
        const counterPrice = parseFloat(counterOffers[counterOfferKey].vendorPrice);
        if (counterPrice > 0) {
          latestPrice = counterPrice;
          console.log(`Item ${itemIndex}: Using current counter offer price ${latestPrice}`);
        }
      }
      
      const volume = item.volume || 0;
      const itemTotal = latestPrice * volume;
      console.log(`Item ${itemIndex}: ${latestPrice} × ${volume} = ${itemTotal}`);
      return total + itemTotal;
    }, 0);
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

      {/* Key Information Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <FiDollarSign className="text-green-600" size={20} />
            </div>
            <div>
              <p className="text-sm text-gray-500">Budget</p>
              <p className="font-semibold text-gray-900">{project.budget}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <FiClock className="text-blue-600" size={20} />
            </div>
            <div>
              <p className="text-sm text-gray-500">Duration</p>
              <p className="font-semibold text-gray-900">{project.duration}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <FiCalendar className="text-red-600" size={20} />
            </div>
            <div>
              <p className="text-sm text-gray-500">Tender Deadline</p>
              <p className="font-semibold text-gray-900">{project.bidCountdown || 'Not specified'}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <FiMapPin className="text-purple-600" size={20} />
            </div>
            <div>
              <p className="text-sm text-gray-500">Location</p>
              <p className="font-semibold text-gray-900">{project.location}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Project Description */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Project Description</h3>
        <div className="prose prose-sm max-w-none">
          <p className="text-gray-600 leading-relaxed">
            {project.description || 'No description available for this project.'}
          </p>
        </div>
      </div>

      {/* Project Scope */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Project Scope</h3>
        <div className="flex flex-wrap gap-2">
          {Array.isArray(project.scope) ? (
            project.scope.map((scope, index) => (
              <span key={index} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                {scope}
              </span>
            ))
          ) : (
            <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
              {project.scope || 'General'}
            </span>
          )}
        </div>
      </div>

      {/* Additional Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Project Owner</h3>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <FiUser className="text-blue-600" size={24} />
            </div>
            <div>
              <p className="font-medium text-gray-900">{project.client || 'Not specified'}</p>
              <p className="text-sm text-gray-500">Project Owner</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Estimated Start Date</h3>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <FiCalendar className="text-green-600" size={20} />
            </div>
            <div>
              <p className="font-medium text-gray-900">{formatDate(project.estimatedStartDate)}</p>
              <p className="text-sm text-gray-500">Planned Start</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderBOQTab = () => {
    // Check for BOQ data in multiple possible locations
    const boqData = project.boq || 
                   project.attachedBOQ || 
                   project.boqData || 
                   project.originalData?.boq || 
                   project.originalData?.attachedBOQ;

    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Bill of Quantities (BOQ)</h3>
          </div>
          {boqData ? (
            <div className="max-h-96 overflow-y-auto">
              <BOQDisplay project={{ ...project, attachedBOQ: boqData }} />
            </div>
          ) : (
            <div className="text-center py-8">
              <FiFileText className="mx-auto text-gray-400 mb-3" size={48} />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No BOQ Available</h3>
              <p className="text-gray-500">
                Bill of Quantities has not been uploaded for this project yet.
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

    const handleSelectVendor = (proposal) => {
      // Here you can implement vendor selection logic
      console.log('Selected vendor:', proposal.vendorName);
      // You might want to update the project status, notify the vendor, etc.
    };

    const handleViewPortfolio = (vendorId, vendorName, proposal, proposalIndex) => {
      setSelectedVendor({ 
        id: vendorId, 
        name: vendorName,
        proposal: proposal,
        proposalIndex: proposalIndex
      });
      setShowVendorProfile(true);
    };

    const renderBOQTable = (proposalIndex, boqData) => {
      if (!boqData || boqData.length === 0) {
        return (
          <div className="text-center py-4 text-gray-500">
            No BOQ data available
          </div>
        );
      }

      const isNegotiating = negotiationMode[proposalIndex];
      const negotiationData = negotiations[proposalIndex];

      return (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Work Stage
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Work Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Work Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Item Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Unit
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Volume
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Unit Price
                  {!isNegotiating && (
                    <div className="text-xs normal-case text-blue-600 font-normal mt-1">
                      (Latest negotiated)
                    </div>
                  )}
                </th>
                {isNegotiating && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Counter Price
                  </th>
                )}
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Subtotal
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {boqData.map((item, itemIndex) => {
                const counterOffer = counterOffers[`${proposalIndex}_${itemIndex}`];
                const negotiationData = negotiations[proposalIndex];
                
                // Get the latest negotiated price - prioritize latest counter offer over original price
                let latestPrice = parseFloat(item.vendorPrice || 0); // Start with original vendor price
                
                // Check if there's a counter offer in negotiation history
                if (negotiationData?.counterOffer && negotiationData.counterOffer[itemIndex]) {
                  latestPrice = parseFloat(negotiationData.counterOffer[itemIndex].vendorPrice || latestPrice);
                }
                
                // If currently negotiating, use the counter offer input value
                if (counterOffer?.vendorPrice !== undefined) {
                  latestPrice = parseFloat(counterOffer.vendorPrice || latestPrice);
                }
                
                const displayVolume = item.volume || 0; // Volume is fixed, always use original
                const displayUnitPrice = latestPrice;
                const total = displayVolume * displayUnitPrice;

                return (
                  <tr key={itemIndex} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.tahapanName || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.jenisName || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.uraianName || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.item || `Item ${itemIndex + 1}`}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.unit || 'unit'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.volume || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrencyProposal(displayUnitPrice)}
                      {/* Show indicator if price was negotiated */}
                      {displayUnitPrice !== parseFloat(item.vendorPrice || 0) && (
                        <span className="ml-2 text-xs text-blue-600 font-medium">
                          (Negotiated)
                        </span>
                      )}
                    </td>
                    {isNegotiating && (
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="number"
                          className="w-full px-3 py-2 border-2 border-gray-800 rounded-md text-sm focus:border-black focus:ring-2 focus:ring-gray-300 bg-gray-100 text-black placeholder-gray-600 font-medium [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          placeholder={displayUnitPrice}
                          value={counterOffer?.vendorPrice || ''}
                          onChange={(e) => handleCounterOfferChange(
                            proposalIndex, 
                            itemIndex, 
                            'vendorPrice', 
                            parseFloat(e.target.value) || 0
                          )}
                        />
                      </td>
                    )}
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {formatCurrencyProposal(total)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot className="bg-gray-50">
              <tr>
                <td colSpan={isNegotiating ? 8 : 7} className="px-6 py-4 text-right font-medium text-gray-900">
                  Total Amount:
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-lg font-bold text-gray-900">
                  {isNegotiating
                    ? formatCurrencyProposal(calculateCounterOfferTotal(proposalIndex, boqData))
                    : formatCurrencyProposal(calculateLatestNegotiatedTotal(proposalIndex, boqData))
                  }
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      );
    };

    const renderNegotiationHistory = (proposalIndex) => {
      const negotiationData = negotiations[proposalIndex];
      if (!negotiationData?.history || negotiationData.history.length === 0) {
        return null;
      }

      return (
        <div className="mt-4 border-t border-gray-200 pt-4">
          <h5 className="text-sm font-medium text-gray-900 mb-3">Negotiation History:</h5>
          <div className="space-y-2">
            {negotiationData.history.map((entry, index) => (
              <div key={index} className="flex items-start gap-3 text-sm">
                <div className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900">
                      {entry.by === 'project_owner' 
                        ? (entry.ownerName || 'You')
                        : (entry.vendorName || proposal.vendorName || 'Vendor')
                      }
                    </span>
                    <span className="text-gray-500">
                      {formatTimestamp(entry.timestamp)}
                    </span>
                  </div>
                  <p className="text-gray-600">{entry.message}</p>
                </div>
              </div>
            ))}
          </div>
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
          ) : (
            <div className="space-y-6">
              {Array.isArray(proposals) && proposals.map((proposal, index) => {
                const negotiationData = negotiations[index];
                const proposalStatus = negotiationData?.status || proposal.status || 'pending';
                const isNegotiating = negotiationMode[index];

                // Status detection logic for project owner actions
                const canOwnerAct = proposalStatus === 'pending_owner_response' || proposalStatus === 'negotiating' || proposalStatus === 'pending' || proposalStatus === 'submitted';
                const isWaitingForVendor = proposalStatus === 'pending_vendor_response';
                const showNegotiationControls = canOwnerAct && !isWaitingForVendor;

                // Debug logging for each proposal
                console.log(`📋 Proposal ${index} (${proposal.vendorName}):`, {
                  proposalStatus,
                  canOwnerAct,
                  isWaitingForVendor,
                  showNegotiationControls,
                  isNegotiating,
                  hasNegotiationData: !!negotiationData,
                  originalStatus: proposal.status
                });

                return (
                  <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
                    {/* Proposal Header */}
                    <div className="p-6 bg-white">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <button
                              onClick={() => handleViewPortfolio(proposal.vendorId, proposal.vendorName, proposal, index)}
                              className="text-lg font-semibold text-blue-600 hover:text-blue-800 hover:underline transition-colors"
                            >
                              {proposal.vendorName || 'Unknown Vendor'}
                            </button>
                            <span className={`px-3 py-1 text-xs font-medium rounded-full ${getProposalStatusColor(proposalStatus)}`}>
                              {proposalStatus.charAt(0).toUpperCase() + proposalStatus.slice(1)}
                            </span>
                          </div>
                          <div className="text-sm text-gray-500 mb-3">
                            Submitted on: {proposal.submittedAt ? 
                              new Date(proposal.submittedAt).toLocaleDateString('id-ID', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              }) : 'Unknown date'
                            }
                          </div>
                        </div>
                        
                        {/* Action Buttons */}
                        <div className="flex gap-2">
                          {/* Check if waiting for vendor response */}
                          {isWaitingForVendor && !isNegotiating ? (
                            <div className="px-4 py-2 bg-orange-100 text-orange-800 rounded-lg font-medium flex items-center gap-2">
                              <FiClock size={16} />
                              Waiting for vendor response...
                            </div>
                          ) : (
                            <>
                              {showNegotiationControls && (proposalStatus === 'pending' || proposalStatus === 'submitted') && !isNegotiating && (
                                <>
                                  <button
                                    onClick={() => {
                                      console.log('🔘 Accept button clicked', { index, proposalStatus, vendorName: proposal.vendorName });
                                      handleAcceptProposal(index, proposal);
                                    }}
                                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center gap-2"
                                  >
                                    <FiCheck size={16} />
                                    Accept
                                  </button>
                                  <button
                                    onClick={() => {
                                      console.log('🔘 Negotiate button clicked', { index, proposalStatus, vendorName: proposal.vendorName });
                                      handleStartNegotiation(index);
                                    }}
                                    className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors font-medium flex items-center gap-2"
                                  >
                                    <FiMessageSquare size={16} />
                                    Negotiate
                                  </button>
                                  <button
                                    onClick={() => {
                                      console.log('🔘 Reject button clicked', { index, proposalStatus, vendorName: proposal.vendorName });
                                      handleRejectProposal(index, proposal);
                                    }}
                                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium flex items-center gap-2"
                                  >
                                    <FiX size={16} />
                                    Reject
                                  </button>
                                </>
                              )}
                              
                              {showNegotiationControls && (proposalStatus === 'negotiating' || proposalStatus === 'pending_owner_response') && !isNegotiating && (
                                <>
                                  <button
                                    onClick={() => {
                                      console.log('🔘 Accept button clicked (negotiating)', { index, proposalStatus, vendorName: proposal.vendorName });
                                      handleAcceptProposal(index, proposal);
                                    }}
                                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center gap-2"
                                  >
                                    <FiCheck size={16} />
                                    Accept
                                  </button>
                                  <button
                                    onClick={() => {
                                      console.log('🔘 Counter Offer button clicked', { index, proposalStatus, vendorName: proposal.vendorName });
                                      setNegotiationMode(prev => ({ ...prev, [index]: true }));
                                    }}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2"
                                  >
                                    <FiEdit3 size={16} />
                                    Counter Offer
                                  </button>
                                  <button
                                    onClick={() => {
                                      console.log('🔘 Reject button clicked (negotiating)', { index, proposalStatus, vendorName: proposal.vendorName });
                                      handleRejectProposal(index, proposal);
                                    }}
                                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium flex items-center gap-2"
                                  >
                                    <FiX size={16} />
                                    Reject
                                  </button>
                                </>
                              )}

                              {isNegotiating && (
                                <>
                                  <button
                                    onClick={() => handleSubmitCounterOffer(index, proposal)}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                                  >
                                    Submit Counter Offer
                                  </button>
                                  <button
                                    onClick={() => setNegotiationMode(prev => ({ ...prev, [index]: false }))}
                                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
                                  >
                                    Cancel
                                  </button>
                                </>
                              )}
                            </>
                          )}
                        </div>
                      </div>

                      {/* Proposal Summary */}
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <p className="text-sm text-gray-500 mb-1">Total Bid Amount</p>
                          <p className="font-semibold text-gray-900">
                            {formatCurrencyProposal(calculateLatestNegotiatedTotal(index, proposal.boqPricing) || proposal.totalAmount)}
                          </p>
                          {/* Show indicator if amount was negotiated */}
                          {calculateLatestNegotiatedTotal(index, proposal.boqPricing) !== proposal.totalAmount && (
                            <p className="text-xs text-blue-600 font-medium mt-1">
                              (Negotiated from {formatCurrencyProposal(proposal.totalAmount)})
                            </p>
                          )}
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

                      {/* Latest Negotiation Progress - Show prominently */}
                      {negotiationData?.history && negotiationData.history.length > 0 && (
                        <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg mb-4">
                          <h5 className="text-sm font-medium text-blue-900 mb-2 flex items-center gap-2">
                            <FiMessageSquare size={16} />
                            Latest Negotiation Progress
                          </h5>
                          {(() => {
                            const latestEntry = negotiationData.history[negotiationData.history.length - 1];
                            return (
                              <div className="flex items-start gap-3">
                                <div className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="font-medium text-blue-900">
                                      {latestEntry.by === 'project_owner' 
                                        ? (latestEntry.ownerName || 'You')
                                        : (latestEntry.vendorName || proposal.vendorName || 'Vendor')
                                      }
                                    </span>
                                    <span className="text-blue-700 text-sm">
                                      {formatTimestamp(latestEntry.timestamp)}
                                    </span>
                                  </div>
                                  <p className="text-blue-800 text-sm">{latestEntry.message}</p>
                                  {latestEntry.action === 'counter_offer_sent' && (
                                    <p className="text-blue-600 text-xs mt-1 italic">
                                      Waiting for vendor response...
                                    </p>
                                  )}
                                </div>
                              </div>
                            );
                          })()}
                        </div>
                      )}

                      {/* Vendor Message */}
                      {proposal.message && (
                        <div className="bg-blue-50 p-4 rounded-lg mb-4">
                          <h5 className="text-sm font-medium text-gray-900 mb-2">Vendor Message:</h5>
                          <p className="text-sm text-gray-700">{proposal.message}</p>
                        </div>
                      )}

                      {/* BOQ Actions */}
                      <button
                        onClick={() => toggleProposalExpansion(index)}
                        className="flex items-center gap-2 w-full py-3 px-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors text-left"
                      >
                        <FiFileText size={16} className="text-gray-700" />
                        <span className="font-medium text-gray-900">
                          {expandedProposals[index] ? 'Hide' : 'View'} Detailed BOQ
                        </span>
                        {expandedProposals[index] ? <FiChevronUp size={16} className="text-gray-700 ml-auto" /> : <FiChevronDown size={16} className="text-gray-700 ml-auto" />}
                      </button>

                      {/* Expandable BOQ Table */}
                      {expandedProposals[index] && proposal.boqPricing && proposal.boqPricing.length > 0 && (
                        <div className="mt-4 border border-gray-200 rounded-lg overflow-hidden">
                          {renderBOQTable(index, proposal.boqPricing)}
                        </div>
                      )}

                      {/* Negotiation History */}
                      {renderNegotiationHistory(index)}
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
                      {formatCurrency(calculateLatestNegotiatedTotal(selectedVendor.proposalIndex, selectedVendor.proposal.boqPricing) || selectedVendor.proposal.totalAmount || 0)}
                    </p>
                    {/* Show indicator if amount was negotiated */}
                    {calculateLatestNegotiatedTotal(selectedVendor.proposalIndex, selectedVendor.proposal.boqPricing) !== selectedVendor.proposal.totalAmount && (
                      <p className="text-xs text-blue-600 font-medium mt-1">
                        (Negotiated from {formatCurrency(selectedVendor.proposal.totalAmount || 0)})
                      </p>
                    )}
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
      case 'boq':
        return renderBOQTab();
      case 'proposals':
        return renderProposalsTab();
      default:
        return renderOverviewTab();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
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
                    className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon size={16} />
                    {tab.label}
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
