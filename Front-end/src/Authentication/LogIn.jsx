
import React, { useState, useEffect } from 'react'
import './LogIn.css'
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import logo from '../assets/NavBar/logo.png';
import Axios from 'axios';
import googleIcon from '../assets/Authentication/google.svg';
import login from '../assets/Authentication/login.png';
import { login as loginApi } from '../services/authApi';


const LogIn = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login: authLogin } = useAuth();
  
  // Get pre-filled data from navigation state (from signup)
  const signupData = location.state;
  
  // State for form inputs
  const [formData, setFormData] = useState({
    username: signupData?.email || '',
    password: signupData?.password || ''
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [userType, setUserType] = useState(signupData?.userType || 'startup'); // 'startup' or 'investor'
  const [successMessage, setSuccessMessage] = useState('');

  // Handle pre-filled data from signup
  useEffect(() => {
    if (signupData?.email && signupData?.password) {
      setSuccessMessage('Account created successfully! Please login with your credentials.');
      // Clear success message after 5 seconds
      const timer = setTimeout(() => setSuccessMessage(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [signupData]);

  // Clear form data when userType changes (but preserve pre-filled data from signup)
  const handleUserTypeChange = (type) => {
    setUserType(type);
    // Only clear if it's not pre-filled data from signup
    if (!signupData?.email) {
      setFormData({ username: '', password: '' });
    }
    setError('');
    setSuccessMessage(''); // Clear success message when user changes type
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


  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Try real API login first
      const data = await loginApi({
        identifier: formData.username,
        password: formData.password,
        userType,
      });

      // Store legacy tokens for compatibility
      localStorage.setItem("il_token", data.token);
      localStorage.setItem("il_role", userType);
      if (data.user) {
        localStorage.setItem("il_user", JSON.stringify(data.user));
      }

      // Also update AuthContext for blur feature
      await authLogin({
        email: formData.username,
        password: formData.password
      });

  const role = (data.user?.userType === 'investor' || userType === 'investor') ? 'I' : 'S';
  const next = data.redirectPath || `/${role}/home`;
  navigate(next);
      
    } catch (err) {
      // Fallback to AuthContext login if API fails
      try {
        await authLogin({
          email: formData.username,
          password: formData.password
        });
  const role = (userType === 'investor') ? 'I' : 'S';
  navigate(`/${role}/home`);
      } catch (authErr) {
        const apiMsg = err?.response?.data?.message;
        setError(apiMsg || err.message || "Login failed. Please check your credentials.");
      }
    } finally {
      setLoading(false);
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
        <form onSubmit={handleSubmit}>
          <div className="credentials">
            <div className="username">
              <p className='label'>Email or Username:</p>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                placeholder={`Enter your email or username...`}
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
          {successMessage && (
            <div style={{
              backgroundColor: '#d4edda',
              color: '#155724',
              border: '1px solid #c3e6cb',
              borderRadius: '4px',
              padding: '10px',
              margin: '10px 0',
              fontSize: '14px'
            }}>
              {successMessage}
            </div>
          )}
          {error && <p className="error-message">{error}</p>}
          
          <div className="login-button">
            <button type="submit" disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </button>
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