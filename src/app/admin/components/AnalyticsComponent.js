'use client';

import { useState } from 'react';

export default function AnalyticsComponent() {
  const [timeRange, setTimeRange] = useState('last_30_days');
  
  const [metrics] = useState({
    totalRevenue: 'Rp 2.4B',
    totalProjects: 145,
    activeUsers: 432,
    completionRate: '87%',
    avgProjectValue: 'Rp 16.5M',
    customerSatisfaction: '4.8/5'
  });

  const [chartData] = useState({
    projectsByMonth: [
      { month: 'Jan', projects: 12, revenue: 185000000 },
      { month: 'Feb', projects: 15, revenue: 225000000 },
      { month: 'Mar', projects: 18, revenue: 290000000 },
      { month: 'Apr', projects: 22, revenue: 385000000 },
      { month: 'May', projects: 28, revenue: 465000000 },
      { month: 'Jun', projects: 25, revenue: 420000000 }
    ],
    projectsByCategory: [
      { category: 'Interior Design', count: 45, percentage: 31 },
      { category: 'Construction', count: 38, percentage: 26 },
      { category: 'Architecture', count: 32, percentage: 22 },
      { category: 'Renovation', count: 30, percentage: 21 }
    ],
    userGrowth: [
      { month: 'Jan', owners: 120, vendors: 180 },
      { month: 'Feb', owners: 135, vendors: 195 },
      { month: 'Mar', owners: 152, vendors: 208 },
      { month: 'Apr', owners: 168, vendors: 225 },
      { month: 'May', owners: 175, vendors: 238 },
      { month: 'Jun', owners: 189, vendors: 243 }
    ]
  });

  const [topPerformers] = useState({
    vendors: [
      { name: 'CV. Construction Pro', projects: 15, rating: 4.9, revenue: 'Rp 820M' },
      { name: 'PT. Design Master', projects: 12, rating: 4.8, revenue: 'Rp 650M' },
      { name: 'Studio Arsitek Modern', projects: 10, rating: 4.7, revenue: 'Rp 580M' }
    ],
    clients: [
      { name: 'PT. Kuliner Modern', projects: 8, spent: 'Rp 450M', rating: 4.8 },
      { name: 'CV. Retail Maju', projects: 6, spent: 'Rp 380M', rating: 4.7 },
      { name: 'PT. Properti Prima', projects: 5, spent: 'Rp 320M', rating: 4.9 }
    ]
  });

  const formatCurrency = (amount) => {
    if (amount >= 1000000000) {
      return `Rp ${(amount / 1000000000).toFixed(1)}B`;
    } else if (amount >= 1000000) {
      return `Rp ${(amount / 1000000).toFixed(1)}M`;
    } else if (amount >= 1000) {
      return `Rp ${(amount / 1000).toFixed(0)}K`;
    } else {
      return `Rp ${amount.toLocaleString('id-ID')}`;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            Analytics
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2">
            Platform performance and business insights
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          <select 
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
          >
            <option value="last_7_days">Last 7 Days</option>
            <option value="last_30_days">Last 30 Days</option>
            <option value="last_3_months">Last 3 Months</option>
            <option value="last_6_months">Last 6 Months</option>
            <option value="last_year">Last Year</option>
          </select>
          
          <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors">
            Export Report
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Revenue</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white mt-2">{metrics.totalRevenue}</p>
              <p className="text-sm text-green-600 dark:text-green-400 mt-1">+12.5%</p>
            </div>
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Projects</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white mt-2">{metrics.totalProjects}</p>
              <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">+8.2%</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Active Users</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white mt-2">{metrics.activeUsers}</p>
              <p className="text-sm text-purple-600 dark:text-purple-400 mt-1">+15.3%</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Completion Rate</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white mt-2">{metrics.completionRate}</p>
              <p className="text-sm text-green-600 dark:text-green-400 mt-1">+2.1%</p>
            </div>
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Avg Project Value</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white mt-2">{metrics.avgProjectValue}</p>
              <p className="text-sm text-orange-600 dark:text-orange-400 mt-1">+5.7%</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Satisfaction</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white mt-2">{metrics.customerSatisfaction}</p>
              <p className="text-sm text-yellow-600 dark:text-yellow-400 mt-1">+0.2</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Projects by Month */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">Projects & Revenue by Month</h3>
          <div className="space-y-4">
            {chartData.projectsByMonth.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 text-sm font-medium text-slate-600 dark:text-slate-400">{item.month}</div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-sm text-slate-900 dark:text-white">{item.projects} projects</span>
                      <span className="text-sm text-slate-500 dark:text-slate-400">•</span>
                      <span className="text-sm text-slate-600 dark:text-slate-400">{formatCurrency(item.revenue)}</span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                      <div 
                        className="bg-indigo-600 dark:bg-indigo-400 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${(item.projects / 30) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Projects by Category */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">Projects by Category</h3>
          <div className="space-y-4">
            {chartData.projectsByCategory.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-4 flex-1">
                  <div className="w-24 text-sm font-medium text-slate-900 dark:text-white">{item.category}</div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-slate-600 dark:text-slate-400">{item.count} projects</span>
                      <span className="text-sm font-medium text-slate-900 dark:text-white">{item.percentage}%</span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-300 ${
                          index === 0 ? 'bg-blue-500' :
                          index === 1 ? 'bg-green-500' :
                          index === 2 ? 'bg-purple-500' : 'bg-orange-500'
                        }`}
                        style={{ width: `${item.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* User Growth */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">User Growth</h3>
        <div className="space-y-4">
          {chartData.userGrowth.map((item, index) => (
            <div key={index} className="grid grid-cols-4 gap-4 items-center">
              <div className="text-sm font-medium text-slate-600 dark:text-slate-400">{item.month} 2024</div>
              
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-blue-600 dark:text-blue-400">Project Owners</span>
                  <span className="text-sm font-medium text-slate-900 dark:text-white">{item.owners}</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(item.owners / 200) * 100}%` }}
                  ></div>
                </div>
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-green-600 dark:text-green-400">Vendors</span>
                  <span className="text-sm font-medium text-slate-900 dark:text-white">{item.vendors}</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(item.vendors / 250) * 100}%` }}
                  ></div>
                </div>
              </div>
              
              <div className="text-right">
                <span className="text-sm font-medium text-slate-900 dark:text-white">
                  {item.owners + item.vendors} Total
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Top Performers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Vendors */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">Top Performing Vendors</h3>
          <div className="space-y-4">
            {topPerformers.vendors.map((vendor, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-medium">#{index + 1}</span>
                  </div>
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white">{vendor.name}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {vendor.projects} projects • ⭐ {vendor.rating}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium text-slate-900 dark:text-white">{vendor.revenue}</p>
                  <p className="text-sm text-green-600 dark:text-green-400">Revenue</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Clients */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">Top Clients</h3>
          <div className="space-y-4">
            {topPerformers.clients.map((client, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-medium">#{index + 1}</span>
                  </div>
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white">{client.name}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {client.projects} projects • ⭐ {client.rating}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium text-slate-900 dark:text-white">{client.spent}</p>
                  <p className="text-sm text-purple-600 dark:text-purple-400">Spent</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
