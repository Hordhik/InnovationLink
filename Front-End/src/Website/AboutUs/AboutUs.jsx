import React from 'react';
import './AboutUs.css';

// --- Reusable Icon Component ---
const Icon = ({ name, size = 32 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={`icon icon-${name}`}>
    <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// --- Team Section Data ---
const teamMembers = [
    { name: 'Chandar Sekhar', role: 'Founder & CEO', bio: 'Visionary builder creating trust-based startup ecosystems.', imageUrl: './ChandraSekhar.jpeg' },
    { name: 'Sravan Kumar', role: 'CFO', bio: 'Numbers expert passionate about funding strategies and early-stage growth.', imageUrl: 'https://images.unsplash.com/photo-1556157382-97eda2d62296?q=80&w=400&auto=format&fit=crop' },
    { name: 'Manikant Reddy', role: 'CTO', bio: 'Tech mind behind our secure and scalable platform architecture.', imageUrl: 'https://images.unsplash.com/photo-1624561172888-ac93c696e10c?q=80&w=400&auto=format&fit=crop' },
];

// --- Milestones Data ---
const milestones = [
    { title: 'Figma Prototype Launched', complete: true },
    { title: 'Selected for Yukthi Fellowship Program', complete: true },
    { title: '20+ Early Beta Users Onboarded', complete: true },
    { title: 'Startup Documentation & Pitch Deck in Place', complete: true },
    { title: 'Currently Validating with Early Investors & Founders', complete: false },
];

// --- FAQ Data ---
const faqData = [
    { q: 'What stage startups do you support?', a: 'We focus on early-stage startups — from idea validation to pre-Series A — helping them connect with aligned, verified investors.' },
    { q: 'How are investors verified?', a: 'Investors undergo a multi-step verification process that includes identity checks, portfolio review, and community endorsement before they can access opportunities.' },
    { q: 'Do you charge fees or take equity?', a: 'No. Innovation Link is a neutral platform. We do not take equity or charge commissions on deals. Our revenue comes from premium features and services.' },
];


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
        {/* Sections 2 & 3: Who We Are, Our Mission, What Makes Us Different */}
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
        
        {/* NEW: Our Story Section */}
        <section className="story-section-new">
            <h2>Our Story</h2>
            <h3>It Started With a Problem</h3>
            <p>
                Early-stage founders waste time chasing cold leads. Investors get lost in a sea of pitch decks and scams. We built Innovation Link to bring <strong>structure</strong>, <strong>security</strong>, and <strong>strategy</strong> to startup-investor interactions — with a shared goal of building trust in the early-stage funding journey.
            </p>
        </section>

        {/* NEW: Our Values Section */}
        <section className="values-section-new">
            <h2>Our Values</h2>
            <div className="values-grid-new">
                <div className="value-card-new">
                    <Icon name="integrity" />
                    <h4>Integrity First</h4>
                    <p>Every profile is verified. No fake promises, no fraud.</p>
                </div>
                <div className="value-card-new">
                    <Icon name="outcome" />
                    <h4>Outcome-Driven</h4>
                    <p>We focus on results — not just meetings, but investments that create impact.</p>
                </div>
                <div className="value-card-new">
                    <Icon name="community" />
                    <h4>Community Over Competition</h4>
                    <p>We grow together. We share, mentor, and support.</p>
                </div>
                <div className="value-card-new">
                    <Icon name="transparency" />
                    <h4>Transparency Always</h4>
                    <p>We don’t touch your money. We don’t sell your data.</p>
                </div>
            </div>
        </section>

        {/* NEW: Team Section */}
        <section className="team-section-new">
            <h2>Meet Our Team</h2>
            <div className="team-grid-new">
                {teamMembers.map(member => (
                    <div key={member.name} className="team-member-card-new">
                        <img src={member.imageUrl} alt={`Photo of ${member.name}`} className="team-photo-new" />
                        <h3>{member.name}</h3>
                        <p className="team-role-new">{member.role}</p>
                    </div>
                ))}
            </div>
        </section>

        {/* NEW: Milestones Section */}
        <section className="milestones-section-new">
            <h2>Milestones / Achievements</h2>
            <div className="milestones-timeline-new">
                {milestones.map((milestone, index) => (
                    <div key={index} className={`milestone-item-new ${milestone.complete ? 'complete' : ''}`}>
                        <div className="milestone-dot-new"></div>
                        <p>{milestone.title}</p>
                    </div>
                ))}
            </div>
        </section>

        {/* NEW: Call to Action Section */}
        <section className="cta-section-new">
            <h2>🚀 Ready to pitch or invest?</h2>
            <p>Join the Innovation Link beta and be part of the future of funding.</p>
            <button className="cta-button-new">
                Request Early Access &rarr;
            </button>
        </section>


        {/* Section 5 -> Now Section 10: FAQs */}
        <section className="faq-section">
          <h2>Frequently Asked Questions</h2>
          <div className="faq-container">
            {faqData.map((faq, index) => (
                 <details key={index} className="faq-item">
                    <summary>{faq.q}</summary>
                    <p>{faq.a}</p>
                </details>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

export default AboutUs;