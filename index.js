// Quiz Whiz Main Application Entry Point
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');

// Import our tools and services
const db = require('./tools/database/connection');
const telegramBot = require('./tools/bot/telegramBot');
const pdfProcessor = require('./tools/ai/pdfProcessor');
const studentManager = require('./tools/management/studentManager');

// Import API routes
const authRoutes = require('./api/auth');
const quizRoutes = require('./api/quiz');
const studentRoutes = require('./api/student');
const teacherRoutes = require('./api/teacher');
const adminRoutes = require('./api/admin');

class QuizWhizApp {
    constructor() {
        this.app = express();
        this.port = process.env.PORT || 3000;
        this.isInitialized = false;
    }

    async initialize() {
        try {
            console.log('🎓 Starting Quiz Whiz Application');
            console.log('==================================\n');

            // Initialize database
            await this.initializeDatabase();
            
            // Setup Express middleware
            this.setupMiddleware();
            
            // Setup routes
            this.setupRoutes();
            
            // Initialize services
            await this.initializeServices();
            
            // Setup error handling
            this.setupErrorHandling();
            
            this.isInitialized = true;
            console.log('✅ Application initialized successfully\n');

        } catch (error) {
            console.error('❌ Application initialization failed:', error.message);
            throw error;
        }
    }

    async initializeDatabase() {
        console.log('📊 Initializing database connection...');
        try {
            await db.connect();
            console.log('✅ Database connected successfully');
        } catch (error) {
            console.error('❌ Database connection failed:', error.message);
            throw error;
        }
    }

    setupMiddleware() {
        console.log('⚙️  Setting up middleware...');

        // Security middleware
        this.app.use(helmet({
            contentSecurityPolicy: {
                directives: {
                    defaultSrc: ["'self'"],
                    styleSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net"],
                    scriptSrc: ["'self'", "https://cdn.jsdelivr.net"],
                    imgSrc: ["'self'", "data:", "https:"],
                    fontSrc: ["'self'", "https://fonts.googleapis.com", "https://cdn.jsdelivr.net"]
                }
            }
        }));

        // CORS configuration
        this.app.use(cors({
            origin: process.env.FRONTEND_URL || 'http://localhost:3000',
            credentials: true
        }));

        // Compression
        this.app.use(compression());

        // Rate limiting
        const limiter = rateLimit({
            windowMs: 15 * 60 * 1000, // 15 minutes
            max: 100, // Limit each IP to 100 requests per windowMs
            message: 'Too many requests from this IP, please try again later.'
        });
        this.app.use('/api/', limiter);

        // Body parsing
        this.app.use(express.json({ limit: '10mb' }));
        this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

        // Static files
        this.app.use('/uploads', express.static('uploads'));

        console.log('✅ Middleware configured');
    }

    setupRoutes() {
        console.log('🛣️  Setting up routes...');

        // Health check endpoint
        this.app.get('/health', (req, res) => {
            res.json({
                status: 'ok',
                timestamp: new Date().toISOString(),
                services: {
                    database: db.isConnected,
                    telegramBot: telegramBot.isRunning,
                    application: this.isInitialized
                }
            });
        });

        // API routes
        this.app.use('/api/auth', authRoutes);
        this.app.use('/api/quiz', quizRoutes);
        this.app.use('/api/student', studentRoutes);
        this.app.use('/api/teacher', teacherRoutes);
        this.app.use('/api/admin', adminRoutes);

        // Quiz Whiz specific endpoints
        this.app.use('/api/tools', this.createToolsRoutes());

        // Root endpoint
        this.app.get('/', (req, res) => {
            res.json({
                message: 'Quiz Whiz API Server',
                version: '1.0.0',
                description: 'AI-powered educational quiz platform with Telegram bot integration',
                endpoints: {
                    health: '/health',
                    auth: '/api/auth',
                    quiz: '/api/quiz',
                    student: '/api/student',
                    teacher: '/api/teacher',
                    admin: '/api/admin',
                    tools: '/api/tools'
                }
            });
        });

        console.log('✅ Routes configured');
    }

    createToolsRoutes() {
        const router = express.Router();

        // PDF Processing endpoints
        router.post('/pdf/upload', async (req, res) => {
            try {
                const { filePath, textbookId } = req.body;
                const result = await pdfProcessor.processPDF(filePath, textbookId);
                res.json({ success: true, result });
            } catch (error) {
                res.status(500).json({ success: false, error: error.message });
            }
        });

        router.post('/quiz/generate', async (req, res) => {
            try {
                const { chunkId, classLevel, subject, teacherId } = req.body;
                const result = await pdfProcessor.generateQuiz(chunkId, classLevel, subject, teacherId);
                res.json({ success: true, result });
            } catch (error) {
                res.status(500).json({ success: false, error: error.message });
            }
        });

        // Student Management endpoints
        router.post('/student/register', async (req, res) => {
            try {
                const result = await studentManager.registerStudent(req.body);
                res.json({ success: true, result });
            } catch (error) {
                res.status(500).json({ success: false, error: error.message });
            }
        });

        router.post('/student/bulk-register', async (req, res) => {
            try {
                const { students, schoolId } = req.body;
                const result = await studentManager.bulkRegisterStudents(students, schoolId);
                res.json({ success: true, result });
            } catch (error) {
                res.status(500).json({ success: false, error: error.message });
            }
        });

        router.get('/student/class/:classId', async (req, res) => {
            try {
                const { classId } = req.params;
                const students = await studentManager.getStudentsByClass(classId);
                res.json({ success: true, students });
            } catch (error) {
                res.status(500).json({ success: false, error: error.message });
            }
        });

        // Quiz Distribution endpoints
        router.post('/quiz/send-to-class', async (req, res) => {
            try {
                const { quizId, classId, subjectId, teacherId } = req.body;
                const result = await studentManager.sendQuizToClass(quizId, classId, subjectId, teacherId);
                res.json({ success: true, result });
            } catch (error) {
                res.status(500).json({ success: false, error: error.message });
            }
        });

        router.post('/quiz/send-to-students', async (req, res) => {
            try {
                const { quizId, studentIds, teacherId } = req.body;
                const result = await studentManager.sendQuizToSelectedStudents(quizId, studentIds, teacherId);
                res.json({ success: true, result });
            } catch (error) {
                res.status(500).json({ success: false, error: error.message });
            }
        });

        // Bot Management endpoints
        router.post('/bot/start', async (req, res) => {
            try {
                await telegramBot.start();
                res.json({ success: true, message: 'Telegram bot started' });
            } catch (error) {
                res.status(500).json({ success: false, error: error.message });
            }
        });

        router.post('/bot/stop', async (req, res) => {
            try {
                await telegramBot.stop();
                res.json({ success: true, message: 'Telegram bot stopped' });
            } catch (error) {
                res.status(500).json({ success: false, error: error.message });
            }
        });

        router.get('/bot/status', (req, res) => {
            res.json({
                success: true,
                status: {
                    running: telegramBot.isRunning,
                    initialized: telegramBot.bot !== null
                }
            });
        });

        // Analytics endpoints
        router.get('/analytics/student/:studentId', async (req, res) => {
            try {
                const { studentId } = req.params;
                const { subjectId, classId } = req.query;
                const performance = await studentManager.getStudentPerformance(studentId, subjectId, classId);
                res.json({ success: true, performance });
            } catch (error) {
                res.status(500).json({ success: false, error: error.message });
            }
        });

        router.get('/analytics/class/:classId', async (req, res) => {
            try {
                const { classId } = req.params;
                const { subjectId } = req.query;
                const overview = await studentManager.getClassPerformanceOverview(classId, subjectId);
                res.json({ success: true, overview });
            } catch (error) {
                res.status(500).json({ success: false, error: error.message });
            }
        });

        return router;
    }

    async initializeServices() {
        console.log('🚀 Initializing services...');

        // Start Telegram bot if configured
        try {
            const botEnabled = await this.getBotSetting('enable_telegram_bot');
            if (botEnabled === 'true') {
                await telegramBot.start();
                console.log('✅ Telegram bot started');
            } else {
                console.log('⚠️  Telegram bot disabled in settings');
            }
        } catch (error) {
            console.warn('⚠️  Telegram bot initialization failed:', error.message);
        }

        // Initialize AI processor
        try {
            await pdfProcessor.initializeAI();
            console.log('✅ AI processor initialized');
        } catch (error) {
            console.warn('⚠️  AI processor initialization failed:', error.message);
        }

        console.log('✅ Services initialized');
    }

    async getBotSetting(key) {
        try {
            const result = await db.query(
                'SELECT setting_value FROM system_settings WHERE setting_key = ?',
                [key]
            );
            return result[0]?.setting_value || 'false';
        } catch (error) {
            return 'false';
        }
    }

    setupErrorHandling() {
        console.log('🛡️  Setting up error handling...');

        // 404 handler
        this.app.use('*', (req, res) => {
            res.status(404).json({
                success: false,
                message: 'Endpoint not found',
                path: req.originalUrl
            });
        });

        // Global error handler
        this.app.use((error, req, res, next) => {
            console.error('Global error handler:', error);

            // Handle specific error types
            if (error.name === 'ValidationError') {
                return res.status(400).json({
                    success: false,
                    message: 'Validation error',
                    details: error.details
                });
            }

            if (error.name === 'UnauthorizedError') {
                return res.status(401).json({
                    success: false,
                    message: 'Unauthorized access'
                });
            }

            // Default error response
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
            });
        });

        console.log('✅ Error handling configured');
    }

    async start() {
        if (!this.isInitialized) {
            await this.initialize();
        }

        return new Promise((resolve) => {
            this.server = this.app.listen(this.port, () => {
                console.log(`🌟 Quiz Whiz API Server running on port ${this.port}`);
                console.log(`📍 Server URL: http://localhost:${this.port}`);
                console.log(`🏥 Health check: http://localhost:${this.port}/health`);
                console.log('\n🎓 Quiz Whiz is ready to serve students and teachers!');
                resolve(this.server);
            });
        });
    }

    async stop() {
        console.log('\n🛑 Stopping Quiz Whiz Application...');

        // Stop services
        await telegramBot.stop();
        await db.close();

        // Close server
        if (this.server) {
            this.server.close();
        }

        console.log('✅ Application stopped gracefully');
    }

    // Graceful shutdown
    setupGracefulShutdown() {
        process.on('SIGTERM', async () => {
            console.log('\n📨 SIGTERM received. Shutting down gracefully...');
            await this.stop();
            process.exit(0);
        });

        process.on('SIGINT', async () => {
            console.log('\n📨 SIGINT received. Shutting down gracefully...');
            await this.stop();
            process.exit(0);
        });
    }
}

// Create and start the application
async function main() {
    const app = new QuizWhizApp();
    
    try {
        app.setupGracefulShutdown();
        await app.start();
    } catch (error) {
        console.error('❌ Failed to start application:', error.message);
        process.exit(1);
    }
}

// Run if this file is executed directly
if (require.main === module) {
    main();
}

module.exports = QuizWhizApp;