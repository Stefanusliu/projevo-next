'use client';

import { useState } from 'react';
import HomeComponent from '../components/HomeComponentNew';
import HistoryComponent from '../components/HistoryComponent';
import SavedBOQComponent from '../components/SavedBOQComponent';
import PaymentManagementComponent from '../components/PaymentManagementComponent';
import Tender from './Tender';

export default function HomePage() {
  const [activeMenu, setActiveMenu] = useState("Project");
  
  const menuItems = ['Project', 'Tender', 'BOQ Generator', 'Payment', 'History'];

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex gap-8">
        {/* Left Sidebar Menu */}
        <div className="w-64 flex-shrink-0">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
            <nav className="space-y-2">
              {menuItems.map((item) => (
                <button
                  key={item}
                  onClick={() => setActiveMenu(item)}
                  className={`block w-full text-left px-4 py-3 rounded-lg font-medium transition-colors ${
                    activeMenu === item
                      ? 'text-white shadow-md'
                      : 'text-slate-600 hover:text-gray-700 hover:bg-gray-50 dark:text-slate-300 dark:hover:text-gray-800 dark:hover:bg-gray-100'
                  }`}
                  style={activeMenu === item ? { backgroundColor: '#2373FF' } : {}}
                >
                  {item}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1">
          {activeMenu === "Project" && <HomeComponent />}
          {activeMenu === "Tender" && <Tender />}
          {activeMenu === "BOQ Generator" && <SavedBOQComponent />}
          {activeMenu === "Payment" && <PaymentManagementComponent />}
          {activeMenu === "History" && <HistoryComponent />}
        </div>
      </div>
    </main>
  );
}
