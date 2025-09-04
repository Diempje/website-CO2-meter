/**
 * Main Application Logic - Website CO2 Meter
 * Handles UI interactions and result display
 */

// Application state
const AppState = {
    isAnalyzing: false,
    currentResults: null,
    analysisHistory: []
};

// DOM Elements (cached for performance)
const DOM = {
    urlInput: null,
    analyzeButton: null,
    resultsContainer: null,
    btnText: null,
    btnLoading: null
};

/**
 * Initialize the application
 */
function initApp() {
    // Cache DOM elements
    DOM.urlInput = document.getElementById('websiteUrl');
    DOM.analyzeButton = document.getElementById('analyzeButton');
    DOM.resultsContainer = document.getElementById('results');
    DOM.btnText = DOM.analyzeButton?.querySelector('.btn-text');
    DOM.btnLoading = DOM.analyzeButton?.querySelector('.btn-loading');

    // Add event listeners
    setupEventListeners();
    
    // Focus on input field
    DOM.urlInput?.focus();
    
    console.log('🌱 CO2 Meter App initialized');
}

/**
 * Setup all event listeners
 */
function setupEventListeners() {
    // Analyze button click
    if (DOM.analyzeButton) {
        DOM.analyzeButton.addEventListener('click', handleAnalyzeClick);
    }
    
    // Enter key in URL input
    if (DOM.urlInput) {
        DOM.urlInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                handleAnalyzeClick();
            }
        });
        
        // Real-time URL validation
        DOM.urlInput.addEventListener('input', Utils.debounce(validateURLInput, 300));
    }
}

/**
 * Handle analyze button click
 */
async function handleAnalyzeClick() {
    if (AppState.isAnalyzing) return;
    
    const url = DOM.urlInput?.value?.trim();
    
    if (!url) {
        showError('Voer eerst een URL in!');
        DOM.urlInput?.focus();
        return;
    }
    
    try {
        // Validate and format URL
        const formattedUrl = API.formatURL(url);
        
        // Update URL input with formatted version
        if (DOM.urlInput) {
            DOM.urlInput.value = formattedUrl;
        }
        
        // Start analysis
        await performAnalysis(formattedUrl);
        
    } catch (error) {
        showError(error.message);
    }
}

/**
 * Main website analysis function
 * @param {string} url - Website URL to analyze
 */
async function performAnalysis(url) {
    AppState.isAnalyzing = true;
    updateLoadingState(true);
    
    // Show loading in results area
    Utils.showLoading(DOM.resultsContainer, 'Website wordt geanalyseerd... Dit kan 5-10 seconden duren.');
    
    try {
        // Call API
        const results = await API.analyzeWebsite(url);
        
        // Store results
        AppState.currentResults = results;
        AppState.analysisHistory.unshift(results);
        
        // Display results
        displayResults(results);
        
        console.log('✅ Analysis completed:', results);
        
    } catch (error) {
        console.error('❌ Analysis failed:', error);
        showError(error.message || 'Er ging iets mis bij het analyseren van de website');
        
    } finally {
        AppState.isAnalyzing = false;
        updateLoadingState(false);
    }
}

/**
 * Update loading state of analyze button
 * @param {boolean} isLoading - Loading state
 */
function updateLoadingState(isLoading) {
    if (!DOM.analyzeButton) return;
    
    DOM.analyzeButton.disabled = isLoading;
    
    if (DOM.btnText && DOM.btnLoading) {
        DOM.btnText.style.display = isLoading ? 'none' : 'inline';
        DOM.btnLoading.style.display = isLoading ? 'inline' : 'none';
    }
}

/**
 * Generate hosting status HTML
 * @param {Object} greenHosting - Green hosting data
 * @returns {string} HTML string
 */
function generateHostingStatusHTML(greenHosting) {
    const statusClass = greenHosting.isGreen ? 'green' : 'grey';
    const statusIcon = greenHosting.isGreen ? '🌱' : '⚡';
    const statusTitle = greenHosting.isGreen ? 'Groene Hosting!' : 'Grijze Hosting';
    
    return `
        <div class="hosting-status ${statusClass}">
            <h4>${statusIcon} ${statusTitle}</h4>
            <p>Provider: ${Utils.sanitizeHTML(greenHosting.provider)}</p>
            <p>${Utils.sanitizeHTML(greenHosting.impact)}</p>
        </div>
    `;
}

/**
 * Generate environmental comparison HTML
 * @param {Array} comparisons - Array of comparison objects
 * @returns {string} HTML string
 */
function generateComparisonHTML(comparisons) {
    const mainComparison = comparisons[0]; // Use car comparison as main
    
    return `
        <div class="comparison-section">
            <h4>🌍 Milieu Impact</h4>
            <p class="main-comparison">
                <strong>Vergelijkbaar met: ${mainComparison.icon} ${mainComparison.text}</strong>
            </p>
            <details class="comparison-details">
                <summary>Meer vergelijkingen</summary>
                <ul class="comparison-list">
                    ${comparisons.slice(1).map(comp => 
                        `<li>${comp.icon} ${comp.text}</li>`
                    ).join('')}
                </ul>
            </details>
        </div>
    `;
}

/**
 * Generate benchmark test HTML (simple version for testing)
 * @param {Object} benchmarks - Benchmark comparison data
 * @returns {string} HTML string
 */
function generateBenchmarkTestHTML(benchmarks) {
    return `
        <div style="background: #f0f8ff; padding: 15px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #4CAF50;">
            <h4>📊 TEST: Benchmark Vergelijkingen</h4>
            <p><strong>Website grootte:</strong> ${benchmarks.pageSize?.value || 'N/A'} KB vs gemiddeld ${benchmarks.pageSize?.average || 'N/A'} KB</p>
            <p><strong>Status:</strong> ${benchmarks.pageSize?.message || 'N/A'}</p>
            <p><strong>Performance:</strong> ${benchmarks.performance?.value || 'N/A'}/100 vs gemiddeld ${benchmarks.performance?.average || 'N/A'}/100</p>
            <p><strong>Status:</strong> ${benchmarks.performance?.message || 'N/A'}</p>
        </div>
    `;
}
function generateOptimizationTipsHTML(optimizations) {
    if (optimizations.canSave <= 5) return ''; // Don't show tips if savings are minimal
    
    return `
        <div class="tip-box">
            <span class="tip-icon">💡</span>
            <strong>Optimalisatie Tip:</strong> 
            Je kunt ${Utils.formatBytes(optimizations.canSave * 1024)} besparen door ongebruikte code te verwijderen!
            Dit zou de CO2 uitstoot met ongeveer ${Math.round((optimizations.canSave / 1024) * 4.6 * 100) / 100}g kunnen verminderen.
        </div>
    `;
}

/**
 * Display analysis results
 * @param {Object} data - Analysis results
 */
function displayResults(data) {
    const displayUrl = Utils.formatURLForDisplay(data.url);
    const co2Formatted = Utils.formatCO2(data.co2PerVisit);
    const gradeColor = Utils.getGradeColor(data.grade);
    const comparisons = Utils.getEnvironmentalComparison(data.co2PerVisit);
    
    DOM.resultsContainer.innerHTML = `
        <div class="result-card">
            <h3>🌱 Analyse Resultaten voor: ${Utils.sanitizeHTML(displayUrl)}</h3>
            
            ${generateHostingStatusHTML(data.greenHosting)}
            
            <div class="metrics-grid">
                <div class="metric-item">
                    <p>✅ <strong>CO2 per bezoek:</strong> ${co2Formatted}</p>
                </div>
                <div class="metric-item">
                    <p>📊 <strong>Performance:</strong> 
                        <span style="color: ${gradeColor}; font-weight: bold;">
                            ${data.performanceScore}/100 (${data.grade})
                        </span>
                    </p>
                </div>
                <div class="metric-item">
                    <p>📁 <strong>Website grootte:</strong> ${Utils.formatBytes(data.transferSize * 1024)}</p>
                </div>
                ${data.domElements ? `
                <div class="metric-item">
                    <p>🏠 <strong>DOM elementen:</strong> ${data.domElements}</p>
                </div>` : ''}
                ${data.httpRequests ? `
                <div class="metric-item">
                    <p>📡 <strong>HTTP requests:</strong> ${data.httpRequests}</p>
                </div>` : ''}
                <div class="metric-item">
                    <p>🖼️ <strong>Afbeelding optimalisatie:</strong> ${Math.round(data.optimizations.imageOptimizationScore * 100)}/100</p>
                </div>
            </div>
            
            ${generateComparisonHTML(comparisons)}
            ${generateOptimizationTipsHTML(data.optimizations)}
            
            <div class="result-actions">
                <button onclick="shareResults()" class="share-btn">📤 Deel Resultaten</button>
                <button onclick="analyzeAnother()" class="secondary-btn">🔄 Analyseer Andere Website</button>
            </div>
        </div>
    `;
}

/**
 * Show error message
 * @param {string} message - Error message
 */
function showError(message) {
    DOM.resultsContainer.innerHTML = `
        <div class="error-card">
            <h3>❌ Er ging iets mis</h3>
            <p>${Utils.sanitizeHTML(message)}</p>
            <p style="font-size: 0.9em; color: #666; margin-top: 10px;">
                Controleer of de URL correct is en probeer opnieuw.
            </p>
        </div>
    `;
}

/**
 * Validate URL input in real-time
 */
function validateURLInput() {
    const url = DOM.urlInput?.value?.trim();
    
    if (!url) {
        DOM.urlInput?.setCustomValidity('');
        return;
    }
    
    try {
        API.formatURL(url);
        DOM.urlInput?.setCustomValidity('');
    } catch (error) {
        DOM.urlInput?.setCustomValidity(error.message);
    }
}

/**
 * Share results functionality
 */
async function shareResults() {
    if (!AppState.currentResults) return;
    
    const shareText = `🌱 Website CO2 Analyse van ${AppState.currentResults.url}:
📊 CO2 uitstoot: ${Utils.formatCO2(AppState.currentResults.co2PerVisit)} per bezoek
⚡ Performance: ${AppState.currentResults.performanceScore}/100 (${AppState.currentResults.grade})
🌍 Vergelijkbaar met: ${Utils.getEnvironmentalComparison(AppState.currentResults.co2PerVisit)[0].text}

Geanalyseerd met: ${window.location.href}`;
    
    if (navigator.share) {
        try {
            await navigator.share({
                title: 'Website CO2 Analyse',
                text: shareText,
                url: window.location.href
            });
        } catch (error) {
            console.log('Share cancelled or failed:', error);
        }
    } else {
        // Fallback: copy to clipboard
        const success = await Utils.copyToClipboard(shareText);
        if (success) {
            // Show temporary feedback
            const shareBtn = document.querySelector('.share-btn');
            const originalText = shareBtn?.innerHTML;
            if (shareBtn) {
                shareBtn.innerHTML = '✅ Gekopieerd!';
                setTimeout(() => {
                    shareBtn.innerHTML = originalText;
                }, 2000);
            }
        }
    }
}

/**
 * Reset for analyzing another website
 */
function analyzeAnother() {
    DOM.urlInput?.focus();
    DOM.urlInput?.select();
    DOM.resultsContainer.innerHTML = '';
}

// Initialize app when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}