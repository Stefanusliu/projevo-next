'use client';

import { useRouter } from 'next/navigation';

export default function Hero() {
  const router = useRouter();

  const handleProjectOwnerClick = () => {
    router.push('/dashboard/project-owner');
  };

  const handleVendorClick = () => {
    router.push('/dashboard/vendor');
  };

  return (
    <section className="relative pt-20 pb-32 overflow-hidden">
      {/* Background gradient effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-slate-900 dark:via-blue-900/20 dark:to-indigo-900/20"></div>
      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-full h-full">
        <div className="w-96 h-96 bg-gradient-to-r from-blue-400/30 to-purple-400/30 rounded-full blur-3xl absolute top-20 left-1/4"></div>
        <div className="w-96 h-96 bg-gradient-to-r from-indigo-400/30 to-pink-400/30 rounded-full blur-3xl absolute top-40 right-1/4"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          {/* Badge */}
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-100 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 mb-8">
            <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
            <span className="text-sm font-medium text-blue-800 dark:text-blue-300">
              Connecting Project Owners & Vendors
            </span>
          </div>

          {/* Main heading */}
          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold text-slate-900 dark:text-white mb-6 leading-tight">
            Connect. Collaborate.{' '}
            <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Create.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-xl sm:text-2xl text-slate-600 dark:text-slate-300 mb-8 max-w-4xl mx-auto leading-relaxed">
            The premier platform where Project Owners find the perfect Vendors, and innovative solutions come to life through seamless collaboration.
          </p>

          {/* Lao Tzu Quote */}
          <div className="mb-12 max-w-3xl mx-auto">
            <blockquote className="text-lg italic text-slate-500 dark:text-slate-400 border-l-4 border-blue-500 pl-6">
              &ldquo;The journey of a thousand miles begins in a single step.&rdquo;
              <footer className="text-sm mt-2 text-slate-400 dark:text-slate-500">- Lao Tzu</footer>
            </blockquote>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <button 
              onClick={handleProjectOwnerClick}
              className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              I&apos;m a Project Owner
            </button>
            <button 
              onClick={handleVendorClick}
              className="w-full sm:w-auto border-2 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 px-8 py-4 rounded-xl font-semibold text-lg hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-200 flex items-center justify-center gap-2"
            >
              I&apos;m a Vendor
            </button>
          </div>

          {/* Hero Image/Dashboard Preview */}
          <div className="relative max-w-6xl mx-auto">
            <div className="relative">
              {/* Mockup container */}
              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                {/* Browser bar */}
                <div className="bg-slate-100 dark:bg-slate-700 px-4 py-3 flex items-center">
                  <div className="flex space-x-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  </div>
                  <div className="flex-1 mx-4">
                    <div className="bg-white dark:bg-slate-600 rounded-lg px-3 py-1 text-sm text-slate-500 dark:text-slate-300">
                      projevo.com/dashboard
                    </div>
                  </div>
                </div>

                {/* Dashboard content */}
                <div className="p-6 bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-800 dark:to-slate-900">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    {/* Stats cards */}
                    <div className="bg-white dark:bg-slate-700 p-4 rounded-lg shadow">
                      <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">1,247</div>
                      <div className="text-sm text-slate-600 dark:text-slate-300">Active Projects</div>
                    </div>
                    <div className="bg-white dark:bg-slate-700 p-4 rounded-lg shadow">
                      <div className="text-2xl font-bold text-green-600 dark:text-green-400">892</div>
                      <div className="text-sm text-slate-600 dark:text-slate-300">Verified Vendors</div>
                    </div>
                    <div className="bg-white dark:bg-slate-700 p-4 rounded-lg shadow">
                      <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">98%</div>
                      <div className="text-sm text-slate-600 dark:text-slate-300">Success Rate</div>
                    </div>
                  </div>

                  {/* Chart area */}
                  <div className="bg-white dark:bg-slate-700 p-6 rounded-lg shadow mb-6">
                    <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4">Project Matching Analytics</h3>
                    <div className="h-40 bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-lg flex items-end justify-center">
                      <div className="text-slate-500 dark:text-slate-400">Real-time Matching Dashboard</div>
                    </div>
                  </div>

                  {/* Project list */}
                  <div className="bg-white dark:bg-slate-700 p-6 rounded-lg shadow">
                    <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4">Recent Matches</h3>
                    <div className="space-y-3">
                      {['E-commerce Platform', 'Mobile App Development', 'Brand Identity Design'].map((project, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-600 rounded-lg">
                          <span className="text-slate-700 dark:text-slate-200">{project}</span>
                          <span className="text-sm text-green-600 dark:text-green-400">Matched</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating elements */}
              <div className="absolute -top-4 -left-4 w-20 h-20 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full opacity-20 animate-pulse"></div>
              <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full opacity-20 animate-pulse animation-delay-1000"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
