# 🤖 Quiz Whiz Telegram Bot Setup Guide

## Overview
This guide will help you set up and run the Quiz Whiz Telegram Bot that integrates with your website to deliver quizzes to students.

## 🚀 Quick Start

### 1. Install Dependencies
Navigate to the tools directory and install the required packages:

```bash
cd tools
npm install
```

### 2. Configure Environment Variables
Your `.env` file should contain:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=quiz_whiz

# Telegram Bot Configuration
TELEGRAM_BOT_TOKEN=8050855701:AAH17w76HvcEIsasW27d9zsnASYzz4zGRzw

# Other configurations...
```

### 3. Test Bot Connection
Test if your bot token is working:

```bash
node test-bot.js
```

You should see:
```
🔑 Bot Token: ✅ Found
🤖 Initializing bot...
✅ Bot connected successfully!
📱 Bot Info: { id: ..., name: ..., username: ... }
🎯 Bot is ready to use!
```

### 4. Start the Bot
Run the bot:

```bash
node start-bot.js
```

## 🔧 Bot Features

### Commands
- `/start` - Welcome message and registration prompt
- `/register PHONE_NUMBER` - Register with school phone number
- `/help` - Show available commands

### Quiz Interaction
- Students receive quizzes automatically
- Answer questions with A, B, C, or D
- Real-time progress tracking
- Automatic score calculation

## 📱 Student Registration Process

1. **Student finds bot** on Telegram (search for your bot username)
2. **Student starts bot** with `/start`
3. **Student registers** with `/register PHONE_NUMBER`
4. **System validates** phone number against database
5. **Student receives** confirmation and can start using the bot

## 🎯 Quiz Delivery Flow

1. **Teacher creates quiz** on the website
2. **Teacher assigns quiz** to specific classes
3. **Bot automatically sends** quiz to registered students
4. **Students answer** questions via Telegram
5. **Results are recorded** in the database
6. **Performance analytics** are updated in real-time

## 🛠️ Admin Dashboard Integration

The bot management is integrated into your admin dashboard:

- **Bot Status** - Check if bot is running
- **User Management** - Monitor registered students
- **Quiz Analytics** - Track quiz performance
- **Bot Controls** - Start/stop bot, send test messages

## 🔒 Security Features

- Phone number validation against database
- User role verification
- Secure quiz session management
- Rate limiting for bot interactions

## 📊 Database Schema Updates

The bot requires these database fields:

```sql
-- Add telegram_id to users table
ALTER TABLE users ADD COLUMN telegram_id VARCHAR(50) UNIQUE;

-- Create quiz_sessions table if not exists
CREATE TABLE IF NOT EXISTS quiz_sessions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    student_id INT,
    quiz_id INT,
    status ENUM('active', 'completed', 'expired'),
    start_time TIMESTAMP,
    end_time TIMESTAMP,
    score DECIMAL(5,2),
    FOREIGN KEY (student_id) REFERENCES users(id),
    FOREIGN KEY (quiz_id) REFERENCES quizzes(id)
);
```

## 🚨 Troubleshooting

### Common Issues

1. **Bot not responding**
   - Check if bot is running: `node start-bot.js`
   - Verify token in `.env` file
   - Check database connection

2. **Database connection failed**
   - Verify database credentials in `.env`
   - Ensure MySQL service is running
   - Check database exists: `quiz_whiz`

3. **Students can't register**
   - Verify phone numbers exist in database
   - Check user table structure
   - Ensure `telegram_id` column exists

### Logs
The bot provides detailed logging:
- ✅ Success messages
- ❌ Error messages
- 👤 User registration events
- 🎯 Quiz interactions

## 🔄 Updating Bot Token

If you need to change the bot token:

1. Update `.env` file
2. Restart the bot: `node start-bot.js`
3. Update the token in your Telegram Bot settings

## 📞 Support

For technical support:
1. Check the logs for error messages
2. Verify all environment variables
3. Test database connectivity
4. Ensure bot has proper permissions

## 🎉 Next Steps

Once your bot is running:

1. **Test with a few students** to ensure everything works
2. **Create sample quizzes** on the website
3. **Assign quizzes to classes** to test delivery
4. **Monitor performance** through the admin dashboard
5. **Scale up** as more students join

---

**Happy Quizzing! 🎓📚**