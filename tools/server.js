#!/usr/bin/env node

// Quiz Whiz Telegram Bot Backend Server
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const mysql = require('mysql2/promise');
const TelegramBot = require('node-telegram-bot-api');

class QuizWhizBackend {
    constructor() {
        this.app = express();
        this.db = null;
        this.bot = null;
        this.isRunning = false;
        this.port = process.env.PORT || 3001;
        
        this.setupMiddleware();
        this.setupRoutes();
        this.setupErrorHandling();
    }

    setupMiddleware() {
        // Security middleware
        this.app.use(helmet());
        
        // CORS configuration
        this.app.use(cors({
            origin: process.env.FRONTEND_URL || 'http://localhost:3000',
            credentials: true
        }));
        
        // Rate limiting
        const limiter = rateLimit({
            windowMs: 15 * 60 * 1000, // 15 minutes
            max: 100, // limit each IP to 100 requests per windowMs
            message: 'Too many requests from this IP, please try again later.'
        });
        this.app.use('/api/', limiter);
        
        // Compression
        this.app.use(compression());
        
        // Body parsing
        this.app.use(express.json({ limit: '10mb' }));
        this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));
        
        // Request logging
        this.app.use((req, res, next) => {
            console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
            next();
        });
    }

    setupRoutes() {
        // Health check
        this.app.get('/health', (req, res) => {
            res.json({ 
                status: 'healthy', 
                timestamp: new Date().toISOString(),
                bot: this.isRunning ? 'running' : 'stopped'
            });
        });

        // Bot management API
        this.app.use('/api/bot', this.createBotRoutes());
        
        // Quiz management API
        this.app.use('/api/quiz', this.createQuizRoutes());
        
        // User management API
        this.app.use('/api/user', this.createUserRoutes());
        
        // Analytics API
        this.app.use('/api/analytics', this.createAnalyticsRoutes());
        
        // Webhook endpoint for Telegram
        this.app.post('/webhook/telegram', this.handleTelegramWebhook.bind(this));
        
        // Default route
        this.app.get('/', (req, res) => {
            res.json({
                message: 'Quiz Whiz Telegram Bot Backend',
                version: '1.0.0',
                status: 'running',
                endpoints: {
                    health: '/health',
                    bot: '/api/bot',
                    quiz: '/api/quiz',
                    user: '/api/user',
                    analytics: '/api/analytics',
                    webhook: '/webhook/telegram'
                }
            });
        });
    }

    createBotRoutes() {
        const router = express.Router();
        
        // Get bot status
        router.get('/status', async (req, res) => {
            try {
                const status = await this.getBotStatus();
                res.json({ success: true, status });
            } catch (error) {
                res.status(500).json({ success: false, message: error.message });
            }
        });
        
        // Start bot
        router.post('/start', async (req, res) => {
            try {
                await this.startBot();
                res.json({ success: true, message: 'Bot started successfully' });
            } catch (error) {
                res.status(500).json({ success: false, message: error.message });
            }
        });
        
        // Stop bot
        router.post('/stop', async (req, res) => {
            try {
                await this.stopBot();
                res.json({ success: true, message: 'Bot stopped successfully' });
            } catch (error) {
                res.status(500).json({ success: false, message: error.message });
            }
        });
        
        // Restart bot
        router.post('/restart', async (req, res) => {
            try {
                await this.restartBot();
                res.json({ success: true, message: 'Bot restarted successfully' });
            } catch (error) {
                res.status(500).json({ success: false, message: error.message });
            }
        });
        
        // Send test message
        router.post('/test-message', async (req, res) => {
            try {
                const { chatId, message } = req.body;
                if (!chatId || !message) {
                    return res.status(400).json({ 
                        success: false, 
                        message: 'chatId and message are required' 
                    });
                }
                
                await this.sendTestMessage(chatId, message);
                res.json({ success: true, message: 'Test message sent successfully' });
            } catch (error) {
                res.status(500).json({ success: false, message: error.message });
            }
        });
        
        // Get bot info
        router.get('/info', async (req, res) => {
            try {
                if (!this.bot) {
                    return res.status(400).json({ 
                        success: false, 
                        message: 'Bot is not running' 
                    });
                }
                
                const botInfo = await this.bot.getMe();
                res.json({ success: true, botInfo });
            } catch (error) {
                res.status(500).json({ success: false, message: error.message });
            }
        });
        
        // Get webhook info
        router.get('/webhook-info', async (req, res) => {
            try {
                if (!this.bot) {
                    return res.status(400).json({ 
                        success: false, 
                        message: 'Bot is not running' 
                    });
                }
                
                const webhookInfo = await this.bot.getWebhookInfo();
                res.json({ success: true, webhookInfo });
            } catch (error) {
                res.status(500).json({ success: false, message: error.message });
            }
        });
        
        // Set webhook
        router.post('/set-webhook', async (req, res) => {
            try {
                const { url } = req.body;
                if (!url) {
                    return res.status(400).json({ 
                        success: false, 
                        message: 'URL is required' 
                    });
                }
                
                await this.setWebhook(url);
                res.json({ success: true, message: 'Webhook set successfully' });
            } catch (error) {
                res.status(500).json({ success: false, message: error.message });
            }
        });
        
        // Delete webhook
        router.post('/delete-webhook', async (req, res) => {
            try {
                await this.deleteWebhook();
                res.json({ success: true, message: 'Webhook deleted successfully' });
            } catch (error) {
                res.status(500).json({ success: false, message: error.message });
            }
        });
        
        return router;
    }

    createQuizRoutes() {
        const router = express.Router();
        
        // Get all quizzes
        router.get('/', async (req, res) => {
            try {
                const quizzes = await this.getAllQuizzes();
                res.json({ success: true, quizzes });
            } catch (error) {
                res.status(500).json({ success: false, message: error.message });
            }
        });
        
        // Get quiz by ID
        router.get('/:id', async (req, res) => {
            try {
                const { id } = req.params;
                const quiz = await this.getQuizById(id);
                
                if (!quiz) {
                    return res.status(404).json({ 
                        success: false, 
                        message: 'Quiz not found' 
                    });
                }
                
                res.json({ success: true, quiz });
            } catch (error) {
                res.status(500).json({ success: false, message: error.message });
            }
        });
        
        // Create new quiz
        router.post('/', async (req, res) => {
            try {
                const quizData = req.body;
                const quiz = await this.createQuiz(quizData);
                res.json({ success: true, quiz });
            } catch (error) {
                res.status(500).json({ success: false, message: error.message });
            }
        });
        
        // Update quiz
        router.put('/:id', async (req, res) => {
            try {
                const { id } = req.params;
                const updateData = req.body;
                const quiz = await this.updateQuiz(id, updateData);
                res.json({ success: true, quiz });
            } catch (error) {
                res.status(500).json({ success: false, message: error.message });
            }
        });
        
        // Delete quiz
        router.delete('/:id', async (req, res) => {
            try {
                const { id } = req.params;
                await this.deleteQuiz(id);
                res.json({ success: true, message: 'Quiz deleted successfully' });
            } catch (error) {
                res.status(500).json({ success: false, message: error.message });
            }
        });
        
        // Get quiz sessions
        router.get('/:id/sessions', async (req, res) => {
            try {
                const { id } = req.params;
                const sessions = await this.getQuizSessions(id);
                res.json({ success: true, sessions });
            } catch (error) {
                res.status(500).json({ success: false, message: error.message });
            }
        });
        
        // Assign quiz to class
        router.post('/:id/assign', async (req, res) => {
            try {
                const { id } = req.params;
                const { classId } = req.body;
                
                if (!classId) {
                    return res.status(400).json({ 
                        success: false, 
                        message: 'classId is required' 
                    });
                }
                
                await this.assignQuizToClass(id, classId);
                res.json({ success: true, message: 'Quiz assigned to class successfully' });
            } catch (error) {
                res.status(500).json({ success: false, message: error.message });
            }
        });
        
        return router;
    }

    createUserRoutes() {
        const router = express.Router();
        
        // Get all users
        router.get('/', async (req, res) => {
            try {
                const users = await this.getAllUsers();
                res.json({ success: true, users });
            } catch (error) {
                res.status(500).json({ success: false, message: error.message });
            }
        });
        
        // Get user by ID
        router.get('/:id', async (req, res) => {
            try {
                const { id } = req.params;
                const user = await this.getUserById(id);
                
                if (!user) {
                    return res.status(404).json({ 
                        success: false, 
                        message: 'User not found' 
                    });
                }
                
                res.json({ success: true, user });
            } catch (error) {
                res.status(500).json({ success: false, message: error.message });
            }
        });
        
        // Get user by Telegram ID
        router.get('/telegram/:telegramId', async (req, res) => {
            try {
                const { telegramId } = req.params;
                const user = await this.getUserByTelegramId(telegramId);
                
                if (!user) {
                    return res.status(404).json({ 
                        success: false, 
                        message: 'User not found' 
                    });
                }
                
                res.json({ success: true, user });
            } catch (error) {
                res.status(500).json({ success: false, message: error.message });
            }
        });
        
        // Update user
        router.put('/:id', async (req, res) => {
            try {
                const { id } = req.params;
                const updateData = req.body;
                const user = await this.updateUser(id, updateData);
                res.json({ success: true, user });
            } catch (error) {
                res.status(500).json({ success: false, message: error.message });
            }
        });
        
        // Delete user
        router.delete('/:id', async (req, res) => {
            try {
                const { id } = req.params;
                await this.deleteUser(id);
                res.json({ success: true, message: 'User deleted successfully' });
            } catch (error) {
                res.status(500).json({ success: false, message: error.message });
            }
        });
        
        // Get user quiz sessions
        router.get('/:id/sessions', async (req, res) => {
            try {
                const { id } = req.params;
                const sessions = await this.getUserSessions(id);
                res.json({ success: true, sessions });
            } catch (error) {
                res.status(500).json({ success: false, message: error.message });
            }
        });
        
        // Register user with Telegram
        router.post('/register-telegram', async (req, res) => {
            try {
                const { phoneNumber, telegramId, firstName, lastName } = req.body;
                
                if (!phoneNumber || !telegramId) {
                    return res.status(400).json({ 
                        success: false, 
                        message: 'phoneNumber and telegramId are required' 
                    });
                }
                
                const user = await this.registerUserWithTelegram(phoneNumber, telegramId, firstName, lastName);
                res.json({ success: true, user });
            } catch (error) {
                res.status(500).json({ success: false, message: error.message });
            }
        });
        
        return router;
    }

    createAnalyticsRoutes() {
        const router = express.Router();
        
        // Get bot usage statistics
        router.get('/bot-usage', async (req, res) => {
            try {
                const stats = await this.getBotUsageStats();
                res.json({ success: true, stats });
            } catch (error) {
                res.status(500).json({ success: false, message: error.message });
            }
        });
        
        // Get quiz performance statistics
        router.get('/quiz-performance', async (req, res) => {
            try {
                const stats = await this.getQuizPerformanceStats();
                res.json({ success: true, stats });
            } catch (error) {
                res.status(500).json({ success: false, message: error.message });
            }
        });
        
        // Get user engagement statistics
        router.get('/user-engagement', async (req, res) => {
            try {
                const stats = await this.getUserEngagementStats();
                res.json({ success: true, stats });
            } catch (error) {
                res.status(500).json({ success: false, message: error.message });
            }
        });
        
        // Get activity log
        router.get('/activity-log', async (req, res) => {
            try {
                const { limit = 100, offset = 0, action, userId } = req.query;
                const logs = await this.getActivityLog(limit, offset, action, userId);
                res.json({ success: true, logs });
            } catch (error) {
                res.status(500).json({ success: false, message: error.message });
            }
        });
        
        return router;
    }

    setupErrorHandling() {
        // 404 handler
        this.app.use((req, res) => {
            res.status(404).json({ 
                success: false, 
                message: 'Endpoint not found' 
            });
        });
        
        // Global error handler
        this.app.use((error, req, res, next) => {
            console.error('Global error:', error);
            res.status(500).json({ 
                success: false, 
                message: 'Internal server error',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        });
    }

    async initializeDatabase() {
        try {
            this.db = await mysql.createConnection({
                host: process.env.DB_HOST || 'localhost',
                port: process.env.DB_PORT || 3306,
                user: process.env.DB_USER || 'root',
                password: process.env.DB_PASSWORD || '',
                database: process.env.DB_NAME || 'quiz_whiz'
            });
            
            console.log('✅ Database connected successfully');
            
            // Create required tables if they don't exist
            await this.createTablesIfNotExist();
            
        } catch (error) {
            console.error('❌ Database connection failed:', error.message);
            throw error;
        }
    }

    async createTablesIfNotExist() {
        try {
            // Add telegram_id to users table if it doesn't exist
            await this.db.execute(`
                ALTER TABLE users ADD COLUMN IF NOT EXISTS telegram_id VARCHAR(50) UNIQUE
            `);

            // Create quiz_sessions table if it doesn't exist
            await this.db.execute(`
                CREATE TABLE IF NOT EXISTS quiz_sessions (
                    id INT PRIMARY KEY AUTO_INCREMENT,
                    student_id INT NOT NULL,
                    quiz_id INT NOT NULL,
                    status ENUM('active', 'completed', 'expired') DEFAULT 'active',
                    start_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    end_time TIMESTAMP NULL,
                    score DECIMAL(5,2) NULL,
                    current_question INT DEFAULT 1,
                    total_questions INT NOT NULL,
                    answers JSON NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
                    FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE,
                    INDEX idx_student_status (student_id, status),
                    INDEX idx_quiz_status (quiz_id, status)
                )
            `);

            // Create bot_activity_log table if it doesn't exist
            await this.db.execute(`
                CREATE TABLE IF NOT EXISTS bot_activity_log (
                    id INT PRIMARY KEY AUTO_INCREMENT,
                    user_id INT NULL,
                    telegram_id VARCHAR(50) NULL,
                    action VARCHAR(100) NOT NULL,
                    details JSON NULL,
                    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
                    INDEX idx_telegram_id (telegram_id),
                    INDEX idx_timestamp (timestamp)
                )
            `);

            console.log('✅ Database tables verified/created');
        } catch (error) {
            console.error('❌ Error creating tables:', error.message);
        }
    }

    async initializeBot() {
        try {
            const token = process.env.TELEGRAM_BOT_TOKEN;
            if (!token) {
                throw new Error('TELEGRAM_BOT_TOKEN not found in environment variables');
            }

            console.log('🤖 Initializing Telegram Bot...');
            this.bot = new TelegramBot(token, { polling: false });
            
            // Get bot info
            const botInfo = await this.bot.getMe();
            console.log(`✅ Bot initialized: @${botInfo.username} (${botInfo.first_name})`);
            
            this.isRunning = true;
            
        } catch (error) {
            console.error('❌ Bot initialization failed:', error.message);
            throw error;
        }
    }

    async startBot() {
        try {
            if (this.isRunning) {
                throw new Error('Bot is already running');
            }
            
            await this.initializeBot();
            this.isRunning = true;
            
            console.log('🎉 Bot started successfully');
            return true;
        } catch (error) {
            console.error('❌ Failed to start bot:', error.message);
            throw error;
        }
    }

    async stopBot() {
        try {
            if (!this.isRunning) {
                throw new Error('Bot is not running');
            }
            
            if (this.bot) {
                this.bot.stopPolling();
                this.bot = null;
            }
            
            this.isRunning = false;
            console.log('✅ Bot stopped successfully');
            return true;
        } catch (error) {
            console.error('❌ Failed to stop bot:', error.message);
            throw error;
        }
    }

    async restartBot() {
        try {
            await this.stopBot();
            await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
            await this.startBot();
            return true;
        } catch (error) {
            console.error('❌ Failed to restart bot:', error.message);
            throw error;
        }
    }

    async sendTestMessage(chatId, message) {
        if (!this.bot || !this.isRunning) {
            throw new Error('Bot is not running');
        }
        
        await this.bot.sendMessage(chatId, message);
    }

    async setWebhook(url) {
        if (!this.bot) {
            throw new Error('Bot is not initialized');
        }
        
        await this.bot.setWebhook(url);
    }

    async deleteWebhook() {
        if (!this.bot) {
            throw new Error('Bot is not initialized');
        }
        
        await this.bot.deleteWebhook();
    }

    async getBotStatus() {
        return {
            isRunning: this.isRunning,
            botInfo: this.bot ? await this.bot.getMe() : null,
            webhookInfo: this.bot ? await this.bot.getWebhookInfo() : null,
            timestamp: new Date().toISOString()
        };
    }

    // Database query methods
    async getAllQuizzes() {
        const [rows] = await this.db.execute('SELECT * FROM quizzes ORDER BY created_at DESC');
        return rows;
    }

    async getQuizById(id) {
        const [rows] = await this.db.execute('SELECT * FROM quizzes WHERE id = ?', [id]);
        return rows[0] || null;
    }

    async createQuiz(quizData) {
        const { title, subject, description, questions, duration, start_date, end_date, status } = quizData;
        const [result] = await this.db.execute(
            'INSERT INTO quizzes (title, subject, description, questions, duration, start_date, end_date, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [title, subject, description, JSON.stringify(questions), duration, start_date, end_date, status || 'active']
        );
        return { id: result.insertId, ...quizData };
    }

    async updateQuiz(id, updateData) {
        const fields = Object.keys(updateData).map(key => `${key} = ?`).join(', ');
        const values = Object.values(updateData);
        values.push(id);
        
        await this.db.execute(`UPDATE quizzes SET ${fields} WHERE id = ?`, values);
        return await this.getQuizById(id);
    }

    async deleteQuiz(id) {
        await this.db.execute('DELETE FROM quizzes WHERE id = ?', [id]);
    }

    async getQuizSessions(quizId) {
        const [rows] = await this.db.execute(
            'SELECT * FROM quiz_sessions WHERE quiz_id = ? ORDER BY created_at DESC',
            [quizId]
        );
        return rows;
    }

    async assignQuizToClass(quizId, classId) {
        await this.db.execute(
            'INSERT INTO class_quizzes (class_id, quiz_id) VALUES (?, ?) ON DUPLICATE KEY UPDATE quiz_id = quiz_id',
            [classId, quizId]
        );
    }

    async getAllUsers() {
        const [rows] = await this.db.execute('SELECT * FROM users ORDER BY created_at DESC');
        return rows;
    }

    async getUserById(id) {
        const [rows] = await this.db.execute('SELECT * FROM users WHERE id = ?', [id]);
        return rows[0] || null;
    }

    async getUserByTelegramId(telegramId) {
        const [rows] = await this.db.execute('SELECT * FROM users WHERE telegram_id = ?', [telegramId]);
        return rows[0] || null;
    }

    async updateUser(id, updateData) {
        const fields = Object.keys(updateData).map(key => `${key} = ?`).join(', ');
        const values = Object.values(updateData);
        values.push(id);
        
        await this.db.execute(`UPDATE users SET ${fields} WHERE id = ?`, values);
        return await this.getUserById(id);
    }

    async deleteUser(id) {
        await this.db.execute('DELETE FROM users WHERE id = ?', [id]);
    }

    async getUserSessions(userId) {
        const [rows] = await this.db.execute(
            'SELECT * FROM quiz_sessions WHERE student_id = ? ORDER BY created_at DESC',
            [userId]
        );
        return rows;
    }

    async registerUserWithTelegram(phoneNumber, telegramId, firstName, lastName) {
        // Find user by phone number
        const [rows] = await this.db.execute(
            'SELECT * FROM users WHERE phone = ?',
            [phoneNumber]
        );
        
        if (rows.length === 0) {
            throw new Error('Phone number not found in system');
        }
        
        const user = rows[0];
        
        // Update user with Telegram ID
        await this.db.execute(
            'UPDATE users SET telegram_id = ? WHERE id = ?',
            [telegramId, user.id]
        );
        
        // Log registration
        await this.logActivity(user.id, telegramId, 'registration_success', { 
            phone: phoneNumber, 
            role: user.role 
        });
        
        return { ...user, telegram_id: telegramId };
    }

    async getBotUsageStats() {
        const [rows] = await this.db.execute(`
            SELECT 
                COUNT(DISTINCT u.id) as total_users,
                COUNT(DISTINCT u.telegram_id) as registered_telegram_users,
                COUNT(DISTINCT CASE WHEN u.telegram_id IS NOT NULL THEN u.id END) as active_telegram_users,
                COUNT(DISTINCT qs.id) as total_quiz_sessions,
                COUNT(DISTINCT CASE WHEN qs.status = 'active' THEN qs.id END) as active_quiz_sessions,
                COUNT(DISTINCT CASE WHEN qs.status = 'completed' THEN qs.id END) as completed_quiz_sessions
            FROM users u
            LEFT JOIN quiz_sessions qs ON u.id = qs.student_id
            WHERE u.role = 'student'
        `);
        
        return rows[0] || {};
    }

    async getQuizPerformanceStats() {
        const [rows] = await this.db.execute(`
            SELECT 
                q.title,
                q.subject,
                COUNT(qs.id) as total_attempts,
                AVG(qs.score) as average_score,
                MIN(qs.score) as lowest_score,
                MAX(qs.score) as highest_score
            FROM quizzes q
            LEFT JOIN quiz_sessions qs ON q.id = qs.quiz_id AND qs.status = 'completed'
            GROUP BY q.id
            ORDER BY average_score DESC
        `);
        
        return rows;
    }

    async getUserEngagementStats() {
        const [rows] = await this.db.execute(`
            SELECT 
                u.name,
                u.role,
                COUNT(qs.id) as total_quizzes,
                COUNT(CASE WHEN qs.status = 'completed' THEN qs.id END) as completed_quizzes,
                AVG(CASE WHEN qs.status = 'completed' THEN qs.score END) as average_score
            FROM users u
            LEFT JOIN quiz_sessions qs ON u.id = qs.student_id
            WHERE u.role = 'student'
            GROUP BY u.id
            ORDER BY total_quizzes DESC
        `);
        
        return rows;
    }

    async getActivityLog(limit = 100, offset = 0, action = null, userId = null) {
        let query = 'SELECT * FROM bot_activity_log';
        let params = [];
        let conditions = [];
        
        if (action) {
            conditions.push('action = ?');
            params.push(action);
        }
        
        if (userId) {
            conditions.push('user_id = ?');
            params.push(userId);
        }
        
        if (conditions.length > 0) {
            query += ' WHERE ' + conditions.join(' AND ');
        }
        
        query += ' ORDER BY timestamp DESC LIMIT ? OFFSET ?';
        params.push(parseInt(limit), parseInt(offset));
        
        const [rows] = await this.db.execute(query, params);
        return rows;
    }

    async logActivity(userId, telegramId, action, details = null) {
        try {
            await this.db.execute(
                'INSERT INTO bot_activity_log (user_id, telegram_id, action, details) VALUES (?, ?, ?, ?)',
                [userId, telegramId, action, details ? JSON.stringify(details) : null]
            );
        } catch (error) {
            console.error('Error logging activity:', error.message);
        }
    }

    async handleTelegramWebhook(req, res) {
        try {
            const update = req.body;
            
            if (!this.bot) {
                return res.status(400).json({ success: false, message: 'Bot not initialized' });
            }
            
            // Process the update
            await this.bot.handleUpdate(update);
            
            // Log the webhook
            await this.logActivity(null, update.message?.from?.id, 'webhook_received', {
                update_type: update.message ? 'message' : 'callback_query',
                chat_id: update.message?.chat?.id || update.callback_query?.message?.chat?.id
            });
            
            res.json({ success: true });
        } catch (error) {
            console.error('Error handling webhook:', error.message);
            res.status(500).json({ success: false, message: error.message });
        }
    }

    async start() {
        try {
            console.log('🚀 Starting Quiz Whiz Backend Server...');
            
            // Initialize database
            await this.initializeDatabase();
            
            // Initialize bot (but don't start polling)
            await this.initializeBot();
            
            // Start server
            this.app.listen(this.port, () => {
                console.log(`🎉 Server running on port ${this.port}`);
                console.log(`📱 Bot initialized: ${this.isRunning ? 'Ready' : 'Stopped'}`);
                console.log(`🔗 Health check: http://localhost:${this.port}/health`);
                console.log(`📊 API docs: http://localhost:${this.port}/`);
            });
            
        } catch (error) {
            console.error('❌ Failed to start server:', error.message);
            process.exit(1);
        }
    }

    async stop() {
        try {
            if (this.bot) {
                await this.stopBot();
            }
            
            if (this.db) {
                await this.db.end();
                console.log('✅ Database connection closed');
            }
            
            console.log('✅ Server stopped');
        } catch (error) {
            console.error('❌ Error stopping server:', error.message);
        }
    }
}

// Start the server
const server = new QuizWhizBackend();

// Handle graceful shutdown
process.on('SIGINT', async () => {
    console.log('\n🛑 Shutting down server...');
    await server.stop();
    process.exit(0);
});

process.on('SIGTERM', async () => {
    console.log('\n🛑 Shutting down server...');
    await server.stop();
    process.exit(0);
});

server.start().catch(error => {
    console.error('❌ Server startup failed:', error.message);
    process.exit(1);
});