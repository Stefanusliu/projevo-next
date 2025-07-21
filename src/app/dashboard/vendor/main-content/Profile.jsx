'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../../../contexts/AuthContext';
import Avatar from '../../../../components/ui/Avatar';
import OTPModal from '../../../../components/auth/OTPModal';
import PhoneOTPModal from '../../../../components/auth/PhoneOTPModal';
import { FiUser, FiHome, FiMapPin, FiBriefcase, FiSettings, FiShield, FiAlertTriangle } from 'react-icons/fi';

export default function Profile() {
  const { user, userProfile, updateUserProfile, logout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('personal');
  const [loading, setLoading] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [message, setMessage] = useState('');
  const [showEmailOTP, setShowEmailOTP] = useState(false);
  const [showPhoneOTP, setShowPhoneOTP] = useState(false);
  const [verifyingEmail, setVerifyingEmail] = useState(false);
  const [verifyingPhone, setVerifyingPhone] = useState(false);
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    accountType: 'individu', // 'individu' or 'perusahaan'
    npwp: '',
    company: '',
    specialization: '',
    experience: '',
    location: '',
    bio: '',
    website: '',
    license: '',
    certifications: [],
    skills: [],
    languages: [],
    avatar: '',
    projectsCompleted: 0,
    yearsOfExperience: '',
    totalBudgetManaged: '',
    averageProjectSize: ''
  });
  const [originalData, setOriginalData] = useState(profileData);

  useEffect(() => {
    if (user && userProfile) {
      setProfileData({
        firstName: userProfile.firstName || '',
        lastName: userProfile.lastName || '',
        email: userProfile.email || user.email || '',
        phone: userProfile.phone || '',
        accountType: userProfile.accountType || 'individu',
        npwp: userProfile.npwp || '',
        company: userProfile.company || '',
        specialization: userProfile.specialization || '',
        experience: userProfile.experience || '',
        location: userProfile.location || '',
        bio: userProfile.bio || '',
        website: userProfile.website || '',
        license: userProfile.license || '',
        certifications: userProfile.certifications || [],
        skills: userProfile.skills || [],
        languages: userProfile.languages || [],
        avatar: userProfile.photoURL || user.photoURL || '',
        projectsCompleted: userProfile.projectsCompleted || 0,
        yearsOfExperience: userProfile.yearsOfExperience || '',
        totalBudgetManaged: userProfile.totalBudgetManaged || '',
        averageProjectSize: userProfile.averageProjectSize || ''
      });
      setOriginalData({
        firstName: userProfile.firstName || '',
        lastName: userProfile.lastName || '',
        email: userProfile.email || user.email || '',
        phone: userProfile.phone || '',
        company: userProfile.company || '',
        specialization: userProfile.specialization || '',
        experience: userProfile.experience || '',
        location: userProfile.location || '',
        bio: userProfile.bio || '',
        website: userProfile.website || '',
        license: userProfile.license || '',
        certifications: userProfile.certifications || [],
        skills: userProfile.skills || [],
        languages: userProfile.languages || [],
        avatar: userProfile.photoURL || user.photoURL || '',
        projectsCompleted: userProfile.projectsCompleted || 0,
        yearsOfExperience: userProfile.yearsOfExperience || '',
        totalBudgetManaged: userProfile.totalBudgetManaged || '',
        averageProjectSize: userProfile.averageProjectSize || ''
      });
    }
  }, [user, userProfile]);

  const handleInputChange = (field, value) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!user) return;
    setLoading(true);
    setMessage('');
    try {
      await updateUserProfile(profileData);
      setOriginalData(profileData);
      setIsEditing(false);
      setMessage('Profile updated successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setProfileData(originalData);
    setIsEditing(false);
    setMessage('');
  };

  // Define tabs based on account type
  const tabs = [
    { id: 'personal', label: 'Personal Info', icon: <FiUser className="w-4 h-4" /> },
    // Only show company tab for 'perusahaan' account type
    ...(profileData.accountType === 'perusahaan' ? [{ id: 'company', label: 'Company', icon: <FiHome className="w-4 h-4" /> }] : []),
    { id: 'professional', label: 'Professional', icon: <FiBriefcase className="w-4 h-4" /> },
    { id: 'preferences', label: 'Preferences', icon: <FiSettings className="w-4 h-4" /> },
    { id: 'security', label: 'Security', icon: <FiShield className="w-4 h-4" /> }
  ];

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#d9d9d9' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
              <p className="text-gray-600 mt-2">Manage your account information and preferences</p>
            </div>
            <div className="flex items-center space-x-3">
              {isEditing ? (
                <>
                  <button onClick={handleCancel} disabled={loading} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50">Cancel</button>
                  <button onClick={handleSave} disabled={loading} className="px-6 py-2 text-white rounded-lg transition-colors shadow-lg hover:shadow-xl disabled:opacity-50" style={{ backgroundColor: '#2373FF' }}>{loading ? 'Saving...' : 'Save Changes'}</button>
                </>
              ) : (
                <>
                  <button onClick={() => setIsEditing(true)} className="px-6 py-2 text-white rounded-lg transition-colors shadow-lg hover:shadow-xl flex items-center space-x-2" style={{ backgroundColor: '#2373FF' }}><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg><span>Edit Profile</span></button>
                  <button onClick={() => logout()} className="px-4 py-2 border border-red-300 text-red-700 bg-red-50 rounded-lg hover:bg-red-100 transition-colors flex items-center space-x-2"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg><span>Logout</span></button>
                </>
              )}
            </div>
          </div>
        </div>
        {message && (
          <div className={`mb-6 p-4 rounded-lg ${message.includes('success') || message.includes('successfully') ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>{message}</div>
        )}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Profile Summary Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-8">
              <div className="text-center">
                <div className="relative inline-block">
                  <Avatar 
                    src={profileData.avatar} 
                    alt="Profile" 
                    name={profileData.accountType === 'perusahaan' 
                      ? profileData.company 
                      : `${profileData.firstName} ${profileData.lastName}`
                    }
                    size={128} 
                    className="border-4 border-blue-100 mx-auto" 
                  />
                </div>
                <h2 className="text-xl font-bold text-gray-900 mt-4">
                  {profileData.accountType === 'perusahaan' 
                    ? profileData.company || 'Company Name'
                    : `${profileData.firstName} ${profileData.lastName}`
                  }
                </h2>
                <p className="font-medium" style={{ color: '#2373FF' }}>
                  {profileData.specialization || 'Vendor'}
                </p>
                {profileData.accountType === 'perusahaan' && (
                  <p className="text-gray-600 text-sm mt-1">{profileData.company}</p>
                )}
                <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-gray-200">
                  <div className="text-center">
                    <div className="text-2xl font-bold" style={{ color: '#2373FF' }}>{profileData.projectsCompleted || 0}</div>
                    <div className="text-xs text-gray-600">Projects</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-600">{profileData.yearsOfExperience || 0}</div>
                    <div className="text-xs text-gray-600">Years Exp.</div>
                  </div>
                </div>
              </div>
              <nav className="mt-8 space-y-2">
                {tabs.map((tab) => (
                  <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${activeTab === tab.id ? 'text-white border-l-4 shadow-md' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'}`} style={activeTab === tab.id ? { backgroundColor: '#2373FF', borderColor: '#2373FF' } : {}}>
                    <span className="flex items-center">{tab.icon}</span>
                    <span className="font-medium">{tab.label}</span>
                  </button>
                ))}
              </nav>
            </div>
          </div>
          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
              {/* Personal Tab */}
              {activeTab === 'personal' && (
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-6">Personal Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                      {isEditing ? (
                        <input type="text" value={profileData.firstName} onChange={(e) => handleInputChange('firstName', e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                      ) : (
                        <p className="text-gray-900 font-medium py-2">{profileData.firstName}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                      {isEditing ? (
                        <input type="text" value={profileData.lastName} onChange={(e) => handleInputChange('lastName', e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                      ) : (
                        <p className="text-gray-900 font-medium py-2">{profileData.lastName}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                      {isEditing ? (
                        <input type="email" value={profileData.email} onChange={(e) => handleInputChange('email', e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                      ) : (
                        <p className="text-gray-900 font-medium py-2">{profileData.email}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                      {isEditing ? (
                        <input type="tel" value={profileData.phone} onChange={(e) => handleInputChange('phone', e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                      ) : (
                        <p className="text-gray-900 font-medium py-2">{profileData.phone}</p>
                      )}
                    </div>
                    
                    {/* NPWP field - only for perusahaan accounts */}
                    {profileData.accountType === 'perusahaan' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">NPWP</label>
                        {isEditing ? (
                          <input 
                            type="text" 
                            value={profileData.npwp} 
                            onChange={(e) => handleInputChange('npwp', e.target.value)} 
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="XX.XXX.XXX.X-XXX.XXX"
                          />
                        ) : (
                          <p className="text-gray-900 font-medium py-2">{profileData.npwp || 'Not provided'}</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
              {/* Company Tab */}
              {activeTab === 'company' && (
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-6">Company Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Company Name</label>
                      {isEditing ? (
                        <input type="text" value={profileData.company} onChange={(e) => handleInputChange('company', e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                      ) : (
                        <p className="text-gray-900 font-medium py-2">{profileData.company}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Specialization</label>
                      {isEditing ? (
                        <input type="text" value={profileData.specialization} onChange={(e) => handleInputChange('specialization', e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                      ) : (
                        <p className="text-gray-900 font-medium py-2">{profileData.specialization}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Experience</label>
                      {isEditing ? (
                        <input type="text" value={profileData.experience} onChange={(e) => handleInputChange('experience', e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                      ) : (
                        <p className="text-gray-900 font-medium py-2">{profileData.experience}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">License</label>
                      {isEditing ? (
                        <input type="text" value={profileData.license} onChange={(e) => handleInputChange('license', e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                      ) : (
                        <p className="text-gray-900 font-medium py-2">{profileData.license}</p>
                      )}
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Website</label>
                      {isEditing ? (
                        <input type="url" value={profileData.website} onChange={(e) => handleInputChange('website', e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                      ) : (
                        <a href={profileData.website ? `https://${profileData.website}` : '#'} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline font-medium py-2 block">{profileData.website}</a>
                      )}
                    </div>
                  </div>
                </div>
              )}
              {/* Professional Tab */}
              {activeTab === 'professional' && (
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-6">Professional Information</h3>
                  <div className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 text-center">
                        <div className="text-3xl font-bold text-blue-600">{profileData.yearsOfExperience || 0}</div>
                        <div className="text-sm text-blue-700 mt-1">Years of Experience</div>
                      </div>
                      <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 text-center">
                        <div className="text-3xl font-bold text-green-600">{profileData.projectsCompleted || 0}</div>
                        <div className="text-sm text-green-700 mt-1">Projects Completed</div>
                      </div>
                      <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 text-center">
                        <div className="text-2xl font-bold text-purple-600">{profileData.totalBudgetManaged || 'N/A'}</div>
                        <div className="text-sm text-purple-700 mt-1">Total Budget Managed</div>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Skills</label>
                      <div className="flex flex-wrap gap-2">
                        {profileData.skills && profileData.skills.length > 0 ? (
                          profileData.skills.map((skill, index) => (
                            <span key={index} className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">{skill}</span>
                          ))
                        ) : (
                          <p className="text-slate-500 text-sm">No skills added yet</p>
                        )}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-4">Certifications</label>
                      <div className="flex flex-wrap gap-2">
                        {profileData.certifications && profileData.certifications.length > 0 ? (
                          profileData.certifications.map((cert, index) => (
                            <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"><svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>{cert}</span>
                          ))
                        ) : (
                          <p className="text-slate-500 text-sm">No certifications added yet</p>
                        )}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-4">Languages</label>
                      <div className="flex flex-wrap gap-2">
                        {profileData.languages && profileData.languages.length > 0 ? (
                          profileData.languages.map((lang, index) => (
                            <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">{lang}</span>
                          ))
                        ) : (
                          <p className="text-slate-500 text-sm">No languages added yet</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {/* Preferences Tab */}
              {activeTab === 'preferences' && (
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-6">Preferences & Settings</h3>
                  <div className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
                        {isEditing ? (
                          <select value={profileData.language || ''} onChange={(e) => handleInputChange('language', e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                            <option value="">Select Language</option>
                            <option value="Indonesian">Indonesian</option>
                            <option value="English">English</option>
                            <option value="Mandarin">Mandarin</option>
                          </select>
                        ) : (
                          <p className="text-gray-900 font-medium py-2">{profileData.language}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
                        {isEditing ? (
                          <select value={profileData.currency || ''} onChange={(e) => handleInputChange('currency', e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                            <option value="">Select Currency</option>
                            <option value="IDR">IDR (Indonesian Rupiah)</option>
                            <option value="USD">USD (US Dollar)</option>
                            <option value="SGD">SGD (Singapore Dollar)</option>
                          </select>
                        ) : (
                          <p className="text-gray-900 font-medium py-2">{profileData.currency}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {/* Security Tab */}
              {activeTab === 'security' && (
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-6">Security Settings</h3>
                  <div className="space-y-8">
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">Change Password</h4>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
                          <input type="password" className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="Enter current password" />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                            <input type="password" className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="Enter new password" />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
                            <input type="password" className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="Confirm new password" />
                          </div>
                        </div>
                        <button className="px-6 py-2 text-white rounded-lg transition-colors" style={{ backgroundColor: '#2373FF' }}>Update Password</button>
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
