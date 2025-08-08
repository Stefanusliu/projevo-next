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
  const [debugMode, setDebugMode] = useState(false); // Add debug mode

  // Debug: Load ALL payments to see what's in the collection
  useEffect(() => {
    if (debugMode) {
      console.log('🔍 DEBUG MODE: Loading ALL payments...');
      const allPaymentsQuery = query(collection(db, 'payments'));
      
      const unsubscribe = onSnapshot(allPaymentsQuery, (snapshot) => {
        console.log('🔍 ALL PAYMENTS IN DATABASE:');
        snapshot.forEach((doc) => {
          console.log('  Payment ID:', doc.id, 'Data:', doc.data());
        });
      });
      
      return () => unsubscribe();
    }
  }, [debugMode]);

  // Load payments from projects collection
  useEffect(() => {
    if (!user?.uid || !userProfile?.email) {
      setLoading(false);
      return;
    }
    
    console.log('Loading project payments for user:', user.uid, 'email:', userProfile.email);
    setLoading(true);
    
    // Query projects where the current user is the owner
    const projectsQuery = query(
      collection(db, 'projects'),
      where('ownerId', '==', user.uid)
    );
    
    const unsubscribe = onSnapshot(projectsQuery, (snapshot) => {
      const projectPayments = [];
      
      snapshot.forEach((doc) => {
        const projectData = doc.data();
        
        // Check if project has payment information
        if (projectData.payment) {
          console.log('Project with payment found:', doc.id, projectData.payment);
          
          projectPayments.push({
            id: `project_${doc.id}`,
            projectId: doc.id,
            projectTitle: projectData.title || projectData.projectTitle || 'Unknown Project',
            orderId: projectData.payment.orderId,
            amount: projectData.payment.amount,
            status: projectData.payment.status || 'pending',
            paymentType: projectData.payment.paymentType || '50% Down Payment',
            vendorName: projectData.payment.vendorName || 'Unknown Vendor',
            snapUrl: projectData.payment.snapUrl,
            snapToken: projectData.payment.snapToken,
            createdAt: projectData.payment.createdAt,
            updatedAt: projectData.payment.updatedAt,
            transactionStatus: projectData.payment.transactionStatus,
            fraudStatus: projectData.payment.fraudStatus,
            webhookData: projectData.payment.webhookData,
            // Project-specific fields
            projectOwnerEmail: projectData.ownerEmail,
            projectOwnerId: projectData.ownerId,
            projectOwnerName: projectData.ownerName
          });
        }
      });
      
      console.log('Loaded project payments for user:', user.uid, 'Total payments:', projectPayments.length);
      console.log('All project payments data:', projectPayments);
      setPayments(projectPayments);
      setLoading(false);
    }, (error) => {
      console.error('Error loading project payments:', error);
      setLoading(false);
    });
    
    return () => unsubscribe();
  }, [user?.uid, userProfile?.email]);

  // Organize payments by status
  const paymentData = {
    pending: payments.filter(p => p.status === 'pending'),
    completed: payments.filter(p => p.status === 'completed'),
    failed: payments.filter(p => p.status === 'failed'),
    overdue: payments.filter(p => p.status === 'overdue')
  };

  const handlePayment = (payment) => {
    if (payment.snapUrl && payment.status === 'pending') {
      // Open Midtrans Snap URL
      window.open(payment.snapUrl, '_blank');
    } else {
      alert(`Processing payment for ID: ${payment.id}`);
    }
  };

  const handleViewDetails = (payment) => {
    // Show payment details modal or navigate to details page
    console.log('View payment details:', payment);
    alert(`Payment Details:\nOrder ID: ${payment.orderId}\nAmount: ${formatCurrency(payment.amount)}\nStatus: ${payment.status}`);
  };

  const formatCurrency = (amount) => {
    if (!amount) return 'Rp 0';
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'text-white';
      case 'completed':
        return 'text-white';
      case 'failed':
        return 'text-white';
      case 'overdue':
        return 'text-white';
      default:
        return 'text-white';
    }
  };

  const getStatusBgColor = (status) => {
    switch (status) {
      case 'pending':
        return '#2373FF'; // Blue
      case 'completed':
        return '#10B981'; // Green
      case 'failed':
        return '#EF4444'; // Red
      case 'overdue':
        return '#F59E0B'; // Orange
      default:
        return '#6B7280'; // Gray
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
        {/* Debug Mode Toggle */}
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">
                User ID: <code className="bg-gray-200 px-1 rounded">{user?.uid}</code>
              </p>
              <p className="text-sm text-gray-600">
                Email: <code className="bg-gray-200 px-1 rounded">{userProfile?.email}</code>
              </p>
            </div>
            <button
              onClick={() => setDebugMode(!debugMode)}
              className={`px-3 py-1 rounded text-xs ${debugMode ? 'bg-red-500 text-white' : 'bg-gray-300 text-gray-700'}`}
            >
              {debugMode ? 'Debug ON' : 'Debug OFF'}
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            {[
              { key: 'pending', label: 'Pending', count: paymentData.pending.length },
              { key: 'completed', label: 'Completed', count: paymentData.completed.length },
              { key: 'failed', label: 'Failed', count: paymentData.failed.length },
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
                 activeTab === 'failed' ? 'No failed payments found.' :
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
                    <span className="font-medium">Vendor:</span> {payment.vendorName || 'Not specified'}
                  </p>
                  <p className="text-gray-600 mb-1">
                    <span className="font-medium">Payment Type:</span> {payment.paymentType || 'Payment milestone'}
                  </p>
                  <p className="text-gray-600 mb-1">
                    <span className="font-medium">Order ID:</span> {payment.orderId || payment.id}
                  </p>
                  {payment.createdAt && (
                    <p className="text-gray-600 mb-1">
                      <span className="font-medium">Created:</span> {new Date(payment.createdAt.toDate()).toLocaleDateString('id-ID')}
                    </p>
                  )}
                  {payment.updatedAt && payment.status === 'completed' && (
                    <p className="text-gray-600 mb-1">
                      <span className="font-medium">Completed:</span> {new Date(payment.updatedAt.toDate()).toLocaleDateString('id-ID')}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-black mb-2">
                    {formatCurrency(payment.amount)}
                  </div>
                  <span 
                    className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(payment.status)}`}
                    style={{ backgroundColor: getStatusBgColor(payment.status) }}
                  >
                    {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                  </span>
                  {payment.environment && (
                    <div className="text-xs text-gray-500 mt-1">
                      {payment.environment === 'sandbox' ? '🧪 Sandbox' : '🔒 Production'}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex justify-end space-x-3">
                <button 
                  onClick={() => handleViewDetails(payment)}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors text-sm"
                >
                  View Details
                </button>
                {payment.status === 'pending' && payment.snapUrl && (
                  <button
                    onClick={() => handlePayment(payment)}
                    className="text-white px-4 py-2 rounded-lg transition-colors text-sm"
                    style={{ backgroundColor: '#2373FF' }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = '#1d63ed'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = '#2373FF'}
                  >
                    Continue Payment
                  </button>
                )}
                {payment.status === 'pending' && !payment.snapUrl && (
                  <button
                    onClick={() => handlePayment(payment)}
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
                    onClick={() => handlePayment(payment)}
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
