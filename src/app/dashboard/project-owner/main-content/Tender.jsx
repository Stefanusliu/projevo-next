import React, { useState, useEffect, useRef } from 'react';

const Tender = () => {
  const [sortField, setSortField] = useState('');
  const [sortDirection, setSortDirection] = useState('asc');
  const [selectedLocations, setSelectedLocations] = useState([]);
  const [showLocationFilter, setShowLocationFilter] = useState(false);
  const locationFilterRef = useRef(null);

  const [marketData, setMarketData] = useState([
    {
      id: 1,
      projectTitle: "Bangun Interior Rumah BSD Minimalis Modern",
      location: "Jakarta Selatan",
      scope: ["Interior", "Furniture"],
      projectType: "Bangun",
      propertyType: "Rumah Tinggal",
      budget: "Rp 750,000,000",
      duration: "4 bulan",
      bidCountdown: "2 hari 14 jam",
    },
    {
      id: 2,
      projectTitle: "Renovasi Kantor Modern SCBD",
      location: "Jakarta Pusat",
      scope: ["Interior", "Sipil"],
      projectType: "Renovasi",
      propertyType: "Kantor",
      budget: "Rp 2,500,000,000",
      duration: "8 bulan",
      bidCountdown: "5 hari 8 jam",
    },
    {
      id: 3,
      projectTitle: "Desain Interior Apartemen Luxury Sudirman",
      location: "Jakarta Pusat",
      scope: ["Interior", "Furniture"],
      projectType: "Desain",
      propertyType: "Apartemen",
      budget: "Rp 520,000,000",
      duration: "12 minggu",
      bidCountdown: "1 minggu 3 hari",
    },
    {
      id: 4,
      projectTitle: "Bangun Ruko 3 Lantai Kelapa Gading",
      location: "Jakarta Utara",
      scope: ["Sipil", "Eksterior"],
      projectType: "Bangun",
      propertyType: "Ruko",
      budget: "Rp 1,200,000,000",
      duration: "6 bulan",
      bidCountdown: "3 hari 6 jam",
    },
    {
      id: 5,
      projectTitle: "Renovasi Restaurant Modern PIK",
      location: "Jakarta Utara",
      scope: ["Interior", "Furniture"],
      projectType: "Renovasi",
      propertyType: "Restoran",
      budget: "Rp 850,000,000",
      duration: "4 bulan",
      bidCountdown: "2 minggu 1 hari",
    },
    {
      id: 6,
      projectTitle: "Desain Hotel Boutique Kemang",
      location: "Jakarta Selatan",
      scope: ["Interior", "Eksterior", "Taman & Hardscape"],
      projectType: "Desain",
      propertyType: "Hotel / Penginapan",
      budget: "Rp 3,800,000,000",
      duration: "10 bulan",
      bidCountdown: "1 minggu 2 hari",
    },
    {
      id: 7,
      projectTitle: "Bangun Gudang Industri Cakung",
      location: "Jakarta Timur",
      scope: ["Sipil"],
      projectType: "Bangun",
      propertyType: "Gudang",
      budget: "Rp 4,200,000,000",
      duration: "8 bulan",
      bidCountdown: "4 hari 12 jam",
    },
    {
      id: 8,
      projectTitle: "Renovasi Sekolah Dasar Tangerang",
      location: "Tangerang",
      scope: ["Interior", "Sipil"],
      projectType: "Renovasi",
      propertyType: "Sekolah",
      budget: "Rp 680,000,000",
      duration: "5 bulan",
      bidCountdown: "6 hari 4 jam",
    },
  ]);

  // Get unique locations for filter
  const allLocations = [...new Set(marketData.map(item => item.location))];

  // Filter data based on selected locations
  const filteredData = selectedLocations.length > 0 
    ? marketData.filter(item => selectedLocations.includes(item.location))
    : marketData;

  const handleLocationFilter = (location) => {
    setSelectedLocations(prev => 
      prev.includes(location) 
        ? prev.filter(loc => loc !== location)
        : [...prev, location]
    );
  };

  // Close location filter when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (locationFilterRef.current && !locationFilterRef.current.contains(event.target)) {
        setShowLocationFilter(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSort = (field) => {
    const direction = field === sortField && sortDirection === 'asc' ? 'desc' : 'asc';
    setSortField(field);
    setSortDirection(direction);

    const sortedData = [...filteredData].sort((a, b) => {
      let aValue = a[field];
      let bValue = b[field];

      // Handle budget sorting (remove Rp and convert to number)
      if (field === 'budget') {
        aValue = parseInt(aValue.replace(/[^0-9]/g, ''));
        bValue = parseInt(bValue.replace(/[^0-9]/g, ''));
      }

      if (direction === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setMarketData(sortedData);
  };

  const SortableHeader = ({ field, children }) => (
    <button
      onClick={() => handleSort(field)}
      className="flex items-center space-x-1 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
    >
      <span>{children}</span>
      {sortField === field && (
        <svg className={`w-4 h-4 ${sortDirection === 'asc' ? 'rotate-180' : ''}`} fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      )}
    </button>
  );

  const getBidCountdownColor = (countdown) => {
    // Extract time values and convert to hours for comparison
    let totalHours = 0;
    
    if (countdown.includes('minggu')) {
      const weeks = parseInt(countdown.match(/(\d+)\s*minggu/)?.[1] || 0);
      totalHours += weeks * 7 * 24;
    }
    if (countdown.includes('hari')) {
      const days = parseInt(countdown.match(/(\d+)\s*hari/)?.[1] || 0);
      totalHours += days * 24;
    }
    if (countdown.includes('jam')) {
      const hours = parseInt(countdown.match(/(\d+)\s*jam/)?.[1] || 0);
      totalHours += hours;
    }

    if (totalHours <= 72) // 3 days or less
      return "text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-900/20";
    if (totalHours <= 168) // 7 days or less
      return "text-orange-600 bg-orange-50 dark:text-orange-400 dark:bg-orange-900/20";
    return "text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-900/20";
  };

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tender Title */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            Tender
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2">
            Discover and connect with qualified contractors for your projects
          </p>
        </div>

        {/* Filters */}
        <div className="mb-6">
          <div className="flex items-center gap-4">
            {/* Location Filter */}
            <div className="relative" ref={locationFilterRef}>
              <button
                onClick={() => setShowLocationFilter(!showLocationFilter)}
                className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="text-sm font-medium">Lokasi</span>
                {selectedLocations.length > 0 && (
                  <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                    {selectedLocations.length}
                  </span>
                )}
                <svg className={`w-4 h-4 transition-transform ${showLocationFilter ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Location Filter Dropdown */}
              {showLocationFilter && (
                <div className="absolute top-full left-0 mt-2 w-64 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg shadow-lg z-10">
                  <div className="p-4">
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">Pilih Lokasi</h3>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {allLocations.map(location => (
                        <label key={location} className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selectedLocations.includes(location)}
                            onChange={() => handleLocationFilter(location)}
                            className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                          />
                          <span className="text-sm text-slate-700 dark:text-slate-300">{location}</span>
                        </label>
                      ))}
                    </div>
                    {selectedLocations.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-600">
                        <button
                          onClick={() => setSelectedLocations([])}
                          className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                          Clear All
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tender Table */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
          {/* Table Header */}
          <div className="bg-slate-50 dark:bg-slate-700/50 px-6 py-4 border-b border-slate-200 dark:border-slate-600">
            <div className="grid grid-cols-6 gap-4 text-sm font-semibold text-slate-700 dark:text-slate-300">
              <SortableHeader field="projectTitle">Judul Proyek</SortableHeader>
              <SortableHeader field="location">Lokasi</SortableHeader>
              <SortableHeader field="scope">Ruang Lingkup</SortableHeader>
              <SortableHeader field="projectType">Tipe</SortableHeader>
              <SortableHeader field="budget">Budget</SortableHeader>
              <SortableHeader field="bidCountdown">Deadline</SortableHeader>
            </div>
          </div>

          {/* Table Body */}
          <div className="divide-y divide-slate-200 dark:divide-slate-700">
            {filteredData.map((item) => (
              <div
                key={item.id}
                className="px-6 py-4 transition-colors cursor-pointer"
              >
                <div className="grid grid-cols-6 gap-4 items-center">
                  {/* Project Title */}
                  <div className="text-sm font-medium text-slate-900 dark:text-white">
                    {item.projectTitle}
                  </div>

                  {/* Location */}
                  <div className="text-sm text-slate-600 dark:text-slate-400">
                    {item.location}
                  </div>

                  {/* Scope (Ruang Lingkup) */}
                  <div className="flex flex-wrap gap-1">
                    {item.scope.map((scopeItem, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400"
                      >
                        {scopeItem}
                      </span>
                    ))}
                  </div>

                  {/* Project Type */}
                  <div>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        item.projectType === "Desain"
                          ? "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400"
                          : item.projectType === "Bangun"
                          ? "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400"
                          : item.projectType === "Renovasi"
                          ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                          : "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400"
                      }`}
                    >
                      {item.projectType}
                    </span>
                  </div>

                  {/* Budget */}
                  <div className="text-sm font-semibold text-slate-900 dark:text-white">
                    {item.budget}
                  </div>

                  {/* Bid Countdown */}
                  <div>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getBidCountdownColor(
                        item.bidCountdown
                      )}`}
                    >
                      {item.bidCountdown}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between mt-6">
          <div className="text-sm text-slate-600 dark:text-slate-400">
            Showing <span className="font-medium">1</span> to{" "}
            <span className="font-medium">{filteredData.length}</span> of{" "}
            <span className="font-medium">{filteredData.length}</span> results
            {selectedLocations.length > 0 && (
              <span className="ml-2 text-blue-600 dark:text-blue-400">
                (filtered by {selectedLocations.length} location{selectedLocations.length > 1 ? 's' : ''})
              </span>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <button className="px-3 py-2 text-sm font-medium text-slate-500 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700">
              Previous
            </button>
            <button className="px-3 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700">
              1
            </button>
            <button className="px-3 py-2 text-sm font-medium text-slate-500 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700">
              2
            </button>
            <button className="px-3 py-2 text-sm font-medium text-slate-500 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700">
              3
            </button>
            <button className="px-3 py-2 text-sm font-medium text-slate-500 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700">
              Next
            </button>
          </div>
        </div>
      </main>
  )
}

export default Tender