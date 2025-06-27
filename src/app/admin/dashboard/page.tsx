
'use client';

import { useState } from 'react';

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
        return (
          <div>
            <h3>User Management</h3>
            {/* Add/Edit User Form */}
            <div className="card mb-4">
              <div className="card-header">Add/Edit User</div>
              <div className="card-body">
                <form>
                  <div className="row mb-3">
                    <div className="col-md-6">
                      <label htmlFor="userName" className="form-label">Full Name</label>
                      <input type="text" className="form-control" id="userName" placeholder="Enter full name" />
                    </div>
                    <div className="col-md-6">
                      <label htmlFor="userPhone" className="form-label">Phone Number</label>
                      <input type="tel" className="form-control" id="userPhone" placeholder="Enter phone number" />
                    </div>
                  </div>
                  <div className="row mb-3">
                    <div className="col-md-6">
                      <label htmlFor="userSchoolId" className="form-label">School ID</label>
                      <input type="text" className="form-control" id="userSchoolId" placeholder="Enter school ID" />
                    </div>
                    <div className="col-md-6">
                      <label htmlFor="userRole" className="form-label">Role</label>
                      <select className="form-select" id="userRole">
                        <option value="">Select Role</option>
                        <option value="student">Student</option>
                        <option value="teacher">Teacher</option>
                        <option value="admin">Admin</option>
                      </select>
                    </div>
                  </div>
                  <div className="mb-3">
                    <label htmlFor="userSubject" className="form-label">Subject (for Teachers)</label>
                    <input type="text" className="form-control" id="userSubject" placeholder="e.g., Mathematics, Science" />
                  </div>
                  <button type="submit" className="btn btn-success me-2">Save User</button>
                  <button type="button" className="btn btn-secondary">Clear Form</button>
                </form>
              </div>
            </div>

            {/* User List Table */}
            <div className="card">
              <div className="card-header">Existing Users</div>
              <div className="card-body">
                <div className="table-responsive">
                  <table className="table table-striped table-hover">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Phone</th>
                        <th>School ID</th>
                        <th>Role</th>
                        <th>Subject</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {/* Example Row - This will be populated dynamically from the database later */}
                      <tr>
                        <td>John Doe</td>
                        <td>+1234567890</td>
                        <td>SCH001</td>
                        <td>Student</td>
                        <td>N/A</td>
                        <td>
                          <button className="btn btn-sm btn-warning me-2">Edit</button>
                          <button className="btn btn-sm btn-danger">Delete</button>
                        </td>
                      </tr>
                      <tr>
                        <td>Jane Smith</td>
                        <td>+1987654321</td>
                        <td>SCH001</td>
                        <td>Teacher</td>
                        <td>Physics</td>
                        <td>
                          <button className="btn btn-sm btn-warning me-2">Edit</button>
                          <button className="btn btn-sm btn-danger">Delete</button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        );
      case 'classManagement':
        return (
          <div>
            <h3>Class & School Management</h3>
            <p>Create/Manage classes, assign teachers, enroll/unenroll students.</p>
            {/* Placeholder for class management forms/tables */}
          </div>
        );
      case 'contentOversight':
        return (
          <div>
            <h3>Content Oversight</h3>
            <p>Manage subjects, topics, and review quiz questions.</p>
            {/* Placeholder for content management */}
          </div>
        );
      case 'analyticsReporting':
        return (
          <div>
            <h3>Analytics & Reporting</h3>
            <p>View overall usage statistics and performance overviews.</p>
            {/* Placeholder for charts/reports */}
          </div>
        );
      case 'systemSettings':
        return (
          <div>
            <h3>System Settings</h3>
            <p>Configure school-specific WhatsApp bot settings.</p>
            {/* Placeholder for settings forms */}
          </div>
        );
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
                <a className={`nav-link ${activeTab === 'contentOversight' ? 'active' : ''}`} href="#" onClick={() => setActiveTab('contentOversight')}>
                  Content Oversight
                </a>
              </li>
              <li className="nav-item">
                <a className={`nav-link ${activeTab === 'analyticsReporting' ? 'active' : ''}`} href="#" onClick={() => setActiveTab('analyticsReporting')}>
                  Analytics & Reporting
                </a>
              </li>
              <li className="nav-item">
                <a className={`nav-link ${activeTab === 'systemSettings' ? 'active' : ''}`} href="#" onClick={() => setActiveTab('systemSettings')}>
                  System Settings
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
