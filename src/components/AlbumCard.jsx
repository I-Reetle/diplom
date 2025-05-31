import React from 'react';

const AlbumCard = ({ album }) => {
  const imageUrl = album.image?.find(img => img.size === 'medium')?.['#text'] || '/img/albums/default.png';

  return (
    <article className="album-card">
      <img 
        src={imageUrl} 
        alt={album.name} 
        className="album-cover"
        onError={(e) => { e.target.src = '/img/albums/default.png' }}
        loading="lazy"
      />
      <div className="album-info">
        <h3 className="album-title">
          <a href={album.url} target="_blank" rel="noopener noreferrer">{album.name}</a>
        </h3>
        <p className="album-artist">{album.artist}</p>
      </div>
    </article>
  );
};

export default AlbumCard;