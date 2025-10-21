import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { blogData } from '../../../Website/Blogs/blogData';
import { useState } from 'react';
import { getStoredUser } from '../../../auth';
import './StartupProfile.css';
import './TeamMemberModal.css';
import StartupProfileHeader from './StartupProfileHeader';

const StartupProfileView = ({ profileData, isEditing, editStateProps }) => {
  // The original view logic expects many handlers and state values; to keep this simple
  // we accept a prepared `editStateProps` object that contains: edit, setEdit, fileInputRef,
  // focusedMemberIndex, openMember, closeMember, memberEditing, setMemberEditing, memberDraft,
  // setMemberDraft, addTeamMember, removeTeamMember, changeTeamMember, saveMemberEdits,
  // handleLogoUpload, handleChange, handleSave, handleCancel, onStartEdit, tags, team, contact

  const p = editStateProps || {};
  // defensive defaults so view doesn't crash when controller provides partial props
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
  p.openMember = p.openMember || (() => {});
  p.tags = Array.isArray(p.tags) ? p.tags : [];
  p.team = Array.isArray(p.team) ? p.team : [];
  p.contact = p.contact || {};

  // ensure founder is included in the team list for display/edit
  const teamForRender = (() => {
    const founderName = (profileData && profileData.founder) ? String(profileData.founder).trim() : '';
    // choose source team depending on mode
    const sourceTeam = isEditing ? (Array.isArray(p.edit.team) ? p.edit.team.slice() : []) : (Array.isArray(p.team) ? p.team.slice() : []);
    if (!founderName) return sourceTeam;
    const hasFounder = sourceTeam.some(m => (m && m.name && String(m.name).trim().toLowerCase()) === founderName.toLowerCase());
    if (hasFounder) return sourceTeam;
    // add a founder marker so we can render it read-only in edit mode
    return [{ name: founderName, _founder: true }, ...sourceTeam];
  })();

  const navigate = useNavigate();
  const location = useLocation();
  const [showAllTeam, setShowAllTeam] = useState(false);
  // Quick post feature removed — button and modal cleaned up

  // quick post handler removed

  return (
    <div className="startup-profile-wrap">
      <div className="profile-top">
        <StartupProfileHeader profileData={profileData} isEditing={isEditing} editStateProps={editStateProps} />

        <div className="profile-right">
          <div className="blogs-card highlight">
            <h3>Posts & Blogs</h3>
            <div className="blog-list">
              {(blogData && blogData.length) ? (
                blogData.slice(0,2).map(b => (
                  <div key={`profile-blog-${b.id}`} className="blog-item">
                    <strong className="blog-title">{b.title}</strong>
                    <div className="blog-meta">{b.user} · {b.date}</div>
                  </div>
                ))
              ) : (
                <div className="muted">No posts yet.</div>
              )}

              <div style={{marginTop:8, display:'flex', gap:8}}>
                <button className="btn btn-secondary" onClick={() => {
                  const user = getStoredUser();
                  if (!user) return navigate('/auth/login');
                  const role = user.userType === 'investor' ? 'I' : 'S';
                  const username = user.username || user.name || 'handbook';
                  navigate(`/${role}/${username}/blogs`);
                }}>View all / Add post</button>
              </div>
            </div>
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
                  const memberName = (isFounder ? m.name : (p.edit.team && p.edit.team[dataIdx] && p.edit.team[dataIdx].name) || m.name) || '?';
                  const memberRole = (isFounder ? (profileData.founderRole || 'Founder') : (p.edit.team && p.edit.team[dataIdx] && p.edit.team[dataIdx].role) || m.role) || '';
                  return (
                    <div className="team-tile" key={`tile-${origIdx}`}>
                      <div className="avatar-wrap" onClick={() => p.openMember(dataIdx, isFounder)}>
                        {m && m.photo ? <img src={m.photo} alt={memberName} className="avatar-img" /> : <div className="avatar-circle">{memberName.charAt(0).toUpperCase()}</div>}
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
        <div className="card">Awards & Achievements</div>
        <div className="card">GTM</div>
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

// QuickPost modal styles/markup are appended here in the view file for simplicity. The modal
// will be shown conditionally by `showQuickPost` state above.
