import React from 'react';
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
  profileUrl,
}) => {
  // Show only the sector from database (domain); no default tag
  const tags = domain ? [domain] : [];
  const displayName = companyName || 'Startup';
  const founder = founderName || 'Founder';
  const avatarSrc = logo || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=0D8ABC&color=fff`;

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
            <button className="connect-button">Connect</button>
            <button className="request-button">Request a Meeting</button>
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
        <a href={profileUrl || '#'} className="view-profile-link">
          <span>View Full Profile</span>
          <span className="arrow-icon">→</span>
        </a>
      </div>
    </div>
  );
};

export default StartupCard;
