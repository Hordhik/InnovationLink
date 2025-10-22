import React, { useRef, useState } from "react";
import "./LogIn.css";
import "./SignUp.css";
import { useNavigate } from "react-router-dom";
import logo from "../assets/NavBar/logo.png";
import { toast } from 'react-toastify';
// import googleIcon from "../assets/Authentication/google.svg";
import login from "../assets/Authentication/login.png";
import { signup as signupApi } from "../services/authApi";
import { setAuth } from '../auth.js';

const SignUp = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    userType: "",
    name: "",
    email: "",
    phone: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const namePattern = /^[A-Za-z0-9_-]+$/;
  const nameInputRef = useRef(null);
  const tipRef = useRef(null);

  const handleLoginClick = () => {
    navigate("/auth/login");
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const setUserType = (type) => {
    setFormData(prev => {
      // If switching between startup and investor after a selection, clear the form fields
      if (prev.userType && prev.userType !== type) {
        return {
          userType: type,
          name: "",
          email: "",
          phone: "",
          password: "",
        };
      }
      // On first selection, keep whatever the user has typed
      return { ...prev, userType: type };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitted(true);
    if (!formData.userType) {
      // Pop the inline tip instead of showing a bottom error
      if (tipRef.current) {
        const el = tipRef.current;
        el.classList.remove('tip-pop');
        void el.offsetWidth; // reflow to restart animation
        el.classList.add('tip-pop');
      }
      return;
    }

    try {
      // Validate username: allow only letters, numbers, underscores, hyphens
      const usernameOk = namePattern.test(formData.name.trim());
      if (!usernameOk) {
        // Re-trigger error animation on every invalid submit
        if (nameInputRef.current) {
          const el = nameInputRef.current;
          el.classList.remove('error-pulse');
          // Force reflow to restart CSS animation
          void el.offsetWidth;
          el.classList.add('error-pulse');
        }
        // Show inline error only (no bottom error message)
        return;
      }
      const payload = {
        ...formData,
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        password: formData.password,
      };
      
      const data = await signupApi(payload);
      if (data?.user) {
        setAuth({ token: data?.token || null, user: data.user, role: data.user?.role || formData.userType });
      }
      const displayName = data?.user?.name || data?.user?.username || data?.user?.email || formData.name || 'User';
      const toast = { message: `Welcome to InnovationLink, ${displayName}!`, type: 'success', duration: 2200 };
      if (formData.userType === 'startup') {
        navigate(`/S/profile`, { state: { toast } });
      } else {
        navigate(`/I/profile`, { state: { toast } });
      }
    } catch (err) {
      const apiMsg = err?.response?.data?.message;
      setError(apiMsg || err.message || "Something went wrong. Try again.");
    }
  };

  return (
    <div className="signup-page">
      <div className="image">
        <img src={login} alt="Sign Up" />
      </div>
      <div className="signup-container">
        <img src={logo} alt="InnovationLink" />
        <h1 className="signup-title">Create your account</h1>
        <p className="signup-subtitle">{formData.userType ? `Join as ${formData.userType === 'investor' ? 'Investor' : 'Startup'}` : 'Please select Startup or Investor to get started'}</p>

        <div className="user-type-toggle" role="tablist" aria-label="Select user type">
          <button
            type="button"
            role="tab"
            aria-selected={formData.userType === 'startup'}
            className={`toggle-button ${formData.userType === 'startup' ? 'active' : ''}`}
            onClick={() => setUserType('startup')}
          >
            Startup
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={formData.userType === 'investor'}
            className={`toggle-button ${formData.userType === 'investor' ? 'active' : ''}`}
            onClick={() => setUserType('investor')}
          >
            Investor
          </button>
        </div>

        <form className="credentials" onSubmit={handleSubmit}>
          {!formData.userType && (
            <div className="form-tip" role="note" aria-live="polite" ref={tipRef}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="12" cy="10" r="6" fill="currentColor" opacity=".18" />
                <path d="M9 18h6"/>
                <path d="M10 22h4"/>
                <path d="M2 10a10 10 0 1 1 20 0c0 3.53-1.93 6.6-4.8 8.2-.14.09-.2.2-.2.35V19H7v-.45c0-.15-.06-.26-.2-.35C3.93 16.6 2 13.53 2 10z"/>
              </svg>
                <span>
                  Select <strong>Startup</strong> or <strong>Investor</strong> before filling data.
                </span>
            </div>
          )}
          <div className="username">
            <label htmlFor="name" className="label">Name</label>
            <input
              type="text"
              id="name"
              name="name"
              placeholder="Your name / username"
              value={formData.name}
              onChange={handleChange}
              required
              ref={nameInputRef}
              className={(submitted && formData.name.trim() && !namePattern.test(formData.name.trim())) ? 'input-error' : ''}
            />
            {(formData.name.trim() && !namePattern.test(formData.name.trim())) && !submitted && (
              <small className="note-warning">Username cannot contain spaces. Please use letters, numbers, underscores, or hyphens.</small>
            )}
            {(submitted && formData.name.trim() && !namePattern.test(formData.name.trim())) && (
              <small className="note-error">Username cannot contain spaces. Please use letters, numbers, underscores, or hyphens.</small>
            )}
          </div>
          <div className="email">
            <label htmlFor="email" className="label">Email</label>
            <input type="email" id="email" name="email" placeholder="you@example.com" value={formData.email} onChange={handleChange} required />
          </div>
          <div className="phone">
            <label htmlFor="phone" className="label">Phone</label>
            <input type="tel" id="phone" name="phone" placeholder="Enter phone number" value={formData.phone} onChange={handleChange} required />
          </div>
          <div className="password">
            <label htmlFor="password" className="label">Password</label>
            <div className="password-input">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
              />
              <button
                type="button"
                className="show-toggle"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                onClick={() => setShowPassword((s) => !s)}
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-5 0-9.27-3.11-11-8 1.02-2.77 2.86-5.05 5.06-6.58"/>
                    <path d="M1 1l22 22"/>
                    <path d="M9.88 9.88A3 3 0 0 0 12 15a3 3 0 0 0 2.12-.88"/>
                    <path d="M14.12 14.12 9.88 9.88"/>
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                )}
              </button>
            </div>
          </div>
          <div className="checkbox-container">
            <input id="agreeToTerms" name="agreeToTerms" type="checkbox" className="form-checkbox" required />
            <label htmlFor="agreeToTerms" className="checkbox-label">
              Agree to <span>Terms and Conditions</span>
            </label>
          </div>

          {error && <p className="error">{error}</p>}

          <div className="login-button">
            <button type="submit">Get Started</button>
          </div>
        </form>

        <p className="create-account">
          Already have an Account? <span onClick={handleLoginClick}>Login</span>
        </p>
      </div>
    </div>
  );
};

export default SignUp;
