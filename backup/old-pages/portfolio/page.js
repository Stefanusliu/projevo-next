'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function PortfolioPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('All Locations');
  const [activeMenu, setActiveMenu] = useState('Portfolio');
  const [isEditMode, setIsEditMode] = useState(false);
  const [newPhoto, setNewPhoto] = useState({ title: '', description: '', image: null });
  const [editingPhoto, setEditingPhoto] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('All Categories');

  const locations = [
    'All Locations',
    'Jakarta Selatan',
    'Jakarta Pusat',
    'Jakarta Barat',
    'Jakarta Utara',
    'Jakarta Timur',
    'Depok',
    'Tangerang',
    'Bekasi',
    'Bogor'
  ];

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

  const menuItems = ['Project', 'Portfolio', 'Saved', 'History'];

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Top Header with Logo and Menu */}
      <header className="bg-white dark:bg-slate-800 shadow-sm border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <Link href="/" className="flex items-center space-x-2">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold text-xl">P</span>
                </div>
                <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Projevo
                </span>
              </Link>
            </div>
            <nav className="hidden md:flex items-center space-x-8">
              <Link href="/how-it-works" className="text-slate-600 hover:text-blue-600 dark:text-slate-300 dark:hover:text-blue-400 font-medium transition-colors">
                How it Works?
              </Link>
              <Link href="/contact" className="text-slate-600 hover:text-blue-600 dark:text-slate-300 dark:hover:text-blue-400 font-medium transition-colors">
                Contact Us
              </Link>
              <Link href="/about" className="text-slate-600 hover:text-blue-600 dark:text-slate-300 dark:hover:text-blue-400 font-medium transition-colors">
                About Us
              </Link>
              <Link href="/partners" className="text-slate-600 hover:text-blue-600 dark:text-slate-300 dark:hover:text-blue-400 font-medium transition-colors">
                Partners
              </Link>
              <Link href="/promotions" className="text-slate-600 hover:text-blue-600 dark:text-slate-300 dark:hover:text-blue-400 font-medium transition-colors">
                Promotions
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Secondary Header with Actions */}
      <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center flex-1">
              <button className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-2.5 rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 mr-4">
                Tender
              </button>
              <Link href="/dashboard/project-owner/home" className="p-2.5 rounded-lg text-slate-600 hover:text-blue-600 hover:bg-blue-50 dark:text-slate-300 dark:hover:text-blue-400 dark:hover:bg-blue-900/20 transition-colors mr-4">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              </Link>
              <div className="flex items-center flex-1">
                <div className="relative flex-1 mr-2">
                  <input
                    type="text"
                    placeholder="Find Contractor"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-4 pr-10 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <svg className="h-5 w-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                </div>
                <select
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  className="px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent mr-2"
                >
                  {locations.map((location) => (
                    <option key={location} value={location}>
                      {location}
                    </option>
                  ))}
                </select>
                <button className="p-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors shadow-lg">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="flex items-center">
              <button className="p-2.5 rounded-lg text-slate-600 hover:text-blue-600 hover:bg-blue-50 dark:text-slate-300 dark:hover:text-blue-400 dark:hover:bg-blue-900/20 transition-colors relative mr-2">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">3</span>
              </button>
              <button className="p-2.5 rounded-lg text-slate-600 hover:text-blue-600 hover:bg-blue-50 dark:text-slate-300 dark:hover:text-blue-400 dark:hover:bg-blue-900/20 transition-colors relative mr-4">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-blue-500 text-white text-xs rounded-full flex items-center justify-center">7</span>
              </button>
              <div className="flex items-center">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center mr-3">
                  <span className="text-white text-sm font-medium">JD</span>
                </div>
                <div className="hidden sm:block">
                  <p className="text-sm font-medium text-slate-900 dark:text-white">John Doe</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Project Owner</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Left Sidebar Menu */}
          <div className="w-64 flex-shrink-0">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
              <nav className="space-y-2">
                {menuItems.map((item) => (
                  <Link
                    key={item}
                    href={item === 'Portfolio' ? '/dashboard/project-owner/portfolio' : item === 'Project' ? '/dashboard/project-owner/home' : `/dashboard/project-owner/${item.toLowerCase()}`}
                    className={`block w-full text-left px-4 py-3 rounded-lg font-medium transition-colors ${
                      activeMenu === item
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'text-slate-600 hover:text-blue-600 hover:bg-blue-50 dark:text-slate-300 dark:hover:text-blue-400 dark:hover:bg-blue-900/20'
                    }`}
                  >
                    {item}
                  </Link>
                ))}
              </nav>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1">
            {/* Portfolio Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">Portfolio</h1>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
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
                  .filter(project => 
                    selectedCategory === 'All Categories' || project.category === selectedCategory
                  )
                  .map((project) => (
                  <div key={project.id} className="group relative bg-slate-50 dark:bg-slate-700 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                    <div className="aspect-video relative overflow-hidden">
                      <img 
                        src={project.image} 
                        alt={project.title}
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
              {projectGallery.filter(project => 
                selectedCategory === 'All Categories' || project.category === selectedCategory
              ).length === 0 && (
                <div className="text-center py-12">
                  <svg className="w-24 h-24 mx-auto text-slate-400 dark:text-slate-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">No projects found</h3>
                  <p className="text-slate-600 dark:text-slate-400">
                    {selectedCategory === 'All Categories' 
                      ? 'Start by adding your first project to showcase your work.'
                      : `No projects found in "${selectedCategory}" category.`
                    }
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Edit Photo Modal */}
      {editingPhoto && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
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
