import React from 'react';

export default function AboutSection({ about, name, onClick }) {
  return (
    <div
      className="card about-section"
      onClick={onClick}
      style={{ cursor: 'pointer' }}
    >
      <h3>About {name}</h3>
      <p className="about-text">{about}</p>
    </div>
  );
}
