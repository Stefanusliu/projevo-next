'use client';

import { useState } from 'react';

export default function ProposalSubmissionModal({ project, isOpen, onClose, onSubmit }) {
  const [proposalData, setProposalData] = useState({
    bidAmount: '',
    timeline: '',
    coverLetter: '',
    keyDifferentiators: ['']
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !project) return null;

  const addKeyDifferentiator = () => {
    setProposalData(prev => ({
      ...prev,
      keyDifferentiators: [...prev.keyDifferentiators, '']
    }));
  };

  const updateKeyDifferentiator = (index, value) => {
    setProposalData(prev => ({
      ...prev,
      keyDifferentiators: prev.keyDifferentiators.map((item, i) => 
        i === index ? value : item
      )
    }));
  };

  const removeKeyDifferentiator = (index) => {
    if (proposalData.keyDifferentiators.length > 1) {
      setProposalData(prev => ({
        ...prev,
        keyDifferentiators: prev.keyDifferentiators.filter((_, i) => i !== index)
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!proposalData.bidAmount) {
      newErrors.bidAmount = 'Bid amount is required';
    } else if (isNaN(proposalData.bidAmount) || parseFloat(proposalData.bidAmount) <= 0) {
      newErrors.bidAmount = 'Please enter a valid amount';
    }
    
    if (!proposalData.timeline) {
      newErrors.timeline = 'Timeline is required';
    }
    
    if (!proposalData.coverLetter || proposalData.coverLetter.trim().length < 100) {
      newErrors.coverLetter = 'Cover letter must be at least 100 characters';
    }

    if (proposalData.keyDifferentiators.filter(d => d.trim()).length === 0) {
      newErrors.keyDifferentiators = 'At least one key differentiator is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      await onSubmit(proposalData);
      
      // Reset form
      setProposalData({
        bidAmount: '',
        timeline: '',
        coverLetter: '',
        keyDifferentiators: ['']
      });
      
      onClose();
      
    } catch (error) {
      console.error('Error submitting proposal:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const budgetRange = project.budget.replace(/[^0-9,-]/g, '');
  const [minBudget, maxBudget] = budgetRange.includes('-') 
    ? budgetRange.split('-').map(b => parseInt(b.replace(/,/g, '')))
    : [0, parseInt(budgetRange.replace(/,/g, ''))];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Buat Penawaran</h2>
            <p className="text-slate-600">{project.name} • {project.budget}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <svg className="w-6 h-6 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Header Note */}
        <div className="px-6 py-3 bg-blue-50 border-b border-slate-200">
          <div className="flex items-center space-x-2">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm text-blue-800">
              <strong>Catatan:</strong> Portfolio dan pengalaman dari profil Anda akan otomatis disertakan dalam proposal ini. 
              <a href="#" className="underline hover:no-underline ml-1 text-blue-600">Perbarui profil</a>
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-6">
              {/* Bid Amount */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Jumlah Penawaran *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500">Rp</span>
                    <input
                      type="text"
                      value={proposalData.bidAmount}
                      onChange={(e) => setProposalData(prev => ({ ...prev, bidAmount: e.target.value }))}
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.bidAmount 
                          ? 'border-red-300 bg-red-50'
                          : 'border-slate-300 bg-white'
                      } text-slate-900`}
                      placeholder="Masukkan jumlah penawaran"
                    />
                  </div>
                  {errors.bidAmount && (
                    <p className="text-red-500 text-sm mt-1">{errors.bidAmount}</p>
                  )}
                  {maxBudget > 0 && (
                    <p className="text-sm text-slate-500 mt-1">
                      Budget klien: Rp {minBudget.toLocaleString()} - Rp {maxBudget.toLocaleString()}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Timeline Proyek *
                  </label>
                  <select
                    value={proposalData.timeline}
                    onChange={(e) => setProposalData(prev => ({ ...prev, timeline: e.target.value }))}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.timeline 
                        ? 'border-red-300 bg-red-50'
                        : 'border-slate-300 bg-white'
                    } text-slate-900`}
                  >
                    <option value="">Pilih timeline</option>
                    <option value="1-2 minggu">1-2 minggu</option>
                    <option value="2-4 minggu">2-4 minggu</option>
                    <option value="1-2 bulan">1-2 bulan</option>
                    <option value="2-3 bulan">2-3 bulan</option>
                    <option value="3-6 bulan">3-6 bulan</option>
                    <option value="6+ bulan">6+ bulan</option>
                  </select>
                  {errors.timeline && (
                    <p className="text-red-500 text-sm mt-1">{errors.timeline}</p>
                  )}
                </div>
              </div>

              {/* Cover Letter */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Surat Pengantar *
                </label>
                <textarea
                  value={proposalData.coverLetter}
                  onChange={(e) => setProposalData(prev => ({ ...prev, coverLetter: e.target.value }))}
                  rows={6}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.coverLetter 
                      ? 'border-red-300 bg-red-50'
                      : 'border-slate-300 bg-white'
                  } text-slate-900`}
                  placeholder="Jelaskan pendekatan Anda, pengalaman dengan proyek serupa, dan mengapa Anda adalah pilihan terbaik untuk proyek ini..."
                />
                {errors.coverLetter && (
                  <p className="text-red-500 text-sm mt-1">{errors.coverLetter}</p>
                )}
                <p className="text-xs text-slate-500 mt-1">
                  {proposalData.coverLetter.length}/100 karakter minimum
                </p>
              </div>

              {/* Key Differentiators */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Keunggulan Utama *
                </label>
                <p className="text-sm text-slate-500 mb-3">
                  Apa yang membuat pendekatan Anda unik? Sebutkan keunggulan kompetitif Anda.
                </p>
                {proposalData.keyDifferentiators.map((differentiator, index) => (
                  <div key={index} className="flex space-x-2 mb-2">
                    <input
                      type="text"
                      value={differentiator}
                      onChange={(e) => updateKeyDifferentiator(index, e.target.value)}
                      className="flex-1 px-4 py-2 border border-slate-300 bg-white text-slate-900 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder={`Keunggulan ${index + 1}`}
                    />
                    {proposalData.keyDifferentiators.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeKeyDifferentiator(index)}
                        className="text-red-500 hover:text-red-700 text-sm px-2"
                      >
                        Hapus
                      </button>
                    )}
                  </div>
                ))}
                
                <button
                  type="button"
                  onClick={addKeyDifferentiator}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center space-x-1"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <span>Tambah Keunggulan Lainnya</span>
                </button>
                
                {errors.keyDifferentiators && (
                  <p className="text-red-500 text-sm mt-1">{errors.keyDifferentiators}</p>
                )}
              </div>
            </div>

          {/* Action Buttons */}
          <div className="flex justify-between items-center pt-6 border-t border-slate-200 mt-8">
            <div className="text-sm text-slate-500">
              <p>💡 Fokus pada proposal Anda - portfolio dan pengalaman diambil dari profil</p>
            </div>
            <div className="flex space-x-4">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? 'Mengirim...' : 'Kirim Proposal'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
