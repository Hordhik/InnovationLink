import { useNavigate, useLocation, Link } from 'react-router-dom';
import './SideBar.css';
import React, { useState } from 'react';
import { getDefaultProject } from './projectsConfig';
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
import notifications from '../assets/Portal/SideBar/notification.svg';
import support from '../assets/Portal/SideBar/ticket.svg';
import settings from '../assets/Portal/SideBar/setting.svg';

const SideBar = () => {
  const navigate = useNavigate();
  const location = useLocation(); // Already here, which is perfect
  const [hoveredItem, setHoveredItem] = useState(null);
  
  // Extract userType and project from URL (e.g., /S/handbook/home -> S, handbook)
  const [userType, currentProject] = location.pathname.split('/').slice(1, 3);
  const safeUserType = userType || 'S';
  const safeProject = currentProject || getDefaultProject();

  const mainItems = [
    { name: 'Home', img1: home,img2: home2, path: `/${safeUserType}/${safeProject}/home` },
    { name: 'Schedules', img1: schedules,img2: schedules2, path: `/${safeUserType}/${safeProject}/schedules` },
    { name: 'Inbox', img1: inbox,img2: inbox2, path: `/${safeUserType}/${safeProject}/inbox` },
    { name: 'Blogs', img1: blogs,img2: blogs2, path: `/${safeUserType}/${safeProject}/blogs` },
    { name: 'Events', img1: events,img2: events2, path: `/${safeUserType}/${safeProject}/events` },
    { name: 'Profile', img1: profile,img2: profile2, path: `/${safeUserType}/${safeProject}/profile` },
  ];

  const essentialItems = [
    // Your paths are already dynamic, which is great
    { name: 'Notifications', img: notifications, path: `/${safeUserType}/${safeProject}/notifications` },
    { name: 'Support Tickets', img: support, path: `/${safeUserType}/${safeProject}/support-tickets` },
    { name: 'Settings', img: settings, path: `/${safeUserType}/${safeProject}/settings` },
  ];

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
      </div>
      <div className="essentials">
        <p>ESSENTIALS</p>
        <div className="essential-items">
          {essentialItems.map((item) => {
            const isActive = location.pathname === item.path;
            
            // --- This is the new logic ---
            // If it's the Notifications item, handle toggle behavior
            if (item.name === 'Notifications') {
              const handleNotificationClick = (e) => {
                e.preventDefault();
                // If notifications are already open, trigger close animation
                if (isActive) {
                  // Dispatch custom event to trigger the closing animation
                  window.dispatchEvent(new CustomEvent('closeNotifications'));
                } else {
                  // Otherwise, open notifications with background location
                  navigate(item.path, { state: { backgroundLocation: location } });
                }
              };

              return (
                <div
                  key={item.name}
                  className={`essential-item ${isActive ? 'active' : ''}`}
                  onClick={handleNotificationClick}
                  style={{ cursor: 'pointer' }}
                >
                  <img src={item.img} alt={item.name} />
                  <p>{item.name}</p>
                </div>
              );
            }

            // Otherwise (for Support Tickets, Settings), render the normal div
            return (
              <div 
                className={`essential-item ${isActive ? 'active' : ''}`} 
                key={item.name}
                onClick={() => handleItemClick(item.path)}
                style={{ cursor: 'pointer' }}
              >
                <img src={item.img} alt={item.name} />
                <p>{item.name}</p>
              </div>
            );
            // --- End of new logic ---
          })}
        </div>
      </div>
    </div>
  )
}

export default SideBar