"use client";

import Link from 'next/link';

export default function Home() {
  return (
    <div className="container d-flex align-items-center justify-content-center min-vh-100 text-center" style={{ paddingTop: '2rem', paddingBottom: '2rem' }}>
      <div>
        <h1 className="mb-4" style={{ color: 'var(--primary-600)', fontSize: '3rem', fontWeight: '700' }}>Quiz Whiz</h1>
        <p className="mb-5" style={{ maxWidth: '700px', margin: '0 auto', fontSize: '1.125rem', color: 'var(--gray-600)' }}>
          Empowering education through interactive and accessible learning. Quiz Whiz brings dynamic quizzes directly to students via WhatsApp, making learning engaging, instant, and effective.
        </p>

        {/* Enhanced Benefits Section */}
        <div style={{ marginBottom: '3rem' }}>
          <h2 style={{ color: 'var(--gray-800)', fontSize: '2rem', fontWeight: '600', marginBottom: '2rem', textAlign: 'center' }}>
            Why Choose Quiz Whiz?
          </h2>
          
          {/* Main Benefits Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginBottom: '3rem', maxWidth: '1200px', margin: '0 auto' }}>
            
            {/* WhatsApp Integration */}
            <div className="card" style={{ 
              background: 'white', 
              border: '1px solid var(--gray-200)',
              borderRadius: 'var(--radius-lg)',
              boxShadow: 'var(--shadow-sm)',
              transition: 'all var(--transition-normal)',
              overflow: 'hidden'
            }}>
              <div style={{ 
                background: 'linear-gradient(135deg, var(--success-500) 0%, var(--success-600) 100%)', 
                padding: '1.5rem',
                textAlign: 'center',
                color: 'white'
              }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>📱</div>
                <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '600' }}>WhatsApp Integration</h3>
              </div>
              <div className="card-body" style={{ padding: '1.5rem' }}>
                <p style={{ color: 'var(--gray-600)', marginBottom: '1rem', lineHeight: '1.6' }}>
                  Meet students where they are! No new apps to install, no complex setups required.
                </p>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  <li style={{ display: 'flex', alignItems: 'center', marginBottom: '0.75rem', color: 'var(--gray-700)' }}>
                    <span style={{ color: 'var(--success-600)', marginRight: '0.75rem', fontSize: '1.2rem' }}>✓</span>
                    Familiar platform everyone knows
                  </li>
                  <li style={{ display: 'flex', alignItems: 'center', marginBottom: '0.75rem', color: 'var(--gray-700)' }}>
                    <span style={{ color: 'var(--success-600)', marginRight: '0.75rem', fontSize: '1.2rem' }}>✓</span>
                    Instant notifications & delivery
                  </li>
                  <li style={{ display: 'flex', alignItems: 'center', color: 'var(--gray-700)' }}>
                    <span style={{ color: 'var(--success-600)', marginRight: '0.75rem', fontSize: '1.2rem' }}>✓</span>
                    Works on any device
                  </li>
                </ul>
              </div>
            </div>

            {/* Student Benefits */}
            <div className="card" style={{ 
              background: 'white', 
              border: '1px solid var(--gray-200)',
              borderRadius: 'var(--radius-lg)',
              boxShadow: 'var(--shadow-sm)',
              transition: 'all var(--transition-normal)',
              overflow: 'hidden'
            }}>
              <div style={{ 
                background: 'linear-gradient(135deg, var(--primary-500) 0%, var(--primary-600) 100%)', 
                padding: '1.5rem',
                textAlign: 'center',
                color: 'white'
              }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🎓</div>
                <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '600' }}>Student Benefits</h3>
              </div>
              <div className="card-body" style={{ padding: '1.5rem' }}>
                <p style={{ color: 'var(--gray-600)', marginBottom: '1rem', lineHeight: '1.6' }}>
                  Transform learning into an engaging, interactive experience that students love.
                </p>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  <li style={{ display: 'flex', alignItems: 'center', marginBottom: '0.75rem', color: 'var(--gray-700)' }}>
                    <span style={{ color: 'var(--primary-600)', marginRight: '0.75rem', fontSize: '1.2rem' }}>✓</span>
                    Instant feedback & learning
                  </li>
                  <li style={{ display: 'flex', alignItems: 'center', marginBottom: '0.75rem', color: 'var(--gray-700)' }}>
                    <span style={{ color: 'var(--primary-600)', marginRight: '0.75rem', fontSize: '1.2rem' }}>✓</span>
                    Gamified quiz experience
                  </li>
                  <li style={{ display: 'flex', alignItems: 'center', marginBottom: '0.75rem', color: 'var(--gray-700)' }}>
                    <span style={{ color: 'var(--primary-600)', marginRight: '0.75rem', fontSize: '1.2rem' }}>✓</span>
                    Accessible anytime, anywhere
                  </li>
                  <li style={{ display: 'flex', alignItems: 'center', color: 'var(--gray-700)' }}>
                    <span style={{ color: 'var(--primary-600)', marginRight: '0.75rem', fontSize: '1.2rem' }}>✓</span>
                    Boosts confidence & retention
                  </li>
                </ul>
              </div>
            </div>

            {/* Institution Benefits */}
            <div className="card" style={{ 
              background: 'white', 
              border: '1px solid var(--gray-200)',
              borderRadius: 'var(--radius-lg)',
              boxShadow: 'var(--shadow-sm)',
              transition: 'all var(--transition-normal)',
              overflow: 'hidden'
            }}>
              <div style={{ 
                background: 'linear-gradient(135deg, var(--warning-500) 0%, var(--warning-600) 100%)', 
                padding: '1.5rem',
                textAlign: 'center',
                color: 'white'
              }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🏫</div>
                <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '600' }}>For Institutions</h3>
              </div>
              <div className="card-body" style={{ padding: '1.5rem' }}>
                <p style={{ color: 'var(--gray-600)', marginBottom: '1rem', lineHeight: '1.6' }}>
                  Streamline assessment and track progress with powerful analytics and insights.
                </p>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  <li style={{ display: 'flex', alignItems: 'center', marginBottom: '0.75rem', color: 'var(--gray-700)' }}>
                    <span style={{ color: 'var(--warning-600)', marginRight: '0.75rem', fontSize: '1.2rem' }}>✓</span>
                    Automated assessment system
                  </li>
                  <li style={{ display: 'flex', alignItems: 'center', marginBottom: '0.75rem', color: 'var(--gray-700)' }}>
                    <span style={{ color: 'var(--warning-600)', marginRight: '0.75rem', fontSize: '1.2rem' }}>✓</span>
                    Real-time progress tracking
                  </li>
                  <li style={{ display: 'flex', alignItems: 'center', marginBottom: '0.75rem', color: 'var(--gray-700)' }}>
                    <span style={{ color: 'var(--warning-600)', marginRight: '0.75rem', fontSize: '1.2rem' }}>✓</span>
                    Detailed analytics & reports
                  </li>
                  <li style={{ display: 'flex', alignItems: 'center', color: 'var(--gray-700)' }}>
                    <span style={{ color: 'var(--warning-600)', marginRight: '0.75rem', fontSize: '1.2rem' }}>✓</span>
                    Extend learning beyond classroom
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Additional Features Section */}
          <div style={{ 
            background: 'linear-gradient(135deg, var(--gray-50) 0%, var(--gray-100) 100%)', 
            padding: '2rem', 
            borderRadius: 'var(--radius-lg)',
            textAlign: 'center',
            maxWidth: '800px',
            margin: '0 auto'
          }}>
            <h3 style={{ color: 'var(--gray-800)', fontSize: '1.5rem', fontWeight: '600', marginBottom: '1rem' }}>
              🚀 Powerful Features
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>⚡</div>
                <h4 style={{ color: 'var(--gray-700)', fontSize: '1rem', fontWeight: '600', margin: '0 0 0.5rem 0' }}>Instant Results</h4>
                <p style={{ color: 'var(--gray-600)', fontSize: '0.875rem', margin: 0 }}>Get immediate feedback and scores</p>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📊</div>
                <h4 style={{ color: 'var(--gray-700)', fontSize: '1rem', fontWeight: '600', margin: '0 0 0.5rem 0' }}>Smart Analytics</h4>
                <p style={{ color: 'var(--gray-600)', fontSize: '0.875rem', margin: 0 }}>Track progress with detailed insights</p>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🎮</div>
                <h4 style={{ color: 'var(--gray-700)', fontSize: '1rem', fontWeight: '600', margin: '0 0 0.5rem 0' }}>Gamified Learning</h4>
                <p style={{ color: 'var(--gray-600)', fontSize: '0.875rem', margin: 0 }}>Make learning fun and engaging</p>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🔒</div>
                <h4 style={{ color: 'var(--gray-700)', fontSize: '1rem', fontWeight: '600', margin: '0 0 0.5rem 0' }}>Secure & Private</h4>
                <p style={{ color: 'var(--gray-600)', fontSize: '0.875rem', margin: 0 }}>Your data is safe with us</p>
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '400px', margin: '0 auto' }}>
          <Link href="/signup" className="btn btn-primary btn-lg">Get Started - Sign Up</Link>
          <Link href="/login" className="btn btn-outline-primary btn-lg">Already a User? Log In</Link>
        </div>
      </div>
    </div>
  );
}
