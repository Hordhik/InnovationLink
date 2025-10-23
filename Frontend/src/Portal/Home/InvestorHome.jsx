import React, { useEffect, useState } from 'react';

import AdvancedSearch from './AdvancedSearch';
import StartupCard from './StartupCard';
import { getAllStartups } from '../../services/startupProfileApi';

const InvestorHome = () => {
  const [startups, setStartups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const data = await getAllStartups();
        if (!cancelled) setStartups(Array.isArray(data?.startups) ? data.startups : []);
      } catch (e) {
        if (!cancelled) setError(e?.response?.data?.message || e?.message || 'Failed to load startups');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  return (
    <div
      style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}
    >
      <AdvancedSearch />
      {loading && <div style={{ padding: '8px 4px' }}>Loading startups…</div>}
      {error && (
        <div style={{ padding: '8px 4px', color: 'crimson' }}>{error}</div>
      )}
      {!loading && !error && startups.length === 0 && (
        <div style={{ padding: '8px 4px' }}>No startups found.</div>
      )}
      {!loading && !error && startups.map((s) => (
        <StartupCard
          key={s.username}
          logo={s.logo}
          companyName={s.company_name}
          founderName={s.founder}
          description={s.description}
          domain={s.domain}
          teamCount={s.teamCount}
          profileUrl={`/startup/${s.username}`}
        />
      ))}
    </div>
  );
};

export default InvestorHome;
