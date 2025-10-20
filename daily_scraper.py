#!/usr/bin/env python3
"""
Daily Event Scraper Script
Runs once daily, scrapes all events, deduplicates, and saves to events.json
"""

import json
import sys
import os
from datetime import datetime, date
from typing import List, Dict, Any, Set
import hashlib

# Add backend to path for imports
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

from database import DatabaseManager
from scraper import ScraperManager

class EventDeduplicator:
    """Handles event deduplication logic"""
    
    @staticmethod
    def create_event_hash(event: Dict[str, Any]) -> str:
        """Create a unique hash for an event based on title, date, and location"""
        # Normalize title (lowercase, strip whitespace)
        title = str(event.get('title', '')).lower().strip()
        # Normalize date
        event_date = str(event.get('date', '')).strip()
        # Normalize location
        location = str(event.get('location', '')).lower().strip()
        
        # Create hash from key identifying fields
        hash_string = f"{title}|{event_date}|{location}"
        return hashlib.md5(hash_string.encode()).hexdigest()
    
    @staticmethod
    def deduplicate_events(events: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Remove duplicate events based on title, date, and location"""
        seen_hashes: Set[str] = set()
        deduplicated = []
        
        for event in events:
            event_hash = EventDeduplicator.create_event_hash(event)
            
            if event_hash not in seen_hashes:
                seen_hashes.add(event_hash)
                deduplicated.append(event)
            else:
                print(f"  Duplicate found: {event.get('title', 'Unknown')} on {event.get('date', 'Unknown date')}")
        
        return deduplicated

class DailyEventScraper:
    """Main scraper class that handles the daily scraping process"""
    
    def __init__(self, output_file: str = "frontend/events.json"):
        self.output_file = output_file
        self.db = DatabaseManager()
        self.scraper_manager = ScraperManager(self.db)
        
    def scrape_and_save(self):
        """Main method to scrape events and save to JSON"""
        print(f"🚀 Starting daily event scraping at {datetime.now()}")
        
        try:
            # 1. Run all scrapers
            print("📡 Running scrapers...")
            results = self.scraper_manager.scrape_all()
            
            # 2. Get all events from database
            print("📋 Retrieving events from database...")
            all_events = self.db.get_events(limit=1000)  # Get many events
            
            # 3. Format events for frontend
            print("🔧 Formatting events...")
            formatted_events = self._format_events_for_frontend(all_events)
            
            # 4. Deduplicate events
            print("🔍 Deduplicating events...")
            initial_count = len(formatted_events)
            deduplicated_events = EventDeduplicator.deduplicate_events(formatted_events)
            final_count = len(deduplicated_events)
            
            print(f"  Initial events: {initial_count}")
            print(f"  After deduplication: {final_count}")
            print(f"  Duplicates removed: {initial_count - final_count}")
            
            # 5. Sort events by date (upcoming first)
            print("📅 Sorting events...")
            sorted_events = self._sort_events_by_date(deduplicated_events)
            
            # 6. Create final JSON structure
            output_data = {
                "events": sorted_events,
                "count": len(sorted_events),
                "last_updated": datetime.now().isoformat(),
                "scraping_sources": list(results.keys()),
                "deduplication_stats": {
                    "initial_count": initial_count,
                    "final_count": final_count,
                    "duplicates_removed": initial_count - final_count
                }
            }
            
            # 7. Save to JSON file
            print(f"💾 Saving {final_count} events to {self.output_file}")
            os.makedirs(os.path.dirname(self.output_file), exist_ok=True)
            
            with open(self.output_file, 'w', encoding='utf-8') as f:
                json.dump(output_data, f, indent=2, ensure_ascii=False)
            
            print(f"✅ Daily scraping completed successfully!")
            print(f"📊 Summary:")
            for source, events in results.items():
                print(f"  - {source}: {len(events)} new events")
            
            return True
            
        except Exception as e:
            print(f"❌ Error during daily scraping: {e}")
            import traceback
            traceback.print_exc()
            return False
    
    def _format_events_for_frontend(self, events: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Format events for frontend consumption"""
        formatted_events = []
        
        for event in events:
            formatted_event = dict(event)
            
            # Map database fields to frontend-expected fields
            formatted_event['url'] = event.get('source_url', '')
            formatted_event['source'] = event.get('organizer', 'Unknown')
            formatted_event['type'] = event.get('event_type', 'startup_program')
            
            # Ensure required fields exist
            if not formatted_event.get('title'):
                continue  # Skip events without titles
            
            # Parse tags if they exist
            if event.get('tags'):
                try:
                    if isinstance(event['tags'], str):
                        formatted_event['tags'] = json.loads(event['tags'])
                    else:
                        formatted_event['tags'] = event['tags']
                except (json.JSONDecodeError, TypeError):
                    formatted_event['tags'] = []
            else:
                formatted_event['tags'] = []
            
            formatted_events.append(formatted_event)
        
        return formatted_events
    
    def _sort_events_by_date(self, events: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Sort events by date, with upcoming events first"""
        def date_sort_key(event):
            event_date = event.get('date')
            if not event_date:
                return datetime.max  # Put events without dates at the end
            
            try:
                # Try to parse the date
                if isinstance(event_date, str):
                    # Handle different date formats
                    for fmt in ('%Y-%m-%d', '%Y-%m-%dT%H:%M:%S', '%Y-%m-%dT%H:%M:%S.%f'):
                        try:
                            return datetime.strptime(event_date[:len(fmt.replace('%f', '123456'))], fmt)
                        except ValueError:
                            continue
                    # If no format matches, try parsing as ISO format
                    return datetime.fromisoformat(event_date.replace('Z', '+00:00'))
                return datetime.max
            except (ValueError, TypeError):
                return datetime.max
        
        return sorted(events, key=date_sort_key)

def main():
    """Main function to run the daily scraper"""
    print("=" * 60)
    print("🤖 AI Event Bot - Daily Scraper")
    print("=" * 60)
    
    scraper = DailyEventScraper()
    success = scraper.scrape_and_save()
    
    if success:
        print("✅ Daily scraping completed successfully!")
        return 0
    else:
        print("❌ Daily scraping failed!")
        return 1

if __name__ == "__main__":
    exit(main())