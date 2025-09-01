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

  // Form states - Updated: changed to support multiple images and videos
  const [newProject, setNewProject] = useState({
    title: '',
    description: '',
    images: [],
    videos: [],
    category: '',
    client: '',
    completedYear: '',
    duration: ''
  });

  // Upload states - Updated: support multiple files
  const [logoUploading, setLogoUploading] = useState(false);
  const [projectImageUploading, setProjectImageUploading] = useState(false);
  const [projectVideoUploading, setProjectVideoUploading] = useState(false);
  const [selectedImageFiles, setSelectedImageFiles] = useState([]);
  const [selectedVideoFiles, setSelectedVideoFiles] = useState([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState([]);
  const [videoPreviewUrls, setVideoPreviewUrls] = useState([]);
  
  // File states for pending uploads
  const [selectedProjectImage, setSelectedProjectImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');

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

  // Simplified logo handling - using letter-based avatars for now
  const handleLogoUpload = async (e) => {
    // Logo upload disabled - using letter-based avatars
    console.log('Logo upload feature temporarily disabled - using letter-based avatars');
  };

  // Handle multiple image selection
  const handleProjectImageSelect = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      setSelectedImageFiles([...selectedImageFiles, ...files]);
      // Create preview URLs for immediate display
      const newPreviewUrls = files.map(file => URL.createObjectURL(file));
      setImagePreviewUrls([...imagePreviewUrls, ...newPreviewUrls]);
    }
  };

  // Handle multiple video selection
  const handleProjectVideoSelect = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      setSelectedVideoFiles([...selectedVideoFiles, ...files]);
      // Create preview URLs for immediate display
      const newPreviewUrls = files.map(file => URL.createObjectURL(file));
      setVideoPreviewUrls([...videoPreviewUrls, ...newPreviewUrls]);
    }
  };

  // Remove individual image
  const removeImage = (index) => {
    const newImageFiles = selectedImageFiles.filter((_, i) => i !== index);
    const newImagePreviews = imagePreviewUrls.filter((_, i) => i !== index);
    const newProjectImages = newProject.images.filter((_, i) => i !== index);
    
    setSelectedImageFiles(newImageFiles);
    setImagePreviewUrls(newImagePreviews);
    setNewProject({...newProject, images: newProjectImages});
  };

  // Remove individual video
  const removeVideo = (index) => {
    const newVideoFiles = selectedVideoFiles.filter((_, i) => i !== index);
    const newVideoPreviews = videoPreviewUrls.filter((_, i) => i !== index);
    const newProjectVideos = newProject.videos.filter((_, i) => i !== index);
    
    setSelectedVideoFiles(newVideoFiles);
    setVideoPreviewUrls(newVideoPreviews);
    setNewProject({...newProject, videos: newProjectVideos});
  };

  // Upload multiple images to Firebase Storage
  const uploadProjectImages = async (files) => {
    if (!files || files.length === 0) return [];
    
    try {
      const uploadPromises = files.map(file => uploadImage(file, 'portfolio-images'));
      const imageUrls = await Promise.all(uploadPromises);
      return imageUrls;
    } catch (error) {
      console.error('Error uploading project images:', error);
      throw error;
    }
  };

  // Upload multiple videos to Firebase Storage
  const uploadProjectVideos = async (files) => {
    if (!files || files.length === 0) return [];
    
    try {
      const uploadPromises = files.map(file => uploadImage(file, 'portfolio-videos'));
      const videoUrls = await Promise.all(uploadPromises);
      return videoUrls;
    } catch (error) {
      console.error('Error uploading project videos:', error);
      throw error;
    }
  };

  // Updated: Handle multiple images and videos upload
  const handleAddProject = async () => {
    if (newProject.title && newProject.description) {
      setProjectImageUploading(true);
      setProjectVideoUploading(true);
      try {
        let imageUrls = [...newProject.images];
        let videoUrls = [...newProject.videos];
        
        // Upload new images if files were selected
        if (selectedImageFiles.length > 0) {
          const newImageUrls = await uploadProjectImages(selectedImageFiles);
          imageUrls = [...imageUrls, ...newImageUrls];
        }
        
        // Upload new videos if files were selected
        if (selectedVideoFiles.length > 0) {
          const newVideoUrls = await uploadProjectVideos(selectedVideoFiles);
          videoUrls = [...videoUrls, ...newVideoUrls];
        }
        
        const projectData = {
          ...newProject,
          images: imageUrls.length > 0 ? imageUrls : ['/api/placeholder/400/300'],
          videos: videoUrls,
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
        setProjectVideoUploading(false);
      }
    }
  };

  const handleUpdateProject = async () => {
    if (editingProject && newProject.title && newProject.description) {
      setProjectImageUploading(true);
      setProjectVideoUploading(true);
      try {
        let imageUrls = [...newProject.images];
        let videoUrls = [...newProject.videos];
        
        // Upload new images if selected
        if (selectedImageFiles.length > 0) {
          const newImageUrls = await uploadProjectImages(selectedImageFiles);
          imageUrls = [...imageUrls, ...newImageUrls];
        }
        
        // Upload new videos if selected
        if (selectedVideoFiles.length > 0) {
          const newVideoUrls = await uploadProjectVideos(selectedVideoFiles);
          videoUrls = [...videoUrls, ...newVideoUrls];
        }
        
        const updatedData = {
          ...newProject,
          images: imageUrls,
          videos: videoUrls,
          updatedAt: new Date()
        };
        
        const projectRef = doc(db, 'vendorProfiles', user.uid, 'portfolio', editingProject.id);
        await updateDoc(projectRef, updatedData);
        
        // Update local state
        setPortfolioItems(portfolioItems.map(item => 
          item.id === editingProject.id 
            ? { ...item, ...updatedData }
            : item
        ));
        
        resetForm();
      } catch (error) {
        console.error('Error updating project:', error);
        alert('Failed to update project. Please try again.');
      } finally {
        setProjectImageUploading(false);
        setProjectVideoUploading(false);
      }
    }
  };

  const handleEditProject = (project) => {
    setEditingProject(project);
    setNewProject({
      title: project.title || '',
      description: project.description || '',
      images: project.images || (project.image ? [project.image] : []),
      videos: project.videos || (project.video ? [project.video] : []),
      category: project.category || '',
      client: project.client || '',
      completedYear: project.completedYear || (project.completedDate ? new Date(project.completedDate).getFullYear().toString() : ''),
      duration: project.duration || ''
    });
    setShowAddModal(true);
  };

  const handleDeleteProject = async (projectId) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      try {
        await deleteDoc(doc(db, 'vendorProfiles', user.uid, 'portfolio', projectId));
        setPortfolioItems(portfolioItems.filter(item => item.id !== projectId));
      } catch (error) {
        console.error('Error deleting project:', error);
        alert('Failed to delete project. Please try again.');
      }
    }
  };

  // Updated: Reset form with new field structure for multiple files
  const resetForm = () => {
    setEditingProject(null);
    setNewProject({
      title: '',
      description: '',
      images: [],
      videos: [],
      category: '',
      client: '',
      completedYear: '',
      duration: ''
    });
    setSelectedImageFiles([]);
    setSelectedVideoFiles([]);
    setImagePreviewUrls([]);
    setVideoPreviewUrls([]);
    setShowAddModal(false);
  };

  // Cleanup preview URLs to prevent memory leaks
  useEffect(() => {
    return () => {
      imagePreviewUrls.forEach(url => {
        if (url) URL.revokeObjectURL(url);
      });
      videoPreviewUrls.forEach(url => {
        if (url) URL.revokeObjectURL(url);
      });
    };
  }, [imagePreviewUrls, videoPreviewUrls]);

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-slate-600">Please log in to view your portfolio.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200">
      {/* Header */}
      <div className="border-b border-slate-200 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                {companyData.companyName ? companyData.companyName.charAt(0).toUpperCase() : 'C'}
              </div>
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

          {/* Action Buttons - Top Right - UPDATED: Added "Add Portfolio" button */}
          <div className="flex space-x-3">
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 rounded-lg font-medium transition-colors bg-green-600 text-white hover:bg-green-700"
            >
              Add Portfolio
            </button>
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

            {/* Portfolio Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {portfolioItems.map((project) => (
                <div key={project.id} className="bg-slate-50 rounded-lg overflow-hidden border border-slate-200 hover:shadow-md transition-shadow">
                  {/* Project Image */}
                  <div className="relative">
                    <Image 
                      src={project.images?.[0] || project.image || '/api/placeholder/400/300'} 
                      alt={project.title}
                      width={400}
                      height={192}
                      className="w-full h-48 object-cover"
                    />
                    {/* Multiple images indicator */}
                    {(project.images?.length > 1) && (
                      <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
                        +{project.images.length - 1} more
                      </div>
                    )}
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

                  {/* Project Info - UPDATED: Removed budget, changed completion to year, added video link */}
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
                      {project.client && (
                        <div className="flex justify-between">
                          <span>Client:</span>
                          <span className="font-medium">{project.client}</span>
                        </div>
                      )}
                      {project.duration && (
                        <div className="flex justify-between">
                          <span>Duration:</span>
                          <span className="font-medium">{project.duration}</span>
                        </div>
                      )}
                      {(project.completedYear || (project.completedDate && new Date(project.completedDate).getFullYear())) && (
                        <div className="flex justify-between">
                          <span>Completed:</span>
                          <span className="font-medium">
                            {project.completedYear || new Date(project.completedDate).getFullYear()}
                          </span>
                        </div>
                      )}
                      {(project.videos?.length > 0 || project.video) && (
                        <div className="flex justify-between">
                          <span>Videos:</span>
                          <span className="font-medium text-blue-600">
                            {project.videos?.length || 1} video{(project.videos?.length > 1) ? 's' : ''}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Empty State */}
            {portfolioItems.length === 0 && (
              <div className="text-center py-12">
                <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-12 h-12 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-slate-900 mb-2">No projects yet</h3>
                <p className="text-slate-500 mb-4">Start building your portfolio by adding your first project.</p>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Add Your First Project
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Add/Edit Project Modal - UPDATED: Removed budget field, added video field, changed completion to year */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200">
              <h2 className="text-xl font-semibold text-slate-900">
                {editingProject ? 'Edit Project' : 'Add New Project'}
              </h2>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Media Upload Section - MOVED TO TOP */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Image Upload */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-3">
                    Project Images
                  </label>
                  <div className="space-y-4">
                    {/* Existing Images Grid */}
                    {(newProject.images.length > 0 || imagePreviewUrls.length > 0) && (
                      <div className="grid grid-cols-2 gap-3 mb-4">
                        {/* Existing saved images */}
                        {newProject.images.map((imageUrl, index) => (
                          <div key={`existing-${index}`} className="relative group">
                            <Image 
                              src={imageUrl} 
                              alt={`Project ${index + 1}`} 
                              width={150}
                              height={100}
                              className="w-full h-24 object-cover rounded-lg border"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                const newImages = newProject.images.filter((_, i) => i !== index);
                                setNewProject({...newProject, images: newImages});
                              }}
                              className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100"
                            >
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        ))}
                        
                        {/* New selected images */}
                        {imagePreviewUrls.map((previewUrl, index) => (
                          <div key={`preview-${index}`} className="relative group">
                            <Image 
                              src={previewUrl} 
                              alt={`Preview ${index + 1}`} 
                              width={150}
                              height={100}
                              className="w-full h-24 object-cover rounded-lg border"
                            />
                            <button
                              type="button"
                              onClick={() => removeImage(index)}
                              className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100"
                            >
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Upload Box */}
                    <div 
                      onClick={() => document.getElementById('project-image-upload').click()}
                      className="relative border-2 border-dashed border-slate-300 rounded-lg p-6 hover:border-blue-400 hover:bg-blue-50 transition-all duration-200 cursor-pointer group"
                    >
                      <div className="text-center">
                        <svg className="w-12 h-12 mx-auto text-slate-400 group-hover:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        <p className="mt-2 text-sm font-medium text-slate-900 group-hover:text-blue-600 transition-colors">
                          Add More Images
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          PNG, JPG, GIF up to 10MB each
                        </p>
                      </div>
                      
                      {projectImageUploading && (
                        <div className="absolute inset-0 bg-white bg-opacity-90 rounded-lg flex items-center justify-center">
                          <div className="text-center">
                            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                            <p className="text-sm font-medium text-slate-900">Uploading images...</p>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <input
                      id="project-image-upload"
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleProjectImageSelect}
                      className="hidden"
                    />
                  </div>
                </div>

                {/* Video Upload */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-3">
                    Project Videos
                  </label>
                  <div className="space-y-4">
                    {/* Existing Videos Grid */}
                    {(newProject.videos.length > 0 || videoPreviewUrls.length > 0) && (
                      <div className="grid grid-cols-2 gap-3 mb-4">
                        {/* Existing saved videos */}
                        {newProject.videos.map((videoUrl, index) => (
                          <div key={`existing-video-${index}`} className="relative group">
                            <div className="w-full h-24 bg-slate-100 rounded-lg border flex items-center justify-center">
                              <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                              </svg>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                const newVideos = newProject.videos.filter((_, i) => i !== index);
                                setNewProject({...newProject, videos: newVideos});
                              }}
                              className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100"
                            >
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        ))}
                        
                        {/* New selected videos */}
                        {videoPreviewUrls.map((previewUrl, index) => (
                          <div key={`video-preview-${index}`} className="relative group">
                            <video 
                              src={previewUrl} 
                              className="w-full h-24 object-cover rounded-lg border"
                              controls={false}
                            />
                            <button
                              type="button"
                              onClick={() => removeVideo(index)}
                              className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100"
                            >
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Upload Box */}
                    <div 
                      onClick={() => document.getElementById('project-video-upload').click()}
                      className="relative border-2 border-dashed border-slate-300 rounded-lg p-6 hover:border-purple-400 hover:bg-purple-50 transition-all duration-200 cursor-pointer group"
                    >
                      <div className="text-center">
                        <svg className="w-12 h-12 mx-auto text-slate-400 group-hover:text-purple-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        <p className="mt-2 text-sm font-medium text-slate-900 group-hover:text-purple-600 transition-colors">
                          Add More Videos
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          MP4, MOV, AVI up to 50MB each
                        </p>
                      </div>
                      
                      {projectVideoUploading && (
                        <div className="absolute inset-0 bg-white bg-opacity-90 rounded-lg flex items-center justify-center">
                          <div className="text-center">
                            <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                            <p className="text-sm font-medium text-slate-900">Uploading videos...</p>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <input
                      id="project-video-upload"
                      type="file"
                      accept="video/*"
                      multiple
                      onChange={handleProjectVideoSelect}
                      className="hidden"
                    />
                  </div>
                </div>
              </div>

              {/* Basic Info */}
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
                  rows={4}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
                  placeholder="Describe your project..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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

                {/* UPDATED: Changed from completion date to completion year */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Completion Year
                  </label>
                  <input
                    type="number"
                    min="1900"
                    max="2030"
                    value={newProject.completedYear}
                    onChange={(e) => setNewProject({...newProject, completedYear: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
                    placeholder="e.g., 2024"
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

      {/* Company Details Modal */}
      {showCompanyModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6 border-b border-slate-200">
              <h2 className="text-xl font-semibold text-slate-900">Edit Company Details</h2>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Company Name
                </label>
                <input
                  type="text"
                  value={companyData.companyName}
                  onChange={(e) => setCompanyData({...companyData, companyName: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Established Year
                </label>
                <input
                  type="number"
                  min="1900"
                  max="2024"
                  value={companyData.establishedYear}
                  onChange={(e) => setCompanyData({...companyData, establishedYear: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
                />
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
    </div>
  );
}
