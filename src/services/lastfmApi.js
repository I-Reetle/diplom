const API_KEY = '6c5a01f373c137a37c51f79cea5b5073';
const BASE_URL = 'https://ws.audioscrobbler.com/2.0/';

const fetchData = async (method, params = {}, limit = 10) => {
  const url = new URL(BASE_URL);
  url.searchParams.append('method', method);
  url.searchParams.append('api_key', API_KEY);
  url.searchParams.append('format', 'json');
  url.searchParams.append('limit', limit);

  Object.entries(params).forEach(([key, value]) => {
    if (value) url.searchParams.append(key, value);
  });

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`API request failed: ${response.status}`);
  }
  return await response.json();
};

// Chart methods
export const fetchTopArtists = async (limit = 12) => {
  const data = await fetchData('chart.gettopartists', {}, limit);
  return data?.artists?.artist || [];
};

export const fetchTopTracks = async (limit = 18) => {
  const data = await fetchData('chart.gettoptracks', {}, limit);
  return data?.tracks?.track || [];
};

// Search methods
export const searchArtists = async (query, limit = 50) => {
  const data = await fetchData('artist.search', { artist: query }, limit);
  return data?.results?.artistmatches?.artist || [];
};

export const searchAlbums = async (query, limit = 50) => {
  const data = await fetchData('album.search', { album: query }, limit);
  return data?.results?.albummatches?.album || [];
};

export const searchTracks = async (query, limit = 50) => {
  const data = await fetchData('track.search', { track: query }, limit);
  return data?.results?.trackmatches?.track || [];
};