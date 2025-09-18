"use client";

import { useState } from "react";
import {
  FiCreditCard,
  FiCheck,
  FiClock,
  FiXCircle,
  FiExternalLink,
  FiRefreshCw,
} from "react-icons/fi";

export default function PaymentTerminTab({ project, isVendorView = false }) {
  const [refreshing, setRefreshing] = useState(false);

  // Support both old single payment structure and new multiple payments structure
  const payments =
    project.payments || (project.payment ? [project.payment] : []);

  console.log("PaymentTerminTab - project:", project);
  console.log("PaymentTerminTab - payments:", payments);

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "completed":
      case "paid":
      case "settled":
        return "text-green-600 bg-green-50 border-green-200";
      case "pending":
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
      case "failed":
      case "expired":
        return "text-red-600 bg-red-50 border-red-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case "completed":
      case "paid":
      case "settled":
        return <FiCheck className="w-4 h-4" />;
      case "pending":
        return <FiClock className="w-4 h-4" />;
      case "failed":
      case "expired":
        return <FiXCircle className="w-4 h-4" />;
      default:
        return <FiCreditCard className="w-4 h-4" />;
    }
  };

  const formatCurrency = (amount) => {
    if (!amount) return "Rp 0";
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";

    let date;
    // Handle Firebase Timestamp objects
    if (dateString.toDate && typeof dateString.toDate === "function") {
      date = dateString.toDate();
    } else if (dateString.seconds) {
      // Handle Firebase Timestamp-like objects
      date = new Date(dateString.seconds * 1000);
    } else if (typeof dateString === "string" || dateString instanceof Date) {
      date = new Date(dateString);
    } else {
      return "-";
    }

    return date.toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleRefreshPayments = async () => {
    setRefreshing(true);
    // Add refresh logic here if needed
    setTimeout(() => setRefreshing(false), 1000);
  };

  const handleViewInvoice = (payment) => {
    if (payment.invoiceUrl) {
      window.open(payment.invoiceUrl, "_blank");
    }
  };

  if (!payments || payments.length === 0) {
    return (
      <div className="text-center py-12">
        <FiCreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Belum Ada Pembayaran
        </h3>
        <p className="text-gray-500">
          Termin pembayaran belum dibuat untuk proyek ini.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Termin Pembayaran
          </h3>
          <p className="text-sm text-gray-500">
            {isVendorView
              ? "Status pembayaran dari project owner"
              : "Kelola pembayaran termin proyek"}
          </p>
        </div>
        <button
          onClick={handleRefreshPayments}
          disabled={refreshing}
          className="flex items-center space-x-2 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors disabled:opacity-50"
        >
          <FiRefreshCw
            className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`}
          />
          <span className="text-sm font-medium">Refresh</span>
        </button>
      </div>

      {/* Payment Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="text-sm text-gray-500 mb-1">Total Termin</div>
          <div className="text-2xl font-bold text-gray-900">
            {payments.length}
          </div>
        </div>
        <div className="bg-green-50 rounded-lg p-4">
          <div className="text-sm text-green-600 mb-1">Sudah Dibayar</div>
          <div className="text-2xl font-bold text-green-700">
            {
              payments.filter((p) =>
                ["completed", "paid", "settled"].includes(
                  p.status?.toLowerCase()
                )
              ).length
            }
          </div>
        </div>
        <div className="bg-yellow-50 rounded-lg p-4">
          <div className="text-sm text-yellow-600 mb-1">Menunggu Bayar</div>
          <div className="text-2xl font-bold text-yellow-700">
            {
              payments.filter((p) => p.status?.toLowerCase() === "pending")
                .length
            }
          </div>
        </div>
      </div>

      {/* Payment List */}
      <div className="space-y-4">
        {payments.map((payment, index) => (
          <div
            key={payment.externalId || payment.id || index}
            className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start space-x-4">
                <div
                  className={`p-2 rounded-lg border ${getStatusColor(
                    payment.status
                  )}`}
                >
                  {getStatusIcon(payment.status)}
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">
                    {payment.title ||
                      `Termin ${payment.paymentIndex || index + 1}`}
                  </h4>
                  <p className="text-sm text-gray-500 mb-2">
                    {payment.paymentType === "initial"
                      ? "Pembayaran Awal"
                      : payment.paymentType === "progress"
                      ? "Pembayaran Progress"
                      : payment.paymentType === "final"
                      ? "Pembayaran Akhir"
                      : payment.paymentType || "Pembayaran"}
                  </p>
                  <div
                    className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                      payment.status
                    )}`}
                  >
                    {getStatusIcon(payment.status)}
                    <span className="capitalize">
                      {payment.status === "completed"
                        ? "Selesai"
                        : payment.status === "pending"
                        ? "Menunggu"
                        : payment.status === "failed"
                        ? "Gagal"
                        : payment.status || "Unknown"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="text-right">
                <div className="text-lg font-bold text-gray-900">
                  {formatCurrency(payment.amount)}
                </div>
                {payment.paidAmount &&
                  payment.paidAmount !== payment.amount && (
                    <div className="text-sm text-green-600">
                      Dibayar: {formatCurrency(payment.paidAmount)}
                    </div>
                  )}
              </div>
            </div>

            {/* Payment Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                {payment.createdAt && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Dibuat:</span>
                    <span className="text-gray-900">
                      {formatDate(payment.createdAt)}
                    </span>
                  </div>
                )}
                {payment.paidAt && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Dibayar:</span>
                    <span className="text-gray-900">
                      {formatDate(payment.paidAt)}
                    </span>
                  </div>
                )}
                {payment.verifiedAt && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Diverifikasi:</span>
                    <span className="text-gray-900">
                      {formatDate(payment.verifiedAt)}
                    </span>
                  </div>
                )}
                {payment.externalId && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">ID Transaksi:</span>
                    <span className="text-gray-900 font-mono text-xs">
                      {payment.externalId}
                    </span>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                {payment.paymentMethod && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Metode:</span>
                    <span className="text-gray-900">
                      {payment.paymentMethod}
                    </span>
                  </div>
                )}
                {payment.orderId && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Order ID:</span>
                    <span className="text-gray-900 font-mono text-xs">
                      {payment.orderId}
                    </span>
                  </div>
                )}
                {payment.invoiceId && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Invoice ID:</span>
                    <span className="text-gray-900 font-mono text-xs">
                      {payment.invoiceId}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            {(payment.invoiceUrl || payment.status === "pending") && (
              <div className="flex items-center space-x-3 mt-4 pt-4 border-t border-gray-100">
                {payment.invoiceUrl && (
                  <button
                    onClick={() => handleViewInvoice(payment)}
                    className="flex items-center space-x-2 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                  >
                    <FiExternalLink className="w-4 h-4" />
                    <span className="text-sm font-medium">Lihat Invoice</span>
                  </button>
                )}

                {payment.status === "pending" && !isVendorView && (
                  <button
                    onClick={() => handleViewInvoice(payment)}
                    className="flex items-center space-x-2 px-3 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors"
                  >
                    <FiCreditCard className="w-4 h-4" />
                    <span className="text-sm font-medium">Bayar Sekarang</span>
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Payment Notes */}
      <div className="bg-blue-50 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 mb-2">Informasi Pembayaran</h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Pembayaran akan diverifikasi otomatis setelah berhasil</li>
          <li>• Status pembayaran akan ter-update secara real-time</li>
          <li>• Hubungi support jika ada kendala pembayaran</li>
          {isVendorView && (
            <li>
              • Anda dapat melihat status pembayaran namun tidak dapat
              mengaksesnya
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}
