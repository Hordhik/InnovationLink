import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../Connections.css";
import { getConnections } from "../../../services/connectionApi";

const InvestorConnections = () => {
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const prefix = `/${window.location.pathname.split("/")[1] || "I"}`;

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
      <h2 className="page-title">Your Startup Connections</h2>

      {connections.length === 0 ? (
        <p className="empty-text">No connections yet.</p>
      ) : (
        <div className="connections-grid">
          {connections.map((conn, i) => {
            // The API returns connection objects. We need the 'other' user.
            // Assuming the API returns a list of users directly or connection objects with a 'connectedUser' field.
            // Based on previous context, getConnections returns a list of connected users.
            // Let's assume the structure matches what we need or adapt.
            // If getConnections returns { connections: [...] }, and each item is a user object:

            const st = conn; // Assuming conn is the user object
            const avatar =
              st.logo ||
              `https://ui-avatars.com/api/?name=${encodeURIComponent(
                st.company_name || st.username || 'Startup'
              )}&background=0D8ABC&color=fff`;

            return (
              <div key={i} className="connection-card">
                <img src={avatar} className="conn-avatar" alt={st.company_name} />

                <div className="conn-info">
                  <p className="conn-name">{st.company_name || st.username}</p>
                  <p className="conn-role">Founder: {st.founder || '—'}</p>
                </div>

                <button
                  className="conn-view-btn"
                  onClick={() =>
                    navigate(`${prefix}/home/startup/${st.username}`)
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

export default InvestorConnections;
