import React, { useEffect, useState, useRef } from 'react';
import './StartupProfileForm.css';

const StartupProfileForm = ({ onProfileCreate, initialData = {} }) => {
    const [team, setTeam] = useState(initialData.team?.length ? initialData.team : [{ name: '' }]);
    const [logoPreview, setLogoPreview] = useState(initialData.logo || null);
    const fileInputRef = useRef(null);

    const PREDEFINED_DOMAINS = ['Technology', 'Healthcare', 'Finance', 'E-commerce', 'Education', 'Entertainment'];
    // Initialize domain/customDomain from initialData.domain if provided
    const inferDomain = () => {
        if (!initialData.domain) return { domain: PREDEFINED_DOMAINS[0], custom: '' };
        if (PREDEFINED_DOMAINS.includes(initialData.domain)) {
            return { domain: initialData.domain, custom: '' };
        }
        return { domain: 'Other', custom: initialData.domain };
    };
    const inferred = inferDomain();
    const [domain, setDomain] = useState(inferred.domain);
    const [customDomain, setCustomDomain] = useState(inferred.custom);

    // Convert selected file to a base64 data URL so it can be persisted in localStorage
    const fileToDataUrl = (file) => new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });

    const handleLogoChange = async (e) => {
        if (e.target.files && e.target.files[0]) {
            try {
                const dataUrl = await fileToDataUrl(e.target.files[0]);
                setLogoPreview(dataUrl);
            } catch (err) {
                // fallback to object URL if FileReader fails
                setLogoPreview(URL.createObjectURL(e.target.files[0]));
            }
        }
    };

    const addTeamMember = () => setTeam([...team, { name: '' }]);
    const removeTeamMember = (i) => setTeam(team.filter((_, idx) => idx !== i));
    const handleTeamChange = (i, val) => {
        const copy = [...team];
        copy[i].name = val;
        setTeam(copy);
    };

    const handleDomainChange = (e) => {
        setDomain(e.target.value);
    };

    const handleCustomDomainChange = (e) => {
        setCustomDomain(e.target.value);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const form = e.target;
        const finalDomain = domain === 'Other' ? customDomain : domain;
        const data = {
            name: form.startupName.value || '',
            founder: form.founderName.value || '',
            description: form.description.value || '',
            address: form.address.value || '',
            phone: form.phone.value || '',
            domain: finalDomain,
            team,
            logo: logoPreview,
        };
        if (onProfileCreate) onProfileCreate(data);
    };

    return (
        <>
            <div className="page-background">
                <div className="form-container">
                    <div className="form-card">
                        <h1 className="form-title">Create Your Startup Profile</h1>
                        <p className="form-subtitle">Fill in the details below to get started.</p>
                        <form onSubmit={handleSubmit}>
                            <div className="form-section">
                                <label className="form-label">Logo</label>
                                <div className="logo-upload-area">
                                    <img src={logoPreview || 'https://placehold.co/90x90/eef2ff/4f46e5?text=Logo'} alt="logo preview" className="logo-preview" />
                                    <div>
                                        <button type="button" className="btn btn-secondary" onClick={() => fileInputRef.current && fileInputRef.current.click()} aria-controls="logoUpload">
                                            Upload
                                        </button>
                                        <input id="logoUpload" name="logo" aria-label="Upload logo" ref={fileInputRef} type="file" accept="image/*" className="hidden-input" onChange={handleLogoChange} />
                                    </div>
                                </div>

                                <div className="form-grid">
                                    <div className="input-wrapper">
                                        <label className="form-label" htmlFor="startupName">Startup Name</label>
                                        <div className="input-group">
                                            <svg className="input-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0012 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75z" />
                                            </svg>
                                            <input id="startupName" name="startupName" defaultValue={initialData.name || ''} className="form-input with-icon" placeholder="e.g., Innovate Inc." />
                                        </div>
                                    </div>
                                    <div className="input-wrapper">
                                        <label className="form-label" htmlFor="founderName">Founder Name</label>
                                        <div className="input-group">
                                            <svg className="input-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg>
                                            <input id="founderName" name="founderName" defaultValue={initialData.founder || ''} className="form-input with-icon" placeholder="e.g., Jane Doe" />
                                        </div>
                                    </div>
                                </div>

                                <div className="input-wrapper" style={{ marginTop: '1.5rem' }}>
                                    <label className="form-label" htmlFor="description">Description</label>
                                    <textarea id="description" name="description" defaultValue={initialData.description || ''} className="form-input" rows={4} placeholder="Describe your startup's mission and vision..." />
                                </div>

                                <div className="form-grid" style={{ marginTop: '1.5rem' }}>
                                    <div className="input-wrapper">
                                        <label className="form-label" htmlFor="address">Address</label>
                                        <div className="input-group">
                                            <svg className="input-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" /></svg>
                                            <input id="address" name="address" defaultValue={initialData.address || ''} className="form-input with-icon" placeholder="e.g., 123 Innovation Drive" />
                                        </div>
                                    </div>
                                    <div className="input-wrapper">
                                        <label className="form-label" htmlFor="phone">Phone</label>
                                        <div className="input-group">
                                            <svg className="input-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" /></svg>
                                            <input id="phone" name="phone" type="tel" defaultValue={initialData.phone || ''} className="form-input with-icon" placeholder="e.g., (555) 123-4567" />
                                        </div>
                                    </div>
                                </div>
                                <div className="input-wrapper" style={{ marginTop: '1.5rem' }}>
                                    <label className="form-label" htmlFor="domain">Domain</label>
                                    <div className="input-group">
                                        <svg className="input-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 0 0 3 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 0 0 5.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 0 0 9.568 3Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6Z" />
                                        </svg>
                                        <select id="domain" name="domain" className="form-input with-icon" defaultValue={domain} onChange={handleDomainChange}>
                                            {PREDEFINED_DOMAINS.map(d => <option key={d} value={d}>{d}</option>)}
                                            <option value="Other">Other (Please specify)</option>
                                        </select>
                                    </div>
                                    {domain === 'Other' && (
                                        <div className="input-group" style={{ marginTop: '1rem' }}>
                                            <svg className="input-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                                            </svg>
                                            <input
                                                type="text"
                                                name="customDomain"
                                                className="form-input with-icon"
                                                value={customDomain}
                                                onChange={handleCustomDomainChange}
                                                placeholder="Enter your custom domain"
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="form-section">
                                <label className="form-label">Team Members</label>
                                {team.map((m, i) => (
                                    <div key={i} className="team-input-row">
                                        <input
                                            id={`team-member-${i}`}
                                            name={`teamMember[${i}].name`}
                                            className="form-input flex-grow"
                                            value={m.name}
                                            onChange={(e) => handleTeamChange(i, e.target.value)}
                                            placeholder="Enter team member's name"
                                            aria-label={`Team member ${i + 1} name`}
                                        />
                                        {team.length > 1 && <button type="button" className="btn-remove-member" onClick={() => removeTeamMember(i)}>Remove</button>}
                                    </div>
                                ))}
                                <button type="button" className="btn-add-member" onClick={addTeamMember}>
                                    <span style={{ marginRight: '8px' }}>+</span>Add Member
                                </button>
                            </div>

                            <div className="form-actions">
                                <button type="submit" className="btn btn-primary">
                                    Save Profile
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
};

export default StartupProfileForm;

