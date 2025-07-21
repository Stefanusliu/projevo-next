import { useState, useEffect } from 'react';

export function useVendorDashboard() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Vendor profile data
  const [vendorProfile, setVendorProfile] = useState({
    name: 'Alex Smith',
    company: 'Smith Construction & Design',
    email: 'alex.smith@email.com',
    phone: '+62 812-3456-7890',
    specialization: 'Commercial Construction',
    experience: '8 years',
    location: 'Jakarta Selatan',
    rating: 4.8,
    completedProjects: 42,
    verified: true
  });

  // Dashboard stats
  const [dashboardStats, setDashboardStats] = useState({
    activeBids: 8,
    wonProjects: 34,
    pendingReviews: 12,
    totalEarnings: 'Rp 45,280,000,000',
    successRate: 85,
    responseTime: '< 2 hours'
  });

  // Available projects for marketplace
  const [availableProjects, setAvailableProjects] = useState([]);
  
  // Vendor's projects
  const [myProjects, setMyProjects] = useState([]);
  
  // Vendor's proposals
  const [myProposals, setMyProposals] = useState([]);
  
  // Earnings data
  const [earningsData, setEarningsData] = useState({
    totalEarnings: 'Rp 485,750,000',
    pendingPayments: 'Rp 125,000,000',
    paidAmount: 'Rp 360,750,000',
    recentPayments: []
  });

  // Notifications
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: 'proposal_accepted',
      title: 'Proposal Accepted!',
      message: 'Your proposal for "Luxury Hotel Interior Design" has been accepted.',
      date: new Date().toISOString(),
      read: false
    },
    {
      id: 2,
      type: 'payment_received',
      title: 'Payment Received',
      message: 'Payment of Rp 240,000,000 has been received for Corporate Headquarters project.',
      date: new Date(Date.now() - 86400000).toISOString(),
      read: false
    },
    {
      id: 3,
      type: 'new_project',
      title: 'New Project Available',
      message: 'A new project matching your expertise is now available for bidding.',
      date: new Date(Date.now() - 172800000).toISOString(),
      read: true
    }
  ]);

  // Load initial data
  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // Simulate API calls
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update stats (simulated)
      setDashboardStats(prevStats => ({
        ...prevStats,
        activeBids: Math.floor(Math.random() * 10) + 5,
        pendingReviews: Math.floor(Math.random() * 15) + 8
      }));
      
      setError(null);
    } catch (err) {
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  // Submit a proposal for an existing project
  const submitProposal = async (proposalData) => {
    setLoading(true);
    setError(null);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const newProposal = {
        id: Date.now(),
        projectTitle: proposalData.projectTitle || 'New Project',
        client: proposalData.client || 'Unknown Client',
        status: 'Pending',
        submittedDate: new Date().toISOString().split('T')[0],
        budget: proposalData.budget || 'Rp 0',
        proposedBudget: proposalData.bidAmount ? `Rp ${parseFloat(proposalData.bidAmount).toLocaleString()}` : 'Rp 0',
        timeline: proposalData.timeline || 'TBD',
        category: proposalData.category || 'General',
        location: proposalData.location || 'Jakarta',
        competitorCount: Math.floor(Math.random() * 15) + 1,
        responseTime: '7 days remaining',
        description: proposalData.description || 'Project description not available',
        proposal: proposalData.coverLetter || 'Proposal content',
        attachments: proposalData.attachments || []
      };
      
      setMyProposals(prev => [newProposal, ...prev]);
      
      // Update dashboard stats
      setDashboardStats(prev => ({
        ...prev,
        activeBids: prev.activeBids + 1
      }));
      
      return { success: true, proposal: newProposal };
    } catch (err) {
      setError('Failed to submit proposal');
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Update project status
  const updateProjectStatus = async (projectId, newStatus, updateData = {}) => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setMyProjects(prev => prev.map(project => 
        project.id === projectId 
          ? { ...project, status: newStatus, ...updateData }
          : project
      ));
      
      // Add notification based on status
      if (newStatus === 'Completed') {
        addNotification({
          type: 'project_completed',
          title: 'Project Completed',
          message: 'Congratulations! Your project has been marked as completed.'
        });
      }
      
      return { success: true };
    } catch (err) {
      setError('Failed to update project status');
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Update vendor profile
  const updateProfile = async (profileData) => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setVendorProfile(prev => ({ ...prev, ...profileData }));
      
      addNotification({
        type: 'profile_updated',
        title: 'Profile Updated',
        message: 'Your profile has been updated successfully.'
      });
      
      return { success: true };
    } catch (err) {
      setError('Failed to update profile');
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Add notification
  const addNotification = (notification) => {
    const newNotification = {
      id: Date.now(),
      date: new Date().toISOString(),
      read: false,
      ...notification
    };
    
    setNotifications(prev => [newNotification, ...prev]);
  };

  // Mark notification as read
  const markNotificationAsRead = (notificationId) => {
    setNotifications(prev => prev.map(notification =>
      notification.id === notificationId
        ? { ...notification, read: true }
        : notification
    ));
  };

  // Mark all notifications as read
  const markAllNotificationsAsRead = () => {
    setNotifications(prev => prev.map(notification => ({
      ...notification,
      read: true
    })));
  };

  // Get unread notifications count
  const getUnreadNotificationsCount = () => {
    return notifications.filter(notification => !notification.read).length;
  };

  // Search and filter available projects in marketplace
  const searchProjects = async (query, filters = {}) => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Filter and search logic would integrate with backend
      // For now, return mock filtered data based on query and filters
      
      return { success: true, projects: availableProjects };
    } catch (err) {
      setError('Failed to search projects');
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Calculate vendor metrics
  const getVendorMetrics = () => {
    const completedProjects = myProjects.filter(p => p.status === 'Completed').length;
    const totalProjects = myProjects.length;
    const successRate = totalProjects > 0 ? Math.round((completedProjects / totalProjects) * 100) : 0;
    
    const acceptedProposals = myProposals.filter(p => p.status === 'Accepted').length;
    const totalProposals = myProposals.length;
    const proposalSuccessRate = totalProposals > 0 ? Math.round((acceptedProposals / totalProposals) * 100) : 0;
    
    return {
      completedProjects,
      totalProjects,
      successRate,
      acceptedProposals,
      totalProposals,
      proposalSuccessRate,
      averageRating: vendorProfile.rating,
      responseTime: dashboardStats.responseTime
    };
  };

  return {
    // State
    loading,
    error,
    vendorProfile,
    dashboardStats,
    availableProjects,
    myProjects,
    myProposals,
    earningsData,
    notifications,
    
    // Actions
    loadDashboardData,
    submitProposal,
    updateProjectStatus,
    updateProfile,
    addNotification,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    searchProjects,
    
    // Getters
    getUnreadNotificationsCount,
    getVendorMetrics,
    
    // Setters
    setVendorProfile,
    setDashboardStats,
    setAvailableProjects,
    setMyProjects,
    setMyProposals,
    setEarningsData,
    setError
  };
}
