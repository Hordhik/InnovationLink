
import React, { useState } from 'react'
import './LogIn.css'
import { useNavigate } from 'react-router-dom';
import logo from '../assets/NavBar/logo.png';
import Axios from 'axios';
import googleIcon from '../assets/Authentication/google.svg';
import login from '../assets/Authentication/login.png';

const LogIn = () => {
  const navigate = useNavigate();
  // State for form inputs
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [userType, setUserType] = useState('startup'); // 'startup' or 'investor'

  // Clear form data when userType changes
  const handleUserTypeChange = (type) => {
    setUserType(type);
    setFormData({ username: '', password: '' });
    setError('');
  };

  const handleCreateAccountClick = () => {
    navigate('/auth/signup');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (error) setError('');
  };


  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await fetch("http://localhost:5001/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.username,   // 👈 sending name as username
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Login failed");
        return;
      }

      // Save token + role
      localStorage.setItem("il_token", data.token);
      localStorage.setItem("il_role", userType);

      // Navigate to dashboard
      const typeUrl = userType === "investor" ? "I" : "S";
      navigate(`/${typeUrl}/dashboard`);
    } catch (err) {
      setError(err.message || "Server error. Try again later.");
    }
  };




  return (
    <div className="login-page">
      <div className="image">
        <img src={login} alt="Login" />
      </div>
      <div className="login">
        <img src={logo} alt="Login" />
        {/* User type toggle */}
        <div className="user-type-toggle">
          <button
            type="button"
            className={`toggle-button ${userType === 'startup' ? 'active' : ''}`}
            onClick={() => handleUserTypeChange('startup')}
          >
            Start Up
          </button>
          <button
            type="button"
            className={`toggle-button ${userType === 'investor' ? 'active' : ''}`}
            onClick={() => handleUserTypeChange('investor')}
          >
            Investor
          </button>
        </div>
        <form onSubmit={handleLogin}>
          <div className="credentials">
            <div className="username">
              <p className='label'>Username:</p>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                placeholder={`Enter your ${userType} username...`}
                required
              />
            </div>
            <div className="password">
              <p className='label'>Password:</p>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Enter your password..."
                required
              />
              <p className='forgot-password'>Forgot your password?</p>
            </div>
          </div>
          {error && <p className="error-message">{error}</p>}
          <div className="login-button">
            <button type="submit">Login</button>
          </div>
        </form>
        <p>--------------------- or ---------------------</p>
        <div className="alternatives">
          <button>
            <img src={googleIcon} alt="Google" />
          </button>
          <button>
            <img src={googleIcon} alt="Facebook" />
          </button>
          <button>
            <img src={googleIcon} alt="Facebook" />
          </button>
        </div>
        <p className='create-account'>Don't have an account? <span onClick={handleCreateAccountClick}>Create one</span></p>
        <p className='policies'>Please go through <span>Privacy Policy</span> & <span>Cookie Policy</span></p>
      </div>
    </div>
  )
}

export default LogIn