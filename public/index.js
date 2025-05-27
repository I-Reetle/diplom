/**
 * Last.fm Music Explorer App
 * Displays popular artists and tracks from Last.fm API
 */
document.addEventListener('DOMContentLoaded', function() {
    const API_KEY = '6c5a01f373c137a37c51f79cea5b5073';
    const API_BASE_URL = 'https://ws.audioscrobbler.com/2.0/';
    
    // Configuration constants
    const CONFIG = {
        artistsLimit: 12,
        tracksLimit: 18,
        cacheDuration: 30 * 60 * 1000 // 30 minutes cache
    };

    // DOM Elements
    const DOM = {
        artistsGrid: document.querySelector('.artists-grid'),
        tracksGrid: document.querySelector('.tracks-grid'),
        loadingIndicator: document.createElement('div')
    };

    // Initialize loading indicator
    DOM.loadingIndicator.className = 'loading-indicator';
    DOM.loadingIndicator.textContent = 'Loading music data...';

    /**
     * Initialize the application
     */
    function initApp() {
        showLoadingState();
        
        // Try to load cached data first
        const cachedData = getCachedData();
        if (cachedData) {
            renderCachedData(cachedData);
        }

        // Always fetch fresh data
        fetchFreshData();
    }

    /**
     * Shows loading state in both sections
     */
    function showLoadingState() {
        [DOM.artistsGrid, DOM.tracksGrid].forEach(container => {
            container.innerHTML = '';
            container.appendChild(DOM.loadingIndicator.cloneNode());
        });
    }

    /**
     * Gets cached data from localStorage if valid
     * @returns {Object|null} Cached data or null if invalid/expired
     */
    function getCachedData() {
        const cached = localStorage.getItem('lastfmData');
        if (!cached) return null;
        
        const { timestamp, data } = JSON.parse(cached);
        const isExpired = Date.now() - timestamp > CONFIG.cacheDuration;
        
        return isExpired ? null : data;
    }

    /**
     * Renders cached data
     * @param {Object} data - Cached data to render
     */
    function renderCachedData(data) {
        if (data.artists) {
            renderItems({ type: 'artists', data: data.artists });
        }
        if (data.tracks) {
            renderItems({ type: 'tracks', data: data.tracks });
        }
    }

    /**
     * Fetches fresh data from API
     */
    function fetchFreshData() {
        Promise.all([
            fetchChartData('chart.gettopartists', CONFIG.artistsLimit),
            fetchChartData('chart.gettoptracks', CONFIG.tracksLimit)
        ])
        .then(([artists, tracks]) => {
            // Cache the fresh data
            cacheData({ artists, tracks });
        })
        .catch(handleGlobalError);
    }

    /**
     * Caches data to localStorage with timestamp
     * @param {Object} data - Data to cache
     */
    function cacheData(data) {
        const cache = {
            timestamp: Date.now(),
            data: data
        };
        localStorage.setItem('lastfmData', JSON.stringify(cache));
    }

    /**
     * Fetches chart data from Last.fm API
     * @param {string} method - API method to call
     * @param {number} limit - Number of items to fetch
     * @returns {Promise} Promise resolving to the data
     */
    function fetchChartData(method, limit) {
        const url = new URL(API_BASE_URL);
        url.searchParams.append('method', method);
        url.searchParams.append('api_key', API_KEY);
        url.searchParams.append('format', 'json');
        url.searchParams.append('limit', limit);

        return fetch(url)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`API request failed: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                const items = data?.[method.includes('artists') ? 'artists' : 'tracks']?.artist || 
                           data?.[method.includes('tracks') ? 'tracks' : 'artists']?.track;
                
                if (!items || !items.length) {
                    throw new Error(`No data received for ${method}`);
                }

                return items;
            })
            .then(items => {
                renderItems({
                    type: method.includes('artists') ? 'artists' : 'tracks',
                    data: items
                });
                return items;
            })
            .catch(error => {
                console.error(`Error loading ${method}:`, error);
                renderError(
                    method.includes('artists') ? '.artists-grid' : '.tracks-grid',
                    `Failed to load ${method.includes('artists') ? 'artists' : 'tracks'}. Please try again later.`
                );
                throw error;
            });
    }

    /**
     * Renders items (artists or tracks) to the DOM
     * @param {Object} params - Object containing type and data
     * @param {string} params.type - Type of items ('artists' or 'tracks')
     * @param {Array} params.data - Array of items to render
     */
    function renderItems({ type, data }) {
        const container = document.querySelector(`.${type}-grid`);
        if (!container) return;

        container.innerHTML = data.map(item => createItemCard(type, item)).join('');
    }

    /**
     * Creates HTML for an item card
     * @param {string} type - Type of item ('artists' or 'tracks')
     * @param {Object} item - Item data
     * @returns {string} HTML string for the card
     */
    function createItemCard(type, item) {
        const isArtist = type === 'artists';
        const imageUrl = getImageUrl(item.image, isArtist ? 'medium' : 'large');
        const genres = getGenres(item.tags?.tag);
        const defaultImage = `img/${type}/default.png`;

        if (isArtist) {
            return `
                <article class="artist-card" data-id="${item.name.toLowerCase().replace(/\s+/g, '-')}">
                    <a href="${item.url}" class="artist-link" target="_blank" rel="noopener">
                        <img src="${imageUrl}" 
                             alt="${item.name}" 
                             class="artist-image"
                             onerror="this.src='${defaultImage}'"
                             loading="lazy">
                        <div class="artist-overlay">
                            <span class="view-text">View Artist</span>
                        </div>
                    </a>
                    <div class="artist-info">
                        <h3 class="artist-name">${item.name}</h3>
                        <div class="genre-tags">${genres}</div>
                    </div>
                </article>
            `;
        } else {
            return `
                <article class="track-card" data-id="${item.name.toLowerCase().replace(/\s+/g, '-')}">
                    <a href="${item.url}" class="track-link" target="_blank" rel="noopener">
                        <img src="${imageUrl}" 
                             alt="${item.name}" 
                             class="track-cover"
                             onerror="this.src='${defaultImage}'"
                             loading="lazy">
                        <div class="play-overlay">
                            <img src="img/icons/play_dark.png" alt="Play" class="play-icon">
                        </div>
                    </a>
                    <div class="track-info">
                        <h3 class="track-title">${item.name}</h3>
                        <p class="track-artist">${item.artist.name}</p>
                        <div class="genre-tags">${genres}</div>
                    </div>
                </article>
            `;
        }
    }

    /**
     * Gets formatted genre tags HTML
     * @param {Array} tags - Array of tag objects
     * @param {number} limit - Maximum number of tags to show
     * @returns {string} HTML string of genre tags
     */
    function getGenres(tags, limit = 3) {
        if (!tags || !tags.length) {
            return '<span class="genre-tag">Various genres</span>';
        }
        
        return tags.slice(0, limit)
            .map(tag => `<span class="genre-tag">${tag.name}</span>`)
            .join('');
    }

    /**
     * Gets the appropriate image URL from an array of images
     * @param {Array} images - Array of image objects
     * @param {string} size - Desired image size
     * @returns {string} Image URL
     */
    function getImageUrl(images, size) {
        return images?.find(img => img.size === size)?.['#text'] || '';
    }

    /**
     * Renders an error message
     * @param {string} containerSelector - Selector for the container
     * @param {string} message - Error message to display
     */
    function renderError(containerSelector, message) {
        const container = document.querySelector(containerSelector);
        if (container) {
            container.innerHTML = `
                <div class="error-message">
                    <p>${message}</p>
                    <button class="retry-btn">Retry</button>
                </div>
            `;
            
            container.querySelector('.retry-btn')?.addEventListener('click', initApp);
        }
    }

    /**
     * Handles global errors
     * @param {Error} error - Error object
     */
    function handleGlobalError(error) {
        console.error('Application error:', error);
        // Could show a global error notification here
    }

    // Initialize the application
    initApp();
});