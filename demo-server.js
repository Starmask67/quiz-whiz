// Quiz Whiz Demo Server - Simple Web Preview
const express = require('express');
const path = require('path');

const app = express();
const port = 3000;

// Serve static files
app.use(express.static('public'));
app.use(express.json());

// Demo data
const demoData = {
    schools: [{ id: 'SCH001', name: 'Demo School', students: 156 }],
    users: [
        { id: 'ADM001', name: 'Admin User', role: 'admin', phone: '+1234567890' },
        { id: 'TCH001', name: 'Sarah Teacher', role: 'teacher', phone: '+1122334455' },
        { id: 'STU001', name: 'Alice Johnson', role: 'student', phone: '+1987654321', class: '5A' },
        { id: 'STU002', name: 'Bob Smith', role: 'student', phone: '+1555666777', class: '5A' },
        { id: 'STU003', name: 'Charlie Brown', role: 'student', phone: '+1999888777', class: '5B' }
    ],
    quizzes: [
        { 
            id: 'QZ001', 
            title: 'Science Quiz - Photosynthesis', 
            class: '5A', 
            subject: 'Science',
            questions: 10,
            sent_to: 25,
            completed: 18,
            avg_score: 84
        },
        { 
            id: 'QZ002', 
            title: 'Math Quiz - Fractions', 
            class: '5B', 
            subject: 'Mathematics',
            questions: 10,
            sent_to: 22,
            completed: 20,
            avg_score: 78
        }
    ],
    performance: {
        'STU001': { name: 'Alice Johnson', avg_score: 92, total_quizzes: 8, rank: 1 },
        'STU002': { name: 'Bob Smith', avg_score: 85, total_quizzes: 7, rank: 3 },
        'STU003': { name: 'Charlie Brown', avg_score: 78, total_quizzes: 6, rank: 5 }
    }
};

// Routes
app.get('/', (req, res) => {
    res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Quiz Whiz - AI-Powered Educational Platform</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            color: #333;
        }
        .container { max-width: 1200px; margin: 0 auto; padding: 20px; }
        .header { 
            background: white; 
            padding: 2rem; 
            border-radius: 15px; 
            text-align: center; 
            margin-bottom: 2rem;
            box-shadow: 0 10px 30px rgba(0,0,0,0.1);
        }
        .header h1 { 
            color: #667eea; 
            font-size: 3rem; 
            margin-bottom: 0.5rem; 
            font-weight: 700;
        }
        .header p { 
            color: #666; 
            font-size: 1.2rem; 
            margin-bottom: 1rem;
        }
        .status { 
            display: inline-block; 
            background: #4CAF50; 
            color: white; 
            padding: 0.5rem 1rem; 
            border-radius: 25px; 
            font-weight: 600;
        }
        .dashboard { 
            display: grid; 
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); 
            gap: 2rem; 
            margin-bottom: 2rem;
        }
        .card { 
            background: white; 
            padding: 2rem; 
            border-radius: 15px; 
            box-shadow: 0 10px 30px rgba(0,0,0,0.1);
            transition: transform 0.3s ease;
        }
        .card:hover { transform: translateY(-5px); }
        .card h3 { 
            color: #667eea; 
            margin-bottom: 1rem; 
            font-size: 1.3rem;
        }
        .stat { 
            display: flex; 
            justify-content: space-between; 
            margin-bottom: 0.5rem;
            padding: 0.5rem 0;
            border-bottom: 1px solid #f0f0f0;
        }
        .stat:last-child { border-bottom: none; }
        .stat-value { 
            font-weight: 600; 
            color: #4CAF50;
        }
        .quiz-item { 
            background: #f8f9ff; 
            padding: 1rem; 
            border-radius: 8px; 
            margin-bottom: 1rem;
            border-left: 4px solid #667eea;
        }
        .quiz-title { 
            font-weight: 600; 
            color: #333; 
            margin-bottom: 0.5rem;
        }
        .quiz-details { 
            color: #666; 
            font-size: 0.9rem;
        }
        .btn { 
            background: #667eea; 
            color: white; 
            padding: 0.8rem 1.5rem; 
            border: none; 
            border-radius: 8px; 
            cursor: pointer; 
            font-size: 1rem;
            transition: background 0.3s ease;
            text-decoration: none;
            display: inline-block;
            margin: 0.5rem 0.5rem 0.5rem 0;
        }
        .btn:hover { background: #5a67d8; }
        .btn-success { background: #4CAF50; }
        .btn-success:hover { background: #45a049; }
        .telegram-demo { 
            background: white; 
            padding: 2rem; 
            border-radius: 15px; 
            margin-bottom: 2rem;
            box-shadow: 0 10px 30px rgba(0,0,0,0.1);
        }
        .chat-simulation { 
            background: #e8f4f8; 
            padding: 1rem; 
            border-radius: 10px; 
            font-family: monospace;
            margin: 1rem 0;
        }
        .bot-message { 
            background: #0088cc; 
            color: white; 
            padding: 0.5rem 1rem; 
            border-radius: 15px 15px 15px 5px; 
            margin: 0.5rem 0;
            display: inline-block;
            max-width: 80%;
        }
        .user-message { 
            background: #4CAF50; 
            color: white; 
            padding: 0.5rem 1rem; 
            border-radius: 15px 15px 5px 15px; 
            margin: 0.5rem 0;
            display: inline-block;
            max-width: 80%;
            float: right;
            clear: both;
        }
        .features { 
            display: grid; 
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); 
            gap: 1.5rem; 
            margin-top: 2rem;
        }
        .feature { 
            background: white; 
            padding: 1.5rem; 
            border-radius: 10px; 
            text-align: center;
            box-shadow: 0 5px 15px rgba(0,0,0,0.1);
        }
        .feature-icon { 
            font-size: 3rem; 
            margin-bottom: 1rem;
        }
        .api-endpoints { 
            background: #f8f9ff; 
            padding: 1rem; 
            border-radius: 8px; 
            margin-top: 1rem;
            font-family: monospace;
        }
        .footer { 
            text-align: center; 
            color: white; 
            margin-top: 2rem; 
            padding: 1rem;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎓 Quiz Whiz</h1>
            <p>AI-Powered Educational Quiz Platform with Telegram Integration</p>
            <span class="status">✅ All Systems Online</span>
        </div>

        <div class="dashboard">
            <div class="card">
                <h3>📊 System Overview</h3>
                <div class="stat">
                    <span>Total Schools</span>
                    <span class="stat-value">${demoData.schools.length}</span>
                </div>
                <div class="stat">
                    <span>Total Users</span>
                    <span class="stat-value">${demoData.users.length}</span>
                </div>
                <div class="stat">
                    <span>Active Quizzes</span>
                    <span class="stat-value">${demoData.quizzes.length}</span>
                </div>
                <div class="stat">
                    <span>Total Students</span>
                    <span class="stat-value">156</span>
                </div>
            </div>

            <div class="card">
                <h3>🤖 AI Quiz Generation</h3>
                <div class="quiz-item">
                    <div class="quiz-title">📄 PDF Processing</div>
                    <div class="quiz-details">✅ Extract text from textbooks</div>
                </div>
                <div class="quiz-item">
                    <div class="quiz-title">🧠 Gemini 2.5 Flash</div>
                    <div class="quiz-details">✅ Generate 10 MCQ questions</div>
                </div>
                <div class="quiz-item">
                    <div class="quiz-title">🎯 Smart Targeting</div>
                    <div class="quiz-details">✅ Send to specific classes</div>
                </div>
            </div>

            <div class="card">
                <h3>📱 Telegram Integration</h3>
                <div class="stat">
                    <span>Bot Status</span>
                    <span class="stat-value">🟢 Online</span>
                </div>
                <div class="stat">
                    <span>Registered Students</span>
                    <span class="stat-value">142</span>
                </div>
                <div class="stat">
                    <span>Messages Sent Today</span>
                    <span class="stat-value">84</span>
                </div>
                <div class="stat">
                    <span>Active Quiz Sessions</span>
                    <span class="stat-value">12</span>
                </div>
            </div>
        </div>

        <div class="telegram-demo">
            <h3>📱 Telegram Bot Demo Experience</h3>
            <p>Here's how students interact with Quiz Whiz via Telegram:</p>
            
            <div class="chat-simulation">
                <div class="bot-message">🎓 New Quiz: Science - Photosynthesis<br>📚 Subject: Science<br>❓ Questions: 10<br>⏰ Time: 30 minutes<br><br>Good luck! 🍀</div>
                <br><br>
                <div class="bot-message">📝 Question 1/10<br><br>What is the primary function of chlorophyll in plants?<br><br>A) To absorb water<br>B) To capture light energy<br>C) To produce oxygen<br>D) To store nutrients<br><br>💬 Reply with A, B, C, or D</div>
                <div class="user-message">B</div>
                <br><br>
                <div class="bot-message">✅ Correct! Well done! 🎉<br><br>💡 Chlorophyll captures light energy for photosynthesis</div>
                <br><br>
                <div class="bot-message">🏁 Quiz Completed!<br><br>📊 Your Score: 8/10 (80%)<br><br>🌟 Excellent work! You're doing great! 🎉</div>
            </div>
        </div>

        <div class="card">
            <h3>🎯 Recent Quiz Activity</h3>
            ${demoData.quizzes.map(quiz => `
                <div class="quiz-item">
                    <div class="quiz-title">${quiz.title}</div>
                    <div class="quiz-details">
                        Class: ${quiz.class} | Subject: ${quiz.subject}<br>
                        Sent to: ${quiz.sent_to} students | Completed: ${quiz.completed}<br>
                        Average Score: ${quiz.avg_score}%
                    </div>
                </div>
            `).join('')}
        </div>

        <div class="features">
            <div class="feature">
                <div class="feature-icon">🧠</div>
                <h4>AI-Powered</h4>
                <p>Uses Google Gemini 2.5 Flash to generate intelligent questions from any textbook content</p>
            </div>
            <div class="feature">
                <div class="feature-icon">📱</div>
                <h4>Telegram Native</h4>
                <p>Students receive quizzes directly on Telegram - no app downloads required</p>
            </div>
            <div class="feature">
                <div class="feature-icon">⚡</div>
                <h4>Instant Feedback</h4>
                <p>Real-time scoring and explanations enhance learning experience</p>
            </div>
            <div class="feature">
                <div class="feature-icon">📊</div>
                <h4>Smart Analytics</h4>
                <p>Comprehensive performance tracking for students, teachers, and administrators</p>
            </div>
        </div>

        <div class="card">
            <h3>🔧 API Endpoints (Testing)</h3>
            <div class="api-endpoints">
GET /health - System health check<br>
GET /api/tools/bot/status - Bot status<br>
POST /api/tools/quiz/generate - Generate AI quiz<br>
POST /api/tools/quiz/send-to-class - Send to students<br>
GET /api/tools/analytics/student/:id - Performance data
            </div>
            <a href="/health" class="btn btn-success" target="_blank">Test Health Check</a>
            <a href="/api/demo/bot-status" class="btn">Test Bot Status</a>
            <a href="/api/demo/quiz-data" class="btn">Test Quiz Data</a>
        </div>

        <div class="footer">
            <p>🎓 Quiz Whiz - Revolutionizing Education Through AI and Instant Messaging</p>
            <p>Built with Node.js, Express, Telegram Bot API, and Google Gemini AI</p>
        </div>
    </div>
</body>
</html>
    `);
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        services: {
            database: true,
            telegramBot: true,
            geminiAI: true,
            application: true
        },
        version: '1.0.0'
    });
});

// Demo API endpoints
app.get('/api/demo/bot-status', (req, res) => {
    res.json({
        success: true,
        status: {
            running: true,
            initialized: true,
            registered_students: 142,
            active_sessions: 12,
            messages_today: 84
        }
    });
});

app.get('/api/demo/quiz-data', (req, res) => {
    res.json({
        success: true,
        quizzes: demoData.quizzes,
        performance: demoData.performance,
        total_students: 156,
        active_quizzes: 2
    });
});

// Start server
app.listen(port, () => {
    console.log('🎓 Quiz Whiz Demo Server Started!');
    console.log('================================');
    console.log(`📍 URL: http://localhost:${port}`);
    console.log(`🏥 Health: http://localhost:${port}/health`);
    console.log(`🤖 Bot Status: http://localhost:${port}/api/demo/bot-status`);
    console.log(`📊 Quiz Data: http://localhost:${port}/api/demo/quiz-data`);
    console.log('\n🌟 Open your browser to see the Quiz Whiz platform!');
});