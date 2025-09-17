/**
 * Main Application Logic - Website CO2 Meter COMPLETE OPTIMIZED
 */

/*Check voor URL parametern waneer er van diim.be gekomen wordt*/

document.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    const prefilledUrl = urlParams.get('url');
    
    if (prefilledUrl) {
        const urlInput = DOM.get('websiteUrl');
        if (urlInput) {
            urlInput.value = prefilledUrl;
            
            
            setTimeout(() => {
                handleAnalyzeClick();
            }, 500); 
        }
    }
});

// ENHANCED Application state with performance tracking
const AppState = {
    isAnalyzing: false,
    currentResults: null,
    analysisHistory: [],
    selectedVisitorScale: 10000,
    settings: {
        autoLoadTestData: window.location.hostname === 'localhost'
    }
};

// ENHANCED DOM cache for performance
const DOM = {
    _cache: new Map(),
    
    get(elementId) {
        if (this._cache.has(elementId)) {
            return this._cache.get(elementId);
        }
        
        const element = document.getElementById(elementId);
        if (element) {
            this._cache.set(elementId, element);
        }
        return element;
    },
    
    clear() {
        this._cache.clear();
    }
};

/**
 * ENHANCED initialization with better error handling
 */
function initApp() {
    // Cache critical DOM elements with validation
    const urlInput = DOM.get('websiteUrl');
    const analyzeButton = DOM.get('analyzeButton');
    const resultsContainer = DOM.get('results');
    
    if (!urlInput || !analyzeButton || !resultsContainer) {
        console.error('Critical DOM elements missing');
        return;
    }
    
    // Setup event listeners with enhancements
    setupEventListeners();
    
    // Focus on input field
    urlInput.focus();
    
    // Auto-load test data in development
    if (AppState.settings.autoLoadTestData) {
        scheduleTestDataLoad();
    }
    
    console.log('🚀 CO2 Meter initialized successfully');
}

/**
 * ENHANCED event listener setup with keyboard navigation and accessibility
 */
function setupEventListeners() {
    const urlInput = DOM.get('websiteUrl');
    const analyzeButton = DOM.get('analyzeButton');
    
    // Analyze button with debouncing to prevent double-clicks
    if (analyzeButton) {
        analyzeButton.addEventListener('click', Utils.debounce(handleAnalyzeClick, 300));
        
        // Enhanced ARIA support
        analyzeButton.setAttribute('aria-label', 'Analyseer website CO2 uitstoot');
    }
    
    // URL input with enhanced accessibility and validation
    if (urlInput) {
        // Enter key support
        urlInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                handleAnalyzeClick();
            }
        });
        
        // Real-time validation with debouncing
        urlInput.addEventListener('input', Utils.debounce(validateURLInput, 500));
        
        // Clear validation on focus
        urlInput.addEventListener('focus', () => {
            urlInput.setCustomValidity('');
            urlInput.removeAttribute('aria-invalid');
        });
        
        // Enhanced accessibility
        urlInput.setAttribute('aria-label', 'Website URL invoeren voor CO2 analyse');
        urlInput.setAttribute('autocomplete', 'url');
    }
    
    // ENHANCED: Global keyboard shortcuts
    document.addEventListener('keydown', handleKeyboardShortcuts);
    
    // Clean up DOM cache on page unload
    window.addEventListener('beforeunload', () => DOM.clear());
}

/**
 * ENHANCED: Keyboard shortcuts for power users
 */
function handleKeyboardShortcuts(e) {
    // Ctrl/Cmd + Enter to analyze
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        handleAnalyzeClick();
    }
    
    // Escape to clear results and focus input
    if (e.key === 'Escape' && AppState.currentResults) {
        e.preventDefault();
        analyzeAnother();
    }
}

/**
 * ENHANCED analyze click handler with better error reporting
 */
async function handleAnalyzeClick() {
    if (AppState.isAnalyzing) {
        console.warn('Analysis already in progress');
        return;
    }
    
    const urlInput = DOM.get('websiteUrl');
    const url = urlInput?.value?.trim();
    
    if (!url) {
        showInputError('Voer eerst een URL in!');
        urlInput?.focus();
        return;
    }
    
    try {
        const formattedUrl = API.formatURL(url);
        urlInput.value = formattedUrl;
        await performAnalysis(formattedUrl);
    } catch (error) {
        showError(error.message);
        console.error('Analysis error:', error);
    }
}

/**
 * ENHANCED analysis with performance tracking
 */
async function performAnalysis(url) {
    const startTime = performance.now();
    
    AppState.isAnalyzing = true;
    updateLoadingState(true);
    
    const resultsContainer = DOM.get('results');
    Utils.showLoading(resultsContainer, 'Website wordt geanalyseerd');
    
    try {
        const results = await API.analyzeWebsite(url);
        
        // Performance logging for development
        const analysisTime = performance.now() - startTime;
        if (AppState.settings.autoLoadTestData) {
            console.log(`📊 Analysis completed in ${Math.round(analysisTime)}ms`);
        }
        
        // Store results with metadata
        AppState.currentResults = {
            ...results,
            timestamp: Date.now(),
            analysisTime: Math.round(analysisTime)
        };
        
        // Update history (keep last 10 for memory management)
        AppState.analysisHistory.unshift(AppState.currentResults);
        AppState.analysisHistory = AppState.analysisHistory.slice(0, 10);
        
        Utils.stopTipRotation();
        displayResults(AppState.currentResults);
        
    } catch (error) {
        Utils.stopTipRotation();
        showError(error.message || 'Er ging iets mis tijdens de analyse.');
        console.error('Analysis failed:', error);
        
    } finally {
        AppState.isAnalyzing = false;
        updateLoadingState(false);
    }
}

/**
 * ENHANCED loading state with ARIA updates
 */
function updateLoadingState(isLoading) {
    const button = DOM.get('analyzeButton');
    const btnText = button?.querySelector('.btn-text');
    const btnLoading = button?.querySelector('.btn-loading');
    
    if (!button) return;
    
    button.disabled = isLoading;
    button.setAttribute('aria-busy', isLoading.toString());
    
    if (isLoading) {
        button.setAttribute('aria-label', 'Website wordt geanalyseerd, even geduld');
    } else {
        button.setAttribute('aria-label', 'Analyseer website CO2 uitstoot');
    }
    
    if (btnText && btnLoading) {
        btnText.style.display = isLoading ? 'none' : 'inline';
        btnLoading.style.display = isLoading ? 'inline' : 'none';
    }
}

/**
 * ENHANCED URL validation with smart feedback
 */
function validateURLInput() {
    const urlInput = DOM.get('websiteUrl');
    if (!urlInput) return;
    
    const url = urlInput.value.trim();
    
    if (!url) {
        urlInput.setCustomValidity('');
        urlInput.removeAttribute('aria-invalid');
        return;
    }
    
    try {
        API.formatURL(url);
        urlInput.setCustomValidity('');
        urlInput.removeAttribute('aria-invalid');
    } catch (error) {
        urlInput.setCustomValidity(error.message);
        urlInput.setAttribute('aria-invalid', 'true');
    }
}
/**
 * Generate ENHANCED Sustainability Hero HTML 
 * @param {Object} data - Analysis results met nieuwe sustainability score
 * @returns {string} HTML string 
 */
function generateSustainabilityHeroHTML(data) {
    // NIEUWE: Bereken sustainability score
    const sustainabilityResult = SustainabilityScorer.calculateSustainabilityScore(data);
    
    // BEHOUDEN: Originele gradeColor functie
    const gradeColor = Utils.getGradeColor(sustainabilityResult.grade);
    
    // BEHOUDEN: Originele benchmark data (voor vergelijking sectie)
    const performanceBenchmark = data.benchmarks.performance;
    const co2Benchmark = data.benchmarks.co2;
    
    // NIEUWE: Sustainability score position (in plaats van performance)
    const scorePosition = Math.max(0, Math.min(100, 100 - sustainabilityResult.sustainabilityScore));
    
    // NIEUWE: Check contradiction tussen sustainability en andere metrics
    const hasContradiction = (sustainabilityResult.sustainabilityScore >= 80 && co2Benchmark.status === 'poor') || 
                            (sustainabilityResult.sustainabilityScore >= 70 && data.transferSize > 2500);
    return `
        <div class="performance-hero">
            <div class="performance-score-display">
                <div class="grade-display" style="color: ${gradeColor};">
                    <svg class="grade-background" viewBox="0 0 133.13 130.03" style="fill: ${gradeColor};" aria-hidden="true">
                        <path d="M85.62,7.67C42.39,2.32-3.33,38.39,9.43,84.2c6.19,21.76,26.9,34.73,48.78,38,12.26,1.99,25.14,1.46,35.95-3.44,13.15-5.74,21.89-18.34,25.39-32.01,7.35-28.95,2.83-74.56-33.75-79.05l-.19-.03Z"/>
                    </svg>
                    <span class="grade-letter">${sustainabilityResult.grade}</span>
                </div>
                
                <div class="score-explanation">
                    <h4>Jouw duurzaamheidsscore</h4>
                    <p>Gebaseerd op <strong>7 factoren</strong></p>
                </div>
                
                <div class="score-display">
                    <span class="score-number">${sustainabilityResult.sustainabilityScore}</span>
                    <span class="score-label">/100</span>
                </div>
                <div class="score-bar-container">
                    <div class="score-labels">
                        <span>A+</span>
                        <span>A</span>
                        <span>B</span>
                        <span>C</span>
                        <span>D</span>
                        <span>E</span>
                        <span>F</span>
                    </div>
                    <div class="score-bar">
                        <div class="score-marker" style="left: ${scorePosition}%;"></div>
                    </div>
                    <div class="score-indicator-text">Jouw website</div>
                </div>
                <div class="sustainability-assessment">
                    <p><strong>${sustainabilityResult.insights.assessment}</strong></p>
                </div>
                ${hasContradiction ? `
                    <div class="contradiction-notice">
                        <h5>Let op: Duurzaamhied vs Prestaties</h5>
                        <p>Deze website heeft een <strong>goede duurzaamheid score</strong> maar verbruikt nog steeds <strong>veel data</strong>. 
                        Er zijn nog optimalisatie kansen!</p>
                    </div>
                ` : ''}
                
                <div class="sustainability-score">
                    <h4>Duurzaamheidsfactoren</h4>
                    <p><strong>Gebaseerd op:</strong> Data efficiëntie, groene hosting, gebruik van bronnen</p>
                    <div class="dual-metrics">
                        <div class="metric-item">
                            ${Utils.icons.co2} <strong>${Utils.formatCO2(data.co2PerVisit)}</strong> per bezoek
                        </div>
                        <div class="metric-item">
                            ${Utils.icons.pageIcon} <strong>${Utils.formatBytes(data.transferSize * 1024)}</strong> data
                        </div>
                        <div class="metric-item">
                            ${data.greenHosting.isGreen ? Utils.icons.greenHosting : Utils.icons.greyHosting} 
                            <strong>${data.greenHosting.isGreen ? 'Groene' : 'Grijze'}</strong> hosting
                        </div>
                        <div class="metric-item">
                            ${Utils.icons.upGraphIcon}<strong>Prestaties: ${data.performanceScore}/100</strong>
                        </div>
                    </div>
                </div>          
            
            </div>
        </div>
        
    `;
    
}


function displayResults(data) {
    const displayUrl = Utils.formatURLForDisplay(data.url);
    const resultsContainer = DOM.get('results');
    
    resultsContainer.innerHTML = `
        <div class="result-card">
            <h3>${Utils.icons.bulletPoint} Analyse resultaten voor: ${Utils.sanitizeHTML(displayUrl)}</h3>
            
            ${generateSustainabilityHeroHTML(data)}
            ${generateEducationalSectionHTML(data)}
            ${generateHostingStatusHTML(data.greenHosting)}
            ${generateDetailedMetricsHTML(data)}
            ${generateEnhancedBenchmarkHTML(data.benchmarks)}
            ${generateCombinedImpactCalculatorHTML(data.co2PerVisit, AppState.selectedVisitorScale)}
            ${generateOptimizationTipsHTML(data.optimizations)}
            ${generateCTAFormHTML ? generateCTAFormHTML(data) : '<p>CTA functie niet gevonden</p>'}
            
            <div class="result-actions">
                <button onclick="shareResults()" class="share-btn" aria-label="Deel analyse resultaten">
                    ${Utils.icons.shareIcon} Deel resultaten
                </button>
                <button onclick="analyzeAnother()" class="secondary-btn" aria-label="Analyseer nieuwe website">
                    ${Utils.icons.analyseerIcon} Analyseer een andere website
                </button>
            </div>
        </div>
    `;
    
    // Enhanced scroll with performance optimization
    setTimeout(() => {
        Utils.scrollTo('.result-card', 100);
    }, 100);
}


/**
 * Generate CTA Contact Form HTML
 * @param {Object} data - Analysis results for personalization
 * @returns {string} HTML string
 */
function generateCTAFormHTML(data) {
    // Personalize CTA based on score
    const { sustainabilityScore, grade } = SustainabilityScorer.calculateSustainabilityScore(data);
    
    let ctaMessage, ctaSubtitle;
    
    if (sustainabilityScore >= 80) {
        ctaMessage = "Proficiat met je geweldige score!";
        ctaSubtitle = "Neem contact met me op als je een uigebreid CO2 rapport wil van je website voor je B-corp of ESG rapportage.";
    } else if (sustainabilityScore >= 60) {
        ctaMessage = "Dat ziet er al goed uit, maar er zijn nog kansen!";
        ctaSubtitle = "Ik kan je helpen om je score te verhogen. Heel vaak zijn er nog verbeteringen mogelijk.";
    } else {
        ctaMessage = "Veel verbeterpotentieel ontdekt!";
        ctaSubtitle = "Je website kan veel duurzamer. Ik help je graag met een actieplan om je CO2-impact gevoelig te verlagen.";
    }
    
    return `
        <div class="cta-section">
            <div class="cta-header">
                <h4 class="cta-title"> ${ctaMessage}</h4>
                <p class="cta-subtitle">${ctaSubtitle}</p>
            </div>
            
            <form class="cta-form" id="ctaContactForm" onsubmit="handleCTASubmit(event)">
                <div class="form-row">
                    <div class="form-group">
                        <label for="ctaName" class="form-label">Naam *</label>
                        <input 
                            type="text" 
                            id="ctaName" 
                            name="name" 
                            class="form-input" 
                            placeholder="Je voornaam"
                            required
                            aria-label="Voornaam invoeren"
                        >
                    </div>
                    <div class="form-group">
                        <label for="ctaEmail" class="form-label">E-mail *</label>
                        <input 
                            type="email" 
                            id="ctaEmail" 
                            name="email" 
                            class="form-input" 
                            placeholder="naam@bedrijf.be"
                            required
                            aria-label="E-mailadres invoeren"
                        >
                    </div>
                </div>
                
                <div class="form-group">
                    <label for="ctaCompany" class="form-label">Bedrijf</label>
                    <input 
                        type="text" 
                        id="ctaCompany" 
                        name="company" 
                        class="form-input" 
                        placeholder="Je bedrijfsnaam (optioneel)"
                        aria-label="Bedrijfsnaam invoeren"
                    >
                </div>
                
                <div class="form-group">
                    <label for="ctaInterest" class="form-label">Waar ben je in geïnteresseerd? *</label>
                    <select id="ctaInterest" name="interest" class="form-select" required aria-label="Type hulp selecteren">
                        <option value="">Selecteer wat je nodig hebt...</option>
                        <option value="score-improvement">Mijn score verbeteren (concrete tips)</option>
                        <option value="Uitgebreide-website-audit">Uitgebreide website audit</option>
                        <option value="bcorp-report">Duurzaamheidsrapport voor B-corp</option>
                        <option value="ongoing-support">Doorlopende duurzaamheidsondersteuning</option>
                        <option value="just-chat">Gewoon een vrijblijvend gesprek</option>
                    </select>
                </div>
                
                <div class="form-group">
                    <label for="ctaMessage" class="form-label">Bericht (optioneel)</label>
                    <textarea 
                        id="ctaMessage" 
                        name="message" 
                        class="form-textarea" 
                        placeholder="Vertel me kort over je situatie of doelen..."
                        aria-label="Optioneel bericht invoeren"
                    ></textarea>
                </div>
                
                <!-- Hidden fields voor context -->
                <input type="hidden" name="website_url" value="${data.url}">
                <input type="hidden" name="current_score" value="${sustainabilityScore}">
                <input type="hidden" name="current_grade" value="${grade}">
                <input type="hidden" name="co2_per_visit" value="${data.co2PerVisit}">
                
                <button type="submit" class="cta-submit" id="ctaSubmitBtn">
                    <span class="submit-text">Verzenden</span>
                    <span class="submit-loading" style="display: none;">Versturen...</span>
                </button>
                
                <div id="ctaFormMessage" class="form-message" style="display: none;"></div>
            </form>
            
            <div class="cta-trust">
                <div class="trust-items">
                    <div class="trust-item">
                     <span>Gratis advies</span>
                    </div>
                    <div class="trust-item">
                       <span>Geen verplichtingen</span>
                    </div>
                    <div class="trust-item">
                        <span>Binnen 24u reactie</span>
                    </div>
                </div>
            </div>
        </div>
    `;
}

/**
 * Handle CTA form submission
 * @param {Event} event - Form submit event
 */
async function handleCTASubmit(event) {
    event.preventDefault();
    
    const form = event.target;
    const submitBtn = document.getElementById('ctaSubmitBtn');
    const messageDiv = document.getElementById('ctaFormMessage');
    const submitText = submitBtn.querySelector('.submit-text');
    const submitLoading = submitBtn.querySelector('.submit-loading');
    
    // Update submit button state
    submitBtn.disabled = true;
    submitText.style.display = 'none';
    submitLoading.style.display = 'inline-flex';
    messageDiv.style.display = 'none';
    
    try {
        // Collect form data
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        
        // Validate required fields
        if (!data.name || !data.email || !data.interest) {
            throw new Error('Vul alle verplichte velden in');
        }
        
        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(data.email)) {
            throw new Error('Vul een geldig e-mailadres in');
        }
        
        // Send to your backend/service
        await sendCTAContact(data);
        
        // Show success message
        showCTAMessage('success', 'Bedankt! Je bericht is verstuurd. Ik neem binnen 24u contact met je op.');
        
        // Reset form
        form.reset();
        
        // Track conversion (als je analytics hebt)
        if (typeof gtag !== 'undefined') {
            gtag('event', 'cta_contact_submit', {
                event_category: 'Lead Generation',
                event_label: data.interest,
                value: 1
            });
        }
        
    } catch (error) {
        console.error('CTA Form Error:', error);
        showCTAMessage('error', error.message || 'Er ging iets mis. Probeer het opnieuw.');
    } finally {
        // Reset submit button
        submitBtn.disabled = false;
        submitText.style.display = 'inline-flex';
        submitLoading.style.display = 'none';
    }
}

/**
 * Send CTA contact data to backend/service
 * @param {Object} data - Form data
 */
async function sendCTAContact(data) {
    // Option 1: Send to your own backend
    const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
    });
    
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Server error');
    }
    
    return response.json();
    
    // Option 2: Send to external service (Netlify Forms, Formspree, etc.)
    // Uncomment and modify as needed:
    /*
    const response = await fetch('https://formspree.io/f/your-form-id', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
    });
    
    if (!response.ok) {
        throw new Error('Er ging iets mis bij het versturen');
    }
    */
}

/**
 * Show CTA form message
 * @param {string} type - 'success' or 'error'
 * @param {string} message - Message to display
 */
function showCTAMessage(type, message) {
    const messageDiv = document.getElementById('ctaFormMessage');
    if (messageDiv) {
        messageDiv.className = `form-message ${type}`;
        messageDiv.textContent = message;
        messageDiv.style.display = 'block';
        
        // Auto-hide success messages after 5 seconds
        if (type === 'success') {
            setTimeout(() => {
                messageDiv.style.display = 'none';
            }, 5000);
        }
        
        // Scroll message into view
        messageDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
}

// Global function exports (needed for onclick handlers)
window.handleCTASubmit = handleCTASubmit;

/**
 * Generate ENHANCED Performance Hero HTML with clear explanation
 * @param {Object} data - Analysis results
 * @returns {string} HTML string
 */
function generatePerformanceHeroHTML(data) {
    const gradeColor = Utils.getGradeColor(data.grade);
    const performanceBenchmark = data.benchmarks.performance;
    const co2Benchmark = data.benchmarks.co2;
    
    // Calculate score position on the bar (0-100 scale mapped to 0-100%)
    const scorePosition = Math.max(0, Math.min(100, 100 - data.performanceScore));
    
    // Determine if there's a contradiction between performance and sustainability
    const hasContradiction = (data.performanceScore >= 80 && co2Benchmark.status === 'poor') || 
                            (data.performanceScore >= 70 && data.transferSize > 2500);
    
    return `
        <div class="performance-hero">
            <div class="performance-score-display">
                <div class="grade-display" style="color: ${gradeColor};">
                    <svg class="grade-background" viewBox="0 0 133.13 130.03" style="fill: ${gradeColor};" aria-hidden="true">
                        <path d="M85.62,7.67C42.39,2.32-3.33,38.39,9.43,84.2c6.19,21.76,26.9,34.73,48.78,38,12.26,1.99,25.14,1.46,35.95-3.44,13.15-5.74,21.89-18.34,25.39-32.01,7.35-28.95,2.83-74.56-33.75-79.05l-.19-.03Z"/>
                    </svg>
                    <span class="grade-letter">${data.grade}</span>
                </div>
                
                <div class="score-explanation">
                    <h4>📈 Performance Score (Google)</h4>
                    <p><strong>Meet:</strong> Hoe snel content zichtbaar wordt voor gebruikers</p>
                </div>
                
                <div class="score-display">
                    <span class="score-number">${data.performanceScore}</span>
                    <span class="score-label">/100</span>
                </div>
                <div class="score-bar-container">
                    <div class="score-labels">
                        <span>A+</span>
                        <span>A</span>
                        <span>B</span>
                        <span>C</span>
                        <span>D</span>
                        <span>E</span>
                        <span>F</span>
                    </div>
                    <div class="score-bar">
                        <div class="score-marker" style="left: ${scorePosition}%;"></div>
                    </div>
                    <div class="score-indicator-text">Jouw website</div>
                </div>
                
                ${hasContradiction ? `
                    <div class="contradiction-notice">
                        <h5>Let op! Performance vs Duurzaamheid</h5>
                        <p>Deze website laadt <strong>snel</strong> maar gebruikt <strong>veel data</strong>. 
                        Performance en duurzaamheid zijn twee verschillende dingen!</p>
                    </div>
                ` : ''}
                
                <div class="sustainability-score">
                    <h4>🌍 Duurzaamheids Impact</h4>
                    <p><strong>Meet:</strong> CO2 uitstoot en resource verbruik</p>
                    <div class="dual-metrics">
                        <div class="metric-item">
                            ${Utils.icons.co2} <strong>${Utils.formatCO2(data.co2PerVisit)}</strong> per bezoek
                        </div>
                        <div class="metric-item">
                            ${Utils.icons.pageIcon} <strong>${Utils.formatBytes(data.transferSize * 1024)}</strong> data
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

/**
 * Generate hosting status HTML
 * @param {Object} greenHosting - Green hosting data
 * @returns {string} HTML string
 */
function generateHostingStatusHTML(greenHosting) {
    const statusClass = greenHosting.isGreen ? 'green' : 'grey';
    const statusIcon = greenHosting.isGreen ? `${Utils.icons.greenHosting}` : `${Utils.icons.greyHosting}`;
    const statusTitle = greenHosting.isGreen ? 'Groene Hosting!' : 'Oh neen, je hosting is grijs!';
    
    return `
        <div class="hosting-status ${statusClass}">
            <h4>${statusIcon} ${statusTitle}</h4>
            ${greenHosting.provider ? `<p>Provider: ${Utils.sanitizeHTML(greenHosting.provider)}</p>` : ''}
            <p>${Utils.sanitizeHTML(greenHosting.impact)}</p>
        </div>
    `;
}

/**
 * Generate COMBINED environmental impact calculator with visitor scaling
 * @param {number} co2PerVisit - CO2 per single visit in grams
 * @param {number} selectedVisitors - Currently selected visitor count
 * @returns {string} HTML string
 */
function generateCombinedImpactCalculatorHTML(co2PerVisit, selectedVisitors) {
    // Calculate monthly and yearly CO2 based on selected visitors
    const monthlyVisitors = selectedVisitors;
    const yearlyVisitors = monthlyVisitors * 12;
    const monthlyCO2 = co2PerVisit * monthlyVisitors; // grams per month
    const yearlyCO2 = monthlyCO2 * 12; // grams per year
    
    // Get all environmental comparisons based on monthly CO2
    const comparisons = Utils.getEnvironmentalComparison(monthlyCO2);
    
    // Calculate tree compensation (22kg CO2 per tree per year)
    const treesNeeded = Math.max(1, Math.round((yearlyCO2 / 1000) / 22));
    
    const visitorOptions = [
        { value: 1000, label: '1.000' },
        { value: 10000, label: '10.000' },
        { value: 100000, label: '100.000' }
    ];
    
    return `
        <div class="combined-impact-section">
            <h4>${Utils.icons.impactIcon} Jaarlijkse milieu impact</h4>
            <p class="impact-intro">Zie hoe de milieu-impact schaalt met meer website bezoekers per maand:</p>
            
            <div class="visitor-selector">
                <label for="visitorSelect">Per 
                    <select id="visitorSelect" onchange="updateImpactCalculation(this.value)" class="visitor-dropdown" aria-label="Aantal maandelijkse bezoekers selecteren">
                        ${visitorOptions.map(option => `
                            <option value="${option.value}" ${option.value === selectedVisitors ? 'selected' : ''}>
                                ${option.label}
                            </option>
                        `).join('')}
                    </select>
                maandelijkse bezoekers:</label>
            </div>
            
            <div class="impact-summary">
                <div class="co2-yearly">
                    <strong>${Utils.formatCO2(yearlyCO2)} per jaar</strong>
                    <small>(${Utils.formatCO2(monthlyCO2)} per maand)</small>
                </div>
            </div>
            
            <div class="impact-comparisons">
                ${comparisons.map(comp => `
                    <div class="impact-item">
                        <span class="impact-icon">${comp.icon}</span>
                        <span class="impact-text">${comp.text}</span>
                    </div>
                `).join('')}
                
                <div class="impact-item">
                    <span class="impact-icon">${Utils.icons.treeIcon}</span>
                    <span class="impact-text">${treesNeeded} bomen nodig ter compensatie</span>
                </div>
            </div>
            
            <div class="impact-note">
                <small>${Utils.icons.bulletPoint} Deze berekeningen zijn gebaseerd op ${selectedVisitors.toLocaleString('nl-NL')} unieke bezoekers per maand</small>
            </div>
        </div>
    `;
}

/**
 * Update impact calculation when visitor count changes
 * @param {string} visitorCount - Selected visitor count as string
 */
function updateImpactCalculation(visitorCount) {
    const visitors = parseInt(visitorCount);
    AppState.selectedVisitorScale = visitors;
    
    if (AppState.currentResults) {
        // Find the impact section and update it
        const impactSection = document.querySelector('.combined-impact-section');
        if (impactSection) {
            // Add smooth transition
            impactSection.style.opacity = '0.7';
            
            setTimeout(() => {
                impactSection.outerHTML = generateCombinedImpactCalculatorHTML(
                    AppState.currentResults.co2PerVisit, 
                    visitors
                );
                
                // Restore opacity
                const newImpactSection = document.querySelector('.combined-impact-section');
                if (newImpactSection) {
                    newImpactSection.style.opacity = '1';
                }
            }, 150);
        }
    }
}

/**
 * Generate enhanced benchmark comparison HTML
 * @param {Object} benchmarks - Benchmark comparison data
 * @returns {string} HTML string
 */
function generateEnhancedBenchmarkHTML(benchmarks) {
    if (!benchmarks) return '';
    
    const getStatusIcon = (status) => {
        switch(status) {
            case 'excellent': return Utils.icons.excellentIcon;
            case 'good': return Utils.icons.goodIcon;
            case 'average': return Utils.icons.averageIcon;
            case 'poor': return Utils.icons.poorIcon;
            default: return Utils.icons.bulletPoint;
        }
    };
    
    const benchmarkItems = [];
    
    // Always include these core benchmarks
    if (benchmarks.pageSize) {
        benchmarkItems.push({
            key: 'pageSize',
            label: 'Website Grootte',
            value: `${benchmarks.pageSize.value} KB`,
            data: benchmarks.pageSize
        });
    }
    
    if (benchmarks.co2) {
        benchmarkItems.push({
            key: 'co2',
            label: 'CO2 Uitstoot',
            value: `${benchmarks.co2.value}g`,
            data: benchmarks.co2
        });
    }
    
    if (benchmarks.performance) {
        benchmarkItems.push({
            key: 'performance',
            label: 'Performance Score',
            value: `${benchmarks.performance.value}/100`,
            data: benchmarks.performance
        });
    }
    
    // Add optional benchmarks if available
    if (benchmarks.httpRequests) {
        benchmarkItems.push({
            key: 'httpRequests',
            label: 'HTTP Requests',
            value: `${benchmarks.httpRequests.value}`,
            data: benchmarks.httpRequests
        });
    }
    
    if (benchmarks.domElements) {
        benchmarkItems.push({
            key: 'domElements',
            label: 'DOM Elementen',
            value: `${benchmarks.domElements.value}`,
            data: benchmarks.domElements
        });
    }
    
    return `
        <div class="benchmark-section">
            <h4> ${Utils.icons.benchmarkIcon} Benchmark vergelijkingen</h4>
            <div class="benchmark-grid">
                ${benchmarkItems.map(item => `
                    <div class="benchmark-item ${item.data.status}">
                        <div class="benchmark-metric">
                            <span class="benchmark-label">${item.label}</span>
                            <span class="benchmark-value">
                                ${getStatusIcon(item.data.status)} ${item.value}
                            </span>
                        </div>
                        <div class="benchmark-comparison">
                            vs gemiddeld ${item.key === 'pageSize' ? item.data.average + ' KB' : 
                                         item.key === 'co2' ? item.data.average + 'g CO2' :
                                         item.key === 'performance' ? item.data.average + '/100' :
                                         item.data.average}<br>
                            <strong>${item.data.message}</strong>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

/**
 * Generate detailed metrics grid HTML
 * @param {Object} data - Analysis results
 * @returns {string} HTML string
 */
function generateDetailedMetricsHTML(data) {
    const metrics = [
        {
            icon: Utils.icons.bulletPoint,
            label: 'CO2 per bezoek',
            value: Utils.formatCO2(data.co2PerVisit)
        },
        {
            icon: Utils.icons.pageIcon,
            label: 'Website grootte',
            value: Utils.formatBytes(data.transferSize * 1024)
        },
        {
            icon: Utils.icons.imageIcon,
            label: 'Afbeelding optimalisatie',
            value: `${Math.round(data.optimizations.imageOptimizationScore * 100)}/100`
        }
    ];
    
    // Add optional metrics if available
    if (data.domElements) {
        metrics.push({
            icon: Utils.icons.DOMIcon,
            label: 'DOM elementen',
            value: data.domElements.toLocaleString('nl-NL')
        });
    }
    
    if (data.httpRequests) {
        metrics.push({
            icon: Utils.icons.requestsIcon,
            label: 'HTTP requests',
            value: data.httpRequests.toLocaleString('nl-NL')
        });
    }
    
    // Add potential savings if significant
    if (data.optimizations.canSave > 5) {
        metrics.push({
            icon: Utils.icons.downArrow,
            label: 'Potentiële besparing',
            value: Utils.formatBytes(data.optimizations.canSave * 1024)
        });
    }
    
    return `
        <div class="metrics-grid">
            ${metrics.map(metric => `
                <div class="metric-item">
                    <p>${metric.icon} <strong>${metric.label}:</strong> ${metric.value}</p>
                </div>
            `).join('')}
        </div>
    `;
}

/**
 * Generate Educational Information Section
 * @param {Object} data - Analysis results
 * @returns {string} HTML string
 */
function generateEducationalSectionHTML(data) {
    const hasPerformanceSustainabilityGap = data.performanceScore >= 70 && data.benchmarks.co2.status === 'poor';
    
    return `
        <div class="educational-info">
            <h4>Prestaties vs Duurzaamheid: Wat is nu eigenlijk het verschil?</h4>
            
            <div class="comparison-grid">
                <div class="comparison-item">
                    <h5>${Utils.icons.upGraphIcon} Prestatie Score</h5>
                    <ul>
                        <li><strong>Meet:</strong> Hoe snel de inhoud zichtbaar wordt</li>
                        <li><strong>Focus:</strong> Gebruikerservaring</li>
                        <li><strong>Gebruikt:</strong> Core Web Vitals metrics</li>
                        <li><strong>Voorbeeld:</strong> Pagina laadt in 2 seconden</li>
                    </ul>
                </div>
                
                <div class="comparison-item">
                    <h5>${Utils.icons.greenHosting} CO2 Impact</h5>
                    <ul>
                        <li><strong>Meet:</strong> Data verbruik en energie</li>
                        <li><strong>Focus:</strong> Milieu impact</li>
                        <li><strong>Gebruikt:</strong> Bytes over het netwerk</li>
                        <li><strong>Voorbeeld:</strong> 2MB data = meer CO2</li>
                    </ul>
                </div>
            </div>
            
            ${hasPerformanceSustainabilityGap ? `
                <div class="performance-sustainability-explanation">
                    <h5>Waarom deze website snel is maar veel CO2 uitstoot:</h5>
                    <ul>
                        <li><strong>Snelle server:</strong> Content wordt snel geleverd aan je browser</li>
                        <li><strong>Maar verbruikt veel data:</strong> ${Utils.formatBytes(data.transferSize * 1024)} wordt gedownload</li>
                        <li><strong>Veel requests:</strong> ${data.httpRequests || 'Veel'} aparte bestanden worden opgehaald</li>
                        <li><strong>Resultaat:</strong> Snel voor jou, maar toch zwaar voor het milieu</li>
                    </ul>
                </div>
            ` : ''}
            
            <div class="key-takeaway">
                <p><strong>${Utils.icons.bulletPoint} Belangrijk:</strong> Een hoge prestatie score betekent niet automatisch een lage CO2 uitstoot! 
                Ideaal is een website die <em>zowel</em> snel <em>als</em> duurzaam is!</p>
            </div>
        </div>
    `;
}

/**
 * Generate optimization tips HTML with detailed unused CSS/JS breakdown
 * @param {Object} optimizations - Optimization data
 * @returns {string} HTML string
 */
function generateOptimizationTipsHTML(optimizations) {
    if (optimizations.canSave <= 5 && optimizations.unusedCSS <= 5 && optimizations.unusedJS <= 5) {
        return ''; // Don't show tips if savings are minimal
    }
    
    const co2Savings = Math.round((optimizations.canSave / 1024) * 0.8 * 100) / 100; // Rough estimate
    
    let optimizationDetails = [];
    
    if (optimizations.unusedCSS > 0) {
        optimizationDetails.push(`• <strong>${optimizations.unusedCSS}KB ongebruikte CSS</strong> - Verwijder ongebruikte stylesheets`);
    }
    
    if (optimizations.unusedJS > 0) {
        optimizationDetails.push(`• <strong>${optimizations.unusedJS}KB ongebruikte JavaScript</strong> - Verwijder ongebruikte scripts`);
    }
    
    if (optimizations.imageOptimizationScore < 0.8) {
        optimizationDetails.push(`• <strong>Afbeeldingen optimaliseren</strong> - Comprimeer en converteer naar moderne formaten`);
    }
    
    return `
        <div class="tip-box">
            <span class="tip-icon">${Utils.icons.upGraphIcon}</span>
            <h6>Wat kan er beter?</h6>
            <br>Je kan ${Utils.formatBytes(optimizations.canSave * 1024)} besparen door ongebruikte code te verwijderen!
            <br>Dit zou de CO2 uitstoot met ongeveer <strong>${co2Savings}g</strong> kunnen verminderen per bezoek.
            
            ${optimizationDetails.length > 0 ? `
                <div class="optimization-breakdown">
                    <h6>Specifieke verbeteringen:</h6>
                    ${optimizationDetails.map(detail => `<div class="optimization-item">${detail}</div>`).join('')}
                </div>
            ` : ''}
            
            <div class="optimization-impact">
                <small><strong>Impact:</strong> Minder data = snellere website + lagere hosting kosten + minder CO2</small>
            </div>
        </div>
    `;
}



/**
 * ENHANCED error handling with better UX
 */
function showError(message) {
    const resultsContainer = DOM.get('results');
    if (!resultsContainer) return;
    
    resultsContainer.innerHTML = `
        <div class="error-card" role="alert" aria-live="assertive">
            <h3>Er ging iets mis</h3>
            <p>${Utils.sanitizeHTML(message)}</p>
            <p style="font-size: 0.9em; color: #666; margin-top: 10px;">
                Controleer of de URL correct is en probeer opnieuw.
            </p>
            <button onclick="analyzeAnother()" class="secondary-btn" aria-label="Probeer opnieuw">
                Probeer opnieuw
            </button>
        </div>
    `;
}

/**
 * ENHANCED input error handling
 */
function showInputError(message) {
    const urlInput = DOM.get('websiteUrl');
    if (!urlInput) return;
    
    urlInput.setCustomValidity(message);
    urlInput.setAttribute('aria-invalid', 'true');
    urlInput.reportValidity();
    
    // Clear error when user starts typing
    const clearError = () => {
        urlInput.setCustomValidity('');
        urlInput.removeAttribute('aria-invalid');
        urlInput.removeEventListener('input', clearError);
    };
    urlInput.addEventListener('input', clearError, { once: true });
}

/**
 * ENHANCED sharing with better accessibility and fallbacks
 */
async function shareResults() {
    if (!AppState.currentResults) return;
    
    const shareButton = document.querySelector('.share-btn');
    if (shareButton) {
        shareButton.setAttribute('aria-busy', 'true');
        shareButton.disabled = true;
    }
    
    try {
        const monthlyCO2 = AppState.currentResults.co2PerVisit * AppState.selectedVisitorScale;
        const yearlyCO2 = monthlyCO2 * 12;
        const treesNeeded = Math.max(1, Math.round((yearlyCO2 / 1000) / 22));
        const kmDriving = Math.round((monthlyCO2 / 404) * 100) / 100;
        
        const shareText = `🌱 Website CO2 Analyse van ${AppState.currentResults.url}:

Performance Score: ${AppState.currentResults.performanceScore}/100 (${AppState.currentResults.grade})
CO2 uitstoot: ${Utils.formatCO2(AppState.currentResults.co2PerVisit)} per bezoek
Website grootte: ${Utils.formatBytes(AppState.currentResults.transferSize * 1024)}

Bij ${AppState.selectedVisitorScale.toLocaleString('nl-NL')} bezoekers/maand:
${Utils.formatCO2(yearlyCO2)} CO2 per jaar
${treesNeeded} bomen nodig voor compensatie
${kmDriving}km autorijden equivalent per maand

${AppState.currentResults.greenHosting.isGreen ? 'Gebruikt groene hosting!' : 'Gebruikt grijze hosting'}

Geanalyseerd met: ${window.location.href}`;
        
        const shareData = {
            title: 'Website CO2 Analyse',
            text: shareText,
            url: window.location.href
        };
        
        // Try native sharing first
        if (navigator.share && navigator.canShare?.(shareData)) {
            await navigator.share(shareData);
            showShareFeedback('shared');
        } else {
            // Fallback to clipboard
            const success = await Utils.copyToClipboard(shareText);
            showShareFeedback(success ? 'copied' : 'failed');
        }
    } catch (error) {
        if (error.name !== 'AbortError') {
            console.error('Share failed:', error);
            showShareFeedback('failed');
        }
    } finally {
        if (shareButton) {
            shareButton.setAttribute('aria-busy', 'false');
            shareButton.disabled = false;
        }
    }
}

/**
 * ENHANCED share feedback with ARIA announcements
 */
function showShareFeedback(type) {
    const shareBtn = document.querySelector('.share-btn');
    if (!shareBtn) return;
    
    const messages = {
        'shared': '✅ Succesvol gedeeld!',
        'copied': '✅ Gekopieerd naar klembord!',
        'failed': '❌ Delen mislukt, probeer eens opnieuw'
    };
    
    const originalHTML = shareBtn.innerHTML;
    const originalLabel = shareBtn.getAttribute('aria-label');
    
    shareBtn.innerHTML = messages[type];
    shareBtn.setAttribute('aria-label', messages[type]);
    
    // Announce to screen readers
    announceToScreenReader(messages[type]);
    
    setTimeout(() => {
        shareBtn.innerHTML = originalHTML;
        shareBtn.setAttribute('aria-label', originalLabel);
    }, 3000);
}

/**
 * ENHANCED reset with focus management
 */
function analyzeAnother() {
    const urlInput = DOM.get('websiteUrl');
    const resultsContainer = DOM.get('results');
    
    // Clear results
    if (resultsContainer) {
        resultsContainer.innerHTML = '';
    }
    
    // Reset state
    AppState.selectedVisitorScale = 10000;
    AppState.currentResults = null;
    
    // Focus management
    if (urlInput) {
        urlInput.focus();
        urlInput.select();
        
        // Clear any validation states
        urlInput.setCustomValidity('');
        urlInput.removeAttribute('aria-invalid');
    }
    
    // Announce to screen readers
    announceToScreenReader('Formulier gereset, voer een nieuwe URL in');
}

/**
 * ENHANCED screen reader announcements
 */
function announceToScreenReader(message) {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.style.position = 'absolute';
    announcement.style.left = '-10000px';
    announcement.style.width = '1px';
    announcement.style.height = '1px';
    announcement.style.overflow = 'hidden';
    announcement.textContent = message;
    
    document.body.appendChild(announcement);
    
    setTimeout(() => {
        if (document.body.contains(announcement)) {
            document.body.removeChild(announcement);
        }
    }, 1000);
}

/**
 * Scheduled test data loading for development
 */
function scheduleTestDataLoad() {
    setTimeout(() => {
        if (AppState.settings.autoLoadTestData) {
            AppState.currentResults = TEST_DATA;
            displayResults(TEST_DATA);
            console.log('🧪 Test data loaded for development');
            announceToScreenReader('Test data geladen voor ontwikkeling');
        }
    }, 500);
}

// TEST DATA - Exact zoals jij het had
const TEST_DATA = {
    url: "https://example.com",
    co2PerVisit: 2.5,
    transferSize: 15,
    performanceScore: 99,
    grade: "A+",
    domElements: 15,
    httpRequests: 3,
    greenHosting: {
        isGreen: true,
        provider: "Green Hosting Provider",
        impact: "Lagere CO2 impact door groene energie!"
    },
    optimizations: {
        imageOptimizationScore: 1,
        unusedCSS: 0,
        unusedJS: 0,
        canSave: 65
    },
    benchmarks: {
        pageSize: { value: 1500, average: 2048, status: 'good', percentage: 27, message: '27% kleiner dan gemiddeld' },
        co2: { value: 2.5, average: 0.8, status: 'poor', percentage: 212, message: '212% meer CO2 dan gemiddeld' },
        performance: { value: 78, average: 65, status: 'good', percentage: 20, message: '20% beter dan gemiddeld' },
        httpRequests: { value: 45, average: 70, status: 'excellent', percentage: 36, message: '36% minder requests dan gemiddeld' },
        domElements: { value: 1200, average: 1500, status: 'good', percentage: 20, message: '20% minder elementen dan gemiddeld' }
    }
};

// Global function exports (needed for onclick handlers)
window.updateImpactCalculation = updateImpactCalculation;
window.shareResults = shareResults;
window.analyzeAnother = analyzeAnother;

// Enhanced initialization
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}