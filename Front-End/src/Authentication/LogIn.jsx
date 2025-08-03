import React, { useState } from 'react'
import './LogIn.css'
import { useNavigate } from 'react-router-dom';
import logo from '../assets/NavBar/logo.png';
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

  // Login data array
  const loginData = [
    {
      username: 'manikant',
      password: '1234'
    }
  ];

  const handleCreateAccountClick = () => {
    navigate('/auth/signup');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (error) setError('');
  };

  const handleLogin = (e) => {
    e.preventDefault();
    
    // Check if credentials match any user in loginData array
    const user = loginData.find(
      userData => userData.username === formData.username && userData.password === formData.password
    );

    if (user) {
      // Successful login - redirect to Project Home (first project by default)
      navigate('/project-1/home');
    } else {
      // Failed login - show error
      setError('Invalid username or password');
    }
  };

  return (
    <div className="login-page">
        <div className="image">
            <img src={login} alt="Login" />
        </div>
        <div className="login">
            <img src={logo} alt="Login" />
            <form onSubmit={handleLogin}>
                <div className="credentials">
                    <div className="username">
                        <p className='label'>Username:</p>
                        <input 
                            type="text" 
                            name="username"
                            value={formData.username}
                            onChange={handleInputChange}
                            placeholder="Enter your username..." 
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