'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../../contexts/AuthContext';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '../../../../lib/firebase';
import { 
  FiChevronDown, 
  FiFilter, 
  FiRefreshCw,
  FiFileText,
  FiExternalLink,
  FiLoader,
  FiPlus
} from 'react-icons/fi';
import { 
  MdSort,
  MdHome,
  MdFolder
} from 'react-icons/md';

// Create Project Modal Component
function CreateProjectModal({ onClose }) {
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
  const [savedBOQs, setSavedBOQs] = useState([]);

  // Load saved BOQs from localStorage when component mounts
  useEffect(() => {
    const savedData = localStorage.getItem('projevo_boqs');
    if (savedData) {
      setSavedBOQs(JSON.parse(savedData));
    }
  }, []);

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
    setFormData(prev => ({ ...prev, [field]: value }));
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

  const handleFileUpload = (event, documentType) => {
    const files = Array.from(event.target.files);
    setFormData(prev => ({
      ...prev,
      [documentType]: [...prev[documentType], ...files]
    }));
  };

  const handleDocumentTitleChange = (fileName, title, documentType) => {
    setFormData(prev => ({
      ...prev,
      documentTitles: {
        ...prev.documentTitles,
        [`${documentType}_${fileName}`]: title
      }
    }));
  };

  const removeDocument = (fileName, documentType) => {
    setFormData(prev => ({
      ...prev,
      [documentType]: prev[documentType].filter(file => file.name !== fileName),
      documentTitles: Object.fromEntries(
        Object.entries(prev.documentTitles).filter(([key]) => key !== `${documentType}_${fileName}`)
      )
    }));
  };

  const selectBOQ = (boqId) => {
    const selectedBOQ = savedBOQs.find(boq => boq.id === boqId);
    setFormData(prev => ({
      ...prev,
      selectedBOQ: boqId,
      boqData: selectedBOQ
    }));
    setShowBOQSelector(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validation for required fields
    if (!formData.agreementTerms || !formData.agreementData || !formData.agreementValidation) {
      alert('Silakan setujui semua persetujuan yang diperlukan');
      return;
    }
    
    // Validate required fields
    if (!formData.projectTitle || !formData.province || !formData.city || !formData.fullAddress || 
        !formData.projectType || !formData.procurementMethod || formData.projectScope.length === 0 || !formData.propertyType ||
        !formData.estimatedBudget || !formData.estimatedDuration || !formData.tenderDuration || !formData.estimatedStartDate) {
      alert('Silakan lengkapi semua field yang wajib diisi (*)');
      return;
    }
    
    // Handle form submission here
    console.log('Project created:', formData);
    onClose();
  };

  const handleSaveDraft = () => {
    // Basic validation - only require project title
    if (!formData.projectTitle.trim()) {
      alert('Judul proyek harus diisi untuk menyimpan draft');
      return;
    }

    // Get existing drafts from localStorage
    const existingDrafts = JSON.parse(localStorage.getItem('projevo_project_drafts') || '[]');
    
    // Create new draft
    const newDraft = {
      id: Date.now().toString(),
      ...formData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'draft'
    };

    // Add to drafts array
    const updatedDrafts = [...existingDrafts, newDraft];
    
    // Save to localStorage
    localStorage.setItem('projevo_project_drafts', JSON.stringify(updatedDrafts));
    
    // Trigger custom event to update drafts in parent component
    window.dispatchEvent(new CustomEvent('draftSaved'));
    
    alert('Draft proyek berhasil disimpan!');
    onClose();
  };

  const getAvailableCities = () => {
    return cities[formData.province] || [];
  };

  const isDesignProject = () => formData.projectType === 'Desain';
  const isBuildRenovateProject = () => ['Bangun', 'Renovasi'].includes(formData.projectType);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Buat Proyek Baru</h2>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-blue-200 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Form Content */}
        <div className="p-8 overflow-y-auto max-h-[calc(90vh-120px)]">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* I. Informasi Umum Proyek */}
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-600 pb-2">
                I. Informasi Umum Proyek
              </h3>
              
              {/* 1. Judul Proyek */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  1. Judul Proyek *
                </label>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                  [Jenis Proyek] - [Ruang Lingkup] - [Property] - [Lokasi] - [Detail Opsional]
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-3 italic">
                  Bangun Interior Rumah BSD Minimalis Modern
                </p>
                <input
                  type="text"
                  value={formData.projectTitle}
                  onChange={(e) => handleInputChange('projectTitle', e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Masukkan judul proyek sesuai format"
                  required
                />
              </div>

              {/* 2. Lokasi Proyek */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-4">
                  2. Lokasi Proyek
                </label>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
                      Provinsi *
                    </label>
                    <select
                      value={formData.province}
                      onChange={(e) => {
                        handleInputChange('province', e.target.value);
                        handleInputChange('city', '');
                      }}
                      className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    >
                      <option value="">Pilih Provinsi</option>
                      {provinces.map(province => (
                        <option key={province} value={province}>{province}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
                      Kota *
                    </label>
                    <select
                      value={formData.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                      className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                  <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
                    Alamat Lengkap *
                  </label>
                  <textarea
                    value={formData.fullAddress}
                    onChange={(e) => handleInputChange('fullAddress', e.target.value)}
                    rows={3}
                    className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Masukkan alamat lengkap proyek"
                    required
                  />
                </div>
              </div>
            </div>

            {/* II. Klasifikasi & Ruang Lingkup Proyek */}
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-600 pb-2">
                II. Klasifikasi & Ruang Lingkup Proyek
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Penjelasan ruang lingkup harus jelas dan spesifik agar vendor bisa memahami kebutuhan klien secara tepat, 
                serta menjadi dasar dalam pembuatan kontrak dan milestone.
              </p>
              
              {/* 1. Jenis Proyek */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  1. Jenis Proyek *
                </label>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
                  This is a required question
                </p>
                <select
                  value={formData.projectType}
                  onChange={(e) => handleInputChange('projectType', e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  2. Ruang Lingkup *
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {projectScopes.map(scope => (
                    <label key={scope} className="flex items-center space-x-2 cursor-pointer p-3 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700">
                      <input
                        type="checkbox"
                        checked={formData.projectScope.includes(scope)}
                        onChange={() => handleScopeToggle(scope)}
                        className="text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-slate-700 dark:text-slate-300">{scope}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* 3. Properti */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  3. Properti *
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {propertyTypes.map(property => (
                    <label key={property} className="flex items-center space-x-2 cursor-pointer p-3 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700">
                      <input
                        type="radio"
                        name="propertyType"
                        value={property}
                        checked={formData.propertyType === property}
                        onChange={(e) => handleInputChange('propertyType', e.target.value)}
                        className="text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-slate-700 dark:text-slate-300">{property}</span>
                    </label>
                  ))}
                </div>
                
                {formData.propertyType === 'Other' && (
                  <div className="mt-3">
                    <input
                      type="text"
                      value={formData.otherProperty}
                      onChange={(e) => handleInputChange('otherProperty', e.target.value)}
                      className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Other:"
                    />
                  </div>
                )}
              </div>

              {/* 4. Estimasi Anggaran */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  4. Estimasi Anggaran *
                </label>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
                  Masukkan estimasi anggaran tetap Anda sebagai referensi bagi vendor. Angka ini tidak mengikat.
                </p>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500 dark:text-slate-400">
                    Rp
                  </span>
                  <input
                    type="text"
                    value={getFormattedBudget()}
                    onChange={(e) => handleBudgetChange(e.target.value)}
                    className="w-full pl-12 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="50,000,000"
                    required
                  />
                </div>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                  Contoh: 50,000,000 (untuk Rp 50.000.000)
                </p>
              </div>

              {/* 5. Estimasi Durasi Proyek */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  5. Estimasi Durasi Proyek *
                </label>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
                  Pilih estimasi durasi pekerjaan proyek Anda sebagai referensi bagi vendor.
                </p>
                <select
                  value={formData.estimatedDuration}
                  onChange={(e) => handleInputChange('estimatedDuration', e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Pilih durasi proyek</option>
                  <option value="&lt; 3 Bulan">&lt; 3 Bulan</option>
                  <option value="3-6 Bulan">3-6 Bulan</option>
                  <option value="&lt; 1 Tahun">&lt; 1 Tahun</option>
                  <option value="&gt; 1 Tahun">&gt; 1 Tahun</option>
                </select>
              </div>

              {/* 6. Durasi Tender */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  6. Durasi Tender *
                </label>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
                  Pilih berapa lama tender akan dibuka untuk menerima penawaran dari vendor.
                </p>
                <select
                  value={formData.tenderDuration}
                  onChange={(e) => handleInputChange('tenderDuration', e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  7. Estimasi Mulai Proyek *
                </label>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
                  Masukkan estimasi durasi pekerjaan proyek Anda sebagai referensi bagi vendor. Angka ini bisa berupa kisaran dan tidak mengikat.
                </p>
                <input
                  type="date"
                  value={formData.estimatedStartDate}
                  onChange={(e) => handleInputChange('estimatedStartDate', e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              {/* 8. Metode Pengadaan */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  8. Metode Pengadaan *
                </label>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
                  Pilih metode pengadaan untuk proyek ini
                </p>
                <select
                  value={formData.procurementMethod}
                  onChange={(e) => handleInputChange('procurementMethod', e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Pilih Metode Pengadaan</option>
                  {procurementMethods.map(method => (
                    <option key={method} value={method}>{method}</option>
                  ))}
                </select>
              </div>

              {/* 9. Upload Dokumen Pendukung */}
              {isDesignProject() && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    9. Upload Dokumen Pendukung (Referensi)
                  </label>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
                    Hanya muncul untuk jenis proyek desain.
                  </p>
                  <input
                    type="file"
                    multiple
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    onChange={(e) => handleFileUpload(e, 'supportingDocuments')}
                    className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  
                  {/* Display uploaded files with title input */}
                  {formData.supportingDocuments.map((file, index) => (
                    <div key={index} className="mt-3 p-3 border border-slate-200 dark:border-slate-600 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-slate-700 dark:text-slate-300">{file.name}</span>
                        <button
                          type="button"
                          onClick={() => removeDocument(file.name, 'supportingDocuments')}
                          className="text-red-500 hover:text-red-700"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                      <input
                        type="text"
                        placeholder="Masukkan judul dokumen"
                        value={formData.documentTitles[`supportingDocuments_${file.name}`] || ''}
                        onChange={(e) => handleDocumentTitleChange(file.name, e.target.value, 'supportingDocuments')}
                        className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* BOQ & Gambar Kerja for Bangun & Renovasi */}
              {isBuildRenovateProject() && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    9. Upload Dokumen Pendukung (BOQ & Gambar Kerja)
                  </label>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
                    Hanya muncul untuk jenis proyek bangun & renovasi.
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
                    Bagian ini pada saat upload ada judulnya. jika upload BOQ, harus masukin judul dulu BOQ, dan seterusnya.
                  </p>
                  
                  {/* BOQ Section */}
                  <div className="mb-4">
                    <div className="flex items-center gap-4 mb-3">
                      <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300">BOQ (Bill of Quantity)</h4>
                      <button
                        type="button"
                        onClick={() => setShowBOQSelector(true)}
                        className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                      >
                        Load from BOQ Maker
                      </button>
                    </div>
                    
                    {formData.selectedBOQ && (
                      <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg mb-3">
                        <p className="text-sm text-green-700 dark:text-green-300">
                          BOQ Loaded: {formData.boqData?.title || 'Selected BOQ'}
                        </p>
                      </div>
                    )}
                    
                    <input
                      type="file"
                      multiple
                      accept=".pdf,.xls,.xlsx"
                      onChange={(e) => handleFileUpload(e, 'boqDocuments')}
                      className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    
                    {formData.boqDocuments.map((file, index) => (
                      <div key={index} className="mt-3 p-3 border border-slate-200 dark:border-slate-600 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-slate-700 dark:text-slate-300">{file.name}</span>
                          <button
                            type="button"
                            onClick={() => removeDocument(file.name, 'boqDocuments')}
                            className="text-red-500 hover:text-red-700"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                        <input
                          type="text"
                          placeholder="BOQ - [Nama Proyek/Bagian]"
                          value={formData.documentTitles[`boqDocuments_${file.name}`] || ''}
                          onChange={(e) => handleDocumentTitleChange(file.name, e.target.value, 'boqDocuments')}
                          className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                        />
                      </div>
                    ))}
                  </div>

                  {/* Gambar Kerja Section */}
                  <div>
                    <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">Gambar Kerja</h4>
                    <input
                      type="file"
                      multiple
                      accept=".pdf,.dwg,.jpg,.jpeg,.png"
                      onChange={(e) => handleFileUpload(e, 'drawingDocuments')}
                      className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    
                    {formData.drawingDocuments.map((file, index) => (
                      <div key={index} className="mt-3 p-3 border border-slate-200 dark:border-slate-600 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-slate-700 dark:text-slate-300">{file.name}</span>
                          <button
                            type="button"
                            onClick={() => removeDocument(file.name, 'drawingDocuments')}
                            className="text-red-500 hover:text-red-700"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                        <input
                          type="text"
                          placeholder="Gambar Kerja - [Nama Bagian]"
                          value={formData.documentTitles[`drawingDocuments_${file.name}`] || ''}
                          onChange={(e) => handleDocumentTitleChange(file.name, e.target.value, 'drawingDocuments')}
                          className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Catatan Khusus */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Catatan Khusus (Opsional)
              </label>
              <textarea
                value={formData.specialNotes}
                onChange={(e) => handleInputChange('specialNotes', e.target.value)}
                rows={4}
                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Tambahkan catatan khusus atau requirements tambahan..."
              />
            </div>

            {/* Persetujuan */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Persetujuan</h3>
              
              <div className="space-y-3">
                <label className="flex items-start space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.agreementTerms}
                    onChange={(e) => handleInputChange('agreementTerms', e.target.checked)}
                    className="mt-1 text-blue-600 focus:ring-blue-500"
                    required
                  />
                  <span className="text-sm text-slate-700 dark:text-slate-300">
                    Saya menyetujui seluruh ketentuan dan tata cara di platform Projevo. *
                  </span>
                </label>

                <label className="flex items-start space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.agreementData}
                    onChange={(e) => handleInputChange('agreementData', e.target.checked)}
                    className="mt-1 text-blue-600 focus:ring-blue-500"
                    required
                  />
                  <span className="text-sm text-slate-700 dark:text-slate-300">
                    Saya menyatakan data yang diisi sudah benar dan sesuai kondisi yang sebenarnya. *
                  </span>
                </label>

                <label className="flex items-start space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.agreementValidation}
                    onChange={(e) => handleInputChange('agreementValidation', e.target.checked)}
                    className="mt-1 text-blue-600 focus:ring-blue-500"
                    required
                  />
                  <span className="text-sm text-slate-700 dark:text-slate-300">
                    Saya mengizinkan admin untuk validasi draft ini sebelum dipublikasikan. *
                  </span>
                </label>
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex justify-between items-center pt-6 border-t border-slate-200 dark:border-slate-600">
              <button
                type="button"
                onClick={handleSaveDraft}
                className="px-6 py-2 bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 transition-colors"
              >
                Save Draft
              </button>
              
              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Buat Proyek
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* BOQ Selector Modal */}
      {showBOQSelector && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-60">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[70vh] overflow-hidden">
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-4 text-white">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold">Pilih BOQ dari BOQ Maker</h3>
                <button
                  onClick={() => setShowBOQSelector(false)}
                  className="text-white hover:text-green-200"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[calc(70vh-80px)]">
              {savedBOQs.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-slate-500 dark:text-slate-400">Tidak ada BOQ yang tersimpan.</p>
                  <p className="text-sm text-slate-400 dark:text-slate-500 mt-2">
                    Silakan buat BOQ terlebih dahulu di BOQ Maker.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {savedBOQs.map((boq, index) => (
                    <div
                      key={boq.id || index}
                      className="p-4 border border-slate-200 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer"
                      onClick={() => selectBOQ(boq.id || index)}
                    >
                      <h4 className="font-medium text-slate-900 dark:text-white">
                        {boq.title || `BOQ ${index + 1}`}
                      </h4>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                        {boq.tahapanKerja?.length || 0} tahapan kerja
                      </p>
                      <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                        Dibuat: {boq.createdAt ? new Date(boq.createdAt).toLocaleDateString() : 'Tidak diketahui'}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function HomeComponent({ activeProjectTab, onCreateProject }) {
  const { user, userProfile } = useAuth();
  const [selectedProject, setSelectedProject] = useState(null);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [sortBy, setSortBy] = useState('Recent');
  const [filterBy, setFilterBy] = useState('All');
  const sortDropdownRef = useRef(null);
  const filterDropdownRef = useRef(null);
  
  // Load projects from Firestore
  useEffect(() => {
    if (!user?.uid) {
      setLoading(false);
      return;
    }
    
    console.log('Loading projects for user:', user.uid);
    setLoading(true);
    
    // Query projects where the current user is the owner
    const projectsQuery = query(
      collection(db, 'projects'),
      where('ownerId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );
    
    const unsubscribe = onSnapshot(projectsQuery, (snapshot) => {
      const projectsData = [];
      snapshot.forEach((doc) => {
        projectsData.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      console.log('Loaded projects:', projectsData);
      setProjects(projectsData);
      setLoading(false);
    }, (error) => {
      console.error('Error loading projects:', error);
      setLoading(false);
    });
    
    return () => unsubscribe();
  }, [user?.uid]);

  // Handle click outside dropdowns
  useEffect(() => {
    function handleClickOutside(event) {
      if (sortDropdownRef.current && !sortDropdownRef.current.contains(event.target)) {
        setShowSortDropdown(false);
      }
      if (filterDropdownRef.current && !filterDropdownRef.current.contains(event.target)) {
        setShowFilterDropdown(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleViewProject = (project) => {
    setSelectedProject(project);
  };

  const handleCreateProject = () => {
    if (onCreateProject) {
      onCreateProject();
    }
  };

  // Helper function to map procurementMethod to display name
  const getProjectType = (procurementMethod) => {
    switch (procurementMethod) {
      case 'Contract':
        return 'Contract';
      case 'Tender':
        return 'Tender';
      case 'Draft':
        return 'Draft';
      case 'Negotiation':
        return 'Negotiation';
      case 'Penunjukan Langsung':
        return 'Penunjukan Langsung';
      default:
        return 'Contract'; // Default fallback
    }
  };

  // Helper function to normalize status display
  const getDisplayStatus = (status) => {
    switch (status) {
      case 'In Progress':
        return 'On Going';
      case 'Open for Tender':
        return 'Open';
      case 'Completed':
        return 'Completed';
      case 'Pending':
        return 'Pending Signature';
      case 'Under Review':
        return 'Under Review';
      default:
        return status || 'On Going'; // Fallback
    }
  };

  // Helper function to calculate tender time left
  const getTenderTimeLeft = (project) => {
    if (!project.tenderDeadline && !project.deadline) {
      return 'No deadline set';
    }
    
    const deadline = project.tenderDeadline || project.deadline;
    let deadlineDate;
    
    try {
      if (deadline?.toDate) {
        deadlineDate = deadline.toDate();
      } else if (typeof deadline === 'string') {
        deadlineDate = new Date(deadline);
      } else {
        deadlineDate = new Date(deadline);
      }
      
      const now = new Date();
      const diffMs = deadlineDate.getTime() - now.getTime();
      
      if (diffMs <= 0) {
        return 'Deadline passed';
      }
      
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      
      if (diffDays > 0) {
        return `${diffDays} day${diffDays > 1 ? 's' : ''} left`;
      } else if (diffHours > 0) {
        return `${diffHours} hour${diffHours > 1 ? 's' : ''} left`;
      } else {
        return 'Less than 1 hour left';
      }
    } catch (error) {
      return 'Invalid deadline';
    }
  };

  // Helper function to determine action button based on status
  const getActionButton = (project) => {
    const displayStatus = getDisplayStatus(project.status);
    
    switch (displayStatus) {
      case 'Open':
        const timeLeft = getTenderTimeLeft(project);
        return (
          <div className="text-right">
            <div className="text-sm text-gray-600 mb-1">
              Project currently live on tender list
            </div>
            <div className="text-sm font-medium text-blue-600">
              {timeLeft}
            </div>
          </div>
        );
      case 'On Going':
      case 'Completed':
      default:
        return (
          <button
            onClick={() => handleViewProject(project)}
            className="flex items-center font-medium hover:underline text-black hover:text-gray-600 transition-colors"
          >
            <FiExternalLink className="w-4 h-4 mr-1" />
            View Details
          </button>
        );
    }
  };

  const sortOptions = ['Recent', 'Oldest', 'A-Z', 'Z-A'];
  const filterOptions = ['All', 'In Progress', 'Completed', 'Pending'];

  // Filter projects based on active tab from parent
  const getFilteredProjects = () => {
    if (!activeProjectTab) {
      return projects; // Show all projects when no specific tab is selected
    }
    
    return projects.filter(project => {
      switch (activeProjectTab) {
        case 'Draft':
          return project.procurementMethod === 'Draft';
        case 'Tender':
          return project.procurementMethod === 'Tender';
        case 'Contract':
          return project.procurementMethod === 'Contract';
        case 'Negotiation':
          return project.procurementMethod === 'Negotiation';
        case 'Penunjukan Langsung':
          return project.procurementMethod === 'Penunjukan Langsung';
        default:
          return true;
      }
    });
  };

  const filteredProjects = getFilteredProjects();

  // Get the current tab display name
  const getTabDisplayName = () => {
    if (!activeProjectTab) {
      return 'All Project';
    }
    return `${activeProjectTab} Projects`;
  };

  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <FiLoader className="animate-spin h-12 w-12" style={{ color: '#2373FF' }} />
        <span className="ml-3 text-gray-600">Loading projects...</span>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header with All Project text and buttons */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">{getTabDisplayName()}</h1>
        
        <div className="flex items-center space-x-3">
          {/* Sort Button */}
          <div className="relative" ref={sortDropdownRef}>
            <button
              onClick={() => setShowSortDropdown(!showSortDropdown)}
              className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <MdSort className="w-4 h-4 mr-2" />
              Sort
              <FiChevronDown className="w-4 h-4 ml-1" />
            </button>
            
            {showSortDropdown && (
              <div className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                {sortOptions.map((option) => (
                  <button
                    key={option}
                    onClick={() => {
                      setSortBy(option);
                      setShowSortDropdown(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${
                      sortBy === option ? 'text-white' : 'text-gray-700'
                    } ${option === sortOptions[0] ? 'rounded-t-lg' : ''} ${option === sortOptions[sortOptions.length - 1] ? 'rounded-b-lg' : ''}`}
                    style={sortBy === option ? { backgroundColor: '#2373FF' } : {}}
                  >
                    {option}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Filter Button */}
          <div className="relative" ref={filterDropdownRef}>
            <button
              onClick={() => setShowFilterDropdown(!showFilterDropdown)}
              className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <FiFilter className="w-4 h-4 mr-2" />
              Filter
              <FiChevronDown className="w-4 h-4 ml-1" />
            </button>
            
            {showFilterDropdown && (
              <div className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                {filterOptions.map((option) => (
                  <button
                    key={option}
                    onClick={() => {
                      setFilterBy(option);
                      setShowFilterDropdown(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${
                      filterBy === option ? 'text-white' : 'text-gray-700'
                    } ${option === filterOptions[0] ? 'rounded-t-lg' : ''} ${option === filterOptions[filterOptions.length - 1] ? 'rounded-b-lg' : ''}`}
                    style={filterBy === option ? { backgroundColor: '#2373FF' } : {}}
                  >
                    {option}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Create New Project Button */}
          <button
            onClick={handleCreateProject}
            className="flex items-center text-white px-6 py-2 rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg"
            style={{ backgroundColor: '#2373FF' }}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#1d63ed'}
            onMouseLeave={(e) => e.target.style.backgroundColor = '#2373FF'}
          >
            <FiPlus className="w-4 h-4 mr-2" />
            Create New Project
          </button>
        </div>
      </div>

      {/* Projects List */}
      <div className="space-y-6">
        
        {filteredProjects.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-300">
            <MdFolder className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-black mb-2">
              {!activeProjectTab ? 'No projects yet' : `No ${activeProjectTab.toLowerCase()} projects`}
            </h3>
            <p className="text-gray-500 mb-6">
              {!activeProjectTab 
                ? 'Get started by creating your first project'
                : `You don't have any ${activeProjectTab.toLowerCase()} projects yet`
              }
            </p>
            {!activeProjectTab && (
              <button
                onClick={handleCreateProject}
                className="flex items-center mx-auto text-white px-6 py-3 rounded-lg font-medium transition-colors"
                style={{ backgroundColor: '#2373FF' }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#1d63ed'}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#2373FF'}
              >
                <FiPlus className="w-4 h-4 mr-2" />
                Create Your First Project
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredProjects.map((project) => (
              <div
                key={project.id}
                className="bg-white rounded-lg shadow-sm border border-gray-300 overflow-hidden hover:shadow-md transition-all duration-200 hover:-translate-y-1 h-[600px] flex flex-col"
              >
                <div className="p-6 flex-1 flex flex-col">
                  {/* Project Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-black mb-1 truncate">
                        {project.title || project.projectTitle}
                      </h3>
                      <p className="text-sm text-gray-600 truncate">
                        {project.client} • {project.location || project.city}
                      </p>
                    </div>
                    <div className="flex flex-col items-end space-y-2 flex-shrink-0 ml-3">
                      <span 
                        className="px-2 py-1 rounded-full text-xs font-medium text-white whitespace-nowrap"
                        style={{ backgroundColor: '#2373FF' }}
                      >
                        {getDisplayStatus(project.status)}
                      </span>
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 whitespace-nowrap">
                        {getProjectType(project.procurementMethod)}
                      </span>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-gray-600 mb-4 line-clamp-3 flex-shrink-0">
                    {project.description || project.projectType}
                  </p>

                  {/* Progress */}
                  <div className="mb-4 flex-shrink-0">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-black">Progress</span>
                      <span className="text-sm text-gray-600">{project.progress || 0}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="h-2 rounded-full transition-all duration-300"
                        style={{ 
                          width: `${project.progress || 0}%`,
                          backgroundColor: '#2373FF'
                        }}
                      ></div>
                    </div>
                  </div>

                  {/* Milestones */}
                  <div className="mb-5 flex-1">
                    <h4 className="text-sm font-medium text-black mb-3">Milestones</h4>
                    <div className="space-y-2">
                      {project.milestones && project.milestones.length > 0 ? (
                        <>
                          {project.milestones.slice(0, 3).map((milestone, index) => (
                            <div key={index} className="flex items-center space-x-2">
                              <div 
                                className={`w-2 h-2 rounded-full flex-shrink-0 ${
                                  milestone.completed ? 'bg-blue-500' : 'bg-gray-300'
                                }`}
                                style={milestone.completed ? { backgroundColor: '#2373FF' } : {}}
                              ></div>
                              <span 
                                className={`text-xs truncate ${
                                  milestone.completed ? 'text-black' : 'text-gray-500'
                                }`}
                              >
                                {milestone.name} {milestone.completed && `(${milestone.date})`}
                              </span>
                            </div>
                          ))}
                          {project.milestones.length > 3 && (
                            <div className="flex items-center space-x-2">
                              <div className="w-2 h-2 rounded-full bg-gray-300 flex-shrink-0"></div>
                              <span className="text-xs text-gray-500">
                                +{project.milestones.length - 3} more milestones
                              </span>
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 rounded-full bg-gray-300 flex-shrink-0"></div>
                          <span className="text-xs text-gray-500">No milestones set</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Project Info */}
                  <div className="grid grid-cols-2 gap-4 mb-5 flex-shrink-0">
                    <div>
                      <p className="text-xs text-gray-500">Budget</p>
                      <p className="text-sm font-semibold text-black truncate">
                        {project.budget || project.estimatedBudget}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Start Date</p>
                      <p className="text-sm font-semibold text-black truncate">
                        {project.startDate || project.estimatedStartDate || 'TBD'}
                      </p>
                    </div>
                  </div>

                  {/* Team */}
                  <div className="mb-5 flex-shrink-0">
                    <p className="text-xs text-gray-500 mb-3">Team</p>
                    <div className="flex -space-x-2">
                      {project.team && project.team.length > 0 ? (
                        <>
                          {project.team.slice(0, 3).map((member, index) => (
                            <div
                              key={index}
                              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-medium border-2 border-white flex-shrink-0"
                              style={{ backgroundColor: '#2373FF' }}
                              title={member}
                            >
                              {member.split(' ').map(n => n[0]).join('')}
                            </div>
                          ))}
                          {project.team.length > 3 && (
                            <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-gray-700 text-xs font-medium border-2 border-white flex-shrink-0">
                              +{project.team.length - 3}
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-gray-700 text-xs font-medium border-2 border-white flex-shrink-0">
                          --
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex space-x-3 flex-shrink-0">
                    {getDisplayStatus(project.status) === 'Open' ? (
                      <div className="flex-1">
                        <div className="text-sm text-gray-600 mb-1">
                          Project currently live on tender list
                        </div>
                        <div className="text-sm font-medium" style={{ color: '#2373FF' }}>
                          {getTenderTimeLeft(project)}
                        </div>
                      </div>
                    ) : (
                      <button 
                        onClick={() => handleViewProject(project)}
                        className="flex-1 px-3 py-2 bg-gray-100 text-black text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        View Details
                      </button>
                    )}
                    <button className="px-3 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors">
                      Update
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
