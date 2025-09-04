"use client";

import { useState, useEffect, useMemo } from "react";
import { useAuth } from "../../../../contexts/AuthContext";
import {
  collection,
  query,
  where,
  onSnapshot,
  orderBy,
} from "firebase/firestore";
import { db } from "../../../../lib/firebase";

export default function VendorTransactionComponent() {
  const { user, userProfile } = useAuth();
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  // Dummy data for testing UI with all transaction statuses
  const dummyTransactions = useMemo(
    () => [
      {
        id: "dummy_txn_1",
        projectId: "dummy_project_1",
        projectTitle: "Modern Office Renovation",
        orderId: "ORD-20240801-001",
        amount: 75000000, // 50% down payment of 150M
        status: "waiting-approval",
        paymentType: "50% Down Payment",
        clientName: "PT Maju Bersama",
        clientEmail: "admin@majubersama.com",
        createdAt: new Date("2024-08-01"),
        updatedAt: new Date("2024-08-01"),
        isDummy: true,
      },
      {
        id: "dummy_txn_2",
        projectId: "dummy_project_2",
        projectTitle: "Residential House Construction",
        orderId: "ORD-20240802-002",
        amount: 125000000, // 50% down payment of 250M
        status: "process",
        paymentType: "50% Down Payment",
        clientName: "Budi Santoso",
        clientEmail: "budi@email.com",
        createdAt: new Date("2024-08-02"),
        updatedAt: new Date("2024-08-02"),
        isDummy: true,
      },
      {
        id: "dummy_txn_3",
        projectId: "dummy_project_3",
        projectTitle: "Restaurant Kitchen Setup",
        orderId: "ORD-20240803-003",
        amount: 37500000, // 50% down payment of 75M
        status: "inescrow",
        paymentType: "50% Down Payment",
        clientName: "Warung Sederhana",
        clientEmail: "owner@warungsederhana.id",
        createdAt: new Date("2024-08-03"),
        updatedAt: new Date("2024-08-03"),
        isDummy: true,
      },
      {
        id: "dummy_txn_4",
        projectId: "dummy_project_4",
        projectTitle: "Shopping Mall Interior Design - Final Payment",
        orderId: "ORD-20240804-004",
        amount: 250000000, // Final 50% payment of 500M
        status: "release",
        paymentType: "Final Payment",
        clientName: "CV Raya Property",
        clientEmail: "contact@rayaproperty.com",
        createdAt: new Date("2024-08-04"),
        updatedAt: new Date("2024-08-04"),
        isDummy: true,
      },
      {
        id: "dummy_txn_5",
        projectId: "dummy_project_5",
        projectTitle: "Corporate Office Design",
        orderId: "ORD-20240805-005",
        amount: 100000000,
        status: "settle",
        paymentType: "50% Down Payment",
        clientName: "PT Sukses Makmur",
        clientEmail: "finance@suksesmakmur.com",
        createdAt: new Date("2024-08-05"),
        updatedAt: new Date("2024-08-05"),
        isDummy: true,
      },
      {
        id: "dummy_txn_6",
        projectId: "dummy_project_6",
        projectTitle: "Hotel Lobby Renovation - Additional Work",
        orderId: "ORD-20240806-006",
        amount: 50000000,
        status: "add-funds",
        paymentType: "Additional Work Payment",
        clientName: "Hotel Grand Indonesia",
        clientEmail: "procurement@hotelgrand.com",
        createdAt: new Date("2024-08-06"),
        updatedAt: new Date("2024-08-06"),
        isDummy: true,
      },
      {
        id: "dummy_txn_7",
        projectId: "dummy_project_7",
        projectTitle: "Cafe Interior Design",
        orderId: "ORD-20240807-007",
        amount: 30000000,
        status: "refund",
        paymentType: "50% Down Payment",
        clientName: "Kafe Cozy Corner",
        clientEmail: "owner@kafecozy.com",
        createdAt: new Date("2024-08-07"),
        updatedAt: new Date("2024-08-07"),
        isDummy: true,
      },
      {
        id: "dummy_txn_8",
        projectId: "dummy_project_8",
        projectTitle: "Warehouse Construction",
        orderId: "ORD-20240808-008",
        amount: 200000000,
        status: "indispute",
        paymentType: "Final Payment",
        clientName: "PT Logistik Prima",
        clientEmail: "legal@logistikprima.com",
        createdAt: new Date("2024-08-08"),
        updatedAt: new Date("2024-08-08"),
        isDummy: true,
      },
      {
        id: "dummy_txn_9",
        projectId: "dummy_project_9",
        projectTitle: "Apartment Renovation",
        orderId: "ORD-20240809-009",
        amount: 80000000,
        status: "failed",
        paymentType: "50% Down Payment",
        clientName: "Sari Indah",
        clientEmail: "sari@email.com",
        createdAt: new Date("2024-08-09"),
        updatedAt: new Date("2024-08-09"),
        isDummy: true,
      },
      {
        id: "dummy_txn_10",
        projectId: "dummy_project_10",
        projectTitle: "Villa Construction",
        orderId: "ORD-20240810-010",
        amount: 300000000,
        status: "pending",
        paymentType: "50% Down Payment",
        clientName: "Ahmad Wijaya",
        clientEmail: "ahmad@email.com",
        createdAt: new Date("2024-08-10"),
        updatedAt: new Date("2024-08-10"),
        isDummy: true,
      },
      {
        id: "dummy_txn_11",
        projectId: "dummy_project_11",
        projectTitle: "School Building Renovation - Final Payment",
        orderId: "ORD-20240811-011",
        amount: 150000000,
        status: "completed",
        paymentType: "Final Payment",
        clientName: "SMA Nusantara",
        clientEmail: "admin@smanusantara.sch.id",
        createdAt: new Date("2024-08-11"),
        updatedAt: new Date("2024-08-11"),
        isDummy: true,
      },
      {
        id: "dummy_txn_12",
        projectId: "dummy_project_12",
        projectTitle: "Medical Clinic Interior",
        orderId: "ORD-20240812-012",
        amount: 90000000,
        status: "overdue",
        paymentType: "50% Down Payment",
        clientName: "Klinik Sehat Bersama",
        clientEmail: "admin@kliniksehat.com",
        createdAt: new Date("2024-07-12"), // Overdue since last month
        updatedAt: new Date("2024-07-12"),
        isDummy: true,
      },
    ],
    []
  );

  // Calculate termin values based on project structure
  const getTerminCalculations = (transaction) => {
    if (!transaction || !transaction.amount) return null;

    // Project total value is double the down payment amount (since down payment is 50%)
    const projectTotalValue = transaction.amount * 2; // 150,000,000
    const totalTahapan = 4; // 4 tahapan/termin
    const terminValue = projectTotalValue / totalTahapan; // 37,500,000 per termin
    const currentTermin = 3; // Currently showing Termin 3

    return {
      projectTotalValue,
      totalTahapan,
      terminValue,
      currentTermin,
    };
  };

  // Load transactions from projects where vendor is the current user
  useEffect(() => {
    if (!user?.uid || !userProfile?.email) {
      // Use dummy data when user is not available
      setTransactions(dummyTransactions);
      setLoading(false);
      return;
    }

    console.log(
      "Loading vendor transactions for user:",
      user.uid,
      "email:",
      userProfile.email
    );
    setLoading(true);

    // Query projects where the current user is the vendor
    const projectsQuery = query(
      collection(db, "projects"),
      where("selectedVendorId", "==", user.uid)
    );

    const unsubscribe = onSnapshot(
      projectsQuery,
      (snapshot) => {
        const vendorTransactions = [];

        snapshot.forEach((doc) => {
          const projectData = doc.data();

          // Check if project has payment information
          if (projectData.payment) {
            console.log(
              "Project with payment found for vendor:",
              doc.id,
              projectData.payment
            );

            vendorTransactions.push({
              id: `project_${doc.id}`,
              projectId: doc.id,
              projectTitle:
                projectData.title ||
                projectData.projectTitle ||
                "Unknown Project",
              orderId: projectData.payment.orderId,
              amount: projectData.payment.amount,
              status: projectData.payment.status || "pending",
              paymentType:
                projectData.payment.paymentType || "50% Down Payment",
              clientName: projectData.ownerName || "Unknown Client",
              clientEmail: projectData.ownerEmail,
              snapUrl: projectData.payment.snapUrl,
              snapToken: projectData.payment.snapToken,
              createdAt: projectData.payment.createdAt,
              updatedAt: projectData.payment.updatedAt,
              transactionStatus: projectData.payment.transactionStatus,
              fraudStatus: projectData.payment.fraudStatus,
              webhookData: projectData.payment.webhookData,
              // Project-specific fields
              projectOwnerId: projectData.ownerId,
              vendorId: projectData.selectedVendorId,
              projectBudget: projectData.budget,
            });
          }
        });

        // Combine real data with dummy data for demonstration
        const combinedTransactions = [
          ...vendorTransactions,
          ...dummyTransactions,
        ];
        console.log(
          "Loaded vendor transactions for user:",
          user.uid,
          "Total transactions:",
          combinedTransactions.length
        );
        console.log("All vendor transaction data:", combinedTransactions);
        setTransactions(combinedTransactions);
        setLoading(false);
      },
      (error) => {
        console.error("Error loading vendor transactions:", error);
        // Fallback to dummy data on error
        setTransactions(dummyTransactions);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user?.uid, userProfile?.email]);

  // Organize transactions by status and get filtered transactions
  const transactionData = {
    "waiting-approval": transactions.filter(
      (t) => t.status === "waiting-approval"
    ),
    process: transactions.filter((t) => t.status === "process"),
    inescrow: transactions.filter((t) => t.status === "inescrow"),
    release: transactions.filter((t) => t.status === "release"),
    settle: transactions.filter((t) => t.status === "settle"),
    "add-funds": transactions.filter((t) => t.status === "add-funds"),
    refund: transactions.filter((t) => t.status === "refund"),
    indispute: transactions.filter((t) => t.status === "indispute"),
    failed: transactions.filter((t) => t.status === "failed"),
    // Keep legacy statuses for backward compatibility
    pending: transactions.filter((t) => t.status === "pending"),
    completed: transactions.filter((t) => t.status === "completed"),
    overdue: transactions.filter((t) => t.status === "overdue"),
  };

  // Get filtered transactions based on selected status
  const filteredTransactions =
    selectedStatus === "all"
      ? transactions
      : transactionData[selectedStatus] || [];

  // Status options for dropdown - Vendor perspective
  const statusOptions = [
    { value: "all", label: "All Transactions", count: transactions.length },
    {
      value: "waiting-approval",
      label: "Waiting Approval",
      count: transactionData["waiting-approval"].length,
      description: "Menunggu persetujuan client",
    },
    {
      value: "process",
      label: "Processing",
      count: transactionData["process"].length,
      description: "Client sedang bayar",
    },
    {
      value: "inescrow",
      label: "In Escrow",
      count: transactionData["inescrow"].length,
      description: "Dana aman di escrow",
    },
    {
      value: "release",
      label: "Releasing",
      count: transactionData["release"].length,
      description: "Dana sedang dikirim",
    },
    {
      value: "settle",
      label: "Received",
      count: transactionData["settle"].length,
      description: "Dana sudah diterima",
    },
    {
      value: "add-funds",
      label: "Fund Requests",
      count: transactionData["add-funds"].length,
      description: "Request dana tambahan",
    },
    {
      value: "refund",
      label: "Refunded",
      count: transactionData["refund"].length,
      description: "Dana dikembalikan",
    },
    {
      value: "indispute",
      label: "In Dispute",
      count: transactionData["indispute"].length,
      description: "Dalam sengketa",
    },
    {
      value: "failed",
      label: "Failed",
      count: transactionData["failed"].length,
      description: "Pembayaran gagal",
    },
    // Legacy statuses
    {
      value: "pending",
      label: "Pending",
      count: transactionData["pending"].length,
      description: "Menunggu pembayaran",
    },
    {
      value: "completed",
      label: "Completed",
      count: transactionData["completed"].length,
      description: "Selesai",
    },
    {
      value: "overdue",
      label: "Overdue",
      count: transactionData["overdue"].length,
      description: "Terlambat",
    },
  ];

  const handleViewDetails = (transaction) => {
    // Show transaction details inline
    setSelectedTransaction(transaction);
    setShowDetails(true);
  };

  const handleBackToList = () => {
    setShowDetails(false);
    setSelectedTransaction(null);
  };

  const handleRequestFunds = (transaction) => {
    // Open request additional funds modal
    alert(`Ajukan dana tambahan untuk proyek: ${transaction.projectTitle}`);
  };

  const handleContactClient = (transaction) => {
    // Open contact client modal or redirect to communication
    alert(
      `Hubungi klien: ${transaction.clientName} (${transaction.clientEmail})`
    );
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

  const getStatusColor = (status) => {
    return "text-white"; // All status badges use white text
  };

  const getStatusBgColor = (status) => {
    switch (status) {
      case "waiting-approval":
        return "#F59E0B"; // Orange - Menunggu persetujuan client
      case "process":
        return "#2373FF"; // Blue - Client sedang bayar
      case "inescrow":
        return "#8B5CF6"; // Purple - Dana aman di escrow
      case "release":
        return "#06B6D4"; // Cyan - Dana sedang dikirim
      case "settle":
        return "#10B981"; // Green - Dana sudah diterima
      case "add-funds":
        return "#F59E0B"; // Orange - Request dana tambahan
      case "refund":
        return "#6B7280"; // Gray - Dana dikembalikan
      case "indispute":
        return "#DC2626"; // Red - Dalam sengketa
      case "failed":
        return "#EF4444"; // Red - Pembayaran gagal
      // Legacy statuses
      case "pending":
        return "#2373FF"; // Blue
      case "completed":
        return "#10B981"; // Green
      case "overdue":
        return "#F59E0B"; // Orange
      default:
        return "#6B7280"; // Gray
    }
  };

  const getVendorStatusDescription = (status) => {
    switch (status) {
      case "waiting-approval":
        return "Klien belum menyetujui pembayaran";
      case "process":
        return "Klien sedang melakukan pembayaran";
      case "inescrow":
        return "Dana aman tersimpan, menunggu proyek selesai";
      case "release":
        return "Dana sedang ditransfer ke rekening Anda";
      case "settle":
        return "Pembayaran berhasil diterima";
      case "add-funds":
        return "Menunggu persetujuan dana tambahan";
      case "refund":
        return "Dana dikembalikan ke client";
      case "indispute":
        return "Pembayaran dalam proses sengketa";
      case "failed":
        return "Pembayaran gagal diproses";
      case "pending":
        return "Menunggu pembayaran dari client";
      case "completed":
        return "Transaksi telah selesai";
      case "overdue":
        return "Pembayaran terlambat";
      default:
        return "Status tidak diketahui";
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div
          className="animate-spin rounded-full h-12 w-12 border-b-2"
          style={{ borderColor: "#2373FF" }}
        ></div>
        <span className="ml-3 text-gray-600">Loading transactions...</span>
      </div>
    );
  }

  // Show transaction details view
  if (showDetails && selectedTransaction) {
    const calculations = getTerminCalculations(selectedTransaction);

    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        {/* Back button */}
        <button
          onClick={handleBackToList}
          className="mb-6 flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
        >
          ← Kembali ke Daftar Transaksi
        </button>

        {/* Main content */}
        <div className="max-w-6xl mx-auto">
          {/* Title */}
          <h1 className="text-3xl font-bold text-gray-900 text-center mb-8">
            Detail Transaksi
          </h1>

          <div className="grid grid-cols-12 gap-8">
            {/* Left Column */}
            <div className="col-span-6 space-y-4">
              <div>
                <p className="text-sm text-gray-500">
                  {selectedTransaction.orderId || selectedTransaction.id}
                </p>
                <h2 className="text-2xl font-bold text-gray-900">
                  {selectedTransaction.projectTitle}
                </h2>
                <p className="text-sm text-gray-600">Jakarta Selatan</p>
              </div>

              <div className="grid grid-cols-2 gap-6">
                {/* Left sub-column */}
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-500">Klien</p>
                    <p className="text-xl font-bold text-gray-900">
                      {selectedTransaction.clientName}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">Status Proyek</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {getVendorStatusDescription(selectedTransaction.status)}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">Jenis Tagihan</p>
                    <p className="text-2xl font-bold text-gray-900">Termin</p>
                  </div>
                </div>

                {/* Right sub-column */}
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-500">Nilai Kontrak</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatCurrency(selectedTransaction.amount * 2)}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">Escrow</p>
                    <p className="text-2xl font-bold text-gray-900">
                      The last termin
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">Tahap Pembayaran</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {selectedTransaction.paymentType}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Empty for now */}
            <div className="col-span-6"></div>
          </div>

          {/* Gambaran Transaksi */}
          <div className="mt-8">
            <p className="text-sm text-gray-500 mb-4">Gambaran Transaksi</p>
            <div className="border border-gray-300 rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-white">
                  <tr>
                    <th className="px-4 py-1 text-left text-sm font-medium text-gray-900"></th>
                    <th className="px-4 py-1 text-center text-sm font-medium text-gray-900">
                      Termin 1
                    </th>
                    <th className="px-4 py-1 text-center text-sm font-medium text-gray-900">
                      Termin 2
                    </th>
                    <th className="px-4 py-1 text-center text-sm font-medium text-gray-900">
                      Termin 3
                    </th>
                    <th className="px-4 py-1 text-center text-sm font-medium text-gray-900">
                      Termin 4
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="px-4 py-1 text-sm font-medium text-gray-900 text-right">
                      Pendanaan
                    </td>
                    <td className="px-4 py-1 text-center text-sm text-gray-900 bg-gray-200"></td>
                    <td className="px-4 py-1 text-center text-sm text-gray-900 bg-gray-200"></td>
                    <td className="px-4 py-1 text-center text-sm text-gray-900 bg-white"></td>
                    <td className="px-4 py-1 text-center text-sm text-gray-900 bg-white"></td>
                  </tr>
                  <tr>
                    <td className="px-4 py-1 text-sm font-medium text-gray-900 text-right">
                      Dibayarkan
                    </td>
                    <td className="px-4 py-1 text-center text-sm text-gray-900 bg-gray-200"></td>
                    <td className="px-4 py-1 text-center text-sm text-gray-900 bg-white"></td>
                    <td className="px-4 py-1 text-center text-sm text-gray-900 bg-white"></td>
                    <td className="px-4 py-1 text-center text-sm text-gray-900 bg-white"></td>
                  </tr>
                  <tr>
                    <td className="px-4 py-1 text-sm font-medium text-gray-900 text-right">
                      Sisa tagihan
                    </td>
                    <td className="px-4 py-1 text-center text-sm text-gray-900 bg-white"></td>
                    <td className="px-4 py-1 text-center text-sm text-gray-900 bg-white"></td>
                    <td className="px-4 py-1 text-center text-sm text-gray-900 bg-gray-200"></td>
                    <td className="px-4 py-1 text-center text-sm text-gray-900 bg-gray-200"></td>
                  </tr>
                  <tr className="border-t-2 border-gray-400">
                    <td className="px-4 py-1 text-sm font-bold text-gray-900 text-right">
                      Nilai
                    </td>
                    <td className="px-4 py-1 text-center text-sm font-bold text-gray-900 bg-white">
                      {formatCurrency(selectedTransaction.amount / 2)}
                    </td>
                    <td className="px-4 py-1 text-center text-sm font-bold text-gray-900 bg-white">
                      {formatCurrency(selectedTransaction.amount / 2)}
                    </td>
                    <td className="px-4 py-1 text-center text-sm font-bold text-gray-900 bg-white">
                      {formatCurrency(selectedTransaction.amount / 2)}
                    </td>
                    <td className="px-4 py-1 text-center text-sm font-bold text-gray-900 bg-white">
                      {formatCurrency(selectedTransaction.amount / 2)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Rincian Transaksi */}
          <div className="mt-8">
            <p className="text-sm text-gray-500 mb-4">Rincian Transaksi</p>
            <div className="border border-gray-300 rounded-lg p-4">
              {/* Top section with Jatuh Tempo */}
              <div className="flex justify-between">
                <h3 className="text-2xl font-bold text-gray-900 ml-1">
                  Termin {calculations ? calculations.currentTermin : 3}
                </h3>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Jatuh Tempo</p>
                  <p className="text-xl font-bold text-gray-900">
                    {selectedTransaction.createdAt
                      ? selectedTransaction.createdAt.toDate
                        ? new Date(
                            selectedTransaction.createdAt.toDate()
                          ).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })
                        : new Date(
                            selectedTransaction.createdAt
                          ).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })
                      : "N/A"}
                  </p>
                </div>
              </div>

              {/* Fee breakdown section */}
              <div className="space-y-1 mb-4 ml-8">
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-900 w-32">
                    Tagihan Termin
                  </span>
                  <span className="text-sm text-gray-900">
                    {calculations
                      ? formatCurrency(calculations.terminValue)
                      : formatCurrency(selectedTransaction.amount / 2)}
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-900 w-32">PPN 10%</span>
                  <span className="text-sm text-gray-900">
                    {calculations
                      ? formatCurrency(calculations.terminValue * 0.1)
                      : formatCurrency((selectedTransaction.amount / 2) * 0.1)}
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-900 w-32">
                    Biaya layanan 1%
                  </span>
                  <span className="text-sm text-gray-900">
                    {calculations
                      ? formatCurrency(calculations.terminValue * 0.01)
                      : formatCurrency((selectedTransaction.amount / 2) * 0.01)}
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-900 w-32">
                    Biaya eMaterai
                  </span>
                  <span className="text-sm text-gray-900">
                    {formatCurrency(15000)}
                  </span>
                </div>
              </div>

              {/* Nilai Tagihan and Button - UNDER biaya layanan but on the right */}
              <div className="flex justify-end">
                <div className="text-right space-y-2">
                  <div>
                    <p className="text-xl text-gray-900">Nilai Tagihan</p>
                    <p className="text-3xl font-bold text-gray-900">
                      {calculations
                        ? formatCurrency(
                            calculations.terminValue * 1.11 + 15000
                          )
                        : formatCurrency(
                            (selectedTransaction.amount / 2) * 1.11
                          )}
                    </p>
                  </div>
                  {/* Vendor-specific action button based on status */}
                  {selectedTransaction.status === "waiting-approval" && (
                    <button className="px-10 py-1 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium">
                      Hubungi Klien
                    </button>
                  )}
                  {selectedTransaction.status === "release" && (
                    <button className="px-10 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium">
                      Minta Pencairan
                    </button>
                  )}
                  {selectedTransaction.status === "settle" && (
                    <div className="text-green-600 font-medium">
                      ✓ Dana Diterima
                    </div>
                  )}
                  {!["waiting-approval", "release", "settle"].includes(
                    selectedTransaction.status
                  ) && (
                    <button className="px-10 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
                      Tindakan
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Riwayat Transaksi */}
          <div className="mt-8">
            <p className="text-sm text-gray-500 mb-4">Riwayat Transaksi</p>
            <div className="border border-gray-300 rounded-lg p-4">
              {/* Top section with Selesai status */}
              <div className="flex justify-between">
                <h3 className="text-2xl font-bold text-gray-900 ml-1">
                  Termin 1 & 2
                </h3>
                <div className="text-right">
                  <div className="inline-block px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-md mb-2">
                    Selesai
                  </div>
                </div>
              </div>

              {/* Fee breakdown section */}
              <div className="space-y-1 mb-4 ml-8">
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-900 w-32">
                    Tagihan Termin
                  </span>
                  <span className="text-sm text-gray-900">
                    {calculations
                      ? formatCurrency(calculations.terminValue * 2)
                      : formatCurrency(selectedTransaction.amount)}
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-900 w-32">PPN 10%</span>
                  <span className="text-sm text-gray-900">
                    {calculations
                      ? formatCurrency(calculations.terminValue * 2 * 0.1)
                      : formatCurrency(selectedTransaction.amount * 0.1)}
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-900 w-32">
                    Biaya layanan 1%
                  </span>
                  <span className="text-sm text-gray-900">
                    {calculations
                      ? formatCurrency(calculations.terminValue * 2 * 0.01)
                      : formatCurrency(selectedTransaction.amount * 0.01)}
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-900 w-32">
                    Biaya eMaterai
                  </span>
                  <span className="text-sm text-gray-900">
                    {formatCurrency(15000)}
                  </span>
                </div>
              </div>

              {/* Nilai Tagihan - UNDER biaya layanan but on the right, NO button */}
              <div className="flex justify-end">
                <div className="text-right">
                  <p className="text-sm text-gray-900">Nilai Tagihan</p>
                  <p className="text-xl font-bold text-gray-900">
                    {calculations
                      ? formatCurrency(
                          calculations.terminValue * 2 * 1.11 + 15000
                        )
                      : formatCurrency((selectedTransaction.amount / 2) * 1.11)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200">
      {/* Header */}
      <div className="border-b border-slate-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Transaksi</h1>
            <p className="text-slate-600">
              Kelola pembayaran proyek dan penghasilan Anda
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-slate-500">Total Transactions</p>
            <p className="text-2xl font-bold text-slate-900">
              {transactions.length}
            </p>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Dummy Data Notice */}
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg
                className="w-5 h-5 text-blue-400 mt-0.5"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">
                Demo Data Display
              </h3>
              <p className="text-sm text-blue-700 mt-1">
                This section shows dummy transaction data to demonstrate all
                payment statuses and UI functionality. Real payment data will
                replace this when you start receiving payments for actual
                projects.
              </p>
            </div>
          </div>
        </div>

        {/* Status Filter Dropdown */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <label
                htmlFor="status-filter"
                className="block text-sm font-medium text-slate-700 mb-2"
              >
                Filter by Status
              </label>
              <select
                id="status-filter"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="block w-80 px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white"
              >
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label} ({option.count})
                    {option.description && ` - ${option.description}`}
                  </option>
                ))}
              </select>
            </div>
            <div className="text-right">
              <p className="text-sm text-slate-600">
                Showing {filteredTransactions.length} of {transactions.length}{" "}
                transactions
              </p>
            </div>
          </div>
        </div>

        {/* Transaction List */}
        <div className="space-y-4">
          {filteredTransactions.length === 0 ? (
            <div className="text-center py-12">
              <svg
                className="w-16 h-16 text-slate-400 mx-auto mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                />
              </svg>
              <h3 className="text-lg font-medium text-slate-900 mb-2">
                {selectedStatus === "all"
                  ? "No transactions found"
                  : `No ${selectedStatus} transactions`}
              </h3>
              <p className="text-slate-500">
                {selectedStatus === "all"
                  ? "No payment transactions have been created yet."
                  : selectedStatus === "waiting-approval"
                  ? "No payments waiting for client approval."
                  : selectedStatus === "process"
                  ? "No payments currently being processed by clients."
                  : selectedStatus === "inescrow"
                  ? "No funds currently secured in escrow."
                  : selectedStatus === "release"
                  ? "No payments being released to you."
                  : selectedStatus === "settle"
                  ? "No settled payments received yet."
                  : selectedStatus === "add-funds"
                  ? "No additional fund requests at the moment."
                  : selectedStatus === "refund"
                  ? "No refunds processed."
                  : selectedStatus === "indispute"
                  ? "No payments currently in dispute."
                  : selectedStatus === "failed"
                  ? "No failed transactions found."
                  : selectedStatus === "pending"
                  ? "No pending payments from clients."
                  : selectedStatus === "completed"
                  ? "No completed transactions yet."
                  : "No transactions found for this status."}
              </p>
            </div>
          ) : (
            filteredTransactions.map((transaction) => (
              <div
                key={transaction.id}
                className="bg-white border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow min-h-[200px] relative"
              >
                <div className="grid grid-cols-12 gap-4 h-full">
                  {/* Left Section */}
                  <div className="col-span-6 space-y-1">
                    {/* Custom ID Project */}
                    <p className="text-xs text-gray-500">
                      {transaction.orderId}
                    </p>

                    {/* Title Project */}
                    <h3 className="text-xl font-bold text-gray-900 leading-tight">
                      {transaction.projectTitle}
                    </h3>

                    {/* Location */}
                    <p className="text-sm mb-3 text-gray-600">
                      Jakarta Selatan
                    </p>

                    {/* Klien (instead of Vendor for vendor perspective) */}
                    <div className="mt-0">
                      <p className="text-sm text-gray-500">Klien</p>
                      <p className="text-lg font-bold text-gray-900">
                        {transaction.clientName}
                      </p>
                    </div>

                    {/* Status Proyek */}
                    <div className="mt-0">
                      <p className="text-sm text-gray-500">Status Proyek</p>
                      <p className="text-lg font-bold text-gray-900">
                        {getVendorStatusDescription(transaction.status)}
                      </p>
                    </div>

                    {/* Jenis Tagihan */}
                    <div className="mt-0">
                      <p className="text-sm text-gray-500">Jenis Tagihan</p>
                      <p className="text-lg font-bold text-gray-900">Termin</p>
                    </div>
                  </div>

                  {/* Right Section */}
                  <div className="col-span-6 h-full">
                    <div className="flex flex-col h-full justify-between">
                      {/* Top Right - Jatuh Tempo */}
                      <div className="text-right">
                        <p className="text-sm text-gray-500">Jatuh Tempo</p>
                        <p className="text-sm text-gray-900">
                          {transaction.createdAt
                            ? transaction.createdAt.toDate
                              ? new Date(
                                  transaction.createdAt.toDate()
                                ).toLocaleDateString("id-ID", {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                })
                              : new Date(
                                  transaction.createdAt
                                ).toLocaleDateString("id-ID", {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                })
                            : "N/A"}
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-4 flex-1">
                        {/* Left Column */}
                        <div className="space-y-4">
                          {/* Nilai Kontrak */}
                          <div>
                            <p className="text-sm text-gray-500">
                              Nilai Kontrak
                            </p>
                            <p className="text-lg font-bold text-gray-900">
                              {formatCurrency(transaction.amount * 2)}
                            </p>
                          </div>

                          {/* Escrow */}
                          <div>
                            <p className="text-sm text-gray-500">Escrow</p>
                            <p className="text-lg font-bold text-gray-900">
                              Termin 3
                            </p>
                          </div>

                          {/* Tahap Pembayaran */}
                          <div>
                            <p className="text-sm text-gray-500">
                              Tahap Pembayaran
                            </p>
                            <p className="text-lg font-bold text-gray-900">
                              {transaction.paymentType}
                            </p>
                          </div>
                        </div>

                        {/* Right Column - Nilai Tagihan positioned at same height as Jenis Tagihan */}
                        <div className="flex flex-col justify-start pt-[180px]">
                          {/* Nilai Tagihan - Positioned on the RIGHT at same height as Jenis Tagihan */}
                          <div className="text-right mb-4">
                            <p className="text-base font-medium text-gray-700">
                              Nilai Tagihan
                            </p>
                            <p className="text-2xl font-bold text-gray-900">
                              {formatCurrency(transaction.amount)}
                            </p>
                          </div>

                          {/* Buttons - Following after Nilai Tagihan */}
                          <div className="flex gap-2 justify-end">
                            <button
                              onClick={() => handleViewDetails(transaction)}
                              className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                            >
                              Detail
                            </button>
                            {/* Vendor-specific action buttons based on status */}
                            {transaction.status === "waiting-approval" && (
                              <button className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium">
                                Hubungi Klien
                              </button>
                            )}
                            {transaction.status === "release" && (
                              <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium">
                                Minta Pencairan
                              </button>
                            )}
                            {transaction.status === "settle" && (
                              <div className="px-4 py-2 text-green-600 font-medium text-sm">
                                ✓ Dana Diterima
                              </div>
                            )}
                            {![
                              "waiting-approval",
                              "release",
                              "settle",
                            ].includes(transaction.status) && (
                              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
                                Tindakan
                              </button>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Bottom Right - No buttons here anymore since they moved with Nilai Tagihan */}
                      <div className="absolute bottom-3 right-3">
                        <div className="text-right space-y-3">
                          {/* Buttons moved to follow Nilai Tagihan */}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
