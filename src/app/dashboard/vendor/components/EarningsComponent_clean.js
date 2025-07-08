'use client';

import { useState } from 'react';

export default function EarningsComponent() {
  const [selectedPeriod, setSelectedPeriod] = useState('This Month');
  
  const periods = ['This Month', 'Last Month', 'This Quarter', 'This Year', 'All Time'];

  const earningsData = {
    'This Month': {
      totalEarnings: 'Rp 485,750,000',
      pendingPayments: 'Rp 125,000,000',
      paidAmount: 'Rp 360,750,000',
      projectsCompleted: 3,
      averageProjectValue: 'Rp 161,916,667',
      growth: '+15.2%'
    },
    'Last Month': {
      totalEarnings: 'Rp 420,500,000',
      pendingPayments: 'Rp 0',
      paidAmount: 'Rp 420,500,000',
      projectsCompleted: 2,
      averageProjectValue: 'Rp 210,250,000',
      growth: '+8.7%'
    },
    'This Quarter': {
      totalEarnings: 'Rp 1,245,750,000',
      pendingPayments: 'Rp 125,000,000',
      paidAmount: 'Rp 1,120,750,000',
      projectsCompleted: 7,
      averageProjectValue: 'Rp 177,964,286',
      growth: '+22.4%'
    },
    'This Year': {
      totalEarnings: 'Rp 4,875,250,000',
      pendingPayments: 'Rp 325,000,000',
      paidAmount: 'Rp 4,550,250,000',
      projectsCompleted: 28,
      averageProjectValue: 'Rp 174,115,714',
      growth: '+18.9%'
    },
    'All Time': {
      totalEarnings: 'Rp 12,450,875,000',
      pendingPayments: 'Rp 325,000,000',
      paidAmount: 'Rp 12,125,875,000',
      projectsCompleted: 68,
      averageProjectValue: 'Rp 183,101,103',
      growth: 'N/A'
    }
  };

  const currentData = earningsData[selectedPeriod];

  const recentPayments = [
    {
      id: 1,
      projectTitle: 'Office Complex Design',
      client: 'Global Properties Ltd',
      amount: 'Rp 125,000,000',
      status: 'Paid',
      date: '2024-06-15',
      paymentMethod: 'Bank Transfer',
      invoiceNumber: 'INV-2024-001'
    },
    {
      id: 2,
      projectTitle: 'Residential Development',
      client: 'Urban Living Corp',
      amount: 'Rp 89,500,000',
      status: 'Paid',
      date: '2024-06-12',
      paymentMethod: 'Bank Transfer',
      invoiceNumber: 'INV-2024-002'
    },
    {
      id: 3,
      projectTitle: 'Shopping Mall Extension',
      client: 'Retail Spaces Inc',
      amount: 'Rp 156,750,000',
      status: 'Pending',
      date: '2024-06-20',
      paymentMethod: 'Bank Transfer',
      invoiceNumber: 'INV-2024-003',
      dueDate: '2024-07-05'
    },
    {
      id: 4,
      projectTitle: 'Hotel Renovation',
      client: 'Hospitality Group',
      amount: 'Rp 95,250,000',
      status: 'Paid',
      date: '2024-06-08',
      paymentMethod: 'Bank Transfer',
      invoiceNumber: 'INV-2024-004'
    },
    {
      id: 5,
      projectTitle: 'Tech Campus Design',
      client: 'InnovateTech Startup',
      amount: 'Rp 64,000,000',
      status: 'Processing',
      date: '2024-06-18',
      paymentMethod: 'Bank Transfer',
      invoiceNumber: 'INV-2024-005',
      processingNote: 'Payment under review'
    }
  ];

  const monthlyTrend = [
    { month: 'Jan', amount: 385000000 },
    { month: 'Feb', amount: 420000000 },
    { month: 'Mar', amount: 440500000 },
    { month: 'Apr', amount: 395000000 },
    { month: 'May', amount: 420500000 },
    { month: 'Jun', amount: 485750000 }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'Paid':
        return 'bg-blue-100 text-blue-800';
      case 'Pending':
        return 'bg-gray-100 text-gray-800';
      case 'Processing':
        return 'bg-blue-100 text-blue-800';
      case 'Overdue':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-slate-100 text-slate-800';
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const maxAmount = Math.max(...monthlyTrend.map(item => item.amount));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Earnings & Payments</h2>
          <p className="text-slate-600">Track your income and payment history</p>
        </div>
        <div className="flex items-center space-x-3">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-4 py-2 border border-slate-300 rounded-lg bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {periods.map((period) => (
              <option key={period} value={period}>
                {period}
              </option>
            ))}
          </select>
          <button className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-medium hover:from-blue-700 hover:to-blue-800 transition-all duration-200">
            Export Report
          </button>
        </div>
      </div>

      {/* Earnings Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Total Earnings</p>
              <p className="text-2xl font-bold">{currentData.totalEarnings}</p>
              {currentData.growth !== 'N/A' && (
                <p className="text-blue-100 text-sm mt-1">{currentData.growth} from last period</p>
              )}
            </div>
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 text-sm">Paid Amount</p>
              <p className="text-2xl font-bold text-slate-900">{currentData.paidAmount}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 text-sm">Pending Payments</p>
              <p className="text-2xl font-bold text-slate-900">{currentData.pendingPayments}</p>
            </div>
            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-gray-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 text-sm">Average Project Value</p>
              <p className="text-2xl font-bold text-slate-900">{currentData.averageProjectValue}</p>
              <p className="text-slate-500 text-sm">{currentData.projectsCompleted} projects</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Monthly Trend Chart */}
      <div className="bg-white rounded-xl p-6 border border-slate-200">
        <h3 className="text-lg font-semibold text-slate-900 mb-6">Monthly Earnings Trend</h3>
        <div className="space-y-4">
          {monthlyTrend.map((item, index) => (
            <div key={index} className="flex items-center space-x-4">
              <div className="w-12 text-sm font-medium text-slate-600">
                {item.month}
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-3">
                  <div className="flex-1 bg-slate-200 rounded-full h-3 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-500"
                      style={{ width: `${(item.amount / maxAmount) * 100}%` }}
                    ></div>
                  </div>
                  <div className="w-32 text-sm font-medium text-slate-900 text-right">
                    {formatCurrency(item.amount)}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Payments */}
      <div className="bg-white rounded-xl border border-slate-200">
        <div className="px-6 py-4 border-b border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900">Recent Payments</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Project
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Client
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {recentPayments.map((payment) => (
                <tr key={payment.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-slate-900">
                        {payment.projectTitle}
                      </div>
                      <div className="text-sm text-slate-500">
                        {payment.invoiceNumber}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-900">
                    {payment.client}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-900 font-medium">
                    {payment.amount}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(payment.status)}`}>
                      {payment.status}
                    </span>
                    {payment.dueDate && payment.status === 'Pending' && (
                      <div className="text-xs text-slate-500 mt-1">
                        Due: {new Date(payment.dueDate).toLocaleDateString()}
                      </div>
                    )}
                    {payment.processingNote && payment.status === 'Processing' && (
                      <div className="text-xs text-slate-500 mt-1">
                        {payment.processingNote}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500">
                    {new Date(payment.date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex space-x-2">
                      <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                        Download
                      </button>
                      {payment.status === 'Pending' && (
                        <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                          Follow Up
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payment Settings */}
      <div className="bg-white rounded-xl p-6 border border-slate-200">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Payment Settings</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-sm font-medium text-slate-700 mb-3">Bank Account</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-slate-600">Bank Name:</span>
                <span className="text-sm text-slate-900">Bank Central Asia</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-slate-600">Account Number:</span>
                <span className="text-sm text-slate-900">****-****-1234</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-slate-600">Account Name:</span>
                <span className="text-sm text-slate-900">Alex Smith</span>
              </div>
            </div>
          </div>
          <div>
            <h4 className="text-sm font-medium text-slate-700 mb-3">Tax Information</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-slate-600">Tax ID (NPWP):</span>
                <span className="text-sm text-slate-900">12.345.678.9-012.000</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-slate-600">Tax Rate:</span>
                <span className="text-sm text-slate-900">2.5% (PPh 23)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-slate-600">VAT Registration:</span>
                <span className="text-sm text-slate-900">PKP Registered</span>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-6 flex space-x-3">
          <button className="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg font-medium hover:bg-blue-100 transition-colors">
            Update Bank Account
          </button>
          <button className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg font-medium hover:bg-slate-200 transition-colors">
            Update Tax Info
          </button>
        </div>
      </div>
    </div>
  );
}
