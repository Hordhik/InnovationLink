import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from "framer-motion";
import "./Footer.css";

const footerVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut",
      staggerChildren: 0.08,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0 },
};

export default function Footer() {
  return (
    <motion.footer
      className="footer"
      variants={footerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
    >
      <div className="footer-grid">
        {/* Column 1 — Brand */}
        <motion.div variants={itemVariants} className="footer-brand">
          <h3>Innovation Link</h3>
          <p className="brand-desc">
            Trust-first startup & investor networking platform.
          </p>
          <p className="brand-meta">
            Verification · Credibility · Accountability
          </p>
        </motion.div>

        {/* Column 2 — Platform */}
        <motion.div variants={itemVariants} className="footer-col">
          <h4>Platform</h4>
          <ul>
            <li><a href="/how-it-works">How it Works</a></li>
            <li><a href="/verification">Verification Process</a></li>
            <li><a href="/pricing">Pricing</a></li>
            <li><a href="/community">Community</a></li>
          </ul>
        </motion.div>

        {/* Column 3 — Legal */}
        <motion.div variants={itemVariants} className="footer-col">
          <h4>Legal</h4>
          <ul>
            <li><a href="/terms">Terms & Conditions</a></li>
            <li><a href="/privacy">Privacy Policy</a></li>
            <li><a href="/code-of-conduct">Code of Conduct</a></li>
          </ul>
        </motion.div>

        {/* Column 4 — Contact */}
        <motion.div variants={itemVariants} className="footer-col">
          <h4>Contact & Presence</h4>
          <ul>
            <li><a href="/contact">Contact Us</a></li>
            <li><a href="/support">Support</a></li>
            <li>
              <a
                href="https://www.linkedin.com/"
                target="_blank"
                rel="noreferrer"
              >
                LinkedIn
              </a>
            </li>
          </ul>
        </motion.div>
      </div>

      {/* Divider */}
      <div className="footer-divider" />

      {/* Disclaimer */}
      <motion.p
        className="footer-disclaimer"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        viewport={{ once: true }}
      >
        Disclaimer: While Innovation Link facilitates the connection between
        startups and investors, the platform does not guarantee any investments
        or financial outcomes. Users are advised to conduct their own due
        diligence. Innovation Link is not responsible for any fraudulent
        activities.
      </motion.p>
    </motion.footer>
  );
}
