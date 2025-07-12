'use client';

import { useState } from 'react';
import { 
  MdWarning, 
  MdCheckCircle, 
  MdSchedule, 
  MdError 
} from 'react-icons/md';

export default function PaymentManagementComponent() {
  const [activeTab, setActiveTab] = useState('pending_payments');
  
  const [pendingPayments] = useState([
    {
      id: 1,
      projectId: 'PRJ-001',
      projectTitle: "Modern Cafe Interior Design",
      client: "PT. Kuliner Modern",
      clientEmail: "admin@kulinermodern.co.id",
      amount: 185000000,
      currency: 'IDR',
      status: 'pending_payment',
      dueDate: '2024-06-25',
      submittedDate: '2024-06-20',
      paymentMethod: 'bank_transfer',
      invoiceNumber: 'INV-2024-001',
      description: 'Initial project payment - 50% upfront'
    },
    {
      id: 2,
      projectId: 'PRJ-002',
      projectTitle: "Office Building Renovation",
      client: "CV. Berkah Jaya",
      clientEmail: "project@berkahjaya.co.id",
      amount: 225000000,
      currency: 'IDR',
      status: 'payment_received',
      dueDate: '2024-06-22',
      receivedDate: '2024-06-21',
      paymentMethod: 'bank_transfer',
      invoiceNumber: 'INV-2024-002',
      description: 'Initial project payment - 50% upfront'
    },
    {
      id: 3,
      projectId: 'PRJ-003',
      projectTitle: "Residential Complex Architecture",
      client: "PT. Properti Nusantara",
      clientEmail: "development@propertinusantara.co.id",
      amount: 600000000,
      currency: 'IDR',
      status: 'overdue',
      dueDate: '2024-06-18',
      submittedDate: '2024-06-15',
      paymentMethod: 'bank_transfer',
      invoiceNumber: 'INV-2024-003',
      description: 'Initial project payment - 50% upfront'
    }
  ]);

  const [completedProjects] = useState([
    {
      id: 1,
      projectId: 'PRJ-004',
      projectTitle: "Traditional Restaurant Construction",
      vendor: "CV. Construction Pro",
      vendorEmail: "admin@constructionpro.co.id",
      vendorBankAccount: "BCA 1234567890",
      client: "PT. Kuliner Nusantara",
      totalAmount: 320000000,
      platformFee: 16000000, // 5%
      vendorAmount: 304000000,
      currency: 'IDR',
      status: 'ready_for_disbursement',
      completedDate: '2024-06-19',
      approvedDate: '2024-06-20',
      disbursementStatus: 'pending',
      invoiceNumber: 'INV-2024-004',
      description: 'Final project payment after completion'
    },
    {
      id: 2,
      projectId: 'PRJ-005',
      projectTitle: "Boutique Store Renovation",
      vendor: "Renovasi Pro",
      vendorEmail: "contact@renovasipro.co.id",
      vendorBankAccount: "Mandiri 9876543210",
      client: "CV. Fashion Trends",
      totalAmount: 95000000,
      platformFee: 4750000, // 5%
      vendorAmount: 90250000,
      currency: 'IDR',
      status: 'disbursed',
      completedDate: '2024-06-15',
      approvedDate: '2024-06-16',
      disbursedDate: '2024-06-17',
      disbursementStatus: 'completed',
      invoiceNumber: 'INV-2024-005',
      description: 'Final project payment after completion'
    },
    {
      id: 3,
      projectId: 'PRJ-006',
      projectTitle: "Co-working Space Design",
      vendor: "Studio Arsitek Modern",
      vendorEmail: "hello@studioarsitekmodern.co.id",
      vendorBankAccount: "BNI 5555666677",
      client: "PT. Modern Workspace",
      totalAmount: 150000000,
      platformFee: 7500000, // 5%
      vendorAmount: 142500000,
      currency: 'IDR',
      status: 'dispute',
      completedDate: '2024-06-10',
      disputeReason: 'Client reported quality issues',
      disputeDate: '2024-06-12',
      disbursementStatus: 'on_hold',
      invoiceNumber: 'INV-2024-006',
      description: 'Final project payment - under dispute'
    }
  ]);

  const [selectedPayment, setSelectedPayment] = useState(null);
  const [actionModal, setActionModal] = useState(false);
  const [actionType, setActionType] = useState('');
  const [actionNotes, setActionNotes] = useState('');

  const formatCurrency = (amount) => {
    if (amount >= 1000000000) {
      return `Rp ${(amount / 1000000000).toFixed(1)}B`;
    } else if (amount >= 1000000) {
      return `Rp ${(amount / 1000000).toFixed(1)}M`;
    } else if (amount >= 1000) {
      return `Rp ${(amount / 1000).toFixed(0)}K`;
    } else {
      return `Rp ${amount.toLocaleString('id-ID')}`;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getPaymentStatusColor = (status) => {
    switch (status) {
      case 'pending_payment':
        return 'bg-yellow-100 text-yellow-800';
      case 'payment_received':
        return 'bg-green-100 text-green-800';
      case 'overdue':
        return 'bg-red-100 text-red-800';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getDisbursementStatusColor = (status) => {
    switch (status) {
      case 'ready_for_disbursement':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'on_hold':
        return 'bg-red-100 text-red-800';
      case 'dispute':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handlePaymentAction = (payment, action) => {
    setSelectedPayment(payment);
    setActionType(action);
    setActionModal(true);
  };

  const submitAction = () => {
    console.log('Payment action submitted:', {
      payment: selectedPayment,
      action: actionType,
      notes: actionNotes
    });
    
    setActionModal(false);
    setSelectedPayment(null);
    setActionType('');
    setActionNotes('');
  };

  const renderPendingPayments = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-slate-900">
          Pending Client Payments
        </h2>
        <div className="flex items-center space-x-4">
          <select className="px-4 py-2 border border-slate-300 rounded-lg bg-white text-slate-900">
            <option>All Status</option>
            <option>Pending Payment</option>
            <option>Payment Received</option>
            <option>Overdue</option>
          </select>
          <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors">
            Send Reminders
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {pendingPayments.map((payment) => (
          <div key={payment.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-3">
                  <h3 className="text-lg font-semibold text-slate-900">
                    {payment.projectTitle}
                  </h3>
                  <span className={`px-3 py-1 text-sm font-medium rounded-full ${getPaymentStatusColor(payment.status)}`}>
                    {payment.status.replace('_', ' ').toUpperCase()}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-slate-500">Client</p>
                    <p className="font-medium text-slate-900">{payment.client}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Amount</p>
                    <p className="font-medium text-slate-900">{formatCurrency(payment.amount)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Due Date</p>
                    <p className={`font-medium ${payment.status === 'overdue' ? 'text-red-600' : 'text-slate-900'}`}>
                      {formatDate(payment.dueDate)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Invoice</p>
                    <p className="font-medium text-slate-900">{payment.invoiceNumber}</p>
                  </div>
                </div>

                <p className="text-slate-600 mb-4">
                  {payment.description}
                </p>

                {payment.status === 'overdue' && (
                  <div className="p-3 bg-red-50 rounded-lg mb-4">
                    <p className="text-sm text-red-700 font-medium">
                      ⚠️ Payment is overdue by {Math.ceil((new Date() - new Date(payment.dueDate)) / (1000 * 60 * 60 * 24))} days
                    </p>
                  </div>
                )}
              </div>

              <div className="flex items-center space-x-3 ml-6">
                <button 
                  onClick={() => setSelectedPayment(payment)}
                  className="px-4 py-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                >
                  View Details
                </button>
                
                {payment.status === 'pending_payment' && (
                  <>
                    <button 
                      onClick={() => handlePaymentAction(payment, 'mark_received')}
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                    >
                      Mark as Received
                    </button>
                    <button 
                      onClick={() => handlePaymentAction(payment, 'send_reminder')}
                      className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors"
                    >
                      Send Reminder
                    </button>
                  </>
                )}

                {payment.status === 'overdue' && (
                  <>
                    <button 
                      onClick={() => handlePaymentAction(payment, 'mark_received')}
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                    >
                      Mark as Received
                    </button>
                    <button 
                      onClick={() => handlePaymentAction(payment, 'cancel_project')}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                    >
                      Cancel Project
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderDisbursements = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-slate-900">
          Vendor Disbursements
        </h2>
        <div className="flex items-center space-x-4">
          <select className="px-4 py-2 border border-slate-300 rounded-lg bg-white text-slate-900">
            <option>All Status</option>
            <option>Ready for Disbursement</option>
            <option>Pending</option>
            <option>Completed</option>
            <option>On Hold</option>
          </select>
          <button className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors">
            Bulk Disburse
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {completedProjects.map((project) => (
          <div key={project.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-3">
                  <h3 className="text-lg font-semibold text-slate-900">
                    {project.projectTitle}
                  </h3>
                  <span className={`px-3 py-1 text-sm font-medium rounded-full ${getDisbursementStatusColor(project.disbursementStatus)}`}>
                    {project.disbursementStatus.replace('_', ' ').toUpperCase()}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-slate-500">Vendor</p>
                    <p className="font-medium text-slate-900">{project.vendor}</p>
                    <p className="text-sm text-slate-500">{project.vendorBankAccount}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Total Amount</p>
                    <p className="font-medium text-slate-900">{formatCurrency(project.totalAmount)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Platform Fee</p>
                    <p className="font-medium text-slate-900">{formatCurrency(project.platformFee)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Vendor Amount</p>
                    <p className="font-medium text-green-600">{formatCurrency(project.vendorAmount)}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-slate-500">Completed Date</p>
                    <p className="font-medium text-slate-900">{formatDate(project.completedDate)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Approved Date</p>
                    <p className="font-medium text-slate-900">{formatDate(project.approvedDate)}</p>
                  </div>
                  {project.disbursedDate && (
                    <div>
                      <p className="text-sm text-slate-500">Disbursed Date</p>
                      <p className="font-medium text-slate-900">{formatDate(project.disbursedDate)}</p>
                    </div>
                  )}
                </div>

                <p className="text-slate-600 mb-4">
                  {project.description}
                </p>

                {project.status === 'dispute' && (
                  <div className="p-3 bg-orange-50 rounded-lg mb-4">
                    <p className="text-sm text-orange-700 font-medium mb-1">
                      🔍 Project Under Dispute
                    </p>
                    <p className="text-sm text-orange-600">
                      {project.disputeReason}
                    </p>
                  </div>
                )}
              </div>

              <div className="flex items-center space-x-3 ml-6">
                <button 
                  onClick={() => setSelectedPayment(project)}
                  className="px-4 py-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                >
                  View Details
                </button>
                
                {project.disbursementStatus === 'ready_for_disbursement' && (
                  <button 
                    onClick={() => handlePaymentAction(project, 'disburse')}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                  >
                    Disburse Payment
                  </button>
                )}

                {project.disbursementStatus === 'on_hold' && (
                  <>
                    <button 
                      onClick={() => handlePaymentAction(project, 'resolve_dispute')}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                    >
                      Resolve Dispute
                    </button>
                    <button 
                      onClick={() => handlePaymentAction(project, 'disburse')}
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                    >
                      Force Disburse
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Payment Management
          </h1>
          <p className="text-slate-600 mt-2">
            Manage client payments and vendor disbursements
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
            Generate Report
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Pending Payments</p>
              <p className="text-2xl font-bold text-slate-900 mt-2">
                {formatCurrency(pendingPayments.reduce((sum, p) => sum + p.amount, 0))}
              </p>
              <p className="text-sm text-orange-600 mt-1">
                {pendingPayments.filter(p => p.status === 'pending_payment').length} invoices
              </p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <MdWarning className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Ready to Disburse</p>
              <p className="text-2xl font-bold text-slate-900 mt-2">
                {formatCurrency(completedProjects
                  .filter(p => p.disbursementStatus === 'ready_for_disbursement')
                  .reduce((sum, p) => sum + p.vendorAmount, 0))}
              </p>
              <p className="text-sm text-green-600 mt-1">
                {completedProjects.filter(p => p.disbursementStatus === 'ready_for_disbursement').length} projects
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <MdWarning className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Platform Revenue</p>
              <p className="text-2xl font-bold text-slate-900 mt-2">
                {formatCurrency(completedProjects.reduce((sum, p) => sum + p.platformFee, 0))}
              </p>
              <p className="text-sm text-blue-600 mt-1">
                This month
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <MdWarning className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Disputes</p>
              <p className="text-2xl font-bold text-slate-900 mt-2">
                {completedProjects.filter(p => p.status === 'dispute').length}
              </p>
              <p className="text-sm text-red-600 mt-1">
                Require attention
              </p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <MdWarning className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200">
        <div className="border-b border-slate-200">
          <nav className="flex space-x-8 px-6 py-3">
            <button
              onClick={() => setActiveTab('pending_payments')}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'pending_payments'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              Client Payments ({pendingPayments.length})
            </button>
            <button
              onClick={() => setActiveTab('disbursements')}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'disbursements'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              Vendor Disbursements ({completedProjects.length})
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'pending_payments' ? renderPendingPayments() : renderDisbursements()}
        </div>
      </div>

      {/* Action Modal */}
      {actionModal && selectedPayment && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="p-6 border-b border-slate-200">
              <h2 className="text-xl font-bold text-slate-900">
                {actionType === 'mark_received' ? 'Mark Payment as Received' : 
                 actionType === 'send_reminder' ? 'Send Payment Reminder' :
                 actionType === 'disburse' ? 'Disburse Payment' :
                 actionType === 'resolve_dispute' ? 'Resolve Dispute' :
                 actionType === 'cancel_project' ? 'Cancel Project' : 'Confirm Action'}
              </h2>
              <p className="text-slate-600 mt-1">
                {selectedPayment.projectTitle || selectedPayment.title}
              </p>
            </div>
            
            <div className="p-6 space-y-4">
              {actionType === 'disburse' && (
                <div className="p-4 bg-green-50 rounded-lg">
                  <p className="text-sm text-green-700 font-medium mb-2">
                    Disbursement Details:
                  </p>
                  <div className="space-y-1 text-sm text-green-600">
                    <p>Vendor: {selectedPayment.vendor}</p>
                    <p>Bank Account: {selectedPayment.vendorBankAccount}</p>
                    <p>Amount: {formatCurrency(selectedPayment.vendorAmount)}</p>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  {actionType === 'send_reminder' ? 'Reminder Message' : 
                   actionType === 'resolve_dispute' ? 'Resolution Notes' : 'Notes'}
                </label>
                <textarea
                  value={actionNotes}
                  onChange={(e) => setActionNotes(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-900"
                  placeholder={`Enter ${actionType} notes...`}
                />
              </div>
            </div>
            
            <div className="p-6 border-t border-slate-200 flex justify-end space-x-3">
              <button
                onClick={() => setActionModal(false)}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={submitAction}
                className={`px-6 py-2 text-white rounded-lg transition-colors ${
                  actionType === 'mark_received' || actionType === 'disburse' ? 'bg-green-600 hover:bg-green-700' :
                  actionType === 'send_reminder' ? 'bg-blue-600 hover:bg-blue-700' :
                  actionType === 'cancel_project' ? 'bg-red-600 hover:bg-red-700' :
                  'bg-indigo-600 hover:bg-indigo-700'
                }`}
              >
                {actionType === 'mark_received' ? 'Mark as Received' : 
                 actionType === 'send_reminder' ? 'Send Reminder' :
                 actionType === 'disburse' ? 'Disburse Payment' :
                 actionType === 'resolve_dispute' ? 'Resolve Dispute' :
                 actionType === 'cancel_project' ? 'Cancel Project' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
