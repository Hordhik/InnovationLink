import React from 'react';
import InvestorCard from './InvestorCard.jsx';
import AboutSection from './AboutSection.jsx';
import ExpertiseSection from './ExpertiseSection.jsx';
import InvestLike from './InvestLike.jsx';
import SectorsInterested from './SectorsInterested.jsx';
import StageFocus from './StageFocus.jsx';
import ConnectedStartups from './ConnectedStartups.jsx';
import './InvestorProfile.css';

const investorData = {
  name: "Chandra Sekhar",
  // handle: "@chandu",
  title: "Founder",
  location: "Hyderabad, India",
  about: "Lorem ipsum is simply dummy text of the printing and typesetting industry. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged.",
  expertise: ["Product Strategy", "Market Analysis", "Scaling Teams", "Fundraising", "Go-to-Market"],
  sectors: ["HealthTech", "RuralTech", "SaaS", "Clean Energy"],
  stages: ["Pre-seed", "MVP Ready"],
  startups: [
    { name: "EcoPack Solutions", founder: "Jane Doe", tags: ["HealthTech", "GreenTech"] },
    { name: "Synapse Minds AI", founder: "John Smith", tags: ["AI/ML", "FinTech"] },
    { name: "Seismo AI @ Triby", founder: "Alice Johnson", tags: ["AI/ML", "CyberSecurity"] },
    { name: "AquaFlow Innovations", founder: "Bob White", tags: ["Clean Energy", "WaterTech"] }
  ]
};

export default function InvestorProfile() {
  return (
    <div className="investor-profile-page">
      {/* --- Row 1 --- */}
      <div className="investor-row">
        <InvestorCard data={investorData} />
        <AboutSection about={investorData.about} name={investorData.name} />
        <ExpertiseSection expertise={investorData.expertise} />
      </div>

      {/* --- Row 2 --- */}
      <div className="investor-row">
        <InvestLike />
        <SectorsInterested sectors={investorData.sectors} />
        <StageFocus stages={investorData.stages} />
      </div>

      {/* --- Row 3 --- */}
      <div className="investor-row full-width">
        <ConnectedStartups startups={investorData.startups} />
      </div>
    </div>
  );
}
