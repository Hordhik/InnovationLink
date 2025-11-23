import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import React from 'react'; // No longer need useState
import TopBar from './TopBar';
import SideBar from './SideBar';
import './Portal.css';
import Home from './Home/Home';
// StartupHome and InvestorHome are rendered by Home.jsx, not directly here
// import StartupHome from './Home/StartupHome'; 
// import InvestorHome from './Home/InvestorHome';
import InvestorProfile from './Profile/InvestorProfile/InvestorProfile';
import StartupProfile from './Profile/StartupProfile/StartupProfile';
import Blogs from '../Website/Blogs/Blogs';
import Blog from '../Website/Blogs/Blog';
import Events from '../Website/Events/Events';
import Inbox from './Inbox/Inbox';
import Schedule from './Schedule/Schedule';
import PublicStartupProfile from './Profile/StartupProfile/PublicStartupProfile';
import PublicInvestorProfile from './Profile/InvestorProfile/PublicInvestorProfile';
// PublicStartupDock is imported by PublicStartupProfile, not routed directly
// import PublicStartupDock from './Profile/StartupProfile/PublicStartupDock';
import Notifications from './Notifications/Notifications'; // Corrected import path
import AddBlog from '../Website/Blogs/AddBlog'; // <-- IMPORTED AddBlog
import InvestorConnections from './Profile/InvestorProfile/MyConnections';
import StartupConnections from './Profile/StartupProfile/MyConnections';


function Portal() {
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
            <Route index element={<Navigate to={`home`} replace />} />
            <Route path="home" element={<Home />} />
            <Route path="schedules" element={<Schedule />} />
            <Route path="inbox" element={<Inbox />} />
            <Route path="blogs" element={<Blogs />} />
            <Route path="blog/:id" element={<Blog />} />

            {/* --- ADDED ROUTE --- */}
            <Route path="blogs/new" element={<AddBlog />} />

            <Route path="events" element={<Events />} />

            {/* This route shows the user's OWN profile */}
            <Route path="profile" element={userType === 'I' ? <InvestorProfile /> : <StartupProfile />} />

            {/* Connections page - shows investor connections for I, startup connections for S */}
            <Route path="connections" element={userType === 'I' ? <InvestorConnections /> : <StartupConnections />} />

            {/* --- ADDED ROUTE --- */}
            {/* This route is for an INVESTOR to view a STARTUP's profile */}
            {/* It will match URLs like /I/startup/startup-username */}
            <Route path="/home/startup/:username" element={<PublicStartupProfile />} />
            <Route path="home/investor/:username" element={<PublicInvestorProfile />} />

            {/* This empty route seems intentional from your file */}
            <Route path="" />

            <Route path="support-tickets" element={<div>Support Tickets Content</div>} />
            <Route path="settings" element={<div>Settings Content</div>} />
          </Routes>

          {/* MODAL ROUTE: Renders *only* if backgroundLocation is set */}
          {backgroundLocation && (
            <Routes>
              <Route path="notifications" element={<Notifications />} />
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

