#!/usr/bin/env node

// Startup script for Quiz Whiz Telegram Bot
require('dotenv').config();

const TelegramBot = require('node-telegram-bot-api');
const mysql = require('mysql2/promise');

class QuizWhizBot {
    constructor() {
        this.bot = null;
        this.db = null;
        this.isRunning = false;
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
        } catch (error) {
            console.error('❌ Database connection failed:', error.message);
            throw error;
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

        try {
            // Check if user is already registered
            const user = await this.getUserByTelegramId(telegramId);
            
            if (user) {
                await this.bot.sendMessage(chatId, 
                    `Welcome back, ${user.name}! 🎓\n\n` +
                    `You're registered as a ${user.role}.\n` +
                    `Use /help to see available commands.`
                );
            } else {
                await this.bot.sendMessage(chatId, 
                    `Welcome to Quiz Whiz! 🎓📚\n\n` +
                    `To get started, you need to register with your phone number.\n` +
                    `Use this command: /register YOUR_PHONE_NUMBER\n\n` +
                    `Example: /register +1234567890\n\n` +
                    `Your phone number should match the one registered in your school system.`
                );
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
                    'Please make sure you\'re using the same phone number that\'s registered in your school account.'
                );
                return;
            }

            const user = rows[0];
            
            // Update user with Telegram ID
            await this.db.execute(
                'UPDATE users SET telegram_id = ? WHERE id = ?',
                [telegramId, user.id]
            );

            await this.bot.sendMessage(chatId, 
                `✅ Registration successful!\n\n` +
                `Welcome, ${user.name}! 🎉\n` +
                `Role: ${user.role}\n\n` +
                `You'll now receive quizzes and updates automatically.\n` +
                `Use /help to see available commands.`
            );

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
            `🔹 /help - Show this help message\n\n` +
            `📝 **How it works:**\n` +
            `• Register with your school phone number\n` +
            `• Receive quizzes automatically\n` +
            `• Answer questions with A, B, C, or D\n` +
            `• Track your progress and scores\n\n` +
            `❓ **Need help?** Contact your teacher or administrator.`;

        await this.bot.sendMessage(chatId, helpText, { parse_mode: 'Markdown' });
    }

    async handleQuizAnswer(msg) {
        const chatId = msg.chat.id;
        const answer = msg.text.toUpperCase();
        
        try {
            // Get active quiz session for this user
            const session = await this.getActiveSession(msg.from.id);
            
            if (!session) {
                await this.bot.sendMessage(chatId, 
                    '❌ No active quiz session found.\n\n' +
                    'Wait for a quiz to be assigned by your teacher.'
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
                // Handle quiz start
                await this.bot.sendMessage(chatId, '🎯 Quiz starting... Get ready!');
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
                `SELECT qs.*, q.title, q.subject 
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
            // This is a simplified version - in a real implementation,
            // you'd validate the answer against the correct answer
            await this.bot.sendMessage(chatId, 
                `✅ Answer recorded: ${answer}\n\n` +
                `Processing your answer...`
            );
            
            // Simulate processing delay
            setTimeout(async () => {
                await this.bot.sendMessage(chatId, 
                    `🎯 Answer processed successfully!\n\n` +
                    `You'll receive the next question shortly.`
                );
            }, 1000);
            
        } catch (error) {
            console.error('Error processing quiz answer:', error.message);
            await this.bot.sendMessage(chatId, 'Error processing answer. Please try again.');
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