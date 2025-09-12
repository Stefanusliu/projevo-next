"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function PaymentSuccess() {
  const router = useRouter();

  useEffect(() => {
    // Auto redirect after 5 seconds
    const timer = setTimeout(() => {
      router.push("/dashboard/project-owner");
    }, 5000);

    return () => clearTimeout(timer);
  }, [router]);

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
          Terima kasih! Pembayaran Anda telah berhasil diproses. Anda akan
          menerima konfirmasi melalui email.
        </p>
        <button
          onClick={() => router.push("/dashboard/project-owner")}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
        >
          Kembali ke Dashboard
        </button>
        <p className="text-sm text-gray-500 mt-4">
          Otomatis diarahkan dalam 5 detik...
        </p>
      </div>
    </div>
  );
}
