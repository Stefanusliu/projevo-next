"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "../../../../../contexts/AuthContext";
import { db } from "../../../../../lib/firebase";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import {
  FiArrowLeft,
  FiMapPin,
  FiCalendar,
  FiDollarSign,
  FiUser,
} from "react-icons/fi";

export default function VendorProjectDetail() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();
  const [project, setProject] = useState(null);
  const [proposal, setProposal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const projectId = params?.id;

  useEffect(() => {
    if (projectId && user) {
      fetchProjectDetails();
    }
  }, [projectId, user]);

  const fetchProjectDetails = async () => {
    try {
      setLoading(true);

      // Fetch project details
      const projectRef = doc(db, "projects", projectId);
      const projectDoc = await getDoc(projectRef);

      if (!projectDoc.exists()) {
        throw new Error("Project not found");
      }

      const projectData = { id: projectDoc.id, ...projectDoc.data() };
      setProject(projectData);

      // Fetch vendor's proposal for this project if exists
      const proposalsQuery = query(
        collection(db, "proposals"),
        where("projectId", "==", projectId),
        where("vendorId", "==", user.uid)
      );

      const proposalSnapshot = await getDocs(proposalsQuery);
      if (!proposalSnapshot.empty) {
        const proposalDoc = proposalSnapshot.docs[0];
        setProposal({ id: proposalDoc.id, ...proposalDoc.data() });
      }
    } catch (err) {
      console.error("Error fetching project details:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "open":
        return "bg-blue-100 text-blue-800";
      case "in-progress":
        return "bg-green-100 text-green-800";
      case "completed":
        return "bg-gray-100 text-gray-800";
      case "negotiating":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading project details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error: {error}</p>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            Back
          </button>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-600">Project not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push("/dashboard/vendor")}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium mb-4"
          >
            <FiArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </button>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-500">
                  Project ID: {project.orderId}
                </span>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                    project.status
                  )}`}
                >
                  {project.status || "Open"}
                </span>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                {project.projectTitle}
              </h1>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <FiMapPin className="w-4 h-4 text-gray-400" />
                  <span>{project.location || "Location not specified"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <FiCalendar className="w-4 h-4 text-gray-400" />
                  <span>
                    Start: {project.estimatedStartMonth}{" "}
                    {project.estimatedStartYear}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <FiDollarSign className="w-4 h-4 text-gray-400" />
                  <span>
                    {project.budget
                      ? formatCurrency(project.budget)
                      : "Budget TBD"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Project Details */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Project Information
              </h2>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">
                    Project Type
                  </h3>
                  <p className="text-gray-900">
                    {project.projectType || "Not specified"}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">
                    Property Type
                  </h3>
                  <p className="text-gray-900">
                    {project.propertyType || "Not specified"}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">
                    Scope
                  </h3>
                  <p className="text-gray-900">
                    {project.scope || "Not specified"}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">
                    Duration
                  </h3>
                  <p className="text-gray-900">
                    {project.projectDuration || "Not specified"}
                  </p>
                </div>
              </div>

              {project.description && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">
                    Description
                  </h3>
                  <p className="text-gray-900 whitespace-pre-wrap">
                    {project.description}
                  </p>
                </div>
              )}
            </div>

            {/* Proposal Status */}
            {proposal && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Your Proposal Status
                </h2>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">
                      Proposal Amount
                    </h3>
                    <p className="text-xl font-bold text-gray-900">
                      {formatCurrency(proposal.totalAmount)}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">
                      Status
                    </h3>
                    <span
                      className={`inline-flex px-2 py-1 rounded-full text-sm font-medium ${getStatusColor(
                        proposal.status
                      )}`}
                    >
                      {proposal.status || "Submitted"}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                Project Owner
              </h3>

              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                  <FiUser className="w-6 h-6 text-gray-400" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">
                    {project.ownerName || "Unknown"}
                  </p>
                  {project.ownerEmail && (
                    <p className="text-sm text-gray-500">
                      {project.ownerEmail}
                    </p>
                  )}
                </div>
              </div>

              {project.ownerPhone && (
                <a
                  href={`tel:${project.ownerPhone}`}
                  className="block w-full text-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Call Owner
                </a>
              )}
            </div>

            <div className="bg-blue-50 rounded-lg p-4">
              <h3 className="text-lg font-medium text-blue-900 mb-2">
                Project Details
              </h3>
              <p className="text-sm text-blue-800">
                This is the detailed view of the project. Same information
                available from both &quot;View Project&quot; and &quot;Update
                Proposal&quot; buttons.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
