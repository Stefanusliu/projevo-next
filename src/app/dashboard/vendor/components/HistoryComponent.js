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

export default function HistoryComponent() {
  const { user } = useAuth();
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  // Dummy data for testing UI with all project statuses
  const dummyProjects = useMemo(
    () => [
      {
        id: "dummy_hist_1",
        title: "Modern Office Renovation",
        clientName: "PT Maju Bersama",
        status: "completed",
        budget: 150000000,
        createdAt: new Date("2024-07-15"),
        completedAt: new Date("2024-08-10"),
        isDummy: true,
      },
      {
        id: "dummy_hist_2",
        title: "Residential House Construction",
        clientName: "Budi Santoso",
        status: "in-progress",
        budget: 250000000,
        createdAt: new Date("2024-08-01"),
        isDummy: true,
      },
      {
        id: "dummy_hist_3",
        title: "Restaurant Kitchen Setup",
        clientName: "Sari Resto Group",
        status: "cancelled",
        budget: 75000000,
        createdAt: new Date("2024-07-20"),
        cancelledAt: new Date("2024-07-25"),
        isDummy: true,
      },
      {
        id: "dummy_hist_4",
        title: "Shopping Mall Interior",
        clientName: "Mall Central Jakarta",
        status: "on-hold",
        budget: 500000000,
        createdAt: new Date("2024-06-15"),
        isDummy: true,
      },
      {
        id: "dummy_hist_5",
        title: "Hotel Lobby Redesign",
        clientName: "Grand Hotel Indonesia",
        status: "completed",
        budget: 180000000,
        createdAt: new Date("2024-06-01"),
        completedAt: new Date("2024-07-20"),
        isDummy: true,
      },
    ],
    []
  );

  useEffect(() => {
    if (!user) return;

    const fetchProjects = () => {
      try {
        // For demo purposes, use dummy data
        // In production, this would query Firestore:
        // const projectsRef = collection(db, 'projects');
        // const q = query(
        //   projectsRef,
        //   where('vendorId', '==', user.uid),
        //   orderBy('createdAt', 'desc')
        // );

        setProjects(dummyProjects);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching projects:", error);
        setProjects(dummyProjects);
        setLoading(false);
      }
    };

    fetchProjects();
  }, [user]);

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "in-progress":
        return "bg-blue-100 text-blue-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      case "on-hold":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusDescription = (status) => {
    switch (status) {
      case "completed":
        return "Completed";
      case "in-progress":
        return "In Progress";
      case "cancelled":
        return "Cancelled";
      case "on-hold":
        return "On Hold";
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

  return (
    <div className="space-y-6">
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
              display your actual project history from the database.
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
            <option value="in-progress">In Progress</option>
            <option value="cancelled">Cancelled</option>
            <option value="on-hold">On Hold</option>
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
              <p className="text-sm text-slate-600 mb-4">Jakarta Selatan</p>

              {/* Klien Section (instead of Vendor) */}
              <div className="flex gap-8 mb-4">
                <div>
                  <p className="text-sm text-slate-600">Klien</p>
                  <p className="text-2xl font-bold text-slate-900">
                    {project.clientName}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-slate-600">Nilai Kontrak</p>
                  <p className="text-2xl font-bold text-slate-900">
                    {formatCurrency(project.budget)}
                  </p>
                </div>
              </div>

              {/* Status Section */}
              <div className="mb-6">
                <p className="text-sm text-slate-600">Status</p>
                <p className="text-2xl font-bold text-slate-900">
                  {getStatusDescription(project.status)}
                </p>
              </div>

              {/* Detail Button - Bottom Right */}
              <button className="absolute bottom-6 right-6 bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-50 transition-colors">
                Detail
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
