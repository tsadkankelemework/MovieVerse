// Import necessary modules (assuming these are in separate files)
import { movieAPI } from './api.js';
import { favoritesManager } from './favorites.js';

// Main application logic for MovieVerse
class MovieVerse {
    constructor() {
        // Application state
        this.currentSearchQuery = '';
        this.currentPage = 1;
        this.totalResults = 0;
        this.isLoading = false;
        this.searchResults = [];
        
        // DOM element references
        this.searchForm = document.getElementById('search-form');
        this.searchInput = document.getElementById('search-input');
        this.moviesGrid = document.getElementById('movies-grid');
        this.favoritesGrid = document.getElementById('favorites-grid');
        this.loadingElement = document.getElementById('loading');
        this.errorMessage = document.getElementById('error-message');
        this.errorText = document.getElementById('error-text');
        this.loadMoreBtn = document.getElementById('load-more-btn');
        this.loadMoreSection = document.getElementById('load-more-section');
        this.resultsHeader = document.getElementById('results-header');
        this.resultsTitle = document.getElementById('results-title');
        this.resultsCount = document.getElementById('results-count');
        this.favoritesCount = document.getElementById('favorites-count');
        this.emptyFavorites = document.getElementById('empty-favorites');
        this.modal = document.getElementById('movie-modal');
        this.modalTitle = document.getElementById('modal-title');
        this.modalBody = document.getElementById('modal-body');
        this.closeModalBtn = document.getElementById('close-modal');
        
        // Tab elements
        this.tabButtons = document.querySelectorAll('.tab-btn');
        this.tabContents = document.querySelectorAll('.tab-content');
        
        // Initialize the application
        this.init();
    }

    /**
     * Initialize the application
     * Set up event listeners and load initial data
     */
    init() {
        // Set up all event listeners
        this.setupEventListeners();
        
        // Update favorites count on page load
        this.updateFavoritesCount();
        
        // Load and display favorites
        this.displayFavorites();
        
        // Focus on search input for better UX
        this.searchInput.focus();
        
        console.log('MovieVerse initialized successfully!');
    }

    /**
     * Set up all event listeners for the application
     */
    setupEventListeners() {
        // Search form submission
        this.searchForm.addEventListener('submit', (e) => {
            e.preventDefault(); // Prevent default form submission
            this.handleSearch();
        });

        // Load more button click
        this.loadMoreBtn.addEventListener('click', () => {
            this.loadMoreMovies();
        });

        // Tab switching
        this.tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                const tabName = button.getAttribute('data-tab');
                this.switchTab(tabName);
            });
        });

        // Modal close events
        this.closeModalBtn.addEventListener('click', () => {
            this.closeModal();
        });

        // Close modal when clicking outside of it
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.closeModal();
            }
        });

        // Close modal with Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.modal.style.display === 'block') {
                this.closeModal();
            }
        });

        // Listen for favorites updates
        document.addEventListener('favoritesUpdated', (e) => {
            this.updateFavoritesCount();
            this.displayFavorites();
            // Update favorite buttons in search results
            this.updateFavoriteButtons();
        });

        // Handle search input changes for better UX
        this.searchInput.addEventListener('input', (e) => {
            // Clear previous search results if input is empty
            if (e.target.value.trim() === '') {
                this.clearSearchResults();
            }
        });
    }

    /**
     * Handle search form submission
     */
    async handleSearch() {
        // Get search query and trim whitespace
        const query = this.searchInput.value.trim();
        
        // Validate search query
        if (!query) {
            this.showError('Please enter a movie title to search.');
            return;
        }

        // Reset search state for new search
        this.currentSearchQuery = query;
        this.currentPage = 1;
        this.searchResults = [];
        
        // Clear previous results and errors
        this.clearSearchResults();
        this.hideError();
        
        // Perform the search
        await this.searchMovies(query, 1);
    }

    /**
     * Search for movies using the API
     * @param {string} query - Search query
     * @param {number} page - Page number
     */
    async searchMovies(query, page) {
        // Prevent multiple simultaneous searches
        if (this.isLoading) return;
        
        try {
            // Set loading state
            this.setLoading(true);
            
            // Call the API to search for movies
            const result = await movieAPI.searchMovies(query, page);
            
            // Update application state
            this.totalResults = result.totalResults;
            this.currentPage = page;
            
            // Add new results to existing results (for pagination)
            if (page === 1) {
                this.searchResults = result.movies;
            } else {
                this.searchResults = [...this.searchResults, ...result.movies];
            }
            
            // Display the results
            this.displaySearchResults();
            
            // Update UI elements
            this.updateResultsHeader(query, this.totalResults);
            this.updateLoadMoreButton();
            
        } catch (error) {
            // Handle and display errors
            console.error('Search error:', error);
            this.showError(error.message || 'Failed to search movies. Please try again.');
        } finally {
            // Always clear loading state
            this.setLoading(false);
        }
    }

    /**
     * Load more movies (pagination)
     */
    async loadMoreMovies() {
        if (this.isLoading || !this.currentSearchQuery) return;
        
        const nextPage = this.currentPage + 1;
        await this.searchMovies(this.currentSearchQuery, nextPage);
    }

    /**
     * Display search results in the grid
     */
    displaySearchResults() {
        // Clear existing results if this is the first page
        if (this.currentPage === 1) {
            this.moviesGrid.innerHTML = '';
        }
        
        // Create movie cards for each result
        this.searchResults.slice((this.currentPage - 1) * 10).forEach(movie => {
            const movieCard = this.createMovieCard(movie);
            this.moviesGrid.appendChild(movieCard);
        });
        
        // Show results header
        this.resultsHeader.style.display = 'block';
    }

    /**
     * Create a movie card element
     * @param {Object} movie - Movie data object
     * @returns {HTMLElement} - Movie card DOM element
     */
    createMovieCard(movie) {
        // Create main card container
        const card = document.createElement('div');
        card.className = 'movie-card';
        
        // Check if movie is in favorites
        const isFavorite = favoritesManager.isFavorite(movie.imdbID);
        
        // Create card HTML content
        card.innerHTML = `
            <img 
                src="${movie.Poster !== 'N/A' ? movie.Poster : '/placeholder.svg?height=400&width=300'}" 
                alt="${movie.Title} poster"
                class="movie-poster"
                onerror="this.src='/placeholder.svg?height=400&width=300'"
            >
            <div class="movie-info">
                <h3 class="movie-title">${movie.Title}</h3>
                <p class="movie-year">${movie.Year}</p>
                <div class="movie-actions">
                    <button class="btn btn-primary details-btn" data-imdb-id="${movie.imdbID}">
                        <i class="fas fa-info-circle"></i>
                        Details
                    </button>
                    <button class="btn btn-secondary favorite-btn ${isFavorite ? 'favorited' : ''}" 
                            data-imdb-id="${movie.imdbID}">
                        <i class="fas fa-heart"></i>
                        ${isFavorite ? 'Favorited' : 'Add to Favorites'}
                    </button>
                </div>
            </div>
        `;
        
        // Add event listeners to buttons
        const detailsBtn = card.querySelector('.details-btn');
        const favoriteBtn = card.querySelector('.favorite-btn');
        
        // Details button click handler
        detailsBtn.addEventListener('click', () => {
            this.showMovieDetails(movie.imdbID);
        });
        
        // Favorite button click handler
        favoriteBtn.addEventListener('click', () => {
            this.toggleFavorite(movie, favoriteBtn);
        });
        
        return card;
    }

    /**
     * Toggle favorite status of a movie
     * @param {Object} movie - Movie object
     * @param {HTMLElement} button - Favorite button element
     */
    toggleFavorite(movie, button) {
        const isFavorite = favoritesManager.isFavorite(movie.imdbID);
        
        if (isFavorite) {
            // Remove from favorites
            const removed = favoritesManager.removeFromFavorites(movie.imdbID);
            if (removed) {
                button.classList.remove('favorited');
                button.innerHTML = '<i class="fas fa-heart"></i> Add to Favorites';
                this.showToast('Removed from favorites', 'success');
            }
        } else {
            // Add to favorites
            const added = favoritesManager.addToFavorites(movie);
            if (added) {
                button.classList.add('favorited');
                button.innerHTML = '<i class="fas fa-heart"></i> Favorited';
                this.showToast('Added to favorites', 'success');
            }
        }
    }

    /**
     * Show detailed information about a movie in a modal
     * @param {string} imdbID - IMDb ID of the movie
     */
    async showMovieDetails(imdbID) {
        try {
            // Show loading in modal
            this.modalTitle.textContent = 'Loading...';
            this.modalBody.innerHTML = '<div class="loading"><div class="spinner"></div><p>Loading movie details...</p></div>';
            this.openModal();
            
            // Fetch detailed movie information
            const movieDetails = await movieAPI.getMovieDetails(imdbID);
            
            // Update modal with movie details
            this.modalTitle.textContent = movieDetails.Title;
            this.modalBody.innerHTML = this.createMovieDetailsHTML(movieDetails);
            
        } catch (error) {
            console.error('Error fetching movie details:', error);
            this.modalTitle.textContent = 'Error';
            this.modalBody.innerHTML = `
                <div class="error-message" style="display: block;">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>Failed to load movie details. Please try again.</p>
                </div>
            `;
        }
    }

    /**
     * Create HTML content for movie details modal
     * @param {Object} movie - Detailed movie object
     * @returns {string} - HTML string for modal content
     */
    createMovieDetailsHTML(movie) {
        return `
            <div class="movie-details">
                <img 
                    src="${movie.Poster !== 'N/A' ? movie.Poster : '/placeholder.svg?height=400&width=300'}" 
                    alt="${movie.Title} poster"
                    onerror="this.src='/placeholder.svg?height=400&width=300'"
                >
                <div class="movie-meta">
                    <div>
                        <h3>Plot</h3>
                        <p>${movie.Plot !== 'N/A' ? movie.Plot : 'No plot available.'}</p>
                    </div>
                    
                    <div>
                        <h3>Details</h3>
                        <p><strong>Year:</strong> ${movie.Year}</p>
                        <p><strong>Genre:</strong> ${movie.Genre !== 'N/A' ? movie.Genre : 'Unknown'}</p>
                        <p><strong>Director:</strong> ${movie.Director !== 'N/A' ? movie.Director : 'Unknown'}</p>
                        <p><strong>Cast:</strong> ${movie.Actors !== 'N/A' ? movie.Actors : 'Unknown'}</p>
                        <p><strong>Runtime:</strong> ${movie.Runtime !== 'N/A' ? movie.Runtime : 'Unknown'}</p>
                        <p><strong>Language:</strong> ${movie.Language !== 'N/A' ? movie.Language : 'Unknown'}</p>
                        <p><strong>Country:</strong> ${movie.Country !== 'N/A' ? movie.Country : 'Unknown'}</p>
                    </div>
                    
                    ${movie.imdbRating !== 'N/A' ? `
                        <div>
                            <h3>Rating</h3>
                            <span class="rating-badge">IMDb: ${movie.imdbRating}/10</span>
                        </div>
                    ` : ''}
                    
                    ${movie.Awards !== 'N/A' ? `
                        <div>
                            <h3>Awards</h3>
                            <p>${movie.Awards}</p>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    }

    /**
     * Display favorite movies in the favorites tab
     */
    displayFavorites() {
        const favorites = favoritesManager.getAllFavorites();
        
        // Clear existing favorites display
        this.favoritesGrid.innerHTML = '';
        
        if (favorites.length === 0) {
            // Show empty state
            this.emptyFavorites.style.display = 'block';
            this.favoritesGrid.style.display = 'none';
        } else {
            // Hide empty state and show favorites
            this.emptyFavorites.style.display = 'none';
            this.favoritesGrid.style.display = 'grid';
            
            // Create cards for each favorite movie
            favorites.forEach(movie => {
                const movieCard = this.createFavoriteMovieCard(movie);
                this.favoritesGrid.appendChild(movieCard);
            });
        }
    }

    /**
     * Create a movie card for the favorites section
     * @param {Object} movie - Movie data object
     * @returns {HTMLElement} - Movie card DOM element
     */
    createFavoriteMovieCard(movie) {
        const card = document.createElement('div');
        card.className = 'movie-card';
        
        card.innerHTML = `
            <img 
                src="${movie.Poster !== 'N/A' ? movie.Poster : '/placeholder.svg?height=400&width=300'}" 
                alt="${movie.Title} poster"
                class="movie-poster"
                onerror="this.src='/placeholder.svg?height=400&width=300'"
            >
            <div class="movie-info">
                <h3 class="movie-title">${movie.Title}</h3>
                <p class="movie-year">${movie.Year}</p>
                <div class="movie-actions">
                    <button class="btn btn-primary details-btn" data-imdb-id="${movie.imdbID}">
                        <i class="fas fa-info-circle"></i>
                        Details
                    </button>
                    <button class="btn btn-secondary remove-btn" data-imdb-id="${movie.imdbID}">
                        <i class="fas fa-trash"></i>
                        Remove
                    </button>
                </div>
            </div>
        `;
        
        // Add event listeners
        const detailsBtn = card.querySelector('.details-btn');
        const removeBtn = card.querySelector('.remove-btn');
        
        detailsBtn.addEventListener('click', () => {
            this.showMovieDetails(movie.imdbID);
        });
        
        removeBtn.addEventListener('click', () => {
            this.removeFavorite(movie.imdbID);
        });
        
        return card;
    }

    /**
     * Remove a movie from favorites
     * @param {string} imdbID - IMDb ID of the movie to remove
     */
    removeFavorite(imdbID) {
        const removed = favoritesManager.removeFromFavorites(imdbID);
        if (removed) {
            this.showToast('Removed from favorites', 'success');
        }
    }

    /**
     * Switch between tabs (Search and Favorites)
     * @param {string} tabName - Name of the tab to switch to
     */
    switchTab(tabName) {
        // Remove active class from all tabs and contents
        this.tabButtons.forEach(btn => btn.classList.remove('active'));
        this.tabContents.forEach(content => content.classList.remove('active'));
        
        // Add active class to selected tab and content
        const activeTabBtn = document.querySelector(`[data-tab="${tabName}"]`);
        const activeTabContent = document.getElementById(`${tabName}-tab`);
        
        if (activeTabBtn && activeTabContent) {
            activeTabBtn.classList.add('active');
            activeTabContent.classList.add('active');
        }
        
        // If switching to favorites tab, refresh the display
        if (tabName === 'favorites') {
            this.displayFavorites();
        }
    }

    /**
     * Update the favorites count in the tab button
     */
    updateFavoritesCount() {
        const count = favoritesManager.getFavoritesCount();
        this.favoritesCount.textContent = count;
    }

    /**
     * Update favorite buttons in search results after favorites change
     */
    updateFavoriteButtons() {
        const favoriteButtons = document.querySelectorAll('.favorite-btn');
        favoriteButtons.forEach(button => {
            const imdbID = button.getAttribute('data-imdb-id');
            const isFavorite = favoritesManager.isFavorite(imdbID);
            
            if (isFavorite) {
                button.classList.add('favorited');
                button.innerHTML = '<i class="fas fa-heart"></i> Favorited';
            } else {
                button.classList.remove('favorited');
                button.innerHTML = '<i class="fas fa-heart"></i> Add to Favorites';
            }
        });
    }

    /**
     * Update the results header with search information
     * @param {string} query - Search query
     * @param {number} totalResults - Total number of results
     */
    updateResultsHeader(query, totalResults) {
        this.resultsTitle.textContent = `Search Results for "${query}"`;
        this.resultsCount.textContent = `Found ${totalResults} movie${totalResults !== 1 ? 's' : ''}`;
    }

    /**
     * Update the load more button visibility and state
     */
    updateLoadMoreButton() {
        const totalPages = Math.ceil(this.totalResults / 10);
        const hasMorePages = this.currentPage < totalPages;
        
        if (hasMorePages && this.totalResults > 10) {
            this.loadMoreSection.style.display = 'block';
            this.loadMoreBtn.textContent = `Load More (${this.totalResults - (this.currentPage * 10)} remaining)`;
        } else {
            this.loadMoreSection.style.display = 'none';
        }
    }

    /**
     * Set loading state
     * @param {boolean} loading - Whether app is in loading state
     */
    setLoading(loading) {
        this.isLoading = loading;
        
        if (loading) {
            this.loadingElement.style.display = 'block';
            this.loadMoreBtn.disabled = true;
            this.loadMoreBtn.textContent = 'Loading...';
        } else {
            this.loadingElement.style.display = 'none';
            this.loadMoreBtn.disabled = false;
        }
    }

    /**
     * Show error message
     * @param {string} message - Error message to display
     */
    showError(message) {
        this.errorText.textContent = message;
        this.errorMessage.style.display = 'block';
        
        // Auto-hide error after 5 seconds
        setTimeout(() => {
            this.hideError();
        }, 5000);
    }

    /**
     * Hide error message
     */
    hideError() {
        this.errorMessage.style.display = 'none';
    }

    /**
     * Clear search results and related UI elements
     */
    clearSearchResults() {
        this.moviesGrid.innerHTML = '';
        this.resultsHeader.style.display = 'none';
        this.loadMoreSection.style.display = 'none';
        this.searchResults = [];
        this.currentPage = 1;
        this.totalResults = 0;
    }

    /**
     * Open the movie details modal
     */
    openModal() {
        this.modal.style.display = 'block';
        document.body.style.overflow = 'hidden'; // Prevent background scrolling
    }

    /**
     * Close the movie details modal
     */
    closeModal() {
        this.modal.style.display = 'none';
        document.body.style.overflow = 'auto'; // Restore scrolling
    }

    /**
     * Show a toast notification
     * @param {string} message - Message to display
     * @param {string} type - Type of toast ('success', 'error', 'info')
     */
    showToast(message, type = 'info') {
        // Create toast element
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        
        // Style the toast
        Object.assign(toast.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            background: type === 'success' ? '#27ae60' : type === 'error' ? '#e74c3c' : '#3498db',
            color: 'white',
            padding: '15px 20px',
            borderRadius: '8px',
            zIndex: '10000',
            boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
            transform: 'translateX(100%)',
            transition: 'transform 0.3s ease'
        });
        
        // Add toast to page
        document.body.appendChild(toast);
        
        // Animate in
        setTimeout(() => {
            toast.style.transform = 'translateX(0)';
        }, 100);
        
        // Remove toast after 3 seconds
        setTimeout(() => {
            toast.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }, 3000);
    }
}

// Initialize the application when DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    // Create global instance of MovieVerse application
    window.movieVerse = new MovieVerse();
    
    // Add some helpful console messages for developers
    console.log('🎬 MovieVerse App Loaded Successfully!');
    console.log('💡 Tip: Press Ctrl+Shift+T (or Cmd+Shift+T on Mac) to toggle theme');
    console.log('🔧 Don\'t forget to add your OMDb API key in api.js for full functionality');
});

// Handle any unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
    
    // Show user-friendly error message
    if (window.movieVerse) {
        window.movieVerse.showError('Something went wrong. Please try again.');
    }
    
    // Prevent the default browser error handling
    event.preventDefault();
});

// Add service worker registration for PWA capabilities (optional enhancement)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        // This would register a service worker if you create one
        // navigator.serviceWorker.register('/sw.js')
        //     .then(registration => console.log('SW registered'))
        //     .catch(error => console.log('SW registration failed'));
    });
}
