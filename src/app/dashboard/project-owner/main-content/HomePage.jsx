'use client';

import { useState } from 'react';
import HomeComponent from '../components/HomeComponent';
import HistoryComponent from '../components/HistoryComponent';
import SavedBOQComponent from '../components/SavedBOQComponent';
import PaymentManagementComponent from '../components/PaymentManagementComponent';
import CreateProjectComponent from '../components/CreateProjectComponent';

export default function HomePage() {
  const [activeMenu, setActiveMenu] = useState("Project");
  const [activeProjectTab, setActiveProjectTab] = useState(null); // null means show all projects
  const [showCreateProject, setShowCreateProject] = useState(false);
  
  const menuItems = ['Project', 'BOQ Generator', 'Payment', 'History'];
  const projectTabs = ['Draft', 'Tender', 'Contract', 'Negotiation', 'Penunjukan Langsung'];

  return (
    <main className="min-h-screen" style={{ backgroundColor: '#d9d9d9' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex gap-6">
          {/* Left Sidebar Menu */}
          <div className="w-64 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <nav className="space-y-1">
                {menuItems.map((item) => (
                  <div key={item}>
                    <button
                      onClick={() => {
                        setActiveMenu(item);
                        if (item === 'Project') {
                          setActiveProjectTab(null); // Reset to show all projects
                        }
                      }}
                      className={`block w-full text-left px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                        activeMenu === item
                          ? 'text-white shadow-md'
                          : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
                      }`}
                      style={activeMenu === item ? { backgroundColor: '#2373FF' } : {}}
                    >
                      {item}
                    </button>
                    
                    {/* Project Sub-menu */}
                    {item === 'Project' && activeMenu === 'Project' && (
                      <div className="ml-4 mt-2 space-y-1">
                        {projectTabs.map((tab) => (
                          <button
                            key={tab}
                            onClick={() => setActiveProjectTab(tab)}
                            className={`block w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                              activeProjectTab === tab
                                ? 'bg-blue-50 text-blue-700 border-l-2 border-blue-500'
                                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                            }`}
                          >
                            {tab}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
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
                  activeProjectTab={activeProjectTab} 
                  onCreateProject={() => setShowCreateProject(true)}
                />
              )}
              {activeMenu === "BOQ Generator" && <SavedBOQComponent />}
              {activeMenu === "Payment" && <PaymentManagementComponent />}
              {activeMenu === "History" && <HistoryComponent />}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
