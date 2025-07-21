export default function About() {
  const values = [
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      ),
      title: 'Trust & Transparency',
      description: 'We believe in honest partnerships built on verified profiles and clear communication.'
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      title: 'Innovation',
      description: 'Continuously improving our platform with cutting-edge technology and user feedback.'
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      title: 'Community',
      description: 'Fostering a supportive ecosystem where both Project Owners and Vendors thrive together.'
    }
  ];

  return (
    <section id="about" className="py-20 bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-100 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 mb-6">
            <span className="flex items-center text-sm font-medium text-blue-800 dark:text-blue-300">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              Our Story
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 dark:text-white mb-6">
            About Projevo
          </h2>
          <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
            Born from the belief that great projects deserve great partnerships, Projevo is transforming how Project Owners and Vendors connect worldwide.
          </p>
        </div>

        {/* Story Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-20">
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Our Mission</h3>
            <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
              We exist to bridge the gap between visionary Project Owners and talented Vendors. Every day, we witness amazing ideas waiting to be brought to life and skilled professionals ready to create something extraordinary.
            </p>
            <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
              Projevo was founded in 2023 when our team experienced firsthand the challenges of finding the right partners for projects. We knew there had to be a better way to connect passion with expertise.
            </p>
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
              <blockquote className="text-lg italic text-slate-700 dark:text-slate-300 mb-4">
                &ldquo;The journey of a thousand miles begins in a single step.&rdquo;
              </blockquote>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                This ancient wisdom by Lao Tzu guides our philosophy - every great project starts with connecting the right people.
              </p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-xl border border-slate-200 dark:border-slate-700">
              <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-6">By the Numbers</h4>
              <div className="grid grid-cols-2 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
                    5,000+
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-300">Successful Matches</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-2">
                    2,500+
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-300">Verified Vendors</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
                    98%
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-300">Success Rate</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent mb-2">
                    50+
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-300">Countries</div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 text-white">
              <h4 className="text-xl font-bold mb-4">Our Vision</h4>
              <p className="text-blue-100 leading-relaxed">
                To become the world&apos;s most trusted platform where every project finds its perfect partner, and every professional finds opportunities that inspire them to do their best work.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
