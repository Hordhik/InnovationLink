import React, { useEffect, useRef, useState } from 'react';
import './InvestorForm.css';

const PREDEFINED_SECTORS = [
  'HealthTech', 'FinTech', 'AgriTech', 'Clean Energy', 'SaaS', 'AI/ML', 'EdTech', 'Mobility'
];

const PREDEFINED_STAGES = [
  'Pre-seed', 'Seed', 'MVP Ready', 'Growth', 'Series A+'
];

const ensureExpertiseList = (list) => {
  if (Array.isArray(list) && list.length) {
    return list;
  }
  return [''];
};

const InvestorForm = ({ initialData = {}, onSubmit, statusMessage, errorMessage, isSubmitting }) => {
  const fileInputRef = useRef(null);
  const [logoPreview, setLogoPreview] = useState(initialData.image || '');
  const [expertise, setExpertise] = useState(ensureExpertiseList(initialData.expertise));
  const [sectors, setSectors] = useState(initialData.sectors || []);
  const [stages, setStages] = useState(initialData.stages || []);
  const [investFocus, setInvestFocus] = useState(initialData.investLike || '');
  const [formData, setFormData] = useState({
    name: initialData.name || '',
    title: initialData.title || '',
    location: initialData.location || '',
    email: initialData.email || '',
    phone: initialData.phone || '',
    linkedin: initialData.linkedin || '',
    twitter: initialData.twitter || '',
    about: initialData.about || '',
  });

  useEffect(() => {
    setLogoPreview(initialData.image || '');
    setExpertise(ensureExpertiseList(initialData.expertise));
    setSectors(initialData.sectors || []);
    setStages(initialData.stages || []);
    setInvestFocus(initialData.investLike || '');
    setFormData({
      name: initialData.name || '',
      title: initialData.title || '',
      location: initialData.location || '',
      email: initialData.email || initialData.contactEmail || '',
      phone: initialData.phone || initialData.contactPhone || '',
      linkedin: initialData.linkedin || '',
      twitter: initialData.twitter || '',
      about: initialData.about || '',
    });
  }, [initialData]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleLogoChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setLogoPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const addExpertise = () => setExpertise([...expertise, '']);
  const updateExpertise = (i, val) => setExpertise(expertise.map((x, idx) => idx === i ? val : x));
  const removeExpertise = (i) => setExpertise(expertise.filter((_, idx) => idx !== i));

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmedExpertise = expertise
      .map((item) => (item ?? '').trim())
      .filter((item) => item.length > 0);
    const uniqueExpertise = Array.from(new Set(trimmedExpertise));
    const finalData = {
      ...formData,
      email: (formData.email || '').trim(),
      phone: (formData.phone || '').trim(),
      location: (formData.location || '').trim(),
      name: (formData.name || '').trim(),
      title: (formData.title || '').trim(),
      linkedin: (formData.linkedin || '').trim(),
      twitter: (formData.twitter || '').trim(),
      about: (formData.about || '').trim(),
      expertise: uniqueExpertise,
      sectors,
      stages,
      image: logoPreview,
      investLike: (investFocus || '').trim(),
    };
    if (onSubmit) {
      onSubmit(finalData);
    }
  };

  return (
    <div className="page-background">
      <div className="form-container">
        <div className="form-card">
          <h1 className="form-title">Create Your Investor Profile</h1>
          <p className="form-subtitle">Fill in your personal and investment details below.</p>

          {errorMessage && <div className="form-status error">{errorMessage}</div>}
          {statusMessage && !errorMessage && <div className="form-status success">{statusMessage}</div>}

          <form onSubmit={handleSubmit}>
            {/* --- Profile Picture --- */}
            <div className="form-section">
              <label className="form-label">Profile Image</label>
              <div className="logo-upload-area">
                <img
                  src={logoPreview || 'https://placehold.co/90x90/eef2ff/4f46e5?text=Photo'}
                  alt="profile preview"
                  className="logo-preview"
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

            {/* --- Basic Info --- */}
            <div className="form-grid">
              <div className="input-wrapper">
                <label className="form-label" htmlFor="name">Full Name</label>
                <input
                  id="name"
                  className="form-input"
                  placeholder="e.g., Chandra Sekhar"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                />
              </div>
              <div className="input-wrapper">
                <label className="form-label" htmlFor="title">Title / Role</label>
                <input
                  id="title"
                  className="form-input"
                  placeholder="e.g., Angel Investor, Partner at Alpha VC"
                  value={formData.title}
                  onChange={(e) => handleChange('title', e.target.value)}
                />
              </div>
            </div>

            <div className="input-wrapper" style={{ marginTop: '1.5rem' }}>
              <label className="form-label" htmlFor="location">Location</label>
              <input
                id="location"
                className="form-input"
                placeholder="e.g., Hyderabad, India"
                value={formData.location}
                onChange={(e) => handleChange('location', e.target.value)}
              />
            </div>

            <div className="input-wrapper" style={{ marginTop: '1.5rem' }}>
              <label className="form-label" htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                className="form-input"
                placeholder="investor@email.com"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
              />
            </div>

            <div className="input-wrapper" style={{ marginTop: '1.5rem' }}>
              <label className="form-label" htmlFor="phone">Phone</label>
              <input
                id="phone"
                className="form-input"
                placeholder="e.g., +91 98765 43210"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
              />
            </div>

            {/* --- Profile Links --- */}
            <div className="form-grid" style={{ marginTop: '1.5rem' }}>
              <div className="input-wrapper">
                <label className="form-label" htmlFor="linkedin">LinkedIn</label>
                <input
                  id="linkedin"
                  type="url"
                  className="form-input"
                  placeholder="https://linkedin.com/in/username"
                  value={formData.linkedin}
                  onChange={(e) => handleChange('linkedin', e.target.value)}
                />
              </div>
              <div className="input-wrapper">
                <label className="form-label" htmlFor="twitter">Twitter</label>
                <input
                  id="twitter"
                  type="url"
                  className="form-input"
                  placeholder="https://twitter.com/username"
                  value={formData.twitter}
                  onChange={(e) => handleChange('twitter', e.target.value)}
                />
              </div>
            </div>

            {/* --- About --- */}
            <div className="input-wrapper" style={{ marginTop: '1.5rem' }}>
              <label className="form-label" htmlFor="about">About You</label>
              <textarea
                id="about"
                className="form-input"
                rows={4}
                placeholder="Briefly describe your experience and investment approach..."
                value={formData.about}
                onChange={(e) => handleChange('about', e.target.value)}
              />
            </div>

            {/* --- What I Like To Invest In --- */}
            <div className="form-section">
              <label className="form-label" htmlFor="investLike">What I Like To Invest In</label>
              <textarea
                id="investLike"
                className="form-input"
                rows={5}
                placeholder="I prefer investing in startups focused on..."
                value={investFocus}
                onChange={(e) => setInvestFocus(e.target.value)}
              />
            </div>

            {/* --- Expertise --- */}
            <div className="form-section">
              <label className="form-label">Expertise</label>
              {expertise.map((exp, i) => (
                <div key={i} className="team-input-row">
                  <input
                    className="form-input flex-grow"
                    value={exp}
                    onChange={(e) => updateExpertise(i, e.target.value)}
                    placeholder="e.g., Product Strategy, Market Analysis..."
                  />
                  {expertise.length > 1 && (
                    <button
                      type="button"
                      className="btn-remove-member"
                      onClick={() => removeExpertise(i)}
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                className="btn-add-member"
                onClick={addExpertise}
              >
                <span style={{ marginRight: '8px' }}>+</span>Add Expertise
              </button>
            </div>

            {/* --- Sectors --- */}
            <div className="form-section">
              <label className="form-label">Sectors Interested In</label>
              <div className="checkbox-grid">
                {PREDEFINED_SECTORS.map((sector) => (
                  <label key={sector} className="checkbox-item">
                    <input
                      type="checkbox"
                      checked={sectors.includes(sector)}
                      onChange={(e) => {
                        setSectors(prev =>
                          e.target.checked
                            ? [...prev, sector]
                            : prev.filter((s) => s !== sector)
                        );
                      }}
                    />
                    <span>{sector}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* --- Stage Focus --- */}
            <div className="form-section">
              <label className="form-label">Stage Focus</label>
              <div className="checkbox-grid">
                {PREDEFINED_STAGES.map((stage) => (
                  <label key={stage} className="checkbox-item">
                    <input
                      type="checkbox"
                      checked={stages.includes(stage)}
                      onChange={(e) => {
                        setStages(prev =>
                          e.target.checked
                            ? [...prev, stage]
                            : prev.filter((s) => s !== stage)
                        );
                      }}
                    />
                    <span>{stage}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* --- Save Button --- */}
            <div className="form-actions">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Saving...' : 'Save Investor Profile'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default InvestorForm;
