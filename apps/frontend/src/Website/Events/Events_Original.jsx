import React, { useState } from 'react';
import './Events.css';
import EventCard from './EventCard';
import { useLocation } from 'react-router-dom';

// Data for the filters
const states = [
  "Andhra Pradesh", "Karnataka", "Telangana", "Tamil Nadu", 
  "Madhya Pradesh", "Maharashtra", "Gujarat", "Rajasthan"
];

const cities = [
  "New Delhi", "Bengaluru", "Mumbai", "Kochi", 
  "Anantapur", "Vizianagaram", "Amaravati", "Chennai", "Hyderabad"
];

// Event data with state and city information
const allEvents = [
  {
    title: "Startup Mahakumbh 5.0",
    date: "March 26, 2025",
    location: "Bharat Mandapam, New Delhi",
    state: "Madhya Pradesh",
    city: "New Delhi",
    description: "One of India's most prestigious startup events, organized by AICRA, bringing together startups, investors, and industry leaders to foster innovation and growth. This expo is a game-changer, showcasing over 350 cutting-edge startups fostering advancements across multiple sectors, including Smart Cities (ICT), Telecom, Fintech, AI, IoT, and EmbeddedTech.",
    logo: "Mahakumbh"
  },
  {
    title: "Inspire India 2025",
    date: "November 19, 2025",
    location: "Bharat Mandapam, New Delhi",
    state: "Madhya Pradesh",
    city: "New Delhi",
    description: "Touted as one of the world's largest tech events, Inspire India 2025 expects over 150,000 attendees, 5,100+ startups, and leaders from 105+ countries.",
    logo: "inspireIndia"
  },
  {
    title: "Bengaluru Tech Summit 2025",
    date: "March 26, 2025",
    location: "Bengaluru, India",
    state: "Karnataka",
    city: "Bengaluru",
    description: "Touted as one of the world's largest tech events, Inspire India 2025 expects over 150,000 attendees, 5,100+ startups, and leaders from 105+ countries.",
    logo: "bengaluruTechSumit"
  },
];

const Events = () => {
  // State to track the selected filters (now arrays for multiple selections)
  const [selectedStates, setSelectedStates] = useState([]);
  const [selectedCities, setSelectedCities] = useState([]);
  const location = useLocation();
  
  // Check if we're in any portal view (any project)
  // More robust detection: check if URL has format /{project}/events
  const pathParts = location.pathname.split('/');
  const isPortalView = pathParts.length >= 3 && pathParts[2] === 'events' && pathParts[1] !== 'events';

  // Function to handle clicking a state option
  const handleStateClick = (state) => {
    setSelectedStates(prevSelectedStates => {
      // If the state is already selected, remove it from the array
      if (prevSelectedStates.includes(state)) {
        return prevSelectedStates.filter(s => s !== state);
      } else {
        // If the state is not selected, add it to the array
        return [...prevSelectedStates, state];
      }
    });
  };

  // Function to handle clicking a city option
  const handleCityClick = (city) => {
    setSelectedCities(prevSelectedCities => {
      // If the city is already selected, remove it from the array
      if (prevSelectedCities.includes(city)) {
        return prevSelectedCities.filter(c => c !== city);
      } else {
        // If the city is not selected, add it to the array
        return [...prevSelectedCities, city];
      }
    });
  };

  // Filter events based on selected states and cities (OR logic)
  const filteredEvents = allEvents.filter(event => {
    // If no filters are selected, show all events
    if (selectedStates.length === 0 && selectedCities.length === 0) {
      return true;
    }
    
    // Check if event matches any selected state OR any selected city
    const stateMatch = selectedStates.length > 0 && selectedStates.includes(event.state);
    const cityMatch = selectedCities.length > 0 && selectedCities.includes(event.city);
    
    // Return true if event matches either state OR city selection
    return stateMatch || cityMatch;
  });

  return (
    <div className={isPortalView ? "portal-events-page" : "events"}>
      <div className={isPortalView ? "portal-events-layout filters" : "filters"}>
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
      </div>

      <div className="events-list">
        <EventCard events={filteredEvents} />
      </div>
    </div>
  );
};

export default Events;