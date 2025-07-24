'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../../contexts/AuthContext';
import { collection, query, where, onSnapshot, orderBy, addDoc, serverTimestamp, getDocs } from 'firebase/firestore';
import { db } from '../../../../lib/firebase';
import { 
  FiChevronDown, 
  FiFilter, 
  FiRefreshCw,
  FiFileText,
  FiExternalLink,
  FiLoader,
  FiPlus,
  FiEdit,
  FiClock,
  FiLock,
  FiMessageSquare,
  FiCreditCard
} from 'react-icons/fi';
import { 
  MdSort,
  MdHome,
  MdFolder
} from 'react-icons/md';
import ProjectOwnerDetailModal from './ProjectOwnerDetailModal';
import ProjectOwnerDetailPage from './ProjectOwnerDetailPage';

// Create Project Modal Component
function CreateProjectModal({ onClose }) {
  const { user } = useAuth();
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
  const [submitting, setSubmitting] = useState(false);

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

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!user?.uid) {
      alert('Please log in to create a project');
      return;
    }
    
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

    setLoading(true);
    try {
      // Generate custom project ID
      console.log('About to generate custom project ID for project type:', formData.projectType);
      const customProjectId = await generateProjectId(formData.projectType);
      console.log('Generated custom project ID:', customProjectId);
      
      const projectData = {
        customId: customProjectId, // Add custom ID field
        ...formData,
        title: formData.projectTitle,
        ownerId: user.uid,
        ownerEmail: user.email,
        ownerName: user.displayName || user.email,
        status: 'Menunggu Persetujuan',
        moderationStatus: 'pending',
        progress: 0,
        isPublished: false,
        publishedAt: null,
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

      // Include BOQ data if selected
      if (formData.selectedBOQ && formData.boqData) {
        projectData.attachedBOQ = {
          id: formData.selectedBOQ,
          title: formData.boqData.title,
          tahapanKerja: formData.boqData.tahapanKerja,
          createdAt: formData.boqData.createdAt,
          updatedAt: formData.boqData.updatedAt,
          attachedAt: new Date().toISOString()
        };
      }

      console.log('About to save project data:', { 
        customId: projectData.customId, 
        projectType: projectData.projectType,
        title: projectData.title,
        ownerId: projectData.ownerId 
      });

      const docRef = await addDoc(collection(db, 'projects'), projectData);
      console.log('Project created with Firestore ID:', docRef.id, 'Custom ID:', customProjectId);
      console.log('Full project data saved:', projectData);
      
      alert(`Project submitted successfully! Your project ID is: ${customProjectId}. Your project is now pending approval and will be available in the marketplace once approved.`);
      onClose();
    } catch (error) {
      console.error('Error creating project:', error);
      alert('Failed to create project. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDraft = async () => {
    if (!user?.uid) {
      alert('Please log in to save a draft');
      return;
    }

    // Basic validation - only require project title
    if (!formData.projectTitle.trim()) {
      alert('Judul proyek harus diisi untuk menyimpan draft');
      return;
    }

    setSubmitting(true);
    try {
      // Generate custom project ID for drafts too
      console.log('Generating custom project ID for draft:', formData.projectType || 'Unknown');
      const customProjectId = await generateProjectId(formData.projectType || 'Unknown');
      console.log('Generated custom project ID for draft:', customProjectId);

      const draftData = {
        customId: customProjectId, // Add custom ID field for drafts
        ...formData,
        title: formData.projectTitle,
        ownerId: user.uid,
        ownerEmail: user.email,
        ownerName: user.displayName || user.email,
        status: 'Draft', // Set status as Draft
        moderationStatus: 'draft',
        progress: 0,
        isPublished: false,
        isDraft: true, // Mark as draft
        publishedAt: null,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        submittedAt: null, // No submission date for drafts
        team: [],
        milestones: [
          { name: 'Planning', completed: false, date: '' },
          { name: 'Design', completed: false, date: '' },
          { name: 'Development', completed: false, date: '' },
          { name: 'Review', completed: false, date: '' },
          { name: 'Completion', completed: false, date: '' }
        ],
        // Add metadata for marketplace (but won't be published)
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

      const docRef = await addDoc(collection(db, 'projects'), draftData);
      console.log('Draft saved with Firestore ID:', docRef.id, 'Custom ID:', customProjectId);
      console.log('Full draft data saved:', draftData);
      
      alert(`Draft berhasil disimpan! ID draft Anda: ${customProjectId}. Anda dapat melanjutkan mengedit proyek ini nanti.`);
      onClose();
    } catch (error) {
      console.error('Error saving draft:', error);
      alert('Gagal menyimpan draft. Silakan coba lagi.');
    } finally {
      setSubmitting(false);
    }
  };

  const getAvailableCities = () => {
    return cities[formData.province] || [];
  };

  const isDesignProject = () => formData.projectType === 'Desain';
  const isBuildRenovateProject = () => ['Bangun', 'Renovasi'].includes(formData.projectType);

  // Function to generate custom project ID
  const generateProjectId = async (projectType) => {
    console.log('generateProjectId called with projectType:', projectType);
    
    const now = new Date();
    const year = String(now.getFullYear()).slice(-2); // Get last 2 digits of year (25 for 2025)
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const dateString = `${year}${month}`; // Format: 2507 for July 2025
    
    // Map project type to 3-letter code
    let typePrefix;
    switch (projectType) {
      case 'Desain':
        typePrefix = 'DES';
        break;
      case 'Bangun':
        typePrefix = 'BUI';
        break;
      case 'Renovasi':
        typePrefix = 'REN';
        break;
      default:
        typePrefix = 'PRJ'; // Default fallback
    }
    
    // Country code for Indonesia
    const countryCode = 'ID';
    
    console.log('Date components:', { year, month, dateString, typePrefix, countryCode });
    
    try {
      // Query existing projects to get the count for today
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      console.log('Querying projects between:', today, 'and', tomorrow);
      
      const q = query(
        collection(db, 'projects'),
        where('createdAt', '>=', today),
        where('createdAt', '<', tomorrow),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const todayCount = querySnapshot.size + 1;
      const sequentialNumber = String(todayCount).padStart(4, '0');
      
      const finalCustomId = `${typePrefix}-${countryCode}-${dateString}-${sequentialNumber}`;
      console.log('Generated custom ID:', finalCustomId);
      
      return finalCustomId;
    } catch (error) {
      console.error('Error generating project ID:', error);
      // Fallback to timestamp-based ID if query fails
      const fallbackNumber = String(Math.floor(Math.random() * 9999) + 1).padStart(4, '0');
      const fallbackId = `${typePrefix}-${countryCode}-${dateString}-${fallbackNumber}`;
      console.log('Using fallback custom ID:', fallbackId);
      return fallbackId;
    }
  };

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
                  disabled={loading}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Creating...' : 'Buat Proyek'}
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
  const [showDetailsView, setShowDetailsView] = useState(false);
  const [activeProjectFilter, setActiveProjectFilter] = useState(null); // Internal project filter state
  const sortDropdownRef = useRef(null);
  const filterDropdownRef = useRef(null);
  
  // Project filter tabs
  const projectFilterTabs = ['All', 'Draft', 'Tender', 'Contract', 'Negotiation', 'Penunjukan Langsung'];
  
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
    setShowDetailsView(true);
  };

  const handleCloseDetailModal = () => {
    // Legacy function - kept for compatibility
    setSelectedProject(null);
  };

  const handleBackToList = () => {
    setShowDetailsView(false);
    setSelectedProject(null);
  };

  const handleEditProject = (project) => {
    // TODO: Implement edit project functionality
    console.log('Edit project:', project);
    setShowDetailsView(false);
  };

  const handleViewOffers = (project) => {
    // Navigate to proposal tab directly
    setSelectedProject(project);
    setShowDetailsView(true);
    // TODO: Add logic to auto-navigate to proposals tab in detail view
    console.log('View offers for project:', project);
  };

  const handlePayment = (project) => {
    // Navigate to payment flow for vendor selection
    console.log('Initiate payment for project:', project);
    // TODO: Implement payment flow integration
    // This could open a payment modal or navigate to payment page
    setSelectedProject(project);
    setShowDetailsView(true);
  };

  const handleResubmitProject = (project) => {
    // Reopen the project for tender
    console.log('Resubmit project for tender:', project);
    // TODO: Implement project resubmission logic
    // This should reset project status and open it for new tender
    alert('Project resubmission feature will be implemented. This will reset the tender deadline and open the project for new bids.');
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
  const getDisplayStatus = (project) => {
    // Use the new project status logic
    return getProjectStatus(project);
  };

  // Helper function to format budget with thousand separators
  const formatBudget = (budget) => {
    if (!budget) return 'Not specified';
    
    // Convert to number if it's a string
    const numBudget = typeof budget === 'string' ? parseInt(budget.replace(/[^\d]/g, '')) : budget;
    
    if (isNaN(numBudget)) return 'Not specified';
    
    return `Rp ${numBudget.toLocaleString('id-ID')}`;
  };

  // Helper function to get company name from user profile
  const getCompanyName = (project) => {
    // Try to get from user profile first
    if (userProfile?.companyName) {
      return userProfile.companyName;
    }
    
    // Fallback to owner name or email
    if (project.ownerName && project.ownerName !== project.ownerEmail) {
      return project.ownerName;
    }
    
    if (project.ownerEmail) {
      return project.ownerEmail.split('@')[0];
    }
    
    return 'Unknown Company';
  };

  // Helper function to get milestones from BOQ data
  const getMilestones = (project) => {
    // If project has attached BOQ, create milestones from tahapan kerja
    if (project.attachedBOQ && project.attachedBOQ.tahapanKerja) {
      console.log('BOQ tahapanKerja found:', project.attachedBOQ.tahapanKerja);
      return project.attachedBOQ.tahapanKerja.map((tahapan, index) => {
        const milestoneName = tahapan.name || tahapan.nama || `Tahapan ${index + 1}`;
        console.log(`Milestone ${index + 1}:`, milestoneName, 'from tahapan:', tahapan);
        return {
          name: milestoneName,
          completed: false,
          date: ''
        };
      });
    }
    
    // Fallback to existing milestones or default ones
    if (project.milestones && project.milestones.length > 0) {
      return project.milestones;
    }
    
    // Default milestones based on project type
    const defaultMilestones = {
      'Desain': [
        { name: 'Concept Design', completed: false, date: '' },
        { name: 'Design Development', completed: false, date: '' },
        { name: 'Final Design', completed: false, date: '' },
        { name: 'Design Approval', completed: false, date: '' }
      ],
      'Bangun': [
        { name: 'Site Preparation', completed: false, date: '' },
        { name: 'Foundation', completed: false, date: '' },
        { name: 'Structure', completed: false, date: '' },
        { name: 'Finishing', completed: false, date: '' }
      ],
      'Renovasi': [
        { name: 'Demolition', completed: false, date: '' },
        { name: 'Reconstruction', completed: false, date: '' },
        { name: 'Finishing', completed: false, date: '' },
        { name: 'Final Inspection', completed: false, date: '' }
      ]
    };
    
    return defaultMilestones[project.projectType] || [
      { name: 'Planning', completed: false, date: '' },
      { name: 'Execution', completed: false, date: '' },
      { name: 'Review', completed: false, date: '' },
      { name: 'Completion', completed: false, date: '' }
    ];
  };

  // Helper function to calculate tender deadline from createdAt + tenderDuration
  const calculateTenderDeadline = (createdAt, tenderDuration) => {
    if (!createdAt || !tenderDuration) {
      console.log('Missing createdAt or tenderDuration:', { createdAt, tenderDuration });
      return null;
    }

    try {
      let startDate;
      
      // Parse createdAt to Date object
      if (createdAt?.toDate) {
        startDate = createdAt.toDate();
      } else if (typeof createdAt === 'string') {
        startDate = new Date(createdAt);
      } else if (createdAt instanceof Date) {
        startDate = createdAt;
      } else if (typeof createdAt === 'object' && createdAt.seconds) {
        // Firestore timestamp object format
        startDate = new Date(createdAt.seconds * 1000);
      } else {
        console.log('Invalid createdAt format:', createdAt);
        return null;
      }

      // Validate start date
      if (!startDate || isNaN(startDate.getTime())) {
        console.log('Invalid start date:', startDate);
        return null;
      }

      // Parse tender duration (e.g., "1 bulan", "2 minggu", "30 hari")
      const duration = tenderDuration.toLowerCase().trim();
      const deadline = new Date(startDate);

      console.log('Calculating deadline for:', { startDate: startDate.toISOString(), duration });

      if (duration.includes('bulan')) {
        const months = parseInt(duration.match(/(\d+)/)?.[1] || 1);
        deadline.setMonth(deadline.getMonth() + months);
        console.log(`Added ${months} months, deadline:`, deadline.toISOString());
      } else if (duration.includes('minggu')) {
        const weeks = parseInt(duration.match(/(\d+)/)?.[1] || 1);
        deadline.setDate(deadline.getDate() + (weeks * 7));
        console.log(`Added ${weeks} weeks, deadline:`, deadline.toISOString());
      } else if (duration.includes('hari')) {
        const days = parseInt(duration.match(/(\d+)/)?.[1] || 1);
        deadline.setDate(deadline.getDate() + days);
        console.log(`Added ${days} days, deadline:`, deadline.toISOString());
      } else {
        // Try to parse as pure number (assume days)
        const numericValue = parseInt(duration.match(/(\d+)/)?.[1]);
        if (!isNaN(numericValue)) {
          deadline.setDate(deadline.getDate() + numericValue);
          console.log(`Added ${numericValue} numeric days, deadline:`, deadline.toISOString());
        } else {
          console.log('Could not parse tender duration, using 30 days default:', tenderDuration);
          // Default to 30 days (1 month)
          deadline.setDate(deadline.getDate() + 30);
        }
      }
      
      // Validate the calculated deadline
      if (isNaN(deadline.getTime())) {
        console.error('Invalid deadline calculated:', { createdAt, tenderDuration, startDate, deadline });
        return null;
      }
      
      return deadline;
    } catch (error) {
      console.error('Error calculating tender deadline:', error);
      return null;
    }
  };

  // Helper function to calculate tender time left
  const getTenderTimeLeft = (project) => {
    // First try to calculate deadline from createdAt + tenderDuration if it's a tender project
    let deadline = null;
    
    if (project.procurementMethod === 'Tender' && project.createdAt && project.tenderDuration) {
      deadline = calculateTenderDeadline(project.createdAt, project.tenderDuration);
    }
    
    // Fallback to pre-existing deadline fields
    if (!deadline) {
      deadline = project.tenderDeadline || project.deadline;
    }
    
    if (!deadline) {
      return 'No deadline set';
    }
    
    let deadlineDate;
    
    try {
      if (deadline?.toDate) {
        deadlineDate = deadline.toDate();
      } else if (typeof deadline === 'string') {
        deadlineDate = new Date(deadline);
      } else if (deadline instanceof Date) {
        deadlineDate = deadline;
      } else if (typeof deadline === 'object' && deadline.seconds) {
        deadlineDate = new Date(deadline.seconds * 1000);
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

  // Helper function to get the project status for display and logic
  const getProjectStatus = (project) => {
    console.log('Getting status for project:', project.id, {
      status: project.status,
      moderationStatus: project.moderationStatus,
      procurementMethod: project.procurementMethod,
      createdAt: project.createdAt,
      tenderDuration: project.tenderDuration,
      deadline: project.deadline
    });

    // Draft Mode Statuses
    if (project.status === 'Draft' || project.moderationStatus === 'draft') {
      return 'In Progress'; // Owner still creates the project draft
    }
    
    if (project.moderationStatus === 'pending' || project.status === 'Under Review' || project.status === 'Review') {
      return 'Review'; // Owner clicks "Submit Draft"
    }
    
    if (project.moderationStatus === 'rejected' || project.status === 'Revise' || project.moderationStatus === 'revision_required') {
      return 'Revise'; // Admin require project owner to edit/revise the project details
    }
    
    if (project.moderationStatus === 'approved' && project.procurementMethod !== 'Tender') {
      return 'Approve'; // Admin approve the project and it's live in Project Market Place
    }
    
    // Tender Mode Statuses
    if (project.moderationStatus === 'approved' && project.procurementMethod === 'Tender') {
      // Check if tender is locked (less than 24 hours to deadline)
      const timeLeft = getTimeToDeadlineInHours(project);
      
      console.log('Tender time analysis:', {
        timeLeft,
        hasNegotiationOffer: project.hasNegotiationOffer,
        selectedVendorId: project.selectedVendorId
      });
      
      if (timeLeft !== null) {
        if (timeLeft <= 24 && timeLeft > 0) {
          return 'Locked'; // Locked if less than 24 hours to deadline
        }
        if (timeLeft <= 0) {
          return 'Failed'; // No winner chosen until deadline
        }
      }
      
      // Check for negotiation status
      if (project.hasNegotiationOffer || project.status === 'Negotiate') {
        return 'Negotiate';
      }
      
      // Check if vendor was awarded/selected
      if (project.selectedVendorId || project.status === 'Awarded') {
        return 'Awarded';
      }
      
      return 'Open'; // Default for approved tender projects
    }
    
    // Default fallback
    console.log('Using fallback status for project:', project.id, project.status);
    return project.status || 'Draft';
  };

  // Helper function to calculate hours to deadline
  const getTimeToDeadlineInHours = (project) => {
    // First try to calculate deadline from createdAt + tenderDuration if it's a tender project
    let deadline = null;
    
    if (project.procurementMethod === 'Tender' && project.createdAt && project.tenderDuration) {
      deadline = calculateTenderDeadline(project.createdAt, project.tenderDuration);
    }
    
    // Fallback to pre-existing deadline fields
    if (!deadline) {
      deadline = project.tenderDeadline || project.deadline;
    }
    
    if (!deadline) return null;
    
    try {
      let deadlineDate;
      
      if (deadline instanceof Date) {
        deadlineDate = deadline;
      } else if (deadline?.toDate) {
        deadlineDate = deadline.toDate();
      } else if (typeof deadline === 'string') {
        deadlineDate = new Date(deadline);
      } else if (typeof deadline === 'object' && deadline.seconds) {
        deadlineDate = new Date(deadline.seconds * 1000);
      } else {
        return null;
      }

      if (!deadlineDate || isNaN(deadlineDate.getTime())) {
        return null;
      }

      const now = new Date();
      const diffTime = deadlineDate.getTime() - now.getTime();
      return diffTime / (1000 * 60 * 60); // Convert to hours
    } catch (error) {
      console.error('Error calculating time to deadline:', error);
      return null;
    }
  };

  // Helper function to determine action button based on status
  const getActionButton = (project) => {
    const projectStatus = getProjectStatus(project);
    
    switch (projectStatus) {
      case 'In Progress':
        return (
          <button
            onClick={() => handleEditProject(project)}
            className="flex items-center font-medium hover:underline text-blue-600 hover:text-blue-800 transition-colors"
          >
            <FiEdit className="w-4 h-4 mr-1" />
            Edit Project
          </button>
        );
        
      case 'Review':
        return (
          <button
            disabled
            className="flex items-center font-medium text-gray-400 cursor-not-allowed"
            title="Wait Admin To Approve"
          >
            <FiClock className="w-4 h-4 mr-1" />
            Wait Admin To Approve
          </button>
        );
        
      case 'Revise':
        return (
          <button
            onClick={() => handleEditProject(project)}
            className="flex items-center font-medium hover:underline text-orange-600 hover:text-orange-800 transition-colors"
            title={project.adminNotes || "Admin requires revision. Please check admin notes for details."}
          >
            <FiEdit className="w-4 h-4 mr-1" />
            Edit Project
          </button>
        );
        
      case 'Approve':
        return (
          <button
            onClick={() => handleViewProject(project)}
            className="flex items-center font-medium hover:underline text-black hover:text-gray-600 transition-colors"
          >
            <FiExternalLink className="w-4 h-4 mr-1" />
            View Details
          </button>
        );
        
      case 'Open':
        const timeLeft = getTenderTimeLeft(project);
        return (
          <div className="text-right">
            <button
              onClick={() => handleViewProject(project)}
              className="flex items-center font-medium hover:underline text-green-600 hover:text-green-800 transition-colors mb-1"
            >
              <FiExternalLink className="w-4 h-4 mr-1" />
              View Details
            </button>
            <div className="text-sm text-gray-600">
              Tender Status: Open
            </div>
            <div className="text-sm font-medium text-green-600">
              {timeLeft}
            </div>
          </div>
        );
        
      case 'Locked':
        const lockedTimeLeft = getTenderTimeLeft(project);
        return (
          <div className="text-right">
            <button
              onClick={() => handleViewProject(project)}
              className="flex items-center font-medium hover:underline text-orange-600 hover:text-orange-800 transition-colors mb-1"
            >
              <FiLock className="w-4 h-4 mr-1" />
              View Details
            </button>
            <div className="text-sm text-orange-600">
              Tender Locked (&lt; 24h)
            </div>
            <div className="text-sm font-medium text-orange-600">
              {lockedTimeLeft}
            </div>
          </div>
        );
        
      case 'Negotiate':
        return (
          <button
            onClick={() => handleViewOffers(project)}
            className="flex items-center font-medium hover:underline text-purple-600 hover:text-purple-800 transition-colors"
          >
            <FiMessageSquare className="w-4 h-4 mr-1" />
            View Offer
          </button>
        );
        
      case 'Awarded':
        return (
          <button
            onClick={() => handlePayment(project)}
            className="flex items-center font-medium hover:underline text-red-600 hover:text-red-800 transition-colors"
          >
            <FiCreditCard className="w-4 h-4 mr-1" />
            Need Payment
          </button>
        );
        
      case 'Failed':
        return (
          <button
            onClick={() => handleResubmitProject(project)}
            className="flex items-center font-medium hover:underline text-gray-600 hover:text-gray-800 transition-colors"
          >
            <FiRefreshCw className="w-4 h-4 mr-1" />
            Resubmit
          </button>
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

  // Helper function to get status color
  const getStatusColor = (project) => {
    const projectStatus = getProjectStatus(project);
    
    switch (projectStatus) {
      case 'In Progress':
        return '#6B7280'; // Gray color for drafts in progress
      case 'Review':
        return '#F59E0B'; // Orange for pending/review
      case 'Revise':
        return '#EF4444'; // Red for revision required
      case 'Approve':
        return '#8B5CF6'; // Purple for approved
      case 'Open':
        return '#10B981'; // Green for open tender
      case 'Locked':
        return '#F59E0B'; // Orange for locked tender
      case 'Negotiate':
        return '#8B5CF6'; // Purple for negotiation
      case 'Awarded':
        return '#EF4444'; // Red for payment needed
      case 'Failed':
        return '#6B7280'; // Gray for failed
      case 'Draft':
        return '#6B7280'; // Gray color for drafts
      case 'Menunggu Persetujuan':
      case 'Pending Approval':
      case 'Under Review':
        return '#F59E0B'; // Orange for pending/review
      case 'Active':
      case 'Open for Tender':
        return '#10B981'; // Green for active/open
      case 'Completed':
        return '#8B5CF6'; // Purple for completed
      case 'Rejected':
        return '#EF4444'; // Red for rejected
      case 'On Going':
        return '#2373FF'; // Blue for in progress
      default:
        return '#2373FF'; // Default blue
    }
  };

  const sortOptions = ['Recent', 'Oldest', 'A-Z', 'Z-A'];
  const filterOptions = ['All', 'In Progress', 'Completed', 'Pending'];

  // Filter projects based on internal project filter
  const getFilteredProjects = () => {
    // Use internal filter if set, otherwise use the prop from parent (for backward compatibility)
    const currentFilter = activeProjectFilter || activeProjectTab;
    
    if (!currentFilter || currentFilter === 'All') {
      return projects; // Show all projects when no specific filter is selected
    }
    
    return projects.filter(project => {
      switch (currentFilter) {
        case 'Draft':
          return project.status === 'Draft' || project.isDraft === true || project.moderationStatus === 'draft';
        case 'Tender':
          // Only show projects that are available for bidding (not awarded)
          return project.procurementMethod === 'Tender' && 
                 project.status !== 'awarded' && 
                 project.status !== 'Draft' && // Exclude drafts
                 project.isAvailableForBidding !== false &&
                 !project.selectedVendorId;
        case 'Contract':
          return project.procurementMethod === 'Contract' && project.status !== 'Draft';
        case 'Negotiation':
          return project.procurementMethod === 'Negotiation' && project.status !== 'Draft';
        case 'Penunjukan Langsung':
          return project.procurementMethod === 'Penunjukan Langsung' && project.status !== 'Draft';
        case 'Awarded':
          // Show projects that have been awarded to vendors
          return (project.status === 'awarded' || project.selectedVendorId) && project.status !== 'Draft';
        default:
          return true;
      }
    });
  };

  const filteredProjects = getFilteredProjects();

  // Get the current tab display name
  const getTabDisplayName = () => {
    const currentFilter = activeProjectFilter || activeProjectTab;
    if (!currentFilter || currentFilter === 'All') {
      return 'All Projects';
    }
    return `${currentFilter} Projects`;
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

  // Show project detail view
  if (showDetailsView && selectedProject) {
    return (
      <ProjectOwnerDetailPage
        project={selectedProject}
        onBack={handleBackToList}
        onEditProject={handleEditProject}
      />
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

      {/* Project Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto">
        {projectFilterTabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveProjectFilter(tab === 'All' ? null : tab)}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              (activeProjectFilter === tab) || (tab === 'All' && !activeProjectFilter)
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
            style={(activeProjectFilter === tab) || (tab === 'All' && !activeProjectFilter) ? { backgroundColor: '#2373FF' } : {}}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Projects List */}
      <div>
        
        {filteredProjects.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-300">
            <p className="text-gray-500">No projects found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredProjects.map((project) => (
              <div
                key={project.id}
                className="bg-white rounded-lg shadow-sm border border-gray-300 overflow-hidden hover:shadow-md transition-all duration-200 hover:-translate-y-1 min-h-[500px] flex flex-col"
              >
                <div className="p-6 flex-1 flex flex-col">
                  {/* Project ID */}
                  <div className="mb-3">
                    <p className="text-xs text-gray-500 mb-1">Project ID</p>
                    <p className="text-sm font-mono text-gray-800 font-medium">
                      {project.customId || `#${project.id}`}
                    </p>
                  </div>

                  {/* Project Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-black mb-1 truncate">
                        {project.title || project.projectTitle}
                      </h3>
                      <p className="text-sm text-gray-600 truncate">
                        {getCompanyName(project)} • {project.marketplace?.location?.city || project.city || 'Unknown Location'}
                      </p>
                    </div>
                    <div className="flex flex-col items-end space-y-2 flex-shrink-0 ml-3">
                      <span 
                        className="px-2 py-1 rounded-full text-xs font-medium text-white whitespace-nowrap"
                        style={{ backgroundColor: getStatusColor(project) }}
                      >
                        {getDisplayStatus(project)}
                      </span>
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 whitespace-nowrap">
                        {getProjectType(project.procurementMethod)}
                      </span>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-gray-600 mb-4 line-clamp-3 flex-shrink-0">
                    {project.specialNotes || project.description || `${project.projectType} project for ${project.propertyType || 'property'} in ${project.marketplace?.location?.city || project.city || 'Unknown Location'}`}
                  </p>

                  {/* Admin Notes - Show for projects that need revision */}
                  {getProjectStatus(project) === 'Revise' && project.adminNotes && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex-shrink-0">
                      <div className="flex items-start">
                        <div className="flex-shrink-0">
                          <svg className="w-4 h-4 text-red-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="ml-2">
                          <h4 className="text-sm font-medium text-red-800">Revision Required</h4>
                          <p className="text-sm text-red-700">{project.adminNotes}</p>
                        </div>
                      </div>
                    </div>
                  )}

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

                  {/* Project Details */}
                  <div className="mb-5 flex-1">
                    <h4 className="text-sm font-medium text-black mb-3">Project Details</h4>
                    <div className="space-y-3">
                      {/* Scope */}
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Scope</p>
                        <div className="flex flex-wrap gap-1">
                          {(project.projectScope || project.scope || []).length > 0 ? (
                            (project.projectScope || project.scope || []).slice(0, 2).map((scope, index) => (
                              <span 
                                key={index}
                                className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded border border-blue-200"
                              >
                                {scope}
                              </span>
                            ))
                          ) : (
                            <span className="text-xs text-gray-500">No scope specified</span>
                          )}
                          {(project.projectScope || project.scope || []).length > 2 && (
                            <span className="text-xs text-gray-500">
                              +{(project.projectScope || project.scope || []).length - 2} more
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Property Type */}
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Property Type</p>
                        <span className="px-2 py-1 bg-green-50 text-green-700 text-xs rounded border border-green-200">
                          {project.propertyType || 'Not specified'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Project Info */}
                  <div className="grid grid-cols-3 gap-4 mb-5 flex-shrink-0">
                    <div>
                      <p className="text-xs text-gray-500">Budget</p>
                      <p className="text-sm font-semibold text-black truncate">
                        {formatBudget(project.marketplace?.budget || project.estimatedBudget || project.budget)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Start Date</p>
                      <p className="text-sm font-semibold text-black truncate">
                        {project.startDate || project.estimatedStartDate || 'TBD'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Proposals</p>
                      <p className="text-sm font-semibold text-black truncate">
                        {project.proposals?.length || 0} received
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex space-x-3 flex-shrink-0">
                    {getActionButton(project)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Removed Enhanced Project Detail Modal - now using in-page view */}
    </div>
  );
}
