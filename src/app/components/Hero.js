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
        </div>
      </div>
    </section>
  );
}
