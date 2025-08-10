# Quiz Whiz Telegram Bot & Backend System

A comprehensive Telegram bot system integrated with a robust backend server for managing educational quizzes, user interactions, and automated notifications.

## 🚀 Features

### Telegram Bot Features
- **User Registration**: Register with school phone number
- **Quiz Management**: Start, resume, and complete quizzes
- **Interactive Interface**: Inline keyboards and navigation
- **Progress Tracking**: Real-time quiz progress and scoring
- **Notifications**: Automated quiz reminders and updates
- **Multi-language Support**: English and Spanish (expandable)
- **User Profiles**: Detailed statistics and performance metrics
- **Leaderboards**: Class-based performance rankings

### Backend Server Features
- **RESTful API**: Complete CRUD operations for all entities
- **Webhook Support**: Telegram webhook integration
- **Database Management**: MySQL integration with automatic schema creation
- **User Management**: Authentication and role-based access
- **Quiz Management**: Create, assign, and monitor quizzes
- **Analytics**: Comprehensive reporting and statistics
- **Security**: Rate limiting, CORS, and input validation

## 📋 Prerequisites

- Node.js (v16 or higher)
- MySQL (v8.0 or higher)
- npm or yarn package manager
- Linux/macOS environment (for startup scripts)

## 🛠️ Installation

### 1. Clone and Navigate
```bash
cd tools/
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration
Copy the example environment file and configure it:
```bash
cp .env.example .env
```

Edit `.env` with your configuration:
```env
# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USER=your_username
DB_PASSWORD=your_password
DB_NAME=quiz_whiz

# Telegram Bot Configuration
TELEGRAM_BOT_TOKEN=your_bot_token_here
WEBHOOK_PORT=8443

# Backend Server Configuration
BACKEND_URL=http://localhost:3001
BACKEND_PORT=3001
```

### 4. Database Setup
Ensure your MySQL database is running and accessible. The system will automatically create required tables on first run.

## 🚀 Quick Start

### Option 1: Use the Startup Script (Recommended)
```bash
# Start the entire system
./start-system.sh start

# Check system status
./start-system.sh status

# View logs
./start-system.sh logs backend
./start-system.sh logs bot

# Stop the system
./start-system.sh stop

# Restart the system
./start-system.sh restart

# Get help
./start-system.sh help
```

### Option 2: Manual Startup
```bash
# Terminal 1: Start Backend Server
node start-backend.js

# Terminal 2: Start Enhanced Bot
node enhanced-telegram-bot.js
```

## 📱 Telegram Bot Usage

### Basic Commands
- `/start` - Initialize the bot and show welcome message
- `/register PHONE` - Register with school phone number
- `/help` - Show available commands
- `/quiz` - View available quizzes
- `/status` - Check current quiz status
- `/profile` - View your profile and statistics
- `/stats` - Detailed performance statistics
- `/leaderboard` - View class leaderboard
- `/settings` - Manage preferences
- `/cancel` - Cancel current operation

### Quiz Interaction
1. **Start Quiz**: Use `/quiz` to see available quizzes
2. **Answer Questions**: Select A, B, C, or D options
3. **Navigate**: Use Previous/Next buttons
4. **Complete**: Finish quiz to see results
5. **Resume**: Continue interrupted quizzes

## 🌐 Backend API Endpoints

### Bot Management
- `GET /api/bot-status` - Get bot status
- `POST /api/bot/start` - Start the bot
- `POST /api/bot/stop` - Stop the bot
- `POST /api/bot/restart` - Restart the bot

### User Management
- `GET /api/users` - List all users
- `POST /api/users` - Create new user
- `GET /api/users/:id` - Get user details
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Quiz Management
- `GET /api/quizzes` - List all quizzes
- `POST /api/quizzes` - Create new quiz
- `GET /api/quizzes/:id` - Get quiz details
- `PUT /api/quizzes/:id` - Update quiz
- `DELETE /api/quizzes/:id` - Delete quiz

### Analytics
- `GET /api/analytics/overview` - System overview
- `GET /api/analytics/user-stats` - User statistics
- `GET /api/analytics/quiz-performance` - Quiz performance data

### Webhooks
- `POST /webhook/telegram` - Telegram webhook endpoint

## 📊 System Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Telegram      │    │   Backend        │    │   MySQL         │
│   Bot           │◄──►│   Server         │◄──►│   Database      │
│   (Port 8443)   │    │   (Port 3001)    │    │                 │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   User          │    │   Admin          │    │   Logs &        │
│   Interactions  │    │   Dashboard      │    │   Analytics     │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## 🔧 Configuration Options

### Bot Configuration
- `SESSION_TIMEOUT`: Quiz session timeout (default: 30 minutes)
- `QUIZ_TIMEOUT`: Maximum quiz duration (default: 1 hour)
- `MAX_QUESTIONS_PER_QUIZ`: Maximum questions per quiz (default: 50)

### Server Configuration
- `BACKEND_PORT`: Backend server port (default: 3001)
- `NODE_ENV`: Environment mode (development/production)
- `LOG_LEVEL`: Logging level (info/debug/error)

### Security Configuration
- `JWT_SECRET`: JWT token secret
- `ENCRYPTION_KEY`: Data encryption key
- Rate limiting and CORS settings

## 📝 Logging

Logs are stored in the `logs/` directory:
- `backend.log` - Backend server logs
- `bot.log` - Telegram bot logs

View logs in real-time:
```bash
./start-system.sh logs backend
./start-system.sh logs bot
```

## 🚨 Troubleshooting

### Common Issues

1. **Port Already in Use**
   ```bash
   # Check what's using the port
   lsof -i :3001
   lsof -i :8443
   
   # Kill the process
   kill -9 <PID>
   ```

2. **Database Connection Failed**
   - Verify MySQL is running
   - Check database credentials in `.env`
   - Ensure database exists

3. **Bot Not Responding**
   - Check bot token in `.env`
   - Verify webhook is set correctly
   - Check bot logs for errors

4. **Dependencies Missing**
   ```bash
   # Reinstall dependencies
   rm -rf node_modules package-lock.json
   npm install
   ```

### Debug Mode
Enable debug logging by setting `LOG_LEVEL=debug` in `.env`

## 🔄 Development

### Adding New Commands
1. Add command handler in `enhanced-telegram-bot.js`
2. Register in `setupMessageHandlers()`
3. Update help text

### Adding New API Endpoints
1. Add route in `start-backend.js`
2. Implement controller logic
3. Add validation and error handling

### Database Schema Changes
1. Modify table creation in bot initialization
2. Update related queries
3. Test with existing data

## 📚 API Documentation

For detailed API documentation, visit:
- Backend: `http://localhost:3001/api/docs` (when implemented)
- Swagger/OpenAPI specs available in the codebase

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Check the troubleshooting section
- Review logs for error details
- Create an issue in the repository
- Contact the development team

---

**Happy Quizzing! 🎓📚**