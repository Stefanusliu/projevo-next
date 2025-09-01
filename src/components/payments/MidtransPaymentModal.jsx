'use client';

import React, { useState, useEffect } from 'react';
import { FiCreditCard, FiLoader, FiX, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext'; // Add useAuth import

const MidtransPaymentModal = ({ 
  isOpen, 
  onClose, 
  projectData, 
  selectedProposal, 
  proposalIndex,
  onPaymentSuccess 
}) => {
  const { user } = useAuth(); // Add useAuth hook
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [paymentToken, setPaymentToken] = useState(null);
  const [orderAmount, setOrderAmount] = useState(0);
  const [snapModalOpen, setSnapModalOpen] = useState(false); // Track if Snap modal is open

  // Calculate 50% payment amount
  useEffect(() => {
    if (selectedProposal && isOpen) {
      const totalAmount = selectedProposal.totalAmount || 0;
      const downPayment = Math.round(totalAmount * 0.5);
      setOrderAmount(downPayment);
    }
  }, [selectedProposal, isOpen]);

  // Reset state when modal is closed
  useEffect(() => {
    if (!isOpen) {
      setLoading(false);
      setError(null);
      setPaymentToken(null);
      setSnapModalOpen(false);
    }
  }, [isOpen]);

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

    const paymentData = {
      projectId: projectData.id,
      vendorId: selectedProposal.vendorId,
      vendorName: selectedProposal.vendorName,
      amount: selectedProposal.totalAmount || 0,
      projectTitle: projectData.title || projectData.projectTitle,
      projectOwnerEmail: projectData.ownerEmail,
      projectOwnerName: projectData.ownerName,
      projectOwnerId: user?.uid, // Add user ID
      proposalIndex: proposalIndex
    };

    console.log('🚀 PAYMENT MODAL DEBUG:');
    console.log('  - Project ID:', projectData.id);
    console.log('  - Project Data:', projectData);
    console.log('  - User ID:', user?.uid);
    console.log('  - User Email:', user?.email);
    console.log('  - Payment Data:', paymentData);
    console.log('  - Selected proposal:', selectedProposal);

    try {
      const response = await fetch('/api/midtrans/create-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentData),
      });

      const data = await response.json();
      console.log('Response received:', { status: response.status, data });

      if (!response.ok) {
        console.error('Payment creation failed:', data);
        console.error('Midtrans error details:', data.details);
        
        // Show detailed error message
        const errorMessage = data.details?.error_messages 
          ? data.details.error_messages.join(', ')
          : data.error || 'Failed to create payment';
          
        throw new Error(errorMessage);
      }

      setPaymentToken(data.token);
      
      // Initialize Midtrans Snap
      if (window.snap) {
        setSnapModalOpen(true); // Hide the main modal
        window.snap.pay(data.token, {
          onSuccess: (result) => {
            console.log('Payment success:', result);
            setSnapModalOpen(false);
            handlePaymentSuccess(result, data);
          },
          onPending: (result) => {
            console.log('Payment pending:', result);
            setSnapModalOpen(false);
            setError('Payment is pending. Please complete the payment process. You can continue the payment from the Payment tab.');
          },
          onError: (result) => {
            console.log('Payment error:', result);
            setSnapModalOpen(false);
            setError('Payment failed. Please try again or use the Payment tab to retry.');
          },
          onClose: () => {
            console.log('Payment modal closed');
            setSnapModalOpen(false);
            setLoading(false);
          }
        });
      } else {
        throw new Error('Midtrans Snap not loaded. Please refresh the page and try again.');
      }

    } catch (err) {
      console.error('Error creating payment:', err);
      setError(err.message);
      setSnapModalOpen(false); // Ensure Snap modal state is reset on error
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = (result, paymentData) => {
    console.log('Payment completed successfully:', result);
    console.log('Payment data:', paymentData);
    
    // Reset all states
    setLoading(false);
    setError(null);
    setSnapModalOpen(false);
    
    // Close the modal
    onClose();
    
    // Notify parent component
    if (onPaymentSuccess) {
      onPaymentSuccess({
        ...result,
        paymentId: paymentData?.paymentId,
        orderId: paymentData?.order_id,
        amount: paymentData?.amount
      });
    }
    
    // Show success message with payment tracking info
    alert(`Payment successful! 
    
Order ID: ${paymentData?.order_id || result.order_id}
Amount: ${formatCurrency(paymentData?.amount || orderAmount)}

You can track this payment in the Payment tab. The vendor has been selected and notified.`);
  };

  const handleProceedToPayment = () => {
    createPayment();
  };

  if (!isOpen) return null;

  // Hide main modal content when Snap modal is open to prevent double modals
  return (
    <div className={`fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 ${snapModalOpen ? 'opacity-0 pointer-events-none' : ''}`}>
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
