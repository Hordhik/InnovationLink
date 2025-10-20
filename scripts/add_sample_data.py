#!/usr/bin/env python3
"""
Add sample realistic events to demonstrate the system
"""
import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

from backend.database import DatabaseManager
from datetime import datetime, timedelta

def add_sample_events():
    """Add realistic sample events for demonstration"""
    db = DatabaseManager()
    
    # Sample realistic events based on actual government/startup programs
    sample_events = [
        {
            'title': 'Startup India Seed Fund Scheme - Application Open',
            'description': 'Government seed funding scheme for startups with up to ₹50 lakh support',
            'organizer': 'Government of India - Startup India',
            'source_url': 'https://www.startupindia.gov.in/content/sih/en/government-schemes/startup-india-seed-fund-scheme.html',
            'event_type': 'government_scheme',
            'tags': ['funding', 'government', 'seed', 'startup'],
            'location': 'India',
            'date': (datetime.now() + timedelta(days=30)).isoformat()
        },
        {
            'title': 'NASSCOM 10K Startups Program - Cohort 2025',
            'description': 'Flagship startup program by NASSCOM for tech startups with mentorship and funding support',
            'organizer': 'NASSCOM',
            'source_url': 'https://nasscom.in/10000startups',
            'event_type': 'startup_program',
            'tags': ['nasscom', 'tech', 'mentorship', 'scaling'],
            'location': 'Multiple Cities, India',
            'date': (datetime.now() + timedelta(days=15)).isoformat()
        },
        {
            'title': 'T-Hub HealthTech Innovation Challenge',
            'description': 'Healthcare innovation challenge for startups working in digital health solutions',
            'organizer': 'T-Hub',
            'source_url': 'https://t-hub.co/events/healthtech-challenge-2025',
            'event_type': 'incubator',
            'tags': ['healthtech', 'innovation', 'challenge', 'healthcare'],
            'location': 'Hyderabad, India',
            'date': (datetime.now() + timedelta(days=45)).isoformat()
        },
        {
            'title': 'SIDBI Fund of Funds Scheme',
            'description': 'Alternative Investment Fund for startups and emerging businesses',
            'organizer': 'Small Industries Development Bank of India',
            'source_url': 'https://www.sidbi.in/en/fund-of-funds-for-startups',
            'event_type': 'funding',
            'tags': ['sidbi', 'funding', 'investment', 'aif'],
            'location': 'India',
            'date': datetime.now().isoformat()
        },
        {
            'title': 'Atal Innovation Mission - Startup Support',
            'description': 'Government initiative to promote innovation and entrepreneurship in schools and colleges',
            'organizer': 'NITI Aayog - Atal Innovation Mission',
            'source_url': 'https://aim.gov.in/startup-india.php',
            'event_type': 'government_scheme',
            'tags': ['atal', 'innovation', 'education', 'youth'],
            'location': 'Pan India',
            'date': (datetime.now() + timedelta(days=60)).isoformat()
        },
        {
            'title': 'Credit Guarantee Fund Trust for Micro and Small Enterprises',
            'description': 'Collateral-free credit facility for micro and small enterprises',
            'organizer': 'Ministry of MSME, Government of India',
            'source_url': 'https://cgtmse.in/',
            'event_type': 'government_scheme',
            'tags': ['msme', 'credit', 'guarantee', 'collateral-free'],
            'location': 'India',
            'date': datetime.now().isoformat()
        }
    ]
    
    print("Adding sample realistic events...")
    
    for event_data in sample_events:
        try:
            event_id = db.insert_event(event_data)
            print(f"✓ Added: {event_data['title']} (ID: {event_id})")
        except Exception as e:
            print(f"✗ Error adding {event_data['title']}: {e}")
    
    # Show updated database
    print(f"\n=== Updated Database Contents ===")
    events = db.get_events(limit=20)
    print(f"Total events in database: {len(events)}")
    
    for event in events:
        event_type_icon = {
            'startup_program': '🚀',
            'government_scheme': '🏛️',
            'incubator': '🏢',
            'funding': '💰'
        }
        icon = event_type_icon.get(event['event_type'], '📅')
        print(f"{icon} {event['title']} ({event['organizer']})")

if __name__ == "__main__":
    add_sample_events()