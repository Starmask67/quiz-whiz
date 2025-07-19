
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
      <div className="row">
        {/* Sidebar Navigation */}
        <nav className="col-md-3 col-lg-2 d-md-block bg-light sidebar collapse vh-100">
          <div className="position-sticky pt-3">
            <ul className="nav flex-column">
              <li className="nav-item">
                <a className={`nav-link ${activeTab === 'pdfUpload' ? 'active' : ''}`} href="#" onClick={() => setActiveTab('pdfUpload')}>
                  PDF Upload
                </a>
              </li>
              <li className="nav-item">
                <a className={`nav-link ${activeTab === 'userManagement' ? 'active' : ''}`} href="#" onClick={() => setActiveTab('userManagement')}>
                  User Management
                </a>
              </li>
              <li className="nav-item">
                <a className={`nav-link ${activeTab === 'classManagement' ? 'active' : ''}`} href="#" onClick={() => setActiveTab('classManagement')}>
                  Class & School Management
                </a>
              </li>
              
              <li className="nav-item">
                <a className={`nav-link ${activeTab === 'analyticsReporting' ? 'active' : ''}`} href="#" onClick={() => setActiveTab('analyticsReporting')}>
                  Analytics & Reporting
                </a>
              </li>
              
            </ul>
          </div>
        </nav>

        {/* Main Content */}
        <main className="col-md-9 ms-sm-auto col-lg-10 px-md-4 py-4">
          <h1 className="mb-4">Admin Dashboard</h1>
          {renderContent()}
        </main>
      </div>
    </div>
  );
}
