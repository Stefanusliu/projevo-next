'use client';

import { useState, useEffect, useMemo } from 'react';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';

export default function TransactionComponent() {
  const { user } = useAuth();
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  const handleViewDetails = (transaction) => {
    // Show transaction details inline
    setSelectedTransaction(transaction);
    setShowDetails(true);
  };

  const handleBackToList = () => {
    setShowDetails(false);
    setSelectedTransaction(null);
  };

  // Dummy data for testing UI with all transaction statuses - Project Owner perspective
  const dummyTransactions = useMemo(() => [
    {
      id: 'dummy_po_txn_1',
      projectId: 'dummy_project_1',
      projectTitle: 'Modern Office Renovation',
      orderId: 'ORD-20240801-001',
      amount: 75000000, // 50% down payment of 150M
      status: 'waiting-approval',
      paymentType: '50% Down Payment',
      vendorName: 'PT Konstruksi Andalan',
      vendorEmail: 'admin@konstruksiandalan.com',
      createdAt: new Date('2024-08-01'),
      updatedAt: new Date('2024-08-01'),
      isDummy: true
    },
    {
      id: 'dummy_po_txn_2',
      projectId: 'dummy_project_2',
      projectTitle: 'Residential House Construction',
      orderId: 'ORD-20240802-002',
      amount: 125000000, // 50% down payment of 250M
      status: 'process',
      paymentType: '50% Down Payment',
      vendorName: 'CV Bangun Jaya',
      vendorEmail: 'info@bangunjaya.com',
      createdAt: new Date('2024-08-02'),
      updatedAt: new Date('2024-08-02'),
      isDummy: true
    },
    {
      id: 'dummy_po_txn_3',
      projectId: 'dummy_project_3',
      projectTitle: 'Restaurant Kitchen Setup',
      orderId: 'ORD-20240803-003',
      amount: 37500000, // 50% down payment of 75M
      status: 'inescrow',
      paymentType: '50% Down Payment',
      vendorName: 'PT Kitchen Solutions',
      vendorEmail: 'order@kitchensolutions.id',
      createdAt: new Date('2024-08-03'),
      updatedAt: new Date('2024-08-03'),
      isDummy: true
    },
    {
      id: 'dummy_po_txn_4',
      projectId: 'dummy_project_4',
      projectTitle: 'Shopping Mall Interior',
      orderId: 'ORD-20240804-004',
      amount: 250000000, // 50% down payment of 500M
      status: 'release',
      paymentType: '50% Down Payment',
      vendorName: 'PT Interior Megah',
      vendorEmail: 'project@interiormegah.com',
      createdAt: new Date('2024-08-04'),
      updatedAt: new Date('2024-08-04'),
      isDummy: true
    },
    {
      id: 'dummy_po_txn_5',
      projectId: 'dummy_project_5',
      projectTitle: 'Hotel Lobby Redesign',
      orderId: 'ORD-20240805-005',
      amount: 90000000, // 50% down payment of 180M
      status: 'settle',
      paymentType: '50% Down Payment',
      vendorName: 'CV Design Excellence',
      vendorEmail: 'admin@designexcellence.id',
      createdAt: new Date('2024-08-05'),
      updatedAt: new Date('2024-08-05'),
      isDummy: true
    },
    {
      id: 'dummy_po_txn_6',
      projectId: 'dummy_project_6',
      projectTitle: 'Warehouse Expansion',
      orderId: 'ORD-20240806-006',
      amount: 175000000, // Additional funding for 350M project
      status: 'add-funds',
      paymentType: 'Additional Funding',
      vendorName: 'PT Industrial Build',
      vendorEmail: 'finance@industrialbuild.co.id',
      createdAt: new Date('2024-08-06'),
      updatedAt: new Date('2024-08-06'),
      isDummy: true
    },
    {
      id: 'dummy_po_txn_7',
      projectId: 'dummy_project_7',
      projectTitle: 'School Library Renovation',
      orderId: 'ORD-20240807-007',
      amount: 25000000, // Partial refund
      status: 'refund',
      paymentType: 'Partial Refund',
      vendorName: 'CV Edu Builders',
      vendorEmail: 'support@edubuilders.com',
      createdAt: new Date('2024-08-07'),
      updatedAt: new Date('2024-08-07'),
      isDummy: true
    },
    {
      id: 'dummy_po_txn_8',
      projectId: 'dummy_project_8',
      projectTitle: 'Medical Clinic Setup',
      orderId: 'ORD-20240808-008',
      amount: 60000000, // 50% down payment of 120M
      status: 'indispute',
      paymentType: '50% Down Payment',
      vendorName: 'PT Medical Contractors',
      vendorEmail: 'dispute@medicalcontractors.id',
      createdAt: new Date('2024-08-08'),
      updatedAt: new Date('2024-08-08'),
      isDummy: true
    },
    {
      id: 'dummy_po_txn_9',
      projectId: 'dummy_project_9',
      projectTitle: 'Apartment Complex Phase 1',
      orderId: 'ORD-20240809-009',
      amount: 300000000, // 50% down payment of 600M
      status: 'failed',
      paymentType: '50% Down Payment',
      vendorName: 'PT Mega Developers',
      vendorEmail: 'projects@megadevelopers.co.id',
      createdAt: new Date('2024-08-09'),
      updatedAt: new Date('2024-08-09'),
      isDummy: true
    },
    {
      id: 'dummy_po_txn_10',
      projectId: 'dummy_project_10',
      projectTitle: 'Community Center Upgrade',
      orderId: 'ORD-20240810-010',
      amount: 45000000, // 50% down payment of 90M
      status: 'pending',
      paymentType: '50% Down Payment',
      vendorName: 'CV Community Works',
      vendorEmail: 'info@communityworks.id',
      createdAt: new Date('2024-08-10'),
      updatedAt: new Date('2024-08-10'),
      isDummy: true
    },
    {
      id: 'dummy_po_txn_11',
      projectId: 'dummy_project_11',
      projectTitle: 'Corporate Headquarters',
      orderId: 'ORD-20240811-011',
      amount: 500000000, // 50% down payment of 1B
      status: 'completed',
      paymentType: '50% Down Payment',
      vendorName: 'PT Elite Construction',
      vendorEmail: 'corporate@eliteconstruction.co.id',
      createdAt: new Date('2024-08-11'),
      updatedAt: new Date('2024-08-11'),
      isDummy: true
    },
    {
      id: 'dummy_po_txn_12',
      projectId: 'dummy_project_12',
      projectTitle: 'Factory Equipment Installation',
      orderId: 'ORD-20240812-012',
      amount: 85000000, // Overdue payment
      status: 'overdue',
      paymentType: 'Final Payment',
      vendorName: 'PT Industrial Systems',
      vendorEmail: 'overdue@industrialsystems.id',
      createdAt: new Date('2024-07-15'), // Past due date
      updatedAt: new Date('2024-07-15'),
      isDummy: true
    }
  ], []);

  useEffect(() => {
    if (!user) return;

    const fetchTransactions = () => {
      try {
        // For demo purposes, use dummy data
        // In production, this would query Firestore for user's project payments:
        // const paymentsQuery = query(
        //   collection(db, 'projects'),
        //   where('ownerId', '==', user.uid),
        //   orderBy('createdAt', 'desc')
        // );
        
        setTransactions(dummyTransactions);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching transactions:', error);
        setTransactions(dummyTransactions);
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [user]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'waiting-approval':
        return 'bg-yellow-100 text-yellow-800';
      case 'process':
        return 'bg-blue-100 text-blue-800';
      case 'inescrow':
        return 'bg-purple-100 text-purple-800';
      case 'release':
        return 'bg-green-100 text-green-800';
      case 'settle':
        return 'bg-green-100 text-green-800';
      case 'add-funds':
        return 'bg-indigo-100 text-indigo-800';
      case 'refund':
        return 'bg-orange-100 text-orange-800';
      case 'indispute':
        return 'bg-red-100 text-red-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-gray-100 text-gray-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'overdue':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getProjectOwnerStatusDescription = (status) => {
    switch (status) {
      case 'waiting-approval':
        return 'Waiting for Approval';
      case 'process':
        return 'Processing Payment';
      case 'inescrow':
        return 'Funds in Escrow';
      case 'release':
        return 'Ready to Release';
      case 'settle':
        return 'Payment Released';
      case 'add-funds':
        return 'Additional Funding';
      case 'refund':
        return 'Refund Processed';
      case 'indispute':
        return 'Under Dispute';
      case 'failed':
        return 'Payment Failed';
      case 'pending':
        return 'Pending Payment';
      case 'completed':
        return 'Transaction Completed';
      case 'overdue':
        return 'Payment Overdue';
      default:
        return status;
    }
  };

  const filteredTransactions = transactions.filter(transaction => {
    if (selectedStatus === "all") return true;
    return transaction.status === selectedStatus;
  });

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse bg-gray-200 h-6 w-48 rounded"></div>
        <div className="animate-pulse bg-gray-200 h-32 w-full rounded"></div>
        <div className="animate-pulse bg-gray-200 h-32 w-full rounded"></div>
      </div>
    );
  }

  // Show transaction details view
  if (showDetails && selectedTransaction) {
    return (
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="border-b border-slate-200 pb-6">
          <button
            onClick={handleBackToList}
            className="flex items-center text-slate-600 hover:text-slate-900 mb-4 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Transactions
          </button>
          <h1 className="text-2xl font-bold text-slate-900">Transaction Details</h1>
          <p className="text-slate-600">Complete information about this payment transaction</p>
        </div>

        {/* Transaction Details Content */}
        <div className="bg-white border border-gray-200 rounded-lg p-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">{selectedTransaction.projectTitle}</h2>
              <div className="flex items-center space-x-4">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedTransaction.status)}`}>
                  {getProjectOwnerStatusDescription(selectedTransaction.status)}
                </span>
                {selectedTransaction.isDummy && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    Demo Data
                  </span>
                )}
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-slate-900">
                {formatCurrency(selectedTransaction.amount)}
              </div>
              <p className="text-slate-600 mt-1">{getProjectOwnerStatusDescription(selectedTransaction.status)}</p>
            </div>
          </div>

          {/* Transaction Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-600">Order ID</label>
                <p className="text-slate-900 font-mono">{selectedTransaction.orderId}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600">Vendor Name</label>
                <p className="text-slate-900">{selectedTransaction.vendorName}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600">Vendor Email</label>
                <p className="text-slate-900">{selectedTransaction.vendorEmail}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600">Payment Type</label>
                <p className="text-slate-900">{selectedTransaction.paymentType}</p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-600">Created Date</label>
                <p className="text-slate-900">
                  {selectedTransaction.createdAt ? (
                    selectedTransaction.createdAt.toDate ? 
                      new Date(selectedTransaction.createdAt.toDate()).toLocaleDateString('id-ID', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      }) :
                      new Date(selectedTransaction.createdAt).toLocaleDateString('id-ID', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })
                  ) : 'N/A'}
                </p>
              </div>
              {selectedTransaction.updatedAt && (
                <div>
                  <label className="text-sm font-medium text-slate-600">Last Updated</label>
                  <p className="text-slate-900">
                    {selectedTransaction.updatedAt.toDate ? 
                      new Date(selectedTransaction.updatedAt.toDate()).toLocaleDateString('id-ID', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      }) :
                      new Date(selectedTransaction.updatedAt).toLocaleDateString('id-ID', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })
                    }
                  </p>
                </div>
              )}
              <div>
                <label className="text-sm font-medium text-slate-600">Status</label>
                <p className="text-slate-900">{getProjectOwnerStatusDescription(selectedTransaction.status)}</p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-4">
            {selectedTransaction.status === 'waiting-approval' && (
              <button className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors font-medium">
                View Details
              </button>
            )}
            {selectedTransaction.status === 'release' && (
              <button className="px-6 py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors font-medium">
                Release Funds
              </button>
            )}
            {selectedTransaction.status === 'settle' && (
              <button className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors font-medium">
                Download Receipt
              </button>
            )}
            {selectedTransaction.status === 'add-funds' && (
              <button className="px-6 py-3 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg transition-colors font-medium">
                Add Additional Funds
              </button>
            )}
            {selectedTransaction.status === 'indispute' && (
              <button className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium">
                View Dispute Details
              </button>
            )}
            <button 
              onClick={handleBackToList}
              className="px-6 py-3 bg-slate-600 hover:bg-slate-700 text-white rounded-lg transition-colors font-medium"
            >
              Back to Transactions
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Demo Data Notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-blue-700">
              <strong>Demo Data:</strong> This section shows sample transaction data for UI testing purposes. 
              In production, this would display your actual project payment transactions from the database.
            </p>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">Project Transactions</h2>
        
        {/* Status Filter */}
        <div className="flex space-x-2">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="waiting-approval">Waiting Approval</option>
            <option value="process">Processing</option>
            <option value="inescrow">In Escrow</option>
            <option value="release">Ready to Release</option>
            <option value="settle">Released</option>
            <option value="add-funds">Additional Funding</option>
            <option value="refund">Refund</option>
            <option value="indispute">Dispute</option>
            <option value="failed">Failed</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
            <option value="overdue">Overdue</option>
          </select>
        </div>
      </div>

      {/* Transactions List */}
      <div className="space-y-4">
        {filteredTransactions.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No transactions found for the selected status.</p>
          </div>
        ) : (
          filteredTransactions.map((transaction) => (
            <div 
              key={transaction.id} 
              className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => handleViewDetails(transaction)}
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{transaction.projectTitle}</h3>
                    {transaction.isDummy && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        Demo Data
                      </span>
                    )}
                  </div>
                  <p className="text-slate-600 mb-2">
                    <span className="font-medium">Order ID:</span> {transaction.orderId}
                  </p>
                  <p className="text-slate-600 mb-2">
                    <span className="font-medium">Vendor:</span> {transaction.vendorName}
                  </p>
                  <p className="text-slate-600 mb-2">
                    <span className="font-medium">Payment Type:</span> {transaction.paymentType}
                  </p>
                  <p className="text-slate-600 mb-2">
                    <span className="font-medium">Status:</span> {getProjectOwnerStatusDescription(transaction.status)}
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
                      <span className="font-medium">Released:</span> {
                        (transaction.updatedAt.toDate ? 
                          new Date(transaction.updatedAt.toDate()) : 
                          new Date(transaction.updatedAt)
                        ).toLocaleDateString('id-ID')
                      }
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(transaction.status)}`}>
                    {getProjectOwnerStatusDescription(transaction.status)}
                  </span>
                  <p className="text-lg font-bold text-gray-900 mt-2">
                    {formatCurrency(transaction.amount)}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
