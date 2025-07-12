import React, { useState, useEffect } from 'react';
import { 
  FiArrowLeft, 
  FiMapPin, 
  FiCalendar, 
  FiClock,
  FiDollarSign,
  FiUser,
  FiFileText,
  FiEdit3,
  FiEye
} from 'react-icons/fi';
import Image from 'next/image';
import { db } from '../../../../lib/firebase';
import { doc, getDoc, collection, getDocs, updateDoc, serverTimestamp } from 'firebase/firestore';
import BOQDisplay from '../../../components/BOQDisplay';

const ProjectOwnerDetailPage = ({ project, onBack, isVendorView = false, currentUserId = null }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [showVendorProfile, setShowVendorProfile] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [expandedBOQs, setExpandedBOQs] = useState({});
  const [showCompareBOQs, setShowCompareBOQs] = useState(false);
  const [vendorPortfolioData, setVendorPortfolioData] = useState({});
  const [vendorCompanyData, setVendorCompanyData] = useState({});
  const [loadingPortfolio, setLoadingPortfolio] = useState(false);
  const [isSelectingVendor, setIsSelectingVendor] = useState(false);

  // Get vendor's own proposal if in vendor view
  const vendorProposal = isVendorView && currentUserId ? 
    project.proposals?.find(proposal => proposal.vendorId === currentUserId) : null;

  // Function to fetch vendor portfolio and company data
  const fetchVendorData = async (vendorId) => {
    if (vendorPortfolioData[vendorId] && vendorCompanyData[vendorId]) {
      return; // Data already loaded
    }
    
    setLoadingPortfolio(true);
    try {
      // Fetch vendor company info
      const vendorDoc = await getDoc(doc(db, 'vendorProfiles', vendorId));
      let companyInfo = {};
      if (vendorDoc.exists()) {
        companyInfo = vendorDoc.data();
      }

      // Fetch portfolio items
      const portfolioRef = collection(db, 'vendorProfiles', vendorId, 'portfolio');
      const portfolioSnapshot = await getDocs(portfolioRef);
      const portfolioItems = portfolioSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Update state
      setVendorCompanyData(prev => ({
        ...prev,
        [vendorId]: companyInfo
      }));
      
      setVendorPortfolioData(prev => ({
        ...prev,
        [vendorId]: portfolioItems
      }));
    } catch (error) {
      console.error('Error fetching vendor data:', error);
    } finally {
      setLoadingPortfolio(false);
    }
  };

  // Helper function to format budget with Rp and thousand separators
  const formatBudget = (value) => {
    if (!value) return 'Not specified';
    
    // If already formatted, return as is
    if (typeof value === 'string' && value.includes('Rp')) {
      return value;
    }
    
    // Handle numeric conversion
    let numBudget;
    if (typeof value === 'string') {
      numBudget = parseInt(value.replace(/[^\d]/g, ''));
    } else {
      numBudget = parseInt(value);
    }
    
    if (isNaN(numBudget) || numBudget === 0) {
      return 'Not specified';
    }
    
    return `Rp ${numBudget.toLocaleString('id-ID')}`;
  };

  // Define tabs based on whether this is vendor view or owner view
  const tabs = isVendorView ? [
    { id: 'overview', label: 'Overview', icon: FiEye },
    { id: 'boq', label: 'BOQ', icon: FiFileText },
    ...(vendorProposal ? [{ id: 'my-proposal', label: 'My Proposal', icon: FiUser }] : [])
  ] : [
    { id: 'overview', label: 'Overview', icon: FiEye },
    { id: 'boq', label: 'BOQ', icon: FiFileText },
    { id: 'proposals', label: `Proposals (${project.proposals?.length || 0})`, icon: FiUser },
  ];

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (date) => {
    if (!date) return 'Not specified';
    if (typeof date === 'string') return date;
    if (date.toDate) return date.toDate().toLocaleDateString('id-ID');
    return new Date(date).toLocaleDateString('id-ID');
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'active':
      case 'open':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'closed':
        return 'bg-gray-100 text-gray-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  const renderOverviewTab = () => (
    <div className="space-y-6">
      {/* Project Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{project.projectTitle}</h2>
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="px-3 py-1 text-sm font-medium rounded-full bg-blue-100 text-blue-800">
                {project.projectType}
              </span>
              <span className="px-3 py-1 text-sm font-medium rounded-full bg-purple-100 text-purple-800">
                {project.propertyType}
              </span>
              <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(project.status)}`}>
                {project.status || 'Active'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Key Information Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <FiDollarSign className="text-green-600" size={20} />
            </div>
            <div>
              <p className="text-sm text-gray-500">Budget</p>
              <p className="font-semibold text-gray-900">{formatBudget(project.marketplace?.budget || project.estimatedBudget || project.budget)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <FiClock className="text-blue-600" size={20} />
            </div>
            <div>
              <p className="text-sm text-gray-500">Duration</p>
              <p className="font-semibold text-gray-900">{project.estimatedDuration || project.duration || 'Not specified'}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <FiCalendar className="text-red-600" size={20} />
            </div>
            <div>
              <p className="text-sm text-gray-500">Tender Deadline</p>
              <p className="font-semibold text-gray-900">
                {formatDate(project.tenderDeadline || project.deadline) || 'Not specified'}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <FiMapPin className="text-purple-600" size={20} />
            </div>
            <div>
              <p className="text-sm text-gray-500">Location</p>
              <p className="font-semibold text-gray-900">
                {project.marketplace?.location?.city || project.city || 'Not specified'}
                {(project.marketplace?.location?.province || project.province) && 
                  `, ${project.marketplace?.location?.province || project.province}`}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Project Description */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Project Description</h3>
        <div className="prose prose-sm max-w-none">
          <p className="text-gray-600 leading-relaxed">
            {project.specialNotes || project.description || 
             `${project.projectType} project for ${project.propertyType || 'property'} in ${project.marketplace?.location?.city || project.city || 'Unknown Location'}`}
          </p>
        </div>
      </div>

      {/* Project Scope */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Project Scope</h3>
        <div className="flex flex-wrap gap-2">
          {Array.isArray(project.marketplace?.tags || project.projectScope || project.scope) ? (
            (project.marketplace?.tags || project.projectScope || project.scope).map((scope, index) => (
              <span key={index} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                {scope}
              </span>
            ))
          ) : (
            <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
              {project.marketplace?.tags || project.projectScope || project.scope || 'General'}
            </span>
          )}
        </div>
      </div>

      {/* Additional Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Project Owner</h3>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <FiUser className="text-blue-600" size={24} />
            </div>
            <div>
              <p className="font-medium text-gray-900">{project.ownerName || project.client || 'Not specified'}</p>
              <p className="text-sm text-gray-500">Project Owner</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Estimated Start Date</h3>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <FiCalendar className="text-green-600" size={20} />
            </div>
            <div>
              <p className="font-medium text-gray-900">{formatDate(project.estimatedStartDate)}</p>
              <p className="text-sm text-gray-500">Planned Start</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderBOQTab = () => {
    // Check for BOQ data in multiple possible locations
    const boqData = project.boq || 
                   project.attachedBOQ || 
                   project.boqData || 
                   project.originalData?.boq || 
                   project.originalData?.attachedBOQ;

    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Bill of Quantities (BOQ)</h3>
          {boqData ? (
            <BOQDisplay project={{ ...project, attachedBOQ: boqData }} />
          ) : (
            <div className="text-center py-8">
              <FiFileText className="mx-auto text-gray-400 mb-3" size={48} />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No BOQ Available</h3>
              <p className="text-gray-500">
                Bill of Quantities has not been uploaded for this project yet.
              </p>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderProposalsTab = () => {
    const proposals = project.proposals || [];
    
    const formatCurrencyProposal = (amount) => {
      if (!amount) return 'Not specified';
      return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(amount);
    };

    const toggleBOQExpansion = (proposalIndex) => {
      setExpandedBOQs(prev => ({
        ...prev,
        [proposalIndex]: !prev[proposalIndex]
      }));
    };

    const handleSelectVendor = async (proposal) => {
      if (isSelectingVendor) return; // Prevent double-click
      
      const confirmSelection = window.confirm(
        `Are you sure you want to select ${proposal.vendorName} for this project? This action cannot be undone and will remove the project from the marketplace.`
      );
      
      if (!confirmSelection) return;
      
      setIsSelectingVendor(true);
      
      try {
        // Update the project with selected vendor information
        const projectRef = doc(db, 'projects', project.id);
        const updateData = {
          selectedVendorId: proposal.vendorId,
          selectedVendorName: proposal.vendorName,
          selectedProposal: proposal,
          status: 'awarded', // Change status to awarded
          awardedAt: serverTimestamp(),
          lastUpdated: serverTimestamp(),
          // Keep the project data but mark it as no longer available for bidding
          isAvailableForBidding: false,
          marketplace: {
            ...project.marketplace,
            status: 'closed'
          }
        };
        
        await updateDoc(projectRef, updateData);
        
        // Show success message
        alert(`Successfully selected ${proposal.vendorName} for this project! The project has been awarded and removed from the marketplace.`);
        
        // Call onBack to return to project list where the UI will reflect the changes
        onBack();
        
      } catch (error) {
        console.error('Error selecting vendor:', error);
        alert('Failed to select vendor. Please try again.');
      } finally {
        setIsSelectingVendor(false);
      }
    };

    const handleViewPortfolio = async (vendorId, vendorName, proposal) => {
      setSelectedVendor({ 
        id: vendorId, 
        name: vendorName,
        proposal: proposal
      });
      setShowVendorProfile(true);
      
      // Fetch portfolio data for this vendor
      await fetchVendorData(vendorId);
    };

    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">
              Submitted Proposals ({proposals.length})
            </h3>
            <div className="flex items-center gap-3">
              {proposals.length > 1 && (
                <button
                  onClick={() => setShowCompareBOQs(!showCompareBOQs)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <FiFileText size={16} />
                  {showCompareBOQs ? 'Hide Comparison' : 'Compare BOQs'}
                </button>
              )}
              {proposals.length > 0 && (
                <div className="text-sm text-gray-500">
                  Select a vendor to proceed with your project
                </div>
              )}
            </div>
          </div>

          {proposals.length === 0 ? (
            <div className="text-center py-12">
              <FiUser className="mx-auto text-gray-400 mb-3" size={48} />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Proposals Yet</h3>
              <p className="text-gray-500 mb-4">
                No vendors have submitted proposals for this project yet.
              </p>
              <div className="text-sm text-gray-400">
                Proposals will appear here once vendors submit their bids.
              </div>
            </div>
          ) : (
            <>
              {/* BOQ Comparison View */}
              {showCompareBOQs && proposals.length > 1 && (
                <div className="mb-8 bg-blue-50 rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">BOQ Comparison</h4>
                  <p className="text-sm text-gray-600 mb-4">
                    Compare BOQ items across different vendor proposals to make an informed decision.
                  </p>
                  
                  {/* Simplified comparison showing total amounts and key metrics */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {proposals.map((proposal, pIndex) => (
                      <div key={pIndex} className="bg-white rounded-lg p-4 border border-blue-200">
                        <h5 className="font-semibold text-gray-900 mb-3">
                          {proposal.vendorName || `Vendor ${pIndex + 1}`}
                        </h5>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Total Amount:</span>
                            <span className="font-semibold text-gray-900">
                              {formatCurrencyProposal(proposal.totalAmount)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Duration:</span>
                            <span className="font-medium text-gray-700">
                              {proposal.estimatedDuration || 'Not specified'}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Items:</span>
                            <span className="font-medium text-gray-700">
                              {(() => {
                                if (proposal.vendorBOQ?.tahapanKerja) {
                                  return proposal.vendorBOQ.tahapanKerja.reduce((total, tahapan) => {
                                    return total + (tahapan.jenisKerja?.reduce((subTotal, jenis) => {
                                      return subTotal + (jenis.uraian?.reduce((itemTotal, uraian) => {
                                        return itemTotal + (uraian.spec?.length || 0);
                                      }, 0) || 0);
                                    }, 0) || 0);
                                  }, 0);
                                }
                                return 0;
                              })()} items
                            </span>
                          </div>
                          <div className="pt-2 border-t border-gray-200">
                            <button
                              onClick={() => toggleBOQExpansion(pIndex)}
                              className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
                            >
                              View Detailed BOQ
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-4 text-sm text-gray-600">
                    💡 <strong>Tip:</strong> Click "View Detailed BOQ" on each proposal below to see complete item breakdown and compare specific items.
                  </div>
                </div>
              )}

              {/* Individual Proposals */}
              <div className="space-y-4">
                {proposals.map((proposal, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-6 hover:border-blue-300 transition-colors">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <button
                          onClick={() => handleViewPortfolio(proposal.vendorId, proposal.vendorName, proposal)}
                          className="text-lg font-semibold text-blue-600 hover:text-blue-800 hover:underline transition-colors"
                        >
                          {proposal.vendorName || 'Unknown Vendor'}
                        </button>
                      </div>
                      <div className="text-sm text-gray-500 mb-3">
                        Submitted on: {proposal.submittedAt ? 
                          new Date(proposal.submittedAt).toLocaleDateString('id-ID', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          }) : 'Unknown date'
                        }
                      </div>
                    </div>
                    <button
                      onClick={() => handleSelectVendor(proposal)}
                      disabled={isSelectingVendor}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center gap-2"
                    >
                      {isSelectingVendor ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Selecting...
                        </>
                      ) : (
                        'Select Vendor'
                      )}
                    </button>
                  </div>

                  {/* Proposal Summary */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-sm text-gray-500 mb-1">Total Bid Amount</p>
                      <p className="font-semibold text-gray-900">
                        {formatCurrencyProposal(proposal.totalAmount)}
                      </p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-sm text-gray-500 mb-1">Estimated Duration</p>
                      <p className="font-semibold text-gray-900">
                        {proposal.estimatedDuration || 'Not specified'}
                      </p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-sm text-gray-500 mb-1">Items Count</p>
                      <p className="font-semibold text-gray-900">
                        {(() => {
                          if (proposal.vendorBOQ?.tahapanKerja) {
                            return proposal.vendorBOQ.tahapanKerja.reduce((total, tahapan) => {
                              return total + (tahapan.jenisKerja?.reduce((subTotal, jenis) => {
                                return subTotal + (jenis.uraian?.reduce((itemTotal, uraian) => {
                                  return itemTotal + (uraian.spec?.length || 0);
                                }, 0) || 0);
                              }, 0) || 0);
                            }, 0);
                          }
                          return proposal.boqData?.length || 0;
                        })()} items
                      </p>
                    </div>
                  </div>

                  {/* Vendor Message */}
                  {proposal.message && (
                    <div className="bg-blue-50 p-4 rounded-lg mb-4">
                      <h5 className="text-sm font-medium text-gray-900 mb-2">Vendor Message:</h5>
                      <p className="text-sm text-gray-700">{proposal.message}</p>
                    </div>
                  )}

                  {/* BOQ Summary and Full BOQ */}
                  {proposal.vendorBOQ && (
                    <div className="border-t border-gray-200 pt-4">
                      <div className="flex items-center justify-between mb-3">
                        <h5 className="text-sm font-medium text-gray-900">Vendor BOQ Proposal</h5>
                        <button
                          onClick={() => toggleBOQExpansion(index)}
                          className="flex items-center gap-2 px-3 py-1 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          {expandedBOQs[index] ? (
                            <>
                              <span>Hide Full BOQ</span>
                              <svg className="w-4 h-4 transform rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                              </svg>
                            </>
                          ) : (
                            <>
                              <span>View Full BOQ</span>
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                              </svg>
                            </>
                          )}
                        </button>
                      </div>
                      
                      {expandedBOQs[index] ? (
                        /* Full BOQ Display using BOQDisplay component */
                        <div className="bg-gray-50 rounded-lg p-4">
                          <BOQDisplay 
                            project={{ attachedBOQ: proposal.vendorBOQ }}
                            isVendorView={false}
                          />
                        </div>
                      ) : (
                        /* BOQ Summary */
                        <div className="space-y-2">
                          {(() => {
                            const summary = [];
                            if (proposal.vendorBOQ?.tahapanKerja) {
                              proposal.vendorBOQ.tahapanKerja.forEach((tahapan, tIndex) => {
                                tahapan.jenisKerja?.forEach((jenis, jIndex) => {
                                  jenis.uraian?.forEach((uraian, uIndex) => {
                                    uraian.spec?.slice(0, 3 - summary.length).forEach((spec, sIndex) => {
                                      if (summary.length < 3) {
                                        const total = (spec.volume || 0) * (spec.pricePerPcs || 0);
                                        summary.push({
                                          description: spec.description || spec.name || `${tahapan.name} - ${jenis.name}`,
                                          total: total
                                        });
                                      }
                                    });
                                  });
                                });
                              });
                            }
                            
                            return summary.map((item, itemIndex) => (
                              <div key={itemIndex} className="flex justify-between items-center text-sm">
                                <span className="text-gray-700">{item.description}</span>
                                <span className="font-medium text-gray-900">
                                  {formatCurrencyProposal(item.total)}
                                </span>
                              </div>
                            ));
                          })()}
                          <div className="text-sm text-gray-500 text-center pt-2">
                            Click "View Full BOQ" to see complete breakdown
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>                ))}
              </div>
            </>
          )}
        </div>
      </div>
    );
  };

  const renderVendorProfileView = () => {
    if (!selectedVendor) return null;

    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowVendorProfile(false)}
                className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <FiArrowLeft size={20} />
                <span className="font-medium">Back to Proposals</span>
              </button>
              
              {/* Company Logo */}
              <div className="flex items-center gap-4">
                {vendorCompanyData[selectedVendor.id]?.logoUrl ? (
                  <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-slate-200">
                    <Image 
                      src={vendorCompanyData[selectedVendor.id].logoUrl} 
                      alt="Company Logo"
                      width={64}
                      height={64}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-xl">
                      {selectedVendor.name?.charAt(0) || 'V'}
                    </span>
                  </div>
                )}
                
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{selectedVendor.name}</h2>
                  {vendorCompanyData[selectedVendor.id]?.establishedYear && (
                    <p className="text-gray-600">Est. {vendorCompanyData[selectedVendor.id].establishedYear}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Vendor Profile Content */}
          <div className="space-y-8">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Company Information</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-500">Company Name</p>
                    <p className="font-medium text-gray-900">{selectedVendor.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Vendor ID</p>
                    <p className="font-medium text-gray-900">{selectedVendor.id || 'Not specified'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Established Year</p>
                    <p className="font-medium text-gray-900">
                      {vendorCompanyData[selectedVendor.id]?.establishedYear || 'Not specified'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Specialization</p>
                    <p className="font-medium text-gray-900">
                      {vendorCompanyData[selectedVendor.id]?.specialization || 'Construction & Design'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Contact Information</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium text-gray-900">
                      {vendorCompanyData[selectedVendor.id]?.email || 
                       `contact@${selectedVendor.name?.toLowerCase().replace(/\s+/g, '')}.com`}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Phone</p>
                    <p className="font-medium text-gray-900">
                      {vendorCompanyData[selectedVendor.id]?.phone || '+62 xxx-xxxx-xxxx'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Location</p>
                    <p className="font-medium text-gray-900">
                      {vendorCompanyData[selectedVendor.id]?.location || 'Jakarta, Indonesia'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Proposal Summary */}
            {selectedVendor.proposal && (
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Proposal Summary</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Total Bid Amount</p>
                    <p className="text-xl font-bold text-blue-600">
                      {formatCurrency(selectedVendor.proposal.totalAmount || 0)}
                    </p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Estimated Duration</p>
                    <p className="text-xl font-bold text-green-600">
                      {selectedVendor.proposal.estimatedDuration || 'Not specified'}
                    </p>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">BOQ Items</p>
                    <p className="text-xl font-bold text-purple-600">
                      {selectedVendor.proposal.boqData?.length || 0} items
                    </p>
                  </div>
                </div>

                {selectedVendor.proposal.message && (
                  <div className="bg-gray-50 p-4 rounded-lg mb-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Vendor Message:</h4>
                    <p className="text-sm text-gray-700">{selectedVendor.proposal.message}</p>
                  </div>
                )}
              </div>
            )}

            {/* Portfolio Section */}
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Portfolio</h3>
              
              {loadingPortfolio ? (
                <div className="text-center py-8">
                  <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading portfolio...</p>
                </div>
              ) : (
                <>
                  {vendorPortfolioData[selectedVendor.id]?.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {vendorPortfolioData[selectedVendor.id].map((project) => (
                        <div key={project.id} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                          <div className="relative h-48">
                            <Image 
                              src={project.image || '/api/placeholder/400/300'} 
                              alt={project.title}
                              fill
                              className="object-cover"
                              onError={(e) => {
                                e.target.src = '/api/placeholder/400/300';
                              }}
                            />
                            {project.category && (
                              <div className="absolute top-2 left-2">
                                <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">
                                  {project.category}
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="p-4">
                            <h4 className="font-medium text-gray-900 mb-2 line-clamp-1">
                              {project.title}
                            </h4>
                            <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                              {project.description}
                            </p>
                            
                            <div className="space-y-2 text-xs text-gray-500">
                              {project.client && (
                                <div className="flex justify-between">
                                  <span>Client:</span>
                                  <span className="font-medium">{project.client}</span>
                                </div>
                              )}
                              {project.budget && (
                                <div className="flex justify-between">
                                  <span>Budget:</span>
                                  <span className="font-medium">{formatBudget(project.budget)}</span>
                                </div>
                              )}
                              {project.duration && (
                                <div className="flex justify-between">
                                  <span>Duration:</span>
                                  <span className="font-medium">{project.duration}</span>
                                </div>
                              )}
                              {project.completedDate && (
                                <div className="flex justify-between">
                                  <span>Completed:</span>
                                  <span className="font-medium">
                                    {new Date(project.completedDate).toLocaleDateString('id-ID')}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FiFileText className="text-gray-400" size={24} />
                      </div>
                      <h4 className="text-lg font-medium text-gray-900 mb-2">No Portfolio Available</h4>
                      <p className="text-gray-600">
                        This vendor hasn't added any portfolio projects yet.
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Action Buttons */}
            <div className="border-t border-gray-200 pt-6 flex gap-4">
              <button
                onClick={() => handleSelectVendor(selectedVendor.proposal)}
                disabled={isSelectingVendor}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center gap-2"
              >
                {isSelectingVendor ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Selecting Vendor...
                  </>
                ) : (
                  'Select This Vendor'
                )}
              </button>
              <button
                onClick={() => setShowVendorProfile(false)}
                className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              >
                Back to Proposals
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderMyProposalTab = () => {
    if (!vendorProposal) {
      return (
        <div className="text-center py-12">
          <div className="text-gray-500">No proposal found</div>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {/* Proposal Summary */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">My Proposal Summary</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <FiDollarSign className="text-green-600" size={20} />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Proposed Price</p>
                  <p className="font-semibold text-gray-900">{formatCurrency(vendorProposal.proposalPrice || vendorProposal.totalAmount)}</p>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <FiClock className="text-blue-600" size={20} />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Estimated Duration</p>
                  <p className="font-semibold text-gray-900">{vendorProposal.estimatedDuration || 'Not specified'}</p>
                </div>
              </div>
            </div>

            <div className="bg-purple-50 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <FiCalendar className="text-purple-600" size={20} />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Submitted Date</p>
                  <p className="font-semibold text-gray-900">{formatDate(vendorProposal.submittedAt)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Proposal Description */}
          {vendorProposal.description && (
            <div>
              <h4 className="text-md font-medium text-gray-900 mb-2">Proposal Description</h4>
              <p className="text-gray-600 leading-relaxed">{vendorProposal.description}</p>
            </div>
          )}
        </div>

        {/* Vendor BOQ */}
        {vendorProposal.vendorBOQ && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">My BOQ Proposal</h3>
            <BOQDisplay 
              project={{ attachedBOQ: vendorProposal.vendorBOQ }}
              isVendorView={true}
            />
          </div>
        )}

        {/* Status */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Proposal Status</h3>
          <div className="flex items-center gap-3">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              vendorProposal.status === 'accepted' ? 'bg-green-100 text-green-800' :
              vendorProposal.status === 'rejected' ? 'bg-red-100 text-red-800' :
              'bg-yellow-100 text-yellow-800'
            }`}>
              {vendorProposal.status === 'accepted' ? 'Accepted' :
               vendorProposal.status === 'rejected' ? 'Rejected' :
               'Under Review'}
            </span>
            <span className="text-gray-500">
              {vendorProposal.status === 'accepted' ? 'Congratulations! Your proposal has been accepted.' :
               vendorProposal.status === 'rejected' ? 'Your proposal was not selected for this project.' :
               'Your proposal is currently being reviewed by the project owner.'}
            </span>
          </div>
        </div>
      </div>
    );
  };

  const renderTabContent = () => {
    if (showVendorProfile) {
      return renderVendorProfileView();
    }

    switch (activeTab) {
      case 'overview':
        return renderOverviewTab();
      case 'boq':
        return renderBOQTab();
      case 'my-proposal':
        return renderMyProposalTab();
      case 'proposals':
        // Only render proposals tab for project owners, redirect vendors to overview
        return isVendorView ? renderOverviewTab() : renderProposalsTab();
      default:
        return renderOverviewTab();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={onBack}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <FiArrowLeft size={20} />
              <span className="font-medium">Back to Projects</span>
            </button>
            
            <div className="text-sm text-gray-500">
              Project Owner Dashboard
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation - Hide when viewing vendor profile */}
      {!showVendorProfile && (
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <nav className="flex space-x-8">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon size={16} />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderTabContent()}
      </div>
    </div>
  );
};

export default ProjectOwnerDetailPage;
