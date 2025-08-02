'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SignUp() {
  const [role, setRole] = useState('student');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    // Here you would typically handle the form submission,
    // e.g., send the data to your backend API.
    console.log('Form submitted');
    // For now, we'll just redirect to the login page on success.
    router.push('/login');
  };

  return (
    <div className="container d-flex align-items-center justify-content-center min-vh-100">
      <div className="card" style={{ width: '100%', maxWidth: '480px' }}>
        <div className="card-body" style={{ padding: '2rem' }}>
          <h1 className="text-center mb-4" style={{ color: 'var(--primary-600)' }}>Quiz Whiz</h1>
          <h2 className="text-center mb-4" style={{ fontSize: '1.5rem', fontWeight: '600' }}>Create Your Account</h2>
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="name" className="form-label">Full Name</label>
              <input type="text" className="form-control" id="name" required />
            </div>
            <div className="mb-3">
              <label htmlFor="phone" className="form-label">Phone Number</label>
              <input type="tel" className="form-control" id="phone" required />
            </div>
            <div className="mb-3">
              <label htmlFor="schoolId" className="form-label">School ID</label>
              <input type="text" className="form-control" id="schoolId" required />
            </div>
            <div className="mb-3">
              <label htmlFor="role" className="form-label">Your Role</label>
              <select id="role" className="form-select" value={role} onChange={(e) => setRole(e.target.value)}>
                <option value="student">Student</option>
                <option value="teacher">Teacher</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            {role === 'teacher' && (
              <div className="mb-3">
                <label htmlFor="subject" className="form-label">Subject</label>
                <input type="text" className="form-control" id="subject" placeholder="e.g., Mathematics, Science" required />
              </div>
            )}
            <div className="mb-3">
              <label htmlFor="password" className="form-label">Password</label>
              <input type="password" className="form-control" id="password" required />
              <div className="form-text">
                Note: For pre-registered users, your school provides a temporary password.
              </div>
            </div>
            {error && <div className="alert alert-danger">{error}</div>}
            <button type="submit" className="btn btn-primary w-100" style={{ padding: '0.75rem' }}>Sign Up</button>
          </form>
          <div className="text-center mt-4">
            <p className="mb-0">Already have an account? <a href="/login" style={{ color: 'var(--primary-600)', textDecoration: 'none' }}>Log In</a></p>
          </div>
        </div>
      </div>
    </div>
  );
}