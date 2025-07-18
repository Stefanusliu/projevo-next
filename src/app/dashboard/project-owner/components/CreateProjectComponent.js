'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../../../contexts/AuthContext';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../../../lib/firebase';
import SavedBOQSelector from './SavedBOQSelector';

export default function CreateProjectComponent({ onBack }) {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // I. Informasi Umum Proyek
    projectTitle: '',
    province: '',
    city: '',
    fullAddress: '',
    
    // II. Klasifikasi & Ruang Lingkup Proyek
    projectType: '',
    procurementMethod: '',
    projectScope: [],
    propertyType: '',
    otherProperty: '',
    estimatedBudget: '',
    estimatedDuration: '',
    tenderDuration: '',
    estimatedStartDate: '',
    
    // Documents
    supportingDocuments: [], // For Desain projects
    boqDocuments: [], // For Bangun & Renovasi projects
    drawingDocuments: [], // For Bangun & Renovasi projects
    documentTitles: {},
    
    // BOQ Data from BOQ Maker
    selectedBOQ: null,
    boqData: null,
    
    // Special Notes
    specialNotes: '',
    
    // Agreements
    agreementTerms: false,
    agreementData: false,
    agreementValidation: false
  });

  const [showBOQSelector, setShowBOQSelector] = useState(false);
  const [selectedBOQ, setSelectedBOQ] = useState(null);
  const [loading, setLoading] = useState(false);

  const projectTypes = [
    'Desain', 'Bangun', 'Renovasi'
  ];

  const procurementMethods = [
    'Penunjukan Langsung', 'Tender'
  ];

  const projectScopes = [
    'Interior', 'Furniture', 'Sipil', 'Eksterior', 'Taman & Hardscape'
  ];

  const propertyTypes = [
    'Rumah Tinggal', 'Apartemen', 'Ruko', 'Kantor', 'Gudang', 
    'Restoran', 'Sekolah', 'Hotel / Penginapan', 'Other'
  ];

  const provinces = [
    'DKI Jakarta', 'Jawa Barat', 'Jawa Tengah', 'Jawa Timur', 'Banten',
    'Sumatera Utara', 'Sumatera Barat', 'Sumatera Selatan', 'Bali', 'Other'
  ];

  const cities = {
    'DKI Jakarta': ['Jakarta Selatan', 'Jakarta Pusat', 'Jakarta Barat', 'Jakarta Utara', 'Jakarta Timur'],
    'Jawa Barat': ['Bandung', 'Bekasi', 'Depok', 'Bogor', 'Tangerang'],
    'Jawa Tengah': ['Semarang', 'Solo', 'Yogyakarta', 'Magelang'],
    'Jawa Timur': ['Surabaya', 'Malang', 'Kediri', 'Blitar'],
    'Banten': ['Tangerang', 'Tangerang Selatan', 'Serang', 'Cilegon'],
    'Other': ['Other']
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Format number with thousand separators for display
  const formatNumberWithCommas = (num) => {
    if (!num) return '';
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  // Remove commas and return clean number
  const cleanNumber = (str) => {
    return str.replace(/,/g, '');
  };

  // Handle budget input with automatic formatting
  const handleBudgetChange = (value) => {
    // Remove any non-digit characters except commas
    const cleanValue = value.replace(/[^\d,]/g, '');
    // Remove existing commas to get pure number
    const numberOnly = cleanValue.replace(/,/g, '');
    
    // Update the form data with clean number
    setFormData(prev => ({ ...prev, estimatedBudget: numberOnly }));
  };

  // Get formatted budget for display
  const getFormattedBudget = () => {
    return formatNumberWithCommas(formData.estimatedBudget);
  };

  const handleScopeToggle = (scope) => {
    setFormData(prev => ({
      ...prev,
      projectScope: prev.projectScope.includes(scope)
        ? prev.projectScope.filter(s => s !== scope)
        : [...prev.projectScope, scope]
    }));
  };

  const getAvailableCities = () => {
    return formData.province && cities[formData.province] ? cities[formData.province] : [];
  };

  const handleStepChange = (step) => {
    setCurrentStep(step);
  };

  const saveDraft = () => {
    const draftData = {
      ...formData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isDraft: true
    };

    const existingDrafts = JSON.parse(localStorage.getItem('projevo_project_drafts') || '[]');
    const updatedDrafts = [...existingDrafts, draftData];
    localStorage.setItem('projevo_project_drafts', JSON.stringify(updatedDrafts));

    // Dispatch custom event to notify other components
    window.dispatchEvent(new Event('draftSaved'));

    alert('Draft saved successfully!');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!user?.uid) {
      alert('Please log in to create a project');
      return;
    }

    // Validation
    if (!formData.projectTitle || !formData.province || !formData.city || !formData.fullAddress ||
        !formData.projectType || !formData.procurementMethod || !formData.propertyType ||
        !formData.estimatedBudget || !formData.estimatedDuration || !formData.tenderDuration ||
        !formData.estimatedStartDate || formData.projectScope.length === 0) {
      alert('Please fill in all required fields');
      return;
    }

    // Check required agreements
    if (!formData.agreementTerms || !formData.agreementData || !formData.agreementValidation) {
      alert('Please accept all required agreements to continue');
      return;
    }

    setLoading(true);
    try {
      const projectData = {
        ...formData,
        title: formData.projectTitle,
        ownerId: user.uid,
        ownerEmail: user.email,
        ownerName: user.displayName || user.email,
        status: 'Menunggu Persetujuan', // Set status for moderation
        moderationStatus: 'pending',
        progress: 0,
        isPublished: false, // Will be set to true after approval
        publishedAt: null, // Will be set when approved
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        submittedAt: serverTimestamp(),
        team: [],
        milestones: [
          { name: 'Planning', completed: false, date: '' },
          { name: 'Design', completed: false, date: '' },
          { name: 'Development', completed: false, date: '' },
          { name: 'Review', completed: false, date: '' },
          { name: 'Completion', completed: false, date: '' }
        ],
        // Add metadata for marketplace
        marketplace: {
          category: formData.projectType,
          tags: formData.projectScope,
          budget: formData.estimatedBudget,
          duration: formData.estimatedDuration,
          location: {
            province: formData.province,
            city: formData.city,
            fullAddress: formData.fullAddress
          }
        }
      };

      // Include the complete BOQ data if selected
      if (selectedBOQ) {
        console.log('Attaching BOQ to project:', selectedBOQ);
        projectData.attachedBOQ = {
          id: selectedBOQ.id,
          title: selectedBOQ.title,
          tahapanKerja: selectedBOQ.tahapanKerja,
          createdAt: selectedBOQ.createdAt,
          updatedAt: selectedBOQ.updatedAt,
          attachedAt: new Date().toISOString()
        };
        console.log('Project data with BOQ:', projectData);
      } else {
        console.log('No BOQ selected for this project');
      }

      const docRef = await addDoc(collection(db, 'projects'), projectData);
      console.log('Project created with ID:', docRef.id);
      
      alert('Project submitted successfully! Your project is now pending approval and will be available in the marketplace once approved.');
      onBack();
    } catch (error) {
      console.error('Error creating project:', error);
      alert('Failed to create project. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header with Back Button */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <button
            onClick={onBack}
            className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Projects
          </button>
          <div className="h-6 w-px bg-gray-300"></div>
          <h1 className="text-2xl font-bold text-gray-900">Buat Proyek Baru</h1>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={saveDraft}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
          >
            Save as Draft
          </button>
        </div>
      </div>

      {/* Form Content */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* I. Informasi Umum Proyek */}
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-900 border-b border-gray-200 pb-2">
              I. Informasi Umum Proyek
            </h3>
            
            {/* 1. Judul Proyek */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                1. Judul Proyek *
              </label>
              <p className="text-xs text-gray-500 mb-2">
                [Jenis Proyek] - [Ruang Lingkup] - [Property] - [Lokasi] - [Detail Opsional]
              </p>
              <p className="text-xs text-gray-500 mb-3 italic">
                Bangun Interior Rumah BSD Minimalis Modern
              </p>
              <input
                type="text"
                value={formData.projectTitle}
                onChange={(e) => handleInputChange('projectTitle', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Masukkan judul proyek sesuai format"
                required
              />
            </div>

            {/* 2. Lokasi Proyek */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4">
                2. Lokasi Proyek
              </label>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2">
                    Provinsi *
                  </label>
                  <select
                    value={formData.province}
                    onChange={(e) => {
                      handleInputChange('province', e.target.value);
                      handleInputChange('city', '');
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Pilih Provinsi</option>
                    {provinces.map(province => (
                      <option key={province} value={province}>{province}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2">
                    Kota *
                  </label>
                  <select
                    value={formData.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                    disabled={!formData.province}
                  >
                    <option value="">Pilih Kota</option>
                    {getAvailableCities().map(city => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-600 mb-2">
                  Alamat Lengkap *
                </label>
                <textarea
                  value={formData.fullAddress}
                  onChange={(e) => handleInputChange('fullAddress', e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Masukkan alamat lengkap proyek"
                  required
                />
              </div>
            </div>
          </div>

          {/* II. Klasifikasi & Ruang Lingkup Proyek */}
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-900 border-b border-gray-200 pb-2">
              II. Klasifikasi & Ruang Lingkup Proyek
            </h3>
            <p className="text-sm text-gray-600">
              Penjelasan ruang lingkup harus jelas dan spesifik agar vendor bisa memahami kebutuhan klien secara tepat, 
              serta menjadi dasar dalam pembuatan kontrak dan milestone.
            </p>
            
            {/* 1. Jenis Proyek */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                1. Jenis Proyek *
              </label>
              <p className="text-xs text-gray-500 mb-3">
                This is a required question
              </p>
              <select
                value={formData.projectType}
                onChange={(e) => handleInputChange('projectType', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Pilih Jenis Proyek</option>
                {projectTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            {/* 2. Ruang Lingkup */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                2. Ruang Lingkup *
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {projectScopes.map(scope => (
                  <label key={scope} className="flex items-center space-x-2 cursor-pointer p-3 border border-gray-300 rounded-lg hover:bg-gray-50">
                    <input
                      type="checkbox"
                      checked={formData.projectScope.includes(scope)}
                      onChange={() => handleScopeToggle(scope)}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">{scope}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* 3. Properti */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                3. Properti *
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {propertyTypes.map(property => (
                  <label key={property} className="flex items-center space-x-2 cursor-pointer p-3 border border-gray-300 rounded-lg hover:bg-gray-50">
                    <input
                      type="radio"
                      name="propertyType"
                      value={property}
                      checked={formData.propertyType === property}
                      onChange={(e) => handleInputChange('propertyType', e.target.value)}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">{property}</span>
                  </label>
                ))}
              </div>
              
              {formData.propertyType === 'Other' && (
                <div className="mt-3">
                  <input
                    type="text"
                    value={formData.otherProperty}
                    onChange={(e) => handleInputChange('otherProperty', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Other:"
                  />
                </div>
              )}
            </div>

            {/* 4. Estimasi Anggaran */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                4. Estimasi Anggaran *
              </label>
              <p className="text-xs text-gray-500 mb-3">
                Masukkan estimasi anggaran tetap Anda sebagai referensi bagi vendor. Angka ini tidak mengikat.
              </p>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                  Rp
                </span>
                <input
                  type="text"
                  value={getFormattedBudget()}
                  onChange={(e) => handleBudgetChange(e.target.value)}
                  className="w-full pl-12 pr-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="50,000,000"
                  required
                />
              </div>
              <p className="text-xs text-gray-400 mt-1">
                Contoh: 50,000,000 (untuk Rp 50.000.000)
              </p>
            </div>

            {/* 5. Estimasi Durasi Proyek */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                5. Estimasi Durasi Proyek *
              </label>
              <p className="text-xs text-gray-500 mb-3">
                Pilih estimasi durasi pekerjaan proyek Anda sebagai referensi bagi vendor.
              </p>
              <select
                value={formData.estimatedDuration}
                onChange={(e) => handleInputChange('estimatedDuration', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Pilih durasi proyek</option>
                <option value="< 3 Bulan">&lt; 3 Bulan</option>
                <option value="3-6 Bulan">3-6 Bulan</option>
                <option value="< 1 Tahun">&lt; 1 Tahun</option>
                <option value="> 1 Tahun">&gt; 1 Tahun</option>
              </select>
            </div>

            {/* 6. Durasi Tender */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                6. Durasi Tender *
              </label>
              <p className="text-xs text-gray-500 mb-3">
                Pilih berapa lama tender akan dibuka untuk menerima penawaran dari vendor.
              </p>
              <select
                value={formData.tenderDuration}
                onChange={(e) => handleInputChange('tenderDuration', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Pilih durasi tender</option>
                <option value="2 Minggu">2 Minggu</option>
                <option value="1 Bulan">1 Bulan</option>
                <option value="2 Bulan">2 Bulan</option>
                <option value="3 Bulan">3 Bulan</option>
                <option value="4 Bulan">4 Bulan</option>
                <option value="5 Bulan">5 Bulan</option>
              </select>
            </div>

            {/* 7. Estimasi Mulai Proyek */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                7. Estimasi Mulai Proyek *
              </label>
              <p className="text-xs text-gray-500 mb-3">
                Masukkan estimasi durasi pekerjaan proyek Anda sebagai referensi bagi vendor. Angka ini bisa berupa kisaran dan tidak mengikat.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Bulan
                  </label>
                  <select
                    value={formData.estimatedStartDate.split('-')[1] || ''}
                    onChange={(e) => {
                      const month = e.target.value;
                      const day = formData.estimatedStartDate.split('-')[2] || '';
                      handleInputChange('estimatedStartDate', `2024-${month}-${day}`);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Pilih Bulan</option>
                    <option value="01">Januari</option>
                    <option value="02">Februari</option>
                    <option value="03">Maret</option>
                    <option value="04">April</option>
                    <option value="05">Mei</option>
                    <option value="06">Juni</option>
                    <option value="07">Juli</option>
                    <option value="08">Agustus</option>
                    <option value="09">September</option>
                    <option value="10">Oktober</option>
                    <option value="11">November</option>
                    <option value="12">Desember</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Tanggal
                  </label>
                  <select
                    value={formData.estimatedStartDate.split('-')[2] || ''}
                    onChange={(e) => {
                      const day = e.target.value;
                      const month = formData.estimatedStartDate.split('-')[1] || '';
                      handleInputChange('estimatedStartDate', `2024-${month}-${day}`);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Pilih Tanggal</option>
                    {Array.from({length: 31}, (_, i) => i + 1).map(day => (
                      <option key={day} value={day.toString().padStart(2, '0')}>
                        {day}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* 8. Metode Pengadaan */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                8. Metode Pengadaan *
              </label>
              <p className="text-xs text-gray-500 mb-3">
                Pilih metode pengadaan untuk proyek ini
              </p>
              <select
                value={formData.procurementMethod}
                onChange={(e) => handleInputChange('procurementMethod', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Pilih metode pengadaan</option>
                {procurementMethods.map(method => (
                  <option key={method} value={method}>{method}</option>
                ))}
              </select>
            </div>
          </div>

          {/* BOQ Attachment Section */}
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-900 border-b border-gray-200 pb-2">
              BOQ Attachment (Optional)
            </h3>
            <p className="text-sm text-gray-600">
              Attach a Bill of Quantities (BOQ) to provide detailed project specifications and cost estimates to vendors. 
              BOQs created in BOQ Maker will be available for selection here.
            </p>
            
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-medium text-gray-900">Bill of Quantities (BOQ)</h4>
              <div className="flex items-center space-x-3">
                <a
                  href="/boq-maker"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors text-sm"
                >
                  Create New BOQ
                </a>
                <button
                  type="button"
                  onClick={() => setShowBOQSelector(true)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  {selectedBOQ ? 'Change BOQ' : 'Attach BOQ'}
                </button>
              </div>
            </div>
            
            {selectedBOQ ? (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-green-800">
                      BOQ Attached: {selectedBOQ.title || 'Untitled BOQ'}
                    </p>
                    <div className="flex items-center space-x-4 text-xs text-green-600 mt-1">
                      <span>{selectedBOQ.tahapanKerja?.length || 0} work phases</span>
                      {selectedBOQ.createdAt && (
                        <span>Created: {new Date(selectedBOQ.createdAt).toLocaleDateString('id-ID')}</span>
                      )}
                    </div>
                    {selectedBOQ.updatedAt && selectedBOQ.updatedAt !== selectedBOQ.createdAt && (
                      <p className="text-xs text-green-500 mt-1">
                        Last updated: {new Date(selectedBOQ.updatedAt).toLocaleDateString('id-ID')}
                      </p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedBOQ(null)}
                    className="text-green-600 hover:text-green-800 transition-colors ml-4"
                    title="Remove BOQ"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                <p className="text-sm text-gray-600">
                  No BOQ attached. You can attach a saved BOQ from BOQ Maker to this project.
                </p>
              </div>
            )}
          </div>

          {/* Special Notes Section */}
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-900 border-b border-gray-200 pb-2">
              Special Notes (Optional)
            </h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Additional Requirements or Notes
              </label>
              <textarea
                value={formData.specialNotes}
                onChange={(e) => handleInputChange('specialNotes', e.target.value)}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter any special requirements, notes, or additional information for vendors"
              />
            </div>
          </div>

          {/* Agreements Section */}
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-900 border-b border-gray-200 pb-2">
              Terms and Agreements *
            </h3>
            <p className="text-sm text-gray-600">
              Please review and accept the following agreements to proceed with project submission:
            </p>
            
            <div className="space-y-4">
              {/* Agreement 1: Terms of Service */}
              <div className="flex items-start space-x-3 p-4 border border-gray-200 rounded-lg">
                <input
                  type="checkbox"
                  id="agreementTerms"
                  checked={formData.agreementTerms}
                  onChange={(e) => handleInputChange('agreementTerms', e.target.checked)}
                  className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  required
                />
                <div className="flex-1">
                  <label htmlFor="agreementTerms" className="text-sm font-medium text-gray-900 cursor-pointer">
                    I agree to the Terms of Service and Project Guidelines
                  </label>
                  <p className="text-xs text-gray-600 mt-1">
                    By checking this box, you agree to abide by Projevo&apos;s terms of service, project guidelines, and understand the responsibilities as a project owner.
                  </p>
                </div>
              </div>

              {/* Agreement 2: Data Usage */}
              <div className="flex items-start space-x-3 p-4 border border-gray-200 rounded-lg">
                <input
                  type="checkbox"
                  id="agreementData"
                  checked={formData.agreementData}
                  onChange={(e) => handleInputChange('agreementData', e.target.checked)}
                  className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  required
                />
                <div className="flex-1">
                  <label htmlFor="agreementData" className="text-sm font-medium text-gray-900 cursor-pointer">
                    I consent to data processing and marketplace listing
                  </label>
                  <p className="text-xs text-gray-600 mt-1">
                    You consent to the processing of your project data and agree to have your project listed on the marketplace after approval.
                  </p>
                </div>
              </div>

              {/* Agreement 3: Information Validation */}
              <div className="flex items-start space-x-3 p-4 border border-gray-200 rounded-lg">
                <input
                  type="checkbox"
                  id="agreementValidation"
                  checked={formData.agreementValidation}
                  onChange={(e) => handleInputChange('agreementValidation', e.target.checked)}
                  className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  required
                />
                <div className="flex-1">
                  <label htmlFor="agreementValidation" className="text-sm font-medium text-gray-900 cursor-pointer">
                    I confirm that all information provided is accurate and complete
                  </label>
                  <p className="text-xs text-gray-600 mt-1">
                    You confirm that all project information, requirements, and specifications provided are accurate, complete, and truthful to the best of your knowledge.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start space-x-2">
                <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="text-sm text-blue-800">
                  <p className="font-medium">Moderation Process</p>
                  <p className="mt-1">
                    Your project will be submitted for review and approval. Once approved by our team, 
                    it will be published on the marketplace and vendors will be able to submit proposals.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end pt-6 border-t">
            <button
              type="submit"
              disabled={loading}
              className={`px-8 py-3 rounded-lg font-medium transition-colors ${
                loading 
                  ? 'bg-gray-100 text-gray-500 cursor-not-allowed border border-gray-300' 
                  : 'text-white hover:opacity-90'
              }`}
              style={!loading ? { backgroundColor: '#2373FF' } : {}}
            >
              {loading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-gray-400 border-t-blue-500 rounded-full animate-spin"></div>
                  <span>Submitting for Approval...</span>
                </div>
              ) : (
                'Submit Project for Approval'
              )}
            </button>
          </div>
        </form>
      </div>

      {/* BOQ Selector Modal */}
      {showBOQSelector && (
        <SavedBOQSelector
          onSelect={(boq) => {
            setSelectedBOQ(boq);
            setShowBOQSelector(false);
          }}
          onClose={() => setShowBOQSelector(false)}
        />
      )}
    </div>
  );
}
