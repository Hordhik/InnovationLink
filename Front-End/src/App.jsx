import React from 'react'
import './App.css';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import NavBar from './Website/NavBar/NavBar';
import Home from './Website/Home/Home';
import Events from './Website/Events/Events';
import About from './Website/AboutUs/AboutUs';
import Blogs from './Website/Blogs/Blogs';
import Blog from './Website/Blogs/Blog';
import LogIn from './Authentication/LogIn';
import SignUp from './Authentication/SignUp';
import Portal from './Portal/Portal';
import { projects, nameToUrl } from './Portal/projectsConfig';

function App() {
  const location = useLocation();

  // Define routes where navbar should be shown (website routes)
  const showNavbarRoutes = ["/home", "/blogs", "/events", "/about"];
  const shouldShowNavbar = showNavbarRoutes.some(route => location.pathname === route) || 
                           location.pathname.startsWith('/blog/'); // Show navbar on blog detail pages

  return (
      <>
        {shouldShowNavbar && <NavBar />}
        <Routes>
          {/* Website Routes */}
          <Route path="/" element={<Navigate to="/home" replace />} />
          <Route path="/home" element={<Home />} />
          <Route path="/blogs" element={<Blogs />} />
          <Route path="/blog/:id" element={<Blog />} />
          <Route path="/events" element={<Events />} />
          <Route path="/about" element={<About />} />

          {/* Authentication Routes */}
          <Route path="/auth/login" element={<LogIn />} />
          <Route path="/auth/signup" element={<SignUp />} />
          
          {/* Legacy auth routes - redirect to new structure */}
          {/* <Route path="/login" element={<LogIn />} />
          <Route path="/signup" element={<SignUp />} /> */}
          
          {/* Project Routes - Dynamically generated from projectsConfig */}
          {projects.map((project) => (
            <Route 
              key={project.name} 
              path={`/:userType/${nameToUrl(project.name)}/*`} 
              element={<Portal />} 
            />
          ))}
        </Routes>
      </>
  )
}

export default App;
