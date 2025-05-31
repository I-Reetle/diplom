import React from 'react';

const TrackCard = ({ track }) => {
  const imageUrl = track.image?.find(img => img.size === 'large')?.['#text'] || '/img/tracks/default.png';
  const genres = track.tags?.tag?.slice(0, 3).map(tag => tag.name) || ['Various genres'];

  return (
    <article className="track-card" data-id={track.name.toLowerCase().replace(/\s+/g, '-')}>
      <a href={track.url} className="track-link" target="_blank" rel="noopener noreferrer">
        <img 
          src={imageUrl} 
          alt={track.name} 
          className="track-cover"
          onError={(e) => { e.target.src = '/img/tracks/default.png' }}
          loading="lazy"
        />
        <div className="play-overlay">
          <img src="/img/icons/play_dark.png" alt="Play" className="play-icon" />
        </div>
      </a>
      <div className="track-info">
        <h3 className="track-title">{track.name}</h3>
        <p className="track-artist">{track.artist?.name || track.artist}</p>
        <div className="genre-tags">
          {genres.map(genre => (
            <span key={genre} className="genre-tag">{genre}</span>
          ))}
        </div>
      </div>
    </article>
  );
};

export default TrackCard;