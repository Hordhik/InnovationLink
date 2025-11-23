import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import InvestorCard from './InvestorCard.jsx';
import AboutSection from './AboutSection.jsx';
import ExpertiseSection from './ExpertiseSection.jsx';
import InvestLike from './InvestLike.jsx';
import SectorsInterested from './SectorsInterested.jsx';
import StageFocus from './StageFocus.jsx';
import ConnectedStartups from './ConnectedStartups.jsx';
import InvestorForm from './InvestorForm.jsx';
import './InvestorProfile.css';
import { getMyInvestorProfile, saveMyInvestorProfile } from '../../../services/investorApi.js';

const initialInvestorData = {
  id: null,
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
  phone: "",
  startups: [
    { name: "EcoPack Solutions", founder: "Jane Doe", tags: ["HealthTech", "GreenTech"] },
    { name: "Synapse Minds AI", founder: "John Smith", tags: ["AI/ML", "FinTech"] },
    { name: "Seismo AI @ Triby", founder: "Alice Johnson", tags: ["AI/ML", "CyberSecurity"] },
    { name: "AquaFlow Innovations", founder: "Bob White", tags: ["Clean Energy", "WaterTech"] },
  ],
};

const trimString = (value) => {
  if (value === undefined || value === null) return '';
  return value.toString().trim();
};

const cleanArray = (value) => {
  if (!Array.isArray(value)) return [];
  const seen = new Set();
  const list = [];
  value.forEach((item) => {
    const cleaned = trimString(item);
    if (cleaned && !seen.has(cleaned)) {
      seen.add(cleaned);
      list.push(cleaned);
    }
  });
  return list;
};

const normalizeInvestor = (raw, fallbackStartups = initialInvestorData.startups) => {
  if (!raw) {
    return {
      id: null,
      name: '',
      title: '',
      location: '',
      about: '',
      expertise: [],
      sectors: [],
      stages: [],
      investLike: '',
      image: '',
      linkedin: '',
      twitter: '',
      email: '',
      phone: '',
      startups: fallbackStartups || [],
    };
  }

  return {
    id: raw?.id ?? null,
    name: trimString(raw.name || raw.username),
    title: trimString(raw.title),
    location: trimString(raw.location),
    about: trimString(raw.about),
    expertise: cleanArray(raw.expertise),
    sectors: cleanArray(raw.sectors),
    stages: cleanArray(raw.stages),
    investLike: trimString(raw.investLike),
    image: raw.image || '',
    linkedin: trimString(raw.linkedin),
    twitter: trimString(raw.twitter),
    email: trimString(raw.email || raw.contactEmail),
    phone: trimString(raw.phone || raw.contactPhone),
    startups: Array.isArray(raw.startups) ? raw.startups : (fallbackStartups || []),
  };
};

const buildPayloadFromState = (data) => ({
  name: trimString(data.name),
  title: trimString(data.title),
  location: trimString(data.location),
  about: trimString(data.about),
  investLike: trimString(data.investLike),
  expertise: cleanArray(data.expertise),
  sectors: cleanArray(data.sectors),
  stages: cleanArray(data.stages),
  image: data.image || '',
  email: trimString(data.email),
  phone: trimString(data.phone),
  linkedin: trimString(data.linkedin),
  twitter: trimString(data.twitter),
});

const evaluateProfileCompletion = (profile) => {
  if (!profile) {
    return { isComplete: false, missing: ['profile'] };
  }

  const missing = [];
  if (!profile.id) missing.push('profile basics');
  if (!trimString(profile.about)) missing.push('about');
  if (!trimString(profile.investLike)) missing.push('investment preferences');
  if (!cleanArray(profile.expertise).length) missing.push('expertise');
  if (!cleanArray(profile.sectors).length) missing.push('sectors');
  if (!cleanArray(profile.stages).length) missing.push('stage focus');

  return {
    isComplete: missing.length === 0,
    missing,
  };
};

// ✅ Reusable Modal
export function EditModal({ open, title, children, onSave, onCancel, initialFocusSelector, saving = false }) {
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
          <button className="epm-btn epm-save" onClick={onSave} disabled={saving}>
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function InvestorProfile() {
  const [investorData, setInvestorData] = useState(initialInvestorData);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [profileStatus, setProfileStatus] = useState({ isComplete: false, missing: [] });
  const [formStatusMessage, setFormStatusMessage] = useState('');
  const [formErrorMessage, setFormErrorMessage] = useState('');

  const navigate = useNavigate();
  const location = useLocation();
  const [forceProfileViewPending, setForceProfileViewPending] = useState(false);

  const fileInputRef = useRef(null);

  const [isDescOpen, setDescOpen] = useState(false);
  const [isHeaderOpen, setHeaderOpen] = useState(false);
  const [isExpertiseOpen, setExpertiseOpen] = useState(false);
  const [isInvestOpen, setInvestOpen] = useState(false);
  const [isTagsOpen, setTagsOpen] = useState(false);
  const [isStageOpen, setStageOpen] = useState(false);

  const [descDraft, setDescDraft] = useState('');
  const [headerDraft, setHeaderDraft] = useState({
    name: '',
    title: '',
    location: '',
    image: '',
    linkedin: '',
    twitter: '',
    email: '',
  });
  const [expertiseDraft, setExpertiseDraft] = useState([]);
  const [investDesc, setInvestDesc] = useState('');
  const [tagsDraft, setTagsDraft] = useState([]);
  const [stageDraft, setStageDraft] = useState([]);

  const applyInvestorSnapshot = useCallback((rawInvestor, fallbackStartups, options = {}) => {
    let latestCompletion = null;
    setInvestorData((prev) => {
      const normalized = normalizeInvestor(rawInvestor, fallbackStartups ?? prev.startups);
      const merged = { ...prev, ...normalized };
      latestCompletion = evaluateProfileCompletion(merged);
      setProfileStatus(latestCompletion);
      const forceProfileView = options.forceProfileView ?? false;
      const hasPersistedProfile = Boolean(merged.id);
      setShowForm(forceProfileView ? false : !hasPersistedProfile);
      if (latestCompletion.isComplete) {
        setFormStatusMessage('');
        setFormErrorMessage('');
      }
      return merged;
    });
    return latestCompletion;
  }, []);

  useEffect(() => {
    if (location.state?.forceProfileView) {
      setForceProfileViewPending(true);
    }
  }, [location.state]);

  useEffect(() => {
    let mounted = true;

    const fetchProfile = async () => {
      try {
        const { investor } = await getMyInvestorProfile();
        if (!mounted) return;
        applyInvestorSnapshot(investor);
        setErrorMessage('');
        setFormErrorMessage('');
      } catch (error) {
        if (mounted) {
          console.error('Failed to load investor profile:', error);
          const message = error?.message || 'Unable to load investor profile.';
          setErrorMessage(message);
          setFormErrorMessage(message);
          applyInvestorSnapshot(null);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchProfile();

    return () => {
      mounted = false;
    };
  }, [applyInvestorSnapshot]);

  useEffect(() => {
    if (!forceProfileViewPending) return;

    let mounted = true;

    const refreshProfile = async () => {
      try {
        const { investor } = await getMyInvestorProfile();
        if (!mounted) return;
        applyInvestorSnapshot(investor, undefined, { forceProfileView: true });
        setErrorMessage('');
        setFormErrorMessage('');
      } catch (error) {
        if (mounted) {
          console.error('Failed to load investor profile:', error);
          const message = error?.message || 'Unable to load investor profile.';
          setErrorMessage(message);
          setFormErrorMessage(message);
          applyInvestorSnapshot(null, undefined, { forceProfileView: true });
        }
      } finally {
        if (mounted) {
          setForceProfileViewPending(false);
          navigate(location.pathname, { replace: true });
        }
      }
    };

    refreshProfile();

    return () => {
      mounted = false;
    };
  }, [forceProfileViewPending, applyInvestorSnapshot, location.pathname, navigate]);

  useEffect(() => {
    if (location.hash === '#connections') {
      const el = document.getElementById('connected-startups-section');
      if (el) {
        setTimeout(() => {
          el.scrollIntoView({ behavior: 'smooth' });
        }, 500);
      }
    }
  }, [location]);

  const persistProfile = async (partialUpdate, { context = 'profile', successMessage } = {}) => {
    setIsSaving(true);
    if (context === 'profile') {
      setErrorMessage('');
    }
    if (context === 'form') {
      setFormErrorMessage('');
      setFormStatusMessage('');
    }
    try {
      const merged = { ...investorData, ...partialUpdate };
      const payload = buildPayloadFromState(merged);
      const { investor } = await saveMyInvestorProfile(payload);
      const completion = applyInvestorSnapshot(
        investor,
        merged.startups || investorData.startups,
        { forceProfileView: context === 'form' }
      );
      if (context === 'form' && successMessage) {
        setFormStatusMessage(successMessage);
      }
      if (context === 'form' && completion?.isComplete) {
        setErrorMessage('');
      }
      return { ok: true, completion };
    } catch (error) {
      console.error('Failed to save investor profile:', error);
      const message = error?.message || 'Failed to save investor profile.';
      if (context === 'form') {
        setFormErrorMessage(message);
      } else {
        setErrorMessage(message);
      }
      return { ok: false, error: message };
    } finally {
      setIsSaving(false);
    }
  };

  const handleOpenDesc = () => {
    setDescDraft(investorData.about || '');
    setDescOpen(true);
  };

  const handleOpenHeader = () => {
    setHeaderDraft({
      name: investorData.name || '',
      title: investorData.title || '',
      location: investorData.location || '',
      image: investorData.image || '',
      linkedin: investorData.linkedin || '',
      twitter: investorData.twitter || '',
      email: investorData.email || '',
    });
    setHeaderOpen(true);
  };

  const handleOpenExpertise = () => {
    setExpertiseDraft([...(investorData.expertise || [])]);
    setExpertiseOpen(true);
  };

  const handleOpenInvest = () => {
    setInvestDesc(investorData.investLike || '');
    setInvestOpen(true);
  };

  const handleOpenTags = () => {
    setTagsDraft([...(investorData.sectors || [])]);
    setTagsOpen(true);
  };

  const handleOpenStage = () => {
    setStageDraft([...(investorData.stages || [])]);
    setStageOpen(true);
  };

  const saveDesc = async () => {
    const result = await persistProfile({ about: descDraft });
    if (result.ok) setDescOpen(false);
  };

  const saveHeader = async () => {
    const result = await persistProfile({
      name: headerDraft.name,
      title: headerDraft.title,
      location: headerDraft.location,
      image: headerDraft.image,
      linkedin: headerDraft.linkedin,
      twitter: headerDraft.twitter,
      email: headerDraft.email,
    });
    if (result.ok) setHeaderOpen(false);
  };

  const saveExpertise = async () => {
    const result = await persistProfile({ expertise: expertiseDraft });
    if (result.ok) setExpertiseOpen(false);
  };

  const saveInvest = async () => {
    const result = await persistProfile({ investLike: investDesc });
    if (result.ok) setInvestOpen(false);
  };

  const saveTags = async () => {
    const result = await persistProfile({ sectors: tagsDraft });
    if (result.ok) setTagsOpen(false);
  };

  const saveStage = async () => {
    const result = await persistProfile({ stages: stageDraft });
    if (result.ok) setStageOpen(false);
  };

  const handleLogoChange = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setHeaderDraft((prev) => ({ ...prev, image: reader.result || '' }));
      };
      reader.readAsDataURL(file);
      event.target.value = '';
    }
  };

  const handleFormSubmit = async (finalData) => {
    const result = await persistProfile(finalData, {
      context: 'form',
      successMessage: 'Investor profile saved successfully.',
    });
    if (!result.ok) {
      return;
    }

    const pathParts = location.pathname.split('/');
    const roleSegment = pathParts[1] || 'I';
    setForceProfileViewPending(true);
    navigate(`/${roleSegment}/profile`, { replace: true, state: { forceProfileView: true } });
  };

  const scrollToConnections = () => {
    const el = document.getElementById('connected-startups-section');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="investor-profile-page">
        <p>Loading investor profile...</p>
      </div>
    );
  }

  if (showForm) {
    const pendingSectionsMessage = profileStatus.missing.length
      ? `Let's improve your profile by adding: ${profileStatus.missing.join(', ')}.`
      : '';

    return (
      <InvestorForm
        initialData={investorData}
        onSubmit={handleFormSubmit}
        statusMessage={formStatusMessage || pendingSectionsMessage}
        errorMessage={formErrorMessage}
        isSubmitting={isSaving}
      />
    );
  }

  return (
    <div className="investor-profile-page">
      {errorMessage && (
        <div
          style={{
            border: '1px solid #fecaca',
            background: '#fef2f2',
            color: '#b91c1c',
            padding: '0.75rem 1rem',
            borderRadius: '8px',
          }}
        >
          {errorMessage}
        </div>
      )}

      <div className="investor-row">
        <InvestorCard data={investorData} onClick={handleOpenHeader} onMyConnectionsClick={scrollToConnections} />
        <AboutSection about={investorData.about || ''} name={investorData.name || 'You'} onClick={handleOpenDesc} />
        <ExpertiseSection expertise={investorData.expertise || []} onClick={handleOpenExpertise} />
      </div>

      <div className="investor-row">
        <InvestLike description={investorData.investLike || ''} onClick={handleOpenInvest} />
        <SectorsInterested sectors={investorData.sectors || []} onClick={handleOpenTags} />
        <StageFocus stages={investorData.stages || []} onClick={handleOpenStage} />
      </div>

      <div className="investor-row full-width" id="connected-startups-section">
        <ConnectedStartups startups={investorData.startups || []} />
      </div>

      <EditModal
        open={isDescOpen}
        title="Edit Description"
        onSave={saveDesc}
        onCancel={() => setDescOpen(false)}
        saving={isSaving}
      >
        <textarea
          rows={8}
          value={descDraft}
          onChange={(e) => setDescDraft(e.target.value)}
          className="form-input"
        />
      </EditModal>

      <EditModal
        open={isHeaderOpen}
        title="Edit Investor Profile"
        onSave={saveHeader}
        onCancel={() => setHeaderOpen(false)}
        saving={isSaving}
        initialFocusSelector="input[name=investor-name]"
      >
        <div className="edit-header-form">
          <div className="edit-photo-upload">
            <label className="form-label">Profile Image</label>
            <div className="photo-upload-area">
              <img
                src={headerDraft.image || 'https://placehold.co/90x90/eef2ff/4f46e5?text=Photo'}
                alt="Investor avatar"
                className="profile-photo-preview"
              />
              <div>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => fileInputRef.current?.click()}
                >
                  Upload
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden-input"
                  onChange={handleLogoChange}
                />
              </div>
            </div>
          </div>

          <div className="input-wrapper">
            <label className="form-label" htmlFor="investor-name">Full Name</label>
            <input
              id="investor-name"
              name="investor-name"
              value={headerDraft.name}
              onChange={(e) => setHeaderDraft((prev) => ({ ...prev, name: e.target.value }))}
              className="form-input"
              placeholder="e.g., Chandra Sekhar"
            />
          </div>

          <div className="input-wrapper">
            <label className="form-label">Title / Role</label>
            <input
              value={headerDraft.title}
              onChange={(e) => setHeaderDraft((prev) => ({ ...prev, title: e.target.value }))}
              className="form-input"
              placeholder="e.g., Angel Investor, Partner at Alpha VC"
            />
          </div>

          <div className="input-wrapper">
            <label className="form-label">Location</label>
            <input
              value={headerDraft.location}
              onChange={(e) => setHeaderDraft((prev) => ({ ...prev, location: e.target.value }))}
              className="form-input"
              placeholder="e.g., Hyderabad, India"
            />
          </div>

          <div className="input-wrapper">
            <label className="form-label">LinkedIn</label>
            <input
              type="url"
              value={headerDraft.linkedin}
              onChange={(e) => setHeaderDraft((prev) => ({ ...prev, linkedin: e.target.value }))}
              className="form-input"
              placeholder="https://linkedin.com/in/username"
            />
          </div>

          <div className="input-wrapper">
            <label className="form-label">Twitter</label>
            <input
              type="url"
              value={headerDraft.twitter}
              onChange={(e) => setHeaderDraft((prev) => ({ ...prev, twitter: e.target.value }))}
              className="form-input"
              placeholder="https://twitter.com/username"
            />
          </div>

          <div className="input-wrapper">
            <label className="form-label">Email</label>
            <input
              type="email"
              value={headerDraft.email}
              onChange={(e) => setHeaderDraft((prev) => ({ ...prev, email: e.target.value }))}
              className="form-input"
              placeholder="investor@email.com"
            />
          </div>
        </div>
      </EditModal>

      <EditModal
        open={isInvestOpen}
        title="Edit 'What I Like To Invest In'"
        onSave={saveInvest}
        onCancel={() => setInvestOpen(false)}
        saving={isSaving}
      >
        <textarea
          rows={6}
          value={investDesc}
          onChange={(e) => setInvestDesc(e.target.value)}
          className="form-input"
        />
      </EditModal>

      <EditModal
        open={isExpertiseOpen}
        title="Edit Expertise"
        onSave={saveExpertise}
        onCancel={() => setExpertiseOpen(false)}
        saving={isSaving}
      >
        <div className="tags-editor">
          {expertiseDraft.map((tag, index) => (
            <span className="chip" key={`${tag}-${index}`}>
              {tag}
              <button
                type="button"
                onClick={() => setExpertiseDraft((prev) => prev.filter((_, idx) => idx !== index))}
              >
                ×
              </button>
            </span>
          ))}
          <input
            placeholder="Add skill and press Enter"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                const value = e.currentTarget.value.trim();
                if (value && !expertiseDraft.includes(value)) {
                  setExpertiseDraft((prev) => [...prev, value]);
                }
                e.currentTarget.value = '';
              }
            }}
          />
        </div>
      </EditModal>

      <EditModal
        open={isTagsOpen}
        title="Edit Sectors of Interest"
        onSave={saveTags}
        onCancel={() => setTagsOpen(false)}
        saving={isSaving}
      >
        <div className="tags-editor">
          {tagsDraft.map((tag, index) => (
            <span className="chip" key={`${tag}-${index}`}>
              {tag}
              <button
                type="button"
                onClick={() => setTagsDraft((prev) => prev.filter((_, idx) => idx !== index))}
              >
                ×
              </button>
            </span>
          ))}
          <input
            placeholder="Add sector and press Enter"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                const value = e.currentTarget.value.trim();
                if (value && !tagsDraft.includes(value)) {
                  setTagsDraft((prev) => [...prev, value]);
                }
                e.currentTarget.value = '';
              }
            }}
          />
        </div>
      </EditModal>

      <EditModal
        open={isStageOpen}
        title="Edit Stage Focus"
        onSave={saveStage}
        onCancel={() => setStageOpen(false)}
        saving={isSaving}
      >
        <div className="tags-editor">
          {stageDraft.map((tag, index) => (
            <span className="chip" key={`${tag}-${index}`}>
              {tag}
              <button
                type="button"
                onClick={() => setStageDraft((prev) => prev.filter((_, idx) => idx !== index))}
              >
                ×
              </button>
            </span>
          ))}
          <input
            placeholder="Add stage and press Enter"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                const value = e.currentTarget.value.trim();
                if (value && !stageDraft.includes(value)) {
                  setStageDraft((prev) => [...prev, value]);
                }
                e.currentTarget.value = '';
              }
            }}
          />
        </div>
      </EditModal>
    </div>
  );
}