import React, { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom';
import './SideBar.css';
import home from '../assets/Portal/SideBar/home.svg';
import schedules from '../assets/Portal/SideBar/schedules.svg';
import inbox from '../assets/Portal/SideBar/inbox.svg';
import blogs from '../assets/Portal/SideBar/blogs.svg';
import events from '../assets/Portal/SideBar/events.svg';
import profile from '../assets/Portal/SideBar/profile.svg';
import home2 from '../assets/Portal/SideBar/home-2.svg';
import schedules2 from '../assets/Portal/SideBar/schedules-2.svg';
import inbox2 from '../assets/Portal/SideBar/inbox-2.svg';
import blogs2 from '../assets/Portal/SideBar/blogs-2.svg';
import events2 from '../assets/Portal/SideBar/events-2.svg';
import profile2 from '../assets/Portal/SideBar/profile-2.svg';
import folder_open from '../assets/Portal/SideBar/folder-open.svg';
import folder_close from '../assets/Portal/SideBar/folder-close.svg';
import notifications from '../assets/Portal/SideBar/notification.svg';
import support from '../assets/Portal/SideBar/ticket.svg';
import settings from '../assets/Portal/SideBar/setting.svg';

const SideBar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [hoveredItem, setHoveredItem] = useState(null);
  
  const projectItems = [
    { name: 'Project 1', path: '/project-1/home' },
    { name: 'Project 2', path: '/project-2/home' },
    { name: 'Project 3', path: '/project-3/home' },
  ]
  
  // Extract current project from URL (e.g., /project-1/home -> project-1)
  const currentProject = location.pathname.split('/')[1] || 'project-1';

  const mainItems = [
    { name: 'Home', img1: home,img2: home2, path: `/${currentProject}/home` },
    { name: 'Schedules', img1: schedules,img2: schedules2, path: `/${currentProject}/schedules` },
    { name: 'Inbox', img1: inbox,img2: inbox2, path: `/${currentProject}/inbox` },
    { name: 'Blogs', img1: blogs,img2: blogs2, path: `/${currentProject}/blogs` },
    { name: 'Events', img1: events,img2: events2, path: `/${currentProject}/events` },
    { name: 'Profile', img1: profile,img2: profile2, path: `/${currentProject}/profile` },
  ]

  const essentialItems = [
    { name: 'Notifications', img: notifications, path: `/${currentProject}/notifications` },
    { name: 'Support Tickets', img: support, path: `/${currentProject}/support-tickets` },
    { name: 'Settings', img: settings, path: `/${currentProject}/settings` },
  ]

  const handleItemClick = (path) => {
    navigate(path);
  };

  const handleMouseEnter = (itemName) => {
    setHoveredItem(itemName);
  };

  const handleMouseLeave = () => {
    setHoveredItem(null);
  };

  return (
    <div className='sidebar'>
      <div className="main-project">
        <div className="main">
          <p>MAIN</p>
          <div className="main-items">
            {mainItems.map((item) => {
              const isActive = location.pathname === item.path;
              const isHovered = hoveredItem === item.name;
              const shouldShowImg2 = isActive || isHovered;
              
              return (
                <div 
                  className={`main-item ${isActive ? 'active' : ''}`} 
                  key={item.name}
                  onClick={() => handleItemClick(item.path)}
                  onMouseEnter={() => handleMouseEnter(item.name)}
                  onMouseLeave={handleMouseLeave}
                  style={{ cursor: 'pointer' }}
                >
                  <img src={shouldShowImg2 ? item.img2 : item.img1} alt={item.name} />
                  <p>{item.name}</p>
                </div>
              );
            })}
          </div>
        </div>
        <div className="projects">
          <p>PROJECTS</p>
          <div className="project-items">
            {projectItems.map((item) => {
              const isCurrentProject = currentProject === item.path.split('/')[1];
              
              return (
                <div 
                  className={`project-item ${isCurrentProject ? 'active' : ''}`} 
                  key={item.name}
                  onClick={() => handleItemClick(item.path)}
                  style={{ cursor: 'pointer' }}
                >
                  <img src={isCurrentProject ? folder_open : folder_close} alt="" />
                  <p>{item.name}</p>
                </div>
              );
            })}
          </div>
        </div> 
      </div>
      <div className="essentials">
        <p>ESSENTIALS</p>
        <div className="essential-items">
          {essentialItems.map((item) => {
            const isActive = location.pathname === item.path;
            
            return (
              <div 
                className={`essential-item ${isActive ? 'active' : ''}`} 
                key={item.name}
                onClick={() => handleItemClick(item.path)}
                style={{ cursor: 'pointer' }}
              >
                <img src={item.img} alt="" />
                <p>{item.name}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  )
}

export default SideBar