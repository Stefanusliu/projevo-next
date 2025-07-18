'use client';

import { useState, useEffect } from 'react';
import { 
  MdCalendarToday, 
  MdAttachMoney, 
  MdLocationOn, 
  MdSchedule,
  MdClose,
  MdAttachFile,
  MdCheckCircle,
  MdCancel
} from 'react-icons/md';
import { collection, query, where, getDocs, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../../lib/firebase';

export default function ProjectReviewComponent() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState(null);
  const [showProjectDetails, setShowProjectDetails] = useState(false);
  const [processingAction, setProcessingAction] = useState(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    fetchPendingProjects();
  }, []);

  const fetchPendingProjects = async () => {
    try {
      setLoading(true);
      const q = query(
        collection(db, 'projects'), 
        where('moderationStatus', '==', 'pending')
      );
      const querySnapshot = await getDocs(q);
      const pendingProjects = [];
      
      querySnapshot.forEach((doc) => {
        pendingProjects.push({
          id: doc.id,
          ...doc.data()
        });
      });

      setProjects(pendingProjects);
    } catch (error) {
      console.error('Error fetching pending projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveProject = async (projectId) => {
    try {
      setProcessingAction(projectId);
      const projectRef = doc(db, 'projects', projectId);
      await updateDoc(projectRef, {
        moderationStatus: 'approved',
        status: 'Active',
        isPublished: true,
        publishedAt: serverTimestamp(),
        approvedAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      // Update local state
      setProjects(projects.filter(p => p.id !== projectId));
      setShowProjectDetails(false);
      alert('Project approved successfully!');
    } catch (error) {
      console.error('Error approving project:', error);
      alert('Failed to approve project. Please try again.');
    } finally {
      setProcessingAction(null);
    }
  };

  const handleRejectProject = async (projectId, reason = '') => {
    if (!reason || reason.trim() === '') {
      alert('Please provide a reason for rejection');
      return;
    }

    try {
      setProcessingAction(projectId);
      const projectRef = doc(db, 'projects', projectId);
      await updateDoc(projectRef, {
        moderationStatus: 'rejected',
        status: 'Rejected',
        isPublished: false,
        rejectedAt: serverTimestamp(),
        rejectionReason: reason,
        updatedAt: serverTimestamp()
      });

      // Update local state
      setProjects(projects.filter(p => p.id !== projectId));
      setShowProjectDetails(false);
      setShowRejectModal(false);
      setRejectionReason('');
      alert('Project rejected successfully!');
    } catch (error) {
      console.error('Error rejecting project:', error);
      alert('Failed to reject project. Please try again.');
    } finally {
      setProcessingAction(null);
    }
  };

  const openRejectModal = (project) => {
    setSelectedProject(project);
    setShowRejectModal(true);
    setRejectionReason('');
  };

  const closeRejectModal = () => {
    setShowRejectModal(false);
    setRejectionReason('');
  };

  const formatDate = (dateField) => {
    if (!dateField) return 'Unknown date';
    
    try {
      let date;
      if (dateField.toDate) {
        // Firestore timestamp
        date = dateField.toDate();
      } else if (typeof dateField === 'string') {
        date = new Date(dateField);
      } else {
        date = new Date(dateField);
      }
      
      return date.toLocaleDateString('id-ID', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      return 'Invalid date';
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'menunggu persetujuan':
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'under_review':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'approved':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const openProjectDetails = (project) => {
    setSelectedProject(project);
    setShowProjectDetails(true);
  };

  const closeProjectDetails = () => {
    setSelectedProject(null);
    setShowProjectDetails(false);
  };

  // Helper function to format budget with thousand separators
  const formatBudget = (budget) => {
    if (!budget) return 'Not specified';
    
    // Convert to number if it's a string
    const numBudget = typeof budget === 'string' ? parseInt(budget.replace(/[^\d]/g, '')) : budget;
    
    if (isNaN(numBudget)) return 'Not specified';
    
    return `Rp ${numBudget.toLocaleString('id-ID')}`;
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading pending projects...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {!showProjectDetails ? (
        <>
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Project Review</h2>
            <p className="text-gray-600">Review and approve submitted projects for the marketplace</p>
          </div>

          {projects.length === 0 ? (
            <div className="text-center py-12">
              <MdCheckCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg mb-2">No pending projects</p>
              <p className="text-gray-400">All projects have been reviewed</p>
            </div>
          ) : (
            <div className="grid gap-6">
              {projects.map((project) => (
                <div key={project.id} className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          {project.title || project.projectTitle}
                        </h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                          <div className="flex items-center">
                            <MdCalendarToday className="w-4 h-4 mr-1" />
                            <span>Submitted: {formatDate(project.submittedAt || project.createdAt)}</span>
                          </div>
                          <div className="flex items-center">
                            <MdAttachMoney className="w-4 h-4 mr-1" />
                            <span>{formatBudget(project.marketplace?.budget || project.estimatedBudget)}</span>
                          </div>
                          <div className="flex items-center">
                            <MdLocationOn className="w-4 h-4 mr-1" />
                            <span>{project.city}, {project.province}</span>
                          </div>
                          <div className="flex items-center">
                            <MdSchedule className="w-4 h-4 mr-1" />
                            <span>{project.estimatedDuration}</span>
                          </div>
                        </div>
                        <div className="mb-3">
                          <span className="text-sm text-gray-500">Owner: </span>
                          <span className="text-sm font-medium text-gray-900">
                            {project.ownerName || project.ownerEmail}
                          </span>
                        </div>
                        <div className="mb-3">
                          <span className="text-sm text-gray-500">Type: </span>
                          <span className="text-sm font-medium text-gray-900">{project.projectType}</span>
                        </div>
                        {project.projectScope && project.projectScope.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-3">
                            {project.projectScope.map((scope, index) => (
                              <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                                {scope}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col items-end space-y-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(project.status)}`}>
                          {project.status || 'Menunggu Persetujuan'}
                        </span>
                        {project.attachedBOQ && (
                          <div className="flex items-center text-xs text-gray-500">
                            <MdAttachFile className="w-3 h-3 mr-1" />
                            <span>BOQ Attached</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex justify-end space-x-3">
                      <button
                        onClick={() => openProjectDetails(project)}
                        className="px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                      >
                        Review Details
                      </button>
                      <button
                        onClick={() => handleApproveProject(project.id)}
                        disabled={processingAction === project.id}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                      >
                        {processingAction === project.id ? 'Processing...' : 'Approve'}
                      </button>
                      <button
                        onClick={() => openRejectModal(project)}
                        disabled={processingAction === project.id}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                      >
                        {processingAction === project.id ? 'Processing...' : 'Reject'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      ) : (
        /* Project Details View */
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <button
                onClick={closeProjectDetails}
                className="flex items-center text-blue-600 hover:text-blue-800 mb-2"
              >
                ← Back to Project List
              </button>
              <h2 className="text-2xl font-bold text-gray-900">
                {selectedProject.title || selectedProject.projectTitle}
              </h2>
              <p className="text-gray-600">Review project details and make approval decision</p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => openRejectModal(selectedProject)}
                disabled={processingAction === selectedProject.id}
                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {processingAction === selectedProject.id ? 'Processing...' : 'Reject Project'}
              </button>
              <button
                onClick={() => handleApproveProject(selectedProject.id)}
                disabled={processingAction === selectedProject.id}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                {processingAction === selectedProject.id ? 'Processing...' : 'Approve Project'}
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="p-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Project Information</h4>
                  <div className="space-y-2 text-sm">
                    <div><span className="font-medium text-gray-700">Title:</span> <span className="text-gray-900">{selectedProject.title || selectedProject.projectTitle}</span></div>
                    <div><span className="font-medium text-gray-700">Type:</span> <span className="text-gray-900">{selectedProject.projectType}</span></div>
                    <div><span className="font-medium text-gray-700">Budget:</span> <span className="text-gray-900">{formatBudget(selectedProject.marketplace?.budget || selectedProject.estimatedBudget)}</span></div>
                    <div><span className="font-medium text-gray-700">Duration:</span> <span className="text-gray-900">{selectedProject.estimatedDuration}</span></div>
                    <div><span className="font-medium text-gray-700">Location:</span> <span className="text-gray-900">{selectedProject.fullAddress}</span></div>
                    <div><span className="font-medium text-gray-700">Procurement:</span> <span className="text-gray-900">{selectedProject.procurementMethod}</span></div>
                    <div><span className="font-medium text-gray-700">Property Type:</span> <span className="text-gray-900">{selectedProject.propertyType}</span></div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Owner Information</h4>
                  <div className="space-y-2 text-sm">
                    <div><span className="font-medium text-gray-700">Name:</span> <span className="text-gray-900">{selectedProject.ownerName || 'Not provided'}</span></div>
                    <div><span className="font-medium text-gray-700">Email:</span> <span className="text-gray-900">{selectedProject.ownerEmail}</span></div>
                    <div><span className="font-medium text-gray-700">Submitted:</span> <span className="text-gray-900">{formatDate(selectedProject.submittedAt || selectedProject.createdAt)}</span></div>
                  </div>
                </div>
              </div>

              {selectedProject.projectScope && selectedProject.projectScope.length > 0 && (
                <div className="mt-6">
                  <h4 className="font-semibold text-gray-900 mb-3">Project Scope</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedProject.projectScope.map((scope, index) => (
                      <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                        {scope}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {selectedProject.specialNotes && (
                <div className="mt-6">
                  <h4 className="font-semibold text-gray-900 mb-3">Special Notes</h4>
                  <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                    {selectedProject.specialNotes}
                  </p>
                </div>
              )}

              {selectedProject.attachedBOQ && (
                <div className="mt-6">
                  <h4 className="font-semibold text-gray-900 mb-3">Attached BOQ Details</h4>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center mb-4">
                      <MdAttachFile className="w-5 h-5 text-blue-600 mr-2" />
                      <div>
                        <div className="font-medium text-blue-900">{selectedProject.attachedBOQ.title}</div>
                        <div className="text-sm text-blue-600">
                          {selectedProject.attachedBOQ.tahapanKerja?.length || 0} work phases
                        </div>
                      </div>
                    </div>
                    
                    {selectedProject.attachedBOQ.tahapanKerja && selectedProject.attachedBOQ.tahapanKerja.length > 0 && (
                      <div className="space-y-3">
                        <h5 className="font-medium text-gray-900">Work Phases:</h5>
                        {selectedProject.attachedBOQ.tahapanKerja.map((tahapan, index) => (
                          <div key={index} className="bg-white border border-gray-200 rounded-lg p-3">
                            <h6 className="font-medium text-gray-900 mb-2">
                              {index + 1}. {tahapan.name || `Phase ${index + 1}`}
                            </h6>
                            {tahapan.jenisKerja && tahapan.jenisKerja.length > 0 && (
                              <div className="pl-4 space-y-2">
                                {tahapan.jenisKerja.map((jenis, jenisIndex) => (
                                  <div key={jenisIndex} className="text-sm">
                                    <div className="font-medium text-gray-700 mb-1">
                                      {jenis.name || `Work Type ${jenisIndex + 1}`}
                                    </div>
                                    {jenis.uraian && jenis.uraian.length > 0 && (
                                      <div className="pl-4 text-xs text-gray-600">
                                        {jenis.uraian.slice(0, 3).map((item, itemIndex) => (
                                          <div key={itemIndex}>
                                            • {item.description || item.name || `Item ${itemIndex + 1}`}
                                            {item.quantity && item.unit && (
                                              <span className="text-gray-500 ml-2">
                                                ({item.quantity} {item.unit})
                                              </span>
                                            )}
                                          </div>
                                        ))}
                                        {jenis.uraian.length > 3 && (
                                          <div className="text-gray-400">
                                            ... and {jenis.uraian.length - 3} more items
                                          </div>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Rejection Reason Modal */}
      {showRejectModal && selectedProject && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Reject Project
              </h3>
              <button
                onClick={closeRejectModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <MdClose className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6">
              <p className="text-gray-600 mb-4">
                Please provide a reason for rejecting this project. This will be sent to the project owner.
              </p>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                rows={4}
                placeholder="Enter rejection reason..."
                required
              />
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={closeRejectModal}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleRejectProject(selectedProject.id, rejectionReason)}
                disabled={!rejectionReason.trim() || processingAction === selectedProject.id}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {processingAction === selectedProject.id ? 'Processing...' : 'Reject Project'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
