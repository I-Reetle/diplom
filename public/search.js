/**
 * Last.fm Search Application
 * Handles searching for artists, albums and tracks
 */
document.addEventListener('DOMContentLoaded', () => {
    const SearchApp = {
        config: {
            apiKey: '6c5a01f373c137a37c51f79cea5b5073',
            baseUrl: 'https://ws.audioscrobbler.com/2.0/',
            defaultImage: 'img/default.png',
            playIcon: 'img/icons/play_dark.png',
            searchHistoryKey: 'lastfmSearchHistory',
            maxHistoryItems: 5,
            
            limits: {
                artists: 6,
                albums: 6,
                tracks: 8
            }
        },

        dom: {
            searchForm: null,
            searchField: null,
            searchTitle: null,
            artistGrid: null,
            albumGrid: null,
            trackList: null,
            clearBtn: null,
            tabItems: null
        },

        currentTab: 'top',
        currentQuery: '',
        searchHistory: [],

        /**
         * Initializes the application
         */
        init() {
            this.cacheDOMElements();
            this.setupEventListeners();
            this.loadSearchHistory();
            
            // Set initial query if provided in URL
            const urlParams = new URLSearchParams(window.location.search);
            const initialQuery = urlParams.get('q') || 'popular tracks';
            this.performSearch(initialQuery);
        },

        /**
         * Caches frequently used DOM elements
         */
        cacheDOMElements() {
            this.dom.searchForm = document.getElementById('searchForm');
            this.dom.searchField = document.querySelector('.search-field');
            this.dom.searchTitle = document.querySelector('.search-title');
            this.dom.artistGrid = document.querySelector('.artist-grid');
            this.dom.albumGrid = document.querySelector('.album-grid');
            this.dom.trackList = document.querySelector('.track-list');
            this.dom.clearBtn = document.querySelector('.clear-btn');
            this.dom.tabItems = document.querySelectorAll('.tab-item');
        },

        /**
         * Sets up event listeners
         */
        setupEventListeners() {
            this.dom.searchForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleSearch();
            });

            this.dom.clearBtn.addEventListener('click', () => {
                this.clearSearch();
            });

            this.dom.tabItems.forEach(tab => {
                tab.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.switchTab(tab);
                });
            });

            // Debounce search input
            this.dom.searchField.addEventListener('input', 
                this.debounce(() => {
                    if (this.dom.searchField.value.trim()) {
                        this.handleSearch();
                    }
                }, 500)
            );
        },

        /**
         * Debounces a function to limit execution rate
         * @param {Function} func - Function to debounce
         * @param {number} delay - Delay in milliseconds
         * @returns {Function} Debounced function
         */
        debounce(func, delay) {
            let timeoutId;
            return (...args) => {
                clearTimeout(timeoutId);
                timeoutId = setTimeout(() => func.apply(this, args), delay);
            };
        },

        /**
         * Handles search form submission
         */
        handleSearch() {
            const query = this.dom.searchField.value.trim();
            if (query && query !== this.currentQuery) {
                this.currentQuery = query;
                this.updateSearchTitle(query);
                this.addToSearchHistory(query);
                this.performSearch(query);
                this.updateURL(query);
            }
        },

        /**
         * Updates the browser URL with search query
         * @param {string} query - Search query
         */
        updateURL(query) {
            const url = new URL(window.location);
            url.searchParams.set('q', query);
            window.history.pushState({}, '', url);
        },

        /**
         * Updates the search results title
         * @param {string} query - Search query
         */
        updateSearchTitle(query) {
            this.dom.searchTitle.textContent = `Search results for "${query}"`;
        },

        /**
         * Clears the search field
         */
        clearSearch() {
            this.dom.searchField.value = '';
            this.dom.searchField.focus();
        },

        /**
         * Switches between search tabs
         * @param {HTMLElement} tab - Clicked tab element
         */
        switchTab(tab) {
            this.dom.tabItems.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            this.currentTab = tab.textContent.toLowerCase();
            
            // Re-render current search for the new tab
            if (this.currentQuery) {
                this.performSearch(this.currentQuery);
            }
        },

        /**
         * Performs a search across all categories
         * @param {string} query - Search query
         */
        performSearch(query) {
            this.showLoadingStates();
            
            // Execute searches based on current tab
            if (this.currentTab === 'top') {
                this.executeAllSearches(query);
            } else {
                this.executeSingleSearch(query);
            }
        },

        /**
         * Executes searches for all categories
         * @param {string} query - Search query
         */
        executeAllSearches(query) {
            Promise.all([
                this.searchCategory('artist.search', { artist: query }, 'artists'),
                this.searchCategory('album.search', { album: query }, 'albums'),
                this.searchCategory('track.search', { track: query }, 'tracks')
            ]).catch(error => {
                console.error('Search error:', error);
            });
        },

        /**
         * Executes search for the current active tab only
         * @param {string} query - Search query
         */
        executeSingleSearch(query) {
            let method, params, type;
            
            switch(this.currentTab) {
                case 'artists':
                    method = 'artist.search';
                    params = { artist: query };
                    type = 'artists';
                    break;
                case 'albums':
                    method = 'album.search';
                    params = { album: query };
                    type = 'albums';
                    break;
                case 'tracks':
                    method = 'track.search';
                    params = { track: query };
                    type = 'tracks';
                    break;
                default:
                    return;
            }
            
            this.searchCategory(method, params, type);
        },

        /**
         * Searches a specific category
         * @param {string} method - API method to call
         * @param {Object} params - Search parameters
         * @param {string} type - Type of search ('artists', 'albums', 'tracks')
         */
        async searchCategory(method, params, type) {
            try {
                const url = this.buildApiUrl(method, params, this.config.limits[type]);
                const data = await this.fetchApiData(url);
                const items = data?.results?.[`${type.slice(0, -1)}matches`]?.[type.slice(0, -1)];
                
                if (!items?.length) {
                    this.showNoResults(this.dom[`${type}Grid`], type);
                    return;
                }
                
                this.renderResults(type, items);
            } catch (error) {
                this.showError(this.dom[`${type}Grid`], type, error);
            }
        },

        /**
         * Builds API URL for a request
         * @param {string} method - API method
         * @param {Object} params - Query parameters
         * @param {number} limit - Results limit
         * @returns {string} Constructed API URL
         */
        buildApiUrl(method, params, limit) {
            const url = new URL(this.config.baseUrl);
            url.searchParams.append('method', method);
            
            Object.entries(params).forEach(([key, value]) => {
                url.searchParams.append(key, value);
            });
            
            url.searchParams.append('api_key', this.config.apiKey);
            url.searchParams.append('format', 'json');
            url.searchParams.append('limit', limit);
            
            return url.toString();
        },

        /**
         * Fetches data from API
         * @param {string} url - API URL
         * @returns {Promise} Promise resolving to the response data
         */
        async fetchApiData(url) {
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`API request failed: ${response.status}`);
            }
            
            return await response.json();
        },

        /**
         * Shows loading states in all result containers
         */
        showLoadingStates() {
            const loadingHTML = '<div class="loading-spinner"></div>';
            
            if (this.currentTab === 'top' || this.currentTab === 'artists') {
                this.dom.artistGrid.innerHTML = loadingHTML;
            }
            
            if (this.currentTab === 'top' || this.currentTab === 'albums') {
                this.dom.albumGrid.innerHTML = loadingHTML;
            }
            
            if (this.currentTab === 'top' || this.currentTab === 'tracks') {
                this.dom.trackList.innerHTML = loadingHTML;
            }
        },

        /**
         * Renders search results
         * @param {string} type - Type of results ('artists', 'albums', 'tracks')
         * @param {Array} items - Array of result items
         */
        renderResults(type, items) {
            switch(type) {
                case 'artists':
                    this.renderArtists(items);
                    break;
                case 'albums':
                    this.renderAlbums(items);
                    break;
                case 'tracks':
                    this.renderTracks(items);
                    break;
            }
        },

        /**
         * Renders artist results
         * @param {Array} artists - Array of artist objects
         */
        renderArtists(artists) {
            this.dom.artistGrid.innerHTML = artists.map(artist => `
                <article class="artist-card">
                    <img src="${this.getImageUrl(artist.image, 'medium')}" 
                         alt="${artist.name}" 
                         class="artist-img"
                         onerror="this.src='${this.config.defaultImage}'"
                         loading="lazy">
                    <div class="artist-info">
                        <h3 class="artist-name">
                            <a href="${artist.url}" target="_blank">${artist.name}</a>
                        </h3>
                        <p class="artist-stats">
                            ${this.formatNumber(artist.listeners || 0)} listeners
                        </p>
                    </div>
                </article>
            `).join('');
        },

        /**
         * Renders album results
         * @param {Array} albums - Array of album objects
         */
        renderAlbums(albums) {
            this.dom.albumGrid.innerHTML = albums.map(album => `
                <article class="album-card">
                    <img src="${this.getImageUrl(album.image, 'medium')}" 
                         alt="${album.name}" 
                         class="album-cover"
                         onerror="this.src='${this.config.defaultImage}'"
                         loading="lazy">
                    <div class="album-info">
                        <h3 class="album-title">
                            <a href="${album.url}" target="_blank">${album.name}</a>
                        </h3>
                        <p class="album-artist">${album.artist}</p>
                    </div>
                </article>
            `).join('');
        },

        /**
         * Renders track results
         * @param {Array} tracks - Array of track objects
         */
        renderTracks(tracks) {
            this.dom.trackList.innerHTML = tracks.map(track => `
                <article class="track-item">
                    <button class="play-btn" 
                            aria-label="Play" 
                            data-url="${track.url}"
                            data-title="${track.name}"
                            data-artist="${track.artist}">
                        <img src="${this.config.playIcon}" alt="Play">
                    </button>
                    <img src="${this.getImageUrl(track.image, 'medium')}" 
                         alt="${track.name}" 
                         class="track-art"
                         onerror="this.src='${this.config.defaultImage}'"
                         loading="lazy">
                    <div class="track-details">
                        <h3 class="track-title">${track.name}</h3>
                        <p class="track-artist">${track.artist}</p>
                    </div>
                    <button class="more-btn" aria-label="More options">
                        <img src="img/icons/arrow_small_right.png" alt="More">
                    </button>
                </article>
            `).join('');

            this.setupTrackInteractions();
        },

        /**
         * Sets up event listeners for track interactions
         */
        setupTrackInteractions() {
            document.querySelectorAll('.play-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    const url = btn.dataset.url;
                    const title = btn.dataset.title;
                    const artist = btn.dataset.artist;
                    
                    this.playTrack(url, title, artist);
                });
            });
        },

        /**
         * Handles playing a track
         * @param {string} url - Track URL
         * @param {string} title - Track title
         * @param {string} artist - Artist name
         */
        playTrack(url, title, artist) {
            console.log(`Playing: ${title} by ${artist}`);
            window.open(url, '_blank');
            
            // Could implement actual audio playback here
            // For now just opens the Last.fm page
        },

        /**
         * Gets image URL from array of images
         * @param {Array} images - Array of image objects
         * @param {string} size - Desired image size
         * @returns {string} Image URL
         */
        getImageUrl(images, size) {
            return images?.find(img => img.size === size)?.['#text'] || '';
        },

        /**
         * Shows "no results" message
         * @param {HTMLElement} element - Container element
         * @param {string} type - Type of content
         */
        showNoResults(element, type) {
            element.innerHTML = `
                <div class="no-results">
                    <p>No ${type} found for "${this.currentQuery}"</p>
                    <button class="retry-btn">Try Again</button>
                </div>
            `;
            
            element.querySelector('.retry-btn')?.addEventListener('click', () => {
                this.performSearch(this.currentQuery);
            });
        },

        /**
         * Shows error message
         * @param {HTMLElement} element - Container element
         * @param {string} type - Type of content
         * @param {Error} error - Error object
         */
        showError(element, type, error) {
            console.error(`Error searching ${type}:`, error);
            
            element.innerHTML = `
                <div class="error-message">
                    <p>Failed to load ${type}. Please check your connection.</p>
                    <button class="retry-btn">Retry</button>
                </div>
            `;
            
            element.querySelector('.retry-btn')?.addEventListener('click', () => {
                this.performSearch(this.currentQuery);
            });
        },

        /**
         * Formats large numbers with commas
         * @param {number} num - Number to format
         * @returns {string} Formatted number string
         */
        formatNumber(num) {
            return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        },

        /**
         * Loads search history from localStorage
         */
        loadSearchHistory() {
            const history = localStorage.getItem(this.config.searchHistoryKey);
            this.searchHistory = history ? JSON.parse(history) : [];
        },

        /**
         * Adds a query to search history
         * @param {string} query - Search query to add
         */
        addToSearchHistory(query) {
            // Remove if already exists
            this.searchHistory = this.searchHistory.filter(q => q !== query);
            
            // Add to beginning
            this.searchHistory.unshift(query);
            
            // Limit history size
            if (this.searchHistory.length > this.config.maxHistoryItems) {
                this.searchHistory.pop();
            }
            
            // Save to localStorage
            localStorage.setItem(
                this.config.searchHistoryKey,
                JSON.stringify(this.searchHistory)
            );
        }
    };

    // Initialize the application
    SearchApp.init();
});