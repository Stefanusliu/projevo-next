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
    city: '',
    province: '',
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
      console.log('Profile.jsx - userProfile from AuthContext:', userProfile);
      console.log('Profile.jsx - accountType from userProfile:', userProfile.accountType);
      
      setProfileData({
        firstName: userProfile.firstName || '',
        lastName: userProfile.lastName || '',
        email: userProfile.email || user.email || '',
        phone: userProfile.phone || userProfile.phoneNumber || '',
        accountType: userProfile.accountType || 'individu',
        npwp: userProfile.npwp || '',
        company: userProfile.displayName || userProfile.company || '',
        specialization: userProfile.specialization || '',
        experience: userProfile.experience || '',
        location: userProfile.location || '',
        city: userProfile.city || '',
        province: userProfile.province || '',
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
        phone: userProfile.phone || userProfile.phoneNumber || '',
        accountType: userProfile.accountType || 'individu',
        npwp: userProfile.npwp || '',
        company: userProfile.displayName || userProfile.company || '',
        specialization: userProfile.specialization || '',
        experience: userProfile.experience || '',
        location: userProfile.location || '',
        city: userProfile.city || '',
        province: userProfile.province || '',
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
    setProfileData(prev => {
      // If province changes, clear the city to ensure consistency
      if (field === 'province' && prev.province !== value) {
        return { ...prev, [field]: value, city: '' };
      }
      return { ...prev, [field]: value };
    });
  };

  const handleSave = async () => {
    if (!user) return;
    setLoading(true);
    setMessage('');
    try {
      // Prepare the data to save
      const dataToSave = { ...profileData };
      
      // For company accounts, save company name as displayName
      if (profileData.accountType === 'perusahaan') {
        dataToSave.displayName = profileData.company;
      } else {
        // For individual accounts, save first name + last name as displayName
        dataToSave.displayName = `${profileData.firstName} ${profileData.lastName}`.trim();
      }
      
      // Ensure phone number is saved as both 'phone' and 'phoneNumber' for compatibility
      if (profileData.phone) {
        dataToSave.phone = profileData.phone;
        dataToSave.phoneNumber = profileData.phone;
      }
      
      await updateUserProfile(dataToSave);
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

  // Indonesian provinces and their cities
  const indonesianCities = {
    "Aceh": ["Banda Aceh", "Langsa", "Lhokseumawe", "Meulaboh", "Sabang", "Subulussalam", "Bireuen", "Sigli", "Calang", "Takengon"],
    "Bali": ["Denpasar", "Gianyar", "Klungkung", "Bangli", "Karangasem", "Buleleng", "Jembrana", "Tabanan", "Badung", "Singaraja", "Ubud", "Sanur", "Kuta", "Nusa Dua"],
    "Banten": ["Serang", "Tangerang", "Cilegon", "Tangerang Selatan", "Pandeglang", "Lebak", "Rangkasbitung", "Tigaraksa", "Serpong", "BSD City"],
    "Bengkulu": ["Bengkulu", "Argamakmur", "Curup", "Kaur", "Kepahiang", "Manna", "Muko-Muko", "Seluma", "Tais"],
    "DI Yogyakarta": ["Yogyakarta", "Bantul", "Sleman", "Gunungkidul", "Kulon Progo", "Wates", "Wonosari", "Kalasan", "Depok", "Godean"],
    "DKI Jakarta": ["Jakarta Pusat", "Jakarta Utara", "Jakarta Barat", "Jakarta Selatan", "Jakarta Timur", "Kepulauan Seribu"],
    "Gorontalo": ["Gorontalo", "Limboto", "Marisa", "Paguyaman", "Suwawa", "Tilamuta", "Kwandang", "Bone Bolango"],
    "Jambi": ["Jambi", "Sungai Penuh", "Muaro Jambi", "Bungo", "Tebo", "Merangin", "Sarolangun", "Batanghari", "Muaro Bulian", "Bangko"],
    "Jawa Barat": ["Bandung", "Bekasi", "Bogor", "Cirebon", "Depok", "Sukabumi", "Tasikmalaya", "Banjar", "Cimahi", "Garut", "Indramayu", "Karawang", "Kuningan", "Majalengka", "Purwakarta", "Subang", "Sumedang", "Cianjur", "Pangandaran"],
    "Jawa Tengah": ["Semarang", "Surakarta", "Magelang", "Salatiga", "Pekalongan", "Tegal", "Cilacap", "Purwokerto", "Klaten", "Yogyakarta", "Boyolali", "Brebes", "Demak", "Grobogan", "Jepara", "Karanganyar", "Kebumen", "Kendal", "Kudus", "Pati", "Pemalang", "Purbalingga", "Purworejo", "Rembang", "Sragen", "Sukoharjo", "Temanggung", "Wonogiri", "Wonosobo", "Banjarnegara", "Blora", "Batang"],
    "Jawa Timur": ["Surabaya", "Malang", "Kediri", "Blitar", "Madiun", "Probolinggo", "Pasuruan", "Mojokerto", "Batu", "Jember", "Lumajang", "Bondowoso", "Banyuwangi", "Situbondo", "Nganjuk", "Magetan", "Ngawi", "Bojonegoro", "Tuban", "Lamongan", "Gresik", "Bangkalan", "Sampang", "Pamekasan", "Sumenep", "Sidoarjo", "Jombang", "Tulungagung", "Trenggalek", "Ponorogo", "Pacitan"],
    "Kalimantan Barat": ["Pontianak", "Singkawang", "Ketapang", "Sintang", "Putussibau", "Sambas", "Mempawah", "Sanggau", "Sekadau", "Melawi", "Kayong Utara", "Kubu Raya", "Landak", "Bengkayang"],
    "Kalimantan Selatan": ["Banjarmasin", "Banjarbaru", "Martapura", "Kandangan", "Amuntai", "Rantau", "Kotabaru", "Pelaihari", "Barabai", "Tanjung", "Marabahan"],
    "Kalimantan Tengah": ["Palangka Raya", "Sampit", "Pangkalan Bun", "Muara Teweh", "Buntok", "Tamiang Layang", "Kuala Kurun", "Kasongan", "Kuala Pembuang", "Sukamara", "Kuala Kapuas", "Pulang Pisau", "Pahandut"],
    "Kalimantan Timur": ["Samarinda", "Balikpapan", "Bontang", "Tarakan", "Tenggarong", "Sangatta", "Tanjung Redeb", "Sendawar", "Tanah Grogot", "Muara Wahau", "Long Iram"],
    "Kalimantan Utara": ["Tarakan", "Tanjung Selor", "Nunukan", "Malinau", "Bulungan"],
    "Kepulauan Bangka Belitung": ["Pangkalpinang", "Sungailiat", "Koba", "Toboali", "Muntok", "Tanjung Pandan", "Manggar", "Dzikrillah"],
    "Kepulauan Riau": ["Tanjung Pinang", "Batam", "Bintan", "Karimun", "Lingga", "Natuna", "Anambas", "Ranai"],
    "Lampung": ["Bandar Lampung", "Metro", "Kotabumi", "Liwa", "Krui", "Kalianda", "Pringsewu", "Tulang Bawang", "Menggala", "Sukadana", "Blambangan Umpu", "Gunung Sugih", "Gedong Tataan"],
    "Maluku": ["Ambon", "Tual", "Masohi", "Namlea", "Tiakur", "Saumlaki", "Langgur", "Kairatu", "Piru"],
    "Maluku Utara": ["Ternate", "Tidore", "Sofifi", "Tobelo", "Labuha", "Maba", "Weda", "Sanana"],
    "Nusa Tenggara Barat": ["Mataram", "Bima", "Dompu", "Sumbawa Besar", "Raba", "Taliwang", "Jereweh", "Sekongkang", "Praya", "Selong", "Tanjung"],
    "Nusa Tenggara Timur": ["Kupang", "Ende", "Maumere", "Larantuka", "Ruteng", "Bajawa", "Atambua", "Kefamenanu", "Soe", "Waingapu", "Waikabubak", "Kalabahi"],
    "Papua": ["Jayapura", "Sentani", "Wamena", "Merauke", "Timika", "Nabire", "Biak", "Serui", "Manokwari", "Sorong", "Fakfak", "Kaimana", "Tembagapura"],
    "Papua Barat": ["Manokwari", "Sorong", "Fakfak", "Kaimana", "Raja Ampat", "Teluk Bintuni", "Teluk Wondama", "Tambrauw", "Maybrat", "Pegunungan Arfak"],
    "Papua Barat Daya": ["Sorong", "Tambrauw", "Maybrat", "Raja Ampat"],
    "Papua Pegunungan": ["Wamena", "Elelim", "Kurima", "Kelila"],
    "Papua Selatan": ["Merauke", "Boven Digoel", "Mappi", "Asmat"],
    "Papua Tengah": ["Nabire", "Paniai", "Mimika", "Puncak Jaya", "Puncak", "Dogiyai", "Deiyai", "Intan Jaya"],
    "Riau": ["Pekanbaru", "Dumai", "Rengat", "Tembilahan", "Bagansiapiapi", "Bangkinang", "Duri", "Pasir Pangarayan", "Pangkalan Kerinci", "Kuala Enok", "Siak Sri Indrapura"],
    "Sulawesi Barat": ["Mamuju", "Majene", "Polewali", "Tobadak", "Sendana", "Malunda"],
    "Sulawesi Selatan": ["Makassar", "Parepare", "Palopo", "Watampone", "Bulukumba", "Bantaeng", "Jeneponto", "Takalar", "Gowa", "Sinjai", "Maros", "Pangkep", "Barru", "Soppeng", "Wajo", "Sidenreng Rappang", "Pinrang", "Enrekang", "Luwu", "Tana Toraja", "Luwu Utara", "Luwu Timur", "Toraja Utara"],
    "Sulawesi Tengah": ["Palu", "Luwuk", "Poso", "Toli-Toli", "Ampana", "Bungku", "Kolonodale", "Tentena", "Parigi", "Donggala", "Buol"],
    "Sulawesi Tenggara": ["Kendari", "Bau-Bau", "Raha", "Unaaha", "Kolaka", "Tinanggea", "Lasusua", "Andoolo", "Rumbia", "Bombana"],
    "Sulawesi Utara": ["Manado", "Bitung", "Tomohon", "Kotamobagu", "Tondano", "Airmadidi", "Ratahan", "Tahuna", "Boroko", "Melonguane", "Ondong Siau"],
    "Sumatera Barat": ["Padang", "Bukittinggi", "Padang Panjang", "Payakumbuh", "Pariaman", "Sawahlunto", "Solok", "Sijunjung", "Dharmasraya", "Mentawai", "Pasaman", "Lima Puluh Kota", "Agam", "Tanah Datar", "Padang Pariaman", "Pesisir Selatan"],
    "Sumatera Selatan": ["Palembang", "Prabumulih", "Pagar Alam", "Lubuklinggau", "Lahat", "Muara Enim", "Musi Rawas", "Musi Banyuasin", "Banyuasin", "Ogan Komering Ulu", "Ogan Komering Ilir", "Ogan Ilir", "Empat Lawang"],
    "Sumatera Utara": ["Medan", "Binjai", "Tebing Tinggi", "Pematangsiantar", "Tanjung Balai", "Sibolga", "Padang Sidempuan", "Gunungsitoli", "Rantau Prapat", "Kisaran", "Balige", "Tarutung", "Dolok Sanggul", "Lintongnihuta", "Panyabungan", "Sidikalang", "Kabanjahe", "Berastagi", "Stabat", "Langkat"]
  };

  // Get cities for selected province
  const getCitiesForProvince = (province) => {
    return indonesianCities[province] || [];
  };

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
                {profileData.accountType === 'individu' && (profileData.firstName || profileData.lastName) && (
                  <p className="text-gray-600 text-sm mt-1">
                    {`${profileData.firstName || ''} ${profileData.lastName || ''}`.trim()}
                  </p>
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
                    {/* Account Type Display (Read-only) */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Account Type</label>
                      <p className="text-gray-900 font-medium py-2 px-4 bg-gray-50 rounded-lg border">
                        {profileData.accountType === 'perusahaan' ? 'Company Account (Perusahaan)' : 'Personal Account (Individu)'}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">Account type cannot be changed after registration</p>
                    </div>

                    {profileData.accountType === 'perusahaan' ? (
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Company Name</label>
                        {isEditing ? (
                          <input 
                            type="text" 
                            value={profileData.company} 
                            onChange={(e) => handleInputChange('company', e.target.value)} 
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                          />
                        ) : (
                          <p className="text-gray-900 font-medium py-2">{profileData.company || 'Not specified'}</p>
                        )}
                      </div>
                    ) : (
                      <>
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
                      </>
                    )}
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
                        <p className="text-gray-900 font-medium py-2">{profileData.phone || 'Not specified'}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                        City
                        {!profileData.city && (
                          <FiAlertTriangle className="w-4 h-4 text-orange-500 ml-2" title="City is required" />
                        )}
                      </label>
                      {isEditing ? (
                        <div>
                          {profileData.province ? (
                            <select 
                              value={profileData.city} 
                              onChange={(e) => handleInputChange('city', e.target.value)} 
                              className={`w-full px-4 py-2 border rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${!profileData.city ? 'border-orange-300' : 'border-gray-300'}`}
                            >
                              <option value="">Select City</option>
                              {getCitiesForProvince(profileData.province).map((city) => (
                                <option key={city} value={city}>{city}</option>
                              ))}
                            </select>
                          ) : (
                            <div>
                              <select 
                                disabled 
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed"
                              >
                                <option value="">Please select province first</option>
                              </select>
                              <p className="text-sm text-gray-500 mt-1">Select a province first to see available cities</p>
                            </div>
                          )}
                          {!profileData.city && profileData.province && (
                            <p className="text-orange-600 text-xs mt-1">City is required for complete profile</p>
                          )}
                        </div>
                      ) : (
                        <div>
                          <p className={`font-medium py-2 ${!profileData.city ? 'text-orange-600' : 'text-gray-900'}`}>
                            {profileData.city || 'Not specified - Please select your city'}
                          </p>
                        </div>
                      )}
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                        Province
                        {!profileData.province && (
                          <FiAlertTriangle className="w-4 h-4 text-orange-500 ml-2" title="Province is required" />
                        )}
                      </label>
                      {isEditing ? (
                        <div>
                          <select 
                            value={profileData.province} 
                            onChange={(e) => handleInputChange('province', e.target.value)} 
                            className={`w-full px-4 py-2 border rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${!profileData.province ? 'border-orange-300' : 'border-gray-300'}`}
                          >
                            <option value="">Select Province</option>
                            <option value="Aceh">Aceh</option>
                            <option value="Bali">Bali</option>
                            <option value="Banten">Banten</option>
                            <option value="Bengkulu">Bengkulu</option>
                            <option value="DI Yogyakarta">DI Yogyakarta</option>
                            <option value="DKI Jakarta">DKI Jakarta</option>
                            <option value="Gorontalo">Gorontalo</option>
                            <option value="Jambi">Jambi</option>
                            <option value="Jawa Barat">Jawa Barat</option>
                            <option value="Jawa Tengah">Jawa Tengah</option>
                            <option value="Jawa Timur">Jawa Timur</option>
                            <option value="Kalimantan Barat">Kalimantan Barat</option>
                            <option value="Kalimantan Selatan">Kalimantan Selatan</option>
                            <option value="Kalimantan Tengah">Kalimantan Tengah</option>
                            <option value="Kalimantan Timur">Kalimantan Timur</option>
                            <option value="Kalimantan Utara">Kalimantan Utara</option>
                            <option value="Kepulauan Bangka Belitung">Kepulauan Bangka Belitung</option>
                            <option value="Kepulauan Riau">Kepulauan Riau</option>
                            <option value="Lampung">Lampung</option>
                            <option value="Maluku">Maluku</option>
                            <option value="Maluku Utara">Maluku Utara</option>
                            <option value="Nusa Tenggara Barat">Nusa Tenggara Barat</option>
                            <option value="Nusa Tenggara Timur">Nusa Tenggara Timur</option>
                            <option value="Papua">Papua</option>
                            <option value="Papua Barat">Papua Barat</option>
                            <option value="Papua Barat Daya">Papua Barat Daya</option>
                            <option value="Papua Pegunungan">Papua Pegunungan</option>
                            <option value="Papua Selatan">Papua Selatan</option>
                            <option value="Papua Tengah">Papua Tengah</option>
                            <option value="Riau">Riau</option>
                            <option value="Sulawesi Barat">Sulawesi Barat</option>
                            <option value="Sulawesi Selatan">Sulawesi Selatan</option>
                            <option value="Sulawesi Tengah">Sulawesi Tengah</option>
                            <option value="Sulawesi Tenggara">Sulawesi Tenggara</option>
                            <option value="Sulawesi Utara">Sulawesi Utara</option>
                            <option value="Sumatera Barat">Sumatera Barat</option>
                            <option value="Sumatera Selatan">Sumatera Selatan</option>
                            <option value="Sumatera Utara">Sumatera Utara</option>
                          </select>
                          {!profileData.province && (
                            <p className="text-orange-600 text-xs mt-1">Province is required for complete profile</p>
                          )}
                        </div>
                      ) : (
                        <div>
                          <p className={`font-medium py-2 ${!profileData.province ? 'text-orange-600' : 'text-gray-900'}`}>
                            {profileData.province || 'Not specified - Please select your province'}
                          </p>
                        </div>
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
