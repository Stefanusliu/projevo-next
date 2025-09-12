'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { MdAdd, MdClose, MdDelete, MdDragIndicator, MdFileDownload, MdSave, MdEdit, MdVisibility, MdArrowBack, MdMessage } from 'react-icons/md';
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
    
    console.log(`💰 Converting item ${index}:`, {
      description: item.item || item.description,
      originalPrice: originalPrice,
      currentPrice: currentPrice,
      finalPrice: finalPrice,
      hasOriginalPrice: item.hasOriginalPrice,
      priceChange: item.priceChange,
      rawOriginalPrice: item.originalPrice,
      rawHasOriginalPrice: item.hasOriginalPrice
    });
    
    groupedData[tahapanName][jenisName].push({
      name: uraianName,
      specs: [{
        description: item.item || item.description || item.name || uraianName,
        satuan: item.unit || item.satuan || 'unit',
        volume: volume,
        pricePerPcs: pricePerUnit,
        originalPrice: originalPrice, // Use the properly calculated previous price
        currentPrice: currentPrice, // Current vendor price from item
        vendorPrice: finalPrice,
        subtotal: finalPrice,
        hasOriginalPrice: item.hasOriginalPrice || false, // Flag from the enhanced data
        priceChange: parseFloat(item.priceChange || 0) // Price difference from enhanced data
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
          hasOriginalPrice: specItem.hasOriginalPrice || false, // Make sure this flag is preserved
          priceChange: specItem.priceChange || 0 // Make sure price change is preserved
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

function BOQViewerContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, userProfile, loading } = useAuth();
  
  // All useState hooks must be called at the top, before any conditional returns
  const [currentView, setCurrentView] = useState('editor'); // Always show editor in viewer mode
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
  const [editMode, setEditMode] = useState(false); // Always disabled in viewer mode
  const [negotiationNotes, setNegotiationNotes] = useState('');
  const [showNegotiationDetails, setShowNegotiationDetails] = useState(false);
  const [vendorName, setVendorName] = useState('');
  const [isOwnerView, setIsOwnerView] = useState(false);
  const [showPriceComparison, setShowPriceComparison] = useState(false);
  const [returnUrl, setReturnUrl] = useState('');

  // Function to load session BOQ data from localStorage
  const loadSessionBOQData = useCallback((sessionKey, isReadOnly) => {
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
        // Set price comparison flags if available
        console.log('🔍 Checking session data for price comparison:', {
          showPriceComparison: sessionData.showPriceComparison,
          hasNegotiation: !!sessionData.negotiation,
          boqPricingCount: sessionData.boqPricing.length
        });
        
        // Debug first few items to see their structure
        console.log('🔍 First few BOQ items structure:', sessionData.boqPricing.slice(0, 3).map((item, index) => ({
          index,
          item: item.item || item.description,
          vendorPrice: item.vendorPrice,
          originalPrice: item.originalPrice,
          hasOriginalPrice: item.hasOriginalPrice,
          priceChange: item.priceChange
        })));
        
        if (sessionData.showPriceComparison) {
          console.log('✅ Enabling price comparison mode');
          setShowPriceComparison(true);
        } else {
          console.log('❌ Price comparison disabled - no negotiations found');
          setShowPriceComparison(false);
        }
        
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
        setCurrentView('editor');
        console.log('✅ Session BOQ data loaded successfully for viewing');
        console.log('💰 Display amount:', displayAmount);
        console.log('📊 Price comparison enabled:', sessionData.showPriceComparison);
        
        // Set negotiation data if available
        if (sessionData.negotiation && sessionData.negotiation.notes) {
          setNegotiationNotes(sessionData.negotiation.notes);
        }
        
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
      
      // Redirect back to dashboard
      router.push(returnUrl || '/dashboard');
    }
  }, [router, returnUrl]);

  // All useEffect hooks must be called at the top, before any conditional returns
  // Authentication check - Allow both project owners and vendors to view BOQ
  useEffect(() => {
    console.log('BOQ Viewer - Auth state:', { user: !!user, userProfile: !!userProfile, loading });
    
    if (!loading && !user) {
      console.log('BOQ Viewer - No user found, redirecting to login');
      router.push('/login');
    }
  }, [user, userProfile, loading, router]);

  // Effect to load BOQ data from session
  useEffect(() => {
    // Check if there's a session key to load BOQ data
    const sessionKey = searchParams.get('sessionKey');
    const mode = searchParams.get('mode');
    const vendorNameParam = searchParams.get('vendorName');
    const projectTitleParam = searchParams.get('projectTitle');
    const returnUrlParam = searchParams.get('returnUrl');
    
    // Set parameters
    if (vendorNameParam) setVendorName(vendorNameParam);
    if (returnUrlParam) setReturnUrl(returnUrlParam);
    
    if (sessionKey && mode === 'view') {
      console.log('🔍 Loading BOQ data in view mode:', { sessionKey, mode, vendorNameParam, projectTitleParam });
      loadSessionBOQData(sessionKey, true); // Always read-only in viewer
    }
  }, [searchParams, loadSessionBOQData]);
  
  // Show loading while authentication is still loading
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Memuat autentikasi...</p>
        </div>
      </div>
    );
  }
  
  // Show loading if user is not loaded yet
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Memuat data pengguna...</p>
        </div>
      </div>
    );
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
                  const total = (spec.volume || 0) * (spec.pricePerPcs || 0);
                  csvContent += `"${tahapan.name}","${jenis.name}","${uraian.name}","${spec.description}",${spec.volume},"${spec.satuan}","Rp ${(spec.pricePerPcs || 0).toLocaleString('id-ID')}","Rp ${total.toLocaleString('id-ID')}"\n`;
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
                  <h1 className="text-2xl font-bold text-blue-600 mb-2">BOQ Viewer</h1>
                  <p className="text-gray-600">Lihat detail Bill of Quantities dalam mode baca-saja</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <button
                    onClick={() => router.push(returnUrl || '/dashboard')}
                    className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg font-medium text-sm flex items-center"
                  >
                    <MdArrowBack className="w-4 h-4 mr-2" />
                    Kembali
                  </button>
                  <button
                    onClick={exportToCSV}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg font-medium text-sm flex items-center"
                  >
                    <MdFileDownload className="w-4 h-4 mr-2" />
                    Ekspor CSV
                  </button>
                </div>
              </div>
            </div>

            {/* Negotiation Details */}
            {showNegotiationDetails && negotiationNotes && (
              <div className="px-8 py-4 bg-amber-50 border-b border-amber-200">
                <div className="flex items-center space-x-3">
                  <div className="bg-amber-100 p-2 rounded-full">
                    <MdMessage className="w-5 h-5 text-amber-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-gray-800 mb-2 flex items-center">
                      <MdMessage className="w-4 h-4 mr-1" />
                      Catatan Negosiasi:
                    </h4>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{negotiationNotes}</p>
                  </div>
                  <button
                    onClick={() => setShowNegotiationDetails(false)}
                    className="text-amber-600 hover:text-amber-800 font-medium"
                  >
                    <MdClose className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}
            
            {!showNegotiationDetails && negotiationNotes && (
              <div className="px-8 py-2 bg-gray-50 border-b border-gray-200">
                <button
                  onClick={() => setShowNegotiationDetails(true)}
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center"
                >
                  <MdMessage className="w-4 h-4 mr-1" />
                  Lihat Catatan Negosiasi
                </button>
              </div>
            )}

            <div className="px-8 py-6 border-b border-gray-200 bg-white">
              <div className="max-w-4xl">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {boqTitle || 'BOQ Title'}
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
                          <th className="px-4 py-3 text-left text-sm font-bold text-gray-800 border-r border-gray-300" style={{width: showPriceComparison ? '15%' : '18%'}}>
                            Tahapan Kerja
                          </th>
                          <th className="px-4 py-3 text-left text-sm font-bold text-gray-800 border-r border-gray-300" style={{width: showPriceComparison ? '15%' : '18%'}}>
                            Jenis Pekerjaan
                          </th>
                          <th className="px-4 py-3 text-left text-sm font-bold text-gray-800 border-r border-gray-300" style={{width: showPriceComparison ? '15%' : '18%'}}>
                            Uraian
                          </th>
                          <th className="px-4 py-3 text-left text-sm font-bold text-gray-800 border-r border-gray-300" style={{width: showPriceComparison ? '13%' : '16%'}}>
                            Spesifikasi
                          </th>
                          <th className="px-4 py-3 text-left text-sm font-bold text-gray-800 border-r border-gray-300" style={{width: showPriceComparison ? '7%' : '8%'}}>
                            Volume
                          </th>
                          <th className="px-4 py-3 text-left text-sm font-bold text-gray-800 border-r border-gray-300" style={{width: showPriceComparison ? '7%' : '8%'}}>
                            Satuan
                          </th>
                          {showPriceComparison && (
                            <th className="px-4 py-3 text-left text-sm font-bold text-gray-800 border-r border-gray-300" style={{width: '12%'}}>
                              Harga Sebelum
                            </th>
                          )}
                          <th className="px-4 py-3 text-left text-sm font-bold text-gray-800 border-r border-gray-300" style={{width: showPriceComparison ? '12%' : '14%'}}>
                            Harga Sekarang
                          </th>
                          <th className="px-4 py-3 text-left text-sm font-bold text-gray-800" style={{width: showPriceComparison ? '14%' : '16%'}}>
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
                              {row.uraianId && (row.type.includes('uraian') || isFirstUraianRow) ? (
                                <div className="space-y-1">
                                  <div className="flex items-center space-x-2">
                                    <div className="flex-1 text-gray-800 text-sm">
                                      {row.uraianName}
                                    </div>
                                  </div>
                                </div>
                              ) : row.uraianId ? (
                                <div className="text-gray-600 text-sm text-center">↳</div>
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

                            {/* Harga Sebelum - Only show when price comparison is enabled */}
                            {showPriceComparison && (
                              <td className="px-4 py-2 border-r border-gray-200 align-middle">
                                {row.spec ? (
                                  <div className="text-sm text-gray-600 text-right">
                                    <div className="font-medium">
                                      {row.spec.originalPrice && row.spec.originalPrice > 0 ? (
                                        `Rp ${parseFloat(row.spec.originalPrice).toLocaleString('id-ID')}`
                                      ) : (
                                        <span className="text-xs text-gray-400">-</span>
                                      )}
                                    </div>
                                  </div>
                                ) : (
                                  <div className="text-xs text-gray-400 text-center">-</div>
                                )}
                              </td>
                            )}

                            {/* Harga */}
                            <td className="px-4 py-2 border-r border-gray-200 align-middle">
                              {row.spec ? (
                                <div className="text-sm text-gray-900 font-medium text-right">
                                  Rp {(row.spec.pricePerPcs || 0).toLocaleString('id-ID')}
                                </div>
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
                        <td colSpan={showPriceComparison ? "8" : "7"} className="px-4 py-3 text-right font-medium text-gray-800">
                          Subtotal:
                        </td>
                        <td className="px-4 py-3 font-medium text-black">
                          Rp {calculateGrandTotal().toLocaleString('id-ID')}
                        </td>
                      </tr>
                      <tr className="bg-white">
                        <td colSpan={showPriceComparison ? "8" : "7"} className="px-4 py-3 text-right font-medium text-gray-800">
                          PPN (11%):
                        </td>
                        <td className="px-4 py-3 font-medium text-gray-600">
                          Rp {(calculateGrandTotal() * 0.11).toLocaleString('id-ID')}
                        </td>
                      </tr>
                      <tr className="border-t border-gray-300 bg-white">
                        <td colSpan={showPriceComparison ? "8" : "7"} className="px-4 py-4 text-right font-bold text-black text-lg">
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
                  <h1 className="text-2xl font-bold text-blue-600 mb-2">BOQ Viewer</h1>
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

export default function BOQViewer() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <BOQViewerContent />
    </Suspense>
  );
}
