import React from 'react'
import './App.css';
import { Routes, Route } from 'react-router-dom';
import NavBar from './NavBar/NavBar';
import Home from './Home/Home';
import Events from './Events/Events';
import About from './AboutUs/AboutUs';
import Blogs from './Blogs/Blogs';
import Blog from './Blogs/Blog';

function App() {
  return (
      <>
        <NavBar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/blogs" element={<Blogs />} />
          <Route path="/blog/:id" element={<Blog />} />
          <Route path="/events" element={<Events />} />
          <Route path="/about" element={<About />} /> 
        </Routes>
      </>
  )
}

export default App;
