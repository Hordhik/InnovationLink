import React from 'react';

export default function StageFocus({ stages, onClick }) {
  return (
    <div
      className="card stagefocus-card"
      onClick={onClick}
      style={{ cursor: 'pointer' }}
    >
      <h3>Stage Focus</h3>
      <div className="tags">
        {stages.map((stage, idx) => (
          <span key={idx} className="tag tag-stage">
            {stage}
          </span>
        ))}
      </div>
    </div>
  );
}
