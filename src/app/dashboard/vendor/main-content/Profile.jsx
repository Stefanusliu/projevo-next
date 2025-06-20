'use client';

import { useState } from 'react';

export default function Profile() {
  const [formData, setFormData] = useState({
    name: 'Alex Smith',
    email: 'alex.smith@email.com',
    phone: '+62 812-3456-7890',
    company: 'Smith Construction & Design',
    specialization: 'Commercial Construction',
    experience: '8 years',
    location: 'Jakarta Selatan',
    bio: 'Experienced contractor specializing in commercial construction, interior design, and renovation projects. Committed to delivering high-quality work on time and within budget.',
    website: 'www.smithconstruction.com',
    license: 'LPJK-2024-001234',
    certifications: ['LEED AP', 'OSHA Certified', 'PMP Certified'],
    skills: ['Project Management', 'Construction', 'Interior Design', 'Renovation', 'Quality Control'],
    languages: ['Indonesian', 'English', 'Mandarin'],
    portfolio: [
      {
        id: 1,
        title: 'Modern Office Complex - Jakarta',
        client: 'TechCorp Solutions',
        category: 'Construction',
        completedDate: '2024-01-15',
        budget: 'Rp 3,200,000,000',
        description: 'Complete construction of modern office complex with smart building technology.',
        images: [
          {
            id: 1,
            name: 'Office Complex Exterior',
            url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&h=400&fit=crop&auto=format'
          },
          {
            id: 2,
            name: 'Modern Lobby Interior',
            url: 'https://images.unsplash.com/photo-1497366411874-3415097a27e7?w=600&h=400&fit=crop&auto=format'
          },
          {
            id: 3,
            name: 'Smart Building Technology',
            url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&h=400&fit=crop&auto=format'
          }
        ],
        skills: ['Project Management', 'Smart Building Tech', 'LEED Certification']
      },
      {
        id: 2,
        title: 'Luxury Restaurant Interior',
        client: 'Fine Dining Co.',
        category: 'Interior Design',
        completedDate: '2023-11-20',
        budget: 'Rp 750,000,000',
        description: 'High-end restaurant interior design with contemporary aesthetics.',
        images: [
          {
            id: 4,
            name: 'Restaurant Main Dining Area',
            url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&h=400&fit=crop&auto=format'
          },
          {
            id: 5,
            name: 'Bar and Lounge Section',
            url: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=600&h=400&fit=crop&auto=format'
          }
        ],
        skills: ['Interior Design', 'Space Planning', 'Material Selection']
      },
      {
        id: 3,
        title: 'Shopping Mall Renovation',
        client: 'Retail Properties Group',
        category: 'Renovation',
        completedDate: '2023-08-30',
        budget: 'Rp 1,500,000,000',
        description: 'Complete renovation and modernization of existing shopping center.',
        images: [
          {
            id: 6,
            name: 'Mall Entrance Renovation',
            url: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&h=400&fit=crop&auto=format'
          },
          {
            id: 7,
            name: 'Modern Food Court',
            url: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=600&h=400&fit=crop&auto=format'
          },
          {
            id: 8,
            name: 'Renovated Retail Spaces',
            url: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&h=400&fit=crop&auto=format&q=80'
          }
        ],
        skills: ['Renovation', 'Project Management', 'Retail Design']
      }
    ],
    relevantExperience: [
      {
        id: 1,
        projectName: 'Shopping Mall Extension',
        client: 'Kemang Properties',
        duration: '14 months',
        role: 'Lead Contractor',
        completedDate: '2023-08-30',
        description: 'Led the construction team for a major shopping mall extension project, managing 50+ workers and coordinating with multiple subcontractors.',
        achievements: ['Completed 2 months ahead of schedule', 'Zero safety incidents', '15% under budget']
      },
      {
        id: 2,
        projectName: 'Corporate Headquarters Renovation',
        client: 'Finance Corp',
        duration: '8 months',
        role: 'Project Manager',
        completedDate: '2023-03-15',
        description: 'Managed complete renovation of 20-story corporate headquarters while maintaining business operations.',
        achievements: ['Zero business disruption', 'LEED Gold certification achieved', 'Client satisfaction: 5/5']
      }
    ]
  });

  const [isEditing, setIsEditing] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleArrayChange = (field, index, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? value : item)
    }));
  };

  const addArrayItem = (field) => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }));
  };

  const removeArrayItem = (field, index) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const addPortfolioItem = () => {
    const newItem = {
      id: Date.now(),
      title: '',
      client: '',
      category: '',
      completedDate: '',
      budget: '',
      description: '',
      images: [],
      skills: []
    };
    setFormData(prev => ({
      ...prev,
      portfolio: [...prev.portfolio, newItem]
    }));
  };

  const updatePortfolioItem = (id, field, value) => {
    setFormData(prev => ({
      ...prev,
      portfolio: prev.portfolio.map(item => 
        item.id === id ? { ...item, [field]: value } : item
      )
    }));
  };

  const removePortfolioItem = (id) => {
    setFormData(prev => ({
      ...prev,
      portfolio: prev.portfolio.filter(item => item.id !== id)
    }));
  };

  const addExperienceItem = () => {
    const newItem = {
      id: Date.now(),
      projectName: '',
      client: '',
      duration: '',
      role: '',
      completedDate: '',
      description: '',
      achievements: []
    };
    setFormData(prev => ({
      ...prev,
      relevantExperience: [...prev.relevantExperience, newItem]
    }));
  };

  const updateExperienceItem = (id, field, value) => {
    setFormData(prev => ({
      ...prev,
      relevantExperience: prev.relevantExperience.map(item => 
        item.id === id ? { ...item, [field]: value } : item
      )
    }));
  };

  const removeExperienceItem = (id) => {
    setFormData(prev => ({
      ...prev,
      relevantExperience: prev.relevantExperience.filter(item => item.id !== id)
    }));
  };

  const handleImageUpload = (projectId, files) => {
    const newImages = Array.from(files).map(file => {
      // In a real app, you would upload to a server and get back URLs
      // For now, we'll create object URLs for preview
      return {
        id: Date.now() + Math.random(),
        name: file.name,
        url: URL.createObjectURL(file),
        file: file
      };
    });
    
    setFormData(prev => ({
      ...prev,
      portfolio: prev.portfolio.map(item => 
        item.id === projectId 
          ? { ...item, images: [...(item.images || []), ...newImages] }
          : item
      )
    }));
  };

  const removeImage = (projectId, imageId) => {
    setFormData(prev => ({
      ...prev,
      portfolio: prev.portfolio.map(item => 
        item.id === projectId 
          ? { ...item, images: (item.images || []).filter(img => img.id !== imageId) }
          : item
      )
    }));
  };

  const openImageModal = (image) => {
    setSelectedImage(image);
    setIsImageModalOpen(true);
  };

  const closeImageModal = () => {
    setSelectedImage(null);
    setIsImageModalOpen(false);
  };

  const stats = [
    { label: 'Projects Completed', value: '42', color: 'bg-green-500' },
    { label: 'Success Rate', value: '98%', color: 'bg-blue-500' },
    { label: 'Client Rating', value: '4.9/5', color: 'bg-yellow-500' },
    { label: 'Response Time', value: '< 2 hours', color: 'bg-purple-500' }
  ];

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center">
                <span className="text-3xl font-bold text-white">AS</span>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">{formData.name}</h1>
                <p className="text-green-100 text-lg">{formData.company}</p>
                <p className="text-green-100">{formData.specialization} • {formData.experience}</p>
              </div>
            </div>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors"
            >
              {isEditing ? 'Cancel' : 'Edit Profile'}
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="px-6 py-6 border-b border-slate-200 dark:border-slate-700">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center mx-auto mb-2`}>
                  <span className="text-white font-bold">{stat.value}</span>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Profile Content */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left Column */}
            <div className="space-y-6">
              {/* Basic Information */}
              <div>
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">Basic Information</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Full Name
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    ) : (
                      <p className="text-slate-900 dark:text-white">{formData.name}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Email
                    </label>
                    {isEditing ? (
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    ) : (
                      <p className="text-slate-900 dark:text-white">{formData.email}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Phone Number
                    </label>
                    {isEditing ? (
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    ) : (
                      <p className="text-slate-900 dark:text-white">{formData.phone}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Location
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={formData.location}
                        onChange={(e) => handleInputChange('location', e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    ) : (
                      <p className="text-slate-900 dark:text-white">{formData.location}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Professional Information */}
              <div>
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">Professional Information</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Company Name
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={formData.company}
                        onChange={(e) => handleInputChange('company', e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    ) : (
                      <p className="text-slate-900 dark:text-white">{formData.company}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Specialization
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={formData.specialization}
                        onChange={(e) => handleInputChange('specialization', e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    ) : (
                      <p className="text-slate-900 dark:text-white">{formData.specialization}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Experience
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={formData.experience}
                        onChange={(e) => handleInputChange('experience', e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    ) : (
                      <p className="text-slate-900 dark:text-white">{formData.experience}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      License Number
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={formData.license}
                        onChange={(e) => handleInputChange('license', e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    ) : (
                      <p className="text-slate-900 dark:text-white">{formData.license}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Website
                    </label>
                    {isEditing ? (
                      <input
                        type="url"
                        value={formData.website}
                        onChange={(e) => handleInputChange('website', e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    ) : (
                      <p className="text-slate-900 dark:text-white">{formData.website}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Bio */}
              <div>
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">Biography</h2>
                {isEditing ? (
                  <textarea
                    value={formData.bio}
                    onChange={(e) => handleInputChange('bio', e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                ) : (
                  <p className="text-slate-900 dark:text-white">{formData.bio}</p>
                )}
              </div>

              {/* Skills */}
              <div>
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">Skills</h2>
                <div className="flex flex-wrap gap-2">
                  {formData.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 rounded-full text-sm"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Certifications */}
              <div>
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">Certifications</h2>
                <div className="space-y-2">
                  {formData.certifications.map((cert, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-slate-900 dark:text-white">{cert}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Languages */}
              <div>
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">Languages</h2>
                <div className="flex flex-wrap gap-2">
                  {formData.languages.map((language, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400 rounded-full text-sm"
                    >
                      {language}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Portfolio Section */}
          <div className="mt-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Portfolio</h2>
              {isEditing && (
                <button
                  onClick={addPortfolioItem}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                >
                  Add Project
                </button>
              )}
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {formData.portfolio.map((project) => (
                <div key={project.id} className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-6 border border-slate-200 dark:border-slate-600">
                  {isEditing && (
                    <div className="flex justify-end mb-4">
                      <button
                        onClick={() => removePortfolioItem(project.id)}
                        className="text-red-500 hover:text-red-700 text-sm"
                      >
                        Remove
                      </button>
                    </div>
                  )}
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Project Title
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={project.title}
                          onChange={(e) => updatePortfolioItem(project.id, 'title', e.target.value)}
                          className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                      ) : (
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{project.title}</h3>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                          Client
                        </label>
                        {isEditing ? (
                          <input
                            type="text"
                            value={project.client}
                            onChange={(e) => updatePortfolioItem(project.id, 'client', e.target.value)}
                            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                          />
                        ) : (
                          <p className="text-slate-600 dark:text-slate-400">{project.client}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                          Category
                        </label>
                        {isEditing ? (
                          <select
                            value={project.category}
                            onChange={(e) => updatePortfolioItem(project.id, 'category', e.target.value)}
                            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                          >
                            <option value="">Select Category</option>
                            <option value="Construction">Construction</option>
                            <option value="Interior Design">Interior Design</option>
                            <option value="Architecture">Architecture</option>
                            <option value="Renovation">Renovation</option>
                          </select>
                        ) : (
                          <span className="inline-block px-2 py-1 bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 rounded text-sm">
                            {project.category}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                          Budget
                        </label>
                        {isEditing ? (
                          <input
                            type="text"
                            value={project.budget}
                            onChange={(e) => updatePortfolioItem(project.id, 'budget', e.target.value)}
                            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                          />
                        ) : (
                          <p className="text-sm font-semibold text-green-600 dark:text-green-400">{project.budget}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                          Completed Date
                        </label>
                        {isEditing ? (
                          <input
                            type="date"
                            value={project.completedDate}
                            onChange={(e) => updatePortfolioItem(project.id, 'completedDate', e.target.value)}
                            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                          />
                        ) : (
                          <p className="text-sm text-slate-600 dark:text-slate-400">
                            {new Date(project.completedDate).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Description
                      </label>
                      {isEditing ? (
                        <textarea
                          value={project.description}
                          onChange={(e) => updatePortfolioItem(project.id, 'description', e.target.value)}
                          rows={3}
                          className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                        />
                      ) : (
                        <p className="text-sm text-slate-600 dark:text-slate-400">{project.description}</p>
                      )}
                    </div>

                    {/* Project Gallery */}
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Project Images
                      </label>
                      
                      {/* Image Upload (Edit Mode) */}
                      {isEditing && (
                        <div className="mb-4">
                          <input
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={(e) => handleImageUpload(project.id, e.target.files)}
                            className="hidden"
                            id={`images-${project.id}`}
                          />
                          <label
                            htmlFor={`images-${project.id}`}
                            className="flex items-center justify-center w-full h-32 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg cursor-pointer hover:border-green-500 transition-colors"
                          >
                            <div className="text-center">
                              <svg className="w-8 h-8 text-slate-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                              </svg>
                              <p className="text-sm text-slate-600 dark:text-slate-400">
                                Click to upload images
                              </p>
                            </div>
                          </label>
                        </div>
                      )}

                      {/* Image Gallery */}
                      {project.images && project.images.length > 0 && (
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
                          {project.images.map((image, imageIndex) => (
                            <div key={imageIndex} className="relative group">
                              <div className="aspect-square bg-slate-100 dark:bg-slate-700 rounded-lg overflow-hidden">
                                {typeof image === 'string' ? (
                                  // Legacy string format - show placeholder
                                  <div className="w-full h-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center">
                                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                  </div>
                                ) : (
                                  // New object format with URL
                                  <img
                                    src={image.url}
                                    alt={image.name || `Project image ${imageIndex + 1}`}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      // Fallback to placeholder if image fails to load
                                      e.target.style.display = 'none';
                                      e.target.parentElement.innerHTML = `
                                        <div class="w-full h-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center">
                                          <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                                          </svg>
                                        </div>
                                      `;
                                    }}
                                  />
                                )}
                              </div>
                              
                              {/* Remove button (Edit Mode) */}
                              {isEditing && (
                                <button
                                  onClick={() => removeImage(project.id, image.id || imageIndex)}
                                  className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center hover:bg-red-600"
                                >
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                  </svg>
                                </button>
                              )}
                              
                              {/* View button */}
                              <button
                                onClick={() => openImageModal(image)}
                                className="absolute inset-0 bg-black/30 opacity-0 hover:opacity-100 transition-all duration-200 flex items-center justify-center"
                              >
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                              </button>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* No images state */}
                      {(!project.images || project.images.length === 0) && !isEditing && (
                        <div className="text-center py-6 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-600 mb-4">
                          <svg className="w-8 h-8 text-slate-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <p className="text-sm text-slate-500 dark:text-slate-400">No images uploaded for this project</p>
                        </div>
                      )}
                    </div>

                    {!isEditing && project.skills && project.skills.length > 0 && (
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                          Skills Used
                        </label>
                        <div className="flex flex-wrap gap-1">
                          {project.skills.map((skill, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400 rounded text-xs"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Image Upload for Portfolio */}
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Project Images
                      </label>
                      {isEditing ? (
                        <div>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleImageUpload(project.id, e.target.files)}
                            className="hidden"
                            id={`image-upload-${project.id}`}
                          />
                          <label
                            htmlFor={`image-upload-${project.id}`}
                            className="flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg cursor-pointer hover:bg-green-700 transition-colors"
                          >
                            Upload Images
                          </label>

                          <div className="mt-4 grid grid-cols-3 gap-4">
                            {(project.images || []).map(image => (
                              <div key={image.id} className="relative">
                                <img 
                                  src={image.url} 
                                  alt={image.name} 
                                  className="w-full h-auto rounded-lg" 
                                  onError={(e) => {
                                    e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAwIiBoZWlnaHQ9IjQwMCIgdmlld0JveD0iMCAwIDYwMCA0MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI2MDAiIGhlaWdodD0iNDAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yNTAgMjAwTDM1MCAyMDBMMzUwIDI1MEwyNTAgMjUwTDI1MCAyMDBaIiBmaWxsPSIjOUI5QjlCIi8+CjxwYXRoIGQ9Ik0yNzUgMjI1TDI5MCAyMTBMMzEwIDIzMEwzMjUgMjE1TDM0MCAyMzBMMzQwIDI0MEwyNjAgMjQwTDI3NSAyMjVaIiBmaWxsPSIjNjc3NDhGIi8+Cjwvc3ZnPgo=';
                                  }}
                                />
                                <button
                                  onClick={() => removeImage(project.id, image.id)}
                                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                  </svg>
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="grid grid-cols-3 gap-4">
                          {(project.images || []).map(image => (
                            <div key={image.id} className="relative">
                              <img 
                                src={image.url} 
                                alt={image.name} 
                                className="w-full h-auto rounded-lg"
                                onError={(e) => {
                                  e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAwIiBoZWlnaHQ9IjQwMCIgdmlld0JveD0iMCAwIDYwMCA0MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI2MDAiIGhlaWdodD0iNDAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yNTAgMjAwTDM1MCAyMDBMMzUwIDI1MEwyNTAgMjUwTDI1MCAyMDBaIiBmaWxsPSIjOUI5QjlCIi8+CjxwYXRoIGQ9Ik0yNzUgMjI1TDI5MCAyMTBMMzEwIDIzMEwzMjUgMjE1TDM0MCAyMzBMMzQwIDI0MEwyNjAgMjQwTDI3NSAyMjVaIiBmaWxsPSIjNjc3NDhGIi8+Cjwvc3ZnPgo=';
                                }}
                              />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {formData.portfolio.length === 0 && (
              <div className="text-center py-8 bg-slate-50 dark:bg-slate-700/50 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-600">
                <svg className="w-12 h-12 text-slate-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">No Portfolio Projects</h3>
                <p className="text-slate-500 dark:text-slate-400 mb-4">Add your completed projects to showcase your work</p>
                {isEditing && (
                  <button
                    onClick={addPortfolioItem}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Add First Project
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Experience Section */}
          <div className="mt-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Relevant Experience</h2>
              {isEditing && (
                <button
                  onClick={addExperienceItem}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                >
                  Add Experience
                </button>
              )}
            </div>
            
            <div className="space-y-6">
              {formData.relevantExperience.map((exp) => (
                <div key={exp.id} className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-6 border border-slate-200 dark:border-slate-600">
                  {isEditing && (
                    <div className="flex justify-end mb-4">
                      <button
                        onClick={() => removeExperienceItem(exp.id)}
                        className="text-red-500 hover:text-red-700 text-sm"
                      >
                        Remove
                      </button>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                          Project Name
                        </label>
                        {isEditing ? (
                          <input
                            type="text"
                            value={exp.projectName}
                            onChange={(e) => updateExperienceItem(exp.id, 'projectName', e.target.value)}
                            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                          />
                        ) : (
                          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{exp.projectName}</h3>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                            Client
                          </label>
                          {isEditing ? (
                            <input
                              type="text"
                              value={exp.client}
                              onChange={(e) => updateExperienceItem(exp.id, 'client', e.target.value)}
                              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                            />
                          ) : (
                            <p className="text-slate-600 dark:text-slate-400">{exp.client}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                            Duration
                          </label>
                          {isEditing ? (
                            <input
                              type="text"
                              value={exp.duration}
                              onChange={(e) => updateExperienceItem(exp.id, 'duration', e.target.value)}
                              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                              placeholder="e.g., 6 months"
                            />
                          ) : (
                            <p className="text-slate-600 dark:text-slate-400">{exp.duration}</p>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                            Role
                          </label>
                          {isEditing ? (
                            <input
                              type="text"
                              value={exp.role}
                              onChange={(e) => updateExperienceItem(exp.id, 'role', e.target.value)}
                              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                            />
                          ) : (
                            <p className="text-slate-600 dark:text-slate-400">{exp.role}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                            Completed Date
                          </label>
                          {isEditing ? (
                            <input
                              type="date"
                              value={exp.completedDate}
                              onChange={(e) => updateExperienceItem(exp.id, 'completedDate', e.target.value)}
                              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                            />
                          ) : (
                            <p className="text-slate-600 dark:text-slate-400">
                              {new Date(exp.completedDate).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                          Description
                        </label>
                        {isEditing ? (
                          <textarea
                            value={exp.description}
                            onChange={(e) => updateExperienceItem(exp.id, 'description', e.target.value)}
                            rows={4}
                            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                          />
                        ) : (
                          <p className="text-sm text-slate-600 dark:text-slate-400">{exp.description}</p>
                        )}
                      </div>

                      {!isEditing && exp.achievements && exp.achievements.length > 0 && (
                        <div>
                          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            Key Achievements
                          </label>
                          <ul className="space-y-1">
                            {exp.achievements.map((achievement, index) => (
                              <li key={index} className="flex items-start space-x-2">
                                <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                                <span className="text-sm text-slate-600 dark:text-slate-400">{achievement}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {formData.relevantExperience.length === 0 && (
              <div className="text-center py-8 bg-slate-50 dark:bg-slate-700/50 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-600">
                <svg className="w-12 h-12 text-slate-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">No Experience Listed</h3>
                <p className="text-slate-500 dark:text-slate-400 mb-4">Add your relevant work experience to strengthen your profile</p>
                {isEditing && (
                  <button
                    onClick={addExperienceItem}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Add First Experience
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Save Button */}
          {isEditing && (
            <div className="mt-8 flex justify-end">
              <button
                onClick={() => setIsEditing(false)}
                className="px-6 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg font-medium hover:from-green-700 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                Save Changes
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Image Modal */}
      {isImageModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
          <div className="bg-white dark:bg-slate-800 rounded-lg overflow-hidden shadow-lg max-w-3xl w-full mx-auto">
            <div className="relative">
              <button
                onClick={closeImageModal}
                className="absolute top-3 right-3 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-4">
              <img
                src={selectedImage?.url}
                alt={selectedImage?.name || 'Project image'}
                className="w-full h-auto rounded-lg"
                onError={(e) => {
                  e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAwIiBoZWlnaHQ9IjQwMCIgdmlld0JveD0iMCAwIDYwMCA0MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI2MDAiIGhlaWdodD0iNDAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yNTAgMjAwTDM1MCAyMDBMMzUwIDI1MEwyNTAgMjUwTDI1MCAyMDBaIiBmaWxsPSIjOUI5QjlCIi8+CjxwYXRoIGQ9Ik0yNzUgMjI1TDI5MCAyMTBMMzEwIDIzMEwzMjUgMjE1TDM0MCAyMzBMMzQwIDI0MEwyNjAgMjQwTDI3NSAyMjVaIiBmaWxsPSIjNjc3NDhGIi8+Cjwvc3ZnPgo=';
                }}
              />
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
