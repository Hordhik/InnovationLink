import React from 'react';

import AdvancedSearch from './AdvancedSearch';
import StartupCard from './StartupCard';

const InvestorHome = () => {
  return (
    <div
      style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}
    >
      <AdvancedSearch />
      <StartupCard />
      <StartupCard />
    </div>
  );
};

export default InvestorHome;
