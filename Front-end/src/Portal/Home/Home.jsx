import React, { useEffect, useState } from 'react';
import InvestorHome from './InvestorHome';
import StartupHome from './StartupHome';
import './Home.css';
import { getSession } from '../../services/authApi.js';
import { getToken } from '../../auth.js';

const Home = () => {
  const [resolvedType, setResolvedType] = useState(null); // 'startup' | 'investor'

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const token = getToken();
        if (!token) {
          // Fallback: infer from URL first segment (S/I)
          const seg = (window.location.pathname.split('/')[1] || 'S');
          setResolvedType(seg === 'I' ? 'investor' : 'startup');
          return;
        }
        const data = await getSession();
        if (!cancelled) {
          const t = data?.user?.userType;
          setResolvedType(t === 'investor' ? 'investor' : 'startup');
        }
      } catch (e) {
        if (!cancelled) {
          const seg = (window.location.pathname.split('/')[1] || 'S');
          setResolvedType(seg === 'I' ? 'investor' : 'startup');
        }
      }
    })();
    return () => { cancelled = true; };
  }, []);

  if (!resolvedType) return null;

  return (
    <div className="home-container">
      {resolvedType === 'investor' ? <InvestorHome /> : <StartupHome />}
    </div>
  );
};

export default Home;