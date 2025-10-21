import React, { useEffect, useState, useRef } from "react";
import { getStoredUser } from '../../../auth.js';
import { getProfile as apiGetProfile, saveProfile as apiSaveProfile } from '../../../services/startupProfileApi';
import { setMyTeam as apiSetMyTeam, getMyTeam as apiGetMyTeam } from '../../../services/teamApi';
import StartupProfileForm from "./StartupProfileForm";
import StartupProfileView from "./StartupProfileView";
import TeamMemberModal from "./TeamMemberModal";
import "./StartupProfile.css";

export default function StartupProfile() {
  // Local error boundary to surface render-time issues on the profile page
  // eslint-disable-next-line react/display-name
  const ErrorBoundary = React.useMemo(() => {
    return class ErrorBoundaryInner extends React.Component {
      constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
      }
      static getDerivedStateFromError(error) { return { hasError: true, error }; }
      componentDidCatch(error, info) { /* no-op, could log */ }
      render() {
        if (this.state.hasError) {
          return <div className="startup-profile"><div style={{ padding: '1rem', color: 'red' }}>Profile failed to render: {String(this.state.error?.message || this.state.error)}</div></div>;
        }
        return this.props.children;
      }
    }
  }, []);
  const [isProfileCreated, setIsProfileCreated] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [edit, setEdit] = useState({});
  const fileInputRef = useRef(null);
  const [focusedMemberIndex, setFocusedMemberIndex] = useState(null); // can be { idx, isFounder }
  const [memberEditing, setMemberEditing] = useState(false);
  const [memberDraft, setMemberDraft] = useState(null);

  // Initialize with basic info from the authenticated user; no frontend persistence
  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const user = getStoredUser();
        if (user && isMounted) {
          setProfileData(prev => ({ ...prev, name: user.name || user.username || '', email: user.email || '' }));
        }
        // Try to load profile from backend
        const resp = await apiGetProfile();
        if (isMounted && resp?.profile) {
          setProfileData({
            name: resp.profile.company_name || '',
            founder: resp.profile.founder || '',
            description: resp.profile.description || '',
            address: resp.profile.address || '',
            phone: resp.profile.phone || '',
            domain: resp.profile.domain || '',
            logo: resp.profile.logo || '',
          });
          // Also load team members for this user
          try {
            const teamResp = await apiGetMyTeam();
            const members = Array.isArray(teamResp?.members) ? teamResp.members : [];
            if (isMounted) setProfileData(prev => ({ ...prev, team: members }));
          } catch (teamErr) {
            // no team yet is fine
          }
          setIsProfileCreated(true);
          setIsEditing(false);
        } else if (isMounted) {
          setIsProfileCreated(false);
          setIsEditing(true);
        }
      } catch (e) {
        // If 404, show form; other errors bubble up
        if (e?.response?.status === 404) {
          setIsProfileCreated(false);
          setIsEditing(true);
        } else {
          setError(e?.message || 'Failed to load profile');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    })();
    return () => { isMounted = false; }
  }, []);

  const handleProfileCreate = async (formValues) => {
    // Map form fields to backend contract
    const payload = {
      startupName: formValues.name || formValues.startupName || '',
      founderName: formValues.founder || formValues.founderName || '',
      description: formValues.description || '',
      address: formValues.address || '',
      phone: formValues.phone || '',
      domain: formValues.domain || '',
      logo: formValues.logo || '',
      // Optional TAM/SAM/SOM can be added later
    };
    try {
      const resp = await apiSaveProfile(payload);
      const p = resp?.profile;
      if (p) {
        setProfileData({
          name: p.company_name || '',
          founder: p.founder || '',
          description: p.description || '',
          address: p.address || '',
          phone: p.phone || '',
          domain: p.domain || '',
          logo: p.logo || '',
        });
        // Also persist founder as a team member entry
        const founderName = (formValues.founder || formValues.founderName || p.founder || '').trim();
        if (founderName) {
          try {
            const founderMember = {
              name: founderName,
              role: (formValues.founderRole || 'Founder'),
              photo: formValues.founderPhoto || '',
              equity: formValues.founderEquity || '',
              experiences: Array.isArray(formValues.founderExperiences) ? formValues.founderExperiences : [],
              study: formValues.founderStudy || '',
              about: formValues.founderAbout || ''
            };
            const teamResp = await apiSetMyTeam([founderMember]);
            const members = Array.isArray(teamResp?.members) ? teamResp.members : [];
            setProfileData(prev => ({ ...prev, team: members }));
          } catch (teamErr) {
            console.error('Founder team insert failed:', teamErr);
          }
        }
        setIsProfileCreated(true);
        setIsEditing(false);
      }
    } catch (e) {
      setError(e?.response?.data?.message || e?.message || 'Failed to save profile');
    }
  };

  const handleProfileUpdate = (updated) => {
    const merged = { ...profileData, ...updated };
    setProfileData(merged);
    setIsEditing(false);
  };

  const handleProfileSave = async () => {
    // Persist edits made within StartupProfileView's edit mode
    const payload = {
      startupName: edit.name || profileData.name || '',
      founderName: edit.founder || profileData.founder || '',
      description: edit.description ?? profileData.description ?? '',
      address: edit.address ?? profileData.address ?? '',
      phone: edit.phone ?? profileData.phone ?? '',
      domain: edit.domain ?? profileData.domain ?? '',
      logo: edit.logo ?? profileData.logo ?? '',
    };
    try {
      const resp = await apiSaveProfile(payload);
      const p = resp?.profile;
      if (p) {
        setProfileData({
          name: p.company_name || '',
          founder: p.founder || '',
          description: p.description || '',
          address: p.address || '',
          phone: p.phone || '',
          domain: p.domain || '',
          logo: p.logo || '',
        });
      }
      // Persist team including founder entry (even if team not edited)
      const sourceTeam = Array.isArray(edit?.team) ? edit.team : (Array.isArray(profileData?.team) ? profileData.team : []);
      const founderName = (edit?.founder ?? profileData?.founder ?? '').trim();
      const founderMember = founderName ? {
        name: founderName,
        role: (edit?.founderRole ?? profileData?.founderRole ?? 'Founder'),
        photo: (edit?.founderPhoto ?? profileData?.founderPhoto ?? ''),
        equity: (edit?.founderEquity ?? profileData?.founderEquity ?? ''),
        experiences: Array.isArray(edit?.founderExperiences) ? edit.founderExperiences : (Array.isArray(profileData?.founderExperiences) ? profileData.founderExperiences : []),
        study: (edit?.founderStudy ?? profileData?.founderStudy ?? ''),
        about: (edit?.founderAbout ?? profileData?.founderAbout ?? ''),
      } : null;
      const mappedTeam = (Array.isArray(sourceTeam) ? sourceTeam : []).map(m => ({
        name: m?.name || '',
        role: m?.role || m?.designation || '',
        equity: m?.equity || '',
        experiences: Array.isArray(m?.experiences) ? m.experiences : [],
        study: m?.study || '',
        about: m?.about || '',
        photo: m?.photo || '',
      })).filter(m => m.name);
      // Combine, de-duplicate by name (keep founder at front)
      const combined = (founderMember ? [founderMember] : []).concat(mappedTeam);
      const seen = new Set();
      const deduped = combined.filter(m => {
        const key = m.name.trim().toLowerCase();
        if (!key || seen.has(key)) return false;
        seen.add(key);
        return true;
      });
      try {
        const teamResp = await apiSetMyTeam(deduped);
        let updatedMembers = teamResp?.members;
        if (!Array.isArray(updatedMembers)) {
          // fallback to fetching current team from backend
          const fresh = await apiGetMyTeam();
          updatedMembers = Array.isArray(fresh?.members) ? fresh.members : [];
        }
        setProfileData(prev => ({ ...prev, team: updatedMembers }));
      } catch (teamErr) {
        // surface team error but don't block profile save
        console.error('Team save failed:', teamErr);
        setError(teamErr?.response?.data?.message || teamErr?.message || 'Failed to save team details');
      }
      setIsEditing(false);
    } catch (e) {
      setError(e?.response?.data?.message || e?.message || 'Failed to save profile');
    }
  };

  const openMember = (idx, isFounder = false) => {
    setFocusedMemberIndex({ idx, isFounder });
    setMemberEditing(false);
    setMemberDraft(null);
  };
  const closeMember = () => setFocusedMemberIndex(null);

  const saveMemberEdits = (idxOrObj, memberData) => {
    // idxOrObj can be a number index or an object { idx, isFounder }
    const isFounder = typeof idxOrObj === 'object' && idxOrObj && !!idxOrObj.isFounder;
    const idx = (typeof idxOrObj === 'number') ? idxOrObj : (idxOrObj && typeof idxOrObj.idx === 'number' ? idxOrObj.idx : null);

    if (isFounder) {
      // update founder-specific fields instead of team member
      if (isEditing) {
        setEdit(prev => ({
          ...prev,
          founder: memberData?.name ?? prev.founder ?? '',
          ...(memberData?.role !== undefined ? { founderRole: memberData.role } : {}),
          ...(memberData?.photo !== undefined ? { founderPhoto: memberData.photo } : {}),
          ...(memberData?.equity !== undefined ? { founderEquity: memberData.equity } : {}),
          ...(Array.isArray(memberData?.experiences) ? { founderExperiences: memberData.experiences } : {}),
          ...(memberData?.study !== undefined ? { founderStudy: memberData.study } : {}),
          ...(memberData?.about !== undefined ? { founderAbout: memberData.about } : {}),
        }));
      } else {
        const updates = {
          founder: memberData?.name ?? profileData.founder ?? '',
          ...(memberData?.role !== undefined ? { founderRole: memberData.role } : {}),
          ...(memberData?.photo !== undefined ? { founderPhoto: memberData.photo } : {}),
          ...(memberData?.equity !== undefined ? { founderEquity: memberData.equity } : {}),
          ...(Array.isArray(memberData?.experiences) ? { founderExperiences: memberData.experiences } : {}),
          ...(memberData?.study !== undefined ? { founderStudy: memberData.study } : {}),
          ...(memberData?.about !== undefined ? { founderAbout: memberData.about } : {}),
        };
        handleProfileUpdate(updates);
      }
    } else if (idx !== null && typeof idx === 'number') {
      if (isEditing) {
        setEdit(prev => {
          const copy = (prev.team || []).map(m => ({ ...m }));
          copy[idx] = { ...copy[idx], ...memberData };
          return { ...prev, team: copy };
        });
      } else {
        const currentTeam = (profileData.team && profileData.team.length) ? profileData.team.map(m => ({ ...m })) : [];
        const newTeam = currentTeam.slice();
        newTeam[idx] = { ...newTeam[idx], ...memberData };
        handleProfileUpdate({ team: newTeam });
      }
    }

    // keep the modal open and switch it back to preview mode (do not clear focusedMemberIndex)
    setMemberEditing(false);
    setMemberDraft(null);
  };

  const addTeamMember = () => setEdit(prev => ({ ...prev, team: [...(prev.team || []), { name: '' }] }));
  const removeTeamMember = (idx) => setEdit(prev => ({ ...prev, team: (prev.team || []).filter((_, i) => i !== idx) }));
  const changeTeamMember = (idx, val) => setEdit(prev => {
    const copy = (prev.team || []).map(t => ({ ...t }));
    copy[idx] = copy[idx] || { name: '' };
    copy[idx].name = val;
    return { ...prev, team: copy };
  });

  const moveTeamMember = (fromIdx, toIdx) => setEdit(prev => {
    const list = Array.isArray(prev.team) ? prev.team.slice() : [];
    if (fromIdx == null || toIdx == null) return prev;
    if (fromIdx < 0 || fromIdx >= list.length) return prev;
    if (toIdx < 0 || toIdx >= list.length) return prev;
    if (fromIdx === toIdx) return prev;
    const [item] = list.splice(fromIdx, 1);
    list.splice(toIdx, 0, item);
    return { ...prev, team: list };
  });

  const handleChange = (field) => (e) => setEdit(prev => ({ ...prev, [field]: e.target.value }));

  const fileToDataUrl = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

  const handleLogoUpload = async (e) => {
    if (e?.target?.files && e.target.files[0]) {
      try {
        const dataUrl = await fileToDataUrl(e.target.files[0]);
        setEdit(prev => ({ ...prev, logo: dataUrl }));
      } catch (err) {
        setEdit(prev => ({ ...prev, logo: URL.createObjectURL(e.target.files[0]) }));
      }
    }
  };

  const handleCancel = () => setIsEditing(false);

  const tags = profileData.domain ? [profileData.domain] : [];
  const team = (profileData.team && profileData.team.length) ? profileData.team : [];
  const contact = { email: profileData.email || '', address: profileData.address || '' };

  useEffect(() => {
    if (isEditing) {
      setEdit({
        name: profileData.name || '',
        founder: profileData.founder || '',
        founderRole: profileData.founderRole || '',
        founderPhoto: profileData.founderPhoto || '',
        founderEquity: profileData.founderEquity || '',
        founderExperiences: (profileData.founderExperiences && profileData.founderExperiences.length) ? [...profileData.founderExperiences] : [],
        founderStudy: profileData.founderStudy || '',
        founderAbout: profileData.founderAbout || '',
        description: profileData.description || '',
        email: profileData.email || '',
        phone: profileData.phone || '',
        address: profileData.address || '',
        domain: profileData.domain || '',
        team: (profileData.team && profileData.team.length) ? profileData.team.map(m => ({ ...m })) : [],
        logo: profileData.logo || ''
      });
    }
  }, [isEditing, profileData]);

  const editStateProps = {
    edit, setEdit, fileInputRef, openMember, closeMember,
    memberEditing, setMemberEditing, memberDraft, setMemberDraft,
    addTeamMember, removeTeamMember, changeTeamMember, moveTeamMember, saveMemberEdits,
    handleLogoUpload, handleChange, handleSave: () => handleProfileSave(), handleCancel,
    onStartEdit: () => setIsEditing(true), tags, team, contact
  };

  if (loading) return <div className="startup-profile"><div style={{ padding: '2rem' }}>Loading...</div></div>;
  if (!isProfileCreated) {
    // Show creation form only when no profile exists yet
    return (
      <ErrorBoundary>
        <div className="startup-profile">
          {error && <div style={{ color: 'red', padding: '0.5rem 1rem' }}>{error}</div>}
          <StartupProfileForm onProfileCreate={handleProfileCreate} initialData={profileData} />
        </div>
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <div className="startup-profile">
        {error && <div style={{ color: 'red', padding: '0.5rem 1rem' }}>{error}</div>}
        <StartupProfileView profileData={profileData} isEditing={isEditing} editStateProps={editStateProps} />
        <TeamMemberModal
          focusedMemberIndex={focusedMemberIndex}
          isEditing={isEditing}
          profileData={profileData}
          edit={edit}
          memberEditing={memberEditing}
          memberDraft={memberDraft}
          setMemberEditing={setMemberEditing}
          setMemberDraft={setMemberDraft}
          closeMember={closeMember}
          saveMemberEdits={(idx, data) => saveMemberEdits(idx, data)}
        />
      </div>
    </ErrorBoundary>
  );
}
