import React, { useState } from 'react';

export default function ConnectedStartups({ startups }) {
  const [showModal, setShowModal] = useState(false);
  const displayedStartups = startups.slice(0, 3);

  return (
    <>
      <div className="card connected-startups">
        <div className="header-row">
          <h3>Connected With {startups.length} Start-ups</h3>
          <button className="view-all" onClick={() => setShowModal(true)}>
            See All
          </button>
        </div>

        <div className="startup-list">
          {displayedStartups.map((s, idx) => (
            <div key={idx} className="startup-card">
              <img
                src="https://via.placeholder.com/80"
                alt={s.name}
                className="startup-logo"
              />
              <div className="startup-info">
                <h4>{s.name}</h4>
                <p className="founder">Founder: {s.founder}</p>
                <div className="tags">
                  {s.tags.map((tag, i) => (
                    <span key={i} className="tag tag-mini">{tag}</span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ---- Modal ---- */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div
            className="investment-modal-content"
            onClick={(e) => e.stopPropagation()} // prevent overlay click close
          >
            <div className="modal-header">
              <h3>All Connected Start-ups</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>
                ✕
              </button>
            </div>

            <div className="modal-startup-grid">
              {startups.map((s, idx) => (
                <div key={idx} className="modal-startup-card">
                  <img
                    src="https://via.placeholder.com/80"
                    alt={s.name}
                    className="startup-logo"
                  />
                  <div className="startup-info">
                    <h4>{s.name}</h4>
                    <p className="founder">Founder: {s.founder}</p>
                    <div className="tags">
                      {s.tags.map((tag, i) => (
                        <span key={i} className="tag tag-mini">{tag}</span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
