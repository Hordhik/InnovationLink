#!/usr/bin/env python3
"""
Demo script to showcase the AI Bot functionality
"""

import requests
import json
import time
from datetime import datetime

API_BASE = "http://127.0.0.1:8000"

def test_api():
    """Test all API endpoints"""
    print("🤖 AI Bot Demo - Testing API Endpoints")
    print("=" * 50)
    
    # Test health endpoint
    print("\n1. Testing Health Endpoint...")
    try:
        response = requests.get(f"{API_BASE}/")
        print(f"   ✅ Health Check: {response.json()['status']}")
    except Exception as e:
        print(f"   ❌ Health Check Failed: {e}")
        return
    
    # Add test event
    print("\n2. Adding Test Event...")
    try:
        response = requests.post(f"{API_BASE}/events/test")
        data = response.json()
        print(f"   ✅ Test Event Added: ID {data['event_id']}")
    except Exception as e:
        print(f"   ❌ Test Event Failed: {e}")
    
    # Get events
    print("\n3. Retrieving Events...")
    try:
        response = requests.get(f"{API_BASE}/events")
        data = response.json()
        print(f"   ✅ Found {data['count']} events in database")
        
        # Display first few events
        for i, event in enumerate(data['events'][:3]):
            print(f"      {i+1}. {event['title']} ({event['organizer']})")
    except Exception as e:
        print(f"   ❌ Get Events Failed: {e}")
    
    # Test event types
    print("\n4. Getting Event Types...")
    try:
        response = requests.get(f"{API_BASE}/events/types")
        data = response.json()
        print(f"   ✅ Available Types: {', '.join(data['event_types'])}")
    except Exception as e:
        print(f"   ❌ Get Types Failed: {e}")
    
    # Start scraping
    print("\n5. Testing Scraping Process...")
    try:
        response = requests.post(f"{API_BASE}/scrape")
        data = response.json()
        print(f"   ✅ Scraping Started: {data['message']}")
        
        # Wait a bit and check for new events
        print("   ⏳ Waiting for scraping to complete...")
        time.sleep(3)
        
        response = requests.get(f"{API_BASE}/events")
        new_data = response.json()
        print(f"   📊 Events after scraping: {new_data['count']}")
        
    except Exception as e:
        print(f"   ❌ Scraping Test Failed: {e}")
    
    print(f"\n🎉 Demo completed at {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("\n💡 Next Steps:")
    print("   - Visit http://localhost:3000 for the web interface")
    print("   - Visit http://localhost:8000/docs for API documentation")
    print("   - Check events.db for stored data")

if __name__ == "__main__":
    test_api()