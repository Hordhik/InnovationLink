import React from 'react';

export default function ExpertiseSection({ expertise, onClick }) {
  return (
    <div
      className="card expertise-section"
      onClick={onClick}
      style={{ cursor: 'pointer' }}
    >
      <h3>Expertise</h3>
      <div className="tags">
        {expertise.map((item, idx) => (
          <span key={idx} className="tag tag-skill">
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}
