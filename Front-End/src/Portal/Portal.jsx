import React from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import TopBar from './TopBar';
import SideBar from './SideBar';
import './Portal.css';

function Portal() {
  const location = useLocation();
  
  // Extract project name from URL (e.g., /project-1/home -> project-1)
  const projectName = location.pathname.split('/')[1] || 'project-1';
  
  return (
    <div className='portal-container'>
        <TopBar />
        <div className='portal-content'>
            <SideBar />
            <div className='portal-main-content'>
                <Routes>
                    <Route path="/" element={<Navigate to={`/${projectName}/home`} replace />} />
                    <Route path="/home" element={<div>Home Content</div>} />
                    <Route path="/schedules" element={<div>Schedules Content</div>} />
                    <Route path="/inbox" element={<div>Inbox Content</div>} />
                    <Route path="/blogs" element={<div>Project Blogs Content</div>} />
                    <Route path="/events" element={<div>Project Events Content</div>} />
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