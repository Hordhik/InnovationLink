import React from 'react'
import { Routes, Route } from 'react-router-dom';
import NavBar from './NavBar/NavBar';

// Create placeholder components for each route
const Home = () => <div>Home Page</div>;
const Blogs = () => <div>Blogs Page</div>;
const Events = () => <div>Events Page</div>;
const About = () => <div>About Page</div>;

function App() {
  return (
      <NavBar />
      // <Route path="/" element={<Home />} />
      // <Route path="/blogs" element={<Blogs />} />
      // <Route path="/events" element={<Events />} />
      // <Route path="/about" element={<About />} />
  )
}

export default App
