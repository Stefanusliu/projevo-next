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
  FiChevronUp,
  FiCamera,
  FiInfo
} from 'react-icons/fi';
import { useAuth } from '../../../../contexts/AuthContext';
import { firestoreService } from '../../../../hooks/useFirestore';
import { useStorage } from '../../../../hooks/useStorage';
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
  
  // Documentation upload states
  const [documentationImages, setDocumentationImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const { uploadFile, progress } = useStorage();

  // Check if this vendor has been accepted
  const hasAcceptedProposal = () => {
    const normalizedProposals = normalizeProposals(project?.proposals);
    if (!normalizedProposals || !user?.uid) {
      return false;
    }
    
    const isAccepted = normalizedProposals.some(proposal => 
      (proposal.vendorId === user.uid || proposal.userId === user.uid || proposal.submittedBy === user.uid) &&
      (proposal.status === 'accepted' || 
       proposal.negotiation?.status === 'accepted' ||
       project.selectedVendorId === user.uid ||
       project.status === 'Awarded' ||
       project.negotiationAccepted)
    );
    
    return isAccepted;
  };

  // Check if project is actually in progress (not just negotiating)
  const isProjectInProgress = () => {
    return hasAcceptedProposal() && 
           (project.status === 'In Progress' || 
            project.status === 'Active' || 
            project.status === 'Started' ||
            project.workStarted === true);
  };

  // Get dynamic tabs based on project status
  const getDynamicTabs = () => {
    const baseTabs = [
      { id: 'overview', label: 'Overview', icon: FiEye },
      { id: 'boq', label: 'BOQ', icon: FiFileText },
      { id: 'proposal', label: 'Penawaran', icon: FiUser },
    ];
    
    // Only show documentation tab when project is IN PROGRESS
    if (isProjectInProgress()) {
      baseTabs.push({ id: 'dokumentasi', label: 'Dokumentasi', icon: FiCamera });
    }
    
    return baseTabs;
  };

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

  // Load documentation images
  useEffect(() => {
    if (project?.documentationImages) {
      setDocumentationImages(project.documentationImages);
    } else {
      setDocumentationImages([]);
    }
  }, [project?.documentationImages]);

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
      
      console.log('🚀 Navigating to BOQ penawaran for proposal resubmission');
      
      // Navigate directly to BOQ-penawaran page with existing proposal data
      router.push(`/boq-penawaran?projectId=${project.id}&proposalId=${currentProposal.id || currentProposal.proposalId}`);
      
      console.log('✅ Opening BOQ penawaran for proposal resubmission');
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

  // Handle documentation image upload
  const handleUploadDocumentation = async (files) => {
    if (!isProjectInProgress()) {
      alert('Documentation upload is only available when the project is in progress.');
      return;
    }

    try {
      setUploading(true);
      const uploadPromises = Array.from(files).map(async (file) => {
        // Validate file
        if (!file.type.startsWith('image/')) {
          throw new Error(`File ${file.name} is not an image`);
        }

        if (file.size > 10 * 1024 * 1024) { // 10MB limit
          throw new Error(`File ${file.name} is too large. Maximum size is 10MB.`);
        }

        // Upload to Firebase Storage
        const fileName = `${Date.now()}-${file.name}`;
        const storagePath = `projects/${project.id}/documentation/${fileName}`;
        
        console.log('📤 Uploading documentation image:', {
          fileName,
          storagePath,
          projectId: project.id,
          vendorId: user.uid
        });

        const downloadURL = await uploadFile(file, storagePath);
        
        return {
          url: downloadURL,
          name: fileName,
          originalName: file.name,
          uploadedAt: new Date(),
          uploadedBy: user.uid,
          uploaderName: user.displayName || user.email || 'Vendor',
          size: file.size,
          type: file.type
        };
      });

      const uploadedImages = await Promise.all(uploadPromises);
      
      // Update project document with new images
      const updatedImages = [...(project.documentationImages || []), ...uploadedImages];
      
      await firestoreService.update('projects', project.id, {
        documentationImages: updatedImages,
        updatedAt: new Date()
      });

      // Update local state
      setDocumentationImages(updatedImages);
      
      console.log('✅ Documentation images uploaded successfully:', uploadedImages.length);
      alert(`Successfully uploaded ${uploadedImages.length} image(s)!`);

    } catch (error) {
      console.error('❌ Error uploading documentation:', error);
      alert(`Upload failed: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  // Tab content renderers
  const renderOverviewTab = () => {
    // Helper function to get BOQ tahapan data
    const getTahapanFromBOQ = () => {
      const boqData = project.boq || project.attachedBOQ || project.boqData || project.originalData?.boq || project.originalData?.attachedBOQ;
      
      if (boqData?.tahapanKerja && Array.isArray(boqData.tahapanKerja)) {
        return boqData.tahapanKerja.map((tahapan, index) => ({
          name: tahapan.name || `Tahapan ${index + 1}`,
          description: tahapan.description || '',
          jenisKerjaCount: tahapan.jenisKerja ? tahapan.jenisKerja.length : 0
        }));
      }
      return [];
    };

    const tahapanList = getTahapanFromBOQ();

    return (
      <div className="max-w-7xl mx-auto">
        {/* Single Box Container */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 space-y-8">
          {/* Project Title and Location */}
          <div className="space-y-1">
            <h1 className="text-3xl font-bold text-gray-900">{enhancedProject.projectTitle}</h1>
            <span className="text-lg font-medium text-gray-600">
              {enhancedProject.city}, {enhancedProject.province || ''}
            </span>
          </div>

          {/* Progress Bar for Milestones */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Progress Proyek</h2>
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">Progress Keseluruhan</span>
                <span className="text-sm font-semibold text-blue-600">{project.match || 0}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-500 ease-out" 
                  style={{ width: `${project.match || 0}%` }}
                ></div>
              </div>
              
              {/* Tahapan Dots */}
              <div className="flex justify-between items-center">
                {tahapanList.map((tahapan, index) => (
                  <div 
                    key={index} 
                    className="relative group cursor-pointer"
                    title={`${tahapan.name}${tahapan.description ? ': ' + tahapan.description : ''}`}
                  >
                    <div className={`w-3 h-3 rounded-full transition-all duration-300 ${
                      index < tahapanList.length * ((project.match || 0) / 100)
                        ? 'bg-blue-600' 
                        : 'bg-gray-300'
                    }`}></div>
                    
                    {/* Tooltip */}
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10 pointer-events-none">
                      <div className="font-medium">{tahapan.name}</div>
                      {tahapan.description && (
                        <div className="text-gray-300">{tahapan.description}</div>
                      )}
                      <div className="text-gray-400">{tahapan.jenisKerjaCount} jenis kerja</div>
                      {/* Arrow */}
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Budget */}
          <div>
            <h2 className="text-lg font-normal text-gray-900 mb-2">Anggaran</h2>
            <p className="text-xl font-bold text-gray-900">
              {project.budget || 'Not specified'}
            </p>
          </div>

          {/* Jenis Proyek and Properti */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-normal text-gray-900 mb-2">Jenis Proyek</h3>
              <p className="text-gray-700 font-bold">{enhancedProject.projectType || 'Not specified'}</p>
            </div>
            <div>
              <h3 className="text-lg font-normal text-gray-900 mb-2">Properti</h3>
              <p className="text-gray-700 font-bold">{enhancedProject.propertyType || 'Not specified'}</p>
            </div>
          </div>

          {/* Ruang Lingkup and Metode Pengadaan */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-normal text-gray-900 mb-2">Ruang Lingkup</h3>
              <div className="flex flex-wrap gap-2">
                {Array.isArray(project.projectScope) ? (
                  project.projectScope.map((scope, index) => (
                    <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-lg text-sm font-bold">
                      {scope}
                    </span>
                  ))
                ) : Array.isArray(project.scope) ? (
                  project.scope.map((scope, index) => (
                    <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-lg text-sm font-bold">
                      {scope}
                    </span>
                  ))
                ) : (
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-lg text-sm font-bold">
                    {project.projectScope || project.scope || 'General'}
                  </span>
                )}
              </div>
            </div>
            <div>
              <h3 className="text-lg font-normal text-gray-900 mb-2">Metode Pengadaan</h3>
              <p className="text-gray-700 font-bold">{project.procurementMethod || project.bidMethod || 'Not specified'}</p>
            </div>
          </div>

          {/* Project Duration Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div>
              <h3 className="text-sm font-medium text-gray-600 mb-2">Durasi Tender</h3>
              <p className="text-gray-900 font-bold">
                {project.tenderDuration || project.bidCountdown || 'Not specified'}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-600 mb-2">Durasi Proyek</h3>
              <p className="text-gray-900 font-bold">
                {enhancedProject.estimatedDuration || 'Not specified'}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-600 mb-2">Estimasi Mulai</h3>
              <p className="text-gray-900 font-bold">
                {formatDate(enhancedProject.estimatedStartDate) || 'Not specified'}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-600 mb-2">Pemilik Proyek</h3>
              <p className="text-gray-900 font-bold">
                {enhancedProject.clientName || 'Not specified'}
              </p>
            </div>
          </div>

          {/* Catatan and Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h2 className="text-sm font-normal text-gray-900 mb-2">Catatan</h2>
              <div className="bg-gray-100 rounded-lg px-4 py-8">
                <p className="text-3xl text-gray-700">
                  {project.specialNotes || project.notes || project.description || 'No special notes'}
                </p>
              </div>
            </div>
            <div>
              <h2 className="text-sm font-normal text-gray-900 mb-2">Status</h2>
              <div className="bg-gray-100 rounded-lg px-4 py-8">
                <p className="text-3xl text-gray-700">
                  {project.status || 'Active'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderBOQTab = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Loading BOQ data...</span>
        </div>
      );
    }

    // Check if this vendor is accepted to show the accepted BOQ
    const isVendorAccepted = hasAcceptedProposal();
    const proposalIndex = getVendorProposalIndex();
    const normalizedProposals = normalizeProposals(project?.proposals);
    const vendorProposal = proposalIndex >= 0 ? normalizedProposals[proposalIndex] : null;
    
    return (
      <div className="space-y-4">
        {/* Project Status Info */}
        {isVendorAccepted && (
          <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
            <div className="flex items-start space-x-3">
              <FiCheck className="w-5 h-5 text-green-600 mt-0.5" />
              <div>
                <h5 className="font-medium text-green-800 mb-1">Project Accepted - Work Started</h5>
                <p className="text-sm text-green-700">
                  You have been selected for this project. The BOQ below shows the agreed terms for your work.
                </p>
              </div>
            </div>
          </div>
        )}

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
            <h3 className="text-lg font-semibold text-gray-900">
              {isVendorAccepted ? 'Accepted Work Scope (BOQ)' : 'Bill of Quantities (BOQ)'}
            </h3>
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
              acceptedVendor={isVendorAccepted}
            />
          </div>
          
          {isVendorAccepted && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <FiInfo className="w-4 h-4" />
                <span>
                  This is your accepted work scope. Use the Documentation tab to upload progress photos and updates.
                </span>
              </div>
            </div>
          )}
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
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Status Penawaran</h2>
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

  const renderDokumentasiTab = () => {
    if (!isProjectInProgress()) {
      return (
        <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
          <FiCamera className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Project Not Started Yet</h3>
          <p className="text-gray-600">
            Documentation upload will be available once the project is in progress.
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {/* Upload Section */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Upload Progress Documentation</h3>
            <div className="flex gap-2">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => e.target.files && handleUploadDocumentation(e.target.files)}
                className="hidden"
                id="documentation-upload"
                disabled={uploading}
              />
              <label
                htmlFor="documentation-upload"
                className={`px-4 py-2 rounded-lg font-medium transition-colors cursor-pointer ${
                  uploading
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                <FiCamera className="inline mr-2" />
                {uploading ? 'Uploading...' : 'Upload Images'}
              </label>
            </div>
          </div>
          
          {uploading && (
            <div className="mb-4">
              <div className="bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-600 mt-2">Uploading... {Math.round(progress)}%</p>
            </div>
          )}
          
          <p className="text-sm text-gray-600">
            Upload images to document your work progress. Supported formats: JPG, PNG, GIF. Maximum size: 10MB per image.
          </p>
        </div>

        {/* Images Grid */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Documentation Images ({documentationImages.length})
          </h3>
          
          {documentationImages.length === 0 ? (
            <div className="text-center py-12">
              <FiCamera className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h4 className="text-lg font-medium text-gray-900 mb-2">No Images Yet</h4>
              <p className="text-gray-600 mb-4">
                Start documenting your work progress by uploading images.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {documentationImages.map((image, index) => (
                <div key={index} className="bg-gray-50 rounded-lg overflow-hidden">
                  <div className="aspect-square relative">
                    <img
                      src={image.url}
                      alt={image.originalName || `Documentation ${index + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik03NSA2MFY3NUg2MFY4NUg3NVYxMDBIODVWODVIMTAwVjc1SDg1VjYwSDc1WiIgZmlsbD0iIzlDQTNBRiIvPgo8L3N2Zz4K';
                        e.target.onerror = null;
                      }}
                    />
                  </div>
                  <div className="p-3">
                    <p className="text-xs text-gray-600 text-center">
                      {image.uploadedAt ? new Date(image.uploadedAt.toDate ? image.uploadedAt.toDate() : image.uploadedAt).toLocaleDateString() : 'Unknown date'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
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
      case 'dokumentasi':
        return renderDokumentasiTab();
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
            {getDynamicTabs().map((tab) => {
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
               