'use client';

import { 
  MdDashboard, 
  MdCheckCircle, 
  MdPayment, 
  MdPeople, 
  MdAnalytics, 
  MdSettings,
  MdEmail,
  MdSync,
  MdBarChart,
  MdLogout
} from 'react-icons/md';
import { useAuth } from '../../../contexts/AuthContext';
import { useRouter } from 'next/navigation';

export default function Sidebar({ activeTab, setActiveTab }) {
  const { logout } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      console.log('Admin signing out from sidebar...');
      await logout();
      console.log('Admin signed out successfully, redirecting to login...');
      router.push('/admin/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const menuItems = [
    {
      id: 'home',
      label: 'Dashboard',
      icon: <MdDashboard className="w-5 h-5" />,
      badge: null
    },
    {
      id: 'project-review',
      label: 'Project Review',
      icon: <MdCheckCircle className="w-5 h-5" />,
      badge: 12
    },
    {
      id: 'payment-management',
      label: 'Payment',
      icon: <MdPayment className="w-5 h-5" />,
      badge: 8
    },
    {
      id: 'user-management',
      label: 'User Management',
      icon: <MdPeople className="w-5 h-5" />,
      badge: null
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: <MdAnalytics className="w-5 h-5" />,
      badge: null
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: <MdSettings className="w-5 h-5" />,
      badge: null
    }
  ];

  return (
    <div className="w-64 flex-shrink-0">
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <nav className="space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-left transition-all duration-200 ${
                activeTab === item.id
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center space-x-3">
                {item.icon}
                <span className="font-medium">{item.label}</span>
              </div>
              {item.badge && (
                <span className={`px-2 py-1 text-xs font-bold rounded-full ${
                  activeTab === item.id
                    ? 'bg-white/20 text-white'
                    : 'bg-red-100 text-red-600'
                }`}>
                  {item.badge}
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* Quick Actions */}
        <div className="mt-8 pt-6 border-t border-slate-200">
          <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">
            Quick Actions
          </h3>
          <div className="space-y-2">
            <button className="w-full flex items-center text-left px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-lg transition-colors">
              <MdPayment className="w-4 h-4 mr-2" />
              Process Payments
            </button>
            <button className="w-full flex items-center text-left px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-lg transition-colors">
              <MdBarChart className="w-4 h-4 mr-2" />
              Generate Report
            </button>
            <button className="w-full flex items-center text-left px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-lg transition-colors">
              <MdEmail className="w-4 h-4 mr-2" />
              Send Reminders
            </button>
            <button className="w-full flex items-center text-left px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-lg transition-colors">
              <MdSync className="w-4 h-4 mr-2" />
              Sync Data
            </button>
          </div>
        </div>

        {/* Sign Out Button */}
        <div className="mt-8 pt-6 border-t border-slate-200">
          <button
            onClick={handleSignOut}
            className="w-full flex items-center justify-center px-4 py-3 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors border border-red-200"
          >
            <MdLogout className="w-4 h-4 mr-2" />
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}
