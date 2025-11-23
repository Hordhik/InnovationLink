import React, { useState, useEffect } from 'react'; // Added hooks
// import './StartupHome.css'; // Assuming styles might be added later
import InvestorCard from './InvestorCard.jsx'; // Using the one that fetches its own data
import AdvancedSearch from './AdvancedSearch.jsx'; // Kept import
import Filter from './Filter.jsx';             // Kept import

// --- Added API import ---
import { getAllInvestors } from '../../services/investorApi.js'; // Corrected path

// --- Dummy Details are NOT needed here, InvestorCard fetches/uses its own ---

const StartupHome = () => {
  // --- State for fetched data (basic list), loading, error ---
  const [investorList, setInvestorList] = useState([]); // Stores { id, username }
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- Added useEffect for data fetching (basic list) ---
  useEffect(() => {
    const fetchInvestors = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Fetch only the list of IDs and usernames
        const data = await getAllInvestors();
        console.log("Fetched investor list data:", data);

        if (!Array.isArray(data.investors)) {
          throw new Error("Invalid data format received from server. Expected 'investors' array.");
        }

        // Store the basic list { id, username }
        setInvestorList(data.investors);

      } catch (err) {
        console.error("Failed to fetch investor list:", err);
        setError(err.message || "Could not load investors.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchInvestors();
  }, []); // Run once on mount

  return (
    <div className="home-content">
      {/* --- Render Filter and Search as before --- */}
      <Filter />
      {/* <AdvancedSearch /> */} {/* Still commented out */}

      {/* --- Render Loading State --- */}
      {isLoading && (
        <div style={{ textAlign: 'center', padding: '2rem' }}>Loading investors...</div>
      )}

      {/* --- Render Error State --- */}
      {error && !isLoading && (
        <div style={{ textAlign: 'center', padding: '2rem', color: 'red' }}>Error loading investors: {error}</div>
      )}

      {/* --- Render Investor List (if not loading and no error) --- */}
      {!isLoading && !error && investorList.length > 0 && (
        investorList.map((investor) => (
          <InvestorCard
            key={investor.id}
            investorId={investor.id}
            initialUsername={investor.username}
          />
        ))
      )}

      {/* --- Render No Investors Found State --- */}
      {!isLoading && !error && investorList.length === 0 && (
        <p style={{ textAlign: 'center', padding: '2rem' }}>No investors found.</p>
      )}
    </div>
  );
};

export default StartupHome;

