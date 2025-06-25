"use client";

import { useState } from "react";

export default function PaymentManagementComponent() {
  const [activeTab, setActiveTab] = useState("pending");

  const paymentData = {
    pending: [
      {
        id: 1,
        projectTitle: "Bangun Interior Rumah BSD Minimalis Modern",
        vendor: "CV Berkah Interior",
        amount: "Rp 37,500,000",
        milestone: "Milestone 1 - Design Phase",
        dueDate: "2025-01-15",
        status: "pending"
      },
      {
        id: 2,
        projectTitle: "Renovasi Kantor Modern SCBD",
        vendor: "PT Konstruksi Prima",
        amount: "Rp 125,000,000",
        milestone: "Milestone 2 - Construction Phase",
        dueDate: "2025-01-20",
        status: "pending"
      }
    ],
    completed: [
      {
        id: 3,
        projectTitle: "Desain Interior Apartemen Luxury Sudirman",
        vendor: "Studio Design Elite",
        amount: "Rp 26,000,000",
        milestone: "Milestone 1 - Initial Design",
        paidDate: "2024-12-15",
        status: "completed"
      }
    ],
    overdue: [
      {
        id: 4,
        projectTitle: "Bangun Ruko 3 Lantai Kelapa Gading",
        vendor: "CV Mandiri Construction",
        amount: "Rp 60,000,000",
        milestone: "Milestone 1 - Foundation",
        dueDate: "2024-12-20",
        status: "overdue"
      }
    ]
  };

  const handlePayment = (paymentId) => {
    alert(`Processing payment for ID: ${paymentId}`);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'overdue':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
      <div className="p-6">
        {/* Tab Navigation */}
        <div className="border-b border-slate-200 dark:border-slate-700 mb-8">
          <nav className="-mb-px flex space-x-8">
            {[
              { key: 'pending', label: 'Pending', count: paymentData.pending.length },
              { key: 'completed', label: 'Completed', count: paymentData.completed.length },
              { key: 'overdue', label: 'Overdue', count: paymentData.overdue.length }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.key
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300 dark:text-slate-400 dark:hover:text-slate-300'
                }`}
              >
                {tab.label}
                <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
                  activeTab === tab.key
                    ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
                    : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400'
                }`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </nav>
        </div>

        {/* Payment List */}
        <div className="space-y-4 mb-8">
          {paymentData[activeTab].map((payment) => (
            <div key={payment.id} className="bg-slate-50 dark:bg-slate-700 rounded-lg p-6 border border-slate-200 dark:border-slate-600">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                    {payment.projectTitle}
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 mb-1">
                    <span className="font-medium">Vendor:</span> {payment.vendor}
                  </p>
                  <p className="text-slate-600 dark:text-slate-400 mb-1">
                    <span className="font-medium">Milestone:</span> {payment.milestone}
                  </p>
                  {payment.dueDate && (
                    <p className="text-slate-600 dark:text-slate-400 mb-1">
                      <span className="font-medium">Due Date:</span> {new Date(payment.dueDate).toLocaleDateString('id-ID')}
                    </p>
                  )}
                  {payment.paidDate && (
                    <p className="text-slate-600 dark:text-slate-400 mb-1">
                      <span className="font-medium">Paid Date:</span> {new Date(payment.paidDate).toLocaleDateString('id-ID')}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                    {payment.amount}
                  </div>
                  <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(payment.status)}`}>
                    {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                  </span>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3">
                <button className="bg-slate-600 hover:bg-slate-700 text-white px-4 py-2 rounded-lg transition-colors text-sm">
                  View Details
                </button>
                {payment.status === 'pending' && (
                  <button
                    onClick={() => handlePayment(payment.id)}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors text-sm"
                  >
                    Process Payment
                  </button>
                )}
                {payment.status === 'overdue' && (
                  <button
                    onClick={() => handlePayment(payment.id)}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors text-sm"
                  >
                    Pay Now
                  </button>
                )}
                {payment.status === 'completed' && (
                  <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors text-sm">
                    Download Receipt
                  </button>
                )}
              </div>
            </div>
          ))}
          
          {paymentData[activeTab].length === 0 && (
            <div className="text-center py-12">
              <div className="text-slate-400 dark:text-slate-500 mb-4">
                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
                No {activeTab} payments
              </h3>
              <p className="text-slate-600 dark:text-slate-400">
                You don&apos;t have any {activeTab} payments at the moment.
              </p>
            </div>
          )}
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
              Total Pending
            </h3>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              Rp 162,500,000
            </p>
            <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
              {paymentData.pending.length} payments
            </p>
          </div>
          
          <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-green-900 dark:text-green-100 mb-2">
              Total Paid
            </h3>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
              Rp 26,000,000
            </p>
            <p className="text-sm text-green-700 dark:text-green-300 mt-1">
              {paymentData.completed.length} payments
            </p>
          </div>
          
          <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-red-900 dark:text-red-100 mb-2">
              Total Overdue
            </h3>
            <p className="text-2xl font-bold text-red-600 dark:text-red-400">
              Rp 60,000,000
            </p>
            <p className="text-sm text-red-700 dark:text-red-300 mt-1">
              {paymentData.overdue.length} payments
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 text-center">
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
            Need to manage payments in detail?
          </p>
          <button className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-semibold">
            Open Full Payment Manager
          </button>
        </div>
      </div>
    </div>
  );
}
