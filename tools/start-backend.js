#!/usr/bin/env node

// Quiz Whiz Backend Server
// Provides RESTful API endpoints and handles Telegram webhooks

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const mysql = require('mysql2/promise');

class QuizWhizBackend {
    constructor() {
        this.app = express();
        this.port = process.env.BACKEND_PORT || 3001;
        this.db = null;
        this.isRunning = false;
        
        // Initialize the server
        this.initializeMiddleware();
        this.initializeRoutes();
        this.initializeDatabase();
    }

    async initializeDatabase() {
        try {
            this.db = await mysql.createConnection({
                host: process.env.DB_HOST || 'localhost',
                port: process.env.DB_PORT || 3306,
                user: process.env.DB_USER || 'root',
                password: process.env.DB_PASSWORD || '',
                database: process.env.DB_NAME || 'quiz_whiz',
                charset: 'utf8mb4'
            });

            console.log('✅ Database connection established');
            
            // Create tables if they don't exist
            await this.createTables();
            
        } catch (error) {
            console.error('❌ Database connection failed:', error.message);
            process.exit(1);
        }
    }

    async createTables() {
        try {
            // Users table
            await this.db.execute(`
                CREATE TABLE IF NOT EXISTS users (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    name VARCHAR(255) NOT NULL,
                    email VARCHAR(255) UNIQUE,
                    phone VARCHAR(20) UNIQUE NOT NULL,
                    role ENUM('student', 'teacher', 'admin') DEFAULT 'student',
                    class VARCHAR(100),
                    telegram_id VARCHAR(50) UNIQUE,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                )
            `);

            // Classes table
            await this.db.execute(`
                CREATE TABLE IF NOT EXISTS classes (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    name VARCHAR(100) NOT NULL UNIQUE,
                    description TEXT,
                    teacher_id INT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    FOREIGN KEY (teacher_id) REFERENCES users(id) ON DELETE SET NULL
                )
            `);

            // Quizzes table
            await this.db.execute(`
                CREATE TABLE IF NOT EXISTS quizzes (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    title VARCHAR(255) NOT NULL,
                    description TEXT,
                    subject VARCHAR(100),
                    questions JSON NOT NULL,
                    time_limit INT DEFAULT 3600,
                    passing_score INT DEFAULT 60,
                    status ENUM('draft', 'active', 'inactive') DEFAULT 'draft',
                    start_date DATETIME,
                    end_date DATETIME,
                    created_by INT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
                )
            `);

            // Class Quizzes table
            await this.db.execute(`
                CREATE TABLE IF NOT EXISTS class_quizzes (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    class_id INT NOT NULL,
                    quiz_id INT NOT NULL,
                    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    due_date DATETIME,
                    FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
                    FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE,
                    UNIQUE KEY unique_class_quiz (class_id, quiz_id)
                )
            `);

            // Quiz Sessions table
            await this.db.execute(`
                CREATE TABLE IF NOT EXISTS quiz_sessions (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    student_id INT NOT NULL,
                    quiz_id INT NOT NULL,
                    status ENUM('active', 'completed', 'abandoned', 'expired') DEFAULT 'active',
                    start_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    end_time TIMESTAMP NULL,
                    score INT,
                    current_question INT DEFAULT 1,
                    total_questions INT NOT NULL,
                    answers JSON,
                    time_spent INT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
                    FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE
                )
            `);

            // Bot Activity Log table
            await this.db.execute(`
                CREATE TABLE IF NOT EXISTS bot_activity_log (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    user_id INT,
                    telegram_id VARCHAR(50),
                    action VARCHAR(100) NOT NULL,
                    details JSON,
                    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
                )
            `);

            // User Preferences table
            await this.db.execute(`
                CREATE TABLE IF NOT EXISTS user_preferences (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    user_id INT NOT NULL UNIQUE,
                    language VARCHAR(10) DEFAULT 'en',
                    notifications_enabled BOOLEAN DEFAULT TRUE,
                    quiz_reminders BOOLEAN DEFAULT TRUE,
                    daily_digest BOOLEAN DEFAULT FALSE,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
                )
            `);

            console.log('✅ Database tables created/verified');
            
        } catch (error) {
            console.error('❌ Error creating tables:', error.message);
        }
    }

    initializeMiddleware() {
        // Security middleware
        this.app.use(helmet());
        
        // CORS configuration
        this.app.use(cors({
            origin: process.env.NODE_ENV === 'production' 
                ? ['https://yourdomain.com'] 
                : ['http://localhost:3000', 'http://localhost:3001'],
            credentials: true
        }));

        // Rate limiting
        const limiter = rateLimit({
            windowMs: 15 * 60 * 1000, // 15 minutes
            max: 100, // limit each IP to 100 requests per windowMs
            message: 'Too many requests from this IP, please try again later.'
        });
        this.app.use('/api/', limiter);

        // Body parsing
        this.app.use(express.json({ limit: '10mb' }));
        this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

        // Compression
        this.app.use(compression());

        // Request logging
        this.app.use((req, res, next) => {
            console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
            next();
        });
    }

    initializeRoutes() {
        // Health check endpoint
        this.app.get('/health', (req, res) => {
            res.json({ 
                status: 'healthy', 
                timestamp: new Date().toISOString(),
                uptime: process.uptime()
            });
        });

        // Bot management endpoints
        this.app.get('/api/bot-status', (req, res) => {
            res.json({
                status: 'running',
                timestamp: new Date().toISOString(),
                uptime: process.uptime(),
                database: this.db ? 'connected' : 'disconnected'
            });
        });

        this.app.post('/api/bot/start', async (req, res) => {
            try {
                // Logic to start the bot would go here
                res.json({ message: 'Bot start command received', status: 'success' });
            } catch (error) {
                res.status(500).json({ error: error.message });
            }
        });

        this.app.post('/api/bot/stop', async (req, res) => {
            try {
                // Logic to stop the bot would go here
                res.json({ message: 'Bot stop command received', status: 'success' });
            } catch (error) {
                res.status(500).json({ error: error.message });
            }
        });

        // User management endpoints
        this.app.get('/api/users', async (req, res) => {
            try {
                const [rows] = await this.db.execute(
                    'SELECT id, name, email, phone, role, class, created_at FROM users ORDER BY created_at DESC'
                );
                res.json(rows);
            } catch (error) {
                res.status(500).json({ error: error.message });
            }
        });

        this.app.post('/api/users', async (req, res) => {
            try {
                const { name, email, phone, role, class: className } = req.body;
                
                if (!name || !phone) {
                    return res.status(400).json({ error: 'Name and phone are required' });
                }

                const [result] = await this.db.execute(
                    'INSERT INTO users (name, email, phone, role, class) VALUES (?, ?, ?, ?, ?)',
                    [name, email, phone, role || 'student', className]
                );

                res.status(201).json({ 
                    id: result.insertId, 
                    message: 'User created successfully' 
                });
            } catch (error) {
                res.status(500).json({ error: error.message });
            }
        });

        this.app.get('/api/users/:id', async (req, res) => {
            try {
                const [rows] = await this.db.execute(
                    'SELECT * FROM users WHERE id = ?',
                    [req.params.id]
                );
                
                if (rows.length === 0) {
                    return res.status(404).json({ error: 'User not found' });
                }
                
                res.json(rows[0]);
            } catch (error) {
                res.status(500).json({ error: error.message });
            }
        });

        this.app.put('/api/users/:id', async (req, res) => {
            try {
                const { name, email, phone, role, class: className } = req.body;
                const userId = req.params.id;

                const [result] = await this.db.execute(
                    'UPDATE users SET name = ?, email = ?, phone = ?, role = ?, class = ? WHERE id = ?',
                    [name, email, phone, role, className, userId]
                );

                if (result.affectedRows === 0) {
                    return res.status(404).json({ error: 'User not found' });
                }

                res.json({ message: 'User updated successfully' });
            } catch (error) {
                res.status(500).json({ error: error.message });
            }
        });

        this.app.delete('/api/users/:id', async (req, res) => {
            try {
                const [result] = await this.db.execute(
                    'DELETE FROM users WHERE id = ?',
                    [req.params.id]
                );

                if (result.affectedRows === 0) {
                    return res.status(404).json({ error: 'User not found' });
                }

                res.json({ message: 'User deleted successfully' });
            } catch (error) {
                res.status(500).json({ error: error.message });
            }
        });

        // Quiz management endpoints
        this.app.get('/api/quizzes', async (req, res) => {
            try {
                const [rows] = await this.db.execute(`
                    SELECT q.*, u.name as created_by_name 
                    FROM quizzes q 
                    LEFT JOIN users u ON q.created_by = u.id 
                    ORDER BY q.created_at DESC
                `);
                res.json(rows);
            } catch (error) {
                res.status(500).json({ error: error.message });
            }
        });

        this.app.post('/api/quizzes', async (req, res) => {
            try {
                const { title, description, subject, questions, time_limit, passing_score, start_date, end_date, created_by } = req.body;
                
                if (!title || !questions) {
                    return res.status(400).json({ error: 'Title and questions are required' });
                }

                const [result] = await this.db.execute(
                    'INSERT INTO quizzes (title, description, subject, questions, time_limit, passing_score, start_date, end_date, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
                    [title, description, subject, JSON.stringify(questions), time_limit || 3600, passing_score || 60, start_date, end_date, created_by]
                );

                res.status(201).json({ 
                    id: result.insertId, 
                    message: 'Quiz created successfully' 
                });
            } catch (error) {
                res.status(500).json({ error: error.message });
            }
        });

        this.app.get('/api/quizzes/:id', async (req, res) => {
            try {
                const [rows] = await this.db.execute(
                    'SELECT * FROM quizzes WHERE id = ?',
                    [req.params.id]
                );
                
                if (rows.length === 0) {
                    return res.status(404).json({ error: 'Quiz not found' });
                }
                
                res.json(rows[0]);
            } catch (error) {
                res.status(500).json({ error: error.message });
            }
        });

        this.app.put('/api/quizzes/:id', async (req, res) => {
            try {
                const { title, description, subject, questions, time_limit, passing_score, status, start_date, end_date } = req.body;
                const quizId = req.params.id;

                const [result] = await this.db.execute(
                    'UPDATE quizzes SET title = ?, description = ?, subject = ?, questions = ?, time_limit = ?, passing_score = ?, status = ?, start_date = ?, end_date = ? WHERE id = ?',
                    [title, description, subject, JSON.stringify(questions), time_limit, passing_score, status, start_date, end_date, quizId]
                );

                if (result.affectedRows === 0) {
                    return res.status(404).json({ error: 'Quiz not found' });
                }

                res.json({ message: 'Quiz updated successfully' });
            } catch (error) {
                res.status(500).json({ error: error.message });
            }
        });

        this.app.delete('/api/quizzes/:id', async (req, res) => {
            try {
                const [result] = await this.db.execute(
                    'DELETE FROM quizzes WHERE id = ?',
                    [req.params.id]
                );

                if (result.affectedRows === 0) {
                    return res.status(404).json({ error: 'Quiz not found' });
                }

                res.json({ message: 'Quiz deleted successfully' });
            } catch (error) {
                res.status(500).json({ error: error.message });
            }
        });

        // Analytics endpoints
        this.app.get('/api/analytics/overview', async (req, res) => {
            try {
                const [userCount] = await this.db.execute('SELECT COUNT(*) as count FROM users');
                const [quizCount] = await this.db.execute('SELECT COUNT(*) as count FROM quizzes');
                const [sessionCount] = await this.db.execute('SELECT COUNT(*) as count FROM quiz_sessions');
                const [completedSessions] = await this.db.execute('SELECT COUNT(*) as count FROM quiz_sessions WHERE status = "completed"');

                res.json({
                    totalUsers: userCount[0].count,
                    totalQuizzes: quizCount[0].count,
                    totalSessions: sessionCount[0].count,
                    completedSessions: completedSessions[0].count,
                    completionRate: sessionCount[0].count > 0 ? Math.round((completedSessions[0].count / sessionCount[0].count) * 100) : 0
                });
            } catch (error) {
                res.status(500).json({ error: error.message });
            }
        });

        this.app.get('/api/analytics/user-stats', async (req, res) => {
            try {
                const [rows] = await this.db.execute(`
                    SELECT 
                        u.name,
                        COUNT(qs.id) as quiz_count,
                        ROUND(AVG(qs.score), 1) as average_score,
                        MAX(qs.score) as best_score
                    FROM users u
                    LEFT JOIN quiz_sessions qs ON u.id = qs.student_id AND qs.status = 'completed'
                    WHERE u.role = 'student'
                    GROUP BY u.id, u.name
                    ORDER BY average_score DESC
                `);
                res.json(rows);
            } catch (error) {
                res.status(500).json({ error: error.message });
            }
        });

        this.app.get('/api/analytics/quiz-performance', async (req, res) => {
            try {
                const [rows] = await this.db.execute(`
                    SELECT 
                        q.title,
                        q.subject,
                        COUNT(qs.id) as attempt_count,
                        ROUND(AVG(qs.score), 1) as average_score,
                        MIN(qs.score) as lowest_score,
                        MAX(qs.score) as highest_score
                    FROM quizzes q
                    LEFT JOIN quiz_sessions qs ON q.id = qs.quiz_id AND qs.status = 'completed'
                    GROUP BY q.id, q.title, q.subject
                    ORDER BY attempt_count DESC
                `);
                res.json(rows);
            } catch (error) {
                res.status(500).json({ error: error.message });
            }
        });

        // Telegram webhook endpoint
        this.app.post('/webhook/telegram', async (req, res) => {
            try {
                const update = req.body;
                console.log('📱 Telegram webhook received:', update.type || 'unknown');

                // Log the webhook activity
                if (update.message && update.message.from) {
                    await this.logWebhookActivity(update.message.from.id, 'webhook_received', update);
                }

                // For now, just acknowledge the webhook
                // In a full implementation, this would process the update
                res.json({ status: 'ok' });
                
            } catch (error) {
                console.error('❌ Webhook error:', error.message);
                res.status(500).json({ error: error.message });
            }
        });

        // 404 handler
        this.app.use('*', (req, res) => {
            res.status(404).json({ error: 'Endpoint not found' });
        });

        // Error handler
        this.app.use((error, req, res, next) => {
            console.error('❌ Server error:', error);
            res.status(500).json({ error: 'Internal server error' });
        });
    }

    async logWebhookActivity(telegramId, action, details) {
        try {
            if (this.db) {
                await this.db.execute(
                    'INSERT INTO bot_activity_log (telegram_id, action, details) VALUES (?, ?, ?)',
                    [telegramId, action, JSON.stringify(details)]
                );
            }
        } catch (error) {
            console.error('Error logging webhook activity:', error.message);
        }
    }

    async start() {
        try {
            // Wait for database to be ready
            while (!this.db) {
                await new Promise(resolve => setTimeout(resolve, 1000));
            }

            this.app.listen(this.port, () => {
                this.isRunning = true;
                console.log(`🚀 Quiz Whiz Backend Server running on port ${this.port}`);
                console.log(`🌐 Health check: http://localhost:${this.port}/health`);
                console.log(`📊 API docs: http://localhost:${this.port}/api/bot-status`);
                console.log(`📱 Webhook: http://localhost:${this.port}/webhook/telegram`);
            });

        } catch (error) {
            console.error('❌ Failed to start server:', error.message);
            process.exit(1);
        }
    }

    async stop() {
        if (this.isRunning) {
            this.isRunning = false;
            if (this.db) {
                await this.db.end();
                console.log('✅ Database connection closed');
            }
            console.log('✅ Backend server stopped');
        }
    }
}

// Start the server
const server = new QuizWhizBackend();

// Handle graceful shutdown
process.on('SIGINT', async () => {
    console.log('\n🛑 Shutting down backend server...');
    await server.stop();
    process.exit(0);
});

process.on('SIGTERM', async () => {
    console.log('\n🛑 Shutting down backend server...');
    await server.stop();
    process.exit(0);
});

// Start the server
server.start().catch(error => {
    console.error('❌ Server startup failed:', error.message);
    process.exit(1);
});