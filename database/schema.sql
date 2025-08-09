-- Quiz Whiz Database Schema
-- Complete database structure for the educational quiz platform

-- Schools table
CREATE TABLE schools (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    address TEXT,
    contact_phone VARCHAR(20),
    contact_email VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Classes table
CREATE TABLE classes (
    id VARCHAR(50) PRIMARY KEY,
    school_id VARCHAR(50) NOT NULL,
    class_name VARCHAR(50) NOT NULL, -- LKG, UKG, 1, 2, 3, etc.
    division VARCHAR(10) NOT NULL, -- A, B, C, D
    academic_year VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE CASCADE,
    UNIQUE KEY unique_class (school_id, class_name, division, academic_year)
);

-- Users table (Students, Teachers, Admins)
CREATE TABLE users (
    id VARCHAR(50) PRIMARY KEY,
    phone VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    role ENUM('student', 'teacher', 'admin') NOT NULL,
    school_id VARCHAR(50) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    telegram_id BIGINT UNIQUE, -- For Telegram bot integration
    whatsapp_id VARCHAR(50), -- For future WhatsApp integration
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE CASCADE
);

-- Students specific information
CREATE TABLE students (
    user_id VARCHAR(50) PRIMARY KEY,
    admission_no VARCHAR(50) UNIQUE NOT NULL,
    class_id VARCHAR(50) NOT NULL,
    roll_number VARCHAR(20),
    parent_phone VARCHAR(20),
    parent_email VARCHAR(255),
    date_of_birth DATE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE
);

-- Teachers specific information
CREATE TABLE teachers (
    user_id VARCHAR(50) PRIMARY KEY,
    employee_id VARCHAR(50) UNIQUE NOT NULL,
    subjects TEXT, -- JSON array of subjects they teach
    qualification VARCHAR(255),
    experience_years INT,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Teacher-Class assignments (which classes a teacher can access)
CREATE TABLE teacher_classes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    teacher_id VARCHAR(50) NOT NULL,
    class_id VARCHAR(50) NOT NULL,
    subject VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (teacher_id) REFERENCES teachers(user_id) ON DELETE CASCADE,
    FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
    UNIQUE KEY unique_assignment (teacher_id, class_id, subject)
);

-- Subjects table
CREATE TABLE subjects (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    class_level VARCHAR(20) NOT NULL, -- LKG, UKG, 1-12
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- PDF textbooks uploaded by admin
CREATE TABLE textbooks (
    id VARCHAR(50) PRIMARY KEY,
    filename VARCHAR(255) NOT NULL,
    original_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size BIGINT NOT NULL,
    mime_type VARCHAR(100),
    class_level VARCHAR(20) NOT NULL,
    subject_id VARCHAR(50) NOT NULL,
    uploaded_by VARCHAR(50) NOT NULL, -- admin user_id
    extraction_status ENUM('pending', 'processing', 'completed', 'failed') DEFAULT 'pending',
    extracted_text LONGTEXT, -- Full extracted text from PDF
    page_count INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (subject_id) REFERENCES subjects(id),
    FOREIGN KEY (uploaded_by) REFERENCES users(id)
);

-- PDF content chunks for AI processing
CREATE TABLE textbook_chunks (
    id VARCHAR(50) PRIMARY KEY,
    textbook_id VARCHAR(50) NOT NULL,
    chunk_index INT NOT NULL,
    page_number INT,
    content TEXT NOT NULL,
    word_count INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (textbook_id) REFERENCES textbooks(id) ON DELETE CASCADE,
    INDEX idx_textbook_chunk (textbook_id, chunk_index)
);

-- Generated quizzes
CREATE TABLE quizzes (
    id VARCHAR(50) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    textbook_id VARCHAR(50) NOT NULL,
    chunk_id VARCHAR(50) NOT NULL, -- Which content chunk was used
    created_by VARCHAR(50) NOT NULL, -- teacher user_id
    target_class_id VARCHAR(50) NOT NULL,
    subject_id VARCHAR(50) NOT NULL,
    total_questions INT DEFAULT 10,
    time_limit_minutes INT DEFAULT 30,
    status ENUM('draft', 'active', 'completed', 'archived') DEFAULT 'draft',
    sent_at TIMESTAMP NULL,
    expires_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (textbook_id) REFERENCES textbooks(id),
    FOREIGN KEY (chunk_id) REFERENCES textbook_chunks(id),
    FOREIGN KEY (created_by) REFERENCES teachers(user_id),
    FOREIGN KEY (target_class_id) REFERENCES classes(id),
    FOREIGN KEY (subject_id) REFERENCES subjects(id)
);

-- Quiz questions
CREATE TABLE quiz_questions (
    id VARCHAR(50) PRIMARY KEY,
    quiz_id VARCHAR(50) NOT NULL,
    question_number INT NOT NULL,
    question_text TEXT NOT NULL,
    option_a VARCHAR(500) NOT NULL,
    option_b VARCHAR(500) NOT NULL,
    option_c VARCHAR(500) NOT NULL,
    option_d VARCHAR(500) NOT NULL,
    correct_answer ENUM('A', 'B', 'C', 'D') NOT NULL,
    explanation TEXT,
    difficulty_level ENUM('easy', 'medium', 'hard') DEFAULT 'medium',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE,
    UNIQUE KEY unique_question (quiz_id, question_number)
);

-- Student quiz attempts
CREATE TABLE quiz_attempts (
    id VARCHAR(50) PRIMARY KEY,
    student_id VARCHAR(50) NOT NULL,
    quiz_id VARCHAR(50) NOT NULL,
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP NULL,
    score INT DEFAULT 0,
    total_questions INT NOT NULL,
    correct_answers INT DEFAULT 0,
    time_taken_seconds INT,
    status ENUM('in_progress', 'completed', 'abandoned', 'expired') DEFAULT 'in_progress',
    bot_session_id VARCHAR(100), -- For tracking bot conversation
    FOREIGN KEY (student_id) REFERENCES students(user_id),
    FOREIGN KEY (quiz_id) REFERENCES quizzes(id),
    INDEX idx_student_quiz (student_id, quiz_id),
    INDEX idx_quiz_attempts (quiz_id, completed_at)
);

-- Individual question responses
CREATE TABLE quiz_responses (
    id VARCHAR(50) PRIMARY KEY,
    attempt_id VARCHAR(50) NOT NULL,
    question_id VARCHAR(50) NOT NULL,
    student_answer ENUM('A', 'B', 'C', 'D') NOT NULL,
    is_correct BOOLEAN NOT NULL,
    response_time_seconds INT,
    answered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (attempt_id) REFERENCES quiz_attempts(id) ON DELETE CASCADE,
    FOREIGN KEY (question_id) REFERENCES quiz_questions(id),
    UNIQUE KEY unique_response (attempt_id, question_id)
);

-- Bot sessions for tracking ongoing conversations
CREATE TABLE bot_sessions (
    id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL,
    platform ENUM('telegram', 'whatsapp') NOT NULL,
    platform_user_id VARCHAR(100) NOT NULL, -- telegram_id or whatsapp_id
    session_type ENUM('quiz', 'support', 'registration') NOT NULL,
    current_quiz_id VARCHAR(50),
    current_question_index INT DEFAULT 0,
    session_data JSON, -- Store additional session information
    status ENUM('active', 'completed', 'expired') DEFAULT 'active',
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    expires_at TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (current_quiz_id) REFERENCES quizzes(id),
    INDEX idx_platform_user (platform, platform_user_id),
    INDEX idx_session_status (status, last_activity)
);

-- Performance analytics aggregated data
CREATE TABLE performance_analytics (
    id VARCHAR(50) PRIMARY KEY,
    student_id VARCHAR(50) NOT NULL,
    subject_id VARCHAR(50) NOT NULL,
    class_id VARCHAR(50) NOT NULL,
    academic_year VARCHAR(20) NOT NULL,
    total_quizzes_taken INT DEFAULT 0,
    total_score INT DEFAULT 0,
    average_score DECIMAL(5,2) DEFAULT 0.00,
    best_score INT DEFAULT 0,
    worst_score INT DEFAULT 100,
    total_time_spent_minutes INT DEFAULT 0,
    rank_in_class INT,
    rank_in_subject INT,
    last_quiz_date TIMESTAMP NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(user_id),
    FOREIGN KEY (subject_id) REFERENCES subjects(id),
    FOREIGN KEY (class_id) REFERENCES classes(id),
    UNIQUE KEY unique_analytics (student_id, subject_id, class_id, academic_year)
);

-- System configurations and settings
CREATE TABLE system_settings (
    id VARCHAR(50) PRIMARY KEY,
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value TEXT NOT NULL,
    data_type ENUM('string', 'number', 'boolean', 'json') DEFAULT 'string',
    description TEXT,
    is_editable BOOLEAN DEFAULT TRUE,
    updated_by VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (updated_by) REFERENCES users(id)
);

-- Audit log for important actions
CREATE TABLE audit_logs (
    id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50),
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(50) NOT NULL, -- quiz, user, textbook, etc.
    resource_id VARCHAR(50),
    old_values JSON,
    new_values JSON,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Insert default subjects
INSERT INTO subjects (id, name, class_level) VALUES
('SUB001', 'Mathematics', 'LKG'),
('SUB002', 'English', 'LKG'),
('SUB003', 'Science', 'UKG'),
('SUB004', 'Mathematics', 'UKG'),
('SUB005', 'English', 'UKG'),
('SUB006', 'Mathematics', '1'),
('SUB007', 'English', '1'),
('SUB008', 'Science', '1'),
('SUB009', 'Social Studies', '1'),
('SUB010', 'Mathematics', '2'),
('SUB011', 'English', '2'),
('SUB012', 'Science', '2'),
('SUB013', 'Social Studies', '2'),
('SUB014', 'Mathematics', '3'),
('SUB015', 'English', '3'),
('SUB016', 'Science', '3'),
('SUB017', 'Social Studies', '3'),
('SUB018', 'Mathematics', '4'),
('SUB019', 'English', '4'),
('SUB020', 'Science', '4'),
('SUB021', 'Social Studies', '4'),
('SUB022', 'Mathematics', '5'),
('SUB023', 'English', '5'),
('SUB024', 'Science', '5'),
('SUB025', 'Social Studies', '5'),
('SUB026', 'Mathematics', '6'),
('SUB027', 'English', '6'),
('SUB028', 'Science', '6'),
('SUB029', 'Social Studies', '6'),
('SUB030', 'Mathematics', '7'),
('SUB031', 'English', '7'),
('SUB032', 'Science', '7'),
('SUB033', 'Social Studies', '7');

-- Insert default system settings
INSERT INTO system_settings (id, setting_key, setting_value, data_type, description) VALUES
('SET001', 'quiz_default_time_limit', '30', 'number', 'Default time limit for quizzes in minutes'),
('SET002', 'quiz_default_questions', '10', 'number', 'Default number of questions per quiz'),
('SET003', 'telegram_bot_token', '', 'string', 'Telegram bot token for integration'),
('SET004', 'gemini_api_key', '', 'string', 'Google Gemini API key for AI quiz generation'),
('SET005', 'pdf_max_file_size', '50', 'number', 'Maximum PDF file size in MB'),
('SET006', 'quiz_session_timeout', '60', 'number', 'Quiz session timeout in minutes'),
('SET007', 'enable_telegram_bot', 'true', 'boolean', 'Enable Telegram bot functionality'),
('SET008', 'enable_whatsapp_bot', 'false', 'boolean', 'Enable WhatsApp bot functionality'),
('SET009', 'notification_settings', '{"quiz_completion": true, "new_quiz": true}', 'json', 'Notification preferences');