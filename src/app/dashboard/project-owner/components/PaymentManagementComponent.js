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
    
    // Query payments where the current user is the owner (without orderBy to avoid issues)
    const paymentsQuery = query(
      collection(db, 'payments'),
      where('projectOwnerId', '==', user.uid)
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
        return 'text-white';
      case 'completed':
        return 'text-white';
      case 'overdue':
        return 'text-white';
      default:
        return 'text-white';
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: '#2373FF' }}></div>
        <span className="ml-3 text-gray-600">Loading payment data...</span>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-300">
      <div className="p-6">
        {/* Tab Navigation */}
        <div className="border-b border-gray-200 mb-8">
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
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
                <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
                  activeTab === tab.key
                    ? 'bg-blue-100 text-blue-600'
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </nav>
        </div>

        {/* Payment List */}
        <div className="space-y-4">
          {paymentData[activeTab].length === 0 ? (
            <div className="text-center py-12">
              <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
              <h3 className="text-lg font-medium text-black mb-2">
                No {activeTab} payments
              </h3>
              <p className="text-gray-500">
                {activeTab === 'pending' ? 'No pending payments at the moment.' :
                 activeTab === 'completed' ? 'No completed payments yet.' :
                 'No overdue payments found.'}
              </p>
            </div>
          ) : (
            paymentData[activeTab].map((payment) => (
            <div key={payment.id} className="bg-gray-50 rounded-lg p-6 border border-gray-200 hover:bg-gray-100 transition-colors">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-black mb-2">
                    {payment.projectTitle || payment.title || 'Payment'}
                  </h3>
                  <p className="text-gray-600 mb-1">
                    <span className="font-medium">Vendor:</span> {payment.vendor || payment.vendorName || 'Not specified'}
                  </p>
                  <p className="text-gray-600 mb-1">
                    <span className="font-medium">Milestone:</span> {payment.milestone || payment.description || 'Payment milestone'}
                  </p>
                  {payment.dueDate && (
                    <p className="text-gray-600 mb-1">
                      <span className="font-medium">Due Date:</span> {new Date(payment.dueDate).toLocaleDateString('id-ID')}
                    </p>
                  )}
                  {payment.paidDate && (
                    <p className="text-gray-600 mb-1">
                      <span className="font-medium">Paid Date:</span> {new Date(payment.paidDate).toLocaleDateString('id-ID')}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-black mb-2">
                    {payment.amount}
                  </div>
                  <span 
                    className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(payment.status)}`}
                    style={{ backgroundColor: '#2373FF' }}
                  >
                    {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                  </span>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3">
                <button className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors text-sm">
                  View Details
                </button>
                {payment.status === 'pending' && (
                  <button
                    onClick={() => handlePayment(payment.id)}
                    className="text-white px-4 py-2 rounded-lg transition-colors text-sm"
                    style={{ backgroundColor: '#2373FF' }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = '#1d63ed'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = '#2373FF'}
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
                  <button className="text-white px-4 py-2 rounded-lg transition-colors text-sm"
                    style={{ backgroundColor: '#2373FF' }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = '#1d63ed'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = '#2373FF'}
                  >
                    Download Receipt
                  </button>
                )}
              </div>
            </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
