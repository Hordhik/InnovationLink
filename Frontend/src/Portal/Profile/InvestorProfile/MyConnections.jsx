import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../Connections.css";

const dummyStartups = [
  {
    username: "agrobyte",
    company_name: "AgroByte Labs",
    founder: "Sameer R",
    logo: "",
  },
  {
    username: "aqua_sync",
    company_name: "AquaSync IoT",
    founder: "Jasmine T",
    logo: "",
  },
  {
    username: "fintegrix",
    company_name: "Fintegrix",
    founder: "Rahul Dev",
    logo: "",
  },
];

const InvestorConnections = () => {
  const [connections, setConnections] = useState([]);
  const navigate = useNavigate();
  const prefix = `/${window.location.pathname.split("/")[1] || "I"}`;

  useEffect(() => {
    // simulate loading
    setTimeout(() => {
      setConnections(dummyStartups);
    }, 500);
  }, []);

  return (
    <div className="connections-page">
      <h2 className="page-title">Your Startup Connections</h2>

      {connections.length === 0 ? (
        <p className="empty-text">No connections yet.</p>
      ) : (
        <div className="connections-grid">
          {connections.map((st, i) => {
            const avatar =
              st.logo ||
              `https://ui-avatars.com/api/?name=${encodeURIComponent(
                st.company_name
              )}&background=0D8ABC&color=fff`;

            return (
              <div key={i} className="connection-card">
                <img src={avatar} className="conn-avatar" alt={st.company_name} />

                <div className="conn-info">
                  <p className="conn-name">{st.company_name}</p>
                  <p className="conn-role">Founder: {st.founder}</p>
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
