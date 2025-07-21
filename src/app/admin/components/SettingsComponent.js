'use client';

import { useState } from 'react';

export default function SettingsComponent() {
  const [activeTab, setActiveTab] = useState('general');
  const [settings, setSettings] = useState({
    general: {
      platformName: 'Projevo',
      platformDescription: 'Professional Project Management Platform',
      contactEmail: 'admin@projevo.com',
      supportEmail: 'support@projevo.com',
      timezone: 'Asia/Jakarta',
      language: 'id',
      maintenanceMode: false
    },
    projects: {
      autoApproval: false,
      maxProjectDuration: 12, // months
      minProjectBudget: 50000000, // IDR
      maxProjectBudget: 10000000000, // IDR
      allowedFileTypes: ['pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png', 'zip'],
      maxFileSize: 50, // MB
      reviewPeriod: 7, // days
      tenderPeriod: 14 // days
    },
    users: {
      requireEmailVerification: true,
      requirePhoneVerification: false,
      allowSelfRegistration: true,
      defaultUserRole: 'project_owner',
      sessionTimeout: 24, // hours
      passwordMinLength: 8,
      require2FA: false
    },
    payments: {
      platformFee: 5, // percentage
      vendorCommission: 3, // percentage
      autoWithdrawal: true,
      withdrawalThreshold: 1000000, // IDR
      paymentMethods: ['bank_transfer', 'e_wallet', 'credit_card'],
      currency: 'IDR'
    },
    notifications: {
      emailNotifications: true,
      smsNotifications: false,
      pushNotifications: true,
      adminAlerts: true,
      userWelcomeEmail: true,
      projectStatusUpdates: true,
      paymentNotifications: true
    }
  });

  const [unsavedChanges, setUnsavedChanges] = useState(false);

  const tabs = [
    { id: 'general', label: 'General', icon: '⚙️' },
    { id: 'projects', label: 'Projects', icon: '📋' },
    { id: 'users', label: 'Users', icon: '👥' },
    { id: 'payments', label: 'Payments', icon: '💳' },
    { id: 'notifications', label: 'Notifications', icon: '🔔' }
  ];

  const updateSetting = (category, key, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }));
    setUnsavedChanges(true);
  };

  const saveSettings = () => {
    // Here you would typically send the settings to your backend
    console.log('Saving settings:', settings);
    setUnsavedChanges(false);
    // Show success message
  };

  const resetSettings = () => {
    // Reset to default values or reload from server
    setUnsavedChanges(false);
  };

  const renderGeneralSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Platform Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Platform Name
            </label>
            <input
              type="text"
              value={settings.general.platformName}
              onChange={(e) => updateSetting('general', 'platformName', e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-900"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Contact Email
            </label>
            <input
              type="email"
              value={settings.general.contactEmail}
              onChange={(e) => updateSetting('general', 'contactEmail', e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-900"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Platform Description
            </label>
            <textarea
              value={settings.general.platformDescription}
              onChange={(e) => updateSetting('general', 'platformDescription', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-900"
            />
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Localization</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Timezone
            </label>
            <select
              value={settings.general.timezone}
              onChange={(e) => updateSetting('general', 'timezone', e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-900"
            >
              <option value="Asia/Jakarta">Asia/Jakarta (WIB)</option>
              <option value="Asia/Makassar">Asia/Makassar (WITA)</option>
              <option value="Asia/Jayapura">Asia/Jayapura (WIT)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Language
            </label>
            <select
              value={settings.general.language}
              onChange={(e) => updateSetting('general', 'language', e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-900"
            >
              <option value="id">Bahasa Indonesia</option>
              <option value="en">English</option>
            </select>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-slate-900 mb-4">System</h3>
        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
          <div>
            <p className="font-medium text-slate-900">Maintenance Mode</p>
            <p className="text-sm text-slate-500">Temporarily disable public access to the platform</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.general.maintenanceMode}
              onChange={(e) => updateSetting('general', 'maintenanceMode', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300  rounded-full peer bg-gray-200 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all  peer-checked:bg-blue-600"></div>
          </label>
        </div>
      </div>
    </div>
  );

  const renderProjectSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Project Approval</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
            <div>
              <p className="font-medium text-slate-900">Auto Approval</p>
              <p className="text-sm text-slate-500">Automatically approve projects that meet criteria</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.projects.autoApproval}
                onChange={(e) => updateSetting('projects', 'autoApproval', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300  rounded-full peer bg-gray-200 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all  peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Review Period (days)
              </label>
              <input
                type="number"
                value={settings.projects.reviewPeriod}
                onChange={(e) => updateSetting('projects', 'reviewPeriod', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Tender Period (days)
              </label>
              <input
                type="number"
                value={settings.projects.tenderPeriod}
                onChange={(e) => updateSetting('projects', 'tenderPeriod', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-900"
              />
            </div>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Project Limits</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Min Budget (IDR)
            </label>
            <input
              type="number"
              value={settings.projects.minProjectBudget}
              onChange={(e) => updateSetting('projects', 'minProjectBudget', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-900"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Max Budget (IDR)
            </label>
            <input
              type="number"
              value={settings.projects.maxProjectBudget}
              onChange={(e) => updateSetting('projects', 'maxProjectBudget', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-900"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Max Duration (months)
            </label>
            <input
              type="number"
              value={settings.projects.maxProjectDuration}
              onChange={(e) => updateSetting('projects', 'maxProjectDuration', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-900"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Max File Size (MB)
            </label>
            <input
              type="number"
              value={settings.projects.maxFileSize}
              onChange={(e) => updateSetting('projects', 'maxFileSize', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-900"
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderUserSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Registration & Verification</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
            <div>
              <p className="font-medium text-slate-900">Allow Self Registration</p>
              <p className="text-sm text-slate-500">Users can register without admin approval</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.users.allowSelfRegistration}
                onChange={(e) => updateSetting('users', 'allowSelfRegistration', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300  rounded-full peer bg-gray-200 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all  peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
            <div>
              <p className="font-medium text-slate-900">Require Email Verification</p>
              <p className="text-sm text-slate-500">Users must verify email before accessing platform</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.users.requireEmailVerification}
                onChange={(e) => updateSetting('users', 'requireEmailVerification', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300  rounded-full peer bg-gray-200 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all  peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
            <div>
              <p className="font-medium text-slate-900">Require Two-Factor Authentication</p>
              <p className="text-sm text-slate-500">Enhanced security for all user accounts</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.users.require2FA}
                onChange={(e) => updateSetting('users', 'require2FA', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300  rounded-full peer bg-gray-200 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all  peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Security Settings</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Session Timeout (hours)
            </label>
            <input
              type="number"
              value={settings.users.sessionTimeout}
              onChange={(e) => updateSetting('users', 'sessionTimeout', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-900"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Password Min Length
            </label>
            <input
              type="number"
              value={settings.users.passwordMinLength}
              onChange={(e) => updateSetting('users', 'passwordMinLength', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-900"
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderPaymentSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Commission & Fees</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Platform Fee (%)
            </label>
            <input
              type="number"
              step="0.1"
              value={settings.payments.platformFee}
              onChange={(e) => updateSetting('payments', 'platformFee', parseFloat(e.target.value))}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-900"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Vendor Commission (%)
            </label>
            <input
              type="number"
              step="0.1"
              value={settings.payments.vendorCommission}
              onChange={(e) => updateSetting('payments', 'vendorCommission', parseFloat(e.target.value))}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-900"
            />
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Withdrawal Settings</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
            <div>
              <p className="font-medium text-slate-900">Auto Withdrawal</p>
              <p className="text-sm text-slate-500">Automatically process withdrawals when threshold is met</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.payments.autoWithdrawal}
                onChange={(e) => updateSetting('payments', 'autoWithdrawal', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300  rounded-full peer bg-gray-200 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all  peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Withdrawal Threshold (IDR)
            </label>
            <input
              type="number"
              value={settings.payments.withdrawalThreshold}
              onChange={(e) => updateSetting('payments', 'withdrawalThreshold', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-900"
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderNotificationSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Notification Channels</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
            <div>
              <p className="font-medium text-slate-900">Email Notifications</p>
              <p className="text-sm text-slate-500">Send notifications via email</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.notifications.emailNotifications}
                onChange={(e) => updateSetting('notifications', 'emailNotifications', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300  rounded-full peer bg-gray-200 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all  peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
            <div>
              <p className="font-medium text-slate-900">Push Notifications</p>
              <p className="text-sm text-slate-500">Send push notifications to mobile apps</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.notifications.pushNotifications}
                onChange={(e) => updateSetting('notifications', 'pushNotifications', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300  rounded-full peer bg-gray-200 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all  peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
            <div>
              <p className="font-medium text-slate-900">Admin Alerts</p>
              <p className="text-sm text-slate-500">Critical system alerts for administrators</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.notifications.adminAlerts}
                onChange={(e) => updateSetting('notifications', 'adminAlerts', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300  rounded-full peer bg-gray-200 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all  peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Event Notifications</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
            <div>
              <p className="font-medium text-slate-900">User Welcome Email</p>
              <p className="text-sm text-slate-500">Send welcome email to new users</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.notifications.userWelcomeEmail}
                onChange={(e) => updateSetting('notifications', 'userWelcomeEmail', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300  rounded-full peer bg-gray-200 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all  peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
            <div>
              <p className="font-medium text-slate-900">Project Status Updates</p>
              <p className="text-sm text-slate-500">Notify users of project status changes</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.notifications.projectStatusUpdates}
                onChange={(e) => updateSetting('notifications', 'projectStatusUpdates', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300  rounded-full peer bg-gray-200 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all  peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
            <div>
              <p className="font-medium text-slate-900">Payment Notifications</p>
              <p className="text-sm text-slate-500">Notify users of payment events</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.notifications.paymentNotifications}
                onChange={(e) => updateSetting('notifications', 'paymentNotifications', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300  rounded-full peer bg-gray-200 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all  peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );

  const renderActiveTabContent = () => {
    switch (activeTab) {
      case 'general':
        return renderGeneralSettings();
      case 'projects':
        return renderProjectSettings();
      case 'users':
        return renderUserSettings();
      case 'payments':
        return renderPaymentSettings();
      case 'notifications':
        return renderNotificationSettings();
      default:
        return renderGeneralSettings();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Settings
          </h1>
          <p className="text-slate-600 mt-2">
            Configure platform settings and preferences
          </p>
        </div>
        
        {unsavedChanges && (
          <div className="flex items-center space-x-3">
            <span className="text-sm text-orange-600">Unsaved changes</span>
            <button
              onClick={resetSettings}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Reset
            </button>
            <button
              onClick={saveSettings}
              className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
            >
              Save Changes
            </button>
          </div>
        )}
      </div>

      <div className="flex gap-8">
        {/* Settings Navigation */}
        <div className="w-64 flex-shrink-0">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
            <nav className="space-y-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <span className="text-lg">{tab.icon}</span>
                  <span className="font-medium">{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Settings Content */}
        <div className="flex-1">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
            {renderActiveTabContent()}
          </div>
        </div>
      </div>
    </div>
  );
}
