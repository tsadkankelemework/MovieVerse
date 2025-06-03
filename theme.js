// Theme management system for dark/light mode switching
class ThemeManager {
    constructor() {
        // Key used to store theme preference in localStorage
        this.storageKey = 'movieverse-theme';
        
        // Get references to theme-related DOM elements
        this.themeSwitch = document.getElementById('theme-switch');
        this.body = document.body;
        
        // Initialize the theme system
        this.init();
    }

    /**
     * Initialize the theme system
     * Load saved theme preference and set up event listeners
     */
    init() {
        // Load the saved theme preference
        const savedTheme = this.getSavedTheme();
        
        // Apply the saved theme (or default to light)
        this.applyTheme(savedTheme);
        
        // Set up the theme switch event listener
        this.setupEventListeners();
        
        // Listen for system theme changes (if user changes OS theme)
        this.setupSystemThemeListener();
    }

    /**
     * Get the saved theme from localStorage
     * @returns {string} - 'dark' or 'light'
     */
    getSavedTheme() {
        try {
            // Get theme from localStorage
            const savedTheme = localStorage.getItem(this.storageKey);
            
            // If no saved theme, detect system preference
            if (!savedTheme) {
                return this.getSystemTheme();
            }
            
            // Return saved theme if it's valid
            return savedTheme === 'dark' ? 'dark' : 'light';
            
        } catch (error) {
            // If localStorage is not available, use system theme
            console.error('Error loading theme preference:', error);
            return this.getSystemTheme();
        }
    }

    /**
     * Detect the system's preferred theme
     * @returns {string} - 'dark' or 'light'
     */
    getSystemTheme() {
        // Check if browser supports prefers-color-scheme media query
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            return 'dark';
        }
        return 'light';
    }

    /**
     * Apply a theme to the page
     * @param {string} theme - 'dark' or 'light'
     */
    applyTheme(theme) {
        if (theme === 'dark') {
            // Add dark theme class to body
            this.body.classList.add('dark-theme');
            // Update theme switch to checked state
            this.themeSwitch.checked = true;
        } else {
            // Remove dark theme class from body (defaults to light theme)
            this.body.classList.remove('dark-theme');
            // Update theme switch to unchecked state
            this.themeSwitch.checked = false;
        }
        
        // Save the theme preference
        this.saveTheme(theme);
        
        // Dispatch custom event for theme change
        this.dispatchThemeChange(theme);
    }

    /**
     * Save theme preference to localStorage
     * @param {string} theme - 'dark' or 'light'
     */
    saveTheme(theme) {
        try {
            localStorage.setItem(this.storageKey, theme);
        } catch (error) {
            console.error('Error saving theme preference:', error);
        }
    }

    /**
     * Toggle between dark and light themes
     */
    toggleTheme() {
        // Get current theme by checking if dark theme class exists
        const currentTheme = this.body.classList.contains('dark-theme') ? 'dark' : 'light';
        
        // Switch to opposite theme
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        // Apply the new theme
        this.applyTheme(newTheme);
    }

    /**
     * Get the current active theme
     * @returns {string} - 'dark' or 'light'
     */
    getCurrentTheme() {
        return this.body.classList.contains('dark-theme') ? 'dark' : 'light';
    }

    /**
     * Set up event listeners for theme switching
     */
    setupEventListeners() {
        // Add click event listener to theme switch
        if (this.themeSwitch) {
            this.themeSwitch.addEventListener('change', () => {
                // Toggle theme when switch is clicked
                this.toggleTheme();
            });
        }
        
        // Add keyboard support for theme switching (Ctrl/Cmd + Shift + T)
        document.addEventListener('keydown', (event) => {
            // Check for Ctrl+Shift+T (Windows/Linux) or Cmd+Shift+T (Mac)
            if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'T') {
                event.preventDefault(); // Prevent default browser behavior
                this.toggleTheme();
            }
        });
    }

    /**
     * Listen for system theme changes and update accordingly
     */
    setupSystemThemeListener() {
        // Check if browser supports matchMedia
        if (window.matchMedia) {
            // Create media query for dark theme preference
            const darkThemeQuery = window.matchMedia('(prefers-color-scheme: dark)');
            
            // Add listener for changes in system theme preference
            darkThemeQuery.addEventListener('change', (event) => {
                // Only auto-switch if user hasn't manually set a preference
                const savedTheme = localStorage.getItem(this.storageKey);
                
                // If no manual preference is saved, follow system theme
                if (!savedTheme) {
                    const systemTheme = event.matches ? 'dark' : 'light';
                    this.applyTheme(systemTheme);
                }
            });
        }
    }

    /**
     * Dispatch custom event when theme changes
     * @param {string} theme - The new theme ('dark' or 'light')
     */
    dispatchThemeChange(theme) {
        // Create custom event with theme information
        const event = new CustomEvent('themeChanged', {
            detail: {
                theme: theme,
                isDark: theme === 'dark'
            }
        });
        
        // Dispatch event on document so other parts of app can listen
        document.dispatchEvent(event);
    }

    /**
     * Reset theme to system default
     */
    resetToSystemTheme() {
        // Remove saved preference
        try {
            localStorage.removeItem(this.storageKey);
        } catch (error) {
            console.error('Error removing theme preference:', error);
        }
        
        // Apply system theme
        const systemTheme = this.getSystemTheme();
        this.applyTheme(systemTheme);
    }

    /**
     * Check if dark theme is currently active
     * @returns {boolean} - True if dark theme is active
     */
    isDarkTheme() {
        return this.getCurrentTheme() === 'dark';
    }

    /**
     * Force set a specific theme (useful for testing or admin controls)
     * @param {string} theme - 'dark' or 'light'
     */
    setTheme(theme) {
        if (theme === 'dark' || theme === 'light') {
            this.applyTheme(theme);
        } else {
            console.error('Invalid theme. Use "dark" or "light".');
        }
    }
}

// Initialize theme manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Create global instance of ThemeManager
    window.themeManager = new ThemeManager();
});