import React, { useEffect, useState } from 'react';
import ArtistCard from '../components/ArtistCard';
import TrackCard from '../components/TrackCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { fetchTopArtists, fetchTopTracks } from '../services/lastfmApi';
import { getCachedData, cacheData } from '../services/cacheService';

const Home = () => {
  const [artists, setArtists] = useState([]);
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Try to load cached data first
        const cachedData = getCachedData();
        if (cachedData) {
          setArtists(cachedData.artists || []);
          setTracks(cachedData.tracks || []);
        }

        // Always fetch fresh data
        const [artistsData, tracksData] = await Promise.all([
          fetchTopArtists(12),
          fetchTopTracks(18)
        ]);
        
        setArtists(artistsData);
        setTracks(tracksData);
        cacheData({ artists: artistsData, tracks: tracksData });
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (error) {
    return (
      <div className="error-message">
        <p>Failed to load data. Please try again later.</p>
        <button className="retry-btn" onClick={() => window.location.reload()}>Retry</button>
      </div>
    );
  }

  return (
    <>
      <h1 className="page-title">Music</h1>
      
      <section className="featured-section trending-artists">
        <h2 className="section-title">Hot right now</h2>
        {loading ? (
          <LoadingSpinner />
        ) : (
          <div className="grid-container artists-grid">
            {artists.map(artist => (
              <ArtistCard key={artist.name} artist={artist} />
            ))}
          </div>
        )}
      </section>
      
      <section className="featured-section popular-tracks">
        <h2 className="section-title">Popular tracks</h2>
        {loading ? (
          <LoadingSpinner />
        ) : (
          <div className="grid-container tracks-grid">
            {tracks.map(track => (
              <TrackCard key={`${track.name}-${track.artist.name}`} track={track} />
            ))}
          </div>
        )}
      </section>
    </>
  );
};

export default Home;