import React, { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import logo from '../../assets/NavBar/logo.png';
import arrow from '../../assets/NavBar/register.svg';
import './NavBar.css';
import { getStoredUser, clearAuth } from '../../auth.js';
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

    const [displayUser, setDisplayUser] = useState(() => getStoredUser());

    const getPortalPath = (user) => {
        if (!user) return '/';
        const role = user.userType === 'investor' ? 'I' : 'S';
        const username = user.username || user.name || 'handbook';
        return `/${role}/${username}/home`;
    };

    useEffect(() => {
        // Sync with AuthContext user state
        if (user) {
            setDisplayUser(user);
        } else {
            setDisplayUser(null);
        }
    }, [user]);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const data = await getSession();
                if (!cancelled && data?.user) {
                    setDisplayUser(data.user);
                }
            } catch (error) {
                // Handle any unexpected errors
                console.error('Session check failed:', error);
            }
        })();
        return () => { cancelled = true; };
    }, []);

    const handleLoginClick = () => {
        navigate('/auth/login');
    };

    const handleRegisterClick = () => {
        navigate('/auth/signup');
    };

    const handleLogout = () => {
        clearAuth();
        logout(); // Use AuthContext logout
        setDisplayUser(null);
        navigate('/home');
    }

    return (
        <>
            <div className="NavBar">
                <div className="logo">
                    <img src={logo} alt="Logo" />
                </div>
                <div className="Nav-options">
                                            {displayUser && (
                                                    <>
                                                        <Link key="portal" to={getPortalPath(displayUser)} className={`Nav-option ${location.pathname.startsWith('/S') || location.pathname.startsWith('/I') ? 'active' : ''}`}>
                                                            Portal
                                                        </Link>
                                                        <Link key="public" to={`/home?public=true`} className={`Nav-option ${location.pathname === '/home' ? 'active' : ''}`}>
                                                            View public site
                                                        </Link>
                                                    </>
                                            )}
                    {NavOptions.map((option) => (
                        <Link
                            key={option.name}
                            to={option.path}
                            className={`Nav-option ${location.pathname === option.path ? 'active' : ''}`}
                        >
                            {option.name}
                        </Link>
                    ))}
                </div>
                <div className="Signin-options">
                    {displayUser ? (
                        <>
                            <div className="Signin-option login">
                                {displayUser.username || displayUser.email}
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