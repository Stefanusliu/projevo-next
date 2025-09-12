"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function PaymentFailure() {
  const router = useRouter();

  useEffect(() => {
    // Auto redirect after 10 seconds
    const timer = setTimeout(() => {
      router.push("/dashboard/project-owner");
    }, 10000);

    return () => clearTimeout(timer);
  }, [router]);

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
          Pembayaran Gagal
        </h1>
        <p className="text-gray-600 mb-6">
          Maaf, pembayaran Anda tidak dapat diproses. Silakan coba lagi atau
          hubungi customer service.
        </p>
        <div className="space-y-3">
          <button
            onClick={() => router.push("/dashboard/project-owner")}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
          >
            Coba Lagi
          </button>
          <button
            onClick={() => router.push("/contact")}
            className="w-full bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300 transition-colors"
          >
            Hubungi Support
          </button>
        </div>
        <p className="text-sm text-gray-500 mt-4">
          Otomatis diarahkan dalam 10 detik...
        </p>
      </div>
    </div>
  );
}
