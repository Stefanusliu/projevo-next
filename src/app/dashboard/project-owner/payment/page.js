"use client";

import { useState } from "react";
import Link from "next/link";

export default function PaymentPage() {
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

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400";
      case "completed":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
      case "overdue":
        return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400";
    }
  };

  const handlePayment = (paymentId) => {
    alert(`Initiating payment for ID: ${paymentId}`);
    // Here you would integrate with your payment gateway
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Header */}
      <header className="bg-white dark:bg-slate-900 shadow-sm border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <Link href="/" className="flex items-center space-x-2">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold text-xl">P</span>
                </div>
                <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Projevo
                </span>
              </Link>
            </div>
            <Link
              href="/dashboard/project-owner"
              className="text-slate-600 hover:text-blue-600 dark:text-slate-300 dark:hover:text-blue-400 font-medium transition-colors"
            >
              ← Back to Dashboard
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            Payment Management
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2">
            Manage your project payments and milestones
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="border-b border-slate-200 dark:border-slate-700">
            <nav className="-mb-px flex space-x-8">
              {[
                { key: "pending", label: "Pending Payments", count: paymentData.pending.length },
                { key: "completed", label: "Completed", count: paymentData.completed.length },
                { key: "overdue", label: "Overdue", count: paymentData.overdue.length }
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.key
                      ? "border-blue-500 text-blue-600 dark:text-blue-400"
                      : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300 dark:text-slate-400 dark:hover:text-slate-300"
                  }`}
                >
                  {tab.label}
                  {tab.count > 0 && (
                    <span className={`ml-2 py-0.5 px-2 rounded-full text-xs ${
                      activeTab === tab.key
                        ? "bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400"
                        : "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400"
                    }`}>
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Payment Cards */}
        <div className="grid gap-6">
          {paymentData[activeTab].map((payment) => (
            <div
              key={payment.id}
              className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                    {payment.projectTitle}
                  </h3>
                  <div className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                    <p><span className="font-medium">Vendor:</span> {payment.vendor}</p>
                    <p><span className="font-medium">Milestone:</span> {payment.milestone}</p>
                    {payment.dueDate && (
                      <p><span className="font-medium">Due Date:</span> {new Date(payment.dueDate).toLocaleDateString('id-ID')}</p>
                    )}
                    {payment.paidDate && (
                      <p><span className="font-medium">Paid Date:</span> {new Date(payment.paidDate).toLocaleDateString('id-ID')}</p>
                    )}
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                    {payment.amount}
                  </div>
                  <div className="mb-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(payment.status)}`}>
                      {payment.status === "pending" && "Pending"}
                      {payment.status === "completed" && "Completed"}
                      {payment.status === "overdue" && "Overdue"}
                    </span>
                  </div>
                  
                  {payment.status === "pending" && (
                    <button
                      onClick={() => handlePayment(payment.id)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                      Pay Now
                    </button>
                  )}
                  
                  {payment.status === "overdue" && (
                    <button
                      onClick={() => handlePayment(payment.id)}
                      className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                      Pay Overdue
                    </button>
                  )}
                  
                  {payment.status === "completed" && (
                    <div className="text-green-600 dark:text-green-400 text-sm font-medium">
                      ✓ Paid
                    </div>
                  )}
                </div>
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
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
              Total Pending
            </h3>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              Rp 162,500,000
            </p>
          </div>
          
          <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-green-900 dark:text-green-100 mb-2">
              Total Paid
            </h3>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
              Rp 26,000,000
            </p>
          </div>
          
          <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-red-900 dark:text-red-100 mb-2">
              Total Overdue
            </h3>
            <p className="text-2xl font-bold text-red-600 dark:text-red-400">
              Rp 60,000,000
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
