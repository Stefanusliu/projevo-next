"use client";

import { useState, useEffect } from "react";
import { useAuth } from '../../../../contexts/AuthContext';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '../../../../lib/firebase';

export default function PaymentManagementComponent() {
  const { user, userProfile } = useAuth();
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

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

  // Organize payments by status and get filtered payments
  const paymentData = {
    'waiting-approval': payments.filter(p => p.status === 'waiting-approval'),
    'release': payments.filter(p => p.status === 'release'),
    'settle': payments.filter(p => p.status === 'settle'),
    'refund': payments.filter(p => p.status === 'refund'),
    'indispute': payments.filter(p => p.status === 'indispute'),
    'add-funds': payments.filter(p => p.status === 'add-funds'),
    'inescrow': payments.filter(p => p.status === 'inescrow'),
    'process': payments.filter(p => p.status === 'process'),
    'failed': payments.filter(p => p.status === 'failed'),
    // Keep legacy statuses for backward compatibility
    'pending': payments.filter(p => p.status === 'pending'),
    'completed': payments.filter(p => p.status === 'completed'),
    'overdue': payments.filter(p => p.status === 'overdue')
  };

  // Get filtered payments based on selected status
  const filteredPayments = selectedStatus === 'all' ? payments : paymentData[selectedStatus] || [];

  // Status options for dropdown
  const statusOptions = [
    { value: 'all', label: 'All Payments', count: payments.length },
    { value: 'waiting-approval', label: 'Waiting Approval', count: paymentData['waiting-approval'].length, description: 'Menunggu admin' },
    { value: 'process', label: 'Process', count: paymentData['process'].length, description: 'Sedang proses' },
    { value: 'inescrow', label: 'In Escrow', count: paymentData['inescrow'].length, description: 'Dana di rekening bersama' },
    { value: 'release', label: 'Release', count: paymentData['release'].length, description: 'Dana ke vendor' },
    { value: 'settle', label: 'Settle', count: paymentData['settle'].length, description: 'Pembayaran complete' },
    { value: 'add-funds', label: 'Add Funds', count: paymentData['add-funds'].length, description: 'Request dana tambahan' },
    { value: 'refund', label: 'Refund', count: paymentData['refund'].length, description: 'Dana kembali' },
    { value: 'indispute', label: 'In Dispute', count: paymentData['indispute'].length, description: 'Dana di hold' },
    { value: 'failed', label: 'Failed', count: paymentData['failed'].length, description: 'Gagal' },
    // Legacy statuses
    { value: 'pending', label: 'Pending', count: paymentData['pending'].length, description: 'Menunggu pembayaran' },
    { value: 'completed', label: 'Completed', count: paymentData['completed'].length, description: 'Selesai' },
    { value: 'overdue', label: 'Overdue', count: paymentData['overdue'].length, description: 'Terlambat' }
  ];

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
      case 'waiting-approval':
        return '#F59E0B'; // Orange - Menunggu admin
      case 'process':
        return '#2373FF'; // Blue - Sedang proses
      case 'inescrow':
        return '#8B5CF6'; // Purple - Dana di rekening bersama
      case 'release':
        return '#06B6D4'; // Cyan - Dana ke vendor
      case 'settle':
        return '#10B981'; // Green - Pembayaran complete
      case 'add-funds':
        return '#F59E0B'; // Orange - Request dana tambahan
      case 'refund':
        return '#6B7280'; // Gray - Dana kembali
      case 'indispute':
        return '#DC2626'; // Red - Dana di hold
      case 'failed':
        return '#EF4444'; // Red - Gagal
      // Legacy statuses
      case 'pending':
        return '#2373FF'; // Blue
      case 'completed':
        return '#10B981'; // Green
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
        {/* Status Filter Dropdown */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Status
              </label>
              <select
                id="status-filter"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="block w-64 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
              >
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label} ({option.count})
                    {option.description && ` - ${option.description}`}
                  </option>
                ))}
              </select>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">
                Showing {filteredPayments.length} of {payments.length} payments
              </p>
            </div>
          </div>
        </div>

        {/* Payment List */}
        <div className="space-y-4">
          {filteredPayments.length === 0 ? (
            <div className="text-center py-12">
              <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
              <h3 className="text-lg font-medium text-black mb-2">
                {selectedStatus === 'all' ? 'No payments found' : `No ${selectedStatus} payments`}
              </h3>
              <p className="text-gray-500">
                {selectedStatus === 'all' ? 'No payments have been created yet.' :
                 selectedStatus === 'waiting-approval' ? 'No payments waiting for approval.' :
                 selectedStatus === 'process' ? 'No payments currently being processed.' :
                 selectedStatus === 'inescrow' ? 'No funds currently in escrow.' :
                 selectedStatus === 'release' ? 'No payments being released to vendors.' :
                 selectedStatus === 'settle' ? 'No settled payments yet.' :
                 selectedStatus === 'add-funds' ? 'No fund requests at the moment.' :
                 selectedStatus === 'refund' ? 'No refunds processed.' :
                 selectedStatus === 'indispute' ? 'No payments currently in dispute.' :
                 selectedStatus === 'failed' ? 'No failed payments found.' :
                 selectedStatus === 'pending' ? 'No pending payments at the moment.' :
                 selectedStatus === 'completed' ? 'No completed payments yet.' :
                 'No payments found for this status.'}
              </p>
            </div>
          ) : (
            filteredPayments.map((payment) => (
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
                
                {/* Waiting Approval */}
                {payment.status === 'waiting-approval' && (
                  <button
                    onClick={() => alert('Waiting for admin approval')}
                    className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg transition-colors text-sm"
                    disabled
                  >
                    Waiting Approval
                  </button>
                )}
                
                {/* Process */}
                {payment.status === 'process' && payment.snapUrl && (
                  <button
                    onClick={() => window.open(payment.snapUrl, '_blank')}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors text-sm"
                  >
                    Continue Payment
                  </button>
                )}
                {payment.status === 'process' && !payment.snapUrl && (
                  <button
                    onClick={() => alert('Payment is being processed')}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors text-sm"
                    disabled
                  >
                    Processing...
                  </button>
                )}
                
                {/* In Escrow */}
                {payment.status === 'inescrow' && (
                  <button
                    onClick={() => alert('Funds are secured in escrow')}
                    className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg transition-colors text-sm"
                  >
                    Release Funds
                  </button>
                )}
                
                {/* Release */}
                {payment.status === 'release' && (
                  <button
                    onClick={() => alert('Funds are being released to vendor')}
                    className="bg-cyan-500 hover:bg-cyan-600 text-white px-4 py-2 rounded-lg transition-colors text-sm"
                    disabled
                  >
                    Releasing...
                  </button>
                )}
                
                {/* Settle */}
                {payment.status === 'settle' && (
                  <button
                    className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors text-sm"
                    onClick={() => alert('Payment completed successfully')}
                  >
                    Download Receipt
                  </button>
                )}
                
                {/* Add Funds */}
                {payment.status === 'add-funds' && (
                  <button
                    onClick={() => handlePayment(payment)}
                    className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg transition-colors text-sm"
                  >
                    Add Funds
                  </button>
                )}
                
                {/* Refund */}
                {payment.status === 'refund' && (
                  <button
                    onClick={() => alert('Refund has been processed')}
                    className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors text-sm"
                    disabled
                  >
                    Refunded
                  </button>
                )}
                
                {/* In Dispute */}
                {payment.status === 'indispute' && (
                  <button
                    onClick={() => alert('Payment is under dispute review')}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors text-sm"
                  >
                    View Dispute
                  </button>
                )}
                
                {/* Failed */}
                {payment.status === 'failed' && (
                  <button
                    onClick={() => handlePayment(payment)}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors text-sm"
                  >
                    Retry Payment
                  </button>
                )}
                
                {/* Legacy Statuses */}
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
