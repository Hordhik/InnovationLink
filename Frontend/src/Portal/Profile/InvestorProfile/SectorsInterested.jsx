import React from 'react';

export default function SectorsInterested({ sectors, onClick }) {
  return (
    <div
      className="card sectors-card"
      onClick={onClick}
      style={{ cursor: 'pointer' }}
    >
      <h3>Sectors Interested In</h3>
      <div className="tags">
        {sectors.map((sector, idx) => (
          <span key={idx} className="tag tag-sector">
            {sector}
          </span>
        ))}
      </div>
    </div>
  );
}
