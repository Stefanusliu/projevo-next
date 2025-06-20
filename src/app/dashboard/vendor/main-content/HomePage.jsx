'use client';

import { useState } from 'react';
import MyProjectsComponent from '../components/MyProjectsComponent';
import ProposalsComponent from '../components/ProposalsComponent';
import EarningsComponent from '../components/EarningsComponent';
import HistoryComponent from '../components/HistoryComponent';

export default function HomePage() {
  const [activeMenu, setActiveMenu] = useState("My Projects");
  
  const menuItems = ['My Projects', 'Proposals', 'Earnings', 'History'];

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
                      ? 'bg-green-600 text-white shadow-md'
                      : 'text-slate-600 hover:text-green-600 hover:bg-green-50 dark:text-slate-300 dark:hover:text-green-400 dark:hover:bg-green-900/20'
                  }`}
                >
                  {item}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1">
          {activeMenu === "My Projects" && <MyProjectsComponent />}
          {activeMenu === "Proposals" && <ProposalsComponent />}
          {activeMenu === "Earnings" && <EarningsComponent />}
          {activeMenu === "History" && <HistoryComponent />}
        </div>
      </div>
    </main>
  );
}
