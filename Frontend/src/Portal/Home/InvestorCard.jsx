import React, { useState, useEffect } from 'react'; // Import hooks
// Import assets - adjust paths if necessary
import mentorship from '../../assets/Portal/StartupCard/mentorship.png';
import active from '../../assets/Portal/StartupCard/active.png';
// Import CSS - make sure this path is correct
import './StartupCard.css';
// Import the NEW API function
import { getInvestorById } from '../../services/investorApi.js'; // Adjust path

// Fallback image URL
const placeholderAvatar = "https://ui-avatars.com/api/?name=N+A&background=e9ecef&color=495057&bold=true&size=60";

// Default dummy data structure within the component
const defaultInvestorData = {
  name: "Loading...", // Initially show loading or username
  title: "Investor Title Placeholder",
  mentoredCount: 0,
  investmentsCount: 0,
  thesis: "Loading details...",
  tags: [],
  initials: "...",
};

const InvestorCard = ({ investorId, initialUsername }) => {
  // State to hold the fetched investor details (or default/dummy data)
  const [investorData, setInvestorData] = useState({
    ...defaultInvestorData,
    name: initialUsername || "Investor", // Use initial username immediately
    initials: (initialUsername || 'N/A').substring(0, 2).toUpperCase()
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- Fetch data when the component mounts or investorId changes ---
  useEffect(() => {
    // Ensure we have an ID before fetching
    if (!investorId) {
      setError("Investor ID is missing.");
      setIsLoading(false);
      setInvestorData(prev => ({ ...prev, name: "Error", initials: "ER" })); // Update state on error
      return;
    }

    const fetchDetails = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Call the API to get details for this specific investor
        // Expected response: { investor: { id, user_id, name, username, about_me, preferences, title, mentoredCount, investmentsCount, thesis, tags } }
        const response = await getInvestorById(investorId);
        console.log(`Fetched details for ID ${investorId}:`, response);

        if (!response.investor) {
          throw new Error("Investor details not found.");
        }

        // Update state with fetched details
        // Prioritize fetched username if available, fallback to initialUsername
        const fetchedName = response.investor.username || initialUsername || `Investor #${investorId}`;
        setInvestorData({
          id: response.investor.id,
          name: fetchedName, // Use fetched username
          initials: fetchedName.substring(0, 2).toUpperCase(),
          // Use fetched details or fall back to defaults if properties are missing
          title: response.investor.title || defaultInvestorData.title,
          mentoredCount: response.investor.mentoredCount ?? defaultInvestorData.mentoredCount,
          investmentsCount: response.investor.investmentsCount ?? defaultInvestorData.investmentsCount,
          thesis: response.investor.thesis || defaultInvestorData.thesis,
          tags: Array.isArray(response.investor.tags) ? response.investor.tags : defaultInvestorData.tags,
        });

      } catch (err) {
        console.error(`Failed to fetch details for investor ID ${investorId}:`, err);
        setError(err.message || "Could not load details.");
        // Keep initialUsername if fetch fails
        setInvestorData(prev => ({
          ...defaultInvestorData, // Reset other fields to default on error
          name: initialUsername || `Investor #${investorId}`,
          initials: (initialUsername || 'ER').substring(0, 2).toUpperCase()
        }));
      } finally {
        setIsLoading(false);
      }
    };

    fetchDetails();
  }, [investorId, initialUsername]); // Refetch if ID or initial username changes

  // --- Display Logic ---
  // Use data from state (investorData)
  const displayName = investorData.name;
  const displayInitials = investorData.initials;
  const displayTitle = investorData.title;
  const displayMentored = investorData.mentoredCount;
  const displayInvestments = investorData.investmentsCount;
  const displayThesis = investorData.thesis;
  const displayTags = investorData.tags;

  // Generate avatar URL using initials
  const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(displayInitials)}&background=e9ecef&color=495057&bold=true&size=60`;

  // Optionally show a loading state within the card
  if (isLoading) {
    return (
      <div className="investor-card loading"> {/* Add a loading class */}
        <p>Loading details for {initialUsername || `Investor #${investorId}`}...</p>
        {/* You could put a skeleton loader here */}
      </div>
    );
  }

  // Optionally show an error state within the card
  if (error) {
    return (
      <div className="investor-card error" style={{ border: '1px solid orange', padding: '1rem' }}> {/* Add error class/style */}
        <p>Could not load details for {initialUsername || `Investor #${investorId}`}.</p>
        <p style={{ fontSize: '0.8em', color: '#666' }}>Error: {error}</p>
      </div>
    );
  }

  // --- Render the card with fetched/dummy data ---
  return (
    <div className="investor-card">
      <div className="card-header">
        <div className="startup-info">
          <div className="avatar">
            <img
              src={avatarUrl}
              alt={`${displayName} initials`}
              onError={(e) => { e.target.onerror = null; e.target.src = placeholderAvatar; }}
              style={{ width: '60px', height: '60px', borderRadius: '50%' }}
            />
          </div>
          <div className="text-info">
            <p className="startup-name">{displayName}</p> {/* Shows username or name */}
            <p className="founder-name">{displayTitle}</p> {/* Shows fetched or dummy title */}
          </div>
        </div>
        <div className="connect">
          <div className="mentor-info">
            <div className="mentors-engaged">
              <img src={mentorship} alt="" className='icon' />
              <span><strong>{displayMentored}</strong> Startups Mentored</span> {/* Shows fetched or dummy count */}
            </div>
            <div className="mentors-this-month">
              <img src={active} alt="" className='icon' />
              <span><strong>{displayInvestments}</strong> Active Investments</span> {/* Shows fetched or dummy count */}
            </div>
          </div>
          <div className="card-actions">
            <button className="connect-button">Connect</button>
            <button className="request-button">Request a Meeting</button>
          </div>
        </div>
      </div>
      <div className="card-body">
        <p className="description">
          {displayThesis} {/* Shows fetched or dummy thesis */}
        </p>
        <div className="tags">
          {displayTags.map((tag, index) => (
            <p key={index} className="tag">{tag}</p> // Shows fetched or dummy tags
          ))}
        </div>
        <a href="#" className="view-profile-link" onClick={(e) => e.preventDefault()}>
          <span>View Full Profile</span>
          <span className="arrow-icon">→</span>
        </a>
      </div>
    </div>
  );
};

export default InvestorCard;

