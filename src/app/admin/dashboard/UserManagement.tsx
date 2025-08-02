
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
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--gray-200)', fontWeight: '600', color: 'var(--gray-700)' }}>
          {editingUser ? 'Edit User' : 'Add New User'}
        </div>
        <div className="card-body">
          <form onSubmit={handleFormSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label htmlFor="name" className="form-label">Full Name</label>
                <input type="text" className="form-control" id="name" placeholder="Enter full name" value={formState.name || ''} onChange={handleFormChange} required />
              </div>
              <div>
                <label htmlFor="phone" className="form-label">Phone Number</label>
                <input type="tel" className="form-control" id="phone" placeholder="Enter phone number" value={formState.phone || ''} onChange={handleFormChange} required />
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label htmlFor="schoolId" className="form-label">School ID</label>
                <input type="text" className="form-control" id="schoolId" placeholder="Enter school ID" value={formState.schoolId || ''} onChange={handleFormChange} required />
              </div>
              <div>
                <label htmlFor="role" className="form-label">Role</label>
                <select className="form-select" id="role" value={formState.role || 'student'} onChange={handleFormChange}>
                  <option value="student">Student</option>
                  <option value="teacher">Teacher</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>
            {formState.role === 'student' && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label htmlFor="className" className="form-label">Class</label>
                  <select className="form-select" id="className" value={formState.className || ''} onChange={handleFormChange}>
                    <option value="">Select Class</option>
                    {mockClassesForSelect.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
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
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button type="submit" className="btn btn-success">Save User</button>
              <button type="button" className="btn btn-outline-primary" onClick={handleClearForm}>Clear Form</button>
            </div>
          </form>
        </div>
      </div>

      {/* User List Table */}
      <div className="card">
        <div style={{ 
          padding: '1rem 1.5rem', 
          borderBottom: '1px solid var(--gray-200)', 
          fontWeight: '600', 
          color: 'var(--gray-700)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span>Existing Users</span>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input type="file" id="csv-import" style={{ display: 'none' }} accept=".csv" onChange={handleImportCSV} />
            <button className="btn btn-sm btn-outline-primary" onClick={() => document.getElementById('csv-import')?.click()}>Import Users (CSV)</button>
            <button className="btn btn-sm btn-outline-secondary" onClick={handleExportCSV}>Export Users (CSV)</button>
          </div>
        </div>
        <div className="card-body">
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--gray-200)' }}>
                  <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: '600', color: 'var(--gray-700)' }}>Name</th>
                  <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: '600', color: 'var(--gray-700)' }}>Role</th>
                  <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: '600', color: 'var(--gray-700)' }}>Class</th>
                  <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: '600', color: 'var(--gray-700)' }}>Division</th>
                  <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: '600', color: 'var(--gray-700)' }}>Phone</th>
                  <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: '600', color: 'var(--gray-700)' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user, index) => (
                  <tr key={user.id} style={{ 
                    borderBottom: '1px solid var(--gray-100)',
                    backgroundColor: index % 2 === 0 ? 'white' : 'var(--gray-50)'
                  }}>
                    <td style={{ padding: '0.75rem' }}>{user.name}</td>
                    <td style={{ padding: '0.75rem' }}>
                      <span style={{
                        padding: '0.25rem 0.5rem',
                        borderRadius: '0.25rem',
                        fontSize: '0.75rem',
                        fontWeight: '500',
                        backgroundColor: user.role === 'admin' ? 'var(--error-100)' : user.role === 'teacher' ? 'var(--warning-100)' : 'var(--success-100)',
                        color: user.role === 'admin' ? 'var(--error-700)' : user.role === 'teacher' ? 'var(--warning-700)' : 'var(--success-700)'
                      }}>
                        {user.role}
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem' }}>{user.role === 'student' ? user.className : 'N/A'}</td>
                    <td style={{ padding: '0.75rem' }}>{user.role === 'student' ? user.division : 'N/A'}</td>
                    <td style={{ padding: '0.75rem' }}>{user.phone}</td>
                    <td style={{ padding: '0.75rem' }}>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button className="btn btn-sm btn-warning" onClick={() => handleEditClick(user)}>Edit</button>
                        <button className="btn btn-sm btn-danger">Delete</button>
                      </div>
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
