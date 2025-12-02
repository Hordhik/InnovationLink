import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getInvestorByUsername } from "../../../services/investorApi";
import { getConnectionStatus, sendConnectionRequest } from "../../../services/connectionApi";
import { Mail, Twitter, Linkedin, Briefcase } from 'lucide-react';

import AboutSection from './AboutSection.jsx';
import ExpertiseSection from './ExpertiseSection.jsx';
import InvestLike from './InvestLike.jsx';
import SectorsInterested from './SectorsInterested.jsx';
import StageFocus from './StageFocus.jsx';

import mentorship from "../../../assets/Portal/StartupCard/mentorship.png";
import active from "../../../assets/Portal/StartupCard/active.png";
import "./InvestorProfile.css";

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
          className="btn-meet"
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
        return <button className="btn-connect" disabled>Request Sent</button>;
      }
      return <button className="btn-connect" disabled>Pending Request</button>;
    }
    if (connectionStatus.status === 'blocked') {
      return null;
    }
    return (
      <button className="btn-connect" onClick={handleConnect}>
        Connect
      </button>
    );
  };

  if (loading) {
    return <div className="investor-profile-page">Loading profile…</div>;
  }

  if (error) {
    return (
      <div className="investor-profile-page" style={{ color: "red" }}>
        {error}
      </div>
    );
  }

  if (!investor) {
    return (
      <div className="investor-profile-page">Investor not found.</div>
    );
  }

  const avatar =
    investor.image ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(
      investor.name || username
    )}&background=0D8ABC&color=fff`;

  return (
    <div className="investor-profile-page">

      {/* ROW 1: Card, About, Expertise */}
      <div className="investor-row">
        {/* Inline Investor Card */}
        <div className="card investor-card">
          <div className="investor-card-header">
            <img src={avatar} alt={investor.name} className="investor-avatar" />
            <div className="investor-card-info">
              <h2>{investor.name}</h2>
              <p className="investor-role">
                <Briefcase size={14} /> {investor.title} | {investor.location}
              </p>
              <div className="investor-social">
                <Mail size={20} />
                <Twitter size={20} />
                <Linkedin size={20} />
              </div>
            </div>
          </div>
          <div className="investor-actions">
            <button className="btn-meet">Request A Meet</button>
            {renderConnectButton()}
          </div>
        </div>

        <AboutSection
          about={investor.about || "No details provided."}
          name={investor.name}
          onClick={() => { }} // No-op for public view
        />

        <ExpertiseSection
          expertise={investor.expertise || []}
          onClick={() => { }} // No-op
        />
      </div>

      {/* ROW 2: InvestLike, Sectors, Stages */}
      <div className="investor-row">
        <InvestLike
          description={investor.investLike || "No thesis provided."}
          onClick={() => { }}
        />
        <SectorsInterested
          sectors={investor.sectors || []}
          onClick={() => { }}
        />
        <StageFocus
          stages={investor.stages || []}
          onClick={() => { }}
        />
      </div>



      {/* ROW 4: Stats & Achievements (Custom for Public View) */}
      <div className="investor-row">
        <div className="card">
          <h3>Impact Stats</h3>
          <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', height: '100%' }}>
            <div style={{ textAlign: 'center' }}>
              <img src={mentorship} alt="" style={{ width: 40, marginBottom: 10 }} />
              <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#111827' }}>{investor.mentoredCount || 0}</p>
              <p style={{ fontSize: '0.9rem' }}>Startups Mentored</p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <img src={active} alt="" style={{ width: 40, marginBottom: 10 }} />
              <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#111827' }}>{investor.investmentsCount || 0}</p>
              <p style={{ fontSize: '0.9rem' }}>Active Investments</p>
            </div>
          </div>
        </div>

        <div className="card">
          <h3>Achievements</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {[
              { title: "Angel Network Summit", date: "2024", outcome: "Top Mentor Award" },
              { title: "SeedStars Jury", date: "2023", outcome: "Jury Speaker" },
            ].map((a, i) => (
              <div key={i} style={{ paddingBottom: '0.5rem', borderBottom: i === 0 ? '1px solid #f3f4f6' : 'none' }}>
                <p style={{ fontWeight: 600, color: '#1f2937' }}>{a.title}</p>
                <p style={{ fontSize: '0.85rem', color: '#4b5563' }}>{a.outcome} • {a.date}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h3>Recent Posts</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ paddingBottom: '0.5rem', borderBottom: '1px solid #f3f4f6' }}>
              <p style={{ fontWeight: 600, color: '#1f2937' }}>Why Early-Stage Mentorship Matters</p>
              <p style={{ fontSize: '0.85rem', color: '#6b7280' }}>Jan 2025 • Investing</p>
            </div>
            <div>
              <p style={{ fontWeight: 600, color: '#1f2937' }}>Picking Founders, Not Ideas</p>
              <p style={{ fontSize: '0.85rem', color: '#6b7280' }}>Dec 2024 • Insight</p>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default PublicInvestorProfile;
