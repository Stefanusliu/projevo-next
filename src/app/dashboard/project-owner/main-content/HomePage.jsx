'use client';

import { useState } from 'react';
import HomeComponent from '../components/HomeComponent';
import PortfolioComponent from '../components/PortfolioComponent';
import SavedComponent from '../components/SavedComponent';
import HistoryComponent from '../components/HistoryComponent';

export default function HomePage() {
  const [activeMenu, setActiveMenu] = useState("Projects");
  
  const menuItems = ['Projects', 'Portfolio', 'Saved', 'History'];

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
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'text-slate-600 hover:text-blue-600 hover:bg-blue-50 dark:text-slate-300 dark:hover:text-blue-400 dark:hover:bg-blue-900/20'
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
          {activeMenu === "Projects" && <HomeComponent />}
          {activeMenu === "Portfolio" && <PortfolioComponent />}
          {activeMenu === "Saved" && <SavedComponent />}
          {activeMenu === "History" && <HistoryComponent />}
        </div>
      </div>
    </main>
  );
}
