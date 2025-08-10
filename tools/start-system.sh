#!/bin/bash

# Quiz Whiz System Startup Script
# This script starts both the backend server and the enhanced Telegram bot

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
BACKEND_PORT=3001
BOT_PORT=8443
BACKEND_PID_FILE="backend.pid"
BOT_PID_FILE="bot.pid"
LOG_DIR="logs"

# Create logs directory if it doesn't exist
mkdir -p $LOG_DIR

echo -e "${BLUE}🚀 Starting Quiz Whiz System...${NC}"

# Function to check if a port is in use
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null ; then
        echo -e "${RED}❌ Port $port is already in use${NC}"
        return 1
    fi
    return 0
}

# Function to check if a process is running
check_process() {
    local pid_file=$1
    local process_name=$2
    
    if [ -f "$pid_file" ]; then
        local pid=$(cat "$pid_file")
        if ps -p $pid > /dev/null 2>&1; then
            echo -e "${YELLOW}⚠️  $process_name is already running (PID: $pid)${NC}"
            return 0
        else
            echo -e "${YELLOW}⚠️  Stale PID file found for $process_name, removing...${NC}"
            rm -f "$pid_file"
        fi
    fi
    return 1
}

# Function to start backend server
start_backend() {
    echo -e "${BLUE}🔧 Starting Backend Server...${NC}"
    
    if check_port $BACKEND_PORT; then
        if ! check_process $BACKEND_PID_FILE "Backend Server"; then
            echo -e "${BLUE}📡 Starting backend server on port $BACKEND_PORT...${NC}"
            
            # Start backend server in background
            nohup node start-backend.js > "$LOG_DIR/backend.log" 2>&1 &
            local backend_pid=$!
            echo $backend_pid > $BACKEND_PID_FILE
            
            # Wait a moment for server to start
            sleep 3
            
            if ps -p $backend_pid > /dev/null 2>&1; then
                echo -e "${GREEN}✅ Backend Server started successfully (PID: $backend_pid)${NC}"
                echo -e "${BLUE}📊 Backend logs: $LOG_DIR/backend.log${NC}"
            else
                echo -e "${RED}❌ Failed to start Backend Server${NC}"
                echo -e "${YELLOW}📋 Check logs: $LOG_DIR/backend.log${NC}"
                return 1
            fi
        fi
    else
        return 1
    fi
}

# Function to start enhanced bot
start_bot() {
    echo -e "${BLUE}🤖 Starting Enhanced Telegram Bot...${NC}"
    
    if check_port $BOT_PORT; then
        if ! check_process $BOT_PID_FILE "Enhanced Bot"; then
            echo -e "${BLUE}📱 Starting enhanced bot on port $BOT_PORT...${NC}"
            
            # Start enhanced bot in background
            nohup node enhanced-telegram-bot.js > "$LOG_DIR/bot.log" 2>&1 &
            local bot_pid=$!
            echo $bot_pid > $BOT_PID_FILE
            
            # Wait a moment for bot to start
            sleep 3
            
            if ps -p $bot_pid > /dev/null 2>&1; then
                echo -e "${GREEN}✅ Enhanced Bot started successfully (PID: $bot_pid)${NC}"
                echo -e "${BLUE}📊 Bot logs: $LOG_DIR/bot.log${NC}"
            else
                echo -e "${RED}❌ Failed to start Enhanced Bot${NC}"
                echo -e "${YELLOW}📋 Check logs: $LOG_DIR/bot.log${NC}"
                return 1
            fi
        fi
    else
        return 1
    fi
}

# Function to check system status
check_status() {
    echo -e "\n${BLUE}📊 System Status:${NC}"
    
    # Check backend
    if [ -f "$BACKEND_PID_FILE" ]; then
        local backend_pid=$(cat "$BACKEND_PID_FILE")
        if ps -p $backend_pid > /dev/null 2>&1; then
            echo -e "${GREEN}✅ Backend Server: Running (PID: $backend_pid)${NC}"
        else
            echo -e "${RED}❌ Backend Server: Not running${NC}"
        fi
    else
        echo -e "${RED}❌ Backend Server: Not running${NC}"
    fi
    
    # Check bot
    if [ -f "$BOT_PID_FILE" ]; then
        local bot_pid=$(cat "$BOT_PID_FILE")
        if ps -p $bot_pid > /dev/null 2>&1; then
            echo -e "${GREEN}✅ Enhanced Bot: Running (PID: $bot_pid)${NC}"
        else
            echo -e "${RED}❌ Enhanced Bot: Not running${NC}"
        fi
    else
        echo -e "${RED}❌ Enhanced Bot: Not running${NC}"
    fi
    
    # Check ports
    if lsof -Pi :$BACKEND_PORT -sTCP:LISTEN -t >/dev/null 2>&1; then
        echo -e "${GREEN}✅ Backend Port $BACKEND_PORT: Active${NC}"
    else
        echo -e "${RED}❌ Backend Port $BACKEND_PORT: Not active${NC}"
    fi
    
    if lsof -Pi :$BOT_PORT -sTCP:LISTEN -t >/dev/null 2>&1; then
        echo -e "${GREEN}✅ Bot Port $BOT_PORT: Active${NC}"
    else
        echo -e "${RED}❌ Bot Port $BOT_PORT: Not active${NC}"
    fi
}

# Function to stop system
stop_system() {
    echo -e "${YELLOW}🛑 Stopping Quiz Whiz System...${NC}"
    
    # Stop backend
    if [ -f "$BACKEND_PID_FILE" ]; then
        local backend_pid=$(cat "$BACKEND_PID_FILE")
        if ps -p $backend_pid > /dev/null 2>&1; then
            echo -e "${BLUE}🛑 Stopping Backend Server (PID: $backend_pid)...${NC}"
            kill $backend_pid
            rm -f "$BACKEND_PID_FILE"
            echo -e "${GREEN}✅ Backend Server stopped${NC}"
        fi
    fi
    
    # Stop bot
    if [ -f "$BOT_PID_FILE" ]; then
        local bot_pid=$(cat "$BOT_PID_FILE")
        if ps -p $bot_pid > /dev/null 2>&1; then
            echo -e "${BLUE}🛑 Stopping Enhanced Bot (PID: $bot_pid)...${NC}"
            kill $bot_pid
            rm -f "$BOT_PID_FILE"
            echo -e "${GREEN}✅ Enhanced Bot stopped${NC}"
        fi
    fi
    
    echo -e "${GREEN}✅ System stopped successfully${NC}"
}

# Function to show logs
show_logs() {
    local service=$1
    case $service in
        "backend")
            if [ -f "$LOG_DIR/backend.log" ]; then
                echo -e "${BLUE}📋 Backend Server Logs:${NC}"
                tail -f "$LOG_DIR/backend.log"
            else
                echo -e "${RED}❌ Backend log file not found${NC}"
            fi
            ;;
        "bot")
            if [ -f "$LOG_DIR/bot.log" ]; then
                echo -e "${BLUE}📋 Enhanced Bot Logs:${NC}"
                tail -f "$LOG_DIR/bot.log"
            else
                echo -e "${RED}❌ Bot log file not found${NC}"
            fi
            ;;
        *)
            echo -e "${RED}❌ Invalid service. Use 'backend' or 'bot'${NC}"
            ;;
    esac
}

# Main script logic
case "${1:-start}" in
    "start")
        echo -e "${BLUE}🚀 Starting Quiz Whiz System...${NC}"
        
        # Start backend first
        if start_backend; then
            # Wait a moment for backend to fully initialize
            sleep 2
            
            # Start bot
            if start_bot; then
                echo -e "\n${GREEN}🎉 Quiz Whiz System started successfully!${NC}"
                echo -e "${BLUE}🌐 Backend: http://localhost:$BACKEND_PORT${NC}"
                echo -e "${BLUE}🤖 Bot: Running on port $BOT_PORT${NC}"
                echo -e "\n${YELLOW}💡 Use './start-system.sh status' to check status${NC}"
                echo -e "${YELLOW}💡 Use './start-system.sh stop' to stop the system${NC}"
                echo -e "${YELLOW}💡 Use './start-system.sh logs <service>' to view logs${NC}"
            else
                echo -e "${RED}❌ Failed to start Enhanced Bot${NC}"
                exit 1
            fi
        else
            echo -e "${RED}❌ Failed to start Backend Server${NC}"
            exit 1
        fi
        ;;
    "stop")
        stop_system
        ;;
    "status")
        check_status
        ;;
    "restart")
        echo -e "${YELLOW}🔄 Restarting Quiz Whiz System...${NC}"
        stop_system
        sleep 2
        $0 start
        ;;
    "logs")
        show_logs $2
        ;;
    "help"|"-h"|"--help")
        echo -e "${BLUE}Quiz Whiz System Management Script${NC}"
        echo -e "\n${YELLOW}Usage:${NC}"
        echo -e "  $0 [command]"
        echo -e "\n${YELLOW}Commands:${NC}"
        echo -e "  start     - Start the system (default)"
        echo -e "  stop      - Stop the system"
        echo -e "  restart   - Restart the system"
        echo -e "  status    - Check system status"
        echo -e "  logs      - Show logs for a service (backend/bot)"
        echo -e "  help      - Show this help message"
        echo -e "\n${YELLOW}Examples:${NC}"
        echo -e "  $0 start              # Start the system"
        echo -e "  $0 status             # Check status"
        echo -e "  $0 logs backend       # Show backend logs"
        echo -e "  $0 logs bot           # Show bot logs"
        echo -e "  $0 stop               # Stop the system"
        ;;
    *)
        echo -e "${RED}❌ Unknown command: $1${NC}"
        echo -e "${YELLOW}💡 Use '$0 help' for usage information${NC}"
        exit 1
        ;;
esac