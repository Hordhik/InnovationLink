import React from 'react'
import './LogIn.css'
import { useNavigate } from 'react-router-dom';
import logo from '../assets/NavBar/logo.png';
import googleIcon from '../assets/Authentication/google.svg';
import login from '../assets/Authentication/login.png';

const LogIn = () => {
  const navigate = useNavigate();

  const handleCreateAccountClick = () => {
    navigate('/signup');
  };

  return (
    <div className="login-page">
        <div className="image">
            <img src={login} alt="Login" />
        </div>
        <div className="login">
            <img src={logo} alt="Login" />
            <div className="credentials">
                <div className="username">
                    <p className='label'>Username:</p>
                    <input type="text" placeholder="Enter your username..." />
                </div>
                <div className="password">
                    <p className='label'>Password:</p>
                    <input type="password" placeholder="Enter your password..." />
                    <p className='forgot-password'>Forgot your password?</p>
                </div>
            </div>
            <div className="login-button">
                <button>Login</button>
            </div>
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