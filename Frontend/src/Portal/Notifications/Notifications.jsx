import React, { useState, useEffect } from 'react';
import './Notifications.css'; // Make sure this CSS file exists
import { FiX, FiBell, FiCalendar, FiUserCheck, FiMessageSquare, FiSettings, FiCheck, FiCircle, FiCheckCircle, FiXCircle } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import { getNotifications, markNotificationAsRead, markNotificationAsUnread, acceptConnectionRequest, rejectConnectionRequest } from '../../services/connectionApi';
import { showSuccess, showError } from '../../utils/toast';

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
        time: n.created_at ? new Date(n.created_at).toLocaleString() : '',
        createdAtMs: n.created_at ? new Date(n.created_at).getTime() : 0,
        link: getLinkForType(n.type, n.sender_username, n.sender_userType),
        type: n.type,
        senderId: n.sender_id,
        connectionId: n.connection_id,
        isActive: n.is_active,
        connectionState: n.connection_state,
        senderUsername: n.sender_username,
        senderUserType: n.sender_userType,
        senderDisplayName: n.sender_display_name,
        connectionStatus: n.connection_status
      }));

      // Only the latest request from a sender should be actionable.
      // This prevents older notifications from showing buttons after re-request.
      const latestRequestBySender = new Map();
      for (const n of mapped) {
        if (n.type !== 'connection_request') continue;
        if (!n.senderId) continue;

        const prev = latestRequestBySender.get(n.senderId);
        if (!prev) {
          latestRequestBySender.set(n.senderId, { createdAtMs: n.createdAtMs, id: n.id });
          continue;
        }

        if (n.createdAtMs > prev.createdAtMs || (n.createdAtMs === prev.createdAtMs && n.id > prev.id)) {
          latestRequestBySender.set(n.senderId, { createdAtMs: n.createdAtMs, id: n.id });
        }
      }

      const finalMapped = mapped.map(n => {
        const latest = n.senderId ? latestRequestBySender.get(n.senderId) : null;
        const isLatestFromSender =
          n.type === 'connection_request' &&
          !!n.senderId &&
          !!latest &&
          latest.createdAtMs === n.createdAtMs &&
          latest.id === n.id;

        return {
          ...n,
          isLatestFromSender
        };
      });

      setNotifications(finalMapped);
    } catch (error) {
      console.error("Failed to fetch notifications", error);
    }
  };

  const handleAccept = async (e, notif) => {
    e.stopPropagation();
    console.log("Attempting to accept notification:", notif);

    try {
      if (notif.connectionId) {
        await acceptConnectionRequest(notif.connectionId, null);
      } else if (notif.senderId) {
        await acceptConnectionRequest(null, notif.senderId);
      } else {
        console.error("Missing senderId/connectionId in notification:", notif);
        showError("Error: Cannot accept request (missing sender information)");
        return;
      }
      // Refresh notifications to get updated connection status
      fetchData();
      showSuccess("Connection accepted!");
    } catch (err) {
      console.error("Failed to accept:", err);
      if (err.response && err.response.status === 404) {
        console.error("Debug Info:", err.response.data);
        showError("Request not found. Check console for details.");
      } else {
        showError("Failed to accept request");
      }
    }
  };

  const handleReject = async (e, notif) => {
    e.stopPropagation();
    try {
      if (notif.connectionId) {
        await rejectConnectionRequest(notif.connectionId, null);
      } else if (notif.senderId) {
        await rejectConnectionRequest(null, notif.senderId);
      } else {
        console.error("Missing senderId/connectionId in notification:", notif);
        showError("Error: Cannot reject request (missing sender information)");
        return;
      }
      // Refresh notifications to get updated connection status
      fetchData();
      showSuccess("Connection rejected.");
    } catch (err) {
      console.error("Failed to reject:", err);
      showError("Failed to reject request");
    }
  };

  const getIconForType = (type) => {
    switch (type) {
      case 'connection_request': return <FiUserCheck />;
      case 'connection_accepted': return <FiUserCheck />;
      case 'connection_rejected': return <FiXCircle />;
      default: return <FiBell />;
    }
  };

  const getLinkForType = (type, senderUsername, senderUserType) => {
    const portalPrefix = `/${(window.location.pathname.split("/")[1] || "S")}`;
    switch (type) {
      case 'connection_request':
        // Redirect to sender's public profile
        if (senderUsername && senderUserType) {
          return `${portalPrefix}/${senderUserType === 'investor' ? 'investors' : 'startups'}/${senderUsername}`;
        }
        return `${portalPrefix}/profile#connections`;
      case 'connection_accepted':
        return `${portalPrefix}/profile#connections`;
      case 'connection_rejected':
        // Redirect to sender's profile so they can try again
        if (senderUsername && senderUserType) {
          return `${portalPrefix}/${senderUserType === 'investor' ? 'investors' : 'startups'}/${senderUsername}`;
        }
        return `${portalPrefix}/home`;
      default:
        return `${portalPrefix}/home`;
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
      const notification = notifications.find(n => n.id === id);
      if (notification.read) {
        // Mark as unread
        await markNotificationAsUnread(id);
        setNotifications(notifications.map(notif =>
          notif.id === id ? { ...notif, read: false } : notif
        ));
      } else {
        // Mark as read
        await markNotificationAsRead(id);
        setNotifications(notifications.map(notif =>
          notif.id === id ? { ...notif, read: true } : notif
        ));
      }
    } catch (error) {
      console.error("Failed to toggle notification read status", error);
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
                    {notif.type === 'connection_request' &&
                      notif.isLatestFromSender &&
                      notif.isActive !== false &&
                      ((notif.connectionState || 'pending') === 'pending') && (
                      <div className="notification-actions-inline" style={{ marginTop: '8px', display: 'flex', gap: '8px' }}>
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
                    {notif.type === 'connection_request' && (notif.connectionState === 'accepted') && (
                      <div className="notification-status" style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '8px', color: '#4CAF50', fontWeight: '600' }}>
                        <FiCheckCircle size={16} />
                        <span>Connection with {notif.senderDisplayName || notif.senderUsername} accepted</span>
                      </div>
                    )}
                    {notif.type === 'connection_request' && (notif.connectionState === 'rejected') && (
                      <div className="notification-status" style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '8px', color: '#f44336', fontWeight: '600' }}>
                        <FiXCircle size={16} />
                        <span>Connection with {notif.senderDisplayName || notif.senderUsername} rejected</span>
                      </div>
                    )}
                    {notif.type === 'connection_request' && (notif.connectionState === 'cancelled') && (
                      <div className="notification-status" style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '8px', color: '#6b7280', fontWeight: '600' }}>
                        <FiXCircle size={16} />
                        <span>Request cancelled</span>
                      </div>
                    )}
                    {notif.type === 'connection_accepted' && (
                      <div className="notification-status" style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '8px', color: '#4CAF50', fontWeight: '600' }}>
                        <FiCheckCircle size={16} />
                        <span>Connection with {notif.senderDisplayName || notif.senderUsername} accepted</span>
                      </div>
                    )}
                    {notif.type === 'connection_rejected' && (
                      <div className="notification-status" style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '8px', color: '#f44336', fontWeight: '600' }}>
                        <FiXCircle size={16} />
                        <span>{notif.senderDisplayName || notif.senderUsername} declined your connection request</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="notification-controls" style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
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