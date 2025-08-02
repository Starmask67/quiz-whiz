
'use client';

import { useEffect, useState } from 'react';

// Placeholder for authentication context/hook
const useAuth = () => {
    const [user, setUser] = useState<{ role: string; id: string } | null>(null);

    useEffect(() => {
        const authenticateUser = async () => {
            // Simulate a login call to your mock API
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                // For demonstration, hardcode credentials. In a real app, these come from a login form.
                body: JSON.stringify({ phone: '1234567890', password: 'password' }),
            });
            const data = await response.json();
            if (data.success) {
                setUser(data.user);
            } else {
                // Handle login failure
                console.error('Authentication failed:', data.message);
            }
        };
        authenticateUser();
    }, []);

    return user;
};

export default function StudentDashboardPage() {
    const user = useAuth();
    const [admissionNo, setAdmissionNo] = useState('');
    const [studentData, setStudentData] = useState<any>(null);

    // Function to fetch student data from the API
    const fetchStudentData = async (admNo: string) => {
        const response = await fetch(`/api/student?admissionNo=${admNo}`);
        const data = await response.json();
        if (data.success) {
            setStudentData(data.student);
        } else {
            console.error('Failed to fetch student data:', data.message);
            setStudentData(null);
        }
    };

    useEffect(() => {
        if (user && user.role === 'student' && user.id) {
            fetchStudentData(user.id);
        } else if (user && (user.role === 'teacher' || user.role === 'admin')) {
            // For teachers/admins, data is fetched on search
            setStudentData(null); // Clear previous student data when role changes
        }
    }, [user]);

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        fetchStudentData(admissionNo);
    };

    if (!user) {
        return <div className="loading">Loading authentication...</div>;
    }

    return (
        <div className="container">
            <div className="dashboard-view">
                {user.role === 'student' && studentData && (
                    <>
                        <div className="student-info">
                            <h2>Welcome, <span style={{ color: 'var(--primary-600)' }}>{studentData.name}</span>!</h2>
                            <p>Admission Number: <span style={{ fontWeight: '600' }}>{studentData.admissionNo}</span></p>
                        </div>
                        <div className="performance-metrics">
                            <h3>Overall Performance</h3>
                            <div className="metrics-grid">
                                <div className="metric-card">
                                    <h4>Average Score</h4>
                                    <p>{studentData.averageScore}</p>
                                </div>
                                <div className="metric-card">
                                    <h4>Total Quizzes Taken</h4>
                                    <p>{studentData.totalQuizzes}</p>
                                </div>
                                <div className="metric-card">
                                    <h4>Rank</h4>
                                    <p>{studentData.rank}</p>
                                </div>
                            </div>
                        </div>
                        <div className="recent-activity">
                            <h3>Recent Activity</h3>
                            <ul>
                                {studentData.recentQuizzes.map((quiz: any, index: number) => (
                                    <li key={index}>
                                        <span style={{ fontWeight: '500' }}>{quiz.name}</span>
                                        <span style={{ color: 'var(--primary-600)', fontWeight: '600' }}>Score: {quiz.score}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="performance-trends">
                            <h3>Performance Trends</h3>
                            <div style={{ 
                                background: 'linear-gradient(135deg, var(--primary-50) 0%, var(--primary-100) 100%)', 
                                padding: '2rem', 
                                borderRadius: '0.75rem',
                                textAlign: 'center'
                            }}>
                                <p style={{ color: 'var(--gray-600)', marginBottom: '1rem' }}>Performance visualization would be displayed here</p>
                                <div style={{ 
                                    display: 'flex', 
                                    justifyContent: 'space-around', 
                                    alignItems: 'flex-end', 
                                    height: '200px',
                                    maxWidth: '400px',
                                    margin: '0 auto'
                                }}>
                                    {studentData.performanceData.map((score: number, index: number) => (
                                        <div key={index} style={{
                                            width: '40px',
                                            height: `${(score / 100) * 180}px`,
                                            backgroundColor: 'var(--primary-500)',
                                            borderRadius: '4px',
                                            display: 'flex',
                                            alignItems: 'flex-end',
                                            justifyContent: 'center',
                                            color: 'white',
                                            fontSize: '0.75rem',
                                            fontWeight: '600'
                                        }}>
                                            {score}
                                        </div>
                                    ))}
                                </div>
                                <div style={{ 
                                    display: 'flex', 
                                    justifyContent: 'space-around', 
                                    marginTop: '1rem',
                                    maxWidth: '400px',
                                    margin: '0 auto'
                                }}>
                                    {['Quiz 1', 'Quiz 2', 'Quiz 3', 'Quiz 4', 'Quiz 5'].map((label, index) => (
                                        <span key={index} style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>{label}</span>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="subject-breakdown">
                            <h3>Subject Breakdown</h3>
                            <div style={{ 
                                background: 'linear-gradient(135deg, var(--success-50) 0%, var(--success-100) 100%)', 
                                padding: '2rem', 
                                borderRadius: '0.75rem'
                            }}>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                                    {studentData.subjectData.labels.map((subject: string, index: number) => (
                                        <div key={index} style={{
                                            background: 'white',
                                            padding: '1rem',
                                            borderRadius: '0.5rem',
                                            textAlign: 'center',
                                            boxShadow: 'var(--shadow-sm)'
                                        }}>
                                            <h4 style={{ fontSize: '0.875rem', color: 'var(--gray-600)', marginBottom: '0.5rem' }}>{subject}</h4>
                                            <p style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--success-600)', margin: 0 }}>
                                                {studentData.subjectData.scores[index]}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </>
                )}

                {(user.role === 'teacher' || user.role === 'admin') && (
                    <>
                        <div className="card" style={{ marginBottom: '2rem' }}>
                            <div className="card-body">
                                <form onSubmit={handleSearchSubmit}>
                                    <h3>View Student Dashboard</h3>
                                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'end' }}>
                                        <div style={{ flex: 1 }}>
                                            <label htmlFor="search-admission-no" className="form-label">Student Admission Number</label>
                                            <input
                                                type="text"
                                                id="search-admission-no"
                                                className="form-control"
                                                placeholder="Enter Student Admission Number"
                                                value={admissionNo}
                                                onChange={(e) => setAdmissionNo(e.target.value)}
                                                required
                                            />
                                        </div>
                                        <button type="submit" className="btn btn-primary">Search</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                        
                        {studentData && (
                            <div className="student-search-results">
                                <div className="student-info">
                                    <h2>Student: <span style={{ color: 'var(--primary-600)' }}>{studentData.name}</span></h2>
                                    <p>Admission Number: <span style={{ fontWeight: '600' }}>{studentData.admissionNo}</span></p>
                                </div>
                                <div className="performance-metrics">
                                    <h3>Overall Performance</h3>
                                    <div className="metrics-grid">
                                        <div className="metric-card">
                                            <h4>Average Score</h4>
                                            <p>{studentData.averageScore}</p>
                                        </div>
                                        <div className="metric-card">
                                            <h4>Total Quizzes Taken</h4>
                                            <p>{studentData.totalQuizzes}</p>
                                        </div>
                                        <div className="metric-card">
                                            <h4>Rank</h4>
                                            <p>{studentData.rank}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="recent-activity">
                                    <h3>Recent Activity</h3>
                                    <ul>
                                        {studentData.recentQuizzes.map((quiz: any, index: number) => (
                                            <li key={index}>
                                                <span style={{ fontWeight: '500' }}>{quiz.name}</span>
                                                <span style={{ color: 'var(--primary-600)', fontWeight: '600' }}>Score: {quiz.score}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
