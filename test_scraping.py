import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

from backend.scraper import ScraperManager
from backend.database import DatabaseManager

def main():
    """Main script to test the scraping functionality"""
    print("=== AI Bot Scraping Test ===")
    
    # Initialize components
    db = DatabaseManager()
    scraper_manager = ScraperManager()
    
    print("Database initialized successfully!")
    print("Starting scraping process...")
    
    # Run scrapers
    results = scraper_manager.run_all_scrapers()
    
    # Display results
    total_events = 0
    for source, events in results.items():
        print(f"\n{source}: Found {len(events)} events")
        
        for event in events:
            try:
                event_id = db.insert_event(event)
                total_events += 1
                print(f"  ✓ Added: {event['title'][:50]}...")
            except Exception as e:
                print(f"  ✗ Error adding event: {e}")
    
    print(f"\n=== Summary ===")
    print(f"Total events processed: {total_events}")
    
    # Show some events from database
    print("\n=== Recent Events in Database ===")
    events_in_db = db.get_events(limit=5)
    for event in events_in_db:
        print(f"• {event['title']} ({event['organizer']})")

if __name__ == "__main__":
    main()