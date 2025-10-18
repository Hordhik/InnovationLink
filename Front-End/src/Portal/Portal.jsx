import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import React from 'react'; // No longer need useState
import TopBar from './TopBar';
import SideBar from './SideBar';
import './Portal.css';
import Home from './Home/Home';
import StartupHome from './Home/StartupHome';
import InvestorHome from './Home/InvestorHome';
import StartupProfile from './Profile/StartupProfile';
import InvestorProfile from './Profile/InvestorProfile';
import Blogs from '../Website/Blogs/Blogs';
import Blog from '../Website/Blogs/Blog';
import Events from '../Website/Events/Events';
import Inbox from './Inbox/Inbox';
import Schedule from './Schedule/Schedule';
import { getDefaultProject } from './projectsConfig';
import Notifications from './Notifications/Notifications'; // Corrected import path

function Portal() {
  const defaultProject = getDefaultProject();
  const userType = window.location.pathname.split('/')[1] || 'S';
  
  const location = useLocation();
  // This line is the key: it checks if we're opening a modal.
  // If we are, it tells the main <Routes> to keep rendering the
  // page we were just on (the "background").
  const backgroundLocation = location.state?.backgroundLocation;

  return (
    <div className='portal-container'>
      <TopBar />
      <div className='portal-content'>
        {/* You must pass the function to open notifications 
          down to your SideBar.
        */}
        <SideBar />
        <div className='portal-main-content'>
          {/* MAIN ROUTES: Renders the background page */}
          <Routes location={backgroundLocation || location}>
            <Route path="/" element={<Navigate to={`/${defaultProject}/home`} replace />} />
            <Route path="/home" element={<Home />} />
            <Route path="/schedules" element={<Schedule/>} />
            <Route path="/inbox" element={<Inbox />} />
            <Route path="/blogs" element={<Blogs />} />
            <Route path="/blog/:id" element={<Blog />} />
            <Route path="handbook/blogs" element={<Blogs />} />
            <Route path="handbook/blog/:id" element={<Blog />} />
            <Route path="/events" element={<Events />} />
            <Route path="/profile" element={userType === 'I' ? <InvestorProfile /> : <StartupProfile />} />
            {/* This route is no longer needed here.
              <Route path="/notifications" element={<Notifications onClose={() => setNotificationsOpen(false)} />} /> 
            */}
            <Route path="/support-tickets" element={<div>Support Tickets Content</div>} />
            <Route path="/settings" element={<div>Settings Content</div>} />
          </Routes>

          {/* MODAL ROUTE: Renders *only* if backgroundLocation is set */}
          {backgroundLocation && (
            <Routes>
              <Route path="/notifications" element={<Notifications />} />
            </Routes>
          )}

          {/* This was the line causing your layout bug. Remove it.
            <Notifications /> 
          */}
        </div>
      </div>
    </div>
  );
}

export default Portal;