# InnovationLink Docker Setup

This Docker setup integrates your entire application stack including frontend, backend APIs, and database.

## 🚀 What This Docker Setup Includes

### **Complete Integration:**
- ✅ **Frontend (React + Vite)** - Port 5173
- ✅ **Backend APIs (Node.js + Express)** - Port 5001  
- ✅ **Database (MySQL 8.0)** - Port 3306
- ✅ **Authentication System** - Login/Signup/JWT
- ✅ **Events Blur Feature** - Working with real auth
- ✅ **Auto-fill Login** - After signup flow

### **Git Repos Integration:**
- ✅ **InnovationLink Repo** - Frontend + Backend APIs
- ✅ **innobotFresh Repo** - Events scraping system
- ✅ **Seamless Data Flow** - Events → Backend → Frontend

## 🛠️ How to Run Everything

### **1. Start the Full Stack:**
```bash
cd /Users/yaswanth/Developer/InnovationLink
docker-compose up -d
```

### **2. Check Services Status:**
```bash
docker-compose ps
```

### **3. View Logs:**
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
```

## 🌐 Access Points

| Service | URL | Description |
|---------|-----|-------------|
| **Frontend** | http://localhost:5173 | React app with auth & blur feature |
| **Backend API** | http://localhost:5001 | Authentication & user APIs |
| **Database** | localhost:3306 | MySQL with user data |

## 🔧 API Endpoints Available

### **Authentication:**
- `POST /api/auth/register` - User signup
- `POST /api/auth/login` - User login  
- `GET /api/auth/session` - Get current session

### **Users:**
- `GET /api/users` - Get user data
- Plus all your existing backend routes!

## 🎯 Full Integration Flow

### **1. Events Integration:**
```bash
# Run innobotFresh scraper (separate terminal)
cd /Users/yaswanth/Developer/innobotFresh
python backend/app.py  # Events API on :8000

# Events flow: innobotFresh → Backend → Frontend
```

### **2. Authentication Flow:**
1. **Signup** → Real API → Database storage
2. **Login** → JWT token → AuthContext
3. **Events Page** → Blur feature works
4. **Auto-fill** → Seamless UX

### **3. Database Integration:**
- All user data stored in MySQL
- Persistent across container restarts
- Proper user roles (startup/investor)

## 🔄 Development Workflow

### **Hot Reload Enabled:**
- Frontend: Vite HMR working
- Backend: Nodemon auto-restart
- Code changes reflect immediately

### **Git Integration:**
```bash
# Your changes are already pushed to yaswanth branch
# Continue development as normal
git add .
git commit -m "New features"
git push origin yaswanth
```

## 🐳 Docker Commands

### **Start Everything:**
```bash
docker-compose up -d
```

### **Stop Everything:**
```bash
docker-compose down
```

### **Rebuild After Code Changes:**
```bash
docker-compose down
docker-compose build
docker-compose up -d
```

### **Reset Database:**
```bash
docker-compose down -v  # Removes volumes
docker-compose up -d
```

## 🔗 Complete System Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   innobotFresh  │    │ InnovationLink  │    │     Docker      │
│                 │    │                 │    │                 │
│ Events Scraper  │───▶│  Backend APIs   │───▶│   MySQL DB      │
│   :8000         │    │    :5001        │    │    :3306        │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                              │
                              ▼
                       ┌─────────────────┐
                       │ React Frontend  │
                       │ Auth + Blur     │
                       │     :5173       │
                       └─────────────────┘
```

## ✨ Features Working

- ✅ **Real Authentication** - No more mock login
- ✅ **Events Blur Feature** - For logged-out users  
- ✅ **Auto-fill Login** - After signup
- ✅ **Professional UI** - Interactive modals
- ✅ **Data Persistence** - MySQL storage
- ✅ **Git Integration** - Already pushed to your branch

## 🚀 Ready to Test!

Just run `docker-compose up -d` and everything will work together!