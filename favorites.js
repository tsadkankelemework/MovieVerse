// Favorites management system using localStorage
class FavoritesManager {
    constructor() {
        // Key used to store favorites in localStorage
        this.storageKey = 'movieverse-favorites';
        
        // Load existing favorites from localStorage when the class is instantiated
        this.favorites = this.loadFavorites();
    }

    /**
     * Load favorites from localStorage
     * @returns {Array} - Array of favorite movie objects
     */
    loadFavorites() {
        try {
            // Get the favorites string from localStorage
            const favoritesJSON = localStorage.getItem(this.storageKey);
            
            // If no favorites exist, return empty array
            if (!favoritesJSON) {
                return [];
            }
            
            // Parse the JSON string back to an array
            const favorites = JSON.parse(favoritesJSON);
            
            // Ensure we return an array (in case of corrupted data)
            return Array.isArray(favorites) ? favorites : [];
            
        } catch (error) {
            // If there's an error parsing JSON, log it and return empty array
            console.error('Error loading favorites from localStorage:', error);
            return [];
        }
    }

    /**
     * Save favorites to localStorage
     */
    saveFavorites() {
        try {
            // Convert favorites array to JSON string and save to localStorage
            localStorage.setItem(this.storageKey, JSON.stringify(this.favorites));
        } catch (error) {
            // Log error if saving fails (e.g., localStorage is full or disabled)
            console.error('Error saving favorites to localStorage:', error);
        }
    }

    /**
     * Add a movie to favorites
     * @param {Object} movie - Movie object to add to favorites
     * @returns {boolean} - True if added successfully, false if already exists
     */
    addToFavorites(movie) {
        // Check if movie is already in favorites by comparing IMDb IDs
        const isAlreadyFavorite = this.favorites.some(fav => fav.imdbID === movie.imdbID);
        
        // If already in favorites, don't add again
        if (isAlreadyFavorite) {
            return false;
        }
        
        // Create a clean movie object with only necessary properties
        const favoriteMovie = {
            imdbID: movie.imdbID,
            Title: movie.Title,
            Year: movie.Year,
            Poster: movie.Poster,
            Type: movie.Type || 'movie'
        };
        
        // Add to favorites array
        this.favorites.push(favoriteMovie);
        
        // Save to localStorage
        this.saveFavorites();
        
        // Dispatch custom event to notify other parts of the app
        this.dispatchFavoritesUpdate();
        
        return true;
    }

    /**
     * Remove a movie from favorites
     * @param {string} imdbID - IMDb ID of the movie to remove
     * @returns {boolean} - True if removed successfully, false if not found
     */
    removeFromFavorites(imdbID) {
        // Find the index of the movie to remove
        const index = this.favorites.findIndex(movie => movie.imdbID === imdbID);
        
        // If movie not found in favorites
        if (index === -1) {
            return false;
        }
        
        // Remove the movie from favorites array
        this.favorites.splice(index, 1);
        
        // Save updated favorites to localStorage
        this.saveFavorites();
        
        // Dispatch custom event to notify other parts of the app
        this.dispatchFavoritesUpdate();
        
        return true;
    }

    /**
     * Check if a movie is in favorites
     * @param {string} imdbID - IMDb ID of the movie to check
     * @returns {boolean} - True if movie is in favorites
     */
    isFavorite(imdbID) {
        return this.favorites.some(movie => movie.imdbID === imdbID);
    }

    /**
     * Get all favorite movies
     * @returns {Array} - Array of favorite movie objects
     */
    getAllFavorites() {
        // Return a copy of the favorites array to prevent external modification
        return [...this.favorites];
    }

    /**
     * Get the count of favorite movies
     * @returns {number} - Number of movies in favorites
     */
    getFavoritesCount() {
        return this.favorites.length;
    }

    /**
     * Clear all favorites
     */
    clearAllFavorites() {
        // Empty the favorites array
        this.favorites = [];
        
        // Save empty array to localStorage
        this.saveFavorites();
        
        // Dispatch update event
        this.dispatchFavoritesUpdate();
    }

    /**
     * Dispatch a custom event when favorites are updated
     * This allows other parts of the app to react to favorites changes
     */
    dispatchFavoritesUpdate() {
        // Create and dispatch a custom event
        const event = new CustomEvent('favoritesUpdated', {
            detail: {
                favorites: this.getAllFavorites(),
                count: this.getFavoritesCount()
            }
        });
        
        // Dispatch the event on the document so any part of the app can listen
        document.dispatchEvent(event);
    }

    /**
     * Export favorites as JSON (for backup or sharing)
     * @returns {string} - JSON string of all favorites
     */
    exportFavorites() {
        return JSON.stringify(this.favorites, null, 2);
    }

    /**
     * Import favorites from JSON string
     * @param {string} jsonString - JSON string containing favorites data
     * @returns {boolean} - True if import was successful
     */
    importFavorites(jsonString) {
        try {
            // Parse the JSON string
            const importedFavorites = JSON.parse(jsonString);
            
            // Validate that it's an array
            if (!Array.isArray(importedFavorites)) {
                throw new Error('Invalid favorites format');
            }
            
            // Validate each movie object has required properties
            const validFavorites = importedFavorites.filter(movie => 
                movie.imdbID && movie.Title && movie.Year
            );
            
            // Replace current favorites with imported ones
            this.favorites = validFavorites;
            
            // Save to localStorage
            this.saveFavorites();
            
            // Dispatch update event
            this.dispatchFavoritesUpdate();
            
            return true;
            
        } catch (error) {
            console.error('Error importing favorites:', error);
            return false;
        }
    }
}

// Create a global instance of the FavoritesManager
// This allows other files to use the same favorites manager
const favoritesManager = new FavoritesManager();