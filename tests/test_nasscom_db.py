#!/usr/bin/env python3
"""Test NASSCOM events with database"""

import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

from backend.database import DatabaseManager
from backend.scraper import NasscomScraper

def test_nasscom_with_db():
    # Initialize database
    db = DatabaseManager("test_nasscom.db")
    scraper = NasscomScraper()
    events = scraper.scrape()
    
    print(f"Testing NASSCOM events with database:")
    print(f"Found {len(events)} events")
    
    for i, event in enumerate(events, 1):
        print(f"\nTesting Event {i}: {event['title']}")
        try:
            event_id = db.add_event(
                title=event.get('title', ''),
                description=event.get('description', ''),
                date=event.get('date', ''),
                location=event.get('location', ''),
                url=event.get('url', ''),
                source="NASSCOM",
                event_type=event.get('type', 'startup_program')
            )
            print(f"  ✅ Successfully saved with ID: {event_id}")
        except Exception as e:
            print(f"  ❌ Error saving: {e}")
            print(f"     Event data: {event}")

if __name__ == "__main__":
    test_nasscom_with_db()