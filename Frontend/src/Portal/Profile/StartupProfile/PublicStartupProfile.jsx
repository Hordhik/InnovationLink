//
// FILE: Frontend/src/components/Portal/Profile/PublicStartupProfile.jsx (New File)
//
// This is the new page component an investor sees.
// It reuses your existing components like StartupProfileHeader.
//

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getPublicProfile } from '../../../services/startupProfileApi';
import { getConnectionStatus, sendConnectionRequest } from '../../../services/connectionApi';
import StartupProfileHeader from './StartupProfileHeader'; // Reusing your header
import PublicStartupDock from './PublicStartupDock'; // Using our new dock component
import './PublicStartupProfile.css'; // Public-specific overrides and imports the shared StartupProfile.css
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import TeamMemberModal from './TeamMemberModal';
import userIcon from '../../../assets/Portal/user.svg';

// Re-using the team rendering logic from StartupProfileView.jsx
const TeamSection = ({ team, onMemberClick }) => {
    if (!team || team.length === 0) {
        return (
            <div className="card spv-team">
                <div className="card-title">Team</div>
                <p style={{ padding: '0 16px 16px', color: '#6b7280' }}>No team members have been added yet.</p>
            </div>
        );
    }

    return (
        <div className="card spv-team">
            <div className="card-title">Team</div>
            <div className="team-grid">
                {team.map((m, idx) => (
                    <div
                        key={idx}
                        className="team-item"
                        style={{ cursor: 'pointer' }}
                        onClick={() => onMemberClick?.(idx, (m.role?.toLowerCase() === 'founder' || m.designation?.toLowerCase() === 'founder'))}
                    >
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
                ))}
            </div>
        </div>
    );
};

// Main Page Component
const PublicStartupProfile = () => {
    const { username } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [profileData, setProfileData] = useState(null);
    const [team, setTeam] = useState([]);
    const [dockFiles, setDockFiles] = useState({ pitch: [], demo: [], patent: [] });
    const [focusedMemberIndex, setFocusedMemberIndex] = useState(null);
    const [connectionStatus, setConnectionStatus] = useState({ status: 'none', role: 'none' });

    useEffect(() => {
        const loadData = async () => {
            if (!username) {
                setError('No startup username provided.');
                setLoading(false);
                return;
            }
            try {
                setLoading(true);
                setError('');
                const data = await getPublicProfile(username);

                // Set all data from the single API call
                setProfileData(data.profile);
                setTeam(data.team);
                setDockFiles(data.dockFiles || { pitch: [], demo: [], patent: [] });

                // Check connection status
                if (data.profile.userId) {
                    try {
                        const statusData = await getConnectionStatus(data.profile.userId);
                        setConnectionStatus(statusData);
                    } catch (connErr) {
                        console.error("Failed to check connection status:", connErr);
                    }
                }

            } catch (err) {
                console.error("Failed to load public profile:", err);
                setError(err.response?.data?.message || err.message || 'Could not load startup profile.');
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [username]);

    const handleConnect = async () => {
        try {
            await sendConnectionRequest(profileData.userId);
            setConnectionStatus({ status: 'pending', role: 'sender' });
            alert('Connection request sent!');
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to send request');
        }
    };

    const renderConnectButton = () => {
        const prefix = `/${(window.location.pathname.split('/')[1] || 'I')}`;

        if (connectionStatus.status === 'accepted') {
            return (
                <button
                    className="connect-btn"
                    onClick={() =>
                        navigate(`${prefix}/inbox`, {
                            state: {
                                initialChat: {
                                    username: profileData.username,
                                    companyName: profileData.company_name,
                                },
                            },
                        })
                    }
                >
                    <img src={userIcon} alt="" />Message
                </button>
            );
        }
        if (connectionStatus.status === 'pending') {
            if (connectionStatus.role === 'sender') {
                return <button className="connect-btn" disabled><img src={userIcon} alt="" />Request Sent</button>;
            }
            return <button className="connect-btn" disabled><img src={userIcon} alt="" />Pending Request</button>;
        }
        if (connectionStatus.status === 'blocked') {
            return null;
        }
        return (
            <button className="connect-btn" onClick={handleConnect}>
                <img src={userIcon} alt="" />Connect
            </button>
        );
    };

    if (loading) {
        return <div className="public-profile-layout"><p>Loading profile...</p></div>;
    }

    if (error) {
        return <div className="public-profile-layout"><p style={{ color: 'red' }}>Error: {error}</p></div>;
    }

    if (!profileData) {
        return <div className="public-profile-layout"><p>Startup profile not found.</p></div>;
    }

    // This data structure is what StartupProfileHeader expects
    const headerData = {
        name: profileData.company_name,
        founder: profileData.founder,
        description: profileData.description,
        domain: profileData.domain,
        logo: profileData.logo,
        username: profileData.username
        // We pass 'isEditing={false}' so no edit props are needed
    };

    return (
        <>
            <div className="public-profile-layout spv-root">
                {/* 1. Header (reused) */}
                <div className="spv-topgrid">
                    <StartupProfileHeader
                        profileData={headerData}
                        isEditing={false}
                        editStateProps={{}} // Pass empty object as it's not in edit mode
                        publicView={true}
                        customConnectButton={renderConnectButton()}
                    />

                    {/* 2. Public Startup Dock (New Component) */}
                    <div className="card startup-dock">
                        <div className="card-title">Startup Dock</div>
                        <div className="card-body" style={{ display: 'block', padding: '10px 16px' }}>
                            <PublicStartupDock username={profileData.username} dockFiles={dockFiles} />
                        </div>
                    </div>
                </div>

                {/* 2. Team Section (Reused layout) */}
                <div className="spv-row">
                    <TeamSection team={team} onMemberClick={(idx, isFounder) => setFocusedMemberIndex({ idx, isFounder })} />
                    <div className="card gtm">
                        <div className="card-title">Go-To-Market Strategy</div>
                        <ul className="gtm-points">
                            <li><strong>Phase 1:</strong> Target 500 pilot customers through campus accelerators.</li>
                            <li><strong>Phase 2:</strong> Partner with 3 industry leaders for joint campaigns.</li>
                            <li><strong>Phase 3:</strong> Expand via digital marketing and B2B referrals.</li>
                        </ul>
                    </div>
                </div>

                {/* More section: Achievements • Market Analysis • Recent Posts */}
                <div className="more">
                    {/* Achievements */}
                    <div className="card achievements">
                        <div className="ach-header">
                            <div className="card-title">Achievements</div>
                            <button className="view-all-btn" disabled title="Read-only on public view">View All</button>
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

                    {/* Market Analysis */}
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
                                        <Cell fill="#0073e6" />
                                        <Cell fill="#00c49f" />
                                        <Cell fill="#ffbb28" />
                                    </Pie>
                                    <Tooltip formatter={(value) => `$${value}B`} />
                                    <Legend verticalAlign="bottom" align="center" iconType="circle" />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Recent Posts */}
                    <div className="card spv-blogs">
                        <div className="card-title">Recent Posts</div>
                        <div className="card-body">
                            <div className="blog-grid">
                                <div className='blog-card' style={{ cursor: 'pointer' }}>
                                    <p className='blog-title'>Deploying tiny ML to the field</p>
                                    <p className='blog-meta'>Jan 2025 • Tech</p>
                                </div>
                                <div className='blog-card' style={{ cursor: 'pointer' }}>
                                    <p className='blog-title'>Deploying tiny ML to the field</p>
                                    <p className='blog-meta'>Jan 2025 • Tech</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <TeamMemberModal
                focusedMemberIndex={focusedMemberIndex}
                isEditing={false}
                profileData={{ ...profileData, team }}
                edit={{}}
                memberEditing={false}
                memberDraft={null}
                setMemberEditing={() => { }}
                setMemberDraft={() => { }}
                closeMember={() => setFocusedMemberIndex(null)}
                saveMemberEdits={() => { }}
                changeTeamMember={() => { }}
                openMember={() => { }}
                readOnly={true}
            />
        </>
    );
};

export default PublicStartupProfile;