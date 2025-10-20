import React, { useState } from 'react';
import './AdvancedSearch.css';

const AdvancedSearch = () => {
  const [isAdvanced, setIsAdvanced] = useState(false);
  const filtersRow1 = ['Sector', 'Sub-Sectors', 'Start-Up Type', 'Pitch Readiness', 'IP / Patent Status'];
  const filtersRow2 = ['Location', 'Traction', 'Monetization Model', 'Funding Stage', 'Incubated'];

  const toggleSearchMode = () => {
    setIsAdvanced(!isAdvanced);
  };

  return (
    <div className="advanced-search-container">
      <div className="search-header">
        <div className="search-title">
          <span>{isAdvanced ? 'Advanced Search' : 'Basic Search'}</span>
        </div>
        <div className="header-buttons">
          <button className="toggle-search-button" onClick={toggleSearchMode}>
            {isAdvanced ? 'Switch to Basic' : 'Switch to Advanced'}
          </button>
          <button className="clear-all-button">Clear All</button>
        </div>
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
        {isAdvanced && (
          <div className="filter-row filter-row-advanced">
            {filtersRow2.map((filter, index) => (
              <div key={index} className="filter-item">
                <label>{filter}</label>
                <select className="filter-dropdown">
                  <option>All {filter.replace(/s$/, '')}s</option>
                </select>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdvancedSearch;