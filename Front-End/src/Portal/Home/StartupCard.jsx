import React from 'react';
import './StartupCard.css';

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
            <h3 className="startup-name">Innovation Link</h3>
            <p className="founder-name">Founder: Chandra Sekhar</p>
            <p className="location-team">Vijaywda • 4-10 Team</p>
          </div>
        </div>
        <div className="mentor-info">
          <div className="mentors-engaged">
            <span className="icon"></span>
            <span>12 Mentors Engaged</span>
          </div>
          <div className="mentors-this-month">
            <span className="icon"></span>
            <span>128 this month</span>
          </div>
        </div>
      </div>
      <div className="card-actions">
        <button className="connect-button">Connect</button>
        <button className="request-button">Request a Meeting</button>
      </div>
      <div className="card-body">
        <p className="description">
          Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has
          been the industry's standard dummy text ever since the 1500s, when an unknown printer took
          a galley of type and scrambled it to make a type specimen book.
        </p>
        <div className="tags">
          {tags.map((tag, index) => (
            <span key={index} className="tag">{tag}</span>
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
