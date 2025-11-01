import React, { useEffect, useRef, useState } from 'react';
import InvestorCard from './InvestorCard.jsx';
import AboutSection from './AboutSection.jsx';
import ExpertiseSection from './ExpertiseSection.jsx';
import InvestLike from './InvestLike.jsx';
import SectorsInterested from './SectorsInterested.jsx';
import StageFocus from './StageFocus.jsx';
import ConnectedStartups from './ConnectedStartups.jsx';
import './InvestorProfile.css';

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
  // store entire investor object as state
  const [investorData, setInvestorData] = useState(initialInvestorData);

  // modal states
  const [isDescOpen, setDescOpen] = useState(false);
  const [isHeaderOpen, setHeaderOpen] = useState(false);
  const [isExpertiseOpen, setExpertiseOpen] = useState(false);
  const [isInvestOpen, setInvestOpen] = useState(false);
  const [isTagsOpen, setTagsOpen] = useState(false);
  const [isStageOpen, setStageOpen] = useState(false);

  // draft states
  const [descDraft, setDescDraft] = useState("");
  const [headerDraft, setHeaderDraft] = useState({ name: "", title: "" });
  const [expertiseDraft, setExpertiseDraft] = useState([]);
  const [investDesc, setInvestDesc] = useState("");
  const [tagsDraft, setTagsDraft] = useState([]);
  const [stageDraft, setStageDraft] = useState([]);

  // preload values when opening modals
  const handleOpenDesc = () => { setDescDraft(investorData.about); setDescOpen(true); };
  const handleOpenHeader = () => { setHeaderDraft({ name: investorData.name, title: investorData.title }); setHeaderOpen(true); };
  const handleOpenExpertise = () => { setExpertiseDraft(investorData.expertise); setExpertiseOpen(true); };
  const handleOpenInvest = () => { setInvestDesc(investorData.investLike); setInvestOpen(true); };
  const handleOpenTags = () => { setTagsDraft(investorData.sectors); setTagsOpen(true); };
  const handleOpenStage = () => { setStageDraft(investorData.stages); setStageOpen(true); };

  // save handlers
  const saveDesc = () => { setInvestorData(prev => ({ ...prev, about: descDraft })); setDescOpen(false); };
  const saveHeader = () => { setInvestorData(prev => ({ ...prev, ...headerDraft })); setHeaderOpen(false); };
  const saveExpertise = () => { setInvestorData(prev => ({ ...prev, expertise: expertiseDraft })); setExpertiseOpen(false); };
  const saveInvest = () => { setInvestorData(prev => ({ ...prev, investLike: investDesc })); setInvestOpen(false); };
  const saveTags = () => { setInvestorData(prev => ({ ...prev, sectors: tagsDraft })); setTagsOpen(false); };
  const saveStage = () => { setInvestorData(prev => ({ ...prev, stages: stageDraft })); setStageOpen(false); };

  return (
    <div className="investor-profile-page">
      {/* --- Row 1 --- */}
      <div className="investor-row">
        <InvestorCard data={investorData} onClick={handleOpenHeader} />
        <AboutSection about={investorData.about} name={investorData.name} onClick={handleOpenDesc} />
        <ExpertiseSection expertise={investorData.expertise} onClick={handleOpenExpertise} />
      </div>

      {/* --- Row 2 --- */}
      <div className="investor-row">
        <InvestLike
          description={investorData.investLike}
          onClick={() => {
            setInvestDesc(investorData.investLike);
            setInvestOpen(true);
          }}
        />

        <SectorsInterested sectors={investorData.sectors} onClick={handleOpenTags} />
        <StageFocus stages={investorData.stages} onClick={handleOpenStage} />
      </div>

      {/* --- Row 3 --- */}
      <div className="investor-row full-width">
        <ConnectedStartups startups={investorData.startups} />
      </div>

      {/* --- Modals --- */}

      {/* About */}
      <EditModal open={isDescOpen} title="Edit Description" onSave={saveDesc} onCancel={() => setDescOpen(false)}>
        <textarea rows={8} value={descDraft} onChange={(e) => setDescDraft(e.target.value)} />
      </EditModal>

      {/* Header */}
      <EditModal open={isHeaderOpen} title="Edit Header" onSave={saveHeader} onCancel={() => setHeaderOpen(false)}>
        <label>Name</label>
        <input value={headerDraft.name} onChange={(e) => setHeaderDraft(prev => ({ ...prev, name: e.target.value }))} />
        <label>Title</label>
        <input value={headerDraft.title} onChange={(e) => setHeaderDraft(prev => ({ ...prev, title: e.target.value }))} />
      </EditModal>

      {/* What I Like To Invest In */}
      <EditModal open={isInvestOpen} title="Edit 'What I Like To Invest In'" onSave={saveInvest} onCancel={() => setInvestOpen(false)}>
        <textarea rows={6} value={investDesc} onChange={(e) => setInvestDesc(e.target.value)} />
      </EditModal>

      {/* Expertise */}
      <EditModal open={isExpertiseOpen} title="Edit Expertise" onSave={saveExpertise} onCancel={() => setExpertiseOpen(false)}>
        <div className="tags-editor">
          {expertiseDraft.map((t, i) => (
            <span className="chip" key={i}>
              {t}
              <button onClick={() => setExpertiseDraft(prev => prev.filter((_, idx) => idx !== i))}>×</button>
            </span>
          ))}
          <input
            placeholder="Add skill and press Enter"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                const val = e.target.value.trim();
                if (val && !expertiseDraft.includes(val)) {
                  setExpertiseDraft(prev => [...prev, val]);
                  e.target.value = '';
                }
              }
            }}
          />
        </div>
      </EditModal>

      {/* Sectors Interested In */}
      <EditModal open={isTagsOpen} title="Edit Sectors of Interest" onSave={saveTags} onCancel={() => setTagsOpen(false)}>
        <div className="tags-editor">
          {tagsDraft.map((t, i) => (
            <span className="chip" key={i}>
              {t}
              <button onClick={() => setTagsDraft(prev => prev.filter((_, idx) => idx !== i))}>×</button>
            </span>
          ))}
          <input
            placeholder="Add sector and press Enter"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                const val = e.target.value.trim();
                if (val && !tagsDraft.includes(val)) {
                  setTagsDraft(prev => [...prev, val]);
                  e.target.value = '';
                }
              }
            }}
          />
        </div>
      </EditModal>

      {/* Stage Focus */}
      <EditModal open={isStageOpen} title="Edit Stage Focus" onSave={saveStage} onCancel={() => setStageOpen(false)}>
        <div className="tags-editor">
          {stageDraft.map((t, i) => (
            <span className="chip" key={i}>
              {t}
              <button onClick={() => setStageDraft(prev => prev.filter((_, idx) => idx !== i))}>×</button>
            </span>
          ))}
          <input
            placeholder="Add stage and press Enter"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                const val = e.target.value.trim();
                if (val && !stageDraft.includes(val)) {
                  setStageDraft(prev => [...prev, val]);
                  e.target.value = '';
                }
              }
            }}
          />
        </div>
      </EditModal>
    </div>
  );
}
