
'use client';

import { useState } from 'react';

// Mock data for demonstration
const mockUsers = [
  { id: 'S001', name: 'John Doe', phone: '+1234567890', schoolId: 'SCH001', role: 'student', className: 'Grade 5', division: 'A' },
  { id: 'S002', name: 'Alice Johnson', phone: '+1122334455', schoolId: 'SCH001', role: 'student', className: 'Grade 5', division: 'B' },
  { id: 'T01', name: 'Jane Smith', phone: '+1987654321', schoolId: 'SCH001', role: 'teacher', subject: 'Physics' },
  { id: 'A01', name: 'Admin User', phone: '+1555555555', schoolId: 'SCH001', role: 'admin' },
];

const mockClassesForSelect = ['Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6', 'Grade 7'];
const mockDivisionsForSelect = ['A', 'B', 'C', 'D'];

export default function UserManagement() {
  const [users, setUsers] = useState(mockUsers);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [formState, setFormState] = useState<any>({ role: 'student' });

  const handleEditClick = (user: any) => {
    setEditingUser(user);
    setFormState(user);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormState({ ...formState, [e.target.id]: e.target.value });
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Logic to save the user (add new or update existing)
    console.log('Saving user:', formState);
    // Reset form after submission
    setEditingUser(null);
    setFormState({ role: 'student' });
  };

  const handleClearForm = () => {
    setEditingUser(null);
    setFormState({ role: 'student' });
  };

  const handleExportCSV = () => {
    const headers = ['id', 'name', 'phone', 'schoolId', 'role', 'className', 'division', 'subject'];
    const csvContent = [
      headers.join(','),
      ...users.map(user => headers.map(header => user[header as keyof typeof user] || '').join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.href) {
      URL.revokeObjectURL(link.href);
    }
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.setAttribute('download', 'users.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImportCSV = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.split('\n').slice(1); // Skip header row
      const newUsers = lines.map(line => {
        const [id, name, phone, schoolId, role, className, division, subject] = line.split(',');
        return { id, name, phone, schoolId, role, className, division, subject };
      });
      setUsers(prevUsers => [...prevUsers, ...newUsers]);
      alert(`${newUsers.length} users imported successfully!`);
    };
    reader.readAsText(file);
  };

  return (
    <div>
      <h3>User Management</h3>
      {/* Add/Edit User Form */}
      <div className="card mb-4">
        <div className="card-header">{editingUser ? 'Edit User' : 'Add New User'}</div>
        <div className="card-body">
          <form onSubmit={handleFormSubmit}>
            <div className="row mb-3">
              <div className="col-md-6">
                <label htmlFor="name" className="form-label">Full Name</label>
                <input type="text" className="form-control" id="name" placeholder="Enter full name" value={formState.name || ''} onChange={handleFormChange} required />
              </div>
              <div className="col-md-6">
                <label htmlFor="phone" className="form-label">Phone Number</label>
                <input type="tel" className="form-control" id="phone" placeholder="Enter phone number" value={formState.phone || ''} onChange={handleFormChange} required />
              </div>
            </div>
            <div className="row mb-3">
              <div className="col-md-6">
                <label htmlFor="schoolId" className="form-label">School ID</label>
                <input type="text" className="form-control" id="schoolId" placeholder="Enter school ID" value={formState.schoolId || ''} onChange={handleFormChange} required />
              </div>
              <div className="col-md-6">
                <label htmlFor="role" className="form-label">Role</label>
                <select className="form-select" id="role" value={formState.role || 'student'} onChange={handleFormChange}>
                  <option value="student">Student</option>
                  <option value="teacher">Teacher</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>
            {formState.role === 'student' && (
              <div className="row mb-3">
                <div className="col-md-6">
                  <label htmlFor="className" className="form-label">Class</label>
                  <select className="form-select" id="className" value={formState.className || ''} onChange={handleFormChange}>
                    <option value="">Select Class</option>
                    {mockClassesForSelect.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="col-md-6">
                  <label htmlFor="division" className="form-label">Division</label>
                  <select className="form-select" id="division" value={formState.division || ''} onChange={handleFormChange}>
                    <option value="">Select Division</option>
                    {mockDivisionsForSelect.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
              </div>
            )}
            {formState.role === 'teacher' && (
              <div className="mb-3">
                <label htmlFor="subject" className="form-label">Subject</label>
                <input type="text" className="form-control" id="subject" placeholder="e.g., Mathematics, Science" value={formState.subject || ''} onChange={handleFormChange} />
              </div>
            )}
            <button type="submit" className="btn btn-success me-2">Save User</button>
            <button type="button" className="btn btn-secondary" onClick={handleClearForm}>Clear Form</button>
          </form>
        </div>
      </div>

      {/* User List Table */}
      <div className="card">
        <div className="card-header d-flex justify-content-between align-items-center">
          <span>Existing Users</span>
          <div>
            <input type="file" id="csv-import" style={{ display: 'none' }} accept=".csv" onChange={handleImportCSV} />
            <button className="btn btn-sm btn-outline-primary me-2" onClick={() => document.getElementById('csv-import')?.click()}>Import Users (CSV)</button>
            <button className="btn btn-sm btn-outline-secondary" onClick={handleExportCSV}>Export Users (CSV)</button>
          </div>
        </div>
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-striped table-hover">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Role</th>
                  <th>Class</th>
                  <th>Division</th>
                  <th>Phone</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user.id}>
                    <td>{user.name}</td>
                    <td>{user.role}</td>
                    <td>{user.role === 'student' ? user.className : 'N/A'}</td>
                    <td>{user.role === 'student' ? user.division : 'N/A'}</td>
                    <td>{user.phone}</td>
                    <td>
                      <button className="btn btn-sm btn-warning me-2" onClick={() => handleEditClick(user)}>Edit</button>
                      <button className="btn btn-sm btn-danger">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
