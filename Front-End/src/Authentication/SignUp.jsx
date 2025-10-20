import React, { useState } from "react";
import "./SignUp.css";
import "./LogIn.css";
import { useNavigate } from "react-router-dom";
import logo from "../assets/NavBar/logo.png";
import googleIcon from "../assets/Authentication/google.svg";
import login from "../assets/Authentication/login.png";

const SignUp = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    userType: "startup",
    name: "",
    email: "",
    phone: "",
    password: "",
  });
  const [error, setError] = useState("");

  const handleLoginClick = () => {
    navigate("/auth/login");
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      // For demo purposes, simulate successful signup
      // In production, this would call the real API
      const payload = {
        ...formData,
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        password: formData.password,
      };
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Simulate successful response
      alert("Signup successful! Please login with your credentials.");
      
      // Navigate to login with pre-filled credentials
      navigate("/auth/login", { 
        state: { 
          email: formData.email, 
          password: formData.password,
          userType: formData.userType 
        } 
      });
    } catch (err) {
      setError("Signup failed. Please try again.");
    }
  };

  return (
    <div className="signup-page">
      <div className="image">
        <img src={login} alt="Sign Up" />
      </div>
      <div className="signup-container">
        <img src={logo} alt="InnovationLink" />

        <form className="credentials" onSubmit={handleSubmit}>
          <div className="username">
            <label htmlFor="userType" className="label">User Type:</label>
            <select
              id="userType"
              name="userType"
              value={formData.userType}
              onChange={handleChange}
              required
            >
              <option value="startup">Startup</option>
              <option value="investor">Investor</option>
            </select>
          </div>
          <div className="username">
            <label htmlFor="name" className="label">Name:</label>
            <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} required />
          </div>
          <div className="email">
            <label htmlFor="email" className="label">Email:</label><br />
            <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} required />
          </div>
          <div className="phone">
            <label htmlFor="phone" className="label">Phone:</label><br />
            <input type="tel" id="phone" name="phone" value={formData.phone} onChange={handleChange} required />
          </div>
          <div className="password">
            <label htmlFor="password" className="label">Password:</label>
            <input type="password" id="password" name="password" value={formData.password} onChange={handleChange} required />
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

        <p>--------------------- or ---------------------</p>

        <div className="alternatives">
          <button><img src={googleIcon} alt="Google" /></button>
          <button><img src={googleIcon} alt="Facebook" /></button>
          <button><img src={googleIcon} alt="Apple" /></button>
        </div>

        <p className="create-account">
          Already have an Account? <span onClick={handleLoginClick}>Login</span>
        </p>
        <p className="policies">
          Please go through <span>Privacy Policy</span> & <span>Cookie Policy</span>
        </p>
      </div>
    </div>
  );
};

export default SignUp;
