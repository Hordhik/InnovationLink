# AI Bot for Startup & Government Updates

## Overview
An intelligent bot that aggregates startup and government program updates from trusted sources and provides them through a web interface for Innovation Link.

## Project Structure
```
innobotFresh/
├── backend/
│   ├── app.py              # FastAPI main application
│   ├── scraper/            # Web scraping modules
│   ├── database/           # Database models and operations
│   └── api/                # API endpoints
├── frontend/               # React widget
├── config/                 # Configuration files
├── requirements.txt        # Python dependencies
└── README.md
```

## Tech Stack
- **Backend**: FastAPI + Python
- **Scraping**: BeautifulSoup + Requests
- **Database**: SQLite → Supabase
- **Frontend**: React
- **Deployment**: Vercel/Netlify

## Quick Start
1. Install dependencies: `pip install -r requirements.txt`
2. Run backend: `uvicorn backend.app:app --reload`
3. Access API docs: `http://localhost:8000/docs`

## Target Sources
- Startup India Portal
- T-Hub
- NASSCOM
- Government startup schemes
- Incubator programs