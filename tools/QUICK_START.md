# 🚀 Quick Start Guide - Quiz Whiz Telegram Bot

## ⚡ Get Running in 5 Minutes

### 1. 📋 Prerequisites Check
```bash
# Ensure you have Node.js and MySQL
node --version  # Should be v16+
mysql --version # Should be v8.0+
```

### 2. 🔧 Environment Setup
```bash
# Copy and configure environment file
cp .env.example .env

# Edit .env with your database credentials and bot token
nano .env
```

**Required in `.env`:**
- `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`
- `TELEGRAM_BOT_TOKEN=8050855701:AAH17w76HvcEIsasW27d9zsnASYzz4zGRzw`

### 3. 🗄️ Database Setup
```sql
-- Connect to MySQL and run:
CREATE DATABASE quiz_whiz CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 4. 📦 Install Dependencies
```bash
npm install
```

### 5. 🧪 Test System
```bash
node test-system.js
```

### 6. 🚀 Start Everything
```bash
# Start the complete system
./start-system.sh start

# Check status
./start-system.sh status
```

## 🎯 What You Get

✅ **Backend Server** - Port 3001 (RESTful API)  
✅ **Telegram Bot** - Port 8443 (Webhook)  
✅ **Database** - MySQL with auto-created tables  
✅ **Management Scripts** - Start/stop/restart/status  
✅ **Logging** - Separate logs for backend and bot  
✅ **Health Checks** - System monitoring  

## 📱 Test Your Bot

1. **Find your bot** on Telegram
2. **Send `/start`** - Should get welcome message
3. **Send `/help`** - See all available commands
4. **Test registration** with `/register PHONE`

## 🔍 System Status

```bash
# Check if everything is running
./start-system.sh status

# View real-time logs
./start-system.sh logs backend
./start-system.sh logs bot

# Stop the system
./start-system.sh stop
```

## 🚨 Common Issues

**Port already in use?**
```bash
lsof -i :3001  # Check backend port
lsof -i :8443  # Check bot port
kill -9 <PID>  # Kill process
```

**Database connection failed?**
- Check MySQL is running: `sudo systemctl status mysql`
- Verify credentials in `.env`
- Ensure database exists

**Bot not responding?**
- Check bot logs: `./start-system.sh logs bot`
- Verify bot token in `.env`
- Check webhook is set correctly

## 📚 Next Steps

1. **Create sample quizzes** in your database
2. **Invite students** to test the system
3. **Monitor performance** with analytics endpoints
4. **Customize bot responses** in `enhanced-telegram-bot.js`
5. **Add new API endpoints** in `start-backend.js`

## 🌐 API Endpoints

- **Health**: `http://localhost:3001/health`
- **Bot Status**: `http://localhost:3001/api/bot-status`
- **Users**: `http://localhost:3001/api/users`
- **Quizzes**: `http://localhost:3001/api/quizzes`
- **Analytics**: `http://localhost:3001/api/analytics/overview`

## 📞 Need Help?

- **Check logs**: `./start-system.sh logs <service>`
- **System status**: `./start-system.sh status`
- **Restart**: `./start-system.sh restart`
- **Full docs**: See `README.md` and `DEPLOYMENT.md`

---

**🎉 You're all set! Your Quiz Whiz Telegram Bot is ready to educate! 📚✨**