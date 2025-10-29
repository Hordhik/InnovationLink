import React from 'react';

export default function SectorsInterested({ sectors }) {
  return (
    <div className="card sectors-card">
      <h3>Sectors Interested In</h3>
      <div className="tags">
        {sectors.map((sector, idx) => (
          <span key={idx} className="tag tag-sector">{sector}</span>
        ))}
      </div>
    </div>
  );
}
