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
  const [fieldRevisions, setFieldRevisions] = useState({});
  const [overallRevision, setOverallRevision] = useState('');
  const [showFieldRevisions, setShowFieldRevisions] = useState({});

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

  const handleRequestRevision = async (projectId, notes = '', fieldComments = {}, overallComment = '') => {
    if ((!notes || notes.trim() === '') && (!overallComment || overallComment.trim() === '') && Object.keys(fieldComments).length === 0) {
      alert('Please provide revision notes or field-specific comments');
      return;
    }

    try {
      setProcessingAction(projectId);
      const projectRef = doc(db, 'projects', projectId);
      
      // Combine all revision data
      const revisionData = {
        moderationStatus: 'revision_required',
        status: 'Revise',
        isPublished: false,
        revisionRequestedAt: serverTimestamp(),
        adminNotes: notes || overallComment, // Backward compatibility
        overallRevision: overallComment,
        fieldRevisions: fieldComments,
        updatedAt: serverTimestamp()
      };

      await updateDoc(projectRef, revisionData);

      // Update local state
      setProjects(projects.filter(p => p.id !== projectId));
      setShowProjectDetails(false);
      setFieldRevisions({});
      setOverallRevision('');
      alert('Revision request sent successfully!');
    } catch (error) {
      console.error('Error requesting revision:', error);
      alert('Failed to request revision. Please try again.');
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

  const openProjectDetails = (project) => {
    setSelectedProject(project);
    setShowProjectDetails(true);
    // Reset revision form when opening a new project
    setFieldRevisions({});
    setOverallRevision('');
    setShowFieldRevisions({});
  };

  const closeProjectDetails = () => {
    setShowProjectDetails(false);
    setSelectedProject(null);
    // Reset revision form when closing details
    setFieldRevisions({});
    setOverallRevision('');
    setShowFieldRevisions({});
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
              {/* Project Review Details in Indonesian Format */}
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900 mb-4 text-lg">Detail Review Proyek</h4>
                
                {/* Judul Proyek */}
                <div className="grid grid-cols-3 gap-4 py-3 border-b border-gray-100">
                  <div className="font-medium text-gray-700 flex items-center justify-between">
                    Judul Proyek :
                    <button
                      onClick={() => setShowFieldRevisions(prev => ({ ...prev, judulProyek: !prev.judulProyek }))}
                      className="ml-2 px-2 py-1 text-xs bg-orange-100 text-orange-600 rounded hover:bg-orange-200"
                    >
                      Comment
                    </button>
                  </div>
                  <div className="text-gray-900 col-span-2">
                    <div>{selectedProject.title || selectedProject.projectTitle || '-'}</div>
                    {showFieldRevisions.judulProyek && (
                      <div className="mt-2">
                        <textarea
                          value={fieldRevisions.judulProyek || ''}
                          onChange={(e) => setFieldRevisions(prev => ({ ...prev, judulProyek: e.target.value }))}
                          className="w-full px-3 py-2 text-sm border border-orange-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                          rows={2}
                          placeholder="Add comment for Judul Proyek..."
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Lokasi Proyek */}
                <div className="grid grid-cols-3 gap-4 py-3 border-b border-gray-100">
                  <div className="font-medium text-gray-700 flex items-center justify-between">
                    Lokasi Proyek :
                    <button
                      onClick={() => setShowFieldRevisions(prev => ({ ...prev, lokasiProyek: !prev.lokasiProyek }))}
                      className="ml-2 px-2 py-1 text-xs bg-orange-100 text-orange-600 rounded hover:bg-orange-200"
                    >
                      Comment
                    </button>
                  </div>
                  <div className="text-gray-900 col-span-2">
                    <div>
                      {selectedProject.fullAddress || 
                       `${selectedProject.marketplace?.location?.city || selectedProject.city || ''}, ${selectedProject.marketplace?.location?.province || selectedProject.province || ''}` || 
                       '-'}
                    </div>
                    {showFieldRevisions.lokasiProyek && (
                      <div className="mt-2">
                        <textarea
                          value={fieldRevisions.lokasiProyek || ''}
                          onChange={(e) => setFieldRevisions(prev => ({ ...prev, lokasiProyek: e.target.value }))}
                          className="w-full px-3 py-2 text-sm border border-orange-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                          rows={2}
                          placeholder="Add comment for Lokasi Proyek..."
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Jenis Proyek */}
                <div className="grid grid-cols-3 gap-4 py-3 border-b border-gray-100">
                  <div className="font-medium text-gray-700 flex items-center justify-between">
                    Jenis Proyek :
                    <button
                      onClick={() => setShowFieldRevisions(prev => ({ ...prev, jenisProyek: !prev.jenisProyek }))}
                      className="ml-2 px-2 py-1 text-xs bg-orange-100 text-orange-600 rounded hover:bg-orange-200"
                    >
                      Comment
                    </button>
                  </div>
                  <div className="text-gray-900 col-span-2">
                    <div>{selectedProject.projectType || '-'}</div>
                    {showFieldRevisions.jenisProyek && (
                      <div className="mt-2">
                        <textarea
                          value={fieldRevisions.jenisProyek || ''}
                          onChange={(e) => setFieldRevisions(prev => ({ ...prev, jenisProyek: e.target.value }))}
                          className="w-full px-3 py-2 text-sm border border-orange-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                          rows={2}
                          placeholder="Add comment for Jenis Proyek..."
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Ruang Lingkup */}
                <div className="grid grid-cols-3 gap-4 py-3 border-b border-gray-100">
                  <div className="font-medium text-gray-700 flex items-center justify-between">
                    Ruang Lingkup :
                    <button
                      onClick={() => setShowFieldRevisions(prev => ({ ...prev, ruangLingkup: !prev.ruangLingkup }))}
                      className="ml-2 px-2 py-1 text-xs bg-orange-100 text-orange-600 rounded hover:bg-orange-200"
                    >
                      Comment
                    </button>
                  </div>
                  <div className="col-span-2">
                    <div>
                      {selectedProject.projectScope && selectedProject.projectScope.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {selectedProject.projectScope.map((scope, index) => (
                            <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                              {scope}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-gray-900">-</span>
                      )}
                    </div>
                    {showFieldRevisions.ruangLingkup && (
                      <div className="mt-2">
                        <textarea
                          value={fieldRevisions.ruangLingkup || ''}
                          onChange={(e) => setFieldRevisions(prev => ({ ...prev, ruangLingkup: e.target.value }))}
                          className="w-full px-3 py-2 text-sm border border-orange-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                          rows={2}
                          placeholder="Add comment for Ruang Lingkup..."
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Properti */}
                <div className="grid grid-cols-3 gap-4 py-3 border-b border-gray-100">
                  <div className="font-medium text-gray-700 flex items-center justify-between">
                    Properti :
                    <button
                      onClick={() => setShowFieldRevisions(prev => ({ ...prev, properti: !prev.properti }))}
                      className="ml-2 px-2 py-1 text-xs bg-orange-100 text-orange-600 rounded hover:bg-orange-200"
                    >
                      Comment
                    </button>
                  </div>
                  <div className="text-gray-900 col-span-2">
                    <div>{selectedProject.propertyType || '-'}</div>
                    {showFieldRevisions.properti && (
                      <div className="mt-2">
                        <textarea
                          value={fieldRevisions.properti || ''}
                          onChange={(e) => setFieldRevisions(prev => ({ ...prev, properti: e.target.value }))}
                          className="w-full px-3 py-2 text-sm border border-orange-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                          rows={2}
                          placeholder="Add comment for Properti..."
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Estimasi Anggaran */}
                <div className="grid grid-cols-3 gap-4 py-3 border-b border-gray-100">
                  <div className="font-medium text-gray-700 flex items-center justify-between">
                    Estimasi Anggaran :
                    <button
                      onClick={() => setShowFieldRevisions(prev => ({ ...prev, estimasiAnggaran: !prev.estimasiAnggaran }))}
                      className="ml-2 px-2 py-1 text-xs bg-orange-100 text-orange-600 rounded hover:bg-orange-200"
                    >
                      Comment
                    </button>
                  </div>
                  <div className="text-gray-900 col-span-2">
                    <div>{formatBudget(selectedProject.marketplace?.budget || selectedProject.estimatedBudget) || '-'}</div>
                    {showFieldRevisions.estimasiAnggaran && (
                      <div className="mt-2">
                        <textarea
                          value={fieldRevisions.estimasiAnggaran || ''}
                          onChange={(e) => setFieldRevisions(prev => ({ ...prev, estimasiAnggaran: e.target.value }))}
                          className="w-full px-3 py-2 text-sm border border-orange-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                          rows={2}
                          placeholder="Add comment for Estimasi Anggaran..."
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Estimasi Durasi Proyek */}
                <div className="grid grid-cols-3 gap-4 py-3 border-b border-gray-100">
                  <div className="font-medium text-gray-700 flex items-center justify-between">
                    Estimasi Durasi Proyek :
                    <button
                      onClick={() => setShowFieldRevisions(prev => ({ ...prev, estimasiDurasi: !prev.estimasiDurasi }))}
                      className="ml-2 px-2 py-1 text-xs bg-orange-100 text-orange-600 rounded hover:bg-orange-200"
                    >
                      Comment
                    </button>
                  </div>
                  <div className="text-gray-900 col-span-2">
                    <div>{selectedProject.estimatedDuration || '-'}</div>
                    {showFieldRevisions.estimasiDurasi && (
                      <div className="mt-2">
                        <textarea
                          value={fieldRevisions.estimasiDurasi || ''}
                          onChange={(e) => setFieldRevisions(prev => ({ ...prev, estimasiDurasi: e.target.value }))}
                          className="w-full px-3 py-2 text-sm border border-orange-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                          rows={2}
                          placeholder="Add comment for Estimasi Durasi Proyek..."
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Durasi Tender */}
                <div className="grid grid-cols-3 gap-4 py-3 border-b border-gray-100">
                  <div className="font-medium text-gray-700 flex items-center justify-between">
                    Durasi Tender :
                    <button
                      onClick={() => setShowFieldRevisions(prev => ({ ...prev, durasiTender: !prev.durasiTender }))}
                      className="ml-2 px-2 py-1 text-xs bg-orange-100 text-orange-600 rounded hover:bg-orange-200"
                    >
                      Comment
                    </button>
                  </div>
                  <div className="text-gray-900 col-span-2">
                    <div>{selectedProject.tenderDuration || '-'}</div>
                    {showFieldRevisions.durasiTender && (
                      <div className="mt-2">
                        <textarea
                          value={fieldRevisions.durasiTender || ''}
                          onChange={(e) => setFieldRevisions(prev => ({ ...prev, durasiTender: e.target.value }))}
                          className="w-full px-3 py-2 text-sm border border-orange-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                          rows={2}
                          placeholder="Add comment for Durasi Tender..."
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Estimasi Mulai Proyek */}
                <div className="grid grid-cols-3 gap-4 py-3 border-b border-gray-100">
                  <div className="font-medium text-gray-700 flex items-center justify-between">
                    Estimasi Mulai Proyek :
                    <button
                      onClick={() => setShowFieldRevisions(prev => ({ ...prev, estimasiMulai: !prev.estimasiMulai }))}
                      className="ml-2 px-2 py-1 text-xs bg-orange-100 text-orange-600 rounded hover:bg-orange-200"
                    >
                      Comment
                    </button>
                  </div>
                  <div className="text-gray-900 col-span-2">
                    <div>{selectedProject.startDate || selectedProject.estimatedStartDate || '-'}</div>
                    {showFieldRevisions.estimasiMulai && (
                      <div className="mt-2">
                        <textarea
                          value={fieldRevisions.estimasiMulai || ''}
                          onChange={(e) => setFieldRevisions(prev => ({ ...prev, estimasiMulai: e.target.value }))}
                          className="w-full px-3 py-2 text-sm border border-orange-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                          rows={2}
                          placeholder="Add comment for Estimasi Mulai Proyek..."
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Metode Pengadaan */}
                <div className="grid grid-cols-3 gap-4 py-3 border-b border-gray-100">
                  <div className="font-medium text-gray-700 flex items-center justify-between">
                    Metode Pengadaan :
                    <button
                      onClick={() => setShowFieldRevisions(prev => ({ ...prev, metodePengadaan: !prev.metodePengadaan }))}
                      className="ml-2 px-2 py-1 text-xs bg-orange-100 text-orange-600 rounded hover:bg-orange-200"
                    >
                      Comment
                    </button>
                  </div>
                  <div className="text-gray-900 col-span-2">
                    <div>{selectedProject.procurementMethod || '-'}</div>
                    {showFieldRevisions.metodePengadaan && (
                      <div className="mt-2">
                        <textarea
                          value={fieldRevisions.metodePengadaan || ''}
                          onChange={(e) => setFieldRevisions(prev => ({ ...prev, metodePengadaan: e.target.value }))}
                          className="w-full px-3 py-2 text-sm border border-orange-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                          rows={2}
                          placeholder="Add comment for Metode Pengadaan..."
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Special Notes */}
                <div className="grid grid-cols-3 gap-4 py-3 border-b border-gray-100">
                  <div className="font-medium text-gray-700 flex items-center justify-between">
                    Special Notes :
                    <button
                      onClick={() => setShowFieldRevisions(prev => ({ ...prev, specialNotes: !prev.specialNotes }))}
                      className="ml-2 px-2 py-1 text-xs bg-orange-100 text-orange-600 rounded hover:bg-orange-200"
                    >
                      Comment
                    </button>
                  </div>
                  <div className="text-gray-900 col-span-2">
                    <div>
                      {selectedProject.specialNotes ? (
                        <div className="bg-gray-50 p-3 rounded-lg text-sm">
                          {selectedProject.specialNotes}
                        </div>
                      ) : (
                        '-'
                      )}
                    </div>
                    {showFieldRevisions.specialNotes && (
                      <div className="mt-2">
                        <textarea
                          value={fieldRevisions.specialNotes || ''}
                          onChange={(e) => setFieldRevisions(prev => ({ ...prev, specialNotes: e.target.value }))}
                          className="w-full px-3 py-2 text-sm border border-orange-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                          rows={2}
                          placeholder="Add comment for Special Notes..."
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Overall Revision Section */}
                <div className="mt-6 pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between mb-3">
                    <h5 className="font-semibold text-gray-900">Overall Documentation Comment</h5>
                    <button
                      onClick={() => setShowFieldRevisions(prev => ({ ...prev, overallComment: !prev.overallComment }))}
                      className="px-3 py-1 text-sm bg-red-100 text-red-600 rounded hover:bg-red-200"
                    >
                      Add Overall Comment
                    </button>
                  </div>
                  {showFieldRevisions.overallComment && (
                    <div className="mt-2">
                      <textarea
                        value={overallRevision}
                        onChange={(e) => setOverallRevision(e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-red-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                        rows={3}
                        placeholder="Add overall comment about the entire project documentation..."
                      />
                    </div>
                  )}
                </div>

                {/* Action Buttons for Revision */}
                <div className="mt-6 pt-4 border-t border-gray-200">
                  <div className="flex justify-end space-x-3">
                    <button
                      onClick={() => handleRequestRevision(selectedProject.id, '', fieldRevisions, overallRevision)}
                      disabled={(!overallRevision.trim() && Object.keys(fieldRevisions).filter(key => fieldRevisions[key]?.trim()).length === 0) || processingAction === selectedProject.id}
                      className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {processingAction === selectedProject.id ? 'Processing...' : 'Save Revision Comments & Request Revision'}
                    </button>
                  </div>
                  
                  {/* Show summary of active comments */}
                  {(Object.keys(fieldRevisions).filter(key => fieldRevisions[key]?.trim()).length > 0 || overallRevision?.trim()) && (
                    <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                      <h6 className="text-sm font-medium text-orange-800 mb-2">Active Revision Comments:</h6>
                      <div className="space-y-1 text-xs text-orange-700">
                        {Object.entries(fieldRevisions).map(([field, comment]) => 
                          comment?.trim() ? (
                            <div key={field}>
                              • <strong>
                                {field === 'judulProyek' ? 'Judul Proyek' :
                                 field === 'lokasiProyek' ? 'Lokasi Proyek' :
                                 field === 'jenisProyek' ? 'Jenis Proyek' :
                                 field === 'ruangLingkup' ? 'Ruang Lingkup' :
                                 field === 'properti' ? 'Properti' :
                                 field === 'estimasiAnggaran' ? 'Estimasi Anggaran' :
                                 field === 'estimasiDurasi' ? 'Estimasi Durasi Proyek' :
                                 field === 'durasiTender' ? 'Durasi Tender' :
                                 field === 'estimasiMulai' ? 'Estimasi Mulai Proyek' :
                                 field === 'metodePengadaan' ? 'Metode Pengadaan' :
                                 field === 'specialNotes' ? 'Special Notes' : field}:
                              </strong> {comment}
                            </div>
                          ) : null
                        )}
                        {overallRevision?.trim() && (
                          <div>• <strong>Overall Documentation:</strong> {overallRevision}</div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Owner Information Section */}
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <h4 className="font-semibold text-gray-900 mb-4">Informasi Pemilik Proyek</h4>
                  <div className="space-y-3">
                    <div className="grid grid-cols-3 gap-4 py-2">
                      <div className="font-medium text-gray-700">Nama :</div>
                      <div className="text-gray-900 col-span-2">{selectedProject.ownerName || 'Tidak tersedia'}</div>
                    </div>
                    <div className="grid grid-cols-3 gap-4 py-2">
                      <div className="font-medium text-gray-700">Email :</div>
                      <div className="text-gray-900 col-span-2">{selectedProject.ownerEmail || '-'}</div>
                    </div>
                    <div className="grid grid-cols-3 gap-4 py-2">
                      <div className="font-medium text-gray-700">Tanggal Submit :</div>
                      <div className="text-gray-900 col-span-2">{formatDate(selectedProject.submittedAt || selectedProject.createdAt)}</div>
                    </div>
                  </div>
                </div>
              </div>

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
                      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                        <div className="overflow-x-auto">
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                              <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Work Phase
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Work Type
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Work Item & Specification
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Volume
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Unit (Satuan)
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Unit Price (Harga Satuan)
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Total Price
                                </th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {selectedProject.attachedBOQ.tahapanKerja.map((tahapan, phaseIndex) => {
                                let rowIndex = 0;
                                
                                // Helper functions for data extraction based on BOQ Maker structure
                                const getQuantity = (item) => {
                                  // BOQ Maker uses 'volume' field for quantity
                                  const value = item.volume || item.vol || item.quantity || item.qty || item.jumlah;
                                  return value !== undefined && value !== null ? value : '-';
                                };

                                const getUnit = (item) => {
                                  // BOQ Maker uses 'satuan' field for unit
                                  return item.satuan || item.unit || item.units || '-';
                                };

                                const getUnitPrice = (item) => {
                                  // BOQ Maker uses 'pricePerPcs' field for unit price
                                  return item.pricePerPcs || item.harga || item.unitPrice || item.hargaSatuan || item.price || null;
                                };

                                const getDescription = (item) => {
                                  // BOQ Maker uses 'description' field for specification description
                                  return item.description || item.pekerjaan || item.name || item.uraian || 'Item';
                                };

                                const getTotalPrice = (item) => {
                                  // Calculate total from volume and pricePerPcs (BOQ Maker structure)
                                  const volume = getQuantity(item);
                                  const pricePerPcs = getUnitPrice(item);
                                  
                                  if (volume && pricePerPcs && volume !== '-' && pricePerPcs !== null) {
                                    const qty = typeof volume === 'string' ? parseFloat(volume) : volume;
                                    const price = typeof pricePerPcs === 'string' ? parseFloat(pricePerPcs.replace(/[^\d.-]/g, '')) : pricePerPcs;
                                    if (!isNaN(qty) && !isNaN(price)) {
                                      return qty * price;
                                    }
                                  }
                                  
                                  // Fallback to pre-calculated total
                                  return item.total || null;
                                };

                                const formatCurrency = (value) => {
                                  if (!value && value !== 0) return '-';
                                  const numValue = typeof value === 'string' ? parseFloat(value.replace(/[^\d.-]/g, '')) : value;
                                  if (isNaN(numValue)) return '-';
                                  return `Rp ${numValue.toLocaleString('id-ID')}`;
                                };
                                
                                return tahapan.jenisKerja && tahapan.jenisKerja.length > 0 ? (
                                  tahapan.jenisKerja.map((jenis, jenisIndex) => 
                                    jenis.uraian && jenis.uraian.length > 0 ? (
                                      jenis.uraian.map((item, itemIndex) => {
                                        const isFirstInPhase = rowIndex === 0;
                                        const isFirstInType = itemIndex === 0;
                                        rowIndex++;

                                        // Get the spec data (BOQ Maker stores spec as an array with one item)
                                        const spec = item.spec && item.spec.length > 0 ? item.spec[0] : {};

                                        return (
                                          <tr key={`${phaseIndex}-${jenisIndex}-${itemIndex}`} className="hover:bg-gray-50">
                                            {isFirstInPhase && (
                                              <td 
                                                className="px-4 py-3 text-sm font-medium text-gray-900 border-r border-gray-200 bg-blue-25"
                                                rowSpan={tahapan.jenisKerja.reduce((total, jk) => total + (jk.uraian?.length || 0), 0)}
                                              >
                                                <div className="font-semibold text-blue-900">
                                                  Phase {phaseIndex + 1}
                                                </div>
                                                <div className="text-xs text-blue-700 mt-1">
                                                  {tahapan.name || `Phase ${phaseIndex + 1}`}
                                                </div>
                                              </td>
                                            )}
                                            {isFirstInType && (
                                              <td 
                                                className="px-4 py-3 text-sm text-gray-700 border-r border-gray-200 bg-gray-25"
                                                rowSpan={jenis.uraian.length}
                                              >
                                                <div className="font-medium">
                                                  {jenis.name || `Work Type ${jenisIndex + 1}`}
                                                </div>
                                              </td>
                                            )}
                                            <td className="px-4 py-3 text-sm text-gray-900">
                                              <div className="font-medium">{item.name || `Item ${itemIndex + 1}`}</div>
                                              {spec.description && (
                                                <div className="text-xs text-gray-600 mt-1">{spec.description}</div>
                                              )}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-600 text-right">
                                              {getQuantity(spec)}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-600">
                                              {getUnit(spec)}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-600 text-right">
                                              {formatCurrency(getUnitPrice(spec))}
                                            </td>
                                            <td className="px-4 py-3 text-sm font-medium text-gray-900 text-right">
                                              {formatCurrency(getTotalPrice(spec))}
                                            </td>
                                          </tr>
                                        );
                                      })
                                    ) : (
                                      <tr key={`${phaseIndex}-${jenisIndex}-empty`} className="hover:bg-gray-50">
                                        {rowIndex === 0 && (
                                          <td 
                                            className="px-4 py-3 text-sm font-medium text-gray-900 border-r border-gray-200 bg-blue-25"
                                            rowSpan={1}
                                          >
                                            <div className="font-semibold text-blue-900">
                                              Phase {phaseIndex + 1}
                                            </div>
                                            <div className="text-xs text-blue-700 mt-1">
                                              {tahapan.name || `Phase ${phaseIndex + 1}`}
                                            </div>
                                          </td>
                                        )}
                                        <td className="px-4 py-3 text-sm text-gray-700 border-r border-gray-200 bg-gray-25">
                                          <div className="font-medium">
                                            {jenis.name || `Work Type ${jenisIndex + 1}`}
                                          </div>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-500 italic" colSpan="5">
                                          No items defined
                                        </td>
                                      </tr>
                                    )
                                  )
                                ) : (
                                  <tr key={`${phaseIndex}-empty`} className="hover:bg-gray-50">
                                    <td className="px-4 py-3 text-sm font-medium text-gray-900 border-r border-gray-200 bg-blue-25">
                                      <div className="font-semibold text-blue-900">
                                        Phase {phaseIndex + 1}
                                      </div>
                                      <div className="text-xs text-blue-700 mt-1">
                                        {tahapan.name || `Phase ${phaseIndex + 1}`}
                                      </div>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-500 italic" colSpan="6">
                                      No work types defined
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                        
                        {/* BOQ Summary */}
                        <div className="bg-gray-50 px-4 py-3 border-t border-gray-200">
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-600">
                              Total Phases: {selectedProject.attachedBOQ.tahapanKerja.length}
                            </span>
                            <span className="text-gray-600">
                              Total Items: {selectedProject.attachedBOQ.tahapanKerja.reduce((total, tahapan) => 
                                total + (tahapan.jenisKerja?.reduce((subTotal, jenis) => 
                                  subTotal + (jenis.uraian?.length || 0), 0) || 0), 0
                              )}
                            </span>
                          </div>
                        </div>
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
