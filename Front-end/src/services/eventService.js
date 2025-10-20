import axios from 'axios';

// Base URL for your event API - pointing to bot backend
const API_BASE_URL = 'http://localhost:8001'; // Bot backend FastAPI server running on port 8001

class EventService {
  // Fetch all events from your platform
  static async getAllEvents() {
    try {
      const response = await axios.get(`${API_BASE_URL}/events`);
      
      // Handle the response structure: {"events": [...], "count": 23}
      const data = response.data;
      if (data && data.events) {
        return data.events; // Return just the events array
      } else if (Array.isArray(data)) {
        return data; // If it's already an array
      } else {
        console.warn('Unexpected API response structure:', data);
        return this.getFallbackEvents();
      }
    } catch (error) {
      console.error('Error fetching events:', error);
      // Fallback to sample data if API is unavailable
      return this.getFallbackEvents();
    }
  }

  // Fetch events with filters
  static async getFilteredEvents(filters = {}) {
    try {
      const params = new URLSearchParams();
      
      if (filters.limit) params.append('limit', filters.limit);
      if (filters.category) params.append('category', filters.category);
      if (filters.search) params.append('search', filters.search);
      
      const response = await axios.get(`${API_BASE_URL}/events?${params}`);
      
      // Handle the response structure: {"events": [...], "count": 23}
      const data = response.data;
      if (data && data.events) {
        return data.events; // Return just the events array
      } else if (Array.isArray(data)) {
        return data; // If it's already an array
      } else {
        console.warn('Unexpected API response structure:', data);
        return this.getFallbackEvents();
      }
    } catch (error) {
      console.error('Error fetching filtered events:', error);
      return this.getFallbackEvents();
    }
  }

  // Transform your event data to match InnovationLink's structure
  static transformEvents(events) {
    if (!Array.isArray(events)) return [];
    
    return events.map(event => ({
      title: event.title || event.name || 'Event',
      date: this.formatDate(event.date || event.start_date || event.event_date),
      location: event.location || event.venue || event.city || 'Online',
      state: this.extractState(event.location || event.venue || ''),
      city: this.extractCity(event.location || event.venue || ''),
      description: event.description || event.summary || 'No description available',
      logo: this.getEventLogo(event.source || 'default'),
      image_url: event.image_url || event.imageUrl || null, // ✨ Pass through scraped images
      url: event.url || event.source_url || event.link || '#',
      category: this.mapEventType(event.event_type || event.type || event.category || 'General'),
      source: event.source || event.organizer || 'Unknown'
    }));
  }

  // Map your event types to InnovationLink categories
  static mapEventType(eventType) {
    const typeMap = {
      'startup_event': 'Startup',
      'startup_program': 'Startup', 
      'funding': 'Funding',
      'incubator': 'Startup',
      'conference': 'Technology',
      'meetup': 'Networking',
      'government_scheme': 'Funding',
      'workshop': 'Workshop',
      'ai': 'AI/ML',
      'technology': 'Technology'
    };
    
    const lowerType = eventType.toLowerCase();
    return typeMap[lowerType] || 'General';
  }

  // Format date to match their display format
  static formatDate(dateString) {
    if (!dateString) return 'Date TBD';
    
    try {
      const date = new Date(dateString);
      const options = { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      };
      return date.toLocaleDateString('en-US', options);
    } catch {
      return dateString; // Return as-is if parsing fails
    }
  }

  // Extract state from location string
  static extractState(location) {
    const stateMap = {
      'delhi': 'Delhi',
      'new delhi': 'Delhi', 
      'bangalore': 'Karnataka',
      'bengaluru': 'Karnataka',
      'mumbai': 'Maharashtra',
      'hyderabad': 'Telangana',
      'chennai': 'Tamil Nadu',
      'pune': 'Maharashtra',
      'kochi': 'Kerala',
      'kolkata': 'West Bengal'
    };

    const locationLower = location.toLowerCase();
    for (const [key, state] of Object.entries(stateMap)) {
      if (locationLower.includes(key)) {
        return state;
      }
    }
    return 'Other';
  }

  // Extract city from location string
  static extractCity(location) {
    const cityMap = {
      'delhi': 'New Delhi',
      'new delhi': 'New Delhi',
      'bangalore': 'Bengaluru', 
      'bengaluru': 'Bengaluru',
      'mumbai': 'Mumbai',
      'hyderabad': 'Hyderabad',
      'chennai': 'Chennai',
      'pune': 'Pune',
      'kochi': 'Kochi',
      'kolkata': 'Kolkata'
    };

    const locationLower = location.toLowerCase();
    for (const [key, city] of Object.entries(cityMap)) {
      if (locationLower.includes(key)) {
        return city;
      }
    }
    
    // Try to extract city name from location string
    const parts = location.split(',');
    return parts[0].trim() || 'Online';
  }

  // Get logo based on event source
  static getEventLogo(source) {
    const logoMap = {
      'StartupEvents': 'startupEvents',
      'StartupIndia': 'startupIndia', 
      'T-Hub': 'thub',
      'NASSCOM': 'nasscom',
      'Inc42': 'inc42',
      'Eventbrite': 'eventbrite',
      'StartupNewsAggregator': 'startupNews',
      'default': 'default'
    };
    
    return logoMap[source] || logoMap['default'];
  }

  // Fallback events if API is not available
  static getFallbackEvents() {
    return [
      {
        title: "AI & Machine Learning Summit 2025",
        date: "December 15, 2025", 
        location: "Bengaluru, Karnataka",
        state: "Karnataka",
        city: "Bengaluru",
        description: "Join industry leaders and AI experts for cutting-edge insights into machine learning, deep learning, and artificial intelligence applications in various sectors.",
        logo: "default",
        url: "#",
        category: "Technology",
        source: "Sample"
      },
      {
        title: "Startup Funding Masterclass",
        date: "November 28, 2025",
        location: "Mumbai, Maharashtra", 
        state: "Maharashtra",
        city: "Mumbai",
        description: "Learn from successful entrepreneurs and VCs about raising funding, pitch deck creation, and investor relations in this comprehensive masterclass.",
        logo: "default", 
        url: "#",
        category: "Funding",
        source: "Sample"
      }
    ];
  }
}

export default EventService;