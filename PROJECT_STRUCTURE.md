# InnovationLink + Bot Integration - Project Structure

This repository now contains two integrated projects:

## 1. InnovationLink Platform (Original)
A startup-investor connection platform with authentication and portal features.

### Structure:
- **`Front-End/`** - React-based frontend application
- **`back-end/`** - Node.js backend with authentication APIs

## 2. Event Bot Components (Migrated from innobotFresh)
An intelligent event scraping and management system.

### Structure:
- **`bot-backend/`** - Python Flask backend for event scraping
- **`bot-frontend/`** - HTML/JS widgets for event display

## Key Files and Scripts

### Python Scripts (Root Level)
- `auto_scraper.py` - Automated event scraping from multiple sources
- `daily_scraper.py` - Daily scheduled scraping tasks
- `add_sample_data.py` - Database seeding with sample events
- `demo.py` - Demo script for testing functionality
- `static_server.py` - Simple HTTP server for frontend testing
- `test_*.py` - Various testing scripts

### Configuration Files
- `bot-requirements.txt` - Python dependencies for bot components
- `bot.env.example` - Environment configuration template
- `setup_cron.sh` - Cron job setup for automated scraping
- `setup_react.sh` - React frontend setup script

### Documentation
- `ENHANCED_FEATURES.md` - Enhanced feature specifications
- `MODERN_UI_FEATURES.md` - Modern UI component details
- `QUICK_START.md` - Quick start guide
- `REACT_PROPOSAL.md` - React integration proposal

## Integration Opportunities

### Potential Synergies:
1. **Event Integration**: Bot-scraped events can be displayed in the InnovationLink platform
2. **User Targeting**: Events can be personalized for startups and investors
3. **Notification System**: Real-time event notifications through the main platform
4. **Widget Embedding**: Event widgets can be embedded in user dashboards

### Development Workflow:
1. **InnovationLink Development**: Use `Front-End/` and `back-end/` directories
2. **Bot Development**: Use `bot-backend/`, `bot-frontend/`, and Python scripts
3. **Integration Testing**: Test combined functionality using bot widgets in the main platform

## Getting Started

### For InnovationLink Platform:
```bash
# Frontend
cd Front-End && npm install && npm run dev

# Backend  
cd back-end && npm install && npm start
```

### For Bot Components:
```bash
# Install Python dependencies
pip install -r bot-requirements.txt

# Configure environment
cp bot.env.example .env
# Edit .env with your configuration

# Run bot backend
cd bot-backend && python app.py

# Run scraper
python auto_scraper.py
```

This merged structure allows for both independent development and integrated feature development between the two platforms.