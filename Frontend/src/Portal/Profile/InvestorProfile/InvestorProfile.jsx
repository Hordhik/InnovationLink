import React, { useEffect, useRef, useState } from 'react';
import InvestorCard from './InvestorCard.jsx';
import AboutSection from './AboutSection.jsx';
import ExpertiseSection from './ExpertiseSection.jsx';
import InvestLike from './InvestLike.jsx';
import SectorsInterested from './SectorsInterested.jsx';
import StageFocus from './StageFocus.jsx';
import ConnectedStartups from './ConnectedStartups.jsx';
import './InvestorProfile.css';
import InvestorForm from './InvestorForm.jsx';

const initialInvestorData = {
  name: "Chandra Sekhar",
  title: "Founder",
  location: "Hyderabad, India",
  about:
    "Lorem ipsum is simply dummy text of the printing and typesetting industry. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged.",
  expertise: [
    "Product Strategy",
    "Market Analysis",
    "Scaling Teams",
    "Fundraising",
    "Go-to-Market",
  ],
  sectors: ["HealthTech", "RuralTech", "SaaS", "Clean Energy"],
  stages: ["Pre-seed", "MVP Ready"],
  investLike:
    "I prefer investing in early-stage startups that focus on sustainable innovation and long-term scalability.",
  image: "",
  linkedin: "",
  twitter: "",
  email: "",
  startups: [
    { name: "EcoPack Solutions", founder: "Jane Doe", tags: ["HealthTech", "GreenTech"] },
    { name: "Synapse Minds AI", founder: "John Smith", tags: ["AI/ML", "FinTech"] },
    { name: "Seismo AI @ Triby", founder: "Alice Johnson", tags: ["AI/ML", "CyberSecurity"] },
    { name: "AquaFlow Innovations", founder: "Bob White", tags: ["Clean Energy", "WaterTech"] },
  ],
};

// ✅ Reusable Modal
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
    <div
      className="epm-backdrop"
      onMouseDown={(e) => { if (e.target === e.currentTarget) onCancel(); }}
      ref={backdropRef}
    >
      <div className="epm-modal">
        <div className="epm-header">
          <h3>{title}</h3>
          <button className="epm-close" onClick={onCancel}>✕</button>
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

export default function InvestorProfile() {
  // state
  // const [investorData, setInvestorData] = useState(initialInvestorData);

  // refs
  // const fileInputRef = useRef(null);

  // modal states
  // const [isDescOpen, setDescOpen] = useState(false);
  // const [isHeaderOpen, setHeaderOpen] = useState(false);
  // const [isExpertiseOpen, setExpertiseOpen] = useState(false);
  // const [isInvestOpen, setInvestOpen] = useState(false);
  // const [isTagsOpen, setTagsOpen] = useState(false);
  // const [isStageOpen, setStageOpen] = useState(false);

  // drafts
  // const [descDraft, setDescDraft] = useState("");
  // const [headerDraft, setHeaderDraft] = useState({
  //   name: "",
  //   title: "",
  //   location: "",
  //   image: "",
  //   linkedin: "",
  //   twitter: "",
  //   email: "",
  // });
  // const [expertiseDraft, setExpertiseDraft] = useState([]);
  // const [investDesc, setInvestDesc] = useState("");
  // const [tagsDraft, setTagsDraft] = useState([]);
  // const [stageDraft, setStageDraft] = useState([]);

  // preload modal data
  // const handleOpenDesc = () => { setDescDraft(investorData.about); setDescOpen(true); };
  // const handleOpenHeader = () => {
  //   setHeaderDraft({
  //     name: investorData.name,
  //     title: investorData.title,
  //     location: investorData.location,
  //     image: investorData.image,
  //     linkedin: investorData.linkedin,
  //     twitter: investorData.twitter,
  //     email: investorData.email,
  //   });
  //   setHeaderOpen(true);
  // };
  // const handleOpenExpertise = () => { setExpertiseDraft(investorData.expertise); setExpertiseOpen(true); };
  // const handleOpenInvest = () => { setInvestDesc(investorData.investLike); setInvestOpen(true); };
  // const handleOpenTags = () => { setTagsDraft(investorData.sectors); setTagsOpen(true); };
  // const handleOpenStage = () => { setStageDraft(investorData.stages); setStageOpen(true); };

  // save handlers
  // const saveDesc = () => { setInvestorData(prev => ({ ...prev, about: descDraft })); setDescOpen(false); };
  // const saveHeader = () => {
  //   setInvestorData(prev => ({ ...prev, ...headerDraft }));
  //   setHeaderOpen(false);
  // };
  // const saveExpertise = () => { setInvestorData(prev => ({ ...prev, expertise: expertiseDraft })); setExpertiseOpen(false); };
  // const saveInvest = () => { setInvestorData(prev => ({ ...prev, investLike: investDesc })); setInvestOpen(false); };
  // const saveTags = () => { setInvestorData(prev => ({ ...prev, sectors: tagsDraft })); setTagsOpen(false); };
  // const saveStage = () => { setInvestorData(prev => ({ ...prev, stages: stageDraft })); setStageOpen(false); };

  // return (
  //   <div className="investor-profile-page">
  //     {/* --- Row 1 --- */}
  //     <div className="investor-row">
  //       <InvestorCard data={investorData} onClick={handleOpenHeader} />
  //       <AboutSection about={investorData.about} name={investorData.name} onClick={handleOpenDesc} />
  //       <ExpertiseSection expertise={investorData.expertise} onClick={handleOpenExpertise} />
  //     </div>

  //     {/* --- Row 2 --- */}
  //     <div className="investor-row">
  //       <InvestLike
  //         description={investorData.investLike}
  //         onClick={handleOpenInvest}
  //       />
  //       <SectorsInterested sectors={investorData.sectors} onClick={handleOpenTags} />
  //       <StageFocus stages={investorData.stages} onClick={handleOpenStage} />
  //     </div>

  //     {/* --- Row 3 --- */}
  //     <div className="investor-row full-width">
  //       <ConnectedStartups startups={investorData.startups} />
  //     </div>

  //     {/* --- Modals --- */}

  //     {/* About */}
  //     <EditModal open={isDescOpen} title="Edit Description" onSave={saveDesc} onCancel={() => setDescOpen(false)}>
  //       <textarea
  //         rows={8}
  //         value={descDraft}
  //         onChange={(e) => setDescDraft(e.target.value)}
  //         className="form-input"
  //       />
  //     </EditModal>

  //     {/* Header */}
  //     <EditModal
  //       open={isHeaderOpen}
  //       title="Edit Investor Profile"
  //       onSave={saveHeader}
  //       onCancel={() => setHeaderOpen(false)}
  //     >
  //       <div className="edit-header-form">
  //         {/* --- Profile Image Upload --- */}
  //         <div className="edit-photo-upload">
  //           <label className="form-label">Profile Image</label>
  //           <div className="photo-upload-area">
  //             <img
  //               src={headerDraft.image || 'https://placehold.co/90x90/eef2ff/4f46e5?text=Photo'}
  //               alt="Investor avatar"
  //               className="profile-photo-preview"
  //             />
  //             <div>
  //               <button
  //                 type="button"
  //                 className="btn btn-secondary"
  //                 onClick={() => fileInputRef.current?.click()}
  //               >
  //                 Upload
  //               </button>
  //               <input
  //                 ref={fileInputRef}
  //                 type="file"
  //                 accept="image/*"
  //                 className="hidden-input"
  //                 onChange={(e) => {
  //                   const file = e.target.files?.[0];
  //                   if (file) {
  //                     const reader = new FileReader();
  //                     reader.onloadend = () => {
  //                       setHeaderDraft((prev) => ({ ...prev, image: reader.result }));
  //                     };
  //                     reader.readAsDataURL(file);
  //                   }
  //                 }}
  //               />
  //             </div>
  //           </div>
  //         </div>

  //         {/* --- Basic Info --- */}
  //         <div className="input-wrapper">
  //           <label className="form-label">Full Name</label>
  //           <input
  //             value={headerDraft.name}
  //             onChange={(e) => setHeaderDraft(prev => ({ ...prev, name: e.target.value }))}
  //             className="form-input"
  //             placeholder="e.g., Chandra Sekhar"
  //           />
  //         </div>

  //         <div className="input-wrapper">
  //           <label className="form-label">Title / Role</label>
  //           <input
  //             value={headerDraft.title}
  //             onChange={(e) => setHeaderDraft(prev => ({ ...prev, title: e.target.value }))}
  //             className="form-input"
  //             placeholder="e.g., Angel Investor, Partner at Alpha VC"
  //           />
  //         </div>

  //         <div className="input-wrapper">
  //           <label className="form-label">Location</label>
  //           <input
  //             value={headerDraft.location}
  //             onChange={(e) => setHeaderDraft(prev => ({ ...prev, location: e.target.value }))}
  //             className="form-input"
  //             placeholder="e.g., Hyderabad, India"
  //           />
  //         </div>

  //         {/* --- Profile Links --- */}
  //         <div className="input-wrapper">
  //           <label className="form-label">LinkedIn</label>
  //           <input
  //             type="url"
  //             value={headerDraft.linkedin}
  //             onChange={(e) => setHeaderDraft(prev => ({ ...prev, linkedin: e.target.value }))}
  //             className="form-input"
  //             placeholder="https://linkedin.com/in/username"
  //           />
  //         </div>

  //         <div className="input-wrapper">
  //           <label className="form-label">Twitter</label>
  //           <input
  //             type="url"
  //             value={headerDraft.twitter}
  //             onChange={(e) => setHeaderDraft(prev => ({ ...prev, twitter: e.target.value }))}
  //             className="form-input"
  //             placeholder="https://twitter.com/username"
  //           />
  //         </div>

  //         <div className="input-wrapper">
  //           <label className="form-label">Email</label>
  //           <input
  //             type="email"
  //             value={headerDraft.email}
  //             onChange={(e) => setHeaderDraft(prev => ({ ...prev, email: e.target.value }))}
  //             className="form-input"
  //             placeholder="investor@email.com"
  //           />
  //         </div>
  //       </div>
  //     </EditModal>

  //     {/* What I Like To Invest In */}
  //     <EditModal open={isInvestOpen} title="Edit 'What I Like To Invest In'" onSave={saveInvest} onCancel={() => setInvestOpen(false)}>
  //       <textarea
  //         rows={6}
  //         value={investDesc}
  //         onChange={(e) => setInvestDesc(e.target.value)}
  //         className="form-input"
  //       />
  //     </EditModal>

  //     {/* Expertise */}
  //     <EditModal open={isExpertiseOpen} title="Edit Expertise" onSave={saveExpertise} onCancel={() => setExpertiseOpen(false)}>
  //       <div className="tags-editor">
  //         {expertiseDraft.map((t, i) => (
  //           <span className="chip" key={i}>
  //             {t}
  //             <button onClick={() => setExpertiseDraft(prev => prev.filter((_, idx) => idx !== i))}>×</button>
  //           </span>
  //         ))}
  //         <input
  //           placeholder="Add skill and press Enter"
  //           onKeyDown={(e) => {
  //             if (e.key === 'Enter') {
  //               e.preventDefault();
  //               const val = e.target.value.trim();
  //               if (val && !expertiseDraft.includes(val)) {
  //                 setExpertiseDraft(prev => [...prev, val]);
  //                 e.target.value = '';
  //               }
  //             }
  //           }}
  //         />
  //       </div>
  //     </EditModal>

  //     {/* Sectors */}
  //     <EditModal open={isTagsOpen} title="Edit Sectors of Interest" onSave={saveTags} onCancel={() => setTagsOpen(false)}>
  //       <div className="tags-editor">
  //         {tagsDraft.map((t, i) => (
  //           <span className="chip" key={i}>
  //             {t}
  //             <button onClick={() => setTagsDraft(prev => prev.filter((_, idx) => idx !== i))}>×</button>
  //           </span>
  //         ))}
  //         <input
  //           placeholder="Add sector and press Enter"
  //           onKeyDown={(e) => {
  //             if (e.key === 'Enter') {
  //               e.preventDefault();
  //               const val = e.target.value.trim();
  //               if (val && !tagsDraft.includes(val)) {
  //                 setTagsDraft(prev => [...prev, val]);
  //                 e.target.value = '';
  //               }
  //             }
  //           }}
  //         />
  //       </div>
  //     </EditModal>

  //     {/* Stage Focus */}
  //     <EditModal open={isStageOpen} title="Edit Stage Focus" onSave={saveStage} onCancel={() => setStageOpen(false)}>
  //       <div className="tags-editor">
  //         {stageDraft.map((t, i) => (
  //           <span className="chip" key={i}>
  //             {t}
  //             <button onClick={() => setStageDraft(prev => prev.filter((_, idx) => idx !== i))}>×</button>
  //           </span>
  //         ))}
  //         <input
  //           placeholder="Add stage and press Enter"
  //           onKeyDown={(e) => {
  //             if (e.key === 'Enter') {
  //               e.preventDefault();
  //               const val = e.target.value.trim();
  //               if (val && !stageDraft.includes(val)) {
  //                 setStageDraft(prev => [...prev, val]);
  //                 e.target.value = '';
  //               }
  //             }
  //           }}
  //         />
  //       </div>
  //     </EditModal>
  //   </div>
  // );

  return (
    <InvestorForm/>
  );

}