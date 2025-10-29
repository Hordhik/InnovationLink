import React from 'react';
import { Mail, Twitter, Linkedin, Briefcase } from 'lucide-react';

export default function InvestorCard({ data }) {
  return (
    <div className="card investor-card">
      <div className="investor-card-header">
        <img src="https://via.placeholder.com/80" alt={data.name} className="investor-avatar" />
        <div className="investor-card-info">
          <h2>{data.name}</h2>
          {/* <p className="investor-handle">{data.handle}</p> */}
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
        <button className="btn-meet">Request A Meet</button>
        <button className="btn-connect">Connect</button>
      </div>
    </div>
  );
}
