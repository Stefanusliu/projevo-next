'use client';

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
  FiEdit,
  FiEye,
  FiCheck,
  FiX,
  FiMessageSquare,
  FiChevronDown,
  FiChevronUp
} from 'react-icons/fi';
import { useAuth } from '../../../../contexts/AuthContext';
import { firestoreService } from '../../../../hooks/useFirestore';
import { normalizeProposals } from '../../../../utils/proposalsUtils';
import BOQDisplay from '../../../components/BOQDisplay';

export default function ProjectDetailPage({ project, onBack, onCreateProposal }) {
  const { user } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');
  const [negotiations, setNegotiations] = useState({});
  const [counterOffers, setCounterOffers] = useState({});
  const [loading, setLoading] = useState(true);
  const [isNegotiating, setIsNegotiating] = useState(false);
  const [tempCounterOffers, setTempCounterOffers] = useState({});
  const [pendingCounterOffer, setPendingCounterOffer] = useState(false); // Track if vendor has submitted an offer awaiting response
  const [showFullPageBOQ, setShowFullPageBOQ] = useState(false);

  const tabs = [
    { id: 'overview', label: 'Overview', icon: FiEye },
    { id: 'boq', label: 'BOQ', icon: FiFileText },
    { id: 'proposal', label: 'My Proposal', icon: FiUser },
  ];

  // Helper function to get negotiation status for vendor
  const getVendorNegotiationStatus = () => {
    const proposalIndex = getVendorProposalIndex();
    if (proposalIndex === -1) return null;
    
    const vendorProposal = project.proposals[proposalIndex];
    const negotiationData = vendorProposal?.negotiation;
    
    return {
      proposalIndex,
      negotiationData,
      status: negotiationData?.status || vendorProposal?.status || 'pending',
      canVendorAct: negotiationData?.status === 'pending_vendor_response' || negotiationData?.status === 'negotiating',
      isWaitingForOwner: negotiationData?.status === 'pending_owner_response'
    };
  };

  // Find this vendor's proposal index
  const getVendorProposalIndex = () => {
    // Normalize proposals to handle both array and object formats
    const normalizedProposals = normalizeProposals(project?.proposals);
    
    if (!normalizedProposals || !user?.uid) {
      console.log('🔍 No proposals or user ID found:', { 
        hasProposals: !!normalizedProposals, 
        userUid: user?.uid,
        projectId: project?.id 
      });
      return -1;
    }
    
    console.log('🔍 Searching for vendor proposal:', {
      userUid: user.uid,
      totalProposals: normalizedProposals.length,
      proposals: normalizedProposals.map((p, index) => ({
        index,
        vendorId: p.vendorId,
        userId: p.userId,
        submittedBy: p.submittedBy,
        status: p.status,
        isResubmission: p.isResubmission
      }))
    });
    
    const proposalIndex = normalizedProposals.findIndex(proposal => 
      proposal.vendorId === user.uid || 
      proposal.userId === user.uid || 
      proposal.submittedBy === user.uid
    );
    
    console.log('🔍 Vendor proposal index found:', proposalIndex);
    
    return proposalIndex;
  };

  // Load negotiations and counter offers for this vendor
  useEffect(() => {
    const loadNegotiationData = async () => {
      // Normalize proposals to handle both array and object formats
      const normalizedProposals = normalizeProposals(project?.proposals);
      
      if (!normalizedProposals || !user?.uid) {
        setLoading(false);
        return;
      }

      try {
        const negotiationsMap = {};
        const counterOffersMap = {};
        
        // Find this vendor's proposal
        const proposalIndex = getVendorProposalIndex();
        
        if (proposalIndex >= 0) {
          const vendorProposal = normalizedProposals[proposalIndex];
          
          // Check if this proposal has negotiation data
          if (vendorProposal.negotiation) {
            const negotiationData = vendorProposal.negotiation;
            
            // Store negotiation data
            negotiationsMap[proposalIndex] = {
              status: negotiationData.status,
              history: negotiationData.history || [],
              counterOffer: negotiationData.counterOffer || null
            };
            
            // Extract counter offer data if available
            if (negotiationData.counterOffer) {
              Object.keys(negotiationData.counterOffer).forEach(itemIndex => {
                const key = `${proposalIndex}_${itemIndex}`;
                counterOffersMap[key] = negotiationData.counterOffer[itemIndex];
              });
            }
          }
        }
        
        setNegotiations(negotiationsMap);
        setCounterOffers(counterOffersMap);
        
        // Check negotiation status for this vendor
        const vendorNegotiation = negotiationsMap[proposalIndex];
        
        if (vendorNegotiation?.status === 'pending_owner_response') {
          // Vendor sent offer, waiting for project owner response
          setPendingCounterOffer(true);
        } else if (vendorNegotiation?.status === 'pending_vendor_response') {
          // Project owner responded, vendor can take action
          setPendingCounterOffer(false);
        } else {
          // No negotiation in progress or other status
          setPendingCounterOffer(false);
        }
        
      } catch (error) {
        console.error('❌ Error loading negotiation data for vendor:', error);
      } finally {
        setLoading(false);
      }
    };

    loadNegotiationData();
  }, [project?.proposals, user?.uid, activeTab]);

  // Handle counter offer functions
  const startNegotiation = () => {
    if (pendingCounterOffer) {
      alert('You have already submitted a counter offer. Please wait for the project owner to respond.');
      return;
    }
    
    setIsNegotiating(true);
    // Initialize temp counter offers with current prices
    const proposalIndex = getVendorProposalIndex();
    const normalizedProposals = normalizeProposals(project?.proposals);
    const vendorProposal = proposalIndex >= 0 ? normalizedProposals[proposalIndex] : null;
    
    if (vendorProposal?.boqPricing) {
      const initialOffers = {};
      vendorProposal.boqPricing.forEach((item, index) => {
        const counterOfferKey = `${proposalIndex}_${index}`;
        const existingOffer = counterOffers[counterOfferKey];
        
        // Use existing negotiated price or original vendor price
        const currentPrice = existingOffer?.vendorPrice !== undefined 
          ? parseFloat(existingOffer.vendorPrice)
          : parseFloat(item.vendorPrice || item.price || 0);
        
        initialOffers[index] = {
          vendorPrice: currentPrice
        };
      });
      setTempCounterOffers(initialOffers);
    }
  };

  const cancelNegotiation = () => {
    setIsNegotiating(false);
    setTempCounterOffers({});
  };

  const updateTempCounterOffer = (itemIndex, field, value) => {
    setTempCounterOffers(prev => ({
      ...prev,
      [itemIndex]: {
        ...prev[itemIndex],
        [field]: value
      }
    }));
  };

  const submitCounterOffer = async () => {
    const proposalIndex = getVendorProposalIndex();
    if (proposalIndex === -1) {
      alert('Proposal not found');
      return;
    }

    try {
      // Prepare counter offer data
      const counterOfferData = {};
      Object.keys(tempCounterOffers).forEach(itemIndex => {
        counterOfferData[itemIndex] = {
          vendorPrice: parseFloat(tempCounterOffers[itemIndex].vendorPrice),
          timestamp: new Date()
        };
      });

      // Prepare the new history entry
      const newHistoryEntry = {
        action: 'counter_offer_sent',
        by: 'vendor',
        vendorId: user.uid,
        vendorName: user.displayName || user.email?.split('@')[0] || 'Unknown Vendor',
        timestamp: new Date(),
        message: 'Vendor sent counter offer',
        data: counterOfferData
      };

      // Get current proposal negotiation data
      const normalizedProposals = normalizeProposals(project?.proposals);
      const currentProposal = normalizedProposals[proposalIndex];
      const existingNegotiation = currentProposal.negotiation || { history: [] };

      // Update negotiation data
      const updatedNegotiation = {
        status: 'pending_owner_response',
        negotiationStatus: 'vendor_counter_offer', // Clear status indicator
        lastActionBy: 'vendor',
        lastActionAt: new Date(),
        vendorInfo: {
          vendorId: user.uid,
          vendorName: userProfile?.accountType === 'perusahaan' 
            ? (userProfile?.company || user.displayName || user.email?.split('@')[0] || 'Unknown Vendor')
            : (user.displayName || user.email?.split('@')[0] || 'Unknown Vendor'),
          vendorEmail: user.email,
          vendorPhone: userProfile?.phone || '',
          vendorFirstName: userProfile?.firstName || '',
          vendorLastName: userProfile?.lastName || '',
          vendorCompany: userProfile?.company || '',
          vendorAccountType: userProfile?.accountType || 'individu',
          vendorCity: userProfile?.city || '',
          vendorProvince: userProfile?.province || ''
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
      const currentProposals = normalizeProposals(project?.proposals);
      const updatedProposals = [...currentProposals];
      updatedProposals[proposalIndex] = {
        ...updatedProposals[proposalIndex],
        negotiation: updatedNegotiation
      };

      await firestoreService.update('projects', project.id, {
        proposals: updatedProposals,
        updatedAt: new Date()
      });
      
      
      // Update local negotiations state
      setNegotiations(prev => ({
        ...prev,
        [proposalIndex]: updatedNegotiation
      }));

      // Update local counter offers state (for immediate UI feedback)
      const newCounterOffers = { ...counterOffers };
      Object.keys(counterOfferData).forEach(itemIndex => {
        const key = `${proposalIndex}_${itemIndex}`;
        newCounterOffers[key] = counterOfferData[itemIndex];
      });
      setCounterOffers(newCounterOffers);

      // Reset negotiation state and set pending counter offer
      setIsNegotiating(false);
      setTempCounterOffers({});
      setPendingCounterOffer(true); // Vendor cannot make another offer until project owner responds
      
      alert('Counter offer submitted successfully! Please wait for the project owner to respond.');
    } catch (error) {
      console.error('❌ Error submitting counter offer:', error);
      alert('Error submitting counter offer. Please try again.');
    }
  };

  // Handle vendor accepting the negotiation terms
  const handleAcceptNegotiation = async () => {
    try {
      console.log('🔄 Vendor accepting negotiation terms...');
      
      const proposalIndex = getVendorProposalIndex();
      if (proposalIndex === -1) {
        throw new Error('Vendor proposal not found');
      }

      const now = new Date();
      const currentProposal = project.proposals[proposalIndex];
      const existingNegotiation = currentProposal?.negotiation || { history: [] };

      // Create negotiation data for acceptance
      const updatedNegotiation = {
        status: 'accepted',
        acceptedAt: now,
        acceptedBy: 'vendor',
        lastActionBy: 'vendor',
        lastActionAt: now,
        vendorInfo: {
          vendorId: user.uid,
          vendorName: userProfile?.accountType === 'perusahaan' 
            ? (userProfile?.company || user.displayName || currentProposal?.vendorName || 'Vendor')
            : (user.displayName || currentProposal?.vendorName || 'Vendor'),
          vendorEmail: user.email,
          vendorPhone: userProfile?.phone || '',
          vendorFirstName: userProfile?.firstName || '',
          vendorLastName: userProfile?.lastName || '',
          vendorCompany: userProfile?.company || '',
          vendorAccountType: userProfile?.accountType || 'individu',
          vendorCity: userProfile?.city || '',
          vendorProvince: userProfile?.province || ''
        },
        ownerInfo: existingNegotiation.ownerInfo || {
          ownerId: project.ownerId,
          ownerName: project.ownerName || project.client || 'Project Owner'
        },
        counterOffer: existingNegotiation.counterOffer,
        history: [
          ...(existingNegotiation.history || []),
          {
            action: 'accepted',
            by: 'vendor',
            vendorId: user.uid,
            vendorName: user.displayName || currentProposal?.vendorName || 'Vendor',
            timestamp: now,
            message: 'Negotiation terms accepted by vendor'
          }
        ],
        updatedAt: now
      };

      // Update the project proposals
      const normalizedProposals = normalizeProposals(project.proposals);
      const updatedProposals = [...normalizedProposals];
      updatedProposals[proposalIndex] = {
        ...updatedProposals[proposalIndex],
        negotiation: updatedNegotiation,
        status: 'accepted',
        acceptedAt: now,
        acceptedBy: user.uid,
        updatedAt: now
      };

      console.log('📤 Updating project with vendor acceptance:', {
        projectId: project.id,
        proposalIndex,
        vendorId: user.uid
      });

      await firestoreService.update('projects', project.id, {
        proposals: updatedProposals,
        updatedAt: now
      });

      // Update local state
      setNegotiations(prev => ({
        ...prev,
        [proposalIndex]: updatedNegotiation
      }));

      setPendingCounterOffer(false);
      setIsNegotiating(false);

      console.log('✅ Vendor acceptance saved successfully');
      alert('Successfully accepted the negotiation terms!');

    } catch (error) {
      console.error('❌ Error accepting negotiation terms:', error);
      alert(`Failed to accept terms: ${error.message}`);
    }
  };

  // Handle vendor declining/rejecting the negotiation terms
  const handleDeclineNegotiation = async () => {
    try {
      console.log('🔄 Vendor declining negotiation terms...');
      
      const proposalIndex = getVendorProposalIndex();
      if (proposalIndex === -1) {
        throw new Error('Vendor proposal not found');
      }

      const now = new Date();
      const currentProposal = project.proposals[proposalIndex];
      const existingNegotiation = currentProposal?.negotiation || { history: [] };

      // Create negotiation data for rejection
      const updatedNegotiation = {
        status: 'rejected',
        rejectedAt: now,
        rejectedBy: 'vendor',
        lastActionBy: 'vendor',
        lastActionAt: now,
        vendorInfo: {
          vendorId: user.uid,
          vendorName: userProfile?.accountType === 'perusahaan' 
            ? (userProfile?.company || user.displayName || currentProposal?.vendorName || 'Vendor')
            : (user.displayName || currentProposal?.vendorName || 'Vendor'),
          vendorEmail: user.email,
          vendorPhone: userProfile?.phone || '',
          vendorFirstName: userProfile?.firstName || '',
          vendorLastName: userProfile?.lastName || '',
          vendorCompany: userProfile?.company || '',
          vendorAccountType: userProfile?.accountType || 'individu',
          vendorCity: userProfile?.city || '',
          vendorProvince: userProfile?.province || ''
        },
        ownerInfo: existingNegotiation.ownerInfo || {
          ownerId: project.ownerId,
          ownerName: project.ownerName || project.client || 'Project Owner'
        },
        counterOffer: existingNegotiation.counterOffer,
        history: [
          ...(existingNegotiation.history || []),
          {
            action: 'rejected',
            by: 'vendor',
            vendorId: user.uid,
            vendorName: user.displayName || currentProposal?.vendorName || 'Vendor',
            timestamp: now,
            message: 'Negotiation terms declined by vendor'
          }
        ],
        updatedAt: now
      };

      // Update the project proposals
      const normalizedProposals = normalizeProposals(project.proposals);
      const updatedProposals = [...normalizedProposals];
      updatedProposals[proposalIndex] = {
        ...updatedProposals[proposalIndex],
        negotiation: updatedNegotiation,
        status: 'rejected',
        rejectedAt: now,
        rejectedBy: user.uid,
        updatedAt: now
      };

      console.log('📤 Updating project with vendor rejection:', {
        projectId: project.id,
        proposalIndex,
        vendorId: user.uid
      });

      await firestoreService.update('projects', project.id, {
        proposals: updatedProposals,
        updatedAt: now
      });

      // Update local state
      setNegotiations(prev => ({
        ...prev,
        [proposalIndex]: updatedNegotiation
      }));

      setPendingCounterOffer(false);
      setIsNegotiating(false);

      console.log('✅ Vendor rejection saved successfully');
      alert('Successfully declined the negotiation terms.');

    } catch (error) {
      console.error('❌ Error declining negotiation terms:', error);
      alert(`Failed to decline terms: ${error.message}`);
    }
  };

  // Handle vendor resubmitting proposal with new BOQ
  const handleResubmitProposal = () => {
    try {
      console.log('🔄 Starting proposal resubmission process...');
      
      const proposalIndex = getVendorProposalIndex();
      if (proposalIndex === -1) {
        throw new Error('Vendor proposal not found');
      }

      const currentProposal = project.proposals[proposalIndex];
      const negotiationData = currentProposal?.negotiation;
      
      // Prepare BOQ resubmission data for BOQ maker
      const boqResubmissionData = {
        mode: 'resubmission',
        isResubmission: true,
        projectId: project.id,
        projectTitle: project.projectTitle,
        vendorId: user.uid,
        vendorName: user.displayName || user.email,
        proposalIndex: proposalIndex,
        existingProposal: currentProposal,
        originalBOQPricing: currentProposal.boqPricing || [],
        negotiationDetails: negotiationData || {},
        negotiationNotes: negotiationData?.notes || '',
        negotiationRequirements: negotiationData?.requirements || '',
        ownerComments: negotiationData?.ownerComments || '',
        deadline: negotiationData?.deadline || null,
        requestedChanges: negotiationData?.requestedChanges || []
      };
      
      // Store resubmission data in localStorage with a session key
      const sessionKey = `boq_resubmission_${project.id}_${user.uid}_${Date.now()}`;
      try {
        localStorage.setItem(sessionKey, JSON.stringify(boqResubmissionData));
        console.log('✅ BOQ resubmission data stored in localStorage with key:', sessionKey);
        
        // Navigate to BOQ maker page with resubmission parameters
        const queryParams = new URLSearchParams({
          mode: 'resubmission',
          sessionKey: sessionKey,
          projectTitle: project.projectTitle || 'Project Resubmission',
          vendorName: user.displayName || user.email || 'Vendor',
          proposalIndex: proposalIndex.toString()
        });
        
        console.log('🚀 Navigating to BOQ maker for proposal resubmission');
        router.push(`/boq-maker?${queryParams.toString()}`);
        
      } catch (storageError) {
        console.error('❌ Failed to store resubmission data in localStorage:', storageError);
        alert('Unable to open BOQ editor for resubmission. Please try again.');
      }

      console.log('✅ Opening BOQ maker for proposal resubmission');
    } catch (error) {
      console.error('❌ Error opening proposal resubmission:', error);
      alert(`Failed to open proposal resubmission: ${error.message}`);
    }
  };

  // Utility functions
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
      case 'negotiate':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
      case 'submitted':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  // Calculate latest negotiated prices for BOQ display
  const calculateLatestNegotiatedPrices = (boqData) => {
    if (!boqData || !boqData.tahapanKerja) return boqData;
    
    const proposalIndex = getVendorProposalIndex();
    if (proposalIndex === -1) return boqData; // No proposal found
    
    // Create a deep copy of BOQ data
    const updatedBOQ = JSON.parse(JSON.stringify(boqData));
    
    // Update prices with negotiated values
    updatedBOQ.tahapanKerja.forEach((tahapan, tahapanIndex) => {
      if (tahapan.jenisKerja) {
        tahapan.jenisKerja.forEach((jenis, jenisIndex) => {
          if (jenis.uraianKerja) {
            jenis.uraianKerja.forEach((uraian, uraianIndex) => {
              if (uraian.items) {
                uraian.items.forEach((item, itemIndex) => {
                  // Calculate the flat item index for counter offers
                  const flatItemIndex = calculateFlatItemIndex(updatedBOQ.tahapanKerja, tahapanIndex, jenisIndex, uraianIndex, itemIndex);
                  const counterOfferKey = `${proposalIndex}_${flatItemIndex}`;
                  
                  // Check for negotiated price
                  const negotiationData = negotiations[proposalIndex];
                  const counterOffer = counterOffers[counterOfferKey];
                  
                  let negotiatedPrice = item.unitPrice; // Start with original price
                  
                  // Check for counter offer price
                  if (counterOffer?.vendorPrice !== undefined) {
                    negotiatedPrice = parseFloat(counterOffer.vendorPrice);
                  }
                  // Check for negotiated price in negotiation data
                  else if (negotiationData?.counterOffer && negotiationData.counterOffer[flatItemIndex]) {
                    negotiatedPrice = parseFloat(negotiationData.counterOffer[flatItemIndex].vendorPrice || item.unitPrice);
                  }
                  
                  // Update the item with negotiated price
                  if (negotiatedPrice !== item.unitPrice) {
                    item.negotiatedPrice = negotiatedPrice;
                    item.totalPrice = negotiatedPrice * (item.volume || 0);
                  }
                });
              }
            });
          }
        });
      }
    });
    
    return updatedBOQ;
  };

  // Helper function to calculate flat item index
  const calculateFlatItemIndex = (tahapanKerja, tahapanIndex, jenisIndex, uraianIndex, itemIndex) => {
    let flatIndex = 0;
    
    for (let t = 0; t < tahapanIndex; t++) {
      const tahapan = tahapanKerja[t];
      if (tahapan.jenisKerja) {
        for (let j = 0; j < tahapan.jenisKerja.length; j++) {
          const jenis = tahapan.jenisKerja[j];
          if (jenis.uraianKerja) {
            for (let u = 0; u < jenis.uraianKerja.length; u++) {
              const uraian = jenis.uraianKerja[u];
              if (uraian.items) {
                flatIndex += uraian.items.length;
              }
            }
          }
        }
      }
    }
    
    // Add items from current tahapan up to current jenis
    const currentTahapan = tahapanKerja[tahapanIndex];
    if (currentTahapan.jenisKerja) {
      for (let j = 0; j < jenisIndex; j++) {
        const jenis = currentTahapan.jenisKerja[j];
        if (jenis.uraianKerja) {
          for (let u = 0; u < jenis.uraianKerja.length; u++) {
            const uraian = jenis.uraianKerja[u];
            if (uraian.items) {
              flatIndex += uraian.items.length;
            }
          }
        }
      }
      
      // Add items from current jenis up to current uraian
      const currentJenis = currentTahapan.jenisKerja[jenisIndex];
      if (currentJenis.uraianKerja) {
        for (let u = 0; u < uraianIndex; u++) {
          const uraian = currentJenis.uraianKerja[u];
          if (uraian.items) {
            flatIndex += uraian.items.length;
          }
        }
        
        // Add the current item index
        flatIndex += itemIndex;
      }
    }
    
    return flatIndex;
  };
  
  if (!project) return null;

  // Enhanced project data with real data and fallbacks
  const enhancedProject = {
    ...project,
    projectTitle: project.name || project.title || 'Project Title Not Available',
    province: project.province || project.location?.province || 'Province Not Specified',
    city: project.city || project.location?.city || 'City Not Specified',
    fullAddress: project.address || project.fullAddress || 'Address Not Available',
    clientName: project.client || project.createdBy || 'Client Name Not Available',
    projectType: project.type || project.projectType || 'Type Not Specified',
    propertyType: project.propertyType || 'Property Type Not Specified',
    propertySize: project.propertySize || project.size || 'Size Not Specified',
    estimatedDuration: project.timeEstimation || project.duration || project.estimatedDuration || 'Duration Not Specified',
    estimatedStartDate: project.estimatedStartDate || project.startDate || 'Start Date Not Specified',
  };

  // Tab content renderers
  const renderOverviewTab = () => (
    <div className="space-y-6">
      {/* Project Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{enhancedProject.projectTitle}</h2>
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="px-3 py-1 text-sm font-medium rounded-full bg-blue-100 text-blue-800">
                {enhancedProject.projectType}
              </span>
              <span className="px-3 py-1 text-sm font-medium rounded-full bg-purple-100 text-purple-800">
                {enhancedProject.propertyType}
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
              <p className="font-bold text-gray-900">{project.budget || 'Not specified'}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <FiMapPin className="text-blue-600" size={20} />
            </div>
            <div>
              <p className="text-sm text-gray-500">Location</p>
              <p className="font-bold text-gray-900">{enhancedProject.city}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <FiCalendar className="text-purple-600" size={20} />
            </div>
            <div>
              <p className="text-sm text-gray-500">Start Date</p>
              <p className="font-bold text-gray-900">{formatDate(enhancedProject.estimatedStartDate)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <FiClock className="text-orange-600" size={20} />
            </div>
            <div>
              <p className="text-sm text-gray-500">Duration</p>
              <p className="font-bold text-gray-900">{enhancedProject.estimatedDuration}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Project Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Project Description */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Project Description</h3>
            <p className="text-gray-600 leading-relaxed">
              {project.description || 'No description available'}
            </p>
          </div>

          {/* Project Requirements */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Requirements</h3>
            <div className="space-y-3">
              {project.requirements && project.requirements.length > 0 ? (
                project.requirements.map((requirement, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-gray-600">{requirement}</span>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 italic">No specific requirements listed</p>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Client Information */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Client Information</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">
                    {enhancedProject.clientName.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">{enhancedProject.clientName}</p>
                  <p className="text-sm text-gray-500">Verified Client</p>
                </div>
              </div>
            </div>
          </div>

          {/* Competition Info */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Competition</h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Proposals Submitted</p>
                <p className="text-2xl font-bold text-gray-900">{project.proposals?.length || 0}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Your Match Score</p>
                <span className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                  {project.match || 0}% Match
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderBOQTab = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Loading negotiated prices...</span>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {/* Negotiation Status Info */}
        {Object.keys(negotiations).length > 0 && (
          <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
            <div className="flex items-start space-x-3">
              <FiMessageSquare className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <h5 className="font-medium text-blue-800 mb-1">Negotiated Pricing Available</h5>
                <p className="text-sm text-blue-700">
                  The BOQ below shows the latest negotiated prices from your discussions with the project owner.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* BOQ Actions */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Bill of Quantities (BOQ)</h3>
            <button
              onClick={() => setShowFullPageBOQ(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              View Full Screen BOQ
            </button>
          </div>
          
          {/* Preview BOQ with proper width handling */}
          <div className="w-full overflow-hidden">
            <BOQDisplay 
              project={{
                ...project,
                ...(project.attachedBOQ && {
                  attachedBOQ: calculateLatestNegotiatedPrices(project.attachedBOQ)
                }),
                ...(project.boq && {
                  boq: calculateLatestNegotiatedPrices(project.boq)
                }),
                ...(project.tahapanKerja && {
                  tahapanKerja: calculateLatestNegotiatedPrices({ tahapanKerja: project.tahapanKerja }).tahapanKerja
                })
              }} 
              isVendorView={true} 
              showNegotiatedPrices={Object.keys(negotiations).length > 0}
            />
          </div>
        </div>
      </div>
    );
  };

  const renderProposalTab = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Loading proposal status...</span>
        </div>
      );
    }

    const proposalIndex = getVendorProposalIndex();
    const normalizedProposals = normalizeProposals(project?.proposals);
    const vendorProposal = proposalIndex >= 0 ? normalizedProposals[proposalIndex] : null;
    const negotiationData = negotiations[proposalIndex];

    if (!vendorProposal) {
      return (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <div className="flex items-start space-x-3">
            <FiMessageSquare className="w-6 h-6 text-yellow-600 mt-1" />
            <div>
              <h3 className="text-lg font-semibold text-yellow-800 mb-2">No Proposal Submitted</h3>
              <p className="text-yellow-700 mb-4">
                You haven't submitted a proposal for this project yet. Click the button below to create your proposal.
              </p>
              <button
                onClick={() => onCreateProposal && onCreateProposal(project)}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Create Proposal
              </button>
            </div>
          </div>
        </div>
      );
    }

    const currentStatus = negotiationData?.status || vendorProposal.status || 'pending';

    // Calculate latest negotiated total
    const calculateLatestTotal = () => {
      if (!vendorProposal.boqPricing) return vendorProposal.totalAmount || 0;
      
      let total = 0;
      vendorProposal.boqPricing.forEach((item, index) => {
        const counterOfferKey = `${proposalIndex}_${index}`;
        const counterOffer = counterOffers[counterOfferKey];
        
        // Get the original vendor price from the proposal - check multiple field names
        const originalPrice = parseFloat(item.vendorPrice || item.price || item.pricePerPcs || item.unitPrice || 0);
        
        // Use temp negotiation price if in negotiation mode, otherwise use negotiated or original price
        let currentPrice;
        if (isNegotiating && tempCounterOffers[index]) {
          currentPrice = parseFloat(tempCounterOffers[index].vendorPrice || originalPrice);
        } else if (counterOffer?.vendorPrice !== undefined) {
          currentPrice = parseFloat(counterOffer.vendorPrice);
        } else {
          currentPrice = originalPrice;
        }
        
        const volume = item.volume || item.quantity || 0;
        total += currentPrice * volume;
        
        console.log(`💰 Total calculation item ${index}:`, {
          originalPrice,
          currentPrice,
          volume,
          itemTotal: currentPrice * volume,
          runningTotal: total
        });
      });
      
      console.log(`💰 Final calculated total: ${total}`);
      return total;
    };

    const latestTotal = calculateLatestTotal();
    const originalTotal = vendorProposal.totalAmount || 0;
    const hasNegotiatedPrices = Object.keys(counterOffers).some(key => key.startsWith(`${proposalIndex}_`));

    return (
      <div className="space-y-6">
        {/* Pending Counter Offer Notice */}
        {pendingCounterOffer && !isNegotiating && (
          <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
            <div className="flex items-start space-x-3">
              <FiMessageSquare className="w-5 h-5 text-yellow-600 mt-0.5" />
              <div>
                <h5 className="font-medium text-yellow-800 mb-1">Counter Offer Submitted</h5>
                <p className="text-sm text-yellow-700">
                  Your counter offer has been submitted and is awaiting the project owner's response. You cannot submit another counter offer until they respond.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Proposal Status Header */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">My Proposal Status</h2>
              <div className="flex items-center gap-3">
                <span className={`px-3 py-1 text-sm font-medium rounded-full ${getProposalStatusColor(currentStatus)}`}>
                  {currentStatus.charAt(0).toUpperCase() + currentStatus.slice(1)}
                </span>
                <span className="text-gray-500">
                  Submitted {vendorProposal.submittedAt ? 
                    new Date(vendorProposal.submittedAt).toLocaleDateString('id-ID', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    }) : 'recently'
                  }
                </span>
              </div>
            </div>
            
            {/* Latest Proposal Amount */}
            <div className="text-right">
              <p className="text-sm text-gray-500 mb-1">
                {isNegotiating ? 'Negotiating Amount' : hasNegotiatedPrices ? 'Latest Negotiated Amount' : 'Proposal Amount'}
              </p>
              <p className={`text-2xl font-bold ${isNegotiating ? 'text-gray-900' : 'text-blue-600'}`}>
                {formatCurrency(latestTotal)}
              </p>
              {hasNegotiatedPrices && originalTotal !== latestTotal && !isNegotiating && (
                <p className="text-sm text-gray-500">
                  Original: {formatCurrency(originalTotal)}
                </p>
              )}
              {isNegotiating && (
                <p className="text-xs text-gray-600 mt-1">
                  Making counter offer...
                </p>
              )}
            </div>
          </div>

          {/* Proposal Summary Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-500 mb-1">BOQ Items</p>
              <p className="font-semibold text-gray-900">
                {vendorProposal.boqPricing?.length || 0} items
              </p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-500 mb-1">Original Amount</p>
              <p className="font-semibold text-gray-900">
                {formatCurrency(originalTotal)}
              </p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-500 mb-1">Proposal Type</p>
              <p className="font-semibold text-gray-900">
                {vendorProposal.negotiable === 'negotiable' ? 'Negotiable' : 'Fixed Price'}
              </p>
            </div>
          </div>

          {/* Vendor Message */}
          {vendorProposal.message && (
            <div className="bg-blue-50 p-4 rounded-lg mb-6">
              <h4 className="text-sm font-medium text-gray-900 mb-2">Your Message to Client:</h4>
              <p className="text-sm text-gray-700">{vendorProposal.message}</p>
            </div>
          )}
        </div>

        {/* Negotiation History */}
        {negotiationData?.history && negotiationData.history.length > 0 && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Negotiation History</h3>
            <div className="space-y-4">
              {negotiationData.history.map((entry, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-1">
                      <p className="font-medium text-gray-900">
                        {entry.action === 'counter_offer_sent' && entry.by === 'project_owner' 
                          ? 'Client sent counter offer'
                          : entry.action === 'counter_offer_sent' && entry.by === 'vendor'
                          ? 'You sent counter offer'
                          : entry.message || entry.action
                        }
                      </p>
                      <span className="text-sm text-gray-500">
                        {entry.timestamp?.toDate ? 
                          entry.timestamp.toDate().toLocaleDateString('id-ID') :
                          new Date(entry.timestamp).toLocaleDateString('id-ID')
                        }
                      </span>
                    </div>
                    {entry.message && (
                      <p className="text-sm text-gray-600">{entry.message}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* BOQ with Negotiated Prices */}
        {vendorProposal.boqPricing && vendorProposal.boqPricing.length > 0 && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">BOQ Items & Pricing</h3>
              {isNegotiating && (
                <div className="flex space-x-2">
                  <button
                    onClick={submitCounterOffer}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors text-sm"
                  >
                    Submit Counter Offer
                  </button>
                  <button
                    onClick={cancelNegotiation}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg font-medium hover:bg-gray-700 transition-colors text-sm"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
            
            {hasNegotiatedPrices && !isNegotiating && (
              <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg mb-4">
                <div className="flex items-start space-x-3">
                  <FiMessageSquare className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <h5 className="font-medium text-blue-800 mb-1">Negotiated Pricing</h5>
                    <p className="text-sm text-blue-700">
                      Some items have been negotiated. Updated prices are shown below.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {isNegotiating && (
              <div className="bg-white border border-gray-300 p-4 rounded-lg mb-4">
                <div className="flex items-start space-x-3">
                  <FiEdit3 className="w-5 h-5 text-gray-600 mt-0.5" />
                  <div>
                    <h5 className="font-medium text-gray-900 mb-1">Counter Offer Mode</h5>
                    <p className="text-sm text-gray-700">
                      Edit the unit prices below to submit your counter offer.
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Item
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Unit
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Volume
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Unit Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {vendorProposal.boqPricing.map((item, index) => {
                    const counterOfferKey = `${proposalIndex}_${index}`;
                    const counterOffer = counterOffers[counterOfferKey];
                    
                    // Get the original vendor price from the proposal
                    const originalPrice = parseFloat(item.vendorPrice || item.price || item.pricePerPcs || item.unitPrice || 0);
                    
                    console.log(`💰 BOQ Item ${index} price data:`, {
                      vendorPrice: item.vendorPrice,
                      price: item.price,
                      pricePerPcs: item.pricePerPcs,
                      unitPrice: item.unitPrice,
                      calculatedOriginalPrice: originalPrice,
                      itemDescription: item.description || item.itemName,
                      volume: item.volume
                    });
                    
                    // Check if there's a negotiated price
                    const hasNegotiation = counterOffer?.vendorPrice !== undefined;
                    
                    // Get current price (negotiating temp value, existing negotiated, or original)
                    let currentPrice;
                    if (isNegotiating && tempCounterOffers[index]) {
                      currentPrice = parseFloat(tempCounterOffers[index].vendorPrice || 0);
                    } else if (hasNegotiation) {
                      currentPrice = parseFloat(counterOffer.vendorPrice);
                    } else {
                      currentPrice = originalPrice;
                    }
                    
                    return (
                      <tr key={index} className={hasNegotiation && !isNegotiating ? 'bg-blue-50' : ''}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {item.description || item.itemName || `Item ${index + 1}`}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {item.unit || item.satuan || 'unit'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {item.volume || item.quantity || 0}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {isNegotiating ? (
                            <div className="space-y-1">
                              <input
                                type="number"
                                step="any"
                                value={tempCounterOffers[index]?.vendorPrice || currentPrice}
                                onChange={(e) => updateTempCounterOffer(index, 'vendorPrice', e.target.value)}
                                className="w-32 px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
                                placeholder="Enter price"
                              />
                              {originalPrice !== currentPrice && (
                                <div className="text-xs text-gray-500">
                                  Original: {formatCurrency(originalPrice)}
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="text-sm">
                              <span className={`font-medium ${hasNegotiation ? 'text-blue-600' : 'text-gray-900'}`}>
                                {formatCurrency(currentPrice)}
                              </span>
                              {hasNegotiation && originalPrice !== currentPrice && (
                                <div className="text-xs text-gray-500 line-through">
                                  {formatCurrency(originalPrice)}
                                </div>
                              )}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`text-sm font-medium ${hasNegotiation && !isNegotiating ? 'text-blue-600' : 'text-gray-900'}`}>
                            {formatCurrency(currentPrice * (item.volume || item.quantity || 0))}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              
              {/* Total Row */}
              <div className="mt-4 flex justify-end">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-right">
                    <p className="text-sm text-gray-500 mb-1">
                      {isNegotiating ? 'New Total Amount' : hasNegotiatedPrices ? 'Current Total' : 'Total Amount'}
                    </p>
                    <p className={`text-xl font-bold ${isNegotiating ? 'text-gray-900' : hasNegotiatedPrices ? 'text-blue-600' : 'text-gray-900'}`}>
                      {(() => {
                        let total = 0;
                        vendorProposal.boqPricing.forEach((item, index) => {
                          let price;
                          if (isNegotiating && tempCounterOffers[index]) {
                            price = parseFloat(tempCounterOffers[index].vendorPrice || 0);
                          } else {
                            const counterOfferKey = `${proposalIndex}_${index}`;
                            const counterOffer = counterOffers[counterOfferKey];
                            price = counterOffer?.vendorPrice !== undefined 
                              ? parseFloat(counterOffer.vendorPrice)
                              : parseFloat(item.vendorPrice || item.price || 0);
                          }
                          total += price * (item.volume || 0);
                        });
                        return formatCurrency(total);
                      })()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        {(currentStatus === 'negotiating' || currentStatus === 'pending_vendor_response') && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              {currentStatus === 'negotiating' ? 'Negotiation Request' : 'Negotiation Actions'}
            </h3>
            
            {/* When project owner initiated negotiation - show Resubmit and Decline */}
            {currentStatus === 'negotiating' ? (
              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <FiMessageSquare className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                      <h5 className="font-medium text-blue-800 mb-1">Project Owner Requests Negotiation</h5>
                      <p className="text-sm text-blue-700">
                        The project owner would like to negotiate terms. You can resubmit your proposal with updated pricing or decline the negotiation.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="flex space-x-3">
                  <button
                    onClick={() => {
                      console.log('🔘 Resubmit button clicked (vendor)');
                      handleResubmitProposal();
                    }}
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-medium hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  >
                    <FiEdit className="inline mr-2" />
                    Resubmit Proposal
                  </button>
                  <button
                    onClick={() => {
                      console.log('🔘 Decline negotiation button clicked (vendor)');
                      handleDeclineNegotiation();
                    }}
                    className="px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg font-medium hover:from-red-700 hover:to-red-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  >
                    <FiX className="inline mr-2" />
                    Decline
                  </button>
                </div>
              </div>
            ) : vendorProposal.status !== 'negotiating' ? (
              /* Original negotiation buttons for other statuses (hidden when negotiating) */
              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    console.log('🔘 Accept Terms button clicked (vendor)');
                    handleAcceptNegotiation();
                  }}
                  disabled={pendingCounterOffer}
                  className={`px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg font-medium hover:from-green-700 hover:to-green-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 ${pendingCounterOffer ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <FiCheck className="inline mr-2" />
                  Accept Terms
                </button>
                <button
                  onClick={() => {
                    if (isNegotiating) {
                      submitCounterOffer();
                    } else {
                      startNegotiation();
                    }
                  }}
                  disabled={pendingCounterOffer && !isNegotiating}
                  className={`px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-medium hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 ${pendingCounterOffer && !isNegotiating ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <FiMessageSquare className="inline mr-2" />
                  {isNegotiating ? 'Submit Counter Offer' : pendingCounterOffer ? 'Awaiting Response' : 'Counter Offer'}
                </button>
                <button
                  onClick={() => {
                    // TODO: Implement reject negotiation
                    console.log('Reject negotiation terms');
                  }}
                  disabled={pendingCounterOffer}
                  className={`px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg font-medium hover:from-red-700 hover:to-red-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 ${pendingCounterOffer ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <FiX className="inline mr-2" />
                  Decline Terms
                </button>
              </div>
            ) : null}
          </div>
        )}
      </div>
    );
  };

  const renderFullPageBOQ = () => {
    return (
      <div className="fixed inset-0 z-50 bg-gray-50 overflow-hidden">
        {/* Full Page BOQ Header */}
        <div className="bg-white border-b border-gray-200 shadow-sm">
          <div className="w-full px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <button
                onClick={() => setShowFullPageBOQ(false)}
                className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <FiArrowLeft size={20} />
                <span className="font-medium">Back to Project</span>
              </button>
              
              <div className="text-center flex-1">
                <h1 className="text-xl font-bold text-gray-900">
                  {enhancedProject.projectTitle} - Bill of Quantities
                </h1>
                <p className="text-sm text-gray-500">
                  Detailed BOQ View • Full Screen {Object.keys(negotiations).length > 0 ? '• Latest Negotiated Prices' : ''}
                </p>
              </div>

              <div className="text-sm text-gray-500">
                Vendor Dashboard
              </div>
            </div>
          </div>
        </div>

        {/* Full Page BOQ Content */}
        <div className="h-[calc(100vh-4rem)] overflow-auto">
          <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
            {/* Negotiation Status Info */}
            {Object.keys(negotiations).length > 0 && (
              <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg mb-6">
                <div className="flex items-start space-x-3">
                  <FiMessageSquare className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <h5 className="font-medium text-blue-800 mb-1">Negotiated Pricing Available</h5>
                    <p className="text-sm text-blue-700">
                      This BOQ shows the latest negotiated prices from your discussions with the project owner. 
                      Items with negotiated prices are highlighted with the latest agreed amounts.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
              <BOQDisplay 
                project={{
                  ...project,
                  ...(project.attachedBOQ && {
                    attachedBOQ: calculateLatestNegotiatedPrices(project.attachedBOQ)
                  }),
                  ...(project.boq && {
                    boq: calculateLatestNegotiatedPrices(project.boq)
                  }),
                  ...(project.tahapanKerja && {
                    tahapanKerja: calculateLatestNegotiatedPrices({ tahapanKerja: project.tahapanKerja }).tahapanKerja
                  })
                }} 
                isVendorView={true} 
                showNegotiatedPrices={Object.keys(negotiations).length > 0}
              />
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverviewTab();
      case 'boq':
        return renderBOQTab();
      case 'proposal':
        return renderProposalTab();
      default:
        return renderOverviewTab();
    }
  };

  // Show full page BOQ if enabled
  if (showFullPageBOQ) {
    return renderFullPageBOQ();
  }

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
            
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-500">
                Vendor Dashboard
              </div>
              {(() => {
                const proposalIndex = getVendorProposalIndex();
                const vendorProposal = proposalIndex >= 0 ? project.proposals[proposalIndex] : null;
                const negotiationData = negotiations[proposalIndex];
                const currentStatus = negotiationData?.status || vendorProposal?.status || 'pending';
                
                // Debug logging for vendor status
                console.log(`📋 Vendor Status Check:`, {
                  proposalIndex,
                  hasVendorProposal: !!vendorProposal,
                  currentStatus,
                  hasNegotiationData: !!negotiationData,
                  isNegotiating,
                  pendingCounterOffer,
                  originalProposalStatus: vendorProposal?.status
                });
                
                // If vendor proposal status is 'negotiating', show new Resubmit/Decline buttons
                if (vendorProposal?.status === 'negotiating') {
                  return (
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          console.log('🔘 Resubmit button clicked (vendor - mobile)');
                          handleResubmitProposal();
                        }}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors text-sm"
                      >
                        <FiEdit className="inline mr-1" />
                        Resubmit
                      </button>
                      <button
                        onClick={() => {
                          console.log('🔘 Decline negotiation button clicked (vendor - mobile)');
                          handleDeclineNegotiation();
                        }}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors text-sm"
                      >
                        <FiX className="inline mr-1" />
                        Decline
                      </button>
                    </div>
                  );
                }
                
                // If negotiating or waiting for vendor response (but not status=negotiating), show Accept/Reject/Negotiate buttons
                if ((currentStatus === 'negotiating' || currentStatus === 'pending_vendor_response') && vendorProposal?.status !== 'negotiating') {
                  return (
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          console.log('🔘 Accept Terms button clicked (vendor - small)');
                          handleAcceptNegotiation();
                        }}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors text-sm"
                      >
                        Accept Terms
                      </button>
                      <button
                        onClick={() => {
                          if (isNegotiating) {
                            submitCounterOffer();
                          } else {
                            startNegotiation();
                          }
                        }}
                        disabled={pendingCounterOffer && !isNegotiating}
                        className={`px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors text-sm ${pendingCounterOffer && !isNegotiating ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        {isNegotiating ? 'Submit Counter Offer' : pendingCounterOffer ? 'Awaiting Response' : 'Counter Offer'}
                      </button>
                      <button
                        onClick={() => {
                          console.log('🔘 Decline button clicked (vendor)');
                          handleDeclineNegotiation();
                        }}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors text-sm"
                      >
                        Decline
                      </button>
                    </div>
                  );
                }
                
                // Otherwise show Create Proposal button (if no proposal exists)
                if (!vendorProposal) {
                  return (
                    <button
                      onClick={() => onCreateProposal(project)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                    >
                      Create Proposal
                    </button>
                  );
                }
                
                // If proposal exists but not negotiating, show status badge
                return (
                  <div className="flex items-center space-x-2">
                    <span className={`px-3 py-1 text-sm font-medium rounded-full ${getProposalStatusColor(currentStatus)}`}>
                      {currentStatus.charAt(0).toUpperCase() + currentStatus.slice(1)}
                    </span>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
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

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderTabContent()}
      </div>
    </div>
  );
}
               