import React, { useState, useEffect } from 'react';
import { getConnections, getPendingRequests, acceptConnectionRequest, rejectConnectionRequest } from '../../../services/connectionApi';

export default function ConnectedInvestors() {
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
            alert("Failed to accept request");
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
            alert("Failed to reject request");
            // Refresh on error to sync state
            fetchData();
        }
    };

    const displayedConnections = connections.slice(0, 3);

    return (
        <>
            <div className="card connected-investors">
                <div className="header-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h3 style={{ margin: 0 }}>Network</h3>
                    <div className="header-actions" style={{ display: 'flex', alignItems: 'center' }}>
                        {requests.length > 0 && (
                            <span className="badge-requests" onClick={() => { setActiveTab('requests'); setShowModal(true); }}>
                                {requests.length} New Requests
                            </span>
                        )}
                        <button className="view-all" onClick={() => { setActiveTab('connections'); setShowModal(true); }} style={{ background: 'none', border: 'none', color: '#007bff', cursor: 'pointer' }}>
                            Manage
                        </button>
                    </div>
                </div>

                <div className="investor-list" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                    {loading ? (
                        <p>Loading...</p>
                    ) : connections.length === 0 ? (
                        <p className="empty-text" style={{ color: '#666', fontStyle: 'italic' }}>No connections yet.</p>
                    ) : (
                        displayedConnections.map((c, idx) => (
                            <div key={idx} className="investor-card" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem', border: '1px solid #eee', borderRadius: '8px', minWidth: '200px' }}>
                                <img
                                    src={c.image || "https://via.placeholder.com/50"}
                                    alt={c.display_name || c.username}
                                    className="investor-logo"
                                    style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }}
                                />
                                <div className="investor-info">
                                    <h4 style={{ margin: 0, fontSize: '0.9rem' }}>{c.display_name || c.username}</h4>
                                    <p className="role" style={{ margin: 0, fontSize: '0.8rem', color: '#666' }}>{c.userType || 'Investor'}</p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* ---- Modal ---- */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
                    <div
                        className="investment-modal-content"
                        onClick={(e) => e.stopPropagation()}
                        style={{ background: 'white', padding: '1.5rem', borderRadius: '8px', width: '90%', maxWidth: '600px', maxHeight: '80vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
                    >
                        <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                            <div className="tabs" style={{ display: 'flex', gap: '1rem' }}>
                                <button
                                    className={`tab-btn ${activeTab === 'connections' ? 'active' : ''}`}
                                    onClick={() => setActiveTab('connections')}
                                    style={{ background: 'none', border: 'none', borderBottom: activeTab === 'connections' ? '2px solid #007bff' : '2px solid transparent', padding: '0.5rem', cursor: 'pointer', fontWeight: '600', color: activeTab === 'connections' ? '#007bff' : '#666' }}
                                >
                                    Connections ({connections.length})
                                </button>
                                <button
                                    className={`tab-btn ${activeTab === 'requests' ? 'active' : ''}`}
                                    onClick={() => setActiveTab('requests')}
                                    style={{ background: 'none', border: 'none', borderBottom: activeTab === 'requests' ? '2px solid #007bff' : '2px solid transparent', padding: '0.5rem', cursor: 'pointer', fontWeight: '600', color: activeTab === 'requests' ? '#007bff' : '#666' }}
                                >
                                    Requests ({requests.length})
                                </button>
                            </div>
                            <button className="modal-close" onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>
                                ✕
                            </button>
                        </div>

                        <div className="modal-body" style={{ overflowY: 'auto', flex: 1 }}>
                            {activeTab === 'connections' && (
                                <div className="modal-investor-grid" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    {connections.length === 0 && <p>No connections found.</p>}
                                    {connections.map((c, idx) => (
                                        <div key={idx} className="connection-item" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.5rem', borderBottom: '1px solid #eee' }}>
                                            <img
                                                src={c.image || "https://via.placeholder.com/50"}
                                                alt={c.display_name || c.username}
                                                style={{ width: '50px', height: '50px', borderRadius: '50%', objectFit: 'cover' }}
                                            />
                                            <div style={{ flex: 1 }}>
                                                <h4 style={{ margin: 0 }}>{c.display_name || c.username}</h4>
                                                <p style={{ margin: 0, fontSize: '0.9rem', color: '#666' }}>{c.userType}</p>
                                            </div>
                                            <button className="btn-secondary" style={{ padding: '0.3rem 0.8rem', border: '1px solid #ccc', borderRadius: '4px', background: 'white', cursor: 'pointer' }}>Message</button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {activeTab === 'requests' && (
                                <div className="requests-list" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    {requests.length === 0 && <p>No pending requests.</p>}
                                    {requests.map((r, idx) => (
                                        <div key={idx} className="request-item" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.5rem', borderBottom: '1px solid #eee' }}>
                                            <img
                                                src={r.image || "https://via.placeholder.com/50"}
                                                alt={r.display_name || r.username}
                                                style={{ width: '50px', height: '50px', borderRadius: '50%', objectFit: 'cover' }}
                                            />
                                            <div style={{ flex: 1 }}>
                                                <h4 style={{ margin: 0 }}>{r.display_name || r.username}</h4>
                                                <p style={{ margin: 0, fontSize: '0.9rem', color: '#666' }}>{r.userType}</p>
                                            </div>
                                            <div className="actions" style={{ display: 'flex', gap: '0.5rem' }}>
                                                <button
                                                    onClick={() => handleAccept(r.connection_id)}
                                                    style={{ background: '#4CAF50', color: 'white', border: 'none', padding: '0.3rem 0.8rem', borderRadius: '4px', cursor: 'pointer' }}
                                                >
                                                    Accept
                                                </button>
                                                <button
                                                    onClick={() => handleReject(r.connection_id)}
                                                    style={{ background: '#f44336', color: 'white', border: 'none', padding: '0.3rem 0.8rem', borderRadius: '4px', cursor: 'pointer' }}
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
            <style>{`
        .badge-requests {
          background: #ff4444;
          color: white;
          padding: 2px 8px;
          border-radius: 10px;
          font-size: 0.8rem;
          cursor: pointer;
          margin-right: 10px;
        }
      `}</style>
        </>
    );
}
