/**
 * Utility Functions - Helper functions for the CO2 Meter
 * Website CO2 Meter - Enhanced with Benchmark Support
 */

const Utils = {
    icons: {
        imageIcon: '<img src="/images/image_icon.svg" alt="Afbeeldingen" class="bullet-icon">',
        bulletPoint: '<img src="/images/bullet_point_icon.svg" alt="CO2" class="bullet-icon">',
        greenHosting: '<img src="/images/groene_hosting.svg" alt="groene hosting" class="bullet-icon">',
        greyHosting: '<img src="/images/grijze_hosting.svg" alt="grijze hosting" class="bullet-icon">',
        co2: '<img src="/images/context_icon.svg" alt="CO2" class="bullet-icon">',
        pageIcon: '<img src="/images/context_icon_page_size.svg" alt="Pagina Icoon" class="bullet-icon">',
        DOMIcon: '<img src="/images/dom_icon.svg" alt="DOM" class="bullet-icon">',
        requestsIcon: '<img src="/images/requests_icon.svg" alt="Verzoeken" class="bullet-icon">',
        downArrow: '<img src="/images/down_arrows_icon.svg" alt="Daling" class="bullet-icon">',
    },
    
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
     * Get benchmark status color
     * @param {string} status - Benchmark status (excellent, good, average, poor)
     * @returns {string} CSS color value
     */
    getBenchmarkColor(status) {
        const colors = {
            'excellent': '#4CAF50',
            'good': '#66BB6A',
            'average': '#FFB74D',
            'poor': '#F06292'
        };
        return colors[status] || '#9E9E9E';
    },

    /**
     * Get benchmark status icon
     * @param {string} status - Benchmark status
     * @returns {string} Emoji icon
     */
    getBenchmarkIcon(status) {
        const icons = {
            'excellent': '🏆',
            'good': '✅',
            'average': '⚖️',
            'poor': '⚠️'
        };
        return icons[status] || '📊';
    },

    /**
     * Calculate percentage difference
     * @param {number} value - Current value
     * @param {number} reference - Reference value
     * @returns {Object} Percentage difference info
     */
    calculatePercentageDiff(value, reference) {
        const diff = ((value - reference) / reference) * 100;
        return {
            percentage: Math.round(Math.abs(diff)),
            isGood: diff < 0, // Lower is generally better
            direction: diff > 0 ? 'higher' : 'lower'
        };
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
     * Get environmental impact comparison with enhanced calculations
     * @param {number} co2Grams - CO2 in grams
     * @returns {Array} Array of comparison objects
     */
    getEnvironmentalComparison(co2Grams) {
        const comparisons = [
            {
                activity: 'autorijden',
                factor: 404, // 404g CO2 per km
                unit: 'km',
                icon: '🚗',
                description: 'Vergelijkbaar met autorijden'
            },
            {
                activity: 'smartphone opladen',
                factor: 8.5, // 8.5g CO2 per charge
                unit: 'x',
                icon: '📱',
                description: 'Keer je smartphone opladen'
            },
            {
                activity: 'kop koffie',
                factor: 21, // 21g CO2 per cup
                unit: 'koppen',
                icon: '☕',
                description: 'Koppen koffie zetten'
            },
            {
                activity: 'LED lamp',
                factor: 0.5, // 0.5g CO2 per hour
                unit: 'uur',
                icon: '💡',
                description: 'Uur LED lamp aan laten'
            },
            {
                activity: 'plastic zak',
                factor: 6, // 6g CO2 per plastic bag
                unit: 'zakken',
                icon: '🛍️',
                description: 'Plastic zakken produceren'
            }
        ];

        return comparisons.map(comp => {
            const value = Math.round((co2Grams / comp.factor) * 100) / 100;
            const displayValue = value < 0.01 ? '<0.01' : value;
            
            return {
                ...comp,
                value: displayValue,
                text: `${displayValue} ${comp.unit} ${comp.activity}`,
                fullDescription: `${displayValue} ${comp.description}`
            };
        });
    },

    /**
     * Get sustainability rating based on CO2 value
     * @param {number} co2Grams - CO2 in grams
     * @returns {Object} Sustainability rating
     */
    getSustainabilityRating(co2Grams) {
        if (co2Grams <= 1.0) {
            return { 
                rating: 'Uitstekend', 
                icon: '🌟', 
                color: '#4CAF50',
                description: 'Deze website heeft een zeer lage carbon footprint!' 
            };
        } else if (co2Grams <= 2.5) {
            return { 
                rating: 'Goed', 
                icon: '🌱', 
                color: '#8BC34A',
                description: 'Deze website heeft een goede carbon footprint.' 
            };
        } else if (co2Grams <= 4.6) {
            return { 
                rating: 'Gemiddeld', 
                icon: '🌿', 
                color: '#FFB74D',
                description: 'Deze website heeft een gemiddelde carbon footprint.' 
            };
        } else if (co2Grams <= 8.0) {
            return { 
                rating: 'Slecht', 
                icon: '⚠️', 
                color: '#FF9800',
                description: 'Deze website heeft een hoge carbon footprint.' 
            };
        } else {
            return { 
                rating: 'Zeer Slecht', 
                icon: '🚨', 
                color: '#F44336',
                description: 'Deze website heeft een zeer hoge carbon footprint!' 
            };
        }
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
    },

    /**
     * Format number with locale-specific formatting
     * @param {number} num - Number to format
     * @param {number} decimals - Number of decimal places
     * @returns {string} Formatted number
     */
    formatNumber(num, decimals = 2) {
        return new Intl.NumberFormat('nl-NL', {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals
        }).format(num);
    },

    /**
     * Get trend indicator based on comparison
     * @param {number} current - Current value
     * @param {number} reference - Reference value
     * @param {boolean} lowerIsBetter - Whether lower values are better
     * @returns {Object} Trend info
     */
    getTrendIndicator(current, reference, lowerIsBetter = true) {
        const diff = current - reference;
        const isPositiveTrend = lowerIsBetter ? diff < 0 : diff > 0;
        
        return {
            icon: isPositiveTrend ? '📈' : '📉',
            direction: diff > 0 ? 'up' : 'down',
            isGood: isPositiveTrend,
            percentage: Math.round(Math.abs((diff / reference) * 100))
        };
    },

    /**
     * Throttle function execution
     * @param {Function} func - Function to throttle
     * @param {number} limit - Time limit in milliseconds
     * @returns {Function} Throttled function
     */
    throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        }
    },

    /**
     * Check if device is mobile
     * @returns {boolean} True if mobile device
     */
    isMobile() {
        return window.innerWidth <= 768 || /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    },

    /**
     * Smooth scroll to element
     * @param {string|HTMLElement} target - Target element or selector
     * @param {number} offset - Offset from top in pixels
     */
    scrollTo(target, offset = 0) {
        const element = typeof target === 'string' ? document.querySelector(target) : target;
        if (element) {
            const elementPosition = element.offsetTop - offset;
            window.scrollTo({
                top: elementPosition,
                behavior: 'smooth'
            });
        }
    }
};