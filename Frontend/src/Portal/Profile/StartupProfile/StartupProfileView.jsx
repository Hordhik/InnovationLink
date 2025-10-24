// File: StartupProfileView.jsx
import React, { useState, useEffect, useRef } from 'react';
import './StartupProfile.css';
import { Document, Page, pdfjs } from 'react-pdf';
import workerSrc from 'pdfjs-dist/legacy/build/pdf.worker.mjs?url';
pdfjs.GlobalWorkerOptions.workerSrc = workerSrc;
import FilePreview from "./FilePreview";
import Folder, { FileItem } from "./Folder";


/* ------------------------- EditModal (reusable) ------------------------- */
export function EditModal({ open, title, children, onSave, onCancel, initialFocusSelector }) {
  const backdropRef = useRef(null);
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === 'Escape') onCancel(); };
    document.addEventListener('keydown', onKey);
    setTimeout(() => {
      try {
        const el = initialFocusSelector
          ? document.querySelector(initialFocusSelector)
          : backdropRef.current?.querySelector('textarea, input');
        if (el) el.focus();
      } catch (e) {}
    }, 80);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onCancel, initialFocusSelector]);

  if (!open) return null;
  return (
    <div className="epm-backdrop" onMouseDown={(e) => { if (e.target === e.currentTarget) onCancel(); }} ref={backdropRef}>
      <div className="epm-modal">
        <div className="epm-header">
          <h3>{title}</h3>
          <button className="epm-close" onClick={onCancel} aria-label="Close">✕</button>
        </div>
        <div className="epm-body">{children}</div>
        <div className="epm-footer">
          <button className="epm-btn epm-cancel" onClick={onCancel}>Cancel</button>
          <button className="epm-btn epm-save" onClick={onSave}>Save</button>
        </div>
      </div>
    </div>
  );
}

/* ----------------------- TeamMemberModal ---------------------- */
export function TeamMemberModal({
  focusedMemberIndex, closeMember, profileData, memberDraft, setMemberDraft, saveMemberEdits
}) {
  const isOpen = Boolean(focusedMemberIndex);
  const idx = focusedMemberIndex?.idx;
  const isFounder = Boolean(focusedMemberIndex?.isFounder);
  const source = isFounder
    ? { name: profileData?.founder || '' }
    : (Array.isArray(profileData?.team) && typeof idx === 'number' && profileData.team[idx]) || { name: '' };

  const [draft, setDraft] = useState(memberDraft || source);
  useEffect(() => { setDraft(memberDraft || source); }, [focusedMemberIndex, memberDraft, source]);

  const handleChange = (field) => (e) => setDraft(prev => ({ ...prev, [field]: e.target.value }));

  const doSave = async () => {
    await saveMemberEdits(focusedMemberIndex, draft || {});
    if (typeof setMemberDraft === 'function') setMemberDraft(null);
    closeMember();
  };

  if (!isOpen) return null;
  return (
    <div className="epm-backdrop" onMouseDown={(e) => { if (e.target === e.currentTarget) closeMember(); }}>
      <div className="epm-modal epm-small">
        <div className="epm-header">
          <h3>{isFounder ? 'Edit Founder' : (draft?.name ? 'Edit Member' : 'Add member')}</h3>
          <button className="epm-close" onClick={closeMember} aria-label="Close">✕</button>
        </div>
        <div className="epm-body">
          <label className="field">Name
            <input value={draft?.name || ''} onChange={handleChange('name')} />
          </label>
          <label className="field">Role
            <input value={draft?.role || ''} onChange={handleChange('role')} />
          </label>
          <label className="field">Photo URL
            <input value={draft?.photo || ''} onChange={handleChange('photo')} placeholder="https://..." />
          </label>
          <label className="field">About
            <textarea value={draft?.about || ''} onChange={handleChange('about')} rows={4} />
          </label>
        </div>
        <div className="epm-footer">
          <button className="epm-btn epm-cancel" onClick={closeMember}>Cancel</button>
          <button className="epm-btn epm-save" onClick={doSave}>Save</button>
        </div>
      </div>
    </div>
  );
}

/* ------------------------- StartupProfileView (main UI) ------------------------- */
export default function StartupProfileView({ profileData = {}, isEditing, editStateProps }) {
  // 🔧 FIX: Local states for files/videos
  const [isPitchOpen, setPitchOpen] = useState(false);
  const [isDemoOpen, setDemoOpen] = useState(false);
  const [pitchFile, setPitchFile] = useState(null);
  const [demoFile, setDemoFile] = useState(null);
  const [demoLink, setDemoLink] = useState('');
  const [pitchURL, setPitchURL] = useState(''); // local preview URL
  const [demoURL, setDemoURL] = useState('');   // local preview URL
  // patent / trademark states (like pitchURL)
  const [isPatentOpen, setPatentOpen] = useState(false);
  const [isTrademarkOpen, setTrademarkOpen] = useState(false);
  const [patentFile, setPatentFile] = useState(null);
  const [trademarkFile, setTrademarkFile] = useState(null);
  const [patentURL, setPatentURL] = useState('');
  const [trademarkURL, setTrademarkURL] = useState('');

  const { onStartEdit, edit, setEdit, addTeamMember, openMember } = editStateProps || {};
  const [isAchievementsOpen, setAchievementsOpen] = useState(false);


  // 🔧 FIX: Handle saving locally (frontend only)
  const savePitch = () => {
    if (pitchFile) {
      const fileURL = URL.createObjectURL(pitchFile);
      setPitchURL(fileURL);
      if (setEdit) setEdit(prev => ({ ...prev, pitchDeck: fileURL, pitchFile })); // save both
    }
    setPitchOpen(false);
  };


  const savePatent = () => {
    if (patentFile) {
      const fileURL = URL.createObjectURL(patentFile);
      setPatentURL(fileURL);
      if (setEdit) setEdit(prev => ({ ...prev, patentDoc: fileURL }));
    }
    setPatentOpen(false);
    setPatentFile(null);
  };

  const saveTrademark = () => {
    if (trademarkFile) {
      const fileURL = URL.createObjectURL(trademarkFile);
      setTrademarkURL(fileURL);
      if (setEdit) setEdit(prev => ({ ...prev, trademarkDoc: fileURL }));
    }
    setTrademarkOpen(false);
    setTrademarkFile(null);
  };

  const saveDemo = () => {
    if (demoFile) {
      const videoURL = URL.createObjectURL(demoFile);
      setDemoURL(videoURL);
      if (setEdit) setEdit(prev => ({ ...prev, demoVideo: videoURL }));
    } else if (demoLink.trim()) {
      setDemoURL(demoLink.trim());
      if (setEdit) setEdit(prev => ({ ...prev, demoVideo: demoLink.trim() }));
    }
    setDemoOpen(false);
    setDemoFile(null);
    setDemoLink('');
  };

  // Sample fallback data
  const sample = {
    name: 'Aurora Health AI',
    founder: 'Hordhik Rao',
    description: 'We build ML models to predict supply needs for rural clinics...',
    domain: 'healthcare, ai, logistics',
    logo: '',
    team: [
      { name: 'Hordhik Rao', role: 'Founder & CEO', photo: '' },
      { name: 'Anya Mehta', role: 'CTO', photo: '' },
    ],
  };
  const data = (profileData && Object.keys(profileData).length) ? profileData : sample;

  const [isDescOpen, setDescOpen] = useState(false);
  const [isHeaderOpen, setHeaderOpen] = useState(false);
  const [isTagsOpen, setTagsOpen] = useState(false);

  const [descDraft, setDescDraft] = useState(data.description || '');
  const [tagsDraft, setTagsDraft] = useState((data.domain && String(data.domain).split(',').map(t => t.trim()).filter(Boolean)) || []);
  const [headerDraft, setHeaderDraft] = useState({ name: data.name || '', founder: data.founder || '' });

  useEffect(() => {
    setDescDraft(data.description || '');
    setTagsDraft((data.domain && String(data.domain).split(',').map(t => t.trim()).filter(Boolean)) || []);
    setHeaderDraft({ name: data.name || '', founder: data.founder || '' });
  }, [profileData]);

  const saveDesc = () => {
    if (setEdit) setEdit(prev => ({ ...prev, description: descDraft }));
    setDescOpen(false);
  };
  const saveHeader = () => {
    if (setEdit) setEdit(prev => ({ ...prev, name: headerDraft.name, founder: headerDraft.founder }));
    setHeaderOpen(false);
  };
  const saveTags = () => {
    if (setEdit) setEdit(prev => ({ ...prev, domain: tagsDraft.join(', ') }));
    setTagsOpen(false);
  };

  const handleAddMemberClick = () => {
    if (typeof onStartEdit === 'function') onStartEdit();
    if (typeof openMember === 'function')
      openMember({ idx: (Array.isArray(data.team) ? data.team.length : 0), isFounder: false });
  };

  return (
    // <div className="spv-root">
    //   {/* HEADER */}
    //   <div className="spv-topgrid">
    //     <div className="card spv-header" onClick={() => setHeaderOpen(true)} role="button" tabIndex={0}>
    //       <div className="spv-logo">
    //         {data.logo ? (
    //           <img src={data.logo} alt="logo" />
    //         ) : (
    //           <div className="spv-logo-placeholder">
    //             {(data.name || '').split(' ').map(s => s[0]).slice(0, 2).join('')}
    //           </div>
    //         )}
    //       </div>
    //       <div className="spv-hmeta">
    //         <h2 className="spv-title">{data.name || '—'}</h2>
    //         <div className="spv-sub">
    //           Founder: <strong>{data.founder || '—'}</strong>
    //         </div>
    //         <div className="spv-actions">
    //           <button className="btn primary">FeedBack</button>
    //           <button className="btn primary">Connect</button>
    //         </div>
    //       </div>
    //     </div>

    //     {/* DESCRIPTION */}
    //     <div className="card spv-desc" onClick={() => setDescOpen(true)} role="button" tabIndex={0}>
    //       <div className="card-title">Project Description</div>
    //       <div className="card-body">
    //         <p className="desc-text">{data.description || 'Click to add a short project description.'}</p>
    //       </div>
    //       <div className="spv-tags">
    //         {(String(data.domain || '')).split(',').filter(Boolean).slice(0, 3).map((t, i) => (
    //           <span key={i} className="chip">
    //             {t.trim()}
    //           </span>
    //         ))}
    //         <button
    //           className="chip edit-chip"
    //           onClick={(e) => {
    //             e.stopPropagation();
    //             setTagsOpen(true);
    //           }}
    //         >
    //           + Edit
    //         </button>
    //       </div>
    //     </div>
        
    //     {/* Blogs */}
    //     <div className="card spv-blogs">
    //       <div className="card-title">Recent Posts</div>
    //       <div className="card-body">
    //         <div className="blog-grid">
    //           <div className='BlogCardShort' style={{cursor: 'pointer'}}>
    //             <p className='blog-title'>Deploying tiny ML to the field</p>
    //             <p className='blog-meta'>Jan 2025 • Tech</p>
    //           </div>
    //           <div className='BlogCardShort' style={{cursor: 'pointer'}}>
    //             <p className='blog-title'>Deploying tiny ML to the field</p>
    //             <p className='blog-meta'>Jan 2025 • Tech</p>
    //           </div>
    //         </div>
    //       </div>
    //     </div>
    //   </div>

    //   {/* TEAM + BLOGS */}
    //   <div className="spv-row">
    //     <div className="card spv-team">
    //       <div className="card-title">Team</div>
    //       <div className="team-grid">
    //         {(Array.isArray(data.team) ? data.team : []).map((m, idx) => (
    //           <div key={idx} className="team-item" onClick={() => openMember(idx, false)}>
    //             <div className="team-avatar">
    //               {m.photo ? (
    //                 <img src={m.photo} alt={m.name} />
    //               ) : (
    //                 <div className="avatar-placeholder">
    //                   {(m.name || '').split(' ').map(p => p[0]).slice(0, 2).join('')}
    //                 </div>
    //               )}
    //             </div>
    //             <div className="team-meta">
    //               <div className="team-name">{m.name}</div>
    //               <div className="team-role">{m.role}</div>
    //             </div>
    //           </div>
    //         ))}
    //         <div className="team-item team-add" onClick={handleAddMemberClick}>
    //           <div className="team-add-circle">
    //             <div className="team-name">Add <br /> member</div>
    //           </div>
    //         </div>
    //       </div>
    //     </div>
    //     <div className="card patent" onClick={() => setPatentOpen(true)} role="button">
    //       <div className="card-title">Patent / Copyright</div>
    //       <div className="card-body">
    //         <FilePreview fileURL={patentURL || edit?.patentDoc} fileType={patentFile?.type} width={280} />
    //       </div>
    //     </div>


    //     <div className="card patent" onClick={() => setTrademarkOpen(true)} role="button">
    //       <div className="card-title">Trademark</div>
    //       <div className="card-body">
    //         <FilePreview fileURL={trademarkURL || edit?.trademarkDoc} fileType={trademarkFile?.type} width={250} />
    //       </div>
    //     </div>


    //   </div>

    //   {/* 🔧 FIX: Pitch Deck + Project Demo */}
    //   <div className="startup-dock">
    //     {/* Pitch Deck */}
    //     <div className="card pitch-deck" onClick={() => setPitchOpen(true)} role="button">
    //       <div className="card-title">Pitch Deck</div>
    //       <div className="card-body">
    //         <FilePreview fileURL={pitchURL || edit?.pitchDeck} fileType={pitchFile?.type} width={280} />
    //       </div>
    //     </div>

    //     {/* Project Demo */}
    //     <div className="card project-demo" onClick={() => setDemoOpen(true)} role="button" tabIndex={0}>
    //       <div className="card-title">Project Demo</div>
    //       <div className="card-body">
    //         {demoURL || edit?.demoVideo ? (
    //           (demoURL || edit.demoVideo).includes('youtube') || (demoURL || edit.demoVideo).includes('vimeo') ? (
    //             <iframe
    //               width="100%"
    //               height="220"
    //               src={demoURL || edit.demoVideo}
    //               title="Project Demo Video"
    //               frameBorder="0"
    //               allowFullScreen
    //             ></iframe>
    //           ) : (
    //             <video width="100%" height="220" controls>
    //               <source src={demoURL || edit.demoVideo} type="video/mp4" />
    //               Your browser does not support the video tag.
    //             </video>
    //           )
    //         ) : (
    //           <p className="placeholder-text">No demo video added — click to upload or add a link.</p>
    //         )}
    //       </div>
    //     </div>
    //   </div>

    //   {/* --- Market Analysis / GTM / Achievements --- */}
    //   <div className="more">
    //     {/* Market Analysis */}
    //     <div className="card market-analysis">
    //       <div className="card-title">Market Analysis</div>
    //       <div className="ma-stats">
    //         <div className="ma-item">
    //           <p className="ma-label">TAM (Total Addressable Market)</p>
    //           <div className="ma-bar"><div className="ma-fill tam" style={{ width: '100%' }}></div></div>
    //           <span className="ma-value">$10B</span>
    //         </div>
    //         <div className="ma-item">
    //           <p className="ma-label">SAM (Serviceable Available Market)</p>
    //           <div className="ma-bar"><div className="ma-fill sam" style={{ width: '65%' }}></div></div>
    //           <span className="ma-value">$6.5B</span>
    //         </div>
    //         <div className="ma-item">
    //           <p className="ma-label">SOM (Serviceable Obtainable Market)</p>
    //           <div className="ma-bar"><div className="ma-fill som" style={{ width: '25%' }}></div></div>
    //           <span className="ma-value">$2.5B</span>
    //         </div>
    //       </div>
    //     </div>

    //     {/* Go-To-Market Strategy */}
    //     <div className="card gtm">
    //       <div className="card-title">Go-To-Market Strategy</div>
    //       <ul className="gtm-points">
    //         <li><strong>Phase 1:</strong> Target 500 pilot customers through campus accelerators.</li>
    //         <li><strong>Phase 2:</strong> Partner with 3 industry leaders for joint campaigns.</li>
    //         <li><strong>Phase 3:</strong> Expand via digital marketing and B2B referrals.</li>
    //       </ul>
    //     </div>

    //     {/* Achievements */}
    //     <div className="card achievements">
    //       <div className="ach-header">
    //         <div className="card-title">Achievements</div>
    //         <button className="view-all-btn" onClick={() => setAchievementsOpen(true)}>View All</button>
    //       </div>
    //       <div className="ach-grid">
    //         {[
    //           { title: "Startup India Summit", date: "Sep 2024", outcome: "Top 10 Finalist" },
    //           { title: "Hack4Change 2024", date: "Jul 2024", outcome: "2nd Runner-up" },
    //           { title: "TechForGood Expo", date: "Jan 2025", outcome: "Best Social Impact Pitch" },
    //         ].map((a, i) => (
    //           <div className="ach-card" key={i}>
    //             <p className="ach-title">{a.title}</p>
    //             <p className="ach-date">{a.date}</p>
    //             <p className="ach-outcome">{a.outcome}</p>
    //           </div>
    //         ))}
    //       </div>
    //     </div>
    //   </div>

    //   <EditModal
    //     open={isAchievementsOpen}
    //     title="All Achievements & Event Participation"
    //     onCancel={() => setAchievementsOpen(false)}
    //     onSave={() => setAchievementsOpen(false)}
    //   >
    //     <div className="ach-modal-list">
    //       {[
    //         { title: "Startup India Summit", date: "Sep 2024", outcome: "Top 10 Finalist", desc: "Recognized among top 10 national startups for healthcare innovation." },
    //         { title: "Hack4Change 2024", date: "Jul 2024", outcome: "2nd Runner-up", desc: "Developed a data-driven donation matching app within 24 hours." },
    //         { title: "TechForGood Expo", date: "Jan 2025", outcome: "Best Social Impact Pitch", desc: "Awarded for innovative AI-enabled accessibility tool for NGOs." },
    //         { title: "AI Ignite Challenge", date: "Feb 2025", outcome: "Top 5 Teams", desc: "Built a predictive model that reduced logistics costs by 18%." }
    //       ].map((a, i) => (
    //         <div key={i} className="ach-modal-item">
    //           <h4>{a.title}</h4>
    //           <p className="ach-date">{a.date} • <strong>{a.outcome}</strong></p>
    //           <p className="ach-desc">{a.desc}</p>
    //         </div>
    //       ))}
    //     </div>
    //   </EditModal>

    //   {/* 🔧 FIX: Pitch Deck Modal */}
    //   <EditModal open={isPitchOpen} title="Upload Pitch Deck" onSave={savePitch} onCancel={() => setPitchOpen(false)}>
    //     <label className="field">Upload Pitch Deck (PDF or PPT)
    //       <input type="file" accept=".pdf,.ppt,.pptx" onChange={(e) => setPitchFile(e.target.files[0])} />
    //     </label>
    //     {pitchFile && <p>Selected: {pitchFile.name}</p>}
    //   </EditModal>

    //   {/* Patent Modal */}
    //   <EditModal open={isPatentOpen} title="Upload Patent / Copyright" onSave={savePatent} onCancel={() => setPatentOpen(false)}>
    //     <label className="field">Upload patent / copyright document (PDF, DOCX)
    //       <input type="file" accept=".pdf,.doc,.docx" onChange={(e) => setPatentFile(e.target.files[0])} />
    //     </label>
    //     {patentFile && <p>Selected: {patentFile.name}</p>}
    //   </EditModal>

    //   {/* Trademark Modal */}
    //   <EditModal open={isTrademarkOpen} title="Upload Trade Mark Document" onSave={saveTrademark} onCancel={() => setTrademarkOpen(false)}>
    //     <label className="field">Upload trademark document (PDF, DOCX)
    //       <input type="file" accept=".pdf,.doc,.docx" onChange={(e) => setTrademarkFile(e.target.files[0])} />
    //     </label>
    //     {trademarkFile && <p>Selected: {trademarkFile.name}</p>}
    //   </EditModal>

    //   {/* 🔧 FIX: Demo Modal */}
    //   <EditModal open={isDemoOpen} title="Add Project Demo" onSave={saveDemo} onCancel={() => setDemoOpen(false)}>
    //     <label className="field">Add Demo Video (MP4 file or video link)
    //       <input type="file" accept="video/mp4" onChange={(e) => setDemoFile(e.target.files[0])} />
    //     </label>
    //     <label className="field">Or paste video URL
    //       <input type="text" placeholder="https://youtube.com/..." value={demoLink} onChange={(e) => setDemoLink(e.target.value)} />
    //     </label>
    //     {demoFile && <p>Selected: {demoFile.name}</p>}
    //   </EditModal>

    //   {/* Other Modals unchanged */}
    //   <EditModal open={isDescOpen} title="Edit project description" onSave={saveDesc} onCancel={() => setDescOpen(false)}>
    //     <label className="field">Short description
    //       <input value={descDraft.split('\\n')[0] || ''} onChange={(e)=> setDescDraft(e.target.value + '\\n' + descDraft.split('\\n').slice(1).join('\\n'))} />
    //     </label>
    //     <label className="field">Long description
    //       <textarea rows={8} value={descDraft} onChange={(e)=> setDescDraft(e.target.value)} />
    //     </label>
    //   </EditModal>

    //   <EditModal open={isHeaderOpen} title="Edit header" onSave={saveHeader} onCancel={() => setHeaderOpen(false)}>
    //     <label className="field">Startup name
    //       <input value={headerDraft.name} onChange={(e)=> setHeaderDraft(prev => ({ ...prev, name: e.target.value }))} />
    //     </label>
    //     <label className="field">Founder
    //       <input value={headerDraft.founder} onChange={(e)=> setHeaderDraft(prev => ({ ...prev, founder: e.target.value }))} />
    //     </label>
    //   </EditModal>

    //   <EditModal open={isTagsOpen} title="Edit tags" onSave={saveTags} onCancel={() => setTagsOpen(false)}>
    //     <div className="tags-editor">
    //       <div className="tag-list">
    //         {tagsDraft.map((t, i) => (
    //           <span className="chip" key={i}>
    //             {t}
    //             <button className="chip-x" onClick={(ev) => {
    //               ev.stopPropagation();
    //               setTagsDraft(prev => prev.filter((_, idx) => idx !== i));
    //             }}>&times;</button>
    //           </span>
    //         ))}
    //       </div>
    //       <div className="tag-add-row">
    //         <input
    //           placeholder="Add tag and press Enter"
    //           onKeyDown={(e) => {
    //             if (e.key === 'Enter') {
    //               e.preventDefault();
    //               const v = e.target.value.trim();
    //               if (v) {
    //                 setTagsDraft(prev => prev.includes(v) ? prev : [...prev, v]);
    //                 e.target.value = '';
    //               }
    //             }
    //           }}
    //         />
    //         <button className="btn" onClick={() => {
    //           const el = document.querySelector('.tags-editor input');
    //           const v = el?.value?.trim();
    //           if (v) {
    //             setTagsDraft(prev => prev.includes(v) ? prev : [...prev, v]);
    //             el.value = '';
    //           }
    //         }}>Add</button>
    //       </div>
    //     </div>
    //   </EditModal>
    // </div>
    <Folder name="src">
        <FileItem name="index.js" />
        <FileItem name="App.jsx" />
        <Folder name="components">
          <FileItem name="Navbar.jsx" />
          <FileItem name="Footer.jsx" />
          <Folder name="ui">
            <FileItem name="Button.jsx" />
            <FileItem name="Card.jsx" />
          </Folder>
        </Folder>
      </Folder>
  );
}

/* ------------------------- END OF FILE ------------------------- */