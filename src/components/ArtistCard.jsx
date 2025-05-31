import React from 'react';

const ArtistCard = ({ artist }) => {
  const imageUrl = artist.image?.find(img => img.size === 'medium')?.['#text'] || '/img/artists/default.png';
  
  return (
    <article className="artist-card">
      <img 
        src={imageUrl} 
        alt={artist.name} 
        className="artist-img"
        onError={(e) => { e.target.src = '/img/artists/default.png' }}
        loading="lazy"
      />
      <div className="artist-info">
        <h3 className="artist-name">
          <a href={artist.url} target="_blank" rel="noopener noreferrer">
            {artist.name}
          </a>
        </h3>
        {artist.listeners && (
          <p className="artist-listeners">
            {formatNumber(artist.listeners)} listeners
          </p>
        )}
      </div>
    </article>
  );
};

// Вспомогательная функция для форматирования чисел
const formatNumber = (num) => {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

export default ArtistCard;