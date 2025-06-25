import React, { useState } from 'react';

const Tender = () => {
  const [sortField, setSortField] = useState('');
  const [sortDirection, setSortDirection] = useState('asc');

  const [marketData, setMarketData] = useState([
    {
      id: 1,
      projectTitle: "Bangun Interior Rumah BSD Minimalis Modern",
      location: "Jakarta Selatan",
      clientName: "John Doe",
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
      clientName: "PT Maju Jaya",
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
      clientName: "Maria Sari",
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
      clientName: "Budi Santoso",
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
      clientName: "CV Food Paradise",
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
      clientName: "Hotel Boutique Ltd",
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
      clientName: "PT Logistik Prima",
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
      clientName: "Yayasan Pendidikan",
      projectType: "Renovasi",
      propertyType: "Sekolah",
      budget: "Rp 680,000,000",
      duration: "5 bulan",
      bidCountdown: "6 hari 4 jam",
    },
  ]);

  const handleSort = (field) => {
    const direction = field === sortField && sortDirection === 'asc' ? 'desc' : 'asc';
    setSortField(field);
    setSortDirection(direction);

    const sortedData = [...marketData].sort((a, b) => {
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

        {/* Tender Table */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
          {/* Table Header */}
          <div className="bg-slate-50 dark:bg-slate-700/50 px-6 py-4 border-b border-slate-200 dark:border-slate-600">
            <div className="grid grid-cols-7 gap-4 text-sm font-semibold text-slate-700 dark:text-slate-300">
              <SortableHeader field="projectTitle">Judul Proyek</SortableHeader>
              <SortableHeader field="location">Lokasi</SortableHeader>
              <SortableHeader field="clientName">Klien</SortableHeader>
              <SortableHeader field="projectType">Tipe</SortableHeader>
              <SortableHeader field="propertyType">Properti</SortableHeader>
              <SortableHeader field="budget">Budget</SortableHeader>
              <SortableHeader field="bidCountdown">Deadline</SortableHeader>
            </div>
          </div>

          {/* Table Body */}
          <div className="divide-y divide-slate-200 dark:divide-slate-700">
            {marketData.map((item) => (
              <div
                key={item.id}
                className="px-6 py-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors cursor-pointer"
              >
                <div className="grid grid-cols-7 gap-4 items-center">
                  {/* Project Title */}
                  <div className="text-sm font-medium text-slate-900 dark:text-white">
                    {item.projectTitle}
                  </div>

                  {/* Location */}
                  <div className="text-sm text-slate-600 dark:text-slate-400">
                    {item.location}
                  </div>

                  {/* Client Name */}
                  <div className="text-sm text-slate-600 dark:text-slate-400">
                    {item.clientName}
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

                  {/* Property Type */}
                  <div className="text-sm text-slate-600 dark:text-slate-400">
                    {item.propertyType}
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
            <span className="font-medium">8</span> of{" "}
            <span className="font-medium">97</span> results
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