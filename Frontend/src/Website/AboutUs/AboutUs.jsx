import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
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
  { name: 'Chandar Sekhar', role: 'Founder & CEO', bio: 'Visionary builder creating trust-based startup ecosystems.' },
  { name: 'Sravan Kumar', role: 'CFO', bio: 'Numbers expert passionate about funding strategies and early-stage growth.' },
  { name: 'Manikant Reddy', role: 'CTO', bio: 'Tech mind behind our secure and scalable platform architecture.' },
  { name: 'Hemanth', role: 'SSM', bio: 'Driving strategic partnerships and market growth with a founder-first mindset.' },
  { name: 'Yaswanth', role: 'Co-Founder', bio: 'Co-leading product and community to connect aligned capital with promising founders.' },
];

const getInitials = (name = '') => name.split(' ').filter(Boolean).map(n => n[0]).slice(0,2).join('').toUpperCase();

// --- Milestones Data ---
const milestones = [
    { title: 'Figma Prototype Launched', complete: true },
    { title: 'Selected for Yukthi Fellowship Program', complete: true },
    { title: '20+ Early Beta Users Onboarded', complete: true },
    { title: 'Startup Documentation & Pitch Deck in Place', complete: true },
    { title: 'Currently Validating with Early Investors & Founders', complete: false },
];

// --- Features Data (What makes us different) ---
const features = [
  { icon: 'integrity', title: 'Smart matching', desc: 'Go beyond keywords. Our matching considers industry, stage, traction, and shared principles to surface the best-fit partners.' },
  { icon: 'community', title: 'Built-in conversations', desc: 'Secure messaging and meetings keep everything streamlined from first hello to final handshake.' },
  { icon: 'transparency', title: 'We don’t touch funds', desc: 'We facilitate connections. You manage the deal. No commissions, no hidden cuts.' },
];

// --- Values Data ---
const values = [
  { icon: 'integrity', title: 'Integrity first', desc: 'Every profile is verified. No fake promises, no fraud.' },
  { icon: 'outcome', title: 'Outcome-driven', desc: 'We focus on results — meaningful conversations that lead to investments.' },
  { icon: 'community', title: 'Community over competition', desc: 'We grow better together. Share, mentor, support.' },
  { icon: 'transparency', title: 'Transparency always', desc: 'We don’t touch your money. We don’t sell your data.' },
];

// --- FAQ Data ---
const faqData = [
  { q: 'What stage startups do you support?', a: 'We focus on early-stage startups — from idea validation to pre-Series A — helping them connect with aligned, verified investors.' },
  { q: 'How are investors verified?', a: 'Investors undergo a multi-step verification process that includes identity checks, portfolio review, and community endorsement before they can access opportunities.' },
  { q: 'Do you charge fees or take equity?', a: 'No. Innovation Link is a neutral platform. We do not take equity or charge commissions on deals. Our revenue comes from premium features and services.' },
  { q: 'How do I join as an investor?', a: 'Sign up with your professional email, complete a short profile, and request verification. Once approved, you can explore and connect with founders that match your thesis.' },
  { q: 'Is my data secure?', a: 'Yes. We use industry-standard encryption and never sell your data. You can control visibility from your profile settings at any time.' },
];


const AboutUs = () => {
  const [openFaqIndex, setOpenFaqIndex] = useState(-1);
  const faqRefs = useRef([]);

  useEffect(() => {
    if (openFaqIndex >= 0 && faqRefs.current[openFaqIndex]) {
      // Scroll the opened FAQ card into view so it’s always visible (especially the last one)
      faqRefs.current[openFaqIndex].scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [openFaqIndex]);
  return (
    <div className="about-page">
      {/* Hero */}
      <header className="about-hero">
        <div className="about-hero__bg" aria-hidden />
        <div className="about-hero__content container">
          <h1>
            Where founders meet investors —
            <span className="accent"> with clarity and trust.</span>
          </h1>
          <p className="subtitle">
            Innovation Link helps early-stage founders connect with aligned, verified investors.
            No noise. No middlemen. Just the right conversations.
          </p>
          <div className="hero-cta">
            <Link to="/auth/signup" className="btn btn--primary">Get Started</Link>
            <Link to="/events" className="btn btn--ghost">Explore Events</Link>
          </div>
        </div>
      </header>

      {/* Stats */}
      <section className="about-stats container" aria-label="platform stats">
        <div className="stat">
          <div className="stat__num">1.2k+</div>
          <div className="stat__label">Founder-introductions</div>
        </div>
        <div className="stat">
          <div className="stat__num">180+</div>
          <div className="stat__label">Active investors</div>
        </div>
        <div className="stat">
          <div className="stat__num">72 hrs</div>
          <div className="stat__label">Avg. first response</div>
        </div>
        <div className="stat">
          <div className="stat__num">Beta</div>
          <div className="stat__label">Yukthi Fellowship</div>
        </div>
      </section>

      <main>

        {/* Differentiators */}
        <section className="about-features container">
          <h2 className="center">What makes us different</h2>
          <div className="feature-grid scroll-row">
            {features.map((f, idx) => (
              <div className="feature" key={`feature-${idx}`}>
                <Icon name={f.icon} />
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

  {/* Story */}
        <section className="about-story container">
          <h2>Our story</h2>
          <p>
            Founders waste time chasing cold leads. Investors get flooded with decks. Innovation Link brings
            structure, security, and strategy to early-stage fundraising — restoring trust to the journey.
          </p>
        </section>

        {/* Values */}
        <section className="about-values container">
          <h2 className="center">Our values</h2>
          <div className="values-grid-new scroll-row">
            {values.map((v, idx) => (
              <div className="value-card-new" key={`value-${idx}`}>
                <Icon name={v.icon} />
                <h4>{v.title}</h4>
                <p>{v.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Timeline */}
        <section className="about-timeline container">
          <h2 className="center">Milestones</h2>
          <div className="milestones-timeline-new">
            {milestones.map((milestone, index) => (
              <div key={index} className={`milestone-item-new ${milestone.complete ? 'complete' : ''}`}>
                <div className="milestone-dot-new" />
                <p>{milestone.title}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Team */}
        <section className="about-team container">
          <h2 className="center">Meet the team</h2>
          <div className="team-grid-new">
            {teamMembers.map(member => (
              <div key={member.name} className="team-member-card-new">
                <div className="avatar-initials" aria-hidden>{getInitials(member.name)}</div>
                <h3>{member.name}</h3>
                <p className="team-role-new">{member.role}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="about-cta container">
          <div className="cta-card">
            <div>
              <h2>Ready to pitch or invest?</h2>
              <p>Join the Innovation Link beta and be part of the future of funding.</p>
            </div>
            <div className="cta-actions">
              <Link to="/auth/signup" className="btn btn--primary">Request Early Access</Link>
            </div>
          </div>
        </section>

        {/* FAQs */}
        <section className="faq-section container">
          <h2>Frequently Asked Questions</h2>
          <div className="faq-container">
            {faqData.map((faq, index) => {
              const isOpen = openFaqIndex === index;
              const panelId = `faq-panel-${index}`;
              return (
                <div
                  key={index}
                  className={`faq-card ${isOpen ? 'open' : ''}`}
                  ref={(el) => (faqRefs.current[index] = el)}
                >
                  <button
                    className="faq-trigger"
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    onClick={() => setOpenFaqIndex(isOpen ? -1 : index)}
                  >
                    <span className="faq-q">{faq.q}</span>
                    <span className="faq-icon" aria-hidden />
                  </button>
                  <div
                    id={panelId}
                    className="faq-content"
                    aria-hidden={!isOpen}
                  >
                    <p>{faq.a}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
}

export default AboutUs;