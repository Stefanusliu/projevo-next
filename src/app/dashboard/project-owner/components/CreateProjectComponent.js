'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../../../contexts/AuthContext';
import { collection, addDoc, updateDoc, doc, serverTimestamp, query, where, orderBy, getDocs } from 'firebase/firestore';
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
    budgetNotAvailable: false,
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
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingProjectId, setEditingProjectId] = useState(null);
  const [editingProjectData, setEditingProjectData] = useState(null);

  // Check for edit mode when component mounts
  useEffect(() => {
    const editProjectData = localStorage.getItem('editProject');
    if (editProjectData) {
      try {
        const projectData = JSON.parse(editProjectData);
        console.log('Loading project for editing:', projectData);
        
        setIsEditMode(true);
        setEditingProjectId(projectData.id);
        setEditingProjectData(projectData); // Store the original project data including revision feedback
        
        // Populate form with existing project data
        setFormData({
          projectTitle: projectData.title || projectData.projectTitle || '',
          province: projectData.province || '',
          city: projectData.city || projectData.marketplace?.location?.city || '',
          fullAddress: projectData.fullAddress || projectData.marketplace?.location?.fullAddress || '',
          projectType: projectData.projectType || '',
          procurementMethod: projectData.procurementMethod || '',
          projectScope: projectData.projectScope || projectData.scope || [],
          propertyType: projectData.propertyType || '',
          otherProperty: projectData.otherProperty || '',
          estimatedBudget: projectData.estimatedBudget || projectData.marketplace?.budget || projectData.budget || '',
          budgetNotAvailable: (projectData.estimatedBudget || projectData.marketplace?.budget || projectData.budget) === '0',
          estimatedDuration: projectData.estimatedDuration || projectData.duration || '',
          tenderDuration: projectData.tenderDuration || '',
          estimatedStartDate: projectData.estimatedStartDate || projectData.startDate || '',
          supportingDocuments: projectData.supportingDocuments || [],
          boqDocuments: projectData.boqDocuments || [],
          drawingDocuments: projectData.drawingDocuments || [],
          documentTitles: projectData.documentTitles || {},
          selectedBOQ: projectData.selectedBOQ || null,
          boqData: projectData.attachedBOQ || projectData.boqData || null,
          specialNotes: projectData.specialNotes || projectData.description || '',
          agreementTerms: true, // Always true for existing projects
          agreementData: true,
          agreementValidation: true
        });
        
        // Set BOQ data if available
        if (projectData.attachedBOQ || projectData.boqData) {
          setSelectedBOQ(projectData.attachedBOQ || projectData.boqData);
        }
        
        // Clear localStorage after loading
        localStorage.removeItem('editProject');
      } catch (error) {
        console.error('Error loading edit project data:', error);
        localStorage.removeItem('editProject');
      }
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

  // Handle budget input with automatic formatting
  const handleBudgetChange = (value) => {
    // If budget is not available, don't update
    if (formData.budgetNotAvailable) return;
    
    // Remove any non-digit characters except commas
    const cleanValue = value.replace(/[^\d,]/g, '');
    // Remove existing commas to get pure number
    const numberOnly = cleanValue.replace(/,/g, '');
    
    // Update the form data with clean number
    setFormData(prev => ({ ...prev, estimatedBudget: numberOnly }));
  };

  // Handle budget not available checkbox
  const handleBudgetNotAvailableChange = (checked) => {
    setFormData(prev => ({
      ...prev,
      budgetNotAvailable: checked,
      estimatedBudget: checked ? '0' : prev.estimatedBudget
    }));
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

  // Helper function to render field revision comment
  const renderFieldRevisionComment = (fieldKey) => {
    if (!isEditMode || !editingProjectData?.fieldRevisions || !editingProjectData.fieldRevisions[fieldKey]) {
      return null;
    }

    return (
      <div className="mt-2 bg-red-50 border border-red-200 rounded-lg p-3">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <svg className="w-4 h-4 text-red-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-2 flex-1">
            <p className="text-sm font-medium text-red-800">Admin Comment:</p>
            <p className="text-sm text-red-700 mt-1">{editingProjectData.fieldRevisions[fieldKey]}</p>
          </div>
        </div>
      </div>
    );
  };

  const handleStepChange = (step) => {
    setCurrentStep(step);
  };

  const saveDraft = async () => {
    if (!user?.uid) {
      alert('Silakan masuk untuk menyimpan draft');
      return;
    }

    // Basic validation - at least project title should be filled
    if (!formData.projectTitle) {
      alert('Silakan masukkan judul proyek sebelum menyimpan sebagai draft');
      return;
    }

    setLoading(true);
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
          budget: formData.budgetNotAvailable ? '0' : formData.estimatedBudget,
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
        console.log('Attaching BOQ to draft:', selectedBOQ);
        draftData.attachedBOQ = {
          id: selectedBOQ.id,
          title: selectedBOQ.title,
          tahapanKerja: selectedBOQ.tahapanKerja,
          createdAt: selectedBOQ.createdAt,
          updatedAt: selectedBOQ.updatedAt,
          attachedAt: new Date().toISOString()
        };
      }

      const docRef = await addDoc(collection(db, 'projects'), draftData);
      console.log('Draft saved with Firestore ID:', docRef.id, 'Custom ID:', customProjectId);
      console.log('Full draft data saved:', draftData);
      
      alert(`Draft berhasil disimpan! ID draft Anda adalah: ${customProjectId}. Anda dapat melanjutkan mengedit proyek ini nanti.`);
      
      // Optional: Clear the form or go back to dashboard
      // onBack();
    } catch (error) {
      console.error('Error saving draft:', error);
      alert('Gagal menyimpan draft. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!user?.uid) {
      alert('Silakan masuk untuk membuat proyek');
      return;
    }

    // Validation
    if (!formData.projectTitle || !formData.province || !formData.city || !formData.fullAddress ||
        !formData.projectType || !formData.procurementMethod || !formData.propertyType ||
        (!formData.budgetNotAvailable && !formData.estimatedBudget) || !formData.estimatedDuration || !formData.tenderDuration ||
        !formData.estimatedStartDate || formData.projectScope.length === 0) {
      alert('Silakan lengkapi semua field yang wajib diisi');
      return;
    }

    // Check required agreements
    if (!formData.agreementTerms || !formData.agreementData || !formData.agreementValidation) {
      alert('Silakan setujui semua persetujuan yang diperlukan untuk melanjutkan');
      return;
    }

    setLoading(true);
    try {
      let customProjectId;
      
      // Only generate new ID for new projects
      if (!isEditMode) {
        console.log('About to generate custom project ID for project type:', formData.projectType);
        customProjectId = await generateProjectId(formData.projectType);
        console.log('Generated custom project ID:', customProjectId);
      }

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
        updatedAt: serverTimestamp(),
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
          budget: formData.budgetNotAvailable ? '0' : formData.estimatedBudget,
          duration: formData.estimatedDuration,
          location: {
            province: formData.province,
            city: formData.city,
            fullAddress: formData.fullAddress
          }
        }
      };

      // Add custom ID only for new projects
      if (!isEditMode) {
        projectData.customId = customProjectId;
        projectData.createdAt = serverTimestamp();
        projectData.submittedAt = serverTimestamp();
      }

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

      if (isEditMode && editingProjectId) {
        // Update existing project
        await updateDoc(doc(db, 'projects', editingProjectId), projectData);
        console.log('Project updated with ID:', editingProjectId);
        console.log('Updated project data:', projectData);
        
        alert('Proyek berhasil diperbarui! Perubahan Anda telah disimpan dan proyek sedang menunggu persetujuan.');
      } else {
        // Create new project
        const docRef = await addDoc(collection(db, 'projects'), projectData);
        console.log('Project created with Firestore ID:', docRef.id, 'Custom ID:', customProjectId);
        console.log('Full project data saved:', projectData);
        
        alert(`Proyek berhasil disubmit! ID proyek Anda adalah: ${customProjectId}. Proyek Anda sekarang sedang menunggu persetujuan dan akan tersedia di marketplace setelah disetujui.`);
      }
      
      onBack();
    } catch (error) {
      console.error(isEditMode ? 'Error updating project:' : 'Error creating project:', error);
      alert(isEditMode ? 'Gagal memperbarui proyek. Silakan coba lagi.' : 'Gagal membuat proyek. Silakan coba lagi.');
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
            Kembali ke Proyek
          </button>
          <div className="h-6 w-px bg-gray-300"></div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isEditMode ? 'Edit Proyek' : 'Buat Proyek Baru'}
          </h1>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={saveDraft}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
          >
            Simpan sebagai Draft
          </button>
        </div>
      </div>

      {/* Revision Feedback Display */}
      {isEditMode && (
        <div>
          {/* Overall Revision Feedback */}
          {editingProjectData?.overallRevision && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="w-5 h-5 text-red-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3 flex-1">
                  <h3 className="text-sm font-medium text-red-800">
                    Admin meminta revisi pada dokumentasi proyek ini
                  </h3>
                  <div className="mt-2 text-sm text-red-700">
                    <p className="font-medium">Catatan Keseluruhan:</p>
                    <p className="mt-1 bg-white/50 p-2 rounded border border-red-200">{editingProjectData.overallRevision}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Legacy Admin Notes */}
          {editingProjectData?.adminNotes && !editingProjectData?.overallRevision && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="w-5 h-5 text-red-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3 flex-1">
                  <h3 className="text-sm font-medium text-red-800">
                    Admin meminta revisi pada proyek ini
                  </h3>
                  <div className="mt-2 text-sm text-red-700">
                    <p className="bg-white/50 p-2 rounded border border-red-200">{editingProjectData.adminNotes}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

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
              {renderFieldRevisionComment('judulProyek')}
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
                {renderFieldRevisionComment('lokasiProyek')}
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
                Ini adalah pertanyaan wajib
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
              {renderFieldRevisionComment('jenisProyek')}
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
              {renderFieldRevisionComment('ruangLingkup')}
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
              {renderFieldRevisionComment('properti')}
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
                  value={formData.budgetNotAvailable ? '0' : getFormattedBudget()}
                  onChange={(e) => handleBudgetChange(e.target.value)}
                  className={`w-full pl-12 pr-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    formData.budgetNotAvailable ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'
                  }`}
                  placeholder="50,000,000"
                  required={!formData.budgetNotAvailable}
                  disabled={formData.budgetNotAvailable}
                />
              </div>
              <div className="flex items-center mt-2">
                <input
                  type="checkbox"
                  id="budgetNotAvailable"
                  checked={formData.budgetNotAvailable}
                  onChange={(e) => handleBudgetNotAvailableChange(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="budgetNotAvailable" className="ml-2 text-sm text-gray-700">
                  Belum ada
                </label>
              </div>
              <p className="text-xs text-gray-400 mt-1">
                Contoh: 50,000,000 (untuk Rp 50.000.000)
              </p>
              {renderFieldRevisionComment('estimasiAnggaran')}
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
              {renderFieldRevisionComment('estimasiDurasi')}
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
              {renderFieldRevisionComment('durasiTender')}
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
              {renderFieldRevisionComment('estimasiMulai')}
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
              {renderFieldRevisionComment('metodePengadaan')}
            </div>
          </div>

          {/* BOQ Attachment Section */}
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-900 border-b border-gray-200 pb-2">
              Lampiran BOQ (Opsional)
            </h3>
            <p className="text-sm text-gray-600">
              Lampirkan Bill of Quantities (BOQ) untuk memberikan spesifikasi proyek yang detail dan estimasi biaya kepada vendor. 
              BOQ yang dibuat di BOQ Studio akan tersedia untuk dipilih di sini.
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
                  Buat BOQ Baru
                </a>
                <button
                  type="button"
                  onClick={() => setShowBOQSelector(true)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  {selectedBOQ ? 'Ubah BOQ' : 'Lampirkan BOQ'}
                </button>
              </div>
            </div>
            
            {selectedBOQ ? (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-green-800">
                      BOQ Terlampir: <span className="font-bold">{selectedBOQ.title || 'BOQ Tanpa Judul'}</span>
                    </p>
                    <div className="flex items-center space-x-4 text-xs text-green-600 mt-1">
                      <span>{selectedBOQ.tahapanKerja?.length || 0} tahapan kerja</span>
                      {selectedBOQ.createdAt && (
                        <span>Dibuat: {new Date(selectedBOQ.createdAt).toLocaleDateString('id-ID')}</span>
                      )}
                    </div>
                    {selectedBOQ.updatedAt && selectedBOQ.updatedAt !== selectedBOQ.createdAt && (
                      <p className="text-xs text-green-500 mt-1">
                        Terakhir diperbarui: {new Date(selectedBOQ.updatedAt).toLocaleDateString('id-ID')}
                      </p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedBOQ(null)}
                    className="text-green-600 hover:text-green-800 transition-colors ml-4"
                    title="Hapus BOQ"
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
                  Tidak ada BOQ terlampir. Anda dapat melampirkan BOQ tersimpan dari BOQ Studio ke proyek ini.
                </p>
              </div>
            )}
          </div>

          {/* Special Notes Section */}
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-900 border-b border-gray-200 pb-2">
              Catatan Khusus (Opsional)
            </h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Kebutuhan atau Catatan Tambahan
              </label>
              <textarea
                value={formData.specialNotes}
                onChange={(e) => handleInputChange('specialNotes', e.target.value)}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Masukkan kebutuhan khusus, catatan, atau informasi tambahan untuk vendor"
              />
              {renderFieldRevisionComment('specialNotes')}
            </div>
          </div>

          {/* Agreements Section */}
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-900 border-b border-gray-200 pb-2">
              Syarat dan Persetujuan *
            </h3>
            <p className="text-sm text-gray-600">
              Silakan tinjau dan setujui persetujuan berikut untuk melanjutkan pengiriman proyek:
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
                    Saya setuju dengan Syarat Layanan dan Panduan Proyek
                  </label>
                  <p className="text-xs text-gray-600 mt-1">
                    Dengan mencentang kotak ini, Anda setuju untuk mematuhi syarat layanan Projevo, panduan proyek, dan memahami tanggung jawab sebagai pemilik proyek.
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
                    Saya menyetujui pemrosesan data dan pencantuman di marketplace
                  </label>
                  <p className="text-xs text-gray-600 mt-1">
                    Anda menyetujui pemrosesan data proyek Anda dan setuju untuk proyek Anda dicantumkan di marketplace setelah disetujui.
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
                    Saya mengonfirmasi bahwa semua informasi yang diberikan akurat dan lengkap
                  </label>
                  <p className="text-xs text-gray-600 mt-1">
                    Anda mengonfirmasi bahwa semua informasi proyek, kebutuhan, dan spesifikasi yang diberikan akurat, lengkap, dan sesuai pengetahuan terbaik Anda.
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
                  <p className="font-medium">Proses Moderasi</p>
                  <p className="mt-1">
                    Proyek Anda akan disubmit untuk ditinjau dan disetujui. Setelah disetujui oleh tim kami, 
                    proyek akan dipublikasikan di marketplace dan vendor akan dapat mengirimkan proposal.
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
                  <span>Mengirim untuk Persetujuan...</span>
                </div>
              ) : (
                'Kirim Proyek untuk Persetujuan'
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
