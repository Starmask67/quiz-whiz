"use client";

import { useState } from "react";

export default function SystemControl() {
  const [whatsappApiKey, setWhatsappApiKey] = useState(
    "********************"
  ); // Masked for display
  const [schoolName, setSchoolName] = useState("Default High School");
  const [schoolId, setSchoolId] = useState("DHS-001");
  const [defaultQuizQuestions, setDefaultQuizQuestions] = useState(10);

  const handleSaveChanges = () => {
    // In a real application, this would make an API call to a secure backend endpoint
    // to save these settings in a configuration file or a database.
    console.log("Saving system settings:", {
      whatsappApiKey,
      schoolName,
      schoolId,
      defaultQuizQuestions,
    });
    alert("System settings saved successfully! (Simulated)");
  };

  return (
    <div className="container" style={{ paddingTop: "2rem", paddingBottom: "2rem" }}>
      <div style={{ maxWidth: "800px", margin: "0 auto" }}>
        <div className="text-center mb-5">
          <h1 style={{ fontSize: "2.5rem", fontWeight: "700", marginBottom: "1rem" }}>
            System Control
          </h1>
          <p style={{ fontSize: "1.125rem", color: "var(--gray-600)" }}>
            Manage core application settings and configurations. This page is for
            the system owner only.
          </p>
        </div>

        {/* WhatsApp Bot Configuration */}
        <div className="card mb-4 shadow-sm">
          <div className="card-header">
            <h4 className="my-0 fw-normal">WhatsApp Bot Configuration</h4>
          </div>
          <div className="card-body">
            <div className="mb-3">
              <label htmlFor="whatsappApiKey" className="form-label">
                WhatsApp API Key
              </label>
              <input
                type="password"
                className="form-control"
                id="whatsappApiKey"
                value={whatsappApiKey}
                onChange={(e) => setWhatsappApiKey(e.target.value)}
              />
              <div className="form-text">
                This key is required to connect to the WhatsApp Business API.
              </div>
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
              <label htmlFor="schoolName" className="form-label">
                School Name
              </label>
              <input
                type="text"
                className="form-control"
                id="schoolName"
                value={schoolName}
                onChange={(e) => setSchoolName(e.target.value)}
              />
            </div>
            <div className="mb-3">
              <label htmlFor="schoolId" className="form-label">
                School ID
              </label>
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
              <label htmlFor="defaultQuizQuestions" className="form-label">
                Default Number of Questions (e.g., 10, 15, 20)
              </label>
              <input
                type="number"
                className="form-control"
                id="defaultQuizQuestions"
                value={defaultQuizQuestions}
                onChange={(e) =>
                  setDefaultQuizQuestions(parseInt(e.target.value, 10))
                }
              />
              <div className="form-text">
                Set the standard number of questions for all quizzes.
              </div>
            </div>
          </div>
        </div>

        {/* Save Changes Button */}
        <div className="text-center">
          <button
            className="btn btn-primary btn-lg"
            onClick={handleSaveChanges}
            style={{ padding: "0.75rem 1.5rem", fontSize: "1.125rem" }}
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
