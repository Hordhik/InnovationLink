import React from 'react';
import { Search, Plus, User, Mail, Twitter, Linkedin, Star, ThumbsUp, Briefcase } from 'lucide-react';
import './InvestorProfile.css'; // Import the CSS file

const InvestorProfile = () => {
  // Dummy data for the investor profile
  const investorData = {
    name: "Chandra Sekhar",
    handle: "@chandu",
    location: "Hyderabad, India",
    about: "Lorem ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged.",
    sectors: ["HealthTech", "RuralTech", "SaaS", "Clean Energy"],
    stages: ["Pre-seed", "MVP Ready"],
    expertise: ["Product Strategy", "Market Analysis", "Scaling Teams", "Fundraising", "Go-to-Market"],
    connectedStartups: [
      { id: 1, name: "EcoPack Solutions", founder: "Jane Doe", tags: ["HealthTech", "GreenTech"], logo: "https://via.placeholder.com/40" },
      { id: 2, name: "Synapse Minds AI", founder: "John Smith", tags: ["AI/ML", "FinTech"], logo: "https://via.placeholder.com/40" },
      { id: 3, name: "Seismo AI @ Triby", founder: "Alice Johnson", tags: ["AI/ML", "CyberSecurity"], logo: "https://via.placeholder.com/40" },
      { id: 4, name: "AquaFlow Innovations", founder: "Bob White", tags: ["Clean Energy", "WaterTech"], logo: "https://via.placeholder.com/40" },
    ],
    recommendations: [
      {
        id: 1,
        author: "Jayesh Kumar",
        title: "Founder, Alpha Solutions",
        text: "“Chandra’s insights on market entry and competitive positioning were invaluable. He helped us refine our pitch and connect with key industry players.”",
        avatar: "https://via.placeholder.com/40",
      },
      {
        id: 2,
        author: "Priya Sharma",
        title: "CEO, Beta Innovations",
        text: "“His guidance on product-market fit was spot on. Highly recommend for any founder looking for strategic advice.”",
        avatar: "https://via.placeholder.com/40",
      },
    ],
    // Assuming a simple list for 'My Projects' and 'Essential' for now.
    // In a real app, these would likely come from parent state or context.
    myProjects: ["Handbook", "Arc C1", "Lucid Air", "Pocket Cup"],
    essentialItems: ["Notifications", "Support Tickets", "Settings"]
  };

  return (
    <div className="investor-profile-layout">
      {/* Left Sidebar (Placeholder for shared navigation) */}

      {/* Main Content Area */}
      <main className="investor-main-content">
        <div className="investor-profile-grid">
          {/* Main Profile Card */}
          <section className="investor-profile-card card">
            <div className="profile-header">
              <img src="https://via.placeholder.com/80" alt={investorData.name} className="profile-avatar" />
              <div className="profile-info">
                <h1 className="profile-name">{investorData.name}</h1>
                <p className="profile-handle">{investorData.handle}</p>
                <p className="profile-location">
                  <Briefcase size={14} /> Founder
                  <span className="profile-location-separator">|</span>
                  <span className="profile-location-text">{investorData.location}</span>
                </p>
                <div className="profile-social">
                  <a href="#" aria-label="Mail"><Mail size={16} /></a>
                  <a href="#" aria-label="Twitter"><Twitter size={16} /></a>
                  <a href="#" aria-label="LinkedIn"><Linkedin size={16} /></a>
                </div>
              </div>
            </div>
            <div className="profile-actions">
              <button className="btn-primary">Request A Meet</button>
              <button className="btn-outline">Connect</button>
            </div>
          </section>

          {/* About Section */}
          <section className="investor-about card">
            <h2 className="card-title">About {investorData.name}</h2>
            <p className="about-text">{investorData.about}</p>
          </section>

          {/* Expertise Section */}
          <section className="investor-expertise card">
            <h2 className="card-title">Expertise</h2>
            <div className="expertise-tags">
              {investorData.expertise.map((skill, index) => (
                <span key={index} className="tag tag-skill">{skill}</span>
              ))}
            </div>
          </section>

          {/* What I Like To Invest In Section */}
          <section className="investor-invest-in card">
            <h2 className="card-title">What I Like To Invest In</h2>
            <div className="invest-categories">
              <div className="category-group">
                <h3 className="category-title">Sectors Interested In</h3>
                <div className="category-tags">
                  {investorData.sectors.map((sector, index) => (
                    <span key={index} className="tag tag-sector">{sector}</span>
                  ))}
                </div>
              </div>
              <div className="category-group">
                <h3 className="category-title">Stage Focus</h3>
                <div className="category-tags">
                  {investorData.stages.map((stage, index) => (
                    <span key={index} className="tag tag-stage">{stage}</span>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Connected Startups Section */}
          <section className="investor-connected-startups card card-full-width">
            <div className="card-header">
              <h2 className="card-title">Connected With {investorData.connectedStartups.length} Start-ups</h2>
              <a href="#" className="view-all-link">See All</a>
            </div>
            <div className="startup-list">
              {investorData.connectedStartups.slice(0, 4).map((startup) => ( // Show first 4
                <div key={startup.id} className="startup-item">
                  <img src={startup.logo} alt={startup.name} className="startup-logo" />
                  <div className="startup-info">
                    <div className="startup-name">{startup.name}</div>
                    <div className="startup-founder">Founder: {startup.founder}</div>
                    <div className="startup-tags">
                      {startup.tags.map((tag, index) => (
                        <span key={index} className="tag tag-mini">{tag}</span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

        </div>
      </main>
    </div>
  );
};

export default InvestorProfile;