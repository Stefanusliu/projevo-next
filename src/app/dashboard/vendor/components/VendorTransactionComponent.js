"use client";

import { useState, useEffect } from "react";
import { useAuth } from '../../../../contexts/AuthContext';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '../../../../lib/firebase';

export default function VendorTransactionComponent() {
  const { user, userProfile } = useAuth();
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Dummy data for testing UI with all transaction statuses
  const dummyTransactions = [
    {
      id: 'dummy_txn_1',
      projectId: 'dummy_project_1',
      projectTitle: 'Modern Office Renovation',
      orderId: 'ORD-20240801-001',
      amount: 75000000, // 50% down payment of 150M
      status: 'waiting-approval',
      paymentType: '50% Down Payment',
      clientName: 'PT Maju Bersama',
      clientEmail: 'admin@majubersama.com',
      createdAt: new Date('2024-08-01'),
      updatedAt: new Date('2024-08-01'),
      isDummy: true
    },
    {
      id: 'dummy_txn_2',
      projectId: 'dummy_project_2',
      projectTitle: 'Residential House Construction',
      orderId: 'ORD-20240802-002',
      amount: 125000000, // 50% down payment of 250M
      status: 'process',
      paymentType: '50% Down Payment',
      clientName: 'Budi Santoso',
      clientEmail: 'budi@email.com',
      createdAt: new Date('2024-08-02'),
      updatedAt: new Date('2024-08-02'),
      isDummy: true
    },
    {
      id: 'dummy_txn_3',
      projectId: 'dummy_project_3',
      projectTitle: 'Restaurant Kitchen Setup',
      orderId: 'ORD-20240803-003',
      amount: 37500000, // 50% down payment of 75M
      status: 'inescrow',
      paymentType: '50% Down Payment',
      clientName: 'Warung Sederhana',
      clientEmail: 'owner@warungsederhana.id',
      createdAt: new Date('2024-08-03'),
      updatedAt: new Date('2024-08-03'),
      isDummy: true
    },
    {
      id: 'dummy_txn_4',
      projectId: 'dummy_project_4',
      projectTitle: 'Shopping Mall Interior Design - Final Payment',
      orderId: 'ORD-20240804-004',
      amount: 250000000, // Final 50% payment of 500M
      status: 'release',
      paymentType: 'Final Payment',
      clientName: 'CV Raya Property',
      clientEmail: 'contact@rayaproperty.com',
      createdAt: new Date('2024-08-04'),
      updatedAt: new Date('2024-08-04'),
      isDummy: true
    },
    {
      id: 'dummy_txn_5',
      projectId: 'dummy_project_5',
      projectTitle: 'Corporate Office Design',
      orderId: 'ORD-20240805-005',
      amount: 100000000,
      status: 'settle',
      paymentType: '50% Down Payment',
      clientName: 'PT Sukses Makmur',
      clientEmail: 'finance@suksesmakmur.com',
      createdAt: new Date('2024-08-05'),
      updatedAt: new Date('2024-08-05'),
      isDummy: true
    },
    {
      id: 'dummy_txn_6',
      projectId: 'dummy_project_6',
      projectTitle: 'Hotel Lobby Renovation - Additional Work',
      orderId: 'ORD-20240806-006',
      amount: 50000000,
      status: 'add-funds',
      paymentType: 'Additional Work Payment',
      clientName: 'Hotel Grand Indonesia',
      clientEmail: 'procurement@hotelgrand.com',
      createdAt: new Date('2024-08-06'),
      updatedAt: new Date('2024-08-06'),
      isDummy: true
    },
    {
      id: 'dummy_txn_7',
      projectId: 'dummy_project_7',
      projectTitle: 'Cafe Interior Design',
      orderId: 'ORD-20240807-007',
      amount: 30000000,
      status: 'refund',
      paymentType: '50% Down Payment',
      clientName: 'Kafe Cozy Corner',
      clientEmail: 'owner@kafecozy.com',
      createdAt: new Date('2024-08-07'),
      updatedAt: new Date('2024-08-07'),
      isDummy: true
    },
    {
      id: 'dummy_txn_8',
      projectId: 'dummy_project_8',
      projectTitle: 'Warehouse Construction',
      orderId: 'ORD-20240808-008',
      amount: 200000000,
      status: 'indispute',
      paymentType: 'Final Payment',
      clientName: 'PT Logistik Prima',
      clientEmail: 'legal@logistikprima.com',
      createdAt: new Date('2024-08-08'),
      updatedAt: new Date('2024-08-08'),
      isDummy: true
    },
    {
      id: 'dummy_txn_9',
      projectId: 'dummy_project_9',
      projectTitle: 'Apartment Renovation',
      orderId: 'ORD-20240809-009',
      amount: 80000000,
      status: 'failed',
      paymentType: '50% Down Payment',
      clientName: 'Sari Indah',
      clientEmail: 'sari@email.com',
      createdAt: new Date('2024-08-09'),
      updatedAt: new Date('2024-08-09'),
      isDummy: true
    },
    {
      id: 'dummy_txn_10',
      projectId: 'dummy_project_10',
      projectTitle: 'Villa Construction',
      orderId: 'ORD-20240810-010',
      amount: 300000000,
      status: 'pending',
      paymentType: '50% Down Payment',
      clientName: 'Ahmad Wijaya',
      clientEmail: 'ahmad@email.com',
      createdAt: new Date('2024-08-10'),
      updatedAt: new Date('2024-08-10'),
      isDummy: true
    },
    {
      id: 'dummy_txn_11',
      projectId: 'dummy_project_11',
      projectTitle: 'School Building Renovation - Final Payment',
      orderId: 'ORD-20240811-011',
      amount: 150000000,
      status: 'completed',
      paymentType: 'Final Payment',
      clientName: 'SMA Nusantara',
      clientEmail: 'admin@smanusantara.sch.id',
      createdAt: new Date('2024-08-11'),
      updatedAt: new Date('2024-08-11'),
      isDummy: true
    },
    {
      id: 'dummy_txn_12',
      projectId: 'dummy_project_12',
      projectTitle: 'Medical Clinic Interior',
      orderId: 'ORD-20240812-012',
      amount: 90000000,
      status: 'overdue',
      paymentType: '50% Down Payment',
      clientName: 'Klinik Sehat Bersama',
      clientEmail: 'admin@kliniksehat.com',
      createdAt: new Date('2024-07-12'), // Overdue since last month
      updatedAt: new Date('2024-07-12'),
      isDummy: true
    }
  ];

  // Load transactions from projects where vendor is the current user
  useEffect(() => {
    if (!user?.uid || !userProfile?.email) {
      // Use dummy data when user is not available
      setTransactions(dummyTransactions);
      setLoading(false);
      return;
    }
    
    console.log('Loading vendor transactions for user:', user.uid, 'email:', userProfile.email);
    setLoading(true);
    
    // Query projects where the current user is the vendor
    const projectsQuery = query(
      collection(db, 'projects'),
      where('selectedVendorId', '==', user.uid)
    );
    
    const unsubscribe = onSnapshot(projectsQuery, (snapshot) => {
      const vendorTransactions = [];
      
      snapshot.forEach((doc) => {
        const projectData = doc.data();
        
        // Check if project has payment information
        if (projectData.payment) {
          console.log('Project with payment found for vendor:', doc.id, projectData.payment);
          
          vendorTransactions.push({
            id: `project_${doc.id}`,
            projectId: doc.id,
            projectTitle: projectData.title || projectData.projectTitle || 'Unknown Project',
            orderId: projectData.payment.orderId,
            amount: projectData.payment.amount,
            status: projectData.payment.status || 'pending',
            paymentType: projectData.payment.paymentType || '50% Down Payment',
            clientName: projectData.ownerName || 'Unknown Client',
            clientEmail: projectData.ownerEmail,
            snapUrl: projectData.payment.snapUrl,
            snapToken: projectData.payment.snapToken,
            createdAt: projectData.payment.createdAt,
            updatedAt: projectData.payment.updatedAt,
            transactionStatus: projectData.payment.transactionStatus,
            fraudStatus: projectData.payment.fraudStatus,
            webhookData: projectData.payment.webhookData,
            // Project-specific fields
            projectOwnerId: projectData.ownerId,
            vendorId: projectData.selectedVendorId,
            projectBudget: projectData.budget
          });
        }
      });
      
      // Combine real data with dummy data for demonstration
      const combinedTransactions = [...vendorTransactions, ...dummyTransactions];
      console.log('Loaded vendor transactions for user:', user.uid, 'Total transactions:', combinedTransactions.length);
      console.log('All vendor transaction data:', combinedTransactions);
      setTransactions(combinedTransactions);
      setLoading(false);
    }, (error) => {
      console.error('Error loading vendor transactions:', error);
      // Fallback to dummy data on error
      setTransactions(dummyTransactions);
      setLoading(false);
    });
    
    return () => unsubscribe();
  }, [user?.uid, userProfile?.email]);

  // Organize transactions by status and get filtered transactions
  const transactionData = {
    'waiting-approval': transactions.filter(t => t.status === 'waiting-approval'),
    'process': transactions.filter(t => t.status === 'process'),
    'inescrow': transactions.filter(t => t.status === 'inescrow'),
    'release': transactions.filter(t => t.status === 'release'),
    'settle': transactions.filter(t => t.status === 'settle'),
    'add-funds': transactions.filter(t => t.status === 'add-funds'),
    'refund': transactions.filter(t => t.status === 'refund'),
    'indispute': transactions.filter(t => t.status === 'indispute'),
    'failed': transactions.filter(t => t.status === 'failed'),
    // Keep legacy statuses for backward compatibility
    'pending': transactions.filter(t => t.status === 'pending'),
    'completed': transactions.filter(t => t.status === 'completed'),
    'overdue': transactions.filter(t => t.status === 'overdue')
  };

  // Get filtered transactions based on selected status
  const filteredTransactions = selectedStatus === 'all' ? transactions : transactionData[selectedStatus] || [];

  // Status options for dropdown - Vendor perspective
  const statusOptions = [
    { value: 'all', label: 'All Transactions', count: transactions.length },
    { value: 'waiting-approval', label: 'Waiting Approval', count: transactionData['waiting-approval'].length, description: 'Menunggu persetujuan client' },
    { value: 'process', label: 'Processing', count: transactionData['process'].length, description: 'Client sedang bayar' },
    { value: 'inescrow', label: 'In Escrow', count: transactionData['inescrow'].length, description: 'Dana aman di escrow' },
    { value: 'release', label: 'Releasing', count: transactionData['release'].length, description: 'Dana sedang dikirim' },
    { value: 'settle', label: 'Received', count: transactionData['settle'].length, description: 'Dana sudah diterima' },
    { value: 'add-funds', label: 'Fund Requests', count: transactionData['add-funds'].length, description: 'Request dana tambahan' },
    { value: 'refund', label: 'Refunded', count: transactionData['refund'].length, description: 'Dana dikembalikan' },
    { value: 'indispute', label: 'In Dispute', count: transactionData['indispute'].length, description: 'Dalam sengketa' },
    { value: 'failed', label: 'Failed', count: transactionData['failed'].length, description: 'Pembayaran gagal' },
    // Legacy statuses
    { value: 'pending', label: 'Pending', count: transactionData['pending'].length, description: 'Menunggu pembayaran' },
    { value: 'completed', label: 'Completed', count: transactionData['completed'].length, description: 'Selesai' },
    { value: 'overdue', label: 'Overdue', count: transactionData['overdue'].length, description: 'Terlambat' }
  ];

  const handleViewDetails = (transaction) => {
    // Show transaction details modal or navigate to details page
    console.log('View transaction details:', transaction);
    alert(`Transaction Details:\nOrder ID: ${transaction.orderId}\nAmount: ${formatCurrency(transaction.amount)}\nStatus: ${transaction.status}\nClient: ${transaction.clientName}`);
  };

  const handleRequestFunds = (transaction) => {
    // Open request additional funds modal
    alert(`Request additional funds for project: ${transaction.projectTitle}`);
  };

  const handleContactClient = (transaction) => {
    // Open contact client modal or redirect to communication
    alert(`Contact client: ${transaction.clientName} (${transaction.clientEmail})`);
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
    return 'text-white'; // All status badges use white text
  };

  const getStatusBgColor = (status) => {
    switch (status) {
      case 'waiting-approval':
        return '#F59E0B'; // Orange - Menunggu persetujuan client
      case 'process':
        return '#2373FF'; // Blue - Client sedang bayar
      case 'inescrow':
        return '#8B5CF6'; // Purple - Dana aman di escrow
      case 'release':
        return '#06B6D4'; // Cyan - Dana sedang dikirim
      case 'settle':
        return '#10B981'; // Green - Dana sudah diterima
      case 'add-funds':
        return '#F59E0B'; // Orange - Request dana tambahan
      case 'refund':
        return '#6B7280'; // Gray - Dana dikembalikan
      case 'indispute':
        return '#DC2626'; // Red - Dalam sengketa
      case 'failed':
        return '#EF4444'; // Red - Pembayaran gagal
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

  const getVendorStatusDescription = (status) => {
    switch (status) {
      case 'waiting-approval':
        return 'Client belum menyetujui pembayaran';
      case 'process':
        return 'Client sedang melakukan pembayaran';
      case 'inescrow':
        return 'Dana aman tersimpan, menunggu project selesai';
      case 'release':
        return 'Dana sedang ditransfer ke rekening Anda';
      case 'settle':
        return 'Pembayaran berhasil diterima';
      case 'add-funds':
        return 'Menunggu persetujuan dana tambahan';
      case 'refund':
        return 'Dana dikembalikan ke client';
      case 'indispute':
        return 'Pembayaran dalam proses sengketa';
      case 'failed':
        return 'Pembayaran gagal diproses';
      case 'pending':
        return 'Menunggu pembayaran dari client';
      case 'completed':
        return 'Transaksi telah selesai';
      case 'overdue':
        return 'Pembayaran terlambat';
      default:
        return 'Status tidak diketahui';
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: '#2373FF' }}></div>
        <span className="ml-3 text-gray-600">Loading transactions...</span>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200">
      {/* Header */}
      <div className="border-b border-slate-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Transactions</h1>
            <p className="text-slate-600">Manage your project payments and earnings</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-slate-500">Total Transactions</p>
            <p className="text-2xl font-bold text-slate-900">{transactions.length}</p>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Dummy Data Notice */}
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="w-5 h-5 text-blue-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">Demo Data Display</h3>
              <p className="text-sm text-blue-700 mt-1">
                This section shows dummy transaction data to demonstrate all payment statuses and UI functionality. 
                Real payment data will replace this when you start receiving payments for actual projects.
              </p>
            </div>
          </div>
        </div>

        {/* Status Filter Dropdown */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <label htmlFor="status-filter" className="block text-sm font-medium text-slate-700 mb-2">
                Filter by Status
              </label>
              <select
                id="status-filter"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="block w-80 px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white"
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
              <p className="text-sm text-slate-600">
                Showing {filteredTransactions.length} of {transactions.length} transactions
              </p>
            </div>
          </div>
        </div>

        {/* Transaction List */}
        <div className="space-y-4">
          {filteredTransactions.length === 0 ? (
            <div className="text-center py-12">
              <svg className="w-16 h-16 text-slate-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
              <h3 className="text-lg font-medium text-slate-900 mb-2">
                {selectedStatus === 'all' ? 'No transactions found' : `No ${selectedStatus} transactions`}
              </h3>
              <p className="text-slate-500">
                {selectedStatus === 'all' ? 'No payment transactions have been created yet.' :
                 selectedStatus === 'waiting-approval' ? 'No payments waiting for client approval.' :
                 selectedStatus === 'process' ? 'No payments currently being processed by clients.' :
                 selectedStatus === 'inescrow' ? 'No funds currently secured in escrow.' :
                 selectedStatus === 'release' ? 'No payments being released to you.' :
                 selectedStatus === 'settle' ? 'No settled payments received yet.' :
                 selectedStatus === 'add-funds' ? 'No additional fund requests at the moment.' :
                 selectedStatus === 'refund' ? 'No refunds processed.' :
                 selectedStatus === 'indispute' ? 'No payments currently in dispute.' :
                 selectedStatus === 'failed' ? 'No failed transactions found.' :
                 selectedStatus === 'pending' ? 'No pending payments from clients.' :
                 selectedStatus === 'completed' ? 'No completed transactions yet.' :
                 'No transactions found for this status.'}
              </p>
            </div>
          ) : (
            filteredTransactions.map((transaction) => (
            <div key={transaction.id} className="bg-slate-50 rounded-lg p-6 border border-slate-200 hover:bg-slate-100 transition-colors">
              {transaction.isDummy && (
                <div className="mb-3">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    Demo Data
                  </span>
                </div>
              )}
              
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">
                    {transaction.projectTitle}
                  </h3>
                  <p className="text-slate-600 mb-1">
                    <span className="font-medium">Client:</span> {transaction.clientName}
                  </p>
                  <p className="text-slate-600 mb-1">
                    <span className="font-medium">Payment Type:</span> {transaction.paymentType}
                  </p>
                  <p className="text-slate-600 mb-1">
                    <span className="font-medium">Order ID:</span> {transaction.orderId || transaction.id}
                  </p>
                  <p className="text-slate-600 mb-2">
                    <span className="font-medium">Status:</span> {getVendorStatusDescription(transaction.status)}
                  </p>
                  {transaction.createdAt && (
                    <p className="text-slate-600 mb-1">
                      <span className="font-medium">Created:</span> {
                        (transaction.createdAt.toDate ? 
                          new Date(transaction.createdAt.toDate()) : 
                          new Date(transaction.createdAt)
                        ).toLocaleDateString('id-ID')
                      }
                    </p>
                  )}
                  {transaction.updatedAt && transaction.status === 'settle' && (
                    <p className="text-slate-600 mb-1">
                      <span className="font-medium">Received:</span> {
                        (transaction.updatedAt.toDate ? 
                          new Date(transaction.updatedAt.toDate()) : 
                          new Date(transaction.updatedAt)
                        ).toLocaleDateString('id-ID')
                      }
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-slate-900 mb-2">
                    {formatCurrency(transaction.amount)}
                  </div>
                  <span 
                    className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(transaction.status)}`}
                    style={{ backgroundColor: getStatusBgColor(transaction.status) }}
                  >
                    {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1).replace('-', ' ')}
                  </span>
                  {transaction.environment && (
                    <div className="text-xs text-slate-500 mt-1">
                      {transaction.environment === 'sandbox' ? '🧪 Sandbox' : '🔒 Production'}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex justify-end space-x-3">
                <button 
                  onClick={() => handleViewDetails(transaction)}
                  className="bg-slate-600 hover:bg-slate-700 text-white px-4 py-2 rounded-lg transition-colors text-sm"
                >
                  View Details
                </button>
                
                {/* Waiting Approval - Vendor can contact client */}
                {transaction.status === 'waiting-approval' && (
                  <button
                    onClick={() => handleContactClient(transaction)}
                    className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg transition-colors text-sm"
                  >
                    Contact Client
                  </button>
                )}
                
                {/* Process - Client is paying */}
                {transaction.status === 'process' && (
                  <button
                    onClick={() => alert('Client is processing payment')}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors text-sm"
                    disabled
                  >
                    Client Paying...
                  </button>
                )}
                
                {/* In Escrow - Funds secured, project ongoing */}
                {transaction.status === 'inescrow' && (
                  <button
                    onClick={() => alert('Continue working on the project. Funds will be released upon completion.')}
                    className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg transition-colors text-sm"
                  >
                    Funds Secured
                  </button>
                )}
                
                {/* Release - Funds being sent to vendor */}
                {transaction.status === 'release' && (
                  <button
                    onClick={() => alert('Funds are being transferred to your account')}
                    className="bg-cyan-500 hover:bg-cyan-600 text-white px-4 py-2 rounded-lg transition-colors text-sm"
                    disabled
                  >
                    Transferring...
                  </button>
                )}
                
                {/* Settle - Payment received */}
                {transaction.status === 'settle' && (
                  <button
                    className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors text-sm"
                    onClick={() => alert('Payment received successfully!')}
                  >
                    Payment Received
                  </button>
                )}
                
                {/* Add Funds - Vendor can request additional funds */}
                {transaction.status === 'add-funds' && (
                  <button
                    onClick={() => handleRequestFunds(transaction)}
                    className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg transition-colors text-sm"
                  >
                    Request More Funds
                  </button>
                )}
                
                {/* Refund - Payment refunded */}
                {transaction.status === 'refund' && (
                  <button
                    onClick={() => alert('Payment has been refunded to client')}
                    className="bg-slate-500 hover:bg-slate-600 text-white px-4 py-2 rounded-lg transition-colors text-sm"
                    disabled
                  >
                    Refunded
                  </button>
                )}
                
                {/* In Dispute - Under review */}
                {transaction.status === 'indispute' && (
                  <button
                    onClick={() => alert('Transaction is under dispute review')}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors text-sm"
                  >
                    View Dispute
                  </button>
                )}
                
                {/* Failed - Payment failed */}
                {transaction.status === 'failed' && (
                  <button
                    onClick={() => handleContactClient(transaction)}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors text-sm"
                  >
                    Contact Client
                  </button>
                )}
                
                {/* Legacy Statuses */}
                {transaction.status === 'pending' && (
                  <button
                    onClick={() => handleContactClient(transaction)}
                    className="text-white px-4 py-2 rounded-lg transition-colors text-sm bg-blue-600 hover:bg-blue-700"
                  >
                    Follow Up Payment
                  </button>
                )}
                {transaction.status === 'overdue' && (
                  <button
                    onClick={() => handleContactClient(transaction)}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors text-sm"
                  >
                    Contact Client
                  </button>
                )}
                {transaction.status === 'completed' && (
                  <button 
                    onClick={() => alert('Transaction completed successfully')}
                    className="text-white px-4 py-2 rounded-lg transition-colors text-sm bg-green-600 hover:bg-green-700"
                  >
                    Completed
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
