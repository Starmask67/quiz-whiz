#!/usr/bin/env node

// Enhanced Quiz Whiz Telegram Bot with Advanced Features
require('dotenv').config();

const TelegramBot = require('node-telegram-bot-api');
const mysql = require('mysql2/promise');
const axios = require('axios');

class EnhancedQuizWhizBot {
    constructor() {
        this.bot = null;
        this.db = null;
        this.isRunning = false;
        this.activeSessions = new Map(); // Store active quiz sessions in memory
        this.userStates = new Map(); // Store user conversation states
        this.backendUrl = process.env.BACKEND_URL || 'http://localhost:3001';
        
        // Bot configuration
        this.config = {
            maxRetries: 3,
            sessionTimeout: 30 * 60 * 1000, // 30 minutes
            quizTimeout: 60 * 60 * 1000, // 1 hour
            maxQuestionsPerQuiz: 50
        };
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
                    status ENUM('active', 'completed', 'expired', 'abandoned') DEFAULT 'active',
                    start_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    end_time TIMESTAMP NULL,
                    score DECIMAL(5,2) NULL,
                    current_question INT DEFAULT 1,
                    total_questions INT NOT NULL,
                    answers JSON NULL,
                    time_spent INT DEFAULT 0,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
                    FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE,
                    INDEX idx_student_status (student_id, status),
                    INDEX idx_quiz_status (quiz_id, status),
                    INDEX idx_created_at (created_at)
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
                    INDEX idx_timestamp (timestamp),
                    INDEX idx_action (action)
                )
            `);

            // Create user_preferences table if it doesn't exist
            await this.db.execute(`
                CREATE TABLE IF NOT EXISTS user_preferences (
                    id INT PRIMARY KEY AUTO_INCREMENT,
                    user_id INT NOT NULL,
                    telegram_id VARCHAR(50) NOT NULL,
                    language VARCHAR(10) DEFAULT 'en',
                    notifications_enabled BOOLEAN DEFAULT TRUE,
                    quiz_reminders BOOLEAN DEFAULT TRUE,
                    daily_digest BOOLEAN DEFAULT FALSE,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                    UNIQUE KEY unique_user_telegram (user_id, telegram_id)
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

            console.log('🤖 Initializing Enhanced Telegram Bot...');
            
            // Initialize bot with webhook support
            this.bot = new TelegramBot(token, { 
                polling: false,
                webHook: {
                    port: process.env.WEBHOOK_PORT || 8443
                }
            });
            
            // Get bot info
            const botInfo = await this.bot.getMe();
            console.log(`✅ Bot initialized: @${botInfo.username} (${botInfo.first_name})`);
            
            // Setup message handlers
            this.setupMessageHandlers();
            
            // Setup callback query handlers
            this.setupCallbackHandlers();
            
            this.isRunning = true;
            
        } catch (error) {
            console.error('❌ Bot initialization failed:', error.message);
            throw error;
        }
    }

    setupMessageHandlers() {
        // Command handlers
        this.bot.onText(/\/start/, (msg) => this.handleStart(msg));
        this.bot.onText(/\/register (.+)/, (msg, match) => this.handleRegistration(msg, match[1]));
        this.bot.onText(/\/help/, (msg) => this.handleHelp(msg));
        this.bot.onText(/\/status/, (msg) => this.handleStatus(msg));
        this.bot.onText(/\/quiz/, (msg) => this.handleQuizCommand(msg));
        this.bot.onText(/\/profile/, (msg) => this.handleProfile(msg));
        this.bot.onText(/\/settings/, (msg) => this.handleSettings(msg));
        this.bot.onText(/\/leaderboard/, (msg) => this.handleLeaderboard(msg));
        this.bot.onText(/\/cancel/, (msg) => this.handleCancel(msg));
        this.bot.onText(/\/stats/, (msg) => this.handleStats(msg));

        // Quiz answer handlers (A, B, C, D)
        this.bot.onText(/^[ABCD]$/i, (msg) => this.handleQuizAnswer(msg));
        
        // Number input for question navigation
        this.bot.onText(/^\d+$/, (msg) => this.handleQuestionNavigation(msg));
        
        // Text message handler
        this.bot.onText(/^(?!\/|A|B|C|D|\d+$)/, (msg) => this.handleGeneralMessage(msg));
        
        console.log('✅ Bot message handlers setup complete');
    }

    setupCallbackHandlers() {
        this.bot.on('callback_query', async (callbackQuery) => {
            try {
                const { data, message, from } = callbackQuery;
                const chatId = message.chat.id;
                
                console.log(`📱 Callback query: ${data} from user ${from.id}`);
                
                switch (data) {
                    case 'start_quiz':
                        await this.handleStartQuiz(callbackQuery);
                        break;
                    case 'next_question':
                        await this.handleNextQuestion(callbackQuery);
                        break;
                    case 'previous_question':
                        await this.handlePreviousQuestion(callbackQuery);
                        break;
                    case 'finish_quiz':
                        await this.handleFinishQuiz(callbackQuery);
                        break;
                    case 'view_results':
                        await this.handleViewResults(callbackQuery);
                        break;
                    case 'retake_quiz':
                        await this.handleRetakeQuiz(callbackQuery);
                        break;
                    case 'language_en':
                        await this.handleLanguageChange(callbackQuery, 'en');
                        break;
                    case 'language_es':
                        await this.handleLanguageChange(callbackQuery, 'es');
                        break;
                    case 'notifications_on':
                        await this.handleNotificationToggle(callbackQuery, true);
                        break;
                    case 'notifications_off':
                        await this.handleNotificationToggle(callbackQuery, false);
                        break;
                    default:
                        if (data.startsWith('quiz_')) {
                            await this.handleQuizSelection(callbackQuery);
                        } else if (data.startsWith('answer_')) {
                            await this.handleInlineAnswer(callbackQuery);
                        }
                        break;
                }
                
                // Answer callback query
                await this.bot.answerCallbackQuery(callbackQuery.id);
                
            } catch (error) {
                console.error('Error handling callback query:', error.message);
                await this.bot.answerCallbackQuery(callbackQuery.id, { 
                    text: 'Sorry, something went wrong. Please try again.' 
                });
            }
        });
    }

    async handleStart(msg) {
        const chatId = msg.chat.id;
        const telegramId = msg.from.id;
        const firstName = msg.from.first_name;

        try {
            // Log activity
            await this.logActivity(null, telegramId, 'start_command', { 
                chat_id: chatId, 
                first_name: firstName 
            });

            // Check if user is already registered
            const user = await this.getUserByTelegramId(telegramId);
            
            if (user) {
                const welcomeMessage = `Welcome back, ${user.name}! 🎓\n\n` +
                    `You're registered as a ${user.role}.\n\n` +
                    `📊 **Your Stats:**\n` +
                    `• Total Quizzes: ${await this.getUserQuizCount(user.id)}\n` +
                    `• Average Score: ${await this.getUserAverageScore(user.id)}%\n` +
                    `• Active Sessions: ${await this.getActiveSessionCount(user.id)}\n\n` +
                    `Use /help to see available commands.`;

                await this.bot.sendMessage(chatId, welcomeMessage, { parse_mode: 'Markdown' });
                
                // Check for pending quizzes
                await this.checkForPendingQuizzes(telegramId, chatId);
                
            } else {
                const welcomeMessage = `Welcome to Quiz Whiz! 🎓📚\n\n` +
                    `Hi ${firstName}! I'm your AI-powered quiz assistant.\n\n` +
                    `To get started, you need to register with your school phone number.\n\n` +
                    `**Registration:**\n` +
                    `Use: /register YOUR_PHONE_NUMBER\n\n` +
                    `**Example:**\n` +
                    `/register +1234567890\n\n` +
                    `Your phone number should match the one registered in your school system.\n\n` +
                    `Need help? Use /help for more information.`;

                await this.bot.sendMessage(chatId, welcomeMessage, { parse_mode: 'Markdown' });
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
            
            // Validate phone number format
            if (!/^\+?[\d\s\-\(\)]{10,}$/.test(cleanPhone)) {
                await this.bot.sendMessage(chatId, 
                    '❌ Invalid phone number format.\n\n' +
                    'Please use a valid phone number with country code.\n' +
                    'Example: +1234567890 or 1234567890'
                );
                return;
            }
            
            // Find user by phone number
            const [rows] = await this.db.execute(
                'SELECT * FROM users WHERE phone = ?',
                [cleanPhone]
            );
            
            if (rows.length === 0) {
                await this.bot.sendMessage(chatId, 
                    '❌ Phone number not found in our system.\n\n' +
                    'Please make sure you\'re using the same phone number that\'s registered in your school account.\n\n' +
                    'If you continue to have issues, contact your teacher or administrator.'
                );
                return;
            }

            const user = rows[0];
            
            // Check if phone number is already registered with another Telegram account
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

            // Create or update user preferences
            await this.db.execute(`
                INSERT INTO user_preferences (user_id, telegram_id, language, notifications_enabled, quiz_reminders, daily_digest)
                VALUES (?, ?, 'en', TRUE, TRUE, FALSE)
                ON DUPLICATE KEY UPDATE telegram_id = VALUES(telegram_id)
            `, [user.id, telegramId]);

            const successMessage = `✅ **Registration Successful!**\n\n` +
                `Welcome, ${user.name}! 🎉\n` +
                `**Role:** ${user.role}\n` +
                `**Class:** ${user.class || 'Not assigned'}\n\n` +
                `You'll now receive:\n` +
                `• 📝 New quiz notifications\n` +
                `• 📊 Progress updates\n` +
                `• 🏆 Achievement notifications\n` +
                `• 📅 Quiz reminders\n\n` +
                `Use /help to see available commands.\n\n` +
                `🎯 **Ready to start learning!**`;

            await this.bot.sendMessage(chatId, successMessage, { parse_mode: 'Markdown' });

            // Log successful registration
            await this.logActivity(user.id, telegramId, 'registration_success', { 
                phone: cleanPhone, 
                role: user.role,
                class: user.class
            });

            console.log(`👤 User registered: ${user.name} (${user.role}) - Telegram ID: ${telegramId}`);

            // Check for available quizzes
            await this.checkForAvailableQuizzes(telegramId, chatId);
            
        } catch (error) {
            console.error('Error in handleRegistration:', error.message);
            await this.bot.sendMessage(chatId, 'Sorry, registration failed. Please try again later.');
        }
    }

    async handleHelp(msg) {
        const chatId = msg.chat.id;
        
        const helpText = `📚 **Quiz Whiz Bot Commands**\n\n` +
            `🔹 **Basic Commands:**\n` +
            `• /start - Start the bot and see welcome message\n` +
            `• /register PHONE - Register with school phone number\n` +
            `• /help - Show this help message\n` +
            `• /profile - View your profile and statistics\n\n` +
            `🔹 **Quiz Commands:**\n` +
            `• /quiz - View available quizzes\n` +
            `• /status - Check your current quiz status\n` +
            `• /stats - View your quiz performance\n\n` +
            `🔹 **Settings:**\n` +
            `• /settings - Manage your preferences\n` +
            `• /leaderboard - View class leaderboard\n` +
            `• /cancel - Cancel current operation\n\n` +
            `📝 **How it works:**\n` +
            `• Register with your school phone number\n` +
            `• Receive quizzes automatically from teachers\n` +
            `• Answer questions with A, B, C, or D\n` +
            `• Track your progress and scores\n` +
            `• Get instant feedback and explanations\n\n` +
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
                    '❌ You need to register first. Use /register YOUR_PHONE_NUMBER'
                );
                return;
            }

            // Get user's active quiz sessions
            const activeSessions = await this.getActiveSessions(telegramId);
            
            let statusMessage = `📊 **Your Status**\n\n` +
                `👤 **Profile:**\n` +
                `• Name: ${user.name}\n` +
                `• Role: ${user.role}\n` +
                `• Class: ${user.class || 'Not assigned'}\n\n`;

            if (activeSessions.length > 0) {
                statusMessage += `📝 **Active Quizzes:**\n`;
                for (const session of activeSessions) {
                    const quiz = await this.getQuizById(session.quiz_id);
                    const progress = Math.round((session.current_question / session.total_questions) * 100);
                    
                    statusMessage += `• ${quiz.title} (${quiz.subject})\n` +
                        `  Progress: ${progress}% (${session.current_question}/${session.total_questions})\n` +
                        `  Started: ${new Date(session.start_time).toLocaleDateString()}\n\n`;
                }
            } else {
                statusMessage += `📝 **Active Quizzes:** None\n\n`;
            }

            // Get recent completed quizzes
            const recentQuizzes = await this.getRecentCompletedQuizzes(user.id);
            if (recentQuizzes.length > 0) {
                statusMessage += `🏆 **Recent Results:**\n`;
                for (const quiz of recentQuizzes.slice(0, 3)) {
                    statusMessage += `• ${quiz.title}: ${quiz.score}%\n`;
                }
            }

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
                    '❌ You need to register first. Use /register YOUR_PHONE_NUMBER'
                );
                return;
            }

            // Get available quizzes for user's class
            const availableQuizzes = await this.getAvailableQuizzes(user.class);
            
            if (availableQuizzes.length === 0) {
                await this.bot.sendMessage(chatId, 
                    '📝 **No Quizzes Available**\n\n' +
                    'There are currently no quizzes assigned to your class.\n\n' +
                    'Check back later or contact your teacher for new assignments.'
                );
                return;
            }

            let quizMessage = `📝 **Available Quizzes**\n\n`;
            
            for (let i = 0; i < availableQuizzes.length; i++) {
                const quiz = availableQuizzes[i];
                const isStarted = await this.isQuizStarted(user.id, quiz.id);
                const status = isStarted ? '🔄 In Progress' : '🆕 New';
                
                quizMessage += `${i + 1}. **${quiz.title}** (${quiz.subject})\n` +
                    `   ${status} • Duration: ${quiz.duration} min\n` +
                    `   Questions: ${JSON.parse(quiz.questions).length}\n` +
                    `   Due: ${new Date(quiz.end_date).toLocaleDateString()}\n\n`;
            }

            // Create inline keyboard for quiz selection
            const keyboard = {
                inline_keyboard: availableQuizzes.map((quiz, index) => [{
                    text: `${index + 1}. ${quiz.title}`,
                    callback_data: `quiz_${quiz.id}`
                }])
            };

            await this.bot.sendMessage(chatId, quizMessage, {
                parse_mode: 'Markdown',
                reply_markup: keyboard
            });
            
        } catch (error) {
            console.error('Error in handleQuizCommand:', error.message);
            await this.bot.sendMessage(chatId, 'Sorry, there was an error getting available quizzes. Please try again.');
        }
    }

    async handleQuizSelection(callbackQuery) {
        const chatId = callbackQuery.message.chat.id;
        const telegramId = callbackQuery.from.id;
        const quizId = callbackQuery.data.split('_')[1];

        try {
            const user = await this.getUserByTelegramId(telegramId);
            if (!user) {
                await this.bot.answerCallbackQuery(callbackQuery.id, { 
                    text: 'Please register first using /register' 
                });
                return;
            }

            const quiz = await this.getQuizById(quizId);
            if (!quiz) {
                await this.bot.answerCallbackQuery(callbackQuery.id, { 
                    text: 'Quiz not found' 
                });
                return;
            }

            // Check if user already has an active session for this quiz
            const existingSession = await this.getActiveSession(telegramId, quizId);
            
            if (existingSession) {
                // Resume existing session
                await this.resumeQuizSession(existingSession, chatId);
            } else {
                // Start new session
                await this.startNewQuizSession(user.id, quizId, chatId);
            }
            
        } catch (error) {
            console.error('Error in handleQuizSelection:', error.message);
            await this.bot.answerCallbackQuery(callbackQuery.id, { 
                text: 'Error starting quiz. Please try again.' 
            });
        }
    }

    async startNewQuizSession(userId, quizId, chatId) {
        try {
            const quiz = await this.getQuizById(quizId);
            const questions = JSON.parse(quiz.questions);
            
            // Create new quiz session
            const [result] = await this.db.execute(`
                INSERT INTO quiz_sessions (student_id, quiz_id, status, total_questions, start_time)
                VALUES (?, ?, 'active', ?, NOW())
            `, [userId, quizId, questions.length]);
            
            const sessionId = result.insertId;
            
            // Store session in memory for quick access
            const session = {
                id: sessionId,
                student_id: userId,
                quiz_id: quizId,
                status: 'active',
                current_question: 1,
                total_questions: questions.length,
                answers: {},
                start_time: new Date(),
                questions: questions
            };
            
            this.activeSessions.set(sessionId, session);
            
            // Send first question
            await this.sendQuestion(session, chatId, 1);
            
            // Log session start
            await this.logActivity(userId, null, 'quiz_session_started', {
                quiz_id: quizId,
                quiz_title: quiz.title,
                session_id: sessionId
            });
            
        } catch (error) {
            console.error('Error starting new quiz session:', error.message);
            throw error;
        }
    }

    async sendQuestion(session, chatId, questionNumber) {
        try {
            const question = session.questions[questionNumber - 1];
            const questionText = `📝 **Question ${questionNumber} of ${session.total_questions}**\n\n` +
                `${question.question}\n\n`;
            
            // Create options keyboard
            const options = question.options || ['A', 'B', 'C', 'D'];
            const keyboard = {
                inline_keyboard: [
                    options.map(option => ({
                        text: option,
                        callback_data: `answer_${session.id}_${questionNumber}_${option}`
                    }))
                ]
            };

            // Add navigation buttons
            if (questionNumber > 1) {
                keyboard.inline_keyboard.push([{
                    text: '⬅️ Previous',
                    callback_data: `previous_question_${session.id}_${questionNumber}`
                }]);
            }
            
            if (questionNumber < session.total_questions) {
                keyboard.inline_keyboard.push([{
                    text: 'Next ➡️',
                    callback_data: `next_question_${session.id}_${questionNumber}`
                }]);
            }

            // Add finish button for last question
            if (questionNumber === session.total_questions) {
                keyboard.inline_keyboard.push([{
                    text: '🏁 Finish Quiz',
                    callback_data: `finish_quiz_${session.id}`
                }]);
            }

            await this.bot.sendMessage(chatId, questionText, {
                parse_mode: 'Markdown',
                reply_markup: keyboard
            });
            
        } catch (error) {
            console.error('Error sending question:', error.message);
            throw error;
        }
    }

    async handleInlineAnswer(callbackQuery) {
        try {
            const { data, message, from } = callbackQuery;
            const [_, sessionId, questionNumber, answer] = data.split('_');
            
            const session = this.activeSessions.get(parseInt(sessionId));
            if (!session) {
                await this.bot.answerCallbackQuery(callbackQuery.id, { 
                    text: 'Session expired. Please start a new quiz.' 
                });
                return;
            }

            // Store the answer
            session.answers[questionNumber] = answer;
            
            // Update database
            await this.db.execute(`
                UPDATE quiz_sessions 
                SET answers = ?, current_question = ?, updated_at = NOW()
                WHERE id = ?
            `, [JSON.stringify(session.answers), questionNumber, sessionId]);

            // Send confirmation
            await this.bot.answerCallbackQuery(callbackQuery.id, { 
                text: `✅ Answer ${answer} recorded for question ${questionNumber}` 
            });

            // Log answer
            await this.logActivity(session.student_id, from.id, 'quiz_answer_submitted', {
                session_id: sessionId,
                question_number: questionNumber,
                answer: answer,
                quiz_id: session.quiz_id
            });

            // If this is the last question, show finish option
            if (questionNumber == session.total_questions) {
                await this.bot.editMessageReplyMarkup({
                    inline_keyboard: [[{
                        text: '🏁 Finish Quiz',
                        callback_data: `finish_quiz_${sessionId}`
                    }]]
                }, {
                    chat_id: message.chat.id,
                    message_id: message.message_id
                });
            }
            
        } catch (error) {
            console.error('Error handling inline answer:', error.message);
            await this.bot.answerCallbackQuery(callbackQuery.id, { 
                text: 'Error recording answer. Please try again.' 
            });
        }
    }

    async handleFinishQuiz(callbackQuery) {
        try {
            const { data, message, from } = callbackQuery;
            const sessionId = data.split('_')[2];
            
            const session = this.activeSessions.get(parseInt(sessionId));
            if (!session) {
                await this.bot.answerCallbackQuery(callbackQuery.id, { 
                    text: 'Session expired. Please start a new quiz.' 
                });
                return;
            }

            // Calculate score
            const score = await this.calculateQuizScore(session);
            
            // Update session status
            await this.db.execute(`
                UPDATE quiz_sessions 
                SET status = 'completed', score = ?, end_time = NOW(), updated_at = NOW()
                WHERE id = ?
            `, [score, sessionId]);

            // Remove from active sessions
            this.activeSessions.delete(parseInt(sessionId));

            // Send completion message
            const completionMessage = `🎉 **Quiz Completed!**\n\n` +
                `📊 **Your Score:** ${score}%\n` +
                `📝 **Questions Answered:** ${Object.keys(session.answers).length}/${session.total_questions}\n` +
                `⏱️ **Time Spent:** ${this.calculateTimeSpent(session.start_time)}\n\n` +
                `🏆 **Performance:** ${this.getPerformanceMessage(score)}\n\n` +
                `Use /stats to view detailed results or /quiz to start another quiz.`;

            await this.bot.sendMessage(message.chat.id, completionMessage, { parse_mode: 'Markdown' });

            // Log completion
            await this.logActivity(session.student_id, from.id, 'quiz_completed', {
                session_id: sessionId,
                score: score,
                quiz_id: session.quiz_id,
                questions_answered: Object.keys(session.answers).length
            });

            await this.bot.answerCallbackQuery(callbackQuery.id, { 
                text: 'Quiz completed successfully!' 
            });
            
        } catch (error) {
            console.error('Error finishing quiz:', error.message);
            await this.bot.answerCallbackQuery(callbackQuery.id, { 
                text: 'Error completing quiz. Please try again.' 
            });
        }
    }

    async calculateQuizScore(session) {
        try {
            const quiz = await this.getQuizById(session.quiz_id);
            const questions = JSON.parse(quiz.questions);
            let correctAnswers = 0;
            let totalAnswered = 0;

            for (let i = 1; i <= questions.length; i++) {
                if (session.answers[i]) {
                    totalAnswered++;
                    const question = questions[i - 1];
                    if (session.answers[i] === question.correct_answer) {
                        correctAnswers++;
                    }
                }
            }

            return totalAnswered > 0 ? Math.round((correctAnswers / totalAnswered) * 100) : 0;
        } catch (error) {
            console.error('Error calculating score:', error.message);
            return 0;
        }
    }

    calculateTimeSpent(startTime) {
        const timeDiff = Date.now() - new Date(startTime).getTime();
        const minutes = Math.floor(timeDiff / (1000 * 60));
        const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);
        return `${minutes}m ${seconds}s`;
    }

    getPerformanceMessage(score) {
        if (score >= 90) return '🌟 Excellent! Outstanding performance!';
        if (score >= 80) return '🎯 Great job! Well done!';
        if (score >= 70) return '👍 Good work! Keep it up!';
        if (score >= 60) return '📚 Not bad! Room for improvement.';
        if (score >= 50) return '💪 Keep practicing! You can do better.';
        return '📖 Study more! Review the material and try again.';
    }

    // Additional helper methods
    async getUserByTelegramId(telegramId) {
        const [rows] = await this.db.execute(
            'SELECT * FROM users WHERE telegram_id = ?',
            [telegramId]
        );
        return rows[0] || null;
    }

    async getQuizById(quizId) {
        const [rows] = await this.db.execute(
            'SELECT * FROM quizzes WHERE id = ?',
            [quizId]
        );
        return rows[0] || null;
    }

    async getActiveSessions(telegramId) {
        const [rows] = await this.db.execute(`
            SELECT qs.*, q.title, q.subject 
            FROM quiz_sessions qs 
            JOIN quizzes q ON qs.quiz_id = q.id 
            JOIN users u ON qs.student_id = u.id 
            WHERE u.telegram_id = ? AND qs.status = 'active'
            ORDER BY qs.created_at DESC
        `, [telegramId]);
        return rows;
    }

    async getActiveSession(telegramId, quizId) {
        const [rows] = await this.db.execute(`
            SELECT qs.*, q.title, q.subject 
            FROM quiz_sessions qs 
            JOIN quizzes q ON qs.quiz_id = q.id 
            JOIN users u ON qs.student_id = u.id 
            WHERE u.telegram_id = ? AND qs.quiz_id = ? AND qs.status = 'active'
            ORDER BY qs.created_at DESC
        `, [telegramId, quizId]);
        return rows[0] || null;
    }

    async getAvailableQuizzes(className) {
        const [rows] = await this.db.execute(`
            SELECT DISTINCT q.* 
            FROM quizzes q
            JOIN class_quizzes cq ON q.id = cq.quiz_id
            JOIN classes c ON cq.class_id = c.id
            WHERE c.name = ? AND q.status = 'active' AND q.end_date > NOW()
            ORDER BY q.created_at DESC
        `, [className]);
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

    // Additional helper methods for complete functionality
    async getUserQuizCount(userId) {
        try {
            const [rows] = await this.db.execute(
                'SELECT COUNT(*) as count FROM quiz_sessions WHERE student_id = ? AND status = "completed"',
                [userId]
            );
            return rows[0]?.count || 0;
        } catch (error) {
            console.error('Error getting user quiz count:', error.message);
            return 0;
        }
    }

    async getUserAverageScore(userId) {
        try {
            const [rows] = await this.db.execute(
                'SELECT AVG(score) as average FROM quiz_sessions WHERE student_id = ? AND status = "completed" AND score IS NOT NULL',
                [userId]
            );
            return rows[0]?.average ? Math.round(rows[0].average) : 0;
        } catch (error) {
            console.error('Error getting user average score:', error.message);
            return 0;
        }
    }

    async getActiveSessionCount(userId) {
        try {
            const [rows] = await this.db.execute(
                'SELECT COUNT(*) as count FROM quiz_sessions WHERE student_id = ? AND status = "active"',
                [userId]
            );
            return rows[0]?.count || 0;
        } catch (error) {
            console.error('Error getting active session count:', error.message);
            return 0;
        }
    }

    async checkForPendingQuizzes(telegramId, chatId) {
        try {
            const user = await this.getUserByTelegramId(telegramId);
            if (!user || !user.class) return;

            const pendingQuizzes = await this.getAvailableQuizzes(user.class);
            if (pendingQuizzes.length > 0) {
                await this.bot.sendMessage(chatId, 
                    `📝 **You have ${pendingQuizzes.length} pending quiz(zes)!**\n\n` +
                    `Use /quiz to view and start them.`
                );
            }
        } catch (error) {
            console.error('Error checking for pending quizzes:', error.message);
        }
    }

    async checkForAvailableQuizzes(telegramId, chatId) {
        try {
            const user = await this.getUserByTelegramId(telegramId);
            if (!user || !user.class) return;

            const availableQuizzes = await this.getAvailableQuizzes(user.class);
            if (availableQuizzes.length > 0) {
                await this.bot.sendMessage(chatId, 
                    `🎯 **Welcome! You have ${availableQuizzes.length} quiz(zes) available.**\n\n` +
                    `Use /quiz to view and start them.`
                );
            }
        } catch (error) {
            console.error('Error checking for available quizzes:', error.message);
        }
    }

    async isQuizStarted(userId, quizId) {
        try {
            const [rows] = await this.db.execute(
                'SELECT COUNT(*) as count FROM quiz_sessions WHERE student_id = ? AND quiz_id = ? AND status IN ("active", "completed")',
                [userId, quizId]
            );
            return rows[0]?.count > 0;
        } catch (error) {
            console.error('Error checking if quiz started:', error.message);
            return false;
        }
    }

    async getRecentCompletedQuizzes(userId) {
        try {
            const [rows] = await this.db.execute(`
                SELECT qs.*, q.title, q.subject 
                FROM quiz_sessions qs 
                JOIN quizzes q ON qs.quiz_id = q.id 
                WHERE qs.student_id = ? AND qs.status = 'completed' 
                ORDER BY qs.end_time DESC 
                LIMIT 5
            `, [userId]);
            return rows;
        } catch (error) {
            console.error('Error getting recent completed quizzes:', error.message);
            return [];
        }
    }

    async resumeQuizSession(session, chatId) {
        try {
            const quiz = await this.getQuizById(session.quiz_id);
            const questions = JSON.parse(quiz.questions);
            
            // Store session in memory
            const memorySession = {
                id: session.id,
                student_id: session.student_id,
                quiz_id: session.quiz_id,
                status: 'active',
                current_question: session.current_question,
                total_questions: session.total_questions,
                answers: JSON.parse(session.answers || '{}'),
                start_time: new Date(session.start_time),
                questions: questions
            };
            
            this.activeSessions.set(session.id, memorySession);
            
            // Send current question
            await this.sendQuestion(memorySession, chatId, session.current_question);
            
            await this.bot.sendMessage(chatId, 
                `🔄 **Quiz Resumed!**\n\n` +
                `You're continuing: **${quiz.title}**\n` +
                `Progress: ${session.current_question}/${session.total_questions} questions\n\n` +
                `Continue answering or use the navigation buttons.`
            );
            
        } catch (error) {
            console.error('Error resuming quiz session:', error.message);
            throw error;
        }
    }

    // Additional command handlers
    async handleProfile(msg) {
        const chatId = msg.chat.id;
        const telegramId = msg.from.id;

        try {
            const user = await this.getUserByTelegramId(telegramId);
            if (!user) {
                await this.bot.sendMessage(chatId, 
                    '❌ You need to register first. Use /register YOUR_PHONE_NUMBER'
                );
                return;
            }

            const totalQuizzes = await this.getUserQuizCount(user.id);
            const averageScore = await this.getUserAverageScore(user.id);
            const activeSessions = await this.getActiveSessionCount(user.id);

            const profileMessage = `👤 **Your Profile**\n\n` +
                `**Personal Info:**\n` +
                `• Name: ${user.name}\n` +
                `• Role: ${user.role}\n` +
                `• Class: ${user.class || 'Not assigned'}\n` +
                `• Phone: ${user.phone}\n\n` +
                `**Quiz Statistics:**\n` +
                `• Total Quizzes: ${totalQuizzes}\n` +
                `• Average Score: ${averageScore}%\n` +
                `• Active Sessions: ${activeSessions}\n\n` +
                `**Performance Level:** ${this.getPerformanceLevel(averageScore)}`;

            await this.bot.sendMessage(chatId, profileMessage, { parse_mode: 'Markdown' });
            
        } catch (error) {
            console.error('Error in handleProfile:', error.message);
            await this.bot.sendMessage(chatId, 'Sorry, there was an error getting your profile. Please try again.');
        }
    }

    async handleSettings(msg) {
        const chatId = msg.chat.id;
        const telegramId = msg.from.id;

        try {
            const user = await this.getUserByTelegramId(telegramId);
            if (!user) {
                await this.bot.sendMessage(chatId, 
                    '❌ You need to register first. Use /register YOUR_PHONE_NUMBER'
                );
                return;
            }

            const keyboard = {
                inline_keyboard: [
                    [{ text: '🌐 Language', callback_data: 'settings_language' }],
                    [{ text: '🔔 Notifications', callback_data: 'settings_notifications' }],
                    [{ text: '📅 Quiz Reminders', callback_data: 'settings_reminders' }],
                    [{ text: '📊 Daily Digest', callback_data: 'settings_digest' }]
                ]
            };

            await this.bot.sendMessage(chatId, 
                `⚙️ **Settings**\n\n` +
                `Manage your bot preferences and notifications.`,
                { parse_mode: 'Markdown', reply_markup: keyboard }
            );
            
        } catch (error) {
            console.error('Error in handleSettings:', error.message);
            await this.bot.sendMessage(chatId, 'Sorry, there was an error opening settings. Please try again.');
        }
    }

    async handleLeaderboard(msg) {
        const chatId = msg.chat.id;
        const telegramId = msg.from.id;

        try {
            const user = await this.getUserByTelegramId(telegramId);
            if (!user) {
                await this.bot.sendMessage(chatId, 
                    '❌ You need to register first. Use /register YOUR_PHONE_NUMBER'
                );
                return;
            }

            if (!user.class) {
                await this.bot.sendMessage(chatId, 
                    '❌ You need to be assigned to a class to view the leaderboard.'
                );
                return;
            }

            const leaderboard = await this.getClassLeaderboard(user.class);
            
            let leaderboardMessage = `🏆 **Class Leaderboard - ${user.class}**\n\n`;
            
            if (leaderboard.length > 0) {
                leaderboard.forEach((entry, index) => {
                    const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}.`;
                    leaderboardMessage += `${medal} ${entry.name}: ${entry.average_score}% (${entry.quiz_count} quizzes)\n`;
                });
            } else {
                leaderboardMessage += 'No quiz results yet. Be the first to complete a quiz!';
            }

            await this.bot.sendMessage(chatId, leaderboardMessage, { parse_mode: 'Markdown' });
            
        } catch (error) {
            console.error('Error in handleLeaderboard:', error.message);
            await this.bot.sendMessage(chatId, 'Sorry, there was an error getting the leaderboard. Please try again.');
        }
    }

    async handleStats(msg) {
        const chatId = msg.chat.id;
        const telegramId = msg.from.id;

        try {
            const user = await this.getUserByTelegramId(telegramId);
            if (!user) {
                await this.bot.sendMessage(chatId, 
                    '❌ You need to register first. Use /register YOUR_PHONE_NUMBER'
                );
                return;
            }

            const stats = await this.getUserDetailedStats(user.id);
            
            let statsMessage = `📊 **Your Quiz Statistics**\n\n`;
            
            if (stats.totalQuizzes > 0) {
                statsMessage += `**Overall Performance:**\n` +
                    `• Total Quizzes: ${stats.totalQuizzes}\n` +
                    `• Average Score: ${stats.averageScore}%\n` +
                    `• Best Score: ${stats.bestScore}%\n` +
                    `• Total Questions: ${stats.totalQuestions}\n` +
                    `• Correct Answers: ${stats.correctAnswers}\n\n`;
                
                if (stats.subjectBreakdown.length > 0) {
                    statsMessage += `**Subject Breakdown:**\n`;
                    stats.subjectBreakdown.forEach(subject => {
                        statsMessage += `• ${subject.subject}: ${subject.averageScore}% (${subject.quizCount} quizzes)\n`;
                    });
                }
            } else {
                statsMessage += 'You haven\'t completed any quizzes yet. Start with /quiz!';
            }

            await this.bot.sendMessage(chatId, statsMessage, { parse_mode: 'Markdown' });
            
        } catch (error) {
            console.error('Error in handleStats:', error.message);
            await this.bot.sendMessage(chatId, 'Sorry, there was an error getting your statistics. Please try again.');
        }
    }

    async handleCancel(msg) {
        const chatId = msg.chat.id;
        const telegramId = msg.from.id;

        try {
            // Clear user state
            this.userStates.delete(telegramId);
            
            await this.bot.sendMessage(chatId, 
                '✅ Operation cancelled. You can start over with any command.'
            );
            
        } catch (error) {
            console.error('Error in handleCancel:', error.message);
            await this.bot.sendMessage(chatId, 'Sorry, there was an error cancelling the operation.');
        }
    }

    // Additional helper methods
    getPerformanceLevel(averageScore) {
        if (averageScore >= 90) return '🌟 Master';
        if (averageScore >= 80) return '🎯 Expert';
        if (averageScore >= 70) return '👍 Advanced';
        if (averageScore >= 60) return '📚 Intermediate';
        if (averageScore >= 50) return '💪 Beginner';
        return '📖 Novice';
    }

    async getClassLeaderboard(className) {
        try {
            const [rows] = await this.db.execute(`
                SELECT 
                    u.name,
                    COUNT(qs.id) as quiz_count,
                    ROUND(AVG(qs.score), 1) as average_score
                FROM users u
                LEFT JOIN quiz_sessions qs ON u.id = qs.student_id AND qs.status = 'completed'
                WHERE u.class = ? AND u.role = 'student'
                GROUP BY u.id, u.name
                HAVING quiz_count > 0
                ORDER BY average_score DESC, quiz_count DESC
                LIMIT 10
            `, [className]);
            return rows;
        } catch (error) {
            console.error('Error getting class leaderboard:', error.message);
            return [];
        }
    }

    async getUserDetailedStats(userId) {
        try {
            // Overall stats
            const [overallStats] = await this.db.execute(`
                SELECT 
                    COUNT(*) as total_quizzes,
                    ROUND(AVG(score), 1) as average_score,
                    MAX(score) as best_score,
                    SUM(JSON_LENGTH(answers)) as total_questions
                FROM quiz_sessions 
                WHERE student_id = ? AND status = 'completed' AND score IS NOT NULL
            `, [userId]);

            // Subject breakdown
            const [subjectBreakdown] = await this.db.execute(`
                SELECT 
                    q.subject,
                    COUNT(qs.id) as quiz_count,
                    ROUND(AVG(qs.score), 1) as average_score
                FROM quiz_sessions qs
                JOIN quizzes q ON qs.quiz_id = q.id
                WHERE qs.student_id = ? AND qs.status = 'completed' AND qs.score IS NOT NULL
                GROUP BY q.subject
                ORDER BY average_score DESC
            `, [userId]);

            // Calculate correct answers
            const [correctAnswersResult] = await this.db.execute(`
                SELECT 
                    SUM(
                        JSON_LENGTH(
                            JSON_EXTRACT(qs.answers, '$.*')
                        )
                    ) as correct_answers
                FROM quiz_sessions qs
                WHERE qs.student_id = ? AND qs.status = 'completed'
            `, [userId]);

            return {
                totalQuizzes: overallStats[0]?.total_quizzes || 0,
                averageScore: overallStats[0]?.average_score || 0,
                bestScore: overallStats[0]?.best_score || 0,
                totalQuestions: overallStats[0]?.total_questions || 0,
                correctAnswers: correctAnswersResult[0]?.correct_answers || 0,
                subjectBreakdown: subjectBreakdown
            };
        } catch (error) {
            console.error('Error getting user detailed stats:', error.message);
            return {
                totalQuizzes: 0,
                averageScore: 0,
                bestScore: 0,
                totalQuestions: 0,
                correctAnswers: 0,
                subjectBreakdown: []
            };
        }
    }

    // Webhook setup for backend integration
    async setupWebhook() {
        try {
            if (!this.bot) return;

            const webhookUrl = `${this.backendUrl}/webhook/telegram`;
            await this.bot.setWebHook(webhookUrl);
            console.log(`✅ Webhook set to: ${webhookUrl}`);
            
        } catch (error) {
            console.error('❌ Error setting webhook:', error.message);
        }
    }

    // Periodic tasks
    async startPeriodicTasks() {
        // Check for new quiz assignments every 5 minutes
        setInterval(async () => {
            try {
                await this.checkForNewQuizAssignments();
            } catch (error) {
                console.error('Error in periodic quiz check:', error.message);
            }
        }, 5 * 60 * 1000);

        // Clean up expired sessions every 10 minutes
        setInterval(async () => {
            try {
                await this.cleanupExpiredSessions();
            } catch (error) {
                console.error('Error in periodic cleanup:', error.message);
            }
        }, 10 * 60 * 1000);

        console.log('✅ Periodic tasks started');
    }

    async checkForNewQuizAssignments() {
        try {
            // Get all registered users
            const [users] = await this.db.execute(
                'SELECT id, telegram_id, class FROM users WHERE telegram_id IS NOT NULL AND role = "student"'
            );

            for (const user of users) {
                if (!user.class) continue;

                // Check for new quizzes assigned to user's class
                const newQuizzes = await this.getNewQuizzesForUser(user.id, user.class);
                
                if (newQuizzes.length > 0) {
                    await this.notifyUserOfNewQuizzes(user.telegram_id, newQuizzes);
                }
            }
        } catch (error) {
            console.error('Error checking for new quiz assignments:', error.message);
        }
    }

    async getNewQuizzesForUser(userId, className) {
        try {
            const [rows] = await this.db.execute(`
                SELECT DISTINCT q.* 
                FROM quizzes q
                JOIN class_quizzes cq ON q.id = cq.quiz_id
                JOIN classes c ON cq.class_id = c.id
                WHERE c.name = ? 
                AND q.status = 'active' 
                AND q.end_date > NOW()
                AND q.id NOT IN (
                    SELECT quiz_id FROM quiz_sessions WHERE student_id = ?
                )
                ORDER BY q.created_at DESC
            `, [className, userId]);
            return rows;
        } catch (error) {
            console.error('Error getting new quizzes for user:', error.message);
            return [];
        }
    }

    async notifyUserOfNewQuizzes(telegramId, quizzes) {
        try {
            if (quizzes.length === 1) {
                await this.bot.sendMessage(telegramId, 
                    `📝 **New Quiz Available!**\n\n` +
                    `**${quizzes[0].title}** (${quizzes[0].subject})\n` +
                    `Use /quiz to start it now!`
                );
            } else {
                await this.bot.sendMessage(telegramId, 
                    `📝 **${quizzes.length} New Quizzes Available!**\n\n` +
                    `Use /quiz to view and start them.`
                );
            }
        } catch (error) {
            console.error('Error notifying user of new quizzes:', error.message);
        }
    }

    async cleanupExpiredSessions() {
        try {
            const [expiredSessions] = await this.db.execute(`
                SELECT id FROM quiz_sessions 
                WHERE status = 'active' 
                AND created_at < DATE_SUB(NOW(), INTERVAL 24 HOUR)
            `);

            for (const session of expiredSessions) {
                // Update session status
                await this.db.execute(
                    'UPDATE quiz_sessions SET status = "expired", updated_at = NOW() WHERE id = ?',
                    [session.id]
                );

                // Remove from memory
                this.activeSessions.delete(session.id);
            }

            if (expiredSessions.length > 0) {
                console.log(`🧹 Cleaned up ${expiredSessions.length} expired sessions`);
            }
        } catch (error) {
            console.error('Error cleaning up expired sessions:', error.message);
        }
    }

    async start() {
        try {
            console.log('🚀 Starting Enhanced Quiz Whiz Bot...');
            await this.initializeDatabase();
            await this.initializeBot();
            
            // Setup webhook for backend integration
            await this.setupWebhook();
            
            // Start periodic tasks
            await this.startPeriodicTasks();
            
            console.log('🎉 Enhanced Bot is now running! Press Ctrl+C to stop.');
            
            // Keep the process alive
            process.on('SIGINT', () => {
                console.log('\n🛑 Shutting down enhanced bot...');
                this.stop();
                process.exit(0);
            });
            
        } catch (error) {
            console.error('❌ Failed to start enhanced bot:', error.message);
            process.exit(1);
        }
    }

    async stop() {
        if (this.bot) {
            this.bot.stopPolling();
            this.isRunning = false;
            console.log('✅ Enhanced Bot stopped');
        }
        
        if (this.db) {
            await this.db.end();
            console.log('✅ Database connection closed');
        }
    }
}

// Start the enhanced bot
const enhancedBot = new EnhancedQuizWhizBot();
enhancedBot.start().catch(error => {
    console.error('❌ Enhanced Bot startup failed:', error.message);
    process.exit(1);
});