"use client";

import { useState } from "react";
import BOQDisplay from "../../../components/BOQDisplay";
import PaymentTerminTab from "../../components/PaymentTerminTab";
import {
  FiCalendar,
  FiMapPin,
  FiDollarSign,
  FiClock,
  FiFileText,
  FiUser,
  FiTrendingUp,
  FiCheck,
  FiX,
  FiEye,
  FiUsers,
  FiTarget,
  FiBarChart3,
  FiArrowRight,
} from "react-icons/fi";

export default function ProjectOwnerDetailModal({
  project,
  isOpen,
  onClose,
  onEditProject,
}) {
  const [activeTab, setActiveTab] = useState("overview");

  // Check if project has payments to show Termin tab
  const hasPayments =
    (project?.payments && project.payments.length > 0) ||
    (project?.payment && Object.keys(project.payment).length > 0);

  console.log("ProjectOwnerDetailModal - project:", project);
  console.log("ProjectOwnerDetailModal - hasPayments:", hasPayments);
  console.log("ProjectOwnerDetailModal - payments array:", project?.payments);
  console.log("ProjectOwnerDetailModal - payment object:", project?.payment);

  if (!isOpen || !project) return null;

  // Enhanced project data
  const enhancedProject = {
    ...project,
    // General Information
    projectTitle: project.title || project.name || "Project Title",
    province: project.province || "DKI Jakarta",
    city: project.city || "Jakarta Selatan",
    fullAddress: project.fullAddress || project.address || "Project Location",
    clientName: project.clientName || "Your Company",
    clientPhone: project.clientPhone || "+62 21 5555-1234",
    clientEmail: project.clientEmail || "info@company.co.id",
    projectBackground:
      project.projectBackground || "Project background information.",
    projectGoals: project.projectGoals || "Project objectives and goals.",

    // Classification & Scope
    projectType: project.projectType || project.type || "Construction",
    projectScope: project.projectScope || ["Construction", "Design"],
    propertyType: project.propertyType || "Commercial",
    propertySize: project.propertySize || "500 m²",
    propertyAge: project.propertyAge || "5 tahun",
    propertyCondition: project.propertyCondition || "Good condition",
    estimatedDuration: project.timeEstimation || project.duration || "6 months",
    tenderDuration: project.tenderDuration || "2 weeks",
    estimatedStartDate: project.startDate || "2024-08-01",
    projectUrgency: project.urgency || "Normal",

    // Technical Specifications
    designPreferences: project.designPreferences || [
      "Modern Design",
      "Energy Efficient",
    ],
    specificRequirements:
      project.specificRequirements ||
      project.description ||
      "Detailed project requirements.",
    qualityStandards: project.qualityStandards || "High Quality",
    materialPreferences: project.materialPreferences || [
      "Eco-Friendly",
      "Durable",
    ],

    // Additional Information
    specialNotes: project.specialNotes || "No special notes.",

    // Documents
    uploadedDocuments: project.uploadedDocuments || [
      { name: "Project Brief.pdf", title: "Project Brief" },
      { name: "Site Plan.dwg", title: "Site Plan" },
    ],
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "active":
      case "open":
        return "text-green-600 bg-green-50";
      case "in progress":
        return "text-blue-600 bg-blue-50";
      case "completed":
        return "text-purple-600 bg-purple-50";
      case "closed":
        return "text-gray-600 bg-gray-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  const formatCurrency = (amount) => {
    if (!amount) return "Not specified";
    if (typeof amount === "string") return amount;
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                {enhancedProject.projectType}
              </span>
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                  project.status
                )}`}
              >
                {project.status || "Active"}
              </span>
              {project.procurementMethod && (
                <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
                  {project.procurementMethod}
                </span>
              )}
            </div>
            <h2 className="text-2xl font-bold text-slate-900">
              {enhancedProject.projectTitle}
            </h2>
            <p className="text-slate-600">
              {enhancedProject.clientName} • {enhancedProject.city}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <svg
              className="w-6 h-6 text-slate-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Tab Navigation */}
        {/* Tab Navigation */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab("overview")}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "overview"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Project Details
            </button>
            <button
              onClick={() => setActiveTab("boq")}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "boq"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Bill of Quantities
            </button>
            <button
              onClick={() => setActiveTab("proposals")}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "proposals"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Proposals ({project.proposals?.length || 0})
            </button>
            {hasPayments && (
              <button
                onClick={() => setActiveTab("termin")}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "termin"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Termin ({project.payments?.length || (project.payment ? 1 : 0)})
              </button>
            )}
            <button
              onClick={() => setActiveTab("timeline")}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "timeline"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Timeline & Status
            </button>
          </nav>
        </div>

        <div className="p-6">
          {/* Tab Content */}
          {activeTab === "overview" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              <div className="lg:col-span-2 space-y-6">
                {/* Project Description */}
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-4">
                    Project Description
                  </h3>
                  <p className="text-slate-600 leading-relaxed mb-4">
                    {project.description ||
                      enhancedProject.specificRequirements}
                  </p>

                  {/* Project Background & Goals */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="p-4 bg-slate-50 rounded-lg">
                      <h4 className="font-medium text-slate-900 mb-2">
                        Project Background
                      </h4>
                      <p className="text-sm text-slate-600">
                        {enhancedProject.projectBackground}
                      </p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-lg">
                      <h4 className="font-medium text-slate-900 mb-2">
                        Project Goals
                      </h4>
                      <p className="text-sm text-slate-600">
                        {enhancedProject.projectGoals}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Location Details */}
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-4">
                    Location & Property Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-slate-500">Full Address</p>
                        <p className="text-slate-900">
                          {enhancedProject.fullAddress}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-500">Property Type</p>
                        <p className="text-slate-900">
                          {enhancedProject.propertyType}
                        </p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-slate-500">Property Size</p>
                        <p className="text-slate-900">
                          {enhancedProject.propertySize}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-500">
                          Property Condition
                        </p>
                        <p className="text-slate-900">
                          {enhancedProject.propertyCondition}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Project Scope */}
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-4">
                    Project Scope
                  </h3>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {enhancedProject.projectScope.map((scope, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                      >
                        {scope}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Requirements */}
                {project.requirements && project.requirements.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-4">
                      Project Requirements
                    </h3>
                    <div className="space-y-2">
                      {project.requirements.map((requirement, index) => (
                        <div key={index} className="flex items-start space-x-3">
                          <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                          <span className="text-slate-600">{requirement}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Technical Specifications */}
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-4">
                    Technical Specifications
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-slate-900 mb-2">
                        Design Preferences
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {enhancedProject.designPreferences.map(
                          (pref, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm"
                            >
                              {pref}
                            </span>
                          )
                        )}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium text-slate-900 mb-2">
                        Material Preferences
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {enhancedProject.materialPreferences.map(
                          (material, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm"
                            >
                              {material}
                            </span>
                          )
                        )}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium text-slate-900 mb-2">
                        Quality Standards
                      </h4>
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                        {enhancedProject.qualityStandards}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Supporting Documents */}
                {enhancedProject.uploadedDocuments &&
                  enhancedProject.uploadedDocuments.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900 mb-4">
                        Supporting Documents
                      </h3>
                      <div className="space-y-2">
                        {enhancedProject.uploadedDocuments.map((doc, index) => (
                          <div
                            key={index}
                            className="flex items-center space-x-3 p-3 bg-slate-50 rounded-lg"
                          >
                            <svg
                              className="w-5 h-5 text-slate-500"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                              />
                            </svg>
                            <div className="flex-1">
                              <p className="text-sm font-medium text-slate-900">
                                {doc.title}
                              </p>
                              <p className="text-xs text-slate-500">
                                {doc.name}
                              </p>
                            </div>
                            <button className="text-blue-600 hover:text-blue-800 text-sm">
                              Download
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
              </div>

              <div className="space-y-6">
                {/* Project Summary */}
                <div className="bg-slate-50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-slate-900 mb-4">
                    Project Summary
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-slate-500">Budget</p>
                      <p className="text-xl font-bold text-slate-900">
                        {formatCurrency(project.budget)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Timeline</p>
                      <p className="text-lg font-semibold text-slate-900">
                        {enhancedProject.estimatedDuration}
                      </p>
                      <p className="text-xs text-slate-500">
                        Start: {enhancedProject.estimatedStartDate}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Status</p>
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                          project.status
                        )}`}
                      >
                        {project.status || "Active"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Tender Information */}
                {project.procurementMethod === "Tender" && (
                  <div className="bg-slate-50 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-slate-900 mb-4">
                      Tender Information
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm text-slate-500">
                          Proposals Received
                        </p>
                        <p className="text-2xl font-bold text-slate-900">
                          {project.proposals || 0}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-500">
                          Tender Duration
                        </p>
                        <p className="text-slate-900">
                          {enhancedProject.tenderDuration}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-500">Deadline</p>
                        <p className="text-slate-900">
                          {project.bidCountdown || "Active"}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Quick Actions */}
                <div className="bg-blue-50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-blue-900 mb-4">
                    Quick Actions
                  </h3>
                  <div className="space-y-3">
                    <button
                      onClick={() => onEditProject && onEditProject(project)}
                      className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Edit Project
                    </button>
                    <button className="w-full px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors">
                      View Analytics
                    </button>
                    <button className="w-full px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors">
                      Download Report
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* BOQ Tab */}
          {activeTab === "boq" && (
            <div className="space-y-6">
              <BOQDisplay project={project} isVendorView={false} />
            </div>
          )}

          {/* Proposals Tab */}
          {activeTab === "proposals" && (
            <div className="space-y-6">
              <div className="bg-blue-50 rounded-lg p-6 text-center">
                <svg
                  className="w-12 h-12 text-blue-500 mx-auto mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <h3 className="text-lg font-semibold text-blue-900 mb-2">
                  {project.proposals || 0} Proposals Received
                </h3>
                <p className="text-blue-700 mb-4">
                  Review and compare vendor proposals for your project
                </p>
                <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  View All Proposals
                </button>
              </div>

              {/* Sample proposal cards would go here */}
              <div className="text-center text-gray-500 py-8">
                <p>
                  Detailed proposal management interface will be implemented
                  here
                </p>
              </div>
            </div>
          )}

          {/* Termin Tab */}
          {activeTab === "termin" && hasPayments && (
            <PaymentTerminTab project={project} isVendorView={false} />
          )}

          {/* Timeline Tab */}
          {activeTab === "timeline" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Timeline Information */}
                <div className="bg-slate-50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-slate-900 mb-4">
                    Project Timeline
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-slate-500">
                        Estimated Start Date
                      </p>
                      <p className="text-slate-900 font-medium">
                        {enhancedProject.estimatedStartDate}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Project Duration</p>
                      <p className="text-slate-900 font-medium">
                        {enhancedProject.estimatedDuration}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Urgency Level</p>
                      <span className="inline-block px-2 py-1 bg-gray-100 text-gray-800 rounded text-sm">
                        {enhancedProject.projectUrgency}
                      </span>
                    </div>
                    {project.procurementMethod === "Tender" && (
                      <div>
                        <p className="text-sm text-slate-500">Tender Status</p>
                        <p className="text-slate-900">
                          {project.bidCountdown || "Active"}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Project Status */}
                <div className="bg-slate-50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-slate-900 mb-4">
                    Current Status
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-slate-500">Project Status</p>
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                          project.status
                        )}`}
                      >
                        {project.status || "Active"}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Created</p>
                      <p className="text-slate-900">
                        {project.createdAt
                          ? new Date(
                              project.createdAt.seconds * 1000
                            ).toLocaleDateString()
                          : "Recently"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Last Updated</p>
                      <p className="text-slate-900">
                        {project.updatedAt
                          ? new Date(
                              project.updatedAt.seconds * 1000
                            ).toLocaleDateString()
                          : "Recently"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Special Notes */}
              {enhancedProject.specialNotes && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-amber-900 mb-4">
                    Special Notes
                  </h3>
                  <p className="text-amber-800">
                    {enhancedProject.specialNotes}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-slate-200">
            <button
              onClick={onClose}
              className="px-6 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Close
            </button>
            {onEditProject && (
              <button
                onClick={() => onEditProject(project)}
                className="px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-medium hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                Edit Project
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
