'use client';

import { useState } from 'react';
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
    clientName: '',
    clientPhone: '',
    clientEmail: '',
    projectDescription: '',
    projectBackground: '',
    projectGoals: '',
    
    // II. Klasifikasi & Ruang Lingkup Proyek
    projectType: '',
    projectScope: [],
    propertyType: '',
    otherProperty: '',
    propertySize: '',
    propertyAge: '',
    propertyCondition: '',
    existingStyle: '',
    desiredStyle: '',
    estimatedBudget: '',
    budgetPriority: '',
    estimatedDuration: '',
    tenderDuration: '',
    estimatedStartDate: '',
    projectUrgency: '',
    workingHours: '',
    accessRestrictions: '',
    
    // III. Spesifikasi Teknis & Requirements
    designPreferences: [],
    specificRequirements: '',
    qualityStandards: '',
    materialPreferences: [],
    colorPreferences: '',
    sustainabilityRequirements: '',
    accessibilityNeeds: '',
    
    // IV. Stakeholder & Communication
    decisionMakers: '',
    projectTeam: '',
    communicationPreference: '',
    reportingFrequency: '',
    meetingSchedule: '',
    
    // Documents
    uploadedDocuments: [],
    documentTitles: {},
    
    // Special Notes
    specialNotes: '',
    risksAndChallenges: '',
    successCriteria: '',
    
    // Agreements
    agreementTerms: false,
    agreementData: false,
    agreementValidation: false
  });

  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 5;

  const projectTypes = [
    'Desain', 'Bangun', 'Renovasi'
  ];

  const projectScopes = [
    'Interior', 'Furniture', 'Sipil', 'Eksterior', 'Taman & Hardscape',
    'Elektrikal', 'Plumbing', 'HVAC', 'Lighting Design', 'Acoustic Design'
  ];

  const propertyTypes = [
    'Rumah Tinggal', 'Apartemen', 'Ruko', 'Kantor', 'Gudang', 
    'Restoran', 'Sekolah', 'Hotel / Penginapan', 'Klinik/Rumah Sakit',
    'Retail/Mall', 'Pabrik', 'Warehouse', 'Other'
  ];

  const propertyConditions = [
    'Baru (Belum pernah dihuni)', 'Baik (Terawat dengan baik)', 
    'Cukup (Perlu sedikit perbaikan)', 'Perlu Renovasi', 'Rusak Berat'
  ];

  const designStyles = [
    'Modern', 'Minimalis', 'Industrial', 'Skandinavia', 'Tradisional',
    'Contemporary', 'Rustic', 'Classic', 'Art Deco', 'Mid-Century Modern',
    'Bohemian', 'Mediterranean', 'Tropical', 'Other'
  ];

  const budgetPriorities = [
    'Fleksibel - Kualitas terbaik', 'Seimbang - Kualitas dan harga',
    'Efisien - Harga terjangkau', 'Minimal - Budget ketat'
  ];

  const projectUrgencies = [
    'Sangat Mendesak (< 1 bulan)', 'Mendesak (1-2 bulan)',
    'Normal (2-6 bulan)', 'Fleksibel (> 6 bulan)'
  ];

  const workingHourOptions = [
    'Senin-Jumat (Jam kerja normal)', 'Senin-Sabtu (Termasuk weekend)',
    'Fleksibel (Sesuai kebutuhan)', 'Malam hari (Setelah jam kerja)',
    'Weekend only (Sabtu-Minggu)'
  ];

  const designPreferenceOptions = [
    'Ramah Lingkungan', 'Hemat Energi', 'Smart Home/Building',
    'Aksesibilitas Disabilitas', 'Pet-Friendly', 'Child-Safe',
    'Multifungsi', 'Storage Solutions', 'Natural Lighting',
    'Ventilasi Natural', 'Sound Proofing', 'Security Features'
  ];

  const materialPreferenceOptions = [
    'Kayu Natural', 'Material Recycle', 'High-End Materials',
    'Budget-Friendly Materials', 'Local Materials', 'Imported Materials',
    'Low Maintenance', 'Durable Materials', 'Eco-Friendly',
    'Fire Resistant', 'Water Resistant', 'Anti-Bacterial'
  ];

  const qualityStandardOptions = [
    'Premium (Kualitas terbaik)', 'High Quality (Kualitas tinggi)',
    'Standard (Kualitas menengah)', 'Budget (Kualitas dasar)'
  ];

  const communicationPreferences = [
    'WhatsApp', 'Email', 'Telepon', 'Video Call', 'Aplikasi Project Management',
    'Kombinasi (Multi-channel)'
  ];

  const reportingFrequencies = [
    'Harian', 'Mingguan', 'Bi-weekly', 'Bulanan', 'Sesuai Milestone'
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

  const handleScopeToggle = (scope) => {
    setFormData(prev => ({
      ...prev,
      projectScope: prev.projectScope.includes(scope)
        ? prev.projectScope.filter(s => s !== scope)
        : [...prev.projectScope, scope]
    }));
  };

  const handleDesignPreferenceToggle = (preference) => {
    setFormData(prev => ({
      ...prev,
      designPreferences: prev.designPreferences.includes(preference)
        ? prev.designPreferences.filter(p => p !== preference)
        : [...prev.designPreferences, preference]
    }));
  };

  const handleMaterialPreferenceToggle = (material) => {
    setFormData(prev => ({
      ...prev,
      materialPreferences: prev.materialPreferences.includes(material)
        ? prev.materialPreferences.filter(m => m !== material)
        : [...prev.materialPreferences, material]
    }));
  };

  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files);
    setFormData(prev => ({
      ...prev,
      uploadedDocuments: [...prev.uploadedDocuments, ...files]
    }));
  };

  const handleDocumentTitleChange = (fileName, title) => {
    setFormData(prev => ({
      ...prev,
      documentTitles: {
        ...prev.documentTitles,
        [fileName]: title
      }
    }));
  };

  const removeDocument = (fileName) => {
    setFormData(prev => ({
      ...prev,
      uploadedDocuments: prev.uploadedDocuments.filter(file => file.name !== fileName),
      documentTitles: Object.fromEntries(
        Object.entries(prev.documentTitles).filter(([key]) => key !== fileName)
      )
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validation for required fields
    if (!formData.agreementTerms || !formData.agreementData || !formData.agreementValidation) {
      alert('Silakan setujui semua persetujuan yang diperlukan');
      return;
    }
    
    // Handle form submission here
    console.log('Project created:', formData);
    onClose();
  };

  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, totalSteps));
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

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
              8. Desired Style *
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

        {/* 8. Budget Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              9. Estimasi Anggaran *
            </label>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
              Masukkan estimasi anggaran Anda sebagai referensi bagi vendor. Angka ini bisa berupa kisaran dan tidak mengikat.
            </p>
            <input
              type="text"
              value={formData.estimatedBudget}
              onChange={(e) => handleInputChange('estimatedBudget', e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Contoh: Rp 100.000.000 - Rp 200.000.000"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              10. Prioritas Budget
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

        {/* 9. Timeline Details */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              11. Estimasi Durasi Proyek *
            </label>
            <input
              type="text"
              value={formData.estimatedDuration}
              onChange={(e) => handleInputChange('estimatedDuration', e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Contoh: 3-6 bulan"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              12. Durasi Tender *
            </label>
            <input
              type="text"
              value={formData.tenderDuration}
              onChange={(e) => handleInputChange('tenderDuration', e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Contoh: 2 minggu"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              13. Estimasi Mulai Proyek *
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

        {/* 10. Project Urgency & Working Hours */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              14. Tingkat Urgensi
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
              15. Jam Kerja Preferensi
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

        {/* 11. Access Restrictions */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            16. Pembatasan Akses/Kendala Khusus
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
              <p className="text-blue-100 mt-1">Langkah {currentStep} dari {totalSteps}</p>
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
          
          {/* Progress Bar */}
          <div className="mt-4">
            <div className="w-full bg-blue-500 rounded-full h-2">
              <div 
                className="bg-white rounded-full h-2 transition-all duration-300"
                style={{ width: `${(currentStep / totalSteps) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-8 overflow-y-auto max-h-[calc(90vh-200px)]">
          <form onSubmit={handleSubmit}>
            {currentStep === 1 && renderStep1()}
            {currentStep === 2 && renderStep2()}
            {currentStep === 3 && renderStep3()}
            {currentStep === 4 && renderStep4()}
            {currentStep === 5 && renderStep5()}
          </form>
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 dark:bg-slate-700 px-8 py-4 flex items-center justify-between">
          <button
            type="button"
            onClick={prevStep}
            disabled={currentStep === 1}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${
              currentStep === 1
                ? 'bg-slate-200 text-slate-500 cursor-not-allowed'
                : 'bg-slate-600 text-white hover:bg-slate-700'
            }`}
          >
            Previous
          </button>

          <div className="flex items-center space-x-2">
            {Array.from({ length: totalSteps }).map((_, index) => (
              <div
                key={index}
                className={`w-3 h-3 rounded-full ${
                  index + 1 <= currentStep ? 'bg-blue-600' : 'bg-slate-300'
                }`}
              />
            ))}
          </div>

          {currentStep < totalSteps ? (
            <button
              type="button"
              onClick={nextStep}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Next
            </button>
          ) : (
            <button
              type="submit"
              onClick={handleSubmit}
              className="px-6 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
            >
              Create Project
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function HomeComponent() {
  const [selectedProject, setSelectedProject] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [projects] = useState([
    {
      id: 1,
      projectType: "Interior Design",
      title: "Modern Cafe Interior Design",
      location: "South Jakarta",
      profileName: "CV. Kreasi Interior",
      contractType: "Contract",
      status: "in progress",
      projectStatus: "Project",
      budget: "Rp 185.000.000",
      progress: 75
    },
    {
      id: 2,
      projectType: "Construction",
      title: "Traditional Restaurant Construction",
      location: "Menteng, Jakarta",
      profileName: "PT. Bangun Jaya",
      contractType: "Tender",
      status: "completed",
      projectStatus: "Dashboard",
      budget: "Rp 320.000.000",
      progress: 100,
      // Additional fields for completed projects
      completedDate: "2024-05-20",
      duration: "6 months",
      startDate: "2023-11-20",
      rating: 4.9,
      review: "Outstanding work! The team exceeded all expectations with their attention to detail and timely delivery. The traditional restaurant design perfectly captures the authentic atmosphere we wanted.",
      client: {
        name: "PT. Kuliner Nusantara",
        contact: "Sari Dewi",
        email: "sari@kulinernusantara.co.id"
      }
    },
    {
      id: 3,
      projectType: "Architecture",
      title: "Co-working Space Design",
      location: "Kemang, Jakarta",
      profileName: "Studio Arsitek Modern",
      contractType: "Contract",
      status: "under review",
      projectStatus: "tender successfully submitted",
      budget: "Rp 150.000.000",
      progress: 45,
      // Additional fields for under review projects
      submittedDate: "2024-06-10",
      expectedDecision: "2024-06-25",
      reviewStage: "Technical Evaluation",
      reviewProgress: 65,
      daysRemaining: 6,
      reviewer: "Technical Review Committee",
      estimatedDuration: "4 months",
      client: {
        name: "PT. Modern Workspace",
        contact: "Lisa Ananda",
        email: "lisa@modernworkspace.co.id"
      }
    },
    {
      id: 4,
      projectType: "Renovation",
      title: "Boutique Store Renovation",
      location: "PIK Jakarta",
      profileName: "Renovasi Pro",
      contractType: "Tender",
      status: "pending",
      projectStatus: "migrating to history",
      budget: "Rp 95.000.000",
      progress: 25,
      // Additional fields for pending projects
      submittedDate: "2024-05-15",
      lastUpdate: "2024-06-10",
      pendingReason: "Client Documentation Review",
      actionRequired: "Awaiting client approval",
      priority: "Medium",
      daysWaiting: 35,
      nextFollowUp: "2024-06-20",
      assignedTo: "Project Manager",
      estimatedDuration: "3 months",
      client: {
        name: "Boutique Style Co.",
        contact: "Maria Santoso",
        email: "maria@boutiquestyle.co.id"
      }
    },
    {
      id: 5,
      projectType: "Interior Design",
      title: "Modern Office Interior Design",
      location: "Sudirman, Jakarta",
      profileName: "Design Hub Indonesia",
      contractType: "Contract",
      status: "completed",
      projectStatus: "Project",
      budget: "Rp 275.000.000",
      progress: 100,
      // Additional fields for completed projects
      completedDate: "2024-04-15",
      duration: "3.5 months",
      startDate: "2024-01-01",
      rating: 4.7,
      review: "Professional team with excellent project management. The modern office design improved our workplace productivity and employee satisfaction significantly.",
      client: {
        name: "PT. Teknologi Maju",
        contact: "Ahmad Rahman",
        email: "ahmad@teknologimaju.com"
      }
    },
    {
      id: 6,
      projectType: "Interior Design",
      title: "Modern Rooftop Bar Interior",
      location: "SCBD Jakarta",
      profileName: "Design Excellence",
      contractType: "Contract",
      status: "in progress",
      projectStatus: "contract signing",
      budget: "Rp 125.000.000",
      progress: 30
    },
    {
      id: 7,
      projectType: "Construction",
      title: "Office Building Construction",
      location: "Kuningan, Jakarta",
      profileName: "Konstruksi Mandiri",
      contractType: "Tender",
      status: "rejected",
      projectStatus: "tender rejected by client",
      budget: "Rp 850.000.000",
      progress: 0
    }
  ]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'in progress':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'under review':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'pending':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400';
      case 'rejected':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getProjectStatusColor = (status) => {
    switch (status) {
      case 'Project':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'Dashboard':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400';
      case 'tender successfully submitted':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'migrating to history':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'contract signing':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-400';
      case 'tender rejected by client':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  // If a project is selected, show the appropriate detail view
  if (selectedProject) {
    // Show ProjectCompleteComponent for completed projects
    if (selectedProject.status === 'completed') {
      return (
        <ProjectCompleteComponent 
          project={selectedProject} 
          onBack={() => setSelectedProject(null)} 
        />
      );
    }
    
    // Show UnderReviewComponent for projects under review
    if (selectedProject.status === 'under review') {
      return (
        <UnderReviewComponent 
          project={selectedProject} 
          onBack={() => setSelectedProject(null)} 
        />
      );
    }
    
    // Show PendingComponent for pending projects
    if (selectedProject.status === 'pending') {
      return (
        <PendingComponent 
          project={selectedProject} 
          onBack={() => setSelectedProject(null)} 
        />
      );
    }
    
    // Show RejectedComponent for rejected projects
    if (selectedProject.status === 'rejected') {
      return (
        <RejectedComponent 
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
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">All Projects</h1>
            <p className="text-slate-600 dark:text-slate-400 mt-2">
              Manage and track all your projects
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center space-x-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors shadow-lg hover:shadow-xl"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            <span>Create New Project</span>
          </button>
        </div>
      </div>

      {/* Project Cards */}
      <div className="space-y-3">
        {projects.map((project) => (
          <div 
            key={project.id} 
            className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-4 hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => setSelectedProject(project)}
          >
            <div className="grid grid-cols-12 gap-4 items-center">
              {/* Column 1 - Project Type */}
              <div className="col-span-2">
                <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
                  {project.projectType}
                </span>
              </div>

              {/* Column 2 - Title, Location, Profile Name */}
              <div className="col-span-4">
                <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-1 leading-tight">
                  {project.title}
                </h3>
                <div className="space-y-0.5 text-xs text-slate-600 dark:text-slate-400">
                  <div className="flex items-center">
                    <svg className="w-3 h-3 mr-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="truncate">{project.location}</span>
                  </div>
                  <div className="flex items-center">
                    <svg className="w-3 h-3 mr-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span className="truncate">{project.profileName}</span>
                  </div>
                </div>
              </div>

              {/* Column 3 - Contract Type and Status */}
              <div className="col-span-3">
                <div className="space-y-2">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${
                    project.contractType === 'Contract' 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                      : 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400'
                  }`}>
                    {project.contractType}
                  </span>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${getStatusColor(project.status)}`}>
                    {project.status}
                  </span>
                </div>
              </div>

              {/* Column 4 - Project Status */}
              <div className="col-span-3">
                <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${getProjectStatusColor(project.projectStatus)} max-w-full`}>
                  <span className="truncate">{project.projectStatus}</span>
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Create Project Modal */}
      {showCreateModal && <CreateProjectModal onClose={() => setShowCreateModal(false)} />}
    </div>
  );
}