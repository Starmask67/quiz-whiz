# Quiz Whiz Setup Guide

Welcome to Quiz Whiz! This guide will help you set up the complete AI-powered educational quiz platform with Telegram bot integration.

## 🎯 System Overview

Quiz Whiz is an innovative platform that:
- Allows teachers to generate AI-powered quizzes from PDF textbooks using Gemini 2.5 Flash
- Distributes quizzes to specific classes/students via Telegram bot
- Provides real-time quiz experience with instant feedback
- Tracks detailed performance analytics on the web dashboard

## 🔧 Prerequisites

### Required Software
- **Node.js**: Version 16.0.0 or higher
- **MySQL/MariaDB**: Version 8.0 or higher
- **npm**: Version 8.0.0 or higher

### Required Accounts & API Keys
- **Telegram Bot**: Get token from [@BotFather](https://t.me/BotFather)
- **Google Gemini API**: Get key from [Google AI Studio](https://makersuite.google.com/app/apikey)

## 🚀 Quick Installation

### Option 1: Automated Setup (Recommended)

```bash
# 1. Clone the repository
git clone https://github.com/your-username/quiz-whiz.git
cd quiz-whiz

# 2. Install dependencies
npm install

# 3. Run automated setup
npm run setup
```

The installer will guide you through:
- Database configuration
- Admin user creation
- Sample data setup
- Bot configuration
- Environment setup

### Option 2: Manual Setup

If you prefer manual setup, follow the detailed instructions below.

## 📋 Manual Setup Instructions

### Step 1: Environment Setup

1. **Create necessary directories:**
```bash
mkdir uploads uploads/pdfs uploads/temp logs backups
```

2. **Create `.env` file:**
```bash
cp .env.example .env
```

3. **Configure environment variables:**
```env
# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=quiz_whiz

# Application Configuration
PORT=3000
NODE_ENV=development

# Security (Generate secure keys)
JWT_SECRET=your_jwt_secret_key
SESSION_SECRET=your_session_secret

# AI and Bot Configuration
GEMINI_API_KEY=your_gemini_api_key
TELEGRAM_BOT_TOKEN=your_telegram_bot_token

# File Upload Configuration
MAX_FILE_SIZE=50MB
UPLOAD_PATH=./uploads
```

### Step 2: Database Setup

1. **Create MySQL database:**
```sql
CREATE DATABASE quiz_whiz;
USE quiz_whiz;
```

2. **Import database schema:**
```bash
mysql -u root -p quiz_whiz < database/schema.sql
```

3. **Verify tables were created:**
```sql
SHOW TABLES;
```

### Step 3: Install Dependencies

```bash
# Install all required packages
npm install

# Install additional tools package
npm install -g pm2  # For production deployment
```

### Step 4: Configure Services

#### Telegram Bot Setup

1. **Create a new bot:**
   - Open Telegram and search for [@BotFather](https://t.me/BotFather)
   - Send `/newbot` command
   - Follow instructions to create your bot
   - Save the bot token

2. **Configure bot token:**
   - Add token to `.env` file
   - Or add via web dashboard after first login

#### Gemini AI Setup

1. **Get API key:**
   - Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Create a new API key
   - Save the key securely

2. **Configure API key:**
   - Add to `.env` file
   - Or add via web dashboard

### Step 5: Create Initial Data

1. **Create school record:**
```sql
INSERT INTO schools (id, name, address, contact_phone, contact_email) 
VALUES ('SCH001', 'Your School Name', 'School Address', '+1234567890', 'admin@school.com');
```

2. **Create admin user:**
```sql
INSERT INTO users (id, phone, name, email, role, school_id, password_hash) 
VALUES ('USR001', '+1234567890', 'Admin Name', 'admin@school.com', 'admin', 'SCH001', SHA2('your_password', 256));
```

3. **Create sample classes:**
```sql
INSERT INTO classes (id, school_id, class_name, division, academic_year) VALUES
('CLS001', 'SCH001', '5', 'A', '2024'),
('CLS002', 'SCH001', '5', 'B', '2024'),
('CLS003', 'SCH001', '6', 'A', '2024');
```

## 🎮 Running the Application

### Development Mode
```bash
# Start with auto-reload
npm run dev

# Or start normally
npm start
```

### Production Mode
```bash
# Build and start with PM2
npm run deploy

# Or manually
npm run build
pm2 start ecosystem.config.js
```

### Available Scripts
```bash
npm run setup           # Run automated installation
npm run dev            # Start in development mode
npm run start          # Start application
npm run test           # Run tests
npm run lint           # Check code quality
npm run db:migrate     # Run database migrations
npm run db:backup      # Create database backup
npm run bot:start      # Start Telegram bot
npm run bot:stop       # Stop Telegram bot
npm run pdf:process    # Process uploaded PDFs
npm run users:import   # Import users from CSV
npm run clean          # Clean temporary files
```

## 🌐 Access Points

After successful setup, you can access:

- **Web Dashboard**: http://localhost:3000
- **API Health Check**: http://localhost:3000/health
- **API Documentation**: http://localhost:3000/api
- **Admin Panel**: http://localhost:3000/admin/dashboard

## 👥 User Management

### Creating Users

#### Via Web Dashboard
1. Login as admin
2. Go to Admin Dashboard > User Management
3. Add students, teachers individually or bulk import

#### Via API
```bash
# Register student
curl -X POST http://localhost:3000/api/tools/student/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Student Name",
    "phone": "+1234567890",
    "admissionNo": "S001",
    "classId": "CLS001",
    "schoolId": "SCH001",
    "password": "student123"
  }'
```

#### Bulk Import
1. Prepare CSV file with student data
2. Use import tool: `npm run users:import -- students.csv`

### Student Registration Process

1. **Admin adds student data** to the system
2. **Student receives credentials** (phone number + password)
3. **Student registers on Telegram** using `/register PHONE_NUMBER`
4. **Student receives quizzes** via Telegram
5. **Performance tracked** on web dashboard

## 🤖 Telegram Bot Usage

### For Students
1. **Start the bot**: Send `/start` to your bot
2. **Register**: Send `/register +1234567890` (your registered phone)
3. **Take quizzes**: Answer with A, B, C, or D when you receive questions
4. **Get results**: Instant scores after quiz completion

### For Teachers
1. **Register on Telegram**: Same process as students
2. **Create quizzes**: Use web dashboard to generate from PDFs
3. **Send to students**: Target specific classes/students
4. **Monitor progress**: View real-time completion status

### Bot Commands
- `/start` - Initialize the bot
- `/register PHONE` - Register with phone number
- `/help` - Show help information
- **A/B/C/D** - Answer quiz questions

## 📚 Quiz Generation Workflow

### Step 1: Upload Textbooks
1. **Admin uploads PDF** textbooks for each subject/class
2. **System processes PDFs** using AI to extract content
3. **Content is chunked** for optimal AI processing

### Step 2: Teacher Creates Quiz
1. **Teacher selects textbook** and content section
2. **AI generates 10 questions** using Gemini 2.5 Flash
3. **Teacher reviews** and approves questions
4. **Quiz is ready** for distribution

### Step 3: Distribution
1. **Select target audience**: Specific class, division, or individual students
2. **Send via Telegram**: Instant delivery to all registered students
3. **Real-time monitoring**: Track who received and started the quiz

### Step 4: Student Experience
1. **Receive notification** on Telegram
2. **Answer questions** one by one with A/B/C/D
3. **Get instant feedback** after each question
4. **View final score** immediately after completion

### Step 5: Analytics
1. **Detailed performance** tracking per student
2. **Class-wise analytics** and rankings
3. **Subject-wise progress** monitoring
4. **Historical data** and trends

## ⚙️ Configuration Options

### System Settings (via Web Dashboard)

| Setting | Description | Default |
|---------|-------------|---------|
| `quiz_default_time_limit` | Default quiz time limit (minutes) | 30 |
| `quiz_default_questions` | Default number of questions | 10 |
| `telegram_bot_token` | Telegram bot authentication token | - |
| `gemini_api_key` | Google Gemini AI API key | - |
| `pdf_max_file_size` | Maximum PDF upload size (MB) | 50 |
| `quiz_session_timeout` | Quiz session timeout (minutes) | 60 |
| `enable_telegram_bot` | Enable/disable Telegram bot | true |
| `enable_whatsapp_bot` | Enable/disable WhatsApp bot | false |

### Class and Subject Configuration

1. **Classes**: LKG, UKG, 1, 2, 3, 4, 5, 6, 7 (extendable)
2. **Divisions**: A, B, C, D (configurable)
3. **Subjects**: Mathematics, Science, English, Social Studies (per class)
4. **Academic Year**: Automatic detection with manual override

## 🔒 Security Features

- **Password hashing** using SHA-256 (upgrade to bcrypt for production)
- **JWT authentication** for API access
- **Rate limiting** to prevent abuse
- **Input validation** and sanitization
- **SQL injection** protection
- **CORS configuration** for frontend integration
- **Helmet.js** for security headers

## 📊 Monitoring and Maintenance

### Health Monitoring
```bash
# Check application health
curl http://localhost:3000/health

# Check bot status
curl http://localhost:3000/api/tools/bot/status
```

### Database Maintenance
```bash
# Create backup
npm run db:backup

# Check database connection
mysql -u root -p -e "SELECT 1"
```

### Log Management
- **Application logs**: `logs/app.log`
- **Error logs**: `logs/error.log`
- **Bot logs**: Console output
- **Database logs**: MySQL error log

### Performance Optimization
- **Enable compression** for HTTP responses
- **Use connection pooling** for database
- **Implement caching** for frequently accessed data
- **Optimize PDF processing** with chunking
- **Monitor memory usage** for AI operations

## 🐛 Troubleshooting

### Common Issues

#### Database Connection Failed
```bash
# Check MySQL service
sudo systemctl status mysql

# Test connection
mysql -u root -p -h localhost

# Verify credentials in .env file
```

#### Telegram Bot Not Responding
```bash
# Check bot token
curl -X GET "https://api.telegram.org/bot[YOUR_BOT_TOKEN]/getMe"

# Restart bot service
npm run bot:stop
npm run bot:start

# Check logs for errors
```

#### PDF Processing Failed
```bash
# Check Gemini API key
curl -X POST "https://generativelanguage.googleapis.com/v1/models" \
  -H "Authorization: Bearer YOUR_API_KEY"

# Verify PDF file permissions
ls -la uploads/pdfs/

# Check processing logs
tail -f logs/app.log
```

#### Student Registration Issues
- Verify phone number format (+country_code_number)
- Check if user exists in database
- Ensure bot token is correctly configured
- Verify student has Telegram installed

### Error Codes

| Code | Message | Solution |
|------|---------|----------|
| DB001 | Database connection failed | Check MySQL service and credentials |
| BOT001 | Telegram bot token invalid | Verify token with @BotFather |
| AI001 | Gemini API key invalid | Check API key in Google AI Studio |
| PDF001 | PDF processing failed | Verify file format and size |
| AUTH001 | Authentication failed | Check user credentials |

### Getting Help

1. **Check logs** first for specific error messages
2. **Verify configuration** in `.env` and database
3. **Test components** individually (database, bot, AI)
4. **Review setup steps** to ensure nothing was missed
5. **Check GitHub Issues** for known problems
6. **Contact support** with detailed error logs

## 🚀 Production Deployment

### Server Requirements
- **CPU**: 2+ cores recommended
- **RAM**: 4GB+ for AI processing
- **Storage**: 20GB+ for uploads and database
- **Network**: Stable internet for Telegram/Gemini APIs

### Deployment Steps
1. **Setup production server** (Ubuntu 20.04+ recommended)
2. **Install dependencies** (Node.js, MySQL, PM2)
3. **Clone repository** and configure environment
4. **Setup reverse proxy** (Nginx) for HTTPS
5. **Configure firewall** and security settings
6. **Setup monitoring** and backup automation
7. **Test all functionality** thoroughly

### Security Checklist
- [ ] Change default passwords
- [ ] Use strong JWT secrets
- [ ] Enable HTTPS with SSL certificates
- [ ] Configure firewall rules
- [ ] Setup regular backups
- [ ] Monitor logs for suspicious activity
- [ ] Keep dependencies updated
- [ ] Use environment variables for secrets

## 📈 Scaling Considerations

### Database Scaling
- **Read replicas** for analytics queries
- **Indexing** for performance optimization
- **Partitioning** for large datasets
- **Regular maintenance** and optimization

### Application Scaling
- **Load balancing** with multiple instances
- **Caching layer** (Redis) for session management
- **CDN** for static file delivery
- **Microservices** architecture for large scale

### Bot Scaling
- **Webhook mode** instead of polling for production
- **Queue system** for high-volume message processing
- **Multiple bot instances** for different regions
- **Rate limiting** and error handling

---

🎓 **Congratulations!** Your Quiz Whiz platform is now ready to revolutionize education through AI-powered interactive learning!

For technical support or feature requests, please visit our [GitHub repository](https://github.com/your-username/quiz-whiz) or contact the development team.