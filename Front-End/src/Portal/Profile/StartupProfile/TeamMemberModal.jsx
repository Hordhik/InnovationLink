import React from 'react';
import './TeamMemberModal.css';

const TeamMemberModal = ({ focusedMemberIndex, isEditing, profileData, edit, memberEditing, memberDraft, setMemberEditing, setMemberDraft, closeMember, saveMemberEdits, changeTeamMember, openMember }) => {
  if (!focusedMemberIndex) return null;
  const { idx, isFounder } = focusedMemberIndex;
  const member = isFounder
    ? {
        name: isEditing ? (edit?.founder ?? '') : (profileData?.founder ?? ''),
        role: isEditing ? (edit?.founderRole ?? 'Founder') : (profileData?.founderRole ?? 'Founder'),
        photo: isEditing ? (edit?.founderPhoto ?? '') : (profileData?.founderPhoto ?? ''),
        equity: isEditing ? (edit?.founderEquity ?? '') : (profileData?.founderEquity ?? ''),
        experiences: isEditing ? (edit?.founderExperiences ?? []) : (profileData?.founderExperiences ?? []),
        study: isEditing ? (edit?.founderStudy ?? '') : (profileData?.founderStudy ?? ''),
        about: isEditing ? (edit?.founderAbout ?? '') : (profileData?.founderAbout ?? ''),
      }
    : ((isEditing ? edit.team && edit.team[idx] : profileData.team && profileData.team[idx]) || {});

  // helper to load file to dataURL
  const fileToDataUrl = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

  const handlePhotoChange = async (e) => {
    const f = e?.target?.files && e.target.files[0];
    if (!f) return;
    try {
      const dataUrl = await fileToDataUrl(f);
      setMemberDraft(d => ({ ...(d||{}), photo: dataUrl }));
    } catch (err) {
      // ignore
    }
  };

  return (
    <div className="member-modal-overlay" onClick={closeMember}>
      <div className="member-panel-card modal-card" onClick={(e) => e.stopPropagation()}>
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
          <h4>{member.name || 'Team Member'}</h4>
          <div style={{display:'flex', gap:8}}>
            {!memberEditing && <button className="btn btn-ghost" onClick={() => { setMemberEditing(true); setMemberDraft(member || {}); }}>Edit</button>}
            <button className="modal-close" aria-label="Close" title="Close" onClick={closeMember}>×</button>
          </div>
        </div>

            {!memberEditing ? (
              <div style={{marginTop:12}} className="member-preview-card">
                <div className="member-photo-wrap member-photo-ring">
                  {member.photo ? <img src={member.photo} alt={member.name} className="member-photo" /> : <div className="member-photo-placeholder">{(member.name||'?').charAt(0).toUpperCase()}</div>}
                </div>
                <div className="member-name" style={{marginTop:12}}>{member.name}</div>
                <div className="member-role" style={{marginTop:6}}>{(isFounder ? (member.role || 'Founder') : (member.role || '—'))}</div>

                <div className="section">
                  <div className="section-title">EQUITY</div>
                  <div className="equity-row">
                    <div className="equity-label">Owned</div>
                    <div className="equity-value">{member.equity || '—'}</div>
                  </div>
                </div>

                <div className="section">
                  <div className="section-title">PAST EXPERIENCES</div>
                  <div className="experiences-list">
                    {(member.experiences || []).length ? (member.experiences || []).map((x,ii) => <div key={ii} className="experience-pill">{x}</div>) : <div className="muted">No experiences listed.</div>}
                  </div>
                </div>

                <div className="section">
                  <div className="section-title">STUDY</div>
                  <div className="study">{member.study || '—'}</div>
                </div>

                <div className="section">
                  <div className="section-title">ABOUT</div>
                  <div className="about">{member.about || '—'}</div>
                </div>
              </div>
            ) : (
          <div style={{marginTop:12}}>
            <label className="form-label">Name</label>
            <input className="form-input" value={memberDraft?.name || ''} onChange={(e) => setMemberDraft(d => ({ ...d, name: e.target.value }))} />
            <label className="form-label" style={{marginTop:8}}>Photo</label>
            <input className="form-input" type="file" accept="image/*" onChange={handlePhotoChange} />
            <label className="form-label" style={{marginTop:8}}>Role / Title</label>
            <input className="form-input" value={memberDraft?.role || ''} onChange={(e) => setMemberDraft(d => ({ ...d, role: e.target.value }))} />
            <label className="form-label" style={{marginTop:8}}>Equity</label>
            <input className="form-input" value={memberDraft?.equity || ''} onChange={(e) => setMemberDraft(d => ({ ...d, equity: e.target.value }))} />
            <label className="form-label" style={{marginTop:8}}>Past Experiences</label>
            <div style={{display:'flex', flexDirection:'column', gap:8}}>
              {(memberDraft?.experiences && memberDraft.experiences.length ? memberDraft.experiences : ['']).map((val, i) => (
                <div key={`exp-${i}`} style={{display:'flex', gap:8, alignItems:'center'}}>
                  <input
                    className="form-input"
                    value={val || ''}
                    onChange={(e) => setMemberDraft(d => {
                      const arr = Array.isArray(d?.experiences) ? [...d.experiences] : [];
                      arr[i] = e.target.value;
                      return { ...(d||{}), experiences: arr };
                    })}
                    placeholder="e.g., Google"
                  />
                  <button
                    type="button"
                    className="btn btn-ghost"
                    onClick={() => setMemberDraft(d => {
                      const arr = Array.isArray(d?.experiences) ? [...d.experiences] : [];
                      arr.splice(i, 1);
                      return { ...(d||{}), experiences: arr };
                    })}
                    aria-label="Remove experience"
                    title="Remove"
                  >−</button>
                </div>
              ))}
              <div>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setMemberDraft(d => ({ ...(d||{}), experiences: [...(Array.isArray(d?.experiences) ? d.experiences : []), ''] }))}
                >+ Add experience</button>
              </div>
            </div>
            <label className="form-label" style={{marginTop:8}}>Study</label>
            <input className="form-input" value={memberDraft?.study || ''} onChange={(e) => setMemberDraft(d => ({ ...d, study: e.target.value }))} />
            <label className="form-label" style={{marginTop:8}}>About</label>
            <textarea className="form-input" rows={4} value={memberDraft?.about || ''} onChange={(e) => setMemberDraft(d => ({ ...d, about: e.target.value }))} />

            <div style={{display:'flex', justifyContent:'flex-end', gap:8, marginTop:12}}>
              <button className="btn btn-secondary" onClick={() => { setMemberEditing(false); setMemberDraft(null); }}>Cancel</button>
              <button className="btn btn-primary" onClick={() => saveMemberEdits(isFounder ? { idx: null, isFounder } : idx, memberDraft)}>Save</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeamMemberModal;
