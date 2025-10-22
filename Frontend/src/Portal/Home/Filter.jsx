import React from 'react';
import './AdvancedSearch.css';

const Filter = () => {
  const filtersRow1 = ['Role / Type', 'Industry Focus', 'Preferred Stage', 'Mentorship Specialty'];
//   const filtersRow2 = ['Location', 'Traction', 'Monetization Model', 'Funding Stage', 'Incubated'];

  return (
    <div className="advanced-search-container">
      <div className="search-header">
        <div className="search-title">
          <span>Search Filters</span>
        </div>
        <div className="header-buttons">
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
      </div>
    </div>
  );
};

export default Filter;