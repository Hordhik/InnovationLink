import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getInvestorByUsername } from "../../../services/investorApi";
import { getConnectionStatus, sendConnectionRequest } from "../../../services/connectionApi";
// import "./PublicInvestorProfile.css";

import mentorship from "../../../assets/Portal/StartupCard/mentorship.png";
import active from "../../../assets/Portal/StartupCard/active.png";
import "./InvestorProfile.css"

const PublicInvestorProfile = () => {
  const { username } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [investor, setInvestor] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState({ status: 'none', role: 'none' });

  const portalPrefix = `/${(window.location.pathname.split("/")[1] || "I")}`;

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        const data = await getInvestorByUsername(username);

        if (!data || !data.investor) {
          throw new Error("Investor profile not found.");
        }

        setInvestor(data.investor);

        // Check connection status
        if (data.investor.userId) {
          try {
            const statusData = await getConnectionStatus(data.investor.userId);
            setConnectionStatus(statusData);
          } catch (connErr) {
            console.error("Failed to check connection status:", connErr);
          }
        }
      } catch (err) {
        console.error("Failed to load public investor profile:", err);
        setError(
          err?.response?.data?.message ||
          err?.message ||
          "Could not load investor profile"
        );
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [username]);

  const handleConnect = async () => {
    try {
      await sendConnectionRequest(investor.userId);
      setConnectionStatus({ status: 'pending', role: 'sender' });
      // Optional: Show toast
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to send request');
    }
  };

  const renderConnectButton = () => {
    if (connectionStatus.status === 'accepted') {
      return (
        <button
          className="connect-btn"
          onClick={() =>
            navigate(`${portalPrefix}/inbox`, {
              state: {
                initialChat: {
                  username: investor.username,
                  companyName: investor.name,
                },
              },
            })
          }
        >
          Message
        </button>
      );
    }
    if (connectionStatus.status === 'pending') {
      if (connectionStatus.role === 'sender') {
        return <button className="connect-btn" disabled>Request Sent</button>;
      }
      return <button className="connect-btn" disabled>Pending Request</button>;
    }
    if (connectionStatus.status === 'blocked') {
      return null;
    }
    return (
      <button className="connect-btn" onClick={handleConnect}>
        Connect
      </button>
    );
  };

  if (loading) {
    return <div className="public-investor-layout">Loading profile…</div>;
  }

  if (error) {
    return (
      <div className="public-investor-layout" style={{ color: "red" }}>
        {error}
      </div>
    );
  }

  if (!investor) {
    return (
      <div className="public-investor-layout">Investor not found.</div>
    );
  }

  const avatar =
    investor.image ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(
      investor.name || username
    )}&background=0D8ABC&color=fff`;

  return (
    <div className="public-investor-layout piv-root">

      {/* HEADER */}
      <div className="piv-header card">
        <div className="piv-header-left">
          <img src={avatar} alt={investor.name} className="piv-avatar" />
          <div>
            <h2 className="piv-name">{investor.name}</h2>
            <p className="piv-title">{investor.title}</p>
            <p className="piv-location">{investor.location}</p>
          </div>
        </div>

        <div className="piv-header-right">
          {renderConnectButton()}
        </div>
      </div>

      {/* STATS */}
      <div className="piv-stats-row">
        <div className="card piv-stat">
          <img src={mentorship} alt="" className="piv-stat-icon" />
          <p><strong>{investor.mentoredCount || 0}</strong></p>
          <p>Startups Mentored</p>
        </div>

        <div className="card piv-stat">
          <img src={active} alt="" className="piv-stat-icon" />
          <p><strong>{investor.investmentsCount || 0}</strong></p>
          <p>Active Investments</p>
        </div>
      </div>

      {/* ABOUT */}
      <div className="card piv-about">
        <div className="card-title">About</div>
        <p className="piv-about-text">{investor.about || "No details provided."}</p>
      </div>

      {/* Expertise */}
      <div className="card piv-tags-card">
        <div className="card-title">Expertise</div>
        <div className="piv-tags">
          {(investor.expertise || []).map((t, i) => (
            <span key={i} className="tag">{t}</span>
          ))}
        </div>
      </div>

      {/* Sectors */}
      <div className="card piv-tags-card">
        <div className="card-title">Sectors Interested</div>
        <div className="piv-tags">
          {(investor.sectors || []).map((t, i) => (
            <span key={i} className="tag">{t}</span>
          ))}
        </div>
      </div>

      {/* Stages */}
      <div className="card piv-tags-card">
        <div className="card-title">Stage Focus</div>
        <div className="piv-tags">
          {(investor.stages || []).map((t, i) => (
            <span key={i} className="tag">{t}</span>
          ))}
        </div>
      </div>

      {/* INVESTMENT THESIS */}
      <div className="card piv-about">
        <div className="card-title">Investment Thesis</div>
        <p className="piv-about-text">{investor.investLike || "No thesis provided."}</p>
      </div>

      {/* CONNECTED STARTUPS */}
      <div className="card piv-startups">
        <div className="card-title">Connected Startups</div>
        <div className="piv-startup-grid">
          {(investor.startups || []).map((s, i) => (
            <div key={i} className="piv-startup-card">
              <p className="piv-startup-name">{s.name}</p>
              <p className="piv-startup-founder">{s.founder}</p>
              <div className="piv-tags">
                {(s.tags || []).map((t, idx) => (
                  <span key={idx} className="tag">{t}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ACHIEVEMENTS */}
      <div className="card piv-achievements">
        <div className="card-title">Achievements</div>
        <div className="piv-ach-grid">
          {[
            { title: "Angel Network Summit", date: "2024", outcome: "Top Mentor Award" },
            { title: "SeedStars Jury", date: "2023", outcome: "Jury Speaker" },
          ].map((a, i) => (
            <div className="ach-item" key={i}>
              <p className="ach-title">{a.title}</p>
              <p className="ach-outcome">{a.outcome}</p>
              <p className="ach-date">{a.date}</p>
            </div>
          ))}
        </div>
      </div>

      {/* BLOGS */}
      <div className="card piv-blogs">
        <div className="card-title">Recent Posts</div>
        <div className="blog-grid">
          <div className="blog-card">
            <p className="blog-title">Why Early-Stage Mentorship Matters</p>
            <p className="blog-meta">Jan 2025 • Investing</p>
          </div>
          <div className="blog-card">
            <p className="blog-title">Picking Founders, Not Ideas</p>
            <p className="blog-meta">Dec 2024 • Insight</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicInvestorProfile;
