import React, { useState, useEffect } from 'react';
import mentorship from '../../assets/Portal/StartupCard/mentorship.png';
import active from '../../assets/Portal/StartupCard/active.png';
import './StartupCard.css';
import { getInvestorById } from '../../services/investorApi.js';
import { Link, useNavigate } from 'react-router-dom';

const placeholderAvatar = "https://ui-avatars.com/api/?name=N+A&background=e9ecef&color=495057&bold=true&size=60";

const defaultInvestorData = {
  name: "Loading...",
  username: "",
  title: "",
  mentoredCount: 0,
  investmentsCount: 0,
  thesis: "",
  tags: [],
  initials: "...",
  image: null,
};

const InvestorCard = ({ investorId, initialUsername, isConnected }) => {
  const navigate = useNavigate();
  const [investorData, setInvestorData] = useState({
    ...defaultInvestorData,
    name: initialUsername || "Investor",
    username: initialUsername || "",
    initials: (initialUsername || 'N/A').substring(0, 2).toUpperCase()
  });

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Prefix: "/I" or "/S"
  const portalPrefix = `/${(window.location.pathname.split('/')[1] || 'I')}`;

  useEffect(() => {
    if (!investorId) {
      setError("Investor ID is missing.");
      setIsLoading(false);
      setInvestorData(prev => ({ ...prev, name: "Error", initials: "ER" }));
      return;
    }

    const fetchDetails = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await getInvestorById(investorId);
        console.log(`[InvestorCard] Fetched details for ID ${investorId}:`, response);

        if (!response || !response.investor) {
          console.error(`[InvestorCard] Invalid response for ID ${investorId}:`, response);
          throw new Error("Investor details not found.");
        }

        const fetchedUsername = response.investor.username || initialUsername || '';
        const fetchedName = response.investor.name || response.investor.username || initialUsername || `Investor #${investorId}`;

        // Backend provides about (bio) and investLike (investment thesis). Prefer about; fall back to investLike.
        const aboutText =
          response.investor.about ||
          response.investor.investLike ||
          response.investor.thesis ||
          defaultInvestorData.thesis;

        // Build tags aggregate (expertise + sectors + stages) for richer context.
        const aggregateTags = [
          ...(Array.isArray(response.investor.expertise) ? response.investor.expertise : []),
          ...(Array.isArray(response.investor.sectors) ? response.investor.sectors : []),
          ...(Array.isArray(response.investor.stages) ? response.investor.stages : []),
        ].slice(0, 12); // limit to avoid overflow

        setInvestorData({
          id: response.investor.id,
          name: fetchedName,
          username: fetchedUsername,
          initials: fetchedName.substring(0, 2).toUpperCase(),
          title: response.investor.title || defaultInvestorData.title,
          mentoredCount: response.investor.mentoredCount ?? defaultInvestorData.mentoredCount,
          investmentsCount: response.investor.investmentsCount ?? defaultInvestorData.investmentsCount,
          thesis: aboutText,
          tags: aggregateTags.length ? aggregateTags : defaultInvestorData.tags,
          image: response.investor.image || null,
        });

      } catch (err) {
        console.error(`Failed to fetch details for investor ID ${investorId}:`, err);
        setError(err.message || "Could not load details.");
        setInvestorData(prev => ({
          ...defaultInvestorData,
          name: initialUsername || `Investor #${investorId}`,
          initials: (initialUsername || 'ER').substring(0, 2).toUpperCase()
        }));
      } finally {
        setIsLoading(false);
      }
    };

    fetchDetails();
  }, [investorId, initialUsername]);

  const displayName = investorData.name;
  const displayUsername = investorData.username || initialUsername || '';
  const displayInitials = investorData.initials;
  const displayTitle = investorData.title;
  const displayMentored = investorData.mentoredCount;
  const displayInvestments = investorData.investmentsCount;
  const displayThesis = investorData.thesis; // primary description (about or fallback)
  const displayTags = investorData.tags;

  const avatarUrl = investorData.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayInitials)}&background=e9ecef&color=495057&bold=true&size=60`;

  // Build correct route: "/I/home/investor/:username"
  const correctProfileUrl = `${portalPrefix}/home/investor/${encodeURIComponent(displayUsername || displayName)}`;

  if (isLoading) {
    return (
      <div className="investor-card loading">
        <p style={{ padding: '4px 2px' }}>Loading details for {initialUsername || `Investor #${investorId}`}...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="investor-card error" style={{ border: '1px solid orange', padding: '1rem' }}>
        <p>Could not load details for {initialUsername || `Investor #${investorId}`}.</p>
        <p style={{ fontSize: '0.8em', color: '#666' }}>Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="investor-card">
      <div className="card-header">
        <div className="startup-info">
          <div className="avatar">
            <img
              src={avatarUrl}
              alt={`${displayName} initials`}
              onError={(e) => { e.target.onerror = null; e.target.src = placeholderAvatar; }}
            />
          </div>
          <div className="text-info">
            <p className="startup-name">{displayName}</p>
            <p className="founder-name">{displayUsername ? `@${displayUsername}` : ''}</p>
          </div>
        </div>
        <div className="connect">
          <div className="mentor-info">
            <div className="mentors-engaged">
              <img src={mentorship} alt="" className='icon' />
              <span><strong>{displayMentored}</strong> Startups Mentored</span>
            </div>
            <div className="mentors-this-month">
              <img src={active} alt="" className='icon' />
              <span><strong>{displayInvestments}</strong> Active Investments</span>
            </div>
          </div>
          <div className="card-actions">
            {isConnected ? (
              <button className="connect-button" onClick={() => navigate(`${portalPrefix}/inbox`, {
                state: { initialChat: { username: displayName, companyName: displayName } }
              })}>Message</button>
            ) : (
              <button className="connect-button" onClick={() => navigate(correctProfileUrl)}>Connect</button>
            )}
            <button className="request-button">Request a Meeting</button>
          </div>
        </div>
      </div>
      <div className="card-body">
        {displayThesis ? (
          <p className="description description--clamp">{displayThesis}</p>
        ) : (
          <p className="description description--clamp" style={{ fontStyle: 'italic', color: '#999' }}>No description provided.</p>
        )}
        <div className="tags">
          {displayTags.map((tag, index) => (
            <p key={index} className="tag">{tag}</p>
          ))}
        </div>
        <Link to={correctProfileUrl} className="view-profile-link">
          <span>View Full Profile</span>
          <span className="arrow-icon">→</span>
        </Link>
      </div>
    </div>
  );
};

export default InvestorCard;
