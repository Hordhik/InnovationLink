import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getPublicProfile } from '../../../services/startupProfileApi';
import { getConnectionStatus, sendConnectionRequest } from '../../../services/connectionApi';
import PublicStartupDock from './PublicStartupDock';
import './PublicStartupProfile.css';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import TeamMemberModal from './TeamMemberModal';
import userIcon from '../../../assets/Portal/user.svg';
import feedbackIcon from '../../../assets/Portal/feedback.png';

// Re-using the team rendering logic from StartupProfileView.jsx
const TeamSection = ({ team, onMemberClick }) => {
    return (
        <div className="card spv-team">
            <div className="card-title">Team</div>
            <div className="team-grid">
                {(team || []).map((m, idx) => (
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
                {(!team || team.length === 0) && (
                    <p style={{ padding: '0 16px 16px', color: '#6b7280' }}>No team members visible.</p>
                )}
            </div>
        </div>
    );
};

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
    const [isAchievementsOpen, setAchievementsOpen] = useState(false);

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

                setProfileData(data.profile);
                setTeam(data.team);
                setDockFiles(data.dockFiles || { pitch: [], demo: [], patent: [] });

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
        return <div className="spv-root"><div style={{ padding: '2rem' }}>Loading profile...</div></div>;
    }

    if (error) {
        return <div className="spv-root"><div style={{ padding: '2rem', color: 'red' }}>Error: {error}</div></div>;
    }

    if (!profileData) {
        return <div className="spv-root"><div style={{ padding: '2rem' }}>Startup profile not found.</div></div>;
    }

    return (
        <>
            <div className="spv-root public-profile-layout">
                {/* 1. Top Grid: Header + Description + Dock */}
                <div className="spv-topgrid">
                    {/* Header Card */}
                    <div className="card spv-header">
                        <div className='main-details'>
                            <div className="spv-logo">
                                {profileData.logo ? (
                                    <img src={profileData.logo} alt="logo" />
                                ) : (
                                    <div className="spv-logo-placeholder">
                                        {(profileData.company_name || '').split(' ').map(s => s[0]).slice(0, 2).join('')}
                                    </div>
                                )}
                            </div>
                            <div className="spv-hmeta">
                                <h2 className="spv-title">{profileData.company_name || '—'}</h2>
                                <div className="spv-sub">
                                    Founder: <strong>{profileData.founder || '—'}</strong>
                                </div>
                            </div>
                        </div>
                        <div className="spv-actions">
                            <button className="feedback"><img src={feedbackIcon} alt="" />FeedBack</button>
                            {renderConnectButton()}
                        </div>
                    </div>

                    {/* Description Card */}
                    <div className="card spv-desc">
                        <div className="card-title">Project Description</div>
                        <div className="card-body">
                            <p className="desc-text">{profileData.description || 'No description provided.'}</p>
                        </div>
                        <div className="spv-tags">
                            {(String(profileData.domain || '')).split(',').filter(Boolean).slice(0, 3).map((t, i) => (
                                <span key={i} className="chip">
                                    {t.trim()}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Startup Dock */}
                    <div className="card startup-dock">
                        <div className="card-title">Startup Dock</div>
                        <div className="card-body" style={{ display: 'block', padding: '10px 16px' }}>
                            <PublicStartupDock username={profileData.username} dockFiles={dockFiles} />
                        </div>
                    </div>
                </div>

                {/* 2. Team + GTM */}
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

                {/* 3. More section: Connected Investors • Achievements • Market Analysis • Recent Posts */}
                <div className="more">


                    {/* Achievements */}
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
                                <div className='blog-card' style={{ cursor: 'pointer', borderBottom: '1px solid #e5e7eb', paddingBottom: '10px', marginBottom: '10px' }}>
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

            {isAchievementsOpen && (
                <div className="epm-backdrop" onClick={() => setAchievementsOpen(false)}>
                    <div className="epm-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="epm-header">
                            <h3>All Achievements & Event Participation</h3>
                            <button className="epm-close" onClick={() => setAchievementsOpen(false)}>✕</button>
                        </div>
                        <div className="epm-body">
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
                        </div>
                        <div className="epm-footer">
                            <button className="epm-btn epm-cancel" onClick={() => setAchievementsOpen(false)}>Close</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default PublicStartupProfile;