#!/usr/bin/env python3
"""
Auto-scraping scheduler for the AI Bot
Runs scraping automatically at regular intervals
"""

import asyncio
import schedule
import time
from datetime import datetime
import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

from backend.scraper import ScraperManager
from backend.database import DatabaseManager

class AutoScraper:
    def __init__(self):
        self.db = DatabaseManager()
        self.scraper_manager = ScraperManager()
        self.running = False
    
    def run_scraping_job(self):
        """Run the scraping process"""
        try:
            print(f"\n🤖 Auto-scraping started at {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
            
            results = self.scraper_manager.run_all_scrapers()
            
            total_new_events = 0
            for source, events in results.items():
                events_added = 0
                
                for event_data in events:
                    try:
                        self.db.insert_event(event_data)
                        events_added += 1
                        total_new_events += 1
                    except Exception as e:
                        # Skip duplicate events (expected behavior)
                        pass
                
                # Log the result
                self.db.log_scraping_result(
                    source=source,
                    events_found=events_added,
                    success=True if len(events) > 0 else False,
                    error_message=None
                )
                
                print(f"  📊 {source}: {events_added} new events")
            
            print(f"  ✅ Total new events added: {total_new_events}")
            print(f"  ⏰ Next scraping scheduled in 30 minutes")
            
        except Exception as e:
            print(f"  ❌ Error during auto-scraping: {e}")
    
    def start_scheduler(self):
        """Start the automatic scraping scheduler"""
        print("🚀 Starting AI Bot Auto-Scraper...")
        print("📅 Schedule: Every 30 minutes")
        print("🔄 Manual trigger: Send SIGUSR1 signal to this process")
        print("⏹️  Stop: Press Ctrl+C")
        
        # Schedule scraping every 30 minutes
        schedule.every(30).minutes.do(self.run_scraping_job)
        
        # Run once immediately
        print("\n🎯 Running initial scraping...")
        self.run_scraping_job()
        
        # Keep running
        self.running = True
        while self.running:
            schedule.run_pending()
            time.sleep(60)  # Check every minute
    
    def stop(self):
        """Stop the scheduler"""
        self.running = False

def main():
    auto_scraper = AutoScraper()
    
    try:
        auto_scraper.start_scheduler()
    except KeyboardInterrupt:
        print("\n⏹️  Stopping auto-scraper...")
        auto_scraper.stop()
        print("✅ Auto-scraper stopped successfully")

if __name__ == "__main__":
    main()