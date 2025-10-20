import React, { useEffect, useState } from 'react'
import './TopBar.css'; // Assuming you have a CSS file for styling
import logo from '../assets/NavBar/logo.png'; // Adjust the path to your logo image
import profile from '../assets/Portal/profile.png'; // Adjust the path to your user icon
import { useNavigate } from 'react-router-dom';
import { getStoredUser, clearAuth } from '../auth.js';
import { getSession } from '../services/authApi.js';

function TopBar() {
    const navigate = useNavigate();
    const [displayUser, setDisplayUser] = useState(() => getStoredUser());

    useEffect(() => {
        let cancelled = false;
        // Validate the session in background
        (async () => {
            try {
                const data = await getSession();
                if (!cancelled) {
                    if (data?.user) {
                        setDisplayUser(data.user);
                    } else {
                        // No valid session, but don't redirect - let user browse public content
                        setDisplayUser(null);
                    }
                }
            } catch (err) {
                // On unexpected errors, clear auth but don't redirect
                if (!cancelled) {
                    console.error('Session validation failed:', err);
                    setDisplayUser(null);
                }
            }
        })();
        return () => { cancelled = true; };
    }, [navigate]);

    const handleLogout = () => {
        clearAuth();
        navigate('/auth/login');
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
                        <p className='name'>{displayUser?.username || displayUser?.email || 'User'}</p>
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