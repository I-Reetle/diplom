const CACHE_KEY = 'lastfmData';
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

export const getCachedData = () => {
  const cached = localStorage.getItem(CACHE_KEY);
  if (!cached) return null;
  
  const { timestamp, data } = JSON.parse(cached);
  const isExpired = Date.now() - timestamp > CACHE_DURATION;
  
  return isExpired ? null : data;
};

export const cacheData = (data) => {
  const cache = {
    timestamp: Date.now(),
    data: data
  };
  localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
};

