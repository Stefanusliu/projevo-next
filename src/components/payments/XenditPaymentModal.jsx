import React, { useState } from "react";

const XenditPaymentModal = ({
  isOpen,
  onClose,
  projectData,
  selectedProposal,
  proposalIndex,
  onPaymentSuccess,
  onPaymentError,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handlePay = async () => {
    setLoading(true);
    setError(null);
    try {
      // Calculate payment amount based on termin (first payment = termin 1 + 2)
      let amount = 0;

      if (
        projectData?.paymentType === "first_payment" &&
        projectData?.firstPaymentAmount
      ) {
        // Use calculated first payment amount (termin 1 + 2)
        amount = Number(projectData.firstPaymentAmount);
        console.log("💰 Using calculated first payment amount:", amount);
      } else if (selectedProposal?.price) {
        // Fallback to full proposal price if no termin calculation
        amount = Number(selectedProposal.price);
        console.log("⚠️ Fallback to full proposal price:", amount);
      } else if (projectData?.estimatedBudget) {
        // Fallback to estimated budget
        amount = Number(
          String(projectData.estimatedBudget).replace(/[^\d]/g, "")
        );
        console.log("⚠️ Fallback to estimated budget:", amount);
      }

      if (amount <= 0) {
        throw new Error("Jumlah pembayaran tidak valid");
      }

      const payerEmail = projectData?.ownerEmail || "";
      if (!payerEmail) {
        throw new Error("Email pemilik proyek tidak ditemukan");
      }

      const description =
        projectData?.paymentType === "first_payment"
          ? `Pembayaran Termin 1 & 2 - ${
              projectData?.projectTitle || projectData?.title
            }`
          : `Pembayaran proyek: ${
              projectData?.projectTitle || projectData?.title
            }`;

      console.log("Creating payment with:", {
        amount,
        payerEmail,
        description,
      });

      const res = await fetch("/api/xendit/create-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount, payerEmail, description }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Gagal membuat pembayaran");
      }

      if (data.invoice_url) {
        // Open payment URL in new tab
        window.open(data.invoice_url, "_blank");

        // Close modal and call success callback
        onClose();
        if (onPaymentSuccess) onPaymentSuccess(data);
      } else {
        throw new Error("URL pembayaran tidak ditemukan");
      }
    } catch (err) {
      console.error("Payment error:", err);
      setError(err.message);
      if (onPaymentError) onPaymentError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  // Calculate display amount
  let displayAmount = 0;
  if (
    projectData?.paymentType === "first_payment" &&
    projectData?.firstPaymentAmount
  ) {
    // Use calculated first payment amount (termin 1 + 2)
    displayAmount = Number(projectData.firstPaymentAmount);
  } else if (selectedProposal?.price) {
    displayAmount = Number(selectedProposal.price);
  } else if (projectData?.estimatedBudget) {
    displayAmount = Number(
      String(projectData.estimatedBudget).replace(/[^\d]/g, "")
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-lg">
        <h2 className="text-xl font-bold mb-4">
          {projectData?.paymentType === "first_payment"
            ? "Pembayaran Awal Proyek"
            : "Pembayaran Proyek"}
        </h2>

        <div className="space-y-3 mb-4">
          <div>
            <p className="text-sm text-gray-600">Proyek:</p>
            <p className="font-semibold">
              {projectData?.projectTitle || projectData?.title}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-600">Vendor:</p>
            <p className="font-semibold">
              {selectedProposal?.vendorName || "-"}
            </p>
          </div>

          {projectData?.paymentType === "first_payment" && (
            <>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm font-medium text-blue-800 mb-2">
                  Rincian Pembayaran Berdasarkan Deal Vendor:
                </p>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Total Deal Vendor:</span>
                    <span className="font-medium">
                      Rp{" "}
                      {projectData.totalProjectAmount?.toLocaleString("id-ID")}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Jumlah Fase:</span>
                    <span className="font-medium">
                      {projectData.projectPhases} Fase
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Per Termin:</span>
                    <span className="font-medium">
                      Rp {projectData.terminAmount?.toLocaleString("id-ID")}
                    </span>
                  </div>
                  <hr className="my-2 border-blue-200" />
                  <div className="flex justify-between font-semibold text-blue-900">
                    <span>Termin 1 + 2:</span>
                    <span>Rp {displayAmount.toLocaleString("id-ID")}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Sisa Pembayaran:</span>
                    <span>
                      Rp {projectData.remainingAmount?.toLocaleString("id-ID")}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-sm text-yellow-800">
                  <strong>Catatan:</strong> Setelah pembayaran berhasil, vendor
                  dapat memulai pekerjaan. Pembayaran akhir akan dilakukan
                  setelah proyek selesai.
                </p>
              </div>
            </>
          )}

          {projectData?.paymentType !== "first_payment" && (
            <div>
              <p className="text-sm text-gray-600">Jumlah Pembayaran:</p>
              <p className="text-2xl font-bold text-blue-600">
                Rp {displayAmount.toLocaleString("id-ID")}
              </p>
            </div>
          )}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        <div className="flex gap-3 mt-6">
          <button
            className="flex-1 bg-blue-600 text-white px-4 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handlePay}
            disabled={loading}
          >
            {loading
              ? "Memproses..."
              : `Bayar ${
                  projectData?.paymentType === "first_payment"
                    ? "Termin 1 & 2"
                    : "Sekarang"
                }`}
          </button>
          <button
            className="px-6 py-3 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={onClose}
            disabled={loading}
          >
            Batal
          </button>
        </div>
      </div>
    </div>
  );
};

export default XenditPaymentModal;
