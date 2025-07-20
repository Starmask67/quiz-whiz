
'use client';

import { useEffect, useState } from 'react';
import Chart from 'chart.js/auto';

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

    useEffect(() => {
        if (studentData) {
            // Destroy existing charts before re-rendering
            const existingCharts = Chart.getChart('performance-chart');
            if (existingCharts) existingCharts.destroy();
            const existingSubjectCharts = Chart.getChart('subject-chart');
            if (existingSubjectCharts) existingSubjectCharts.destroy();

            // Render Performance Chart
            const performanceChartCtx = document.getElementById('performance-chart') as HTMLCanvasElement;
            if (performanceChartCtx) {
                new Chart(performanceChartCtx.getContext('2d')!, {
                    type: 'line',
                    data: {
                        labels: ['Quiz 1', 'Quiz 2', 'Quiz 3', 'Quiz 4', 'Quiz 5'],
                        datasets: [{
                            label: 'Score',
                            data: studentData.performanceData,
                            borderColor: 'rgba(75, 192, 192, 1)',
                            borderWidth: 1,
                            fill: false,
                        }]
                    },
                });
            }

            // Render Subject Breakdown Chart
            const subjectChartCtx = document.getElementById('subject-chart') as HTMLCanvasElement;
            if (subjectChartCtx) {
                new Chart(subjectChartCtx.getContext('2d')!, {
                    type: 'bar',
                    data: {
                        labels: studentData.subjectData.labels,
                        datasets: [{
                            label: 'Average Score',
                            data: studentData.subjectData.scores,
                            backgroundColor: [
                                'rgba(255, 99, 132, 0.2)',
                                'rgba(54, 162, 235, 0.2)',
                                'rgba(255, 206, 86, 0.2)',
                                'rgba(75, 192, 192, 0.2)',
                                'rgba(153, 102, 255, 0.2)',
                            ],
                            borderColor: [
                                'rgba(255, 99, 132, 1)',
                                'rgba(54, 162, 235, 1)',
                                'rgba(255, 206, 86, 1)',
                                'rgba(75, 192, 192, 1)',
                                'rgba(153, 102, 255, 1)',
                            ],
                            borderWidth: 1
                        }]
                    },
                });
            }
        }
    }, [studentData]);

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        fetchStudentData(admissionNo);
    };

    if (!user) {
        return <div>Loading authentication...</div>; // Or a loading spinner
    }

    return (
        <div className="container">
            <header>
                <h1>Student Dashboard</h1>
            </header>
            <main>
                {user.role === 'student' && studentData && (
                    <div className="dashboard-view">
                        <div className="student-info">
                            <h2>Welcome, <span>{studentData.name}</span>!</h2>
                            <p>Admission Number: <span>{studentData.admissionNo}</span></p>
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
                                    <li key={index}>{quiz.name} - Score: {quiz.score}</li>
                                ))}
                            </ul>
                        </div>
                        <div className="performance-trends">
                            <h3>Performance Trends</h3>
                            <canvas id="performance-chart"></canvas>
                        </div>
                        <div className="subject-breakdown">
                            <h3>Subject Breakdown</h3>
                            <canvas id="subject-chart"></canvas>
                        </div>
                    </div>
                )}

                {(user.role === 'teacher' || user.role === 'admin') && (
                    <div className="dashboard-view">
                        <form onSubmit={handleSearchSubmit}>
                            <h3>View Student Dashboard</h3>
                            <input
                                type="text"
                                id="search-admission-no"
                                placeholder="Enter Student Admission Number"
                                value={admissionNo}
                                onChange={(e) => setAdmissionNo(e.target.value)}
                                required
                            />
                            <button type="submit">Search</button>
                        </form>
                        {studentData && (
                            <div className="student-search-results">
                                <div className="student-info">
                                    <h2>Student: <span>{studentData.name}</span></h2>
                                    <p>Admission Number: <span>{studentData.admissionNo}</span></p>
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
                                            <li key={index}>{quiz.name} - Score: {quiz.score}</li>
                                        ))}
                                    </ul>
                                </div>
                                <div className="performance-trends">
                                    <h3>Performance Trends</h3>
                                    <canvas id="performance-chart"></canvas>
                                </div>
                                <div className="subject-breakdown">
                                    <h3>Subject Breakdown</h3>
                                    <canvas id="subject-chart"></canvas>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
}
