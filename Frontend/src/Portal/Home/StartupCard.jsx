import React from 'react';
// --- MODIFICATION: Import Link for correct navigation ---
import { useNavigate, Link } from 'react-router-dom';
import './StartupCard.css';
import eyes from "../../assets/Portal/StartupCard/eyes.svg"
import statues from "../../assets/Portal/StartupCard/status-up.svg"

const StartupCard = ({
  logo,
  companyName,
  founderName,
  description,
  domain,
  teamCount,
  username,
}) => {
  const navigate = useNavigate();
  const portalPrefix = `/${(window.location.pathname.split('/')[1] || 'I')}`; // '/I' or '/S'

  const startChat = () => {
    navigate(`${portalPrefix}/inbox`, {
      state: { initialChat: { username: username || displayName, companyName: displayName } },
    });
  };

  const tags = domain ? [domain] : [];
  const displayName = companyName || 'Startup';
  const founder = founderName || 'Founder';
  const avatarSrc = logo || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=0D8ABC&color=fff`;

  // Build absolute path to the public profile route inside the current portal
  // Route is defined as '/home/startup/:username' under the portal prefix
  const correctProfileUrl = `${portalPrefix}/home/startup/${username}`;

  return (
    <div className="startup-card">
      <div className="card-header">
        <div className="startup-info">
          <div className="avatar">
            <img src={avatarSrc} alt={displayName} />
          </div>
          <div className="text-info">
            <p className="startup-name">{displayName}</p>
            <p className="founder-name">Founder: <span>{founder}</span></p>
            {/* <p className="location-team">Location: <span>Vijaywda</span></p> */}
            <p className="team-size">Team members: <span>{typeof teamCount === 'number' ? teamCount : '-'}</span></p>
          </div>
        </div>
        <div className="connect">
          <div className="mentor-info">
            <div className="mentors-engaged">
              <img src={eyes} alt="" className='icon' />
              <span>12 Engaged</span>
            </div>
            <div className="mentors-this-month">
              <img src={statues} alt="" className='icon' />
              <span>128 Lookouts</span>
            </div>
          </div>
          <div className="card-actions">
            <button className="connect-button" onClick={() => navigate(correctProfileUrl)}>Connect</button>
            <button className="request-button" onClick={startChat}>Request a Meeting</button>
          </div>
        </div>
      </div>
      <div className="card-body">
        {description && (
          <>
            <p className="description description--clamp">
              {description}
            </p>
          </>
        )}
        <div className="tags">
          {tags.map((tag, index) => (
            <p key={index} className="tag">{tag}</p>
          ))}
        </div>

        {/* Link to investor-facing public profile */}
        <Link to={correctProfileUrl} className="view-profile-link">
          <span>View Full Profile</span>
          <span className="arrow-icon">→</span>
        </Link>
      </div>
    </div>
  );
};

export default StartupCard;
