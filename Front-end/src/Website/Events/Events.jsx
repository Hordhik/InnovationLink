import React, { useState, useEffect } from 'react';
import './Events.css';
import EventCard from './EventCard';
import { useLocation } from 'react-router-dom';
import EventService from '../../services/eventService';
import { getToken } from '../../auth.js';

// Enhanced filter data - we'll dynamically populate these based on your events
const states = [
  "Andhra Pradesh", "Karnataka", "Telangana", "Tamil Nadu", 
  "Maharashtra", "Gujarat", "Rajasthan", "Delhi", "West Bengal", 
  "Kerala", "Madhya Pradesh", "Other"
];

const cities = [
  "New Delhi", "Bengaluru", "Mumbai", "Hyderabad", "Chennai", 
  "Pune", "Kochi", "Kolkata", "Anantapur", "Vizianagaram", 
  "Amaravati", "Online"
];

// Event categories from your platform
const categories = [
  "All", "Technology", "AI/ML", "Startup", "Funding", 
  "Networking", "Conference", "Workshop", "Meetup"
];

const Events = () => {
  // State management
  const [selectedStates, setSelectedStates] = useState([]);
  const [selectedCities, setSelectedCities] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [allEvents, setAllEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const location = useLocation();
  // Determine portal vs public view by first URL segment and child path
  const parts = location.pathname.split('/').filter(Boolean); // e.g. ['S','events'] or ['events']
  const first = parts[0];
  const second = parts[1];
  const isPortalView = (first === 'S' || first === 'I') && second === 'events';
  const isLoggedIn = !!getToken();

  // Load events on component mount
  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔄 Loading events from API...');
      
      // Fetch events from your API
  const rawEvents = await EventService.getAllEvents();
      console.log('📥 Raw events received:', rawEvents.length, 'events');
      
      // Transform events to match InnovationLink format
      const transformedEvents = EventService.transformEvents(rawEvents);
      console.log('✅ Transformed events:', transformedEvents.length, 'events');
      
      setAllEvents(transformedEvents);
    } catch (err) {
      console.error('❌ Error loading events:', err);
      // Keep UX neutral; avoid implying auth failure if backend is offline or CORS blocks
      setError('Failed to load events from API. Showing fallback events.');
      
      // Use fallback events
      const fallbackEvents = EventService.getFallbackEvents();
      console.log('📦 Using fallback events:', fallbackEvents.length, 'events');
      setAllEvents(fallbackEvents);
    } finally {
      setLoading(false);
    }
  };

  // Filter handlers
  const handleStateClick = (state) => {
    setSelectedStates(prevSelectedStates => {
      if (prevSelectedStates.includes(state)) {
        return prevSelectedStates.filter(s => s !== state);
      } else {
        return [...prevSelectedStates, state];
      }
    });
  };

  const handleCityClick = (city) => {
    setSelectedCities(prevSelectedCities => {
      if (prevSelectedCities.includes(city)) {
        return prevSelectedCities.filter(c => c !== city);
      } else {
        return [...prevSelectedCities, city];
      }
    });
  };

  const handleCategoryClick = (category) => {
    if (category === "All") {
      setSelectedCategories([]);
      return;
    }
    
    setSelectedCategories(prevCategories => {
      if (prevCategories.includes(category)) {
        return prevCategories.filter(c => c !== category);
      } else {
        return [...prevCategories, category];
      }
    });
  };

  const clearAllFilters = () => {
    setSelectedStates([]);
    setSelectedCities([]);
    setSelectedCategories([]);
    setSearchTerm('');
  };

  // Enhanced filtering logic
  const filteredEvents = allEvents.filter(event => {
    // Search term filter
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = 
        event.title?.toLowerCase().includes(searchLower) ||
        event.description?.toLowerCase().includes(searchLower) ||
        event.location?.toLowerCase().includes(searchLower);
      
      if (!matchesSearch) return false;
    }

    // If no filters selected, show all events
    if (selectedStates.length === 0 && selectedCities.length === 0 && selectedCategories.length === 0) {
      return true;
    }
    
    // Check filters
    const stateMatch = selectedStates.length === 0 || selectedStates.includes(event.state);
    const cityMatch = selectedCities.length === 0 || selectedCities.includes(event.city);
    const categoryMatch = selectedCategories.length === 0 || selectedCategories.includes(event.category);
    
    return stateMatch && cityMatch && categoryMatch;
  });

  if (loading) {
    return (
      <div className={isPortalView ? "portal-events-page" : "events"}>
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading events from 7+ sources...</p>
        </div>
      </div>
    );
  }

  // Debug information
  console.log('🎯 Events component render:', {
    loading,
    error,
    allEventsCount: allEvents.length,
    filteredEventsCount: filteredEvents.length,
    isPortalView,
    isLoggedIn
  });

  return (
    <div className={isPortalView ? "portal-events-page" : "events"}>
      <div className={isPortalView ? "portal-events-layout filters" : "filters"}>
        {/* Search Filter */}
        <div className="filter">
          <div className="filter-name">Search Events</div>
          <input
            type="text"
            className="search-input"
            placeholder="Search events..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Category Filter */}
        <div className="filter">
          <div className="filter-name">Category</div>
          <div className="options">
            {categories.map((category) => (
              <div
                key={category}
                className={`option ${
                  category === "All" 
                    ? (selectedCategories.length === 0 ? 'active' : '') 
                    : (selectedCategories.includes(category) ? 'active' : '')
                }`}
                onClick={() => handleCategoryClick(category)}
              >
                {category}
              </div>
            ))}
          </div>
        </div>

        {/* State Filter */}
        <div className="filter">
          <div className="filter-name">State</div>
          <div className="options">
            {states.map((state) => (
              <div
                key={state}
                className={`option ${selectedStates.includes(state) ? 'active' : ''}`}
                onClick={() => handleStateClick(state)}
              >
                {state}
              </div>
            ))}
          </div>
        </div>

        {/* City Filter */}
        <div className="filter">
          <div className="filter-name">Cities</div>
          <div className="options">
            {cities.map((city) => (
              <div
                key={city}
                className={`option ${selectedCities.includes(city) ? 'active' : ''}`}
                onClick={() => handleCityClick(city)}
              >
                {city}
              </div>
            ))}
          </div>
        </div>

        {/* Clear Filters */}
        {(selectedStates.length > 0 || selectedCities.length > 0 || selectedCategories.length > 0 || searchTerm.trim()) && (
          <div className="filter">
            <button className="clear-filters-btn" onClick={clearAllFilters}>
              Clear All Filters
            </button>
          </div>
        )}

        {/* Event Stats */}
        <div className="filter">
          <div className="event-stats">
            <p>Showing <strong>{filteredEvents.length}</strong> of <strong>{allEvents.length}</strong> events</p>
            {error && <p className="error-message">{error}</p>}
          </div>
        </div>
      </div>

      <div className="events-list">
        <div className="events-header">
          <h2>Startup & Tech Events</h2>
          <p>Discover events from 7+ premium sources including StartupIndia, Inc42, Eventbrite & more</p>
        </div>
        <EventCard events={filteredEvents} />
      </div>
    </div>
  );
};

export default Events;