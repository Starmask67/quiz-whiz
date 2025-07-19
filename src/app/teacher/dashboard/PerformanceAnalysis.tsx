
'use client';

import { useState } from 'react';

// Mock data for performance analysis
const mockClassPerformance = {
  classId: 'C01', 
  className: 'Grade 5 - A',
  quizzes: [
    { quizId: 'QZ01', title: 'Photosynthesis Basics', avgScore: 82, completionRate: 95 },
    { quizId: 'QZ02', title: 'Cell Structure', avgScore: 76, completionRate: 90 },
  ]
};

const mockStudentPerformance = [
  { id: 'S001', name: 'Alice Johnson', quizzes: [{ quizId: 'QZ01', score: 88 }, { quizId: 'QZ02', score: 80 }] },
  { id: 'S003', name: 'Charlie Brown', quizzes: [{ quizId: 'QZ01', score: 75 }, { quizId: 'QZ02', score: 72 }] },
];

const mockQuizDetails = {
  quizId: 'QZ01',
  title: 'Photosynthesis Basics',
  questions: [
    { id: 'q1', text: 'What is the primary purpose of photosynthesis?', correct: 8, incorrect: 2 },
    { id: 'q2', text: 'Where do the light-dependent reactions occur?', correct: 7, incorrect: 3 },
  ]
};

export default function PerformanceAnalysis() {
  const [view, setView] = useState('class'); // 'class', 'student', or 'quiz'
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [selectedQuiz, setSelectedQuiz] = useState<any>(null);

  const renderClassView = () => (
    <div className="card">
      <div className="card-header">Overall Class Performance: {mockClassPerformance.className}</div>
      <div className="card-body">
        <table className="table">
          <thead><tr><th>Quiz Title</th><th>Avg. Score</th><th>Completion Rate</th><th>Actions</th></tr></thead>
          <tbody>
            {mockClassPerformance.quizzes.map(q => (
              <tr key={q.quizId}>
                <td>{q.title}</td>
                <td>{q.avgScore}%</td>
                <td>{q.completionRate}%</td>
                <td><button className="btn btn-sm btn-link" onClick={() => { setView('quiz'); setSelectedQuiz(mockQuizDetails); }}>View Question Analysis</button></td>
              </tr>
            ))}
          </tbody>
        </table>
        <hr />
        <h5>Student Performance</h5>
        <table className="table table-hover">
            <thead><tr><th>Student Name</th><th>Actions</th></tr></thead>
            <tbody>
                {mockStudentPerformance.map(s => (
                    <tr key={s.id}>
                        <td>{s.name}</td>
                        <td><button className="btn btn-sm btn-link" onClick={() => { setView('student'); setSelectedStudent(s); }}>View Details</button></td>
                    </tr>
                ))}
            </tbody>
        </table>
      </div>
    </div>
  );

  const renderStudentView = () => (
    <div>
      <button className="btn btn-secondary mb-3" onClick={() => setView('class')}>Back to Class View</button>
      <div className="card">
        <div className="card-header">Performance for: {selectedStudent.name}</div>
        <div className="card-body">
            <table className="table">
                <thead><tr><th>Quiz Title</th><th>Score</th></tr></thead>
                <tbody>
                    {selectedStudent.quizzes.map((q: any) => (
                        <tr key={q.quizId}>
                            <td>{mockClassPerformance.quizzes.find(mq => mq.quizId === q.quizId)?.title}</td>
                            <td>{q.score}%</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
      </div>
    </div>
  );

  const renderQuizView = () => (
    <div>
        <button className="btn btn-secondary mb-3" onClick={() => setView('class')}>Back to Class View</button>
        <div className="card">
            <div className="card-header">Question Analysis for: {selectedQuiz.title}</div>
            <div className="card-body">
                <table className="table">
                    <thead><tr><th>Question</th><th>Correct Answers</th><th>Incorrect Answers</th></tr></thead>
                    <tbody>
                        {selectedQuiz.questions.map((q: any) => (
                            <tr key={q.id}>
                                <td>{q.text}</td>
                                <td>{q.correct}</td>
                                <td>{q.incorrect}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    </div>
  );

  return (
    <div>
      <h3>Performance Analysis</h3>
      {view === 'class' && renderClassView()}
      {view === 'student' && selectedStudent && renderStudentView()}
      {view === 'quiz' && selectedQuiz && renderQuizView()}
    </div>
  );
}
