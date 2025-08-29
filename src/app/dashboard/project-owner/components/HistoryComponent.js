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

export default function HistoryComponent() {
  const { user, userProfile } = useAuth();
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  const handleViewDetails = (project) => {
    // Show project details inline
    setSelectedProject(project);
    setShowDetails(true);
  };

  const handleBackToList = () => {
    setShowDetails(false);
    setSelectedProject(null);
  };

  // Dummy data for testing UI with all project statuses - Project Owner perspective
  const dummyProjects = useMemo(
    () => [
      {
        id: "dummy_po_hist_1",
        title: "Modern Office Renovation",
        vendorName: "PT Konstruksi Andalan",
        status: "completed",
        budget: 150000000,
        finalCost: 148000000,
        createdAt: new Date("2024-07-15"),
        completedAt: new Date("2024-08-10"),
        duration: "26 days",
        location: "Jakarta Selatan",
        isDummy: true,
      },
      {
        id: "dummy_po_hist_2",
        title: "Residential House Construction",
        vendorName: "CV Bangun Jaya",
        status: "completed",
        budget: 250000000,
        finalCost: 245000000,
        createdAt: new Date("2024-06-01"),
        completedAt: new Date("2024-07-20"),
        duration: "49 days",
        location: "Depok",
        isDummy: true,
      },
      {
        id: "dummy_po_hist_3",
        title: "Restaurant Kitchen Setup",
        vendorName: "PT Kitchen Solutions",
        status: "cancelled",
        budget: 75000000,
        finalCost: 0,
        createdAt: new Date("2024-07-20"),
        cancelledAt: new Date("2024-07-25"),
        duration: "5 days (cancelled)",
        location: "Jakarta Pusat",
        cancelReason: "Client requested cancellation",
        isDummy: true,
      },
      {
        id: "dummy_po_hist_4",
        title: "Shopping Mall Interior",
        vendorName: "PT Interior Megah",
        status: "terminated",
        budget: 500000000,
        finalCost: 175000000,
        createdAt: new Date("2024-06-15"),
        terminatedAt: new Date("2024-07-10"),
        duration: "25 days (terminated)",
        location: "Tangerang",
        terminationReason: "Contract violation by vendor",
        isDummy: true,
      },
      {
        id: "dummy_po_hist_5",
        title: "Hotel Lobby Redesign",
        vendorName: "CV Design Excellence",
        status: "completed",
        budget: 180000000,
        finalCost: 182000000,
        createdAt: new Date("2024-06-01"),
        completedAt: new Date("2024-07-20"),
        duration: "49 days",
        location: "Jakarta Barat",
        isDummy: true,
      },
      {
        id: "dummy_po_hist_6",
        title: "Warehouse Expansion",
        vendorName: "PT Industrial Build",
        status: "expired",
        budget: 350000000,
        finalCost: 0,
        createdAt: new Date("2024-05-01"),
        expiredAt: new Date("2024-05-31"),
        duration: "30 days (expired)",
        location: "Bekasi",
        expiredReason: "No vendor response within deadline",
        isDummy: true,
      },
      {
        id: "dummy_po_hist_7",
        title: "School Library Renovation",
        vendorName: "CV Edu Builders",
        status: "completed",
        budget: 95000000,
        finalCost: 92000000,
        createdAt: new Date("2024-05-15"),
        completedAt: new Date("2024-06-20"),
        duration: "36 days",
        location: "Bogor",
        isDummy: true,
      },
      {
        id: "dummy_po_hist_8",
        title: "Medical Clinic Setup",
        vendorName: "PT Medical Contractors",
        status: "cancelled",
        budget: 120000000,
        finalCost: 35000000,
        createdAt: new Date("2024-04-10"),
        cancelledAt: new Date("2024-04-25"),
        duration: "15 days (cancelled)",
        location: "Jakarta Timur",
        cancelReason: "Budget constraints",
        isDummy: true,
      },
    ],
    []
  );

  useEffect(() => {
    if (!user?.uid) {
      setLoading(false);
      return;
    }

    const fetchProjects = () => {
      try {
        // For demo purposes, use dummy data
        // In production, this would query Firestore for completed projects:
        // const projectsQuery = query(
        //   collection(db, 'projects'),
        //   where('ownerId', '==', user.uid),
        //   where('status', 'in', ['completed', 'cancelled', 'terminated', 'expired']),
        //   orderBy('completedAt', 'desc')
        // );

        setProjects(dummyProjects);
        setLoading(false);
      } catch (error) {
        console.error("Error loading project history:", error);
        setProjects(dummyProjects);
        setLoading(false);
      }
    };

    fetchProjects();
  }, [user?.uid]);

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      case "terminated":
        return "bg-red-100 text-red-800";
      case "expired":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusDescription = (status) => {
    switch (status) {
      case "completed":
        return "Project Completed";
      case "cancelled":
        return "Project Cancelled";
      case "terminated":
        return "Contract Terminated";
      case "expired":
        return "Tender Expired";
      default:
        return status;
    }
  };

  const filteredProjects = projects.filter((project) => {
    if (selectedStatus === "all") return true;
    return project.status === selectedStatus;
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

  // Show project details view
  if (showDetails && selectedProject) {
    return (
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="border-b border-slate-200 pb-6">
          <button
            onClick={handleBackToList}
            className="flex items-center text-slate-600 hover:text-slate-900 mb-4 transition-colors"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back to History
          </button>
          <h1 className="text-2xl font-bold text-slate-900">Project Details</h1>
          <p className="text-slate-600">
            Complete information about this project
          </p>
        </div>

        {/* Project Details Content */}
        <div className="bg-white border border-gray-200 rounded-lg p-8">
          <div className="flex justify-between items-start mb-6">
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-slate-900 mb-2">
                {selectedProject.title}
              </h2>
              <div className="flex items-center space-x-4 mb-4">
                <span
                  className={`inline-flex px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(
                    selectedProject.status
                  )}`}
                >
                  {selectedProject.status || "Unknown"}
                </span>
                {selectedProject.isDummy && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    Demo Data
                  </span>
                )}
              </div>
              <p className="text-slate-600 leading-relaxed">
                {selectedProject.description || "No description available"}
              </p>
            </div>
            <div className="text-right ml-8">
              <div className="text-3xl font-bold text-slate-900 mb-2">
                {formatCurrency(
                  selectedProject.budget || selectedProject.finalCost || 0
                )}
              </div>
              <p className="text-slate-600">Project Budget</p>
            </div>
          </div>

          {/* Project Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-900 border-b border-slate-200 pb-2">
                Basic Information
              </h3>
              <div>
                <label className="text-sm font-medium text-slate-600">
                  Vendor
                </label>
                <p className="text-slate-900">
                  {selectedProject.vendorName || "N/A"}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600">
                  Location
                </label>
                <p className="text-slate-900">
                  {selectedProject.location || "N/A"}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600">
                  Duration
                </label>
                <p className="text-slate-900">
                  {selectedProject.duration || "N/A"}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-900 border-b border-slate-200 pb-2">
                Timeline
              </h3>
              <div>
                <label className="text-sm font-medium text-slate-600">
                  Start Date
                </label>
                <p className="text-slate-900">
                  {selectedProject.createdAt
                    ? new Date(selectedProject.createdAt).toLocaleDateString(
                        "id-ID",
                        {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        }
                      )
                    : "N/A"}
                </p>
              </div>
              {selectedProject.completedAt && (
                <div>
                  <label className="text-sm font-medium text-slate-600">
                    Completion Date
                  </label>
                  <p className="text-slate-900">
                    {new Date(selectedProject.completedAt).toLocaleDateString(
                      "id-ID",
                      {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      }
                    )}
                  </p>
                </div>
              )}
              {selectedProject.cancelledAt && (
                <div>
                  <label className="text-sm font-medium text-slate-600">
                    Cancelled Date
                  </label>
                  <p className="text-slate-900">
                    {new Date(selectedProject.cancelledAt).toLocaleDateString(
                      "id-ID",
                      {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      }
                    )}
                  </p>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-900 border-b border-slate-200 pb-2">
                Financial
              </h3>
              <div>
                <label className="text-sm font-medium text-slate-600">
                  Budget
                </label>
                <p className="text-slate-900">
                  {formatCurrency(selectedProject.budget || 0)}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600">
                  Final Cost
                </label>
                <p className="text-slate-900">
                  {formatCurrency(selectedProject.finalCost || 0)}
                </p>
              </div>
              {selectedProject.finalCost && selectedProject.budget && (
                <div>
                  <label className="text-sm font-medium text-slate-600">
                    Savings
                  </label>
                  <p
                    className={`text-slate-900 ${
                      selectedProject.budget - selectedProject.finalCost >= 0
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {formatCurrency(
                      selectedProject.budget - selectedProject.finalCost
                    )}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-4 mt-8">
            {selectedProject.status === "completed" && (
              <button className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors font-medium">
                Download Final Report
              </button>
            )}
            {/* Removed Duplicate Project and Back to History buttons per request */}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Demo Data Notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <svg
              className="h-5 w-5 text-blue-400"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-blue-700">
              <strong>Demo Data:</strong> This section shows sample project
              history data for UI testing purposes. In production, this would
              display your actual completed, cancelled, terminated, and expired
              projects from the database.
            </p>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">Project History</h2>

        {/* Status Filter */}
        <div className="flex space-x-2">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
            <option value="terminated">Terminated</option>
            <option value="expired">Expired</option>
          </select>
        </div>
      </div>

      {/* Projects List */}
      <div className="space-y-4">
        {filteredProjects.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No projects found for the selected status.</p>
          </div>
        ) : (
          filteredProjects.map((project) => (
            <div
              key={project.id}
              className="relative bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
            >
              {/* Top Left - ID */}
              <p className="text-sm text-slate-600">{project.id}</p>

              {/* Title - Big 3xl */}
              <h3 className="text-3xl font-bold text-slate-900">
                {project.title}
              </h3>

              {/* Location - Small */}
              <p className="text-sm text-slate-600 mb-4">{project.location}</p>

              {/* Vendor Section */}
              <div className="flex gap-8 mb-4">
                <div>
                  <p className="text-sm text-slate-600">Vendor</p>
                  <p className="text-2xl font-bold text-slate-900">
                    {project.vendorName}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-slate-600">Nilai Kontrak</p>
                  <p className="text-2xl font-bold text-slate-900">
                    {project.finalCost > 0
                      ? formatCurrency(project.finalCost)
                      : formatCurrency(project.budget)}
                  </p>
                </div>
              </div>

              {/* Status Section */}
              <div className="mb-6">
                <p className="text-sm text-slate-600">Status</p>
                <p className="text-2xl font-bold text-slate-900">Selesai</p>
              </div>

              {/* Detail Button - Bottom Right */}
              <button
                onClick={() => handleViewDetails(project)}
                className="absolute bottom-6 right-6 bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-50 transition-colors"
              >
                Detail
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
