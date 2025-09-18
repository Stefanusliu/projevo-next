"use client";

import { useState } from "react";

export default function TestPaymentVerification() {
  const [externalId, setExternalId] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const testVerification = async () => {
    if (!externalId) {
      alert("Please enter an external_id");
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      console.log("🧪 Testing payment verification for:", externalId);

      const response = await fetch("/api/xendit/check-payment-status", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ external_id: externalId }),
      });

      const data = await response.json();
      console.log("🧪 Verification result:", data);
      setResult(data);
    } catch (error) {
      console.error("🧪 Test error:", error);
      setResult({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Test Payment Verification</h1>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              External ID
            </label>
            <input
              type="text"
              value={externalId}
              onChange={(e) => setExternalId(e.target.value)}
              placeholder="proj-123-1234567890"
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              Enter an external_id from a payment (e.g., proj-123-1234567890)
            </p>
          </div>

          <button
            onClick={testVerification}
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
          >
            {loading ? "Testing..." : "Test Verification"}
          </button>

          {result && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-2">Result:</h3>
              <pre className="bg-gray-100 p-4 rounded-md overflow-x-auto text-sm">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          )}
        </div>

        <div className="mt-6 bg-blue-50 p-4 rounded-lg">
          <h3 className="font-semibold text-blue-900 mb-2">Instructions:</h3>
          <ul className="text-blue-800 text-sm space-y-1">
            <li>• Make a test payment first to get an external_id</li>
            <li>• Copy the external_id from the payment success URL</li>
            <li>• Paste it here to test the verification API</li>
            <li>• Check browser console for detailed logs</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
