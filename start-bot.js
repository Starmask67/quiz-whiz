#!/usr/bin/env node

// Quiz Whiz Telegram Bot - Complete Implementation
require('dotenv').config();

const TelegramBot = require('node-telegram-bot-api');
const mysql = require('mysql2/promise');

class QuizWhizBot {
    constructor() {
        this.bot = null;
        this.db = null;
        this.isRunning = false;
        this.activeSessions = new Map(); // Store active quiz sessions
        this.userStates = new Map(); // Store user conversation states
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
            this.bot = new TelegramBot(token, { polling: true });
            
            // Get bot info
            const botInfo = await this.bot.getMe();
            console.log(`✅ Bot initialized: @${botInfo.username} (${botInfo.first_name})`);
            
            this.setupMessageHandlers();
            this.isRunning = true;
            
            // Start periodic tasks
            this.startPeriodicTasks();
            
        } catch (error) {
            console.error('❌ Bot initialization failed:', error.message);
            throw error;
        }
    }

    setupMessageHandlers() {
        // Handle /start command
        this.bot.onText(/\/start/, (msg) => {
            this.handleStart(msg);
        });

        // Handle /register command
        this.bot.onText(/\/register (.+)/, (msg, match) => {
            this.handleRegistration(msg, match[1]);
        });

        // Handle /help command
        this.bot.onText(/\/help/, (msg) => {
            this.handleHelp(msg);
        });

        // Handle /status command
        this.bot.onText(/\/status/, (msg) => {
            this.handleStatus(msg);
        });

        // Handle /quiz command
        this.bot.onText(/\/quiz/, (msg) => {
            this.handleQuizCommand(msg);
        });

        // Handle quiz answers (A, B, C, D)
        this.bot.onText(/^[ABCD]$/i, (msg) => {
            this.handleQuizAnswer(msg);
        });

        // Handle callback queries (inline buttons)
        this.bot.on('callback_query', (callbackQuery) => {
            this.handleCallbackQuery(callbackQuery);
        });

        // Handle text messages
        this.bot.on('text', (msg) => {
            if (!msg.text.startsWith('/') && !/^[ABCD]$/i.test(msg.text)) {
                this.handleGeneralMessage(msg);
            }
        });

        console.log('✅ Bot message handlers setup complete');
    }

    async handleStart(msg) {
        const chatId = msg.chat.id;
        const telegramId = msg.from.id;
        const firstName = msg.from.first_name;

        try {
            // Log activity
            await this.logActivity(null, telegramId, 'start_command', { firstName });

            // Check if user is already registered
            const user = await this.getUserByTelegramId(telegramId);
            
            if (user) {
                const welcomeMessage = `Welcome back, ${user.name}! 🎓\n\n` +
                    `You're registered as a ${user.role}.\n` +
                    `Current status: ${user.status || 'active'}\n\n` +
                    `Available commands:\n` +
                    `🔹 /status - Check your current status\n` +
                    `🔹 /quiz - View available quizzes\n` +
                    `🔹 /help - Show all commands\n\n` +
                    `You'll receive quizzes automatically when they're assigned!`;

                await this.bot.sendMessage(chatId, welcomeMessage);
            } else {
                const welcomeMessage = `Welcome to Quiz Whiz! 🎓📚\n\n` +
                    `Hi ${firstName}! I'm your Quiz Whiz bot.\n\n` +
                    `To get started, you need to register with your school phone number.\n\n` +
                    `Use this command:\n` +
                    `🔹 /register YOUR_PHONE_NUMBER\n\n` +
                    `Example: /register +1234567890\n\n` +
                    `Your phone number should match the one registered in your school system.\n\n` +
                    `After registration, you'll receive quizzes automatically!`;

                await this.bot.sendMessage(chatId, welcomeMessage);
            }
        } catch (error) {
            console.error('Error in handleStart:', error.message);
            await this.bot.sendMessage(chatId, 'Sorry, something went wrong. Please try again later.');
        }
    }

    async handleRegistration(msg, phoneNumber) {
        const chatId = msg.chat.id;
        const telegramId = msg.from.id;
        const firstName = msg.from.first_name;
        const lastName = msg.from.last_name || '';

        try {
            // Clean phone number
            const cleanPhone = phoneNumber.replace(/[^\d+]/g, '');
            
            // Find user by phone number
            const [rows] = await this.db.execute(
                'SELECT * FROM users WHERE phone = ?',
                [cleanPhone]
            );
            
            if (rows.length === 0) {
                await this.bot.sendMessage(chatId, 
                    '❌ Phone number not found in our system.\n\n' +
                    'Please make sure you\'re using the same phone number that\'s registered in your school account.\n\n' +
                    'If you continue to have issues, please contact your teacher or administrator.'
                );
                return;
            }

            const user = rows[0];
            
            // Check if user is already registered with Telegram
            if (user.telegram_id && user.telegram_id !== telegramId.toString()) {
                await this.bot.sendMessage(chatId, 
                    '❌ This phone number is already registered with another Telegram account.\n\n' +
                    'Please contact your administrator if you need to change your registration.'
                );
                return;
            }
            
            // Update user with Telegram ID
            await this.db.execute(
                'UPDATE users SET telegram_id = ? WHERE id = ?',
                [telegramId, user.id]
            );

            // Log successful registration
            await this.logActivity(user.id, telegramId, 'registration_success', { 
                phone: cleanPhone, 
                role: user.role 
            });

            const successMessage = `✅ Registration successful!\n\n` +
                `Welcome, ${user.name}! 🎉\n` +
                `Role: ${user.role}\n` +
                `Status: ${user.status || 'active'}\n\n` +
                `You'll now receive quizzes and updates automatically.\n\n` +
                `Available commands:\n` +
                `🔹 /status - Check your current status\n` +
                `🔹 /quiz - View available quizzes\n` +
                `🔹 /help - Show all commands\n\n` +
                `🎯 Start learning with Quiz Whiz!`;

            await this.bot.sendMessage(chatId, successMessage);

            console.log(`👤 User registered: ${user.name} (${user.role}) - Telegram ID: ${telegramId}`);

        } catch (error) {
            console.error('Error in handleRegistration:', error.message);
            await this.bot.sendMessage(chatId, 'Sorry, registration failed. Please try again later.');
        }
    }

    async handleHelp(msg) {
        const chatId = msg.chat.id;
        
        const helpText = `📚 **Quiz Whiz Bot Commands**\n\n` +
            `🔹 /start - Start the bot and see welcome message\n` +
            `🔹 /register PHONE - Register with your phone number\n` +
            `🔹 /status - Check your current status and active quizzes\n` +
            `🔹 /quiz - View available quizzes\n` +
            `🔹 /help - Show this help message\n\n` +
            `📝 **How it works:**\n` +
            `• Register with your school phone number\n` +
            `• Receive quizzes automatically when assigned\n` +
            `• Answer questions with A, B, C, or D\n` +
            `• Track your progress and scores in real-time\n\n` +
            `🎯 **Quiz Interaction:**\n` +
            `• Quizzes are sent automatically by your teachers\n` +
            `• Answer each question with A, B, C, or D\n` +
            `• View your progress and final score\n\n` +
            `❓ **Need help?** Contact your teacher or administrator.`;

        await this.bot.sendMessage(chatId, helpText, { parse_mode: 'Markdown' });
    }

    async handleStatus(msg) {
        const chatId = msg.chat.id;
        const telegramId = msg.from.id;

        try {
            const user = await this.getUserByTelegramId(telegramId);
            
            if (!user) {
                await this.bot.sendMessage(chatId, 
                    '❌ You are not registered yet.\n\n' +
                    'Please use /register YOUR_PHONE_NUMBER to get started.'
                );
                return;
            }

            // Get user's active quiz sessions
            const [sessions] = await this.db.execute(
                `SELECT qs.*, q.title, q.subject, q.description
                 FROM quiz_sessions qs 
                 JOIN quizzes q ON qs.quiz_id = q.id 
                 WHERE qs.student_id = ? AND qs.status = 'active'
                 ORDER BY qs.start_time DESC`,
                [user.id]
            );

            // Get user's completed quizzes
            const [completed] = await this.db.execute(
                `SELECT qs.*, q.title, q.subject
                 FROM quiz_sessions qs 
                 JOIN quizzes q ON qs.quiz_id = q.id 
                 WHERE qs.student_id = ? AND qs.status = 'completed'
                 ORDER BY qs.end_time DESC
                 LIMIT 5`,
                [user.id]
            );

            let statusMessage = `📊 **Your Status**\n\n` +
                `👤 **Profile:**\n` +
                `• Name: ${user.name}\n` +
                `• Role: ${user.role}\n` +
                `• Status: ${user.status || 'active'}\n\n`;

            if (sessions.length > 0) {
                statusMessage += `🎯 **Active Quizzes:**\n`;
                sessions.forEach(session => {
                    statusMessage += `• ${session.title} (${session.subject})\n` +
                        `  Progress: ${session.current_question}/${session.total_questions}\n`;
                });
                statusMessage += `\n`;
            } else {
                statusMessage += `🎯 **Active Quizzes:** None at the moment\n\n`;
            }

            if (completed.length > 0) {
                statusMessage += `✅ **Recent Completed Quizzes:**\n`;
                completed.forEach(session => {
                    statusMessage += `• ${session.title}: ${session.score || 0}%\n`;
                });
            } else {
                statusMessage += `✅ **Completed Quizzes:** None yet\n\n`;
            }

            statusMessage += `\n💡 Use /quiz to see available quizzes!`;

            await this.bot.sendMessage(chatId, statusMessage, { parse_mode: 'Markdown' });

        } catch (error) {
            console.error('Error in handleStatus:', error.message);
            await this.bot.sendMessage(chatId, 'Sorry, there was an error getting your status. Please try again.');
        }
    }

    async handleQuizCommand(msg) {
        const chatId = msg.chat.id;
        const telegramId = msg.from.id;

        try {
            const user = await this.getUserByTelegramId(telegramId);
            
            if (!user) {
                await this.bot.sendMessage(chatId, 
                    '❌ You are not registered yet.\n\n' +
                    'Please use /register YOUR_PHONE_NUMBER to get started.'
                );
                return;
            }

            // Get available quizzes for the user's class
            const [quizzes] = await this.db.execute(
                `SELECT DISTINCT q.*, c.name as class_name
                 FROM quizzes q
                 JOIN class_quizzes cq ON q.id = cq.quiz_id
                 JOIN classes c ON cq.class_id = c.id
                 JOIN class_students cs ON c.id = cs.class_id
                 WHERE cs.student_id = ? 
                 AND q.status = 'active'
                 AND q.start_date <= NOW()
                 AND q.end_date >= NOW()
                 ORDER BY q.start_date DESC`,
                [user.id]
            );

            if (quizzes.length === 0) {
                await this.bot.sendMessage(chatId, 
                    '📚 **Available Quizzes**\n\n' +
                    'No quizzes are currently available for your class.\n\n' +
                    'Your teachers will assign quizzes when they\'re ready!\n' +
                    'You\'ll receive them automatically via this bot.'
                );
                return;
            }

            let quizMessage = `📚 **Available Quizzes**\n\n`;
            quizzes.forEach((quiz, index) => {
                const startDate = new Date(quiz.start_date).toLocaleDateString();
                const endDate = new Date(quiz.end_date).toLocaleDateString();
                
                quizMessage += `${index + 1}. **${quiz.title}**\n` +
                    `   📖 Subject: ${quiz.subject}\n` +
                    `   🏫 Class: ${quiz.class_name}\n` +
                    `   📅 Available: ${startDate} - ${endDate}\n` +
                    `   ⏱️ Duration: ${quiz.duration || 'Not specified'} minutes\n\n`;
            });

            quizMessage += `💡 Quizzes will be automatically delivered to you when they start!\n\n` +
                `Use /status to check your current quiz progress.`;

            await this.bot.sendMessage(chatId, quizMessage, { parse_mode: 'Markdown' });

        } catch (error) {
            console.error('Error in handleQuizCommand:', error.message);
            await this.bot.sendMessage(chatId, 'Sorry, there was an error getting quiz information. Please try again.');
        }
    }

    async handleQuizAnswer(msg) {
        const chatId = msg.chat.id;
        const telegramId = msg.from.id;
        const answer = msg.text.toUpperCase();
        
        try {
            // Get active quiz session for this user
            const session = await this.getActiveSession(telegramId);
            
            if (!session) {
                await this.bot.sendMessage(chatId, 
                    '❌ No active quiz session found.\n\n' +
                    'Wait for a quiz to be assigned by your teacher, or use /status to check your current status.'
                );
                return;
            }

            // Process the answer
            await this.processQuizAnswer(session, answer, chatId);
            
        } catch (error) {
            console.error('Error in handleQuizAnswer:', error.message);
            await this.bot.sendMessage(chatId, 'Sorry, there was an error processing your answer. Please try again.');
        }
    }

    async handleCallbackQuery(callbackQuery) {
        const chatId = callbackQuery.message.chat.id;
        const data = callbackQuery.data;
        
        try {
            if (data === 'start_quiz') {
                await this.bot.sendMessage(chatId, '🎯 Quiz starting... Get ready!');
            } else if (data.startsWith('answer_')) {
                const answer = data.split('_')[1];
                const session = await this.getActiveSession(callbackQuery.from.id);
                if (session) {
                    await this.processQuizAnswer(session, answer, chatId);
                }
            }
        } catch (error) {
            console.error('Error in handleCallbackQuery:', error.message);
        }
        
        // Answer callback query
        await this.bot.answerCallbackQuery(callbackQuery.id);
    }

    async handleGeneralMessage(msg) {
        const chatId = msg.chat.id;
        
        await this.bot.sendMessage(chatId, 
            '💬 I received your message, but I\'m not sure what to do with it.\n\n' +
            'Use /help to see available commands, or contact your teacher for assistance.'
        );
    }

    async getUserByTelegramId(telegramId) {
        try {
            const [rows] = await this.db.execute(
                'SELECT * FROM users WHERE telegram_id = ?',
                [telegramId]
            );
            return rows[0] || null;
        } catch (error) {
            console.error('Error getting user by Telegram ID:', error.message);
            return null;
        }
    }

    async getActiveSession(telegramId) {
        try {
            const [rows] = await this.db.execute(
                `SELECT qs.*, q.title, q.subject, q.questions
                 FROM quiz_sessions qs 
                 JOIN quizzes q ON qs.quiz_id = q.id 
                 JOIN users u ON qs.student_id = u.id 
                 WHERE u.telegram_id = ? AND qs.status = 'active'`,
                [telegramId]
            );
            return rows[0] || null;
        } catch (error) {
            console.error('Error getting active session:', error.message);
            return null;
        }
    }

    async processQuizAnswer(session, answer, chatId) {
        try {
            // Parse questions from JSON
            let questions = [];
            try {
                questions = JSON.parse(session.questions || '[]');
            } catch (e) {
                questions = [];
            }

            if (questions.length === 0) {
                await this.bot.sendMessage(chatId, '❌ Quiz questions not found. Please contact your teacher.');
                return;
            }

            const currentQuestionIndex = session.current_question - 1;
            const currentQuestion = questions[currentQuestionIndex];

            if (!currentQuestion) {
                await this.bot.sendMessage(chatId, '❌ Question not found. Please contact your teacher.');
                return;
            }

            // Validate answer
            const validAnswers = ['A', 'B', 'C', 'D'];
            if (!validAnswers.includes(answer)) {
                await this.bot.sendMessage(chatId, '❌ Invalid answer. Please use A, B, C, or D.');
                return;
            }

            // Store the answer
            let answers = {};
            try {
                answers = JSON.parse(session.answers || '{}');
            } catch (e) {
                answers = {};
            }

            answers[session.current_question] = {
                answer: answer,
                timestamp: new Date().toISOString(),
                correct: answer === currentQuestion.correct_answer
            };

            // Update session
            await this.db.execute(
                'UPDATE quiz_sessions SET answers = ?, current_question = current_question + 1 WHERE id = ?',
                [JSON.stringify(answers), session.id]
            );

            // Check if quiz is complete
            if (session.current_question >= session.total_questions) {
                await this.completeQuiz(session, chatId);
            } else {
                // Send next question
                await this.sendNextQuestion(session, chatId);
            }

        } catch (error) {
            console.error('Error processing quiz answer:', error.message);
            await this.bot.sendMessage(chatId, 'Error processing answer. Please try again.');
        }
    }

    async sendNextQuestion(session, chatId) {
        try {
            // Parse questions
            let questions = [];
            try {
                questions = JSON.parse(session.questions || '[]');
            } catch (e) {
                questions = [];
            }

            const currentQuestionIndex = session.current_question;
            const currentQuestion = questions[currentQuestionIndex];

            if (!currentQuestion) {
                await this.bot.sendMessage(chatId, '❌ Question not found. Please contact your teacher.');
                return;
            }

            const questionMessage = `🎯 **Question ${currentQuestionIndex + 1} of ${session.total_questions}**\n\n` +
                `📝 ${currentQuestion.question}\n\n` +
                `**Options:**\n` +
                `A) ${currentQuestion.options.A}\n` +
                `B) ${currentQuestion.options.B}\n` +
                `C) ${currentQuestion.options.C}\n` +
                `D) ${currentQuestion.options.D}\n\n` +
                `💡 Answer with A, B, C, or D`;

            await this.bot.sendMessage(chatId, questionMessage, { parse_mode: 'Markdown' });

        } catch (error) {
            console.error('Error sending next question:', error.message);
            await this.bot.sendMessage(chatId, 'Error loading next question. Please contact your teacher.');
        }
    }

    async completeQuiz(session, chatId) {
        try {
            // Calculate score
            let answers = {};
            try {
                answers = JSON.parse(session.answers || '{}');
            } catch (e) {
                answers = {};
            }

            let correctAnswers = 0;
            let totalQuestions = session.total_questions;

            Object.values(answers).forEach(answerData => {
                if (answerData.correct) {
                    correctAnswers++;
                }
            });

            const score = Math.round((correctAnswers / totalQuestions) * 100);

            // Update session
            await this.db.execute(
                'UPDATE quiz_sessions SET status = "completed", end_time = NOW(), score = ? WHERE id = ?',
                [score, session.id]
            );

            // Get quiz details
            const [quizRows] = await this.db.execute(
                'SELECT title, subject FROM quizzes WHERE id = ?',
                [session.quiz_id]
            );
            const quiz = quizRows[0];

            const completionMessage = `🎉 **Quiz Completed!**\n\n` +
                `📚 Quiz: ${quiz.title}\n` +
                `📖 Subject: ${quiz.subject}\n` +
                `✅ Score: ${score}%\n` +
                `📊 Correct Answers: ${correctAnswers}/${totalQuestions}\n` +
                `⏰ Completed: ${new Date().toLocaleString()}\n\n` +
                `🎯 Great job! Your results have been recorded.\n` +
                `📈 Use /status to view your overall progress.`;

            await this.bot.sendMessage(chatId, completionMessage, { parse_mode: 'Markdown' });

            // Log completion
            await this.logActivity(session.student_id, null, 'quiz_completed', {
                quiz_id: session.quiz_id,
                score: score,
                total_questions: totalQuestions
            });

        } catch (error) {
            console.error('Error completing quiz:', error.message);
            await this.bot.sendMessage(chatId, 'Error completing quiz. Please contact your teacher.');
        }
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

    async startPeriodicTasks() {
        // Check for new quiz assignments every 5 minutes
        setInterval(async () => {
            try {
                await this.checkForNewQuizzes();
            } catch (error) {
                console.error('Error in periodic quiz check:', error.message);
            }
        }, 5 * 60 * 1000);

        // Clean up expired sessions every hour
        setInterval(async () => {
            try {
                await this.cleanupExpiredSessions();
            } catch (error) {
                console.error('Error cleaning up expired sessions:', error.message);
            }
        }, 60 * 60 * 1000);

        console.log('✅ Periodic tasks started');
    }

    async checkForNewQuizzes() {
        try {
            // Find students who should receive new quizzes
            const [assignments] = await this.db.execute(`
                SELECT DISTINCT 
                    u.id as student_id, 
                    u.telegram_id, 
                    u.name,
                    q.id as quiz_id,
                    q.title,
                    q.subject,
                    c.name as class_name
                FROM users u
                JOIN class_students cs ON u.id = cs.student_id
                JOIN classes c ON cs.class_id = c.id
                JOIN class_quizzes cq ON c.id = cq.class_id
                JOIN quizzes q ON cq.quiz_id = q.id
                LEFT JOIN quiz_sessions qs ON u.id = qs.student_id AND q.id = qs.quiz_id
                WHERE u.telegram_id IS NOT NULL
                AND u.role = 'student'
                AND q.status = 'active'
                AND q.start_date <= NOW()
                AND q.end_date >= NOW()
                AND qs.id IS NULL
                AND u.status = 'active'
            `);

            for (const assignment of assignments) {
                await this.assignQuizToStudent(assignment);
            }

            if (assignments.length > 0) {
                console.log(`📚 Assigned ${assignments.length} new quizzes to students`);
            }

        } catch (error) {
            console.error('Error checking for new quizzes:', error.message);
        }
    }

    async assignQuizToStudent(assignment) {
        try {
            // Get quiz questions
            const [quizRows] = await this.db.execute(
                'SELECT questions FROM quizzes WHERE id = ?',
                [assignment.quiz_id]
            );

            if (quizRows.length === 0) return;

            const quiz = quizRows[0];
            let questions = [];
            try {
                questions = JSON.parse(quiz.questions || '[]');
            } catch (e) {
                questions = [];
            }

            if (questions.length === 0) return;

            // Create quiz session
            await this.db.execute(
                'INSERT INTO quiz_sessions (student_id, quiz_id, total_questions, status) VALUES (?, ?, ?, "active")',
                [assignment.student_id, assignment.quiz_id, questions.length]
            );

            // Send quiz notification to student
            const notificationMessage = `📚 **New Quiz Assigned!**\n\n` +
                `🎯 Quiz: ${assignment.title}\n` +
                `📖 Subject: ${assignment.subject}\n` +
                `🏫 Class: ${assignment.class_name}\n` +
                `❓ Questions: ${questions.length}\n\n` +
                `🚀 The quiz will start automatically!\n` +
                `Use /status to check your progress.`;

            await this.bot.sendMessage(assignment.telegram_id, notificationMessage, { parse_mode: 'Markdown' });

            // Log assignment
            await this.logActivity(assignment.student_id, assignment.telegram_id, 'quiz_assigned', {
                quiz_id: assignment.quiz_id,
                quiz_title: assignment.title
            });

            console.log(`📝 Quiz "${assignment.title}" assigned to ${assignment.name}`);

        } catch (error) {
            console.error('Error assigning quiz to student:', error.message);
        }
    }

    async cleanupExpiredSessions() {
        try {
            // Find expired sessions
            const [expiredSessions] = await this.db.execute(`
                SELECT qs.*, q.end_date
                FROM quiz_sessions qs
                JOIN quizzes q ON qs.quiz_id = q.id
                WHERE qs.status = 'active' 
                AND q.end_date < NOW()
            `);

            for (const session of expiredSessions) {
                // Mark session as expired
                await this.db.execute(
                    'UPDATE quiz_sessions SET status = "expired", end_time = NOW() WHERE id = ?',
                    [session.id]
                );

                // Notify student
                const user = await this.getUserById(session.student_id);
                if (user && user.telegram_id) {
                    const expiryMessage = `⏰ **Quiz Expired**\n\n` +
                        `The quiz session has expired.\n` +
                        `Please contact your teacher if you need more time.`;

                    await this.bot.sendMessage(user.telegram_id, expiryMessage, { parse_mode: 'Markdown' });
                }

                // Log expiry
                await this.logActivity(session.student_id, null, 'quiz_expired', {
                    quiz_id: session.quiz_id,
                    session_id: session.id
                });
            }

            if (expiredSessions.length > 0) {
                console.log(`⏰ Cleaned up ${expiredSessions.length} expired quiz sessions`);
            }

        } catch (error) {
            console.error('Error cleaning up expired sessions:', error.message);
        }
    }

    async getUserById(userId) {
        try {
            const [rows] = await this.db.execute(
                'SELECT * FROM users WHERE id = ?',
                [userId]
            );
            return rows[0] || null;
        } catch (error) {
            console.error('Error getting user by ID:', error.message);
            return null;
        }
    }

    async start() {
        try {
            console.log('🚀 Starting Quiz Whiz Bot...');
            await this.initializeDatabase();
            await this.initializeBot();
            console.log('🎉 Bot is now running! Press Ctrl+C to stop.');
            
            // Keep the process alive
            process.on('SIGINT', () => {
                console.log('\n🛑 Shutting down bot...');
                this.stop();
                process.exit(0);
            });
            
        } catch (error) {
            console.error('❌ Failed to start bot:', error.message);
            process.exit(1);
        }
    }

    async stop() {
        if (this.bot) {
            this.bot.stopPolling();
            this.isRunning = false;
            console.log('✅ Bot stopped');
        }
        
        if (this.db) {
            await this.db.end();
            console.log('✅ Database connection closed');
        }
    }
}

// Start the bot
const bot = new QuizWhizBot();
bot.start().catch(error => {
    console.error('❌ Bot startup failed:', error.message);
    process.exit(1);
});