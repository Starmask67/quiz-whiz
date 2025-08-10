-- Quiz Whiz Database Setup for Telegram Bot Integration
-- Run this script in your MySQL database

USE quiz_whiz;

-- Add telegram_id column to users table if it doesn't exist
ALTER TABLE users ADD COLUMN IF NOT EXISTS telegram_id VARCHAR(50) UNIQUE;

-- Create quiz_sessions table if it doesn't exist
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
);

-- Create bot_activity_log table for monitoring
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
);

-- Insert default bot settings if they don't exist
INSERT IGNORE INTO system_settings (setting_key, setting_value, setting_type, description) VALUES
('telegram_bot_token', '8050855701:AAH17w76HvcEIsasW27d9zsnASYzz4zGRzw', 'string', 'Telegram bot token for integration'),
('bot_auto_start', 'true', 'boolean', 'Automatically start bot when system starts'),
('bot_welcome_message', 'Welcome to Quiz Whiz! 🎓📚\n\nTo get started, register with your phone number using: /register YOUR_PHONE_NUMBER', 'text', 'Custom welcome message for new users'),
('bot_help_message', '📚 Quiz Whiz Bot Commands:\n\n/start - Start the bot\n/register PHONE - Register with phone number\n/help - Show this help message', 'text', 'Custom help message');

-- Create view for bot user statistics
CREATE OR REPLACE VIEW bot_user_stats AS
SELECT 
    COUNT(DISTINCT u.id) as total_users,
    COUNT(DISTINCT u.telegram_id) as registered_telegram_users,
    COUNT(DISTINCT CASE WHEN u.telegram_id IS NOT NULL THEN u.id END) as active_telegram_users,
    COUNT(DISTINCT qs.id) as total_quiz_sessions,
    COUNT(DISTINCT CASE WHEN qs.status = 'active' THEN qs.id END) as active_quiz_sessions,
    COUNT(DISTINCT CASE WHEN qs.status = 'completed' THEN qs.id END) as completed_quiz_sessions
FROM users u
LEFT JOIN quiz_sessions qs ON u.id = qs.student_id
WHERE u.role = 'student';

-- Grant necessary permissions (adjust as needed)
-- GRANT SELECT, INSERT, UPDATE, DELETE ON quiz_whiz.* TO 'your_user'@'localhost';

-- Show the created structure
DESCRIBE users;
DESCRIBE quiz_sessions;
DESCRIBE bot_activity_log;
DESCRIBE system_settings;

-- Show bot settings
SELECT setting_key, setting_value, description FROM system_settings WHERE setting_key LIKE 'bot_%';

-- Show user statistics
SELECT * FROM bot_user_stats;