"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";

export default function ProjectHistoryDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProject = async () => {
      if (!id || !user) return;

      try {
        const projectDoc = await getDoc(doc(db, "projects", id));
        if (projectDoc.exists()) {
          const projectData = { id: projectDoc.id, ...projectDoc.data() };

          // Verify this project belongs to the current project owner
          if (
            projectData.ownerId === user.uid ||
            projectData.ownerEmail === user.email
          ) {
            setProject(projectData);
          } else {
            router.push("/dashboard/project-owner");
          }
        } else {
          router.push("/dashboard/project-owner");
        }
      } catch (error) {
        console.error("Error fetching project:", error);
        router.push("/dashboard/project-owner");
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [id, user, router]);

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
    switch (status?.toLowerCase()) {
      case "completed":
        return "bg-green-500 text-white";
      case "in progress":
        return "bg-blue-500 text-white";
      case "on hold":
        return "bg-yellow-500 text-white";
      case "cancelled":
        return "bg-red-500 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-slate-600">Loading project details...</span>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">
            Project Not Found
          </h2>
          <p className="text-slate-600 mb-4">
            The project you&apos;re looking for doesn&apos;t exist or you
            don&apos;t have access to it.
          </p>
          <button
            onClick={() => router.push("/dashboard/project-owner")}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Project Details</h1>
          <p className="text-slate-600 mt-2">
            Complete information about this project
          </p>
        </div>

        {/* Project Info Card */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 mb-6">
          <div className="flex justify-between items-start mb-6">
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-slate-900 mb-2">
                {project.title}
              </h2>
              <div className="flex items-center space-x-4 mb-4">
                <span
                  className={`inline-flex px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(
                    project.status
                  )}`}
                >
                  {project.status || "Unknown"}
                </span>
                {project.awardedVendor && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    Awarded to: {project.awardedVendor}
                  </span>
                )}
              </div>
              <p className="text-slate-600 leading-relaxed">
                {project.description}
              </p>
            </div>
            <div className="text-right ml-8">
              <div className="text-3xl font-bold text-slate-900 mb-2">
                {(project.budget === '0' || project.totalBudget === '0') ? 'Anggaran belum ada' : formatCurrency(project.budget || project.totalBudget)}
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
                  Project Type
                </label>
                <p className="text-slate-900">{project.projectType || "N/A"}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600">
                  Property Type
                </label>
                <p className="text-slate-900">
                  {project.propertyType || "N/A"}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600">
                  Location
                </label>
                <p className="text-slate-900">
                  {project.location || project.city || "N/A"}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600">
                  Procurement Method
                </label>
                <p className="text-slate-900">
                  {project.procurementMethod || "N/A"}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-900 border-b border-slate-200 pb-2">
                Timeline
              </h3>
              <div>
                <label className="text-sm font-medium text-slate-600">
                  Project Duration
                </label>
                <p className="text-slate-900">
                  {project.estimatedDuration || "N/A"}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600">
                  Tender Duration
                </label>
                <p className="text-slate-900">
                  {project.tenderDuration || "N/A"}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600">
                  Start Date
                </label>
                <p className="text-slate-900">
                  {project.estimatedStartDate
                    ? new Date(project.estimatedStartDate).toLocaleDateString(
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
              <div>
                <label className="text-sm font-medium text-slate-600">
                  Created Date
                </label>
                <p className="text-slate-900">
                  {project.createdAt
                    ? project.createdAt.toDate
                      ? new Date(project.createdAt.toDate()).toLocaleDateString(
                          "id-ID",
                          {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          }
                        )
                      : new Date(project.createdAt).toLocaleDateString(
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
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-900 border-b border-slate-200 pb-2">
                Vendor Information
              </h3>
              <div>
                <label className="text-sm font-medium text-slate-600">
                  Awarded Vendor
                </label>
                <p className="text-slate-900">
                  {project.awardedVendor || "Not awarded yet"}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600">
                  Vendor Email
                </label>
                <p className="text-slate-900">
                  {project.awardedVendorEmail || "N/A"}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600">
                  Proposals Received
                </label>
                <p className="text-slate-900">
                  {project.proposals?.length || 0} proposals
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600">
                  Final Price
                </label>
                <p className="text-slate-900">
                  {project.finalPrice
                    ? formatCurrency(project.finalPrice)
                    : "Not set"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Proposals Summary */}
        {project.proposals && project.proposals.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 mb-6">
            <h3 className="text-xl font-bold text-slate-900 mb-6">
              Proposals Summary
            </h3>
            <div className="space-y-4">
              {project.proposals.map((proposal, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 bg-slate-50 rounded-lg"
                >
                  <div>
                    <h4 className="font-medium text-slate-900">
                      {proposal.vendorName || proposal.vendorEmail}
                    </h4>
                    <p className="text-sm text-slate-600">
                      Submitted:{" "}
                      {proposal.createdAt
                        ? new Date(
                            proposal.createdAt.toDate
                              ? proposal.createdAt.toDate()
                              : proposal.createdAt
                          ).toLocaleDateString("id-ID")
                        : "N/A"}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-slate-900">
                      {formatCurrency(proposal.proposedPrice)}
                    </p>
                    <span
                      className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                        proposal.status === "awarded"
                          ? "bg-green-100 text-green-800"
                          : proposal.status === "rejected"
                          ? "bg-red-100 text-red-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {proposal.status || "pending"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Milestones */}
        {project.milestones && project.milestones.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 mb-6">
            <h3 className="text-xl font-bold text-slate-900 mb-6">
              Project Milestones
            </h3>
            <div className="space-y-4">
              {project.milestones.map((milestone, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-4 p-4 bg-slate-50 rounded-lg"
                >
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center ${
                      milestone.completed ? "bg-green-500" : "bg-slate-300"
                    }`}
                  >
                    {milestone.completed && (
                      <svg
                        className="w-4 h-4 text-white"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-slate-900">
                      {milestone.name}
                    </h4>
                    {milestone.date && (
                      <p className="text-sm text-slate-600">{milestone.date}</p>
                    )}
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      milestone.completed
                        ? "bg-green-100 text-green-800"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {milestone.completed ? "Completed" : "Pending"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* BOQ Information */}
        {project.attachedBOQ && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 mb-6">
            <h3 className="text-xl font-bold text-slate-900 mb-6">
              Bill of Quantities (BOQ)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-medium text-slate-600">
                  Total Items
                </label>
                <p className="text-slate-900">
                  {project.attachedBOQ.items?.length || 0} items
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600">
                  Total BOQ Value
                </label>
                <p className="text-slate-900">
                  {formatCurrency(project.attachedBOQ.totalCost)}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-wrap gap-4">
          {project.status === "completed" && (
            <button className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors font-medium">
              Download Final Report
            </button>
          )}
          <button
            onClick={() => router.push("/dashboard/project-owner")}
            className="px-6 py-3 bg-slate-600 hover:bg-slate-700 text-white rounded-lg transition-colors font-medium"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
