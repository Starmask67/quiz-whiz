#!/bin/bash

# Quiz Whiz Bot Status Check Script
# This script checks the status of the bot and provides management options

# Configuration
BOT_DIR="/workspace"
PID_FILE="$BOT_DIR/bot.pid"
LOG_DIR="$BOT_DIR/logs"
BOT_LOG="$LOG_DIR/bot.log"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to check bot status
check_status() {
    if [ -f "$PID_FILE" ]; then
        PID=$(cat "$PID_FILE")
        if ps -p "$PID" > /dev/null 2>&1; then
            echo -e "${GREEN}✅ Bot is running${NC}"
            echo "🆔 Process ID: $PID"
            echo "📝 Log file: $BOT_LOG"
            
            # Show recent log entries
            if [ -f "$BOT_LOG" ]; then
                echo -e "\n${BLUE}📊 Recent log entries:${NC}"
                tail -5 "$BOT_LOG" | while read line; do
                    echo "   $line"
                done
            fi
        else
            echo -e "${RED}❌ Bot is not running (stale PID file)${NC}"
            rm -f "$PID_FILE"
        fi
    else
        echo -e "${YELLOW}⚠️  Bot is not running${NC}"
    fi
}

# Function to start bot
start_bot() {
    if [ -f "$PID_FILE" ]; then
        PID=$(cat "$PID_FILE")
        if ps -p "$PID" > /dev/null 2>&1; then
            echo -e "${YELLOW}Bot is already running with PID $PID${NC}"
            return
        fi
    fi
    
    echo -e "${BLUE}🚀 Starting bot...${NC}"
    cd "$BOT_DIR" && nohup node start-bot.js >> "$BOT_LOG" 2>&1 &
    BOT_PID=$!
    echo "$BOT_PID" > "$PID_FILE"
    
    sleep 2
    if ps -p "$BOT_PID" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Bot started successfully with PID $BOT_PID${NC}"
    else
        echo -e "${RED}❌ Failed to start bot${NC}"
        rm -f "$PID_FILE"
    fi
}

# Function to stop bot
stop_bot() {
    if [ -f "$PID_FILE" ]; then
        PID=$(cat "$PID_FILE")
        if ps -p "$PID" > /dev/null 2>&1; then
            echo -e "${BLUE}🛑 Stopping bot (PID: $PID)...${NC}"
            kill "$PID"
            wait "$PID" 2>/dev/null
            rm -f "$PID_FILE"
            echo -e "${GREEN}✅ Bot stopped${NC}"
        else
            echo -e "${YELLOW}Bot is not running${NC}"
            rm -f "$PID_FILE"
        fi
    else
        echo -e "${YELLOW}Bot is not running${NC}"
    fi
}

# Function to restart bot
restart_bot() {
    echo -e "${BLUE}🔄 Restarting bot...${NC}"
    stop_bot
    sleep 2
    start_bot
}

# Function to show logs
show_logs() {
    if [ -f "$BOT_LOG" ]; then
        echo -e "${BLUE}📊 Bot logs (last 20 lines):${NC}"
        tail -20 "$BOT_LOG"
    else
        echo -e "${YELLOW}No log file found${NC}"
    fi
}

# Function to show help
show_help() {
    echo -e "${BLUE}Quiz Whiz Bot Management Script${NC}"
    echo ""
    echo "Usage: $0 [command]"
    echo ""
    echo "Commands:"
    echo "  status    - Check bot status (default)"
    echo "  start     - Start the bot"
    echo "  stop      - Stop the bot"
    echo "  restart   - Restart the bot"
    echo "  logs      - Show recent logs"
    echo "  help      - Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0              # Check status"
    echo "  $0 start        # Start bot"
    echo "  $0 stop         # Stop bot"
    echo "  $0 restart      # Restart bot"
    echo "  $0 logs         # Show logs"
}

# Main script logic
case "${1:-status}" in
    "status")
        check_status
        ;;
    "start")
        start_bot
        ;;
    "stop")
        stop_bot
        ;;
    "restart")
        restart_bot
        ;;
    "logs")
        show_logs
        ;;
    "help"|"-h"|"--help")
        show_help
        ;;
    *)
        echo -e "${RED}Unknown command: $1${NC}"
        echo "Use '$0 help' for usage information"
        exit 1
        ;;
esac