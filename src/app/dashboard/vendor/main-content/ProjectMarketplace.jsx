import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../../contexts/AuthContext';
import { db } from '../../../../lib/firebase';
import { collection, getDocs, query, where, getDoc, doc } from 'firebase/firestore';
import { FiMapPin } from 'react-icons/fi';
import ProjectDetailPage from '../components/ProjectDetailPage';
import VendorProposalModal from '../components/VendorProposalModal';
import CreateProposalPage from '../components/CreateProposalPage';
import Toast from '../components/Toast';

const ProjectMarketplace = () => {
  const { user } = useAuth();
  const router = useRouter();

  const [selectedProjectTypes, setSelectedProjectTypes] = useState([]);
  const [selectedScopes, setSelectedScopes] = useState([]);
  const [selectedPropertyTypes, setSelectedPropertyTypes] = useState([]);
  const [showProjectTypeFilter, setShowProjectTypeFilter] = useState(false);
  const [showScopeFilter, setShowScopeFilter] = useState(false);
  const [showPropertyFilter, setShowPropertyFilter] = useState(false);
  const [sortBy, setSortBy] = useState('Paling Relevan');
  const [showSortFilter, setShowSortFilter] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [bookmarkedProjects, setBookmarkedProjects] = useState([]);
  const [marketData, setMarketData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const projectTypeFilterRef = useRef(null);
  const scopeFilterRef = useRef(null);
  const propertyFilterRef = useRef(null);
  const sortFilterRef = useRef(null);
  const [showDetailsView, setShowDetailsView] = useState(false);
  const [showCreateProposal, setShowCreateProposal] = useState(false);
  
  // Modal states - keeping for proposal modal
  const [isProposalModalOpen, setIsProposalModalOpen] = useState(false);
  
  // Toast notification state
  const [toast, setToast] = useState({ isVisible: false, message: '', type: 'success' });

  // Helper functions for date calculation and formatting
  const calculateTenderDeadline = (createdAt, tenderDuration) => {
    if (!createdAt || !tenderDuration) {
      return null;
    }

    try {
      let startDate;
      
      if (createdAt?.toDate) {
        startDate = createdAt.toDate();
      } else if (typeof createdAt === 'string') {
        startDate = new Date(createdAt);
      } else if (createdAt instanceof Date) {
        startDate = createdAt;
      } else if (typeof createdAt === 'object' && createdAt.seconds) {
        startDate = new Date(createdAt.seconds * 1000);
      } else {
        return null;
      }

      if (!startDate || isNaN(startDate.getTime())) {
        return null;
      }

      const duration = tenderDuration.toLowerCase().trim();
      const deadline = new Date(startDate);

      if (duration.includes('bulan')) {
        const months = parseInt(duration.match(/(\d+)/)?.[1] || 1);
        deadline.setMonth(deadline.getMonth() + months);
      } else if (duration.includes('minggu')) {
        const weeks = parseInt(duration.match(/(\d+)/)?.[1] || 1);
        deadline.setDate(deadline.getDate() + (weeks * 7));
      } else if (duration.includes('hari')) {
        const days = parseInt(duration.match(/(\d+)/)?.[1] || 1);
        deadline.setDate(deadline.getDate() + days);
      } else {
        const numericValue = parseInt(duration.match(/(\d+)/)?.[1]);
        if (!isNaN(numericValue)) {
          deadline.setDate(deadline.getDate() + numericValue);
        } else {
          deadline.setDate(deadline.getDate() + 30);
        }
      }
      
      if (isNaN(deadline.getTime())) {
        return null;
      }
      
      return deadline;
    } catch (error) {
      console.error('Error calculating tender deadline:', error);
      return null;
    }
  };

  const calculateBidCountdown = (deadline) => {
    if (!deadline) return 'No deadline set';
    
    try {
      let deadlineDate;
      
      if (deadline instanceof Date) {
        deadlineDate = deadline;
      } else if (deadline?.toDate) {
        deadlineDate = deadline.toDate();
      } else if (typeof deadline === 'string') {
        deadlineDate = new Date(deadline);
      } else if (typeof deadline === 'object' && deadline.seconds) {
        deadlineDate = new Date(deadline.seconds * 1000);
      } else {
        return 'Invalid deadline format';
      }

      if (!deadlineDate || isNaN(deadlineDate.getTime())) {
        return 'Invalid deadline date';
      }

      const now = new Date();
      const diffTime = deadlineDate.getTime() - now.getTime();
      
      if (diffTime <= 0) {
        return 'Deadline passed';
      }

      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      const diffHours = Math.floor((diffTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const diffMinutes = Math.floor((diffTime % (1000 * 60 * 60)) / (1000 * 60));
      
      if (diffDays > 30) {
        const months = Math.floor(diffDays / 30);
        const remainingDays = diffDays % 30;
        return `${months} bulan${remainingDays > 0 ? ` ${remainingDays} hari` : ''}`;
      } else if (diffDays > 7) {
        const weeks = Math.floor(diffDays / 7);
        const remainingDays = diffDays % 7;
        return `${weeks} minggu${remainingDays > 0 ? ` ${remainingDays} hari` : ''}`;
      } else if (diffDays > 0) {
        return `${diffDays} hari ${diffHours} jam`;
      } else if (diffHours > 0) {
        return `${diffHours} jam ${diffMinutes} menit`;
      } else {
        return `${diffMinutes} menit`;
      }
    } catch (error) {
      console.error('Error calculating countdown:', error);
      return 'Error calculating deadline';
    }
  };

  const formatBudget = (budget) => {
    if (!budget) return 'Budget not specified';
    
    if (typeof budget === 'string' && budget.includes('Rp')) {
      return budget;
    }
    
    let numBudget;
    if (typeof budget === 'string') {
      numBudget = parseInt(budget.replace(/[^\d]/g, ''));
    } else {
      numBudget = budget;
    }
    
    if (isNaN(numBudget) || numBudget === 0) {
      return 'Budget not specified';
    }
    
    if (numBudget >= 1000000000) {
      return `Rp ${(numBudget / 1000000000).toFixed(1)}B`;
    } else if (numBudget >= 1000000) {
      return `Rp ${(numBudget / 1000000).toFixed(1)}M`;
    } else {
      return `Rp ${numBudget.toLocaleString('id-ID')}`;
    }
  };

  const formatDuration = (duration) => {
    if (!duration) return 'Duration not specified';
    
    if (typeof duration === 'string' && (duration.includes('bulan') || duration.includes('minggu') || duration.includes('hari'))) {
      return duration;
    }
    
    if (typeof duration === 'number') {
      if (duration >= 30) {
        const months = Math.floor(duration / 30);
        const remainingDays = duration % 30;
        return `${months} bulan${remainingDays > 0 ? ` ${remainingDays} hari` : ''}`;
      } else if (duration >= 7) {
        const weeks = Math.floor(duration / 7);
        const remainingDays = duration % 7;
        return `${weeks} minggu${remainingDays > 0 ? ` ${remainingDays} hari` : ''}`;
      } else {
        return `${duration} hari`;
      }
    }
    
    return duration.toString();
  };

  // Get company name from user profile
  const getCompanyName = async (ownerId) => {
    if (!ownerId) return 'Unknown Company';
    
    try {
      const userDoc = await getDoc(doc(db, 'users', ownerId));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        
        // Try multiple fields for company name
        const companyName = userData.companyName || 
                           userData.company || 
                           userData.businessName ||
                           userData.organizationName ||
                           userData.displayName || 
                           userData.firstName && userData.lastName ? `${userData.firstName} ${userData.lastName}` :
                           userData.email?.split('@')[0] || 
                           'Unknown Company';
        
        console.log(`Fetched company name for ${ownerId}:`, companyName);
        return companyName;
      } else {
        console.warn(`User document not found for ownerId: ${ownerId}`);
        return 'Unknown Company';
      }
    } catch (error) {
      console.error('Error fetching company name for', ownerId, ':', error);
      return 'Unknown Company';
    }
  };

  // Function to load tender projects - extracted so it can be called from multiple places
  const loadTenderProjects = async () => {
    if (!user) {
      console.log('No user found, skipping tender projects load');
      setLoading(false);
      return;
    }

    console.log('Loading tender projects for user:', user.uid);
    setLoading(true);
    setError(null);

    try {
      // Import Firestore functions
      const { getDocs } = await import('firebase/firestore');
      
      // Simple query to get all projects first
      const projectsQuery = query(collection(db, 'projects'));
      console.log('Executing query for all projects...');
      
      const snapshot = await getDocs(projectsQuery);
      console.log('Query successful! Retrieved', snapshot.size, 'documents');
      
      const projects = [];
      const companyPromises = []; // To fetch company names in parallel
      
      snapshot.forEach((doc) => {
        const data = doc.data();
        console.log('Processing project:', doc.id, {
          procurementMethod: data.procurementMethod,
          status: data.status,
          title: data.title || data.projectTitle,
          tenderDuration: data.tenderDuration,
          createdAt: data.createdAt
        });
        
        // Filter for tender projects that are available for bidding AND approved for public display
        if (data.procurementMethod === 'Tender' && 
            data.status !== 'awarded' && 
            data.isAvailableForBidding !== false &&
            !data.selectedVendorId &&
            data.isPublished === true &&
            data.moderationStatus === 'approved') {
          console.log('Found tender project:', doc.id, data.status);
          
          // Calculate tender deadline from createdAt + tenderDuration
          const calculatedDeadline = calculateTenderDeadline(data.createdAt, data.tenderDuration);
          console.log(`Deadline calculation for ${doc.id}:`, {
            createdAt: data.createdAt,
            tenderDuration: data.tenderDuration,
            calculatedDeadline,
            fallbackDeadline: data.tenderDeadline || data.deadline
          });
          
          // Use calculated deadline or fallback to stored deadlines
          const finalDeadline = calculatedDeadline || data.tenderDeadline || data.deadline;
          const bidCountdownText = calculateBidCountdown(finalDeadline);
          
          console.log(`Final deadline for ${doc.id}:`, {
            finalDeadline,
            bidCountdownText
          });
          
          const project = {
            id: doc.id,
            projectTitle: data.title || data.projectTitle || 'Untitled Project',
            location: data.city && data.province ? `${data.city}, ${data.province}` : data.location || data.city || 'Location not specified',
            scope: data.projectScope || data.scope || data.scopes || (data.category ? [data.category] : ['General']),
            projectType: data.projectType || data.category || 'General',
            propertyType: data.propertyType || 'Commercial',
            budget: formatBudget(data.estimatedBudget || data.marketplace?.budget || data.budget || 0),
            duration: formatDuration(data.estimatedDuration || data.duration || 'Not specified'),
            bidCountdown: bidCountdownText,
            tenderDeadline: finalDeadline,
            deadline: finalDeadline,
            description: data.specialNotes || data.description || 'No description available',
            client: data.ownerName || data.client || data.ownerEmail?.split('@')[0] || 'Client not specified',
            estimatedStartDate: data.estimatedStartDate || data.startDate,
            status: data.status || data.moderationStatus,
            ownerId: data.ownerId,
            tenderDuration: data.tenderDuration || '1 bulan',
            proposals: 0, // This would need to be calculated from actual proposals
            // Keep original data for debugging
            originalData: data,
            ...data
          };
          
          projects.push(project);
          
          // Add promise to fetch company name
          if (data.ownerId) {
            companyPromises.push(
              getCompanyName(data.ownerId).then(companyName => {
                project.client = companyName;
                return project;
              })
            );
          }
        }
      });

      // Wait for all company names to be fetched
      if (companyPromises.length > 0) {
        await Promise.all(companyPromises);
      }

      console.log('Processed tender projects:', projects);
      console.log('Sample project data structure:', projects[0]);
      setMarketData(projects);
      setLoading(false);
      
    } catch (error) {
      console.error('Error loading tender projects:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      
      let errorMessage = 'Failed to load tender projects. Please try again.';
      if (error.code === 'permission-denied') {
        errorMessage = 'Permission denied. Please check your authentication and try again.';
      } else if (error.code === 'unavailable') {
        errorMessage = 'Service temporarily unavailable. Please try again later.';
      } else if (error.message) {
        errorMessage = `Failed to load tender projects: ${error.message}`;
      }
      
      setError(errorMessage);
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTenderProjects();
  }, [user]);

  // Get unique filter options from real data
  const allProjectTypes = [...new Set(marketData.map(item => item.projectType))];
  const allScopes = [...new Set(marketData.flatMap(item => {
    if (Array.isArray(item.scope)) return item.scope;
    return item.scope ? [item.scope] : [];
  }))];
  const allPropertyTypes = [...new Set(marketData.map(item => item.propertyType))];
  const sortOptions = [
    'Paling Relevan',
    'Budget Tertinggi', 
    'Budget Terendah',
    'Kompetisi Terendah',
    'Deadline Terlama',
    'Deadline Tercepat'
  ];

  // Filter data based on selected filters
  const filteredData = marketData.filter(item => {
    const projectTypeMatch = selectedProjectTypes.length === 0 || selectedProjectTypes.includes(item.projectType);
    const scopeMatch = selectedScopes.length === 0 || selectedScopes.some(scope => {
      if (Array.isArray(item.scope)) {
        return item.scope.includes(scope);
      }
      return item.scope === scope;
    });
    const propertyMatch = selectedPropertyTypes.length === 0 || selectedPropertyTypes.includes(item.propertyType);
    
    return projectTypeMatch && scopeMatch && propertyMatch;
  });

  // Sort filtered data
  const sortedData = [...filteredData].sort((a, b) => {
    switch (sortBy) {
      case 'Budget Tertinggi':
        const budgetA = extractBudgetNumber(a.budget);
        const budgetB = extractBudgetNumber(b.budget);
        return budgetB - budgetA;
      
      case 'Budget Terendah':
        const budgetAsc = extractBudgetNumber(a.budget);
        const budgetBsc = extractBudgetNumber(b.budget);
        return budgetAsc - budgetBsc;
      
      case 'Kompetisi Terendah':
        // Sort by creation date (newer projects might have fewer bids)
        return new Date(b.createdAt?.toDate?.() || b.createdAt || 0) - new Date(a.createdAt?.toDate?.() || a.createdAt || 0);
      
      case 'Deadline Terlama':
        const hoursA = getHoursFromCountdown(a.bidCountdown);
        const hoursB = getHoursFromCountdown(b.bidCountdown);
        return hoursB - hoursA;
      
      case 'Deadline Tercepat':
        const hoursAsc = getHoursFromCountdown(a.bidCountdown);
        const hoursBsc = getHoursFromCountdown(b.bidCountdown);
        return hoursAsc - hoursBsc;
      
      default: // Paling Relevan
        return 0; // Keep original order
    }
  });

  // Helper function to extract budget number for sorting
  const extractBudgetNumber = (budget) => {
    if (!budget || budget === 'Budget not specified') return 0;
    
    if (typeof budget === 'number') return budget;
    
    if (typeof budget === 'string') {
      // Remove all non-digit characters and convert to number
      const numbers = budget.replace(/[^\d]/g, '');
      const num = parseInt(numbers) || 0;
      
      // Handle abbreviated formats (M for million, B for billion)
      if (budget.includes('M')) {
        return num * 1000000;
      } else if (budget.includes('B')) {
        return num * 1000000000;
      }
      
      return num;
    }
    
    return 0;
  };

  // Helper function to convert countdown to hours
  const getHoursFromCountdown = (countdown) => {
    let totalHours = 0;
    
    if (countdown.includes('minggu')) {
      const weeks = parseInt(countdown.match(/(\d+)\s*minggu/)?.[1] || 0);
      totalHours += weeks * 7 * 24;
    }
    if (countdown.includes('hari')) {
      const days = parseInt(countdown.match(/(\d+)\s*hari/)?.[1] || 0);
      totalHours += days * 24;
    }
    if (countdown.includes('jam')) {
      const hours = parseInt(countdown.match(/(\d+)\s*jam/)?.[1] || 0);
      totalHours += hours;
    }
    
    return totalHours;
  };

  const handleRetry = () => {
    setError(null);
    setLoading(true);
    setMarketData([]); // Clear existing data
    // Trigger re-load by changing a dependency
    window.location.reload();
  };

  const handleProjectTypeFilter = (projectType) => {
    setSelectedProjectTypes(prev => 
      prev.includes(projectType) 
        ? prev.filter(type => type !== projectType)
        : [...prev, projectType]
    );
    // Auto-close filter after selection
    setTimeout(() => setShowProjectTypeFilter(false), 100);
  };

  const handleScopeFilter = (scope) => {
    setSelectedScopes(prev => 
      prev.includes(scope) 
        ? prev.filter(s => s !== scope)
        : [...prev, scope]
    );
    // Auto-close filter after selection
    setTimeout(() => setShowScopeFilter(false), 100);
  };

  const handlePropertyFilter = (propertyType) => {
    setSelectedPropertyTypes(prev => 
      prev.includes(propertyType) 
        ? prev.filter(type => type !== propertyType)
        : [...prev, propertyType]
    );
    // Auto-close filter after selection
    setTimeout(() => setShowPropertyFilter(false), 100);
  };

  const handleSortChange = (sortOption) => {
    setSortBy(sortOption);
    setShowSortFilter(false);
  };

  const handleCreateOffer = (project) => {
    // Check if vendor has already submitted a proposal
    if (hasVendorSubmittedProposal(project) && !canEditProposal(project)) {
      alert('You have already submitted a proposal for this project and editing is disabled because the deadline is less than 24 hours away.');
      return;
    }
    
    setSelectedProject(project);
    setShowCreateProposal(true);
  };

  const handleEditProposal = (project) => {
    setSelectedProject(project);
    setShowCreateProposal(true);
  };

  const handleViewDetails = (project) => {
    setSelectedProject(project);
    setShowDetailsView(true);
  };
  
  const handleBackToList = () => {
    setShowDetailsView(false);
    setShowCreateProposal(false);
    setSelectedProject(null);
    
    // Refresh the projects data to get the latest information
    console.log('Refreshing projects data after proposal submission/edit');
    loadTenderProjects();
  };

  const closeModals = () => {
    setIsProposalModalOpen(false);
    setSelectedProject(null);
  };

  const toggleBookmark = (projectId) => {
    setBookmarkedProjects(prev => 
      prev.includes(projectId) 
        ? prev.filter(id => id !== projectId)
        : [...prev, projectId]
    );
  };

  // Close filter dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (projectTypeFilterRef.current && !projectTypeFilterRef.current.contains(event.target)) {
        setShowProjectTypeFilter(false);
      }
      if (scopeFilterRef.current && !scopeFilterRef.current.contains(event.target)) {
        setShowScopeFilter(false);
      }
      if (propertyFilterRef.current && !propertyFilterRef.current.contains(event.target)) {
        setShowPropertyFilter(false);
      }
      if (sortFilterRef.current && !sortFilterRef.current.contains(event.target)) {
        setShowSortFilter(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getBidCountdownColor = (countdown) => {
    // All countdown badges now use blue accent for consistency
    return "text-white";
  };

  useEffect(() => {
    // This effect was used for old filtering, now handled differently
  }, [marketData]);

  // Modal handlers
  const handleViewProject = (project) => {
    setSelectedProject(project);
    setShowDetailsView(true);
  };

  const handleCreateProposal = (project) => {
    setSelectedProject(project);
    setIsProposalModalOpen(true);
  };

  const closeToast = () => {
    setToast({ ...toast, isVisible: false });
  };

  // Helper function to check if current vendor has already submitted a proposal
  const hasVendorSubmittedProposal = (project) => {
    if (!user || !project.proposals) return false;
    return project.proposals.some(proposal => proposal.vendorId === user.uid);
  };

  // Helper function to get vendor's proposal
  const getVendorProposal = (project) => {
    if (!user || !project.proposals) return null;
    return project.proposals.find(proposal => proposal.vendorId === user.uid);
  };

  // Helper function to check if proposal can be edited (deadline must be more than 24 hours away)
  const canEditProposal = (project) => {
    if (!project.deadline && !project.tenderDeadline) return false;
    
    const now = new Date();
    let deadline;
    
    // Use the deadline from the project
    if (project.deadline) {
      if (project.deadline instanceof Date) {
        deadline = project.deadline;
      } else if (project.deadline?.toDate) {
        deadline = project.deadline.toDate();
      } else if (typeof project.deadline === 'string') {
        deadline = new Date(project.deadline);
      } else if (typeof project.deadline === 'object' && project.deadline.seconds) {
        deadline = new Date(project.deadline.seconds * 1000);
      }
    } else if (project.tenderDeadline) {
      if (project.tenderDeadline instanceof Date) {
        deadline = project.tenderDeadline;
      } else if (project.tenderDeadline?.toDate) {
        deadline = project.tenderDeadline.toDate();
      } else if (typeof project.tenderDeadline === 'string') {
        deadline = new Date(project.tenderDeadline);
      } else if (typeof project.tenderDeadline === 'object' && project.tenderDeadline.seconds) {
        deadline = new Date(project.tenderDeadline.seconds * 1000);
      }
    }
    
    if (!deadline || isNaN(deadline.getTime())) return false;
    
    // Calculate time difference in milliseconds
    const timeDifference = deadline.getTime() - now.getTime();
    const hoursUntilDeadline = timeDifference / (1000 * 60 * 60);
    
    // Allow editing only if deadline is more than 24 hours away
    return hoursUntilDeadline > 24;
  };

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Tender Title */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Tender</h1>
        <p className="text-gray-600 mt-2">Discover projects open for tender and bidding</p>
      </div>
      {/* Error State */}
      {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
            <div className="flex">
              <svg className="w-5 h-5 text-red-400 dark:text-red-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <div className="ml-3 flex-1">
                <h3 className="text-sm font-medium text-red-800 dark:text-red-200">Error loading tender projects</h3>
                <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                  <p>{error}</p>
                </div>
                <div className="mt-3">
                  <button
                    onClick={handleRetry}
                    className="bg-red-100 hover:bg-red-200 dark:bg-red-800 dark:hover:bg-red-700 text-red-800 dark:text-red-200 px-3 py-1 rounded text-sm font-medium transition-colors mr-2"
                  >
                    Try Again
                  </button>
                  <button
                    onClick={() => window.location.reload()}
                    className="bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 px-3 py-1 rounded text-sm font-medium transition-colors"
                  >
                    Refresh Page
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="fixed inset-0 bg-white flex flex-col items-center justify-center z-50">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-tender-blue mb-6"></div>
            <p className="text-gray-600 text-lg">Loading tender projects...</p>
          </div>
        ) : showCreateProposal && selectedProject ? (
          <CreateProposalPage
            project={selectedProject}
            existingProposal={getVendorProposal(selectedProject)}
            isEditing={hasVendorSubmittedProposal(selectedProject)}
            onBack={handleBackToList}
          />
        ) : showDetailsView && selectedProject ? (
          <ProjectDetailPage
            project={selectedProject}
            onBack={handleBackToList}
            onCreateProposal={handleCreateProposal}
          />
        ) : (
          <>
            {/* Filters */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
              <div className="flex items-center gap-2 flex-wrap">
            {/* Jenis Proyek Filter */}
            <div className="relative min-w-[160px] flex-1" ref={projectTypeFilterRef}>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Jenis Proyek
              </label>
              <button
                onClick={() => setShowProjectTypeFilter(!showProjectTypeFilter)}
                className="w-full flex items-center justify-between gap-1 px-2 py-1.5 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors text-left text-sm"
              >
                <div className="flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  <span className="text-xs font-medium text-gray-900">
                    {selectedProjectTypes.length > 0 
                      ? `${selectedProjectTypes.length} dipilih` 
                      : 'Semua'
                    }
                  </span>
                </div>
                <svg className={`w-3.5 h-3.5 transition-transform ${showProjectTypeFilter ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Project Type Filter Dropdown */}
              {showProjectTypeFilter && (
                <div className="absolute top-full left-0 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg z-10">
                  <div className="p-3">
                    <h3 className="text-xs font-semibold text-gray-900 mb-2">Pilih Jenis Proyek</h3>
                    <div className="space-y-1.5 max-h-40 overflow-y-auto">
                      {allProjectTypes.map(type => (
                        <label key={type} className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selectedProjectTypes.includes(type)}
                            onChange={() => handleProjectTypeFilter(type)}
                            className="w-3.5 h-3.5 border-slate-300 rounded focus:ring-2"
                            style={{ 
                              accentColor: '#2373FF',
                              '&:focus': { 
                                boxShadow: `0 0 0 2px rgba(35, 115, 255, 0.2)` 
                              }
                            }}
                          />
                          <span className="text-xs text-gray-700">{type}</span>
                        </label>
                      ))}
                    </div>
                    {selectedProjectTypes.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-slate-200 dark:border-slate-600">
                        <button
                          onClick={() => setSelectedProjectTypes([])}
                          className="text-xs hover:underline"
                          style={{ color: '#2373FF' }}
                        >
                          Clear All
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Ruang Lingkup Filter */}
            <div className="relative min-w-[160px] flex-1" ref={scopeFilterRef}>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Ruang Lingkup
              </label>
              <button
                onClick={() => setShowScopeFilter(!showScopeFilter)}
                className="w-full flex items-center justify-between gap-1 px-2 py-1.5 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors text-left text-sm"
              >
                <div className="flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                  <span className="text-xs font-medium text-gray-900">
                    {selectedScopes.length > 0 
                      ? `${selectedScopes.length} dipilih` 
                      : 'Semua'
                    }
                  </span>
                </div>
                <svg className={`w-3.5 h-3.5 transition-transform ${showScopeFilter ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {showScopeFilter && (
                <div className="absolute top-full left-0 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg z-10">
                  <div className="p-3">
                    <h3 className="text-xs font-semibold text-gray-900 mb-2">Pilih Ruang Lingkup</h3>
                    <div className="space-y-1.5 max-h-40 overflow-y-auto">
                      {allScopes.map(scope => (
                        <label key={scope} className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selectedScopes.includes(scope)}
                            onChange={() => handleScopeFilter(scope)}
                            className="w-3.5 h-3.5 border-gray-300 rounded focus:ring-2"
                            style={{ 
                              accentColor: '#2373FF',
                              '&:focus': { 
                                boxShadow: `0 0 0 2px rgba(35, 115, 255, 0.2)` 
                              }
                            }}
                          />
                          <span className="text-xs text-gray-700">{scope}</span>
                        </label>
                      ))}
                    </div>
                    {selectedScopes.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-gray-200">
                        <button
                          onClick={() => setSelectedScopes([])}
                          className="text-xs hover:underline"
                          style={{ color: '#2373FF' }}
                        >
                          Clear All
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="relative min-w-[160px] flex-1" ref={propertyFilterRef}>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Property
              </label>
              <button
                onClick={() => setShowPropertyFilter(!showPropertyFilter)}
                className="w-full flex items-center justify-between gap-1 px-2 py-1.5 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors text-left text-sm"
              >
                <div className="flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 21l8-12" />
                  </svg>
                  <span className="text-xs font-medium text-gray-900">
                    {selectedPropertyTypes.length > 0 
                      ? `${selectedPropertyTypes.length} dipilih` 
                      : 'Semua'
                    }
                  </span>
                </div>
                <svg className={`w-3.5 h-3.5 transition-transform ${showPropertyFilter ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {showPropertyFilter && (
                <div className="absolute top-full left-0 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg z-10">
                  <div className="p-3">
                    <h3 className="text-xs font-semibold text-gray-900 mb-2">Pilih Property</h3>
                    <div className="space-y-1.5 max-h-40 overflow-y-auto">
                      {allPropertyTypes.map(property => (
                        <label key={property} className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selectedPropertyTypes.includes(property)}
                            onChange={() => handlePropertyFilter(property)}
                            className="w-3.5 h-3.5 border-gray-300 rounded focus:ring-2"
                            style={{ 
                              accentColor: '#2373FF',
                              '&:focus': { 
                                boxShadow: `0 0 0 2px rgba(35, 115, 255, 0.2)` 
                              }
                            }}
                          />
                          <span className="text-xs text-gray-700">{property}</span>
                        </label>
                      ))}
                    </div>
                    {selectedPropertyTypes.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-gray-200">
                        <button
                          onClick={() => setSelectedPropertyTypes([])}
                          className="text-xs hover:underline"
                          style={{ color: '#2373FF' }}
                        >
                          Clear All
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="relative min-w-[160px] flex-1" ref={sortFilterRef}>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Sort By
              </label>
              <button
                onClick={() => setShowSortFilter(!showSortFilter)}
                className="w-full flex items-center justify-between gap-1 px-2 py-1.5 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors text-left text-sm"
              >
                <div className="flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
                  </svg>
                  <span className="text-xs font-medium text-gray-900 truncate">
                    {sortBy}
                  </span>
                </div>
                <svg className={`w-3.5 h-3.5 transition-transform ${showSortFilter ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {showSortFilter && (
                <div className="absolute top-full left-0 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg z-10">
                  <div className="p-3">
                    <h3 className="text-xs font-semibold text-gray-900 mb-2">Pilih Urutan</h3>
                    <div className="space-y-1.5 max-h-40 overflow-y-auto">
                      {sortOptions.map(option => (
                        <button
                          key={option}
                          onClick={() => handleSortChange(option)}
                          className={`w-full text-left px-2 py-1.5 text-xs rounded hover:bg-gray-100 transition-colors ${
                            sortBy === option 
                              ? 'text-white' 
                              : 'text-gray-700'
                          }`}
                          style={sortBy === option ? { backgroundColor: '#2373FF' } : {}}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {sortedData.length === 0 ? (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-slate-400 dark:text-slate-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">No tender projects found</h3>
            <p className="text-slate-500 dark:text-slate-400">
              {marketData.length === 0 
                ? "There are no projects currently open for tender."
                : "No projects match your current filter criteria. Try adjusting your filters."
              }
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {sortedData.map((project) => (
              <div
                key={project.id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-200 hover:-translate-y-1"
              >
                <div className="p-6">
                  {/* Project ID */}
                  <div className="mb-3">
                    <p className="text-xs text-gray-500 mb-1">Project ID</p>
                    <p className="text-sm font-mono text-gray-800 font-medium">
                      {project.customId || `#${project.id}`}
                    </p>
                  </div>

                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span
                          className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                            project.projectType === "Desain"
                              ? "bg-purple-100 text-purple-800"
                              : project.projectType === "Bangun"
                              ? "bg-orange-100 text-orange-800"
                              : project.projectType === "Renovasi"
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {project.projectType}
                        </span>
                        <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-700">
                          {project.propertyType}
                        </span>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-2 h-14 flex items-start">
                        <span className="leading-tight">
                          {project.projectTitle}
                        </span>
                      </h3>
                      <p className="text-sm text-gray-600 flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {project.location}
                      </p>
                    </div>
                    <div className="text-right ml-4">
                      <button
                        onClick={() => toggleBookmark(project.id)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors mb-2"
                        title={bookmarkedProjects.includes(project.id) ? "Remove bookmark" : "Add bookmark"}
                      >
                        <svg 
                          className={`w-5 h-5 ${
                            bookmarkedProjects.includes(project.id) 
                              ? "text-yellow-500 fill-yellow-500" 
                              : "text-slate-400 hover:text-yellow-500"
                          }`} 
                          fill={bookmarkedProjects.includes(project.id) ? "currentColor" : "none"} 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* Scope */}
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Ruang Lingkup</h4>
                    <div className="flex flex-wrap gap-1">
                      {(Array.isArray(project.scope) ? project.scope : 
                        project.scope ? [project.scope] : ['General']
                      ).filter(Boolean).slice(0, 3).map((scopeItem, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 text-xs text-white rounded"
                          style={{ backgroundColor: '#2373FF' }}
                        >
                          {scopeItem}
                        </span>
                      ))}
                      {(Array.isArray(project.scope) ? project.scope : 
                        project.scope ? [project.scope] : []
                      ).length > 3 && (
                        <span className="px-2 py-1 text-xs text-gray-500 bg-gray-100 rounded">
                          +{(Array.isArray(project.scope) ? project.scope : [project.scope]).length - 3} more
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-gray-500">Budget</p>
                      <p className="text-sm font-semibold text-gray-900">{project.budget}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Duration</p>
                      <p className="text-sm font-semibold text-gray-900">{project.duration}</p>
                    </div>
                  </div>

                  {/* Client Info */}
                  <div className="mb-4">
                    <p className="text-xs text-gray-500">Client</p>
                    <p className="text-sm font-semibold text-gray-900">{project.client}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div>
                      <p className="text-xs text-gray-500">Deadline</p>
                      <span 
                        className="px-2.5 py-1 text-xs font-medium rounded-full text-white"
                        style={{ backgroundColor: '#2373FF' }}
                      >
                        {project.bidCountdown}
                      </span>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Proposals</p>
                      <p className="text-sm font-semibold text-gray-900">{project.proposals?.length || 0} submitted</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex space-x-3">
                    {hasVendorSubmittedProposal(project) ? (
                      canEditProposal(project) ? (
                        <div className="flex-1">
                          <button 
                            onClick={() => handleEditProposal(project)}
                            className="w-full px-4 py-2 text-white text-sm font-medium rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 bg-amber-600 hover:bg-amber-700"
                          >
                            <div className="flex items-center justify-center gap-2">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                              Edit Proposal
                            </div>
                          </button>
                        </div>
                      ) : (
                        <button 
                          disabled
                          className="flex-1 px-4 py-2 text-gray-500 text-sm font-medium rounded-lg bg-gray-100 border border-gray-300 cursor-not-allowed flex items-center justify-center gap-2"
                          title="Proposal submitted (editing disabled - deadline is less than 24 hours away)"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Proposal Submitted
                        </button>
                      )
                    ) : (
                      <button 
                        onClick={() => handleCreateOffer(project)}
                        className="flex-1 px-4 py-2 text-white text-sm font-medium rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                        style={{ backgroundColor: '#2373FF' }}
                        onMouseEnter={(e) => e.target.style.backgroundColor = '#1d63ed'}
                        onMouseLeave={(e) => e.target.style.backgroundColor = '#2373FF'}
                      >
                        Buat Penawaran
                      </button>
                    )}
                    <button 
                      onClick={() => handleViewDetails(project)}
                      className="px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        </>
        )}

      {/* Modals */}
      <VendorProposalModal
        project={selectedProject}
        isOpen={isProposalModalOpen}
        onClose={closeModals}
        onSubmitSuccess={() => {
          setToast({
            isVisible: true,
            message: 'Proposal submitted successfully! You can track its progress in the Proposals section.',
            type: 'success'
          });
          closeModals();
        }}
      />

      {/* Toast Notification */}
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={closeToast}
      />
    </main>
  );
};

export default ProjectMarketplace;
