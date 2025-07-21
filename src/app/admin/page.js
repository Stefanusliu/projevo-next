'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import DashboardLayout from './components/DashboardLayout';
import HomeComponent from './components/HomeComponent';
import ProjectReviewComponent from './components/ProjectReviewComponent';
import PaymentManagementComponent from './components/PaymentManagementComponent';
import UserManagementComponent from './components/UserManagementComponent';
import AnalyticsComponent from './components/AnalyticsComponent';
import SettingsComponent from './components/SettingsComponent';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('home');
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);
  const { user, userProfile, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const checkAdminAccess = async () => {
      console.log('🔍 Admin dashboard - checking access...');
      console.log('🔍 authLoading:', authLoading, 'user:', user?.uid, 'userProfile:', userProfile);
      
      if (authLoading) {
        console.log('⏳ Auth still loading...');
        return;
      }

      if (!user) {
        console.log('❌ No user found, redirecting to admin login...');
        router.push('/admin/login');
        return;
      }

      if (!userProfile) {
        console.log('⏳ User profile still loading...');
        return;
      }

      // Check if user has admin role
      const isAdmin = userProfile.role === 'admin' || userProfile.isAdmin === true;
      console.log('🔍 Admin check - role:', userProfile.role, 'isAdmin:', userProfile.isAdmin, 'result:', isAdmin);

      if (!isAdmin) {
        console.log('❌ User is not admin, redirecting to dashboard...');
        if (userProfile.userType === 'project-owner') {
          router.push('/dashboard/project-owner');
        } else if (userProfile.userType === 'vendor') {
          router.push('/dashboard/vendor');
        } else {
          router.push('/dashboard');
        }
        return;
      }

      console.log('✅ Admin access granted');
      setIsAuthorized(true);
      setLoading(false);
    };

    checkAdminAccess();
  }, [user, userProfile, authLoading, router]);

  const renderActiveComponent = () => {
    switch (activeTab) {
      case 'home':
        return <HomeComponent />;
      case 'project-review':
        return <ProjectReviewComponent />;
      case 'payment-management':
        return <PaymentManagementComponent />;
      case 'user-management':
        return <UserManagementComponent />;
      case 'analytics':
        return <AnalyticsComponent />;
      case 'settings':
        return <SettingsComponent />;
      default:
        return <HomeComponent />;
    }
  };

  // Show loading state
  if (loading || !isAuthorized) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">
            {loading ? 'Checking admin access...' : 'Unauthorized access'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout 
      activeTab={activeTab}
      setActiveTab={setActiveTab}
    >
      {renderActiveComponent()}
    </DashboardLayout>
  );
}
