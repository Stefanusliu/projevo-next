import React, { useState } from 'react';

const Tender = () => {
  const [marketData] = useState([
        {
          id: 1,
          category: "Interior Design",
          subcategory: "Restaurant Design",
          type: "Interior",
          industry: "Food & Beverage",
          name: "Modern Restaurant Interior - PIK Jakarta",
          budget: "Rp 750,000,000",
          timeEstimation: "4 months",
          bidCountdown: "2 days left",
        },
        {
          id: 2,
          category: "Construction",
          subcategory: "Commercial Building",
          type: "Construction",
          industry: "Retail",
          name: "Shopping Mall Extension - Kemang",
          budget: "Rp 2,500,000,000",
          timeEstimation: "8 months",
          bidCountdown: "5 days left",
        },
        {
          id: 3,
          category: "Architecture",
          subcategory: "Residential Complex",
          type: "Architecture",
          industry: "Real Estate",
          name: "Luxury Apartment Design - Sudirman",
          budget: "Rp 5,200,000,000",
          timeEstimation: "12 months",
          bidCountdown: "10 days left",
        },
        {
          id: 4,
          category: "Construction",
          subcategory: "Office Building",
          type: "Construction",
          industry: "Corporate",
          name: "Corporate Headquarters - Thamrin",
          budget: "Rp 520,000,000",
          timeEstimation: "3.5 months",
          bidCountdown: "3 days left",
        },
        {
          id: 5,
          category: "Interior Design",
          subcategory: "Bar & Lounge",
          type: "Interior",
          industry: "Entertainment",
          name: "Rooftop Bar Design - SCBD Jakarta",
          budget: "Rp 850,000,000",
          timeEstimation: "4 months",
          bidCountdown: "15 days left",
        },
        {
          id: 6,
          category: "Construction",
          subcategory: "Renovation",
          type: "Renovation",
          industry: "Food & Beverage",
          name: "Bakery Shop Renovation - Kelapa Gading",
          budget: "Rp 180,000,000",
          timeEstimation: "8 weeks",
          bidCountdown: "7 days left",
        },
        {
          id: 7,
          category: "Interior Design",
          subcategory: "Office Design",
          type: "Interior",
          industry: "Corporate",
          name: "Startup Office Interior - Kuningan",
          budget: "Rp 320,000,000",
          timeEstimation: "10 weeks",
          bidCountdown: "9 days left",
        },
        {
          id: 8,
          category: "Architecture",
          subcategory: "Facade Design",
          type: "Architecture",
          industry: "Food & Beverage",
          name: "Street Food Court Design - Senopati",
          budget: "Rp 420,000,000",
          timeEstimation: "12 weeks",
          bidCountdown: "6 days left",
        },
  ]);

  const getBidCountdownColor = (countdown) => {
    const days = parseInt(countdown.split(" ")[0]);
    if (days <= 3)
      return "text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-900/20";
    if (days <= 7)
      return "text-orange-600 bg-orange-50 dark:text-orange-400 dark:bg-orange-900/20";
    return "text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-900/20";
  };

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Today's Market Title */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            Today&apos;s Market
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2">
            Discover and connect with qualified contractors for your projects
          </p>
        </div>

        {/* Market Table */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
          {/* Table Header */}
          <div className="bg-slate-50 dark:bg-slate-700/50 px-6 py-4 border-b border-slate-200 dark:border-slate-600">
            <div className="grid grid-cols-8 gap-4 text-sm font-semibold text-slate-700 dark:text-slate-300">
              <div>Category</div>
              <div>Subcategory</div>
              <div>Type</div>
              <div>Industry</div>
              <div>Name</div>
              <div>Budget</div>
              <div>Time Estimation</div>
              <div>Bid Countdown</div>
            </div>
          </div>

          {/* Table Body */}
          <div className="divide-y divide-slate-200 dark:divide-slate-700">
            {marketData.map((item) => (
              <div
                key={item.id}
                className="px-6 py-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors cursor-pointer"
              >
                <div className="grid grid-cols-8 gap-4 items-center">
                  {/* Category */}
                  <div className="text-sm font-medium text-slate-900 dark:text-white">
                    {item.category}
                  </div>

                  {/* Subcategory */}
                  <div className="text-sm text-slate-600 dark:text-slate-400">
                    {item.subcategory}
                  </div>

                  {/* Type */}
                  <div>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        item.type === "Interior"
                          ? "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400"
                          : item.type === "Construction"
                          ? "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400"
                          : item.type === "Architecture"
                          ? "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400"
                          : item.type === "Renovation"
                          ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                          : "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400"
                      }`}
                    >
                      {item.type}
                    </span>
                  </div>

                  {/* Industry */}
                  <div className="text-sm text-slate-600 dark:text-slate-400">
                    {item.industry}
                  </div>

                  {/* Name */}
                  <div className="text-sm font-medium text-slate-900 dark:text-white">
                    {item.name}
                  </div>

                  {/* Budget */}
                  <div className="text-sm font-semibold text-slate-900 dark:text-white">
                    {item.budget}
                  </div>

                  {/* Time Estimation */}
                  <div className="text-sm text-slate-600 dark:text-slate-400">
                    {item.timeEstimation}
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