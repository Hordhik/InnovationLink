#!/bin/bash
# AI Event Bot - Daily Scraper Cron Setup

# This script sets up a cron job to run the daily scraper automatically

PROJECT_DIR="/Users/yaswanth/Developer/innobotFresh"
PYTHON_PATH="$PROJECT_DIR/.venv/bin/python"
SCRAPER_SCRIPT="$PROJECT_DIR/daily_scraper.py"
LOG_FILE="$PROJECT_DIR/scraper.log"

echo "🤖 AI Event Bot - Cron Setup"
echo "================================"

# Check if the scraper script exists
if [ ! -f "$SCRAPER_SCRIPT" ]; then
    echo "❌ Error: Daily scraper script not found at $SCRAPER_SCRIPT"
    exit 1
fi

# Check if Python virtual environment exists
if [ ! -f "$PYTHON_PATH" ]; then
    echo "❌ Error: Python virtual environment not found at $PYTHON_PATH"
    exit 1
fi

# Create cron job entry
CRON_ENTRY="0 6 * * * cd $PROJECT_DIR && $PYTHON_PATH $SCRAPER_SCRIPT >> $LOG_FILE 2>&1"

echo "📅 Setting up daily cron job..."
echo "   Command: $CRON_ENTRY"
echo "   Schedule: Every day at 6:00 AM"
echo "   Log file: $LOG_FILE"

# Add to crontab (remove existing entry first)
(crontab -l 2>/dev/null | grep -v "daily_scraper.py"; echo "$CRON_ENTRY") | crontab -

if [ $? -eq 0 ]; then
    echo "✅ Cron job successfully installed!"
    echo ""
    echo "📋 Current cron jobs:"
    crontab -l | grep "daily_scraper.py"
    echo ""
    echo "💡 To manually run the scraper:"
    echo "   cd $PROJECT_DIR && $PYTHON_PATH daily_scraper.py"
    echo ""
    echo "📄 To view logs:"
    echo "   tail -f $LOG_FILE"
else
    echo "❌ Failed to install cron job"
    exit 1
fi