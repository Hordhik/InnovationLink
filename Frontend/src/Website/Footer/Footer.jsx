import React from 'react'
import { Link } from 'react-router-dom'
import './Footer.css'

const Footer = () => {
  const year = new Date().getFullYear()
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div className="footer-brand">
          <h3>Innovation Link</h3>
          <p className="footer-disclaimer">
            <strong>Disclaimer:</strong> While Innovation Link facilitates the connection between startups and investors, the platform does not guarantee any investments or financial outcomes. Users are advised to conduct their own due diligence. Innovation Link is not responsible for any fraudulent activities.
          </p>
        </div>
        <nav className="footer-col">
          <h4>Platform</h4>
          <ul>
            <li><Link to="/home">Features</Link></li>
            <li><Link to="/home#pricing">Pricing</Link></li>
            <li><Link to="/auth/signup">For Startups</Link></li>
            <li><Link to="/auth/signup">For Investors</Link></li>
          </ul>
        </nav>
        <nav className="footer-col">
          <h4>Community</h4>
          <ul>
            <li><Link to="/blogs">Blogs</Link></li>
            <li><Link to="/events">Events</Link></li>
            <li><Link to="/about">Legal (NDA)</Link></li>
            <li><Link to="/about">Security</Link></li>
          </ul>
        </nav>
      </div>
      <div className="container footer-bottom">
        <div className="footer-divider" />
        <p>© {year} Innovation Link. All rights reserved.</p>
      </div>
    </footer>
  )
}

export default Footer
