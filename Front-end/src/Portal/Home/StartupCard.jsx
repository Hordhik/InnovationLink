import React from 'react';
import './StartupCard.css';
import eyes from "../../assets/Portal/StartupCard/eyes.svg"
import statues from "../../assets/Portal/StartupCard/status-up.svg"

const StartupCard = () => {
  const tags = ['HealthTech', 'RuralTech', 'SaaS', 'Clean Energy'];

  return (
    <div className="startup-card">
      <div className="card-header">
        <div className="startup-info">
          <div className="avatar">
            <img src="https://ui-avatars.com/api/?name=Innovation+Link" alt="Innovation Link" />
          </div>
          <div className="text-info">
            <p className="startup-name">Innovation Link</p>
            <p className="founder-name">Founder: <span>Chandra Sekhar</span></p>
            {/* <p className="location-team">Location: <span>Vijaywda</span></p> */}
            <p className="team-size">Team size: <span>4-10</span></p>
          </div>
        </div>
        <div className="connect">
          <div className="mentor-info">
            <div className="mentors-engaged">
              <img src={eyes} alt="" className='icon'/>
              <span>12 Engaged</span>
            </div>
            <div className="mentors-this-month">
              <img src={statues} alt="" className='icon'/>
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
        <p className="description">
          Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has
          been the industry's standard dummy text ever since the 1500s, when an unknown printer took
          a galley of type and scrambled it to make a type specimen book.
        </p>
        <div className="tags">
          {tags.map((tag, index) => (
            <p key={index} className="tag">{tag}</p>
          ))}
        </div>
        <a href="#" className="view-profile-link">
          <span>View Full Profile</span>
          <span className="arrow-icon">→</span>
        </a>
      </div>
    </div>
  );
};

export default StartupCard;
