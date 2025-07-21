'use client';

import { useState } from 'react';
import Image from 'next/image';

export default function PortfolioComponent() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isEditMode, setIsEditMode] = useState(false);
  const [newPhoto, setNewPhoto] = useState({ title: '', description: '', image: null });
  const [editingPhoto, setEditingPhoto] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('All Categories');

  const categories = [
    'All Categories',
    'Interior Design',
    'Construction',
    'Architecture',
    'Renovation'
  ];

  // Company profile data
  const [companyProfile, setCompanyProfile] = useState({
    name: 'PT. Kreasi Konstruksi Indonesia',
    logo: '/api/placeholder/120/120',
    establishedYear: '2018',
    specialization: 'Interior Design & Construction',
    description: 'We are a leading construction and interior design company in Jakarta, specializing in commercial and residential projects with over 5 years of experience.',
    location: 'Jakarta Selatan',
    phone: '+62 21 1234 5678',
    email: 'info@kreasikonstruksi.com',
    website: 'www.kreasikonstruksi.com'
  });

  // Project gallery data
  const [projectGallery, setProjectGallery] = useState([
    {
      id: 1,
      title: 'Modern Coffee Shop Interior',
      description: 'Complete interior design and renovation for a modern coffee shop in Jakarta Selatan',
      image: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=400&h=250&fit=crop&crop=center',
      category: 'Interior Design',
      completedDate: '2024-01-15',
      client: 'Coffee Bean Co.'
    },
    {
      id: 2,
      title: 'Office Building Construction',
      description: 'Full construction of 5-story office building with modern architecture',
      image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&h=250&fit=crop&crop=center',
      category: 'Construction',
      completedDate: '2023-12-10',
      client: 'Tech Startup Hub'
    },
    {
      id: 3,
      title: 'Restaurant Renovation',
      description: 'Traditional restaurant renovation with contemporary touches',
      image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=250&fit=crop&crop=center',
      category: 'Renovation',
      completedDate: '2023-11-20',
      client: 'Nusantara Restaurant'
    },
    {
      id: 4,
      title: 'Boutique Store Design',
      description: 'Luxury boutique interior design with custom fixtures',
      image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=250&fit=crop&crop=center',
      category: 'Interior Design',
      completedDate: '2023-10-05',
      client: 'Fashion Forward'
    },
    {
      id: 5,
      title: 'Co-working Space',
      description: 'Modern co-working space design with flexible layouts',
      image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&h=250&fit=crop&crop=center',
      category: 'Interior Design',
      completedDate: '2023-09-15',
      client: 'WorkSpace Solutions'
    },
    {
      id: 6,
      title: 'Rooftop Bar Construction',
      description: 'Rooftop bar construction with panoramic city views',
      image: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=400&h=250&fit=crop&crop=center',
      category: 'Construction',
      completedDate: '2023-08-25',
      client: 'Sky Lounge'
    }
  ]);

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setNewPhoto({
          ...newPhoto,
          image: e.target.result
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddPhoto = () => {
    if (newPhoto.title && newPhoto.description && newPhoto.image) {
      const newGalleryItem = {
        id: Date.now(),
        title: newPhoto.title,
        description: newPhoto.description,
        image: newPhoto.image,
        category: 'New Project',
        completedDate: new Date().toISOString().split('T')[0],
        client: 'New Client'
      };
      setProjectGallery([...projectGallery, newGalleryItem]);
      setNewPhoto({ title: '', description: '', image: null });
    }
  };

  const handleEditPhoto = (photo) => {
    setEditingPhoto(photo);
  };

  const handleUpdatePhoto = () => {
    if (editingPhoto) {
      setProjectGallery(projectGallery.map(photo => 
        photo.id === editingPhoto.id ? editingPhoto : photo
      ));
      setEditingPhoto(null);
    }
  };

  const handleDeletePhoto = (photoId) => {
    setProjectGallery(projectGallery.filter(photo => photo.id !== photoId));
  };

  return (
    <div className="space-y-8">
      {/* Portfolio Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">Portfolio</h1>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6 text-center">
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">{projectGallery.length}</div>
            <div className="text-slate-600 dark:text-slate-400">Completed Projects</div>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6 text-center">
            <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">5+</div>
            <div className="text-slate-600 dark:text-slate-400">Years Experience</div>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6 text-center">
            <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-2">98%</div>
            <div className="text-slate-600 dark:text-slate-400">Client Satisfaction</div>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6 text-center">
            <div className="text-3xl font-bold text-orange-600 dark:text-orange-400 mb-2">25+</div>
            <div className="text-slate-600 dark:text-slate-400">Team Members</div>
          </div>
        </div>
      </div>

      {/* Company Profile Section */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-8 mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Company Profile</h2>
          <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium">
            Edit Profile
          </button>
        </div>
        
        <div className="flex items-start space-x-8">
          {/* Company Logo */}
          <div className="flex-shrink-0">
            <div className="w-32 h-32 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-white text-4xl font-bold">KI</span>
            </div>
          </div>
          
          {/* Company Information */}
          <div className="flex-1">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                  {companyProfile.name}
                </h3>
                <p className="text-lg text-blue-600 dark:text-blue-400 font-semibold mb-4">
                  {companyProfile.specialization}
                </p>
                <div className="flex items-center space-x-2 mb-4">
                  <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a1 1 0 011-1h6a1 1 0 011 1v4h-8zM3 21v-8a2 2 0 012-2h14a2 2 0 012 2v8H3z" />
                  </svg>
                  <span className="text-slate-600 dark:text-slate-400">
                    Operating since <span className="font-semibold text-slate-900 dark:text-white">{companyProfile.establishedYear}</span>
                  </span>
                </div>
                <div className="flex items-center space-x-2 mb-4">
                  <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="text-slate-600 dark:text-slate-400">{companyProfile.location}</span>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <span className="text-slate-600 dark:text-slate-400 text-sm">{companyProfile.phone}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span className="text-slate-600 dark:text-slate-400 text-sm">{companyProfile.email}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9" />
                    </svg>
                    <span className="text-slate-600 dark:text-slate-400 text-sm">{companyProfile.website}</span>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">About Us</h4>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                  {companyProfile.description}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Project Gallery Section */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Our Work</h2>
            <p className="text-slate-600 dark:text-slate-400 mt-1">
              Showcasing our best projects and achievements
            </p>
          </div>
          <button
            onClick={() => setIsEditMode(!isEditMode)}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-medium"
          >
            {isEditMode ? 'Done Editing' : 'Manage Portfolio'}
          </button>
        </div>

        {/* Portfolio Filters */}
        <div className="mb-6 p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
          <div className="flex flex-wrap gap-4 items-center">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
            <div className="flex-1 max-w-md">
              <input
                type="text"
                placeholder="Search projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Add New Photo Form - Only visible in edit mode */}
        {isEditMode && (
          <div className="mb-8 p-6 bg-slate-50 dark:bg-slate-700 rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-600">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Add New Project</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Project Title
                </label>
                <input
                  type="text"
                  value={newPhoto.title}
                  onChange={(e) => setNewPhoto({...newPhoto, title: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter project title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Project Photo
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Project Description
                </label>
                <textarea
                  value={newPhoto.description}
                  onChange={(e) => setNewPhoto({...newPhoto, description: e.target.value})}
                  rows={3}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter project description"
                />
              </div>
              <div className="md:col-span-2">
                <button
                  onClick={handleAddPhoto}
                  disabled={!newPhoto.title || !newPhoto.description || !newPhoto.image}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 text-white rounded-lg transition-colors font-medium"
                >
                  Add Project
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Project Gallery Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projectGallery
            .filter(project => {
              const matchesCategory = selectedCategory === 'All Categories' || project.category === selectedCategory;
              const matchesSearch = project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                  project.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                  project.client.toLowerCase().includes(searchQuery.toLowerCase());
              return matchesCategory && matchesSearch;
            })
            .map((project) => (
            <div key={project.id} className="group relative bg-slate-50 dark:bg-slate-700 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              <div className="aspect-video relative overflow-hidden">
                <Image 
                  src={project.image} 
                  alt={project.title}
                  fill
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {isEditMode && (
                  <div className="absolute top-2 right-2 flex space-x-2">
                    <button
                      onClick={() => handleEditPhoto(project)}
                      className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDeletePhoto(project.id)}
                      className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-full shadow-lg transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                )}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                  <span className="inline-block px-2 py-1 bg-blue-600 text-white text-xs font-medium rounded">
                    {project.category}
                  </span>
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-slate-900 dark:text-white mb-2 line-clamp-2">
                  {project.title}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-3 line-clamp-2">
                  {project.description}
                </p>
                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                  <span>{project.client}</span>
                  <span>{new Date(project.completedDate).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {projectGallery.filter(project => {
          const matchesCategory = selectedCategory === 'All Categories' || project.category === selectedCategory;
          const matchesSearch = project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                              project.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                              project.client.toLowerCase().includes(searchQuery.toLowerCase());
          return matchesCategory && matchesSearch;
        }).length === 0 && (
          <div className="text-center py-12">
            <svg className="w-24 h-24 mx-auto text-slate-400 dark:text-slate-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">No projects found</h3>
            <p className="text-slate-600 dark:text-slate-400">
              {selectedCategory === 'All Categories' && !searchQuery
                ? 'Start by adding your first project to showcase your work.'
                : `No projects found matching your current filters.`
              }
            </p>
          </div>
        )}
      </div>

      {/* Edit Photo Modal */}
      {editingPhoto && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-800 rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Edit Project</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Project Title
                </label>
                <input
                  type="text"
                  value={editingPhoto.title}
                  onChange={(e) => setEditingPhoto({...editingPhoto, title: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Description
                </label>
                <textarea
                  value={editingPhoto.description}
                  onChange={(e) => setEditingPhoto({...editingPhoto, description: e.target.value})}
                  rows={3}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Client
                </label>
                <input
                  type="text"
                  value={editingPhoto.client}
                  onChange={(e) => setEditingPhoto({...editingPhoto, client: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="flex space-x-3 mt-6">
              <button
                onClick={handleUpdatePhoto}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
              >
                Update Project
              </button>
              <button
                onClick={() => setEditingPhoto(null)}
                className="flex-1 px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-lg transition-colors font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}