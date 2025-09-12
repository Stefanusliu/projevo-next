'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { MdAdd, MdClose, MdDelete, MdDragIndicator, MdFileDownload, MdSave, MdEdit, MdVisibility, MdArrowBack, MdMessage, MdSend } from 'react-icons/md';
import { useAuth } from '../../contexts/AuthContext';
import { firestoreService } from '../../hooks/useFirestore';
import Header from '../components/Header';
import Footer from '../components/Footer';

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
  const [newProposalPrices, setNewProposalPrices] = useState({}); // Track new proposal input values
  const [editMode, setEditMode] = useState(true); // Enable editing for proposal submission
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [projectData, setProjectData] = useState(null);
  const [projectId, setProjectId] = useState(null);

  // Update price function for proposal input
  const updatePrice = (tahapanId, jenisId, uraianId, specId, newPrice) => {
    // Store new price in separate state for proposal input
    const priceKey = `${tahapanId}-${jenisId}-${uraianId}-${specId}`;
    setNewProposalPrices(prev => ({
      ...prev,
      [priceKey]: newPrice
    }));
    
    // Also update the actual data for calculations
    setTahapanKerja(prev => {
      const newData = [...prev];
      const tahapanIndex = newData.findIndex(t => t.id === tahapanId);
      if (tahapanIndex !== -1) {
        const jenisIndex = newData[tahapanIndex].jenisKerja.findIndex(j => j.id === jenisId);
        if (jenisIndex !== -1) {
          const uraianIndex = newData[tahapanIndex].jenisKerja[jenisIndex].uraian.findIndex(u => u.id === uraianId);
          if (uraianIndex !== -1) {
            const specIndex = newData[tahapanIndex].jenisKerja[jenisIndex].uraian[uraianIndex].spec.findIndex(s => s.id === specId);
            if (specIndex !== -1) {
              newData[tahapanIndex].jenisKerja[jenisIndex].uraian[uraianIndex].spec[specIndex].pricePerPcs = parseFloat(newPrice) || 0;
            }
          }
        }
      }
      return newData;
    });
  };

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
        // Find the proposal in the project's proposals array
        const existingProposal = project.proposals?.find(p => String(p.id) === String(proposalIdParam));
        
        if (existingProposal && existingProposal.vendorId === user.uid) {
          // Load existing proposal BOQ data
          if (existingProposal.boqPricing && existingProposal.boqPricing.length > 0) {
            const tahapanData = convertBoqPricingToTahapanKerja(existingProposal.boqPricing);
            finalBoqData = tahapanData;
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
      
      // Clear proposal input prices to ensure inputs start empty
      setNewProposalPrices({});
      
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
                    Kembali ke Dashboard
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
      alert('Data yang diperlukan untuk pengajuan proposal tidak lengkap');
      return;
    }

    const grandTotal = calculateGrandTotal();
    if (grandTotal <= 0) {
      alert('Silakan masukkan harga yang valid untuk proposal Anda');
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
        status: proposalIdParam ? 'pending_review' : 'pending_review',
        submittedAt: new Date().toISOString(),
        isResubmission: !!proposalIdParam
      };

      if (proposalIdParam) {
        // Update existing proposal in project's proposals array only
        const currentTime = new Date().toISOString();
        const updatedProposals = projectData.proposals.map(p => 
          String(p.id) === String(proposalIdParam) ? { 
            ...p, 
            ...proposalData,
            updatedAt: currentTime,
            resubmissionDate: currentTime,
            lastModifiedBy: user.uid,
            lastModifiedByName: user.displayName || user.email?.split('@')[0],
            hasRecentUpdate: true, // Flag for easy detection
            updateCount: (p.updateCount || 0) + 1 // Track number of updates
          } : p
        );
        await firestoreService.update('projects', projectId, { proposals: updatedProposals });
        
        alert('Proposal berhasil diperbarui!');
      } else {
        // Create new proposal and add to project's proposals array
        const newProposalId = Date.now().toString();
        const newProposalData = {
          ...proposalData,
          id: newProposalId,
          createdAt: new Date().toISOString()
        };
        
        // Add to project's proposals array only
        const updatedProposals = [...(projectData.proposals || []), newProposalData];
        await firestoreService.update('projects', projectId, { proposals: updatedProposals });
        
        alert('Proposal berhasil dikirim!');
      }

      router.push('/dashboard/vendor');
    } catch (error) {
      console.error('Error submitting proposal:', error);
      alert('Gagal mengirim proposal. Silakan coba lagi.');
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
                  <h1 className="text-2xl font-bold text-blue-600 mb-2">Kirim Proposal BOQ</h1>
                  <p className="text-gray-600">Masukkan harga Anda untuk pengajuan proposal proyek</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <button
                    onClick={() => router.push('/dashboard/vendor')}
                    className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg font-medium text-sm flex items-center"
                  >
                    <MdArrowBack className="w-4 h-4 mr-2" />
                    Kembali ke Dashboard
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
                    {isSubmitting ? 'Mengirim...' : (proposalIdParam ? 'Perbarui Proposal' : 'Kirim Proposal')}
                  </button>
                </div>
              </div>
            </div>

            <div className="px-8 py-6 border-b border-gray-200 bg-white">
              <div className="max-w-4xl">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {boqTitle || 'Proposal BOQ'}
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
                          <th className="px-4 py-3 text-left text-sm font-bold text-gray-800 border-r border-gray-300" style={{width: '16%'}}>
                            Tahapan Kerja
                          </th>
                          <th className="px-4 py-3 text-left text-sm font-bold text-gray-800 border-r border-gray-300" style={{width: '16%'}}>
                            Jenis Pekerjaan
                          </th>
                          <th className="px-4 py-3 text-left text-sm font-bold text-gray-800 border-r border-gray-300" style={{width: '16%'}}>
                            Uraian
                          </th>
                          <th className="px-4 py-3 text-left text-sm font-bold text-gray-800 border-r border-gray-300" style={{width: '14%'}}>
                            Spesifikasi
                          </th>
                          <th className="px-4 py-3 text-left text-sm font-bold text-gray-800 border-r border-gray-300" style={{width: '6%'}}>
                            Volume
                          </th>
                          <th className="px-4 py-3 text-left text-sm font-bold text-gray-800 border-r border-gray-300" style={{width: '6%'}}>
                            Satuan
                          </th>
                          <th className="px-4 py-3 text-left text-sm font-bold text-gray-800 border-r border-gray-300" style={{width: '10%'}}>
                            Harga Sebelum
                          </th>
                          <th className="px-4 py-3 text-left text-sm font-bold text-gray-800 border-r border-gray-300" style={{width: '10%'}}>
                            Harga Sekarang
                          </th>
                          <th className="px-4 py-3 text-left text-sm font-bold text-gray-800" style={{width: '12%'}}>
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

                            {/* Harga Sebelum (Previous Price) */}
                            <td className="px-4 py-2 border-r border-gray-200 align-middle">
                              {row.spec ? (
                                <div className="px-2 py-1 text-gray-700 text-sm text-right bg-white rounded">
                                  {row.spec.vendorPrice > 0 
                                    ? `Rp ${row.spec.vendorPrice.toLocaleString('id-ID')}` 
                                    : '-'
                                  }
                                </div>
                              ) : (
                                <div className="w-full h-6"></div>
                              )}
                            </td>

                            {/* Harga Sekarang (Current Price Input) */}
                            <td className="px-4 py-2 border-r border-gray-200 align-middle">
                              {row.spec ? (
                                <input
                                  type="number"
                                  value={newProposalPrices[`${row.tahapanId}-${row.jenisId}-${row.uraianId}-${row.specId}`] || ''}
                                  onChange={(e) => updatePrice(row.tahapanId, row.jenisId, row.uraianId, row.specId, e.target.value)}
                                  className="w-full p-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                  placeholder="Masukkan harga baru"
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
                        <td colSpan="8" className="px-4 py-3 text-right font-medium text-gray-800">
                          Subtotal:
                        </td>
                        <td className="px-4 py-3 font-medium text-black">
                          Rp {calculateGrandTotal().toLocaleString('id-ID')}
                        </td>
                      </tr>
                      <tr className="bg-white">
                        <td colSpan="8" className="px-4 py-3 text-right font-medium text-gray-800">
                          PPN (11%):
                        </td>
                        <td className="px-4 py-3 font-medium text-gray-600">
                          Rp {(calculateGrandTotal() * 0.11).toLocaleString('id-ID')}
                        </td>
                      </tr>
                      <tr className="border-t border-gray-300 bg-white">
                        <td colSpan="8" className="px-4 py-4 text-right font-bold text-black text-lg">
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
