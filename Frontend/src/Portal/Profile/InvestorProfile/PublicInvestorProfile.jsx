import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getInvestorByUsername } from "../../../services/investorApi";
import { getConnectionStatus, sendConnectionRequest, cancelConnectionRequest } from "../../../services/connectionApi";
import { getPostsByUserId } from "../../../services/postApi";
import { showSuccess, showError } from "../../../utils/toast";
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
  const [posts, setPosts] = useState([]);

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
            const [statusData, postsData] = await Promise.all([
              getConnectionStatus(data.investor.userId),
              getPostsByUserId(data.investor.userId).catch(() => ({ posts: [] }))
            ]);
            setConnectionStatus(statusData);
            setPosts(postsData.posts || []);
          } catch (connErr) {
            console.error("Failed to load additional data:", connErr);
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
      showSuccess('Connection request sent!');
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to send request');
    }
  };

  const handleUnsend = async () => {
    try {
      await cancelConnectionRequest(investor.userId);
      setConnectionStatus({ status: 'none', role: 'none' });
      showSuccess('Request unsent.');
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to unsend request');
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
        return (
          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="btn-connect" disabled>Request Sent</button>
            <button className="btn-connect" onClick={handleUnsend}>Unsend</button>
          </div>
        );
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
              {investor.username ? (
                <p className="investor-role" style={{ opacity: 0.85 }}>
                  @{investor.username}
                </p>
              ) : null}
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
            {posts.length === 0 ? (
              <p style={{ color: '#6b7280', fontSize: '0.9rem' }}>No posts yet.</p>
            ) : (
              posts.slice(0, 2).map((post) => (
                <div
                  key={post.id}
                  style={{ paddingBottom: '0.5rem', borderBottom: '1px solid #f3f4f6', cursor: 'pointer' }}
                  onClick={() => navigate(`/posts/${post.id}`)}
                >
                  <p style={{ fontWeight: 600, color: '#1f2937' }}>{post.title}</p>
                  <p style={{ fontSize: '0.85rem', color: '#6b7280' }}>
                    {new Date(post.created_at).toLocaleDateString()} • {post.tags && post.tags[0] ? post.tags[0] : 'General'}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

    </div>
  );
};

export default PublicInvestorProfile;
