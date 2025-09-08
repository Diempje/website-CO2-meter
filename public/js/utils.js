/**
 * Utility Functions - PERFORMANCE OPTIMIZED
 * Alleen code verbeteringen - alle styling/icons ONGEWIJZIGD
 */

const Utils = {
    // ORIGINAL icons - EXACTLY as they were
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
        benchmarkIcon: '<img src="/images/benchmark_icon.svg" alt="Benchmark" class="bullet-icon">',
        excellentIcon: '<img src="/images/excellent_icon.svg" alt="Uitstekend" class="bullet-icon">',
        goodIcon: '<img src="/images/checkmark_icon.svg" alt="Goed" class="bullet-icon">',
        averageIcon: '<img src="/images/average_icon.svg" alt="Gemiddeld" class="bullet-icon">',
        poorIcon: '<img src="/images/poor_icon.svg" alt="Slecht" class="bullet-icon">',
        impactIcon: '<img src="/images/jaarlijkse_impact_icon.svg" alt="Impact" class="bullet-icon">',
        carIcon: '<img src="/images/car_icon.svg" alt="Auto" class="benchmark-icon">',
        phoneIcon: '<img src="/images/phone_icon.svg" alt="Telefoon" class="benchmark-icon">',
        coffeeIcon: '<img src="/images/coffee_icon.svg" alt="Koffie" class="benchmark-icon">',
        ledIcon: '<img src="/images/led_icon.svg" alt="LED" class="benchmark-icon">',
        bagIcon: '<img src="/images/bag_icon.svg" alt="Tas" class="benchmark-icon">',
        treeIcon: '<img src="/images/tree_icon.svg" alt="Boom" class="benchmark-icon">',
        shareIcon: '<img src="/images/share_icon.svg" alt="Delen" class="bullet-icon">',
        analyseerIcon: '<img src="/images/analyse_icon.svg" alt="Analyseer" class="bullet-icon">',
        loadingIcon: '<img src="/images/analyse_icon.svg" alt="Analyseren" class="loading-icon">',
        upGraphIcon: '<img src="/images/up_graph_icon.svg" alt="Verbetering" class="bullet-icon">'
    },

    // ORIGINAL climate tips - EXACTLY as they were
    climateTips: [
        "Wist je dat websites verantwoordelijk zijn voor 4% van de wereldwijde CO2 uitstoot?",
        "Een gemiddelde website produceert 4.6g CO2 per pageview",
        "Groene hosting kan de CO2 impact van je website met 60% verminderen",
        "Het optimaliseren van afbeeldingen kan tot 50% minder data verbruik opleveren",
        "Mobiele optimalisatie is cruciaal - mobiel internet verbruikt 3x meer energie",
        "Het verwijderen van ongebruikte code kan de laadtijd met 30% verbeteren",
        "1GB dataverbruik staat gelijk aan 5 minuten autorijden",
        "Dark mode kan het energieverbruik van OLED schermen met 60% verminderen"
    ],

    // PERFORMANCE OPTIMIZATION: Cached formatters
    _formatCache: {
        bytes: new Map(),
        co2: new Map(),
        numbers: new Map()
    },

    /**
     * OPTIMIZED: Format file sizes with caching
     */
    formatBytes(bytes, decimals = 2) {
        const cacheKey = `${bytes}-${decimals}`;
        if (this._formatCache.bytes.has(cacheKey)) {
            return this._formatCache.bytes.get(cacheKey);
        }
        
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        const result = parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
        
        // Cache result for performance
        this._formatCache.bytes.set(cacheKey, result);
        return result;
    },

    /**
     * OPTIMIZED: Format CO2 values with caching
     */
    formatCO2(grams) {
        const cacheKey = String(grams);
        if (this._formatCache.co2.has(cacheKey)) {
            return this._formatCache.co2.get(cacheKey);
        }

        let result;
        if (grams < 1) {
            result = `${Math.round(grams * 1000)} mg CO2`;
        } else if (grams < 1000) {
            result = `${Math.round(grams * 100) / 100} g CO2`;
        } else {
            result = `${Math.round(grams / 10) / 100} kg CO2`;
        }
        
        // Cache result for performance
        this._formatCache.co2.set(cacheKey, result);
        return result;
    },

    /**
     * ORIGINAL grade colors - EXACTLY as they were for color accessibility
     */
    getGradeColor(grade) {
        const colors = {
            'A+': '#4CAF50',    // Original colors maintained
            'A': '#8BC34A',     
            'B': '#CDDC39',     
            'C': '#FFEB3B',     
            'D': '#FF9800',     
            'E': '#FF5722',     
            'F': '#990a0a'      
        };
        return colors[grade] || '#9E9E9E';
    },

    /**
     * ORIGINAL benchmark functions - functionality unchanged
     */
    getBenchmarkColor(status) {
        const colors = {
            'excellent': '#4CAF50',
            'good': '#66BB6A',
            'average': '#FFB74D',
            'poor': '#990a0a'
        };
        return colors[status] || '#9E9E9E';
    },

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
     * ORIGINAL environmental comparison - functionality unchanged
     */
    getEnvironmentalComparison(co2Grams) {
        const comparisons = [
            {
                activity: 'autorijden',
                factor: 404, // 404g CO2 per km
                unit: 'km',
                icon: this.icons.carIcon,
                description: 'Vergelijkbaar met autorijden'
            },
            {
                activity: 'smartphone opladen',
                factor: 8.5, // 8.5g CO2 per charge
                unit: 'x',
                icon: this.icons.phoneIcon,
                description: 'Keer je smartphone opladen'
            },
            {
                activity: 'kop koffie',
                factor: 21, // 21g CO2 per cup
                unit: 'koppen',
                icon: this.icons.coffeeIcon,
                description: 'Koppen koffie zetten'
            },
            {
                activity: 'LED lamp',
                factor: 0.5, // 0.5g CO2 per hour
                unit: 'uur',
                icon: this.icons.ledIcon,
                description: 'Uur LED lamp aan laten'
            },
            {
                activity: 'plastic zak',
                factor: 6, // 6g CO2 per plastic bag
                unit: 'zakken',
                icon: this.icons.bagIcon,
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
     * ENHANCED: Performance optimized debounce
     */
    debounce(func, wait, immediate = false) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                timeout = null;
                if (!immediate) func.apply(this, args);
            };
            
            const callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            
            if (callNow) func.apply(this, args);
        };
    },

    /**
     * ENHANCED: Performance optimized throttle
     */
    throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },

    /**
     * ENHANCED: Loading system with tip rotation - ORIGINAL styling preserved
     */
    tipInterval: null,

    showLoading(element, message = 'Website wordt geanalyseerd...') {
        if (!element) return;
        
        const randomTip = this.climateTips[Math.floor(Math.random() * this.climateTips.length)];
        
        // ORIGINAL loading HTML structure - NO styling changes
        element.innerHTML = `
            <div class="enhanced-loading-state">
                <div class="loading-animation">
                    ${this.icons.loadingIcon}
                </div>
                <div class="loading-content">
                    <h3 class="loading-title">${message}</h3>
                    <p class="loading-description">Dit kan 5-10 seconden duren, afhankelijk van de grootte van de website.</p>
                    <div class="climate-tip">
                        <span class="tip-text">${randomTip}</span>
                    </div>
                </div>
            </div>
        `;

        this.startTipRotation();
    },

    startTipRotation() {
        if (this.tipInterval) {
            clearInterval(this.tipInterval);
        }

        let currentTipIndex = 0;
        
        this.tipInterval = setInterval(() => {
            const tipElement = document.querySelector('.tip-text');
            if (!tipElement) {
                clearInterval(this.tipInterval);
                return;
            }

            // Smooth transition
            tipElement.style.opacity = '0';
            
            setTimeout(() => {
                currentTipIndex = (currentTipIndex + 1) % this.climateTips.length;
                tipElement.textContent = this.climateTips[currentTipIndex];
                tipElement.style.opacity = '1';
            }, 300);
            
        }, 4000); // Change tip every 4 seconds
    },

    stopTipRotation() {
        if (this.tipInterval) {
            clearInterval(this.tipInterval);
            this.tipInterval = null;
        }
    },

    /**
     * ENHANCED: Better clipboard support with fallbacks
     */
    async copyToClipboard(text) {
        // Try modern clipboard API first
        if (navigator.clipboard && window.isSecureContext) {
            try {
                await navigator.clipboard.writeText(text);
                return true;
            } catch (err) {
                console.warn('Clipboard API failed:', err);
            }
        }
        
        // Fallback to execCommand
        try {
            const textArea = document.createElement('textarea');
            textArea.value = text;
            textArea.style.position = 'fixed';
            textArea.style.left = '-999999px';
            textArea.style.top = '-999999px';
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            
            const result = document.execCommand('copy');
            textArea.remove();
            return result;
        } catch (err) {
            console.error('Copy fallback failed:', err);
            return false;
        }
    },

    /**
     * ORIGINAL: Calculate percentage difference - unchanged
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
     * ORIGINAL: Sanitize HTML - unchanged
     */
    sanitizeHTML(str) {
        if (!str || typeof str !== 'string') return '';
        const temp = document.createElement('div');
        temp.textContent = str;
        return temp.innerHTML;
    },

    /**
     * ORIGINAL: Generate unique ID - unchanged
     */
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    },

    /**
     * ORIGINAL: Format URL for display - unchanged
     */
    formatURLForDisplay(url, maxLength = 50) {
        if (!url || typeof url !== 'string') return 'Invalid URL';
        
        let displayUrl = url.replace(/^https?:\/\//, '').replace(/\/$/, '');
        
        if (displayUrl.length > maxLength) {
            displayUrl = displayUrl.substring(0, maxLength - 3) + '...';
        }
        
        return displayUrl;
    },

    /**
     * ENHANCED: Format number with caching and locale support
     */
    formatNumber(num, decimals = 2) {
        const cacheKey = `${num}-${decimals}`;
        if (this._formatCache.numbers.has(cacheKey)) {
            return this._formatCache.numbers.get(cacheKey);
        }

        const result = new Intl.NumberFormat('nl-NL', {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals
        }).format(num);
        
        this._formatCache.numbers.set(cacheKey, result);
        return result;
    },

    /**
     * ORIGINAL: Get sustainability rating - unchanged
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
     * ORIGINAL: Get trend indicator - unchanged
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
     * ENHANCED: Device detection for responsive touch
     */
    isMobile() {
        return window.innerWidth <= 768 || /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    },

    isTablet() {
        return window.innerWidth > 768 && window.innerWidth <= 1024;
    },

    supportsTouch() {
        return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    },

    prefersReducedMotion() {
        return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    },

    /**
     * ENHANCED: Smooth scroll with better performance
     */
    scrollTo(target, offset = 0) {
        const element = typeof target === 'string' ? document.querySelector(target) : target;
        if (element) {
            const elementPosition = element.offsetTop - offset;
            
            // Use modern scroll API if available, fallback to older method
            if ('scrollBehavior' in document.documentElement.style) {
                window.scrollTo({
                    top: elementPosition,
                    behavior: 'smooth'
                });
            } else {
                // Fallback for older browsers
                window.scrollTo(0, elementPosition);
            }
        }
    },

    /**
     * ENHANCED: Cache management for performance
     */
    clearFormatCache() {
        this._formatCache.bytes.clear();
        this._formatCache.co2.clear();
        this._formatCache.numbers.clear();
    },

    /**
     * ENHANCED: Initialize utilities with performance optimizations
     */
    init() {
        // Clear cache periodically to prevent memory leaks
        setInterval(() => {
            if (this._formatCache.bytes.size > 100) this._formatCache.bytes.clear();
            if (this._formatCache.co2.size > 100) this._formatCache.co2.clear();
            if (this._formatCache.numbers.size > 100) this._formatCache.numbers.clear();
        }, 300000); // Clear every 5 minutes

        // Add touch support classes for responsive touch
        if (this.supportsTouch()) {
            document.documentElement.classList.add('touch-device');
        }

        // Add mobile class for responsive design
        if (this.isMobile()) {
            document.documentElement.classList.add('mobile-device');
        }

        // Respect reduced motion preferences
        if (this.prefersReducedMotion()) {
            document.documentElement.classList.add('reduced-motion');
        }

        console.log('🛠️ Utils initialized with performance optimizations');
    }
};

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => Utils.init());
} else {
    Utils.init();
}