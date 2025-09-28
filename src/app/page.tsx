"use client";
import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="bg-gradient-to-br from-blue-100 to-purple-100 rounded-3xl p-12 md:p-16 text-center shadow-2xl">
              <h1 className="text-5xl md:text-6xl font-bold text-gray-800 mb-6">
                Learn Smarter, Not Harder
              </h1>
              <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
                Unlock your full potential with AI-powered quizzes on WhatsApp. Fun, engaging, and tailored just for you.
              </p>
              <Link 
                href="/signup" 
                className="inline-flex items-center justify-center px-8 py-4 bg-white text-gray-800 font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                Start Learning for Free
              </Link>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white/50">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
                How Whiz Wizard Boosts Your Brainpower
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Discover a new way to learn that's effective, convenient, and perfectly fits into your daily routine.
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              {/* Personalized Learning Paths */}
              <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 mx-auto">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-4 text-center">
                  Personalized Learning Paths
                </h3>
                <p className="text-gray-600 text-center leading-relaxed">
                  AI adapts to your learning style and pace, creating custom study paths that help you master topics faster and more effectively.
                </p>
              </div>

              {/* Learn on the Go */}
              <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mb-6 mx-auto">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-4 text-center">
                  Learn on the Go
                </h3>
                <p className="text-gray-600 text-center leading-relaxed">
                  Access quizzes anytime, anywhere through WhatsApp. Turn your commute, breaks, or free time into productive learning moments.
                </p>
              </div>

              {/* See Your Progress Soar */}
              <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mb-6 mx-auto">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-4 text-center">
                  See Your Progress Soar
                </h3>
                <p className="text-gray-600 text-center leading-relaxed">
                  Track your improvement with detailed analytics and instant feedback. Watch your confidence and grades rise with every quiz.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="bg-gradient-to-br from-green-100 to-emerald-100 rounded-3xl p-12 md:p-16 text-center shadow-2xl">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
                Ready to Ace Your Exams?
              </h2>
              <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
                Join thousands of students who are already improving their grades with Whiz Wizard.
              </p>
              <Link 
                href="/signup" 
                className="inline-flex items-center justify-center px-8 py-4 bg-white text-gray-800 font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                Sign Up Now
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white/80 backdrop-blur-sm py-8 px-4 sm:px-6 lg:px-8">
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
