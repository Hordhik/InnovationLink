# InnovationLink - URL Reference Guide

## 🌐 Public Website (No Sidebar - Main NavBar)

These routes are accessible to everyone and show the main website navigation bar.

| URL | Description |
|-----|-------------|
| `http://localhost:5175/home` | Landing/Home page |
| `http://localhost:5175/events` | Public events listing (NavBar only) |
| `http://localhost:5175/blogs` | Blog articles |
| `http://localhost:5175/about` | About us page |

## 🔐 Authentication Routes

| URL | Description |
|-----|-------------|
| `http://localhost:5175/auth/login` | User login |
| `http://localhost:5175/auth/signup` | User registration |

## 🏢 Portal Dashboard (With Sidebar - Authenticated Users)

These routes show the full dashboard interface with TopBar and Sidebar navigation.

### Startup Portal (`/S/username/`)

| URL | Description |
|-----|-------------|
| `http://localhost:5175/S/testuser/home` | Startup dashboard home |
| `http://localhost:5175/S/testuser/events` | **Events with sidebar** |
| `http://localhost:5175/S/testuser/blogs` | Blogs with sidebar |
| `http://localhost:5175/S/testuser/profile` | Startup profile |
| `http://localhost:5175/S/testuser/inbox` | Messages/inbox |
| `http://localhost:5175/S/testuser/schedules` | Schedule management |

### Investor Portal (`/I/username/`)

| URL | Description |
|-----|-------------|
| `http://localhost:5175/I/username/home` | Investor dashboard home |
| `http://localhost:5175/I/username/events` | **Events with sidebar** |
| `http://localhost:5175/I/username/blogs` | Blogs with sidebar |
| `http://localhost:5175/I/username/profile` | Investor profile |
| `http://localhost:5175/I/username/inbox` | Messages/inbox |

## 🔧 Backend Services

| Service | URL | Description |
|---------|-----|-------------|
| **Frontend** | `http://localhost:5175` | React + Vite dev server |
| **Backend API** | `http://localhost:5001` | Node.js + Express API |
| **Bot Backend** | `http://localhost:8001` | Python FastAPI scraper |

### API Endpoints

- **Events API**: `http://localhost:8001/events`
- **Health Check**: `http://localhost:5001/health`
- **Bot Status**: `http://localhost:8001/scrape/status`

## 📊 Key Differences

### Public Events vs Portal Events

| Feature | Public (`/events`) | Portal (`/S/username/events`) |
|---------|-------------------|------------------------------|
| **Navigation** | Top NavBar only | TopBar + Left Sidebar |
| **Authentication** | Not required | Required |
| **Access Level** | Public content | Full access to events |
| **Blur Effect** | Slight blur if not logged in | No blur (authenticated) |
| **Use Case** | Marketing/Discovery | User dashboard |

## 🚀 Quick Start Commands

### Start All Services

```bash
# Terminal 1 - Backend API
cd /Users/yaswanth/Developer/InnovationLink/backend
npm run dev

# Terminal 2 - Frontend
cd /Users/yaswanth/Developer/InnovationLink/frontend
npm run dev

# Terminal 3 - Bot Backend
cd /Users/yaswanth/Developer/InnovationLink/botbackend
/Users/yaswanth/Developer/InnovationLink/.venv/bin/python -m uvicorn app:app --host 0.0.0.0 --port 8001 --reload
```

### Check Service Status

```bash
# Check Frontend
curl -I http://localhost:5175/

# Check Backend API
curl http://localhost:5001/health

# Check Bot Backend & Event Count
curl http://localhost:8001/events | jq '.count'
```

## 📝 Architecture Notes

1. **Public Website** (`/events`) is for discovery and SEO
2. **Portal Dashboard** (`/S/username/events`) is for authenticated users
3. Both use the same Events component but with different layouts
4. Events are fetched from Bot Backend API (`http://localhost:8001/events`)
5. Events are stored in MySQL database (`innovation_link.bot_events`)

## 🎯 Current Status

- ✅ Frontend running on port 5175
- ✅ Backend API running on port 5001
- ✅ Bot Backend running on port 8001
- ✅ MySQL database connected
- ✅ Auto-scraping enabled (30-minute intervals)
- ✅ 17+ events available from 7+ sources

---

**Last Updated**: October 20, 2025
