'use client';

import React, { useState } from 'react';

const BOQDisplay = ({ project, isVendorView = false, showNegotiatedPrices = false }) => {
  const [expandedSections, setExpandedSections] = useState({});
  const [expandedItems, setExpandedItems] = useState({});

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

  const toggleSection = (sectionId) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  const toggleItem = (itemId) => {
    setExpandedItems(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }));
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

  return (
    <div className="bg-white rounded-lg border border-gray-200">
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

      {/* BOQ Content */}
      <div className="p-6">
        <div className="space-y-4">
          {boqData.tahapanKerja.map((tahapan, tahapanIndex) => {
            const tahapanTotal = calculateTahapanKerjaTotal(tahapan);
            const sectionKey = `tahapan-${tahapan.id || tahapanIndex}`;
            const isExpanded = expandedSections[sectionKey];

            return (
              <div key={sectionKey} className="border border-gray-200 rounded-lg overflow-hidden">
                {/* Tahapan Header */}
                <div
                  className="bg-gray-50 p-4 cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => toggleSection(sectionKey)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <svg
                        className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${
                          isExpanded ? 'rotate-90' : ''
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900">
                          {tahapan.name || `Work Phase ${tahapanIndex + 1}`}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {tahapan.jenisKerja?.length || 0} work categories
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-gray-900">
                        {formatCurrency(tahapanTotal)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Tahapan Content */}
                {isExpanded && (
                  <div className="p-4 space-y-3">
                    {tahapan.jenisKerja?.map((jenis, jenisIndex) => {
                      const jenisTotal = calculateJenisKerjaTotal(jenis);
                      const itemKey = `jenis-${jenis.id || jenisIndex}`;
                      const isItemExpanded = expandedItems[itemKey];

                      return (
                        <div key={itemKey} className="bg-white border border-gray-100 rounded-lg">
                          {/* Jenis Kerja Header */}
                          <div
                            className="p-3 cursor-pointer hover:bg-gray-50 transition-colors"
                            onClick={() => toggleItem(itemKey)}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <svg
                                  className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
                                    isItemExpanded ? 'rotate-90' : ''
                                  }`}
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                                <h5 className="font-medium text-gray-800">
                                  {jenis.name || `Category ${jenisIndex + 1}`}
                                </h5>
                              </div>
                              <p className="font-semibold text-gray-900">
                                {formatCurrency(jenisTotal)}
                              </p>
                            </div>
                          </div>

                          {/* Jenis Kerja Content */}
                          {isItemExpanded && (
                            <div className="px-3 pb-3">
                              {jenis.uraian?.map((uraian, uraianIndex) => {
                                const uraianTotal = calculateUraianTotal(uraian);

                                return (
                                  <div key={`uraian-${uraian.id || uraianIndex}`} className="mb-4 last:mb-0">
                                    <div className="bg-blue-50 p-3 rounded-lg mb-2">
                                      <div className="flex items-center justify-between">
                                        <h6 className="font-medium text-blue-900">
                                          {uraian.name || `Item ${uraianIndex + 1}`}
                                        </h6>
                                        <span className="font-bold text-blue-800">
                                          {formatCurrency(uraianTotal)}
                                        </span>
                                      </div>
                                    </div>

                                    {/* Specifications Table */}
                                    {uraian.spec && uraian.spec.length > 0 && (
                                      <div className="bg-gray-50 rounded-lg overflow-hidden">
                                        <table className="w-full text-sm">
                                          <thead className="bg-gray-100">
                                            <tr>
                                              <th className="px-3 py-2 text-left font-medium text-gray-700">
                                                Description
                                              </th>
                                              <th className="px-3 py-2 text-center font-medium text-gray-700">
                                                Unit
                                              </th>
                                              <th className="px-3 py-2 text-center font-medium text-gray-700">
                                                Qty
                                              </th>
                                              <th className="px-3 py-2 text-right font-medium text-gray-700">
                                                Unit Price
                                              </th>
                                              <th className="px-3 py-2 text-right font-medium text-gray-700">
                                                Subtotal
                                              </th>
                                            </tr>
                                          </thead>
                                          <tbody>
                                            {uraian.spec.map((spec, specIndex) => (
                                              <tr key={`spec-${spec.id || specIndex}`} className="border-b border-gray-200">
                                                <td className="px-3 py-2 text-gray-800">
                                                  {spec.description || `Specification ${specIndex + 1}`}
                                                </td>
                                                <td className="px-3 py-2 text-center text-gray-600">
                                                  {spec.satuan || '-'}
                                                </td>
                                                <td className="px-3 py-2 text-center text-gray-800 font-medium">
                                                  {spec.volume || 0}
                                                </td>
                                                <td className="px-3 py-2 text-right text-gray-800">
                                                  <div className="flex flex-col items-end">
                                                    {(() => {
                                                      const originalPrice = spec.pricePerPcs || 0;
                                                      const negotiatedPrice = spec.negotiatedPrice;
                                                      const hasNegotiatedPrice = negotiatedPrice !== undefined && negotiatedPrice !== originalPrice;
                                                      const displayPrice = hasNegotiatedPrice ? negotiatedPrice : originalPrice;
                                                      
                                                      return (
                                                        <>
                                                          <span className={hasNegotiatedPrice ? 'text-green-600 font-medium' : ''}>
                                                            {formatCurrency(displayPrice)}
                                                          </span>
                                                          {hasNegotiatedPrice && (
                                                            <>
                                                              <span className="text-xs text-gray-400 line-through">
                                                                {formatCurrency(originalPrice)}
                                                              </span>
                                                              <span className="text-xs text-green-600 font-medium">
                                                                Negotiated
                                                              </span>
                                                            </>
                                                          )}
                                                        </>
                                                      );
                                                    })()}
                                                  </div>
                                                </td>
                                                <td className="px-3 py-2 text-right font-semibold text-gray-900">
                                                  {formatCurrency(calculateSpecTotal(spec))}
                                                </td>
                                              </tr>
                                            ))}
                                          </tbody>
                                        </table>
                                      </div>
                                    )}

                                    {/* Items Table (New Structure) */}
                                    {uraian.items && uraian.items.length > 0 && (
                                      <div className="bg-gray-50 rounded-lg overflow-hidden">
                                        <table className="w-full text-sm">
                                          <thead className="bg-gray-100">
                                            <tr>
                                              <th className="px-3 py-2 text-left text-gray-600 font-medium">
                                                Item Description
                                              </th>
                                              <th className="px-3 py-2 text-center text-gray-600 font-medium">
                                                Unit
                                              </th>
                                              <th className="px-3 py-2 text-center text-gray-600 font-medium">
                                                Volume
                                              </th>
                                              <th className="px-3 py-2 text-right text-gray-600 font-medium">
                                                Unit Price
                                              </th>
                                              <th className="px-3 py-2 text-right text-gray-600 font-medium">
                                                Total
                                              </th>
                                            </tr>
                                          </thead>
                                          <tbody>
                                            {uraian.items.map((item, itemIndex) => (
                                              <tr key={itemIndex} className="border-t border-gray-200">
                                                <td className="px-3 py-2 text-gray-800">
                                                  {item.item || item.description || `Item ${itemIndex + 1}`}
                                                </td>
                                                <td className="px-3 py-2 text-center text-gray-600">
                                                  {item.unit || '-'}
                                                </td>
                                                <td className="px-3 py-2 text-center text-gray-800 font-medium">
                                                  {item.volume || 0}
                                                </td>
                                                <td className="px-3 py-2 text-right text-gray-800">
                                                  <div className="flex flex-col items-end">
                                                    {(() => {
                                                      const originalPrice = item.unitPrice || 0;
                                                      const negotiatedPrice = item.negotiatedPrice;
                                                      const hasNegotiatedPrice = negotiatedPrice !== undefined && negotiatedPrice !== originalPrice;
                                                      const displayPrice = hasNegotiatedPrice ? negotiatedPrice : originalPrice;
                                                      
                                                      return (
                                                        <>
                                                          <span className={hasNegotiatedPrice ? 'text-green-600 font-medium' : ''}>
                                                            {formatCurrency(displayPrice)}
                                                          </span>
                                                          {hasNegotiatedPrice && (
                                                            <>
                                                              <span className="text-xs text-gray-400 line-through">
                                                                {formatCurrency(originalPrice)}
                                                              </span>
                                                              <span className="text-xs text-green-600 font-medium">
                                                                Negotiated
                                                              </span>
                                                            </>
                                                          )}
                                                        </>
                                                      );
                                                    })()}
                                                  </div>
                                                </td>
                                                <td className="px-3 py-2 text-right font-semibold text-gray-900">
                                                  {(() => {
                                                    const unitPrice = item.negotiatedPrice !== undefined ? item.negotiatedPrice : (item.unitPrice || 0);
                                                    return formatCurrency((item.volume || 0) * unitPrice);
                                                  })()}
                                                </td>
                                              </tr>
                                            ))}
                                          </tbody>
                                        </table>
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Summary Footer */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-lg font-semibold text-gray-900">Project Total</h4>
                <p className="text-sm text-gray-600">
                  {boqData.tahapanKerja.length} work phases • Comprehensive breakdown
                </p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-blue-600">{formatCurrency(grandTotal)}</p>
                {isVendorView && (
                  <p className="text-sm text-gray-500 mt-1">
                    Estimated project value
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Notes for vendor view */}
        {isVendorView && (
          <div className={`mt-4 p-4 border rounded-lg ${
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
    </div>
  );
};

export default BOQDisplay;
