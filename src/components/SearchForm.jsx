import React, { useState, useEffect } from 'react';

const SearchForm = ({ initialQuery = '', onSearch }) => {
  const [query, setQuery] = useState(initialQuery);

  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
    }
  };

  const handleClear = () => {
    setQuery('');
  };

  return (
    <form className="search-form" onSubmit={handleSubmit}>
      <div className="search-input-group">
        <input 
          type="text" 
          className="search-field" 
          placeholder="Search for artists, albums or tracks" 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        {query && (
          <button 
            type="button" 
            className="clear-btn" 
            aria-label="Clear search"
            onClick={handleClear}
          >
            <img src="/img/icons/clear_field.png" alt="Clear" />
          </button>
        )}
        <button type="submit" className="search-btn" aria-label="Search">
          <img src="/img/icons/search_dark.png" alt="Search" />
        </button>
      </div>
    </form>
  );
};

export default SearchForm;