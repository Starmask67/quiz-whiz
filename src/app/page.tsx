"use client";
import Link from 'next/link';
import ScrollStack, { ScrollStackItem } from './components/ScrollStack';

export default function Home() {
  return (
    <div className="min-h-screen">
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="clay-hero text-center">
              <h1 className="text-5xl md:text-6xl font-bold clay-text-gradient mb-6 clay-bounce">
                Learn Smarter, Not Harder
              </h1>
              <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
                Unlock your full potential with AI-powered quizzes on WhatsApp. Fun, engaging, and tailored just for you.
              </p>
              <Link 
                href="/signup" 
                className="clay-button clay-wiggle"
              >
                ✨ Start Learning for Free
              </Link>
            </div>
          </div>
        </section>

        {/* Features Section with Scroll Stack Animation */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold clay-text-gradient mb-6">
                QuizWhiz Features
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Discover the powerful features that make QuizWhiz the perfect learning companion.
              </p>
            </div>
            
            <ScrollStack 
              className="scroll-features"
              useWindowScroll={true}
              itemDistance={150}
              itemScale={0.03}
              itemStackDistance={50}
              stackPosition="25%"
              scaleEndPosition="10%"
              baseScale={0.85}
              rotationAmount={0}
              blurAmount={0.8}
            >
              {/* WhatsApp Integration */}
              <ScrollStackItem>
                <div className="clay-feature-card text-center">
                  <div className="clay-icon clay-icon-mint mb-6 mx-auto clay-bounce">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-4">
                    WhatsApp Integration
                  </h3>
                  <p className="text-gray-600 leading-relaxed mb-4">
                    Meet students where they are! No new apps to install, no complex setups required.
                  </p>
                  <ul className="text-left space-y-2">
                    <li className="flex items-center text-gray-600">
                      <span className="text-green-500 mr-2">✓</span>
                      Familiar platform everyone knows
                    </li>
                    <li className="flex items-center text-gray-600">
                      <span className="text-green-500 mr-2">✓</span>
                      Instant notifications & delivery
                    </li>
                  </ul>
                </div>
              </ScrollStackItem>

              {/* Student Benefits */}
              <ScrollStackItem>
                <div className="clay-feature-card text-center">
                  <div className="clay-icon clay-icon-baby-blue mb-6 mx-auto clay-bounce">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-4">
                    Student Benefits
                  </h3>
                  <p className="text-gray-600 leading-relaxed mb-4">
                    Transform learning into an engaging, interactive experience that students love.
                  </p>
                  <ul className="text-left space-y-2">
                    <li className="flex items-center text-gray-600">
                      <span className="text-green-500 mr-2">✓</span>
                      Instant feedback & learning
                    </li>
                    <li className="flex items-center text-gray-600">
                      <span className="text-green-500 mr-2">✓</span>
                      Gamified quiz experience
                    </li>
                  </ul>
                </div>
              </ScrollStackItem>

              {/* For Institutions */}
              <ScrollStackItem>
                <div className="clay-feature-card text-center">
                  <div className="clay-icon clay-icon-peach mb-6 mx-auto clay-bounce">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-4">
                    For Institutions
                  </h3>
                  <p className="text-gray-600 leading-relaxed mb-4">
                    Streamline assessment and track progress with powerful analytics and insights.
                  </p>
                  <ul className="text-left space-y-2">
                    <li className="flex items-center text-gray-600">
                      <span className="text-green-500 mr-2">✓</span>
                      Automated assessment system
                    </li>
                    <li className="flex items-center text-gray-600">
                      <span className="text-green-500 mr-2">✓</span>
                      Real-time progress tracking
                    </li>
                  </ul>
                </div>
              </ScrollStackItem>
            </ScrollStack>
          </div>
        </section>

        {/* Additional Features Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Smart Analytics */}
              <div className="clay-card-soft text-center">
                <div className="clay-icon clay-icon-peach mb-4 mx-auto">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h4 className="font-semibold text-gray-800 mb-2">Smart Analytics</h4>
                <p className="text-sm text-gray-600">Track your learning journey</p>
              </div>

              {/* Instant Feedback */}
              <div className="clay-card-soft text-center">
                <div className="clay-icon clay-icon-rose mb-4 mx-auto">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h4 className="font-semibold text-gray-800 mb-2">Instant Feedback</h4>
                <p className="text-sm text-gray-600">Learn from mistakes immediately</p>
              </div>

              {/* Adaptive Learning */}
              <div className="clay-card-soft text-center">
                <div className="clay-icon clay-icon-lilac mb-4 mx-auto">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h4 className="font-semibold text-gray-800 mb-2">Adaptive Learning</h4>
                <p className="text-sm text-gray-600">AI adjusts to your pace</p>
              </div>

              {/* Social Learning */}
              <div className="clay-card-soft text-center">
                <div className="clay-icon clay-icon-sage mb-4 mx-auto">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h4 className="font-semibold text-gray-800 mb-2">Social Learning</h4>
                <p className="text-sm text-gray-600">Study with friends</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="clay-cta text-center">
              <h2 className="text-4xl md:text-5xl font-bold clay-text-gradient mb-6">
                Ready to Ace Your Exams?
              </h2>
              <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
                Join thousands of students who are already improving their grades with Whiz Wizard.
              </p>
              <Link 
                href="/signup" 
                className="clay-button clay-wiggle"
              >
                🚀 Sign Up Now
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="clay-card-soft py-8 px-4 sm:px-6 lg:px-8 mx-4 sm:mx-6 lg:mx-8 mb-4">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-500 text-sm mb-4 md:mb-0">
            © 2024 Whiz Wizard. All rights reserved.
          </p>
          <div className="flex space-x-6">
            <Link href="/contact" className="text-gray-500 hover:text-gray-700 text-sm transition-colors">
              Privacy
            </Link>
            <Link href="/contact" className="text-gray-500 hover:text-gray-700 text-sm transition-colors">
              Terms
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
