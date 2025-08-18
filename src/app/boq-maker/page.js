'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { MdAdd, MdClose, MdDelete, MdDragIndicator, MdFileDownload, MdSave, MdEdit, MdVisibility, MdArrowBack, MdMessage } from 'react-icons/md';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { firestoreService } from '../../hooks/useFirestore';

// Helper function to convert boqPricing array to tahapanKerja structure
const convertBoqPricingToTahapanKerja = (boqPricing, negotiationData = null) => {
  if (!boqPricing || !Array.isArray(boqPricing) || boqPricing.length === 0) {
    return [{
      id: 1,
      name: '',
      jenisKerja: [{
        id: 2,
        name: '',
        uraian: [{
          id: 3,
          name: '',
          spec: [{
            id: 4,
            description: '',
            satuan: '',
            volume: null,
            pricePerPcs: null
          }]
        }]
      }]
    }];
  }

  // Group boqPricing items by tahapan and jenis
  const groupedData = {};
  
  boqPricing.forEach((item, index) => {
    const tahapanName = item.tahapanName || item.tahapanKerja || 'Main Work Phase';
    const jenisName = item.jenisName || item.jenisKerja || 'General Work';
    const uraianName = item.uraianName || item.uraianPekerjaan || item.name || `Item ${index + 1}`;
    
    if (!groupedData[tahapanName]) {
      groupedData[tahapanName] = {};
    }
    
    if (!groupedData[tahapanName][jenisName]) {
      groupedData[tahapanName][jenisName] = [];
    }
    
    // Use negotiated price if available, otherwise fall back to vendor price or subtotal
    let finalPrice = 0;
    if (negotiationData && negotiationData.counterOffer && negotiationData.counterOffer[index]) {
      finalPrice = negotiationData.counterOffer[index].vendorPrice || 0;
    } else {
      finalPrice = parseFloat(item.vendorPrice || item.subtotal || item.unitPrice || item.pricePerPcs) || 0;
    }
    
    const volume = parseFloat(item.volume || item.quantity) || 1;
    const pricePerUnit = volume > 0 ? finalPrice / volume : finalPrice;
    
    groupedData[tahapanName][jenisName].push({
      name: uraianName,
      specs: [{
        description: item.item || item.description || item.name || uraianName,
        satuan: item.unit || item.satuan || 'unit',
        volume: volume,
        pricePerPcs: pricePerUnit,
        originalPrice: parseFloat(item.originalPrice || 0),
        vendorPrice: finalPrice,
        subtotal: finalPrice
      }]
    });
  });

  // Convert grouped data to tahapanKerja structure
  let tahapanId = 1;
  let jenisId = 1;
  let uraianId = 1;
  let specId = 1;

  const tahapanKerja = Object.keys(groupedData).map(tahapanName => {
    const jenisKerja = Object.keys(groupedData[tahapanName]).map(jenisName => {
      const uraian = groupedData[tahapanName][jenisName].map(uraianItem => {
        const spec = uraianItem.specs.map(specItem => ({
          id: specId++,
          description: specItem.description,
          satuan: specItem.satuan,
          volume: specItem.volume,
          pricePerPcs: specItem.pricePerPcs,
          originalPrice: specItem.originalPrice || 0,
          vendorPrice: specItem.vendorPrice || 0,
          subtotal: specItem.subtotal || 0
        }));

        return {
          id: uraianId++,
          name: uraianItem.name,
          spec: spec
        };
      });

      return {
        id: jenisId++,
        name: jenisName,
        uraian: uraian
      };
    });

    return {
      id: tahapanId++,
      name: tahapanName,
      jenisKerja: jenisKerja
    };
  });

  return tahapanKerja;
};

function BOQMakerContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [currentView, setCurrentView] = useState('list');
  const [currentBOQId, setCurrentBOQId] = useState(null);
  const [boqTitle, setBoqTitle] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [tahapanKerja, setTahapanKerja] = useState([
    {
      id: 1,
      name: '',
      jenisKerja: [
        {
          id: 2,
          name: '',
          uraian: [
            {
              id: 3,
              name: '',
              spec: [
                {
                  id: 4,
                  description: '',
                  satuan: '',
                  volume: null,
                  pricePerPcs: null
                }
              ]
            }
          ]
        }
      ]
    }
  ]);
  const [savedBOQs, setSavedBOQs] = useState([]);
  const [editMode, setEditMode] = useState(true);
  const [draggedTahapan, setDraggedTahapan] = useState(null);
  const [draggedJenis, setDraggedJenis] = useState(null);
  const [draggedUraian, setDraggedUraian] = useState(null);
  const [lastAutoSave, setLastAutoSave] = useState(null);
  const [showAutosaveNotification, setShowAutosaveNotification] = useState(false);
  const [contextMenu, setContextMenu] = useState({ show: false, x: 0, y: 0, tahapanId: null, jenisId: null, uraianId: null, type: null });
  const [tooltip, setTooltip] = useState({ show: false, text: '', x: 0, y: 0 });
  const [showBulkAddModal, setShowBulkAddModal] = useState(false);
  const [bulkAddCount, setBulkAddCount] = useState(10);
  const [showBulkAddJenisModal, setShowBulkAddJenisModal] = useState(false);
  const [bulkAddJenisCount, setBulkAddJenisCount] = useState(5);
  const [bulkAddJenisTahapanId, setBulkAddJenisTahapanId] = useState(null);
  const [showBulkAddUraianModal, setShowBulkAddUraianModal] = useState(false);
  const [bulkAddUraianCount, setBulkAddUraianCount] = useState(5);
  const [bulkAddUraianTahapanId, setBulkAddUraianTahapanId] = useState(null);
  const [bulkAddUraianJenisId, setBulkAddUraianJenisId] = useState(null);
  const [hasAutosaveDraft, setHasAutosaveDraft] = useState(false);
  
  // Resubmission states
  const [resubmissionMode, setResubmissionMode] = useState(false);
  const [resubmissionData, setResubmissionData] = useState(null);
  const [negotiationNotes, setNegotiationNotes] = useState('');
  const [showNegotiationDetails, setShowNegotiationDetails] = useState(false);
  const [vendorName, setVendorName] = useState('');
  const [isReadOnly, setIsReadOnly] = useState(false);

  useEffect(() => {
    const savedData = localStorage.getItem('projevo_boqs');
    if (savedData) {
      setSavedBOQs(JSON.parse(savedData));
      
      // Check if there's a load parameter in URL
      const loadBOQId = searchParams.get('load');
      if (loadBOQId) {
        const savedBOQsList = JSON.parse(savedData);
        const boqToLoad = savedBOQsList.find(b => b.id == loadBOQId);
        if (boqToLoad) {
          setBoqTitle(boqToLoad.title);
          setTahapanKerja(boqToLoad.tahapanKerja);
          setCurrentBOQId(boqToLoad.id);
          setEditMode(true);
          setCurrentView('editor');
          return; // Skip other loading if loading from URL
        }
      }
    }

    // Check if there's a temporary BOQ data to load
    const tempId = searchParams.get('tempId');
    const localKey = searchParams.get('localKey');
    const sessionKey = searchParams.get('sessionKey');
    const mode = searchParams.get('mode');
    const isReadOnly = searchParams.get('readOnly') === 'true';
    
    if ((tempId || localKey || sessionKey) && (mode === 'view' || mode === 'resubmission')) {
      console.log('🔍 Loading BOQ data in view/resubmission mode:', {
        tempId,
        localKey,
        sessionKey,
        mode,
        isReadOnly,
        hasFirestoreService: !!firestoreService
      });
      
      if (sessionKey) {
        // Load from localStorage using session key (preferred method)
        console.log('📱 Loading from session key:', sessionKey);
        if (mode === 'resubmission') {
          loadResubmissionBOQData(sessionKey);
        } else {
          loadSessionBOQData(sessionKey, isReadOnly);
        }
      } else if (tempId) {
        // Load from Firestore (legacy method)
        console.log('📱 Attempting to load from Firestore with tempId:', tempId);
        loadTempBOQData(tempId, isReadOnly);
      } else if (localKey) {
        // Load from localStorage (legacy method)
        console.log('💾 Attempting to load from localStorage with localKey:', localKey);
        loadLocalBOQData(localKey, isReadOnly);
      }
      return; // Skip autosave loading if loading temp data
    }

    // Load autosaved draft on component mount (only if not loading from URL or temp data)
    if (!searchParams.get('load') && !searchParams.get('tempId') && !searchParams.get('localKey')) {
      const autosaveData = localStorage.getItem('projevo_boq_autosave');
      if (autosaveData) {
        try {
          const draft = JSON.parse(autosaveData);
          // Only load if it's recent (within last 24 hours) and has content
          const hoursSinceAutosave = (Date.now() - draft.timestamp) / (1000 * 60 * 60);
          if (hoursSinceAutosave < 24 && (draft.boqTitle.trim() || draft.tahapanKerja.some(t => t.name.trim()))) {
            // Don't auto-load the draft - let user stay in saved view
            // Just store the draft data for potential loading
            setHasAutosaveDraft(true);
            setLastAutoSave(new Date(draft.timestamp));
            setShowAutosaveNotification(true);
            
            // Hide notification after 5 seconds
            setTimeout(() => setShowAutosaveNotification(false), 5000);
          }
        } catch (error) {
          console.error('Error loading autosave data:', error);
        }
      }
    }
  }, [searchParams, loadTempBOQData]);

  // Function to load session BOQ data from localStorage (preferred method)
  const loadSessionBOQData = (sessionKey, isReadOnly) => {
    try {
      console.log('📥 Loading session BOQ data from localStorage...', sessionKey);
      
      const sessionDataString = localStorage.getItem(sessionKey);
      
      if (!sessionDataString) {
        console.warn('⚠️ Session BOQ data not found in localStorage with key:', sessionKey);
        throw new Error('Session BOQ data not found. The data may have expired or been removed.');
      }
      
      const sessionData = JSON.parse(sessionDataString);
      console.log('✅ Session BOQ data loaded from localStorage:', sessionData);
      
      if (sessionData.boqPricing && Array.isArray(sessionData.boqPricing)) {
        // Convert boqPricing array to tahapanKerja structure with negotiation data
        const convertedTahapanKerja = convertBoqPricingToTahapanKerja(
          sessionData.boqPricing, 
          sessionData.negotiation
        );
        
        // Use negotiated prices if available
        const displayAmount = sessionData.finalAmount || sessionData.totalAmount;
        const displayTitle = `${sessionData.vendorName} - ${sessionData.projectTitle} BOQ`;
        
        setBoqTitle(displayTitle);
        setTahapanKerja(convertedTahapanKerja);
        setEditMode(!isReadOnly); // Set read-only mode based on parameter
        setCurrentView('editor');
        console.log('✅ Session BOQ data loaded successfully for viewing');
        console.log('💰 Display amount:', displayAmount);
        
        // Clean up session data after successful load
        setTimeout(() => {
          try {
            localStorage.removeItem(sessionKey);
            console.log('🗑️ Session BOQ data cleaned up from localStorage');
          } catch (cleanupError) {
            console.warn('⚠️ Failed to cleanup session data from localStorage:', cleanupError);
          }
        }, 30000); // Clean up after 30 seconds
        
      } else {
        console.warn('⚠️ Session BOQ data structure is invalid:', sessionData);
        throw new Error('Session BOQ data structure is invalid or missing pricing information');
      }
      
    } catch (error) {
      console.error('❌ Error loading session BOQ data from localStorage:', error);
      
      // Show user-friendly error message
      const errorMessage = error.message.includes('not found') 
        ? 'BOQ data could not be found. The link may have expired or the data was already viewed. Please request a new link from the project owner.'
        : 'Error loading BOQ data. Please try again or contact support if the problem persists.';
      
      alert(errorMessage);
      
      // Redirect back to dashboard or show empty editor
      if (typeof window !== 'undefined' && window.history.length > 1) {
        window.history.back();
      } else {
        setCurrentView('saved'); // Show saved BOQs instead
      }
    }
  };

  // Function to load resubmission BOQ data directly from Firestore
  const loadResubmissionBOQData = async (sessionKey) => {
    try {
      console.log('📥 Loading resubmission BOQ data from localStorage for project info...', sessionKey);
      
      // Get basic project info from localStorage
      const sessionDataString = localStorage.getItem(sessionKey);
      if (!sessionDataString) {
        throw new Error('Resubmission session data not found. Please try resubmitting the proposal again.');
      }
      
      const sessionData = JSON.parse(sessionDataString);
      console.log('📄 Session data:', sessionData);
      
      if (!sessionData.projectId || !sessionData.vendorId) {
        throw new Error('Invalid resubmission session data - missing project or vendor ID');
      }
      
      // Fetch the latest project data directly from Firestore
      console.log('🔄 Fetching latest project data from Firestore...', sessionData.projectId);
      const latestProject = await firestoreService.get('projects', sessionData.projectId);
      
      if (!latestProject) {
        throw new Error('Project not found in Firestore');
      }
      
      console.log('📊 Latest project data loaded:', latestProject);
      
      // Find the vendor's proposal in the latest project data
      let vendorProposal = null;
      let proposalIndex = -1;
      
      if (latestProject.proposals && Array.isArray(latestProject.proposals)) {
        proposalIndex = latestProject.proposals.findIndex(proposal => 
          proposal.vendorId === sessionData.vendorId
        );
        
        if (proposalIndex !== -1) {
          vendorProposal = latestProject.proposals[proposalIndex];
          console.log('✅ Vendor proposal found at index:', proposalIndex, vendorProposal);
        }
      }
      
      if (!vendorProposal) {
        throw new Error('Vendor proposal not found in the latest project data');
      }
      
      console.log('🔍 Full vendor proposal data:', JSON.stringify(vendorProposal, null, 2));
      console.log('🔍 Full project data for negotiation check:', JSON.stringify(latestProject, null, 2));
      
      // Get the latest negotiation data from multiple possible locations
      let latestNegotiationData = {};
      
      // Check vendor proposal negotiation
      if (vendorProposal.negotiation && Object.keys(vendorProposal.negotiation).length > 0) {
        latestNegotiationData = vendorProposal.negotiation;
        console.log('📍 Found negotiation data in vendor proposal:', latestNegotiationData);
      }
      // Check project-level negotiations
      else if (latestProject.negotiations && Array.isArray(latestProject.negotiations)) {
        const vendorNegotiation = latestProject.negotiations.find(neg => 
          neg.vendorId === sessionData.vendorId
        );
        if (vendorNegotiation) {
          latestNegotiationData = vendorNegotiation;
          console.log('📍 Found negotiation data in project negotiations:', latestNegotiationData);
        }
      }
      // Check project-level negotiation object
      else if (latestProject.negotiation && Object.keys(latestProject.negotiation).length > 0) {
        latestNegotiationData = latestProject.negotiation;
        console.log('📍 Found negotiation data in project negotiation:', latestNegotiationData);
      }
      // Check if negotiation data is embedded in proposal status
      else if (vendorProposal.status === 'negotiating' && vendorProposal.negotiationHistory) {
        const latestNegotiation = vendorProposal.negotiationHistory[vendorProposal.negotiationHistory.length - 1];
        if (latestNegotiation) {
          latestNegotiationData = latestNegotiation;
          console.log('� Found negotiation data in negotiation history:', latestNegotiationData);
        }
      }
      
      console.log('💬 Final negotiation data used:', latestNegotiationData);
      
      // Get the existing BOQ pricing from the latest proposal
      const existingBOQPricing = vendorProposal.boqPricing || [];
      console.log('📋 Existing BOQ pricing:', existingBOQPricing);
      console.log('📋 BOQ pricing detailed structure:', JSON.stringify(existingBOQPricing, null, 2));
      
      // Set up BOQ for resubmission editing
      if (existingBOQPricing.length > 0) {
        // Convert existing BOQ pricing back to tahapan kerja format with original prices for comparison
        const recreatedTahapanKerja = existingBOQPricing.map((item, index) => {
          // Get original vendor price from multiple possible fields
          const originalVendorPrice = item.pricePerPcs || 
                                     item.unitPrice || 
                                     item.price || 
                                     item.harga || 
                                     item.subtotal / (item.volume || item.quantity || 1) ||
                                     0;
          
          // Get negotiated price from negotiation data (if available)
          let negotiatedPrice = originalVendorPrice;
          
          // Look for negotiated price in various locations
          if (latestNegotiationData.boqPricing && latestNegotiationData.boqPricing[index]) {
            negotiatedPrice = latestNegotiationData.boqPricing[index].negotiatedPrice || 
                             latestNegotiationData.boqPricing[index].pricePerPcs || 
                             latestNegotiationData.boqPricing[index].unitPrice ||
                             originalVendorPrice;
          } else if (latestNegotiationData.negotiatedItems && latestNegotiationData.negotiatedItems[index]) {
            negotiatedPrice = latestNegotiationData.negotiatedItems[index].negotiatedPrice ||
                             latestNegotiationData.negotiatedItems[index].newPrice ||
                             originalVendorPrice;
          } else if (item.negotiatedPrice) {
            negotiatedPrice = item.negotiatedPrice;
          } else if (item.negotiation && item.negotiation.negotiatedPrice) {
            negotiatedPrice = item.negotiation.negotiatedPrice;
          }
          
          console.log(`💰 Item ${index} (${item.itemDescription || item.name || 'Unknown'}):`, {
            originalVendorPrice,
            negotiatedPrice,
            itemData: {
              pricePerPcs: item.pricePerPcs,
              unitPrice: item.unitPrice,
              price: item.price,
              harga: item.harga,
              subtotal: item.subtotal,
              volume: item.volume,
              quantity: item.quantity,
              unit: item.unit,
              satuan: item.satuan,
              unitType: item.unitType
            }
          });
          
          // Extract unit/satuan from multiple possible fields
          const unitValue = item.satuan || 
                           item.unit || 
                           item.unitType || 
                           item.unitName ||
                           item.satuanType ||
                           'unit';
          
          return {
            id: item.id || `tahapan-${index + 1}`,
            name: item.tahapanName || item.name || item.tahapan || `Tahapan ${index + 1}`,
            jenisKerja: [{
              id: item.jenisId || `jenis-${index + 1}`,
              name: item.jenisName || item.jenisKerja || 'Jenis Kerja',
              uraian: [{
                id: item.uraianId || `uraian-${index + 1}`,
                name: item.uraianName || item.description || item.itemDescription || 'Uraian Pekerjaan',
                spec: [{
                  id: item.specId || `spec-${index + 1}`,
                  name: item.specName || item.specification || 'Spesifikasi',
                  satuan: unitValue, // Use satuan instead of unit
                  volume: item.volume || item.quantity || 1,
                  pricePerPcs: negotiatedPrice, // Start with negotiated price for editing
                  originalPrice: originalVendorPrice, // Show original vendor price for comparison
                  negotiatedPrice: negotiatedPrice, // Store negotiated price for reference
                  isResubmission: true // Flag to indicate this is a resubmission item
                }]
              }]
            }]
          };
        });
        
        setTahapanKerja(recreatedTahapanKerja);
        console.log('✅ BOQ data recreated from existing proposal with original prices:', recreatedTahapanKerja);
      } else {
        console.log('⚠️ No existing BOQ pricing found, starting with default structure');
      }
      
      // Set project information
      setBoqTitle(`${latestProject.projectTitle || 'Project'} - Resubmission`);
      
      // Set resubmission context
      setIsReadOnly(false); // Allow editing for resubmission
      setResubmissionMode(true);
      setResubmissionData({
        projectId: sessionData.projectId,
        vendorId: sessionData.vendorId,
        proposalIndex: proposalIndex,
        originalProposal: vendorProposal,
        latestProject: latestProject,
        latestNegotiationData: latestNegotiationData
      });
      
      // Show negotiation details/comments if available
      const negotiationNotes = latestNegotiationData.notes || 
                              latestNegotiationData.ownerComments || 
                              latestNegotiationData.requirements || 
                              latestNegotiationData.message || 
                              '';
      
      if (negotiationNotes) {
        setNegotiationNotes(negotiationNotes);
        setShowNegotiationDetails(true);
        console.log('💬 Showing negotiation notes:', negotiationNotes);
      }
      
      // Set view to editor for resubmission
      setCurrentView('editor');
      setEditMode(true);
      
      console.log('✅ Resubmission BOQ data loaded successfully from Firestore');
      
    } catch (error) {
      console.error('❌ Error loading resubmission BOQ data:', error);
      
      // Show user-friendly error message
      const errorMessage = error.message.includes('not found') 
        ? 'Resubmission data could not be found. Please try resubmitting the proposal again from the project details page.'
        : `Error loading resubmission data: ${error.message}. Please try again or contact support if the problem persists.`;
      
      alert(errorMessage);
      
      // Redirect back to vendor dashboard
      if (typeof window !== 'undefined' && window.history.length > 1) {
        window.history.back();
      } else {
        window.location.href = '/dashboard/vendor';
      }
    }
  };

  // Function to load temporary BOQ data from Firestore
  const loadTempBOQData = useCallback(async (tempId, isReadOnly) => {
    try {
      console.log('📥 Loading temporary BOQ data from Firestore...', tempId);
      
      const tempBOQData = await firestoreService.get('temp_boq_views', tempId);
      
      if (!tempBOQData) {
        console.warn('⚠️ Temporary BOQ data not found in Firestore, checking localStorage fallback...');
        
        // Try to find a fallback in localStorage using a pattern
        const localStorageKeys = Object.keys(localStorage);
        const boqKey = localStorageKeys.find(key => 
          key.startsWith('temp_boq_') && 
          localStorage.getItem(key) !== null
        );
        
        if (boqKey) {
          console.log('🔄 Found localStorage fallback, switching to local data...');
          loadLocalBOQData(boqKey, isReadOnly);
          return;
        }
        
        throw new Error('Temporary BOQ data not found in Firestore or localStorage. The data may have expired or been removed.');
      }
      
      console.log('✅ Temporary BOQ data loaded:', tempBOQData);
      
      if (tempBOQData.boqPricing && Array.isArray(tempBOQData.boqPricing)) {
        // Convert boqPricing array to tahapanKerja structure
        const convertedTahapanKerja = convertBoqPricingToTahapanKerja(tempBOQData.boqPricing);
        
        setBoqTitle(`${tempBOQData.vendorName} - ${tempBOQData.projectTitle} BOQ`);
        setTahapanKerja(convertedTahapanKerja);
        setEditMode(!isReadOnly); // Set read-only mode based on parameter
        setCurrentView('editor');
        console.log('✅ BOQ data loaded successfully for viewing');
        
        // Clean up temporary data after loading (give more time for navigation)
        setTimeout(async () => {
          try {
            await firestoreService.delete('temp_boq_views', tempId);
            console.log('🗑️ Temporary BOQ data cleaned up');
          } catch (cleanupError) {
            console.warn('⚠️ Failed to cleanup temporary data:', cleanupError);
          }
        }, 30000); // Clean up after 30 seconds instead of 5
      } else {
        console.warn('⚠️ BOQ data structure is invalid:', tempBOQData);
        throw new Error('BOQ data structure is invalid or missing pricing information');
      }
      
    } catch (error) {
      console.error('❌ Error loading temporary BOQ data:', error);
      
      // Show user-friendly error message
      const errorMessage = error.message.includes('not found') 
        ? 'BOQ data could not be found. The link may have expired or the data was already viewed. Please request a new link from the project owner.'
        : 'Error loading BOQ data. Please try again or contact support if the problem persists.';
      
      alert(errorMessage);
      
      // Redirect back to dashboard or show empty editor
      if (typeof window !== 'undefined' && window.history.length > 1) {
        window.history.back();
      } else {
        setCurrentView('saved'); // Show saved BOQs instead
      }
    }
  }, [setCurrentView, setTahapanKerja]);

  // Function to load temporary BOQ data from localStorage
  const loadLocalBOQData = (localKey, isReadOnly) => {
    try {
      console.log('📥 Loading temporary BOQ data from localStorage...', localKey);
      
      const tempBOQDataString = localStorage.getItem(localKey);
      
      if (!tempBOQDataString) {
        console.warn('⚠️ Temporary BOQ data not found in localStorage with key:', localKey);
        
        // Try to find any temporary BOQ data as fallback
        const localStorageKeys = Object.keys(localStorage);
        const allBoqKeys = localStorageKeys.filter(key => key.startsWith('temp_boq_'));
        
        if (allBoqKeys.length > 0) {
          console.log('🔄 Found alternative BOQ data, using most recent...', allBoqKeys);
          const fallbackKey = allBoqKeys[allBoqKeys.length - 1]; // Use the most recent
          const fallbackDataString = localStorage.getItem(fallbackKey);
          
          if (fallbackDataString) {
            const fallbackData = JSON.parse(fallbackDataString);
            console.log('✅ Using fallback temporary BOQ data:', fallbackData);
            
            if (fallbackData.boqPricing && Array.isArray(fallbackData.boqPricing)) {
              const convertedTahapanKerja = convertBoqPricingToTahapanKerja(fallbackData.boqPricing);
              
              setBoqTitle(`${fallbackData.vendorName} - ${fallbackData.projectTitle} BOQ`);
              setTahapanKerja(convertedTahapanKerja);
              setEditMode(!isReadOnly);
              setCurrentView('editor');
              console.log('✅ Fallback BOQ data loaded successfully');
              
              // Clean up the fallback data after use
              setTimeout(() => {
                try {
                  localStorage.removeItem(fallbackKey);
                  console.log('🗑️ Fallback temporary data cleaned up');
                } catch (cleanupError) {
                  console.warn('⚠️ Failed to cleanup fallback data:', cleanupError);
                }
              }, 5000);
              
              return;
            }
          }
        }
        
        throw new Error('Temporary BOQ data not found in localStorage. The data may have expired or been removed.');
      }
      
      const tempBOQData = JSON.parse(tempBOQDataString);
      console.log('✅ Temporary BOQ data loaded from localStorage:', tempBOQData);
      
      if (tempBOQData.boqPricing && Array.isArray(tempBOQData.boqPricing)) {
        // Convert boqPricing array to tahapanKerja structure
        const convertedTahapanKerja = convertBoqPricingToTahapanKerja(tempBOQData.boqPricing);
        
        setBoqTitle(`${tempBOQData.vendorName} - ${tempBOQData.projectTitle} BOQ`);
        setTahapanKerja(convertedTahapanKerja);
        setEditMode(!isReadOnly); // Set read-only mode based on parameter
        setCurrentView('editor');
        console.log('✅ BOQ data loaded successfully for viewing');
        
        // Clean up temporary data after loading
        setTimeout(() => {
          try {
            localStorage.removeItem(localKey);
            console.log('🗑️ Temporary BOQ data cleaned up from localStorage');
          } catch (cleanupError) {
            console.warn('⚠️ Failed to cleanup localStorage data:', cleanupError);
          }
        }, 5000); // Clean up after 5 seconds
      } else {
        console.warn('⚠️ BOQ data structure is invalid:', tempBOQData);
        throw new Error('BOQ data structure is invalid or missing pricing information');
      }
      
    } catch (error) {
      console.error('❌ Error loading temporary BOQ data from localStorage:', error);
      
      // Show user-friendly error message
      const errorMessage = error.message.includes('not found') 
        ? 'BOQ data could not be found. The link may have expired or the data was already viewed. Please request a new link from the project owner.'
        : 'Error loading BOQ data. Please try again or contact support if the problem persists.';
      
      alert(errorMessage);
      
      // Redirect back to dashboard or show empty editor
      if (typeof window !== 'undefined' && window.history.length > 1) {
        window.history.back();
      } else {
        setCurrentView('saved'); // Show saved BOQs instead
      }
    }
  };

  // Autosave effect - saves draft every few seconds when changes are made
  useEffect(() => {
    const autosaveTimer = setTimeout(() => {
      // Only autosave if there's meaningful content
      if (boqTitle.trim() || tahapanKerja.some(t => t.name.trim() || 
          t.jenisKerja.some(j => j.name.trim() || 
            j.uraian.some(u => u.name.trim() || 
              u.spec.some(s => s.description.trim() || s.satuan.trim() || s.volume || s.pricePerPcs))))) {
        
        const autosaveData = {
          boqTitle,
          tahapanKerja,
          currentBOQId,
          timestamp: Date.now()
        };
        
        localStorage.setItem('projevo_boq_autosave', JSON.stringify(autosaveData));
        setLastAutoSave(new Date());
      }
    }, 3000); // Autosave every 3 seconds

    return () => clearTimeout(autosaveTimer);
  }, [boqTitle, tahapanKerja, currentBOQId]);

  // Close context menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      if (contextMenu.show) {
        closeContextMenu();
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [contextMenu.show]);

  const addTahapanKerja = () => {
    setTahapanKerja([
      ...tahapanKerja,
      {
        id: Date.now(),
        name: '',
        jenisKerja: [
          {
            id: Date.now() + 1,
            name: '',
            uraian: [
              {
                id: Date.now() + 2,
                name: '',
                spec: [
                  {
                    id: Date.now() + 3,
                    description: '',
                    satuan: '',
                    volume: null,
                    pricePerPcs: null
                  }
                ]
              }
            ]
          }
        ]
      }
    ]);
  };

  const addBulkTahapanKerja = (count) => {
    const newTahapanKerja = [];
    const baseTime = Date.now();
    for (let i = 0; i < count; i++) {
      const baseId = baseTime + i * 1000; // Increase spacing to 1000 for tahapan
      newTahapanKerja.push({
        id: baseId,
        name: '',
        jenisKerja: [
          {
            id: baseId + 1,
            name: '',
            uraian: [
              {
                id: baseId + 2,
                name: '',
                spec: [
                  {
                    id: baseId + 3,
                    description: '',
                    satuan: '',
                    volume: null,
                    pricePerPcs: null
                  }
                ]
              }
            ]
          }
        ]
      });
    }
    setTahapanKerja([...tahapanKerja, ...newTahapanKerja]);
  };

  const addBulkJenisKerja = (tahapanId, count) => {
    console.log('addBulkJenisKerja called with tahapanId:', tahapanId, 'count:', count, 'type of count:', typeof count);
    // Ensure count is a number
    const numCount = parseInt(count) || 1;
    console.log('numCount:', numCount);
    const newJenisKerja = [];
    const baseTime = Date.now();
    for (let i = 0; i < numCount; i++) {
      const baseId = baseTime + i * 100; // Increase spacing to 100
      newJenisKerja.push({
        id: baseId,
        name: '',
        uraian: [
          {
            id: baseId + 1,
            name: '',
            spec: [
              {
                id: baseId + 2,
                description: '',
                satuan: '',
                volume: null,
                pricePerPcs: null
              }
            ]
          }
        ]
      });
    }
    console.log('Creating', newJenisKerja.length, 'new jenis kerja items');
    
    setTahapanKerja(prevTahapan => prevTahapan.map(tahapan => 
      tahapan.id === tahapanId 
        ? { ...tahapan, jenisKerja: [...tahapan.jenisKerja, ...newJenisKerja] }
        : tahapan
    ));
  };

  const addBulkUraian = (tahapanId, jenisId, count) => {
    console.log('addBulkUraian called with tahapanId:', tahapanId, 'jenisId:', jenisId, 'count:', count, 'type of count:', typeof count);
    // Ensure count is a number
    const numCount = parseInt(count) || 1;
    console.log('numCount:', numCount);
    const newUraian = [];
    const baseTime = Date.now();
    for (let i = 0; i < numCount; i++) {
      const baseId = baseTime + i * 100; // Increase spacing to 100
      newUraian.push({
        id: baseId,
        name: '',
        spec: [
          {
            id: baseId + 1,
            description: '',
            satuan: '',
            volume: null,
            pricePerPcs: null
          }
        ]
      });
    }
    console.log('Creating', newUraian.length, 'new uraian items');
    
    setTahapanKerja(prevTahapan => prevTahapan.map(tahapan => 
      tahapan.id === tahapanId 
        ? {
            ...tahapan,
            jenisKerja: tahapan.jenisKerja.map(jenis =>
              jenis.id === jenisId
                ? { ...jenis, uraian: [...jenis.uraian, ...newUraian] }
                : jenis
            )
          }
        : tahapan
    ));
  };

  const updateTahapanKerja = (id, name) => {
    setTahapanKerja(tahapanKerja.map(tahapan => 
      tahapan.id === id ? { ...tahapan, name } : tahapan
    ));
  };

  const smartDelete = (tahapanId, jenisId, uraianId, specId) => {
    const tahapan = tahapanKerja.find(t => t.id === tahapanId);
    if (!tahapan) return;

    if (uraianId) {
      // If we have uraianId, delete this uraian (spec is inline, so it gets deleted with uraian)
      deleteUraian(tahapanId, jenisId, uraianId);
    } else if (jenisId) {
      const jenis = tahapan.jenisKerja.find(j => j.id === jenisId);
      if (jenis) {
        if (jenis.uraian.length > 0) {
          // If jenis has uraian, delete all uraian first
          jenis.uraian.forEach(uraian => {
            deleteUraian(tahapanId, jenisId, uraian.id);
          });
        } else {
          // If jenis has no uraian, delete the jenis
          deleteJenisKerja(tahapanId, jenisId);
        }
      }
    } else {
      // Delete tahapan if there are multiple tahapans
      if (tahapanKerja.length > 1) {
        deleteTahapanKerja(tahapanId);
      }
    }
  };

  const deleteTahapanKerja = (id) => {
    setTahapanKerja(tahapanKerja.filter(tahapan => tahapan.id !== id));
  };

  const duplicateTahapanKerja = (id) => {
    const tahapanToDuplicate = tahapanKerja.find(t => t.id === id);
    if (tahapanToDuplicate) {
      const duplicatedTahapan = {
        ...tahapanToDuplicate,
        id: Date.now(),
        jenisKerja: tahapanToDuplicate.jenisKerja.map(jenis => ({
          ...jenis,
          id: Date.now() + Math.random() * 1000,
          uraian: jenis.uraian.map(uraian => ({
            ...uraian,
            id: Date.now() + Math.random() * 1000,
            spec: uraian.spec.map(spec => ({
              ...spec,
              id: Date.now() + Math.random() * 1000
            }))
          }))
        }))
      };
      
      const tahapanIndex = tahapanKerja.findIndex(t => t.id === id);
      const newTahapanKerja = [...tahapanKerja];
      newTahapanKerja.splice(tahapanIndex + 1, 0, duplicatedTahapan);
      setTahapanKerja(newTahapanKerja);
    }
    setContextMenu({ show: false, x: 0, y: 0, tahapanId: null });
  };

  const clearTahapanKerjaContents = (id) => {
    setTahapanKerja(tahapanKerja.map(tahapan => 
      tahapan.id === id 
        ? {
            ...tahapan,
            name: '',
            jenisKerja: [
              {
                id: Date.now(),
                name: '',
                uraian: [
                  {
                    id: Date.now() + 1,
                    name: '',
                    spec: [
                      {
                        id: Date.now() + 2,
                        description: '',
                        satuan: '',
                        volume: null,
                        pricePerPcs: null
                      }
                    ]
                  }
                ]
              }
            ]
          }
        : tahapan
    ));
    setContextMenu({ show: false, x: 0, y: 0, tahapanId: null });
  };

  const handleContextMenu = (e, tahapanId, jenisId = null, uraianId = null) => {
    e.preventDefault();
    e.stopPropagation();
    
    console.log('handleContextMenu called with:', { tahapanId, jenisId, uraianId });
    
    let type = 'tahapan';
    if (uraianId) type = 'uraian';
    else if (jenisId) type = 'jenis';
    
    setContextMenu({
      show: true,
      x: e.clientX,
      y: e.clientY,
      tahapanId,
      jenisId,
      uraianId,
      type
    });
  };

  const closeContextMenu = () => {
    setContextMenu({ show: false, x: 0, y: 0, tahapanId: null });
  };

  const showTooltip = (e, text) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setTooltip({
      show: true,
      text,
      x: rect.left + rect.width / 2,
      y: rect.bottom + 8
    });
  };

  const hideTooltip = () => {
    setTooltip({ show: false, text: '', x: 0, y: 0 });
  };

  // Handle key press for inputs
  const handleKeyPress = (e, tahapanId, jenisId, uraianId, fieldType) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      
      // Add new uraian when pressing Enter
      addUraian(tahapanId, jenisId);
      
      // Focus on the new uraian's first input after a short delay
      setTimeout(() => {
        // Find the newly added uraian (last one in the list)
        const tahapan = tahapanKerja.find(t => t.id === tahapanId);
        const jenis = tahapan?.jenisKerja?.find(j => j.id === jenisId);
        const lastUraian = jenis?.uraian?.[jenis.uraian.length - 1];
        
        if (lastUraian) {
          // Try to focus on the uraian name input of the new row
          const uraianInputs = document.querySelectorAll(`input[data-uraian-id="${lastUraian.id}"]`);
          if (uraianInputs.length > 0) {
            uraianInputs[0].focus();
          }
        }
      }, 50);
    } else if (e.key === 'Tab') {
      // Let default tab behavior handle navigation between inputs
      return;
    }
  };

  const handleDragStart = (e, tahapanId) => {
    setDraggedTahapan(tahapanId);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', '');
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, targetTahapanId) => {
    e.preventDefault();
    
    if (!draggedTahapan || draggedTahapan === targetTahapanId) {
      setDraggedTahapan(null);
      return;
    }

    const newTahapanKerja = [...tahapanKerja];
    const draggedIndex = newTahapanKerja.findIndex(t => t.id === draggedTahapan);
    const targetIndex = newTahapanKerja.findIndex(t => t.id === targetTahapanId);

    if (draggedIndex === -1 || targetIndex === -1) {
      setDraggedTahapan(null);
      return;
    }

    // Remove dragged item and insert at target position
    const [draggedItem] = newTahapanKerja.splice(draggedIndex, 1);
    newTahapanKerja.splice(targetIndex, 0, draggedItem);

    setTahapanKerja(newTahapanKerja);
    setDraggedTahapan(null);
  };

  const handleDragEnd = () => {
    setDraggedTahapan(null);
  };

  // Jenis drag handlers
  const handleJenisDragStart = (e, jenisId) => {
    setDraggedJenis(jenisId);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', '');
  };

  const handleJenisDrop = (e, targetJenisId, tahapanId) => {
    e.preventDefault();
    
    if (!draggedJenis || draggedJenis === targetJenisId) {
      setDraggedJenis(null);
      return;
    }

    const newTahapanKerja = [...tahapanKerja];
    const tahapan = newTahapanKerja.find(t => t.id === tahapanId);
    
    if (!tahapan) {
      setDraggedJenis(null);
      return;
    }

    const draggedIndex = tahapan.jenisKerja.findIndex(j => j.id === draggedJenis);
    const targetIndex = tahapan.jenisKerja.findIndex(j => j.id === targetJenisId);

    if (draggedIndex === -1 || targetIndex === -1) {
      setDraggedJenis(null);
      return;
    }

    // Remove dragged item and insert at target position
    const [draggedItem] = tahapan.jenisKerja.splice(draggedIndex, 1);
    tahapan.jenisKerja.splice(targetIndex, 0, draggedItem);

    setTahapanKerja(newTahapanKerja);
    setDraggedJenis(null);
  };

  const handleJenisDragEnd = () => {
    setDraggedJenis(null);
  };

  // Uraian drag handlers
  const handleUraianDragStart = (e, uraianId) => {
    setDraggedUraian(uraianId);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', '');
  };

  const handleUraianDrop = (e, targetUraianId, tahapanId, jenisId) => {
    e.preventDefault();
    
    if (!draggedUraian || draggedUraian === targetUraianId) {
      setDraggedUraian(null);
      return;
    }

    const newTahapanKerja = [...tahapanKerja];
    const tahapan = newTahapanKerja.find(t => t.id === tahapanId);
    
    if (!tahapan) {
      setDraggedUraian(null);
      return;
    }

    const jenis = tahapan.jenisKerja.find(j => j.id === jenisId);
    
    if (!jenis) {
      setDraggedUraian(null);
      return;
    }

    const draggedIndex = jenis.uraian.findIndex(u => u.id === draggedUraian);
    const targetIndex = jenis.uraian.findIndex(u => u.id === targetUraianId);

    if (draggedIndex === -1 || targetIndex === -1) {
      setDraggedUraian(null);
      return;
    }

    // Remove dragged item and insert at target position
    const [draggedItem] = jenis.uraian.splice(draggedIndex, 1);
    jenis.uraian.splice(targetIndex, 0, draggedItem);

    setTahapanKerja(newTahapanKerja);
    setDraggedUraian(null);
  };

  const handleUraianDragEnd = () => {
    setDraggedUraian(null);
  };

  const addJenisKerja = (tahapanId) => {
    setTahapanKerja(tahapanKerja.map(tahapan => 
      tahapan.id === tahapanId 
        ? { 
            ...tahapan, 
            jenisKerja: [
              ...tahapan.jenisKerja, 
              { 
                id: Date.now(), 
                name: '', 
                uraian: [
                  {
                    id: Date.now() + 1,
                    name: '',
                    spec: [
                      {
                        id: Date.now() + 2,
                        description: '',
                        satuan: '',
                        volume: null,
                        pricePerPcs: null
                      }
                    ]
                  }
                ]
              }
            ] 
          }
        : tahapan
    ));
  };

  const updateJenisKerja = (tahapanId, jenisId, name) => {
    setTahapanKerja(tahapanKerja.map(tahapan => 
      tahapan.id === tahapanId 
        ? { 
            ...tahapan, 
            jenisKerja: tahapan.jenisKerja.map(jenis => 
              jenis.id === jenisId ? { ...jenis, name } : jenis
            )
          }
        : tahapan
    ));
    
    // No auto-add for jenis - use manual button instead
  };

  const deleteJenisKerja = (tahapanId, jenisId) => {
    setTahapanKerja(tahapanKerja.map(tahapan => 
      tahapan.id === tahapanId 
        ? { 
            ...tahapan, 
            jenisKerja: tahapan.jenisKerja.filter(jenis => jenis.id !== jenisId)
          }
        : tahapan
    ));
  };

  const addUraian = (tahapanId, jenisId) => {
    setTahapanKerja(tahapanKerja.map(tahapan => 
      tahapan.id === tahapanId 
        ? { 
            ...tahapan, 
            jenisKerja: tahapan.jenisKerja.map(jenis => 
              jenis.id === jenisId 
                ? { 
                    ...jenis, 
                    uraian: [
                      ...jenis.uraian, 
                      { 
                        id: Date.now(), 
                        name: '', 
                        spec: [
                          {
                            id: Date.now() + 1,
                            description: '',
                            satuan: '',
                            volume: null,
                            pricePerPcs: null
                          }
                        ]
                      }
                    ] 
                  }
                : jenis
            )
          }
        : tahapan
    ));
  };

  const updateUraian = (tahapanId, jenisId, uraianId, name) => {
    setTahapanKerja(tahapanKerja.map(tahapan => 
      tahapan.id === tahapanId 
        ? { 
            ...tahapan, 
            jenisKerja: tahapan.jenisKerja.map(jenis => 
              jenis.id === jenisId 
                ? { 
                    ...jenis, 
                    uraian: jenis.uraian.map(uraian => 
                      uraian.id === uraianId ? { ...uraian, name } : uraian
                    )
                  }
                : jenis
            )
          }
        : tahapan
    ));
    
    // No auto-add for uraian - use manual button instead
  };

  const deleteUraian = (tahapanId, jenisId, uraianId) => {
    setTahapanKerja(tahapanKerja.map(tahapan => 
      tahapan.id === tahapanId 
        ? { 
            ...tahapan, 
            jenisKerja: tahapan.jenisKerja.map(jenis => 
              jenis.id === jenisId 
                ? { 
                    ...jenis, 
                    uraian: jenis.uraian.filter(uraian => uraian.id !== uraianId)
                  }
                : jenis
            )
          }
        : tahapan
    ));
  };

  const addSpec = (tahapanId, jenisId, uraianId) => {
    setTahapanKerja(tahapanKerja.map(tahapan => 
      tahapan.id === tahapanId 
        ? { 
            ...tahapan, 
            jenisKerja: tahapan.jenisKerja.map(jenis => 
              jenis.id === jenisId 
                ? { 
                    ...jenis, 
                    uraian: jenis.uraian.map(uraian => 
                      uraian.id === uraianId 
                        ? { 
                            ...uraian, 
                            spec: [...uraian.spec,                            { 
                              id: Date.now(), 
                              description: '', 
                              satuan: '', 
                              volume: null, 
                              pricePerPcs: null 
                            }]
                          }
                        : uraian
                    )
                  }
                : jenis
            )
          }
        : tahapan
    ));
  };

  const updateSpec = (tahapanId, jenisId, uraianId, specId, field, value) => {
    setTahapanKerja(tahapanKerja.map(tahapan => 
      tahapan.id === tahapanId 
        ? { 
            ...tahapan, 
            jenisKerja: tahapan.jenisKerja.map(jenis => 
              jenis.id === jenisId 
                ? { 
                    ...jenis, 
                    uraian: jenis.uraian.map(uraian => 
                      uraian.id === uraianId 
                        ? { 
                            ...uraian, 
                            spec: uraian.spec.map(spec => 
                              spec.id === specId ? { ...spec, [field]: value } : spec
                            )
                          }
                        : uraian
                    )
                  }
                : jenis
            )
          }
        : tahapan
    ));
    
    // No auto-add for specs - they are inline with uraian
  };

  const deleteSpec = (tahapanId, jenisId, uraianId, specId) => {
    setTahapanKerja(tahapanKerja.map(tahapan => 
      tahapan.id === tahapanId 
        ? { 
            ...tahapan, 
            jenisKerja: tahapan.jenisKerja.map(jenis => 
              jenis.id === jenisId 
                ? { 
                    ...jenis, 
                    uraian: jenis.uraian.map(uraian => 
                      uraian.id === uraianId 
                        ? { 
                            ...uraian, 
                            spec: uraian.spec.filter(spec => spec.id !== specId)
                          }
                        : uraian
                    )
                  }
                : jenis
            )
          }
        : tahapan
    ));
  };

  const calculateSpecTotal = (spec) => {
    const volume = spec.volume || 0;
    const pricePerPcs = spec.pricePerPcs || 0;
    return volume * pricePerPcs;
  };

  const calculateGrandTotal = () => {
    let total = 0;
    tahapanKerja.forEach(tahapan => {
      tahapan.jenisKerja.forEach(jenis => {
        jenis.uraian.forEach(uraian => {
          uraian.spec.forEach(spec => {
            total += calculateSpecTotal(spec);
          });
        });
      });
    });
    return total;
  };

  const exportToCSV = () => {
    if (!boqTitle.trim()) {
      alert('Please enter a title for your BOQ before exporting');
      return;
    }

    const grandTotal = calculateGrandTotal();
    const ppn = grandTotal * 0.11;
    const totalWithPPN = grandTotal + ppn;

    let csvContent = '\ufeff'; // UTF-8 BOM
    csvContent += `BOQ: ${boqTitle}\n`;
    csvContent += `Generated: ${new Date().toLocaleDateString('id-ID')}\n\n`;
    csvContent += 'Tahapan Kerja,Jenis Pekerjaan,Uraian,Spesifikasi,Volume,Satuan,Harga per Pcs,Total\n';

    tahapanKerja.forEach(tahapan => {
      if (tahapan.jenisKerja.length === 0) {
        csvContent += `"${tahapan.name}",,,,,,,\n`;
      } else {
        tahapan.jenisKerja.forEach(jenis => {
          if (jenis.uraian.length === 0) {
            csvContent += `"${tahapan.name}","${jenis.name}",,,,,,\n`;
          } else {
            jenis.uraian.forEach(uraian => {
              if (uraian.spec.length === 0) {
                csvContent += `"${tahapan.name}","${jenis.name}","${uraian.name}",,,,,\n`;
              } else {
                uraian.spec.forEach(spec => {
                  const total = calculateSpecTotal(spec);
                  csvContent += `"${tahapan.name}","${jenis.name}","${uraian.name}","${spec.description}",${spec.volume},"${spec.satuan}","Rp ${spec.pricePerPcs.toLocaleString('id-ID')}","Rp ${total.toLocaleString('id-ID')}"\n`;
                });
              }
            });
          }
        });
      }
    });

    csvContent += '\n';
    csvContent += `,,,,,,Subtotal,"Rp ${grandTotal.toLocaleString('id-ID')}"\n`;
    csvContent += `,,,,,,PPN (11%),"Rp ${ppn.toLocaleString('id-ID')}"\n`;
    csvContent += `,,,,,,Total,"Rp ${totalWithPPN.toLocaleString('id-ID')}"\n`;

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `BOQ_${boqTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const saveBOQ = () => {
    if (!boqTitle.trim()) {
      alert('Please enter a title for your BOQ');
      return;
    }

    const boqData = {
      id: currentBOQId || Date.now(),
      title: boqTitle.trim(),
      tahapanKerja: tahapanKerja,
      createdAt: currentBOQId ? getSavedBOQ(currentBOQId)?.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const updatedBOQs = currentBOQId 
      ? savedBOQs.map(boq => boq.id === currentBOQId ? boqData : boq)
      : [...savedBOQs, boqData];

    setSavedBOQs(updatedBOQs);
    localStorage.setItem('projevo_boqs', JSON.stringify(updatedBOQs));
    setCurrentBOQId(boqData.id);
    
    // Clear autosave after successful save
    localStorage.removeItem('projevo_boq_autosave');
    setLastAutoSave(null);
    
    setShowSuccessModal(true);
  };

  const loadBOQ = (id, mode = 'edit') => {
    const boq = savedBOQs.find(b => b.id === id);
    if (boq) {
      setBoqTitle(boq.title);
      setTahapanKerja(boq.tahapanKerja);
      setCurrentBOQId(id);
      setEditMode(mode === 'edit');
      setCurrentView('editor');
      
      // Clear autosave when loading existing BOQ
      localStorage.removeItem('projevo_boq_autosave');
      setLastAutoSave(null);
    }
  };

  const deleteBOQ = (id) => {
    if (confirm('Are you sure you want to delete this BOQ?')) {
      const updatedBOQs = savedBOQs.filter(boq => boq.id !== id);
      setSavedBOQs(updatedBOQs);
      localStorage.setItem('projevo_boqs', JSON.stringify(updatedBOQs));
      
      if (currentBOQId === id) {
        createNewBOQ();
      }
    }
  };

  const createNewBOQ = () => {
    setBoqTitle('');
    setTahapanKerja([
      { 
        id: 1, 
        name: '', 
        jenisKerja: [
          {
            id: 2,
            name: '',
            uraian: [
              {
                id: 3,
                name: '',
                spec: [
                  {
                    id: 4,
                    description: '',
                    satuan: '',
                    volume: null,
                    pricePerPcs: null
                  }
                ]
              }
            ]
          }
        ]
      }
    ]);
    setCurrentBOQId(null);
    setEditMode(true);
    setCurrentView('editor');
    
    // Clear autosave when creating new BOQ
    localStorage.removeItem('projevo_boq_autosave');
    setLastAutoSave(null);
    setHasAutosaveDraft(false);
  };

  const loadAutosaveDraft = () => {
    const autosaveData = localStorage.getItem('projevo_boq_autosave');
    if (autosaveData) {
      try {
        const draft = JSON.parse(autosaveData);
        setBoqTitle(draft.boqTitle);
        setTahapanKerja(draft.tahapanKerja);
        setCurrentBOQId(draft.currentBOQId);
        setEditMode(true);
        setCurrentView('editor');
        setHasAutosaveDraft(false);
        setShowAutosaveNotification(false);
      } catch (error) {
        console.error('Error loading autosave draft:', error);
      }
    }
  };

  const getSavedBOQ = (id) => {
    return savedBOQs.find(boq => boq.id === id);
  };

  // Helper function to count total items in BOQ
  const getTotalItems = () => {
    let totalItems = 0;
    tahapanKerja.forEach(tahapan => {
      tahapan.jenisKerja.forEach(jenis => {
        jenis.uraian.forEach(uraian => {
          totalItems += uraian.spec.length;
        });
      });
    });
    return totalItems;
  };

  // Handle resubmitting updated proposal to project owner
  const handleResubmitUpdatedProposal = async () => {
    if (!resubmissionData) {
      alert('Data resubmission tidak ditemukan. Silakan coba lagi.');
      return;
    }

    if (!boqTitle.trim()) {
      alert('Silakan masukkan judul BOQ terlebih dahulu.');
      return;
    }

    if (calculateGrandTotal() === 0) {
      alert('BOQ tidak boleh kosong. Silakan tambahkan minimal satu item dengan harga.');
      return;
    }

    try {
      console.log('🚀 Starting proposal resubmission to project owner...');
      
      // Convert current BOQ data to pricing format
      const updatedBOQPricing = [];
      let itemIndex = 0;
      
      tahapanKerja.forEach((tahapan, tahapanIndex) => {
        tahapan.jenisKerja.forEach((jenis, jenisIndex) => {
          jenis.uraian.forEach((uraian, uraianIndex) => {
            uraian.spec.forEach((spec, specIndex) => {
              if (spec.pricePerPcs > 0 && spec.volume > 0) {
                const subtotal = spec.pricePerPcs * spec.volume;
                updatedBOQPricing.push({
                  id: `${tahapanIndex}-${jenisIndex}-${uraianIndex}-${specIndex}`,
                  tahapanName: tahapan.name,
                  jenisName: jenis.name,
                  uraianName: uraian.name,
                  itemDescription: spec.description || spec.name,
                  specification: spec.description || spec.name,
                  satuan: spec.satuan,
                  volume: spec.volume,
                  pricePerPcs: spec.pricePerPcs,
                  subtotal: subtotal,
                  tahapanId: tahapan.id,
                  jenisId: jenis.id,
                  uraianId: uraian.id,
                  specId: spec.id,
                  // Keep track of original and negotiated prices for history
                  originalPrice: spec.originalPrice,
                  previousNegotiatedPrice: spec.negotiatedPrice,
                  isResubmission: true,
                  resubmissionDate: new Date().toISOString()
                });
                itemIndex++;
              }
            });
          });
        });
      });

      if (updatedBOQPricing.length === 0) {
        alert('Tidak ada item BOQ dengan harga dan volume yang valid. Silakan lengkapi data BOQ terlebih dahulu.');
        return;
      }

      const totalAmount = calculateGrandTotal();
      const totalAmountWithPPN = totalAmount * 1.11;

      // Prepare updated proposal data
      const updatedProposal = {
        // Preserve original proposal data
        ...resubmissionData.originalProposal,
        // Update with new data
        vendorId: resubmissionData.vendorId,
        boqPricing: updatedBOQPricing,
        totalAmount: totalAmount,
        finalAmount: totalAmountWithPPN,
        boqTitle: boqTitle,
        proposalDate: new Date().toISOString(),
        status: 'pending_review', // Reset to pending review
        isResubmission: true,
        resubmissionDate: new Date().toISOString(),
        originalProposalIndex: resubmissionData.proposalIndex,
        resubmissionNotes: `Proposal telah diperbarui berdasarkan feedback project owner. Total item: ${updatedBOQPricing.length}, Total harga: Rp ${totalAmountWithPPN.toLocaleString('id-ID')}`,
        previousTotalAmount: resubmissionData.originalProposal?.totalAmount || 0,
        negotiationHistory: resubmissionData.originalProposal?.negotiationHistory || [],
        // Ensure these critical fields are preserved
        submittedAt: resubmissionData.originalProposal?.submittedAt || new Date().toISOString(),
        submittedBy: resubmissionData.originalProposal?.submittedBy || resubmissionData.vendorId,
        userId: resubmissionData.originalProposal?.userId || resubmissionData.vendorId,
        message: resubmissionData.originalProposal?.message || '',
        negotiable: resubmissionData.originalProposal?.negotiable || 'negotiable',
        // Update timestamps
        updatedAt: new Date().toISOString()
      };

      console.log('📝 Updated proposal data:', updatedProposal);
      console.log('🔍 Original proposal data preserved:', {
        submittedAt: resubmissionData.originalProposal?.submittedAt,
        submittedBy: resubmissionData.originalProposal?.submittedBy,
        userId: resubmissionData.originalProposal?.userId,
        vendorId: resubmissionData.originalProposal?.vendorId,
        message: resubmissionData.originalProposal?.message
      });

      // Update proposal in Firestore
      const projectId = resubmissionData.projectId;
      const proposalIndex = resubmissionData.proposalIndex;

      // Get current project data
      const currentProject = await firestoreService.get('projects', projectId);
      if (!currentProject) {
        throw new Error('Project not found');
      }

      // Update the specific proposal
      const updatedProposals = [...currentProject.proposals];
      updatedProposals[proposalIndex] = {
        ...updatedProposals[proposalIndex],
        ...updatedProposal,
        updatedAt: new Date().toISOString()
      };

      // Update project with new proposal data
      await firestoreService.update('projects', projectId, {
        proposals: updatedProposals,
        updatedAt: new Date().toISOString()
      });

      console.log('✅ Proposal resubmitted successfully to project owner');

      // Show success message
      alert('🎉 Proposal berhasil dikirim ulang ke project owner!\n\nProposal Anda akan direview kembali dan Anda akan mendapat notifikasi hasilnya.');

      // Redirect back to vendor dashboard
      window.location.href = '/dashboard/vendor';

    } catch (error) {
      console.error('❌ Error resubmitting proposal:', error);
      alert(`Gagal mengirim proposal: ${error.message}\n\nSilakan coba lagi atau hubungi support jika masalah berlanjut.`);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <main className="relative">
        {/* Background gradient effects */}
        <div className="absolute inset-0 bg-gray-50"></div>
        
        <div className="relative w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {currentView === 'list' ? (
          <div className="min-h-screen bg-gray-50">
            {/* Header */}
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                  <div>
                    <h1 className="text-2xl font-semibold text-gray-900">BOQ Manager</h1>
                  </div>
                  <div className="flex items-center space-x-3">
                    {hasAutosaveDraft && (
                      <button
                        onClick={loadAutosaveDraft}
                        className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-amber-600 border border-transparent rounded-md hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition-colors"
                      >
                        Continue Draft
                      </button>
                    )}
                    <button
                      onClick={createNewBOQ}
                      className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                    >
                      + New BOQ
                    </button>
                  </div>
                </div>
              </div>

            {/* Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              {savedBOQs.length === 0 ? (
                <div className="text-center py-24">
                  <div className="mx-auto h-24 w-24 rounded-full bg-gray-100 flex items-center justify-center mb-6">
                    <svg className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No BOQs yet</h3>
                  <p className="text-gray-500 mb-8 max-w-md mx-auto">Get started by creating your first Bill of Quantities. You can save, edit, and manage all your BOQs from here.</p>
                  <button
                    onClick={createNewBOQ}
                    className="inline-flex items-center px-6 py-3 text-base font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                  >
                    Create Your First BOQ
                  </button>
                </div>
              ) : (
                <div>
                  <div className="mb-6">
                    <h2 className="text-lg font-medium text-gray-900">Your BOQs ({savedBOQs.length})</h2>
                    <p className="text-sm text-gray-500">Manage and organize your Bill of Quantities</p>
                  </div>
                  
                  <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {savedBOQs.map((boq) => (
                      <div key={boq.id} className="bg-white rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all duration-200 group">
                        <div className="p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-1 min-w-0">
                              <h3 className="text-lg font-medium text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                                {boq.title}
                              </h3>
                              <div className="mt-2 space-y-1">
                                <p className="text-sm text-gray-500">
                                  Created {formatDate(boq.createdAt)}
                                </p>
                                {boq.updatedAt !== boq.createdAt && (
                                  <p className="text-sm text-gray-500">
                                    Updated {formatDate(boq.updatedAt)}
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className="ml-4 flex-shrink-0">
                              <button
                                onClick={() => deleteBOQ(boq.id)}
                                className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                                title="Delete BOQ"
                              >
                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                          </div>
                          
                          <div className="flex gap-3">
                            <button
                              onClick={() => loadBOQ(boq.id, 'view')}
                              className="flex-1 inline-flex items-center justify-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                            >
                              View
                            </button>
                            <button
                              onClick={() => loadBOQ(boq.id, 'edit')}
                              className="flex-1 inline-flex items-center justify-center px-3 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                            >
                              Edit
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden">
            <div className="bg-white px-8 py-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-red-500 mb-2">BOQ Generator</h1>
                  <p className="text-blue-100">Create detailed Bill of Quantities with local storage</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <button
                    onClick={() => setCurrentView('list')}
                    className="bg-white hover:bg-gray-50 text-blue-700 px-2 py-1 rounded-md transition-all duration-200 shadow-sm hover:shadow-md font-medium border border-blue-200 text-xs"
                  >
                    ← Home
                  </button>
                  {editMode && (
                    <button
                      onClick={saveBOQ}
                      className="bg-purple-600 hover:bg-purple-700 text-white px-2 py-1 rounded-md transition-all duration-200 shadow-sm hover:shadow-md font-medium text-xs"
                    >
                      {currentBOQId ? 'Update' : 'Save'} BOQ
                    </button>
                  )}
                  {!editMode && (
                    <button
                      onClick={() => setEditMode(true)}
                      className="bg-white hover:bg-gray-50 text-blue-700 px-2 py-1 rounded-md transition-all duration-200 shadow-sm hover:shadow-md font-medium border text-xs"
                    >
                      Edit Mode
                    </button>
                  )}
                  {editMode && (
                    <button
                      onClick={exportToCSV}
                      className="bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded-md transition-all duration-200 shadow-sm hover:shadow-md font-medium text-xs"
                    >
                      Export CSV
                    </button>
                  )}
                  {!editMode && (
                    <button
                      onClick={exportToCSV}
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg font-medium text-sm"
                    >
                      Export CSV
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Resubmission Mode Banner */}
            {resubmissionMode && (
              <div className="px-8 py-4 bg-amber-50 border-b border-amber-200">
                <div className="flex items-center space-x-3">
                  <div className="bg-amber-100 p-2 rounded-full">
                    <MdEdit className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-amber-800">Proposal Resubmission Mode</h3>
                    <p className="text-sm text-amber-700">
                      You are editing your proposal based on project owner feedback. Previous prices are shown for comparison.
                    </p>
                  </div>
                </div>
                
                {/* Negotiation Details */}
                {showNegotiationDetails && negotiationNotes && (
                  <div className="mt-4 p-4 bg-white border border-amber-200 rounded-lg">
                    <h4 className="text-sm font-semibold text-gray-800 mb-2 flex items-center">
                      <MdMessageSquare className="w-4 h-4 mr-1" />
                      Project Owner Feedback:
                    </h4>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{negotiationNotes}</p>
                    <button
                      onClick={() => setShowNegotiationDetails(false)}
                      className="mt-2 text-xs text-amber-600 hover:text-amber-800 font-medium"
                    >
                      Hide feedback
                    </button>
                  </div>
                )}
                
                {!showNegotiationDetails && negotiationNotes && (
                  <button
                    onClick={() => setShowNegotiationDetails(true)}
                    className="mt-2 text-sm text-amber-600 hover:text-amber-800 font-medium flex items-center"
                  >
                    <MdMessageSquare className="w-4 h-4 mr-1" />
                    Show project owner feedback
                  </button>
                )}
              </div>
            )}

            <div className="px-8 py-6 border-b border-gray-200 bg-white">
              <div className="max-w-2xl">
                <label htmlFor="boqTitle" className="block text-sm font-medium text-gray-800 mb-2">
                  BOQ Title / Project Name
                </label>
                <input
                  id="boqTitle"
                  type="text"
                  placeholder="Enter BOQ title or project name..."
                  value={boqTitle}
                  onChange={(e) => setBoqTitle(e.target.value)}
                  disabled={!editMode}
                  className={
                    editMode 
                      ? "w-full px-2 py-1 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-black font-medium text-lg bg-gray-200 shadow-sm placeholder-gray-500" 
                      : "w-full px-2 py-1 border-2 border-gray-200 rounded-lg transition-all text-gray-800 font-medium text-lg bg-gray-100 shadow-sm cursor-not-allowed"
                  }
                />
                <p className="mt-2 text-sm text-gray-500">
                  This title will be used when saving your BOQ.
                </p>
                {/* Autosave indicator */}
                {lastAutoSave && (
                  <div className="mt-2 flex items-center space-x-2 text-sm text-green-600">
                    <MdSave className="w-4 h-4" />
                    <span>
                      Auto-saved at {lastAutoSave.toLocaleTimeString('id-ID', { 
                        hour: '2-digit', 
                        minute: '2-digit',
                        second: '2-digit'
                      })}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col">
              {/* Main Table Area */}
              <div className="p-8 pb-8">
                {/* Table View */}
                <div className="bg-gray-100 border border-gray-200 shadow-sm rounded-xl overflow-hidden">
                  <div className="w-full">
                    <table className="w-full table-fixed">
                      <thead className="bg-gray-100 sticky top-0 z-10">
                        <tr>
                          <th className="px-4 py-3 text-left text-sm font-bold text-gray-800 border-r border-gray-300" style={{width: '18%'}}>
                            Tahapan Kerja
                          </th>
                          <th className="px-4 py-3 text-left text-sm font-bold text-gray-800 border-r border-gray-300" style={{width: '18%'}}>
                            Jenis Pekerjaan
                          </th>
                          <th className="px-4 py-3 text-left text-sm font-bold text-gray-800 border-r border-gray-300" style={{width: '18%'}}>
                            Uraian
                          </th>
                          <th className="px-4 py-3 text-left text-sm font-bold text-gray-800 border-r border-gray-300" style={{width: '16%'}}>
                            Spesifikasi
                          </th>
                          <th className="px-4 py-3 text-left text-sm font-bold text-gray-800 border-r border-gray-300" style={{width: '8%'}}>
                            Volume
                          </th>
                          <th className="px-4 py-3 text-left text-sm font-bold text-gray-800 border-r border-gray-300" style={{width: '8%'}}>
                            Satuan
                          </th>
                          <th className="px-4 py-3 text-left text-sm font-bold text-gray-800 border-r border-gray-300" style={{width: '14%'}}>
                            Harga Satuan
                          </th>
                          <th className="px-4 py-3 text-left text-sm font-bold text-gray-800" style={{width: '16%'}}>
                            Total
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {tahapanKerja.map((tahapan, tahapanIndex) => {
                        // Create rows for each specification or empty rows for each level
                        const rows = [];
                        const isLastTahapan = tahapanIndex === tahapanKerja.length - 1;
                        
                        if (tahapan.jenisKerja.length === 0) {
                          // Empty tahapan row - show tahapan but allow adding jenis
                          rows.push({
                            key: `tahapan-${tahapan.id}`,
                            tahapanId: tahapan.id,
                            tahapanName: tahapan.name,
                            tahapanIndex,
                            isLastTahapan,
                            type: 'tahapan-empty'
                          });
                        } else {
                          tahapan.jenisKerja.forEach((jenis, jenisIndex) => {
                            const isLastJenis = jenisIndex === tahapan.jenisKerja.length - 1;
                            
                            if (jenis.uraian.length === 0) {
                              // Empty jenis row - show tahapan + jenis but allow adding uraian
                              rows.push({
                                key: `jenis-${jenis.id}`,
                                tahapanId: tahapan.id,
                                tahapanName: tahapan.name,
                                tahapanIndex,
                                jenisId: jenis.id,
                                jenisName: jenis.name,
                                jenisIndex,
                                isLastTahapan,
                                isLastJenis,
                                type: 'jenis-empty'
                              });
                            } else {
                              jenis.uraian.forEach((uraian, uraianIndex) => {
                                const isLastUraian = uraianIndex === jenis.uraian.length - 1;
                                
                                // Always show uraian row with inline spec data
                                rows.push({
                                  key: `uraian-${uraian.id}`,
                                  tahapanId: tahapan.id,
                                  tahapanName: tahapan.name,
                                  tahapanIndex,
                                  jenisId: jenis.id,
                                  jenisName: jenis.name,
                                  jenisIndex,
                                  uraianId: uraian.id,
                                  uraianName: uraian.name,
                                  uraianIndex,
                                  spec: uraian.spec.length > 0 ? uraian.spec[0] : null, // Use first (and only) spec
                                  specId: uraian.spec.length > 0 ? uraian.spec[0].id : null,
                                  isLastTahapan,
                                  isLastJenis,
                                  isLastUraian,
                                  type: 'uraian-with-spec'
                                });
                              });
                            }
                          });
                        }

                        return rows.map((row, rowIndex) => {
                          // Check if this is the first row for this jenis
                          const isFirstJenisRow = rows.findIndex(r => r.jenisId === row.jenisId) === rowIndex;
                          // Check if this is the first row for this uraian
                          const isFirstUraianRow = rows.findIndex(r => r.uraianId === row.uraianId) === rowIndex;
                          // Check if this is the first row for this tahapan
                          const isFirstTahapanRow = rows.findIndex(r => r.tahapanId === row.tahapanId) === rowIndex;
                          
                          // Calculate rowspan for tahapan (how many rows belong to this tahapan)
                          const tahapanRowSpan = rows.filter(r => r.tahapanId === row.tahapanId).length;
                          // Calculate rowspan for jenis (how many rows belong to this jenis)
                          const jenisRowSpan = rows.filter(r => r.jenisId === row.jenisId && r.jenisId).length;

                          return (
                          <tr 
                            key={row.key} 
                            className={`
                              border-b border-gray-200 transition-all duration-150
                              bg-white
                              ${isFirstTahapanRow && draggedTahapan === row.tahapanId ? 'opacity-75 bg-blue-100' : ''}
                              group
                            `}
                            style={{
                              ...(isFirstTahapanRow && draggedTahapan === row.tahapanId && {
                                transform: 'translateY(-1px)',
                                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
                                zIndex: 100,
                              })
                            }}
                            onDragOver={isFirstTahapanRow ? handleDragOver : undefined}
                            onDrop={isFirstTahapanRow ? (e) => handleDrop(e, row.tahapanId) : undefined}
                            onDragEnd={isFirstTahapanRow ? handleDragEnd : undefined}
                          >
                            {/* Regular table content */}
                            {/* Tahapan Kerja - Show only on first row of each tahapan, with rowspan */}
                            {isFirstTahapanRow && (
                              <td 
                                className={`px-4 py-2 border-r border-gray-200 align-middle group cursor-pointer`}
                                rowSpan={tahapanRowSpan}
                                onClick={(e) => {
                                  const input = e.currentTarget.querySelector('input');
                                  if (input && editMode) input.focus();
                                }}
                              >
                                <div className="space-y-2">
                                  <div className="flex items-center space-x-2">
                                    {/* Multi-function 6-dot icon - show on hover */}
                                    {editMode && (
                                      <button
                                        onClick={(e) => handleContextMenu(e, row.tahapanId)}
                                        className="text-gray-600 hover:text-gray-600 opacity-0 group-hover:opacity-100 transition-all duration-200 cursor-grab active:cursor-grabbing flex-shrink-0"
                                        title="Drag to reorder or click for options"
                                        onMouseDown={(e) => {
                                          // Allow drag to start but prevent event bubbling
                                          e.stopPropagation();
                                        }}
                                        draggable={true}
                                        onDragStart={(e) => {
                                          handleDragStart(e, row.tahapanId);
                                          e.stopPropagation();
                                        }}
                                      >
                                        <MdDragIndicator className="w-4 h-4" />
                                      </button>
                                    )}
                                    <div className="text-blue-400 font-bold text-lg min-w-[24px]">
                                      {row.tahapanIndex + 1}.
                                    </div>
                                    <input
                                      type="text"
                                      value={row.tahapanName}
                                      onChange={(e) => updateTahapanKerja(row.tahapanId, e.target.value)}
                                      onKeyDown={(e) => handleKeyPress(e, row.tahapanId, null, null, 'tahapan')}
                                      disabled={!editMode}
                                      data-tahapan-id={row.tahapanId}
                                      tabIndex={row.tahapanIndex * 100 + 1}
                                      className={
                                        editMode 
                                          ? "flex-1 text-gray-800 bg-transparent outline-none focus:ring-0 border-0 p-0 text-sm font-medium placeholder-gray-500" 
                                          : "flex-1 text-gray-800 bg-transparent outline-none border-0 p-0 cursor-not-allowed text-sm font-medium"
                                      }
                                    />
                                  </div>
                                </div>
                              </td>
                            )}

                            {/* Jenis Pekerjaan - Show only on first row of each jenis, with rowspan */}
                            {row.jenisId && isFirstJenisRow ? (
                              <td 
                                className={`px-4 py-2 border-r border-gray-200 align-middle cursor-pointer group
                                  ${isFirstJenisRow && draggedJenis === row.jenisId ? 'opacity-75 bg-blue-100' : ''}
                                `}
                                rowSpan={jenisRowSpan}
                                onClick={(e) => {
                                  const input = e.currentTarget.querySelector('input');
                                  if (input && editMode) input.focus();
                                }}
                                onDragOver={isFirstJenisRow ? handleDragOver : undefined}
                                onDrop={isFirstJenisRow ? (e) => handleJenisDrop(e, row.jenisId, row.tahapanId) : undefined}
                                onDragEnd={isFirstJenisRow ? handleJenisDragEnd : undefined}
                              >
                                <div className="space-y-2">
                                  <div className="flex items-center space-x-2">
                                    {/* Multi-function 6-dot icon - show on hover */}
                                    {editMode && (
                                      <button
                                        onClick={(e) => {
                                          console.log('Jenis context menu clicked, row data:', { tahapanId: row.tahapanId, jenisId: row.jenisId, type: row.type });
                                          handleContextMenu(e, row.tahapanId, row.jenisId, null);
                                        }}
                                        className="text-gray-600 hover:text-gray-600 opacity-0 group-hover:opacity-100 transition-all duration-200 cursor-grab active:cursor-grabbing flex-shrink-0"
                                        title="Drag to reorder or click for options"
                                        onMouseDown={(e) => {
                                          e.stopPropagation();
                                        }}
                                        draggable={true}
                                        onDragStart={(e) => {
                                          handleJenisDragStart(e, row.jenisId);
                                          e.stopPropagation();
                                        }}
                                      >
                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                          <circle cx="6" cy="8" r="2"/>
                                          <circle cx="12" cy="8" r="2"/>
                                          <circle cx="18" cy="8" r="2"/>
                                          <circle cx="6" cy="16" r="2"/>
                                          <circle cx="12" cy="16" r="2"/>
                                          <circle cx="18" cy="16" r="2"/>
                                        </svg>
                                      </button>
                                    )}
                                    <input
                                      type="text"
                                      value={row.jenisName}
                                      onChange={(e) => updateJenisKerja(row.tahapanId, row.jenisId, e.target.value)}
                                      onKeyDown={(e) => handleKeyPress(e, row.tahapanId, row.jenisId, null, 'jenis')}
                                      disabled={!editMode}
                                      data-jenis-id={row.jenisId}
                                      tabIndex={row.tahapanIndex * 100 + row.jenisIndex * 10 + 2}
                                      className={
                                        editMode 
                                          ? "flex-1 text-gray-800 bg-transparent outline-none focus:ring-0 border-0 p-0 text-sm placeholder-gray-500" 
                                          : "flex-1 text-gray-800 bg-transparent outline-none border-0 p-0 cursor-not-allowed text-sm"
                                      }
                                    />
                                  </div>
                                </div>
                              </td>
                            ) : !row.jenisId ? (
                              <td className="px-4 py-2 border-r border-gray-200 group cursor-pointer">
                              </td>
                            ) : null}

                            {/* Uraian */}
                            <td className={`px-4 py-2 border-r border-gray-200 align-middle cursor-pointer
                              ${row.uraianId && isFirstUraianRow && draggedUraian === row.uraianId ? 'opacity-75 bg-blue-900' : ''}
                            `}
                                onClick={(e) => {
                                  const input = e.currentTarget.querySelector('input');
                                  if (input && editMode) input.focus();
                                }}
                                onDragOver={row.uraianId && isFirstUraianRow ? handleDragOver : undefined}
                                onDrop={row.uraianId && isFirstUraianRow ? (e) => handleUraianDrop(e, row.uraianId, row.tahapanId, row.jenisId) : undefined}
                                onDragEnd={row.uraianId && isFirstUraianRow ? handleUraianDragEnd : undefined}
                            >
                              {row.uraianId && (row.type.includes('uraian') || isFirstUraianRow) ? (
                                <div className={`space-y-1 group`}>
                                  <div className="flex items-center space-x-2">
                                    {/* Multi-function 6-dot icon - show on hover */}
                                    {editMode && (
                                      <button
                                        onClick={(e) => handleContextMenu(e, row.tahapanId, row.jenisId, row.uraianId)}
                                        className="text-gray-600 hover:text-gray-600 opacity-0 group-hover:opacity-100 transition-all duration-200 cursor-grab active:cursor-grabbing flex-shrink-0"
                                        title="Drag to reorder or click for options"
                                        onMouseDown={(e) => {
                                          e.stopPropagation();
                                        }}
                                        draggable={true}
                                        onDragStart={(e) => {
                                          handleUraianDragStart(e, row.uraianId);
                                          e.stopPropagation();
                                        }}
                                      >
                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                          <circle cx="6" cy="8" r="2"/>
                                          <circle cx="12" cy="8" r="2"/>
                                          <circle cx="18" cy="8" r="2"/>
                                          <circle cx="6" cy="16" r="2"/>
                                          <circle cx="12" cy="16" r="2"/>
                                          <circle cx="18" cy="16" r="2"/>
                                        </svg>
                                      </button>
                                    )}
                                    <input
                                      type="text"
                                      value={row.uraianName}
                                      onChange={(e) => updateUraian(row.tahapanId, row.jenisId, row.uraianId, e.target.value)}
                                      onKeyDown={(e) => handleKeyPress(e, row.tahapanId, row.jenisId, row.uraianId, 'uraian')}
                                      disabled={!editMode}
                                      data-uraian-id={row.uraianId}
                                      tabIndex={row.tahapanIndex * 100 + row.jenisIndex * 10 + row.uraianIndex + 3}
                                      className={
                                        editMode 
                                          ? "flex-1 text-gray-800 bg-transparent outline-none focus:ring-0 border-0 p-0 text-sm placeholder-gray-500" 
                                          : "flex-1 text-gray-800 bg-transparent outline-none border-0 p-0 cursor-not-allowed text-sm"
                                      }
                                    />
                                  </div>
                                </div>
                              ) : row.uraianId ? (
                                <div className="text-gray-600 text-sm text-center">↳</div>
                              ) : (
                                <div></div>
                              )}
                            </td>

                            {/* Spesifikasi */}
                            <td className="px-4 py-2 border-r border-gray-200 align-middle cursor-pointer"
                                onClick={(e) => {
                                  const input = e.currentTarget.querySelector('input');
                                  if (input && editMode) input.focus();
                                }}>
                              {row.spec ? (
                                <input
                                  type="text"
                                  value={row.spec.description}
                                  onChange={(e) => updateSpec(row.tahapanId, row.jenisId, row.uraianId, row.specId, 'description', e.target.value)}
                                  onKeyDown={(e) => handleKeyPress(e, row.tahapanId, row.jenisId, row.uraianId, 'description')}
                                  disabled={!editMode}
                                  tabIndex={row.tahapanIndex * 100 + row.jenisIndex * 10 + row.uraianIndex + 4}
                                  className={
                                    editMode 
                                      ? "w-full h-full text-gray-800 bg-transparent outline-none focus:ring-0 border-0 p-0 text-sm placeholder-gray-500" 
                                      : "w-full h-full text-gray-800 bg-transparent outline-none border-0 p-0 cursor-not-allowed text-sm"
                                  }
                                />
                              ) : (
                                <div className="w-full h-6"></div>
                              )}
                            </td>

                            {/* Volume */}
                            <td className="px-4 py-2 border-r border-gray-200 align-middle cursor-pointer"
                                onClick={(e) => {
                                  const input = e.currentTarget.querySelector('input');
                                  if (input && editMode) input.focus();
                                }}>
                              {row.spec ? (
                                <input
                                  type="number"
                                  step="0.01"
                                  min="0"
                                  value={row.spec.volume === null || row.spec.volume === undefined ? '' : row.spec.volume}
                                  onChange={(e) => {
                                    const value = e.target.value;
                                    if (value === '' || /^\d*\.?\d*$/.test(value)) {
                                      updateSpec(row.tahapanId, row.jenisId, row.uraianId, row.specId, 'volume', value === '' ? null : parseFloat(value) || 0);
                                    }
                                  }}
                                  onKeyDown={(e) => handleKeyPress(e, row.tahapanId, row.jenisId, row.uraianId, 'volume')}
                                  onKeyPress={(e) => {
                                    if (!/[\d.]/.test(e.key) && e.key !== 'Backspace' && e.key !== 'Delete' && e.key !== 'Tab' && e.key !== 'Enter') {
                                      e.preventDefault();
                                    }
                                  }}
                                  disabled={!editMode}
                                  tabIndex={row.tahapanIndex * 100 + row.jenisIndex * 10 + row.uraianIndex + 5}
                                  className={
                                    editMode 
                                      ? "w-full h-full text-gray-800 bg-transparent outline-none focus:ring-0 border-0 p-0 text-sm text-center placeholder-gray-500" 
                                      : "w-full h-full text-gray-800 bg-transparent outline-none border-0 p-0 cursor-not-allowed text-sm text-center"
                                  }
                                />
                              ) : (
                                <div className="w-full h-6"></div>
                              )}
                            </td>

                            {/* Satuan */}
                            <td className="px-4 py-2 border-r border-gray-200 align-middle cursor-pointer"
                                onClick={(e) => {
                                  const input = e.currentTarget.querySelector('input');
                                  if (input && editMode) input.focus();
                                }}>
                              {row.spec ? (
                                <input
                                  type="text"
                                  value={row.spec.satuan}
                                  onChange={(e) => updateSpec(row.tahapanId, row.jenisId, row.uraianId, row.specId, 'satuan', e.target.value)}
                                  onKeyDown={(e) => handleKeyPress(e, row.tahapanId, row.jenisId, row.uraianId, 'satuan')}
                                  disabled={!editMode}
                                  tabIndex={row.tahapanIndex * 100 + row.jenisIndex * 10 + row.uraianIndex + 6}
                                  className={
                                    editMode 
                                      ? "w-full h-full text-gray-800 bg-transparent outline-none focus:ring-0 border-0 p-0 text-sm text-center placeholder-gray-500" 
                                      : "w-full h-full text-gray-800 bg-transparent outline-none border-0 p-0 cursor-not-allowed text-sm text-center"
                                  }
                                />
                              ) : (
                                <div className="w-full h-6"></div>
                              )}
                            </td>

                            {/* Harga per Pcs */}
                            <td className="px-4 py-2 border-r border-gray-200 align-middle cursor-pointer"
                                onClick={(e) => {
                                  const input = e.currentTarget.querySelector('input');
                                  if (input && editMode) input.focus();
                                }}>
                              {row.spec ? (
                                <div className="space-y-1">
                                  {/* Show original and negotiated prices for comparison in resubmission mode */}
                                  {resubmissionMode && row.spec.originalPrice !== undefined && (
                                    <div className="text-xs text-gray-500 space-y-0.5">
                                      <div className="italic">
                                        Harga Sebelumnya: Rp {parseFloat(row.spec.originalPrice || 0).toLocaleString('id-ID')}
                                      </div>
                                      {row.spec.negotiatedPrice && row.spec.negotiatedPrice !== row.spec.originalPrice && (
                                        <div className="italic text-blue-600">
                                          Hasil Negosiasi: Rp {parseFloat(row.spec.negotiatedPrice || 0).toLocaleString('id-ID')}
                                        </div>
                                      )}
                                    </div>
                                  )}
                                  <input
                                    type="number"
                                    min="0"
                                    value={row.spec.pricePerPcs === null || row.spec.pricePerPcs === undefined ? '' : row.spec.pricePerPcs}
                                    onChange={(e) => {
                                      const value = e.target.value;
                                      if (value === '' || /^\d*\.?\d*$/.test(value)) {
                                        updateSpec(row.tahapanId, row.jenisId, row.uraianId, row.specId, 'pricePerPcs', value === '' ? null : parseFloat(value) || 0);
                                      }
                                    }}
                                    onKeyDown={(e) => handleKeyPress(e, row.tahapanId, row.jenisId, row.uraianId, 'pricePerPcs')}
                                    onKeyPress={(e) => {
                                      if (!/[\d.]/.test(e.key) && e.key !== 'Backspace' && e.key !== 'Delete' && e.key !== 'Tab' && e.key !== 'Enter') {
                                        e.preventDefault();
                                      }
                                    }}
                                    disabled={!editMode}
                                    tabIndex={row.tahapanIndex * 100 + row.jenisIndex * 10 + row.uraianIndex + 7}
                                    className={
                                      editMode 
                                        ? "w-full h-full text-gray-800 bg-transparent outline-none focus:ring-0 border-0 p-0 text-sm text-right placeholder-gray-500" 
                                        : "w-full h-full text-gray-800 bg-transparent outline-none border-0 p-0 cursor-not-allowed text-sm text-right"
                                    }
                                    placeholder={resubmissionMode ? "Harga baru" : "Enter new price"}
                                  />
                                </div>
                              ) : (
                                <div className="w-full h-6"></div>
                              )}
                            </td>

                            {/* Total */}
                            <td className="px-4 py-2 align-middle">
                              {row.spec ? (
                                <div className="px-2 py-1 text-gray-800 font-medium text-sm text-center">
                                  Rp {calculateSpecTotal(row.spec).toLocaleString('id-ID')}
                                </div>
                              ) : (
                                <div className="w-full h-6"></div>
                              )}
                            </td>
                          </tr>
                          );
                        });
                      })}
                      
                      {/* Summary rows inside table */}
                      <tr className="border-t-2 border-gray-300 bg-white">
                        <td colSpan="7" className="px-4 py-3 text-right font-medium text-gray-800">
                          Subtotal:
                        </td>
                        <td className="px-4 py-3 font-medium text-black">
                          Rp {calculateGrandTotal().toLocaleString('id-ID')}
                        </td>
                      </tr>
                      <tr className="bg-white">
                        <td colSpan="7" className="px-4 py-3 text-right font-medium text-gray-800">
                          PPN (11%):
                        </td>
                        <td className="px-4 py-3 font-medium text-gray-600">
                          Rp {(calculateGrandTotal() * 0.11).toLocaleString('id-ID')}
                        </td>
                      </tr>
                      <tr className="border-t border-gray-300 bg-white">
                        <td colSpan="7" className="px-4 py-4 text-right font-bold text-black text-lg">
                          Total:
                        </td>
                        <td className="px-4 py-4 font-bold text-black text-lg">
                          Rp {(calculateGrandTotal() * 1.11).toLocaleString('id-ID')}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                  </div>
                </div>
                
                {/* Resubmission Action Button */}
                {resubmissionMode && (
                  <div className="px-8 py-6 border-t border-gray-200 bg-gray-50">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div className="text-sm text-gray-600">
                        <p className="font-medium">Ready to resubmit your updated proposal?</p>
                        <p>Total Amount: <span className="font-bold text-black">Rp {(calculateGrandTotal() * 1.11).toLocaleString('id-ID')}</span></p>
                      </div>
                      <div className="flex gap-3">
                        <button
                          onClick={() => window.history.back()}
                          className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:border-gray-400 hover:bg-gray-50 transition-all duration-200 font-medium"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleResubmitUpdatedProposal}
                          disabled={!boqTitle.trim() || calculateGrandTotal() === 0}
                          className="px-8 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-200 font-medium shadow-md hover:shadow-lg transform hover:-translate-y-0.5 disabled:transform-none"
                        >
                         Kirim Proposal
                        </button>
                      </div>
                    </div>
                    
                    {/* Resubmission Summary */}
                    {resubmissionData && (
                      <div className="mt-4 p-4 bg-white border border-blue-200 rounded-lg">
                        <h4 className="text-sm font-semibold text-gray-800 mb-2">📋 Ringkasan Resubmisi:</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">Proyek:</span>
                            <span className="ml-2 font-medium">{resubmissionData.latestProject?.projectTitle}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Total Item:</span>
                            <span className="ml-2 font-medium">{getTotalItems()} item</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Total Harga:</span>
                            <span className="ml-2 font-medium text-blue-600">Rp {(calculateGrandTotal() * 1.11).toLocaleString('id-ID')}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Status:</span>
                            <span className="ml-2 font-medium text-amber-600">Menunggu Review</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        
        
        {/* Custom Tooltip */}
        {tooltip.show && (
          <div 
            className="fixed bg-gray-800 text-white text-xs px-2 py-1 rounded shadow-lg z-50 pointer-events-none whitespace-nowrap"
            style={{ 
              left: `${tooltip.x}px`, 
              top: `${tooltip.y}px`,
              transform: 'translate(-50%, 0)'
            }}
          >
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-b-4 border-transparent border-b-gray-800"></div>
            {tooltip.text}
          </div>
        )}
        
        {/* Context Menu */}
        {contextMenu.show && (
          <div 
            className="fixed bg-gray-100 border border-gray-300 rounded-lg shadow-lg z-50 py-2 min-w-[180px]"
            style={{ 
              left: `${contextMenu.x}px`, 
              top: `${contextMenu.y}px`,
              transform: 'translate(0, 0)' // Start at mouse position instead of center
            }}
          >
            {contextMenu.type === 'tahapan' && (
              <>
                <button
                  onClick={() => {
                    addTahapanKerja();
                    closeContextMenu();
                  }}
                  className="w-full px-4 py-2 text-left text-green-400 hover:bg-green-100 flex items-center space-x-2 transition-colors duration-150"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <span>Tambah Tahapan Kerja</span>
                </button>
                <button
                  onClick={() => {
                    setShowBulkAddModal(true);
                    closeContextMenu();
                  }}
                  className="w-full px-4 py-2 text-left text-blue-400 hover:bg-blue-100 flex items-center space-x-2 transition-colors duration-150"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <span>Tambah Banyak Tahapan Kerja</span>
                </button>
                <div className="border-t border-gray-200 my-1"></div>
                <button
                  onClick={() => {
                    clearTahapanKerjaContents(contextMenu.tahapanId);
                    closeContextMenu();
                  }}
                  className="w-full px-4 py-2 text-left text-gray-800 hover:bg-gray-200 flex items-center space-x-2 transition-colors duration-150"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  <span>Clear Contents</span>
                </button>
                {tahapanKerja.length > 1 && (
                  <button
                    onClick={() => {
                      deleteTahapanKerja(contextMenu.tahapanId);
                      closeContextMenu();
                    }}
                    className="w-full px-4 py-2 text-left text-red-400 hover:bg-red-100 flex items-center space-x-2 transition-colors duration-150"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    <span>Delete</span>
                  </button>
                )}
              </>
            )}
            
            {contextMenu.type === 'jenis' && (
              <>
                <button
                  onClick={() => {
                    addJenisKerja(contextMenu.tahapanId);
                    closeContextMenu();
                  }}
                  className="w-full px-4 py-2 text-left text-green-400 hover:bg-green-100 flex items-center space-x-2 transition-colors duration-150"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <span>Tambah Jenis Pekerjaan</span>
                </button>
                <button
                  onClick={() => {
                    setBulkAddJenisTahapanId(contextMenu.tahapanId);
                    setShowBulkAddJenisModal(true);
                    closeContextMenu();
                  }}
                  className="w-full px-4 py-2 text-left text-blue-400 hover:bg-blue-100 flex items-center space-x-2 transition-colors duration-150"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <span>Tambah Banyak Jenis Pekerjaan</span>
                </button>
                <div className="border-t border-gray-200 my-1"></div>
                <button
                  onClick={() => {
                    if (contextMenu.jenisId) {
                      deleteJenisKerja(contextMenu.tahapanId, contextMenu.jenisId);
                    }
                    closeContextMenu();
                  }}
                  className="w-full px-4 py-2 text-left text-red-400 hover:bg-red-100 flex items-center space-x-2 transition-colors duration-150"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  <span>Delete Jenis Pekerjaan</span>
                </button>
              </>
            )}
            
            {contextMenu.type === 'uraian' && (
              <>
                <button
                  onClick={() => {
                    addUraian(contextMenu.tahapanId, contextMenu.jenisId);
                    closeContextMenu();
                  }}
                  className="w-full px-4 py-2 text-left text-green-400 hover:bg-green-100 flex items-center space-x-2 transition-colors duration-150"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <span>Tambah Uraian</span>
                </button>
                <button
                  onClick={() => {
                    setBulkAddUraianTahapanId(contextMenu.tahapanId);
                    setBulkAddUraianJenisId(contextMenu.jenisId);
                    setShowBulkAddUraianModal(true);
                    closeContextMenu();
                  }}
                  className="w-full px-4 py-2 text-left text-blue-400 hover:bg-blue-100 flex items-center space-x-2 transition-colors duration-150"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <span>Tambah Banyak Uraian</span>
                </button>
                <div className="border-t border-gray-200 my-1"></div>
                <button
                  onClick={() => {
                    if (contextMenu.uraianId) {
                      deleteUraian(contextMenu.tahapanId, contextMenu.jenisId, contextMenu.uraianId);
                    }
                    closeContextMenu();
                  }}
                  className="w-full px-4 py-2 text-left text-red-400 hover:bg-red-100 flex items-center space-x-2 transition-colors duration-150"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  <span>Delete Uraian</span>
                </button>
              </>
            )}
          </div>
        )}
        
        {/* Autosave Notification */}
        {showAutosaveNotification && (
          <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center space-x-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="font-medium">Draft restored from autosave</span>
            <button
              onClick={() => setShowAutosaveNotification(false)}
              className="ml-2 text-green-200 hover:text-white"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
        
        {/* Success Modal */}
        {showSuccessModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md mx-4 border border-gray-200">
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-r from-green-100 to-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-black mb-3">BOQ Saved Successfully!</h3>
                <p className="text-gray-700 mb-8 leading-relaxed">Your Bill of Quantities has been saved. Ready to take the next step in your project journey?</p>
                
                <div className="space-y-3">
                  <button
                    onClick={() => {
                      setShowSuccessModal(false);
                      router.push('/dashboard/project-owner');
                    }}
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-4 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl font-semibold text-lg transform hover:-translate-y-0.5"
                  >
                    Go to Project Owner Dashboard
                  </button>
                  <button
                    onClick={() => {
                      setShowSuccessModal(false);
                      router.push('/dashboard/vendor');
                    }}
                    className="w-full border-2 border-gray-200 text-black px-6 py-4 rounded-xl hover:border-blue-500 hover:text-blue-600 transition-all duration-200 font-semibold text-lg transform hover:-translate-y-0.5"
                  >
                    Browse as Vendor
                  </button>
                  <button
                    onClick={() => setShowSuccessModal(false)}
                    className="w-full text-gray-600 hover:text-black px-6 py-3 rounded-xl transition-all duration-200 font-medium"
                  >
                    Continue Editing BOQ
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Bulk Add Modal */}
        {showBulkAddModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md mx-4 border border-gray-200">
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-black mb-3">Tambah Banyak Tahapan Kerja</h3>
                <p className="text-gray-700 mb-6 leading-relaxed">Berapa banyak tahapan kerja yang ingin Anda tambahkan?</p>
                
                <div className="mb-6">
                  <label htmlFor="bulkCount" className="block text-sm font-medium text-black mb-3">
                    Jumlah Tahapan Kerja (1-100)
                  </label>
                  <input
                    id="bulkCount"
                    type="number"
                    min="1"
                    max="100"
                    value={bulkAddCount}
                    onChange={(e) => {
                      const value = parseInt(e.target.value) || 1;
                      setBulkAddCount(Math.max(1, Math.min(100, value)));
                    }}
                    onKeyPress={(e) => {
                      // Allow only numbers, backspace, delete, tab, enter
                      if (!/[0-9]/.test(e.key) && !['Backspace', 'Delete', 'Tab', 'Enter'].includes(e.key)) {
                        e.preventDefault();
                      }
                      // Submit on Enter key
                      if (e.key === 'Enter') {
                        addBulkTahapanKerja(bulkAddCount);
                        setShowBulkAddModal(false);
                      }
                    }}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-center text-lg font-semibold text-black"
                    placeholder="Masukkan jumlah tahapan kerja"
                    autoFocus
                  />
                  <p className="text-xs text-gray-600 mt-2 text-center">
                    Maksimal 100 tahapan kerja dalam satu kali penambahan
                  </p>
                  
                  <div className="flex justify-center space-x-2 mt-4">
                    <button
                      onClick={() => setBulkAddCount(5)}
                      className={`px-3 py-2 rounded-lg transition-all duration-200 text-sm font-medium ${
                        bulkAddCount === 5 
                          ? 'bg-blue-500 text-white shadow-md' 
                          : 'bg-gray-100 text-black hover:bg-gray-200 border border-gray-200'
                      }`}
                    >
                      5
                    </button>
                    <button
                      onClick={() => setBulkAddCount(10)}
                      className={`px-3 py-2 rounded-lg transition-all duration-200 text-sm font-medium ${
                        bulkAddCount === 10 
                          ? 'bg-blue-500 text-white shadow-md' 
                          : 'bg-gray-100 text-black hover:bg-gray-200 border border-gray-200'
                      }`}
                    >
                      10
                    </button>
                    <button
                      onClick={() => setBulkAddCount(20)}
                      className={`px-3 py-2 rounded-lg transition-all duration-200 text-sm font-medium ${
                        bulkAddCount === 20 
                          ? 'bg-blue-500 text-white shadow-md' 
                          : 'bg-gray-100 text-black hover:bg-gray-200 border border-gray-200'
                      }`}
                    >
                      20
                    </button>
                    <button
                      onClick={() => setBulkAddCount(50)}
                      className={`px-3 py-2 rounded-lg transition-all duration-200 text-sm font-medium ${
                        bulkAddCount === 50 
                          ? 'bg-blue-500 text-white shadow-md' 
                          : 'bg-gray-100 text-black hover:bg-gray-200 border border-gray-200'
                      }`}
                    >
                      50
                    </button>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <button
                    onClick={() => {
                      addBulkTahapanKerja(bulkAddCount);
                      setShowBulkAddModal(false);
                    }}
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-4 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl font-semibold text-lg transform hover:-translate-y-0.5"
                  >
                    Tambah {bulkAddCount} Tahapan Kerja
                  </button>
                  <button
                    onClick={() => setShowBulkAddModal(false)}
                    className="w-full border-2 border-gray-200 text-black px-6 py-4 rounded-xl hover:border-gray-300 hover:text-black transition-all duration-200 font-semibold text-lg transform hover:-translate-y-0.5"
                  >
                    Batal
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Bulk Add Jenis Pekerjaan Modal */}
        {showBulkAddJenisModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md mx-4 border border-gray-200">
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-r from-green-100 to-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-black mb-3">Tambah Banyak Jenis Pekerjaan</h3>
                <p className="text-gray-700 mb-6 leading-relaxed">Berapa banyak jenis pekerjaan yang ingin Anda tambahkan?</p>
                
                <div className="mb-6">
                  <label htmlFor="bulkJenisCount" className="block text-sm font-medium text-black mb-3">
                    Jumlah Jenis Pekerjaan (1-50)
                  </label>
                  <input
                    id="bulkJenisCount"
                    type="number"
                    min="1"
                    max="50"
                    value={bulkAddJenisCount}
                    onChange={(e) => {
                      const value = parseInt(e.target.value) || 1;
                      setBulkAddJenisCount(Math.max(1, Math.min(50, value)));
                    }}
                    onKeyPress={(e) => {
                      if (!/[0-9]/.test(e.key) && !['Backspace', 'Delete', 'Tab', 'Enter'].includes(e.key)) {
                        e.preventDefault();
                      }
                      if (e.key === 'Enter') {
                        addBulkJenisKerja(contextMenu.tahapanId, bulkAddJenisCount);
                        setShowBulkAddJenisModal(false);
                      }
                    }}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all text-center text-lg font-semibold text-black"
                    placeholder="Masukkan jumlah jenis pekerjaan"
                    autoFocus
                  />
                  <p className="text-xs text-gray-600 mt-2 text-center">
                    Maksimal 50 jenis pekerjaan dalam satu kali penambahan
                  </p>
                  
                  <div className="flex justify-center space-x-2 mt-4">
                    <button
                      onClick={() => setBulkAddJenisCount(3)}
                      className={`px-3 py-2 rounded-lg transition-all duration-200 text-sm font-medium ${
                        bulkAddJenisCount === 3 
                          ? 'bg-green-500 text-white shadow-md' 
                          : 'bg-gray-100 text-black hover:bg-gray-200 border border-gray-200'
                      }`}
                    >
                      3
                    </button>
                    <button
                      onClick={() => setBulkAddJenisCount(5)}
                      className={`px-3 py-2 rounded-lg transition-all duration-200 text-sm font-medium ${
                        bulkAddJenisCount === 5 
                          ? 'bg-green-500 text-white shadow-md' 
                          : 'bg-gray-100 text-black hover:bg-gray-200 border border-gray-200'
                      }`}
                    >
                      5
                    </button>
                    <button
                      onClick={() => setBulkAddJenisCount(10)}
                      className={`px-3 py-2 rounded-lg transition-all duration-200 text-sm font-medium ${
                        bulkAddJenisCount === 10 
                          ? 'bg-green-500 text-white shadow-md' 
                          : 'bg-gray-100 text-black hover:bg-gray-200 border border-gray-200'
                      }`}
                    >
                      10
                    </button>
                    <button
                      onClick={() => setBulkAddJenisCount(20)}
                      className={`px-3 py-2 rounded-lg transition-all duration-200 text-sm font-medium ${
                        bulkAddJenisCount === 20 
                          ? 'bg-green-500 text-white shadow-md' 
                          : 'bg-gray-100 text-black hover:bg-gray-200 border border-gray-200'
                      }`}
                    >
                      20
                    </button>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <button
                    onClick={() => {
                      console.log('Button clicked - bulkAddJenisTahapanId:', bulkAddJenisTahapanId, 'bulkAddJenisCount:', bulkAddJenisCount);
                      addBulkJenisKerja(bulkAddJenisTahapanId, bulkAddJenisCount);
                      setShowBulkAddJenisModal(false);
                      setBulkAddJenisTahapanId(null);
                    }}
                    className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-4 rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl font-semibold text-lg transform hover:-translate-y-0.5"
                  >
                    Tambah {bulkAddJenisCount} Jenis Pekerjaan
                  </button>
                  <button
                    onClick={() => {
                      setShowBulkAddJenisModal(false);
                      setBulkAddJenisTahapanId(null);
                    }}
                    className="w-full border-2 border-gray-200 text-black px-6 py-4 rounded-xl hover:border-gray-300 hover:text-black transition-all duration-200 font-semibold text-lg transform hover:-translate-y-0.5"
                  >
                    Batal
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Bulk Add Uraian Modal */}
        {showBulkAddUraianModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md mx-4 border border-gray-200">
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-r from-purple-100 to-violet-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-violet-500 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-black mb-3">Tambah Banyak Uraian</h3>
                <p className="text-gray-700 mb-6 leading-relaxed">Berapa banyak uraian yang ingin Anda tambahkan?</p>
                
                <div className="mb-6">
                  <label htmlFor="bulkUraianCount" className="block text-sm font-medium text-black mb-3">
                    Jumlah Uraian (1-50)
                  </label>
                  <input
                    id="bulkUraianCount"
                    type="number"
                    min="1"
                    max="50"
                    value={bulkAddUraianCount}
                    onChange={(e) => {
                      const value = parseInt(e.target.value) || 1;
                      setBulkAddUraianCount(Math.max(1, Math.min(50, value)));
                    }}
                    onKeyPress={(e) => {
                      if (!/[0-9]/.test(e.key) && !['Backspace', 'Delete', 'Tab', 'Enter'].includes(e.key)) {
                        e.preventDefault();
                      }
                      if (e.key === 'Enter') {
                        addBulkUraian(bulkAddUraianTahapanId, bulkAddUraianJenisId, bulkAddUraianCount);
                        setShowBulkAddUraianModal(false);
                        setBulkAddUraianTahapanId(null);
                        setBulkAddUraianJenisId(null);
                      }
                    }}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all text-center text-lg font-semibold text-black"
                    placeholder="Masukkan jumlah uraian"
                    autoFocus
                  />
                  <p className="text-xs text-gray-600 mt-2 text-center">
                    Maksimal 50 uraian dalam satu kali penambahan
                  </p>
                  
                  <div className="flex justify-center space-x-2 mt-4">
                    <button
                      onClick={() => setBulkAddUraianCount(3)}
                      className={`px-3 py-2 rounded-lg transition-all duration-200 text-sm font-medium ${
                        bulkAddUraianCount === 3 
                          ? 'bg-purple-500 text-white shadow-md' 
                          : 'bg-gray-100 text-black hover:bg-gray-200 border border-gray-200'
                      }`}
                    >
                      3
                    </button>
                    <button
                      onClick={() => setBulkAddUraianCount(5)}
                      className={`px-3 py-2 rounded-lg transition-all duration-200 text-sm font-medium ${
                        bulkAddUraianCount === 5 
                          ? 'bg-purple-500 text-white shadow-md' 
                          : 'bg-gray-100 text-black hover:bg-gray-200 border border-gray-200'
                      }`}
                    >
                      5
                    </button>
                    <button
                      onClick={() => setBulkAddUraianCount(10)}
                      className={`px-3 py-2 rounded-lg transition-all duration-200 text-sm font-medium ${
                        bulkAddUraianCount === 10 
                          ? 'bg-purple-500 text-white shadow-md' 
                          : 'bg-gray-100 text-black hover:bg-gray-200 border border-gray-200'
                      }`}
                    >
                      10
                    </button>
                    <button
                      onClick={() => setBulkAddUraianCount(20)}
                      className={`px-3 py-2 rounded-lg transition-all duration-200 text-sm font-medium ${
                        bulkAddUraianCount === 20 
                          ? 'bg-purple-500 text-white shadow-md' 
                          : 'bg-gray-100 text-black hover:bg-gray-200 border border-gray-200'
                      }`}
                    >
                      20
                    </button>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <button
                    onClick={() => {
                      console.log('Uraian Button clicked - bulkAddUraianTahapanId:', bulkAddUraianTahapanId, 'bulkAddUraianJenisId:', bulkAddUraianJenisId, 'bulkAddUraianCount:', bulkAddUraianCount);
                      addBulkUraian(bulkAddUraianTahapanId, bulkAddUraianJenisId, bulkAddUraianCount);
                      setShowBulkAddUraianModal(false);
                      setBulkAddUraianTahapanId(null);
                      setBulkAddUraianJenisId(null);
                    }}
                    className="w-full bg-gradient-to-r from-purple-600 to-violet-600 text-white px-6 py-4 rounded-xl hover:from-purple-700 hover:to-violet-700 transition-all duration-200 shadow-lg hover:shadow-xl font-semibold text-lg transform hover:-translate-y-0.5"
                  >
                    Tambah {bulkAddUraianCount} Uraian
                  </button>
                  <button
                    onClick={() => {
                      setShowBulkAddUraianModal(false);
                      setBulkAddUraianTahapanId(null);
                      setBulkAddUraianJenisId(null);
                    }}
                    className="w-full border-2 border-gray-200 text-black px-6 py-4 rounded-xl hover:border-gray-300 hover:text-black transition-all duration-200 font-semibold text-lg transform hover:-translate-y-0.5"
                  >
                    Batal
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="relative">
        <div className="absolute inset-0 bg-gray-50"></div>
        <div className="relative w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden">
            <div className="bg-white px-8 py-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-red-500 mb-2">BOQ Generator</h1>
                  <p className="text-gray-600">Loading...</p>
                </div>
              </div>
            </div>
            <div className="p-8">
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default function BOQMaker() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <BOQMakerContent />
    </Suspense>
  );
}
