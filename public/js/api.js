/**
 * API Module - Handles all API calls and data fetching
 * Website CO2 Meter
 */

const API = {
    /**
     * Base URL for API calls (empty for relative paths)
     */
    baseURL: '',

    /**
     * Analyze a website's CO2 footprint
     * @param {string} url - The website URL to analyze
     * @returns {Promise<Object>} Analysis results
     */
    async analyzeWebsite(url) {
        try {
            const response = await fetch(`${this.baseURL}/api/analyze`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ url: url })
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            
            // Validate response data
            if (!data.url || data.co2PerVisit === undefined) {
                throw new Error('Invalid response data from server');
            }

            return data;
            
        } catch (error) {
            console.error('API Error:', error);
            
            // Provide user-friendly error messages
            if (error.message.includes('Failed to fetch')) {
                throw new Error('Geen internetverbinding. Controleer je verbinding en probeer opnieuw.');
            } else if (error.message.includes('HTTP 4')) {
                throw new Error('Ongeldige aanvraag. Controleer of de URL correct is.');
            } else if (error.message.includes('HTTP 5')) {
                throw new Error('Server probleem. Probeer het later opnieuw.');
            } else {
                throw error;
            }
        }
    },

    /**
     * Validate and format URL
     * @param {string} url - Raw URL input
     * @returns {string} Formatted URL
     */
    formatURL(url) {
        if (!url) {
            throw new Error('URL is verplicht');
        }

        // Remove whitespace
        url = url.trim();
        
        // Add protocol if missing
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
            url = 'https://' + url;
        }

        // Basic URL validation
        try {
            new URL(url);
            return url;
        } catch (error) {
            throw new Error('Ongeldige URL format. Gebruik bijvoorbeeld: https://example.com');
        }
    },

    /**
     * Health check endpoint (future use)
     * @returns {Promise<boolean>} Server health status
     */
    async healthCheck() {
        try {
            const response = await fetch(`${this.baseURL}/health`);
            return response.ok;
        } catch (error) {
            console.warn('Health check failed:', error);
            return false;
        }
    }
};