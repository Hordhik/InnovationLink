import React, { useState } from 'react';
import './Notifications.css'; // Make sure this CSS file exists
import { FiX, FiBell, FiCalendar, FiUserCheck, FiMessageSquare, FiSettings, FiCheck, FiCircle, FiCheckCircle, FiXCircle } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom'; // Import useNavigate

// --- Initial Mock Data ---
const initialNotifications = [
  {
    id: 1,
    read: false,
    icon: <FiCalendar />,
    text: 'New meeting request from TechGrowth.',
    time: '5m ago',
    link: '/schedules'
  },
  {
    id: 2,
    read: false,
    icon: <FiUserCheck />,
    text: 'MentorConnect accepted your connection request.',
    time: '1h ago',
    link: '/profile/connections'
  },
  {
    id: 3,
    read: true,
    icon: <FiMessageSquare />,
    text: 'You have 2 new messages in your inbox.',
    time: 'Yesterday',
    link: '/inbox'
  },
  {
    id: 4,
    read: true,
    icon: <FiSettings />,
    text: 'Your profile has been verified successfully.',
    time: '2 days ago',
    link: '/profile'
  },
  {
    id: 5,
    read: false,
    icon: <FiUserCheck />,
    text: 'Innovation Link sent you a mentor request.',
    time: '1h ago',
    link: '/profile/connections',
    type: 'mentor_request',
    status: null
  }
];
// -----------------

// Renamed to 'Notifications' and removed the 'onClose' prop
const Notifications = () => {
  const [activeTab, setActiveTab] = useState('All'); // 'All' or 'Unread'
  const [notifications, setNotifications] = useState(initialNotifications);
  const [isClosing, setIsClosing] = useState(false);
  const navigate = useNavigate(); // Get the navigate function

  // Function to close the modal with animation
  const handleClose = React.useCallback(() => {
    setIsClosing(true);
    setTimeout(() => {
      navigate(-1); // Go back one step in history
    }, 300); // Match animation duration
  }, [navigate]);

  // Listen for custom close event from outside (e.g., SideBar click)
  React.useEffect(() => {
    const handleExternalClose = () => {
      handleClose();
    };
    window.addEventListener('closeNotifications', handleExternalClose);
    return () => {
      window.removeEventListener('closeNotifications', handleExternalClose);
    };
  }, [handleClose]);

  // Function to mark all notifications as read
  const handleMarkAllAsRead = () => {
    setNotifications(notifications.map(notif => ({ ...notif, read: true })));
  };

  // Function to toggle read/unread status of a single notification
  const toggleNotificationRead = (id) => {
    setNotifications(notifications.map(notif => 
      notif.id === id ? { ...notif, read: !notif.read } : notif
    ));
  };

  // Function to mark a notification as read when clicked
  const handleNotificationClick = (id, link) => {
    // Mark as read
    setNotifications(notifications.map(notif => 
      notif.id === id ? { ...notif, read: true } : notif
    ));
    // Navigate to the link
    if (link) {
      navigate(link);
    }
  };

  // Function to accept a mentor request
  const handleMentorAccept = (id, e) => {
    e.stopPropagation();
    // Update the notification status to accepted
    setNotifications(notifications.map(notif => 
      notif.id === id ? { ...notif, status: 'Accepted' } : notif
    ));
    // Add your API call here to accept the mentor request
    console.log(`Mentor request ${id} accepted`);
  };

  // Function to reject a mentor request
  const handleMentorReject = (id, e) => {
    e.stopPropagation();
    // Update the notification status to rejected
    setNotifications(notifications.map(notif => 
      notif.id === id ? { ...notif, status: 'Rejected' } : notif
    ));
    // Add your API call here to reject the mentor request
    console.log(`Mentor request ${id} rejected`);
  };

  // Filter notifications based on the active tab
  const filteredNotifications = activeTab === 'Unread'
    ? notifications.filter(notif => !notif.read)
    : notifications;

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    // Add onClick to the overlay to close it
    <div className="notification-panel-overlay" onClick={handleClose}>
      {/* Add onClick with stopPropagation to prevent clicks inside from closing */}
      <div className={`notification-panel ${isClosing ? 'closing' : ''}`} onClick={(e) => e.stopPropagation()}>
        
        {/* 1. Header */}
        <div className="notification-header">
          <h3>Notifications</h3>
          {unreadCount > 0 && (
            <button className="mark-all-read-btn" onClick={handleMarkAllAsRead}>Mark all as read</button>
          )}
          {/* Use handleClose for the close button */}
          <button onClick={handleClose} className="close-btn">
            <FiX size={20} />
          </button>
        </div>

        {/* 2. Tabs (Full content from first file) */}
        <div className="notification-tabs">
          <button
            className={`tab-btn ${activeTab === 'All' ? 'active' : ''}`}
            onClick={() => setActiveTab('All')}
          >
            All
          </button>
          <button
            className={`tab-btn ${activeTab === 'Unread' ? 'active' : ''}`}
            onClick={() => setActiveTab('Unread')}
          >
            Unread {unreadCount > 0 && `(${unreadCount})`}
          </button>
        </div>

        {/* 3. Notification List (Full content from first file) */}
        <div className="notification-list">
          {filteredNotifications.length > 0 ? (
            filteredNotifications.map((notif) => (
              <div key={notif.id} className="notification-item-wrapper">
                {notif.type === 'mentor_request' ? (
                  <div 
                    className="notification-item"
                    onClick={() => handleNotificationClick(notif.id, notif.link)}
                  >
                    {!notif.read && <div className="unread-dot"></div>}
                    <div className="notification-icon">
                      {notif.icon}
                    </div>
                    <div className="notification-content">
                      <p className="notification-text">
                        {notif.text}
                        {notif.status && (
                          <span className={`status-badge ${notif.status.toLowerCase()}`}>
                            ({notif.status})
                          </span>
                        )}
                      </p>
                      <p className="notification-time">{notif.time}</p>
                    </div>
                  </div>
                ) : (
                  <div 
                    className="notification-item"
                    onClick={() => handleNotificationClick(notif.id, notif.link)}
                  >
                    {!notif.read && <div className="unread-dot"></div>}
                    <div className="notification-icon">
                      {notif.icon}
                    </div>
                    <div className="notification-content">
                      <p className="notification-text">{notif.text}</p>
                      <p className="notification-time">{notif.time}</p>
                    </div>
                  </div>
                )}
                
                {/* Show action buttons for mentor requests */}
                {notif.type === 'mentor_request' ? (
                  <>
                    {!notif.status && (
                      <div className="notification-actions">
                        <button
                          className="notification-action-btn accept"
                          onClick={(e) => handleMentorAccept(notif.id, e)}
                          title="Accept mentor request"
                        >
                          <FiCheckCircle size={18} />
                        </button>
                        <button
                          className="notification-action-btn reject"
                          onClick={(e) => handleMentorReject(notif.id, e)}
                          title="Reject mentor request"
                        >
                          <FiXCircle size={18} />
                        </button>
                      </div>
                    )}
                  </>
                ) : (
                  <button
                    className="notification-read-toggle"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleNotificationRead(notif.id);
                    }}
                    title={notif.read ? "Mark as unread" : "Mark as read"}
                  >
                    {notif.read ? <FiCircle size={16} /> : <FiCheck size={16} />}
                  </button>
                )}
              </div>
            ))
          ) : (
            /* 4. Empty State */
            <div className="notification-empty">
              <FiBell size={48} />
              <h4>You're all caught up!</h4>
              <p>No new notifications right now.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Notifications;