'use client';

import { useState } from 'react';
import DashboardLayout from './components/DashboardLayout';
import HomeComponent from './components/HomeComponent';
import ProjectReviewComponent from './components/ProjectReviewComponent';
import PaymentManagementComponent from './components/PaymentManagementComponent';
import UserManagementComponent from './components/UserManagementComponent';
import AnalyticsComponent from './components/AnalyticsComponent';
import SettingsComponent from './components/SettingsComponent';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('home');

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

  return (
    <DashboardLayout 
      activeTab={activeTab}
      setActiveTab={setActiveTab}
    >
      {renderActiveComponent()}
    </DashboardLayout>
  );
}
