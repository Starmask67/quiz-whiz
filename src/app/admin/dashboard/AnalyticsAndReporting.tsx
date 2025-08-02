
'use client';

import { useState } from 'react';
// In a real app, you would use a charting library like Chart.js or Recharts.
// For this example, we'll use placeholder components for charts.

// Mock Data
const mockAnalyticsData = {
  overview: {
    totalStudents: 150,
    totalTeachers: 12,
    quizzesTaken: 1240,
    averageScore: 78.5,
  },
  performanceByClass: [
    { id: 'C01', name: 'Grade 5 - A', avgScore: 85, completionRate: 95 },
    { id: 'C02', name: 'Grade 5 - B', avgScore: 72, completionRate: 90 },
    { id: 'C03', name: 'Grade 4 - A', avgScore: 81, completionRate: 98 },
  ],
  studentLeaderboard: [
    { id: 'S001', name: 'Alice Johnson', score: 99, class: 'Grade 5 - A' },
    { id: 'S005', name: 'Eve Davis', score: 97, class: 'Grade 4 - A' },
    { id: 'S003', name: 'Charlie Brown', score: 95, class: 'Grade 5 - A' },
  ],
  engagement: {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    quizzesTaken: {
      'all': [50, 60, 80, 75, 90, 110, 120],
      'C01': [10, 12, 15, 14, 18, 25, 28],
      'C02': [8, 10, 13, 12, 15, 20, 22],
      'C03': [15, 18, 22, 20, 25, 30, 35],
    }
  },
  classes: [
      { id: 'all', name: 'All Classes' },
      { id: 'C01', name: 'Grade 5 - A' },
      { id: 'C02', name: 'Grade 5 - B' },
      { id: 'C03', name: 'Grade 4 - A' },
  ]
};

// Placeholder for a chart component
const ChartPlaceholder = ({ title, data }: { title: string, data: any }) => (
  <div className="card h-100">
    <div className="card-body">
      <h5 className="card-title">{title}</h5>
      <div className="d-flex align-items-center justify-content-center bg-light" style={{ height: '250px' }}>
        <p className="text-muted">Chart showing data for the selection.</p>
        {/* In a real app, you'd render a chart here using the 'data' prop */}
      </div>
    </div>
  </div>
);

export default function AnalyticsAndReporting() {
  const { overview, performanceByClass, studentLeaderboard, engagement, classes } = mockAnalyticsData;
  const [selectedClass, setSelectedClass] = useState('all');

  const getChartTitle = () => {
    const className = classes.find(c => c.id === selectedClass)?.name || 'All Classes';
    return `Weekly Quiz Engagement - ${className}`;
  };

  return (
    <div>
      <h3>Analytics & Reporting</h3>

      {/* Overview Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
        <div className="card" style={{ 
          background: 'white', 
          border: '1px solid var(--gray-200)',
          borderLeft: '4px solid var(--primary-600)',
          boxShadow: 'var(--shadow-sm)',
          transition: 'box-shadow var(--transition-normal)'
        }}>
          <div className="card-body">
            <h5 className="card-title" style={{ color: 'var(--gray-600)', fontSize: '0.875rem', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Total Students</h5>
            <p style={{ fontSize: '2rem', fontWeight: '700', margin: 0, color: 'var(--primary-600)' }}>{overview.totalStudents}</p>
          </div>
        </div>
        <div className="card" style={{ 
          background: 'white', 
          border: '1px solid var(--gray-200)',
          borderLeft: '4px solid var(--primary-400)',
          boxShadow: 'var(--shadow-sm)',
          transition: 'box-shadow var(--transition-normal)'
        }}>
          <div className="card-body">
            <h5 className="card-title" style={{ color: 'var(--gray-600)', fontSize: '0.875rem', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Quizzes Taken</h5>
            <p style={{ fontSize: '2rem', fontWeight: '700', margin: 0, color: 'var(--primary-400)' }}>{overview.quizzesTaken}</p>
          </div>
        </div>
        <div className="card" style={{ 
          background: 'white', 
          border: '1px solid var(--gray-200)',
          borderLeft: '4px solid var(--success-600)',
          boxShadow: 'var(--shadow-sm)',
          transition: 'box-shadow var(--transition-normal)'
        }}>
          <div className="card-body">
            <h5 className="card-title" style={{ color: 'var(--gray-600)', fontSize: '0.875rem', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Average Score</h5>
            <p style={{ fontSize: '2rem', fontWeight: '700', margin: 0, color: 'var(--success-600)' }}>{overview.averageScore}%</p>
          </div>
        </div>
        <div className="card" style={{ 
          background: 'white', 
          border: '1px solid var(--gray-200)',
          borderLeft: '4px solid var(--gray-600)',
          boxShadow: 'var(--shadow-sm)',
          transition: 'box-shadow var(--transition-normal)'
        }}>
          <div className="card-body">
            <h5 className="card-title" style={{ color: 'var(--gray-600)', fontSize: '0.875rem', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Total Teachers</h5>
            <p style={{ fontSize: '2rem', fontWeight: '700', margin: 0, color: 'var(--gray-600)' }}>{overview.totalTeachers}</p>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div className="card">
            <div style={{ 
              padding: '1rem 1.5rem', 
              borderBottom: '1px solid var(--gray-200)', 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center' 
            }}>
                <h5 style={{ margin: 0 }}>Engagement Filters</h5>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <div>
                        <label htmlFor="classFilter" className="form-label" style={{ fontSize: '0.875rem' }}>Class</label>
                        <select id="classFilter" className="form-select" style={{ fontSize: '0.875rem' }} value={selectedClass} onChange={e => setSelectedClass(e.target.value)}>
                            {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </div>
                    {/* Division filter can be added here when data supports it */}
                </div>
            </div>
            <div className="card-body">
                <ChartPlaceholder title={getChartTitle()} data={engagement.quizzesTaken[selectedClass as keyof typeof engagement.quizzesTaken]} />
            </div>
        </div>
      </div>

      {/* Data Tables */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem' }}>
        <div>
          <div className="card">
            <div className="card-header">Performance by Class</div>
            <div className="card-body">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>Class</th>
                    <th>Avg. Score</th>
                    <th>Completion Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {performanceByClass.map(c => (
                    <tr key={c.id}>
                      <td>{c.name}</td>
                      <td>{c.avgScore}%</td>
                      <td>{c.completionRate}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <div>
          <div className="card">
            <div className="card-header">Student Leaderboard</div>
            <div className="card-body">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Class</th>
                    <th>Score</th>
                  </tr>
                </thead>
                <tbody>
                  {studentLeaderboard.map(s => (
                    <tr key={s.id}>
                      <td>{s.name}</td>
                      <td>{s.class}</td>
                      <td>{s.score}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
