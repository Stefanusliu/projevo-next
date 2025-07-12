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
  FiEye,
  FiExternalLink
} from 'react-icons/fi';
import BOQDisplay from '../../../components/BOQDisplay';

const ProjectOwnerDetailPage = ({ project, onBack }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [showVendorProfile, setShowVendorProfile] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState(null);

  const tabs = [
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
              <p className="font-semibold text-gray-900">{project.budget}</p>
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
              <p className="font-semibold text-gray-900">{project.duration}</p>
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
              <p className="font-semibold text-gray-900">{project.bidCountdown || 'Not specified'}</p>
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
              <p className="font-semibold text-gray-900">{project.location}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Project Description */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Project Description</h3>
        <div className="prose prose-sm max-w-none">
          <p className="text-gray-600 leading-relaxed">
            {project.description || 'No description available for this project.'}
          </p>
        </div>
      </div>

      {/* Project Scope */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Project Scope</h3>
        <div className="flex flex-wrap gap-2">
          {Array.isArray(project.scope) ? (
            project.scope.map((scope, index) => (
              <span key={index} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                {scope}
              </span>
            ))
          ) : (
            <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
              {project.scope || 'General'}
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
              <p className="font-medium text-gray-900">{project.client || 'Not specified'}</p>
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
    
    const formatCurrency = (amount) => {
      if (!amount) return 'Not specified';
      return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(amount);
    };

    const handleSelectVendor = (proposal) => {
      // Here you can implement vendor selection logic
      console.log('Selected vendor:', proposal.vendorName);
      // You might want to update the project status, notify the vendor, etc.
    };

    const handleViewPortfolio = (vendorId, vendorName, proposal) => {
      setSelectedVendor({ 
        id: vendorId, 
        name: vendorName,
        proposal: proposal
      });
      setShowVendorProfile(true);
    };

    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">
              Submitted Proposals ({proposals.length})
            </h3>
            {proposals.length > 0 && (
              <div className="text-sm text-gray-500">
                Select a vendor to proceed with your project
              </div>
            )}
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
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                      Select Vendor
                    </button>
                  </div>

                  {/* Proposal Summary */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-sm text-gray-500 mb-1">Total Bid Amount</p>
                      <p className="font-semibold text-gray-900">
                        {formatCurrency(proposal.totalAmount)}
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
                        {proposal.boqData?.length || 0} items
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

                  {/* BOQ Summary */}
                  {proposal.boqData && proposal.boqData.length > 0 && (
                    <div className="border-t border-gray-200 pt-4">
                      <h5 className="text-sm font-medium text-gray-900 mb-3">BOQ Summary (Top 3 Items):</h5>
                      <div className="space-y-2">
                        {proposal.boqData.slice(0, 3).map((item, itemIndex) => (
                          <div key={itemIndex} className="flex justify-between items-center text-sm">
                            <span className="text-gray-700">{item.description || item.item}</span>
                            <span className="font-medium text-gray-900">
                              {formatCurrency(item.total || (item.volume * item.unitPrice))}
                            </span>
                          </div>
                        ))}
                        {proposal.boqData.length > 3 && (
                          <div className="text-sm text-gray-500 text-center pt-2">
                            +{proposal.boqData.length - 3} more items
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
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
              <h2 className="text-2xl font-bold text-gray-900">{selectedVendor.name}</h2>
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
                    <p className="text-sm text-gray-500">Specialization</p>
                    <p className="font-medium text-gray-900">Construction & Design</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Contact Information</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium text-gray-900">contact@{selectedVendor.name?.toLowerCase().replace(/\s+/g, '')}.com</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Phone</p>
                    <p className="font-medium text-gray-900">+62 xxx-xxxx-xxxx</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Location</p>
                    <p className="font-medium text-gray-900">Jakarta, Indonesia</p>
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
                      {new Intl.NumberFormat('id-ID', {
                        style: 'currency',
                        currency: 'IDR',
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0,
                      }).format(selectedVendor.proposal.totalAmount || 0)}
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

            {/* Portfolio Section - Placeholder */}
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Portfolio</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Placeholder portfolio items */}
                {[1, 2, 3].map((item) => (
                  <div key={item} className="border border-gray-200 rounded-lg overflow-hidden">
                    <div className="h-48 bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-500">Portfolio Image {item}</span>
                    </div>
                    <div className="p-4">
                      <h4 className="font-medium text-gray-900 mb-2">Project {item}</h4>
                      <p className="text-sm text-gray-600">
                        Sample project description showcasing the vendor's work quality and expertise.
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="border-t border-gray-200 pt-6 flex gap-4">
              <button
                onClick={() => {
                  console.log('Select vendor:', selectedVendor.name);
                  // Add vendor selection logic here
                }}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Select This Vendor
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
    switch (activeTab) {
      case 'overview':
        return renderOverviewTab();
      case 'boq':
        return renderBOQTab();
      case 'proposals':
        return renderProposalsTab();
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

      {/* Tab Navigation */}
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

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderTabContent()}
      </div>

      {/* Vendor Portfolio Modal */}
      {selectedVendor && (
        <VendorPortfolioModal
          isOpen={portfolioModalOpen}
          onClose={() => {
            setPortfolioModalOpen(false);
            setSelectedVendor(null);
          }}
          vendorId={selectedVendor.id}
          vendorName={selectedVendor.name}
        />
      )}
    </div>
  );
};

export default ProjectOwnerDetailPage;
