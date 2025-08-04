import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom';
import TopBar from './TopBar';
import SideBar from './SideBar';
import './Portal.css';
import Home from './Home/Home';
import Blogs from '../Website/Blogs/Blogs';
import Blog from '../Website/Blogs/Blog';
import Events from '../Website/Events/Events';
import Inbox from './Inbox/Inbox';
import Schedule from './Schedule/Schedule';
import { getDefaultProject } from './projectsConfig';

function Portal() {
  const defaultProject = getDefaultProject();
  
  return (
    <div className='portal-container'>
        <TopBar />
        <div className='portal-content'>
            <SideBar />
            <div className='portal-main-content'>
                <Routes>
                    <Route path="/" element={<Navigate to={`/${defaultProject}/home`} replace />} />
                    <Route path="/home" element={<Home />} />
                    <Route path="/schedules" element={<div>Schedules Content</div>} />
                    <Route path="/inbox" element={<Inbox />} />
                    <Route path="/blogs" element={<Blogs />} />
                    <Route path="/blog/:id" element={<Blog />} />
                    <Route path="/events" element={<Events />} />
                    <Route path="/profile" element={<div>Profile Content</div>} />
                    <Route path="/notifications" element={<div>Notifications Content</div>} />
                    <Route path="/support-tickets" element={<div>Support Tickets Content</div>} />
                    <Route path="/settings" element={<div>Settings Content</div>} />
                </Routes>
            </div>
        </div>
    </div>
  )
}

export default Portal