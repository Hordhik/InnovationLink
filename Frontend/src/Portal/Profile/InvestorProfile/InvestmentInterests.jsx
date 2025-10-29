import React from 'react';

export default function InvestmentInterests({ sectors, stages }) {
  return (
    <div className="card investment-section">
      <h3>What I Like To Invest In</h3>

      <div className="category">
        <h4>Sectors Interested In</h4>
        <div className="tags">
          {sectors.map((sector, idx) => (
            <span key={idx} className="tag tag-sector">{sector}</span>
          ))}
        </div>
      </div>

      <div className="category">
        <h4>Stage Focus</h4>
        <div className="tags">
          {stages.map((stage, idx) => (
            <span key={idx} className="tag tag-stage">{stage}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
