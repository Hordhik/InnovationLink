import React, { useEffect, useState } from 'react'
import './TopBar.css'; // Assuming you have a CSS file for styling
import logo from '../assets/NavBar/logo.png'; // Adjust the path to your logo image
import profile from '../assets/Portal/profile.png'; // Adjust the path to your user icon
import { useNavigate } from 'react-router-dom';
import { getStoredUser, clearAuth, getToken } from '../auth.js';
import { useAuth } from '../contexts/AuthContext';
import { getSession } from '../services/authApi.js';

function TopBar() {
    const navigate = useNavigate();
    const { logout: contextLogout } = useAuth();
    const [displayUser, setDisplayUser] = useState(() => getStoredUser());

    useEffect(() => {
        let cancelled = false;
        // Validate the session in background, but ignore after logout
        (async () => {
            try {
                const tokenAtStart = getToken?.();
                if (!tokenAtStart) { setDisplayUser(null); return; }
                const data = await getSession();
                const tokenNow = getToken?.();
                if (!cancelled && tokenNow && tokenNow === tokenAtStart && data?.user) {
                    setDisplayUser(data.user);
                }
            } catch (err) {
                if (!cancelled) {
                    console.error('Session validation failed:', err);
                }
            }
        })();
        return () => { cancelled = true; };
    }, []);

    const handleLogout = () => {
        // Clear both API auth (il_*) and UI auth (auth_*) stores
        clearAuth();
        try { contextLogout?.(); } catch {}
        setDisplayUser(null);
        navigate('/home');
    };
    return (
        <div className='top-bar'>
            <img src={logo} alt="Logo" />
            <div className="user-details">
                <div className="subscription">
                    <button className='subscribe-button'>Subscribe to Plan</button>
                </div>
                <div className="details">
                    <img src={profile} alt="Profile" />
                    <div className="names">
                        <p className='name'>{displayUser?.username || displayUser?.name || displayUser?.email || 'User'}</p>
                        <p className='id'>{displayUser?.username ? `@${displayUser.username}` : ''}</p>
                    </div>
                </div>
                <div className="log-out">
                    <button className='log-out-button' onClick={handleLogout}>Log Out</button>
                </div>
            </div>
        </div>
    )
}

export default TopBar