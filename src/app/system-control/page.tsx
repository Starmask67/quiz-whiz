
'use client';

import { useState } from 'react';

export default function SystemControl() {
  const [whatsappApiKey, setWhatsappApiKey] = useState('********************'); // Masked for display
  const [schoolName, setSchoolName] = useState('Default High School');
  const [schoolId, setSchoolId] = useState('DHS-001');
  const [defaultQuizQuestions, setDefaultQuizQuestions] = useState(10);

  const handleSaveChanges = () => {
    // In a real application, this would make an API call to a secure backend endpoint
    // to save these settings in a configuration file or a database.
    console.log('Saving system settings:', {
      whatsappApiKey,
      schoolName,
      schoolId,
      defaultQuizQuestions,
    });
    alert('System settings saved successfully! (Simulated)');
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          <div className="text-center mb-5">
            <h1 className="display-5 fw-bold">System Control</h1>
            <p className="lead text-muted">Manage core application settings and configurations. This page is for the system owner only.</p>
          </div>

          {/* WhatsApp Bot Configuration */}
          <div className="card mb-4 shadow-sm">
            <div className="card-header">
              <h4 className="my-0 fw-normal">WhatsApp Bot Configuration</h4>
            </div>
            <div className="card-body">
              <div className="mb-3">
                <label htmlFor="whatsappApiKey" className="form-label">WhatsApp API Key</label>
                <input 
                  type="password" 
                  className="form-control" 
                  id="whatsappApiKey" 
                  value={whatsappApiKey} 
                  onChange={(e) => setWhatsappApiKey(e.target.value)} 
                />
                <div className="form-text">This key is required to connect to the WhatsApp Business API.</div>
              </div>
            </div>
          </div>

          {/* School Profile Settings */}
          <div className="card mb-4 shadow-sm">
            <div className="card-header">
              <h4 className="my-0 fw-normal">School Profile</h4>
            </div>
            <div className="card-body">
              <div className="mb-3">
                <label htmlFor="schoolName" className="form-label">School Name</label>
                <input 
                  type="text" 
                  className="form-control" 
                  id="schoolName" 
                  value={schoolName} 
                  onChange={(e) => setSchoolName(e.target.value)} 
                />
              </div>
              <div className="mb-3">
                <label htmlFor="schoolId" className="form-label">School ID</label>
                <input 
                  type="text" 
                  className="form-control" 
                  id="schoolId" 
                  value={schoolId} 
                  onChange={(e) => setSchoolId(e.target.value)} 
                />
              </div>
            </div>
          </div>

          {/* Quiz Defaults */}
          <div className="card mb-4 shadow-sm">
            <div className="card-header">
              <h4 className="my-0 fw-normal">Quiz Defaults</h4>
            </div>
            <div className="card-body">
              <div className="mb-3">
                <label htmlFor="defaultQuizQuestions" className="form-label">Default Number of Questions</e.g., 10, 15, 20</label>
                <input 
                  type="number" 
                  className="form-control" 
                  id="defaultQuizQuestions" 
                  value={defaultQuizQuestions} 
                  onChange={(e) => setDefaultQuizQuestions(parseInt(e.target.value, 10))} 
                />
                <div className="form-text">Set the standard number of questions for all quizzes.</div>
              </div>
            </div>
          </div>

          <div className="d-grid">
            <button className="btn btn-primary btn-lg" onClick={handleSaveChanges}>Save All Changes</button>
          </div>
        </div>
      </div>
    </div>
  );
}
