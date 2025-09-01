'use client';

import { useState } from 'react';
import HomeComponent from '../components/HomeComponent';
import HistoryComponent from '../components/HistoryComponent';
import SavedBOQComponent from '../components/SavedBOQComponent';
import TransactionComponent from '../components/TransactionComponent';
import CreateProjectComponent from '../components/CreateProjectComponent';

export default function HomePage() {
  const [activeMenu, setActiveMenu] = useState("Project");
  const [showCreateProject, setShowCreateProject] = useState(false);
  
  const menuItems = ['Project', 'BOQ Generator', 'Transaksi', 'History'];

  return (
    <main className="min-h-screen" style={{ backgroundColor: '#d9d9d9' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex gap-6">
          {/* Left Sidebar Menu */}
          <div className="w-64 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <nav className="space-y-1">
                {menuItems.map((item) => (
                  <button
                    key={item}
                    onClick={() => setActiveMenu(item)}
                    className={`block w-full text-left px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                      activeMenu === item
                        ? 'text-white shadow-md'
                        : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
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
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 min-h-[600px]">
              {activeMenu === "Project" && showCreateProject && (
                <CreateProjectComponent 
                  onBack={() => setShowCreateProject(false)} 
                />
              )}
              {activeMenu === "Project" && !showCreateProject && (
                <HomeComponent 
                  onCreateProject={() => setShowCreateProject(true)}
                />
              )}
              {activeMenu === "BOQ Generator" && <SavedBOQComponent />}
              {activeMenu === "Transaksi" && <TransactionComponent />}
              {activeMenu === "History" && <HistoryComponent />}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
