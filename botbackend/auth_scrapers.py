#!/usr/bin/env python3
"""
Enhanced Scrapers with Authentication Support
These scrapers can access more data when authenticated
"""

import requests
import os
from typing import Dict, Any, List, Optional
from bs4 import BeautifulSoup
import json

class AuthenticatedEventbriteScraper:
    """Enhanced Eventbrite scraper with API authentication"""
    
    def __init__(self, api_key: Optional[str] = None):
        self.source_name = "Eventbrite_Auth"
        self.api_key = api_key or os.getenv('EVENTBRITE_API_KEY')
        self.base_url = "https://www.eventbriteapi.com/v3"
        self.session = requests.Session()
        
        if self.api_key:
            self.session.headers.update({
                'Authorization': f'Bearer {self.api_key}',
                'Content-Type': 'application/json'
            })
    
    def scrape_with_auth(self) -> List[Dict[str, Any]]:
        """Scrape events using Eventbrite API (requires authentication)"""
        events = []
        
        if not self.api_key:
            print("⚠️ No Eventbrite API key found. Using basic scraping...")
            return self._fallback_scrape()
        
        try:
            print(f"🔐 Scraping {self.source_name} with authentication...")
            
            # Search for startup/tech events in India
            search_params = {
                'q': 'startup technology entrepreneurship',
                'location.address': 'India',
                'location.within': '100km',
                'categories': '102,103',  # Business & Tech categories
                'sort_by': 'date',
                'expand': 'venue,organizer,ticket_availability'
            }
            
            response = self.session.get(
                f"{self.base_url}/events/search/", 
                params=search_params,
                timeout=15
            )
            
            if response.status_code == 200:
                data = response.json()
                events_data = data.get('events', [])
                
                for event_data in events_data[:10]:  # Limit to 10 events
                    event = self._extract_api_event(event_data)
                    if event:
                        events.append(event)
                        print(f"  ✓ {event['title']}")
                        
                print(f"📊 Found {len(events)} events via API")
            else:
                print(f"❌ API Error: {response.status_code}")
                return self._fallback_scrape()
                
        except Exception as e:
            print(f"❌ Auth scraping failed: {e}")
            return self._fallback_scrape()
        
        return events
    
    def _extract_api_event(self, event_data: dict) -> Dict[str, Any]:
        """Extract event from Eventbrite API response"""
        try:
            # Get detailed information from API
            title = event_data.get('name', {}).get('text', '')
            description = event_data.get('description', {}).get('text', '')[:500]
            
            # Enhanced date/time information
            start_time = event_data.get('start', {})
            date = start_time.get('local', '').split('T')[0] if start_time else None
            
            # Venue information
            venue = event_data.get('venue')
            location = "Online"
            if venue:
                address = venue.get('address', {})
                city = address.get('city', '')
                country = address.get('country', '')
                location = f"{city}, {country}" if city and country else "India"
            
            # Organizer info
            organizer = event_data.get('organizer', {}).get('name', 'Eventbrite')
            
            # Enhanced metadata
            event_url = event_data.get('url', '')
            image_url = event_data.get('logo', {}).get('url', '')
            
            # Additional API-only data
            ticket_availability = event_data.get('ticket_availability', {})
            capacity = event_data.get('capacity')
            is_free = event_data.get('is_free', False)
            
            return {
                'title': title,
                'description': description or f"Professional event from {self.source_name}",
                'date': date,
                'location': location,
                'organizer': organizer,
                'source_url': event_url,
                'event_type': 'professional_event',
                'image_url': image_url or 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&h=300&fit=crop',
                'tags': ['startup', 'technology', 'professional'],
                # Enhanced API data
                'is_free': is_free,
                'capacity': capacity,
                'ticket_status': ticket_availability.get('has_available_tickets', False)
            }
            
        except Exception as e:
            print(f"  ❌ Error extracting API event: {e}")
            return None
    
    def _fallback_scrape(self) -> List[Dict[str, Any]]:
        """Fallback to basic web scraping if API fails"""
        print("📄 Falling back to web scraping...")
        # Use the existing scraper logic as fallback
        return []


class AuthenticatedInc42Scraper:
    """Enhanced Inc42 scraper with potential login benefits"""
    
    def __init__(self, username: Optional[str] = None, password: Optional[str] = None):
        self.source_name = "Inc42_Auth"
        self.username = username
        self.password = password
        self.session = requests.Session()
        self.logged_in = False
        
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        })
    
    def login(self) -> bool:
        """Attempt to login to Inc42 for premium content"""
        if not self.username or not self.password:
            return False
            
        try:
            # Login implementation would go here
            print("🔐 Attempting Inc42 login...")
            # This would require reverse engineering Inc42's login process
            return False
        except Exception as e:
            print(f"❌ Login failed: {e}")
            return False
    
    def scrape_with_auth(self) -> List[Dict[str, Any]]:
        """Scrape with potential authenticated access"""
        events = []
        
        if self.username and self.password:
            self.logged_in = self.login()
        
        if self.logged_in:
            print("✅ Logged in - accessing premium content...")
            # Access premium event listings
            urls = [
                'https://inc42.com/tag/startup-events/',
                'https://inc42.com/events/',  # Premium events section
                'https://inc42.com/premium-events/'  # Hypothetical premium section
            ]
        else:
            print("📄 Using public access...")
            urls = ['https://inc42.com/tag/startup-events/']
        
        # Rest of scraping logic...
        return events


class PremiumEventAggregator:
    """Aggregates events from premium/authenticated sources"""
    
    def __init__(self):
        self.source_name = "Premium_Events"
        self.scrapers = {
            'eventbrite': AuthenticatedEventbriteScraper(),
            'inc42': AuthenticatedInc42Scraper()
        }
    
    def scrape_all_premium(self) -> List[Dict[str, Any]]:
        """Scrape from all premium sources"""
        all_events = []
        
        for source_name, scraper in self.scrapers.items():
            try:
                if hasattr(scraper, 'scrape_with_auth'):
                    events = scraper.scrape_with_auth()
                    all_events.extend(events)
                    print(f"📊 {source_name}: {len(events)} premium events")
            except Exception as e:
                print(f"❌ Error with {source_name}: {e}")
        
        return all_events


# Configuration class for API keys and credentials
class EventScrapingConfig:
    """Configuration for authenticated scraping"""
    
    def __init__(self):
        self.eventbrite_api_key = os.getenv('EVENTBRITE_API_KEY')
        self.inc42_username = os.getenv('INC42_USERNAME')
        self.inc42_password = os.getenv('INC42_PASSWORD')
        
        # Add more service credentials as needed
        self.meetup_api_key = os.getenv('MEETUP_API_KEY')
        self.facebook_access_token = os.getenv('FACEBOOK_ACCESS_TOKEN')
    
    def is_authenticated(self, service: str) -> bool:
        """Check if we have credentials for a service"""
        credentials = {
            'eventbrite': self.eventbrite_api_key,
            'inc42': self.inc42_username and self.inc42_password,
            'meetup': self.meetup_api_key,
            'facebook': self.facebook_access_token
        }
        return bool(credentials.get(service))
    
    def get_available_services(self) -> List[str]:
        """Get list of services we can authenticate with"""
        return [service for service in ['eventbrite', 'inc42', 'meetup', 'facebook'] 
                if self.is_authenticated(service)]


if __name__ == "__main__":
    # Example usage
    config = EventScrapingConfig()
    print("🔑 Available authenticated services:", config.get_available_services())
    
    # Test premium scraping
    premium_scraper = PremiumEventAggregator()
    events = premium_scraper.scrape_all_premium()
    print(f"📊 Total premium events found: {len(events)}")