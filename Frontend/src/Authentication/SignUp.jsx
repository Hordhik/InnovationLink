import React, { useRef, useState } from "react";
import "./LogIn.css";
import "./SignUp.css";
import { useNavigate } from "react-router-dom";
import logo from "../assets/NavBar/logo.png";
// import googleIcon from "../assets/Authentication/google.svg";
import login from "../assets/Authentication/login.png";
import { getUsernameAvailability, signupV2 } from "../services/authApi";
import { setAuth } from '../auth.js';

const USERNAME_REGEX = /^[A-Za-z0-9_-]+$/;

const normalizeUsername = (value) => {
  if (value === undefined || value === null) return '';
  return value.toString().trim().toLowerCase();
};

const SignUp = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    userType: "",
    fullName: "",
    companyName: "",
    username: "",
    email: "",
    phone: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const usernameInputRef = useRef(null);
  const tipRef = useRef(null);

  const [usernameTouched, setUsernameTouched] = useState(false);
  const [usernameStatus, setUsernameStatus] = useState({ checking: false, available: null, suggestion: '', valid: true });
  const usernameCheckTimerRef = useRef(null);

  const handleLoginClick = () => {
    navigate("/auth/login");
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const displayNameValue = formData.userType === 'startup' ? formData.companyName : formData.fullName;
  const displayNameLabel = formData.userType === 'startup' ? 'Company / Startup Name' : 'Full Name';

  const scheduleUsernameCheck = ({ username, name, applySuggestionWhenUntouched = false }) => {
    if (usernameCheckTimerRef.current) {
      clearTimeout(usernameCheckTimerRef.current);
    }
    usernameCheckTimerRef.current = setTimeout(async () => {
      try {
        setUsernameStatus((prev) => ({ ...prev, checking: true }));
        const data = await getUsernameAvailability({ username, name });
        if (applySuggestionWhenUntouched && !usernameTouched && data?.suggestion) {
          setFormData((prev) => ({ ...prev, username: data.suggestion }));
        }
        setUsernameStatus({
          checking: false,
          available: Boolean(data?.available),
          suggestion: data?.suggestion || '',
          valid: data?.valid !== false,
        });
      } catch (err) {
        setUsernameStatus((prev) => ({ ...prev, checking: false, available: null }));
      }
    }, 350);
  };

  const setUserType = (type) => {
    setFormData(prev => {
      // If switching between startup and investor after a selection, clear the form fields
      if (prev.userType && prev.userType !== type) {
        return {
          userType: type,
          fullName: "",
          companyName: "",
          username: "",
          email: "",
          phone: "",
          password: "",
        };
      }
      // On first selection, keep whatever the user has typed
      return { ...prev, userType: type };
    });
    setUsernameTouched(false);
    setUsernameStatus({ checking: false, available: null, suggestion: '', valid: true });
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
      const username = normalizeUsername(formData.username);
      const displayName = (displayNameValue || '').toString().trim();

      if (!displayName) {
        return;
      }

      // Validate username format
      const usernameOk = USERNAME_REGEX.test(username);
      if (!usernameOk) {
        if (usernameInputRef.current) {
          const el = usernameInputRef.current;
          el.classList.remove('error-pulse');
          void el.offsetWidth;
          el.classList.add('error-pulse');
        }
        return;
      }

      // Re-check availability right before submit
      const availability = await getUsernameAvailability({ username });
      if (!availability?.available) {
        if (availability?.suggestion) {
          setFormData((prev) => ({ ...prev, username: availability.suggestion }));
          setUsernameStatus({ checking: false, available: true, suggestion: availability.suggestion, valid: true });
        }
        if (usernameInputRef.current) {
          usernameInputRef.current.focus();
        }
        return;
      }

      const payload = {
        userType: formData.userType,
        username,
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        password: formData.password,
        companyName: formData.userType === 'startup' ? displayName : undefined,
        fullName: formData.userType === 'investor' ? displayName : undefined,
      };

      const data = await signupV2(payload);
      if (data?.user) {
        setAuth({ token: data?.token || null, user: data.user, role: data.user?.role || formData.userType });
      }
      const displayNameToast = data?.user?.name || data?.user?.username || data?.user?.email || displayName || 'User';
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
                <path d="M9 18h6" />
                <path d="M10 22h4" />
                <path d="M2 10a10 10 0 1 1 20 0c0 3.53-1.93 6.6-4.8 8.2-.14.09-.2.2-.2.35V19H7v-.45c0-.15-.06-.26-.2-.35C3.93 16.6 2 13.53 2 10z" />
              </svg>
                <span>
                  {submitted
                    ? (<>
                        Select <strong>Startup</strong> or <strong>Investor</strong>
                      </>)
                    : (<>
                        Select <strong>Startup</strong> or <strong>Investor</strong> before filling data.
                      </>)}
                </span>
            </div>
          )}
          <div className="username">
            <label htmlFor="displayName" className="label">{displayNameLabel}</label>
            <input
              type="text"
              id="displayName"
              name={formData.userType === 'startup' ? 'companyName' : 'fullName'}
              placeholder={formData.userType === 'startup' ? 'e.g., InnovationLink' : 'e.g., Chandra Sekhar'}
              value={displayNameValue}
              onChange={(e) => {
                const value = e.target.value;
                setFormData((prev) => ({
                  ...prev,
                  [formData.userType === 'startup' ? 'companyName' : 'fullName']: value,
                }));
                if (!usernameTouched) {
                  scheduleUsernameCheck({ name: value, applySuggestionWhenUntouched: true });
                }
              }}
              required
              disabled={!formData.userType}
            />
          </div>

          <div className="username">
            <label htmlFor="username" className="label">Username</label>
            <input
              type="text"
              id="username"
              name="username"
              placeholder="e.g., innovationlink"
              value={formData.username}
              onChange={(e) => {
                const value = e.target.value;
                setUsernameTouched(true);
                setFormData((prev) => ({ ...prev, username: value }));
                const normalized = normalizeUsername(value);
                if (normalized) {
                  scheduleUsernameCheck({ username: normalized, name: displayNameValue });
                } else {
                  setUsernameStatus({ checking: false, available: null, suggestion: '', valid: true });
                }
              }}
              required
              ref={usernameInputRef}
              disabled={!formData.userType}
              className={(submitted && formData.username.trim() && !USERNAME_REGEX.test(normalizeUsername(formData.username))) ? 'input-error' : ''}
            />
            {formData.username.trim() && !USERNAME_REGEX.test(normalizeUsername(formData.username)) && (
              <small className={submitted ? 'note-error' : 'note-warning'}>
                Username can only contain letters, numbers, underscores, or hyphens.
              </small>
            )}
            {formData.username.trim() && USERNAME_REGEX.test(normalizeUsername(formData.username)) && (
              <small className="note-warning">
                {usernameStatus.checking
                  ? 'Checking availability…'
                  : (usernameStatus.available
                      ? 'Username available'
                      : (usernameStatus.suggestion
                          ? `Username taken. Suggested: ${usernameStatus.suggestion}`
                          : 'Username not available'))}
              </small>
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
                    <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-5 0-9.27-3.11-11-8 1.02-2.77 2.86-5.05 5.06-6.58" />
                    <path d="M1 1l22 22" />
                    <path d="M9.88 9.88A3 3 0 0 0 12 15a3 3 0 0 0 2.12-.88" />
                    <path d="M14.12 14.12 9.88 9.88" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
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
