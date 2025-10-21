import React, { useEffect, useState, useRef } from "react";
import { getStoredUser } from '../../../auth.js';
import StartupProfileForm from "./StartupProfileForm";
import StartupProfileView from "./StartupProfileView";
import TeamMemberModal from "./TeamMemberModal";
import "./StartupProfile.css";

export default function StartupProfile() {
  const [isProfileCreated, setIsProfileCreated] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({});

  const [edit, setEdit] = useState({});
  const fileInputRef = useRef(null);
  const [focusedMemberIndex, setFocusedMemberIndex] = useState(null); // can be { idx, isFounder }
  const [memberEditing, setMemberEditing] = useState(false);
  const [memberDraft, setMemberDraft] = useState(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('startupProfile');
      if (saved) {
        setProfileData(JSON.parse(saved) || {});
        setIsProfileCreated(true);
      } else {
        const user = getStoredUser();
        if (user) {
          setProfileData(prev => ({ ...prev, name: user.name || user.username || '', email: user.email || '' }));
          const createdFlag = localStorage.getItem('startupProfileCreated');
          if (!createdFlag) setIsProfileCreated(false);
        }
      }
    } catch (e) {
      // ignore
    }
  }, []);

  const handleProfileCreate = (formValues) => {
    setProfileData(formValues);
    setIsProfileCreated(true);
    setIsEditing(false);
    try { localStorage.setItem('startupProfile', JSON.stringify(formValues)); } catch {}
    try { localStorage.setItem('startupProfileCreated', '1'); } catch {}
  };

  const handleProfileUpdate = (updated) => {
    const merged = { ...profileData, ...updated };
    setProfileData(merged);
    setIsEditing(false);
    try { localStorage.setItem('startupProfile', JSON.stringify(merged)); } catch {}
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
      // update founder field instead of team member
      if (isEditing) {
        setEdit(prev => ({ ...prev, founder: memberData?.name || prev.founder || '' }));
      } else {
        handleProfileUpdate({ founder: memberData?.name || profileData.founder || '' });
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
    addTeamMember, removeTeamMember, changeTeamMember, saveMemberEdits,
    handleLogoUpload, handleChange, handleSave: () => handleProfileUpdate(edit), handleCancel,
    onStartEdit: () => setIsEditing(true), tags, team, contact
  };

  if (!isProfileCreated) {
    return <StartupProfileForm onProfileCreate={handleProfileCreate} initialData={profileData} />;
  }

  return (
    <div className="startup-profile">
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
  );
}
