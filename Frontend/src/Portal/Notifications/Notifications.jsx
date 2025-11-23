import React, { useState, useEffect } from 'react';
import './Notifications.css'; // Make sure this CSS file exists
import { FiX, FiBell, FiCalendar, FiUserCheck, FiMessageSquare, FiSettings, FiCheck, FiCircle, FiCheckCircle, FiXCircle } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import { getNotifications, markNotificationAsRead, acceptConnectionRequest, rejectConnectionRequest } from '../../services/connectionApi';

// Renamed to 'Notifications' and removed the 'onClose' prop
const Notifications = () => {
  const [activeTab, setActiveTab] = useState('All'); // 'All' or 'Unread'
  const [notifications, setNotifications] = useState([]);
  const [isClosing, setIsClosing] = useState(false);
  const navigate = useNavigate(); // Get the navigate function

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const data = await getNotifications();
      const mapped = data.map(n => ({
        id: n.id,
        read: !!n.is_read,
        icon: getIconForType(n.type),
        text: n.message,
        time: new Date(n.created_at).toLocaleDateString(),
        link: getLinkForType(n.type),
        type: n.type,
        senderId: n.sender_id // Store sender_id for actions
      }));
      setNotifications(mapped);
    } catch (error) {
      console.error("Failed to fetch notifications", error);
    }
  };

  const handleAccept = async (e, notif) => {
    e.stopPropagation();
    console.log("Attempting to accept notification:", notif);

    if (!notif.senderId) {
      console.error("Missing senderId in notification:", notif);
      alert("Error: Cannot accept request (missing sender information)");
      return;
    }

    try {
      await acceptConnectionRequest(null, notif.senderId);
      // Mark as read and update UI
      await toggleNotificationRead(notif.id);
      // Optionally refresh notifications or show success
      alert("Connection accepted!");
      fetchData();
    } catch (err) {
      console.error("Failed to accept:", err);
      if (err.response && err.response.status === 404) {
        console.error("Debug Info:", err.response.data);
        alert("Request not found. Check console for details.");
      } else {
        alert("Failed to accept request");
      }
    }
  };

  const handleReject = async (e, notif) => {
    e.stopPropagation();
    if (!notif.senderId) {
      console.error("Missing senderId in notification:", notif);
      alert("Error: Cannot reject request (missing sender information)");
      return;
    }

    try {
      await rejectConnectionRequest(null, notif.senderId);
      await toggleNotificationRead(notif.id);
      alert("Connection rejected.");
      fetchData();
    } catch (err) {
      console.error("Failed to reject:", err);
      alert("Failed to reject request");
    }
  };

  const getIconForType = (type) => {
    switch (type) {
      case 'connection_request': return <FiUserCheck />;
      case 'connection_accepted': return <FiUserCheck />;
      default: return <FiBell />;
    }
  };

  const getLinkForType = (type) => {
    const portalPrefix = `/${(window.location.pathname.split("/")[1] || "S")}`;
    switch (type) {
      case 'connection_request': return `${portalPrefix}/profile#connections`;
      case 'connection_accepted': return `${portalPrefix}/profile#connections`;
      default: return `${portalPrefix}/home`;
    }
  };

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
  const handleMarkAllAsRead = async () => {
    // Optimistic update
    setNotifications(notifications.map(notif => ({ ...notif, read: true })));
    // TODO: Implement bulk mark read API
    for (const n of notifications) {
      if (!n.read) await markNotificationAsRead(n.id);
    }
  };

  // Function to toggle read/unread status of a single notification
  const toggleNotificationRead = async (id) => {
    try {
      await markNotificationAsRead(id);
      setNotifications(notifications.map(notif =>
        notif.id === id ? { ...notif, read: true } : notif
      ));
    } catch (error) {
      console.error("Failed to mark read", error);
    }
  };

  // Function to mark a notification as read when clicked
  const handleNotificationClick = async (id, link) => {
    // Mark as read
    await toggleNotificationRead(id);
    // Navigate to the link
    if (link) {
      navigate(link);
    }
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
                    {notif.type === 'connection_request' && (
                      <div className="notification-actions" style={{ marginTop: '8px', display: 'flex', gap: '8px' }}>
                        <button
                          onClick={(e) => handleAccept(e, notif)}
                          className="notification-action-btn accept"
                        >
                          Accept
                        </button>
                        <button
                          onClick={(e) => handleReject(e, notif)}
                          className="notification-action-btn reject"
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                </div>

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