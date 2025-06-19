'use client';

import PortfolioComponent from '../../../src/app/dashboard/project-owner/components/PortfolioComponent';
import Sidebar from '../../../src/app/dashboard/project-owner/components/Sidebar';

export default function PortfolioPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Header components would go here - extracted from main dashboard */}
      
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Left Sidebar Menu */}
          <Sidebar />

          {/* Main Content Area */}
          <div className="flex-1">
            <PortfolioComponent />
          </div>
        </div>
      </main>
    </div>
  );
}
