#!/usr/bin/env python3
"""Test NASSCOM scraper specifically"""

import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

from backend.scraper import NasscomScraper

def test_nasscom():
    scraper = NasscomScraper()
    events = scraper.scrape()
    
    print(f"NASSCOM Scraper Test:")
    print(f"Found {len(events)} events")
    
    for i, event in enumerate(events, 1):
        print(f"\nEvent {i}:")
        for key, value in event.items():
            print(f"  {key}: {value}")
    
    return events

if __name__ == "__main__":
    test_nasscom()