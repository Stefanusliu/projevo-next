'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useAuth } from '../../../../contexts/AuthContext';
import { db, storage } from '../../../../lib/firebase';
import { doc, getDoc, setDoc, updateDoc, collection, getDocs, addDoc, deleteDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export default function PortfolioComponent() {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [showCompanyModal, setShowCompanyModal] = useState(false);
  const [loading, setLoading] = useState(true);

  // Company data state
  const [companyData, setCompanyData] = useState({
    companyName: '',
    establishedYear: '',
    logoUrl: ''
  });

  // Portfolio items from Firebase
  const [portfolioItems, setPortfolioItems] = useState([]);

  // Form states
  const [newProject, setNewProject] = useState({
    title: '',
    description: '',
    image: '',
    category: '',
    client: '',
    completedDate: '',
    budget: '',
    duration: ''
  });

  // Upload states
  const [logoUploading, setLogoUploading] = useState(false);
  const [projectImageUploading, setProjectImageUploading] = useState(false);
  const [selectedImageFile, setSelectedImageFile] = useState(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState('');
  
  // File states for pending uploads
  const [selectedProjectImage, setSelectedProjectImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');

  // Helper function to format budget with Rp and thousand separators
  const formatBudget = (value) => {
    if (!value) return '';
    // Remove non-numeric characters except for digits
    const numericValue = value.toString().replace(/[^\d]/g, '');
    if (!numericValue) return '';
    // Add thousand separators
    const formatted = parseInt(numericValue).toLocaleString('id-ID');
    return `Rp ${formatted}`;
  };

  // Helper function to parse budget input (remove Rp and separators)
  const parseBudgetInput = (value) => {
    return value.replace(/[^\d]/g, '');
  };

  // Load data from Firebase
  useEffect(() => {
    const loadCompanyData = async () => {
      try {
        // Get user data for company name
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          
          // Get company portfolio data
          const companyDoc = await getDoc(doc(db, 'vendorProfiles', user.uid));
          if (companyDoc.exists()) {
            const companyInfo = companyDoc.data();
            setCompanyData({
              companyName: userData.companyName || userData.name || 'Your Company',
              establishedYear: companyInfo.establishedYear || '',
              logoUrl: companyInfo.logoUrl || ''
            });
          } else {
            // Initialize company data if not exists
            setCompanyData({
              companyName: userData.companyName || userData.name || 'Your Company',
              establishedYear: '',
              logoUrl: ''
            });
          }
        }
      } catch (error) {
        console.error('Error loading company data:', error);
      } finally {
        setLoading(false);
      }
    };

    const loadPortfolioItems = async () => {
      try {
        const portfolioRef = collection(db, 'vendorProfiles', user.uid, 'portfolio');
        const snapshot = await getDocs(portfolioRef);
        const items = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setPortfolioItems(items);
      } catch (error) {
        console.error('Error loading portfolio items:', error);
      }
    };

    if (user) {
      loadCompanyData();
      loadPortfolioItems();
    }
  }, [user]);

  const saveCompanyData = async (data) => {
    try {
      await setDoc(doc(db, 'vendorProfiles', user.uid), data, { merge: true });
      setCompanyData(data);
      setShowCompanyModal(false);
    } catch (error) {
      console.error('Error saving company data:', error);
    }
  };

  const uploadImage = async (file, path) => {
    const storageRef = ref(storage, `${path}/${user.uid}/${file.name}_${Date.now()}`);
    const snapshot = await uploadBytes(storageRef, file);
    return await getDownloadURL(snapshot.ref);
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLogoUploading(true);
    try {
      const logoUrl = await uploadImage(file, 'company-logos');
      const updatedData = { ...companyData, logoUrl };
      await saveCompanyData(updatedData);
    } catch (error) {
      console.error('Error uploading logo:', error);
    } finally {
      setLogoUploading(false);
    }
  };

  // Handle image selection (without uploading)
  const handleProjectImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImageFile(file);
      // Create preview URL for immediate display
      const previewUrl = URL.createObjectURL(file);
      setImagePreviewUrl(previewUrl);
    }
  };

  // Upload image to Firebase Storage (called only when adding project)
  const uploadProjectImage = async (file) => {
    if (!file) return null;
    
    try {
      const imageUrl = await uploadImage(file, 'portfolio-images');
      return imageUrl;
    } catch (error) {
      console.error('Error uploading project image:', error);
      throw error;
    }
  };

  const handleAddProject = async () => {
    if (newProject.title && newProject.description) {
      setProjectImageUploading(true);
      try {
        let imageUrl = newProject.image;
        
        // Upload image if a new file was selected
        if (selectedImageFile) {
          imageUrl = await uploadProjectImage(selectedImageFile);
        }
        
        const projectData = {
          ...newProject,
          image: imageUrl || '/api/placeholder/400/300',
          createdAt: new Date()
        };
        
        const portfolioRef = collection(db, 'vendorProfiles', user.uid, 'portfolio');
        const docRef = await addDoc(portfolioRef, projectData);
        
        const newItem = {
          id: docRef.id,
          ...projectData
        };
        
        setPortfolioItems([...portfolioItems, newItem]);
        resetForm();
      } catch (error) {
        console.error('Error adding project:', error);
        alert('Failed to add project. Please try again.');
      } finally {
        setProjectImageUploading(false);
      }
    }
  };

  const handleEditProject = (project) => {
    setEditingProject(project);
    setNewProject(project);
    // Clear any selected file and preview when editing existing project
    setSelectedImageFile(null);
    setImagePreviewUrl('');
    setShowAddModal(true);
  };

  const handleUpdateProject = async () => {
    if (editingProject) {
      setProjectImageUploading(true);
      try {
        let imageUrl = newProject.image;
        
        // Upload new image if a file was selected
        if (selectedImageFile) {
          imageUrl = await uploadProjectImage(selectedImageFile);
        }
        
        const updatedData = {
          ...newProject,
          image: imageUrl || '/api/placeholder/400/300'
        };
        
        const projectRef = doc(db, 'vendorProfiles', user.uid, 'portfolio', editingProject.id);
        await updateDoc(projectRef, updatedData);
        
        setPortfolioItems(portfolioItems.map(item => 
          item.id === editingProject.id ? { ...updatedData, id: editingProject.id } : item
        ));
        
        resetForm();
      } catch (error) {
        console.error('Error updating project:', error);
        alert('Failed to update project. Please try again.');
      } finally {
        setProjectImageUploading(false);
      }
    }
  };

  const handleDeleteProject = async (id) => {
    try {
      await deleteDoc(doc(db, 'vendorProfiles', user.uid, 'portfolio', id));
      setPortfolioItems(portfolioItems.filter(item => item.id !== id));
    } catch (error) {
      console.error('Error deleting project:', error);
    }
  };

  const resetForm = () => {
    setEditingProject(null);
    setNewProject({
      title: '',
      description: '',
      image: '',
      category: '',
      client: '',
      completedDate: '',
      budget: '',
      duration: ''
    });
    setSelectedImageFile(null);
    setImagePreviewUrl('');
    setShowAddModal(false);
  };

  // Cleanup preview URLs to prevent memory leaks
  useEffect(() => {
    return () => {
      if (imagePreviewUrl) {
        URL.revokeObjectURL(imagePreviewUrl);
      }
    };
  }, [imagePreviewUrl]);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200">
      {/* Header with Company Info and Edit Button */}
      <div className="p-6 border-b border-slate-200">
        <div className="flex justify-between items-start">
          {/* Company Info - Left Top */}
          <div className="flex items-center space-x-4">
            <div className="relative">
              {companyData.logoUrl ? (
                <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-slate-200">
                  <Image 
                    src={companyData.logoUrl} 
                    alt="Company Logo"
                    width={64}
                    height={64}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-xl">
                    {companyData.companyName.charAt(0)}
                  </span>
                </div>
              )}
              {isEditing && (
                <button
                  onClick={() => document.getElementById('logo-upload').click()}
                  className="absolute -bottom-1 -right-1 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white hover:bg-blue-700"
                  disabled={logoUploading}
                >
                  {logoUploading ? (
                    <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  )}
                </button>
              )}
              <input
                id="logo-upload"
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                className="hidden"
              />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-2xl font-bold text-slate-900">{companyData.companyName}</h1>
                {isEditing && (
                  <button
                    onClick={() => setShowCompanyModal(true)}
                    className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                )}
              </div>
              <p className="text-slate-600">
                {companyData.establishedYear ? `Est. ${companyData.establishedYear}` : 'Click edit to add establishment year'}
              </p>
            </div>
          </div>

          {/* Edit Button - Top Right */}
          <button
            onClick={() => setIsEditing(!isEditing)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              isEditing 
                ? 'bg-slate-600 text-white hover:bg-slate-700' 
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {isEditing ? 'Done Editing' : 'Edit Portfolio'}
          </button>
        </div>
      </div>

      {/* Portfolio Content */}
      <div className="p-6">
        {loading ? (
          <div className="text-center py-12">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-600">Loading portfolio...</p>
          </div>
        ) : (
          <>
            {/* Add New Project Button (only visible when editing) */}
            {isEditing && (
              <div className="mb-6">
                <button
                  onClick={() => setShowAddModal(true)}
                  className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Add New Project
                </button>
              </div>
            )}

            {/* Grid and Empty State sections remain the same */}
            {/* Portfolio Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {portfolioItems.map((project) => (
                <div key={project.id} className="bg-slate-50 rounded-lg overflow-hidden border border-slate-200 hover:shadow-md transition-shadow">
                  {/* Project Image */}
                  <div className="relative">
                    <Image 
                      src={project.image} 
                      alt={project.title}
                      width={400}
                      height={192}
                      className="w-full h-48 object-cover"
                    />
                    {/* Edit/Delete buttons (only visible when editing) */}
                    {isEditing && (
                      <div className="absolute top-2 right-2 flex space-x-2">
                        <button
                          onClick={() => handleEditProject(project)}
                          className="p-1 bg-white rounded shadow-md hover:bg-slate-50"
                        >
                          <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDeleteProject(project.id)}
                          className="p-1 bg-white rounded shadow-md hover:bg-slate-50"
                        >
                          <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Project Info */}
                  <div className="p-4">
                    <div className="mb-2">
                      <span className="inline-block px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">
                        {project.category}
                      </span>
                    </div>
                    
                    <h3 className="font-semibold text-slate-900 mb-2 line-clamp-1">
                      {project.title}
                    </h3>
                    
                    <p className="text-sm text-slate-600 mb-3 line-clamp-2">
                      {project.description}
                    </p>

                    <div className="space-y-2 text-xs text-slate-500">
                      <div className="flex justify-between">
                        <span>Client:</span>
                        <span className="font-medium">{project.client}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Budget:</span>
                        <span className="font-medium">
                          {project.budget && project.budget.trim() !== '' 
                            ? (project.budget.startsWith('Rp') 
                                ? project.budget 
                                : `Rp ${parseInt(project.budget.replace(/\D/g, '')).toLocaleString('id-ID')}`)
                            : 'Not specified'
                          }
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Duration:</span>
                        <span className="font-medium">{project.duration}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Completed:</span>
                        <span className="font-medium">{new Date(project.completedDate).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Empty State */}
            {portfolioItems.length === 0 && (
              <div className="text-center py-12">
                <svg className="w-16 h-16 text-slate-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                <h3 className="text-lg font-medium text-slate-900 mb-2">No projects yet</h3>
                <p className="text-slate-600 mb-4">Start building your portfolio by adding your first project.</p>
                {isEditing && (
                  <button
                    onClick={() => setShowAddModal(true)}
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Add Your First Project
                  </button>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Company Info Modal */}
      {showCompanyModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="p-6 border-b border-slate-200">
              <h2 className="text-xl font-bold text-slate-900">Edit Company Info</h2>
            </div>
            
            <div className="p-6">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Company Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={companyData.companyName}
                    onChange={(e) => setCompanyData({...companyData, companyName: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
                    placeholder="Enter company name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Established Year
                  </label>
                  <input
                    type="number"
                    min="1900"
                    max={new Date().getFullYear()}
                    value={companyData.establishedYear}
                    onChange={(e) => setCompanyData({...companyData, establishedYear: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
                    placeholder="e.g., 2000"
                  />
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-slate-200 flex justify-end space-x-4">
              <button
                onClick={() => setShowCompanyModal(false)}
                className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => saveCompanyData(companyData)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Project Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200">
              <h2 className="text-xl font-bold text-slate-900">
                {editingProject ? 'Edit Project' : 'Add New Project'}
              </h2>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Project Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={newProject.title}
                    onChange={(e) => setNewProject({...newProject, title: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
                    placeholder="Enter project title"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Category
                  </label>
                  <select
                    value={newProject.category}
                    onChange={(e) => setNewProject({...newProject, category: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
                  >
                    <option value="">Select category</option>
                    <option value="Interior Design">Interior Design</option>
                    <option value="Construction">Construction</option>
                    <option value="Renovation">Renovation</option>
                    <option value="Architecture">Architecture</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={newProject.description}
                  onChange={(e) => setNewProject({...newProject, description: e.target.value})}
                  rows={3}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none resize-none"
                  placeholder="Describe the project..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Project Image
                </label>
                <div className="space-y-3">
                  <div className="flex items-center space-x-4">
                    <button
                      type="button"
                      onClick={() => document.getElementById('project-image-upload').click()}
                      disabled={projectImageUploading}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center space-x-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      <span>{projectImageUploading ? 'Uploading...' : 'Upload Image'}</span>
                    </button>
                    <input
                      id="project-image-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleProjectImageSelect}
                      className="hidden"
                    />
                    <span className="text-sm text-slate-500">Or enter URL below</span>
                  </div>
                  <input
                    type="url"
                    value={selectedImageFile ? '' : newProject.image}
                    onChange={(e) => setNewProject({...newProject, image: e.target.value})}
                    disabled={selectedImageFile}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none disabled:bg-slate-100"
                    placeholder="https://example.com/image.jpg"
                  />
                  {(imagePreviewUrl || newProject.image) && (
                    <div className="mt-3">
                      <div className="flex items-center space-x-3">
                        <Image 
                          src={imagePreviewUrl || newProject.image} 
                          alt="Preview" 
                          width={128}
                          height={96}
                          className="w-32 h-24 object-cover rounded-lg border border-slate-200 shadow-sm"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedImageFile(null);
                            setImagePreviewUrl('');
                            setNewProject({...newProject, image: ''});
                          }}
                          className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          Remove
                        </button>
                      </div>
                      {selectedImageFile && (
                        <p className="text-sm text-slate-500 mt-2">
                          Selected: {selectedImageFile.name} (will upload when project is added)
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Client
                  </label>
                  <input
                    type="text"
                    value={newProject.client}
                    onChange={(e) => setNewProject({...newProject, client: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
                    placeholder="Client name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Completion Date
                  </label>
                  <input
                    type="date"
                    value={newProject.completedDate}
                    onChange={(e) => setNewProject({...newProject, completedDate: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Budget
                  </label>
                  <input
                    type="text"
                    value={formatBudget(newProject.budget)}
                    onChange={(e) => {
                      const rawValue = parseBudgetInput(e.target.value);
                      setNewProject({...newProject, budget: rawValue});
                    }}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
                    placeholder="e.g., Rp 500,000,000"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Duration
                  </label>
                  <input
                    type="text"
                    value={newProject.duration}
                    onChange={(e) => setNewProject({...newProject, duration: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
                    placeholder="e.g., 3 months"
                  />
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-slate-200 flex justify-end space-x-4">
              <button
                onClick={resetForm}
                className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={editingProject ? handleUpdateProject : handleAddProject}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {editingProject ? 'Update Project' : 'Add Project'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
