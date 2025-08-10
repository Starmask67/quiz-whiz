# 🚀 Quiz Whiz Telegram Bot - Deployment Guide

This guide will walk you through deploying the complete Quiz Whiz Telegram Bot system step by step.

## 📋 Prerequisites

Before you begin, ensure you have:

- ✅ **Node.js** (v16 or higher) installed
- ✅ **MySQL** (v8.0 or higher) running
- ✅ **Git** for cloning the repository
- ✅ **Linux/macOS** environment (for startup scripts)
- ✅ **Telegram Bot Token** from @BotFather

## 🛠️ Step-by-Step Deployment

### Step 1: Environment Setup

1. **Copy environment file:**
   ```bash
   cp .env.example .env
   ```

2. **Edit `.env` with your configuration:**
   ```env
   # Database Configuration
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=your_mysql_username
   DB_PASSWORD=your_mysql_password
   DB_NAME=quiz_whiz
   
   # Telegram Bot Configuration
   TELEGRAM_BOT_TOKEN=8050855701:AAH17w76HvcEIsasW27d9zsnASYzz4zGRzw
   WEBHOOK_PORT=8443
   
   # Backend Server Configuration
   BACKEND_URL=http://localhost:3001
   BACKEND_PORT=3001
   ```

### Step 2: Database Setup

1. **Create MySQL database:**
   ```sql
   CREATE DATABASE quiz_whiz CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```

2. **Create MySQL user (optional but recommended):**
   ```sql
   CREATE USER 'quiz_whiz_user'@'localhost' IDENTIFIED BY 'your_secure_password';
   GRANT ALL PRIVILEGES ON quiz_whiz.* TO 'quiz_whiz_user'@'localhost';
   FLUSH PRIVILEGES;
   ```

3. **Update `.env` with your database credentials**

### Step 3: Install Dependencies

```bash
npm install
```

### Step 4: Test System

Run the system test to verify everything is configured correctly:

```bash
node test-system.js
```

**Expected Output:**
- ✅ Environment Variables: PASS
- ✅ Database Connection: PASS  
- ✅ Database Schema: WARN (tables will be created automatically)
- ✅ Backend Server: WARN (normal if not started yet)
- ✅ Bot Configuration: PASS
- ✅ File System: PASS

### Step 5: Start the System

#### Option A: Use Startup Script (Recommended)
```bash
# Make script executable (if not already)
chmod +x start-system.sh

# Start the entire system
./start-system.sh start

# Check status
./start-system.sh status
```

#### Option B: Manual Startup
```bash
# Terminal 1: Start Backend Server
node start-backend.js

# Terminal 2: Start Enhanced Bot  
node enhanced-telegram-bot.js
```

### Step 6: Verify Deployment

1. **Check Backend Server:**
   ```bash
   curl http://localhost:3001/api/bot-status
   ```

2. **Check Bot Status:**
   - Look for "✅ Enhanced Bot is now running!" in bot logs
   - Check webhook is set correctly

3. **Test Telegram Bot:**
   - Open Telegram
   - Find your bot (@your_bot_username)
   - Send `/start` command
   - Should receive welcome message

## 🔧 Configuration Options

### Bot Settings
- **Session Timeout**: 30 minutes (configurable in `.env`)
- **Quiz Timeout**: 1 hour (configurable in `.env`)
- **Max Questions**: 50 per quiz (configurable in `.env`)

### Server Settings
- **Backend Port**: 3001 (configurable in `.env`)
- **Bot Port**: 8443 (configurable in `.env`)
- **Log Level**: info (configurable in `.env`)

## 📊 System Management

### Check System Status
```bash
./start-system.sh status
```

### View Logs
```bash
# Backend logs
./start-system.sh logs backend

# Bot logs  
./start-system.sh logs bot
```

### Stop System
```bash
./start-system.sh stop
```

### Restart System
```bash
./start-system.sh restart
```

## 🌐 Production Deployment

### 1. Environment Variables
```env
NODE_ENV=production
BACKEND_URL=https://yourdomain.com
JWT_SECRET=your_very_secure_jwt_secret
ENCRYPTION_KEY=your_very_secure_encryption_key
```

### 2. Process Manager (PM2)
```bash
# Install PM2
npm install -g pm2

# Start with PM2
pm2 start start-backend.js --name "quiz-whiz-backend"
pm2 start enhanced-telegram-bot.js --name "quiz-whiz-bot"

# Save PM2 configuration
pm2 save
pm2 startup
```

### 3. Reverse Proxy (Nginx)
```nginx
server {
    listen 80;
    server_name yourdomain.com;
    
    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 4. SSL Certificate
```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d yourdomain.com
```

## 🚨 Troubleshooting

### Common Issues

#### 1. Port Already in Use
```bash
# Check what's using the port
lsof -i :3001
lsof -i :8443

# Kill the process
kill -9 <PID>
```

#### 2. Database Connection Failed
```bash
# Check MySQL status
sudo systemctl status mysql

# Test connection
mysql -u your_user -p -h localhost
```

#### 3. Bot Not Responding
```bash
# Check bot logs
./start-system.sh logs bot

# Verify webhook
curl -X GET "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getWebhookInfo"
```

#### 4. Permission Denied
```bash
# Fix script permissions
chmod +x start-system.sh

# Check file ownership
ls -la start-system.sh
```

### Debug Mode
Enable detailed logging by setting `LOG_LEVEL=debug` in `.env`

## 📱 Telegram Bot Setup

### 1. Create Bot with @BotFather
1. Open Telegram and search for @BotFather
2. Send `/newbot`
3. Follow instructions to create bot
4. Save the bot token

### 2. Configure Bot
1. Set bot description: `/setdescription`
2. Set bot commands: `/setcommands`
3. Set bot profile picture: `/setuserpic`

### 3. Test Bot
1. Send `/start` to your bot
2. Test registration with `/register PHONE`
3. Test quiz functionality with `/quiz`

## 🔒 Security Considerations

### 1. Environment Variables
- Never commit `.env` files to version control
- Use strong, unique passwords
- Rotate secrets regularly

### 2. Database Security
- Use dedicated database user
- Limit database permissions
- Enable SSL connections in production

### 3. Network Security
- Use HTTPS in production
- Configure firewall rules
- Enable rate limiting

### 4. Bot Security
- Keep bot token secret
- Monitor bot activity logs
- Implement user authentication

## 📈 Monitoring & Maintenance

### 1. Health Checks
```bash
# System health
./start-system.sh status

# API health
curl http://localhost:3001/health

# Database health
mysql -u user -p -e "SELECT 1"
```

### 2. Log Rotation
```bash
# Install logrotate
sudo apt install logrotate

# Configure log rotation for your logs
```

### 3. Backup Strategy
```bash
# Database backup
mysqldump -u user -p quiz_whiz > backup_$(date +%Y%m%d).sql

# Configuration backup
cp .env .env.backup.$(date +%Y%m%d)
```

## 🎯 Next Steps

After successful deployment:

1. **Test all bot commands** with different users
2. **Create sample quizzes** in your database
3. **Invite students** to test the system
4. **Monitor performance** and logs
5. **Set up monitoring** and alerting
6. **Plan scaling** strategy

## 📞 Support

If you encounter issues:

1. Check the troubleshooting section above
2. Review logs for error details
3. Check system status with `./start-system.sh status`
4. Create an issue in the repository
5. Contact the development team

---

**🎉 Congratulations! Your Quiz Whiz Telegram Bot is now deployed and ready to use!**