import React from 'react';

export default function AboutSection({ about, name }) {
  return (
    <div className="card about-section">
      <h3>About {name}</h3>
      <p>{about}</p>
    </div>
  );
}
