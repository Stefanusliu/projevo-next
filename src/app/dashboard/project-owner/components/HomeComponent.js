'use client';

import { useState, useEffect } from 'react';
import ProjectDetailComponent from './ProjectDetailComponent';
import ProjectCompleteComponent from './ProjectCompleteComponent';
import UnderReviewComponent from './UnderReviewComponent';
import PendingComponent from './PendingComponent';
import RejectedComponent from './RejectedComponent';

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

  const renderStep1 = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">I. Informasi Umum Proyek</h3>
      
      <div className="space-y-6">
        {/* 1. Judul Proyek */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            1. Judul Proyek *
          </label>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
            Format: [Jenis Proyek] - [Ruang Lingkup] - [Property] - [Lokasi] - [Detail Opsional]
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-3 italic">
            Contoh: Bangun Interior Rumah BSD Minimalis Modern
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
                  handleInputChange('city', ''); // Reset city when province changes
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

        {/* 3. Informasi Klien */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-4">
            3. Informasi Klien
          </label>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
                Nama Klien *
              </label>
              <input
                type="text"
                value={formData.clientName}
                onChange={(e) => handleInputChange('clientName', e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Nama lengkap klien"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
                No. Telepon *
              </label>
              <input
                type="tel"
                value={formData.clientPhone}
                onChange={(e) => handleInputChange('clientPhone', e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="08xx-xxxx-xxxx"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
                Email *
              </label>
              <input
                type="email"
                value={formData.clientEmail}
                onChange={(e) => handleInputChange('clientEmail', e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="email@example.com"
                required
              />
            </div>
          </div>
        </div>

        {/* 4. Deskripsi Proyek */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            4. Deskripsi Proyek *
          </label>
          <textarea
            value={formData.projectDescription}
            onChange={(e) => handleInputChange('projectDescription', e.target.value)}
            rows={4}
            className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Jelaskan detail proyek yang akan dikerjakan..."
            required
          />
        </div>

        {/* 5. Background & Tujuan Proyek */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              5. Background Proyek
            </label>
            <textarea
              value={formData.projectBackground}
              onChange={(e) => handleInputChange('projectBackground', e.target.value)}
              rows={3}
              className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Ceritakan latar belakang mengapa proyek ini dibutuhkan..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              6. Tujuan Proyek
            </label>
            <textarea
              value={formData.projectGoals}
              onChange={(e) => handleInputChange('projectGoals', e.target.value)}
              rows={3}
              className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Apa yang ingin dicapai dari proyek ini..."
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">II. Klasifikasi & Ruang Lingkup Proyek</h3>
      <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
        Penjelasan ruang lingkup harus jelas dan spesifik agar vendor bisa memahami kebutuhan klien secara tepat, 
        serta menjadi dasar dalam pembuatan kontrak dan milestone.
      </p>
      
      <div className="space-y-6">
        {/* 1. Jenis Proyek */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            1. Jenis Proyek *
          </label>
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
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
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
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
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
                placeholder="Sebutkan jenis properti lainnya"
              />
            </div>
          )}
        </div>

        {/* 4. Detail Properti */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              4. Ukuran Properti (m²)
            </label>
            <input
              type="text"
              value={formData.propertySize}
              onChange={(e) => handleInputChange('propertySize', e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Contoh: 120 m²"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              5. Usia Properti
            </label>
            <input
              type="text"
              value={formData.propertyAge}
              onChange={(e) => handleInputChange('propertyAge', e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Contoh: 5 tahun"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              6. Kondisi Properti
            </label>
            <select
              value={formData.propertyCondition}
              onChange={(e) => handleInputChange('propertyCondition', e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Pilih kondisi</option>
              {propertyConditions.map(condition => (
                <option key={condition} value={condition}>{condition}</option>
              ))}
            </select>
          </div>
        </div>

        {/* 7. Style Preferences */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              7. Style Existing (Jika ada)
            </label>
            <select
              value={formData.existingStyle}
              onChange={(e) => handleInputChange('existingStyle', e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Pilih style existing</option>
              {designStyles.map(style => (
                <option key={style} value={style}>{style}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              7.1. Desired Style *
            </label>
            <select
              value={formData.desiredStyle}
              onChange={(e) => handleInputChange('desiredStyle', e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="">Pilih style yang diinginkan</option>
              {designStyles.map(style => (
                <option key={style} value={style}>{style}</option>
              ))}
            </select>
          </div>
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

        {/* 9. Budget Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              9. Estimasi Anggaran *
            </label>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
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
                placeholder="100,000,000"
                required
              />
            </div>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
              Contoh: 100,000,000 (untuk Rp 100.000.000)
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              9.1. Prioritas Budget
            </label>
            <select
              value={formData.budgetPriority}
              onChange={(e) => handleInputChange('budgetPriority', e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Pilih prioritas budget</option>
              {budgetPriorities.map(priority => (
                <option key={priority} value={priority}>{priority}</option>
              ))}
            </select>
          </div>
        </div>

        {/* 10. Timeline Details */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              10. Estimasi Durasi Proyek *
            </label>
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

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              10.1. Durasi Tender *
            </label>
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

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              10.2. Estimasi Mulai Proyek *
            </label>
            <input
              type="date"
              value={formData.estimatedStartDate}
              onChange={(e) => handleInputChange('estimatedStartDate', e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>
        </div>

        {/* 11. Project Urgency & Working Hours */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              11. Tingkat Urgensi
            </label>
            <select
              value={formData.projectUrgency}
              onChange={(e) => handleInputChange('projectUrgency', e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Pilih tingkat urgensi</option>
              {projectUrgencies.map(urgency => (
                <option key={urgency} value={urgency}>{urgency}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              11.1. Jam Kerja Preferensi
            </label>
            <select
              value={formData.workingHours}
              onChange={(e) => handleInputChange('workingHours', e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Pilih jam kerja</option>
              {workingHourOptions.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>
        </div>

        {/* 12. Access Restrictions */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            12. Pembatasan Akses/Kendala Khusus
          </label>
          <textarea
            value={formData.accessRestrictions}
            onChange={(e) => handleInputChange('accessRestrictions', e.target.value)}
            rows={3}
            className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Contoh: Akses terbatas lantai 2, tidak boleh bekerja pada hari tertentu, dll..."
          />
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">III. Spesifikasi Teknis & Requirements</h3>
      
      <div className="space-y-6">
        {/* 1. Design Preferences */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            1. Preferensi Desain
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {designPreferenceOptions.map(preference => (
              <label key={preference} className="flex items-center space-x-2 cursor-pointer p-3 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700">
                <input
                  type="checkbox"
                  checked={formData.designPreferences.includes(preference)}
                  onChange={() => handleDesignPreferenceToggle(preference)}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-slate-700 dark:text-slate-300">{preference}</span>
              </label>
            ))}
          </div>
        </div>

        {/* 2. Specific Requirements */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            2. Kebutuhan Spesifik
          </label>
          <textarea
            value={formData.specificRequirements}
            onChange={(e) => handleInputChange('specificRequirements', e.target.value)}
            rows={4}
            className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Jelaskan kebutuhan khusus, fungsi ruang, atau fitur tertentu yang diinginkan..."
          />
        </div>

        {/* 3. Quality Standards */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            3. Standar Kualitas
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {qualityStandardOptions.map(standard => (
              <label key={standard} className="flex items-center space-x-2 cursor-pointer p-3 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700">
                <input
                  type="radio"
                  name="qualityStandards"
                  value={standard}
                  checked={formData.qualityStandards === standard}
                  onChange={(e) => handleInputChange('qualityStandards', e.target.value)}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-slate-700 dark:text-slate-300">{standard}</span>
              </label>
            ))}
          </div>
        </div>

        {/* 4. Material Preferences */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            4. Preferensi Material
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {materialPreferenceOptions.map(material => (
              <label key={material} className="flex items-center space-x-2 cursor-pointer p-3 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700">
                <input
                  type="checkbox"
                  checked={formData.materialPreferences.includes(material)}
                  onChange={() => handleMaterialPreferenceToggle(material)}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-slate-700 dark:text-slate-300">{material}</span>
              </label>
            ))}
          </div>
        </div>

        {/* 5. Color Preferences */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            5. Preferensi Warna
          </label>
          <textarea
            value={formData.colorPreferences}
            onChange={(e) => handleInputChange('colorPreferences', e.target.value)}
            rows={3}
            className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Jelaskan preferensi warna atau skema warna yang diinginkan..."
          />
        </div>

        {/* 6. Sustainability & Accessibility */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              6. Requirements Keberlanjutan
            </label>
            <textarea
              value={formData.sustainabilityRequirements}
              onChange={(e) => handleInputChange('sustainabilityRequirements', e.target.value)}
              rows={3}
              className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Jelaskan kebutuhan ramah lingkungan atau hemat energi..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              7. Kebutuhan Aksesibilitas
            </label>
            <textarea
              value={formData.accessibilityNeeds}
              onChange={(e) => handleInputChange('accessibilityNeeds', e.target.value)}
              rows={3}
              className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Jelaskan kebutuhan aksesibilitas untuk disabilitas, lansia, dll..."
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">IV. Stakeholder & Communication</h3>
      
      <div className="space-y-6">
        {/* 1. Decision Makers */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            1. Decision Makers
          </label>
          <textarea
            value={formData.decisionMakers}
            onChange={(e) => handleInputChange('decisionMakers', e.target.value)}
            rows={3}
            className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Sebutkan siapa saja yang terlibat dalam pengambilan keputusan proyek..."
          />
        </div>

        {/* 2. Project Team */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            2. Tim Proyek
          </label>
          <textarea
            value={formData.projectTeam}
            onChange={(e) => handleInputChange('projectTeam', e.target.value)}
            rows={3}
            className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Jelaskan tim internal yang akan terlibat dalam proyek..."
          />
        </div>

        {/* 3. Communication Preferences */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              3. Preferensi Komunikasi
            </label>
            <div className="space-y-2">
              {communicationPreferences.map(preference => (
                <label key={preference} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="communicationPreference"
                    value={preference}
                    checked={formData.communicationPreference === preference}
                    onChange={(e) => handleInputChange('communicationPreference', e.target.value)}
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-slate-700 dark:text-slate-300">{preference}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              4. Frekuensi Reporting
            </label>
            <div className="space-y-2">
              {reportingFrequencies.map(frequency => (
                <label key={frequency} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="reportingFrequency"
                    value={frequency}
                    checked={formData.reportingFrequency === frequency}
                    onChange={(e) => handleInputChange('reportingFrequency', e.target.value)}
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-slate-700 dark:text-slate-300">{frequency}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* 4. Meeting Schedule */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            5. Jadwal Meeting Preferensi
          </label>
          <textarea
            value={formData.meetingSchedule}
            onChange={(e) => handleInputChange('meetingSchedule', e.target.value)}
            rows={3}
            className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Jelaskan preferensi jadwal meeting (hari, waktu, frekuensi)..."
          />
        </div>
      </div>
    </div>
  );

  const renderStep5 = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">V. Upload Dokumen & Finalisasi</h3>
      
      <div className="space-y-6">
        {/* 1. Upload Dokumen Pendukung */}
        <div>
          {isDesignProject() ? (
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                1. Upload Dokumen Pendukung (Referensi)
              </label>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
                Hanya muncul untuk jenis proyek desain.
              </p>
            </div>
          ) : isBuildRenovateProject() ? (
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                1. Upload Dokumen Pendukung (BOQ & Gambar Kerja)
              </label>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
                Hanya muncul untuk jenis proyek bangun & renovasi. Bagian ini pada saat upload ada judulnya. 
                Jika upload BOQ, harus masukkan judul dulu BOQ, dan seterusnya.
              </p>
            </div>
          ) : null}

          {(isDesignProject() || isBuildRenovateProject()) && (
            <div>
              <div className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg p-6 text-center">
                <input
                  type="file"
                  multiple
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-upload"
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.dwg"
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <div className="space-y-2">
                    <svg className="w-8 h-8 mx-auto text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Klik untuk upload dokumen atau drag and drop
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-500">
                      PDF, DOC, DOCX, JPG, PNG, DWG (Max 10MB per file)
                    </p>
                  </div>
                </label>
              </div>

              {/* Uploaded Documents */}
              {formData.uploadedDocuments.length > 0 && (
                <div className="space-y-3 mt-4">
                  <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300">Dokumen yang diupload:</h4>
                  {formData.uploadedDocuments.map((file, index) => (
                    <div key={index} className="border border-slate-300 dark:border-slate-600 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{file.name}</span>
                        <button
                          type="button"
                          onClick={() => removeDocument(file.name)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                      <input
                        type="text"
                        placeholder="Masukkan judul/deskripsi dokumen (contoh: BOQ, Gambar Kerja, dll.)"
                        value={formData.documentTitles[file.name] || ''}
                        onChange={(e) => handleDocumentTitleChange(file.name, e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* 2. Catatan Khusus */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            2. Catatan Khusus (Opsional)
          </label>
          <textarea
            value={formData.specialNotes}
            onChange={(e) => handleInputChange('specialNotes', e.target.value)}
            rows={4}
            className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Masukkan catatan khusus atau informasi tambahan tentang proyek Anda..."
          />
        </div>

        {/* 3. Risks and Challenges */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            3. Potensi Risiko & Tantangan
          </label>
          <textarea
            value={formData.risksAndChallenges}
            onChange={(e) => handleInputChange('risksAndChallenges', e.target.value)}
            rows={3}
            className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Jelaskan potensi risiko atau tantangan yang mungkin dihadapi dalam proyek ini..."
          />
        </div>

        {/* 4. Success Criteria */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            4. Kriteria Kesuksesan
          </label>
          <textarea
            value={formData.successCriteria}
            onChange={(e) => handleInputChange('successCriteria', e.target.value)}
            rows={3}
            className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Jelaskan bagaimana proyek ini dianggap berhasil..."
          />
        </div>

        {/* 5. Persetujuan */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-4">
            5. Persetujuan *
          </label>
          
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
                Saya menyetujui seluruh ketentuan dan tata cara di platform Projevo.
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
                Saya menyatakan data yang diisi sudah benar dan sesuai kondisi yang sebenarnya.
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
                Saya mengizinkan admin untuk validasi draft ini sebelum dipublikasikan.
              </span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );

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

export default function HomeComponent() {
  const [selectedProject, setSelectedProject] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDrafts, setShowDrafts] = useState(false);
  const [projectDrafts, setProjectDrafts] = useState([]);
  
  // Load drafts from localStorage when component mounts
  useEffect(() => {
    const loadDrafts = () => {
      const savedDrafts = JSON.parse(localStorage.getItem('projevo_project_drafts') || '[]');
      setProjectDrafts(savedDrafts);
    };
    
    loadDrafts();
    
    // Listen for storage changes (when draft is saved)
    const handleStorageChange = () => {
      loadDrafts();
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    // Also listen for custom events from the same tab
    window.addEventListener('draftSaved', loadDrafts);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('draftSaved', loadDrafts);
    };
  }, []);
  
  const [projects] = useState([
    {
      id: 1,
      title: 'Modern Cafe Interior Design',
      client: 'CV. Kreasi Interior',
      status: 'In Progress',
      budget: 'Rp 185,000,000',
      startDate: '2024-03-15',
      deadline: '2024-12-15',
      progress: 75,
      category: 'Interior Design',
      location: 'South Jakarta',
      description: 'Contemporary cafe interior design featuring modern aesthetics with comfortable seating and efficient workflow.',
      team: ['John Doe', 'Sarah Wilson', 'Mike Chen'],
      milestones: [
        { name: 'Design Concept', completed: true, date: '2024-03-25' },
        { name: 'Material Selection', completed: true, date: '2024-04-10' },
        { name: 'Installation', completed: false, date: '2024-11-30' },
        { name: 'Final Touches', completed: false, date: '2024-12-10' },
      ]
    },
    {
      id: 2,
      title: 'Traditional Restaurant Construction',
      client: 'PT. Kuliner Nusantara',
      status: 'Completed',
      budget: 'Rp 320,000,000',
      startDate: '2023-11-20',
      deadline: '2024-05-20',
      progress: 100,
      category: 'Construction',
      location: 'Menteng, Jakarta',
      description: 'Complete construction of traditional Indonesian restaurant with authentic architectural elements and modern amenities.',
      team: ['Robert Chen', 'Lisa Park', 'David Kumar'],
      milestones: [
        { name: 'Foundation', completed: true, date: '2023-12-15' },
        { name: 'Structure', completed: true, date: '2024-02-28' },
        { name: 'MEP Installation', completed: true, date: '2024-04-15' },
        { name: 'Finishing', completed: true, date: '2024-05-15' },
      ]
    },
    {
      id: 3,
      title: 'Co-working Space Design',
      client: 'Studio Arsitek Modern',
      status: 'Under Review',
      budget: 'Rp 150,000,000',
      startDate: '2024-02-01',
      deadline: '2024-08-30',
      progress: 45,
      category: 'Architecture',
      location: 'Kemang, Jakarta',
      description: 'Modern co-working space design with flexible layouts, collaborative areas, and sustainable features.',
      team: ['Emma Thompson', 'Alex Smith'],
      milestones: [
        { name: 'Site Analysis', completed: true, date: '2024-02-15' },
        { name: 'Concept Design', completed: true, date: '2024-03-15' },
        { name: 'Detailed Design', completed: false, date: '2024-06-30' },
        { name: 'Construction Docs', completed: false, date: '2024-08-15' },
      ]
    },
    {
      id: 4,
      title: 'Luxury Villa Construction',
      client: 'Premium Properties Indonesia',
      status: 'On Hold',
      budget: 'Rp 850,000,000',
      startDate: '2024-01-15',
      deadline: '2024-11-30',
      progress: 30,
      category: 'Construction',
      location: 'Jakarta Selatan',
      description: 'High-end luxury villa with modern amenities, smart home integration, and sustainable design features.',
      team: ['Maria Garcia', 'John Wilson'],
      milestones: [
        { name: 'Planning Phase', completed: true, date: '2024-02-01' },
        { name: 'Foundation', completed: true, date: '2024-03-15' },
        { name: 'Structure', completed: false, date: '2024-08-30' },
        { name: 'Completion', completed: false, date: '2024-11-15' },
      ]
    }
  ]);

  const handleViewProject = (project) => {
    setSelectedProject(project);
  };

  const handleViewDraft = (draft) => {
    // For now, just show an alert with draft details
    // In a real app, you might open the modal with pre-filled data
    alert(`Viewing draft: ${draft.projectTitle}\nCreated: ${new Date(draft.createdAt).toLocaleDateString()}`);
  };

  const handleEditDraft = (draft) => {
    // For now, just show an alert
    // In a real app, you might open the create modal with pre-filled data
    alert(`Editing draft: ${draft.projectTitle}`);
  };

  const handleDeleteDraft = (draftId) => {
    if (confirm('Apakah Anda yakin ingin menghapus draft ini?')) {
      const updatedDrafts = projectDrafts.filter(draft => draft.id !== draftId);
      localStorage.setItem('projevo_project_drafts', JSON.stringify(updatedDrafts));
      setProjectDrafts(updatedDrafts);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'In Progress':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'Under Review':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'On Hold':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default:
        return 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300';
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'Construction':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        );
      case 'Interior Design':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z" />
          </svg>
        );
      case 'Architecture':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 21l0-12" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 21l0-12" />
          </svg>
        );
      case 'Renovation':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        );
    }
  };

  // If a project is selected, show the appropriate detail view
  if (selectedProject) {
    // Show ProjectCompleteComponent for completed projects
    if (selectedProject.status === 'Completed') {
      return (
        <ProjectCompleteComponent 
          project={selectedProject} 
          onBack={() => setSelectedProject(null)} 
        />
      );
    }
    
    // Show UnderReviewComponent for projects under review
    if (selectedProject.status === 'Under Review') {
      return (
        <UnderReviewComponent 
          project={selectedProject} 
          onBack={() => setSelectedProject(null)} 
        />
      );
    }
    
    // Show PendingComponent for pending projects
    if (selectedProject.status === 'On Hold') {
      return (
        <PendingComponent 
          project={selectedProject} 
          onBack={() => setSelectedProject(null)} 
        />
      );
    }
    
    // Show ProjectDetailComponent for other projects
    return (
      <ProjectDetailComponent 
        project={selectedProject} 
        onBack={() => setSelectedProject(null)} 
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">All Projects</h2>
          <p className="text-slate-600 dark:text-slate-400">Manage and track all your projects</p>
        </div>
        <div className="flex space-x-3">
          <button 
            onClick={() => setShowDrafts(!showDrafts)}
            className="px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg font-medium hover:bg-slate-200 dark:hover:bg-slate-600 transition-all duration-200"
          >
            {showDrafts ? 'Hide Drafts' : 'Show Drafts'} ({projectDrafts.length})
          </button>
          <button 
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-medium hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            Create New Project
          </button>
        </div>
      </div>

      {/* Saved Drafts Section */}
      {showDrafts && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Saved Drafts</h3>
          </div>
          
          {projectDrafts.length === 0 ? (
            <div className="text-center py-8 bg-slate-50 dark:bg-slate-800/50 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700">
              <div className="w-16 h-16 bg-slate-200 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h4 className="text-lg font-medium text-slate-900 dark:text-white mb-2">No drafts saved</h4>
              <p className="text-slate-500 dark:text-slate-400">Create a new project and save it as draft to see it here.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
              {projectDrafts.map((draft) => (
                <div
                  key={draft.id}
                  className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                      <span className="text-xs font-medium text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-900/20 px-2 py-1 rounded-md">
                        DRAFT
                      </span>
                    </div>
                    <div className="flex space-x-1">
                      <button
                        onClick={() => handleViewDraft(draft)}
                        className="p-1 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400"
                        title="View Draft"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleEditDraft(draft)}
                        className="p-1 text-slate-400 hover:text-green-600 dark:hover:text-green-400"
                        title="Edit Draft"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDeleteDraft(draft.id)}
                        className="p-1 text-slate-400 hover:text-red-600 dark:hover:text-red-400"
                        title="Delete Draft"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  
                  <h4 className="font-semibold text-slate-900 dark:text-white mb-2 line-clamp-2">
                    {draft.projectTitle || 'Untitled Draft'}
                  </h4>
                  
                  <div className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                    {draft.projectType && (
                      <div className="flex items-center">
                        <span className="w-2 h-2 bg-blue-400 rounded-full mr-2"></span>
                        <span>Type: {draft.projectType}</span>
                      </div>
                    )}
                    {draft.province && draft.city && (
                      <div className="flex items-center">
                        <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                        <span>Location: {draft.city}, {draft.province}</span>
                      </div>
                    )}
                    {draft.estimatedBudget && (
                      <div className="flex items-center">
                        <span className="w-2 h-2 bg-purple-400 rounded-full mr-2"></span>
                        <span>Budget: {draft.estimatedBudget}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-600">
                    <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                      <span>Created: {new Date(draft.createdAt).toLocaleDateString()}</span>
                      <span>{Math.round((Date.now() - new Date(draft.createdAt)) / (1000 * 60 * 60 * 24))} days ago</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Projects Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {projects.map((project) => (
          <div
            key={project.id}
            className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden hover:shadow-lg transition-all duration-200 hover:-translate-y-1"
          >
            <div className="p-6">
              {/* Project Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start space-x-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg text-blue-600 dark:text-blue-400">
                    {getCategoryIcon(project.category)}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">
                      {project.title}
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {project.client} • {project.location}
                    </p>
                  </div>
                </div>
                <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${getStatusColor(project.status)}`}>
                  {project.status}
                </span>
              </div>

              {/* Description */}
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                {project.description}
              </p>

              {/* Progress */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Progress</span>
                  <span className="text-sm text-slate-600 dark:text-slate-400">{project.progress}%</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${project.progress}%` }}
                  ></div>
                </div>
              </div>

              {/* Milestones */}
              <div className="mb-4">
                <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Milestones</h4>
                <div className="space-y-1">
                  {project.milestones.slice(0, 2).map((milestone, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <div className={`w-2 h-2 rounded-full ${milestone.completed ? 'bg-blue-500' : 'bg-slate-300 dark:bg-slate-600'}`}></div>
                      <span className={`text-xs ${milestone.completed ? 'text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400'}`}>
                        {milestone.name} {milestone.completed && `(${milestone.date})`}
                      </span>
                    </div>
                  ))}
                  {project.milestones.length > 2 && (
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-600"></div>
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        +{project.milestones.length - 2} more milestones
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Project Info */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Budget</p>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">{project.budget}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Deadline</p>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">
                    {new Date(project.deadline).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Team */}
              <div className="mb-4">
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">Team</p>
                <div className="flex -space-x-2">
                  {project.team.slice(0, 3).map((member, index) => (
                    <div
                      key={index}
                      className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-xs font-medium border-2 border-white dark:border-slate-800"
                    >
                      {member.split(' ').map(n => n[0]).join('')}
                    </div>
                  ))}
                  {project.team.length > 3 && (
                    <div className="w-8 h-8 bg-slate-300 dark:bg-slate-600 rounded-full flex items-center justify-center text-slate-700 dark:text-slate-300 text-xs font-medium border-2 border-white dark:border-slate-800">
                      +{project.team.length - 3}
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex space-x-3">
                <button 
                  onClick={() => handleViewProject(project)}
                  className="flex-1 px-3 py-2 bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400 text-sm font-medium rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                >
                  View Details
                </button>
                <button className="px-3 py-2 bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300 text-sm font-medium rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">
                  Update
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {projects.length === 0 && (
        <div className="text-center py-12">
          <div className="w-24 h-24 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-12 h-12 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">No projects found</h3>
          <p className="text-slate-500 dark:text-slate-400 mb-4">
            You haven&apos;t created any projects yet. Start by creating your first project.
          </p>
          <button 
            onClick={() => setShowCreateModal(true)}
            className="px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-medium hover:from-blue-700 hover:to-blue-800 transition-all duration-200"
          >
            Create New Project
          </button>
        </div>
      )}

      {/* Create Project Modal */}
      {showCreateModal && <CreateProjectModal onClose={() => setShowCreateModal(false)} />}
    </div>
  );
}