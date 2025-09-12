"use client";

import { useState } from "react";
import { useAuth } from "../../../contexts/AuthContext";
import XenditPaymentModal from "../../../components/payments/XenditPaymentModal";
import { FiCreditCard, FiCheckCircle, FiXCircle } from "react-icons/fi";

export default function XenditTestPage() {
  const { user } = useAuth();
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [paymentResults, setPaymentResults] = useState([]);

  const testPayments = [
    {
      id: 1,
      title: "Small Payment Test",
      description: "Test payment for small amount",
      amount: 50000,
      vendor: "Test Vendor A",
    },
    {
      id: 2,
      title: "Medium Payment Test",
      description: "Test payment for medium amount",
      amount: 500000,
      vendor: "Test Vendor B",
    },
    {
      id: 3,
      title: "Large Payment Test",
      description: "Test payment for large amount",
      amount: 5000000,
      vendor: "Test Vendor C",
    },
    {
      id: 4,
      title: "Phase 1 - Down Payment",
      description: "Project down payment (50%)",
      amount: 25000000,
      vendor: "PT. Construction Partner",
    },
    {
      id: 5,
      title: "Phase 2 - Final Payment",
      description: "Project final payment (50%)",
      amount: 25000000,
      vendor: "PT. Construction Partner",
    },
  ];

  const handlePaymentTest = (payment) => {
    setSelectedPayment({
      projectData: {
        projectTitle: payment.title,
        ownerEmail: user?.email || "test@projevo.com",
        estimatedBudget: payment.amount,
      },
      proposal: {
        vendorName: payment.vendor,
        price: payment.amount,
      },
      proposalIndex: 0,
    });
    setShowPaymentModal(true);
  };

  const handlePaymentSuccess = (data) => {
    setPaymentResults((prev) => [
      ...prev,
      {
        id: Date.now(),
        type: "success",
        title: selectedPayment?.projectData?.projectTitle,
        amount: selectedPayment?.proposal?.price,
        timestamp: new Date().toLocaleString(),
        data: data,
      },
    ]);
    setShowPaymentModal(false);
    setSelectedPayment(null);
  };

  const handlePaymentError = (error) => {
    setPaymentResults((prev) => [
      ...prev,
      {
        id: Date.now(),
        type: "error",
        title: selectedPayment?.projectData?.projectTitle,
        amount: selectedPayment?.proposal?.price,
        timestamp: new Date().toLocaleString(),
        error: error,
      },
    ]);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Xendit Payment Integration Test
          </h1>
          <p className="mt-2 text-gray-600">
            Test the Xendit payment flow with different amounts and scenarios
          </p>
        </div>

        {/* Test Payment Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {testPayments.map((payment) => (
            <div key={payment.id} className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {payment.title}
              </h3>
              <p className="text-sm text-gray-600 mb-3">
                {payment.description}
              </p>
              <div className="mb-3">
                <p className="text-sm text-gray-500">
                  Vendor: {payment.vendor}
                </p>
                <p className="text-2xl font-bold text-blue-600">
                  Rp {payment.amount.toLocaleString("id-ID")}
                </p>
              </div>
              <button
                onClick={() => handlePaymentTest(payment)}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
              >
                <FiCreditCard />
                Test Payment
              </button>
            </div>
          ))}
        </div>

        {/* Payment Results */}
        {paymentResults.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Payment Test Results
            </h2>
            <div className="space-y-3">
              {paymentResults.map((result) => (
                <div
                  key={result.id}
                  className={`p-4 rounded-lg border ${
                    result.type === "success"
                      ? "bg-green-50 border-green-200"
                      : "bg-red-50 border-red-200"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    {result.type === "success" ? (
                      <FiCheckCircle className="text-green-600" />
                    ) : (
                      <FiXCircle className="text-red-600" />
                    )}
                    <span
                      className={`font-semibold ${
                        result.type === "success"
                          ? "text-green-800"
                          : "text-red-800"
                      }`}
                    >
                      {result.type === "success"
                        ? "Payment Success"
                        : "Payment Failed"}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700">
                    <strong>Project:</strong> {result.title}
                  </p>
                  <p className="text-sm text-gray-700">
                    <strong>Amount:</strong> Rp{" "}
                    {result.amount?.toLocaleString("id-ID")}
                  </p>
                  <p className="text-sm text-gray-700">
                    <strong>Time:</strong> {result.timestamp}
                  </p>
                  {result.error && (
                    <p className="text-sm text-red-600 mt-1">
                      <strong>Error:</strong> {result.error}
                    </p>
                  )}
                </div>
              ))}
            </div>
            <button
              onClick={() => setPaymentResults([])}
              className="mt-4 bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 transition-colors"
            >
              Clear Results
            </button>
          </div>
        )}

        {/* API Information */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h2 className="text-xl font-bold text-blue-900 mb-4">
            API Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="font-semibold text-blue-800">Xendit Environment:</p>
              <p className="text-blue-700">Development/Sandbox</p>
            </div>
            <div>
              <p className="font-semibold text-blue-800">API Endpoint:</p>
              <p className="text-blue-700">/api/xendit/create-payment</p>
            </div>
            <div>
              <p className="font-semibold text-blue-800">User Email:</p>
              <p className="text-blue-700">{user?.email || "Not logged in"}</p>
            </div>
            <div>
              <p className="font-semibold text-blue-800">Redirect URLs:</p>
              <p className="text-blue-700">
                Success: /payment-success
                <br />
                Failure: /payment-failure
              </p>
            </div>
          </div>
        </div>
      </div>

      <XenditPaymentModal
        isOpen={showPaymentModal}
        onClose={() => {
          setShowPaymentModal(false);
          setSelectedPayment(null);
        }}
        projectData={selectedPayment?.projectData}
        selectedProposal={selectedPayment?.proposal}
        proposalIndex={selectedPayment?.proposalIndex}
        onPaymentSuccess={handlePaymentSuccess}
        onPaymentError={handlePaymentError}
      />
    </div>
  );
}
