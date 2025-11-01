import React, { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import './Home.css'

// Lightweight icon set with context-specific glyphs (no more stacked layers)
const Icon = ({ name, size = 28 }) => {
  const common = { stroke: 'currentColor', strokeWidth: 1.5, strokeLinecap: 'round', strokeLinejoin: 'round', fill: 'none' }
  const render = () => {
    switch (name) {
      case 'shield':
      case 'integrity':
        return (
          <g>
            <path {...common} d="M12 3l7 3v5c0 5-3.5 9-7 10-3.5-1-7-5-7-10V6l7-3z"/>
          </g>
        )
      case 'eye':
      case 'transparency':
        return (
          <g>
            <path {...common} d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12z"/>
            <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5" fill="none"/>
          </g>
        )
      case 'users':
      case 'community':
        return (
          <g>
            <circle cx="9" cy="8" r="3" {...common} />
            <circle cx="16.5" cy="10.5" r="2.5" {...common} />
            <path {...common} d="M3 18c1.5-2.5 4-4 6-4s4.5 1.5 6 4"/>
            <path {...common} d="M13.5 18c.8-1.3 1.9-2.2 3-2.6"/>
          </g>
        )
      case 'link':
      case 'match':
        return (
          <g>
            <path {...common} d="M9.5 14.5l-2.5 2.5a3.5 3.5 0 11-5-5l2.5-2.5"/>
            <path {...common} d="M14.5 9.5l2.5-2.5a3.5 3.5 0 115 5l-2.5 2.5"/>
            <path {...common} d="M8 12l8-8"/>
          </g>
        )
      case 'chat':
        return (
          <g>
            <path {...common} d="M4 6h12a3 3 0 013 3v5a3 3 0 01-3 3H9l-5 3v-3H6a3 3 0 01-3-3V9a3 3 0 013-3z"/>
          </g>
        )
      case 'cloud':
      case 'storage':
        return (
          <g>
            <path {...common} d="M7 18h9a4 4 0 100-8 6 6 0 10-12 1"/>
          </g>
        )
      case 'tag':
        return (
          <g>
            <path {...common} d="M3 12l9-9 7 7-9 9H3v-7z"/>
            <circle cx="15.5" cy="8.5" r="1.25" stroke="currentColor" strokeWidth="1.5" fill="none"/>
          </g>
        )
      case 'check-circle':
        return (
          <g>
            <circle cx="12" cy="12" r="9" {...common} />
            <path {...common} d="M8 12l3 3 5-6"/>
          </g>
        )
      default:
        return (
          <g>
            <circle cx="12" cy="12" r="9" {...common} />
          </g>
        )
    }
  }
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className={`icon icon-${name}`}>
      {render()}
    </svg>
  )
}

const Home = () => {
  // No plan selected by default; Advanced shows a soft emphasis until user picks
  const [selectedPlan, setSelectedPlan] = useState(null)
  // Start in short view: show only included/incremental features; 'More info' reveals full lists
  const [showIncludedOnly, setShowIncludedOnly] = useState(true)

  // Canonical feature list (same order across all plans)
  const featureList = [
    { key: 'profile', label: 'Create Startup/Investor Profile' },
    { key: 'blogs_events', label: 'Browse Community Blogs & Events' },
    { key: 'ai_matches', label: 'AI Matches' },
    { key: 'cred_score', label: 'Credibility Score' },
    { key: 'messaging', label: 'Direct Messaging & Scheduling' },
    { key: 'analytics', label: 'Advanced Analytics' },
    { key: 'team', label: 'Team Accounts & Management' },
    { key: 'cloud', label: 'Secure Cloud Storage' },
    { key: 'sponsorships', label: 'Event Sponsorships' },
  ]

  // Inclusion matrix per plan
  const include = {
    free: new Set(['profile', 'blogs_events']),
    basic: new Set(['profile', 'blogs_events', 'ai_matches', 'cred_score']),
    // Advanced gains Advanced Analytics, and Cloud Storage moves up to Enterprise only
    advanced: new Set(['profile', 'blogs_events', 'ai_matches', 'cred_score', 'messaging', 'analytics']),
    enterprise: new Set(featureList.map(f => f.key)),
  }
  const pricingRef = useRef(null)

  const scrollToPricing = () => {
    if (pricingRef.current) {
      pricingRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  const openExplore = () => {
    // Reveal full details
    setShowIncludedOnly(false)
    scrollToPricing()
  }

  const closeExplore = () => {
    // Back to short view
    setShowIncludedOnly(true)
    scrollToPricing()
  }

  return (
    <div className="home-page">
      {/* Hero */}
      <header className="home-hero">
        <div className="home-hero__bg" aria-hidden />
        <div className="home-hero__content container">
          <h1>
            Bridge startups and investors
            <span className="accent"> with AI-powered trust.</span>
          </h1>
          <p className="subtitle">
            Showcase, discover, and connect with confidence. Smart matching, credible validation, and a community that
            helps you grow faster.
          </p>
          <div className="hero-cta">
            <Link to="/auth/signup" className="btn btn--primary">I’m a Startup</Link>
            <Link to="/auth/signup" className="btn btn--ghost">I’m an Investor</Link>
          </div>
          <ul className="trust-badges" aria-label="Trust & safety">
            <li>
              <Icon name="transparency" />
              <span>Encryption in transit & at rest</span>
            </li>
            <li>
              <Icon name="integrity" />
              <span>NDAs to protect IP</span>
            </li>
            <li>
              <Icon name="community" />
              <span>No commissions on deals</span>
            </li>
          </ul>
          <p className="disclaimer">Innovation Link facilitates connections. We don’t guarantee investments. Please conduct your own due diligence.</p>
        </div>
      </header>

      <main>
        {/* How it works (unique to Home) */}
        <section className="how-it-works container">
          <h2 className="center">How Innovation Link works</h2>
          <div className="hiw-grid">
            <div className="hiw-card">
              <div className="hiw-step">1</div>
              <h3>Onboard</h3>
              <p>Create your profile in minutes. Startups can add KPIs and demos; investors set thesis and preferences.</p>
            </div>
            <div className="hiw-card">
              <div className="hiw-step">2</div>
              <h3>Match</h3>
              <p>Our AI ranks the most relevant connections by domain, stage, traction, and credibility signals.</p>
            </div>
            <div className="hiw-card">
              <div className="hiw-step">3</div>
              <h3>Meet & decide</h3>
              <p>Chat, share files, and schedule meetings. You control the deal — we never touch the funds.</p>
            </div>
          </div>
        </section>
        {/* Value props */}
        <section className="value-props container">
          <div className="vp-grid">
            <div className="vp-card">
              <Icon name="match" />
              <h3>AI-Powered Matchmaking</h3>
              <p>Intelligently matches based on domain, funding needs, stage, and traction — not just keywords.</p>
            </div>
            <div className="vp-card">
              <Icon name="eye" />
              <h3>Credibility Score</h3>
              <p>Scores derived from KPIs, performance, and external validation help investors decide faster.</p>
            </div>
            <div className="vp-card">
              <Icon name="users" />
              <h3>Startup & Investor Portals</h3>
              <p>Create rich profiles, share demos, filter opportunities, and track conversations end-to-end.</p>
            </div>
            <div className="vp-card">
              <Icon name="tag" />
              <h3>Smart Tagging</h3>
              <p>Labels like “Need Investment” or “Need Mentorship” make discovery effortless.</p>
            </div>
          </div>
        </section>

        {/* Community */}
        <section className="community container">
          <div className="community-card">
            <div className="community-text">
              <h2>Grow with the community</h2>
              <p>Share insights via blogs. Discover hackathons, ideathons, and investor meetups. Build credibility through participation.</p>
              <div className="community-cta">
                <Link to="/blogs" className="btn btn--primary">Read Blogs</Link>
              </div>
            </div>
            <div className="community-media">
              <div className="media-blob" aria-hidden><Icon name="users" size={40} /></div>
            </div>
          </div>
        </section>

        {/* Interaction & Security */}
        <section className="interaction container">
          <div className="info-grid">
            <div className="info-card">
              <h3><Icon name="chat" /> Messaging & Meetings</h3>
              <p>Connect directly, exchange files, and schedule meetings without leaving the platform. Rate each interaction to keep things transparent.</p>
            </div>
            <div className="info-card">
              <h3><Icon name="shield" /> Security & Legal</h3>
              <p>Encryption protects your data in transit and at rest. Use NDAs to safeguard IP during conversations.</p>
            </div>
            <div className="info-card">
              <h3><Icon name="cloud" /> Cloud Storage</h3>
              <p>Back up decks, documents, and artifacts in one secure place — always accessible when you need them.</p>
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section id="pricing" ref={pricingRef} className="pricing container">
          <div className="pricing-header">
            <h2 className="pricing-title">Subscription plans</h2>
            <div className="pricing-actions">
              {showIncludedOnly ? (
                <button type="button" className="btn btn--primary" onClick={openExplore}>
                  Explore Plans
                </button>
              ) : (
                <button type="button" className="btn btn--ghost" onClick={closeExplore} aria-label="Close plans details view">
                  Close
                </button>
              )}
            </div>
          </div>
          <div className="pricing-grid">
            <div className={`price-card ${selectedPlan==='free' ? 'selected' : ''}`} onClick={()=>setSelectedPlan('free')} role="button" tabIndex={0} onKeyDown={(e)=>{if(e.key==='Enter'||e.key===' '){setSelectedPlan('free')}}}>
              <h3>Free</h3>
              <div className="price price--text">Free</div>
              <ul>
                {featureList
                  .filter(f => !showIncludedOnly || include.free.has(f.key))
                  .map(f => {
                    const inc = include.free.has(f.key)
                    return (
                      <li key={f.key} className={inc ? 'included' : 'excluded'}>{f.label}</li>
                    )
                  })}
              </ul>
              <Link to="/auth/signup" className="btn btn--primary">{selectedPlan==='free' ? 'Selected' : 'Join for Free'}</Link>
            </div>
            <div className={`price-card ${selectedPlan==='basic' ? 'selected' : ''}`} onClick={()=>setSelectedPlan('basic')} role="button" tabIndex={0} onKeyDown={(e)=>{if(e.key==='Enter'||e.key===' '){setSelectedPlan('basic')}}}>
              <h3>Basic</h3>
              <div className="price price--numeric">
                <span className="price-currency">₹</span>
                <span className="price-number">199</span>
                <span className="price-period">/ mo</span>
              </div>
              <ul>
                {featureList
                  .filter(f => {
                    if (!showIncludedOnly) return true
                    // Only show features that Basic adds over Free
                    return include.basic.has(f.key) && !include.free.has(f.key)
                  })
                  .map(f => {
                    const inc = include.basic.has(f.key)
                    return (
                      <li key={f.key} className={inc ? 'included' : 'excluded'}>{f.label}</li>
                    )
                  })}
              </ul>
              <Link to="/auth/signup" className="btn btn--primary">{selectedPlan==='basic' ? 'Selected' : 'Get Started'}</Link>
            </div>
            <div className={`price-card price-card--featured ${selectedPlan==='advanced' ? 'selected' : ''} ${selectedPlan===null ? 'emphasized' : ''}`} onClick={()=>setSelectedPlan('advanced')} role="button" tabIndex={0} onKeyDown={(e)=>{if(e.key==='Enter'||e.key===' '){setSelectedPlan('advanced')}}}>
              <div className="badge">Popular</div>
              <h3>Advanced</h3>
              <div className="price price--numeric">
                <span className="price-currency">₹</span>
                <span className="price-number">499</span>
                <span className="price-period">/ mo</span>
              </div>
              <ul>
                {featureList
                  .filter(f => {
                    if (!showIncludedOnly) return true
                    // Only show features that Advanced adds over Basic
                    return include.advanced.has(f.key) && !include.basic.has(f.key)
                  })
                  .map(f => {
                    const inc = include.advanced.has(f.key)
                    return (
                      <li key={f.key} className={inc ? 'included' : 'excluded'}>{f.label}</li>
                    )
                  })}
              </ul>
              <Link to="/auth/signup" className="btn btn--primary">{selectedPlan==='advanced' ? 'Selected' : 'Get Started'}</Link>
            </div>
            <div className={`price-card ${selectedPlan==='enterprise' ? 'selected' : ''}`} onClick={()=>setSelectedPlan('enterprise')} role="button" tabIndex={0} onKeyDown={(e)=>{if(e.key==='Enter'||e.key===' '){setSelectedPlan('enterprise')}}}>
              <h3>Enterprise</h3>
              <div className="price price--text">Custom</div>
              <ul>
                {featureList
                  .filter(f => {
                    if (!showIncludedOnly) return true
                    // Only show features that Enterprise adds over Advanced
                    return include.enterprise.has(f.key) && !include.advanced.has(f.key)
                  })
                  .map(f => {
                    const inc = include.enterprise.has(f.key)
                    return (
                      <li key={f.key} className={inc ? 'included' : 'excluded'}>{f.label}</li>
                    )
                  })}
              </ul>
              <Link to="/about" className="btn btn--ghost">{selectedPlan==='enterprise' ? 'Selected' : 'Contact Us'}</Link>
            </div>
          </div>
          {/* Single Explore/Close control is placed beside the title; no bottom duplicate */}
          <p className="pricing-note">Pricing may vary based on region, usage, and features enabled.</p>
        </section>

        {/* Final CTA */}
        <section className="final-cta container">
          <div className="cta-card">
            <div>
              <h2>Build relationships that compound</h2>
              <p>Join now to connect with aligned partners and grow with the right support.</p>
            </div>
            <div>
              <Link to="/auth/signup" className="btn btn--primary">Create your profile</Link>
            </div>
          </div>
        </section>

        {/* Legal disclaimer above footer (as requested) */}
        <section className="legal container">
          <p>
            <strong>Disclaimer:</strong> While Innovation Link facilitates the connection between startups and investors, the platform does not guarantee any investments or financial outcomes. Users are advised to conduct their own due diligence. Innovation Link is not responsible for any fraudulent activities.
          </p>
        </section>
      </main>
    </div>
  )
}

export default Home