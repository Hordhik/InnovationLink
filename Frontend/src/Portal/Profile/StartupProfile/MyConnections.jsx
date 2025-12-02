import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../Connections.css";
import { getConnections } from "../../../services/connectionApi";

const StartupConnections = () => {
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const prefix = `/${window.location.pathname.split("/")[1] || "S"}`;

  useEffect(() => {
    const fetchConnections = async () => {
      try {
        const data = await getConnections();
        setConnections(data || []);
      } catch (error) {
        console.error("Failed to fetch connections:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchConnections();
  }, []);

  if (loading) {
    return <div className="connections-page"><p>Loading connections...</p></div>;
  }

  return (
    <div className="connections-page">
      <h2 className="page-title">Your Investor Connections</h2>

      {connections.length === 0 ? (
        <p className="empty-text">No connections yet.</p>
      ) : (
        <div className="connections-grid">
          {connections.map((inv, i) => {
            const avatar =
              inv.image ||
              `https://ui-avatars.com/api/?name=${encodeURIComponent(
                inv.name || inv.username || 'Investor'
              )}&background=1E293B&color=fff`;

            return (
              <div key={i} className="connection-card">
                <img src={avatar} className="conn-avatar" alt={inv.name} />

                <div className="conn-info">
                  <p className="conn-name">{inv.name || inv.username}</p>
                  <p className="conn-role">{inv.title || 'Investor'}</p>
                </div>

                <button
                  className="conn-view-btn"
                  onClick={() =>
                    navigate(`${prefix}/home/investor/${inv.username}`)
                  }
                >
                  View Profile →
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default StartupConnections;
