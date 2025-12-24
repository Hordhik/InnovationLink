// File: StartupProfileView.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './StartupProfile.css';
import { Document, Page, pdfjs } from 'react-pdf';
import workerSrc from 'pdfjs-dist/legacy/build/pdf.worker.mjs?url';
pdfjs.GlobalWorkerOptions.workerSrc = workerSrc;
import FilePreview from "./FilePreview";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import feedback from '../../../assets/Portal/feedback.png';
import user from '../../../assets/Portal/user.svg';

// -----------------------------------------------------------------
// 1. IMPORT THE NEW API SERVICE
// -----------------------------------------------------------------
import * as startupDockApi from '../../../services/startupDockApi.js';
import { getPostsByUserId } from '../../../services/postApi.js';
import { getToken } from '../../../auth.js'; // Need this for file URLs


// Helper function to read file as Data URI
const fileToDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

// -----------------------------------------------------------------
// 2. UPDATED DOCKFOLDER COMPONENT (with Drag & Drop)
// -----------------------------------------------------------------
const DockFolder = ({ name, category, files = [], onUpdate, accept }) => {
  const [open, setOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const [isDragging, setIsDragging] = useState(false); // <-- NEW: State for drag UI
  const fileInputRef = useRef(null);
  const fileLimit = 5;

  // NEW: Reusable function to handle file processing
  const processFiles = async (fileList) => {
    const newFiles = Array.from(fileList);
    if (newFiles.length === 0) return;

    if (files.length + newFiles.length > fileLimit) {
      setError(`You can only upload a maximum of ${fileLimit} files.`);
      return;
    }

    setIsUploading(true);
    setError('');

    try {
      for (const file of newFiles) {
        // Simple client-side validation for 'accept' prop
        const fileType = file.type;
        const fileExt = `.${file.name.split('.').pop()}`;
        const allowed = accept.split(',').map(a => a.trim());

        if (!allowed.includes(fileType) && !allowed.includes(fileExt)) {
          console.warn(`Skipping file ${file.name}: Type ${fileType} not accepted.`);
          continue; // Skip this file
        }

        const fileDataURI = await fileToDataUrl(file);
        await startupDockApi.uploadFile(category, file.name, fileDataURI);
      }
      onUpdate(); // Refresh the file list from backend
    } catch (err) {
      setError(err.response?.data?.message || 'File upload failed.');
    } finally {
      setIsUploading(false);
      // Clear the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = null;
      }
    }
  };

  // UPDATED: Handles click-to-upload
  const handleFileClickUpload = (e) => {
    processFiles(e.target.files);
  };

  // --- NEW: Drag & Drop Handlers ---
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isUploading) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (files.length >= fileLimit || isUploading) {
      return; // Don't process drop if limit reached or uploading
    }

    processFiles(e.dataTransfer.files);
  };
  // -----------------------------------

  const handleDelete = async (file_id) => {
    if (window.confirm('Are you sure you want to delete this file?')) {
      try {
        await startupDockApi.deleteFile(file_id);
        onUpdate();
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to delete file.');
      }
    }
  };

  const handleSetPrimary = async (file_id) => {
    try {
      await startupDockApi.setPrimaryFile(file_id, category);
      onUpdate();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to set primary file.');
    }
  };

  // Helper to get the full, token-authenticated URL for viewing
  const getFileUrlWithToken = (file_id) => {
    const token = getToken();
    return `${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/startup-dock/files/${file_id}/data?token=${token}`;
  };

  return (
    // NEW: Added drag handlers and conditional 'dragging' class
    <div
      className={`folder ${isDragging ? 'dragging' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="folder-header" onClick={() => setOpen(!open)}>
        <span className="folder-icon">{open ? " 📂 " : " 📁 "}</span>
        <span className="folder-name">{name}</span>
        <span className="folder-count">({files.length} / {fileLimit})</span>
      </div>
      {open && (
        <div className="folder-body">
          {/* NEW: Drop-zone overlay, only visible when dragging */}
          {isDragging && (
            <div className="drop-zone-overlay">
              <span>Drop files to upload</span>
            </div>
          )}

          {error && <p className="empty-text" style={{ color: 'red' }}>{error}</p>}

          {files.length === 0 ? (
            <p className="empty-text">No files added yet. Drag & drop here.</p>
          ) : (
            files.map((f) => (
              <div key={f.file_id} className="file-item-row">
                <a
                  href={getFileUrlWithToken(f.file_id)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="file-name"
                  title={`View ${f.name}`}
                >
                  📄 {f.name}
                </a>
                <div className="file-actions">
                  {f.is_primary ? (
                    <span className="primary-badge">Primary</span>
                  ) : (
                    <button className="file-action-btn" onClick={() => handleSetPrimary(f.file_id)}>
                      Make Primary
                    </button>
                  )}
                  <button className="file-delete" onClick={() => handleDelete(f.file_id)} title="Delete file">
                    🗑️
                  </button>
                </div>
              </div>
            ))
          )}

          {/* UPDATED: 'onChange' handler changed */}
          <label className={`upload-btn ${files.length >= fileLimit || isUploading ? 'disabled' : ''}`}>
            {isUploading ? 'Uploading...' : '➕ Add Files (or drag & drop)'}
            <input
              type="file"
              multiple
              accept={accept}
              onChange={handleFileClickUpload} // <-- UPDATED
              ref={fileInputRef}
              style={{ display: "none" }}
              disabled={files.length >= fileLimit || isUploading}
            />
          </label>
        </div>
      )}
    </div>
  );
};


/* ------------------------- EditModal (reusable) ------------------------- */
// ... (Your existing EditModal component is fine, no changes needed)
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
      } catch (e) { }
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
/* ------------------------- StartupProfileView (main UI) ------------------------- */
export default function StartupProfileView({ profileData = {}, isEditing, editStateProps }) {
  const navigate = useNavigate();
  const location = useLocation();
  //  🔧  REMOVED OLD LOCAL FILE STATES

  const { onStartEdit, edit, setEdit, addTeamMember, openMember } = editStateProps || {};
  const [isAchievementsOpen, setAchievementsOpen] = useState(false);
  const [isDockOpen, setDockOpen] = useState(false);

  // -----------------------------------------------------------------
  // 3. ADD NEW STATE AND LOADER FOR DOCK FILES
  // -----------------------------------------------------------------
  const [dockFiles, setDockFiles] = useState({ pitch: [], demo: [], patent: [] });
  const [dockError, setDockError] = useState('');

  const loadDockFiles = async () => {
    try {
      setDockError('');
      const data = await startupDockApi.getMyDock();
      setDockFiles(data.files || { pitch: [], demo: [], patent: [] });
    } catch (err) {
      setDockError(err.response?.data?.message || 'Failed to load dock files.');
    }
  };

  // Load dock files when the component mounts
  useEffect(() => {
    loadDockFiles();
  }, []);

  // -----------------------------------------------------------------
  // 4. ADD POSTS FETCHING
  // -----------------------------------------------------------------
  const [posts, setPosts] = useState([]);
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        // If we have a user ID in profileData (public view context) use that,
        // otherwise assume we are the logged-in user and fetch "my posts"
        if (profileData?.userId) {
          const data = await getPostsByUserId(profileData.userId);
          setPosts(data.posts || []);
        } else {
          // Fallback or default to my posts if no specific user ID is passed
          // This assumes the parent component might pass userId even for own profile,
          // or we can use getMyPosts if imported.
          // For now, let's try to use getMyPosts if available or skip.
          try {
            const { getMyPosts } = await import('../../../services/postApi');
            const data = await getMyPosts();
            setPosts(data.posts || []);
          } catch (e) {
            console.log("Could not fetch my posts", e);
          }
        }
      } catch (err) {
        console.error("Failed to fetch posts for profile view", err);
      }
    };
    fetchPosts();
  }, [profileData?.userId]);

  useEffect(() => {
    if (location.hash === '#connections') {
      const el = document.getElementById('connected-investors-section');
      if (el) {
        // Small timeout to ensure rendering
        setTimeout(() => {
          el.scrollIntoView({ behavior: 'smooth' });
        }, 500);
      }
    }
  }, [location]);

  //  🔧  REMOVED OLD LOCAL savePitch, savePatent, saveDemo functions

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
  }, [profileData]); // Keep this useEffect

  const saveDesc = () => {
    if (setEdit) setEdit(prev => ({ ...prev, description: descDraft }));
    if (typeof editStateProps?.handleSave === 'function') {
      editStateProps.handleSave({ description: descDraft });
    }
    setDescOpen(false);
  };
  const saveHeader = () => {
    if (setEdit) setEdit(prev => ({ ...prev, name: headerDraft.name, founder: headerDraft.founder }));
    if (typeof editStateProps?.handleSave === 'function') {
      editStateProps.handleSave({ name: headerDraft.name, founder: headerDraft.founder });
    }
    setHeaderOpen(false);
  };
  const saveTags = () => {
    const domainStr = tagsDraft.join(', ');
    if (setEdit) setEdit(prev => ({ ...prev, domain: domainStr }));
    if (typeof editStateProps?.handleSave === 'function') {
      editStateProps.handleSave({ domain: domainStr });
    }
    setTagsOpen(false);
  };
  const handleAddMemberClick = () => {
    if (typeof onStartEdit === 'function') onStartEdit();
    if (typeof addTeamMember === 'function') addTeamMember();
    if (typeof openMember === 'function')
      openMember((Array.isArray(data.team) ? data.team.length : 0), false);
  };

  return (
    <div className="spv-root">
      { /* HEADER */}
      <div className="spv-topgrid">
        <div className="card spv-header" onClick={() => setHeaderOpen(true)} role="button" tabIndex={0}>
          <div className='main-details'>
            <div className="spv-logo">
              {data.logo ? (
                <img src={data.logo} alt="logo" />
              ) : (
                <div className="spv-logo-placeholder">
                  {(data.name || '').split(' ').map(s => s[0]).slice(0, 2).join('')}
                </div>
              )}
            </div>
            <div className="spv-hmeta">
              <h2 className="spv-title">{data.name || '—'}</h2>
              {data.username ? (
                <div className="spv-sub" style={{ opacity: 0.85 }}>
                  @{data.username}
                </div>
              ) : null}
              <div className="spv-sub">
                Founder: <strong>{data.founder || '—'}</strong>
              </div>
            </div>
          </div>
          <div className="spv-actions">
            <button className="feedback"><img src={feedback} alt="" />FeedBack</button>
            <button className="connect-btn" onClick={() => navigate('/S/connections')}><img src={user} alt="" />My Connections</button>
          </div>
        </div>
        { /* DESCRIPTION */}
        <div className="card spv-desc" onClick={() => setDescOpen(true)} role="button" tabIndex={0}>
          <div className="card-title">Project Description</div>
          <div className="card-body">
            <p className="desc-text">{data.description || 'Click to add a description.'}</p>
          </div>
          <div className="spv-tags">
            {(String(data.domain || '')).split(',').filter(Boolean).slice(0, 3).map((t, i) => (
              <span key={i} className="chip">
                {t.trim()}
              </span>
            ))}
            <button
              className="chip edit-chip"
              onClick={(e) => {
                e.stopPropagation();
                setTagsOpen(true);
              }}
            >
              + Edit
            </button>
          </div>
        </div>
        { /* STARTUP DOCK */}
        <div className="card startup-dock" onClick={() => setDockOpen(true)} role="button">
          <div className="card-title">Startup Dock</div>
          <div className="card-body">
            <p className="placeholder-text">Click to open Pitch Decks, Demos, and IP Documents.</p>
          </div>
        </div>
      </div>
      { /* TEAM + BLOGS */}
      <div className="spv-row">
        <div className="card spv-team">
          <div className="card-title">Team</div>
          <div className="team-grid">
            {(Array.isArray(data.team) ? data.team : []).map((m, idx) => {
              // Check if this member is the founder
              const isFounder = m.role?.toLowerCase() === 'founder' || m.designation?.toLowerCase() === 'founder';
              return (
                <div key={idx} className="team-item" onClick={() => openMember(idx, isFounder)}>
                  <div className="team-avatar">
                    {m.photo ? (
                      <img src={m.photo} alt={m.name} />
                    ) : (
                      <div className="avatar-placeholder">
                        {(m.name || '').split(' ').map(p => p[0]).slice(0, 2).join('')}
                      </div>
                    )}
                  </div>
                  <div className="team-meta">
                    <div className="team-name">{m.name}</div>
                    <div className="team-role">{m.role || m.designation || 'Team Member'}</div>
                  </div>
                </div>
              );
            })}
            <div className="team-item team-add" onClick={handleAddMemberClick}>
              <div className="team-add-circle">
                <div className="team-name">Add <br /> member</div>
              </div>
            </div>
          </div>
        </div>
        <div className="card gtm">
          <div className="card-title">Go-To-Market Strategy</div>
          <ul className="gtm-points">
            <li><strong>Phase 1:</strong> Target 500 pilot customers through campus accelerators.</li>
            <li><strong>Phase 2:</strong> Partner with 3 industry leaders for joint campaigns.</li>
            <li><strong>Phase 3:</strong> Expand via digital marketing and B2B referrals.</li>
          </ul>
        </div>
      </div>
      { /* --- Market Analysis / GTM / Achievements --- */}
      <div className="more">
        { /* 🚀  STARTUP DOCK */}

        {/* --- Connected Investors --- */}


        { /* Achievements */}
        <div className="card achievements">
          <div className="ach-header">
            <div className="card-title">Achievements</div>
            <button className="view-all-btn" onClick={() => setAchievementsOpen(true)}>View All</button>
          </div>
          <div className="ach-grid">
            {[
              { title: "Startup India Summit", date: "Sep 2024", outcome: "Top 10 Finalist" },
              { title: "Hack4Change 2024", date: "Jul 2024", outcome: "2nd Runner-up" },
              { title: "TechForGood Expo", date: "Jan 2025", outcome: "Best Social Impact Pitch" },
              { title: "TechForGood Expo", date: "Jan 2025", outcome: "Best Social Impact Pitch" },
            ].map((a, i) => (
              <div className="ach-card" key={i}>
                <div className="event">
                  <p className="ach-title">{a.title}</p>
                  <p className="ach-outcome">{a.outcome}</p>
                </div>
                <p className="ach-date">{a.date}</p>
              </div>
            ))}
          </div>
        </div>
        { /* 📊  Market Analysis */}
        <div className="card market-analysis">
          <div className="card-title">Market Analysis</div>
          <div className="card-body">
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={[
                    { name: "TAM", value: 10, label: "$10B" },
                    { name: "SAM", value: 6.5, label: "$6.5B" },
                    { name: "SOM", value: 2.5, label: "$2.5B" },
                  ]}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  label={({ name, value }) => `${name}: $${value}B`}
                  labelLine={false}
                >
                  <Cell fill="#0073e6" />  { /* TAM */}
                  <Cell fill="#00c49f" />  { /* SAM */}
                  <Cell fill="#ffbb28" />  { /* SOM */}
                </Pie>
                <Tooltip formatter={(value) => `$${value}B`} />
                <Legend verticalAlign="bottom" align="center" iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        { /* Blogs */}
        <div className="card spv-blogs">
          <div className="card-title">Recent Posts</div>
          <div className="card-body">
            {posts.length === 0 ? (
              <p style={{ color: '#6b7280', padding: '10px 0' }}>No posts yet.</p>
            ) : (
              <div className="blog-grid">
                {posts.slice(0, 2).map((post) => (
                  <div
                    key={post.id}
                    className='BlogCardShort'
                    style={{ cursor: 'pointer' }}
                    onClick={() => navigate(`/posts/${post.id}`)}
                  >
                    <p className='blog-title'>{post.title}</p>
                    <p className='blog-meta'>
                      {new Date(post.created_at).toLocaleDateString()} • {post.tags && post.tags[0] ? post.tags[0] : 'General'}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      { /* ----------------------------------------------------------------- */}
      { /* 4. UPDATE THE STARTUP DOCK MODAL */}
      { /* ----------------------------------------------------------------- */}
      <EditModal
        open={isDockOpen}
        title="Startup Dock"
        onCancel={() => setDockOpen(false)}
        onSave={() => setDockOpen(false)}
      >
        <div className="folder-container">
          {dockError && <p style={{ color: 'red' }}>{dockError}</p>}
          <DockFolder
            name="Pitch Deck"
            category="pitch"
            files={dockFiles.pitch}
            onUpdate={loadDockFiles}
            accept=".pdf,.ppt,.pptx"
          />
          <DockFolder
            name="Project Demo"
            category="demo"
            files={dockFiles.demo}
            onUpdate={loadDockFiles}
            accept="video/mp4,video/mkv,video/webm"
          />
          <DockFolder
            name="Patent / Copyright"
            category="patent"
            files={dockFiles.patent}
            onUpdate={loadDockFiles}
            accept=".pdf,.doc,.docx"
          />
        </div>
      </EditModal>

      {/* --- ALL OTHER MODALS --- */}

      <EditModal
        open={isAchievementsOpen}
        title="All Achievements & Event Participation"
        onCancel={() => setAchievementsOpen(false)}
        onSave={() => setAchievementsOpen(false)}
      >
        <div className="ach-modal-list">
          {[
            { title: "Startup India Summit", date: "Sep 2024", outcome: "Top 10 Finalist", desc: "Recognized among top 10 national startups for healthcare innovation." },
            { title: "Hack4Change 2024", date: "Jul 2024", outcome: "2nd Runner-up", desc: "Developed a data-driven donation matching app within 24 hours." },
            { title: "TechForGood Expo", date: "Jan 2025", outcome: "Best Social Impact Pitch", desc: "Awarded for innovative AI-enabled accessibility tool for NGOs." },
            { title: "AI Ignite Challenge", date: "Feb 2025", outcome: "Top 5 Teams", desc: "Built a predictive model that reduced logistics costs by 18%." }
          ].map((a, i) => (
            <div key={i} className="ach-modal-item">
              <h4>{a.title}</h4>
              <p className="ach-date">{a.date} • <strong>{a.outcome}</strong></p>
              <p className="ach-desc">{a.desc}</p>
            </div>
          ))}
        </div>
      </EditModal>

      { /* REMOVED OLD Pitch Deck, Patent, and Demo Modals */}

      <EditModal open={isDescOpen} title="Edit description" onSave={saveDesc} onCancel={() => setDescOpen(false)}>
        <label className="field">Description
          <textarea rows={8} value={descDraft} onChange={(e) => setDescDraft(e.target.value)} />
        </label>
      </EditModal>
      <EditModal open={isHeaderOpen} title="Edit header" onSave={saveHeader} onCancel={() => setHeaderOpen(false)}>
        <label className="field">Startup name
          <input value={headerDraft.name} onChange={(e) => setHeaderDraft(prev => ({ ...prev, name: e.target.value }))} />
        </label>
        <label className="field">Founder
          <input value={headerDraft.founder} onChange={(e) => setHeaderDraft(prev => ({ ...prev, name: e.target.value }))} />
        </label>
      </EditModal>
      <EditModal open={isTagsOpen} title="Edit tags" onSave={saveTags} onCancel={() => setTagsOpen(false)}>
        <div className="tags-editor">
          <div className="tag-list">
            {tagsDraft.map((t, i) => (
              <span className="chip" key={i}>
                {t}
                <button className="chip-x" onClick={(ev) => {
                  ev.stopPropagation();
                  setTagsDraft(prev => prev.filter((_, idx) => idx !== i));
                }}>&times;</button>
              </span>
            ))}
          </div>
          <div className="tag-add-row">
            <input
              placeholder="Add tag and press Enter"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  const v = e.target.value.trim();
                  if (v) {
                    setTagsDraft(prev => prev.includes(v) ? prev : [...prev, v]);
                    e.target.value = '';
                  }
                }
              }}
            />
            <button className="btn" onClick={() => {
              const el = document.querySelector('.tags-editor input');
              const v = el?.value?.trim();
              if (v) {
                setTagsDraft(prev => prev.includes(v) ? prev : [...prev, v]);
                el.value = '';
              }
            }}>Add</button>
          </div>
        </div>
      </EditModal>
    </div>
  );
}

