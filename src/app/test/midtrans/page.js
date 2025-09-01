'use client';

import React, { useState } from 'react';
import { FiPlay, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';
import MidtransPaymentModal from '../../../components/payments/MidtransPaymentModal';

const MidtransTestPage = () => {
  const [showModal, setShowModal] = useState(false);
  const [testData, setTestData] = useState({
    projectData: {
      id: 'test-project-123',
      title: 'Test Renovation Project',
      ownerEmail: 'test@example.com',
      ownerName: 'Test Owner'
    },
    selectedProposal: {
      vendorId: 'vendor-123',
      vendorName: 'Test Vendor Co.',
      vendorEmail: 'vendor@example.com',
      totalAmount: 1000000 // 1 million IDR
    },
    proposalIndex: 0
  });

  const handlePaymentSuccess = (result) => {
    console.log('Test payment success:', result);
    alert('Test Payment Successful! Check console for details.');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            Midtrans Payment Integration Test
          </h1>

          {/* Environment Check */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Environment Check</h2>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                {process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY ? (
                  <FiCheckCircle className="text-green-600" />
                ) : (
                  <FiAlertCircle className="text-red-600" />
                )}
                <span className={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY ? 'text-green-700' : 'text-red-700'}>
                  Midtrans Client Key: {process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY ? 'Configured' : 'Missing'}
                </span>
              </div>
              
              <div className="flex items-center gap-3">
                {typeof window !== 'undefined' && window.snap ? (
                  <FiCheckCircle className="text-green-600" />
                ) : (
                  <FiAlertCircle className="text-red-600" />
                )}
                <span className={typeof window !== 'undefined' && window.snap ? 'text-green-700' : 'text-red-700'}>
                  Midtrans Snap Script: {typeof window !== 'undefined' && window.snap ? 'Loaded' : 'Not Loaded'}
                </span>
              </div>
            </div>
          </div>

          {/* Test Data */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Test Data</h2>
            <div className="bg-gray-50 rounded-lg p-4">
              <pre className="text-sm text-gray-700 overflow-x-auto">
                {JSON.stringify(testData, null, 2)}
              </pre>
            </div>
          </div>

          {/* Test Instructions */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Test Instructions</h2>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <ol className="list-decimal list-inside space-y-2 text-blue-800">
                <li>Ensure your Midtrans credentials are configured in .env.local</li>
                <li>Click &quot;Test Payment Modal&quot; to open the payment interface</li>
                <li>Use test card: <strong>4811 1111 1111 1114</strong> for successful payment</li>
                <li>Use any CVV and future expiry date</li>
                <li>Complete the payment flow</li>
                <li>Check console and network tabs for API calls</li>
              </ol>
            </div>
          </div>

          {/* Test Payment Amounts */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Payment Calculation</h2>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-green-700">Total Project Amount:</span>
                  <span className="font-medium text-green-900">
                    Rp {testData.selectedProposal.totalAmount.toLocaleString('id-ID')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-green-700">50% Down Payment:</span>
                  <span className="font-bold text-green-900">
                    Rp {Math.round(testData.selectedProposal.totalAmount * 0.5).toLocaleString('id-ID')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-green-700">Remaining (at completion):</span>
                  <span className="font-medium text-green-900">
                    Rp {Math.round(testData.selectedProposal.totalAmount * 0.5).toLocaleString('id-ID')}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Test Button */}
          <div className="text-center">
            <button
              onClick={() => setShowModal(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              <FiPlay />
              Test Payment Modal
            </button>
          </div>

          {/* Important Notes */}
          <div className="mt-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Important Notes</h2>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <ul className="list-disc list-inside space-y-1 text-yellow-800">
                <li>This is a test environment using Midtrans Sandbox</li>
                <li>No real money will be charged</li>
                <li>Test cards will simulate different payment scenarios</li>
                <li>Check the setup guide for production configuration</li>
                <li>Monitor the Network tab to see API calls to your backend</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      <MidtransPaymentModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        projectData={testData.projectData}
        selectedProposal={testData.selectedProposal}
        proposalIndex={testData.proposalIndex}
        onPaymentSuccess={handlePaymentSuccess}
      />
    </div>
  );
};

export default MidtransTestPage;
