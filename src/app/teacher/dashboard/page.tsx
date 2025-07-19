
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
      <div className="row">
        {/* Sidebar Navigation */}
        <nav className="col-md-3 col-lg-2 d-md-block bg-light sidebar collapse vh-100">
          <div className="position-sticky pt-3">
            <ul className="nav flex-column">
              <li className="nav-item">
                <a className={`nav-link ${activeTab === 'quizGeneration' ? 'active' : ''}`} href="#" onClick={() => setActiveTab('quizGeneration')}>
                  Quiz Generation
                </a>
              </li>
              <li className="nav-item">
                <a className={`nav-link ${activeTab === 'performanceAnalysis' ? 'active' : ''}`} href="#" onClick={() => setActiveTab('performanceAnalysis')}>
                  Performance Analysis
                </a>
              </li>
            </ul>
          </div>
        </nav>

        {/* Main Content */}
        <main className="col-md-9 ms-sm-auto col-lg-10 px-md-4 py-4">
          <h1 className="mb-4">Teacher Dashboard</h1>
          {renderContent()}
        </main>
      </div>
    </div>
  );
}
