'use client';

import { useState, useEffect } from 'react';
import { 
  MdTrendingUp, 
  MdWork, 
  MdPeople, 
  MdAttachMoney,
  MdCheckCircle,
  MdSchedule,
  MdWarning,
  MdAccountBalance
} from 'react-icons/md';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../../lib/firebase';

export default function HomeComponent() {
  const [stats, setStats] = useState({
    totalProjects: 0,
    pendingReview: 0,
    activeProjects: 0,
    completedProjects: 0,
    draftProjects: 0,
    totalUsers: 0,
    projectOwners: 0,
    vendors: 0,
    totalRevenue: 'Rp 0',
    monthlyGrowth: '+0%',
    pendingPayments: 'Rp 0',
    pendingDisbursements: 'Rp 0',
    platformRevenue: 'Rp 0'
  });

  const [recentProjects, setRecentProjects] = useState([]);
  const [allProjects, setAllProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAllProjects, setShowAllProjects] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [showProjectDetails, setShowProjectDetails] = useState(false);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch projects data
        const projectsSnapshot = await getDocs(collection(db, 'projects'));
        const projects = [];
        
        projectsSnapshot.forEach((doc) => {
          projects.push({
            id: doc.id,
            ...doc.data()
          });
        });

        // Calculate project statistics
        const totalProjects = projects.length;
        const pendingReview = projects.filter(p => p.moderationStatus === 'pending').length;
        const activeProjects = projects.filter(p => p.status === 'Active' || p.isPublished === true).length;
        const completedProjects = projects.filter(p => p.status === 'Completed').length;
        const draftProjects = projects.filter(p => p.status === 'Draft' || p.isDraft === true || p.moderationStatus === 'draft').length;

        // Get recent projects for display (last 5 projects from newest to oldest)
        const sortedProjects = projects.sort((a, b) => {
          const aDate = a.submittedAt?.toDate ? a.submittedAt.toDate() : new Date(a.submittedAt || a.createdAt || Date.now());
          const bDate = b.submittedAt?.toDate ? b.submittedAt.toDate() : new Date(b.submittedAt || b.createdAt || Date.now());
          return bDate - aDate;
        });

  const getProjectBudget = (project) => {
    // First try to get budget from attached BOQ data if available
    if (project.attachedBOQ?.tahapanKerja && project.attachedBOQ.tahapanKerja.length > 0) {
      const boqTotal = calculateTahapanKerjaTotal(project.attachedBOQ.tahapanKerja);
      if (boqTotal > 0) {
        return boqTotal;
      }
    }
    
    // Then try to get budget from direct tahapanKerja data if available
    if (project.tahapanKerja && project.tahapanKerja.length > 0) {
      const boqTotal = calculateTahapanKerjaTotal(project.tahapanKerja);
      if (boqTotal > 0) {
        return boqTotal;
      }
    }
    
    // Fallback to marketplace/estimated budget
    return project.marketplace?.budget || project.estimatedBudget;
  };

        const recentProjectsList = sortedProjects
          .slice(0, 5)
          .map(project => {
            return {
              id: project.id,
              customId: project.customId || project.id, // Use custom ID if available, fallback to Firestore ID
              title: project.title || project.projectTitle || 'Untitled Project',
              client: project.ownerName || project.ownerEmail?.split('@')[0] || 'Unknown',
              submittedDate: project.submittedAt?.toDate ? 
                project.submittedAt.toDate().toLocaleDateString('id-ID') : 
                new Date(project.submittedAt || project.createdAt || Date.now()).toLocaleDateString('id-ID'),
              status: project.moderationStatus || project.status || 'pending',
              budget: formatBudget(getProjectBudget(project)),
              priority: 'medium', // Default priority since we don't have this field
              type: project.projectType || 'Unknown',
              // Keep the original project data for details view
              originalData: project
            };
          });

        const allProjectsList = sortedProjects
          .map(project => {
            return {
              id: project.id,
              customId: project.customId || project.id, // Use custom ID if available, fallback to Firestore ID
              title: project.title || project.projectTitle || 'Untitled Project',
              client: project.ownerName || project.ownerEmail?.split('@')[0] || 'Unknown',
              submittedDate: project.submittedAt?.toDate ? 
                project.submittedAt.toDate().toLocaleDateString('id-ID') : 
                new Date(project.submittedAt || project.createdAt || Date.now()).toLocaleDateString('id-ID'),
              status: project.moderationStatus || project.status || 'pending',
              budget: formatBudget(getProjectBudget(project)),
              priority: 'medium', // Default priority since we don't have this field
              type: project.projectType || 'Unknown',
              location: project.city ? `${project.city}, ${project.province}` : 'Unknown Location',
              description: project.specialNotes || project.description || 'No description available',
              // Keep the original project data for details view
              originalData: project
            };
          });

        // Calculate total budget from all projects
        const totalBudget = projects.reduce((sum, project) => {
          // First try to get budget from attached BOQ data if available
          let projectBudget = 0;
          
          // Check for attached BOQ structure (from project creation)
          if (project.attachedBOQ?.tahapanKerja && project.attachedBOQ.tahapanKerja.length > 0) {
            projectBudget = calculateTahapanKerjaTotal(project.attachedBOQ.tahapanKerja);
          }
          
          // Check for direct tahapanKerja structure (from BOQ maker)
          if (projectBudget === 0 && project.tahapanKerja && project.tahapanKerja.length > 0) {
            projectBudget = calculateTahapanKerjaTotal(project.tahapanKerja);
          }
          
          // If no BOQ data or BOQ total is 0, fallback to marketplace/estimated budget
          if (projectBudget === 0) {
            const budget = project.marketplace?.budget || project.estimatedBudget;
            if (budget && typeof budget === 'string') {
              const numBudget = parseInt(budget.replace(/[^\d]/g, ''));
              projectBudget = isNaN(numBudget) ? 0 : numBudget;
            } else if (budget && typeof budget === 'number') {
              projectBudget = budget;
            }
          }
          
          return sum + projectBudget;
        }, 0);

        // Try to fetch users data (this might not exist yet)
        let totalUsers = 0;
        let projectOwners = 0;
        let vendors = 0;
        
        try {
          const usersSnapshot = await getDocs(collection(db, 'users'));
          totalUsers = usersSnapshot.size;
          
          usersSnapshot.forEach((doc) => {
            const userData = doc.data();
            if (userData.userType === 'project-owner') {
              projectOwners++;
            } else if (userData.userType === 'vendor') {
              vendors++;
            }
          });
        } catch (error) {
          console.log('Users collection might not exist yet');
          // Use project owners count from projects
          const uniqueOwners = new Set(projects.map(p => p.ownerId)).size;
          projectOwners = uniqueOwners;
          totalUsers = uniqueOwners; // Fallback
        }

        // Update stats
        setStats({
          totalProjects,
          pendingReview,
          activeProjects,
          completedProjects,
          draftProjects, // Add draft count
          totalUsers,
          projectOwners,
          vendors,
          totalRevenue: formatBudget(totalBudget),
          monthlyGrowth: '+12.5%', // This would need historical data to calculate
          pendingPayments: formatBudget(Math.floor(totalBudget * 0.3)), // Estimated
          pendingDisbursements: formatBudget(Math.floor(totalBudget * 0.4)), // Estimated
          platformRevenue: formatBudget(Math.floor(totalBudget * 0.05)) // Estimated 5% platform fee
        });

        setRecentProjects(recentProjectsList);
        setAllProjects(allProjectsList);

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const formatBudget = (budget) => {
    if (!budget) return 'Rp 0';
    
    const numBudget = typeof budget === 'string' ? parseInt(budget.replace(/[^\d]/g, '')) : budget;
    
    if (isNaN(numBudget)) return 'Rp 0';
    
    if (numBudget >= 1000000000) {
      return `Rp ${(numBudget / 1000000000).toFixed(1)}B`;
    } else if (numBudget >= 1000000) {
      return `Rp ${(numBudget / 1000000).toFixed(1)}M`;
    } else {
      return `Rp ${numBudget.toLocaleString('id-ID')}`;
    }
  };



  const getStatusColor = (status) => {
    switch (status) {
      case 'Draft':
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      case 'pending':
      case 'pending_review':
      case 'Menunggu Persetujuan':
        return 'bg-yellow-100 text-yellow-800';
      case 'under_review':
        return 'bg-blue-100 text-blue-800';
      case 'approved':
      case 'Active':
        return 'bg-green-100 text-green-800';
      case 'rejected':
      case 'Rejected':
        return 'bg-red-100 text-red-800';
      case 'Completed':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'Draft':
      case 'draft':
        return 'Draft';
      case 'pending':
      case 'pending_review':
      case 'Menunggu Persetujuan':
        return 'Pending Review';
      case 'under_review':
        return 'Under Review';
      case 'approved':
      case 'Active':
        return 'Active';
      case 'rejected':
      case 'Rejected':
        return 'Rejected';
      case 'Completed':
        return 'Completed';
      default:
        return status || 'Unknown';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'text-red-600 bg-red-50';
      case 'medium':
        return 'text-orange-600 bg-orange-50';
      case 'low':
        return 'text-green-600 bg-green-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const handleProjectClick = (project) => {
    setSelectedProject(project);
    setShowProjectDetails(true);
  };

  const handleCloseDetails = () => {
    setSelectedProject(null);
    setShowProjectDetails(false);
  };

  const formatProjectBudget = (budget) => {
    if (!budget) return 'Rp 0';
    
    const numBudget = typeof budget === 'string' ? parseInt(budget.replace(/[^\d]/g, '')) : budget;
    
    if (isNaN(numBudget)) return 'Rp 0';
    
    return `Rp ${numBudget.toLocaleString('id-ID')}`;
  };

  const calculateTahapanKerjaTotal = (tahapanKerja) => {
    return tahapanKerja.reduce((total, tahapan) => {
      const tahapanTotal = tahapan.jenisKerja?.reduce((jenisTotal, jenis) => {
        const jenisSubTotal = jenis.uraian?.reduce((uraianTotal, uraian) => {
          const uraianSubTotal = uraian.spec?.reduce((specTotal, spec) => {
            const volume = parseFloat(spec.volume) || 0;
            const price = parseFloat(spec.pricePerPcs) || 0;
            return specTotal + (volume * price);
          }, 0) || 0;
          return uraianTotal + uraianSubTotal;
        }, 0) || 0;
        return jenisTotal + jenisSubTotal;
      }, 0) || 0;
      return total + tahapanTotal;
    }, 0);
  };

  const renderTahapanKerjaDetails = (tahapanKerja, boqTitle = null) => {
    const totalBudget = calculateTahapanKerjaTotal(tahapanKerja);
    
    return (
      <div className="space-y-6">
        {/* BOQ Summary */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            BOQ Summary{boqTitle && ` - ${boqTitle}`}
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Total Work Phases</p>
              <p className="text-xl font-bold text-gray-900">{tahapanKerja.length}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Budget</p>
              <p className="text-xl font-bold text-green-600">{formatProjectBudget(totalBudget)}</p>
            </div>
          </div>
        </div>

        {/* Work Phases (Tahapan Kerja) */}
        {tahapanKerja.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Work Phases (Tahapan Kerja)</h3>
            <div className="space-y-4">
              {tahapanKerja.map((tahapan, tahapanIndex) => {
                const tahapanTotal = calculateTahapanKerjaTotal([tahapan]);
                
                return (
                  <div key={tahapanIndex} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <h4 className="font-medium text-gray-900">
                        {tahapan.name || `Phase ${tahapanIndex + 1}`}
                      </h4>
                      <span className="text-sm font-medium text-green-600">
                        {formatProjectBudget(tahapanTotal)}
                      </span>
                    </div>
                    
                    {tahapan.jenisKerja && tahapan.jenisKerja.length > 0 && (
                      <div className="space-y-3">
                        {tahapan.jenisKerja.map((jenis, jenisIndex) => (
                          <div key={jenisIndex} className="bg-white rounded border p-3">
                            <h5 className="font-medium text-gray-800 mb-2">
                              {jenis.name || `Work Type ${jenisIndex + 1}`}
                            </h5>
                            
                            {jenis.uraian && jenis.uraian.length > 0 && (
                              <div className="space-y-2">
                                {jenis.uraian.map((uraian, uraianIndex) => (
                                  <div key={uraianIndex} className="border-l-2 border-gray-200 pl-3">
                                    <p className="text-sm font-medium text-gray-700 mb-1">
                                      {uraian.name || `Description ${uraianIndex + 1}`}
                                    </p>
                                    
                                    {uraian.spec && uraian.spec.length > 0 && (
                                      <div className="bg-gray-50 rounded">
                                        <table className="w-full text-xs">
                                          <thead className="bg-gray-100">
                                            <tr>
                                              <th className="px-2 py-1 text-left">Item</th>
                                              <th className="px-2 py-1 text-right">Volume</th>
                                              <th className="px-2 py-1 text-right">Unit</th>
                                              <th className="px-2 py-1 text-right">Unit Price</th>
                                              <th className="px-2 py-1 text-right">Total</th>
                                            </tr>
                                          </thead>
                                          <tbody>
                                            {uraian.spec.map((spec, specIndex) => {
                                              const volume = parseFloat(spec.volume) || 0;
                                              const price = parseFloat(spec.pricePerPcs) || 0;
                                              const total = volume * price;
                                              
                                              return (
                                                <tr key={specIndex} className="border-t border-gray-100">
                                                  <td className="px-2 py-1">{spec.description || 'No description'}</td>
                                                  <td className="px-2 py-1 text-right">{volume}</td>
                                                  <td className="px-2 py-1 text-right">{spec.satuan || '-'}</td>
                                                  <td className="px-2 py-1 text-right">{formatProjectBudget(price)}</td>
                                                  <td className="px-2 py-1 text-right font-medium">{formatProjectBudget(total)}</td>
                                                </tr>
                                              );
                                            })}
                                          </tbody>
                                        </table>
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
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderBOQDetails = (project) => {
    console.log('Full project data:', project.originalData);
    
    // Check different possible BOQ data locations
    const boqData = project.originalData?.boqData || 
                   project.originalData?.boq || 
                   project.originalData?.BOQ ||
                   project.originalData?.savedBoq;
    
    // Check for Indonesian BOQ structure (tahapanKerja from BOQ maker)
    const tahapanKerja = project.originalData?.tahapanKerja;
    
    // Check for attached BOQ from project creation
    const attachedBOQ = project.originalData?.attachedBOQ;
    const attachedTahapanKerja = attachedBOQ?.tahapanKerja;
    
    console.log('BOQ Data found:', boqData);
    console.log('TahapanKerja found:', tahapanKerja);
    console.log('Attached BOQ found:', attachedBOQ);
    console.log('Attached TahapanKerja found:', attachedTahapanKerja);
    
    // Check for any field that might contain BOQ-like data
    const allFields = Object.keys(project.originalData || {});
    const boqLikeFields = allFields.filter(field => 
      field.toLowerCase().includes('boq') || 
      field.toLowerCase().includes('tahapan') ||
      field.toLowerCase().includes('kerja') ||
      field.toLowerCase().includes('phase') ||
      field.toLowerCase().includes('work') ||
      field.toLowerCase().includes('attach')
    );
    
    console.log('All available fields:', allFields);
    console.log('BOQ-like fields:', boqLikeFields);
    
    // Use attached BOQ tahapanKerja if available
    if (attachedTahapanKerja && attachedTahapanKerja.length > 0) {
      return (
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
            <h4 className="font-medium text-blue-900">Attached BOQ: {attachedBOQ.title}</h4>
            <p className="text-sm text-blue-700">Created: {new Date(attachedBOQ.createdAt).toLocaleDateString('id-ID')}</p>
          </div>
          {renderTahapanKerjaDetails(attachedTahapanKerja)}
        </div>
      );
    }
    
    // Use direct tahapanKerja if available
    if (tahapanKerja && tahapanKerja.length > 0) {
      return renderTahapanKerjaDetails(tahapanKerja);
    }
    
    if (!boqData && !tahapanKerja && !attachedBOQ) {
      return (
        <div className="space-y-4">
          <div className="text-center py-8 text-gray-500">
            <p>No BOQ data available for this project</p>
            <div className="text-xs text-gray-400 mt-4 space-y-2">
              <p><strong>All available fields:</strong></p>
              <div className="bg-gray-100 p-2 rounded text-left max-h-32 overflow-y-auto">
                {allFields.map((field, index) => (
                  <div key={index} className="text-xs">
                    <strong>{field}:</strong> {typeof project.originalData[field]} 
                    {Array.isArray(project.originalData[field]) && ` (${project.originalData[field].length} items)`}
                  </div>
                ))}
              </div>
              {boqLikeFields.length > 0 && (
                <div>
                  <p><strong>Potential BOQ fields found:</strong></p>
                  <div className="bg-blue-100 p-2 rounded text-left">
                    {boqLikeFields.map((field, index) => (
                      <div key={index} className="text-xs">
                        <strong>{field}:</strong> {JSON.stringify(project.originalData[field], null, 2).slice(0, 200)}...
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {/* BOQ Summary */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">BOQ Summary</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Total Work Phases</p>
              <p className="text-xl font-bold text-gray-900">{boqData.workPhases?.length || 0}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Budget</p>
              <p className="text-xl font-bold text-green-600">{formatProjectBudget(boqData.totalBudget)}</p>
            </div>
          </div>
        </div>

        {/* Work Phases */}
        {boqData.workPhases && boqData.workPhases.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Work Phases</h3>
            <div className="space-y-4">
              {boqData.workPhases.map((phase, phaseIndex) => (
                <div key={phaseIndex} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <h4 className="font-medium text-gray-900">{phase.name || `Phase ${phaseIndex + 1}`}</h4>
                    <span className="text-sm font-medium text-green-600">
                      {formatProjectBudget(phase.totalBudget)}
                    </span>
                  </div>
                  
                  {phase.items && phase.items.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-gray-700">Items:</p>
                      <div className="bg-white rounded border">
                        <table className="w-full text-sm">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-3 py-2 text-left">Item</th>
                              <th className="px-3 py-2 text-right">Quantity</th>
                              <th className="px-3 py-2 text-right">Unit</th>
                              <th className="px-3 py-2 text-right">Unit Price</th>
                              <th className="px-3 py-2 text-right">Total</th>
                            </tr>
                          </thead>
                          <tbody>
                            {phase.items.map((item, itemIndex) => (
                              <tr key={itemIndex} className="border-t border-gray-100">
                                <td className="px-3 py-2">{item.description || item.name}</td>
                                <td className="px-3 py-2 text-right">{item.quantity}</td>
                                <td className="px-3 py-2 text-right">{item.unit}</td>
                                <td className="px-3 py-2 text-right">{formatProjectBudget(item.unitPrice)}</td>
                                <td className="px-3 py-2 text-right font-medium">{formatProjectBudget(item.total)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };



  if (loading) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Loading dashboard data...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">
          Admin Dashboard
        </h1>
        <p className="text-slate-600 mt-2">
          Welcome back! Here&apos;s what&apos;s happening with your platform today.
        </p>
        {/* Debug button */}
        <button
          onClick={() => {
            console.log('=== DEBUG: All Projects Data ===');
            console.log('Recent Projects:', recentProjects);
            console.log('All Projects:', allProjects);
            console.log('================================');
          }}
          className="mt-2 text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded"
        >
          Debug Projects
        </button>
      </div>

      {/* Stats Cards - Hidden when showing all projects or project details */}
      {!showAllProjects && !showProjectDetails && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Total Projects</p>
                <p className="text-2xl font-bold text-slate-900 mt-2">{stats.totalProjects}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <MdWork className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Pending Review</p>
                <p className="text-2xl font-bold text-slate-900 mt-2">{stats.pendingReview}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <MdSchedule className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Total Users</p>
                <p className="text-2xl font-bold text-slate-900 mt-2">{stats.totalUsers}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <MdPeople className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Total Revenue</p>
                <p className="text-2xl font-bold text-slate-900 mt-2">{stats.totalRevenue}</p>
                <p className="text-sm text-green-600 mt-1">{stats.monthlyGrowth}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <MdAttachMoney className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Pending Payments</p>
                <p className="text-2xl font-bold text-slate-900 mt-2">{stats.pendingPayments}</p>
                <p className="text-sm text-orange-600 mt-1">From clients</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <MdWarning className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Ready to Disburse</p>
                <p className="text-2xl font-bold text-slate-900 mt-2">{stats.pendingDisbursements}</p>
                <p className="text-sm text-green-600 mt-1">To vendors</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <MdAccountBalance className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Project Details View */}
      {showProjectDetails && selectedProject && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200">
          <div className="p-6 border-b border-slate-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Project Details</h2>
              <button
                onClick={handleCloseDetails}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-lg transition-colors"
              >
                ← Back to Projects
              </button>
            </div>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Project Information */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Project Information</h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-medium text-gray-700">Project Title</p>
                      <p className="text-gray-900">{selectedProject.title}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">Client</p>
                      <p className="text-gray-900">{selectedProject.client}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">Project Type</p>
                      <p className="text-gray-900">{selectedProject.type}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">Location</p>
                      <p className="text-gray-900">{selectedProject.location}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">Budget</p>
                      <p className="text-lg font-semibold text-green-600">{selectedProject.budget}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">Status</p>
                      <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(selectedProject.status)}`}>
                        {getStatusText(selectedProject.status)}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">Submitted Date</p>
                      <p className="text-gray-900">{selectedProject.submittedDate}</p>
                    </div>
                    {selectedProject.description && (
                      <div>
                        <p className="text-sm font-medium text-gray-700">Description</p>
                        <p className="text-gray-900">{selectedProject.description}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* BOQ Details */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">BOQ Details</h3>
                {renderBOQDetails(selectedProject)}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Projects Section - Hidden when showing project details */}
      {!showProjectDetails && (
        <div className="w-full">
          <div className="w-full">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200">
              <div className="p-6 border-b border-slate-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-slate-900">
                      {showAllProjects ? 'All Projects' : 'Recent Project Submissions'}
                    </h2>
                    {showAllProjects && (
                      <p className="text-sm text-slate-600 mt-1">
                        All projects sorted from newest to oldest
                      </p>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    {showAllProjects && (
                      <button 
                        onClick={() => setShowAllProjects(false)}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-lg transition-colors"
                      >
                        ← Back to Dashboard
                      </button>
                    )}
                    {!showAllProjects && (
                      <button 
                        onClick={() => setShowAllProjects(true)}
                        className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                      >
                        View All
                      </button>
                    )}
                  </div>
                </div>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {(showAllProjects ? allProjects : recentProjects).map((project, index) => (
                    <div 
                      key={project.id || index} 
                      className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
                      onClick={() => handleProjectClick(project)}
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium text-slate-900">{project.title}</h3>
                          <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded font-mono">
                            {project.customId}
                          </span>
                        </div>
                        <p className="text-sm text-slate-600">{project.client}</p>
                        {showAllProjects && project.location && (
                          <p className="text-xs text-slate-500 mt-1">{project.location}</p>
                        )}
                        {showAllProjects && project.description && (
                          <p className="text-xs text-slate-500 mt-1 line-clamp-2">{project.description}</p>
                        )}
                        <div className="flex items-center gap-2 mt-2">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(project.status)}`}>
                            {getStatusText(project.status)}
                          </span>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(project.priority)}`}>
                            {project.priority.toUpperCase()}
                          </span>
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
                            {project.type}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-slate-900">{project.budget}</p>
                        <p className="text-sm text-slate-500">{project.submittedDate}</p>
                      </div>
                    </div>
                  ))}
                  {(showAllProjects ? allProjects : recentProjects).length === 0 && (
                    <div className="text-center py-8">
                      <p className="text-slate-500">No projects found</p>
                      <p className="text-xs text-gray-400 mt-2">
                        Total projects in database: {stats.totalProjects}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
