'use client';

import React, { useState, useEffect } from 'react';
import { FiCreditCard, FiLoader, FiX, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';

const MidtransPaymentModal = ({ 
  isOpen, 
  onClose, 
  projectData, 
  selectedProposal, 
  proposalIndex,
  onPaymentSuccess 
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [paymentToken, setPaymentToken] = useState(null);
  const [orderAmount, setOrderAmount] = useState(0);

  // Calculate 50% payment amount
  useEffect(() => {
    if (selectedProposal && isOpen) {
      const totalAmount = selectedProposal.totalAmount || 0;
      const downPayment = Math.round(totalAmount * 0.5);
      setOrderAmount(downPayment);
    }
  }, [selectedProposal, isOpen]);

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const createPayment = async () => {
    if (!projectData || !selectedProposal) {
      setError('Missing project or proposal data');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/midtrans/create-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projectId: projectData.id,
          vendorId: selectedProposal.vendorId,
          vendorName: selectedProposal.vendorName,
          amount: selectedProposal.totalAmount || 0,
          projectTitle: projectData.title || projectData.projectTitle,
          projectOwnerEmail: projectData.ownerEmail,
          projectOwnerName: projectData.ownerName,
          proposalIndex: proposalIndex
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create payment');
      }

      setPaymentToken(data.token);
      
      // Initialize Midtrans Snap
      if (window.snap) {
        window.snap.pay(data.token, {
          onSuccess: (result) => {
            console.log('Payment success:', result);
            handlePaymentSuccess(result);
          },
          onPending: (result) => {
            console.log('Payment pending:', result);
            setError('Payment is pending. Please complete the payment process.');
          },
          onError: (result) => {
            console.log('Payment error:', result);
            setError('Payment failed. Please try again.');
          },
          onClose: () => {
            console.log('Payment modal closed');
            setLoading(false);
          }
        });
      } else {
        throw new Error('Midtrans Snap not loaded. Please refresh the page and try again.');
      }

    } catch (err) {
      console.error('Error creating payment:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = (result) => {
    console.log('Payment completed successfully:', result);
    
    // Close the modal
    onClose();
    
    // Notify parent component
    if (onPaymentSuccess) {
      onPaymentSuccess(result);
    }
    
    // Show success message
    alert('Payment successful! The vendor has been selected and notified.');
  };

  const handleProceedToPayment = () => {
    createPayment();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
        <div className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <FiCreditCard className="text-blue-600" />
                Payment Required
              </h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                disabled={loading}
              >
                <FiX className="w-6 h-6" />
              </button>
            </div>

            {/* Content */}
            <div className="space-y-6">
              {/* Selection Summary */}
              <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-2">Vendor Selection</h3>
                <p className="text-blue-800">
                  <strong>{selectedProposal?.vendorName}</strong> has been selected for your project.
                </p>
              </div>

              {/* Payment Information */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-3">Payment Details</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Project Total:</span>
                    <span className="font-medium">
                      {formatCurrency(selectedProposal?.totalAmount || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Down Payment (50%):</span>
                    <span className="font-bold text-lg text-blue-600">
                      {formatCurrency(orderAmount)}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 mt-2">
                    The remaining 50% will be paid upon project completion.
                  </div>
                </div>
              </div>

              {/* Important Notice */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <FiAlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-yellow-800 mb-1">Important</h4>
                    <p className="text-sm text-yellow-700">
                      By proceeding with this payment, you confirm the selection of this vendor. 
                      The vendor will be notified immediately after successful payment.
                    </p>
                  </div>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <FiAlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-red-800 mb-1">Payment Error</h4>
                      <p className="text-sm text-red-700">{error}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex space-x-3">
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  onClick={handleProceedToPayment}
                  disabled={loading}
                  className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <FiLoader className="animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <FiCreditCard />
                      Pay {formatCurrency(orderAmount)}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
  );
};

export default MidtransPaymentModal;
