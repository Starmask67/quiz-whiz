// Telegram Bot for Quiz Whiz
const TelegramBot = require('node-telegram-bot-api');
const db = require('../database/connection');

class QuizWhizBot {
    constructor() {
        this.bot = null;
        this.isRunning = false;
        this.activeQuizzes = new Map(); // Store active quiz sessions
        this.initializeBot();
    }

    async initializeBot() {
        try {
            const token = process.env.TELEGRAM_BOT_TOKEN || await this.getBotTokenFromDB();
            if (!token) {
                console.warn('⚠️ Telegram Bot Token not found. Bot will not start.');
                return;
            }

            this.bot = new TelegramBot(token, { polling: true });
            this.setupMessageHandlers();
            console.log('✅ Telegram Bot initialized successfully');
        } catch (error) {
            console.error('❌ Failed to initialize Telegram Bot:', error.message);
        }
    }

    async getBotTokenFromDB() {
        try {
            const result = await db.query(
                'SELECT setting_value FROM system_settings WHERE setting_key = ?',
                ['telegram_bot_token']
            );
            return result[0]?.setting_value || null;
        } catch (error) {
            console.error('Error fetching bot token from database:', error.message);
            return null;
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
            const userResult = await db.query(
                'SELECT * FROM users WHERE phone = ?',
                [cleanPhone]
            );

            if (userResult.length === 0) {
                await this.bot.sendMessage(chatId, 
                    `❌ Phone number ${cleanPhone} not found in our system.\n\n` +
                    `Please contact your school administrator to add your number to the system first.`
                );
                return;
            }

            const user = userResult[0];

            // Check if already registered with different Telegram account
            if (user.telegram_id && user.telegram_id !== telegramId) {
                await this.bot.sendMessage(chatId, 
                    `❌ This phone number is already registered with a different Telegram account.\n\n` +
                    `Please contact your school administrator if you need help.`
                );
                return;
            }

            // Update user with Telegram ID
            await db.query(
                'UPDATE users SET telegram_id = ? WHERE id = ?',
                [telegramId, user.id]
            );

            // Send role-specific welcome message
            let welcomeMessage = `✅ Registration successful!\n\n` +
                `Welcome ${user.name}! 🎓\n` +
                `Role: ${user.role.charAt(0).toUpperCase() + user.role.slice(1)}\n\n`;

            if (user.role === 'student') {
                const studentInfo = await this.getStudentInfo(user.id);
                if (studentInfo) {
                    welcomeMessage += `Class: ${studentInfo.class_name} - ${studentInfo.division}\n` +
                        `Admission No: ${studentInfo.admission_no}\n\n`;
                }
                welcomeMessage += `You'll receive quizzes from your teachers here. ` +
                    `Answer with A, B, C, or D when you get questions!`;
            } else if (user.role === 'teacher') {
                welcomeMessage += `You can now send quizzes to your students through the web dashboard.`;
            } else {
                welcomeMessage += `You have administrative access to the system.`;
            }

            await this.bot.sendMessage(chatId, welcomeMessage);

        } catch (error) {
            console.error('Error in handleRegistration:', error.message);
            await this.bot.sendMessage(chatId, 'Registration failed. Please try again later.');
        }
    }

    async handleHelp(msg) {
        const chatId = msg.chat.id;
        const telegramId = msg.from.id;

        try {
            const user = await this.getUserByTelegramId(telegramId);
            
            let helpMessage = `📚 Quiz Whiz Help\n\n`;

            if (!user) {
                helpMessage += `You're not registered yet!\n\n` +
                    `Commands:\n` +
                    `/start - Start the bot\n` +
                    `/register PHONE - Register with your phone number\n` +
                    `/help - Show this help message`;
            } else if (user.role === 'student') {
                helpMessage += `Student Commands:\n\n` +
                    `/start - Restart the bot\n` +
                    `/help - Show this help\n\n` +
                    `When you receive a quiz:\n` +
                    `• Read the question carefully\n` +
                    `• Reply with A, B, C, or D\n` +
                    `• Get instant feedback!\n\n` +
                    `📊 View detailed performance on the website.`;
            } else {
                helpMessage += `${user.role.charAt(0).toUpperCase() + user.role.slice(1)} Commands:\n\n` +
                    `/start - Restart the bot\n` +
                    `/help - Show this help\n\n` +
                    `Use the web dashboard to:\n` +
                    `• Create and send quizzes\n` +
                    `• View student performance\n` +
                    `• Manage content`;
            }

            await this.bot.sendMessage(chatId, helpMessage);

        } catch (error) {
            console.error('Error in handleHelp:', error.message);
            await this.bot.sendMessage(chatId, 'Help unavailable. Please try again later.');
        }
    }

    async handleQuizAnswer(msg) {
        const chatId = msg.chat.id;
        const telegramId = msg.from.id;
        const answer = msg.text.toUpperCase();

        try {
            // Check if user has an active quiz session
            const session = await this.getActiveSession(telegramId);
            
            if (!session) {
                await this.bot.sendMessage(chatId, 
                    `❌ You don't have an active quiz session.\n\n` +
                    `Wait for your teacher to send you a new quiz!`
                );
                return;
            }

            // Process the answer
            await this.processQuizAnswer(session, answer, chatId);

        } catch (error) {
            console.error('Error in handleQuizAnswer:', error.message);
            await this.bot.sendMessage(chatId, 'Error processing your answer. Please try again.');
        }
    }

    async handleCallbackQuery(callbackQuery) {
        const chatId = callbackQuery.message.chat.id;
        const data = callbackQuery.data;
        const telegramId = callbackQuery.from.id;

        try {
            await this.bot.answerCallbackQuery(callbackQuery.id);

            if (data.startsWith('answer_')) {
                const answer = data.split('_')[1];
                const session = await this.getActiveSession(telegramId);
                
                if (session) {
                    await this.processQuizAnswer(session, answer, chatId);
                }
            }

        } catch (error) {
            console.error('Error in handleCallbackQuery:', error.message);
        }
    }

    async handleGeneralMessage(msg) {
        const chatId = msg.chat.id;
        const telegramId = msg.from.id;

        try {
            const user = await this.getUserByTelegramId(telegramId);
            
            if (!user) {
                await this.bot.sendMessage(chatId, 
                    `Please register first using /register YOUR_PHONE_NUMBER`
                );
                return;
            }

            const session = await this.getActiveSession(telegramId);
            
            if (session) {
                await this.bot.sendMessage(chatId, 
                    `🔄 You have an active quiz! Please answer with A, B, C, or D.`
                );
            } else {
                await this.bot.sendMessage(chatId, 
                    `Hi ${user.name}! 👋\n\n` +
                    `No active quiz right now. Use /help for more information.`
                );
            }

        } catch (error) {
            console.error('Error in handleGeneralMessage:', error.message);
        }
    }

    async sendQuizToStudents(quizId, classId, subject) {
        try {
            console.log(`📤 Sending quiz ${quizId} to class ${classId}`);

            // Get all students in the target class with Telegram IDs
            const students = await db.query(
                `SELECT u.*, s.admission_no, c.class_name, c.division 
                 FROM users u 
                 JOIN students s ON u.id = s.user_id 
                 JOIN classes c ON s.class_id = c.id 
                 WHERE c.id = ? AND u.telegram_id IS NOT NULL AND u.is_active = 1`,
                [classId]
            );

            if (students.length === 0) {
                console.warn('No students with Telegram found for this class');
                return { success: false, message: 'No students with Telegram found' };
            }

            // Get quiz details
            const quiz = await this.getQuizDetails(quizId);
            if (!quiz) {
                throw new Error('Quiz not found');
            }

            // Update quiz status
            await db.query(
                'UPDATE quizzes SET status = ?, sent_at = NOW() WHERE id = ?',
                ['active', quizId]
            );

            let successCount = 0;
            let failureCount = 0;

            // Send quiz to each student
            for (const student of students) {
                try {
                    await this.startQuizForStudent(student, quiz);
                    successCount++;
                } catch (error) {
                    console.error(`Failed to send quiz to ${student.name}:`, error.message);
                    failureCount++;
                }
            }

            console.log(`✅ Quiz sent: ${successCount} successful, ${failureCount} failed`);
            
            return {
                success: true,
                totalStudents: students.length,
                successCount,
                failureCount
            };

        } catch (error) {
            console.error('Error sending quiz to students:', error.message);
            throw error;
        }
    }

    async startQuizForStudent(student, quiz) {
        try {
            const chatId = student.telegram_id;
            
            // Create quiz attempt record
            const attemptId = db.generateId('ATT');
            await db.query(
                `INSERT INTO quiz_attempts (id, student_id, quiz_id, total_questions, status) 
                 VALUES (?, ?, ?, ?, ?)`,
                [attemptId, student.id, quiz.id, quiz.total_questions, 'in_progress']
            );

            // Create bot session
            const sessionId = db.generateId('SES');
            await db.query(
                `INSERT INTO bot_sessions (id, user_id, platform, platform_user_id, session_type, 
                 current_quiz_id, current_question_index, session_data, expires_at) 
                 VALUES (?, ?, 'telegram', ?, 'quiz', ?, 0, ?, DATE_ADD(NOW(), INTERVAL 1 HOUR))`,
                [sessionId, student.id, chatId, quiz.id, JSON.stringify({ attemptId })]
            );

            // Send welcome message and first question
            const welcomeMessage = `🎓 New Quiz: ${quiz.title}\n\n` +
                `📚 Subject: ${quiz.subject_name}\n` +
                `❓ Questions: ${quiz.total_questions}\n` +
                `⏰ Time: ${quiz.time_limit_minutes} minutes\n\n` +
                `Good luck! 🍀\n\n` +
                `Reply with A, B, C, or D for each question.`;

            await this.bot.sendMessage(chatId, welcomeMessage);
            
            // Send first question
            await this.sendNextQuestion(sessionId, chatId);

        } catch (error) {
            console.error(`Error starting quiz for student ${student.name}:`, error.message);
            throw error;
        }
    }

    async processQuizAnswer(session, answer, chatId) {
        try {
            const sessionData = JSON.parse(session.session_data);
            const attemptId = sessionData.attemptId;
            
            // Get current question
            const questions = await db.query(
                'SELECT * FROM quiz_questions WHERE quiz_id = ? ORDER BY question_number',
                [session.current_quiz_id]
            );

            const currentQuestion = questions[session.current_question_index];
            const isCorrect = currentQuestion.correct_answer === answer;

            // Save response
            await db.query(
                `INSERT INTO quiz_responses (id, attempt_id, question_id, student_answer, is_correct) 
                 VALUES (?, ?, ?, ?, ?)`,
                [db.generateId('RES'), attemptId, currentQuestion.id, answer, isCorrect]
            );

            // Send feedback
            let feedbackMessage = isCorrect ? 
                `✅ Correct! Well done! 🎉` : 
                `❌ Wrong. The correct answer was ${currentQuestion.correct_answer}.`;

            if (currentQuestion.explanation) {
                feedbackMessage += `\n\n💡 ${currentQuestion.explanation}`;
            }

            await this.bot.sendMessage(chatId, feedbackMessage);

            // Move to next question or finish quiz
            const nextQuestionIndex = session.current_question_index + 1;
            
            if (nextQuestionIndex >= questions.length) {
                // Quiz completed
                await this.completeQuiz(session, attemptId, chatId);
            } else {
                // Update session with next question
                await db.query(
                    'UPDATE bot_sessions SET current_question_index = ? WHERE id = ?',
                    [nextQuestionIndex, session.id]
                );
                
                // Short delay before next question
                setTimeout(() => {
                    this.sendNextQuestion(session.id, chatId);
                }, 2000);
            }

        } catch (error) {
            console.error('Error processing quiz answer:', error.message);
            throw error;
        }
    }

    async sendNextQuestion(sessionId, chatId) {
        try {
            const session = await db.query(
                'SELECT * FROM bot_sessions WHERE id = ?',
                [sessionId]
            );

            if (session.length === 0) return;

            const currentSession = session[0];
            
            const questions = await db.query(
                'SELECT * FROM quiz_questions WHERE quiz_id = ? ORDER BY question_number',
                [currentSession.current_quiz_id]
            );

            const question = questions[currentSession.current_question_index];
            const questionNumber = currentSession.current_question_index + 1;
            const totalQuestions = questions.length;

            const questionMessage = `📝 Question ${questionNumber}/${totalQuestions}\n\n` +
                `${question.question_text}\n\n` +
                `A) ${question.option_a}\n` +
                `B) ${question.option_b}\n` +
                `C) ${question.option_c}\n` +
                `D) ${question.option_d}\n\n` +
                `💬 Reply with A, B, C, or D`;

            // Option 1: Simple text message (students type A/B/C/D)
            await this.bot.sendMessage(chatId, questionMessage);

            // Option 2: Inline keyboard (students click buttons)
            const inlineKeyboard = {
                reply_markup: {
                    inline_keyboard: [
                        [
                            { text: 'A', callback_data: 'answer_A' },
                            { text: 'B', callback_data: 'answer_B' }
                        ],
                        [
                            { text: 'C', callback_data: 'answer_C' },
                            { text: 'D', callback_data: 'answer_D' }
                        ]
                    ]
                }
            };

            await this.bot.sendMessage(chatId, '🔘 Or click your answer:', inlineKeyboard);

        } catch (error) {
            console.error('Error sending next question:', error.message);
        }
    }

    async completeQuiz(session, attemptId, chatId) {
        try {
            // Calculate final score
            const responses = await db.query(
                'SELECT COUNT(*) as total, SUM(is_correct) as correct FROM quiz_responses WHERE attempt_id = ?',
                [attemptId]
            );

            const totalQuestions = responses[0].total;
            const correctAnswers = responses[0].correct || 0;
            const score = Math.round((correctAnswers / totalQuestions) * 100);

            // Update quiz attempt
            await db.query(
                `UPDATE quiz_attempts SET completed_at = NOW(), score = ?, 
                 correct_answers = ?, status = 'completed' WHERE id = ?`,
                [score, correctAnswers, attemptId]
            );

            // Update bot session
            await db.query(
                'UPDATE bot_sessions SET status = "completed" WHERE id = ?',
                [session.id]
            );

            // Update performance analytics
            await this.updatePerformanceAnalytics(session.user_id, session.current_quiz_id, score);

            // Send completion message
            let resultMessage = `🏁 Quiz Completed!\n\n` +
                `📊 Your Score: ${score}% (${correctAnswers}/${totalQuestions})\n\n`;

            if (score >= 80) {
                resultMessage += `🌟 Excellent work! You're doing great! 🎉`;
            } else if (score >= 60) {
                resultMessage += `👍 Good job! Keep practicing to improve! 💪`;
            } else {
                resultMessage += `📚 Don't worry! Review the material and try again next time! 🔄`;
            }

            resultMessage += `\n\n📈 View detailed performance analysis on the Quiz Whiz website.`;

            await this.bot.sendMessage(chatId, resultMessage);

        } catch (error) {
            console.error('Error completing quiz:', error.message);
        }
    }

    // Helper methods
    async getUserByTelegramId(telegramId) {
        const result = await db.query(
            'SELECT * FROM users WHERE telegram_id = ?',
            [telegramId]
        );
        return result[0] || null;
    }

    async getStudentInfo(userId) {
        const result = await db.query(
            `SELECT s.*, c.class_name, c.division 
             FROM students s 
             JOIN classes c ON s.class_id = c.id 
             WHERE s.user_id = ?`,
            [userId]
        );
        return result[0] || null;
    }

    async getActiveSession(telegramId) {
        const result = await db.query(
            `SELECT * FROM bot_sessions 
             WHERE platform_user_id = ? AND platform = 'telegram' 
             AND status = 'active' AND expires_at > NOW()`,
            [telegramId.toString()]
        );
        return result[0] || null;
    }

    async getQuizDetails(quizId) {
        const result = await db.query(
            `SELECT q.*, s.name as subject_name 
             FROM quizzes q 
             JOIN subjects s ON q.subject_id = s.id 
             WHERE q.id = ?`,
            [quizId]
        );
        return result[0] || null;
    }

    async updatePerformanceAnalytics(studentId, quizId, score) {
        try {
            const quiz = await db.query(
                'SELECT subject_id, target_class_id FROM quizzes WHERE id = ?',
                [quizId]
            );

            if (quiz.length === 0) return;

            const { subject_id, target_class_id } = quiz[0];
            const academicYear = new Date().getFullYear().toString();

            // Update or insert performance analytics
            await db.query(
                `INSERT INTO performance_analytics 
                 (id, student_id, subject_id, class_id, academic_year, total_quizzes_taken, 
                  total_score, average_score, best_score, worst_score, last_quiz_date) 
                 VALUES (?, ?, ?, ?, ?, 1, ?, ?, ?, ?, NOW()) 
                 ON DUPLICATE KEY UPDATE 
                 total_quizzes_taken = total_quizzes_taken + 1,
                 total_score = total_score + ?,
                 average_score = total_score / total_quizzes_taken,
                 best_score = GREATEST(best_score, ?),
                 worst_score = LEAST(worst_score, ?),
                 last_quiz_date = NOW()`,
                [
                    db.generateId('PA'), studentId, subject_id, target_class_id, 
                    academicYear, score, score, score, score, score, score, score
                ]
            );

        } catch (error) {
            console.error('Error updating performance analytics:', error.message);
        }
    }

    // Administrative methods
    async start() {
        if (this.bot && !this.isRunning) {
            this.isRunning = true;
            console.log('🤖 Telegram Bot started and listening for messages');
        }
    }

    async stop() {
        if (this.bot && this.isRunning) {
            await this.bot.stopPolling();
            this.isRunning = false;
            console.log('🛑 Telegram Bot stopped');
        }
    }

    async sendMessage(chatId, message, options = {}) {
        if (this.bot) {
            return await this.bot.sendMessage(chatId, message, options);
        }
        throw new Error('Bot not initialized');
    }
}

module.exports = new QuizWhizBot();
