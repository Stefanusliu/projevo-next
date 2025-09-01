'use client';

import { useState } from 'react';
import MyProjectsComponent from '../components/MyProjectsComponent';
import EarningsComponent from '../components/EarningsComponent';
import HistoryComponent from '../components/HistoryComponent';
import PortfolioComponent from '../components/PortfolioComponent';
import VendorTransactionComponent from '../components/VendorTransactionComponent';

export default function HomePage() {
  const [activeMenu, setActiveMenu] = useState("Project");
  const [expandedMenu, setExpandedMenu] = useState(null);
  const [projectFilter, setProjectFilter] = useState('Tender');
  
  const menuItems = [
    { id: 'Project', label: 'Project' },
    { id: 'Portfolio', label: 'Portfolio' },
    { id: 'Transaction', label: 'Transaction' },
    { id: 'History', label: 'History' }
  ];

  const handleMainMenuClick = (item) => {
    const menuItem = menuItems.find(menu => menu.id === item);
    
    if (menuItem && menuItem.subItems) {
      // Toggle expanded state for menu with sub-items
      setExpandedMenu(expandedMenu === item ? null : item);
    } else {
      // For regular menu items, set as active
      setActiveMenu(item);
      setExpandedMenu(null);
    }
  };

  const handleSubMenuClick = (subItem) => {
    setProjectFilter(subItem);
    setActiveMenu("Project");
  };

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex gap-8">
        {/* Left Sidebar Menu */}
        <div className="w-64 flex-shrink-0">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <nav className="space-y-2">
              {menuItems.map((item) => (
                <div key={item.id}>
                  <button
                    onClick={() => handleMainMenuClick(item.id)}
                    className={`block w-full text-left px-4 py-3 rounded-lg font-medium transition-colors ${
                      activeMenu === item.id || (item.id === 'Project' && activeMenu === 'Project')
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'text-slate-600 hover:text-blue-600 hover:bg-blue-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span>{item.label}</span>
                      {item.subItems && (
                        <svg 
                          className={`w-4 h-4 transition-transform ${
                            expandedMenu === item.id ? 'rotate-180' : ''
                          }`} 
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      )}
                    </div>
                  </button>
                  
                  {/* Sub-menu items */}
                  {item.subItems && expandedMenu === item.id && (
                    <div className="ml-4 mt-2 space-y-1">
                      {item.subItems.map((subItem) => (
                        <button
                          key={subItem.id}
                          onClick={() => handleSubMenuClick(subItem.id)}
                          className={`block w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                            projectFilter === subItem.id
                              ? 'bg-blue-100 text-blue-800 font-medium'
                              : 'text-slate-500 hover:text-blue-600 hover:bg-blue-50'
                          }`}
                        >
                          {subItem.label}
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
          {activeMenu === "Project" && <MyProjectsComponent projectFilter={projectFilter} />}
          {activeMenu === "Portfolio" && <PortfolioComponent />}
          {activeMenu === "Transaction" && <VendorTransactionComponent />}
          {activeMenu === "History" && <HistoryComponent />}
        </div>
      </div>
    </main>
  );
}
