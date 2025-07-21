export default function Partners() {
  const partnerCategories = [
    {
      title: 'Technology Partners',
      description: 'Leading technology companies that power our platform',
      partners: [
        { name: 'AWS', category: 'Cloud Infrastructure', logo: 'AWS' },
        { name: 'Stripe', category: 'Payment Processing', logo: 'STR' },
        { name: 'SendGrid', category: 'Email Services', logo: 'SG' },
      ],
      gradient: 'from-blue-500 to-indigo-500'
    },
    {
      title: 'Industry Partners',
      description: 'Organizations that help us serve specific industries better',
      partners: [
        { name: 'Design Council', category: 'Design Industry', logo: 'DC' },
        { name: 'Tech Alliance', category: 'Technology Sector', logo: 'TA' },
        { name: 'Marketing Guild', category: 'Marketing Industry', logo: 'MG' },
        { name: 'Dev Community', category: 'Developer Network', logo: 'DV' }
      ],
      gradient: 'from-purple-500 to-pink-500'
    },
    {
      title: 'Strategic Partners',
      description: 'Key partners helping us expand globally and serve customers better',
      partners: [
        { name: 'GlobalReach', category: 'International Expansion', logo: 'GR' },
        { name: 'EduTech', category: 'Training & Certification', logo: 'ET' },
        { name: 'LegalShield', category: 'Legal Services', logo: 'LS' },
        { name: 'FinanceFirst', category: 'Financial Services', logo: 'FF' }
      ],
      gradient: 'from-green-500 to-emerald-500'
    }
  ];

  const benefits = [
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      title: 'Enhanced Platform',
      description: 'Our partnerships enable better features, security, and performance for all users.'
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9" />
        </svg>
      ),
      title: 'Global Reach',
      description: 'Partner networks help us connect Project Owners and Vendors worldwide.'
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
      title: 'Trust & Security',
      description: 'Partnerships with security leaders ensure your projects and data are protected.'
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
      title: 'Learning & Growth',
      description: 'Educational partnerships provide resources to help users succeed in their projects.'
    }
  ];

  return (
    <section id="partners" className="py-20 bg-white dark:bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-100 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 mb-6">
            <span className="text-sm font-medium text-blue-800 dark:text-blue-300">
              🤝 Our Network
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 dark:text-white mb-6">
            Partners
          </h2>
          <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
            We collaborate with industry leaders to provide the best possible experience for Project Owners and Vendors on our platform.
          </p>
        </div>

        {/* Benefits Section */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">Why We Partner</h3>
            <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
              Strategic partnerships enable us to deliver exceptional value and create a thriving ecosystem for all our users.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => (
              <div key={index} className="text-center group">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center text-white mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  {benefit.icon}
                </div>
                <h4 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">{benefit.title}</h4>
                <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Partner Categories */}
        <div className="space-y-16">
          {partnerCategories.map((category, categoryIndex) => (
            <div key={categoryIndex}>
              <div className="text-center mb-12">
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">{category.title}</h3>
                <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">{category.description}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {category.partners.map((partner, partnerIndex) => (
                  <div key={partnerIndex} className="bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-800 dark:to-slate-700 rounded-2xl p-6 border border-slate-200 dark:border-slate-600 hover:shadow-lg transition-all duration-300 hover:-translate-y-2">
                    <div className={`w-16 h-16 bg-gradient-to-r ${category.gradient} rounded-xl flex items-center justify-center text-white font-bold text-lg mb-4`}>
                      {partner.logo}
                    </div>
                    <h4 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">{partner.name}</h4>
                    <p className="text-slate-600 dark:text-slate-300 text-sm">{partner.category}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Partnership Program */}
        <div className="mt-20">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-12 text-center text-white">
            <h3 className="text-3xl font-bold mb-6">Become a Partner</h3>
            <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
              Join our partner ecosystem and help us create better opportunities for Project Owners and Vendors worldwide.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h4 className="font-semibold mb-2">Technology Partners</h4>
                <p className="text-blue-100 text-sm">Integrate your services with our platform</p>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9" />
                  </svg>
                </div>
                <h4 className="font-semibold mb-2">Channel Partners</h4>
                <p className="text-blue-100 text-sm">Help us reach new markets and customers</p>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <h4 className="font-semibold mb-2">Education Partners</h4>
                <p className="text-blue-100 text-sm">Provide training and certification programs</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button className="w-full sm:w-auto bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1">
                Apply to Partner
              </button>
              <button className="w-full sm:w-auto border-2 border-white/30 text-white px-8 py-3 rounded-lg font-semibold hover:bg-white/10 backdrop-blur-sm transition-all duration-200">
                Partnership Guide
              </button>
            </div>
          </div>
        </div>

        {/* Contact Section */}
        <div className="mt-16 text-center">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-xl border border-slate-200 dark:border-slate-700 max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
              Questions About Partnerships?
            </h3>
            <p className="text-slate-600 dark:text-slate-300 mb-6">
              Our partnership team is here to help you understand how we can work together.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a 
                href="mailto:partnerships@projevo.com"
                className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                Contact Partnership Team
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
