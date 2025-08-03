import React, {useState} from 'react'
import './SignUp.css'
import './LogIn.css'
import { useNavigate } from 'react-router-dom';
import logo from '../assets/NavBar/logo.png';
import googleIcon from '../assets/Authentication/google.svg';
import login from '../assets/Authentication/login.png';

const SignUp = () => {
  const navigate = useNavigate();

  const handleLoginClick = () => {
    navigate('/auth/login');
  };
  const [userType, setUserType] = useState('startup')

  return (
    <div className="signup-page">
        <div className="image">
            <img src={login} alt="Sign Up" />
        </div>
        <div className="signup-container">
            <img src={logo} alt="InnovationLink" />
            
            <div className="user-type-toggle">
                <button
                  onClick={() => setUserType('startup')}
                  className={`toggle-button ${userType === 'startup' ? 'active' : ''}`}
                >
                  Start Up
                </button>
                <hr />
                <button
                  onClick={() => setUserType('investor')}
                  className={`toggle-button ${userType === 'investor' ? 'active' : ''}`}
                >
                  Investor
                </button>
            </div>

            <form className="credentials">
                <div className="form-grid">
                  <div className="username">
                    <label htmlFor="firstName" className="label">First Name:</label>
                    <input type="text" id="firstName" name="firstName" />
                  </div>
                  <div className="password">
                    <label htmlFor="lastName" className="label">Last Name:</label>
                    <input type="text" id="lastName" name="lastName" />
                  </div>
                </div>

                {userType === 'startup' && (
                  <div className="username">
                    <label htmlFor="startupName" className="label">Name of the Startup:</label>
                    <input type="text" id="startupName" name="startupName" />
                  </div>
                )}
                
                {userType === 'investor' && (
                  <div className="username">
                    <label htmlFor="companyName" className="label">Company Name (Optional):</label>
                    <input type="text" id="companyName" name="companyName" />
                  </div>
                )}

                <div className="username">
                  <label htmlFor="email" className="label">Email:</label>
                  <input type="email" id="email" name="email" />
                </div>
                
                <div className="username">
                  <label htmlFor="phone" className="label">Phone Number:</label>
                  <input type="tel" id="phone" name="phone" />
                </div>

                <div className="checkbox-container">
                  <input id="agreeToTerms" name="agreeToTerms" type="checkbox" className="form-checkbox" />
                  <label htmlFor="agreeToTerms" className="checkbox-label">
                    Agree to <span>Terms and Conditions</span>
                  </label>
                </div>
            </form>

            <div className="login-button">
                <button type="submit">Get Started</button>
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
                    <img src={googleIcon} alt="Apple" />
                </button>
            </div>

            <p className='create-account'>Already have an Account? <span onClick={handleLoginClick}>Login</span></p>
            <p className='policies'>Please go through <span>Privacy Policy</span> & <span>Cookie Policy</span></p>
        </div>
    </div>
  )
}

export default SignUp