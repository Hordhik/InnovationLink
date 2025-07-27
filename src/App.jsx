import React from 'react'
import { Routes, Route } from 'react-router-dom';
import NavBar from './NavBar/NavBar';
import AboutUs from './AboutUs/AboutUs';

const Home = () => <div>Home Page</div>;
const Blogs = () => <div>Blogs Page</div>;
const Events = () => <div>Events Page</div>;

function App() {
  return (
    <>
      <NavBar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/blogs" element={<Blogs />} />
        <Route path="/events" element={<Events />} />
        <Route path="/about" element={<AboutUs />} />
      </Routes>
    </>
  );
}

export default App;
