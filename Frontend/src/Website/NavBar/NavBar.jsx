import React, { useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import logo from '../../assets/NavBar/logo.png';
import arrow from '../../assets/NavBar/register.svg';
import './NavBar.css';
import { getStoredUser, clearAuth, getToken } from '../../auth.js';
import { getSession } from '../../services/authApi.js';

function NavBar() {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    const NavOptions = [
        { name: "Home", path: "/home" },
        { name: "Blogs", path: "/blogs" },
        { name: "Events", path: "/events" },
        { name: "About", path: "/about" }
    ];

    // Derive auth state from JWT for accuracy with backend
    const [sessionUser, setSessionUser] = useState(null);
    const isLoggedIn = !!getToken();

    // Keep a light fallback from localStorage for immediate paint
    const backendUser = useMemo(() => getStoredUser(), [user]);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const data = await getSession();
                if (!cancelled) {
                    setSessionUser(data?.user || null);
                }
            } catch (e) {
                if (!cancelled) setSessionUser(null);
            }
        })();
        return () => { cancelled = true; };
    }, [isLoggedIn]);
    const getPortalPath = (u) => {
        const src = sessionUser || u;
        if (!src) return '/';
        const role = src.userType === 'investor' ? 'I' : 'S';
        return `/${role}/home`;
    };

    const handleLoginClick = () => {
        navigate('/auth/login');
    };

    const handleRegisterClick = () => {
        navigate('/auth/signup');
    };

    const handleLogout = () => {
        clearAuth();
        logout(); // AuthContext logout clears UI auth
        navigate('/home');
    }

    return (
        <>
            <div className="NavBar">
                {/* Brand inside the pill for a unified control */}
                <Link to="/home" className="brand" aria-label="Innovation Link home">
                    <img src={logo} alt="Innovation Link" />
                </Link>
                <div className="Nav-options">
                    {isLoggedIn ? (
                        <Link key="portal" to={getPortalPath(backendUser)} className={`Nav-option ${location.pathname.startsWith('/S') || location.pathname.startsWith('/I') ? 'active' : ''}`}>
                            Portal
                        </Link>
                    ) : (
                        NavOptions.map((option) => (
                            <Link
                                key={option.name}
                                to={option.path}
                                className={`Nav-option ${location.pathname === option.path ? 'active' : ''}`}
                            >
                                {option.name}
                            </Link>
                        ))
                    )}
                </div>
                <div className="Signin-options">
                    {isLoggedIn ? (
                        <>
                            <div className="Signin-option login">
                                <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.1 }}>
                                    <span>
                                        {(sessionUser?.name || sessionUser?.username)
                                            ?? (backendUser?.name || backendUser?.username)
                                            ?? backendUser?.email
                                            ?? user?.email}
                                    </span>
                                    <span style={{ opacity: 0.8, fontSize: '0.9em' }}>
                                        {(sessionUser?.username || backendUser?.username)
                                            ? `@${sessionUser?.username || backendUser?.username}`
                                            : ''}
                                    </span>
                                </div>
                            </div>
                            <div className="Signup-option register" onClick={handleLogout}>
                                Log out
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="Signin-option login" onClick={handleLoginClick}>
                                Login In
                            </div>
                            <div className="Signup-option register" onClick={handleRegisterClick}>
                                Register
                                <img src={arrow} alt="" />
                            </div>
                        </>
                    )}
                </div>
            </div>
        </>
    )
}

export default NavBar