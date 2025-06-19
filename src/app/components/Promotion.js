export default function Promotion() {
  const currentPromotions = [
    {
      title: 'Welcome Bonus for New Project Owners',
      subtitle: 'Get started with confidence',
      description: 'First-time Project Owners receive priority matching with our top-rated Vendors for their inaugural project.',
      features: [
        'Priority vendor matching',
        'Dedicated success manager',
        'Extended project timeline',
        'Enhanced communication tools'
      ],
      badge: 'Limited Time',
      gradient: 'from-blue-600 to-indigo-600',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      )
    },
    {
      title: 'Vendor Spotlight Program',
      subtitle: 'Showcase your expertise',
      description: 'Selected Vendors get featured placement, enhanced profile visibility, and access to premium project opportunities.',
      features: [
        'Featured vendor placement',
        'Premium badge on profile',
        'Early access to projects',
        'Marketing support'
      ],
      badge: 'Apply Now',
      gradient: 'from-purple-600 to-pink-600',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
        </svg>
      )
    },
    {
      title: 'Referral Rewards',
      subtitle: 'Grow together',
      description: 'Earn rewards when you refer new Project Owners or Vendors to the platform. Both parties benefit from successful connections.',
      features: [
        'Rewards for successful referrals',
        'Bonus for both parties',
        'Tier-based benefits',
        'Exclusive community access'
      ],
      badge: 'Ongoing',
      gradient: 'from-green-600 to-emerald-600',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      )
    }
  ];

  const seasonalEvents = [
    {
      month: 'Spring Launch',
      event: 'New Beginnings Challenge',
      description: 'Special matching events and networking opportunities for spring project launches.'
    },
    {
      month: 'Summer Connect',
      event: 'Global Partnership Week',
      description: 'International collaboration opportunities with reduced fees and premium support.'
    },
    {
      month: 'Fall Focus',
      event: 'Project Excellence Awards',
      description: 'Recognition program celebrating outstanding Project Owner and Vendor partnerships.'
    },
    {
      month: 'Winter Wrap',
      event: 'Year-End Success Summit',
      description: 'Annual community event with workshops, networking, and celebration of achievements.'
    }
  ];

  return (
    <section id="promotion" className="py-20 bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-orange-100 dark:bg-orange-900/30 border border-orange-200 dark:border-orange-800 mb-6">
            <span className="w-2 h-2 bg-orange-500 rounded-full mr-2 animate-pulse"></span>
            <span className="text-sm font-medium text-orange-800 dark:text-orange-300">
              🎉 Special Offers
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 dark:text-white mb-6">
            Promotion
          </h2>
          <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
            Discover exclusive offers, programs, and events designed to help Project Owners and Vendors succeed together on Projevo.
          </p>
        </div>

        {/* Current Promotions */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">Current Promotions</h3>
            <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
              Take advantage of these limited-time offers and ongoing programs to maximize your success on our platform.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {currentPromotions.map((promo, index) => (
              <div key={index} className="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-xl border border-slate-200 dark:border-slate-700 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
                {/* Header */}
                <div className={`bg-gradient-to-r ${promo.gradient} p-6 text-white relative overflow-hidden`}>
                  <div className="absolute top-0 right-0 bg-white/20 px-3 py-1 rounded-bl-lg">
                    <span className="text-xs font-medium">{promo.badge}</span>
                  </div>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                      {promo.icon}
                    </div>
                    <div>
                      <h4 className="text-xl font-bold">{promo.title}</h4>
                      <p className="text-white/80 text-sm">{promo.subtitle}</p>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <p className="text-slate-600 dark:text-slate-300 mb-6 leading-relaxed">
                    {promo.description}
                  </p>

                  <div className="space-y-3 mb-6">
                    {promo.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-center gap-3">
                        <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-slate-700 dark:text-slate-300 text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>

                  <button className={`w-full bg-gradient-to-r ${promo.gradient} text-white py-3 px-6 rounded-lg font-semibold hover:opacity-90 transition-all duration-200 shadow-lg hover:shadow-xl`}>
                    Learn More
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Seasonal Events */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">Seasonal Events</h3>
            <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
              Throughout the year, we host special events and challenges to celebrate our community and create new opportunities.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {seasonalEvents.map((event, index) => (
              <div key={index} className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-lg hover:shadow-xl transition-all duration-300 text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold text-sm mx-auto mb-4">
                  {event.month.split(' ')[0].slice(0, 3)}
                </div>
                <h4 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">{event.month}</h4>
                <h5 className="text-blue-600 dark:text-blue-400 font-medium mb-3">{event.event}</h5>
                <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">{event.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Newsletter Signup */}
        <div className="mb-16">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-12 text-center text-white">
            <h3 className="text-3xl font-bold mb-4">Stay Updated on Promotions</h3>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Be the first to know about new promotions, events, and exclusive opportunities on Projevo.
            </p>
            
            <div className="max-w-md mx-auto">
              <div className="flex gap-3">
                <input
                  type="email"
                  placeholder="Enter your email address"
                  className="flex-1 px-4 py-3 rounded-lg text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-blue-600"
                />
                <button className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors">
                  Subscribe
                </button>
              </div>
              <p className="text-blue-200 text-xs mt-3">
                We respect your privacy and will never spam you.
              </p>
            </div>
          </div>
        </div>

        {/* Terms and Conditions */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 border border-slate-200 dark:border-slate-700">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Promotion Terms & Conditions</h3>
          <div className="space-y-4 text-sm text-slate-600 dark:text-slate-300">
            <div>
              <h4 className="font-semibold text-slate-700 dark:text-slate-300 mb-2">General Terms:</h4>
              <ul className="space-y-1 pl-4">
                <li>• Promotions are subject to availability and may be modified or terminated at any time</li>
                <li>• Only one promotion per user unless otherwise specified</li>
                <li>• Promotional benefits cannot be transferred or exchanged for cash</li>
                <li>• Projevo reserves the right to verify eligibility for all promotions</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-slate-700 dark:text-slate-300 mb-2">Eligibility:</h4>
              <ul className="space-y-1 pl-4">
                <li>• Users must have a verified account to participate in promotions</li>
                <li>• Some promotions may be limited to specific user types or geographic regions</li>
                <li>• Promotional benefits are non-transferable between accounts</li>
              </ul>
            </div>
            <div className="pt-4 border-t border-slate-200 dark:border-slate-600">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                For complete terms and conditions, please visit our{' '}
                <a href="/terms" className="text-blue-600 dark:text-blue-400 hover:underline">Terms of Service</a> page.
                Last updated: June 2025
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-16 text-center">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-xl border border-slate-200 dark:border-slate-700 max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
              Ready to Take Advantage of These Offers?
            </h3>
            <p className="text-slate-600 dark:text-slate-300 mb-6">
              Join Projevo today and start benefiting from our promotions and community programs.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1">
                I&apos;m a Project Owner
              </button>
              <button className="w-full sm:w-auto border-2 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 px-8 py-3 rounded-lg font-semibold hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-200">
                I&apos;m a Vendor
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
