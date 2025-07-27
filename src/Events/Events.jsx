import React, { useState } from 'react';
import './Events.css';
import EventCard from './EventCard';

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
  // State to track the selected filter
  const [selectedState, setSelectedState] = useState("Andhra Pradesh");
  const [selectedCity, setSelectedCity] = useState(null);

  // Function to handle clicking a state option
  const handleStateClick = (state) => {
    // If the clicked state is already selected, unselect it. Otherwise, select it.
    setSelectedState(prevSelectedState => prevSelectedState === state ? null : state);
  };

  // Function to handle clicking a city option
  const handleCityClick = (city) => {
    setSelectedCity(prevSelectedCity => prevSelectedCity === city ? null : city);
  };

  // Filter events based on selected state and city
  const filteredEvents = allEvents.filter(event => {
    const stateMatch = !selectedState || event.state === selectedState;
    const cityMatch = !selectedCity || event.city === selectedCity;
    return stateMatch && cityMatch;
  });

  return (
    <div className="events">
      <div className="filters">
        {/* State Filter */}
        <div className="filter">
          <div className="filter-name">State</div>
          <div className="options">
            {states.map((state) => (
              <div
                key={state}
                className={`option ${selectedState === state ? 'active' : ''}`}
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
                className={`option ${selectedCity === city ? 'active' : ''}`}
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