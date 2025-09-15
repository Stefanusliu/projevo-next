"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function PaymentSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [verificationStatus, setVerificationStatus] = useState("verifying"); // verifying, success, failed
  const [error, setError] = useState("");
  
  const externalId = searchParams.get("external_id");

  useEffect(() => {
    const verifyPayment = async () => {
      if (!externalId) {
        setError("Invalid payment reference");
        setVerificationStatus("failed");
        return;
      }

      try {
        console.log("🔍 Verifying payment for external_id:", externalId);
        
        // Call our payment status check API
        const response = await fetch("/api/xendit/check-payment-status", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ external_id: externalId }),
        });

        const result = await response.json();
        
        if (response.ok && result.status === "PAID") {
          console.log("✅ Payment verified as PAID");
          setVerificationStatus("success");
          
          // Auto redirect after 5 seconds only if payment is actually verified
          setTimeout(() => {
            router.push("/dashboard/project-owner");
          }, 5000);
        } else {
          console.log("❌ Payment not verified or failed:", result);
          setError(result.error || "Payment verification failed");
          setVerificationStatus("failed");
        }
      } catch (error) {
        console.error("❌ Error verifying payment:", error);
        setError("Failed to verify payment status");
        setVerificationStatus("failed");
      }
    };

    verifyPayment();
  }, [externalId, router]);

  // Show loading while verifying
  if (verificationStatus === "verifying") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="mb-4">
            <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <svg
                className="w-8 h-8 text-blue-500 animate-spin"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Memverifikasi Pembayaran...
          </h1>
          <p className="text-gray-600">
            Mohon tunggu, kami sedang memverifikasi status pembayaran Anda.
          </p>
        </div>
      </div>
    );
  }

  // Show success only if payment is actually verified
  if (verificationStatus === "success") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="mb-4">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <svg
                className="w-8 h-8 text-green-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 13l4 4L19 7"
                ></path>
              </svg>
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Pembayaran Berhasil!
          </h1>
          <p className="text-gray-600 mb-6">
            Terima kasih! Pembayaran Anda telah berhasil diproses dan diverifikasi. 
            Anda akan menerima konfirmasi melalui email.
          </p>
          <button
            onClick={() => router.push("/dashboard/project-owner")}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
          >
            Kembali ke Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Show failure if verification failed
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="mb-4">
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
            <svg
              className="w-8 h-8 text-red-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              ></path>
            </svg>
          </div>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Verifikasi Pembayaran Gagal
        </h1>
        <p className="text-gray-600 mb-6">
          {error || "Pembayaran tidak dapat diverifikasi. Silakan coba lagi atau hubungi customer service."}
        </p>
        <div className="space-y-3">
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
          >
            Coba Verifikasi Lagi
          </button>
          <button
            onClick={() => router.push("/dashboard/project-owner")}
            className="w-full bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 transition-colors"
          >
            Kembali ke Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Memuat halaman verifikasi pembayaran...</p>
      </div>
    </div>
  );
}

export default function PaymentSuccess() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <PaymentSuccessContent />
    </Suspense>
  );
}
