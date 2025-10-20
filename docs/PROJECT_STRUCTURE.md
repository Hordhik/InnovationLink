# InnovationLink - Clean Architecture

This repository contains a unified startup-investor platform with intelligent event discovery capabilities.

## 🏗️ **Organized Directory Structure**

```
InnovationLink/
├── README.md                          # Main project documentation
├── .gitignore                         # Git ignore rules
├── .venv/                             # Python virtual environment
├── package.json                       # Root package.json for workspace
├── package-lock.json                  # Root package lockfile
│
├── apps/                              # Main applications
│   ├── frontend/                      # React frontend application
│   │   ├── src/                       # React source code
│   │   ├── public/                    # Static assets
│   │   ├── package.json               # Frontend dependencies
│   │   └── vite.config.js             # Vite configuration
│   │
│   └── backend/                       # Unified backend services
│       ├── api/                       # Node.js API server
│       │   ├── controllers/           # API controllers
│       │   ├── models/                # Data models
│       │   ├── routes/                # API routes
│       │   ├── middleware/            # Authentication & middleware
│       │   └── index.js               # Main server file
│       │
│       ├── scrapers/                  # Python event scrapers
│       │   ├── app.py                 # FastAPI scraper server
│       │   ├── database.py            # Database management
│       │   ├── models.py              # Data models
│       │   ├── new_scrapers.py        # Event scrapers
│       │   ├── auto_scraper.py        # Automated scraping
│       │   ├── daily_scraper.py       # Scheduled scraping
│       │   └── static_server.py       # Static file server
│       │
│       └── static/                    # Bot frontend widgets
│           ├── index.html             # Main widget interface
│           ├── events.json            # Cached events data
│           └── *.html                 # Various widget variations
│
├── scripts/                           # Automation & setup scripts
│   ├── setup_cron.sh                 # Cron job setup
│   ├── setup_react.sh                # React setup automation
│   ├── add_sample_data.py             # Database seeding
│   └── demo.py                        # Demo/testing script
│
├── tests/                             # Test files
│   ├── test_nasscom.py                # NASSCOM scraper tests
│   ├── test_nasscom_db.py             # Database tests
│   └── test_scraping.py               # General scraper tests
│
├── docs/                              # Documentation
│   ├── ENHANCED_FEATURES.md           # Feature specifications
│   ├── MODERN_UI_FEATURES.md          # UI component details
│   ├── QUICK_START.md                 # Quick start guide
│   ├── REACT_PROPOSAL.md              # React integration proposal
│   └── README_V2.md                   # Extended documentation
│
├── data/                              # Data storage
│   └── events.db                      # SQLite events database
│
└── config/                            # Configuration files
    ├── bot-requirements.txt           # Python dependencies
    └── bot.env.example                # Environment template
```

## 🚀 **Getting Started**

### **Frontend Development**
```bash
cd apps/frontend
npm install
npm run dev
# Runs on http://localhost:5173
```

### **Backend API Development**
```bash
cd apps/backend/api
npm install
npm start
# Runs on http://localhost:5001
```

### **Python Scrapers**
```bash
# Install Python dependencies
pip install -r config/bot-requirements.txt

# Configure environment
cp config/bot.env.example .env

# Run scraper server
cd apps/backend/scrapers
python app.py
# Runs on http://localhost:8000

# Run static server
python static_server.py
# Runs on http://localhost:8080
```

### **Database Setup**
```bash
# Run sample data script
python scripts/add_sample_data.py

# Test scrapers
python tests/test_scraping.py
```

## 🔧 **Architecture Benefits**

### **Clean Separation**
- **Frontend**: Pure React application in `apps/frontend/`
- **API**: Node.js authentication & user management in `apps/backend/api/`
- **Scrapers**: Python event collection system in `apps/backend/scrapers/`
- **Static**: Event widgets & interfaces in `apps/backend/static/`

### **Organized Assets**
- **Scripts**: All automation in `scripts/`
- **Tests**: Centralized testing in `tests/`
- **Docs**: All documentation in `docs/`
- **Data**: Database files in `data/`
- **Config**: Environment & dependencies in `config/`

### **Development Workflow**
1. **Frontend changes**: Work in `apps/frontend/`
2. **API changes**: Work in `apps/backend/api/`
3. **Scraper changes**: Work in `apps/backend/scrapers/`
4. **Testing**: Use files in `tests/`
5. **Documentation**: Update files in `docs/`

## 🎯 **Key Features**

### **InnovationLink Platform**
- React-based frontend with modern UI
- Node.js backend with JWT authentication
- User portal for startups and investors
- Dashboard and profile management

### **Event Intelligence System**
- Automated scraping from 7+ sources
- Real-time event collection (30-min cycles)
- FastAPI backend for event APIs
- Multiple widget interfaces
- SQLite database for efficient storage

### **Integration Ready**
- CORS enabled for cross-platform requests
- REST APIs for event data access
- Widget embedding capabilities
- Automated data synchronization

This clean architecture enables independent development while maintaining seamless integration between platform components.