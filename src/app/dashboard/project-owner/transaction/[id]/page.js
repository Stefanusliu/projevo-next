'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';

export default function TransactionDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [transaction, setTransaction] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTransaction = async () => {
      if (!id || !user) return;

      try {
        const transactionDoc = await getDoc(doc(db, 'transactions', id));
        if (transactionDoc.exists()) {
          const transactionData = { id: transactionDoc.id, ...transactionDoc.data() };
          
          // Verify this transaction belongs to the current project owner
          if (transactionData.ownerId === user.uid || transactionData.ownerEmail === user.email) {
            setTransaction(transactionData);
          } else {
            router.push('/dashboard/project-owner');
          }
        } else {
          router.push('/dashboard/project-owner');
        }
      } catch (error) {
        console.error('Error fetching transaction:', error);
        router.push('/dashboard/project-owner');
      } finally {
        setLoading(false);
      }
    };

    fetchTransaction();
  }, [id, user, router]);

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
      case 'waiting-approval':
        return 'bg-orange-500';
      case 'process':
        return 'bg-blue-500';
      case 'inescrow':
        return 'bg-yellow-500';
      case 'release':
        return 'bg-purple-500';
      case 'settle':
        return 'bg-green-500';
      case 'add-funds':
        return 'bg-indigo-500';
      case 'refund':
        return 'bg-gray-500';
      case 'indispute':
        return 'bg-red-600';
      case 'failed':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusDescription = (status) => {
    switch (status) {
      case 'waiting-approval':
        return 'Waiting for your approval';
      case 'process':
        return 'Payment being processed';
      case 'inescrow':
        return 'Funds secured in escrow';
      case 'release':
        return 'Ready to release funds';
      case 'settle':
        return 'Payment completed';
      case 'add-funds':
        return 'Additional funding required';
      case 'refund':
        return 'Payment refunded';
      case 'indispute':
        return 'Under dispute review';
      case 'failed':
        return 'Payment failed';
      default:
        return 'Unknown status';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-slate-600">Loading transaction details...</span>
      </div>
    );
  }

  if (!transaction) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Transaction Not Found</h2>
          <p className="text-slate-600 mb-4">The transaction you&apos;re looking for doesn&apos;t exist or you don&apos;t have access to it.</p>
          <button
            onClick={() => router.push('/dashboard/project-owner')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center text-slate-600 hover:text-slate-900 mb-4 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Transactions
          </button>
          <h1 className="text-3xl font-bold text-slate-900">Transaction Details</h1>
          <p className="text-slate-600 mt-2">Complete information about this payment transaction</p>
        </div>

        {/* Transaction Info Card */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 mb-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">{transaction.projectTitle}</h2>
              <div className="flex items-center space-x-4">
                <span 
                  className={`inline-flex px-4 py-2 rounded-full text-sm font-medium text-white ${getStatusColor(transaction.status)}`}
                >
                  {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1).replace('-', ' ')}
                </span>
                {transaction.isDummy && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    Demo Data
                  </span>
                )}
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-slate-900">
                {formatCurrency(transaction.amount)}
              </div>
              <p className="text-slate-600 mt-1">{getStatusDescription(transaction.status)}</p>
            </div>
          </div>

          {/* Transaction Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-600">Order ID</label>
                <p className="text-slate-900 font-mono">{transaction.orderId || transaction.id}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600">Vendor Name</label>
                <p className="text-slate-900">{transaction.vendorName}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600">Vendor Email</label>
                <p className="text-slate-900">{transaction.vendorEmail}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600">Payment Type</label>
                <p className="text-slate-900">{transaction.paymentType}</p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-600">Created Date</label>
                <p className="text-slate-900">
                  {transaction.createdAt ? (
                    transaction.createdAt.toDate ? 
                      new Date(transaction.createdAt.toDate()).toLocaleDateString('id-ID', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      }) :
                      new Date(transaction.createdAt).toLocaleDateString('id-ID', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })
                  ) : 'N/A'}
                </p>
              </div>
              {transaction.updatedAt && (
                <div>
                  <label className="text-sm font-medium text-slate-600">Last Updated</label>
                  <p className="text-slate-900">
                    {transaction.updatedAt.toDate ? 
                      new Date(transaction.updatedAt.toDate()).toLocaleDateString('id-ID', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      }) :
                      new Date(transaction.updatedAt).toLocaleDateString('id-ID', {
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
              {transaction.environment && (
                <div>
                  <label className="text-sm font-medium text-slate-600">Environment</label>
                  <p className="text-slate-900">
                    {transaction.environment === 'sandbox' ? '🧪 Sandbox' : '🔒 Production'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-4">
          {transaction.status === 'waiting-approval' && (
            <>
              <button className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors font-medium">
                Approve Payment
              </button>
              <button className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors font-medium">
                Reject Payment
              </button>
            </>
          )}
          {transaction.status === 'release' && (
            <button className="px-6 py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors font-medium">
              Release Funds
            </button>
          )}
          {transaction.status === 'settle' && (
            <button className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors font-medium">
              Download Receipt
            </button>
          )}
          {transaction.status === 'add-funds' && (
            <button className="px-6 py-3 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg transition-colors font-medium">
              Add Additional Funds
            </button>
          )}
          {transaction.status === 'indispute' && (
            <button className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium">
              View Dispute Details
            </button>
          )}
          <button 
            onClick={() => router.push('/dashboard/project-owner')}
            className="px-6 py-3 bg-slate-600 hover:bg-slate-700 text-white rounded-lg transition-colors font-medium"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
