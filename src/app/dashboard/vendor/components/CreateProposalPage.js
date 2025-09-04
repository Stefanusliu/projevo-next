'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../../contexts/AuthContext';
import { doc, updateDoc, arrayRemove, arrayUnion, runTransaction } from 'firebase/firestore';
import { db } from '../../../../lib/firebase';

export default function CreateProposalPage({ project, existingProposal, isEditing, onBack, onNavigateToProfile }) {
  const { user, userProfile } = useAuth();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);

  // Form data state
  const [proposalData, setProposalData] = useState({
    boqPricing: [],
    negotiable: existingProposal?.negotiable || 'negotiable', // 'negotiable' or 'fixed'
    totalAmount: existingProposal?.totalAmount || 0
  });

  // Initialize BOQ pricing from project data
  useEffect(() => {
    if (project?.attachedBOQ?.tahapanKerja) {
      const initialPricing = [];
      
      project.attachedBOQ.tahapanKerja.forEach((tahapan, tahapanIndex) => {
        if (tahapan.jenisKerja) {
          tahapan.jenisKerja.forEach((jenis, jenisIndex) => {
            if (jenis.uraian) {
              jenis.uraian.forEach((uraian, uraianIndex) => {
                if (uraian.spec) {
                  uraian.spec.forEach((spec, specIndex) => {
                    const itemId = `${tahapanIndex}-${jenisIndex}-${uraianIndex}-${specIndex}`;
                    
                    // Find existing vendor price if editing
                    let existingVendorPrice = '';
                    if (isEditing && existingProposal?.boqPricing) {
                      const existingItem = existingProposal.boqPricing.find(item => item.id === itemId);
                      existingVendorPrice = existingItem?.vendorPrice || '';
                    }
                    
                    const vendorPrice = existingVendorPrice;
                    const volume = parseFloat(spec.volume) || 0;
                    const price = parseFloat(vendorPrice) || 0;
                    
                    initialPricing.push({
                      id: itemId,
                      tahapanName: tahapan.name || `Tahapan ${tahapanIndex + 1}`,
                      jenisName: jenis.name || `Jenis Kerja ${jenisIndex + 1}`,
                      uraianName: uraian.name || `Uraian ${uraianIndex + 1}`,
                      item: spec.description || 'No description',
                      volume: volume,
                      unit: spec.satuan || '',
                      originalPrice: parseFloat(spec.pricePerPcs) || 0,
                      vendorPrice: vendorPrice,
                      subtotal: price * volume
                    });
                  });
                }
              });
            }
          });
        }
      });
      
      setProposalData(prev => ({
        ...prev,
        boqPricing: initialPricing
      }));
    }
  }, [project, existingProposal, isEditing]);

  // Calculate total when prices change
  useEffect(() => {
    const calculateTotal = () => {
      const total = proposalData.boqPricing.reduce((sum, item) => {
        const price = parseFloat(item.vendorPrice) || 0;
        const volume = parseFloat(item.volume) || 0;
        return sum + (price * volume);
      }, 0);
      
      setProposalData(prev => ({
        ...prev,
        totalAmount: total
      }));
    };

    calculateTotal();
  }, [proposalData.boqPricing]);

  // Handle price input change
  const handlePriceChange = (itemId, newPrice) => {
    setProposalData(prev => ({
      ...prev,
      boqPricing: prev.boqPricing.map(item => {
        if (item.id === itemId) {
          const price = parseFloat(newPrice) || 0;
          const volume = parseFloat(item.volume) || 0;
          return {
            ...item,
            vendorPrice: newPrice,
            subtotal: price * volume
          };
        }
        return item;
      })
    }));
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Handle navigation between steps
  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Step progress component
  const StepProgress = () => (
    <div className="flex items-center justify-center mb-8">
      <div className="flex items-center space-x-4">
        {[1, 2, 3].map((step) => (
          <div key={step} className="flex items-center">
            <div className={`
              w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm
              ${step <= currentStep 
                ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg' 
                : 'bg-slate-200 text-slate-500'
              }
            `}>
              {step < currentStep ? (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              ) : step}
            </div>
            {step < 3 && (
              <div className={`w-16 h-1 mx-2 ${step < currentStep ? 'bg-gradient-to-r from-blue-500 to-indigo-600' : 'bg-slate-200'}`} />
            )}
          </div>
        ))}
      </div>
    </div>
  );

  // Step titles
  const getStepTitle = () => {
    switch (currentStep) {
      case 1: return 'Penetapan Harga BOQ';
      case 2: return 'Pilihan Negosiasi';
      case 3: return 'Ringkasan & Konfirmasi';
      default: return 'Penetapan Harga BOQ';
    }
  };

  const getStepDescription = () => {
    switch (currentStep) {
      case 1: return isEditing ? 'Update harga untuk setiap item dalam Bill of Quantity' : 'Masukkan harga untuk setiap item dalam Bill of Quantity';
      case 2: return 'Tentukan apakah harga yang Anda tawarkan dapat dinegosiasi';
      case 3: return isEditing ? 'Tinjau perubahan penawaran Anda sebelum menyimpan' : 'Tinjau penawaran Anda sebelum mengirim';
      default: return '';
    }
  };

  // Handle form submission
  const handleSubmitProposal = async () => {
    setLoading(true);
    
    try {
      // Validate required location information
      if (!userProfile?.city || !userProfile?.province) {
        setShowLocationModal(true);
        setLoading(false);
        return;
      }
      
      const now = new Date().toISOString();
      
      // Debug logging
      console.log('=== PROPOSAL SUBMISSION DEBUG ===');
      console.log('User:', user);
      console.log('User UID:', user?.uid);
      console.log('User Email:', user?.email);
      console.log('User City:', userProfile?.city);
      console.log('User Province:', userProfile?.province);
      console.log('Project:', project);
      console.log('Project ID:', project?.id);
      console.log('Project Owner ID:', project?.ownerId);
      console.log('Is Editing:', isEditing);
      console.log('Existing Proposal:', existingProposal);
      console.log('================================');
      
      if (isEditing && existingProposal) {
        // Update existing proposal in project's proposals array using transaction
        const projectRef = doc(db, 'projects', project.id);
        
        console.log('Editing proposal. Existing proposal:', existingProposal);
        
        // Use transaction to ensure atomic update
        await runTransaction(db, async (transaction) => {
          const projectDoc = await transaction.get(projectRef);
          
          if (!projectDoc.exists()) {
            throw new Error('Project not found');
          }
          
          const currentData = projectDoc.data();
          const currentProposals = currentData.proposals || [];
          
          console.log('Current proposals:', currentProposals);
          
          // Find and update the vendor's proposal
          const updatedProposals = currentProposals.map(proposal => {
            if (proposal.vendorId === user.uid) {
              console.log('Found vendor proposal to update:', proposal);
              return {
                ...proposal,
                vendorEmail: user.email,
                vendorPhone: userProfile?.phoneNumber || '',
                vendorFirstName: userProfile?.firstName || '',
                vendorLastName: userProfile?.lastName || '',
                vendorCompany: userProfile?.company || '',
                vendorAccountType: userProfile?.accountType || 'individu',
                vendorName: userProfile?.accountType === 'perusahaan' 
                  ? (userProfile?.company || user.displayName || user.email?.split('@')[0] || 'Unknown Vendor')
                  : (user.displayName || `${userProfile?.firstName || ''} ${userProfile?.lastName || ''}`.trim() || user.email?.split('@')[0] || 'Unknown Vendor'),
                vendorCity: userProfile?.city || '',
                vendorProvince: userProfile?.province || '',
                boqPricing: proposalData.boqPricing,
                totalAmount: proposalData.totalAmount,
                negotiable: proposalData.negotiable,
                proposalType: proposalData.negotiable === 'negotiable' ? 'Negotiable' : 'Fixed',
                boqType: proposalData.negotiable === 'negotiable' ? 'Negotiable' : 'Fixed',
                status: 'submitted',
                updatedAt: now
              };
            }
            return proposal;
          });
          
          console.log('Updated proposals:', updatedProposals);
          
          // Update the document
          transaction.update(projectRef, {
            proposals: updatedProposals,
            updatedAt: now
          });
        });
        
        console.log('Proposal update completed successfully');
        // Show success message and go back
        alert('Proposal updated successfully!');
        
        // Give user time to see the success message, then refresh data
        setTimeout(() => {
          onBack();
        }, 1000);
      } else {
        // Create new proposal
        console.log('Creating new proposal...');
        const proposalData_new = {
          id: Date.now().toString(),
          projectId: project.id,
          vendorId: user.uid,
          vendorEmail: user.email,
          vendorPhone: userProfile?.phoneNumber || '',
          vendorFirstName: userProfile?.firstName || '',
          vendorLastName: userProfile?.lastName || '',
          vendorCompany: userProfile?.company || '',
          vendorAccountType: userProfile?.accountType || 'individu',
          vendorName: userProfile?.accountType === 'perusahaan' 
            ? (userProfile?.company || user.displayName || user.email?.split('@')[0] || 'Unknown Vendor')
            : (user.displayName || `${userProfile?.firstName || ''} ${userProfile?.lastName || ''}`.trim() || user.email?.split('@')[0] || 'Unknown Vendor'),
          vendorDomisili: userProfile?.location || 'Location not specified',
          vendorLocation: userProfile?.location || 'Location not specified',
          vendorCity: userProfile?.city || '',
          vendorProvince: userProfile?.province || '',
          boqPricing: proposalData.boqPricing,
          totalAmount: proposalData.totalAmount,
          negotiable: proposalData.negotiable,
          proposalType: proposalData.negotiable === 'negotiable' ? 'Negotiable' : 'Fixed',
          boqType: proposalData.negotiable === 'negotiable' ? 'Negotiable' : 'Fixed',
          status: 'submitted',
          submittedAt: now,
          createdAt: now
        };

        console.log('New proposal data:', proposalData_new);

        // Add to project's proposals array
        const projectRef = doc(db, 'projects', project.id);
        
        console.log('Attempting to update project with ID:', project.id);
        console.log('Update data:', {
          proposals: 'arrayUnion(proposalData_new)',
          updatedAt: now
        });
        
        await updateDoc(projectRef, {
          proposals: arrayUnion(proposalData_new),
          updatedAt: now
        });
        
        console.log('Proposal submitted successfully!');
        
        // Show success message and go back
        alert('Proposal submitted successfully!');
        
        // Give user time to see the success message, then refresh data
        setTimeout(() => {
          onBack();
        }, 1000);
      }
      
    } catch (error) {
      console.error('Error submitting proposal:', error);
      console.error('Error details:', {
        code: error.code,
        message: error.message,
        stack: error.stack
      });
      
      let errorMessage = `Error ${isEditing ? 'updating' : 'submitting'} proposal. Please try again.`;
      
      // Provide more specific error messages
      if (error.code === 'permission-denied') {
        errorMessage = 'Permission denied. Please check your authentication and try again.';
      } else if (error.code === 'not-found') {
        errorMessage = 'Project not found. Please refresh the page and try again.';
      } else if (error.message?.includes('offline')) {
        errorMessage = 'You appear to be offline. Please check your internet connection.';
      }
      
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Validate step
  const validateStep = (step) => {
    switch (step) {
      case 1:
        return proposalData.boqPricing.every(item => item.vendorPrice && parseFloat(item.vendorPrice) > 0);
      case 2:
        return proposalData.negotiable;
      case 3:
        return true; // Summary step
      default:
        return false;
    }
  };

  // Location modal handlers
  const handleSetLocationNow = () => {
    setShowLocationModal(false);
    // Use the callback to close create proposal view and navigate to profile
    if (onNavigateToProfile) {
      onNavigateToProfile();
    } else {
      // Fallback to direct navigation
      router.push('/dashboard/vendor?tab=profile');
    }
  };

  const handleSetLocationLater = () => {
    setShowLocationModal(false);
  };

  // Step navigation
  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 3));
    } else {
      alert('Please complete all required fields before proceeding.');
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  if (!project) {
    return (
      <div className="p-6">
        <p>Project not found</p>
        <button onClick={onBack} className="mt-4 px-4 py-2 bg-gray-500 text-white rounded">
          Kembali
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Professional Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          {/* Top Header Row */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <button
                onClick={onBack}
                className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-gray-50 border border-gray-300 rounded-lg hover:bg-gray-100 hover:text-gray-900 transition-colors"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Kembali ke Proyek
              </button>
              
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    {isEditing ? 'Edit Proposal' : 'Create Proposal'}
                  </h1>
                  <p className="text-sm text-gray-600">{project.title || project.projectTitle}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-center">
            <div className="flex items-center space-x-8">
              {/* Step 1 */}
              <div className="flex items-center space-x-3">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-200 ${
                  currentStep >= 1 
                    ? 'bg-blue-600 border-blue-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-400'
                }`}>
                  {currentStep > 1 ? (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  )}
                </div>
                <div className="text-center">
                  <div className={`text-sm font-medium ${currentStep === 1 ? 'text-blue-600' : 'text-gray-900'}`}>
                    BOQ Pricing
                  </div>
                  <div className="text-xs text-gray-500 mt-1">Set your prices</div>
                </div>
              </div>

              {/* Connector Line 1 */}
              <div className={`w-16 h-0.5 ${currentStep > 1 ? 'bg-blue-600' : 'bg-gray-300'} transition-colors duration-200`}></div>

              {/* Step 2 */}
              <div className="flex items-center space-x-3">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-200 ${
                  currentStep >= 2 
                    ? 'bg-blue-600 border-blue-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-400'
                }`}>
                  {currentStep > 2 ? (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  )}
                </div>
                <div className="text-center">
                  <div className={`text-sm font-medium ${currentStep === 2 ? 'text-blue-600' : 'text-gray-900'}`}>
                    Terms & Options
                  </div>
                  <div className="text-xs text-gray-500 mt-1">Set conditions</div>
                </div>
              </div>

              {/* Connector Line 2 */}
              <div className={`w-16 h-0.5 ${currentStep > 2 ? 'bg-blue-600' : 'bg-gray-300'} transition-colors duration-200`}></div>

              {/* Step 3 */}
              <div className="flex items-center space-x-3">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-200 ${
                  currentStep >= 3 
                    ? 'bg-blue-600 border-blue-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-400'
                }`}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="text-center">
                  <div className={`text-sm font-medium ${currentStep === 3 ? 'text-blue-600' : 'text-gray-900'}`}>
                    Review & Submit
                  </div>
                  <div className="text-xs text-gray-500 mt-1">Final review</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Step 1: Enhanced BOQ Pricing */}
        {currentStep === 1 && (
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 border-b border-blue-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <div className="flex items-center gap-3">
                    <h2 className="text-xl font-semibold text-gray-900">Langkah 1: Penetapan Harga BOQ</h2>
                    {isEditing && (
                      <span className="px-3 py-1 text-xs font-medium bg-amber-100 text-amber-800 rounded-full">
                        Editing
                      </span>
                    )}
                  </div>
                  <p className="text-blue-700 mt-1">
                    {isEditing ? 'Update your competitive prices for each item' : 'Fill in your competitive price for each item in the Bill of Quantities'}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="p-6">
              {proposalData.boqPricing.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <p className="text-gray-500 text-lg">No BOQ data available for this project</p>
                  <p className="text-gray-400 text-sm mt-2">Contact the project owner for BOQ details</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Pricing Summary Card */}
                  <div className="bg-gradient-to-r from-emerald-50 to-blue-50 rounded-lg p-4 border border-emerald-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-emerald-600 rounded-full flex items-center justify-center">
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-700">Current Total</p>
                          <p className="text-2xl font-bold text-emerald-700">{formatCurrency(proposalData.totalAmount)}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">{proposalData.boqPricing.length} items</p>
                        <p className="text-xs text-gray-500">
                          {proposalData.boqPricing.filter(item => item.vendorPrice && parseFloat(item.vendorPrice) > 0).length} priced
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Enhanced BOQ Table */}
                  <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gradient-to-r from-gray-50 to-blue-50">
                          <tr>
                            <th className="px-4 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-r border-gray-200">
                              Tahapan
                            </th>
                            <th className="px-4 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-r border-gray-200">
                              Jenis Kerja
                            </th>
                            <th className="px-4 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-r border-gray-200">
                              Uraian
                            </th>
                            <th className="px-4 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-r border-gray-200">
                              Deskripsi Item
                            </th>
                            <th className="px-4 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider border-r border-gray-200">
                              Volume
                            </th>
                            <th className="px-4 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider border-r border-gray-200">
                              Satuan
                            </th>
                            <th className="px-4 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider border-r border-gray-200">
                              Harga Referensi
                            </th>
                            <th className="px-4 py-4 text-right text-xs font-semibold text-blue-700 uppercase tracking-wider border-r border-gray-200 bg-blue-50">
                              Harga Anda *
                            </th>
                            <th className="px-4 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                              Subtotal
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {proposalData.boqPricing.map((item, index) => (
                            <tr key={item.id} className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50 transition-colors`}>
                              <td className="px-4 py-4 text-sm text-gray-900 border-r border-gray-200 font-medium">
                                {item.tahapanName}
                              </td>
                              <td className="px-4 py-4 text-sm text-gray-700 border-r border-gray-200">
                                {item.jenisName}
                              </td>
                              <td className="px-4 py-4 text-sm text-gray-700 border-r border-gray-200">
                                {item.uraianName}
                              </td>
                              <td className="px-4 py-4 text-sm text-gray-700 border-r border-gray-200">
                                {item.item}
                              </td>
                              <td className="px-4 py-4 text-sm text-gray-900 text-right border-r border-gray-200 font-semibold">
                                {item.volume}
                              </td>
                              <td className="px-4 py-4 text-sm text-gray-700 text-center border-r border-gray-200">
                                <span className="px-2 py-1 bg-gray-100 rounded text-xs font-medium">{item.unit}</span>
                              </td>
                              <td className="px-4 py-4 text-sm text-gray-600 text-right border-r border-gray-200">
                                {formatCurrency(item.originalPrice)}
                              </td>
                              <td className="px-4 py-4 border-r border-gray-200">
                                <div className="relative">
                                  <input
                                    type="number"
                                    value={item.vendorPrice}
                                    onChange={(e) => handlePriceChange(item.id, e.target.value)}
                                    className="w-full px-3 py-2 text-sm border rounded-lg text-right focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all border-gray-300 bg-white text-black placeholder-gray-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                    placeholder="Enter your price"
                                    min="0"
                                    step="any"
                                    required
                                  />
                                </div>
                              </td>
                              <td className="px-4 py-4 text-sm font-semibold text-gray-900 text-right">
                                <span className={item.subtotal > 0 ? 'text-emerald-700' : 'text-gray-400'}>
                                  {formatCurrency(item.subtotal)}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot className="bg-gradient-to-r from-gray-100 to-blue-100">
                          <tr>
                            <td colSpan="8" className="px-4 py-4 text-sm font-semibold text-gray-900 text-right border-r border-gray-300">
                              <div className="flex items-center justify-end gap-2">
                                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                                </svg>
                                Total Proposal Amount:
                              </div>
                            </td>
                            <td className="px-4 py-4 text-lg font-bold text-blue-700 text-right">
                              {formatCurrency(proposalData.totalAmount)}
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>

                  {/* Pricing Tips */}
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-5 h-5 text-amber-600 mt-0.5">
                        <svg fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-amber-800 mb-1">Tips Penetapan Harga</h3>
                        <ul className="text-sm text-amber-700 space-y-1">
                          <li>• Pertimbangkan harga pasar dan kompetitor Anda</li>
                          <li>• Perhitungkan biaya material, tenaga kerja, dan margin keuntungan</li>
                          <li>• Harga referensi hanya sebagai panduan</li>
                          <li>• Semua harga harus dalam Rupiah Indonesia (IDR)</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 2: Enhanced Terms & Options */}
        {currentStep === 2 && (
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-6 border-b border-indigo-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Langkah 2: Syarat & Opsi</h2>
                  <p className="text-indigo-700 mt-1">
                    Define your pricing terms and project conditions
                  </p>
                </div>
              </div>
            </div>
            
            <div className="p-6 space-y-8">
              {/* Pricing Terms Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                  <label className="text-lg font-semibold text-gray-900">
                    Pricing Terms *
                  </label>
                </div>
                <p className="text-gray-600 text-sm mb-4">
                  Choose whether your pricing is negotiable or fixed. This affects how clients can interact with your proposal.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <label className={`group relative flex items-start space-x-4 p-6 border-2 rounded-xl cursor-pointer transition-all hover:shadow-md ${
                    proposalData.negotiable === 'negotiable' 
                      ? 'border-emerald-500 bg-emerald-50' 
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}>
                    <input
                      type="radio"
                      name="negotiable"
                      value="negotiable"
                      checked={proposalData.negotiable === 'negotiable'}
                      onChange={(e) => setProposalData(prev => ({ ...prev, negotiable: e.target.value }))}
                      className="mt-1 text-emerald-600 focus:ring-emerald-500"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        <span className="font-semibold text-gray-900">Harga Negotiable</span>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">
                        Harga Anda dapat didiskusikan dan disesuaikan selama negosiasi dengan klien
                      </p>
                      <div className="flex items-center gap-2 text-xs text-emerald-700">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Fleksibel untuk klien
                      </div>
                    </div>
                    {proposalData.negotiable === 'negotiable' && (
                      <div className="absolute top-2 right-2">
                        <div className="w-6 h-6 bg-emerald-600 rounded-full flex items-center justify-center">
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      </div>
                    )}
                  </label>
                  
                  <label className={`group relative flex items-start space-x-4 p-6 border-2 rounded-xl cursor-pointer transition-all hover:shadow-md ${
                    proposalData.negotiable === 'fixed' 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}>
                    <input
                      type="radio"
                      name="negotiable"
                      value="fixed"
                      checked={proposalData.negotiable === 'fixed'}
                      onChange={(e) => setProposalData(prev => ({ ...prev, negotiable: e.target.value }))}
                      className="mt-1 text-blue-600 focus:ring-blue-500"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                        <span className="font-semibold text-gray-900">Harga Tidak Negotiable</span>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">
                        Harga Anda bersifat final dan tidak dapat diubah selama negosiasi
                      </p>
                      <div className="flex items-center gap-2 text-xs text-blue-700">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Struktur harga yang jelas
                      </div>
                    </div>
                    {proposalData.negotiable === 'fixed' && (
                      <div className="absolute top-2 right-2">
                        <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      </div>
                    )}
                  </label>
                </div>
              </div>

              {/* Professional Tips */}
              <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 text-indigo-600 mt-0.5">
                    <svg fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-indigo-800 mb-1">Professional Tips</h3>
                    <ul className="text-sm text-indigo-700 space-y-1">
                      <li>&bull; Be clear about what&apos;s included in your pricing</li>
                      <li>&bull; Mention quality certifications or standards you follow</li>
                      <li>&bull; Consider mentioning your team size and experience</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Enhanced Summary */}
        {currentStep === 3 && (
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 p-6 border-b border-emerald-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-600 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Langkah 3: Ringkasan Penawaran</h2>
                  <p className="text-emerald-700 mt-1">
                    Tinjau penawaran lengkap Anda sebelum pengiriman
                  </p>
                </div>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Project Overview Card */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Project Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Project Title:</p>
                        <p className="font-semibold text-gray-900">{project.title || project.projectTitle}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Location:</p>
                        <p className="font-semibold text-gray-900">{project.city}, {project.province}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Project Type:</p>
                        <p className="font-semibold text-gray-900">{project.projectType || 'Construction Project'}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Proposal Date:</p>
                        <p className="font-semibold text-gray-900">{new Date().toLocaleDateString('id-ID')}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Pricing Summary Card */}
              <div className="bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl p-6 border border-emerald-200">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Pricing Summary</h3>
                </div>
                
                <div className="bg-white rounded-lg p-4 border border-emerald-200">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-sm text-gray-600">Total Jumlah Penawaran</p>
                      <p className="text-3xl font-bold text-emerald-700">
                        {formatCurrency(proposalData.totalAmount)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Item BOQ</p>
                      <p className="text-xl font-semibold text-gray-900">{proposalData.boqPricing.length}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-emerald-100">
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Tipe Harga</p>
                      <div className="flex items-center justify-center gap-2 mt-1">
                        <div className={`w-3 h-3 rounded-full ${proposalData.negotiable === 'negotiable' ? 'bg-emerald-500' : 'bg-blue-500'}`}></div>
                        <p className="font-semibold text-gray-900">
                          {proposalData.negotiable === 'negotiable' ? 'Negotiable' : 'Harga Tetap'}
                        </p>
                      </div>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Kelengkapan</p>
                      <div className="flex items-center justify-center gap-1 mt-1">
                        <svg className="w-4 h-4 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <p className="font-semibold text-emerald-700">100%</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* BOQ Breakdown */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  <h3 className="text-lg font-semibold text-gray-900">Rincian Harga BOQ</h3>
                </div>
                
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                  <div className="max-h-64 overflow-y-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 sticky top-0">
                        <tr>
                          <th className="px-4 py-3 text-left font-medium text-gray-700">Item</th>
                          <th className="px-4 py-3 text-right font-medium text-gray-700">Volume</th>
                          <th className="px-4 py-3 text-right font-medium text-gray-700">Harga Satuan</th>
                          <th className="px-4 py-3 text-right font-medium text-gray-700">Subtotal</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {proposalData.boqPricing.slice(0, 5).map((item, index) => (
                          <tr key={item.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3">
                              <div>
                                <p className="font-medium text-gray-900">{item.item}</p>
                                <p className="text-xs text-gray-500">{item.tahapanName} - {item.jenisName}</p>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-right text-gray-900">{item.volume} {item.unit}</td>
                            <td className="px-4 py-3 text-right text-gray-900">{formatCurrency(item.vendorPrice)}</td>
                            <td className="px-4 py-3 text-right font-semibold text-gray-900">{formatCurrency(item.subtotal)}</td>
                          </tr>
                        ))}
                        {proposalData.boqPricing.length > 5 && (
                          <tr>
                            <td colSpan="4" className="px-4 py-3 text-center text-gray-500 italic">
                              ... and {proposalData.boqPricing.length - 5} more items
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Terms & Conditions */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <h3 className="text-lg font-semibold text-gray-900">Terms & Conditions</h3>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <svg className="w-4 h-4 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <p className="text-sm text-gray-700">
                      <strong>Timeline:</strong> {proposalData.timeline}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <svg className="w-4 h-4 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <p className="text-sm text-gray-700">
                      <strong>Pricing:</strong> {proposalData.negotiable === 'negotiable' ? 'Open for negotiation' : 'Fixed pricing - not negotiable'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Important Notice */}
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-6">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-amber-800 mb-2">Before You Submit</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-amber-700">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          <span>Double-check all prices for accuracy</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          <span>Ensure timeline is realistic</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          <span>You can edit this proposal only if the deadline is more than 24 hours away</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          <span>Client will review and may contact you</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Navigation Buttons */}
        <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
          <button
            onClick={prevStep}
            disabled={currentStep === 1}
            className="flex items-center gap-2 px-6 py-3 text-gray-700 bg-white border-2 border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:border-gray-300 transition-all duration-200 font-medium"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Langkah Sebelumnya
          </button>

          <div className="flex items-center space-x-4">
            {/* Step Indicator for Mobile */}
            <div className="lg:hidden flex items-center space-x-2">
              {[1, 2, 3].map((step) => (
                <div
                  key={step}
                  className={`w-3 h-3 rounded-full transition-colors ${
                    currentStep >= step ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>

            {currentStep < 3 ? (
              <button
                onClick={nextStep}
                disabled={!validateStep(currentStep)}
                className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:from-blue-600 disabled:hover:to-indigo-600 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                Langkah Selanjutnya
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            ) : (
              <button
                onClick={handleSubmitProposal}
                disabled={loading}
                className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-emerald-600 to-green-600 text-white rounded-lg hover:from-emerald-700 hover:to-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    {isEditing ? 'Memperbarui Penawaran...' : 'Mengirim Penawaran...'}
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                    {isEditing ? 'Perbarui Penawaran' : 'Kirim Penawaran'}
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Location Modal */}
      {showLocationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 m-4 max-w-md w-full">
            <div className="flex items-center mb-4">
              <div className="flex-shrink-0">
                <svg className="w-8 h-8 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-medium text-gray-900">
                  Your Location is Not Set Yet
                </h3>
              </div>
            </div>
            <p className="text-gray-600 mb-6">
              To submit a proposal, you need to complete your location information (city and province). This helps project owners know where you&apos;re located.
            </p>
            <p className="text-sm text-gray-500 mb-6">
              Do you want to set your location now or later?
            </p>
            <div className="flex space-x-3">
              <button
                onClick={handleSetLocationLater}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Later
              </button>
              <button
                onClick={handleSetLocationNow}
                className="flex-1 px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
              >
                Set Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
