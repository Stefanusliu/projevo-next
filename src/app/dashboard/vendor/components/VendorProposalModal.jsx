'use client';

import React, { useState, useEffect } from 'react';
import { db } from '../../../../lib/firebase';
import { doc, updateDoc, arrayUnion, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../../../../contexts/AuthContext';

const VendorProposalModal = ({ isOpen, onClose, project, onSubmitSuccess }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    proposalPrice: '',
    estimatedDuration: '',
    description: ''
  });
  const [vendorBOQ, setVendorBOQ] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('details');

  // Helper function to format budget with Rp and thousand separators
  const formatBudget = (value) => {
    if (!value) return 'Budget not specified';
    
    // If already formatted, return as is
    if (typeof value === 'string' && value.includes('Rp')) {
      return value;
    }
    
    // Handle numeric conversion
    let numBudget;
    if (typeof value === 'string') {
      numBudget = parseInt(value.replace(/[^\d]/g, ''));
    } else {
      numBudget = parseInt(value);
    }
    
    if (isNaN(numBudget) || numBudget === 0) {
      return 'Budget not specified';
    }
    
    return `Rp ${numBudget.toLocaleString('id-ID')}`;
  };

  // Initialize vendor BOQ from project BOQ
  useEffect(() => {
    if (project && isOpen) {
      initializeVendorBOQ();
    }
  }, [project, isOpen]);

  const initializeVendorBOQ = () => {
    // Get BOQ data from project
    const projectBOQ = project.boq || 
                      project.attachedBOQ || 
                      project.boqData || 
                      project.originalData?.boq || 
                      project.originalData?.attachedBOQ;

    if (projectBOQ?.tahapanKerja) {
      // Create vendor BOQ with empty volume, satuan, and pricePerPcs for vendor to fill
      const vendorBOQStructure = {
        title: projectBOQ.title || 'Vendor Proposal - Bill of Quantities',
        tahapanKerja: projectBOQ.tahapanKerja.map(tahapan => ({
          ...tahapan,
          jenisKerja: tahapan.jenisKerja?.map(jenis => ({
            ...jenis,
            uraian: jenis.uraian?.map(uraian => ({
              ...uraian,
              spec: uraian.spec?.map(spec => ({
                ...spec,
                // Keep description but clear vendor-fillable fields
                volume: 0,
                satuan: '',
                pricePerPcs: 0
              })) || []
            })) || []
          })) || []
        })) || []
      };
      setVendorBOQ(vendorBOQStructure);
    }
  };

  const updateBOQSpec = (tahapanIndex, jenisIndex, uraianIndex, specIndex, field, value) => {
    setVendorBOQ(prev => {
      const newBOQ = { ...prev };
      const spec = newBOQ.tahapanKerja[tahapanIndex].jenisKerja[jenisIndex].uraian[uraianIndex].spec[specIndex];
      
      if (field === 'volume' || field === 'pricePerPcs') {
        spec[field] = parseFloat(value) || 0;
      } else {
        spec[field] = value;
      }
      
      return newBOQ;
    });
  };

  const calculateSpecTotal = (spec) => {
    return (spec.volume || 0) * (spec.pricePerPcs || 0);
  };

  const calculateUraianTotal = (uraian) => {
    return uraian.spec?.reduce((total, spec) => total + calculateSpecTotal(spec), 0) || 0;
  };

  const calculateJenisKerjaTotal = (jenisKerja) => {
    return jenisKerja.uraian?.reduce((total, uraian) => total + calculateUraianTotal(uraian), 0) || 0;
  };

  const calculateTahapanKerjaTotal = (tahapanKerja) => {
    return tahapanKerja.jenisKerja?.reduce((total, jenis) => total + calculateJenisKerjaTotal(jenis), 0) || 0;
  };

  const calculateGrandTotal = () => {
    if (!vendorBOQ?.tahapanKerja) return 0;
    return vendorBOQ.tahapanKerja.reduce((total, tahapan) => total + calculateTahapanKerjaTotal(tahapan), 0);
  };

  const formatCurrency = (amount) => {
    if (amount == null || isNaN(amount)) return 'Rp 0';
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    
    try {
      const proposalData = {
        id: Date.now().toString(),
        vendorId: user.uid,
        vendorName: user.displayName || user.email?.split('@')[0] || 'Unknown Vendor',
        vendorEmail: user.email,
        proposalPrice: formData.proposalPrice,
        estimatedDuration: formData.estimatedDuration,
        description: formData.description,
        vendorBOQ: vendorBOQ,
        totalAmount: calculateGrandTotal(),
        submittedAt: new Date().toISOString(), // Use regular Date instead of serverTimestamp
        status: 'pending'
      };

      console.log('Submitting proposal for project:', project.id);
      console.log('User ID:', user.uid);
      console.log('Proposal data:', proposalData);

      // Update project with new proposal
      const projectRef = doc(db, 'projects', project.id);
      await updateDoc(projectRef, {
        proposals: arrayUnion(proposalData),
        updatedAt: serverTimestamp()
      });

      console.log('Proposal submitted successfully');
      
      if (onSubmitSuccess) {
        onSubmitSuccess();
      }
      
      onClose();
    } catch (error) {
      console.error('Error submitting proposal:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      console.error('Error details:', JSON.stringify(error, null, 2));
      
      let errorMessage = 'Failed to submit proposal. ';
      if (error.code === 'permission-denied') {
        errorMessage += 'You do not have permission to submit proposals for this project.';
      } else if (error.code === 'not-found') {
        errorMessage += 'Project not found.';
      } else {
        errorMessage += 'Please try again or contact support.';
      }
      
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Buat Penawaran
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Project Info */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {project.projectTitle}
            </h3>
            <div className="flex items-center gap-2 mb-2">
              <span 
                className="px-2.5 py-1 text-xs font-medium rounded-full text-white"
                style={{ backgroundColor: '#2373FF' }}
              >
                {project.projectType}
              </span>
              <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-700">
                {project.propertyType}
              </span>
            </div>
            <p className="text-sm text-gray-600">
              Budget: {formatBudget(project.budget)} | Duration: {project.duration}
            </p>
          </div>

          {/* Tab Navigation */}
          <div className="border-b border-gray-200 mb-6">
            <nav className="flex space-x-8">
              <button
                onClick={() => setActiveTab('details')}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'details'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Proposal Details
              </button>
              {vendorBOQ && (
                <button
                  onClick={() => setActiveTab('boq')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === 'boq'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  BOQ Pricing
                </button>
              )}
            </nav>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Tab Content */}
            {activeTab === 'details' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Penawaran Harga
                  </label>
                  <input
                    type="text"
                    placeholder="Masukkan penawaran harga Anda"
                    value={formData.proposalPrice}
                    onChange={(e) => setFormData(prev => ({ ...prev, proposalPrice: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent text-black bg-white placeholder-gray-500"
                    onFocus={(e) => {
                      e.target.style.outline = 'none';
                      e.target.style.borderColor = '#2373FF';
                      e.target.style.boxShadow = '0 0 0 3px rgba(35, 115, 255, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#d1d5db';
                      e.target.style.boxShadow = 'none';
                    }}
                    required
                  />
                  {vendorBOQ && (
                    <p className="text-sm text-gray-500 mt-1">
                      BOQ Total: {formatCurrency(calculateGrandTotal())}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Estimasi Waktu Pengerjaan
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: 3 bulan"
                    value={formData.estimatedDuration}
                    onChange={(e) => setFormData(prev => ({ ...prev, estimatedDuration: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent text-black bg-white placeholder-gray-500"
                    onFocus={(e) => {
                      e.target.style.outline = 'none';
                      e.target.style.borderColor = '#2373FF';
                      e.target.style.boxShadow = '0 0 0 3px rgba(35, 115, 255, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#d1d5db';
                      e.target.style.boxShadow = 'none';
                    }}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Deskripsi Penawaran
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Jelaskan detail penawaran, metodologi, dan keunggulan Anda..."
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent text-black bg-white placeholder-gray-500 resize-none"
                    onFocus={(e) => {
                      e.target.style.outline = 'none';
                      e.target.style.borderColor = '#2373FF';
                      e.target.style.boxShadow = '0 0 0 3px rgba(35, 115, 255, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#d1d5db';
                      e.target.style.boxShadow = 'none';
                    }}
                    required
                  />
                </div>
              </div>
            )}

            {activeTab === 'boq' && vendorBOQ && (
              <div className="space-y-6">
                {/* BOQ Header */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 p-6 rounded-xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-bold text-blue-900 mb-2">BOQ Pricing</h3>
                      <p className="text-blue-700">
                        Enter your pricing for each work item below
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-blue-600 mb-1">Grand Total</p>
                      <p className="text-2xl font-bold text-blue-900">
                        {formatCurrency(calculateGrandTotal())}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Simplified BOQ Table */}
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-200">
                          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Work Item</th>
                          <th className="px-4 py-4 text-center text-sm font-semibold text-gray-900 w-24">Volume</th>
                          <th className="px-4 py-4 text-center text-sm font-semibold text-gray-900 w-20">Unit</th>
                          <th className="px-4 py-4 text-right text-sm font-semibold text-gray-900 w-32">Unit Price</th>
                          <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900 w-32">Amount</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {vendorBOQ.tahapanKerja.map((tahapan, tahapanIndex) => (
                          <React.Fragment key={tahapanIndex}>
                            {/* Phase Header */}
                            <tr className="bg-blue-50">
                              <td colSpan="5" className="px-6 py-3">
                                <div className="flex items-center justify-between">
                                  <h4 className="text-lg font-semibold text-blue-900">
                                    {tahapan.name || `Phase ${tahapanIndex + 1}`}
                                  </h4>
                                  <span className="text-blue-800 font-semibold">
                                    {formatCurrency(calculateTahapanKerjaTotal(tahapan))}
                                  </span>
                                </div>
                              </td>
                            </tr>

                            {/* Work Items */}
                            {tahapan.jenisKerja?.map((jenis, jenisIndex) =>
                              jenis.uraian?.map((uraian, uraianIndex) =>
                                uraian.spec?.map((spec, specIndex) => (
                                  <tr key={`${tahapanIndex}-${jenisIndex}-${uraianIndex}-${specIndex}`} 
                                      className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4">
                                      <div className="space-y-1">
                                        <p className="text-sm font-medium text-gray-900">
                                          {spec.description || `${uraian.name || 'Work Item'} - Spec ${specIndex + 1}`}
                                        </p>
                                        <div className="flex gap-2 text-xs text-gray-500">
                                          <span className="bg-gray-100 px-2 py-1 rounded">
                                            {jenis.name || `Category ${jenisIndex + 1}`}
                                          </span>
                                          <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded">
                                            {uraian.name || `Item ${uraianIndex + 1}`}
                                          </span>
                                        </div>
                                      </div>
                                    </td>
                                    <td className="px-4 py-4 text-center">
                                      <input
                                        type="number"
                                        placeholder="0"
                                        value={spec.volume || ''}
                                        onChange={(e) => updateBOQSpec(tahapanIndex, jenisIndex, uraianIndex, specIndex, 'volume', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-center text-sm font-medium bg-white text-black placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                        min="0"
                                        step="any"
                                      />
                                    </td>
                                    <td className="px-4 py-4 text-center">
                                      <input
                                        type="text"
                                        placeholder="unit"
                                        value={spec.satuan || ''}
                                        onChange={(e) => updateBOQSpec(tahapanIndex, jenisIndex, uraianIndex, specIndex, 'satuan', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-center text-sm font-medium bg-white text-black placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all"
                                      />
                                    </td>
                                    <td className="px-4 py-4 text-right">
                                      <input
                                        type="number"
                                        placeholder="0"
                                        value={spec.pricePerPcs || ''}
                                        onChange={(e) => updateBOQSpec(tahapanIndex, jenisIndex, uraianIndex, specIndex, 'pricePerPcs', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-right text-sm font-medium bg-white text-black placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                        min="0"
                                        step="any"
                                      />
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                      <span className="text-lg font-bold text-gray-900">
                                        {formatCurrency(calculateSpecTotal(spec))}
                                      </span>
                                    </td>
                                  </tr>
                                ))
                              )
                            )}
                          </React.Fragment>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Summary */}
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-gray-900">Total BOQ Amount:</span>
                    <span className="text-2xl font-bold text-blue-600">
                      {formatCurrency(calculateGrandTotal())}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex space-x-3 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                disabled={loading}
              >
                Batal
              </button>
              <button
                type="submit"
                className="flex-1 px-6 py-3 text-white font-medium rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: '#2373FF' }}
                onMouseEnter={(e) => !loading && (e.target.style.backgroundColor = '#1a5ce6')}
                onMouseLeave={(e) => !loading && (e.target.style.backgroundColor = '#2373FF')}
                disabled={loading}
              >
                {loading ? 'Mengirim...' : 'Kirim Penawaran'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default VendorProposalModal;
