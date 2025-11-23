import React from 'react';
import { Mail, Twitter, Linkedin, Briefcase } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function InvestorCard({ data, onClick }) {
  const navigate = useNavigate();
  const userType = window.location.pathname.split('/')[1] || 'I';
  return (
    <div
      className="card investor-card"
      onClick={onClick}
      style={{ cursor: 'pointer' }}
    >
      <div className="investor-card-header">
        <img
          src={data.image || 'https://placehold.co/120x120/eef2ff/4f46e5?text=Photo'}
          alt={data.name || 'Investor avatar'}
          className="investor-avatar"
        />
        <div className="investor-card-info">
          <h2>{data.name}</h2>
          <p className="investor-role">
            <Briefcase size={14} /> {data.title} | {data.location}
          </p>
          <div className="investor-social">
            <Mail size={20} />
            <Twitter size={20} />
            <Linkedin size={20} />
          </div>
        </div>
      </div>
      <div className="investor-actions">
        <button
          className="btn-meet"
          onClick={(e) => {
            e.stopPropagation(); // prevent triggering edit modal
          }}
        >
          Request A Meet
        </button>
        <button
          className="btn-connect"
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/${userType}/connections`);
          }}
        >
          My Connections
        </button>
      </div>
    </div>
  );
}
