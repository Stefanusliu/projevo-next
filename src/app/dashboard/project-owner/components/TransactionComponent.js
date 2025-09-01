"use client";

import { useState, useEffect, useMemo } from "react";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";

export default function TransactionComponent() {
  const { user } = useAuth();
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  const handleViewDetails = (transaction) => {
    // Show transaction details inline
    setSelectedTransaction(transaction);
    setShowDetails(true);
  };

  const handleBackToList = () => {
    setShowDetails(false);
    setSelectedTransaction(null);
  };

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
      currentTermin
    };
  };

  // Dummy data for testing UI with all transaction statuses - Project Owner perspective
  const dummyTransactions = useMemo(
    () => [
      {
        id: "dummy_po_txn_1",
        projectId: "dummy_project_1",
        projectTitle: "Modern Office Renovation",
        orderId: "ORD-20240801-001",
        amount: 75000000, // 50% down payment of 150M
        status: "waiting-approval",
        paymentType: "50% Down Payment",
        vendorName: "PT Konstruksi Andalan",
        vendorEmail: "admin@konstruksiandalan.com",
        createdAt: new Date("2024-08-01"),
        updatedAt: new Date("2024-08-01"),
        isDummy: true,
      },
      {
        id: "dummy_po_txn_2",
        projectId: "dummy_project_2",
        projectTitle: "Residential House Construction",
        orderId: "ORD-20240802-002",
        amount: 125000000, // 50% down payment of 250M
        status: "process",
        paymentType: "50% Down Payment",
        vendorName: "CV Bangun Jaya",
        vendorEmail: "info@bangunjaya.com",
        createdAt: new Date("2024-08-02"),
        updatedAt: new Date("2024-08-02"),
        isDummy: true,
      },
      {
        id: "dummy_po_txn_3",
        projectId: "dummy_project_3",
        projectTitle: "Restaurant Kitchen Setup",
        orderId: "ORD-20240803-003",
        amount: 37500000, // 50% down payment of 75M
        status: "inescrow",
        paymentType: "50% Down Payment",
        vendorName: "PT Kitchen Solutions",
        vendorEmail: "order@kitchensolutions.id",
        createdAt: new Date("2024-08-03"),
        updatedAt: new Date("2024-08-03"),
        isDummy: true,
      },
      {
        id: "dummy_po_txn_4",
        projectId: "dummy_project_4",
        projectTitle: "Shopping Mall Interior",
        orderId: "ORD-20240804-004",
        amount: 250000000, // 50% down payment of 500M
        status: "release",
        paymentType: "50% Down Payment",
        vendorName: "PT Interior Megah",
        vendorEmail: "project@interiormegah.com",
        createdAt: new Date("2024-08-04"),
        updatedAt: new Date("2024-08-04"),
        isDummy: true,
      },
      {
        id: "dummy_po_txn_5",
        projectId: "dummy_project_5",
        projectTitle: "Hotel Lobby Redesign",
        orderId: "ORD-20240805-005",
        amount: 90000000, // 50% down payment of 180M
        status: "settle",
        paymentType: "50% Down Payment",
        vendorName: "CV Design Excellence",
        vendorEmail: "admin@designexcellence.id",
        createdAt: new Date("2024-08-05"),
        updatedAt: new Date("2024-08-05"),
        isDummy: true,
      },
      {
        id: "dummy_po_txn_6",
        projectId: "dummy_project_6",
        projectTitle: "Warehouse Expansion",
        orderId: "ORD-20240806-006",
        amount: 175000000, // Additional funding for 350M project
        status: "add-funds",
        paymentType: "Additional Funding",
        vendorName: "PT Industrial Build",
        vendorEmail: "finance@industrialbuild.co.id",
        createdAt: new Date("2024-08-06"),
        updatedAt: new Date("2024-08-06"),
        isDummy: true,
      },
      {
        id: "dummy_po_txn_7",
        projectId: "dummy_project_7",
        projectTitle: "School Library Renovation",
        orderId: "ORD-20240807-007",
        amount: 25000000, // Partial refund
        status: "refund",
        paymentType: "Partial Refund",
        vendorName: "CV Edu Builders",
        vendorEmail: "support@edubuilders.com",
        createdAt: new Date("2024-08-07"),
        updatedAt: new Date("2024-08-07"),
        isDummy: true,
      },
      {
        id: "dummy_po_txn_8",
        projectId: "dummy_project_8",
        projectTitle: "Medical Clinic Setup",
        orderId: "ORD-20240808-008",
        amount: 60000000, // 50% down payment of 120M
        status: "indispute",
        paymentType: "50% Down Payment",
        vendorName: "PT Medical Contractors",
        vendorEmail: "dispute@medicalcontractors.id",
        createdAt: new Date("2024-08-08"),
        updatedAt: new Date("2024-08-08"),
        isDummy: true,
      },
      {
        id: "dummy_po_txn_9",
        projectId: "dummy_project_9",
        projectTitle: "Apartment Complex Phase 1",
        orderId: "ORD-20240809-009",
        amount: 300000000, // 50% down payment of 600M
        status: "failed",
        paymentType: "50% Down Payment",
        vendorName: "PT Mega Developers",
        vendorEmail: "projects@megadevelopers.co.id",
        createdAt: new Date("2024-08-09"),
        updatedAt: new Date("2024-08-09"),
        isDummy: true,
      },
      {
        id: "dummy_po_txn_10",
        projectId: "dummy_project_10",
        projectTitle: "Community Center Upgrade",
        orderId: "ORD-20240810-010",
        amount: 45000000, // 50% down payment of 90M
        status: "pending",
        paymentType: "50% Down Payment",
        vendorName: "CV Community Works",
        vendorEmail: "info@communityworks.id",
        createdAt: new Date("2024-08-10"),
        updatedAt: new Date("2024-08-10"),
        isDummy: true,
      },
      {
        id: "dummy_po_txn_11",
        projectId: "dummy_project_11",
        projectTitle: "Corporate Headquarters",
        orderId: "ORD-20240811-011",
        amount: 500000000, // 50% down payment of 1B
        status: "completed",
        paymentType: "50% Down Payment",
        vendorName: "PT Elite Construction",
        vendorEmail: "corporate@eliteconstruction.co.id",
        createdAt: new Date("2024-08-11"),
        updatedAt: new Date("2024-08-11"),
        isDummy: true,
      },
      {
        id: "dummy_po_txn_12",
        projectId: "dummy_project_12",
        projectTitle: "Factory Equipment Installation",
        orderId: "ORD-20240812-012",
        amount: 85000000, // Overdue payment
        status: "overdue",
        paymentType: "Final Payment",
        vendorName: "PT Industrial Systems",
        vendorEmail: "overdue@industrialsystems.id",
        createdAt: new Date("2024-07-15"), // Past due date
        updatedAt: new Date("2024-07-15"),
        isDummy: true,
      },
    ],
    []
  );

  useEffect(() => {
    if (!user) return;

    const fetchTransactions = () => {
      try {
        // For demo purposes, use dummy data
        // In production, this would query Firestore for user's project payments:
        // const paymentsQuery = query(
        //   collection(db, 'projects'),
        //   where('ownerId', '==', user.uid),
        //   orderBy('createdAt', 'desc')
        // );

        setTransactions(dummyTransactions);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching transactions:", error);
        setTransactions(dummyTransactions);
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [user]);

  const getStatusColor = (status) => {
    switch (status) {
      case "waiting-approval":
        return "bg-yellow-100 text-yellow-800";
      case "process":
        return "bg-blue-100 text-blue-800";
      case "inescrow":
        return "bg-purple-100 text-purple-800";
      case "release":
        return "bg-green-100 text-green-800";
      case "settle":
        return "bg-green-100 text-green-800";
      case "add-funds":
        return "bg-indigo-100 text-indigo-800";
      case "refund":
        return "bg-orange-100 text-orange-800";
      case "indispute":
        return "bg-red-100 text-red-800";
      case "failed":
        return "bg-red-100 text-red-800";
      case "pending":
        return "bg-gray-100 text-gray-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "overdue":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getProjectOwnerStatusDescription = (status) => {
    switch (status) {
      case "waiting-approval":
        return "Waiting for Approval";
      case "process":
        return "Processing Payment";
      case "inescrow":
        return "Funds in Escrow";
      case "release":
        return "Ready to Release";
      case "settle":
        return "Payment Released";
      case "add-funds":
        return "Additional Funding";
      case "refund":
        return "Refund Processed";
      case "indispute":
        return "Under Dispute";
      case "failed":
        return "Payment Failed";
      case "pending":
        return "Pending Payment";
      case "completed":
        return "Transaction Completed";
      case "overdue":
        return "Payment Overdue";
      default:
        return status;
    }
  };

  const filteredTransactions = transactions.filter((transaction) => {
    if (selectedStatus === "all") return true;
    return transaction.status === selectedStatus;
  });

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse bg-gray-200 h-6 w-48 rounded"></div>
        <div className="animate-pulse bg-gray-200 h-32 w-full rounded"></div>
        <div className="animate-pulse bg-gray-200 h-32 w-full rounded"></div>
      </div>
    );
  }

  // Show transaction details view
  if (showDetails && selectedTransaction) {
    const calculations = getTerminCalculations(selectedTransaction);
    
    return (
      <div className="p-6">
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
                  {selectedTransaction.orderId}
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
                    <p className="text-sm text-gray-500">Vendor</p>
                    <p className="text-xl font-bold text-gray-900">
                      {selectedTransaction.vendorName}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">Status Proyek</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {getProjectOwnerStatusDescription(
                        selectedTransaction.status
                      )}
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
                    <td className="px-4 py-1 text-center text-sm text-gray-900 bg-gray-200">
                      
                    </td>
                    <td className="px-4 py-1 text-center text-sm text-gray-900 bg-gray-200">
                      
                    </td>
                    <td className="px-4 py-1 text-center text-sm text-gray-900 bg-white">
                      
                    </td>
                    <td className="px-4 py-1 text-center text-sm text-gray-900 bg-white">
                      
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-1 text-sm font-medium text-gray-900 text-right">
                      Dibayarkan
                    </td>
                    <td className="px-4 py-1 text-center text-sm text-gray-900 bg-gray-200">
                      
                    </td>
                    <td className="px-4 py-1 text-center text-sm text-gray-900 bg-white">
                      
                    </td>
                    <td className="px-4 py-1 text-center text-sm text-gray-900 bg-white">
                      
                    </td>
                    <td className="px-4 py-1 text-center text-sm text-gray-900 bg-white">
                      
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-1 text-sm font-medium text-gray-900 text-right">
                      Sisa tagihan
                    </td>
                    <td className="px-4 py-1 text-center text-sm text-gray-900 bg-white">
                      
                    </td>
                    <td className="px-4 py-1 text-center text-sm text-gray-900 bg-white">
                      
                    </td>
                    <td className="px-4 py-1 text-center text-sm text-gray-900 bg-gray-200">
                      
                    </td>
                    <td className="px-4 py-1 text-center text-sm text-gray-900 bg-gray-200">
                      
                    </td>
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
                    {calculations ? formatCurrency(calculations.terminValue) : formatCurrency(selectedTransaction.amount / 2)}
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-900 w-32">
                    PPN 10%
                  </span>
                  <span className="text-sm text-gray-900">
                    {calculations ? formatCurrency(calculations.terminValue * 0.1) : formatCurrency((selectedTransaction.amount / 2) * 0.1)}
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-900 w-32">
                    Biaya layanan 1%
                  </span>
                  <span className="text-sm text-gray-900">
                    {calculations ? formatCurrency(calculations.terminValue * 0.01) : formatCurrency((selectedTransaction.amount / 2) * 0.01)}
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
                    <p className="text-xl text-gray-900">
                      Nilai Tagihan
                    </p>
                    <p className="text-3xl font-bold text-gray-900">
                      {calculations ? formatCurrency(calculations.terminValue * 1.11 + 15000) : formatCurrency((selectedTransaction.amount / 2) * 1.11)}
                    </p>
                  </div>
                  <button className="px-10 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
                    Bayar
                  </button>
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
                    {calculations ? formatCurrency(calculations.terminValue * 2) : formatCurrency(selectedTransaction.amount)}
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-900 w-32">
                    PPN 10%
                  </span>
                  <span className="text-sm text-gray-900">
                    {calculations ? formatCurrency(calculations.terminValue * 2 * 0.1) : formatCurrency(selectedTransaction.amount * 0.1)}
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-900 w-32">
                    Biaya layanan 1%
                  </span>
                  <span className="text-sm text-gray-900">
                    {calculations ? formatCurrency(calculations.terminValue * 2 * 0.01) : formatCurrency(selectedTransaction.amount * 0.01)}
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
                  <p className="text-sm text-gray-900">
                    Nilai Tagihan
                  </p>
                  <p className="text-xl font-bold text-gray-900">
                    {calculations ? formatCurrency(calculations.terminValue * 2 * 1.11 + 15000) : formatCurrency((selectedTransaction.amount / 2) * 1.11)}
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
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Transaksi</h2>

        {/* Status Filter */}
        <div className="flex space-x-2">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="waiting-approval">Waiting Approval</option>
            <option value="process">Processing</option>
            <option value="inescrow">In Escrow</option>
            <option value="release">Ready to Release</option>
            <option value="settle">Released</option>
            <option value="add-funds">Additional Funding</option>
            <option value="refund">Refund</option>
            <option value="indispute">Dispute</option>
            <option value="failed">Failed</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
            <option value="overdue">Overdue</option>
          </select>
        </div>
      </div>

      {/* Transactions List */}
      <div className="space-y-4">
        {filteredTransactions.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No transactions found for the selected status.</p>
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
                  <p className="text-xs text-gray-500">{transaction.orderId}</p>

                  {/* Title Project */}
                  <h3 className="text-xl font-bold text-gray-900 leading-tight">
                    {transaction.projectTitle}
                  </h3>

                  {/* Location */}
                  <p className="text-sm mb-3 text-gray-600">Jakarta Selatan</p>

                  {/* Two column layout for fields */}
                  <div className="grid grid-cols-2 gap-4">
                    {/* Left sub-column */}
                    <div className="space-y-2">
                      {/* Vendor */}
                      <div className="mt-0">
                        <p className="text-sm text-gray-500">Vendor</p>
                        <p className="text-lg font-bold text-gray-900">
                          {transaction.vendorName}
                        </p>
                      </div>

                      {/* Status Proyek */}
                      <div className="mt-0">
                        <p className="text-sm text-gray-500">Status Proyek</p>
                        <p className="text-lg font-bold text-gray-900">
                          {getProjectOwnerStatusDescription(transaction.status)}
                        </p>
                      </div>

                      {/* Jenis Tagihan */}
                      <div className="mt-0">
                        <p className="text-sm text-gray-500">Jenis Tagihan</p>
                        <p className="text-lg font-bold text-gray-900">
                          Termin
                        </p>
                      </div>
                    </div>

                    {/* Right sub-column */}
                    <div className="space-y-2">
                      {/* Nilai Kontrak */}
                      <div className="mt-0">
                        <p className="text-sm text-gray-500">Nilai Kontrak</p>
                        <p className="text-lg font-bold text-gray-900">
                          {formatCurrency(transaction.amount * 2)}
                        </p>
                      </div>

                      {/* Escrow */}
                      <div className="mt-0">
                        <p className="text-sm text-gray-500">Escrow</p>
                        <p className="text-lg font-bold text-gray-900">
                          Termin 3
                        </p>
                      </div>

                      {/* Tahap Pembayaran */}
                      <div className="mt-0">
                        <p className="text-sm text-gray-500">Tahap Pembayaran</p>
                        <p className="text-lg font-bold text-gray-900">
                          {transaction.paymentType}
                        </p>
                      </div>
                    </div>
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
                      {/* Left Column - Empty now since we moved all fields to the left section */}
                      <div className="space-y-4">
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
                          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
                            Bayar
                          </button>
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
  );
}
