import React, { useState, useRef, useEffect } from 'react';
import './StartupProfile.css';

const StartupProfileHeader = ({ profileData, isEditing, editStateProps }) => {
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

  // keep left card max-height in sync with the center description card height
  // use center description height as master: shrink left and right to match center
  useEffect(() => {
    const left = leftCardRef.current;
    const center = document.querySelector('.profile-center .description-card');
    const right = document.querySelector('.profile-right .blogs-card');
    if (!left || !center) return;
    const applyMaster = () => {
      // clear previous inline heights so we measure natural center height
      left.style.maxHeight = '';
      if (right) right.style.maxHeight = '';
      // measure center natural height
      const ch = center.clientHeight;
      // set left and right to center height
      left.style.maxHeight = ch + 'px';
      left.style.overflow = 'auto';
      if (right) {
        right.style.maxHeight = ch + 'px';
        right.style.overflow = 'auto';
      }
    };
    applyMaster();
    window.addEventListener('resize', applyMaster);
    return () => window.removeEventListener('resize', applyMaster);
  }, [profileData]);

  return (
    <>
      <div className="profile-left">
  <div className="profile-left-card" ref={leftCardRef}>
          <div className="header-card-inner">
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
                <input className="inline-input" value={p.edit?.name || ''} onChange={p.handleChange('name')} />
                <input className="inline-input small" value={p.edit?.founder || ''} onChange={p.handleChange('founder')} placeholder="Founder" />
                <input className="inline-input small" value={p.edit?.address || ''} onChange={p.handleChange('address')} placeholder="Location / Address" />
              </>
            ) : (
              <>
                <div className="meta-name large">{profileData.name || 'Your Startup'}</div>
                <div className="meta-founder">Founder: {profileData.founder || '-'}</div>
                {profileData.address && (
                  <div className="meta-founder" style={{display:'flex',alignItems:'center',gap:8,marginTop:6}}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                      <path d="M12 2C8.686 2 6 4.686 6 8c0 5.25 6 12 6 12s6-6.75 6-12c0-3.314-2.686-6-6-6z" stroke="#374151" strokeWidth="1" fill="#FEEBF3"/>
                      <circle cx="12" cy="8" r="2" fill="#000000ff" />
                    </svg>
                    <span>{profileData.address}</span>
                  </div>
                )}
              </>
            )}
            </div>
          </div>
          <div className="left-actions big" style={{marginTop:6}}>
            <button className="btn btn-feedback big">Feedback</button>
            <button className="btn btn-connect big">Connect</button>
          </div>
        </div>
      </div>

      <div className="profile-center">
        <div className="description-card highlight">
          <h2 className="project-title">Project Description</h2>
          <div className="description-inner">
            {isEditing ? (
              <textarea className="inline-textarea" value={p.edit?.description || ''} onChange={p.handleChange('description')} />
            ) : (
              <>
                <div ref={descRef} className="startup-desc large clamp-5">{profileData.description || 'No description provided yet.'}</div>
                {showReadMore && (
                  <div style={{marginTop:10}}>
                    <button className="btn btn-ghost" onClick={() => setOpenDescModal(true)}>Read more</button>
                  </div>
                )}
              </>
            )}
          </div>

          <div className="tags-box">
            {isEditing ? (
              <input className="inline-input" value={p.edit?.domain || ''} onChange={p.handleChange('domain')} placeholder="Domain" />
            ) : (
              (p.tags && p.tags.length) ? p.tags.map((t,i)=> <span key={`${t}-${i}`} className="domain-tag">{t}</span>) : <span className="muted">No domain</span>
            )}
          </div>

          <div className="desc-contact">
            {isEditing ? (
              <>
                <input className="inline-input" value={p.edit?.email || ''} onChange={p.handleChange('email')} placeholder="Email" />
                <input className="inline-input" value={p.edit?.phone || ''} onChange={p.handleChange('phone')} placeholder="Phone" />
              </>
            ) : (
              <>
                {p.contact?.email && <div className="contact-row"><strong>Email:</strong> {p.contact.email}</div>}
              </>
            )}
          </div>
        </div>
      </div>
      {openDescModal && (
        <div className="desc-modal-backdrop" onClick={() => setOpenDescModal(false)}>
          <div className="desc-modal-card" onClick={(e) => e.stopPropagation()}>
            <h3 style={{marginTop:0}}>Project Description</h3>
            <div style={{marginTop:8, color:'#334155'}}>{profileData.description || 'No description provided yet.'}</div>
            <div style={{display:'flex', justifyContent:'flex-end', marginTop:12}}>
              <button className="btn btn-secondary" onClick={() => setOpenDescModal(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default StartupProfileHeader;

