import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import ArtistCard from '../components/ArtistCard';
import AlbumCard from '../components/AlbumCard';
import TrackCard from '../components/TrackCard';
import { searchArtists, searchAlbums, searchTracks } from '../services/lastfmApi';
import LoadingSpinner from '../components/LoadingSpinner';

const Search = () => {
  const [searchParams] = useSearchParams();
  const [query, setQuery] = useState('Radiohead');
  const [activeTab, setActiveTab] = useState('top');
  const [artists, setArtists] = useState([]);
  const [albums, setAlbums] = useState([]);
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [visibleCount, setVisibleCount] = useState({
    artists: 6,
    albums: 6,
    tracks: 8
  });

  // Perform search when query or tab changes
  useEffect(() => {
    const performSearch = async () => {
      if (!query.trim()) return;
      
      setLoading(true);
      try {
        const [artistsData, albumsData, tracksData] = await Promise.all([
          searchArtists(query),
          searchAlbums(query),
          searchTracks(query)
        ]);
        
        setArtists(artistsData);
        setAlbums(albumsData);
        setTracks(tracksData);
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setLoading(false);
      }
    };

    performSearch();
  }, [query]);

  // Handle search form submission
  const handleSearch = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const searchQuery = formData.get('search').trim();
    if (searchQuery) {
      setQuery(searchQuery);
    }
  };

  // Load more items function
  const loadMore = (type) => {
    setVisibleCount(prev => ({
      ...prev,
      [type]: prev[type] + (type === 'tracks' ? 8 : 6)
    }));
  };

  // Clear search field
  const clearSearch = () => {
    setQuery('');
  };

  return (
    <div className="search-page">
      <header className="search-header">
        <h1 className="search-title">Search results for "{query}"</h1>
        
        <nav className="search-tabs">
          <ul className="tab-list">
            <li 
              className={`tab-item ${activeTab === 'top' ? 'active' : ''}`}
              onClick={() => setActiveTab('top')}
            >
              <a href="#" className="tab-link">Top Results</a>
            </li>
            <li 
              className={`tab-item ${activeTab === 'artists' ? 'active' : ''}`}
              onClick={() => setActiveTab('artists')}
            >
              <a href="#" className="tab-link">Artists</a>
            </li>
            <li 
              className={`tab-item ${activeTab === 'albums' ? 'active' : ''}`}
              onClick={() => setActiveTab('albums')}
            >
              <a href="#" className="tab-link">Albums</a>
            </li>
            <li 
              className={`tab-item ${activeTab === 'tracks' ? 'active' : ''}`}
              onClick={() => setActiveTab('tracks')}
            >
              <a href="#" className="tab-link">Tracks</a>
            </li>
          </ul>
        </nav>
      </header>

      <div className="search-container">
        <form className="search-form" onSubmit={handleSearch}>
          <div className="search-input-group">
            <input 
              type="text" 
              name="search"
              className="search-field" 
              placeholder="Search for artists, albums or tracks"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            {query && (
              <button 
                type="button" 
                className="clear-btn" 
                onClick={clearSearch}
                aria-label="Clear search"
              >
                <img src="/img/icons/clear_field.png" alt="Clear" />
              </button>
            )}
            <button type="submit" className="search-btn" aria-label="Search">
              <img src="/img/icons/search_dark.png" alt="Search" />
            </button>
          </div>
        </form>

        {loading ? (
          <LoadingSpinner />
        ) : (
          <>
            {(activeTab === 'top' || activeTab === 'artists') && artists.length > 0 && (
              <section className="search-section artists-section">
                <h2 className="section-title">Artists</h2>
                <div className="artist-grid">
                  {artists.slice(0, visibleCount.artists).map(artist => (
                    <ArtistCard 
                      key={artist.mbid || artist.name} 
                      artist={artist} 
                    />
                  ))}
                </div>
                {artists.length > visibleCount.artists && (
                  <button 
                    className="view-more-btn"
                    onClick={() => loadMore('artists')}
                  >
                    More artists
                    <img src="/img/icons/arrow_small_right.png" alt="" className="arrow-icon" />
                  </button>
                )}
              </section>
            )}

            {(activeTab === 'top' || activeTab === 'albums') && albums.length > 0 && (
              <section className="search-section albums-section">
                <h2 className="section-title">Albums</h2>
                <div className="album-grid">
                  {albums.slice(0, visibleCount.albums).map(album => (
                    <AlbumCard 
                      key={album.mbid || `${album.name}-${album.artist}`} 
                      album={album} 
                    />
                  ))}
                </div>
                {albums.length > visibleCount.albums && (
                  <button 
                    className="view-more-btn"
                    onClick={() => loadMore('albums')}
                  >
                    More albums
                    <img src="/img/icons/arrow_small_right.png" alt="" className="arrow-icon" />
                  </button>
                )}
              </section>
            )}

            {(activeTab === 'top' || activeTab === 'tracks') && tracks.length > 0 && (
              <section className="search-section tracks-section">
                <h2 className="section-title">Tracks</h2>
                <div className="track-list">
                  {tracks.slice(0, visibleCount.tracks).map(track => (
                    <TrackCard 
                      key={track.mbid || `${track.name}-${track.artist}`} 
                      track={track} 
                    />
                  ))}
                </div>
                {tracks.length > visibleCount.tracks && (
                  <button 
                    className="view-more-btn"
                    onClick={() => loadMore('tracks')}
                  >
                    More tracks
                    <img src="/img/icons/arrow_small_right.png" alt="" className="arrow-icon" />
                  </button>
                )}
              </section>
            )}

            {artists.length === 0 && albums.length === 0 && tracks.length === 0 && (
              <div className="no-results">
                No results found for "{query}"
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Search;