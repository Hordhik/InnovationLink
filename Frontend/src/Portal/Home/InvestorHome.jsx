import React, { useEffect, useState } from 'react';

import AdvancedSearch from './AdvancedSearch';
import StartupCard from './StartupCard';
import { getAllStartups } from '../../services/startupProfileApi';
import { getConnections } from '../../services/connectionApi';

const InvestorHome = () => {
  const [startups, setStartups] = useState([]);
  const [connectedUsernames, setConnectedUsernames] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const [startupsData, connectionsData] = await Promise.all([
          getAllStartups(),
          getConnections().catch(err => {
            console.error("Failed to fetch connections:", err);
            return [];
          })
        ]);

        if (!cancelled) {
          setStartups(Array.isArray(startupsData?.startups) ? startupsData.startups : []);

          // Create a Set of connected usernames for O(1) lookup
          const connectedSet = new Set();
          if (Array.isArray(connectionsData)) {
            connectionsData.forEach(c => {
              if (c.username) connectedSet.add(c.username);
            });
          }
          setConnectedUsernames(connectedSet);
        }
      } catch (e) {
        if (!cancelled) setError(e?.response?.data?.message || e?.message || 'Failed to load startups');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="home-content">
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
          username={s.username}
          isConnected={connectedUsernames.has(s.username)}
        />
      ))}
    </div>
  );
};

export default InvestorHome;
