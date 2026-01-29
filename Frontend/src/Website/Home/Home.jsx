import React, { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import './Home.css'
import { motion, useScroll, useTransform } from "framer-motion";
import {
  CheckCircle,
  Star,
  ShieldCheck,
  Lock,
  IndianRupee
} from "lucide-react";
import {
  Tags,
  LayoutDashboard,
} from "lucide-react";
import {
  FileText,
  CalendarDays,
  MessageSquare,
  BadgeCheck,
} from "lucide-react";
// Lightweight icon set with context-specific glyphs (no more stacked layers)
const Icon = ({ name, size = 28 }) => {
  const common = { stroke: 'currentColor', strokeWidth: 1.5, strokeLinecap: 'round', strokeLinejoin: 'round', fill: 'none' }
  const render = () => {
    switch (name) {
      case 'shield':
      case 'integrity':
        return (
          <g>
            <path {...common} d="M12 3l7 3v5c0 5-3.5 9-7 10-3.5-1-7-5-7-10V6l7-3z" />
          </g>
        )
      case 'eye':
      case 'transparency':
        return (
          <g>
            <path {...common} d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12z" />
            <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5" fill="none" />
          </g>
        )
      case 'users':
      case 'community':
        return (
          <g>
            <circle cx="9" cy="8" r="3" {...common} />
            <circle cx="16.5" cy="10.5" r="2.5" {...common} />
            <path {...common} d="M3 18c1.5-2.5 4-4 6-4s4.5 1.5 6 4" />
            <path {...common} d="M13.5 18c.8-1.3 1.9-2.2 3-2.6" />
          </g>
        )
      case 'link':
      case 'match':
        return (
          <g>
            <path {...common} d="M9.5 14.5l-2.5 2.5a3.5 3.5 0 11-5-5l2.5-2.5" />
            <path {...common} d="M14.5 9.5l2.5-2.5a3.5 3.5 0 115 5l-2.5 2.5" />
            <path {...common} d="M8 12l8-8" />
          </g>
        )
      case 'chat':
        return (
          <g>
            <path {...common} d="M4 6h12a3 3 0 013 3v5a3 3 0 01-3 3H9l-5 3v-3H6a3 3 0 01-3-3V9a3 3 0 013-3z" />
          </g>
        )
      case 'cloud':
      case 'storage':
        return (
          <g>
            <path {...common} d="M7 18h9a4 4 0 100-8 6 6 0 10-12 1" />
          </g>
        )
      case 'tag':
        return (
          <g>
            <path {...common} d="M3 12l9-9 7 7-9 9H3v-7z" />
            <circle cx="15.5" cy="8.5" r="1.25" stroke="currentColor" strokeWidth="1.5" fill="none" />
          </g>
        )
      case 'check-circle':
        return (
          <g>
            <circle cx="12" cy="12" r="9" {...common} />
            <path {...common} d="M8 12l3 3 5-6" />
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


/* ---------- animated number hook ---------- */
function useAnimatedNumber(target, duration = 800) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    let current = 0;
    const step = Math.max(1, Math.floor(duration / target));

    const timer = setInterval(() => {
      current += 1;
      setValue(current);
      if (current >= target) clearInterval(timer);
    }, step);

    return () => clearInterval(timer);
  }, [target, duration]);

  return value;
}

/* ---------- motion config ---------- */
const items = [
  {
    icon: CheckCircle,
    title: "Identity Verified",
    desc: "Profiles go through structured verification before visibility."
  },
  {
    icon: Star,
    title: "Credibility Scoring",
    desc: "Reputation is earned through data, activity, and validation."
  },
  {
    icon: ShieldCheck,
    title: "NDA-backed Conversations",
    desc: "Sensitive discussions stay protected by default."
  },
  {
    icon: Lock,
    title: "End-to-End Encryption",
    desc: "Your data is secured in transit and at rest."
  },
  {
    icon: IndianRupee,
    title: "No Commission on Deals",
    desc: "We facilitate connections. We don’t touch funds."
  }
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.12
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" }
  }
};

const steps = [
  {
    id: 1,
    title: "Verify Profile",
    points: [
      "Identity verification",
      "Role validation (Startup / Investor)",
      "Basic information checks",
    ],
    micro: "Only verified profiles become visible.",
    icon: "🛡️",
  },
  {
    id: 2,
    title: "Build Credibility",
    points: [
      "Startup KPIs",
      "Activity & participation",
      "Peer feedback & validation",
    ],
    micro: "Credibility is earned, not claimed.",
    icon: "📈",
  },
  {
    id: 3,
    title: "Match by Relevance",
    points: [
      "Domain alignment",
      "Stage & traction filters",
      "Credibility-weighted ranking",
    ],
    micro: "Matches prioritize relevance over reach.",
    icon: "🧩",
  },
  {
    id: 4,
    title: "Meet Securely",
    points: [
      "NDA-backed chats",
      "Secure file sharing",
      "Scheduled meetings",
    ],
    micro: "Conversations stay private and accountable.",
    icon: "🔒",
  },
];


const CredibilityPreview = () => {
  return (
    <div className="credibility-preview">
      <div className="credibility-header">
        <span>Credibility Score</span>
        <strong>72 / 100</strong>
      </div>

      <div className="credibility-bar">
        <motion.div
          className="credibility-fill"
          initial={{ width: 0 }}
          whileInView={{ width: "72%" }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
      </div>

      <div className="credibility-metrics">
        <span>KPIs ✓</span>
        <span>Activity ✓</span>
        <span>Peer Validation ✓</span>
      </div>
    </div>
  );
};

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 1) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.12,
      duration: 0.6,
      ease: "easeOut",
    },
  }),
};


const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.15,
      duration: 0.6,
      ease: "easeOut",
    },
  }),
};

const Home = () => {

  const [role, setRole] = useState("startup");
  const score = useAnimatedNumber(role === "startup" ? 82 : 91);

  // Scroll-linked animation for Timeline
  const timelineRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: timelineRef,
    offset: ["start 80%", "end 50%"]
  });

  const scaleY = useTransform(scrollYProgress, [0, 1], [0, 1]);

  return (
    <div className="home-page">
      <section className="hero">
        <div className="hero-container">

          {/* LEFT */}
          <div className="hero-left">
            <h1>Where verified startups meet credible investors.</h1>

            <p className="hero-subheadline">
              Every profile is validated. Every interaction is accountable.
              <br />
              Trust is built into the system — not assumed.
            </p>

            <div className="hero-cta">
              <button className="primary-btn">Start Verification</button>
              <div className="secondary-cta">
                <a href="#">Join as Startup</a>
                <span>·</span>
                <a href="#">Join as Investor</a>
              </div>
            </div>
          </div>

          {/* RIGHT */}
          <div className="hero-right">
            <div className="card-stack-container">

              {/* Background decorative elements */}
              <motion.div
                className="blob blob-1"
                animate={{
                  scale: [1, 1.1, 1],
                  opacity: [0.3, 0.5, 0.3]
                }}
                transition={{ duration: 8, repeat: Infinity }}
              />
              <motion.div
                className="blob blob-2"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.2, 0.4, 0.2]
                }}
                transition={{ duration: 10, repeat: Infinity, delay: 1 }}
              />

              <div className="card-stack">

                {/* TOGGLE */}
                <motion.div
                  className="role-toggle-wrapper"
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <div className="role-toggle">
                    <button
                      className={role === "startup" ? "active" : ""}
                      onClick={() => setRole("startup")}
                    >
                      Startup
                    </button>
                    <button
                      className={role === "investor" ? "active" : ""}
                      onClick={() => setRole("investor")}
                    >
                      Investor
                    </button>
                  </div>
                </motion.div>

                {/* CARD 1 - MAIN PROFILE */}
                <motion.div
                  className="card card-profile glassy"
                  initial={{ opacity: 0, y: 20, rotate: -2 }}
                  animate={{ opacity: 1, y: 0, rotate: 0 }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                  whileHover={{ y: -5, rotate: 1, transition: { duration: 0.2 } }}
                  drag
                  dragConstraints={{ left: -20, right: 20, top: -20, bottom: 20 }}
                >
                  <div className="card-header">
                    <div className="flex items-center gap-3">
                      <div className="avatar-placeholder">
                        {role === "startup" ? "AM" : "SC"}
                      </div>
                      <div>
                        <strong>{role === "startup" ? "Alex Morgan" : "Sarah Chen"}</strong>
                        <p className="muted">
                          {role === "startup" ? "NovaTech Labs" : "Vertex Capital"}
                        </p>
                      </div>
                    </div>
                    <span className="verified-badge-icon">
                      <CheckCircle size={16} fill="#2563eb" color="white" />
                    </span>
                  </div>
                  <div className="card-body">
                    <p className="role-pill">{role === "startup" ? "Series A Startup" : "Accredited Investor"}</p>
                    <div className="mini-stats">
                      <div>
                        <span>72</span>
                        <small>Trust</small>
                      </div>
                      <div className="divider"></div>
                      <div>
                        <span>94%</span>
                        <small>Response</small>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* CARD 2 - SCORE */}
                <motion.div
                  className="card card-score glassy"
                  initial={{ opacity: 0, x: 20, y: 0 }}
                  animate={{
                    opacity: 1,
                    x: 0,
                    y: [0, -10, 0]
                  }}
                  transition={{
                    opacity: { duration: 0.6, delay: 0.2 },
                    x: { duration: 0.6, delay: 0.2 },
                    y: { duration: 4, repeat: Infinity, ease: "easeInOut" }
                  }}
                  drag
                  dragConstraints={{ left: -20, right: 20, top: -20, bottom: 20 }}
                  whileHover={{ scale: 1.05 }}
                >
                  <div className="score-ring">
                    <svg viewBox="0 0 36 36" className="circular-chart">
                      <path className="circle-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                      <motion.path
                        className="circle"
                        strokeDasharray={`${score}, 100`}
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                    </svg>
                    <div className="score-center">
                      <span className="sc-val">{score}</span>
                      <span className="sc-label">CREDIBILITY</span>
                    </div>
                  </div>
                </motion.div>

                {/* CARD 3 - ACTIVITY */}
                <motion.div
                  className="card card-activity glassy"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{
                    opacity: 1,
                    y: [0, 8, 0]
                  }}
                  transition={{
                    opacity: { duration: 0.6, delay: 0.4 },
                    y: { duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }
                  }}
                  drag
                  dragConstraints={{ left: -20, right: 20, top: -20, bottom: 20 }}
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="activity-row">
                    <div className="icon-box"><CalendarDays size={14} /></div>
                    <div className="text-box">
                      <p>Meeting scheduled</p>
                      <small>Just now</small>
                    </div>
                  </div>
                  <div className="activity-row">
                    <div className="icon-box success"><ShieldCheck size={14} /></div>
                    <div className="text-box">
                      <p>Verification renewed</p>
                      <small>2h ago</small>
                    </div>
                  </div>
                </motion.div>

              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="trust-strip">
        <motion.div
          className="trust-strip-inner"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-40px" }}
        >
          {items.map((item, i) => {
            const Icon = item.icon;
            return (
              <motion.div
                className="trust-item"
                variants={itemVariants}
                whileHover={{ y: -2 }}
                key={i}
              >
                <Icon className="trust-icon" strokeWidth={1.8} />
                <div>
                  <p className="trust-title">{item.title}</p>
                  <p className="trust-desc">{item.desc}</p>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </section>

      <section className="how-it-works">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          How Innovation Link works
        </motion.h2>

        <motion.p
          className="subtext"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
        >
          A verification-first process designed to reduce noise and increase signal.
        </motion.p>

        <div className="timeline" ref={timelineRef}>
          <motion.div
            className="timeline-line"
            style={{ scaleY, transformOrigin: "top" }}
          />

          {steps.map((step, index) => (
            <motion.div
              key={step.id}
              className="timeline-step"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, amount: 0.4 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            >
              <motion.div
                className="step-icon"
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: false, amount: 0.8 }}
                transition={{ type: "spring", stiffness: 200, damping: 20 }}
              >
                {step.icon}
              </motion.div>

              <div className="step-content">
                <h3>
                  <span className="step-index">[{step.id}]</span> {step.title}
                </h3>

                <ul>
                  {step.points.map((point, i) => (
                    <li key={i}>{point}</li>
                  ))}
                </ul>

                {/* 🔥 Credibility preview ONLY for step 2 */}
                {step.id === 2 && <CredibilityPreview />}

                <p className="micro">{step.micro}</p>
              </div>
            </motion.div>
          ))}

        </div>
      </section>

      <section className="core-features">
        <motion.h2
          className="section-title"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
        >
          Core Platform Features
        </motion.h2>

        {/* PRIMARY FEATURES */}
        <div className="primary-grid">
          {/* Credibility Score */}
          <motion.div
            className="card primary credibility"
            variants={fadeUp}
            custom={1}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <div className="score-block">
              <span className="score">82</span>
              <span className="outof">/ 100</span>
            </div>

            <h3>Credibility Score</h3>
            <p>
              A dynamic score built from verified data, activity,
              and peer validation — designed to assess trust at a glance.
            </p>

            <ul className="labels">
              <li>KPIs verified</li>
              <li>Activity-based</li>
              <li>Peer feedback</li>
              <li className="trend up">↑ Stable</li>
            </ul>
          </motion.div>

          {/* Relevance Matching */}
          <motion.div
            className="card primary"
            variants={fadeUp}
            custom={2}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <h3>Relevance-Based Matching</h3>
            <p>
              Connections ranked by domain fit, stage,
              traction, and credibility — not popularity.
            </p>

            <div className="ranking">
              <span className="tag high">High relevance</span>
              <ul>
                <li>#1 FinTech · Seed · 84 Score</li>
                <li>#2 SaaS · Pre-Series A · 81</li>
                <li>#3 Climate · MVP · 79</li>
              </ul>
              <span className="note">Credibility-weighted sorting</span>
            </div>
          </motion.div>
        </div>

        {/* SECONDARY FEATURES */}
        <div className="secondary-grid">
          <motion.div
            className="card secondary"
            variants={fadeUp}
            custom={3}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <LayoutDashboard size={24} />
            <h4>Startup & Investor Portals</h4>
            <p>Structured profiles, documents, and conversation tracking.</p>
          </motion.div>

          <motion.div
            className="card secondary"
            variants={fadeUp}
            custom={4}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <Tags size={24} />
            <h4>Smart Tagging</h4>
            <p>Intent-based labels simplify discovery.</p>
          </motion.div>

          <motion.div
            className="card secondary"
            variants={fadeUp}
            custom={5}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <Lock size={24} />
            <h4>Secure Messaging & Meetings</h4>
            <p>NDA-backed chat, files, and scheduled calls.</p>
          </motion.div>
        </div>
      </section>

      <section className="community-section">
        <div className="community-grid">
          {/* LEFT — MESSAGE */}
          <div className="community-left">
            <h2>Grow credibility through participation</h2>
            <p>
              Share insights, contribute to discussions, and attend events.
              <br />
              <strong>Every action improves visibility and credibility.</strong>
            </p>

            <motion.button
              className="community-cta"
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
            >
              Explore Community
            </motion.button>
          </div>

          {/* RIGHT — ACTIVITY PREVIEW */}
          <div className="community-right">
            {[
              {
                type: "Blog",
                title: "How investors evaluate early-stage traction",
                meta: "Verified Mentor",
                tag: "+3 Credibility",
                icon: <FileText size={18} />,
              },
              {
                type: "Event",
                title: "Startup Pitch Review Session",
                meta: "Verified Investors attending",
                tag: "Live · Limited seats",
                icon: <CalendarDays size={18} />,
              },
              {
                type: "Discussion",
                title: "Common red flags in seed decks",
                meta: "12 verified participants",
                tag: "Active discussion",
                icon: <MessageSquare size={18} />,
              },
            ].map((card, i) => (
              <motion.div
                key={i}
                className="activity-card"
                custom={i}
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                whileHover={{ y: -6 }}
              >
                <div className="card-header">
                  <div className="card-type">
                    {card.icon}
                    <span>{card.type}</span>
                  </div>

                  <motion.div
                    className="verified"
                    initial={{ opacity: 0.6 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.6 }}
                  >
                    <BadgeCheck size={16} />
                  </motion.div>
                </div>

                <h4>{card.title}</h4>
                <p className="card-meta">{card.meta}</p>

                <motion.span
                  className="card-tag"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  {card.tag}
                </motion.span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="pricing-section">
        <div className="pricing-header">
          <h2>Simple, transparent access</h2>
          <p>Start free. Upgrade only when you’re ready to engage.</p>
        </div>

        <div className="pricing-grid">
          {/* Free */}
          <motion.div
            className="pricing-card"
            variants={cardVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            custom={0}
          >
            <h3>Free</h3>
            <p className="plan-tagline">Explore without pressure</p>

            <ul>
              <li>Profile creation</li>
              <li>Verification initiation</li>
              <li>Browse verified profiles (limited)</li>
              <li>View credibility scores</li>
            </ul>

            <button className="btn outline">Start Free</button>
            <span className="footnote">Verification required for visibility</span>
          </motion.div>

          {/* Basic */}
          <motion.div
            className="pricing-card featured"
            variants={cardVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            custom={1}
          >
            <span className="pill">Most chosen</span>

            <h3>Basic Access</h3>
            <p className="plan-tagline">Verified participation</p>

            <ul>
              <li>Verified profile visibility</li>
              <li>Messaging with verified users</li>
              <li>Limited meeting scheduling</li>
              <li>NDA-backed conversations</li>
            </ul>

            <button className="btn primary">Get Verified Access</button>
          </motion.div>

          {/* Pro */}
          <motion.div
            className="pricing-card"
            variants={cardVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            custom={2}
          >
            <h3>Pro Access</h3>
            <p className="plan-tagline">For serious operators</p>

            <ul>
              <li>Everything in Basic</li>
              <li>Priority visibility in matching</li>
              <li>Unlimited meetings</li>
              <li>Advanced activity insights</li>
            </ul>

            <button className="btn outline">Upgrade to Pro</button>
          </motion.div>
        </div>
      </section>

      <section className="final-cta">
        <motion.div
          className="final-cta-content"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          viewport={{ once: true }}
        >
          <motion.h2
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            Trust isn’t optional.
            <br />
            <span>Start with verification.</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            Join a platform where credibility is measured, not assumed.
          </motion.p>

          <motion.div
            className="final-cta-actions"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <motion.button
              className="primary-cta"
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              Begin Verification
            </motion.button>

            <motion.button
              className="secondary-cta"
              whileHover={{ opacity: 0.7 }}
            >
              Learn how verification works
            </motion.button>
          </motion.div>
        </motion.div>

        {/* Ambient glow — non-distracting */}
        <motion.div
          className="cta-glow"
          animate={{ opacity: [0.2, 0.35, 0.2] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />
      </section>

    </div>
  )
}

export default Home