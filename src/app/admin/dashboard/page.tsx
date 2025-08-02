
'use client';

import { useState } from 'react';
import ClassManagement from './ClassManagement';
import UserManagement from './UserManagement';
import AnalyticsAndReporting from './AnalyticsAndReporting';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('pdfUpload');

  const renderContent = () => {
    switch (activeTab) {
      case 'pdfUpload':
        return (
          <div>
            <h3>Upload Textbook PDF</h3>
            <div className="mb-3">
              <label htmlFor="pdfFile" className="form-label">Select PDF File</label>
              <input className="form-control" type="file" id="pdfFile" accept=".pdf" />
            </div>
            <div className="mb-3">
              <label htmlFor="classSelect" className="form-label">Select Class</label>
              <select className="form-select" id="classSelect">
                <option value="">Choose...</option>
                <option value="LKG">LKG</option>
                <option value="UKG">UKG</option>
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4</option>
                <option value="5">5</option>
                <option value="6">6</option>
                <option value="7">7</option>
              </select>
            </div>
            <button className="btn btn-primary">Upload PDF</button>
          </div>
        );
      case 'userManagement':
        return <UserManagement />;
      case 'classManagement':
        return <ClassManagement />;
      
      case 'analyticsReporting':
        return <AnalyticsAndReporting />;
      
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
                  className={`nav-link ${activeTab === 'pdfUpload' ? 'active' : ''}`} 
                  href="#" 
                  onClick={(e) => { e.preventDefault(); setActiveTab('pdfUpload'); }}
                  style={{ display: 'block', padding: '0.75rem 1rem', margin: '0.25rem 1rem', borderRadius: '0.5rem', textDecoration: 'none', color: activeTab === 'pdfUpload' ? 'var(--primary-600)' : 'var(--gray-600)', backgroundColor: activeTab === 'pdfUpload' ? 'var(--primary-50)' : 'transparent' }}
                >
                  PDF Upload
                </a>
              </li>
              <li>
                <a 
                  className={`nav-link ${activeTab === 'userManagement' ? 'active' : ''}`} 
                  href="#" 
                  onClick={(e) => { e.preventDefault(); setActiveTab('userManagement'); }}
                  style={{ display: 'block', padding: '0.75rem 1rem', margin: '0.25rem 1rem', borderRadius: '0.5rem', textDecoration: 'none', color: activeTab === 'userManagement' ? 'var(--primary-600)' : 'var(--gray-600)', backgroundColor: activeTab === 'userManagement' ? 'var(--primary-50)' : 'transparent' }}
                >
                  User Management
                </a>
              </li>
              <li>
                <a 
                  className={`nav-link ${activeTab === 'classManagement' ? 'active' : ''}`} 
                  href="#" 
                  onClick={(e) => { e.preventDefault(); setActiveTab('classManagement'); }}
                  style={{ display: 'block', padding: '0.75rem 1rem', margin: '0.25rem 1rem', borderRadius: '0.5rem', textDecoration: 'none', color: activeTab === 'classManagement' ? 'var(--primary-600)' : 'var(--gray-600)', backgroundColor: activeTab === 'classManagement' ? 'var(--primary-50)' : 'transparent' }}
                >
                  Class & School Management
                </a>
              </li>
              
              <li>
                <a 
                  className={`nav-link ${activeTab === 'analyticsReporting' ? 'active' : ''}`} 
                  href="#" 
                  onClick={(e) => { e.preventDefault(); setActiveTab('analyticsReporting'); }}
                  style={{ display: 'block', padding: '0.75rem 1rem', margin: '0.25rem 1rem', borderRadius: '0.5rem', textDecoration: 'none', color: activeTab === 'analyticsReporting' ? 'var(--primary-600)' : 'var(--gray-600)', backgroundColor: activeTab === 'analyticsReporting' ? 'var(--primary-50)' : 'transparent' }}
                >
                  Analytics & Reporting
                </a>
              </li>
              
            </ul>
          </div>
        </nav>

        {/* Main Content */}
        <main style={{ flex: 1, padding: '2rem' }}>
          <h1 className="mb-4">Admin Dashboard</h1>
          {renderContent()}
        </main>
      </div>
    </div>
  );
}
