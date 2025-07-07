"use client";

import { useState, useEffect } from "react";
import { useAuth } from '../../../../contexts/AuthContext';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '../../../../lib/firebase';

export default function PaymentManagementComponent() {
  const { user, userProfile } = useAuth();
  const [activeTab, setActiveTab] = useState("pending");
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load payments from Firestore
  useEffect(() => {
    if (!user?.uid) {
      setLoading(false);
      return;
    }
    
    console.log('Loading payments for user:', user.uid);
    setLoading(true);
    
    // Query payments where the current user is the owner
    const paymentsQuery = query(
      collection(db, 'payments'),
      where('projectOwnerId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );
    
    const unsubscribe = onSnapshot(paymentsQuery, (snapshot) => {
      const paymentsData = [];
      snapshot.forEach((doc) => {
        paymentsData.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      console.log('Loaded payments:', paymentsData);
      setPayments(paymentsData);
      setLoading(false);
    }, (error) => {
      console.error('Error loading payments:', error);
      // If no payments collection exists, use empty array
      setPayments([]);
      setLoading(false);
    });
    
    return () => unsubscribe();
  }, [user?.uid]);

  // Organize payments by status
  const paymentData = {
    pending: payments.filter(p => p.status === 'pending'),
    completed: payments.filter(p => p.status === 'completed'),
    overdue: payments.filter(p => p.status === 'overdue')
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

  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading payment data...</span>
      </div>
    );
  }

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
          {paymentData[activeTab].length === 0 ? (
            <div className="text-center py-12">
              <svg className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
              <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
                No {activeTab} payments
              </h3>
              <p className="text-slate-600 dark:text-slate-400">
                {activeTab === 'pending' ? 'No pending payments at the moment.' :
                 activeTab === 'completed' ? 'No completed payments yet.' :
                 'No overdue payments found.'}
              </p>
            </div>
          ) : (
            paymentData[activeTab].map((payment) => (
            <div key={payment.id} className="bg-slate-50 dark:bg-slate-700 rounded-lg p-6 border border-slate-200 dark:border-slate-600">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                    {payment.projectTitle || payment.title || 'Payment'}
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 mb-1">
                    <span className="font-medium">Vendor:</span> {payment.vendor || payment.vendorName || 'Not specified'}
                  </p>
                  <p className="text-slate-600 dark:text-slate-400 mb-1">
                    <span className="font-medium">Milestone:</span> {payment.milestone || payment.description || 'Payment milestone'}
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
            ))
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
