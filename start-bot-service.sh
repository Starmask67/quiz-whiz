#!/bin/bash

# Quiz Whiz Telegram Bot Service Startup Script
# This script starts the bot and keeps it running

# Configuration
BOT_DIR="/workspace"
LOG_DIR="$BOT_DIR/logs"
BOT_LOG="$LOG_DIR/bot.log"
PID_FILE="$BOT_DIR/bot.pid"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Create logs directory if it doesn't exist
mkdir -p "$LOG_DIR"

# Function to log messages
log_message() {
    echo -e "${GREEN}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a "$BOT_LOG"
}

# Function to log errors
log_error() {
    echo -e "${RED}[$(date '+%Y-%m-%d %H:%M:%S')] ERROR:${NC} $1" | tee -a "$BOT_LOG"
}

# Function to log warnings
log_warning() {
    echo -e "${YELLOW}[$(date '+%Y-%m-%d %H:%M:%S')] WARNING:${NC} $1" | tee -a "$BOT_LOG"
}

# Check if bot is already running
if [ -f "$PID_FILE" ]; then
    PID=$(cat "$PID_FILE")
    if ps -p "$PID" > /dev/null 2>&1; then
        log_warning "Bot is already running with PID $PID"
        echo "Bot is already running with PID $PID"
        exit 1
    else
        log_warning "Stale PID file found, removing it"
        rm -f "$PID_FILE"
    fi
fi

# Change to bot directory
cd "$BOT_DIR" || {
    log_error "Failed to change to bot directory: $BOT_DIR"
    exit 1
}

# Check if .env file exists
if [ ! -f ".env" ]; then
    log_error ".env file not found in $BOT_DIR"
    echo "Error: .env file not found. Please create it with your configuration."
    exit 1
fi

# Check if start-bot.js exists
if [ ! -f "start-bot.js" ]; then
    log_error "start-bot.js not found in $BOT_DIR"
    echo "Error: start-bot.js not found. Please ensure the bot files are in place."
    exit 1
fi

# Start the bot
log_message "Starting Quiz Whiz Telegram Bot..."
log_message "Bot directory: $BOT_DIR"
log_message "Log file: $BOT_LOG"

# Start the bot in the background
nohup node start-bot.js >> "$BOT_LOG" 2>&1 &
BOT_PID=$!

# Save PID to file
echo "$BOT_PID" > "$PID_FILE"

# Wait a moment to check if bot started successfully
sleep 3

# Check if bot is running
if ps -p "$BOT_PID" > /dev/null 2>&1; then
    log_message "Bot started successfully with PID $BOT_PID"
    echo "✅ Bot started successfully!"
    echo "📝 Log file: $BOT_LOG"
    echo "🆔 Process ID: $BOT_PID"
    echo "🛑 To stop the bot, run: kill $BOT_PID"
    echo "📊 To monitor logs: tail -f $BOT_LOG"
else
    log_error "Bot failed to start"
    echo "❌ Bot failed to start. Check the log file: $BOT_LOG"
    rm -f "$PID_FILE"
    exit 1
fi

# Function to handle shutdown
cleanup() {
    log_message "Shutting down bot service..."
    if [ -f "$PID_FILE" ]; then
        PID=$(cat "$PID_FILE")
        if ps -p "$PID" > /dev/null 2>&1; then
            log_message "Stopping bot process $PID"
            kill "$PID"
            wait "$PID" 2>/dev/null
        fi
        rm -f "$PID_FILE"
    fi
    log_message "Bot service stopped"
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Keep script running and monitor bot
log_message "Bot service is running. Press Ctrl+C to stop."
while true; do
    if [ -f "$PID_FILE" ]; then
        PID=$(cat "$PID_FILE")
        if ! ps -p "$PID" > /dev/null 2>&1; then
            log_error "Bot process $PID has stopped unexpectedly"
            echo "❌ Bot has stopped unexpectedly. Check logs: $BOT_LOG"
            rm -f "$PID_FILE"
            exit 1
        fi
    fi
    sleep 10
done