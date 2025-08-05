'use client';

import React from 'react';

const BOQDisplay = ({ project, isVendorView = false, showNegotiatedPrices = false }) => {
  // Function to get BOQ data from different project structures
  const getBOQData = () => {
    // Check for attached BOQ structure (from project creation)
    if (project.attachedBOQ?.tahapanKerja && project.attachedBOQ.tahapanKerja.length > 0) {
      return {
        title: project.attachedBOQ.title || 'Bill of Quantities',
        tahapanKerja: project.attachedBOQ.tahapanKerja
      };
    }
    
    // Check for direct tahapanKerja structure (from BOQ maker)
    if (project.tahapanKerja && project.tahapanKerja.length > 0) {
      return {
        title: project.boqTitle || 'Bill of Quantities',
        tahapanKerja: project.tahapanKerja
      };
    }

    // Check for boq field
    if (project.boq?.tahapanKerja && project.boq.tahapanKerja.length > 0) {
      return {
        title: project.boq.title || 'Bill of Quantities',
        tahapanKerja: project.boq.tahapanKerja
      };
    }

    // Check for boqData field
    if (project.boqData?.tahapanKerja && project.boqData.tahapanKerja.length > 0) {
      return {
        title: project.boqData.title || 'Bill of Quantities',
        tahapanKerja: project.boqData.tahapanKerja
      };
    }

    // Check for originalData nested BOQ
    if (project.originalData?.attachedBOQ?.tahapanKerja && project.originalData.attachedBOQ.tahapanKerja.length > 0) {
      return {
        title: project.originalData.attachedBOQ.title || 'Bill of Quantities',
        tahapanKerja: project.originalData.attachedBOQ.tahapanKerja
      };
    }

    if (project.originalData?.boq?.tahapanKerja && project.originalData.boq.tahapanKerja.length > 0) {
      return {
        title: project.originalData.boq.title || 'Bill of Quantities',
        tahapanKerja: project.originalData.boq.tahapanKerja
      };
    }

    // Return null if no BOQ data found
    return null;
  };

  // Sample BOQ data for demonstration
  const getSampleBOQ = () => [
    {
      id: 1,
      name: 'Structural Work',
      jenisKerja: [
        {
          id: 1,
          name: 'Foundation',
          uraian: [
            {
              id: 1,
              name: 'Excavation & Foundation',
              spec: [
                {
                  id: 1,
                  description: 'Site excavation for foundation',
                  satuan: 'm³',
                  volume: 45,
                  pricePerPcs: 125000
                },
                {
                  id: 2,
                  description: 'Concrete foundation (K-300)',
                  satuan: 'm³',
                  volume: 25,
                  pricePerPcs: 850000
                }
              ]
            }
          ]
        },
        {
          id: 2,
          name: 'Framework',
          uraian: [
            {
              id: 2,
              name: 'Steel Framework',
              spec: [
                {
                  id: 3,
                  description: 'Steel beam installation',
                  satuan: 'kg',
                  volume: 2500,
                  pricePerPcs: 15000
                }
              ]
            }
          ]
        }
      ]
    },
    {
      id: 2,
      name: 'Interior Work',
      jenisKerja: [
        {
          id: 3,
          name: 'Flooring',
          uraian: [
            {
              id: 3,
              name: 'Floor Installation',
              spec: [
                {
                  id: 4,
                  description: 'Ceramic tile installation',
                  satuan: 'm²',
                  volume: 150,
                  pricePerPcs: 125000
                },
                {
                  id: 5,
                  description: 'Wooden flooring (premium)',
                  satuan: 'm²',
                  volume: 75,
                  pricePerPcs: 350000
                }
              ]
            }
          ]
        }
      ]
    }
  ];

  const formatCurrency = (amount) => {
    if (amount == null || isNaN(amount)) return 'Rp 0';
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const calculateSpecTotal = (spec) => {
    // Use negotiated price if available, otherwise use original price
    const unitPrice = spec.negotiatedPrice !== undefined ? spec.negotiatedPrice : (spec.pricePerPcs || 0);
    return (spec.volume || 0) * unitPrice;
  };

  const calculateUraianTotal = (uraian) => {
    if (uraian.items) {
      // New structure with items array
      return uraian.items.reduce((total, item) => {
        const unitPrice = item.negotiatedPrice !== undefined ? item.negotiatedPrice : (item.unitPrice || 0);
        return total + ((item.volume || 0) * unitPrice);
      }, 0);
    }
    // Legacy structure with spec array
    return uraian.spec?.reduce((total, spec) => total + calculateSpecTotal(spec), 0) || 0;
  };

  const calculateJenisKerjaTotal = (jenisKerja) => {
    return jenisKerja.uraian?.reduce((total, uraian) => total + calculateUraianTotal(uraian), 0) || 0;
  };

  const calculateTahapanKerjaTotal = (tahapanKerja) => {
    return tahapanKerja.jenisKerja?.reduce((total, jenis) => total + calculateJenisKerjaTotal(jenis), 0) || 0;
  };

  const calculateGrandTotal = (tahapanKerjaList) => {
    return tahapanKerjaList.reduce((total, tahapan) => total + calculateTahapanKerjaTotal(tahapan), 0);
  };

  const boqData = getBOQData();
  
  // Show "No BOQ Available" if no data found
  if (!boqData) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-8">
        <div className="text-center">
          <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No BOQ Available</h3>
          <p className="text-gray-500">
            Bill of Quantities has not been uploaded for this project yet.
          </p>
        </div>
      </div>
    );
  }
  
  const grandTotal = calculateGrandTotal(boqData.tahapanKerja);

  // Flatten BOQ data for table display
  const flattenBOQData = () => {
    const flatData = [];
    
    boqData.tahapanKerja.forEach((tahapan, tahapanIndex) => {
      tahapan.jenisKerja?.forEach((jenis, jenisIndex) => {
        jenis.uraian?.forEach((uraian, uraianIndex) => {
          // Handle spec items
          if (uraian.spec && uraian.spec.length > 0) {
            uraian.spec.forEach((spec, specIndex) => {
              const originalPrice = spec.pricePerPcs || 0;
              const negotiatedPrice = spec.negotiatedPrice;
              const hasNegotiatedPrice = negotiatedPrice !== undefined && negotiatedPrice !== originalPrice;
              const displayPrice = hasNegotiatedPrice ? negotiatedPrice : originalPrice;
              const subtotal = (spec.volume || 0) * displayPrice;

              flatData.push({
                id: `spec-${tahapanIndex}-${jenisIndex}-${uraianIndex}-${specIndex}`,
                tahapanName: tahapan.name || `Work Phase ${tahapanIndex + 1}`,
                jenisName: jenis.name || `Category ${jenisIndex + 1}`,
                uraianName: uraian.name || `Item ${uraianIndex + 1}`,
                item: spec.description || `Specification ${specIndex + 1}`,
                volume: spec.volume || 0,
                unit: spec.satuan || '-',
                originalPrice: originalPrice,
                negotiatedPrice: negotiatedPrice,
                hasNegotiatedPrice: hasNegotiatedPrice,
                displayPrice: displayPrice,
                subtotal: subtotal
              });
            });
          }
          
          // Handle items
          if (uraian.items && uraian.items.length > 0) {
            uraian.items.forEach((item, itemIndex) => {
              const originalPrice = item.unitPrice || 0;
              const negotiatedPrice = item.negotiatedPrice;
              const hasNegotiatedPrice = negotiatedPrice !== undefined && negotiatedPrice !== originalPrice;
              const displayPrice = hasNegotiatedPrice ? negotiatedPrice : originalPrice;
              const subtotal = (item.volume || 0) * displayPrice;

              flatData.push({
                id: `item-${tahapanIndex}-${jenisIndex}-${uraianIndex}-${itemIndex}`,
                tahapanName: tahapan.name || `Work Phase ${tahapanIndex + 1}`,
                jenisName: jenis.name || `Category ${jenisIndex + 1}`,
                uraianName: uraian.name || `Item ${uraianIndex + 1}`,
                item: item.item || item.description || `Item ${itemIndex + 1}`,
                volume: item.volume || 0,
                unit: item.unit || '-',
                originalPrice: originalPrice,
                negotiatedPrice: negotiatedPrice,
                hasNegotiatedPrice: hasNegotiatedPrice,
                displayPrice: displayPrice,
                subtotal: subtotal
              });
            });
          }
        });
      });
    });
    
    return flatData;
  };

  const flattenedData = flattenBOQData();

  return (
    <div className="w-full bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* BOQ Header */}
      <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">{boqData.title}</h3>
            <p className="text-sm text-gray-600">
              Detailed breakdown of project scope and costs
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Total Project Value</p>
            <p className="text-2xl font-bold text-blue-600">{formatCurrency(grandTotal)}</p>
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
                  Item Description
                </th>
                <th className="px-4 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider border-r border-gray-200">
                  Volume
                </th>
                <th className="px-4 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider border-r border-gray-200">
                  Unit
                </th>
                <th className="px-4 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Unit Price
                </th>
                <th className="px-4 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Subtotal
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {flattenedData.map((item, index) => (
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
                    <div className="flex flex-col items-end">
                      <span className={item.hasNegotiatedPrice ? 'text-green-600 font-medium' : ''}>
                        {formatCurrency(item.displayPrice)}
                      </span>
                      {item.hasNegotiatedPrice && (
                        <>
                          <span className="text-xs text-gray-400 line-through">
                            {formatCurrency(item.originalPrice)}
                          </span>
                          <span className="text-xs text-green-600 font-medium">
                            Negotiated
                          </span>
                        </>
                      )}
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
                <td colSpan="7" className="px-4 py-4 text-sm font-semibold text-gray-900 text-right border-r border-gray-300">
                  <div className="flex items-center justify-end gap-2">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0 2.08-.402 2.599-1" />
                    </svg>
                    Total Project Value:
                  </div>
                </td>
                <td className="px-4 py-4 text-lg font-bold text-blue-700 text-right">
                  {formatCurrency(grandTotal)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Notes for vendor view */}
      {isVendorView && (
        <div className={`mt-4 mx-6 mb-6 p-4 border rounded-lg ${
          showNegotiatedPrices 
            ? 'bg-green-50 border-green-200' 
            : 'bg-amber-50 border-amber-200'
        }`}>
          <div className="flex items-start space-x-3">
            <svg className={`w-5 h-5 mt-0.5 ${
              showNegotiatedPrices ? 'text-green-600' : 'text-amber-600'
            }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h5 className={`font-medium mb-1 ${
                showNegotiatedPrices ? 'text-green-800' : 'text-amber-800'
              }`}>
                {showNegotiatedPrices ? 'Negotiated Pricing' : 'BOQ Information'}
              </h5>
              <p className={`text-sm ${
                showNegotiatedPrices ? 'text-green-700' : 'text-amber-700'
              }`}>
                {showNegotiatedPrices 
                  ? 'This BOQ shows the latest negotiated prices from your discussions with the project owner. Items with negotiated prices are highlighted in green with the original price crossed out.'
                  : 'This BOQ provides a detailed breakdown of the project scope and estimated costs. You may propose alternative solutions or materials in your proposal while maintaining the project objectives.'
                }
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BOQDisplay;
