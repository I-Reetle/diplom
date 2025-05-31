import React from 'react';

const SearchTabs = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'top', label: 'Top Results' },
    { id: 'artists', label: 'Artists' },
    { id: 'albums', label: 'Albums' },
    { id: 'tracks', label: 'Tracks' }
  ];

  return (
    <nav className="search-tabs">
      <ul className="tab-list">
        {tabs.map(tab => (
          <li 
            key={tab.id} 
            className={`tab-item ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => onTabChange(tab.id)}
          >
            <a href="#" className="tab-link">{tab.label}</a>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default SearchTabs;