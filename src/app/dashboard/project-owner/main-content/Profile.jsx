'use client';

import { useState } from 'react';

export default function Profile() {
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('personal');
  const [profileData, setProfileData] = useState({
    // Personal Information
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    phone: '+62 812-3456-7890',
    dateOfBirth: '1985-06-15',
    gender: 'Male',
    nationality: 'Indonesian',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=150&h=150&q=80',
    
    // Company Information
    companyName: 'Doe Construction Group',
    position: 'Project Manager',
    industry: 'Construction & Real Estate',
    companySize: '50-100 employees',
    companyAddress: 'Jl. Sudirman No. 123, Jakarta Selatan 12190',
    companyPhone: '+62 21 5555-1234',
    companyWebsite: 'www.doeconstruction.com',
    companyDescription: 'Leading construction company specializing in commercial and residential projects across Indonesia.',
    
    // Address Information
    streetAddress: 'Jl. Kemang Raya No. 45',
    city: 'Jakarta Selatan',
    state: 'DKI Jakarta',
    postalCode: '12560',
    country: 'Indonesia',
    
    // Preferences
    language: 'Bahasa Indonesia',
    timezone: 'Asia/Jakarta',
    currency: 'IDR',
    notifications: {
      email: true,
      sms: false,
      push: true,
      marketing: false
    },
    
    // Professional Information
    yearsOfExperience: '12',
    specialization: 'Commercial Construction, Project Management',
    certifications: ['PMP Certified', 'LEED Green Associate', 'Construction Safety Certified'],
    projectsCompleted: 87,
    totalBudgetManaged: 'Rp 125,000,000,000',
    averageProjectSize: 'Rp 1,500,000,000'
  });

  const [originalData, setOriginalData] = useState(profileData);

  const handleInputChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setProfileData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setProfileData(prev => ({ ...prev, [field]: value }));
    }
  };

  const handleSave = () => {
    setOriginalData(profileData);
    setIsEditing(false);
    // Here you would typically save to backend
    console.log('Profile updated:', profileData);
  };

  const handleCancel = () => {
    setProfileData(originalData);
    setIsEditing(false);
  };

  const handleAvatarUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfileData(prev => ({ ...prev, avatar: e.target.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const tabs = [
    { id: 'personal', label: 'Personal Info', icon: '👤' },
    { id: 'company', label: 'Company', icon: '🏢' },
    { id: 'address', label: 'Address', icon: '📍' },
    { id: 'professional', label: 'Professional', icon: '💼' },
    { id: 'preferences', label: 'Preferences', icon: '⚙️' },
    { id: 'security', label: 'Security', icon: '🔒' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Profile Settings</h1>
              <p className="text-slate-600 dark:text-slate-400 mt-2">
                Manage your account information and preferences
              </p>
            </div>
            <div className="flex items-center space-x-3">
              {isEditing ? (
                <>
                  <button
                    onClick={handleCancel}
                    className="px-4 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors shadow-lg hover:shadow-xl"
                  >
                    Save Changes
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors shadow-lg hover:shadow-xl flex items-center space-x-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                  <span>Edit Profile</span>
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Profile Summary Card */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 sticky top-8">
              <div className="text-center">
                <div className="relative inline-block">
                  <img
                    src={profileData.avatar}
                    alt="Profile"
                    className="w-32 h-32 rounded-full object-cover border-4 border-blue-100 dark:border-blue-900 mx-auto"
                  />
                  {isEditing && (
                    <label className="absolute bottom-0 right-0 w-8 h-8 bg-blue-600 hover:bg-blue-700 text-white rounded-full flex items-center justify-center cursor-pointer transition-colors">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarUpload}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-4">
                  {profileData.firstName} {profileData.lastName}
                </h2>
                <p className="text-blue-600 dark:text-blue-400 font-medium">
                  {profileData.position}
                </p>
                <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">
                  {profileData.companyName}
                </p>
                
                {/* Quick Stats */}
                <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {profileData.projectsCompleted}
                    </div>
                    <div className="text-xs text-slate-600 dark:text-slate-400">
                      Projects
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {profileData.yearsOfExperience}
                    </div>
                    <div className="text-xs text-slate-600 dark:text-slate-400">
                      Years Exp.
                    </div>
                  </div>
                </div>
              </div>

              {/* Navigation Tabs */}
              <nav className="mt-8 space-y-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                      activeTab === tab.id
                        ? 'bg-blue-50 text-blue-600 border-l-4 border-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
                        : 'text-slate-600 hover:text-blue-600 hover:bg-blue-50 dark:text-slate-400 dark:hover:text-blue-400 dark:hover:bg-blue-900/20'
                    }`}
                  >
                    <span className="text-lg">{tab.icon}</span>
                    <span className="font-medium">{tab.label}</span>
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-8">
              
              {/* Personal Information Tab */}
              {activeTab === 'personal' && (
                <div>
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-6">
                    Personal Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        First Name
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={profileData.firstName}
                          onChange={(e) => handleInputChange('firstName', e.target.value)}
                          className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      ) : (
                        <p className="text-slate-900 dark:text-white font-medium py-2">{profileData.firstName}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Last Name
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={profileData.lastName}
                          onChange={(e) => handleInputChange('lastName', e.target.value)}
                          className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      ) : (
                        <p className="text-slate-900 dark:text-white font-medium py-2">{profileData.lastName}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Email Address
                      </label>
                      {isEditing ? (
                        <input
                          type="email"
                          value={profileData.email}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      ) : (
                        <p className="text-slate-900 dark:text-white font-medium py-2">{profileData.email}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Phone Number
                      </label>
                      {isEditing ? (
                        <input
                          type="tel"
                          value={profileData.phone}
                          onChange={(e) => handleInputChange('phone', e.target.value)}
                          className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      ) : (
                        <p className="text-slate-900 dark:text-white font-medium py-2">{profileData.phone}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Date of Birth
                      </label>
                      {isEditing ? (
                        <input
                          type="date"
                          value={profileData.dateOfBirth}
                          onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                          className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      ) : (
                        <p className="text-slate-900 dark:text-white font-medium py-2">
                          {new Date(profileData.dateOfBirth).toLocaleDateString()}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Gender
                      </label>
                      {isEditing ? (
                        <select
                          value={profileData.gender}
                          onChange={(e) => handleInputChange('gender', e.target.value)}
                          className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                          <option value="Prefer not to say">Prefer not to say</option>
                        </select>
                      ) : (
                        <p className="text-slate-900 dark:text-white font-medium py-2">{profileData.gender}</p>
                      )}
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Nationality
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={profileData.nationality}
                          onChange={(e) => handleInputChange('nationality', e.target.value)}
                          className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      ) : (
                        <p className="text-slate-900 dark:text-white font-medium py-2">{profileData.nationality}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Company Information Tab */}
              {activeTab === 'company' && (
                <div>
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-6">
                    Company Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Company Name
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={profileData.companyName}
                          onChange={(e) => handleInputChange('companyName', e.target.value)}
                          className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      ) : (
                        <p className="text-slate-900 dark:text-white font-medium py-2">{profileData.companyName}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Position
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={profileData.position}
                          onChange={(e) => handleInputChange('position', e.target.value)}
                          className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      ) : (
                        <p className="text-slate-900 dark:text-white font-medium py-2">{profileData.position}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Industry
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={profileData.industry}
                          onChange={(e) => handleInputChange('industry', e.target.value)}
                          className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      ) : (
                        <p className="text-slate-900 dark:text-white font-medium py-2">{profileData.industry}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Company Size
                      </label>
                      {isEditing ? (
                        <select
                          value={profileData.companySize}
                          onChange={(e) => handleInputChange('companySize', e.target.value)}
                          className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="1-10 employees">1-10 employees</option>
                          <option value="11-50 employees">11-50 employees</option>
                          <option value="50-100 employees">50-100 employees</option>
                          <option value="101-500 employees">101-500 employees</option>
                          <option value="500+ employees">500+ employees</option>
                        </select>
                      ) : (
                        <p className="text-slate-900 dark:text-white font-medium py-2">{profileData.companySize}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Company Phone
                      </label>
                      {isEditing ? (
                        <input
                          type="tel"
                          value={profileData.companyPhone}
                          onChange={(e) => handleInputChange('companyPhone', e.target.value)}
                          className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      ) : (
                        <p className="text-slate-900 dark:text-white font-medium py-2">{profileData.companyPhone}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Company Website
                      </label>
                      {isEditing ? (
                        <input
                          type="url"
                          value={profileData.companyWebsite}
                          onChange={(e) => handleInputChange('companyWebsite', e.target.value)}
                          className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      ) : (
                        <a href={`https://${profileData.companyWebsite}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline font-medium py-2 block">
                          {profileData.companyWebsite}
                        </a>
                      )}
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Company Address
                      </label>
                      {isEditing ? (
                        <textarea
                          value={profileData.companyAddress}
                          onChange={(e) => handleInputChange('companyAddress', e.target.value)}
                          rows={3}
                          className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      ) : (
                        <p className="text-slate-900 dark:text-white font-medium py-2">{profileData.companyAddress}</p>
                      )}
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Company Description
                      </label>
                      {isEditing ? (
                        <textarea
                          value={profileData.companyDescription}
                          onChange={(e) => handleInputChange('companyDescription', e.target.value)}
                          rows={4}
                          className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      ) : (
                        <p className="text-slate-900 dark:text-white font-medium py-2">{profileData.companyDescription}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Address Information Tab */}
              {activeTab === 'address' && (
                <div>
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-6">
                    Address Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Street Address
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={profileData.streetAddress}
                          onChange={(e) => handleInputChange('streetAddress', e.target.value)}
                          className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      ) : (
                        <p className="text-slate-900 dark:text-white font-medium py-2">{profileData.streetAddress}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        City
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={profileData.city}
                          onChange={(e) => handleInputChange('city', e.target.value)}
                          className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      ) : (
                        <p className="text-slate-900 dark:text-white font-medium py-2">{profileData.city}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        State/Province
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={profileData.state}
                          onChange={(e) => handleInputChange('state', e.target.value)}
                          className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      ) : (
                        <p className="text-slate-900 dark:text-white font-medium py-2">{profileData.state}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Postal Code
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={profileData.postalCode}
                          onChange={(e) => handleInputChange('postalCode', e.target.value)}
                          className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      ) : (
                        <p className="text-slate-900 dark:text-white font-medium py-2">{profileData.postalCode}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Country
                      </label>
                      {isEditing ? (
                        <select
                          value={profileData.country}
                          onChange={(e) => handleInputChange('country', e.target.value)}
                          className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="Indonesia">Indonesia</option>
                          <option value="Malaysia">Malaysia</option>
                          <option value="Singapore">Singapore</option>
                          <option value="Thailand">Thailand</option>
                          <option value="Philippines">Philippines</option>
                          <option value="Vietnam">Vietnam</option>
                          <option value="Other">Other</option>
                        </select>
                      ) : (
                        <p className="text-slate-900 dark:text-white font-medium py-2">{profileData.country}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Professional Information Tab */}
              {activeTab === 'professional' && (
                <div>
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-6">
                    Professional Information
                  </h3>
                  <div className="space-y-8">
                    {/* Experience & Statistics */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl p-6 text-center">
                        <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                          {profileData.yearsOfExperience}
                        </div>
                        <div className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                          Years of Experience
                        </div>
                      </div>
                      
                      <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl p-6 text-center">
                        <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                          {profileData.projectsCompleted}
                        </div>
                        <div className="text-sm text-green-700 dark:text-green-300 mt-1">
                          Projects Completed
                        </div>
                      </div>
                      
                      <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl p-6 text-center">
                        <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                          {profileData.totalBudgetManaged}
                        </div>
                        <div className="text-sm text-purple-700 dark:text-purple-300 mt-1">
                          Total Budget Managed
                        </div>
                      </div>
                    </div>

                    {/* Specialization */}
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Specialization
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={profileData.specialization}
                          onChange={(e) => handleInputChange('specialization', e.target.value)}
                          className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="e.g., Commercial Construction, Project Management"
                        />
                      ) : (
                        <p className="text-slate-900 dark:text-white font-medium py-2">{profileData.specialization}</p>
                      )}
                    </div>

                    {/* Average Project Size */}
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Average Project Size
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={profileData.averageProjectSize}
                          onChange={(e) => handleInputChange('averageProjectSize', e.target.value)}
                          className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="e.g., Rp 1,500,000,000"
                        />
                      ) : (
                        <p className="text-slate-900 dark:text-white font-medium py-2">{profileData.averageProjectSize}</p>
                      )}
                    </div>

                    {/* Certifications */}
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-4">
                        Certifications & Qualifications
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {profileData.certifications.map((cert, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400"
                          >
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {cert}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Preferences Tab */}
              {activeTab === 'preferences' && (
                <div>
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-6">
                    Preferences & Settings
                  </h3>
                  <div className="space-y-8">
                    {/* Language & Timezone */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                          Language
                        </label>
                        {isEditing ? (
                          <select
                            value={profileData.language}
                            onChange={(e) => handleInputChange('language', e.target.value)}
                            className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          >
                            <option value="Bahasa Indonesia">Bahasa Indonesia</option>
                            <option value="English">English</option>
                            <option value="Mandarin">Mandarin</option>
                          </select>
                        ) : (
                          <p className="text-slate-900 dark:text-white font-medium py-2">{profileData.language}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                          Timezone
                        </label>
                        {isEditing ? (
                          <select
                            value={profileData.timezone}
                            onChange={(e) => handleInputChange('timezone', e.target.value)}
                            className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          >
                            <option value="Asia/Jakarta">Asia/Jakarta (WIB)</option>
                            <option value="Asia/Makassar">Asia/Makassar (WITA)</option>
                            <option value="Asia/Jayapura">Asia/Jayapura (WIT)</option>
                          </select>
                        ) : (
                          <p className="text-slate-900 dark:text-white font-medium py-2">{profileData.timezone}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                          Currency
                        </label>
                        {isEditing ? (
                          <select
                            value={profileData.currency}
                            onChange={(e) => handleInputChange('currency', e.target.value)}
                            className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          >
                            <option value="IDR">IDR (Indonesian Rupiah)</option>
                            <option value="USD">USD (US Dollar)</option>
                            <option value="SGD">SGD (Singapore Dollar)</option>
                          </select>
                        ) : (
                          <p className="text-slate-900 dark:text-white font-medium py-2">{profileData.currency}</p>
                        )}
                      </div>
                    </div>

                    {/* Notification Preferences */}
                    <div>
                      <h4 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                        Notification Preferences
                      </h4>
                      <div className="space-y-4">
                        {Object.entries(profileData.notifications).map(([key, value]) => (
                          <div key={key} className="flex items-center justify-between py-3 border-b border-slate-200 dark:border-slate-700">
                            <div>
                              <p className="font-medium text-slate-900 dark:text-white capitalize">
                                {key === 'email' ? 'Email Notifications' : 
                                 key === 'sms' ? 'SMS Notifications' :
                                 key === 'push' ? 'Push Notifications' :
                                 'Marketing Communications'}
                              </p>
                              <p className="text-sm text-slate-600 dark:text-slate-400">
                                {key === 'email' ? 'Receive project updates via email' :
                                 key === 'sms' ? 'Receive urgent alerts via SMS' :
                                 key === 'push' ? 'Browser and mobile push notifications' :
                                 'Promotional offers and market updates'}
                              </p>
                            </div>
                            <button
                              onClick={() => isEditing && handleInputChange(`notifications.${key}`, !value)}
                              disabled={!isEditing}
                              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                                value ? 'bg-blue-600' : 'bg-slate-200 dark:bg-slate-700'
                              } ${!isEditing ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                            >
                              <span
                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                  value ? 'translate-x-6' : 'translate-x-1'
                                }`}
                              />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Security Tab */}
              {activeTab === 'security' && (
                <div>
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-6">
                    Security Settings
                  </h3>
                  <div className="space-y-8">
                    {/* Password Change */}
                    <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-6">
                      <h4 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                        Change Password
                      </h4>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            Current Password
                          </label>
                          <input
                            type="password"
                            className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Enter current password"
                          />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                              New Password
                            </label>
                            <input
                              type="password"
                              className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder="Enter new password"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                              Confirm New Password
                            </label>
                            <input
                              type="password"
                              className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder="Confirm new password"
                            />
                          </div>
                        </div>
                        <button className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
                          Update Password
                        </button>
                      </div>
                    </div>

                    {/* Two-Factor Authentication */}
                    <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h4 className="text-lg font-semibold text-slate-900 dark:text-white">
                            Two-Factor Authentication
                          </h4>
                          <p className="text-slate-600 dark:text-slate-400 text-sm">
                            Add an extra layer of security to your account
                          </p>
                        </div>
                        <button className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors">
                          Enable 2FA
                        </button>
                      </div>
                    </div>

                    {/* Login Activity */}
                    <div>
                      <h4 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                        Recent Login Activity
                      </h4>
                      <div className="space-y-3">
                        {[
                          { device: 'Chrome on Windows', location: 'Jakarta, Indonesia', time: '2 hours ago', current: true },
                          { device: 'Safari on iPhone', location: 'Jakarta, Indonesia', time: '1 day ago', current: false },
                          { device: 'Chrome on Windows', location: 'Jakarta, Indonesia', time: '3 days ago', current: false }
                        ].map((activity, index) => (
                          <div key={index} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                                <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                              </div>
                              <div>
                                <p className="font-medium text-slate-900 dark:text-white">
                                  {activity.device} {activity.current && <span className="text-green-600 dark:text-green-400">(Current)</span>}
                                </p>
                                <p className="text-sm text-slate-600 dark:text-slate-400">
                                  {activity.location} • {activity.time}
                                </p>
                              </div>
                            </div>
                            {!activity.current && (
                              <button className="text-red-600 hover:text-red-700 dark:text-red-400 text-sm font-medium">
                                Revoke
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}