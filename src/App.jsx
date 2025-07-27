import React from 'react'
import { Routes, Route } from 'react-router-dom';
import NavBar from './NavBar/NavBar';
import Home from './Home/Home';
import Events from './Events/Events';

function App() {
  return (
      <>
        <NavBar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/events" element={<Events />} />
          {/* <Route path="/blogs" element={<Blogs />} />
          <Route path="/about" element={<About />} /> */}
        </Routes>
      </>
  )
}

export default App;
