"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { db } from "../../lib/firebase";
import { doc, updateDoc, getDoc } from "firebase/firestore";

// Function to update Firebase payment status
async function updateFirebasePaymentStatus(externalId, paymentResult) {
  try {
    console.log(
      "🔄 Updating Firebase payment status for external_id:",
      externalId
    );

    // Extract project ID from external_id (format: proj-{projectId}-{timestamp})
    if (!externalId.startsWith("proj-")) {
      console.log("⚠️ External ID doesn't match expected format:", externalId);
      return;
    }

    const parts = externalId.split("-");
    if (parts.length < 3) {
      console.log("⚠️ Invalid external_id format:", externalId);
      return;
    }

    const projectId = parts[1];
    console.log("📋 Extracted project ID:", projectId);

    // Update the project payment status
    const projectRef = doc(db, "projects", projectId);

    // Check if project exists and get current data
    const projectSnapshot = await getDoc(projectRef);
    if (!projectSnapshot.exists()) {
      console.log("❌ Project not found:", projectId);
      return;
    }

    const projectData = projectSnapshot.data();

    // Support both old single payment structure and new multiple payments structure
    const existingPayments =
      projectData.payments ||
      (projectData.payment ? [projectData.payment] : []);

    // Find the specific payment to update by matching external_id
    const paymentIndex = existingPayments.findIndex(
      (p) => p.externalId === externalId
    );

    if (paymentIndex === -1) {
      console.log(
        "❌ Payment not found in project payments array with external_id:",
        externalId
      );
      return;
    }

    // Update the specific payment in the array
    existingPayments[paymentIndex] = {
      ...existingPayments[paymentIndex],
      status: "completed",
      orderId: paymentResult.orderId,
      amount: paymentResult.amount,
      paidAmount: paymentResult.paidAmount,
      paymentMethod: paymentResult.paymentMethod,
      paidAt: paymentResult.paidAt
        ? new Date(paymentResult.paidAt)
        : new Date(),
      verifiedAt: new Date(),
      updatedAt: new Date(),
      paymentInitiated: true,
    };

    // Prepare update data for project
    const updateData = {
      payments: existingPayments,
      updatedAt: new Date(),
    };

    // If this is the initial payment, also update project status
    if (existingPayments[paymentIndex].paymentType === "initial") {
      updateData.firstPaymentCompleted = true;
      updateData.initialPaymentCompleted = true;
      updateData.paymentCompletedAt = new Date();
      updateData.status = "Berjalan"; // Change status to running
    }

    await updateDoc(projectRef, updateData);
    console.log(
      "✅ Firebase payment status updated successfully for project:",
      projectId,
      "payment index:",
      paymentIndex
    );
  } catch (error) {
    console.error("❌ Error updating Firebase payment status:", error);
    // Don't throw error to avoid breaking the UI - this is a background update
  }
}

function PaymentSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [verificationStatus, setVerificationStatus] = useState("verifying"); // verifying, success, failed
  const [error, setError] = useState("");

  const externalId = searchParams.get("external_id");

  useEffect(() => {
    const verifyPayment = async () => {
      if (!externalId) {
        console.log("❌ No external_id found in URL params");
        setError("Invalid payment reference");
        setVerificationStatus("failed");
        return;
      }

      console.log(
        "🔍 Starting payment verification for external_id:",
        externalId
      );

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
        console.log("🔍 Payment verification result:", result);

        if (
          response.ok &&
          (result.status === "PAID" ||
            result.invoiceStatus === "PAID" ||
            result.isCompleted)
        ) {
          console.log("✅ Payment verified as PAID");

          // Update Firebase payment status immediately
          await updateFirebasePaymentStatus(externalId, result);

          setVerificationStatus("success");

          // Auto redirect after 5 seconds only if payment is actually verified
          setTimeout(() => {
            router.push("/dashboard/project-owner");
          }, 5000);
        } else {
          console.log("❌ Payment not verified or failed:", result);
          setError(
            result.error || result.message || "Payment verification failed"
          );
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
            Terima kasih! Pembayaran Anda telah berhasil diproses dan
            diverifikasi. Anda akan menerima konfirmasi melalui email.
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
          {error ||
            "Pembayaran tidak dapat diverifikasi. Silakan coba lagi atau hubungi customer service."}
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
