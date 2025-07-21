'use client';

import Sidebar from './Sidebar';

export default function DashboardLayout({ children, title, description }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Left Sidebar Menu */}
          <Sidebar />

          {/* Main Content Area */}
          <div className="flex-1">
            {title && (
              <div className="mb-6">
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                  {title}
                </h1>
                {description && (
                  <p className="text-slate-600 dark:text-slate-400 mt-2">
                    {description}
                  </p>
                )}
              </div>
            )}
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}