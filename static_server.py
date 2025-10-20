#!/usr/bin/env python3
"""
Static Events Server
Serves events from the daily-generated JSON file for ultra-fast loading
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import json
import os
from datetime import datetime
from typing import Dict, Any, Optional, List

app = FastAPI(
    title="AI Event Bot - Static Server",
    description="Fast static events API serving pre-processed events",
    version="2.0.0"
)

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static events file path
EVENTS_FILE = "bot-frontend/events.json"

def load_events_data() -> Dict[str, Any]:
    """Load events from the JSON file"""
    try:
        if not os.path.exists(EVENTS_FILE):
            return {
                "events": [],
                "count": 0,
                "last_updated": None,
                "error": "Events file not found. Run daily_scraper.py first."
            }
        
        with open(EVENTS_FILE, 'r', encoding='utf-8') as f:
            return json.load(f)
    except Exception as e:
        return {
            "events": [],
            "count": 0,
            "last_updated": None,
            "error": f"Error loading events: {str(e)}"
        }

@app.get("/")
async def root():
    """Root endpoint with API info"""
    return {
        "name": "AI Event Bot - Static API",
        "version": "2.0.0",
        "description": "Ultra-fast events API serving pre-processed data",
        "endpoints": {
            "/events": "Get all events (fast, from JSON)",
            "/events/stats": "Get scraping statistics",
            "/health": "Health check"
        }
    }

@app.get("/events")
async def get_events(limit: Optional[int] = None, event_type: Optional[str] = None):
    """Get events from the pre-processed JSON file (ultra-fast)"""
    try:
        data = load_events_data()
        
        if "error" in data:
            raise HTTPException(status_code=500, detail=data["error"])
        
        events = data.get("events", [])
        
        # Apply filtering if requested
        if event_type:
            events = [e for e in events if e.get("event_type") == event_type or e.get("type") == event_type]
        
        # Apply limit if requested
        if limit and limit > 0:
            events = events[:limit]
        
        return {
            "events": events,
            "count": len(events),
            "total_available": data.get("count", 0),
            "last_updated": data.get("last_updated"),
            "source": "static_json"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error serving events: {str(e)}")

@app.get("/events/stats")
async def get_events_stats():
    """Get statistics about the events data"""
    try:
        data = load_events_data()
        
        if "error" in data:
            return {"error": data["error"]}
        
        events = data.get("events", [])
        
        # Calculate statistics
        stats = {
            "total_events": len(events),
            "last_updated": data.get("last_updated"),
            "sources": {},
            "event_types": {},
            "upcoming_events": 0,
            "deduplication_stats": data.get("deduplication_stats", {}),
            "scraping_sources": data.get("scraping_sources", [])
        }
        
        # Count by source and type
        today = datetime.now().date()
        
        for event in events:
            # Count by source
            source = event.get("source", "Unknown")
            stats["sources"][source] = stats["sources"].get(source, 0) + 1
            
            # Count by type
            event_type = event.get("event_type", event.get("type", "unknown"))
            stats["event_types"][event_type] = stats["event_types"].get(event_type, 0) + 1
            
            # Count upcoming events
            event_date = event.get("date")
            if event_date:
                try:
                    # Parse event date
                    if isinstance(event_date, str):
                        event_date_obj = datetime.fromisoformat(event_date.replace('Z', '+00:00')).date()
                        if event_date_obj >= today:
                            stats["upcoming_events"] += 1
                except (ValueError, TypeError):
                    pass
        
        return stats
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting stats: {str(e)}")

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    data = load_events_data()
    
    return {
        "status": "healthy" if "error" not in data else "degraded",
        "timestamp": datetime.now().isoformat(),
        "events_available": data.get("count", 0),
        "last_data_update": data.get("last_updated"),
        "events_file_exists": os.path.exists(EVENTS_FILE)
    }

# Mount static files for frontend
app.mount("/static", StaticFiles(directory="bot-frontend"), name="static")

# Serve the modern frontend at root
@app.get("/")
async def serve_modern_frontend():
    """Serve the modern redesigned frontend interface"""
    try:
        with open("frontend/index_modern.html", "r") as f:
            html_content = f.read()
        return HTMLResponse(content=html_content)
    except FileNotFoundError:
        # Fallback to enhanced version
        try:
            with open("frontend/index_enhanced.html", "r") as f:
                html_content = f.read()
            return HTMLResponse(content=html_content)
        except FileNotFoundError:
            # Final fallback to original
            with open("frontend/index.html", "r") as f:
                html_content = f.read()
            return HTMLResponse(content=html_content)

if __name__ == "__main__":
    import uvicorn
    from fastapi.responses import HTMLResponse
    print("🚀 Starting Modern AI Event Bot Server...")
    print("📱 Modern UI available at: http://localhost:8000/")
    print("📱 Enhanced UI available at: http://localhost:8000/static/index_enhanced.html")
    print("📱 Original UI available at: http://localhost:8000/static/")
    print("🔌 API available at: http://localhost:8000/events")
    uvicorn.run(app, host="0.0.0.0", port=8080)