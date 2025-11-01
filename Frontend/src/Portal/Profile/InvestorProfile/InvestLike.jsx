import React from 'react';

export default function InvestLike({ description, onClick }) {
  return (
    <div
      className="card investlike-card"
      onClick={onClick}
      style={{ cursor: 'pointer' }}
    >
      <h3>What I Like To Invest In</h3>
      <p className="investlike-text">
        {description && description.trim() !== ''
          ? description
          : 'Click to add your investment preferences or philosophy.'}
      </p>
    </div>
  );
}
