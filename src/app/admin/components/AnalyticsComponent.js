'use client';

import { useState } from 'react';
import { 
  MdAttachMoney, 
  MdWork, 
  MdPeople, 
  MdTrendingUp,
  MdStar,
  MdWarning
} from 'react-icons/md';

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
          <h1 className="text-3xl font-bold text-slate-900">
            Analytics
          </h1>
          <p className="text-slate-600 mt-2">
            Platform performance and business insights
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          <select 
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-4 py-2 border border-slate-300 rounded-lg bg-white text-slate-900"
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
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Total Revenue</p>
              <p className="text-2xl font-bold text-slate-900 mt-2">{metrics.totalRevenue}</p>
              <p className="text-sm text-green-600 mt-1">+12.5%</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <MdAttachMoney className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Total Projects</p>
              <p className="text-2xl font-bold text-slate-900 mt-2">{metrics.totalProjects}</p>
              <p className="text-sm text-blue-600 mt-1">+8.2%</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <MdWork className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Active Users</p>
              <p className="text-2xl font-bold text-slate-900 mt-2">{metrics.activeUsers}</p>
              <p className="text-sm text-purple-600 mt-1">+15.3%</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <MdPeople className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Completion Rate</p>
              <p className="text-2xl font-bold text-slate-900 mt-2">{metrics.completionRate}</p>
              <p className="text-sm text-green-600 mt-1">+2.1%</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <MdAttachMoney className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Avg Project Value</p>
              <p className="text-2xl font-bold text-slate-900 mt-2">{metrics.avgProjectValue}</p>
              <p className="text-sm text-orange-600 mt-1">+5.7%</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <MdAttachMoney className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Satisfaction</p>
              <p className="text-2xl font-bold text-slate-900 mt-2">{metrics.customerSatisfaction}</p>
              <p className="text-sm text-yellow-600 mt-1">+0.2</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <MdAttachMoney className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Projects by Month */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-6">Projects & Revenue by Month</h3>
          <div className="space-y-4">
            {chartData.projectsByMonth.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 text-sm font-medium text-slate-600">{item.month}</div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-sm text-slate-900">{item.projects} projects</span>
                      <span className="text-sm text-slate-500">•</span>
                      <span className="text-sm text-slate-600">{formatCurrency(item.revenue)}</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div 
                        className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
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
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-6">Projects by Category</h3>
          <div className="space-y-4">
            {chartData.projectsByCategory.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-4 flex-1">
                  <div className="w-24 text-sm font-medium text-slate-900">{item.category}</div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-slate-600">{item.count} projects</span>
                      <span className="text-sm font-medium text-slate-900">{item.percentage}%</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
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
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-6">User Growth</h3>
        <div className="space-y-4">
          {chartData.userGrowth.map((item, index) => (
            <div key={index} className="grid grid-cols-4 gap-4 items-center">
              <div className="text-sm font-medium text-slate-600">{item.month} 2024</div>
              
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-blue-600">Project Owners</span>
                  <span className="text-sm font-medium text-slate-900">{item.owners}</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(item.owners / 200) * 100}%` }}
                  ></div>
                </div>
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-green-600">Vendors</span>
                  <span className="text-sm font-medium text-slate-900">{item.vendors}</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(item.vendors / 250) * 100}%` }}
                  ></div>
                </div>
              </div>
              
              <div className="text-right">
                <span className="text-sm font-medium text-slate-900">
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
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-6">Top Performing Vendors</h3>
          <div className="space-y-4">
            {topPerformers.vendors.map((vendor, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-medium">#{index + 1}</span>
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">{vendor.name}</p>
                    <p className="text-sm text-slate-500">
                      {vendor.projects} projects • ⭐ {vendor.rating}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium text-slate-900">{vendor.revenue}</p>
                  <p className="text-sm text-green-600">Revenue</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Clients */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-6">Top Clients</h3>
          <div className="space-y-4">
            {topPerformers.clients.map((client, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-medium">#{index + 1}</span>
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">{client.name}</p>
                    <p className="text-sm text-slate-500">
                      {client.projects} projects • ⭐ {client.rating}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium text-slate-900">{client.spent}</p>
                  <p className="text-sm text-purple-600">Spent</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
