import React from 'react';
import './TeamMemberModal.css';

const TeamMemberModal = ({ focusedMemberIndex, isEditing, profileData, edit, memberEditing, memberDraft, setMemberEditing, setMemberDraft, closeMember, saveMemberEdits, changeTeamMember, openMember }) => {
  if (!focusedMemberIndex) return null;
  const { idx, isFounder } = focusedMemberIndex;
  // Source team to help fallback to existing photos (important for founder)
  const sourceTeam = isEditing
    ? (Array.isArray(edit?.team) ? edit.team : [])
    : (Array.isArray(profileData?.team) ? profileData.team : []);
  const findTeamPhotoByName = (nm) => {
    if (!nm) return '';
    const m = sourceTeam.find(x => (x?.name || '').trim().toLowerCase() === nm.trim().toLowerCase());
    return m?.photo || '';
  };

  const member = isFounder
    ? (() => {
      const name = isEditing ? (edit?.founder ?? '') : (profileData?.founder ?? '');
      const role = isEditing ? (edit?.founderRole ?? 'Founder') : (profileData?.founderRole ?? 'Founder');
      const fallbackTeamPhoto = findTeamPhotoByName(name);
      const photo = isEditing
        ? (edit?.founderPhoto || fallbackTeamPhoto || profileData?.founderPhoto || '')
        : (profileData?.founderPhoto || fallbackTeamPhoto || '');
      return {
        name,
        role,
        photo,
        equity: isEditing ? (edit?.founderEquity ?? '') : (profileData?.founderEquity ?? ''),
        experiences: isEditing ? (edit?.founderExperiences ?? []) : (profileData?.founderExperiences ?? []),
        study: isEditing ? (edit?.founderStudy ?? '') : (profileData?.founderStudy ?? ''),
        about: isEditing ? (edit?.founderAbout ?? '') : (profileData?.founderAbout ?? ''),
      };
    })()
    : (() => {
      // If we have memberDraft (editing mode), use it; otherwise use sourceTeam[idx] or empty object
      if (memberDraft && Object.keys(memberDraft).length > 0) {
        return memberDraft;
      }
      return (Array.isArray(sourceTeam) && sourceTeam[idx]) || {};
    })();

  // helper to compress image and return dataURL with robust format fallback
  const fileToCompressedDataUrl = (file, { maxW = 800, maxH = 800, quality = 0.85, targetBytes = 1200 * 1024 } = {}) => new Promise((resolve) => {
    try {
      const img = new Image();
      const reader = new FileReader();
      reader.onload = () => {
        img.onload = () => {
          try {
            let { width, height } = img;
            const scale = Math.min(1, maxW / width, maxH / height);
            const targetW = Math.max(1, Math.round(width * scale));
            const targetH = Math.max(1, Math.round(height * scale));
            const canvas = document.createElement('canvas');
            canvas.width = targetW;
            canvas.height = targetH;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, targetW, targetH);

            const tryEncode = (mime, q) => {
              let url = '';
              try { url = canvas.toDataURL(mime, q); } catch (_) { url = ''; }
              return url;
            };

            // Try WebP first
            let out = tryEncode('image/webp', quality);
            if (!out || !out.startsWith('data:image/webp')) {
              // Fallback to JPEG
              out = tryEncode('image/jpeg', Math.min(0.9, quality));
              if (!out || !out.startsWith('data:image/jpeg')) {
                // Last resort PNG
                out = tryEncode('image/png', 1);
              }
            }

            // If too large, iteratively reduce quality for lossy formats
            const approxBytes = (dataUrl) => {
              const m = typeof dataUrl === 'string' && dataUrl.match(/^data:[^;]+;base64,(.+)$/);
              if (!m) return 0;
              const b64 = m[1];
              return Math.floor((b64.length * 3) / 4);
            };

            let curQ = quality;
            let tries = 0;
            const isLossy = (url) => url && (url.startsWith('data:image/webp') || url.startsWith('data:image/jpeg'));
            while (out && isLossy(out) && approxBytes(out) > targetBytes && curQ > 0.5 && tries < 4) {
              curQ -= 0.1;
              // prefer same mime as current
              if (out.startsWith('data:image/webp')) out = tryEncode('image/webp', curQ);
              else out = tryEncode('image/jpeg', curQ);
              tries++;
            }

            resolve(out || reader.result);
          } catch (e) {
            // Fallback to raw data URL
            resolve(reader.result);
          }
        };
        img.onerror = () => resolve(reader.result);
        img.src = reader.result;
      };
      reader.onerror = () => resolve('');
      reader.readAsDataURL(file);
    } catch (e) {
      // As a last resort, return empty
      resolve('');
    }
  });

  const handlePhotoChange = async (e) => {
    const f = e?.target?.files && e.target.files[0];
    if (!f) return;
    try {
      const dataUrl = await fileToCompressedDataUrl(f);
      setMemberDraft(d => ({ ...(d || {}), photo: dataUrl }));
    } catch (err) {
      // ignore
    }
  };

  return (
    <div className="member-modal-overlay" onClick={closeMember}>
      <div className="member-panel-card modal-card" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h4>{member.name || (memberEditing ? 'Add Team Member' : 'Team Member')}</h4>
          <div style={{ display: 'flex', gap: 8 }}>
            {!memberEditing && <button className="btn btn-ghost" onClick={() => { setMemberEditing(true); setMemberDraft(member || {}); }}>Edit</button>}
            <button className="modal-close" aria-label="Close" title="Close" onClick={closeMember}>×</button>
          </div>
        </div>

        {!memberEditing ? (
          <div style={{ marginTop: 12 }} className="member-preview-card">
            <div className="member-photo-wrap member-photo-ring">
              {member.photo ? <img src={member.photo} alt={member.name} className="member-photo" /> : <div className="member-photo-placeholder">{(member.name || '?').charAt(0).toUpperCase()}</div>}
            </div>
            <div className="member-name" style={{ marginTop: 12 }}>{member.name}</div>
            <div className="member-role" style={{ marginTop: 6 }}>{(isFounder ? (member.role || 'Founder') : (member.role || '—'))}</div>

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
                {(member.experiences || []).length ? (member.experiences || []).map((x, ii) => <div key={ii} className="experience-pill">{x}</div>) : <div className="muted">No experiences listed.</div>}
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
          <div style={{ marginTop: 12 }}>
            <label className="form-label" htmlFor={`member-name-${isFounder ? 'founder' : idx}`}>Name</label>
            <input
              id={`member-name-${isFounder ? 'founder' : idx}`}
              className="form-input"
              name="name"
              value={memberDraft?.name || ''}
              onChange={(e) => setMemberDraft(d => ({ ...d, name: e.target.value }))}
              autoComplete="name"
            />
            <label className="form-label" style={{ marginTop: 8 }} htmlFor={`member-photo-${isFounder ? 'founder' : idx}`}>Photo</label>
            <input
              id={`member-photo-${isFounder ? 'founder' : idx}`}
              className="form-input"
              type="file"
              name="photo"
              accept="image/*"
              onChange={handlePhotoChange}
            />
            <label className="form-label" style={{ marginTop: 8 }} htmlFor={`member-role-${isFounder ? 'founder' : idx}`}>Role / Title</label>
            <input
              id={`member-role-${isFounder ? 'founder' : idx}`}
              className="form-input"
              name="role"
              value={memberDraft?.role || ''}
              onChange={(e) => setMemberDraft(d => ({ ...d, role: e.target.value }))}
              autoComplete="organization-title"
            />
            <label className="form-label" style={{ marginTop: 8 }} htmlFor={`member-equity-${isFounder ? 'founder' : idx}`}>Equity</label>
            <input
              id={`member-equity-${isFounder ? 'founder' : idx}`}
              className="form-input"
              name="equity"
              value={memberDraft?.equity || ''}
              onChange={(e) => setMemberDraft(d => ({ ...d, equity: e.target.value }))}
            />
            <label className="form-label" style={{ marginTop: 8 }}>Past Experiences</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {(memberDraft?.experiences && memberDraft.experiences.length ? memberDraft.experiences : ['']).map((val, i) => (
                <div key={`exp-${i}`} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <input
                    className="form-input"
                    id={`member-exp-${isFounder ? 'founder' : idx}-${i}`}
                    name={`experience-${i}`}
                    value={val || ''}
                    onChange={(e) => setMemberDraft(d => {
                      const arr = Array.isArray(d?.experiences) ? [...d.experiences] : [];
                      arr[i] = e.target.value;
                      return { ...(d || {}), experiences: arr };
                    })}
                    placeholder="e.g., Google"
                    aria-label={`Experience ${i + 1}`}
                  />
                  <button
                    type="button"
                    className="btn btn-ghost"
                    onClick={() => setMemberDraft(d => {
                      const arr = Array.isArray(d?.experiences) ? [...d.experiences] : [];
                      arr.splice(i, 1);
                      return { ...(d || {}), experiences: arr };
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
                  onClick={() => setMemberDraft(d => ({ ...(d || {}), experiences: [...(Array.isArray(d?.experiences) ? d.experiences : []), ''] }))}
                >+ Add experience</button>
              </div>
            </div>
            <label className="form-label" style={{ marginTop: 8 }} htmlFor={`member-study-${isFounder ? 'founder' : idx}`}>Study</label>
            <input
              id={`member-study-${isFounder ? 'founder' : idx}`}
              className="form-input"
              name="study"
              value={memberDraft?.study || ''}
              onChange={(e) => setMemberDraft(d => ({ ...d, study: e.target.value }))}
            />
            <label className="form-label" style={{ marginTop: 8 }} htmlFor={`member-about-${isFounder ? 'founder' : idx}`}>About</label>
            <textarea
              id={`member-about-${isFounder ? 'founder' : idx}`}
              className="form-input"
              name="about"
              rows={4}
              value={memberDraft?.about || ''}
              onChange={(e) => setMemberDraft(d => ({ ...d, about: e.target.value }))}
            />

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 12 }}>
              <button type="button" className="btn btn-secondary" onClick={() => { setMemberEditing(false); setMemberDraft(null); }}>Cancel</button>
              <button 
                type="button" 
                className="btn btn-primary" 
                onClick={() => {
                  // Basic validation
                  if (!memberDraft?.name?.trim()) {
                    alert('Please enter a name for the team member');
                    return;
                  }
                  saveMemberEdits(isFounder ? { idx: null, isFounder } : idx, memberDraft);
                }}
              >
                Save
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeamMemberModal;
