
import React, { useState, useEffect } from 'react';
import { getConnections, getPendingRequests, acceptConnectionRequest, rejectConnectionRequest } from '../../../services/connectionApi';
import { showSuccess, showError } from '../../../utils/toast';
import './ConnectedStartups.css';

export default function ConnectedStartups({ startups: initialStartups }) {
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState('connections'); // 'connections' or 'requests'
  const [connections, setConnections] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [conns, reqs] = await Promise.all([
        getConnections(),
        getPendingRequests()
      ]);
      setConnections(conns || []);
      setRequests(reqs || []);
    } catch (err) {
      console.error("Failed to fetch connections:", err);
      // Fallback to props if API fails, or just show error
      // setConnections(initialStartups || []); 
      setError('Failed to load connections');
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (connectionId) => {
    try {
      await acceptConnectionRequest(connectionId);
      // Update UI optimistically
      setRequests(prev => prev.filter(r => r.connection_id !== connectionId));
      // Also refresh data in background
      fetchData();
    } catch (err) {
      console.error("Failed to accept request:", err);
      showError("Failed to accept request");
      // Refresh on error to sync state
      fetchData();
    }
  };

  const handleReject = async (connectionId) => {
    try {
      await rejectConnectionRequest(connectionId);
      // Update UI optimistically
      setRequests(prev => prev.filter(r => r.connection_id !== connectionId));
      // Also refresh data in background
      fetchData();
    } catch (err) {
      console.error("Failed to reject request:", err);
      showError("Failed to reject request");
      // Refresh on error to sync state
      fetchData();
    }
  };

  // Use API connections if available, otherwise fallback to props (for demo/legacy)
  // But since we want to use the new system, we primarily use 'connections' state.
  // If 'connections' is empty and we have 'initialStartups', maybe show those? 
  // For now, let's stick to the API data as the source of truth.

  const displayedConnections = connections.slice(0, 3);

  return (
    <>
      <div className="card connected-startups">
        <div className="header-row">
          <h3>Network</h3>
          <div className="header-actions">
            {requests.length > 0 && (
              <span className="badge-requests" onClick={() => { setActiveTab('requests'); setShowModal(true); }}>
                {requests.length} New Requests
              </span>
            )}
            <button className="view-all" onClick={() => { setActiveTab('connections'); setShowModal(true); }}>
              Manage
            </button>
          </div>
        </div>

        <div className="startup-list">
          {loading ? (
            <p>Loading...</p>
          ) : connections.length === 0 ? (
            <p className="empty-text">No connections yet.</p>
          ) : (
            displayedConnections.map((c, idx) => (
              <div key={idx} className="startup-card">
                <img
                  src={c.image || "https://via.placeholder.com/80"}
                  alt={c.display_name || c.username}
                  className="startup-logo"
                />
                <div className="startup-info">
                  <h4>{c.display_name || c.username}</h4>
                  <p className="founder">{c.userType || 'User'}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ---- Modal ---- */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div
            className="investment-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <div className="tabs">
                <button
                  className={`tab-btn ${activeTab === 'connections' ? 'active' : ''} `}
                  onClick={() => setActiveTab('connections')}
                >
                  Connections ({connections.length})
                </button>
                <button
                  className={`tab-btn ${activeTab === 'requests' ? 'active' : ''} `}
                  onClick={() => setActiveTab('requests')}
                >
                  Requests ({requests.length})
                </button>
              </div>
              <button className="modal-close" onClick={() => setShowModal(false)}>
                ✕
              </button>
            </div>

            <div className="modal-body">
              {activeTab === 'connections' && (
                <div className="modal-startup-grid">
                  {connections.length === 0 && <p>No connections found.</p>}
                  {connections.map((c, idx) => (
                    <div key={idx} className="connection-item">
                      <img
                        src={c.image || "https://via.placeholder.com/50"}
                        alt={c.display_name || c.username}
                      />
                      <div style={{ flex: 1 }}>
                        <h4>{c.display_name || c.username}</h4>
                        <p>{c.userType}</p>
                      </div>
                      <button className="btn-secondary">Message</button>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'requests' && (
                <div className="requests-list">
                  {requests.length === 0 && <p>No pending requests.</p>}
                  {requests.map((r, idx) => (
                    <div key={idx} className="request-item">
                      <img
                        src={r.image || "https://via.placeholder.com/50"}
                        alt={r.display_name || r.username}
                      />
                      <div style={{ flex: 1 }}>
                        <h4>{r.display_name || r.username}</h4>
                        <p>{r.userType}</p>
                      </div>
                      <div className="actions">
                        <button
                          onClick={() => handleAccept(r.connection_id)}
                          className="btn-accept"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => handleReject(r.connection_id)}
                          className="btn-reject"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
