// // API configuration and functions for interacting with OMDb API
// class MovieAPI {
//     constructor() {
//         // OMDb API base URL - you'll need to get a free API key from http://www.omdbapi.com/
//         this.baseURL = 'https://www.omdbapi.com/';
//         // Replace 'YOUR_API_KEY' with your actual OMDb API key
//         this.apiKey = 'YOUR_API_KEY'; // Get free key from http://www.omdbapi.com/
        
//         // If no API key is provided, use demo key (limited requests)
//         if (this.apiKey === 'YOUR_API_KEY') {
//             console.warn('Please get your free API key from http://www.omdbapi.com/ and replace YOUR_API_KEY in api.js');
//             // Demo key for testing - very limited requests
//             this.apiKey = 'trilogy';
//         }
//     }

//     /**
//      * Search for movies by title with pagination support
//      * @param {string} query - The movie title to search for
//      * @param {number} page - Page number for pagination (default: 1)
//      * @returns {Promise<Object>} - Promise that resolves to search results
//      */
//     async searchMovies(query, page = 1) {
//         try {
//             // Construct the API URL with search parameters
//             const url = `${this.baseURL}?apikey=${this.apiKey}&s=${encodeURIComponent(query)}&page=${page}&type=movie`;
            
//             // Make the API request using fetch
//             const response = await fetch(url);
            
//             // Check if the HTTP request was successful
//             if (!response.ok) {
//                 throw new Error(`HTTP error! status: ${response.status}`);
//             }
            
//             // Parse the JSON response
//             const data = await response.json();
            
//             // Check if the API returned an error
//             if (data.Response === 'False') {
//                 throw new Error(data.Error || 'Failed to fetch movies');
//             }
            
//             // Return the successful response data
//             return {
//                 movies: data.Search || [], // Array of movie results
//                 totalResults: parseInt(data.totalResults) || 0, // Total number of results
//                 currentPage: page // Current page number
//             };
            
//         } catch (error) {
//             // Log the error for debugging
//             console.error('Error searching movies:', error);
            
//             // Re-throw the error so calling code can handle it
//             throw error;
//         }
//     }

//     /**
//      * Get detailed information about a specific movie by its IMDb ID
//      * @param {string} imdbID - The IMDb ID of the movie
//      * @returns {Promise<Object>} - Promise that resolves to detailed movie data
//      */
//     async getMovieDetails(imdbID) {
//         try {
//             // Construct the API URL for getting movie details
//             const url = `${this.baseURL}?apikey=${this.apiKey}&i=${imdbID}&plot=full`;
            
//             // Make the API request
//             const response = await fetch(url);
            
//             // Check if the HTTP request was successful
//             if (!response.ok) {
//                 throw new Error(`HTTP error! status: ${response.status}`);
//             }
            
//             // Parse the JSON response
//             const data = await response.json();
            
//             // Check if the API returned an error
//             if (data.Response === 'False') {
//                 throw new Error(data.Error || 'Failed to fetch movie details');
//             }
            
//             // Return the movie details
//             return data;
            
//         } catch (error) {
//             // Log the error for debugging
//             console.error('Error fetching movie details:', error);
            
//             // Re-throw the error so calling code can handle it
//             throw error;
//         }
//     }

//     /**
//      * Validate if the API key is working by making a test request
//      * @returns {Promise<boolean>} - Promise that resolves to true if API key is valid
//      */
//     async validateAPIKey() {
//         try {
//             // Make a simple test request
//             const response = await fetch(`${this.baseURL}?apikey=${this.apiKey}&s=test&page=1`);
//             const data = await response.json();
            
//             // Check if we get a valid response (even if no results)
//             return response.ok && data.Response !== undefined;
            
//         } catch (error) {
//             console.error('API key validation failed:', error);
//             return false;
//         }
//     }
// }

// // Create a global instance of the MovieAPI class
// // This allows other files to use the same API instance
// const movieAPI = new MovieAPI();