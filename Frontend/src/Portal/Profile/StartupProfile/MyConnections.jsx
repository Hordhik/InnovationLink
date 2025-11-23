import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../Connections.css";

const dummyInvestors = [
  {
    username: "alex_k",
    name: "Alex Kumar",
    title: "Angel Investor",
    image: "",
  },
  {
    username: "meera_r",
    name: "Meera Reddy",
    title: "Partner @ BluePeak VC",
    image: "",
  },
  {
    username: "david_s",
    name: "David Singh",
    title: "Seed Investor",
    image: "",
  },
];

const StartupConnections = () => {
  const [connections, setConnections] = useState([]);
  const navigate = useNavigate();

  const prefix = `/${window.location.pathname.split("/")[1] || "S"}`;

  useEffect(() => {
    // simulate loading
    setTimeout(() => {
      setConnections(dummyInvestors);
    }, 500);
  }, []);

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
                inv.name
              )}&background=1E293B&color=fff`;

            return (
              <div key={i} className="connection-card">
                <img src={avatar} className="conn-avatar" alt={inv.name} />

                <div className="conn-info">
                  <p className="conn-name">{inv.name}</p>
                  <p className="conn-role">{inv.title}</p>
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
