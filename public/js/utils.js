/**
 * Utility Functions - Helper functions for the CO2 Meter
 * Website CO2 Meter
 */

const Utils = {
    /**
     * Format file sizes in human readable format
     * @param {number} bytes - Size in bytes
     * @param {number} decimals - Number of decimal places
     * @returns {string} Formatted size
     */
    formatBytes(bytes, decimals = 2) {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    },

    /**
     * Format CO2 values with appropriate units
     * @param {number} grams - CO2 in grams
     * @returns {string} Formatted CO2 value
     */
    formatCO2(grams) {
        if (grams < 1) {
            return `${Math.round(grams * 1000)} mg CO2`;
        } else if (grams < 1000) {
            return `${Math.round(grams * 100) / 100} g CO2`;
        } else {
            return `${Math.round(grams / 10) / 100} kg CO2`;
        }
    },

    /**
     * Get grade color based on score
     * @param {string} grade - Grade letter (A+, A, B+, etc.)
     * @returns {string} CSS color value
     */
    getGradeColor(grade) {
        const colors = {
            'A+': '#4CAF50',
            'A': '#8BC34A',
            'B+': '#CDDC39',
            'B': '#FFEB3B',
            'C': '#FF9800',
            'D': '#F44336'
        };
        return colors[grade] || '#9E9E9E';
    },

    /**
     * Debounce function to limit API calls
     * @param {Function} func - Function to debounce
     * @param {number} wait - Wait time in milliseconds
     * @returns {Function} Debounced function
     */
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    /**
     * Show loading state
     * @param {HTMLElement} element - Element to show loading in
     * @param {string} message - Loading message
     */
    showLoading(element, message = 'Laden...') {
        element.innerHTML = `
            <div class="loading-state">
                <div class="loading-spinner">🔄</div>
                <p>${message}</p>
            </div>
        `;
    },

    /**
     * Sanitize HTML to prevent XSS
     * @param {string} str - String to sanitize
     * @returns {string} Sanitized string
     */
    sanitizeHTML(str) {
        const temp = document.createElement('div');
        temp.textContent = str;
        return temp.innerHTML;
    },

    /**
     * Generate unique ID
     * @returns {string} Unique ID
     */
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    },

    /**
     * Get environmental impact comparison
     * @param {number} co2Grams - CO2 in grams
     * @returns {Object} Comparison object
     */
    getEnvironmentalComparison(co2Grams) {
        const comparisons = [
            {
                activity: 'autorijden',
                factor: 404, // 404g CO2 per km
                unit: 'km',
                icon: '🚗'
            },
            {
                activity: 'smartphone opladen',
                factor: 8.5, // 8.5g CO2 per charge
                unit: 'x',
                icon: '📱'
            },
            {
                activity: 'kop koffie',
                factor: 21, // 21g CO2 per cup
                unit: 'koppen',
                icon: '☕'
            }
        ];

        return comparisons.map(comp => {
            const value = Math.round((co2Grams / comp.factor) * 100) / 100;
            return {
                ...comp,
                value: value,
                text: `${value} ${comp.unit} ${comp.activity}`
            };
        });
    },

    /**
     * Copy text to clipboard
     * @param {string} text - Text to copy
     * @returns {Promise<boolean>} Success status
     */
    async copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            return true;
        } catch (err) {
            console.error('Failed to copy text: ', err);
            return false;
        }
    },

    /**
     * Format URL for display (remove protocol, limit length)
     * @param {string} url - URL to format
     * @param {number} maxLength - Maximum length
     * @returns {string} Formatted URL
     */
    formatURLForDisplay(url, maxLength = 50) {
        let displayUrl = url.replace(/^https?:\/\//, '').replace(/\/$/, '');
        
        if (displayUrl.length > maxLength) {
            displayUrl = displayUrl.substring(0, maxLength - 3) + '...';
        }
        
        return displayUrl;
    }
};