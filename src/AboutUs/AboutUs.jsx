// src/AboutUs/AboutUs.jsx

import React from 'react';
import './AboutUs.css';

const AboutUs = () => {
  return (
    <div className="about-us-page">
      {/* Section 1: Hero / Vision */}
      <header className="our-vision">
        <h2>Shining a <span>light</span> forward & empowering ideas</h2>
        <h3>
          INNOVATION LINK IS AIMING TO PROVIDE THE PLATFORM FOR INVESTORS AND INVESTMENT SEEKERS
        </h3>
      </header>

      {/* Main content wrapper */}
      <main className="about-us-content">
        {/* Sections 2 & 3 now use a consistent card structure */}
        <section className="info-section">
          <div className="info-item info-card-large">
            <div className="info-text">
              <h4>Who We Are</h4>
              <p>
                Innovation Link is a platform bridging the gap between bold innovators and forward-thinking investors. We exist to make venture capital accessible, strength-based, and outcome-driven. We're not just matchmaking — we're building the future of funding.
              </p>
            </div>
            <div className="info-icon">
              <img src="/WhoVR.png" alt="An abstract icon representing vision and technology" />
            </div>
          </div>
          <div className="info-item reverse info-card-large">
            <div className="info-text">
              <h4>Our Mission</h4>
              <p>
                To empower innovators with access to aligned investors, and equip investors with high-potential, verified ideas that match their thesis.
              </p>
            </div>
            <div className="info-icon">
              <img src="/HandShake.jpeg" alt="An icon representing partnership and trust" />
            </div>
          </div>
           <div className="info-item info-card-large">
                <div className="info-text">
                    <h4>What Makes Us Different</h4>
                    <ul>
                        <li><strong>Smart Matching:</strong> Our AI-powered recommendation engine goes beyond keywords, connecting you with the best-fit partners based on deep criteria like industry focus, funding stage, and shared values.</li>
                        <li><strong>Built-in Conversations:</strong> From initial contact to final handshake, our secure messaging and video meeting tools keep your communication streamlined and confidential.</li>
                        <li><strong>No Holding Money:</strong> We are not a financial intermediary. We don’t touch your funds or take a cut of your deal. We facilitate the connection, empowering you to manage your investments directly.</li>
                    </ul>
                </div>
                <div className="info-icon">
                     <img src="/Group.jpg" alt="An icon showing a diverse group collaborating" />
                </div>
            </div>
        </section>

        {/* Section 4: What We Do */}
        <section className="what-we-do-section">
          <h2>WHAT WE DO</h2>
          <div className="cards-container">
            <div className="info-card">
              <h5>SHOWCASE IDEAS</h5>
              <p>For creators, we provide the tools to build a compelling project profile—detailing your unique vision, market traction, and long-term goals to attract the right attention.</p>
            </div>
            <div className="info-card">
              <h5>DISCOVER OPPORTUNITIES</h5>
              <p>For investors, we offer a curated, high-quality deal flow. Browse verified project profiles to find the next great idea that aligns perfectly with your investment thesis.</p>
            </div>
            <div className="info-card">
              <h5>CONNECT & COLLABORATE</h5>
              <p>Our platform is built for action. Integrated tools for messaging and meeting make starting conversations and building partnerships seamless and efficient.</p>
            </div>
          </div>
        </section>

        {/* Section 5: FAQs */}
        <section className="faq-section">
          <h2>Frequently Asked Questions</h2>
          <div className="faq-container">
            <details className="faq-item">
              <summary>As an innovator, how do you protect my intellectual property?</summary>
              <p>Your security is our top priority. All project data is encrypted, and you control who sees your detailed information. We facilitate introductions, but you decide what to share and when. We recommend consulting with legal counsel before disclosing sensitive IP.</p>
            </details>
            <details className="faq-item">
              <summary>As an investor, how do you vet the projects on your platform?</summary>
              <p>We have a multi-stage verification process. Initially, we confirm the identity of the creators and the legitimacy of their business. While we are not a due diligence firm, we ensure that every project listed meets a baseline standard of quality and clarity, saving you valuable time.</p>
            </details>
             <details className="faq-item">
              <summary>What are the fees for using Innovation LinK?</summary>
              <p>We believe in transparency. Innovation LinK operates on a subscription model for both innovators and investors, providing full access to our platform features for a flat monthly or annual fee. We do not take a percentage of any deals made through our platform.</p>
            </details>
          </div>
        </section>
      </main>
    </div>
  );
}

export default AboutUs;