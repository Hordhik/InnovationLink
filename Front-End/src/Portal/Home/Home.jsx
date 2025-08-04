import React from 'react';
import AdvancedSearch from './AdvancedSearch';
import StartupCard from './StartupCard';
import './Home.css';

const Home = () => {
  return (
    <div className="home-container">
      <AdvancedSearch />
      <StartupCard />
      <StartupCard />
    </div>
  );
};

export default Home;