import React from 'react';
import './AdvancedSearch.css';

const AdvancedSearch = () => {
  const filtersRow1 = ['Sector', 'Sub-Sectors', 'Start-Up Type', 'Pitch Readiness', 'IP / Patent Status'];
  const filtersRow2 = ['Location', 'Traction', 'Monetization Model', 'Funding Stage', 'Incubated'];

  return (
    <div className="advanced-search-container">
      <div className="search-header">
        <div className="search-title">
          <span>Advanced Search</span>
        </div>
        <button className="clear-all-button">Clear All</button>
      </div>
      <div className="filter-grid">
        <div className="filter-row">
          {filtersRow1.map((filter, index) => (
            <div key={index} className="filter-item">
              <label>{filter}</label>
              <select className="filter-dropdown">
                <option>All {filter.replace(/s$/, '')}s</option>
              </select>
            </div>
          ))}
        </div>
        <div className="filter-row">
          {filtersRow2.map((filter, index) => (
            <div key={index} className="filter-item">
              <label>{filter}</label>
              <select className="filter-dropdown">
                <option>All {filter.replace(/s$/, '')}s</option>
              </select>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdvancedSearch;