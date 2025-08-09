// Quiz Whiz Installation and Setup Tool
const fs = require('fs').promises;
const path = require('path');
const readline = require('readline');
const db = require('../database/connection');

class QuizWhizInstaller {
    constructor() {
        this.rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
        this.config = {};
    }

    async install() {
        console.log('\n🎓 Welcome to Quiz Whiz Installation');
        console.log('=====================================\n');

        try {
            // Step 1: Environment Setup
            await this.setupEnvironment();
            
            // Step 2: Database Setup
            await this.setupDatabase();
            
            // Step 3: Configuration
            await this.setupConfiguration();
            
            // Step 4: Sample Data
            await this.setupSampleData();
            
            // Step 5: Bot Configuration
            await this.setupBotConfiguration();
            
            // Step 6: Verification
            await this.verifyInstallation();
            
            console.log('\n🎉 Installation completed successfully!');
            console.log('\nNext steps:');
            console.log('1. Start the application: npm start');
            console.log('2. Access the web interface at: http://localhost:3000');
            console.log('3. Configure your Telegram bot token in settings');
            console.log('4. Add your Gemini API key for AI features');
            console.log('\n📚 Check the README.md for detailed usage instructions.');

        } catch (error) {
            console.error('\n❌ Installation failed:', error.message);
            console.log('\nPlease check the error and try again.');
        } finally {
            this.rl.close();
        }
    }

    async setupEnvironment() {
        console.log('📁 Setting up environment...\n');

        // Create necessary directories
        const directories = [
            'uploads',
            'uploads/pdfs',
            'uploads/temp',
            'logs',
            'backups'
        ];

        for (const dir of directories) {
            try {
                await fs.mkdir(dir, { recursive: true });
                console.log(`✅ Created directory: ${dir}`);
            } catch (error) {
                if (error.code !== 'EEXIST') {
                    throw error;
                }
                console.log(`✓ Directory exists: ${dir}`);
            }
        }

        // Create .env file if it doesn't exist
        try {
            await fs.access('.env');
            console.log('✓ .env file exists');
        } catch {
            await this.createEnvFile();
            console.log('✅ Created .env file');
        }

        console.log('\n');
    }

    async createEnvFile() {
        const envContent = `# Quiz Whiz Environment Configuration
# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=quiz_whiz

# Application Configuration
PORT=3000
NODE_ENV=development

# Security
JWT_SECRET=your_jwt_secret_key_here
SESSION_SECRET=your_session_secret_here

# AI and Bot Configuration
GEMINI_API_KEY=
TELEGRAM_BOT_TOKEN=

# File Upload Configuration
MAX_FILE_SIZE=50MB
UPLOAD_PATH=./uploads

# Email Configuration (Optional)
EMAIL_HOST=
EMAIL_PORT=587
EMAIL_USER=
EMAIL_PASS=

# Logging
LOG_LEVEL=info
LOG_FILE=./logs/app.log
`;

        await fs.writeFile('.env', envContent);
    }

    async setupDatabase() {
        console.log('🗄️  Setting up database...\n');

        // Get database configuration
        this.config.dbHost = await this.prompt('Database Host (localhost): ') || 'localhost';
        this.config.dbPort = await this.prompt('Database Port (3306): ') || '3306';
        this.config.dbUser = await this.prompt('Database User (root): ') || 'root';
        this.config.dbPassword = await this.prompt('Database Password: ', true);
        this.config.dbName = await this.prompt('Database Name (quiz_whiz): ') || 'quiz_whiz';

        // Update environment variables
        process.env.DB_HOST = this.config.dbHost;
        process.env.DB_PORT = this.config.dbPort;
        process.env.DB_USER = this.config.dbUser;
        process.env.DB_PASSWORD = this.config.dbPassword;
        process.env.DB_NAME = this.config.dbName;

        // Test database connection
        try {
            await db.connect();
            console.log('✅ Database connection successful');

            // Check if database exists
            const dbExists = await this.checkDatabaseExists();
            if (!dbExists) {
                await this.createDatabase();
            }

            // Create tables
            await this.createTables();
            console.log('✅ Database tables created successfully');

        } catch (error) {
            throw new Error(`Database setup failed: ${error.message}`);
        }

        console.log('\n');
    }

    async checkDatabaseExists() {
        try {
            await db.query(`USE ${this.config.dbName}`);
            return true;
        } catch {
            return false;
        }
    }

    async createDatabase() {
        console.log(`📦 Creating database: ${this.config.dbName}`);
        await db.query(`CREATE DATABASE IF NOT EXISTS ${this.config.dbName}`);
        await db.query(`USE ${this.config.dbName}`);
    }

    async createTables() {
        console.log('🏗️  Creating database tables...');
        
        // Read and execute schema file
        const schemaPath = path.join(__dirname, '../../database/schema.sql');
        const schema = await fs.readFile(schemaPath, 'utf8');
        
        // Split schema into individual statements
        const statements = schema.split(';').filter(stmt => stmt.trim());
        
        for (const statement of statements) {
            if (statement.trim()) {
                try {
                    await db.query(statement);
                } catch (error) {
                    if (!error.message.includes('already exists')) {
                        console.warn(`Warning: ${error.message}`);
                    }
                }
            }
        }
    }

    async setupConfiguration() {
        console.log('⚙️  Setting up configuration...\n');

        // School information
        const schoolName = await this.prompt('School Name: ');
        const schoolAddress = await this.prompt('School Address: ');
        const schoolPhone = await this.prompt('School Phone: ');
        const schoolEmail = await this.prompt('School Email: ');

        // Create default school
        const schoolId = db.generateId('SCH');
        await db.query(
            'INSERT INTO schools (id, name, address, contact_phone, contact_email) VALUES (?, ?, ?, ?, ?)',
            [schoolId, schoolName, schoolAddress, schoolPhone, schoolEmail]
        );
        console.log('✅ School information saved');

        // Create default admin user
        const adminName = await this.prompt('Admin Name: ');
        const adminPhone = await this.prompt('Admin Phone: ');
        const adminEmail = await this.prompt('Admin Email: ');
        const adminPassword = await this.prompt('Admin Password: ', true);

        const adminId = db.generateId('USR');
        const hashedPassword = require('crypto').createHash('sha256').update(adminPassword).digest('hex');

        await db.query(
            'INSERT INTO users (id, phone, name, email, role, school_id, password_hash) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [adminId, adminPhone, adminName, adminEmail, 'admin', schoolId, hashedPassword]
        );
        console.log('✅ Admin user created');

        // Store configuration
        this.config.schoolId = schoolId;
        this.config.adminId = adminId;

        console.log('\n');
    }

    async setupSampleData() {
        console.log('📚 Setting up sample data...\n');

        const createSample = await this.prompt('Create sample classes and data? (y/n): ');
        if (createSample.toLowerCase() !== 'y') {
            console.log('Skipping sample data creation\n');
            return;
        }

        // Create sample classes
        const sampleClasses = [
            { name: '1', division: 'A' },
            { name: '1', division: 'B' },
            { name: '2', division: 'A' },
            { name: '3', division: 'A' },
            { name: '4', division: 'A' },
            { name: '5', division: 'A' },
        ];

        const academicYear = new Date().getFullYear().toString();

        for (const cls of sampleClasses) {
            const classId = db.generateId('CLS');
            await db.query(
                'INSERT INTO classes (id, school_id, class_name, division, academic_year) VALUES (?, ?, ?, ?, ?)',
                [classId, this.config.schoolId, cls.name, cls.division, academicYear]
            );
        }
        console.log('✅ Sample classes created');

        // Create sample teacher
        const teacherId = db.generateId('USR');
        await db.query(
            'INSERT INTO users (id, phone, name, email, role, school_id, password_hash) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [teacherId, '+1234567890', 'Sample Teacher', 'teacher@example.com', 'teacher', this.config.schoolId, 
             require('crypto').createHash('sha256').update('teacher123').digest('hex')]
        );

        await db.query(
            'INSERT INTO teachers (user_id, employee_id, subjects, qualification) VALUES (?, ?, ?, ?)',
            [teacherId, 'T001', JSON.stringify(['Mathematics', 'Science']), 'M.Sc., B.Ed.']
        );
        console.log('✅ Sample teacher created');

        // Create sample students
        const classes = await db.query('SELECT id FROM classes WHERE school_id = ?', [this.config.schoolId]);
        const classId = classes[0].id;

        const sampleStudents = [
            { name: 'Alice Johnson', phone: '+1111111111', admission: 'S001' },
            { name: 'Bob Smith', phone: '+2222222222', admission: 'S002' },
            { name: 'Charlie Brown', phone: '+3333333333', admission: 'S003' },
        ];

        for (const student of sampleStudents) {
            const studentId = db.generateId('USR');
            await db.query(
                'INSERT INTO users (id, phone, name, role, school_id, password_hash) VALUES (?, ?, ?, ?, ?, ?)',
                [studentId, student.phone, student.name, 'student', this.config.schoolId,
                 require('crypto').createHash('sha256').update('student123').digest('hex')]
            );

            await db.query(
                'INSERT INTO students (user_id, admission_no, class_id, roll_number) VALUES (?, ?, ?, ?)',
                [studentId, student.admission, classId, student.admission.substr(-1)]
            );
        }
        console.log('✅ Sample students created');

        console.log('\n');
    }

    async setupBotConfiguration() {
        console.log('🤖 Setting up bot configuration...\n');

        const setupBot = await this.prompt('Configure Telegram bot now? (y/n): ');
        if (setupBot.toLowerCase() !== 'y') {
            console.log('You can configure the bot later in system settings\n');
            return;
        }

        const botToken = await this.prompt('Telegram Bot Token: ');
        if (botToken) {
            await db.query(
                'UPDATE system_settings SET setting_value = ? WHERE setting_key = ?',
                [botToken, 'telegram_bot_token']
            );
            console.log('✅ Telegram bot token saved');
        }

        const geminiKey = await this.prompt('Gemini API Key (optional): ');
        if (geminiKey) {
            await db.query(
                'UPDATE system_settings SET setting_value = ? WHERE setting_key = ?',
                [geminiKey, 'gemini_api_key']
            );
            console.log('✅ Gemini API key saved');
        }

        console.log('\n');
    }

    async verifyInstallation() {
        console.log('🔍 Verifying installation...\n');

        // Check database tables
        const tables = await db.query('SHOW TABLES');
        const expectedTables = [
            'schools', 'classes', 'users', 'students', 'teachers', 'subjects',
            'textbooks', 'quizzes', 'quiz_questions', 'quiz_attempts', 'system_settings'
        ];

        const existingTables = tables.map(t => Object.values(t)[0]);
        const missingTables = expectedTables.filter(t => !existingTables.includes(t));

        if (missingTables.length > 0) {
            throw new Error(`Missing tables: ${missingTables.join(', ')}`);
        }
        console.log('✅ All database tables present');

        // Check required directories
        const requiredDirs = ['uploads', 'uploads/pdfs', 'logs'];
        for (const dir of requiredDirs) {
            try {
                await fs.access(dir);
                console.log(`✅ Directory verified: ${dir}`);
            } catch {
                throw new Error(`Missing directory: ${dir}`);
            }
        }

        // Check configuration
        const schoolCount = await db.query('SELECT COUNT(*) as count FROM schools');
        if (schoolCount[0].count === 0) {
            throw new Error('No schools configured');
        }
        console.log('✅ School configuration verified');

        const adminCount = await db.query('SELECT COUNT(*) as count FROM users WHERE role = "admin"');
        if (adminCount[0].count === 0) {
            throw new Error('No admin users configured');
        }
        console.log('✅ Admin user verified');

        console.log('\n');
    }

    async prompt(question, hidden = false) {
        return new Promise((resolve) => {
            if (hidden) {
                // Hide input for passwords
                process.stdout.write(question);
                process.stdin.setRawMode(true);
                process.stdin.resume();
                process.stdin.setEncoding('utf8');
                
                let input = '';
                process.stdin.on('data', function(char) {
                    char = char + '';
                    switch (char) {
                        case '\n':
                        case '\r':
                        case '\u0004':
                            process.stdin.setRawMode(false);
                            process.stdin.pause();
                            process.stdout.write('\n');
                            resolve(input);
                            break;
                        case '\u0003':
                            process.exit();
                            break;
                        default:
                            input += char;
                            process.stdout.write('*');
                            break;
                    }
                });
            } else {
                this.rl.question(question, resolve);
            }
        });
    }

    // Additional utility methods
    async updateEnvironmentFile() {
        const envPath = '.env';
        let envContent = await fs.readFile(envPath, 'utf8');

        // Update database configuration
        envContent = envContent.replace(/DB_HOST=.*/, `DB_HOST=${this.config.dbHost}`);
        envContent = envContent.replace(/DB_PORT=.*/, `DB_PORT=${this.config.dbPort}`);
        envContent = envContent.replace(/DB_USER=.*/, `DB_USER=${this.config.dbUser}`);
        envContent = envContent.replace(/DB_PASSWORD=.*/, `DB_PASSWORD=${this.config.dbPassword}`);
        envContent = envContent.replace(/DB_NAME=.*/, `DB_NAME=${this.config.dbName}`);

        await fs.writeFile(envPath, envContent);
        console.log('✅ Environment file updated');
    }

    async createBackup() {
        console.log('💾 Creating initial backup...');
        
        const backupDir = 'backups';
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const backupFile = path.join(backupDir, `initial-setup-${timestamp}.sql`);

        // This would create a database backup
        // Implementation depends on your database system
        console.log(`📦 Backup would be saved to: ${backupFile}`);
    }

    async generateQuickStartGuide() {
        const guide = `
# Quiz Whiz Quick Start Guide

## 🎯 Getting Started

### 1. Access the Application
- Web Interface: http://localhost:3000
- Admin Login: Use the credentials you created during setup

### 2. Setup Telegram Bot
1. Get a bot token from @BotFather on Telegram
2. Add the token in Admin Dashboard > System Settings
3. Test the bot by sending /start to your bot

### 3. Configure AI Features  
1. Get a Gemini API key from Google AI Studio
2. Add the key in Admin Dashboard > System Settings
3. Upload PDF textbooks for AI quiz generation

### 4. Add Users
- Students: Admin Dashboard > User Management
- Teachers: Admin Dashboard > User Management
- Bulk import via CSV is supported

### 5. Create Classes
- Admin Dashboard > Class Management
- Assign teachers to classes and subjects

### 6. Generate Your First Quiz
1. Login as a teacher
2. Go to Teacher Dashboard > Quiz Generation
3. Select a PDF and content
4. Generate quiz with AI
5. Send to students via Telegram

## 📚 Default Credentials
- Admin: Phone number and password you set during installation
- Sample Teacher: +1234567890 / teacher123
- Sample Students: +1111111111 / student123

## 🆘 Need Help?
- Check the logs folder for error messages
- Ensure database and bot tokens are configured
- Verify students have registered with the Telegram bot

Enjoy using Quiz Whiz! 🎓
`;

        await fs.writeFile('QUICK_START.md', guide);
        console.log('✅ Quick start guide created: QUICK_START.md');
    }
}

// Run installer if called directly
if (require.main === module) {
    const installer = new QuizWhizInstaller();
    installer.install().catch(console.error);
}

module.exports = QuizWhizInstaller;