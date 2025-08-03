import React from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom';
import logo from '../../assets/NavBar/logo.png';
import arrow from '../../assets/NavBar/register.svg';
import './NavBar.css';

function NavBar() {
    const location = useLocation();
    const navigate = useNavigate();

    const NavOptions = [
        {name: "Home", path: "/home"},
        {name: "Blogs", path: "/blogs"},
        {name: "Events", path: "/events"},
        {name: "About", path: "/about"}
    ];

    const handleLoginClick = () => {
        navigate('/auth/login');
    };

    const handleRegisterClick = () => {
        navigate('/auth/signup');
    };

  return (
    <>
        <div className="NavBar">
            <div className="logo">
                <img src={logo} alt="Logo" />
            </div>
            <div className="Nav-options">
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
                <div className="Signin-option login" onClick={handleLoginClick}>
                    Login In
                </div>
                <div className="Signup-option register" onClick={handleRegisterClick}>
                    Register
                    <img src={arrow} alt="" />
                </div>
            </div>
        </div>
    </>
  )
}

export default NavBar