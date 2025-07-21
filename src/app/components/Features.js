export default function Features() {
  const steps = [
    {
      step: '01',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
      title: 'Create Your Profile',
      description: 'Sign up as a Project Owner or Vendor. Complete your profile with relevant information, portfolio, or project requirements.',
      forOwners: 'Describe your project vision and requirements',
      forVendors: 'Showcase your skills, experience, and portfolio'
    },
    {
      step: '02',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      ),
      title: 'Smart Matching',
      description: 'Our intelligent algorithm analyzes profiles, requirements, and preferences to find the perfect matches.',
      forOwners: 'Get matched with qualified vendors for your project',
      forVendors: 'Discover projects that match your expertise'
    },
    {
      step: '03',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      ),
      title: 'Connect & Communicate',
      description: 'Start conversations with potential partners. Discuss project details, timelines, and expectations.',
      forOwners: 'Interview vendors and discuss your project needs',
      forVendors: 'Present your proposals and engage with clients'
    },
    {
      step: '04',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      title: 'Collaborate & Deliver',
      description: 'Work together using our platform tools. Track progress, share files, and ensure successful project completion.',
      forOwners: 'Monitor progress and provide feedback',
      forVendors: 'Deliver quality work and build relationships'
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-100 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 mb-6">
            <span className="text-sm font-medium text-blue-800 dark:text-blue-300">
              🤝 Simple Process
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 dark:text-white mb-6">
            How It Works?
          </h2>
          <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
            From connection to completion - discover how Projevo makes finding the perfect project partnership effortless.
          </p>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-6 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
              {/* Step number and icon */}
              <div className="flex items-center justify-between mb-4">
                <div className="text-4xl font-bold text-blue-100 dark:text-blue-900/50">
                  {step.step}
                </div>
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center text-white">
                  {step.icon}
                </div>
              </div>

              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
                {step.title}
              </h3>

              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                {step.description}
              </p>

              {/* For different user types */}
              <div className="space-y-3">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
                  <h4 className="font-semibold text-blue-600 dark:text-blue-400 mb-1 text-sm">For Project Owners</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300">{step.forOwners}</p>
                </div>
                <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg border border-purple-200 dark:border-purple-800">
                  <h4 className="font-semibold text-purple-600 dark:text-purple-400 mb-1 text-sm">For Vendors</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300">{step.forVendors}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
