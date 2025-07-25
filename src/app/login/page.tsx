'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Login() {
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    // Here you would typically handle the login request,
    // sending the credentials to your backend API.
    console.log('Form submitted');
    // For now, we'll just redirect to a dashboard page on success.
    // We can imagine a function that returns the user's role.
    const userRole = 'admin'; // This would be determined by the API response
    if (userRole === 'admin') {
      router.push('/admin/dashboard');
    } else if (userRole === 'teacher') {
      router.push('/teacher/dashboard');
    } else if (userRole === 'student') {
      router.push('/student/dashboard');
    } else {
      router.push('/'); // Default redirect
    }
  };

  return (
    <div className="container d-flex align-items-center justify-content-center min-vh-100 bg-light">
      <div className="card shadow-lg p-4 p-md-5" style={{ width: '100%', maxWidth: '480px' }}>
        <h1 className="text-center mb-4 text-primary">Quiz Whiz</h1>
        <h2 className="text-center h4 mb-4">Log In to Your Account</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="phone" className="form-label">Phone Number</label>
            <input type="tel" className="form-control" id="phone" required />
          </div>
          <div className="mb-3">
            <label htmlFor="password" className="form-label">Password</label>
            <input type="password" className="form-control" id="password" required />
          </div>
          {error && <div className="alert alert-danger">{error}</div>}
          <button type="submit" className="btn btn-primary w-100 py-2">Log In</button>
        </form>
        <div className="text-center mt-4">
          <p className="mb-0">Don't have an account? <a href="/signup" className="text-decoration-none">Sign Up</a></p>
        </div>
      </div>
    </div>
  );
}