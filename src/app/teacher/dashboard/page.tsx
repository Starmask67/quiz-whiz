
'use client';

import { useState } from 'react';
import QuizGeneration from './QuizGeneration';
import PerformanceAnalysis from './PerformanceAnalysis';

export default function TeacherDashboard() {
  const [activeTab, setActiveTab] = useState('quizGeneration');

  const renderContent = () => {
    switch (activeTab) {
      case 'quizGeneration':
        return <QuizGeneration />;
      case 'performanceAnalysis':
        return <PerformanceAnalysis />;
      default:
        return null;
    }
  };

  return (
    <div className="container-fluid">
      <div style={{ display: 'flex', minHeight: '100vh' }}>
        {/* Sidebar Navigation */}
        <nav className="sidebar" style={{ width: '250px', flexShrink: 0 }}>
          <div style={{ padding: '1.5rem 0' }}>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              <li>
                <a 
                  className={`nav-link ${activeTab === 'quizGeneration' ? 'active' : ''}`} 
                  href="#" 
                  onClick={(e) => { e.preventDefault(); setActiveTab('quizGeneration'); }}
                  style={{ display: 'block', padding: '0.75rem 1rem', margin: '0.25rem 1rem', borderRadius: '0.5rem', textDecoration: 'none', color: activeTab === 'quizGeneration' ? 'var(--primary-600)' : 'var(--gray-600)', backgroundColor: activeTab === 'quizGeneration' ? 'var(--primary-50)' : 'transparent' }}
                >
                  Quiz Generation
                </a>
              </li>
              <li>
                <a 
                  className={`nav-link ${activeTab === 'performanceAnalysis' ? 'active' : ''}`} 
                  href="#" 
                  onClick={(e) => { e.preventDefault(); setActiveTab('performanceAnalysis'); }}
                  style={{ display: 'block', padding: '0.75rem 1rem', margin: '0.25rem 1rem', borderRadius: '0.5rem', textDecoration: 'none', color: activeTab === 'performanceAnalysis' ? 'var(--primary-600)' : 'var(--gray-600)', backgroundColor: activeTab === 'performanceAnalysis' ? 'var(--primary-50)' : 'transparent' }}
                >
                  Performance Analysis
                </a>
              </li>
            </ul>
          </div>
        </nav>

        {/* Main Content */}
        <main style={{ flex: 1, padding: '2rem' }}>
          <h1 className="mb-4">Teacher Dashboard</h1>
          {renderContent()}
        </main>
      </div>
    </div>
  );
}
