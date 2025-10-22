import React, { useEffect, useRef, useState } from 'react';
import './TopBar.css';
import logo from '../assets/NavBar/logo.png';
import profile from '../assets/Portal/profile.png';
import { useNavigate, useLocation } from 'react-router-dom';
import { getStoredUser, clearAuth, getToken } from '../auth.js';
import { useAuth } from '../contexts/AuthContext';
import { getSession } from '../services/authApi.js';

function TopBar() {
    const navigate = useNavigate();
    const location = useLocation();
    const { logout: contextLogout } = useAuth();
    const [displayUser, setDisplayUser] = useState(() => getStoredUser());
    const [toast, setToast] = useState("");
    const [toastType, setToastType] = useState('success');
    const [toastDuration, setToastDuration] = useState(2200);
    const [showToast, setShowToast] = useState(false);
    const [toastLeaving, setToastLeaving] = useState(false);
    const toastConsumedKey = useRef(null);

    useEffect(() => {
        let cancelled = false;
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

    useEffect(() => {
        let clearStateTimer;
        const ts = location.state?.toast;
        if (ts && toastConsumedKey.current !== location.key) {
            let duration = 2200;
            if (typeof ts === 'string') {
                setToast(ts);
                setToastType('success');
                setToastDuration(duration);
            } else if (typeof ts === 'object') {
                duration = Number(ts.duration) || 2200;
                setToast(ts.message || '');
                setToastType(ts.type || 'success');
                setToastDuration(duration);
            }
            setShowToast(true);
            setToastLeaving(false);
            toastConsumedKey.current = location.key;
            clearStateTimer = setTimeout(() => {
                navigate(location.pathname, {
                    replace: true,
                    state: location.state ? { ...location.state, toast: null } : undefined,
                });
            }, 0);
        }
        return () => { if (clearStateTimer) clearTimeout(clearStateTimer); };
    }, [location.state, location.key, navigate, location.pathname]);

    useEffect(() => {
        if (showToast) {
            const hideTimer = setTimeout(() => {
                setToastLeaving(true);
            }, toastDuration);

            return () => clearTimeout(hideTimer);
        }
    }, [showToast, toastDuration]);

    useEffect(() => {
        if (!showToast) return;
        
        const handleGlobalClick = () => {
            setToastLeaving(true);
        };
        
        const timer = setTimeout(() => {
            document.addEventListener('click', handleGlobalClick);
        }, 100);
        
        return () => {
            clearTimeout(timer);
            document.removeEventListener('click', handleGlobalClick);
        };
    }, [showToast]);

    const handleLogout = () => {
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
            {showToast && (
                <div
                    className={`topbar-toast${toastLeaving ? ' leaving' : ''}`}
                    role="status"
                    aria-live="polite"
                    style={{ '--toast-duration': `${toastDuration}ms`, '--toast-top': '84px' }}
                    onAnimationEnd={(e) => {
                        if (toastLeaving && e.animationName === 'slideOutRight') {
                            setShowToast(false);
                            setToastLeaving(false);
                        }
                    }}
                >
                    <div className={`toast-card toast-${toastType}`}>
                        {toast}
                        <div className="toast-progress" />
                    </div>
                </div>
            )}
        </div>
    )
}

export default TopBar