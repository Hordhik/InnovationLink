# InnovationLink - Simplified Project Structure

A unified startup-investor platform with integrated event scraping system.

## 🏗️ **Project Structure**

```
InnovationLink/
├── frontend/           # React Frontend - All UI Components
├── backend/            # Node.js API - Authentication & Main Services  
├── botbackend/         # Python Bot - Event Scraping & Database
└── README.md
```

## 📱 **Frontend** (`frontend/`)
**React application with all UI components including events pages**

- **Technology**: React + Vite
- **Port**: 5173
- **Contains**: 
  - User authentication pages
  - Startup/Investor dashboards  
  - Event display pages
  - Profile management
  - All website components

### Start Frontend:
```bash
cd frontend
npm install
npm run dev
# Runs on http://localhost:5173
```

## ⚙️ **Backend** (`backend/`)
**Node.js API server for main platform services**

- **Technology**: Node.js + Express
- **Port**: 5001
- **Database**: MySQL
- **Contains**:
  - User authentication APIs
  - Profile management
  - Main application logic

### Start Backend:
```bash
cd backend  
npm install
npm start
# Runs on http://localhost:5001
```

## 🤖 **Bot Backend** (`botbackend/`)
**Python scraping system with integrated database**

- **Technology**: Python + FastAPI
- **Port**: 8000
- **Database**: SQLite (`events.db` - included in this folder)
- **Auto-scraping**: Every 30 minutes
- **Contains**:
  - Event scraping scripts
  - SQLite database (`events.db`)
  - Static HTML widgets
  - API endpoints for events

### Start Bot Backend:
```bash
cd botbackend
pip install -r bot-requirements.txt
python app.py
# Runs on http://localhost:8000
# Auto-scrapes every 30 minutes
```

## 🔄 **Database Setup**

### Main Platform Database (MySQL):
- **Location**: External MySQL server
- **Purpose**: User accounts, profiles, authentication
- **Configuration**: `backend/.env`

### Bot Events Database (SQLite):
- **Location**: `botbackend/events.db`  
- **Purpose**: Scraped events, logs, images
- **Auto-managed**: No setup needed

## 🚀 **Quick Start**

Start all services:

```bash
# Terminal 1: Backend API
cd backend && npm start

# Terminal 2: Bot Backend (with auto-scraping)  
cd botbackend && python app.py

# Terminal 3: Frontend
cd frontend && npm run dev
```

## 🌐 **Access URLs**

- **Main Application**: http://localhost:5173
- **API Health Check**: http://localhost:5001/health  
- **Bot Events API**: http://localhost:8000/events
- **Bot Admin**: http://localhost:8000/docs

## ✨ **Key Features**

- ✅ **Auto Event Scraping**: 30-minute intervals
- ✅ **7 Event Sources**: Startup events, NASSCOM, T-Hub, etc.
- ✅ **Integrated Frontend**: Events display in main app
- ✅ **SQLite Database**: Events stored locally in botbackend/
- ✅ **No Docker**: Native development setup
- ✅ **Hot Reloading**: Fast development cycle

This simplified structure provides clear separation while keeping related components together!