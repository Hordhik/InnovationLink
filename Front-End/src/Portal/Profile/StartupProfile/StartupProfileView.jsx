import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { blogData } from '../../../Website/Blogs/blogData';
import BlogCard from '../../../Website/Blogs/BlogCard';
import { useState } from 'react';
import { getStoredUser } from '../../../auth';
import './StartupProfile.css';
import './TeamMemberModal.css';
import StartupProfileHeader from './StartupProfileHeader';

const StartupProfileView = ({ profileData, isEditing, editStateProps }) => {
  const p = editStateProps || {};
  p.edit = p.edit || {};
  p.fileInputRef = p.fileInputRef || { current: null };
  p.handleLogoUpload = p.handleLogoUpload || (() => {});
  p.handleChange = p.handleChange || (() => () => {});
  p.handleSave = p.handleSave || (() => {});
  p.handleCancel = p.handleCancel || (() => {});
  p.onStartEdit = p.onStartEdit || (() => {});
  p.addTeamMember = p.addTeamMember || (() => {});
  p.removeTeamMember = p.removeTeamMember || (() => {});
  p.changeTeamMember = p.changeTeamMember || (() => {});
  p.moveTeamMember = p.moveTeamMember || (() => {});
  p.openMember = p.openMember || (() => {});
  p.tags = Array.isArray(p.tags) ? p.tags : [];
  p.team = Array.isArray(p.team) ? p.team : [];
  p.contact = p.contact || {};

  const teamForRender = (() => {
    const founderName = (profileData && profileData.founder) ? String(profileData.founder).trim() : '';
    const sourceTeam = isEditing ? (Array.isArray(p.edit.team) ? p.edit.team.slice() : []) : (Array.isArray(p.team) ? p.team.slice() : []);
    if (!founderName) return sourceTeam;
    const hasFounder = sourceTeam.some(m => (m && m.name && String(m.name).trim().toLowerCase()) === founderName.toLowerCase());
    if (hasFounder) return sourceTeam;
    const founderPhoto = isEditing ? (p.edit?.founderPhoto ?? profileData.founderPhoto) : profileData.founderPhoto;
    const founderRole = isEditing ? (p.edit?.founderRole ?? profileData.founderRole ?? 'Founder') : (profileData.founderRole ?? 'Founder');
    return [{ name: founderName, photo: founderPhoto, role: founderRole, _founder: true }, ...sourceTeam];
  })();

  const navigate = useNavigate();
  const location = useLocation();
  const [showAllTeam, setShowAllTeam] = useState(false);
  const [dragIdx, setDragIdx] = useState(null); // data index within edit.team for dragging

  const handleDragStart = (idx) => setDragIdx(idx);
  const handleDragOver = (e, overIdx) => {
    e.preventDefault();
    if (!isEditing) return;
    if (dragIdx === null || overIdx === null) return;
    if (dragIdx === overIdx) return;
    // Reorder immediately on hover so tiles move left/right while dragging
    p.moveTeamMember(dragIdx, overIdx);
    setDragIdx(overIdx);
  };
  const handleDrop = (e) => { e.preventDefault(); setDragIdx(null); };
  const handleDragEnd = () => setDragIdx(null);

  return (
    <div className="startup-profile-wrap">
      <div className="profile-top">
        <StartupProfileHeader profileData={profileData} isEditing={isEditing} editStateProps={editStateProps} />
      </div>

      <div className="profile-right">
        <div className="blogs-card highlight">
          <div className="blogs-card-header">
            <h3 style={{ margin: 0 }}>Recent Blogs</h3>
          </div>
          <div className="blog-list">
            {(blogData && blogData.length) ? (
              blogData.slice(0, 2).map(b => (
                <BlogCard key={`profile-blog-${b.id}`} blog={b} hideMeta={true} clampLines={2} className="sidebar" />
              ))
            ) : (
              <div className="muted">No posts yet.</div>
            )}
          </div>
          <div className="blogs-card-footer">
            <a
              href="#"
              className="view-all-link bottom"
              onClick={(e) => {
                e.preventDefault();
                const user = getStoredUser();
                if (!user) return navigate('/auth/login');
                const role = user.userType === 'investor' ? 'I' : 'S';
                const username = user.username || user.name || 'handbook';
                navigate(`/${role}/${username}/blogs`);
              }}
            >View all</a>
          </div>
        </div>
      </div>

      <div className="team-row">
        <h4>Team Details</h4>
        <div className="team-avatars-grid">
          {teamForRender && teamForRender.length ? (() => {
            const hasFounder = profileData && profileData.founder && String(profileData.founder).trim() !== '';
            const offset = hasFounder ? 1 : 0;
            const displayList = showAllTeam ? teamForRender : teamForRender.slice(0, 6 + offset);
            return (
              <>
                {displayList.map((m, i) => {
                  const origIdx = teamForRender.indexOf(m);
                  const dataIdx = m && m._founder ? null : (origIdx - offset);
                  const isFounder = !!(m && m._founder);
                  const memberName = (isFounder ? (isEditing ? (p.edit?.founder ?? m.name) : m.name) : (p.edit.team && p.edit.team[dataIdx] && p.edit.team[dataIdx].name) || m.name) || '?';
                  const memberRole = (isFounder ? (isEditing ? (p.edit?.founderRole ?? 'Founder') : (m.role || profileData.founderRole || 'Founder')) : (p.edit.team && p.edit.team[dataIdx] && p.edit.team[dataIdx].role) || m.role) || '';
                  return (
                    <div
                      className={`team-tile${(isEditing && !isFounder && dataIdx !== null) ? ' draggable' : ''}${dragIdx === dataIdx ? ' dragging' : ''}`}
                      key={`tile-${origIdx}`}
                      draggable={isEditing && !isFounder && dataIdx !== null}
                      onDragStart={() => (isEditing && !isFounder && dataIdx !== null) && handleDragStart(dataIdx)}
                      onDragOver={(e) => (isEditing && !isFounder && dataIdx !== null) && handleDragOver(e, dataIdx)}
                      onDrop={handleDrop}
                      onDragEnd={handleDragEnd}
                    >
                      <div className="avatar-wrap" onClick={() => p.openMember(dataIdx, isFounder)}>
                        {(m && (isFounder ? (isEditing ? (p.edit?.founderPhoto ?? m.photo) : (m.photo || profileData.founderPhoto)) : m.photo)) ? (
                          <img src={(isFounder ? (isEditing ? (p.edit?.founderPhoto ?? m.photo) : (m.photo || profileData.founderPhoto)) : m.photo)} alt={memberName} className="avatar-img" />
                        ) : (
                          <div className="avatar-circle">{memberName.charAt(0).toUpperCase()}</div>
                        )}
                        {!isFounder && isEditing && <button className="delete-btn" onClick={(e) => { e.stopPropagation(); if (dataIdx !== null) p.removeTeamMember(dataIdx); }}>🗑</button>}
                      </div>
                      <div className="tile-caption"><div className="cap-name">{memberName}</div><div className="cap-role">{memberRole}</div></div>
                    </div>
                  );
                })}
                {teamForRender.length > 6 + offset && (
                  <div className="team-see-more" onClick={() => setShowAllTeam(s => !s)} style={{alignSelf:'center', marginTop:8}}>{showAllTeam ? 'Show less' : `+${teamForRender.length - (6 + offset)} more`}</div>
                )}
                {isEditing && (
                  <div className="team-tile add-tile" onClick={p.addTeamMember}>
                    <div className="avatar-wrap">
                      <div className="avatar-circle">+</div>
                    </div>
                    <div className="tile-caption"><div className="cap-name">Add</div></div>
                  </div>
                )}
              </>
            );
          })() : <div className="no-team">No team members added.</div>}
        </div>
      </div>

      <div className="profile-grid-cards">
        <div className="card">Startup Dock</div>
        <div className="card">TAM / SAM / SOM</div>
        <div className="card">GTM</div>
        <div className="card">Awards & Achievements</div>
      </div>

      <div className="edit-button-row">
        {!isEditing ? (
          <button className="btn btn-ghost" onClick={p.onStartEdit}>Edit Profile</button>
        ) : (
          <div style={{display:'flex', gap:12, justifyContent:'flex-end'}}>
            <button className="btn btn-secondary" onClick={p.handleCancel}>Cancel</button>
            <button className="btn btn-primary" onClick={p.handleSave}>Save</button>
          </div>
        )}
      </div>
      {/* Quick Post modal removed */}
    </div>
  );
};

export default StartupProfileView;
