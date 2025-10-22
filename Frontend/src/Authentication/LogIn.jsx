
import React, { useState, useEffect } from 'react'
import './LogIn.css'
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import logo from '../assets/NavBar/logo.png';
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
  const [showPassword, setShowPassword] = useState(false);

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
      // Real API login only; no silent fallback on failure
      const data = await loginApi({
        identifier: formData.username,
        password: formData.password,
        userType,
      });

      // Store token and user on success
      localStorage.setItem("il_token", data.token);
      localStorage.setItem("il_role", data.user?.userType === 'investor' ? 'investor' : 'startup');
      if (data.user) {
        localStorage.setItem("il_user", JSON.stringify(data.user));
      }

      const role = (data.user?.userType === 'investor') ? 'I' : 'S';
      const next = data.redirectPath || `/${role}/home`;
      navigate(next);

    } catch (err) {
      const apiMsg = err?.response?.data?.message;
      setError(apiMsg || err.message || "Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };




  return (
    <div className="login-page">
      <div className="image">
        <img src={login} alt="Illustration for login" />
      </div>
      <div className="login">
        <img className="brand" src={logo} alt="InnovationLink" />

        <h1 className="login-title">Welcome back</h1>
        <p className="login-subtitle">Login as {userType === 'investor' ? 'Investor' : 'Startup'} to continue</p>

        {/* User type toggle */}
        <div className="user-type-toggle" role="tablist" aria-label="Select user type">
          <button
            type="button"
            role="tab"
            aria-selected={userType === 'startup'}
            className={`toggle-button ${userType === 'startup' ? 'active' : ''}`}
            onClick={() => handleUserTypeChange('startup')}
          >
            Start Up
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={userType === 'investor'}
            className={`toggle-button ${userType === 'investor' ? 'active' : ''}`}
            onClick={() => handleUserTypeChange('investor')}
          >
            Investor
          </button>
        </div>

        <form onSubmit={handleSubmit} className="login-form" noValidate>
          <div className="credentials">
            <div className="username">
              <label className='label' htmlFor="login-username">Email or Username</label>
              <input
                id="login-username"
                type="text"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                placeholder={`Enter your email or username`}
                autoComplete="username"
                required
              />
            </div>
            <div className="password">
              <label className='label' htmlFor="login-password">Password</label>
              <div className="password-input">
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  className="show-toggle"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  onClick={() => setShowPassword((s) => !s)}
                >
                  {showPassword ? (
                    // Eye closed icon
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-5 0-9.27-3.11-11-8 1.02-2.77 2.86-5.05 5.06-6.58"/>
                      <path d="M1 1l22 22"/>
                      <path d="M9.88 9.88A3 3 0 0 0 12 15a3 3 0 0 0 2.12-.88"/>
                      <path d="M14.12 14.12 9.88 9.88"/>
                    </svg>
                  ) : (
                    // Eye open icon
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                  )}
                </button>
              </div>
              <p className='forgot-password' role="link" tabIndex={0}>Forgot your password?</p>
            </div>
          </div>

          {successMessage && (
            <div className="alert success" role="status">
              {successMessage}
            </div>
          )}
          {error && <p className="error-message" role="alert">{error}</p>}

          <div className="login-button">
            <button type="submit" disabled={loading} aria-busy={loading} aria-disabled={loading}>
              {loading ? 'Logging in…' : 'Login'}
            </button>
          </div>
        </form>

        <div className="or-sep" aria-hidden="true">
          <span>or</span>
        </div>
        <div className="alternatives">
          <button title="Continue with Google" aria-label="Continue with Google">
            <img src={googleIcon} alt="Google" />
          </button>
        </div>
        <p className='create-account'>Don't have an account? <span onClick={handleCreateAccountClick}>Create one</span></p>
        <p className='policies'>Please go through <span>Privacy Policy</span> & <span>Cookie Policy</span></p>
      </div>
    </div>
  )
}

export default LogIn