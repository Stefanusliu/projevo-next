'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { MdAdd, MdClose, MdDelete, MdDragIndicator, MdFileDownload, MdSave, MdEdit, MdVisibility, MdArrowBack, MdMessage, MdSend } from 'react-icons/md';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { firestoreService } from '../../hooks/useFirestore';
import { useAuth } from '../../contexts/AuthContext';

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
    const tahapanName = item.tahapanName || item.tahapanKerja || 'Tahapan Kerja Utama';
    const jenisName = item.jenisName || item.jenisKerja || 'Pekerjaan Umum';
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
    
    // Get the original/previous price - prioritize hasOriginalPrice from the item
    const originalPrice = item.hasOriginalPrice ? parseFloat(item.originalPrice || 0) : 0;
    const currentPrice = parseFloat(item.currentPrice || item.vendorPrice || item.subtotal || 0);
    
    groupedData[tahapanName][jenisName].push({
      name: uraianName,
      specs: [{
        description: item.item || item.description || item.name || uraianName,
        satuan: item.unit || item.satuan || 'unit',
        volume: volume,
        pricePerPcs: pricePerUnit,
        originalPrice: originalPrice,
        currentPrice: currentPrice,
        vendorPrice: finalPrice,
        subtotal: finalPrice,
        hasOriginalPrice: item.hasOriginalPrice || false,
        priceChange: parseFloat(item.priceChange || 0)
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
          subtotal: specItem.subtotal || 0,
          hasOriginalPrice: specItem.hasOriginalPrice || false,
          priceChange: specItem.priceChange || 0
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

function BOQPenawaranContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading: authLoading } = useAuth();
  
  // All useState hooks must be called at the top, before any conditional returns
  const [currentView, setCurrentView] = useState('editor');
  const [currentBOQId, setCurrentBOQId] = useState(null);
  const [boqTitle, setBoqTitle] = useState('');
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
  const [editMode, setEditMode] = useState(true); // Enable editing for proposal submission
  const [proposalMessage, setProposalMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [projectData, setProjectData] = useState(null);
  const [projectId, setProjectId] = useState(null);

  // Get project ID and existing proposal data from URL params
  const projectIdParam = searchParams?.get('projectId');
  const proposalIdParam = searchParams?.get('proposalId');

  const loadProjectAndProposalData = useCallback(async () => {
    if (!projectIdParam) {
      setError('Project ID is missing from URL. Please access this page through the vendor dashboard.');
      setLoading(false);
      return;
    }

    if (!user?.uid) {
      setError('User not authenticated. Please log in to continue.');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      let finalBoqData = null;
      
      // Load project data
      const project = await firestoreService.get('projects', projectIdParam);
      if (!project) {
        throw new Error('Project not found');
      }
      
      setProjectData(project);
      setProjectId(projectIdParam);
      setBoqTitle(`Penawaran BOQ - ${project.projectTitle || 'Untitled Project'}`);

      // If proposalId is provided, load existing proposal data
      if (proposalIdParam) {
        // First try to find the proposal in the project's proposals array
        let existingProposal = project.proposals?.find(p => p.id === proposalIdParam);
        
        // If not found in project, try loading from proposals collection
        if (!existingProposal) {
          existingProposal = await firestoreService.get('proposals', proposalIdParam);
        }
        
        if (existingProposal && existingProposal.vendorId === user.uid) {
          // Load existing proposal BOQ data
          if (existingProposal.boqPricing && existingProposal.boqPricing.length > 0) {
            const tahapanData = convertBoqPricingToTahapanKerja(existingProposal.boqPricing);
            finalBoqData = tahapanData;
            setProposalMessage(existingProposal.resubmissionNotes || '');
          }
        }
      } else {
        // Load project's original BOQ as template for new proposal
        if (project.attachedBOQ?.tahapanKerja) {
          // Deep copy the project BOQ to avoid modifying original
          const templateData = JSON.parse(JSON.stringify(project.attachedBOQ.tahapanKerja));
          // Reset all prices to 0 for new proposal
          templateData.forEach(tahapan => {
            tahapan.jenisKerja?.forEach(jenis => {
              jenis.uraian?.forEach(uraian => {
                uraian.spec?.forEach(spec => {
                  spec.pricePerPcs = 0;
                });
              });
            });
          });
          finalBoqData = templateData;
        }
      }
      
      // Set BOQ data if we loaded proposal data
      if (finalBoqData) {
        setTahapanKerja(finalBoqData);
      }
      
    } catch (err) {
      console.error('Error loading project/proposal data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [projectIdParam, proposalIdParam, user?.uid]);

  // Authentication check
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  // Effect to load BOQ data
  useEffect(() => {
    if (!authLoading) {
      loadProjectAndProposalData();
    }
  }, [loadProjectAndProposalData, authLoading]);

  // Show loading while authentication is still loading
  if (authLoading || loading) {
    return <LoadingFallback />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <main className="relative">
          <div className="absolute inset-0 bg-gray-50"></div>
          <div className="relative w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden">
              <div className="bg-white px-8 py-6">
                <div className="text-center">
                  <h1 className="text-2xl font-bold text-red-600 mb-2">Error</h1>
                  <p className="text-gray-600">{error}</p>
                  <button
                    onClick={() => router.push('/dashboard/vendor')}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Back to Dashboard
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Show loading if user is not loaded yet
  if (!user) {
    return <LoadingFallback />;
  }

  const updatePrice = (tahapanId, jenisId, uraianId, specId, newPrice) => {
    setTahapanKerja(prevData => {
      const newData = [...prevData];
      const tahapanIndex = newData.findIndex(t => t.id === tahapanId);
      if (tahapanIndex >= 0) {
        const jenisIndex = newData[tahapanIndex].jenisKerja.findIndex(j => j.id === jenisId);
        if (jenisIndex >= 0) {
          const uraianIndex = newData[tahapanIndex].jenisKerja[jenisIndex].uraian.findIndex(u => u.id === uraianId);
          if (uraianIndex >= 0) {
            const specIndex = newData[tahapanIndex].jenisKerja[jenisIndex].uraian[uraianIndex].spec.findIndex(s => s.id === specId);
            if (specIndex >= 0) {
              newData[tahapanIndex].jenisKerja[jenisIndex].uraian[uraianIndex].spec[specIndex].pricePerPcs = parseFloat(newPrice) || 0;
            }
          }
        }
      }
      return newData;
    });
  };

  const calculateGrandTotal = () => {
    let total = 0;
    tahapanKerja.forEach(tahapan => {
      tahapan.jenisKerja.forEach(jenis => {
        jenis.uraian.forEach(uraian => {
          uraian.spec.forEach(spec => {
            const specTotal = (spec.volume || 0) * (spec.pricePerPcs || 0);
            total += specTotal;
          });
        });
      });
    });
    return total;
  };

  const handleSubmitProposal = async () => {
    if (!user?.uid || !projectId || !tahapanKerja) {
      alert('Missing required data for proposal submission');
      return;
    }

    const grandTotal = calculateGrandTotal();
    if (grandTotal <= 0) {
      alert('Please enter valid prices for your proposal');
      return;
    }

    try {
      setIsSubmitting(true);

      // Convert tahapanKerja back to boqPricing format
      const boqPricing = [];
      tahapanKerja.forEach((tahapan, tahapanIndex) => {
        tahapan.jenisKerja?.forEach((jenis, jenisIndex) => {
          jenis.uraian?.forEach((uraian, uraianIndex) => {
            uraian.spec?.forEach((spec, specIndex) => {
              if (spec.pricePerPcs > 0) {
                boqPricing.push({
                  tahapanName: tahapan.name,
                  jenisName: jenis.name,
                  uraianName: uraian.name,
                  item: spec.description,
                  description: spec.description,
                  unit: spec.satuan,
                  satuan: spec.satuan,
                  volume: spec.volume || 0,
                  pricePerPcs: spec.pricePerPcs || 0,
                  vendorPrice: spec.pricePerPcs || 0,
                  subtotal: (spec.volume || 0) * (spec.pricePerPcs || 0),
                  tahapanId: `${tahapanIndex}-${jenisIndex}-${uraianIndex}-${specIndex}`,
                  jenisId: `jenis-${jenisIndex}`,
                  uraianId: `uraian-${uraianIndex}`,
                  specId: `spec-${specIndex}`,
                  id: `${tahapanIndex}-${jenisIndex}-${uraianIndex}-${specIndex}`,
                  specification: spec.description,
                  itemDescription: spec.description
                });
              }
            });
          });
        });
      });

      const proposalData = {
        projectId: projectId,
        vendorId: user.uid,
        vendorName: user.displayName || user.email?.split('@')[0],
        vendorEmail: user.email,
        boqPricing: boqPricing,
        totalAmount: grandTotal,
        boqTitle: boqTitle,
        status: proposalIdParam ? 'negotiating' : 'pending_review',
        submittedAt: new Date().toISOString(),
        proposalMessage: proposalMessage,
        isResubmission: !!proposalIdParam
      };

      if (proposalIdParam) {
        // Update existing proposal
        await firestoreService.update('proposals', proposalIdParam, {
          ...proposalData,
          updatedAt: new Date().toISOString(),
          resubmissionDate: new Date().toISOString(),
          resubmissionNotes: proposalMessage
        });
        
        // Also update in project's proposals array
        const updatedProposals = projectData.proposals.map(p => 
          p.id === proposalIdParam ? { ...p, ...proposalData } : p
        );
        await firestoreService.update('projects', projectId, { proposals: updatedProposals });
        
        alert('Proposal updated successfully!');
      } else {
        // Create new proposal
        const newProposal = await firestoreService.add('proposals', {
          ...proposalData,
          id: Date.now().toString(),
          createdAt: new Date().toISOString()
        });
        
        // Add to project's proposals array
        const updatedProposals = [...(projectData.proposals || []), { ...proposalData, id: newProposal.id }];
        await firestoreService.update('projects', projectId, { proposals: updatedProposals });
        
        alert('Proposal submitted successfully!');
      }

      router.push('/dashboard/vendor');
    } catch (error) {
      console.error('Error submitting proposal:', error);
      alert('Error submitting proposal. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <main className="relative">
        {/* Background gradient effects */}
        <div className="absolute inset-0 bg-gray-50"></div>
        
        <div className="relative w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden">
            <div className="bg-white px-8 py-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-blue-600 mb-2">Submit BOQ Proposal</h1>
                  <p className="text-gray-600">Enter your pricing for project proposal submission</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <button
                    onClick={() => router.push('/dashboard/vendor')}
                    className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg font-medium text-sm flex items-center"
                  >
                    <MdArrowBack className="w-4 h-4 mr-2" />
                    Back to Dashboard
                  </button>
                  <button
                    onClick={handleSubmitProposal}
                    disabled={isSubmitting || calculateGrandTotal() <= 0}
                    className={`px-4 py-2 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg font-medium text-sm flex items-center ${
                      isSubmitting || calculateGrandTotal() <= 0
                        ? 'bg-gray-400 cursor-not-allowed text-white'
                        : 'bg-green-600 hover:bg-green-700 text-white'
                    }`}
                  >
                    <MdSend className="w-4 h-4 mr-2" />
                    {isSubmitting ? 'Submitting...' : (proposalIdParam ? 'Update Proposal' : 'Submit Proposal')}
                  </button>
                </div>
              </div>
            </div>

            {/* Proposal Message */}
            <div className="px-8 py-4 border-b border-gray-200">
              <textarea
                value={proposalMessage}
                onChange={(e) => setProposalMessage(e.target.value)}
                placeholder="Add notes or comments for your proposal..."
                className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
              />
            </div>

            <div className="px-8 py-6 border-b border-gray-200 bg-white">
              <div className="max-w-4xl">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {boqTitle || 'BOQ Proposal'}
                </h1>
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
                            Your Price
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
                          // Empty tahapan row
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
                              // Empty jenis row
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
                                
                                // Show uraian row with inline spec data
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
                                  spec: uraian.spec.length > 0 ? uraian.spec[0] : null,
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
                          // Check if this is the first row for this tahapan
                          const isFirstTahapanRow = rows.findIndex(r => r.tahapanId === row.tahapanId) === rowIndex;
                          
                          // Calculate rowspan for tahapan (how many rows belong to this tahapan)
                          const tahapanRowSpan = rows.filter(r => r.tahapanId === row.tahapanId).length;
                          // Calculate rowspan for jenis (how many rows belong to this jenis)
                          const jenisRowSpan = rows.filter(r => r.jenisId === row.jenisId && r.jenisId).length;

                          return (
                          <tr 
                            key={row.key} 
                            className="border-b border-gray-200 bg-white hover:bg-gray-50"
                          >
                            {/* Tahapan Kerja - Show only on first row of each tahapan, with rowspan */}
                            {isFirstTahapanRow && (
                              <td 
                                className="px-4 py-2 border-r border-gray-200 align-middle"
                                rowSpan={tahapanRowSpan}
                              >
                                <div className="space-y-2">
                                  <div className="flex items-center space-x-2">
                                    <div className="text-black font-normal text-sm min-w-[24px]">
                                      {row.tahapanIndex + 1}.
                                    </div>
                                    <div className="flex-1 text-gray-800 text-sm font-medium">
                                      {row.tahapanName}
                                    </div>
                                  </div>
                                </div>
                              </td>
                            )}

                            {/* Jenis Pekerjaan - Show only on first row of each jenis, with rowspan */}
                            {row.jenisId && isFirstJenisRow ? (
                              <td 
                                className="px-4 py-2 border-r border-gray-200 align-middle"
                                rowSpan={jenisRowSpan}
                              >
                                <div className="space-y-2">
                                  <div className="flex items-center space-x-2">
                                    <div className="flex-1 text-gray-800 text-sm">
                                      {row.jenisName}
                                    </div>
                                  </div>
                                </div>
                              </td>
                            ) : !row.jenisId ? (
                              <td className="px-4 py-2 border-r border-gray-200">
                              </td>
                            ) : null}

                            {/* Uraian */}
                            <td className="px-4 py-2 border-r border-gray-200 align-middle">
                              {row.uraianId ? (
                                <div className="space-y-1">
                                  <div className="flex items-center space-x-2">
                                    <div className="flex-1 text-gray-800 text-sm">
                                      {row.uraianName}
                                    </div>
                                  </div>
                                </div>
                              ) : (
                                <div></div>
                              )}
                            </td>

                            {/* Spesifikasi */}
                            <td className="px-4 py-2 border-r border-gray-200 align-middle">
                              {row.spec ? (
                                <div className="text-gray-800 text-sm">
                                  {row.spec.description}
                                </div>
                              ) : (
                                <div className="w-full h-6"></div>
                              )}
                            </td>

                            {/* Volume */}
                            <td className="px-4 py-2 border-r border-gray-200 align-middle">
                              {row.spec ? (
                                <div className="text-gray-800 text-sm text-center">
                                  {row.spec.volume?.toLocaleString('id-ID') || 0}
                                </div>
                              ) : (
                                <div className="w-full h-6"></div>
                              )}
                            </td>

                            {/* Satuan */}
                            <td className="px-4 py-2 border-r border-gray-200 align-middle">
                              {row.spec ? (
                                <div className="text-gray-800 text-sm text-center">
                                  {row.spec.satuan}
                                </div>
                              ) : (
                                <div className="w-full h-6"></div>
                              )}
                            </td>

                            {/* Your Price - Editable input */}
                            <td className="px-4 py-2 border-r border-gray-200 align-middle">
                              {row.spec ? (
                                <input
                                  type="number"
                                  value={row.spec.pricePerPcs || ''}
                                  onChange={(e) => updatePrice(row.tahapanId, row.jenisId, row.uraianId, row.specId, e.target.value)}
                                  className="w-full p-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                  placeholder="Enter price"
                                />
                              ) : (
                                <div className="w-full h-6"></div>
                              )}
                            </td>

                            {/* Total */}
                            <td className="px-4 py-2 align-middle">
                              {row.spec ? (
                                <div className="px-2 py-1 text-gray-900 font-medium text-sm text-right">
                                  Rp {((row.spec.volume || 0) * (row.spec.pricePerPcs || 0)).toLocaleString('id-ID')}
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
              </div>
            </div>
          </div>
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
                  <h1 className="text-2xl font-bold text-blue-600 mb-2">Submit BOQ Proposal</h1>
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

export default function BOQPenawaran() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <BOQPenawaranContent />
    </Suspense>
  );
}

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
    const tahapanName = item.tahapanName || item.tahapanKerja || 'Tahapan Kerja Utama';
    const jenisName = item.jenisName || item.jenisKerja || 'Pekerjaan Umum';
    const uraianName = item.uraianName || item.uraianPekerjaan || item.name || `Item ${index + 1}`;
    
    if (!groupedData[tahapanName]) {
      groupedData[tahapanName] = {};
    }
    
    if (!groupedData[tahapanName][jenisName]) {
      groupedData[tahapanName][jenisName] = [];
    }
    
    // Apply negotiation data if available
    let finalPricePerPcs = item.pricePerPcs;
    if (negotiationData && negotiationData[item.id]) {
      finalPricePerPcs = negotiationData[item.id].pricePerPcs || item.pricePerPcs;
    }
    
    groupedData[tahapanName][jenisName].push({
      id: item.id || (index + 4),
      description: item.description || item.name || `Item ${index + 1}`,
      satuan: item.satuan || item.unit || 'unit',
      volume: item.volume || item.qty || 1,
      pricePerPcs: finalPricePerPcs || 0,
      originalPrice: item.pricePerPcs || 0, // Keep original for reference
      isNegotiated: negotiationData && negotiationData[item.id] ? true : false
    });
  });

  // Convert grouped data to tahapanKerja structure
  let tahapanId = 1;
  let jenisId = 1000;
  let uraianId = 10000;
  
  const tahapanKerja = Object.keys(groupedData).map(tahapanName => {
    const jenisKerja = Object.keys(groupedData[tahapanName]).map(jenisName => {
      return {
        id: jenisId++,
        name: jenisName,
        uraian: [{
          id: uraianId++,
          name: jenisName + ' - Detail',
          spec: groupedData[tahapanName][jenisName]
        }]
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

function BOQPenawaranContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading: authLoading } = useAuth();
  
  const [boqData, setBoqData] = useState(null);
  const [originalBoqData, setOriginalBoqData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(true); // Start in editing mode for proposals
  const [boqTitle, setBoqTitle] = useState('');
  const [projectId, setProjectId] = useState(null);
  const [projectData, setProjectData] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [proposalMessage, setProposalMessage] = useState('');

  // Get project ID and existing proposal data from URL params
  const projectIdParam = searchParams?.get('projectId');
  const proposalIdParam = searchParams?.get('proposalId');

  const loadProjectAndProposalData = useCallback(async () => {
    if (!projectIdParam) {
      setError('Project ID is missing from URL. Please access this page through the vendor dashboard.');
      setLoading(false);
      return;
    }

    if (!user?.uid) {
      setError('User not authenticated. Please log in to continue.');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      let finalBoqData = null; // Declare the variable at the beginning
      
      console.log('🔍 Starting to load project and proposal data');
      console.log('🔍 Project ID:', projectIdParam);
      console.log('🔍 User ID:', user?.uid);
      console.log('🔍 Proposal ID:', proposalIdParam);
      
      // Load project data
      console.log('🔍 Attempting to load project from Firestore...');
      const project = await firestoreService.get('projects', projectIdParam);
      console.log('🔍 Project loaded:', project ? 'SUCCESS' : 'FAILED');
      if (project) {
        console.log('🔍 Project data:', JSON.stringify(project, null, 2));
      }
      
      if (!project) {
        throw new Error('Project not found');
      }
      
      setProjectData(project);
      setProjectId(projectIdParam);
      setBoqTitle(`Penawaran BOQ - ${project.projectTitle || 'Untitled Project'}`);

            // If proposalId is provided, load existing proposal data
      if (proposalIdParam) {
        console.log('🔍 Loading existing proposal:', proposalIdParam);
        
        // First try to find the proposal in the project's proposals array
        let existingProposal = project.proposals?.find(p => p.id === proposalIdParam);
        
        // If not found in project, try loading from proposals collection
        if (!existingProposal) {
          existingProposal = await firestoreService.get('proposals', proposalIdParam);
        }
        
        console.log('🔍 Existing proposal data:', existingProposal);
        if (existingProposal && existingProposal.vendorId === user.uid) {
          // Load existing proposal BOQ data
          if (existingProposal.boqPricing && existingProposal.boqPricing.length > 0) {
            console.log('🔍 Found existing BOQ pricing data:', existingProposal.boqPricing);
            const tahapanData = convertBoqPricingToTahapanKerja(existingProposal.boqPricing);
            finalBoqData = tahapanData;
            console.log('🔍 Converted existing BOQ to tahapan structure:', finalBoqData);
            setProposalMessage(existingProposal.resubmissionNotes || '');
          }
        }
      } else {
        console.log('🔍 Loading project BOQ template for new proposal');
        console.log('🔍 Project has attachedBOQ:', !!project.attachedBOQ);
        console.log('🔍 Project has boqPricing:', !!project.boqPricing);
        
        if (project.attachedBOQ) {
          console.log('🔍 AttachedBOQ structure:', JSON.stringify(project.attachedBOQ, null, 2));
        }
        
        // Load project's original BOQ as template
        if (project.attachedBOQ?.tahapanKerja) {
          console.log('🔍 Using project attachedBOQ.tahapanKerja');
          // Deep copy the project BOQ to avoid modifying original
          const templateData = JSON.parse(JSON.stringify(project.attachedBOQ.tahapanKerja));
          // Reset all prices to 0 for new proposal
          resetBoqPrices(templateData);
          setBoqData(templateData);
          setOriginalBoqData(templateData);
        } else if (project.boqPricing) {
          console.log('🔍 Converting project boqPricing to tahapanKerja');
          const convertedData = convertBoqPricingToTahapanKerja(project.boqPricing);
          resetBoqPrices(convertedData);
          setBoqData(convertedData);
          setOriginalBoqData(convertedData);
        } else {
          console.log('🔍 No BOQ data found in project, creating empty BOQ structure');
          // Create empty BOQ structure
          const emptyBoq = [{
            id: 1,
            name: 'Tahapan Kerja Utama',
            jenisKerja: [{
              id: 2,
              name: 'Pekerjaan Umum',
              uraian: [{
                id: 3,
                name: 'Detail Pekerjaan',
                spec: [{
                  id: 4,
                  description: 'Item pekerjaan',
                  satuan: 'unit',
                  volume: 1,
                  pricePerPcs: 0
                }]
              }]
            }]
          }];
          console.log('🔍 Created empty BOQ:', emptyBoq);
          setBoqData(emptyBoq);
          setOriginalBoqData(emptyBoq);
        }
      }
      
      // Set BOQ data if we loaded existing proposal data
      if (finalBoqData) {
        console.log('🔍 Setting BOQ data from existing proposal:', finalBoqData);
        setBoqData(finalBoqData);
        setOriginalBoqData(finalBoqData);
      }
      
      console.log('🔍 BOQ loading completed successfully');
      
    } catch (err) {
      console.error('Error loading project/proposal data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
      console.log('🔍 Loading completed, setting loading to false');
    }
  }, [projectIdParam, proposalIdParam, user?.uid]);

  // Helper function to reset all prices in BOQ structure
  const resetBoqPrices = (tahapanKerja) => {
    if (!Array.isArray(tahapanKerja)) return;
    
    tahapanKerja.forEach(tahapan => {
      if (tahapan.jenisKerja && Array.isArray(tahapan.jenisKerja)) {
        tahapan.jenisKerja.forEach(jenis => {
          if (jenis.uraian && Array.isArray(jenis.uraian)) {
            jenis.uraian.forEach(uraian => {
              if (uraian.spec && Array.isArray(uraian.spec)) {
                uraian.spec.forEach(spec => {
                  spec.pricePerPcs = 0; // Reset to 0 for new proposals
                });
              }
            });
          }
        });
      }
    });
  };

  useEffect(() => {
    // Only call the function when authentication is complete
    if (!authLoading) {
      loadProjectAndProposalData();
    }
  }, [loadProjectAndProposalData, authLoading]);

  // Update price function
  const updatePrice = useCallback((tahapanId, jenisId, uraianId, specId, newPrice) => {
    if (!isEditing) return;
    
    setBoqData(prevData => {
      const newData = [...prevData];
      const tahapanIndex = newData.findIndex(t => t.id === tahapanId);
      if (tahapanIndex !== -1) {
        const jenisIndex = newData[tahapanIndex].jenisKerja.findIndex(j => j.id === jenisId);
        if (jenisIndex !== -1) {
          const uraianIndex = newData[tahapanIndex].jenisKerja[jenisIndex].uraian.findIndex(u => u.id === uraianId);
          if (uraianIndex !== -1) {
            const specIndex = newData[tahapanIndex].jenisKerja[jenisIndex].uraian[uraianIndex].spec.findIndex(s => s.id === specId);
            if (specIndex !== -1) {
              newData[tahapanIndex].jenisKerja[jenisIndex].uraian[uraianIndex].spec[specIndex].pricePerPcs = newPrice;
            }
          }
        }
      }
      return newData;
    });
  }, [isEditing]);

  // Calculate totals
  const calculateSubTotal = useCallback((spec) => {
    const volume = parseFloat(spec.volume) || 0;
    const price = parseFloat(spec.pricePerPcs) || 0;
    return volume * price;
  }, []);

  const calculateTahapanTotal = useCallback((tahapan) => {
    if (!tahapan?.jenisKerja) return 0;
    
    return tahapan.jenisKerja.reduce((tahapanTotal, jenis) => {
      if (!jenis?.uraian) return tahapanTotal;
      
      const jenisTotal = jenis.uraian.reduce((jenisSum, uraian) => {
        if (!uraian?.spec) return jenisSum;
        
        const uraianTotal = uraian.spec.reduce((uraianSum, spec) => {
          return uraianSum + calculateSubTotal(spec);
        }, 0);
        
        return jenisSum + uraianTotal;
      }, 0);
      
      return tahapanTotal + jenisTotal;
    }, 0);
  }, [calculateSubTotal]);

  const calculateGrandTotal = useCallback(() => {
    if (!boqData) return 0;
    
    return boqData.reduce((total, tahapan) => {
      return total + calculateTahapanTotal(tahapan);
    }, 0);
  }, [boqData, calculateTahapanTotal]);

  // Submit proposal function
  const handleSubmitProposal = async () => {
    if (!user?.uid || !projectId || !boqData) {
      alert('Missing required data for proposal submission');
      return;
    }

    const grandTotal = calculateGrandTotal();
    if (grandTotal <= 0) {
      alert('Please enter valid prices for your proposal');
      return;
    }

    try {
      setIsSubmitting(true);

      // Convert BOQ data to boqPricing format for compatibility
      const boqPricing = [];
      boqData.forEach(tahapan => {
        if (tahapan.jenisKerja) {
          tahapan.jenisKerja.forEach(jenis => {
            if (jenis.uraian) {
              jenis.uraian.forEach(uraian => {
                if (uraian.spec) {
                  uraian.spec.forEach(spec => {
                    boqPricing.push({
                      id: spec.id,
                      tahapanName: tahapan.name,
                      jenisName: jenis.name,
                      uraianName: uraian.name,
                      description: spec.description,
                      satuan: spec.satuan,
                      volume: spec.volume,
                      pricePerPcs: spec.pricePerPcs,
                      subTotal: calculateSubTotal(spec)
                    });
                  });
                }
              });
            }
          });
        }
      });

      const proposalData = {
        projectId: projectId,
        vendorId: user.uid,
        vendorName: user.displayName || user.email,
        vendorEmail: user.email,
        boqData: boqData,
        boqPricing: boqPricing,
        totalAmount: grandTotal,
        totalWithTax: grandTotal * 1.11, // 11% tax
        message: proposalMessage,
        status: 'pending',
        submittedAt: new Date(),
        updatedAt: new Date()
      };

      if (proposalIdParam) {
        // Update existing proposal
        await firestoreService.update('proposals', proposalIdParam, {
          ...proposalData,
          updatedAt: new Date()
        });
        alert('Proposal updated successfully!');
      } else {
        // Create new proposal
        await firestoreService.add('proposals', proposalData);
        alert('Proposal submitted successfully!');
      }

      // Redirect back to vendor dashboard
      router.push('/dashboard/vendor');
      
    } catch (error) {
      console.error('Error submitting proposal:', error);
      alert('Failed to submit proposal. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading || loading) {
    return <LoadingFallback />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <main className="relative">
          <div className="absolute inset-0 bg-gray-50"></div>
          <div className="relative w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden">
              <div className="bg-white px-8 py-6">
                <div className="text-center">
                  <h1 className="text-2xl font-bold text-red-600 mb-2">Error</h1>
                  <p className="text-gray-600">{error}</p>
                  <button
                    onClick={() => router.push('/dashboard/vendor')}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Back to Dashboard
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!boqData) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <main className="relative">
          <div className="absolute inset-0 bg-gray-50"></div>
          <div className="relative w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden">
              <div className="bg-white px-8 py-6">
                <div className="text-center">
                  <h1 className="text-2xl font-bold text-gray-600 mb-2">No BOQ Data</h1>
                  <p className="text-gray-600">No BOQ data available for this project</p>
                  <button
                    onClick={() => router.push('/dashboard/vendor')}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Back to Dashboard
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <main className="relative">
        <div className="absolute inset-0 bg-gray-50"></div>
        
        <div className="relative w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden">
            
            {/* Header Section */}
            <div className="bg-white px-8 py-6 border-b border-gray-200">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => router.push('/dashboard/vendor')}
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    <MdArrowBack className="w-5 h-5" />
                    Kembali
                  </button>
                  <div className="h-6 w-px bg-gray-300"></div>
                  <div>
                    <h1 className="text-2xl font-bold text-blue-600 mb-2">{boqTitle}</h1>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span>Project: {projectData?.projectTitle || 'Unknown Project'}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <MdEdit className="w-4 h-4" />
                        Mode Penawaran
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleSubmitProposal}
                    disabled={isSubmitting}
                    className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <MdSend className="w-5 h-5" />
                    {isSubmitting ? 'Mengirim...' : (proposalIdParam ? 'Update Penawaran' : 'Kirim Penawaran')}
                  </button>
                </div>
              </div>
            </div>

            {/* Message Section */}
            <div className="px-8 py-4 bg-blue-50 border-b border-gray-200">
              <div className="flex items-center gap-2 mb-2">
                <MdMessage className="w-5 h-5 text-blue-600" />
                <span className="font-medium text-blue-800">Pesan Penawaran</span>
              </div>
              <textarea
                value={proposalMessage}
                onChange={(e) => setProposalMessage(e.target.value)}
                placeholder="Tambahkan pesan atau catatan untuk penawaran Anda..."
                className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
              />
            </div>

            {/* BOQ Content */}
            <div className="overflow-hidden">
              <div className="overflow-x-auto">
                <div className="min-w-full">
                  
                  {/* BOQ Table */}
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-blue-600 text-white">
                        <th className="border border-gray-300 px-4 py-3 text-left font-semibold">No</th>
                        <th className="border border-gray-300 px-4 py-3 text-left font-semibold">Uraian Pekerjaan</th>
                        <th className="border border-gray-300 px-4 py-3 text-center font-semibold">Satuan</th>
                        <th className="border border-gray-300 px-4 py-3 text-center font-semibold">Volume</th>
                        <th className="border border-gray-300 px-4 py-3 text-right font-semibold">Harga Satuan (Rp)</th>
                        <th className="border border-gray-300 px-4 py-3 text-right font-semibold">Jumlah (Rp)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {boqData.map((tahapan, tahapanIndex) => (
                        <React.Fragment key={tahapan.id}>
                          {/* Tahapan Header */}
                          <tr className="bg-blue-100">
                            <td className="border border-gray-300 px-4 py-3 font-bold text-blue-800">
                              {String.fromCharCode(65 + tahapanIndex)}
                            </td>
                            <td colSpan="5" className="border border-gray-300 px-4 py-3 font-bold text-blue-800 uppercase">
                              {tahapan.name}
                            </td>
                          </tr>
                          
                          {/* Jenis Kerja */}
                          {tahapan.jenisKerja && tahapan.jenisKerja.map((jenis, jenisIndex) => (
                            <React.Fragment key={jenis.id}>
                              <tr className="bg-blue-50">
                                <td className="border border-gray-300 px-4 py-2 font-semibold text-blue-700">
                                  {String.fromCharCode(65 + tahapanIndex)}.{jenisIndex + 1}
                                </td>
                                <td colSpan="5" className="border border-gray-300 px-4 py-2 font-semibold text-blue-700">
                                  {jenis.name}
                                </td>
                              </tr>
                              
                              {/* Uraian */}
                              {jenis.uraian && jenis.uraian.map((uraian, uraianIndex) => (
                                <React.Fragment key={uraian.id}>
                                  {/* Spec Items */}
                                  {uraian.spec && uraian.spec.map((spec, specIndex) => (
                                    <tr key={spec.id} className="hover:bg-gray-50">
                                      <td className="border border-gray-300 px-4 py-2 text-center">
                                        {String.fromCharCode(65 + tahapanIndex)}.{jenisIndex + 1}.{specIndex + 1}
                                      </td>
                                      <td className="border border-gray-300 px-4 py-2">
                                        {spec.description}
                                      </td>
                                      <td className="border border-gray-300 px-4 py-2 text-center">
                                        {spec.satuan}
                                      </td>
                                      <td className="border border-gray-300 px-4 py-2 text-center">
                                        {spec.volume}
                                      </td>
                                      <td className="border border-gray-300 px-4 py-2 text-right">
                                        <input
                                          type="number"
                                          value={spec.pricePerPcs || ''}
                                          onChange={(e) => updatePrice(
                                            tahapan.id, 
                                            jenis.id, 
                                            uraian.id, 
                                            spec.id, 
                                            parseFloat(e.target.value) || 0
                                          )}
                                          className="w-full text-right bg-yellow-50 border border-yellow-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                          placeholder="0"
                                          min="0"
                                          step="1000"
                                        />
                                      </td>
                                      <td className="border border-gray-300 px-4 py-2 text-right font-medium">
                                        Rp {calculateSubTotal(spec).toLocaleString('id-ID')}
                                      </td>
                                    </tr>
                                  ))}
                                </React.Fragment>
                              ))}
                              
                              {/* Jenis Subtotal */}
                              <tr className="bg-blue-50">
                                <td colSpan="5" className="border border-gray-300 px-4 py-2 text-right font-semibold text-blue-700">
                                  Subtotal {jenis.name}:
                                </td>
                                <td className="border border-gray-300 px-4 py-2 text-right font-bold text-blue-700">
                                  Rp {jenis.uraian?.reduce((jenisTotal, uraian) => {
                                    return jenisTotal + (uraian.spec?.reduce((uraianTotal, spec) => {
                                      return uraianTotal + calculateSubTotal(spec);
                                    }, 0) || 0);
                                  }, 0).toLocaleString('id-ID')}
                                </td>
                              </tr>
                            </React.Fragment>
                          ))}
                          
                          {/* Tahapan Total */}
                          <tr className="bg-blue-100">
                            <td colSpan="5" className="border border-gray-300 px-4 py-3 text-right font-bold text-blue-800">
                              Total {tahapan.name}:
                            </td>
                            <td className="border border-gray-300 px-4 py-3 text-right font-bold text-blue-800">
                              Rp {calculateTahapanTotal(tahapan).toLocaleString('id-ID')}
                            </td>
                          </tr>
                        </React.Fragment>
                      ))}
                      
                      {/* Grand Total */}
                      <tr className="bg-green-100">
                        <td colSpan="5" className="border border-gray-300 px-4 py-4 text-right font-bold text-green-800 text-lg">
                          TOTAL KESELURUHAN:
                        </td>
                        <td className="border border-gray-300 px-4 py-4 text-right font-bold text-green-800 text-lg">
                          Rp {calculateGrandTotal().toLocaleString('id-ID')}
                        </td>
                      </tr>
                      
                      {/* Tax */}
                      <tr className="bg-green-50">
                        <td colSpan="5" className="border border-gray-300 px-4 py-3 text-right font-semibold text-green-700">
                          PPN 11%:
                        </td>
                        <td className="border border-gray-300 px-4 py-3 text-right font-semibold text-green-700">
                          Rp {(calculateGrandTotal() * 0.11).toLocaleString('id-ID')}
                        </td>
                      </tr>
                      
                      {/* Total with Tax */}
                      <tr className="bg-green-200">
                        <td colSpan="5" className="border border-gray-300 px-4 py-4 text-right font-bold text-green-800 text-xl">
                          TOTAL TERMASUK PPN:
                        </td>
                        <td className="border border-gray-300 px-4 py-4 text-right font-bold text-green-800 text-xl">
                          Rp {(calculateGrandTotal() * 1.11).toLocaleString('id-ID')}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            
            {/* Footer Actions */}
            <div className="bg-gray-50 px-8 py-6 border-t border-gray-200">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="text-sm text-gray-600">
                  Total Penawaran: <span className="font-bold text-green-600">Rp {(calculateGrandTotal() * 1.11).toLocaleString('id-ID')}</span>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => router.push('/dashboard/vendor')}
                    className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    onClick={handleSubmitProposal}
                    disabled={isSubmitting}
                    className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <MdSend className="w-4 h-4" />
                    {isSubmitting ? 'Mengirim...' : (proposalIdParam ? 'Update Penawaran' : 'Kirim Penawaran')}
                  </button>
                </div>
              </div>
            </div>
          </div>
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
                  <h1 className="text-2xl font-bold text-blue-600 mb-2">BOQ Penawaran</h1>
                  <p className="text-gray-600">Memuat...</p>
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

export default function BOQPenawaran() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <BOQPenawaranContent />
    </Suspense>
  );
}
