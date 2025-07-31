import React from 'react'
import './App.css';
import { Routes, Route, useLocation } from 'react-router-dom';
import NavBar from './Website/NavBar/NavBar';
import Home from './Website/Home/Home';
import Events from './Website/Events/Events';
import About from './Website/AboutUs/AboutUs';
import Blogs from './Website/Blogs/Blogs';
import Blog from './Website/Blogs/Blog';
import LogIn from './Authentication/LogIn';
import SignUp from './Authentication/SignUp';
import Portal from './Portal/Portal';

function App() {
  const location = useLocation();
  
  // Define routes where navbar should be hidden
  const hideNavbarRoutes = ['/login', '/signup', '/portal/home'];
  const shouldHideNavbar = hideNavbarRoutes.includes(location.pathname);

  return (
      <>
        {!shouldHideNavbar && <NavBar />}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/blogs" element={<Blogs />} />
          <Route path="/blog/:id" element={<Blog />} />
          <Route path="/events" element={<Events />} />
          <Route path="/about" element={<About />} /> 
          <Route path="/login" element={<LogIn />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/portal/home" element={<Portal />} />
        </Routes>
      </>
  )
}

export default App;
