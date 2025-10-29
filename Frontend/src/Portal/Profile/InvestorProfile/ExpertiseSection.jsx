import React from 'react';

export default function ExpertiseSection({ expertise }) {
  return (
    <div className="card expertise-section">
      <h3>Expertise</h3>
      <div className="tags">
        {expertise.map((item, idx) => (
          <span key={idx} className="tag tag-skill">{item}</span>
        ))}
      </div>
    </div>
  );
}
