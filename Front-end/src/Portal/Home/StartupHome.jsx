import React from 'react';
// import './StartupHome.css';
import InvestorCard from './InvestorCard.jsx';
import AdvancedSearch from './AdvancedSearch.jsx';
import Filter from './Filter.jsx';
const dummyInvestors = [
  {
    id: 1,
    initials: 'JD',
    name: 'John Doe',
    title: 'Angel Investor & GTM Mentor (ex-HubSpot)',
    mentoredCount: 24,
    investmentsCount: 8,
    thesis:
      'I invest in pre-seed B2B SaaS companies building the future of work. My primary value-add is helping founders with GTM strategy and their first 10 enterprise sales.',
    tags: ['B2B SaaS', 'Go-to-Market', 'Fundraising', 'Product'],
  },
  {
    id: 2,
    initials: 'JS',
    name: 'Jane Smith',
    title: 'Managing Partner, XYZ Ventures',
    mentoredCount: 45,
    investmentsCount: 22,
    thesis:
      'XYZ Ventures is a $100M fund focused on Seed and Series A HealthTech and AI. We look for strong technical teams tackling complex, regulated markets.',
    tags: ['HealthTech', 'AI/ML', 'Series A', 'Scaling'],
  },
];

const StartupHome = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <Filter />
      {dummyInvestors.map((investor) => (
        <InvestorCard key={investor.id} investor={investor} />
      ))}
    </div>
  );
};

export default StartupHome;