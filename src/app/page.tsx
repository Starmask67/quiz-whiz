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
                How Whiz Wizard Boosts Your Brainpower
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Discover a new way to learn that's effective, convenient, and perfectly fits into your daily routine.
              </p>
            </div>
            
            <ScrollStack 
              className="scroll-features"
              useWindowScroll={true}
              itemDistance={120}
              itemScale={0.05}
              itemStackDistance={40}
              stackPosition="30%"
              scaleEndPosition="15%"
              baseScale={0.8}
              rotationAmount={2}
              blurAmount={1}
            >
              {/* Personalized Learning Paths */}
              <ScrollStackItem>
                <div className="clay-feature-card text-center">
                  <div className="clay-icon clay-icon-lavender mb-6 mx-auto clay-bounce">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-4">
                    Personalized Learning Paths
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    AI adapts to your learning style and pace, creating custom study paths that help you master topics faster and more effectively.
                  </p>
                </div>
              </ScrollStackItem>

              {/* Learn on the Go */}
              <ScrollStackItem>
                <div className="clay-feature-card text-center">
                  <div className="clay-icon clay-icon-mint mb-6 mx-auto clay-bounce">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-4">
                    Learn on the Go
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    Access quizzes anytime, anywhere through WhatsApp. Turn your commute, breaks, or free time into productive learning moments.
                  </p>
                </div>
              </ScrollStackItem>

              {/* See Your Progress Soar */}
              <ScrollStackItem>
                <div className="clay-feature-card text-center">
                  <div className="clay-icon clay-icon-baby-blue mb-6 mx-auto clay-bounce">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-4">
                    See Your Progress Soar
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    Track your improvement with detailed analytics and instant feedback. Watch your confidence and grades rise with every quiz.
                  </p>
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
