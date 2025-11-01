import React, { useState, useRef, useEffect } from 'react';
import './StartupProfileHeader.css';
import './StartupProfile.css';
import userIcon from '../../../assets/Portal/user.svg';
import feedbackIcon from '../../../assets/Portal/feedback.png';

const StartupProfileHeader = ({ profileData, isEditing, editStateProps, publicView = false, onConnect }) => {
  const p = editStateProps || {};
  p.fileInputRef = p.fileInputRef || { current: null };
  const [showReadMore, setShowReadMore] = useState(false);
  const [openDescModal, setOpenDescModal] = useState(false);
  const descRef = useRef(null);
  const leftCardRef = useRef(null);

  useEffect(() => {
    // detect whether the description overflows its container (clamped height)
    const el = descRef.current;
    if (!el) return setShowReadMore(false);
    // allow next tick for rendering
    const check = () => {
      setShowReadMore(el.scrollHeight > el.clientHeight + 2);
    };
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, [profileData.description]);

  // Sync heights:
  // - Left card matches center description height only
  // - Right blogs matches (center description + team row) height so it reaches the end of the team section
  useEffect(() => {
    const left = leftCardRef.current;
    const center = document.querySelector('.profile-center .description-card');
    const right = document.querySelector('.profile-right .blogs-card');
    const teamRow = document.querySelector('.team-row');
    if (!left || !center) return;
    const applyMaster = () => {
      // clear previous inline heights so we measure natural center height
      left.style.height = '';
      if (right) right.style.height = '';
      // measure center natural height and include team-row height (if present)
      const centerH = center.clientHeight;
      const teamH = teamRow ? teamRow.clientHeight : 0;
      // set left to center height only
      left.style.height = centerH + 'px';
      left.style.overflow = 'hidden';
      if (right) {
        const total = centerH + teamH;
        right.style.height = total + 'px';
        right.style.overflow = 'auto';
      }
    };
    applyMaster();
    window.addEventListener('resize', applyMaster);
    // Observe size changes for dynamic content (read more, team expand, etc.)
    let centerObserver, teamObserver;
    if (typeof ResizeObserver !== 'undefined') {
      centerObserver = new ResizeObserver(() => applyMaster());
      centerObserver.observe(center);
      if (teamRow) {
        teamObserver = new ResizeObserver(() => applyMaster());
        teamObserver.observe(teamRow);
      }
    }
    return () => window.removeEventListener('resize', applyMaster);
  }, [profileData]);

  return (
    <>
      <div className="profile-left">
        <div className="profile-left-card" ref={leftCardRef}>
          <div className="header-card-inner center">
            <div className="logo-card">
              {isEditing ? (
                <img src={p.edit?.logo || profileData.logo || 'https://placehold.co/160x160/eef2ff/4f46e5?text=Logo'} alt="logo" className="logo-image" />
              ) : (
                <img src={profileData.logo || 'https://placehold.co/160x160/eef2ff/4f46e5?text=Logo'} alt="logo" className="logo-image" />
              )}
            </div>

            <div className="header-meta">
              {isEditing ? (
                <>
                  <input className="inline-input" name="name" aria-label="Startup name" value={p.edit?.name || ''} onChange={p.handleChange('name')} />
                  <input className="inline-input small" name="founder" aria-label="Founder" value={p.edit?.founder || ''} onChange={p.handleChange('founder')} placeholder="Founder" />
                  <input className="inline-input small" name="address" aria-label="Address" value={p.edit?.address || ''} onChange={p.handleChange('address')} placeholder="Location / Address" />
                </>
              ) : (
                <>
                  {(profileData.name || '').trim() && (
                    <div className="meta-name" title={profileData.name}>{profileData.name}</div>
                  )}
                  {(profileData.founder || '').trim() && (
                    <div className="meta-founder"><strong>Founder:</strong> {profileData.founder}</div>
                  )}
                  {(profileData.address || '').trim() && (
                    <div className="meta-location" title={profileData.address}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                        <path d="M12 21s-7-5.686-7-11a7 7 0 1 1 14 0c0 5.314-7 11-7 11Z" stroke="#64748b" strokeWidth="1.5" fill="none" />
                        <circle cx="12" cy="10" r="2.5" stroke="#64748b" strokeWidth="1.5" fill="none" />
                      </svg>
                      <span>{profileData.address}</span>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
          <div className="left-actions big" style={{ marginTop: 6 }}>
            <button className="feedback"><img src={feedbackIcon} alt="" />FeedBack</button>
            <button
              className="connect-btn"
              onClick={typeof onConnect === 'function' ? () => onConnect(profileData) : undefined}
            >
              <img src={userIcon} alt="" />Connect
            </button>
          </div>
        </div>
      </div>

      <div className="profile-center">
        <div className="card description-card highlight">
          <h2 className="project-title">Project Description</h2>
          <div className="description-inner">
            {isEditing ? (
              <textarea className="inline-textarea" name="description" aria-label="Project description" value={p.edit?.description || ''} onChange={p.handleChange('description')} />
            ) : (
              <>
                <div
                  ref={descRef}
                  className="startup-desc large clamp-5"
                  style={{ lineHeight: 1.7, cursor: publicView ? 'pointer' : 'default' }}
                  onClick={publicView ? () => setOpenDescModal(true) : undefined}
                  role={publicView ? 'button' : undefined}
                  tabIndex={publicView ? 0 : undefined}
                  onKeyDown={publicView ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setOpenDescModal(true); } } : undefined}
                >
                  {profileData.description || 'No description provided yet.'}
                </div>
                {!publicView && showReadMore && (
                  <div style={{ marginTop: 10 }}>
                    <button className="btn btn-ghost" onClick={() => setOpenDescModal(true)}>Read more</button>
                  </div>
                )}
              </>
            )}
          </div>

          <div className="tags-box">
            {isEditing ? (
              <input className="inline-input" name="domain" aria-label="Domains" value={p.edit?.domain || ''} onChange={p.handleChange('domain')} placeholder="Domains (comma separated)" />
            ) : (
              (() => {
                const domainStr = p.edit?.domain ?? profileData.domain ?? '';
                const arr = String(domainStr).split(',').map(s => s.trim()).filter(Boolean);
                return arr.length ? arr.map((t, i) => <span key={`${t}-${i}`} className="domain-tag">{t}</span>) : <span className="muted">No domain</span>;
              })()
            )}
          </div>

          {/* Public view keeps the same description card as normal profile; actions remain only on the left profile card */}

          <div className="desc-contact">
            {isEditing ? (
              <>
                <input className="inline-input" name="email" aria-label="Email" value={p.edit?.email || ''} onChange={p.handleChange('email')} placeholder="Email" />
                <input className="inline-input" name="phone" aria-label="Phone" value={p.edit?.phone || ''} onChange={p.handleChange('phone')} placeholder="Phone" />
              </>
            ) : (
              null /* email hidden in public view */
            )}
          </div>
        </div>
      </div>
      {openDescModal && (
        <div className="desc-modal-backdrop" onClick={() => setOpenDescModal(false)}>
          <div className="desc-modal-card" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ marginTop: 0 }}>Project Description</h3>
            <div className="desc-modal-text">{profileData.description || 'No description provided yet.'}</div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 12 }}>
              <button className="btn btn-secondary" onClick={() => setOpenDescModal(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default StartupProfileHeader;

