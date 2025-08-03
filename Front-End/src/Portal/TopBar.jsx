import React from 'react'
import './TopBar.css'; // Assuming you have a CSS file for styling
import logo from '../assets/NavBar/logo.png'; // Adjust the path to your logo image
import profile from '../assets/Portal/profile.png'; // Adjust the path to your user icon
import { useNavigate } from 'react-router-dom';

function TopBar() {
    const navigate = useNavigate();
    
      const handleLogout = () => {
        // Navigate back to website home page
        navigate('/');
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
                    <p className='name'>Chandra Sekhar</p>
                    <p className='id'>@Chandu</p>
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