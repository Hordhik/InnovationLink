from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Optional
import json
from datetime import datetime
import threading
import time

# Import our custom modules
import sys
import os
sys.path.append(os.path.dirname(__file__))

from database import DatabaseManager
from scraper import ScraperManager

app = FastAPI(
    title="AI Bot for Startup & Government Updates",
    description="API for aggregating startup and government program updates",
    version="1.0.0"
)

# Enable CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure properly for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize managers
db = DatabaseManager()
scraper_manager = ScraperManager(db)

# Auto-scraper configuration
AUTO_SCRAPE_INTERVAL = 1800  # 30 minutes in seconds
auto_scraper_running = False
last_auto_scrape = None

def background_auto_scraper():
    """Background thread that runs scraping automatically"""
    global auto_scraper_running, last_auto_scrape
    while auto_scraper_running:
        try:
            current_time = datetime.now()
            print(f"[{current_time}] Running automatic scraping...")
            results = scraper_manager.scrape_all()
            total_new = sum(len(events) for events in results.values())
            last_auto_scrape = current_time
            print(f"[{current_time}] Auto-scraper found {total_new} new events")
        except Exception as e:
            print(f"[{datetime.now()}] Auto-scraper error: {e}")
        
        time.sleep(AUTO_SCRAPE_INTERVAL)

def start_auto_scraper():
    """Start the background auto-scraper"""
    global auto_scraper_running
    if not auto_scraper_running:
        auto_scraper_running = True
        thread = threading.Thread(target=background_auto_scraper, daemon=True)
        thread.start()
        print(f"[{datetime.now()}] Auto-scraper started (runs every {AUTO_SCRAPE_INTERVAL/60} minutes)")

def stop_auto_scraper():
    """Stop the background auto-scraper"""
    global auto_scraper_running
    auto_scraper_running = False
    print(f"[{datetime.now()}] Auto-scraper stopped")

@app.on_event("startup")
async def startup_event():
    """Start background processes when app starts"""
    start_auto_scraper()

@app.on_event("shutdown")
async def shutdown_event():
    """Clean up when app shuts down"""
    stop_auto_scraper()

@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "message": "AI Bot for Startup & Government Updates API",
        "status": "running",
        "auto_scraper": "running" if auto_scraper_running else "stopped",
        "auto_scrape_interval_minutes": AUTO_SCRAPE_INTERVAL / 60,
        "timestamp": datetime.now().isoformat()
    }

@app.get("/status")
async def get_status():
    """Get detailed status including auto-scraper information"""
    return {
        "api_status": "running",
        "auto_scraper": {
            "running": auto_scraper_running,
            "interval_minutes": AUTO_SCRAPE_INTERVAL / 60,
            "last_run": last_auto_scrape.isoformat() if last_auto_scrape else None
        },
        "database": {
            "total_events": len(db.get_events())
        },
        "timestamp": datetime.now().isoformat()
    }

@app.get("/events")
async def get_events(
    limit: int = 50,
    event_type: Optional[str] = None,
    remove_duplicates: bool = True
):
    """Get events from the database with optional deduplication"""
    try:
        events = db.get_events(limit=limit*2, event_type=event_type)  # Get more events initially for deduplication
        
        # Map database fields to frontend-expected fields
        formatted_events = []
        for event in events:
            formatted_event = dict(event)
            # Map source_url to url for frontend compatibility
            formatted_event['url'] = event.get('source_url', '')
            # Map organizer to source for frontend compatibility
            formatted_event['source'] = event.get('organizer', 'Unknown')
            # Ensure type field exists
            formatted_event['type'] = event.get('event_type', 'startup_program')
            formatted_events.append(formatted_event)
        
        # Remove duplicates if requested
        if remove_duplicates:
            unique_events = []
            seen_titles = set()
            
            for event in formatted_events:
                title = event.get('title', '').strip().lower()
                if title and title not in seen_titles:
                    seen_titles.add(title)
                    unique_events.append(event)
                elif not title:  # Keep events without titles
                    unique_events.append(event)
            
            formatted_events = unique_events[:limit]  # Apply limit after deduplication
        
        return {
            "events": formatted_events,
            "count": len(formatted_events),
            "duplicates_removed": remove_duplicates,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/events/types")
async def get_event_types():
    """Get available event types"""
    return {
        "event_types": [
            "startup_program",
            "government_scheme", 
            "incubator",
            "funding"
        ]
    }

@app.post("/scrape")
async def run_scraping(background_tasks: BackgroundTasks):
    """Run the scraping process in the background"""
    background_tasks.add_task(scrape_all_sources)
    return {
        "message": "Scraping started in background",
        "timestamp": datetime.now().isoformat()
    }

async def scrape_all_sources():
    """Background task to scrape all sources and update database"""
    try:
        print("Starting scraping process...")
        results = scraper_manager.run_all_scrapers()
        
        total_events = 0
        for source, events in results.items():
            events_added = 0
            
            for event_data in events:
                try:
                    db.insert_event(event_data)
                    events_added += 1
                    total_events += 1
                except Exception as e:
                    print(f"Error inserting event from {source}: {e}")
            
            # Log the scraping result
            db.log_scraping_result(
                source=source,
                events_found=events_added,
                success=True if events_added > 0 else False,
                error_message=None
            )
            print(f"Added {events_added} events from {source}")
        
        print(f"Scraping completed. Total events added: {total_events}")
        
    except Exception as e:
        print(f"Error in scraping process: {e}")

@app.get("/scrape/logs")
async def get_scraping_logs():
    """Get scraping logs"""
    # Simple implementation - can be improved
    return {
        "message": "Scraping logs endpoint - implement based on needs",
        "timestamp": datetime.now().isoformat()
    }

@app.post("/events/test")
async def add_test_event():
    """Add a test event for development"""
    test_event = {
        "title": "Test Startup Program",
        "description": "A test event for development purposes",
        "date": datetime.now().isoformat(),
        "location": "Virtual",
        "organizer": "Test Organization",
        "source_url": "https://example.com",
        "event_type": "startup_program",
        "tags": ["test", "development"]
    }
    
    try:
        event_id = db.insert_event(test_event)
        return {
            "message": "Test event added successfully",
            "event_id": event_id,
            "event": test_event
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)