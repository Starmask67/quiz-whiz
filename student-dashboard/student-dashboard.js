
document.addEventListener('DOMContentLoaded', () => {
    const studentView = document.getElementById('student-view');
    const teacherAdminView = document.getElementById('teacher-admin-view');
    const studentSearchForm = document.getElementById('student-search-form');
    const searchAdmissionNo = document.getElementById('search-admission-no');

    // Mock user role for demonstration purposes
    const userRole = 'student'; // or 'teacher', 'admin'

    if (userRole === 'student') {
        studentView.style.display = 'block';
        // Fetch and display student data
        displayStudentData('12345'); // Mock admission number
    } else {
        teacherAdminView.style.display = 'block';
    }

    studentSearchForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const admissionNo = searchAdmissionNo.value;
        studentView.style.display = 'block';
        displayStudentData(admissionNo);
    });

    function displayStudentData(admissionNo) {
        // Mock data for demonstration
        const studentData = {
            name: 'Alen',
            admissionNo: admissionNo,
            averageScore: 85,
            totalQuizzes: 20,
            rank: 5,
            recentQuizzes: [
                { name: 'Math Quiz 1', score: 80 },
                { name: 'Science Quiz 1', score: 90 },
                { name: 'History Quiz 1', score: 75 },
            ],
            performanceData: [60, 75, 80, 85, 90],
            subjectData: {
                labels: ['Math', 'Science', 'History', 'English', 'Art'],
                scores: [80, 90, 75, 88, 92],
            },
        };

        document.getElementById('student-name').textContent = studentData.name;
        document.getElementById('student-admission-no').textContent = studentData.admissionNo;
        document.getElementById('average-score').textContent = studentData.averageScore;
        document.getElementById('total-quizzes').textContent = studentData.totalQuizzes;
        document.getElementById('student-rank').textContent = studentData.rank;

        const recentQuizzesList = document.getElementById('recent-quizzes');
        recentQuizzesList.innerHTML = '';
        studentData.recentQuizzes.forEach(quiz => {
            const listItem = document.createElement('li');
            listItem.textContent = `${quiz.name} - Score: ${quiz.score}`;
            recentQuizzesList.appendChild(listItem);
        });

        // Performance Chart
        const performanceChartCtx = document.getElementById('performance-chart').getContext('2d');
        new Chart(performanceChartCtx, {
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

        // Subject Breakdown Chart
        const subjectChartCtx = document.getElementById('subject-chart').getContext('2d');
        new Chart(subjectChartCtx, {
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
});
